import {Title} from '@mantine/core'
import {Link, createFileRoute, redirect} from '@tanstack/react-router'
import {css} from 'styled-system/css'

export const Route = createFileRoute('/_auth/auth/verify-request')({
	beforeLoad(ctx) {
		if (ctx.context.user) {
			throw redirect({to: '/'})
		}
	},
	component: () => (
		<div className={css({textAlign: 'center'})}>
			<Title order={2} className={css({mb: 4})}>
				Check your email
			</Title>
			<div>A sign in link has been sent to your email address.</div>
			<div className={css({mt: 3, fontSize: 'sm', color: 'blue.600'})}>
				<Link to="/auth/signin">Go back</Link>
			</div>
			<div className={css({mt: 3, fontSize: 'xs'})}>
				Can't find your link? Check your spam folder!
			</div>
		</div>
	),
})
