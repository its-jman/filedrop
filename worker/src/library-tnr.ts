export type TnrFunction<
	Env = unknown,
	Params extends string = any,
	Data extends Record<string, unknown> = Record<string, unknown>,
> = (ctx: EventContext<Env, Params, Data>) => Response | Promise<Response>
