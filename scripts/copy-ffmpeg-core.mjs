import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm')
const destDir = join(root, 'apps', 'panel', 'public', 'ffmpeg')
const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm']

if (!existsSync(srcDir)) {
  console.error('[ffmpeg] @ffmpeg/core not found — run npm install')
  process.exit(1)
}

mkdirSync(destDir, { recursive: true })
for (const file of files) {
  copyFileSync(join(srcDir, file), join(destDir, file))
  console.log('[ffmpeg] copied', file)
}
