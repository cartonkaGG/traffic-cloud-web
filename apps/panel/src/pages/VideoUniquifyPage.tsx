import { useCallback, useRef, useState, type DragEvent } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Clapperboard,
  Download,
  Film,
  Layers,
  Loader2,
  Shield,
  Sparkles,
  Upload
} from 'lucide-react'
import { VideoUniquifyAmbient } from '@/components/videoUniquify/VideoUniquifyAmbient'
import {
  cleanupFiles,
  loadFfmpeg,
  readOutputBlob,
  writeInputFile,
  type FfmpegLoadProgress
} from '@/lib/videoUniquify/ffmpegClient'
import { downloadBlob, outputFileName, renderUniquifiedCopy } from '@/lib/videoUniquify/uniquify'

type ResultItem = {
  id: string
  name: string
  blob: Blob
  sizeMb: number
}

const MAX_COPIES = 20
const MAX_FILE_MB = 250

const SPECS = [
  { icon: Shield, label: 'Локально у браузері' },
  { icon: Layers, label: '9:16 · 1080×1920' },
  { icon: Sparkles, label: 'Pro унікалізація' }
] as const

export function VideoUniquifyPage(): JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [copies, setCopies] = useState(5)
  const [ffmpegReady, setFfmpegReady] = useState(false)
  const [loadStatus, setLoadStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
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
      setError(`Файл завеликий (${mb.toFixed(0)} MB). Максимум ${MAX_FILE_MB} MB.`)
      return
    }
    setFile(picked)
  }, [])

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (busy) return
      const picked = e.dataTransfer.files?.[0] ?? null
      onPickFile(picked)
    },
    [busy, onPickFile]
  )

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
        setProgressLabel(`Копія ${i + 1} з ${copies}`)
        setProgressPct(Math.round((i / copies) * 100))
        await renderUniquifiedCopy({
          ffmpeg,
          inputName,
          outputName,
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
  }, [busy, copies, ensureFfmpeg, ffmpegReady, file])

  return (
    <div className="relative min-h-full px-6 pb-12 pt-6 sm:px-8">
      <VideoUniquifyAmbient />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] via-gray-950/40 to-transparent p-6 sm:p-8"
        >
          <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-25" aria-hidden />
          <div className="relative flex flex-wrap items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 shadow-[0_0_40px_-12px_rgba(94,200,255,0.5)]">
              <Clapperboard className="h-7 w-7 text-accent neon-cloud-icon" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent/80">
                Traffic Cloud Studio
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="text-gradient">Унікалізація відео</span>
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
                Одне відео — десятки унікальних копій. Обробка на вашому ПК, без завантаження на
                сервер. Кожна версія з новим кропом, кольором, темпом і метаданими.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SPECS.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/30 px-3 py-1 text-[11px] font-medium text-zinc-400"
                  >
                    <Icon className="h-3 w-3 text-accent/80" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-5">
            <div className="glass-panel-strong p-5 sm:p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Вихідне відео
              </div>
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
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={[
                  'mt-4 flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-4 py-12 text-center transition-all duration-300',
                  dragOver ? 'vu-dropzone-active' : 'border-white/12 bg-black/25 hover:border-accent/30 hover:bg-accent/[0.04]',
                  busy ? 'opacity-50' : ''
                ].join(' ')}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
                  <Upload className="h-6 w-6 text-accent" />
                </div>
                <span className="text-sm font-medium text-zinc-200">
                  {file ? file.name : 'Перетягніть відео або натисніть'}
                </span>
                <span className="text-[12px] text-zinc-500">
                  {file
                    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                    : `MP4 · MOV · WebM · до ${MAX_FILE_MB} MB`}
                </span>
              </button>
            </div>

            <div className="glass-panel-strong p-5 sm:p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Кількість копій
                  </div>
                  <p className="mt-1 text-[12px] text-zinc-600">Кожна — унікальний набір змін</p>
                </div>
                <div className="font-mono text-3xl font-bold tabular-nums text-accent">{copies}</div>
              </div>
              <input
                type="range"
                min={1}
                max={MAX_COPIES}
                value={copies}
                disabled={busy}
                onChange={(e) => setCopies(Number(e.target.value))}
                className="vu-range mt-5 w-full"
              />
              <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
                <span>1</span>
                <span>{MAX_COPIES}</span>
              </div>
            </div>

            {!ffmpegReady ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void ensureFfmpeg()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300 transition-colors hover:border-accent/25"
              >
                {loadStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                ) : (
                  <Film className="h-4 w-4 text-accent/80" />
                )}
                {loadStatus ?? 'Підготувати движок (~30 MB)'}
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.08] px-4 py-3 text-[13px] text-emerald-200/90">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Движок готовий до роботи
              </div>
            )}

            <motion.button
              type="button"
              whileHover={{ scale: busy || !file ? 1 : 1.01 }}
              whileTap={{ scale: busy || !file ? 1 : 0.99 }}
              disabled={!file || busy}
              onClick={() => void run()}
              className="vu-cta flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-bold uppercase tracking-wide text-white transition-shadow disabled:opacity-40"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {busy ? 'Обробка…' : `Створити ${copies} копій`}
            </motion.button>

            {error ? (
              <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200/90">
                {error}
              </p>
            ) : null}
          </div>

          <div className="lg:col-span-7">
            <div className="glass-panel-strong min-h-[420px] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Результат
                </div>
                {results.length > 0 ? (
                  <span className="rounded-full border border-accent/25 bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-accent">
                    {results.length} файлів
                  </span>
                ) : null}
              </div>

              {busy ? (
                <div className="mt-10 space-y-5">
                  <p className="text-sm text-zinc-300">{progressLabel}</p>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.25 }}
                    />
                  </div>
                  <p className="text-[12px] leading-relaxed text-zinc-600">
                    Не закривайте вкладку. Тривалість залежить від довжини ролика та потужності ПК.
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="mt-20 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                    <Film className="h-8 w-8 text-zinc-600" />
                  </div>
                  <p className="text-sm font-medium text-zinc-400">Копії зʼявляться тут</p>
                  <p className="mt-1 max-w-xs text-[12px] text-zinc-600">
                    Завантажте відео зліва і запустіть унікалізацію
                  </p>
                </div>
              ) : (
                <ul className="mt-5 space-y-2">
                  {results.map((r, idx) => (
                    <motion.li
                      key={r.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 transition-colors hover:border-accent/20 hover:bg-accent/[0.04]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 font-mono text-[11px] font-bold text-accent">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-zinc-100">{r.name}</div>
                          <div className="text-[11px] text-zinc-500">{r.sizeMb.toFixed(1)} MB</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadBlob(r.blob, r.name)}
                        className="flex shrink-0 items-center gap-1.5 rounded-xl border border-accent/25 bg-accent/10 px-3.5 py-2 text-[12px] font-semibold text-accent transition-colors hover:bg-accent/20 group-hover:text-cyan-100"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Скачати
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
