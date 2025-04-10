export const NOT_FOUND = Symbol('NOT_FOUND')

export type TnrFunction<Env = unknown> = (
	req: Request,
	env: Env,
	ctx: ExecutionContext
) => Response | Promise<Response> | typeof NOT_FOUND
