import type {CfFn, InternalEnv} from '~server/lib-server'
import {
	initTRPC,
	TRPCError,
	type inferRouterInputs,
	type inferRouterOutputs,
} from '@trpc/server'
import SuperJSON from 'superjson'
import {z, ZodError} from 'zod'
import {fromZodError} from 'zod-validation-error'
import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import * as schema from '~server/schema'
import {genId, isSiteAdmin, sleep} from '~/lib-client'
import {and, eq} from 'drizzle-orm'
import {AwsClient} from 'aws4fetch'

const createContext = async (req: Request, env: InternalEnv, ctx: ExecutionContext) => {
	const sessionData = await env.AUTH.api.getSession({headers: req.headers})
	return () => ({req, env, data: {user: sessionData?.user}})
}

export const handler: CfFn = async (req, env, ctx) => {
	return fetchRequestHandler({
		endpoint: '/trpc',
		req,
		router: appRouter,
		createContext: await createContext(req, env, ctx),
		onError({ctx, error}) {
			const errorLogger = console.error
			errorLogger(error)
		},
	})
}

const t = initTRPC
	.context<ReturnType<Awaited<ReturnType<typeof createContext>>>>()
	.create({
		transformer: SuperJSON,
		errorFormatter: ({shape, error}) => {
			return {
				...shape,
				data: {
					...shape.data,
					zodError: error instanceof ZodError ? fromZodError(error) : null,
				},
			}
		},
	})

const _UNAUTHENTICATED_procedure = t.procedure
const _ADMIN_procedure = t.procedure.use(
	t.middleware(({ctx, next}) => {
		if (!ctx.data.user || !isSiteAdmin(ctx.data.user)) {
			throw new TRPCError({code: 'UNAUTHORIZED'})
		}
		// TODO: This isn't necessary... But how otherwise to type-safe assume the assertion from above?
		return next({ctx: {...ctx, data: {...ctx.data, user: ctx.data.user}}})
	})
)
const procedure = t.procedure.use(
	t.middleware(({ctx, next}) => {
		if (!ctx.data.user) {
			throw new TRPCError({code: 'UNAUTHORIZED'})
		}
		// TODO: This isn't necessary... But how otherwise to type-safe assume the assertion from above?
		return next({ctx: {...ctx, data: {...ctx.data, user: ctx.data.user}}})
	})
)

export const appRouter = t.router({
	PUBLIC: t.router({
		getCurrentUser: _UNAUTHENTICATED_procedure.query(async ({ctx}) => {
			return await ctx.env.AUTH.api.getSession({headers: ctx.req.headers})
		}),
		getDropInfo: _UNAUTHENTICATED_procedure
			.input(z.object({drop_id: z.string()}))
			.query(async ({ctx, input}) => {
				const {DB} = ctx.env

				const dropsReq = DB.select()
					.from(schema.drops)
					.where(eq(schema.drops.drop_id, input.drop_id))

				const filesReq = DB.select()
					.from(schema.files)
					.where(eq(schema.files.drop_id, input.drop_id))

				// signed url is pointing to remote, env.R2 is pointing to local...
				// const filesReq = ctx.env.R2.list({prefix: `drops/${input.drop_id}`})

				const [drops, files] = await Promise.all([dropsReq, filesReq])

				const accountId = 'efc3f9b769480f5394f03adcf6d6f291'
				const bucketName = 'file-drop-bucket-prod'
				const r2 = new AwsClient({
					accessKeyId: ctx.env.R2_ACCESS_KEY_ID,
					secretAccessKey: ctx.env.R2_SECRET_ACCESS_KEY,
				})

				const urls = await Promise.all(
					files.map(async (file) => {
						const url = new URL(
							`https://${bucketName}.${accountId}.r2.cloudflarestorage.com`
						)
						url.pathname = `/drops/${file.drop_id}/${file.file_id}`
						url.searchParams.set('X-Amz-Expires', `${604_800}`)

						const signed = await r2.sign(new Request(url, {method: 'GET'}), {
							aws: {signQuery: true},
						})

						return {...file, signed_url: signed.url}
					})
				)

				return {drop: drops[0], files: urls}
			}),
	}),
	createDrop: _ADMIN_procedure
		.input(z.object({name: z.string()}))
		.mutation(async ({input, ctx}) => {
			const {DB} = ctx.env
			const drop_id = genId()
			await DB.insert(schema.drops).values({
				drop_id,
				owner_user_id: ctx.data.user.id,
				name: input.name,
				createdAt: new Date(),
			})

			return {drop_id}
		}),
	listMyDrops: procedure.query(async ({ctx}) => {
		const {DB} = ctx.env
		return await DB.select()
			.from(schema.drops)
			.where(eq(schema.drops.owner_user_id, ctx.data.user.id))
	}),
	requestUploads: _ADMIN_procedure
		.input(z.object({drop_id: z.string(), file_names: z.array(z.string())}))
		.mutation(async ({ctx, input}) => {
			const {DB} = ctx.env

			// Validate owner
			const drops = await DB.select()
				.from(schema.drops)
				.where(eq(schema.drops.drop_id, input.drop_id))
			if (drops[0].owner_user_id !== ctx.data.user.id) {
				throw new TRPCError({code: 'UNAUTHORIZED'})
			}

			const accountId = 'efc3f9b769480f5394f03adcf6d6f291'
			const bucketName = 'file-drop-bucket-prod'
			const r2 = new AwsClient({
				accessKeyId: ctx.env.R2_ACCESS_KEY_ID,
				secretAccessKey: ctx.env.R2_SECRET_ACCESS_KEY,
			})

			const urls = await Promise.all(
				input.file_names.map(async (file_name) => {
					const url = new URL(
						`https://${bucketName}.${accountId}.r2.cloudflarestorage.com`
					)

					const file_id = genId()
					const file_path = `/drops/${input.drop_id}/${file_id}`
					url.pathname = file_path
					url.searchParams.set('X-Amz-Expires', '3600')

					const signed = await r2.sign(new Request(url, {method: 'PUT'}), {
						aws: {signQuery: true},
					})

					return {file_id, file_name, file_path, signed_url: signed.url}
				})
			)

			await DB.insert(schema.files).values(
				urls.map((url) => ({
					...url,
					drop_id: input.drop_id,
					metadata_json: '',
				}))
			)

			return urls
		}),

	deleteDrop: procedure
		.input(z.object({drop_id: z.string()}))
		.mutation(async ({ctx, input}) => {
			const {DB} = ctx.env

			const res = await DB.delete(schema.drops).where(
				and(
					eq(schema.drops.drop_id, input.drop_id),
					eq(schema.drops.owner_user_id, ctx.data.user.id)
				)
			)
			const success = res.meta.rows_written > 0
			if (success) {
				// ensure drop is valid, and matches owner_id
				const deletedRows = await DB.delete(schema.files).where(
					eq(schema.files.drop_id, input.drop_id)
				)
				const items = await ctx.env.R2.list({prefix: `/drops/${input.drop_id}`})
				await ctx.env.R2.delete(items.objects.map((obj) => obj.key))
				console.log(
					`Deleting "${deletedRows.meta.rows_written}" rows. Deleting "${items.objects.length}" files`
				)
			}

			return success
		}),
})

export type AppRouter = typeof appRouter
export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
