import {betterAuth} from 'better-auth'
import {drizzleAdapter} from 'better-auth/adapters/drizzle'
import {magicLink} from 'better-auth/plugins/magic-link'
import type {DrizzleD1Database} from 'drizzle-orm/d1'
import type {CfFn, InternalEnv} from '~server/lib-server'
import {NOT_FOUND} from '~server/library-tnr'
import {type User as BetterAuthUser} from 'better-auth'
import * as schema from '~server/schema'

export type User = BetterAuthUser

const FRONTEND_REPLACEMENTS = ['/auth/verify-request', '/auth/signin', '/auth/error']
export const handler: CfFn = (req, env, ctx) => {
	const url = new URL(req.url)
	if (
		!['GET', 'POST'].includes(req.method) ||
		FRONTEND_REPLACEMENTS.includes(url.pathname)
	) {
		return NOT_FOUND
	}
	return env.AUTH.handler(req)
}

export function buildAuth(env: Env, {DB}: {DB: DrizzleD1Database}) {
	return betterAuth({
		// appName: '',
		basePath: '/auth',
		database: drizzleAdapter(DB, {provider: 'sqlite', schema}),
		secret: env.AUTH_SECRET,
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
				prompt: 'select_account',
			},
		},
		// plugins: [
		// 	magicLink({
		// 		sendMagicLink: async ({email, token, url}, request) => {
		// 			// send email to user
		// 		},
		// 	}),
		// ],
	})
}
