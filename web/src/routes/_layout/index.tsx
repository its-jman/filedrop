import {
	createFileRoute,
	Link,
	useNavigate,
	useRouteContext,
	useRouterState,
} from '@tanstack/react-router'
import {useState} from 'react'
import {css} from 'styled-system/css'
import {authClient, isSiteAdmin, trpc} from '~/lib-client'
import {GoogleSignin} from '../_auth/auth/-components'
import {flex} from 'styled-system/patterns'
import {PageWrap} from '~/components'

export const Route = createFileRoute('/_layout/')({component: HomeComponent})

function HomeComponent() {
	const {user} = useRouteContext({from: '/_layout/'})
	const drops = trpc.listMyDrops.useQuery(undefined, {enabled: Boolean(user)})

	return (
		<div className="p-2">
			<PageWrap>
				{user ? (
					<div>
						<div>Your drops:</div>
						<div>
							{!isSiteAdmin(user) && <div>You must be an admin to create drops.</div>}
							{drops.data?.map((drop) => (
								<div key={drop.drop_id}>
									<Link to="/drops/$drop_id" params={{drop_id: drop.drop_id}}>
										{drop.name}
									</Link>
								</div>
							))}
						</div>
					</div>
				) : (
					<div className={flex({alignItems: 'center', justifyContent: 'center', pt: 40})}>
						<GoogleSignin />
					</div>
				)}
			</PageWrap>
		</div>
	)
}
