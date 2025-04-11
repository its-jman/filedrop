import {createTheme, MantineProvider} from '@mantine/core'
import {ModalsProvider} from '@mantine/modals'
import {Notifications} from '@mantine/notifications'
import {QueryClient, QueryClientProvider, useQueryClient} from '@tanstack/react-query'
import {RouterProvider} from '@tanstack/react-router'
import {httpBatchLink} from '@trpc/client'
import React, {useEffect} from 'react'
import {Suspense, useState} from 'react'
import SuperJSON from 'superjson'
import {createRouter as createTanstackRouter} from '@tanstack/react-router'
import {routeTree} from '~/routeTree.gen'
import {authClient, trpc, type RouterContext} from './lib-client'

const theme = createTheme({})

declare module '@tanstack/react-router' {
	interface Register {
		router: ReturnType<typeof createRouter>
	}
}

const createRouter = (context: RouterContext) => {
	return createTanstackRouter({
		routeTree,
		context: context,
		trailingSlash: 'never',
		defaultPreload: 'intent',
		notFoundMode: 'root',
		scrollRestoration: true,
	})
}

function AppRouter() {
	const queryClient = useQueryClient()
	const utils = trpc.useUtils()
	const authSession = authClient.useSession()

	const [router] = useState(() =>
		createRouter({queryClient, utils, user: authSession.data?.user})
	)

	// tsr doesn't refresh context by default???? Must revalidate anytime you pass new values???
	useEffect(() => {
		router.invalidate()
	}, [router, authSession])

	return <RouterProvider router={router} context={{user: authSession.data?.user}} />
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
			links: [httpBatchLink({url: '/trpc', transformer: SuperJSON})],
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
