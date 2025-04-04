import {defineWorkersConfig} from '@cloudflare/vitest-pool-workers/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineWorkersConfig({
	server: {},
	plugins: [tsconfigPaths()],
	test: {
		typecheck: {enabled: true},
		poolOptions: {
			workers: {
				wrangler: {configPath: './wrangler.json'},
			},
		},
	},
})
