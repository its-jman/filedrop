import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {TanStackRouterVite} from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import {cloudflare} from '@cloudflare/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tsconfigPaths(),
		TanStackRouterVite({routesDirectory: './src/routes', autoCodeSplitting: true}),
		react(),
	],
})
