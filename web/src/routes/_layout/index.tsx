import {
	createFileRoute,
	useNavigate,
	useRouteContext,
	useRouterState,
} from '@tanstack/react-router'
import {useState} from 'react'
import {authClient} from '~/lib-client'

export const Route = createFileRoute('/_layout/')({component: HomeComponent})

function HomeComponent() {
	const nav = useNavigate()
	const {user} = useRouteContext({from: '/_layout/'})

	return (
		<div className="p-2">
			<h3>Welcome Home{user ? `, ${user.name}!` : '!'}</h3>
			<button onClick={() => nav({to: '/auth/signin'})}>Sign in</button>
			<button
				onClick={async () => {
					await authClient.signOut()
					window.location.reload()
				}}
			>
				Sign out
			</button>
		</div>
	)
}
