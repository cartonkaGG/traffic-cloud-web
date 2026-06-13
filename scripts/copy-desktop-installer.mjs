/**
 * Копіює Windows-інсталятор з монорепо cloudetrafiiick у public/downloads для Vercel.
 * Запуск після: cd ../cloudetrafiiick && npm run dist:win
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const monoRoot = join(root, '..', 'cloudetrafiiick')
const version = '0.2.11'
const fileName = `Traffic-Cloud-Setup-${version}.exe`
const releaseDir = join(monoRoot, 'release')
const nsisSrc = join(releaseDir, `Traffic Cloud Setup ${version}.exe`)
const portableSrc = join(releaseDir, `Traffic Cloud ${version}.exe`)
const src = existsSync(nsisSrc) ? nsisSrc : portableSrc
const destDir = join(root, 'apps', 'marketing', 'public', 'downloads')
const dest = join(destDir, fileName)

if (!existsSync(src)) {
  if (existsSync(dest)) {
    console.log(`[desktop] installer already present: ${dest}`)
    process.exit(0)
  }
  console.warn(`[desktop] skip — build first: cd cloudetrafiiick && npm run dist:win`)
  console.warn(`[desktop] expected: ${src}`)
  process.exit(0)
}

mkdirSync(destDir, { recursive: true })
copyFileSync(src, dest)
console.log(`[desktop] copied → ${dest}`)
