import * as React from 'react'
import {
	Link,
	Outlet,
	createRootRoute,
	createRootRouteWithContext,
} from '@tanstack/react-router'
import {TanStackRouterDevtools} from '@tanstack/router-devtools'
import type {RouterContext} from '~/lib-client'

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
})

function RootComponent() {
	return (
		<>
			<title>Digester</title>
			<div className="p-2 flex gap-2 text-lg">
				<Link to="/" activeProps={{className: 'font-bold'}} activeOptions={{exact: true}}>
					Home
				</Link>{' '}
				<Link to="/about" activeProps={{className: 'font-bold'}}>
					About
				</Link>
			</div>
			<hr />
			<Outlet />
			<TanStackRouterDevtools position="bottom-right" />
		</>
	)
}
