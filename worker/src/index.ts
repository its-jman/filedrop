import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import {appRouter} from './trpc'

export {FeedStore} from './feed-store'

export default {
	async fetch(req, env, ctx): Promise<Response> {
		const url = new URL(req.url)

		if (url.pathname === '/trpc') {
			return fetchRequestHandler({
				endpoint: '/api/trpc',
				req,
				router: appRouter,
				createContext: () => ({a: ''}),
				onError({ctx, error}) {
					const errorLogger = console.error
					errorLogger(error)
				},
			})
		}
		return new Response('404')
	},
} satisfies ExportedHandler<Env>
