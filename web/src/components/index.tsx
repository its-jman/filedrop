import {Avatar, Text, Menu, UnstyledButton, Loader} from '@mantine/core'
import {Link, useRouteContext} from '@tanstack/react-router'
import type {PropsWithChildren} from 'react'
import {css} from 'styled-system/css'
import {flex} from 'styled-system/patterns'
import type {User} from '~server/routes/auth.[[auth]]'

export const styles = {
	PageWrap: css.raw({maxWidth: '1248px', mx: 'auto', px: '24px'}),
}

export const PageWrap = ({children}: PropsWithChildren) => (
	<div className={css(styles.PageWrap)}>{children}</div>
)

export const SuspenseLoader = (
	<Loader className={css({display: 'block', mx: 'auto', mt: '15%'})} size="2.5rem" />
)

interface LoginAvatarProps {
	user: User
}

export function LoginAvatar(props: LoginAvatarProps) {
	const {user} = props

	return (
		<Menu width={180}>
			<Menu.Target>
				<UnstyledButton
					className={flex({
						align: 'center',
						borderRadius: 5,
						px: 2,
						py: 1,
						_hover: {backgroundColor: 'gray.200'},
					})}
				>
					<Avatar
						src={user.image}
						radius="xl"
						imageProps={{referrerPolicy: 'no-referrer'}}
					/>
					<div className={css({ml: 3})}>
						<Text size="sm" fw={500}>
							{user.name}
						</Text>
						<Text size="xs" c="dimmed">
							{user.email}
						</Text>
					</div>
					{/* <IconMenu2 size="1.5rem" className={css({color: 'gray.400', ml: 2})} /> */}
				</UnstyledButton>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item component={Link} to="/homes">
					View Your Homes
				</Menu.Item>
				<Menu.Item component={Link} to="/homes/import-order">
					Import a new order
				</Menu.Item>
				{/* {isSiteAdmin(user) && (
					<Menu.Item component={Link} to="/admin">
						Admin
					</Menu.Item>
				)}
				<Menu.Item
					onClick={() => signOut({callbackUrl: '/'})}
					classNames={{item: css({_hover: {textDecoration: 'underline'}})}}
				>
					Sign Out
				</Menu.Item> */}
			</Menu.Dropdown>
		</Menu>
	)
}

export function Layout(props: PropsWithChildren) {
	const {user} = useRouteContext({from: '/_layout'})

	return (
		<>
			{user && (
				<header>
					<PageWrap>
						<div
							className={flex({
								align: 'center',
								height: '70px',
								justifyContent: 'space-between',
							})}
						>
							<Link
								to="/"
								className={css({
									fontSize: '24px',
									fontWeight: 'bold',
									_hover: {textDecoration: 'none'},
								})}
							>
								File Drop
							</Link>
							{user ? (
								<LoginAvatar user={user} />
							) : (
								<Link to="/auth/signin">Sign In</Link>
							)}
						</div>
					</PageWrap>
				</header>
			)}
			<main className={css({flexGrow: 1})}>{props.children}</main>
			<footer className={css({mt: '64px', mb: '24px'})}></footer>
		</>
	)
}
