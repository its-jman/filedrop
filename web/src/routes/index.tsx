import {
	createFileRoute,
	useNavigate,
	useRouteContext,
	useRouterState,
} from '@tanstack/react-router'
import {authClient} from '~/lib-client'

export const Route = createFileRoute('/')({component: HomeComponent})

function HomeComponent() {
	const nav = useNavigate()
	const route = useRouterState().matches.at(-1)
	const user = route?.context.user

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
