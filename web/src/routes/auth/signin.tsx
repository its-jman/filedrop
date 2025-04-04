import {TextInput} from '@mantine/core'
import {useForm} from '@mantine/form'
import {createFileRoute, redirect} from '@tanstack/react-router'
import {css} from 'styled-system/css'
import {grid} from 'styled-system/patterns'
import {z} from 'zod'
import {signIn} from '~/library-pages-auth'

export const Route = createFileRoute('/auth/signin')({
	component: SignIn,
	validateSearch: z.object({redirect: z.string().optional()}),
	beforeLoad(ctx) {
		if (ctx.context.user) {
			throw redirect({to: '/'})
		}
	},
})

const GoogleSvg = (
	<svg
		className={css({display: 'block', width: '1.25rem', aspectRatio: 1})}
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 48 48"
		xmlnsXlink="http://www.w3.org/1999/xlink"
	>
		<path
			fill="#EA4335"
			d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
		></path>
		<path
			fill="#4285F4"
			d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
		></path>
		<path
			fill="#FBBC05"
			d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
		></path>
		<path
			fill="#34A853"
			d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
		></path>
		<path fill="none" d="M0 0h48v48H0z"></path>
	</svg>
)

const ProviderButtonCss = css.raw({
	display: 'flex',
	alignItems: 'center',
	borderWidth: '1px',
	borderRadius: 4,
	py: '13px',
	px: '24px',
	gap: '12px',
	borderColor: 'gray.300',
	fontSize: '15px',
	cursor: 'pointer',
	transitionProperty: 'all',
	transitionDuration: '.3s',
	_hover: {
		bgColor: 'gray.200',
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
					className={css({width: '86px', aspectRatio: 1, mx: 'auto'})}
					src="/favicon.png"
					alt=""
				/>
				<div className={css({fontSize: '24px', mt: '24px', textAlign: 'center'})}>
					SEEAIR
				</div>
				<div className={css({textAlign: 'center', fontSize: '14px', mt: '16px'})}>
					Login to SEEAIR to continue to your assessment dashboard
				</div>
			</div>
			<form
				onSubmit={emailForm.onSubmit((values) => {
					signIn('resend', {callbackUrl: redirect, email: values.email})
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
			</div>
			<div className={grid({columns: 1, gap: '10px'})}>
				<button
					className={css(ProviderButtonCss)}
					onClick={() => signIn('google', {callbackUrl: redirect})}
				>
					{GoogleSvg}
					Continue with Google
				</button>
			</div>
		</>
	)
}
