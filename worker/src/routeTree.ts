import {handler as AuthHandler} from './routes/auth.[[auth]]'
import {handler as TrpcHandler} from './routes/trpc.[[trpc]]'

export const NOT_FOUND = Symbol('NOT_FOUND')

export const handler = (
	req: Request,
	env: Env,
	ctx: ExecutionContext
): Promise<Response> | Response | typeof NOT_FOUND => {
	const url = new URL(req.url)

	if (url.pathname.startsWith('/auth/')) {
		return AuthHandler(req, env, ctx)
	} else if (url.pathname.startsWith('/trpc/')) {
		return TrpcHandler(req, env, ctx)
	}

	return NOT_FOUND
}
