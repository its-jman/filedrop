import {Auth, type AuthConfig} from '@auth/core'
import Google from '@auth/core/providers/google'
import {z} from 'zod'
import type {PagesAuthConfig} from '~server/library-pages-auth-server'
import type {TnrFunction} from './library-tnr'

const EnvSchema = z.object({
	AUTH_SECRET: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
})
export type CfEnv = z.infer<typeof EnvSchema>

export type CfData = {
	user?: User
}

export type CfEventCtx<P extends string = never> = EventContext<CfEnv, P, CfData>
export type CfFn = TnrFunction<Env>

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
type User = z.infer<typeof UserSchema>
const SessionSchema = z.object({user: UserSchema, expires: z.string()})
type SessionData = z.infer<typeof SessionSchema>

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

export class DigesterError extends Error {
	detail: string
	constructor(message: string, options: ErrorOptions & {detail: string}) {
		super(message, options)
		this.detail = options.detail
	}
}
