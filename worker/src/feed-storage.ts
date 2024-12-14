import {DurableObject} from 'cloudflare:workers'
import {createTypedStorage} from '@teeny.dev/durable'
import {z} from 'zod'

/**
 * Things to do with feed:
 * - Cron -> insert new items
 * 		.put({ [ `item##${ date.now().toISOString() }##${ counter++.toFixed(4) }` ]: item })
 * 		- Max of 128 items in obj
 * - User cron -> read all since last item
 * 		.list({prefix: "item##", startAfter: user.lastSeenId})\
 * 		- format of lastSeenId: item##datetime##counter
 * - Admin page -> List all feed items
 * 		.list({prefix: "item##", reverse: boolean})
 *
 * Confusing:
 * - Cron -> update item with id???
 *
 */
export class FeedStorage extends DurableObject {
	storage

	constructor(state: DurableObjectState, env: Env) {
		super(state, env)
		this.storage = createTypedStorage(state.storage, {
			item: z.string(),
		})
	}

	alarm(): void | Promise<void> {}

	async setName(name: string): Promise<void> {
		await this.storage.item.put('name', name)
	}

	async sayHello(name?: string): Promise<string> {
		const finalName = name || (await this.storage.item.get('name')) || 'Unidentified User'
		return `Hello, ${finalName}!`
	}
}
