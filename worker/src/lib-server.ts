import {z} from 'zod'
import type {TnrFunction} from './library-tnr'
import type {User} from './routes/auth.[[auth]]'

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

export async function fetchWebRequest(req: Request, env: Env, ctx: ExecutionContext) {
	if (env.DEV_PORT) {
		const url = new URL(req.url)
		url.port = env.DEV_PORT
		return await fetch(new Request(url, req))
	} else {
		return env.ASSETS.fetch(req)
	}
}

export class DigesterError extends Error {
	detail: string
	constructor(message: string, options: ErrorOptions & {detail: string}) {
		super(message, options)
		this.detail = options.detail
	}
}
