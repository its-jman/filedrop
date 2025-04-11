import {Outlet, createRootRouteWithContext} from '@tanstack/react-router'
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools'
import type {RouterContext} from '~/lib-client'
import {Suspense} from 'react'
import {SuspenseLoader} from '~/components'

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
})

function RootComponent() {
	return (
		<>
			<Suspense fallback={SuspenseLoader}>
				<Outlet />
			</Suspense>

			<TanStackRouterDevtools position="bottom-right" />
		</>
	)
}
