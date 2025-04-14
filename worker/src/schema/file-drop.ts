import {sqliteTable, text, integer, primaryKey, index} from 'drizzle-orm/sqlite-core'

export const drops = sqliteTable('drops', {
	drop_id: text('drop_id').primaryKey(),
	owner_user_id: text('owner_user_id').notNull(),
	name: text('name').notNull(),
	createdAt: integer('created_at', {mode: 'timestamp'}).notNull(),
})

export const files = sqliteTable(
	'files',
	{
		drop_id: text('drop_id').notNull(),
		file_id: text('file_id').primaryKey(),
		file_name: text('file_name').notNull(),
		metadata_json: text('metadata_json').notNull(),
	},
	(file) => [index('drop_id_idx').on(file.drop_id)]
)
