import {Button, Loader, Menu, Modal, Text, UnstyledButton} from '@mantine/core'
import {Dropzone} from '@mantine/dropzone'
import {
	createFileRoute,
	useNavigate,
	useParams,
	useRouteContext,
} from '@tanstack/react-router'
import {useEffect, useLayoutEffect, useRef, useState} from 'react'
import {css} from 'styled-system/css'
import {flex, grid} from 'styled-system/patterns'
import {PageWrap, useScreenSize} from '~/components'
import {fetchWithProgress, genId, trpc} from '~/lib-client'
import {
	TrashIcon,
	DotsVerticalIcon,
	Cross1Icon,
	CaretDownIcon,
} from '@radix-ui/react-icons'
import {openConfirmModal} from '@mantine/modals'
import {notifications, showNotification} from '@mantine/notifications'
import type {RouterOutput} from '~server/routes/trpc.[[trpc]]'

export const Route = createFileRoute('/_layout/drops/$drop_id')({
	component: RouteComponent,
	loader: ({context, params: {drop_id}}) => {
		context.utils.PUBLIC.getDropInfo.prefetch({drop_id})
	},
})

type Upload = {
	id: string
	file: File
	url: string
	progress: number
}
type FileInfo = RouterOutput['PUBLIC']['getDropInfo']['files'][0]
function RouteComponent() {
	const {drop_id} = useParams({from: '/_layout/drops/$drop_id'})
	const {user} = useRouteContext({from: '/_layout/drops/$drop_id'})
	const utils = trpc.useUtils()
	const [info] = trpc.PUBLIC.getDropInfo.useSuspenseQuery({drop_id})
	const requestUploads = trpc.requestUploads.useMutation()
	const deleteDrop = trpc.deleteDrop.useMutation()
	const [uploads, setUploads] = useState<Array<Upload>>([])
	const [selected, setSelected] = useState<FileInfo[]>([])
	const [opened, setOpened] = useState<FileInfo | null>(null)
	const nav = useNavigate()
	const [img, openedRef] = useState<HTMLImageElement | null>(null)
	const [aspect, setAspect] = useState(1)

	useEffect(() => {
		const onClick = (event: MouseEvent) => setSelected([])
		document.addEventListener('click', onClick)
		return () => {
			document.removeEventListener('click', onClick)
		}
	}, [])

	useLayoutEffect(() => {
		if (img) setAspect(img.naturalWidth / img.naturalHeight)
		else setAspect(1)
	}, [img])
	const screenSize = useScreenSize()
	const screenAspect = screenSize.width / screenSize.height

	const onDrop = async (files: File[]) => {
		const urls = await requestUploads.mutateAsync({
			drop_id,
			file_names: files.map((file) => file.name),
		})

		const newUploads = files.map((file, i) => {
			fetchWithProgress({
				url: urls[i].signed_url,
				method: 'PUT',
				body: file,
				onError: () => {
					utils.PUBLIC.getDropInfo.invalidate()
				},
				onLoad: () => {
					utils.PUBLIC.getDropInfo.invalidate()
					setUploads((uploads) =>
						uploads.map((upload) =>
							upload.file === file ? {...upload, progress: 1} : upload
						)
					)
				},
				onProgress: (arg) =>
					setUploads((uploads) =>
						uploads.map((upload) =>
							upload.file === file
								? {...upload, progress: arg.loaded / arg.total}
								: upload
						)
					),
			})

			return {
				file,
				id: urls[i].file_id,
				url: urls[i].signed_url,
				progress: 0,
			}
		})

		setUploads((uploads) => [...uploads, ...newUploads])
	}

	const isOwner = info.drop.owner_user_id === user?.id
	const isEmpty = info.files.length === 0

	return (
		<div className={css({maxWidth: '1000px', mx: 'auto', px: '24px'})}>
			<div className={flex({alignItems: 'center', mb: 4, mt: 4})}>
				<Text size="xl" className={css({fontWeight: 600})}>
					{info.drop.name}
				</Text>
				{isOwner && (
					<Button
						color="red"
						leftSection={<TrashIcon />}
						className={css({ml: 'auto'})}
						onClick={() =>
							openConfirmModal({
								title: `Delete Drop`,
								children: (
									<Text size="sm">
										Are you sure you want to delete "{info.drop.name}"
									</Text>
								),
								confirmProps: {color: 'red'},
								labels: {confirm: 'Delete', cancel: 'Cancel'},
								onConfirm: async () => {
									await deleteDrop.mutateAsync({drop_id})
									utils.PUBLIC.getDropInfo.invalidate()
									utils.listMyDrops.invalidate()
									nav({to: '/'})
								},
							})
						}
					>
						Delete Drop
					</Button>
				)}
			</div>
			<div>
				<Dropzone
					onDrop={onDrop}
					activateOnKeyboard={false}
					activateOnClick={isEmpty}
					className={css({...(!isEmpty && {border: 0, bgColor: 'transparent'})})}
					classNames={{inner: css({pointerEvents: 'initial'})}}
				>
					{info.files.length === 0 ? (
						<div
							className={css({
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								minH: '250px',
								textAlign: 'center',
							})}
						>
							<Text>Your bucket is ready. Add files to get started.</Text>
						</div>
					) : (
						<div
							className={grid({
								gap: '15px',
								gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
							})}
						>
							{info.files.length > 0 &&
								info.files.map((file, i) => (
									<FileCard
										key={file.file_id}
										info={info}
										file={file}
										selected={selected.includes(file)}
										onDoubleClick={() => setOpened(file)}
										onClick={(event) => {
											event.stopPropagation()
											if (event.shiftKey) {
												const from = selected.at(-1)
												if (from) {
													const nums = [i, info.files.indexOf(from)]
													setSelected([
														...selected,
														...info.files.slice(Math.min(...nums), Math.max(...nums) + 1),
													])
												} else {
													setSelected([file])
												}
											} else if (event.ctrlKey || event.shiftKey || event.metaKey) {
												setSelected((selected) => [...selected, file])
											} else {
												setSelected([file])
											}
										}}
									/>
								))}
						</div>
					)}
				</Dropzone>
			</div>

			{uploads.length > 0 && (
				<UploadManager
					uploads={uploads}
					clearUploads={() => {
						if (uploads.filter((upload) => upload.progress !== 1).length === 0) {
							setUploads([])
						} else {
							showNotification({message: 'Uploads not finished.'})
						}
					}}
				/>
			)}

			{opened && (
				<Modal
					opened
					onClose={() => setOpened(null)}
					withCloseButton={false}
					title={null}
					size="1000px"
					padding={0}
					style={{'--aspect': aspect} as React.CSSProperties}
					classNames={{
						content: css({bgColor: 'transparent', flexBasis: 'fit-content'}),
						inner: css({
							justifyContent: 'center',
							alignItems: 'center',
							...(aspect > screenAspect ? {flexDir: 'row'} : {flexDir: 'column'}),
						}),
						body: css({aspectRatio: 'var(--aspect)', maxH: '100%', maxW: '100%'}),
					}}
				>
					<img
						ref={openedRef}
						className={css({objectFit: 'cover', aspectRatio: 'auto'})}
						src={opened.signed_url}
					/>
				</Modal>
			)}
		</div>
	)
}

