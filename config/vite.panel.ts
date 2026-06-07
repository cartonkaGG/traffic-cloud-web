import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const panelRoot = resolve(repoRoot, 'apps/panel')

export default defineConfig({
  root: panelRoot,
  base: '/app/',
  envDir: repoRoot,
  publicDir: resolve(panelRoot, 'public'),
  resolve: {
    alias: {
      '@': resolve(panelRoot, 'src')
    }
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  build: {
    outDir: resolve(repoRoot, 'apps/marketing/dist/app'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(panelRoot, 'index.web.html')
    }
  },
  server: {
    port: 5174,
    strictPort: true,
    host: '127.0.0.1'
  }
})
