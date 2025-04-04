export type TnrFunction<Env = unknown> = (
	req: Request,
	env: Env,
	ctx: ExecutionContext
) => Response | Promise<Response>
