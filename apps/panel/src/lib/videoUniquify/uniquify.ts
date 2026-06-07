import type { FFmpeg } from '@ffmpeg/ffmpeg'

export type UniquifyPreset = 'tiktok' | 'reels'
export type UniquifyStrength = 'light' | 'medium' | 'hard'

const PRESET_SIZE: Record<UniquifyPreset, { w: number; h: number }> = {
  tiktok: { w: 1080, h: 1920 },
  reels: { w: 1080, h: 1920 }
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function strengthMul(strength: UniquifyStrength): number {
  if (strength === 'light') return 1
  if (strength === 'hard') return 3
  return 2
}

function buildVideoFilter(preset: UniquifyPreset, strength: UniquifyStrength): string {
  const m = strengthMul(strength)
  const { w, h } = PRESET_SIZE[preset]
  const cropPct = 1 - rand(0.004 * m, 0.018 * m)
  const br = rand(-0.025 * m, 0.025 * m)
  const ct = 1 + rand(-0.035 * m, 0.035 * m)
  const sat = 1 + rand(-0.06 * m, 0.06 * m)
  const hue = rand(-2.5 * m, 2.5 * m)
  const parts = [
    `crop=iw*${cropPct.toFixed(4)}:ih*${cropPct.toFixed(4)}`,
    `scale=${w}:${h}:force_original_aspect_ratio=increase`,
    `crop=${w}:${h}`,
    `eq=brightness=${br.toFixed(3)}:contrast=${ct.toFixed(3)}:saturation=${sat.toFixed(3)}`
  ]
  if (Math.abs(hue) > 0.4) parts.push(`hue=h=${hue.toFixed(1)}`)
  return parts.join(',')
}

function buildAudioFilter(strength: UniquifyStrength): string {
  const m = strengthMul(strength)
  const tempo = rand(0.985 - 0.005 * m, 1.015 + 0.005 * m)
  const t = Math.min(2, Math.max(0.5, tempo))
  return `atempo=${t.toFixed(4)}`
}

export async function renderUniquifiedCopy(params: {
  ffmpeg: FFmpeg
  inputName: string
  outputName: string
  preset: UniquifyPreset
  strength: UniquifyStrength
  onProgress?: (ratio: number) => void
}): Promise<void> {
  const { ffmpeg, inputName, outputName, preset, strength, onProgress } = params
  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.(Math.min(1, Math.max(0, progress)))
  }
  ffmpeg.on('progress', progressHandler)
  try {
    await ffmpeg.exec([
      '-i',
      inputName,
      '-vf',
      buildVideoFilter(preset, strength),
      '-af',
      buildAudioFilter(strength),
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '23',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-map_metadata',
      '-1',
      '-movflags',
      '+faststart',
      '-y',
      outputName
    ])
  } finally {
    ffmpeg.off('progress', progressHandler)
  }
}

export function outputFileName(index: number): string {
  return `unique_${String(index + 1).padStart(2, '0')}.mp4`
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
