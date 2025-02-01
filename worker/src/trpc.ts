import {initTRPC, type inferRouterInputs, type inferRouterOutputs} from '@trpc/server'
import SuperJSON from 'superjson'
import {ZodError} from 'zod'
import {fromZodError} from 'zod-validation-error'
import {initSuperJSON} from '~/lib-client'

initSuperJSON()

export const t = initTRPC.context<{a: string}>().create({
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
		getConfig: _UNAUTHENTICATED_procedure.query(async () => ({type: 'testing'})),
	}),
})

export type AppRouter = typeof appRouter
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
