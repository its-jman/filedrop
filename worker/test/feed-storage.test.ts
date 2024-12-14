import {env, runInDurableObject, SELF} from 'cloudflare:test'
import {expect, it} from 'vitest'
import {FeedStorage} from '../src/feed-storage'

it('test say hello', async () => {
	const response = await SELF.fetch('https://_')
	expect(await response.text()).toBe('404')

	const id = env.FEED_STORAGE.idFromName('/path')
	const stub = env.FEED_STORAGE.get(id)

	await runInDurableObject(stub, async (instance) => {
		expect(instance).toBeInstanceOf(FeedStorage)

		await instance.setName('Steve')
		expect(await instance.sayHello()).toEqual('Hello, Steve!')
	})
})
