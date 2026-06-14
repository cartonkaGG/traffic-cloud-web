/**
 * Favicon: велика неонова хмара на прозорому фоні (panel + marketing).
 */
import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const monoIcon = join(root, '..', 'cloudetrafiiick', 'src/renderer/public/cloud-icon.png')

const CLOUD_PATH =
  'M 60,130 H 240 C 265,130 280,112 280,90 C 280,68 262,52 235,52 C 230,52 224,53 218,55 C 205,33 182,18 155,18 C 122,18 95,39 90,67 C 84,64 78,63 72,63 C 49,63 35,79 35,98 C 35,118 48,130 60,130 Z'

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <filter id="glowOuter" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="14" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="glowInner" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <g transform="translate(32 118) scale(2.05)" filter="url(#glowOuter)">
    <path d="${CLOUD_PATH}" fill="none" stroke="#22d3ee" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
    <path d="${CLOUD_PATH}" fill="none" stroke="#67e8f9" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" filter="url(#glowInner)"/>
    <path d="${CLOUD_PATH}" fill="none" stroke="#f0fdff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`

const targets = [
  join(root, 'apps/panel/public/cloud-icon.png'),
  join(root, 'apps/marketing/public/cloud-icon.png')
]

async function writeIcon(dest) {
  await mkdir(dirname(dest), { recursive: true })
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(dest)
}

try {
  const { access } = await import('node:fs/promises')
  await access(monoIcon)
  for (const t of targets) {
    await mkdir(dirname(t), { recursive: true })
    await copyFile(monoIcon, t)
  }
  console.log('[web] synced cloud-icon from desktop')
} catch {
  for (const t of targets) {
    await writeIcon(t)
    console.log('[web] wrote', t)
  }
}
