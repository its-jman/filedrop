import {env, runInDurableObject, SELF} from 'cloudflare:test'
import {describe, expect, it} from 'vitest'
import {FeedStorage} from './feed-storage'
import dayjs from 'dayjs'

describe('FeedStorage', () => {
	/* it('example', async () => {
		const response = await SELF.fetch('https://_')
		expect(await response.text()).toBe('404')

		const id = env.FEED_STORAGE.idFromName('/path')
		const stub = env.FEED_STORAGE.get(id)

		await runInDurableObject(stub, async (instance) => {
			expect(instance).toBeInstanceOf(FeedStorage)

			await instance.setName('Steve')
			expect(await instance.sayHello()).toEqual('Hello, Steve!')
		})
	}) */

	it('inserts item', async () => {
		// * 		.put({ [ `item##${ date.now().toISOString() }##${ counter++.toFixed(4) }` ]: item })
		const stub = env.FEED_STORAGE.get(env.FEED_STORAGE.idFromName('main'))
		const title = 'Insert item test'
		const key = await stub.createItem({title})

		const split = key.split('##')
		expect(split.length).toBe(2)
		expect(split[0]).toHaveLength(24)
		expect(split[1]).toHaveLength(4)

		await runInDurableObject(stub, async (instance) => {
			expect(instance).toBeInstanceOf(FeedStorage)

			const item = await instance.storage.item.get(key)
			expect(item?.title).toEqual(title)
		})
	})

	it('lists items', async () => {
		const stub = env.FEED_STORAGE.get(env.FEED_STORAGE.idFromName('main'))
		const key1 = await stub.createItem({
			title: 'List items 3 days ago',
			pubDate: dayjs().subtract(3, 'd').toDate(),
		})
		const key2 = await stub.createItem({
			title: 'List items 5 days ago',
			pubDate: dayjs().subtract(5, 'd').toDate(),
		})
		const key3 = await stub.createItem({
			title: 'List items 7 days ago',
			pubDate: dayjs().subtract(7, 'd').toDate(),
		})

		// Items should be ordered oldest to newest
		const list = await stub.listItems({startAfter: dayjs().subtract(6, 'd').toDate()})
		expect(list).toHaveLength(2)
		expect(list[0]?.title).toEqual('List items 5 days ago')
		expect(list[1]?.title).toEqual('List items 3 days ago')

		const list2 = await stub.listItems({startAfter: dayjs().subtract(1, 'd').toDate()})
		expect(list2).toHaveLength(0)

		const list3 = await stub.listItems()
		expect(list3).toHaveLength(3)
		expect(list3[0]?.title).toEqual('List items 7 days ago')
	})
})
