import type {QueryClient} from '@tanstack/react-query'
import {createTRPCReact} from '@trpc/react-query'
import type {CreateReactUtils} from '@trpc/react-query/shared'
import type {Dayjs} from 'dayjs'
import dayjs from 'dayjs'
import SuperJSON from 'superjson'
import type {AppRouter} from '~server/routes/trpc.[[trpc]]'
import {createAuthClient} from 'better-auth/react'
import {} from 'better-auth/plugins'
import type {User} from '~server/routes/auth.[[auth]]'
import {nanoid} from 'nanoid'
import {inferAdditionalFields} from 'better-auth/client/plugins'
import type {AuthType} from '~server/routes/auth.[[auth]]'

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

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))
export const genId = () => nanoid(12)
export const trpc = createTRPCReact<AppRouter>()

export type RouterContext = {
	queryClient: QueryClient
	utils: CreateReactUtils<AppRouter, unknown>
	user: User | undefined
}

export const authClient = createAuthClient({
	basePath: '/auth',
	plugins: [inferAdditionalFields<AuthType>()],
})

export function fetchWithProgress({
	url,
	body,
	method,
	onProgress,
	onLoad,
	onError,
}: {
	url: string
	method: string
	body: any
	onProgress?: (args: {loaded: number; total: number}) => void
	onLoad?: () => void
	onError?: () => void
}) {
	const xhr = new XMLHttpRequest()

	xhr.onload = () => {
		if (xhr.status !== 200) {
			onError?.()
		} else {
			onLoad?.()
		}
	}
	let args: {loaded: number; total: number}

	xhr.upload.addEventListener('progress', (event) => {
		args = {loaded: event.loaded, total: event.total}
		onProgress?.(args)
	})
	xhr.onerror = onError ?? (() => {})

	xhr.open(method, url)
	xhr.send(body)
}

export const isSiteAdmin = (user: User) => user.role === 'ADMIN'
