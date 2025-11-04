import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  // base: '/asd',
  build: {
    // https://github.com/crxjs/chrome-extension-tools/issues/573
    minify: false,
  },
	plugins: [react(), crx({ manifest })],
	optimizeDeps: {
		exclude: ['lucide-react']
	},
	server: {
		port: 5111,
		strictPort: true,
		hmr: {
			protocol: 'ws',
			host: 'localhost',
			port: 5173
		}
	},
  resolve: {
		alias: {
			// https://github.com/tabler/tabler-icons/issues/1233#issuecomment-2428245119
			'@tabler/icons-react':
				'@tabler/icons-react/dist/esm/icons/index.mjs'
		}
	}
})
