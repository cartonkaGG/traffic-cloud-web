import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Clapperboard,
  Download,
  Film,
  Loader2,
  Sparkles,
  Upload,
  Zap
} from 'lucide-react'
import {
  cleanupFiles,
  loadFfmpeg,
  readOutputBlob,
  writeInputFile,
  type FfmpegLoadProgress
} from '@/lib/videoUniquify/ffmpegClient'
import {
  downloadBlob,
  outputFileName,
  renderUniquifiedCopy,
  type UniquifyPreset,
  type UniquifyStrength
} from '@/lib/videoUniquify/uniquify'

type ResultItem = {
  id: string
  name: string
  blob: Blob
  sizeMb: number
}

const MAX_COPIES = 20
const MAX_FILE_MB = 250

export function VideoUniquifyPage(): JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [preset, setPreset] = useState<UniquifyPreset>('tiktok')
  const [strength, setStrength] = useState<UniquifyStrength>('medium')
  const [copies, setCopies] = useState(5)
  const [ffmpegReady, setFfmpegReady] = useState(false)
  const [loadStatus, setLoadStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progressLabel, setProgressLabel] = useState<string | null>(null)
  const [progressPct, setProgressPct] = useState(0)
  const [results, setResults] = useState<ResultItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const ensureFfmpeg = useCallback(async () => {
    setLoadStatus('Завантаження движка…')
    await loadFfmpeg((p: FfmpegLoadProgress) => setLoadStatus(p.message))
    setFfmpegReady(true)
    setLoadStatus(null)
  }, [])

  const onPickFile = useCallback((picked: File | null) => {
    setError(null)
    setResults([])
    if (!picked) {
      setFile(null)
      return
    }
    if (!picked.type.startsWith('video/')) {
      setError('Оберіть відеофайл (MP4, MOV, WebM…)')
      return
    }
    const mb = picked.size / (1024 * 1024)
    if (mb > MAX_FILE_MB) {
      setError(`Файл завеликий (${mb.toFixed(0)} MB). Максимум ${MAX_FILE_MB} MB у браузері.`)
      return
    }
    setFile(picked)
  }, [])

  const run = useCallback(async () => {
    if (!file || busy) return
    setBusy(true)
    setError(null)
    setResults([])
    setProgressPct(0)
    setProgressLabel('Підготовка…')
    try {
      if (!ffmpegReady) await ensureFfmpeg()
      const ffmpeg = await loadFfmpeg()
      const inputName = await writeInputFile(ffmpeg, file)
      const out: ResultItem[] = []
      const tempNames = [inputName]

      for (let i = 0; i < copies; i++) {
        const outputName = outputFileName(i)
        tempNames.push(outputName)
        setProgressLabel(`Копія ${i + 1} з ${copies}…`)
        setProgressPct(Math.round((i / copies) * 100))
        await renderUniquifiedCopy({
          ffmpeg,
          inputName,
          outputName,
          preset,
          strength,
          onProgress: (r) => {
            setProgressPct(Math.round(((i + r) / copies) * 100))
          }
        })
        const blob = await readOutputBlob(ffmpeg, outputName)
        out.push({
          id: `${Date.now()}-${i}`,
          name: outputFileName(i),
          blob,
          sizeMb: blob.size / (1024 * 1024)
        })
      }

      await cleanupFiles(ffmpeg, tempNames)
      setResults(out)
      setProgressLabel('Готово')
      setProgressPct(100)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }, [busy, copies, ensureFfmpeg, ffmpegReady, file, preset, strength])

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="rounded-3xl border border-rose-400/15 bg-gradient-to-br from-rose-500/[0.08] to-transparent p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-400/25 bg-rose-500/10">
            <Clapperboard className="h-6 w-6 text-rose-200" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-white">Унікалізатор для TikTok та Reels</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Обробка повністю у браузері — файл не завантажується на сервер. Кожна копія отримує
              випадковий кроп, колір, швидкість і нові метадані.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-5">
            <div className="text-sm font-semibold text-white">Відео</div>
            <input
              ref={inputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="mt-4 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center transition-colors hover:border-rose-400/30 hover:bg-rose-500/[0.04] disabled:opacity-50"
            >
              <Upload className="h-8 w-8 text-rose-300/80" />
              <span className="text-sm text-zinc-300">
                {file ? file.name : 'Натисніть або перетягніть відео'}
              </span>
              {file ? (
                <span className="text-[12px] text-zinc-500">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              ) : (
                <span className="text-[12px] text-zinc-600">MP4 · MOV · до {MAX_FILE_MB} MB</span>
              )}
            </button>
          </div>

          <div className="glass-panel space-y-4 p-5">
            <div className="text-sm font-semibold text-white">Налаштування</div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Платформа
              </div>
              <div className="mt-2 flex gap-2">
                {(['tiktok', 'reels'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    disabled={busy}
                    onClick={() => setPreset(p)}
                    className={[
                      'flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                      preset === p
                        ? 'border-rose-400/35 bg-rose-500/15 text-rose-100'
                        : 'border-white/10 text-zinc-400 hover:text-zinc-200'
                    ].join(' ')}
                  >
                    {p === 'tiktok' ? 'TikTok' : 'Reels'}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-zinc-600">9:16 · 1080×1920</p>
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Сила унікалізації
              </div>
              <div className="mt-2 flex gap-2">
                {(['light', 'medium', 'hard'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={busy}
                    onClick={() => setStrength(s)}
                    className={[
                      'flex-1 rounded-xl border px-2 py-2 text-[12px] font-medium transition-colors',
                      strength === s
                        ? 'border-rose-400/35 bg-rose-500/15 text-rose-100'
                        : 'border-white/10 text-zinc-400 hover:text-zinc-200'
                    ].join(' ')}
                  >
                    {s === 'light' ? 'Легка' : s === 'medium' ? 'Середня' : 'Сильна'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                <span>Копій</span>
                <span className="font-mono text-rose-200/90">{copies}</span>
              </div>
              <input
                type="range"
                min={1}
                max={MAX_COPIES}
                value={copies}
                disabled={busy}
                onChange={(e) => setCopies(Number(e.target.value))}
                className="mt-3 w-full accent-rose-400"
              />
            </div>
          </div>

          {!ffmpegReady ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              disabled={busy}
              onClick={() => void ensureFfmpeg()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-300 hover:border-rose-400/25"
            >
              {loadStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
              {loadStatus ?? 'Завантажити FFmpeg (~30 MB)'}
            </motion.button>
          ) : null}

          <motion.button
            type="button"
            whileHover={{ scale: busy ? 1 : 1.01 }}
            whileTap={{ scale: busy ? 1 : 0.99 }}
            disabled={!file || busy}
            onClick={() => void run()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-600 px-4 py-3.5 text-sm font-bold text-white shadow-[0_8px_32px_-8px_rgba(251,113,133,0.55)] disabled:opacity-45"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {busy ? 'Обробка…' : `Створити ${copies} копій`}
          </motion.button>

          {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
        </div>

        <div className="lg:col-span-3">
          <div className="glass-panel min-h-[320px] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Zap className="h-4 w-4 text-rose-300" />
              Результат
            </div>

            {busy ? (
              <div className="mt-8 space-y-4">
                <p className="text-sm text-zinc-400">{progressLabel}</p>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.25 }}
                  />
                </div>
                <p className="text-[12px] text-zinc-600">
                  Не закривайте вкладку. Довгі ролики можуть оброблятись кілька хвилин.
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="mt-16 flex flex-col items-center text-center text-zinc-600">
                <Film className="mb-3 h-10 w-10 opacity-40" />
                <p className="text-sm">Тут зʼявляться унікальні копії</p>
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {results.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-zinc-200">{r.name}</div>
                      <div className="text-[11px] text-zinc-500">{r.sizeMb.toFixed(1)} MB</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadBlob(r.blob, r.name)}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-1.5 text-[12px] font-medium text-rose-100 hover:bg-rose-500/20"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Скачати
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
