import type {CfFn} from '~server/lib-server'

import {initTRPC, type inferRouterInputs, type inferRouterOutputs} from '@trpc/server'
import SuperJSON from 'superjson'
import {ZodError} from 'zod'
import {fromZodError} from 'zod-validation-error'
import {fetchRequestHandler} from '@trpc/server/adapters/fetch'

const t = initTRPC.context<{a: string}>().create({
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

export const handler: CfFn = (req, env, ctx) =>
	fetchRequestHandler({
		endpoint: '/api/trpc',
		req,
		router: appRouter,
		createContext: () => ({a: ''}),
		onError({ctx, error}) {
			const errorLogger = console.error
			errorLogger(error)
		},
	})
