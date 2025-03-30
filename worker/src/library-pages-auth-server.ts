import {Auth, type AuthConfig} from '@auth/core'

//////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// SERVER /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface PagesAuthConfig extends AuthConfig {}

type BuildConfig<TEnv, TCtxData> =
	| PagesAuthConfig
	| ((ctx: EventContext<TEnv, 'auth', TCtxData>) => PagesAuthConfig)

export function PagesAuth<TEnv, TCtxData>(buildConfig: BuildConfig<TEnv, TCtxData>) {
	return {
		async onRequest(ctx: EventContext<TEnv, 'auth', TCtxData>) {
			const config = typeof buildConfig === 'function' ? buildConfig(ctx) : buildConfig
			return await Auth(ctx.request, config)
		},
	}
}
