import {prepareSqlite} from '@teeny.dev/durable'
import {DurableObject} from 'cloudflare:workers'

/**
 * User creates account - authjs???
 */
export class D1Store extends DurableObject {
	sql

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env)

		this.sql = prepareSqlite(this.ctx, {
			migrations: {
				['000_init']: [
					// "CREATE TABLE "
				],
			},
			statements: {},
		})
	}
}
