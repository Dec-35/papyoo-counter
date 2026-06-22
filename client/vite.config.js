import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

// Rewrites __BUILD_TIMESTAMP__ in sw.js at build time so the cache name
// changes on every deploy, forcing the old service worker to be replaced.
function swVersionPlugin() {
  return {
    name: 'sw-version',
    closeBundle() {
      const swPath = path.resolve(__dirname, '../server/dist/sw.js')
      if (!fs.existsSync(swPath)) return
      const ts = Date.now()
      fs.writeFileSync(swPath, fs.readFileSync(swPath, 'utf8').replace('__BUILD_TIMESTAMP__', ts))
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), swVersionPlugin()],
    resolve: {
        alias: {
            '@assets': '/src/assets',
        }
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://0.0.0.0:3000',
                changeOrigin: true,
                secure: false
            },
            // Proxy websocket connections to backend during development
            '/ws': {
                target: 'ws://0.0.0.0:3000',
                ws: true,
                changeOrigin: true,
                secure: false
            }
        }
    },
    build: {
        outDir: '../server/dist',
        emptyOutDir: true,
    }
})
