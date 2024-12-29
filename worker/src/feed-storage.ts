import {DurableObject} from 'cloudflare:workers'
import {createTypedStorage} from '@teeny.dev/durable'
import {z} from 'zod'
import {Feed as HtmlParserFeed, parseFeed} from 'htmlparser2'
import dayjs from 'dayjs'

/**
 * FeedStorage, each instance is for a feed.
 * On creation, you need to associate the item with a feed to scrape.
 * 				meta##feed_url: "https://blog.cloudflare.com/rss"
 * 		should you track users who have subscribed to this feed, who to notify when this changes?
 * 			I think the user will have it's own cron, to check all related feeds for new items since date.
 *
 *
 *
 *
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
export const FeedItemSchema = z.object({
	// key
	__key: z.string(),
	id: z.string().nullable(),
	pub_date: z.string().nullable(),
	title: z.string().nullable(),
	link: z.string().nullable(),
	description: z.string().nullable(),
})

export type FeedItem = z.infer<typeof FeedItemSchema>

const MetaSchema = z.object({feed_url: z.string()})
type Meta = z.infer<typeof MetaSchema>

export class FeedStorage extends DurableObject {
	storage
	counter = 0
	__meta: Promise<Meta | undefined>

	constructor(state: DurableObjectState, env: Env) {
		super(state, env)
		const storage = createTypedStorage(state.storage, {
			meta: MetaSchema,
			item: FeedItemSchema,
		})
		this.storage = storage
		this.__meta = storage.meta.get('')
	}

	async createItem(item: Omit<HtmlParserFeed['items'][0], 'media'>) {
		// const _date = new Date().toISOString()
		const _date = item.pubDate ? dayjs(item.pubDate).toISOString() : dayjs().toISOString()
		const _counter = (this.counter++).toString().padStart(4, '0')
		const key = `${_date}##${_counter}`

		if (!(item.title || item.description || item.link)) {
			throw new Error('Invalid item, does not have content.')
		}

		await this.storage.item.put(key, {
			__key: key,
			id: item.id || null,
			title: item.title || null,
			description: item.description || null,
			link: item.link || null,
			pub_date: _date || null,
		})

		return key
	}

	async listItems(cfg?: {startAfter?: Date}): Promise<Array<FeedItem>> {
		const items = await this.storage.item.list({
			startAfter:
				cfg?.startAfter && `item##${dayjs(cfg?.startAfter).toISOString()}##0000`,
		})

		return Array.from(items.values())
	}

	async #fetchFeed() {
		const meta = await this.getMeta()

		let data: string
		try {
			data = await (await fetch(meta.feed_url)).text()
		} catch (e) {
			throw new FeedError('Failed to fetch feed', {
				cause: e,
				detail: e instanceof Error ? e.message : String(e),
			})
		}

		let feed: HtmlParserFeed
		try {
			const possibleFeed = parseFeed(data)
			if (!possibleFeed) throw new Error(`${data.substring(0, 100)}...`)
			feed = possibleFeed
		} catch (e) {
			throw new FeedError('Error parsing feed', {
				cause: e,
				detail: e instanceof Error ? e.message : String(e),
			})
		}

		return feed
	}

	// #region initalize
	async getMeta() {
		const meta = await this.__meta
		if (!meta) {
			throw new Error('Can not get meta, not initalized')
		}
		return meta
	}

	async initalize(cfg: Meta) {
		if (await this.__meta) {
			throw new Error('Invalid initalization call, already initalized')
		}
		await this.storage.meta.put('', cfg)
		this.__meta = new Promise((res) => res(cfg))

		// TODO: Set alarm
	}

	alarm(): void | Promise<void> {}
	// #endregion
}

export class FeedError extends Error {
	detail: string
	constructor(message: string, options: ErrorOptions & {detail: string}) {
		super(message, options)
		this.detail = options.detail
	}
}
