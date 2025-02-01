import type {Dayjs} from 'dayjs'
import dayjs from 'dayjs'
import SuperJSON from 'superjson'

export function initSuperJSON() {
	SuperJSON.registerCustom(
		{
			isApplicable: (v): v is Dayjs => dayjs.isDayjs(v),
			serialize: (v) => v.toISOString(),
			deserialize: (v) => dayjs(v),
		},
		'dayjs'
	)
}
