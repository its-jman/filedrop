import {getAuthConfig, type CfFn} from '~server/lib-server'
import {PagesAuth} from '~server/library-pages-auth-server'

const FRONTEND_REPLACEMENTS = ['/auth/verify-request', '/auth/signin', '/auth/error']

export const handler: CfFn = async (ctx) => {
	const req = ctx.request as Request
	const url = new URL(req.url)
	if (req.method === 'GET' && FRONTEND_REPLACEMENTS.includes(url.pathname)) {
		return await ctx.env.ASSETS.fetch(req)
	}

	const {onRequest: handler} = PagesAuth(getAuthConfig)
	return await handler(ctx)
}
