import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

const CORE_BASE = `${import.meta.env.BASE_URL}ffmpeg`

let ffmpeg: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null
let preloadScheduled = false

export type FfmpegLoadProgress = {
  phase: 'download' | 'ready'
  message: string
}

export function formatFfmpegLoadError(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error)
  if (
    msg.includes('Content Security') ||
    msg.includes('WebAssembly') ||
    msg.includes('unsafe-eval') ||
    msg.includes('Aborted')
  ) {
    return 'Браузер заблокував відео-движок. Оновіть сторінку (Ctrl+Shift+R) або відкрийте в Chrome / Edge останньої версії.'
  }
  if (msg.includes('404') || msg.includes('Failed to fetch')) {
    return 'Не вдалося завантажити відео-движок. Спробуйте оновити сторінку — якщо не допоможе, напишіть у підтримку.'
  }
  return msg
}

/** Дати браузеру намалювати UI перед важким завантаженням WASM. */
export function yieldToPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

export function preloadFfmpeg(): void {
  if (ffmpeg?.loaded || loadPromise || preloadScheduled) return
  preloadScheduled = true
  const start = () => void loadFfmpeg().catch(() => {})
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => start(), { timeout: 4000 })
  } else {
    setTimeout(start, 1200)
  }
}

export async function loadFfmpeg(
  onStatus?: (p: FfmpegLoadProgress) => void
): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    onStatus?.({ phase: 'download', message: 'Підготовка обробника…' })
    await yieldToPaint()
    const instance = new FFmpeg()
    await instance.load({
      coreURL: `${CORE_BASE}/ffmpeg-core.js`,
      wasmURL: `${CORE_BASE}/ffmpeg-core.wasm`
    })
    ffmpeg = instance
    onStatus?.({ phase: 'ready', message: 'Готово' })
    return instance
  })().catch((error) => {
    loadPromise = null
    throw new Error(formatFfmpegLoadError(error))
  })

  return loadPromise
}

export async function writeInputFile(ffmpeg: FFmpeg, file: File): Promise<string> {
  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'mp4'
  const inputName = `input.${ext}`
  await ffmpeg.writeFile(inputName, await fetchFile(file))
  return inputName
}

export async function readOutputBlob(ffmpeg: FFmpeg, outputName: string): Promise<Blob> {
  const data = await ffmpeg.readFile(outputName)
  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data))
  return new Blob([bytes], { type: 'video/mp4' })
}

export async function cleanupFiles(ffmpeg: FFmpeg, names: string[]): Promise<void> {
  for (const name of names) {
    try {
      await ffmpeg.deleteFile(name)
    } catch {
      /* ignore */
    }
  }
}
