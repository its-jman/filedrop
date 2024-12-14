export {FeedStorage} from './feed-storage'

export default {
	async fetch(request, env, ctx): Promise<Response> {
		return new Response('404')
	},
} satisfies ExportedHandler<Env>
