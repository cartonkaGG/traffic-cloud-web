import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const panelRoot = resolve(repoRoot, 'apps/panel')
const panelBuildId =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ??
  process.env.GITHUB_SHA?.slice(0, 12) ??
  `local-${Date.now()}`

export default defineConfig({
  root: panelRoot,
  base: '/app/',
  envDir: repoRoot,
  publicDir: resolve(panelRoot, 'public'),
  define: {
    'import.meta.env.VITE_PANEL_BUILD_ID': JSON.stringify(panelBuildId)
  },
  resolve: {
    alias: {
      '@': resolve(panelRoot, 'src')
    }
  },
  plugins: [
    react(),
    {
      name: 'panel-trailing-slash',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/app') {
            res.statusCode = 301
            res.setHeader('Location', '/app/')
            res.end()
            return
          }
          next()
        })
      }
    }
  ],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  build: {
    outDir: resolve(repoRoot, 'apps/marketing/dist/app'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(panelRoot, 'index.web.html'),
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            if (id.includes('AffiliateOffersPage') || id.includes('AffiliateStatsPage')) {
              return 'affiliate'
            }
            if (id.includes('AdminAffiliatePage')) return 'affiliate-admin'
            return undefined
          }
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('lucide-react')) return 'icons'
          return 'vendor'
        }
      }
    }
  },
  server: {
    port: 5174,
    strictPort: true,
    host: '127.0.0.1'
  }
})
