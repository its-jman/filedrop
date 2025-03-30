import {Auth, type AuthConfig} from '@auth/core'
import type {PagesAuthConfig} from '~/library-pages-auth'

export function getAuthConfig(ctx: CfEventCtx): PagesAuthConfig {
	return {
		basePath: '/auth',
		trustHost: true,
		secret: ctx.env.AUTH_SECRET,
		adapter: DrizzleAdapter(ctx.data.DB),
		session: {strategy: 'jwt'},
		callbacks: {
			async jwt(opts) {
				const {sub: userId} = opts.token
				if (userId) {
					const extraDatas = await ctx.data.DB.select({role: schema.users.role})
						.from(schema.users)
						.where(eq(schema.users.id, userId))
						.limit(1)
					const extraData = extraDatas[0]

					return {...opts.token, ...extraData}
				}

				return opts.token
			},
			session(opts) {
				const {session, token} = opts
				if (session?.user && token.sub) {
					session.user.id = token.sub
					// @ts-expect-error -- idk how to properly type
					session.user.role = token.role
				}
				return session
			},
		},
		providers: [
			Google({
				clientId: ctx.env.GOOGLE_CLIENT_ID,
				clientSecret: ctx.env.GOOGLE_CLIENT_SECRET,
				authorization: {params: {prompt: 'select_account'}},
			}),
			Resend({apiKey: ctx.env.RESEND_API_KEY, from: EMAIL_FROM_FULL}),
		],
	}
}

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
