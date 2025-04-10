import type {CfFn, InternalEnv} from './lib-server'
import {NOT_FOUND} from './library-tnr'
import {handler as AuthHandler} from './routes/auth.[[auth]]'
import {handler as TrpcHandler} from './routes/trpc.[[trpc]]'

export const handler: CfFn = (req, env, ctx) => {
	const url = new URL(req.url)

	if (url.pathname.startsWith('/auth/')) {
		const resp = AuthHandler(req, env, ctx)
		if (resp !== NOT_FOUND) return resp
	} else if (url.pathname.startsWith('/trpc/')) {
		return TrpcHandler(req, env, ctx)
	}

	return NOT_FOUND
}
