import { copyFileSync, existsSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const appDir = join(root, 'apps', 'marketing', 'dist', 'app')
const from = join(appDir, 'index.web.html')
const to = join(appDir, 'index.html')

if (!existsSync(from)) {
  console.error('[web] missing', from)
  process.exit(1)
}
copyFileSync(from, to)
try {
  unlinkSync(from)
} catch {
  /* ok */
}
console.log('[web] wrote', to)
