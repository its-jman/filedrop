import type {CfFn} from './lib-server'

import {handler as AuthHandler} from './routes/auth.$$auth'
import {handler as TrpcHandler} from './routes/trpc.$$trpc'

export const handler: CfFn = (ctx) => {
	const url = new URL(ctx.request.url)

	if (url.pathname.startsWith('/auth/')) {
		return AuthHandler(ctx)
	} else if (url.pathname.startsWith('/trpc/')) {
		return TrpcHandler(ctx)
	}

	return new Response('Not Found', {status: 404})
}
