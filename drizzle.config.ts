import type {Config} from 'drizzle-kit'

export default {
	schema: './server/src/schema',
	out: './drizzle',
	driver: 'd1-http',
	dialect: 'sqlite',
	dbCredentials: {
		accountId: 'efc3f9b769480f5394f03adcf6d6f291',
		databaseId: 'e870f60a-2c4d-45e9-ada5-92804231f501',
		token: process.env.D1_TOKEN!,
	},
} satisfies Config
