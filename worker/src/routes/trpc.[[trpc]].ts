import type {CfFn, InternalEnv} from '~server/lib-server'
import {initTRPC, type inferRouterInputs, type inferRouterOutputs} from '@trpc/server'
import SuperJSON from 'superjson'
import {ZodError} from 'zod'
import {fromZodError} from 'zod-validation-error'
import {fetchRequestHandler} from '@trpc/server/adapters/fetch'

const createContext = (req: Request, env: InternalEnv, ctx: ExecutionContext) => {
	return () => ({req, env})
}

const t = initTRPC.context<ReturnType<ReturnType<typeof createContext>>>().create({
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

export const appRouter = t.router({
	PUBLIC: t.router({
		getCurrentUser: _UNAUTHENTICATED_procedure.query(async ({ctx}) => {
			return await ctx.env.AUTH.api.getSession({headers: ctx.req.headers})
		}),
	}),
})

export type AppRouter = typeof appRouter
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

export const handler: CfFn = (req, env, ctx) => {
	return fetchRequestHandler({
		endpoint: '/trpc',
		req,
		router: appRouter,
		createContext: createContext(req, env, ctx),
		onError({ctx, error}) {
			const errorLogger = console.error
			errorLogger(error)
		},
	})
}
