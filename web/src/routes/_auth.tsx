import {Outlet, createFileRoute} from '@tanstack/react-router'
import {css} from 'styled-system/css'
import {flex} from 'styled-system/patterns'

export const Route = createFileRoute('/_auth')({
	component: () => (
		<div
			className={flex({
				align: 'center',
				justify: 'center',
				minH: '100dvh',
				py: '24px',
				px: '12px',
			})}
		>
			<div
				className={css({
					p: '48px',
					boxShadow:
						'0 20px 25px -5px rgba(0, 0, 0, .1), 0 10px 10px -5px rgba(0, 0, 0, .04)',
					bgColor: 'white',
					width: '400px',
				})}
			>
				<Outlet />
			</div>
		</div>
	),
})
