import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

import {initSuperJSON} from '~/lib-client'
initSuperJSON()

import {fetchWebRequest} from '~server/lib-server'
import {handler, NOT_FOUND} from './routeTree'
export {FeedStore} from './stores/feed-store'

export default {
	async fetch(req, env, ctx): Promise<Response> {
		const resp = await handler(req, env, ctx)
		if (resp !== NOT_FOUND) return resp

		return fetchWebRequest(req, env, ctx)
	},
} satisfies ExportedHandler<Env>
