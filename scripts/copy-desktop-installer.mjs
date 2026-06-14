/**
 * Публікує Windows-інсталятор на GitHub Releases (Vercel не віддає .exe ~80MB).
 * Запуск після: cd ../cloudetrafiiick && npm run dist:win:safe
 */
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const monoRoot = join(root, '..', 'cloudetrafiiick')
const pkg = JSON.parse(readFileSync(join(monoRoot, 'package.json'), 'utf8'))
const version = String(pkg.version ?? '0.0.0').trim()
const fileName = `Traffic-Cloud-Setup-${version}.exe`
const tag = `v${version}`
const releaseDir = join(monoRoot, 'release')
const nsisSrc = join(releaseDir, `Traffic Cloud Setup ${version}.exe`)
const portableSrc = join(releaseDir, `Traffic Cloud ${version}.exe`)
const src = existsSync(nsisSrc) ? nsisSrc : portableSrc
const downloadsDir = join(root, 'apps', 'marketing', 'public', 'downloads')
const latestJsonPath = join(downloadsDir, 'latest.json')
const GITHUB_REPO = 'cartonkaGG/trafficcloud'
const assetName = `Traffic.Cloud.Setup.${version}.exe`
const downloadUrl = `https://github.com/${GITHUB_REPO}/releases/download/${tag}/${assetName}`
const stagedExe = join(downloadsDir, fileName)

if (!existsSync(src)) {
  console.warn('[desktop] skip — build first: cd cloudetrafiiick && npm run dist:win:safe')
  console.warn('[desktop] expected:', nsisSrc)
  process.exit(1)
}

mkdirSync(downloadsDir, { recursive: true })
writeFileSync(
  latestJsonPath,
  `${JSON.stringify({ latestVersion: version, downloadUrl, notes: `Traffic Cloud ${version}` }, null, 2)}\n`,
  'utf8'
)
console.log('[desktop] wrote', latestJsonPath)

copyFileSync(src, stagedExe)

function runGh(args) {
  const r = spawnSync('gh', args, { stdio: 'inherit', windowsHide: true })
  if (r.status !== 0) {
    throw new Error(`gh ${args.join(' ')} failed (${r.status ?? 'unknown'})`)
  }
}

try {
  runGh(['release', 'view', tag, '--repo', GITHUB_REPO])
  runGh(['release', 'upload', tag, '--repo', GITHUB_REPO, '--clobber', stagedExe])
  console.log('[desktop] uploaded asset →', downloadUrl)
} catch {
  runGh([
    'release',
    'create',
    tag,
    '--repo',
    GITHUB_REPO,
    '--title',
    `Traffic Cloud ${version}`,
    '--notes',
    `Traffic Cloud desktop ${version}`,
    stagedExe
  ])
  console.log('[desktop] created release →', downloadUrl)
}

try {
  if (existsSync(stagedExe)) unlinkSync(stagedExe)
} catch {
  /* ignore */
}
