import {createFileRoute, useNavigate} from '@tanstack/react-router'
import {Loader, Text, TextInput} from '@mantine/core'
import {PageWrap, SuspenseLoader} from '~/components'
import {css} from 'styled-system/css'
import {Form, useForm} from '@mantine/form'
import {trpc} from '~/lib-client'

export const Route = createFileRoute('/_layout/drops/create')({
	component: RouteComponent,
})

function RouteComponent() {
	const form = useForm({initialValues: {name: ''}})
	const nav = useNavigate()
	const createDrop = trpc.createDrop.useMutation({
		onSuccess: ({drop_id}) => {
			nav({to: '/drops/$drop_id', params: {drop_id}})
		},
	})

	return (
		<div className={css({maxWidth: '350px', mx: 'auto', px: '12px'})}>
			<Text size={'lg'}>Create Drop</Text>
			<Form
				form={form}
				onSubmit={(formValues) => createDrop.mutate({name: formValues.name})}
			>
				<TextInput
					placeholder="Name..."
					disabled={createDrop.isPending}
					leftSection={createDrop.isPending && <Loader size="xs" />}
					{...form.getInputProps('name')}
				/>
			</Form>
		</div>
	)
}
