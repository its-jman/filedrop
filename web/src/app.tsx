import {createTheme, MantineProvider} from '@mantine/core'
import {ModalsProvider} from '@mantine/modals'
import {Notifications} from '@mantine/notifications'
import {QueryClient, QueryClientProvider, useQueryClient} from '@tanstack/react-query'
import {RouterProvider} from '@tanstack/react-router'
import {httpBatchLink} from '@trpc/client'
import React from 'react'
import {Suspense, useState} from 'react'
import SuperJSON from 'superjson'
import {createRouter as rawCreateRouter} from '@tanstack/react-router'
import {routeTree} from '~/routeTree.gen'
import {trpc, type RouterContext} from './lib-client'

const theme = createTheme({})

const createRouter = (context: RouterContext) => {
	return rawCreateRouter({
		routeTree,
		context: context,
		defaultPreload: 'intent',
		notFoundMode: 'root',
	})
}

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof createRouter>
	}
}

function AppRouter() {
	const queryClient = useQueryClient()
	const utils = trpc.useUtils()
	const [router] = useState(() => createRouter({queryClient, utils, user: null}))

	return <RouterProvider router={router} />
}

export function App() {
	const [queryClient] = useState(() => {
		return new QueryClient({
			defaultOptions: {
				queries: {staleTime: 15 * 1000, retry: 1, retryDelay: (i) => 3 + i * 3},
			},
		})
	})
	const [trpcClient] = useState(() => {
		return trpc.createClient({
			links: [httpBatchLink({url: '/api/trpc', transformer: SuperJSON})],
		})
	})

	return (
		<React.StrictMode>
			<Suspense fallback={'Loading...'}>
				<trpc.Provider client={trpcClient} queryClient={queryClient}>
					<QueryClientProvider client={queryClient}>
						<MantineProvider theme={theme}>
							<ModalsProvider>
								<Notifications />
								<AppRouter />
							</ModalsProvider>
						</MantineProvider>
					</QueryClientProvider>
				</trpc.Provider>
			</Suspense>
		</React.StrictMode>
	)
}
