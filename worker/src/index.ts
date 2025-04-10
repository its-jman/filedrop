import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
dayjs.extend(isBetween)

import {initSuperJSON} from '~/lib-client'
initSuperJSON()

import {buildInternalEnv, fetchWebRequest} from '~server/lib-server'
import {handler} from './routeTree'
import {NOT_FOUND} from './library-tnr'

export default {
	async fetch(req, _env, ctx): Promise<Response> {
		const env = buildInternalEnv(req, _env, ctx)

		const resp = await handler(req, env, ctx)
		if (resp !== NOT_FOUND) return resp

		return fetchWebRequest(req, env, ctx)
	},
} satisfies ExportedHandler<Env>
