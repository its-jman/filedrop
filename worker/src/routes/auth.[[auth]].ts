import {Auth, type AuthConfig} from '@auth/core'
import Google from '@auth/core/providers/google'
import {z} from 'zod'
import {fetchWebRequest, type CfFn} from '~server/lib-server'
import {PagesAuth, type PagesAuthConfig} from '~server/library-pages-auth-server'

export function getAuthConfig(
	req: Request,
	env: Env,
	ctx: ExecutionContext
): PagesAuthConfig {
	return {
		basePath: '/auth',
		trustHost: true,
		secret: env.AUTH_SECRET,
		// adapter: DrizzleAdapter(data.DB),
		session: {strategy: 'jwt'},
		providers: [
			Google({
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
				authorization: {params: {prompt: 'select_account'}},
			}),
		],
	}
}

const UserSchema = z.object({name: z.string()})
export type User = z.infer<typeof UserSchema>
const SessionSchema = z.object({user: UserSchema, expires: z.string()})
export type SessionData = z.infer<typeof SessionSchema>

const SessionRespSchema = z
	.union([SessionSchema, z.object({message: z.string().optional()})])
	.optional()
	.nullable()

export async function getSession(
	req: Request,
	options: Omit<AuthConfig, 'raw'>
): Promise<SessionData | null> {
	try {
		const url = new URL('/auth/session', req.url)
		const response = await Auth(new Request(url, {headers: req.headers}), options)
		const data = await response.json()

		const session = SessionRespSchema.parse(data)
		if (!session) return null

		if ('user' in session) {
			return session
		} else {
			console.error(session)
			throw new Error(session.message ?? 'Something went wrong getting the session')
		}
	} catch (err) {
		console.error(err)
		return null
	}
}

const FRONTEND_REPLACEMENTS = ['/auth/verify-request', '/auth/signin', '/auth/error']

export const handler: CfFn = async (req, env, ctx) => {
	const url = new URL(req.url)
	if (req.method === 'GET' && FRONTEND_REPLACEMENTS.includes(url.pathname)) {
		return await fetchWebRequest(req, env, ctx)
	}

	const {onRequest: handler} = PagesAuth(getAuthConfig)
	return await handler(req, env, ctx)
}
