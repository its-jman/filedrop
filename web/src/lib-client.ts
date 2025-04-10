import type {QueryClient} from '@tanstack/react-query'
import {createTRPCReact} from '@trpc/react-query'
import type {CreateReactUtils} from '@trpc/react-query/shared'
import type {Dayjs} from 'dayjs'
import dayjs from 'dayjs'
import SuperJSON from 'superjson'
import type {AppRouter} from '~server/routes/trpc.[[trpc]]'
import {createAuthClient} from 'better-auth/react'
import {} from 'better-auth/plugins'
import type {User} from 'better-auth'

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

export const trpc = createTRPCReact<AppRouter>()

export type RouterContext = {
	queryClient: QueryClient
	utils: CreateReactUtils<AppRouter, unknown>
	user: User | undefined
}

export const authClient = createAuthClient({basePath: '/auth'})
