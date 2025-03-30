import {getAuthConfig, type CfEnv, type CfData} from '~server/lib-server'
import {PagesAuth} from '~/library-pages-auth'
import type {TnrFunction} from '~server/library-tnr'

const FRONTEND_REPLACEMENTS = ['/auth/verify-request', '/auth/signin', '/auth/error']

export const handler: TnrFunction<CfEnv, 'auth', CfData> = async (ctx) => {
	const req = ctx.request as Request
	const url = new URL(req.url)
	if (req.method === 'GET' && FRONTEND_REPLACEMENTS.includes(url.pathname)) {
		return await ctx.env.ASSETS.fetch(req)
	}

	const {onRequest: handler} = PagesAuth(getAuthConfig)
	return await handler(ctx)
}
