import {z} from 'zod'
import type {TnrFunction} from './library-tnr'
import {buildAuth, type User} from './routes/auth.[[auth]]'
import {drizzle} from 'drizzle-orm/d1'

const EnvSchema = z.object({
	AUTH_SECRET: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
})
export type CfEnv = z.infer<typeof EnvSchema>

export type CfData = {
	user?: User
}

export const buildInternalEnv = (req: Request, _env: Env, ctx: ExecutionContext) => {
	const DB = drizzle(_env._DB)
	return {
		..._env,
		DB,
		AUTH: buildAuth(_env, {DB}),
	}
}
export type InternalEnv = ReturnType<typeof buildInternalEnv>

export type CfEventCtx<P extends string = never> = EventContext<CfEnv, P, CfData>
export type CfFn = TnrFunction<InternalEnv>

export async function fetchWebRequest(
	req: Request,
	env: InternalEnv,
	ctx: ExecutionContext
) {
	if (env.DEV_PORT) {
		const url = new URL(req.url)
		url.port = env.DEV_PORT
		return await fetch(new Request(url, req))
	} else {
		return env.ASSETS.fetch(req)
	}
}
