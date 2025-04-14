import {TextInput} from '@mantine/core'
import {useForm} from '@mantine/form'
import {createFileRoute, redirect} from '@tanstack/react-router'
import {css} from 'styled-system/css'
import {grid} from 'styled-system/patterns'
import {z} from 'zod'
import {authClient} from '~/lib-client'
import {GoogleSignin} from './-components'

export const Route = createFileRoute('/_auth/auth/signin')({
	component: SignIn,
	validateSearch: z.object({redirect: z.string().optional()}),
	beforeLoad(ctx) {
		if (ctx.context.user) {
			throw redirect({to: '/'})
		}
	},
})

function SignIn() {
	const {redirect = '/'} = Route.useSearch()

	const emailForm = useForm({
		initialValues: {email: ''},
		validate: {
			email: (value) => (/^\S+@\S+\.\S{2,}$/.test(value) ? null : 'Invalid email'),
		},
	})

	return (
		<>
			<div>
				<img
					className={css({
						width: '86px',
						aspectRatio: 1,
						mx: 'auto',
						objectFit: 'contain',
					})}
					src="/favicon.png"
					alt=""
				/>
				<div className={css({fontSize: '24px', mt: '24px', textAlign: 'center'})}>
					File Drop
				</div>
				<div className={css({textAlign: 'center', fontSize: '14px', mt: '16px'})}>
					Login to manage your files
				</div>
			</div>
			{/* <form
				onSubmit={emailForm.onSubmit((values) => {
					// signIn('resend', {callbackUrl: redirect, email: values.email})
				})}
			>
				<TextInput
					type="email"
					className={css({mt: '24px'})}
					classNames={{input: css({height: '50px', fontSize: '16px'})}}
					placeholder="Email Address"
					{...emailForm.getInputProps('email')}
				/>
				<button
					type="submit"
					className={css({
						display: 'block',
						width: '100%',
						height: '50px',
						borderRadius: 4,
						bgColor: 'blue.700',
						textAlign: 'center',
						mt: '24px',
						color: 'white',
						fontWeight: 500,
						cursor: 'pointer',
						transitionProperty: 'all',
						transitionDuration: '.3s',
						_hover: {
							bgColor: 'blue.800',
						},
					})}
				>
					Continue
				</button>
			</form>
			<div
				className={css({
					position: 'relative',
					textAlign: 'center',
					my: '24px',
					_after: {
						content: '""',
						position: 'absolute',
						display: 'block',
						height: '1px',
						width: 'calc(50% - 30px)',
						bgColor: 'gray.300',
						top: '50%',
						left: 'calc(50% + 30px)',
						transform: 'translate(0, -50%)',
					},
					_before: {
						content: '""',
						position: 'absolute',
						display: 'block',
						height: '1px',
						width: 'calc(50% - 30px)',
						bgColor: 'gray.300',
						top: '50%',
						right: 'calc(50% + 30px)',
						transform: 'translate(0, -50%)',
					},
				})}
			>
				OR
			</div> */}
			<div className={grid({columns: 1, gap: '10px', mt: 4})}>
				<GoogleSignin />
			</div>
		</>
	)
}
