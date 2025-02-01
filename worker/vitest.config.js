import {defineWorkersConfig} from '@cloudflare/vitest-pool-workers/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineWorkersConfig({
	plugins: [tsconfigPaths()],
	test: {
		typecheck: true,
		poolOptions: {
			workers: {
				wrangler: {configPath: './wrangler.json'},
			},
		},
	},
})