function FileCard({
	file,
	selected,
	onClick,
	onDoubleClick,
	info,
}: {
	info: RouterOutput['PUBLIC']['getDropInfo']
	file: FileInfo
	selected: boolean
	onDoubleClick: () => void
	onClick: (event: React.MouseEvent) => void
}) {
	const lastClick = useRef(0)
	// const x = 'https://placehold.co/600x400?text=Image\n+not+Found'
	return (
		<div
			onClick={(event) => {
				onClick(event)
				if (Date.now() - lastClick.current < 350) {
					onDoubleClick()
				}

				lastClick.current = Date.now()
			}}
			className={css({
				borderColor: 'gray.700',
				borderWidth: 2,
				aspectRatio: 1,
				borderRadius: 8,
				px: 3,
				pb: 3,
				fontSize: 'sm',
				fontWeight: 500,
				...(selected && {
					bgColor: 'blue.200',
					color: 'blue.950',
				}),
			})}
		>
			<div className={flex({alignItems: 'center', py: 3})}>
				<div className={css({overflow: 'hidden', textOverflow: 'ellipsis'})}>
					{file.file_name}
				</div>
				{/* <a href={file.signed_url} download={file.file_name}>
					Download
				</a> */}
				<FileDropdown info={info} file={file} />
			</div>
			<img
				src={file.signed_url}
				onError={() => {}}
				// We want this as a square, fill the entire FileCard
				className={css({borderRadius: 4, objectFit: 'cover', aspectRatio: 1})}
			/>
		</div>
	)
}

