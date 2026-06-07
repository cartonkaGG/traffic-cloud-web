import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const CORE_VERSION = '0.12.10'
const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`

let ffmpeg: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null

export type FfmpegLoadProgress = {
  phase: 'download' | 'ready'
  message: string
}

export async function loadFfmpeg(
  onStatus?: (p: FfmpegLoadProgress) => void
): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg
  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    onStatus?.({ phase: 'download', message: 'Завантаження FFmpeg…' })
    const instance = new FFmpeg()
    await instance.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm')
    })
    ffmpeg = instance
    onStatus?.({ phase: 'ready', message: 'FFmpeg готовий' })
    return instance
  })()

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
