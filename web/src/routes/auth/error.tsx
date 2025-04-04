import {Title} from '@mantine/core'
import {Link, createFileRoute, redirect} from '@tanstack/react-router'
import {css} from 'styled-system/css'

export const Route = createFileRoute('/auth/error')({
	beforeLoad(ctx) {
		if (ctx.context.user) {
			throw redirect({to: '/'})
		}
	},
	component: (props) => {
		return (
			<div className={css({textAlign: 'center'})}>
				<Title order={2} className={css({mb: 4})}>
					Error
				</Title>
				<div>Something went wrong.</div>
				<div className={css({mt: 3, fontSize: 'sm', color: 'blue.600'})}>
					<Link to="/">Go back</Link>
				</div>
			</div>
		)
	},
})