function FileDropdown({
	info,
	file,
}: {
	info: RouterOutput['PUBLIC']['getDropInfo']
	file: FileInfo
}) {
	return null
	/* const {user} = useRouteContext({from: '/_layout'})

	return (
		<Menu width={180}>
			<Menu.Target>
				<UnstyledButton
					className={css({
						ml: 'auto',
						p: 1,
						aspectRatio: 1,
					})}
				>
					<DotsVerticalIcon />
				</UnstyledButton>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item
					// onClick={async () => {
					// 	try {
					// 		await fetch(file.signed_url, {mode: 'no-cors'})
					// 	} catch {
					// 	} finally {
					// 	}
					// }}
					component="a"
					target="_blank"
					href={file.signed_url}
					download={file.file_name}
				>
					<span>Download</span>
				</Menu.Item>
				{user?.id === info.drop.owner_user_id && (
					<>
						<Menu.Item onClick={() => {}}>Rename File</Menu.Item>
						<Menu.Item onClick={() => {}}>Delete</Menu.Item>
					</>
				)}
			</Menu.Dropdown>
		</Menu>
	) */
}

function UploadManager({
	uploads,
	clearUploads,
}: {
	uploads: Upload[]
	clearUploads: () => void
}) {
	const [collapsed, setCollapsed] = useState(false)

	return (
		uploads.length > 0 && (
			<div
				className={css({
					position: 'fixed',
					bottom: 0,
					left: '40px',
					maxWidth: '400px',
					width: '100%',
					backgroundColor: '#fff',
					shadow: 'xl',
					borderTopLeftRadius: 8,
					borderTopRightRadius: 8,
					smDown: {
						left: '10px',
						right: '10px',
						maxW: 'calc(100dvw - 20px)',
					},
				})}
			>
				<div
					className={flex({
						px: 4,
						py: 2,
						borderBottom: !collapsed ? '1px solid black' : '',
					})}
				>
					<Text size="lg" className={css({fontWeight: 500})}>
						Uploads...
					</Text>
					<span className={flex({ml: 'auto', alignItems: 'center'})}>
						{uploads.filter((upload) => upload.progress === 1).length} / {uploads.length}
					</span>
					<UnstyledButton
						onClick={() => setCollapsed(!collapsed)}
						className={flex({
							alignItems: 'center',
							justifyContent: 'center',
							p: 1,
							width: '32px',
							aspectRatio: 1,
							borderRadius: 2,
							ml: 4,
							transition: 'all .3s ease-in-out',
							_hover: {bgColor: 'gray.200'},
						})}
					>
						<CaretDownIcon
							width={24}
							height={24}
							className={css({transform: collapsed ? 'rotate(180deg)' : ''})}
						/>
					</UnstyledButton>
					<UnstyledButton
						onClick={clearUploads}
						className={flex({
							alignItems: 'center',
							justifyContent: 'center',
							p: 1,
							width: '32px',
							aspectRatio: 1,
							borderRadius: 2,
							ml: 0.5,
							_hover: {bgColor: 'gray.200'},
						})}
					>
						<Cross1Icon />
					</UnstyledButton>
				</div>
				{!collapsed && (
					<div className={css({maxHeight: '250px', overflowY: 'auto'})}>
						{uploads.map((upload) => (
							<div key={upload.id} className={css({position: 'relative', px: 3, py: 1})}>
								<div
									className={css({
										position: 'absolute',
										top: 0,
										bottom: 0,
										left: 0,
										width: 'var(--width)',
										bgColor: 'blue.200',
										zIndex: -1,
									})}
									style={{'--width': `${upload.progress * 100}%`} as React.CSSProperties}
								/>
								{upload.file.name}
							</div>
						))}
					</div>
				)}
			</div>
		)
	)
}
