import type {CfFn, InternalEnv} from '~server/lib-server'
import {
	initTRPC,
	TRPCError,
	type inferRouterInputs,
	type inferRouterOutputs,
} from '@trpc/server'
import SuperJSON from 'superjson'
import {z, ZodError} from 'zod'
import {fromZodError} from 'zod-validation-error'
import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import * as schema from '~server/schema'
import {nanoid} from 'nanoid'
import {genId} from '~/lib-client'

const createContext = async (req: Request, env: InternalEnv, ctx: ExecutionContext) => {
	const sessionData = await env.AUTH.api.getSession({headers: req.headers})
	return () => ({req, env, data: {user: sessionData?.user}})
}

export const handler: CfFn = async (req, env, ctx) => {
	return fetchRequestHandler({
		endpoint: '/trpc',
		req,
		router: appRouter,
		createContext: await createContext(req, env, ctx),
		onError({ctx, error}) {
			const errorLogger = console.error
			errorLogger(error)
		},
	})
}

const t = initTRPC
	.context<ReturnType<Awaited<ReturnType<typeof createContext>>>>()
	.create({
		transformer: SuperJSON,
		errorFormatter: ({shape, error}) => {
			return {
				...shape,
				data: {
					...shape.data,
					zodError: error instanceof ZodError ? fromZodError(error) : null,
				},
			}
		},
	})

const _UNAUTHENTICATED_procedure = t.procedure
const procedure = t.procedure.use(
	t.middleware(({ctx, next}) => {
		if (!ctx.data.user) {
			throw new TRPCError({code: 'UNAUTHORIZED'})
		}
		// TODO: This isn't necessary... But how otherwise to type-safe assume the assertion from above?
		return next({ctx: {...ctx, data: {...ctx.data, user: ctx.data.user}}})
	})
)

export const appRouter = t.router({
	PUBLIC: t.router({
		getCurrentUser: _UNAUTHENTICATED_procedure.query(async ({ctx}) => {
			return await ctx.env.AUTH.api.getSession({headers: ctx.req.headers})
		}),
	}),
	createDrop: procedure
		.input(z.object({name: z.string()}))
		.mutation(async ({input, ctx}) => {
			const {DB} = ctx.env
			const drop_id = genId()
			await DB.insert(schema.drops).values({
				drop_id,
				owner_user_id: ctx.data.user.id,
				name: input.name,
				createdAt: new Date(),
			})

			return drop_id
		}),
})

export type AppRouter = typeof appRouter
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
