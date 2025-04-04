import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

import {initSuperJSON} from '~/lib-client'
import {handler, NOT_FOUND} from './routeTree'
initSuperJSON()

export {FeedStore} from './stores/feed-store'

export default {
	async fetch(req, env, ctx): Promise<Response> {
		const resp = await handler(req, env, ctx)
		if (resp !== NOT_FOUND) return resp

		if (env.DEV_PORT) {
			const url = new URL(req.url)
			url.port = env.DEV_PORT
			return await fetch(new Request(url, req))
		} else {
			return env.ASSETS.fetch(req)
		}
	},
} satisfies ExportedHandler<Env>
