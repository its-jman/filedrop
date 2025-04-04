import {DurableObject} from 'cloudflare:workers'
import {createAlarmManager, prepareSqlite, type AlarmManager} from '@teeny.dev/durable'
import {z} from 'zod'
import {Feed as HtmlParserFeed, parseFeed} from 'htmlparser2'
import dayjs, {Dayjs} from 'dayjs'
import {DigesterError} from '~server/lib-server'

// #region types
type HtmlParserItemRaw = Omit<HtmlParserFeed['items'][0], 'media'>

const FeedItemSchema = z.object({
	id: z.string(),
	link: z.string(),
	title: z.string(),
	description: z.string().nullable().optional(),
	pub_date: z.coerce.date().nullable().optional(),
})
export type FeedItem = z.infer<typeof FeedItemSchema>

const MetaSchema = z.object({alarm_id: z.string(), feed_url: z.string()})
type Meta = z.infer<typeof MetaSchema>
const AlarmSchema = z.undefined()

// #endregion types

export function getItemId(item: HtmlParserItemRaw): string | null {
	return item.id ?? item.link ?? null
}

export async function fetchFeed(feed_url: string) {
	let data: string
	try {
		data = await (await fetch(feed_url)).text()
	} catch (e) {
		throw new DigesterError('Failed to fetch feed', {
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
		throw new DigesterError('Failed to parse feed', {
			cause: e,
			detail: e instanceof Error ? e.message : String(e),
		})
	}

	return feed
}

export function mapRawToItem(item: HtmlParserItemRaw): FeedItem {
	const MAX_LEN = 2500
	const id = getItemId(item)
	const {title, link} = item
	if (!id || id.length >= MAX_LEN || !title || !link || link.length >= MAX_LEN) {
		throw new Error('Invalid item, does not have valid content.')
	}

	return {
		id,
		link: link,
		title: title.substring(0, MAX_LEN),
		description: item.description?.substring(0, MAX_LEN) || null,
		pub_date: item.pubDate ? dayjs(item.pubDate).toDate() : null,
	}
}

export function itemNeedsUpdate(item1: FeedItem, item2: FeedItem): boolean {
	if (item1.id !== item2.id) {
		throw new Error('Invalid itemNeedsUpdate call. These are not the same item.')
	}

	// If the link changed, and the item doesn't have an id, it will be treated as a new item :shrug:
	return (
		item1.link !== item2.link ||
		item1.title !== item2.title ||
		item1.pub_date?.toISOString() !== item2.pub_date?.toISOString() ||
		item1.description !== item2.description
	)
}

export class FeedStore extends DurableObject {
	sql
	__meta: Meta | null = null
	alarm

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env)
		this.sql = prepareSqlite(ctx, {
			migrations: {
				['000_init']: [
					'CREATE TABLE meta_store (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL)',
					'CREATE TABLE feed_store (id TEXT PRIMARY KEY, link TEXT NOT NULL, title TEXT NOT NULL, description TEXT, pub_date TEXT NOT NULL)',
					'CREATE INDEX IF NOT EXISTS feed_store_date ON feed_store (pub_date)',
				],
			},
			statements: {},
		})
		this.alarm = createAlarmManager({
			storage: ctx.storage,
			payloadParser: AlarmSchema,
			handler(ctx) {
				console.log('handling')
			},
		})

		try {
			this.__meta = this.getMeta()
		} catch {}
	}

	// #region initalize
	async initalize(_cfg: Omit<Meta, 'alarm_id'>) {
		if (this.__meta) {
			throw new Error('Already initalized, can not reinitalize')
		}

		const alarm_id = await this.alarm.scheduleEvery(24 * 60 * 60 * 1000, undefined)
		const cfg = {..._cfg, alarm_id}
		this.sql.exec(
			'INSERT INTO meta_store (id, data) VALUES (?, ?)',
			1,
			JSON.stringify(cfg)
		)
		this.__meta = cfg

		await this.refreshFeed()
		return this.listItems()
	}

	getMeta() {
		try {
			if (this.__meta) {
				return this.__meta
			} else {
				const meta = this.sql
					.exec<{data: string}>('SELECT data FROM meta_store LIMIT 1')
					.one()
				this.__meta = MetaSchema.parse(JSON.parse(meta.data))
				return this.__meta
			}
		} catch {
			throw new Error('Can not get meta, not initalized')
		}
	}
	// #endregion

	getItem({id}: {id: string}): FeedItem | null {
		try {
			const _stored = this.sql.exec('SELECT * FROM feed_store WHERE id = ?', id)
			const val = _stored.next()
			return val.value ? FeedItemSchema.parse(val.value) : null
		} catch {
			return null
		}
	}

	// #region refreshFeed
	handleInsertUpdateItem(item: FeedItem) {
		const storedItem = this.getItem({id: item.id})
		try {
			if (!storedItem) {
				this.sql.exec(
					'INSERT INTO feed_store (id, link, title, description, pub_date) VALUES (?, ?, ?, ?, ?)',
					item.id,
					item.link,
					item.title,
					item.description ?? undefined,
					item.pub_date?.toISOString() ?? dayjs().toISOString()
				)
			} else if (itemNeedsUpdate(item, storedItem)) {
				this.sql.exec(
					`UPDATE feed_store SET link = ?, title = ?, description = ?, pub_date = ? WHERE id = ?`,
					item.link,
					item.title,
					item.description ?? undefined,
					item.pub_date?.toISOString() ?? storedItem.pub_date,
					item.id
				)
			}
		} catch (err) {
			console.log('err')
			console.log(err)
			throw err
		}
	}

	async refreshFeed() {
		const meta = this.getMeta()
		const feed = await fetchFeed(meta.feed_url)

		for (const rawItem of feed.items) {
			const item = mapRawToItem(rawItem)
			this.handleInsertUpdateItem(item)
		}
	}

	// #endregion refreshFeed

	listItems(cfg?: {startAfter?: Date; limit?: number}): Array<FeedItem> {
		let {startAfter, limit = 100} = cfg ?? {}
		if (limit > 100 || limit < 1) {
			throw new Error('Limit set to an invalid value, > 100 or < 1')
		}

		const rawItems = this.sql
			.exec(
				'SELECT * FROM feed_store WHERE pub_date > ? ORDER BY pub_date LIMIT ?',
				startAfter?.toISOString() ?? '',
				limit
			)
			.toArray()

		return z.array(FeedItemSchema).parse(rawItems)
	}
}
