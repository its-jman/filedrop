import {Auth, type AuthConfig} from '@auth/core'

//////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// SERVER /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface PagesAuthConfig extends AuthConfig {}

type BuildConfig<TEnv, TCtxData> =
	| PagesAuthConfig
	| ((req: Request, env: Env, ctx: ExecutionContext) => PagesAuthConfig)

export function PagesAuth<TEnv, TCtxData>(buildConfig: BuildConfig<TEnv, TCtxData>) {
	return {
		async onRequest(req: Request, env: Env, ctx: ExecutionContext) {
			const config =
				typeof buildConfig === 'function' ? buildConfig(req, env, ctx) : buildConfig
			return await Auth(req, config)
		},
	}
}
