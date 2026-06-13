import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Download, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import TrafficCloudMark from '@/components/brand/TrafficCloudMark'
import type { DesktopUpdatePhase, DesktopUpdateProgress } from '@/lib/desktopUpdate'
import { subscribeDesktopUpdateProgress } from '@/lib/desktopUpdateRunner'

const STEPS: Array<{ id: DesktopUpdatePhase; label: string }> = [
  { id: 'checking', label: 'Перевірка' },
  { id: 'downloading', label: 'Завантаження' },
  { id: 'installing', label: 'Встановлення' },
  { id: 'restarting', label: 'Перезапуск' }
]

function stepIndex(phase: DesktopUpdatePhase): number {
  if (phase === 'checking') return 0
  if (phase === 'downloading') return 1
  if (phase === 'installing') return 2
  if (phase === 'restarting') return 3
  return -1
}

function ProgressRing({ percent }: { percent: number }): JSX.Element {
  const r = 54
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c

  return (
    <div className="relative mx-auto h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#tc-update-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
        <defs>
          <linearGradient id="tc-update-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums text-white">{percent}%</span>
        <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          прогрес
        </span>
      </div>
    </div>
  )
}

export function DesktopUpdateOverlay(): JSX.Element | null {
  const [progress, setProgress] = useState<DesktopUpdateProgress | null>(null)

  useEffect(() => {
    return subscribeDesktopUpdateProgress((payload) => {
      if (payload.phase === 'idle' || payload.phase === 'uptodate') {
        setProgress(null)
        return
      }
      setProgress(payload)
    })
  }, [])

  useEffect(() => {
    if (!progress || progress.phase !== 'checking') return
    const timer = window.setTimeout(() => {
      setProgress({
        phase: 'error',
        currentVersion: progress.currentVersion,
        latestVersion: progress.latestVersion,
        message:
          'Сервер оновлень не відповідає. Закрийте вікно і завантажте інсталятор вручну з сайту.',
        error: 'update_check_timeout'
      })
    }, 25_000)
    return () => window.clearTimeout(timer)
  }, [progress])

  const visible = progress != null && progress.phase !== 'idle' && progress.phase !== 'uptodate'
  const activeStep = progress ? stepIndex(progress.phase) : -1
  const percent = useMemo(() => {
    if (!progress) return 0
    if (progress.phase === 'checking') return 8
    if (progress.phase === 'installing') return 96
    if (progress.phase === 'restarting') return 100
    return progress.percent ?? 0
  }, [progress])

  const PhaseIcon =
    progress?.phase === 'restarting'
      ? Sparkles
      : progress?.phase === 'installing'
        ? RefreshCw
        : progress?.phase === 'downloading'
          ? Download
          : Loader2

  return (
    <AnimatePresence>
      {visible && progress ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="alertdialog"
          aria-live="polite"
          aria-busy={progress.phase !== 'error'}
        >
          <div
            className="absolute inset-0 bg-[#030712]/85 backdrop-blur-xl"
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/4 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]"
            animate={{ opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute bottom-1/4 right-1/4 h-[320px] w-[420px] rounded-full bg-fuchsia-500/10 blur-[100px]"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />

          <motion.div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.1] bg-gray-950/90 shadow-[0_32px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-b border-white/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/15 to-fuchsia-500/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <TrafficCloudMark size={28} variant="auth" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                    Traffic Cloud Update
                  </p>
                  <h2 className="text-lg font-bold text-white">
                    {progress.phase === 'error' ? 'Помилка оновлення' : 'Оновлення програми'}
                  </h2>
                </div>
              </div>
              {progress.currentVersion && progress.latestVersion ? (
                <p className="mt-3 font-mono text-[12px] text-zinc-500">
                  v{progress.currentVersion} → v{progress.latestVersion}
                </p>
              ) : null}
            </div>

            <div className="px-6 py-6">
              {progress.phase === 'error' ? (
                <div className="rounded-xl border border-red-400/20 bg-red-500/5 px-4 py-3 text-[13px] text-red-200/90">
                  {progress.message ?? progress.error ?? 'Спробуйте ще раз пізніше'}
                </div>
              ) : (
                <>
                  <ProgressRing percent={percent} />
                  <div className="mt-5 flex items-center justify-center gap-2 text-sm text-zinc-300">
                    <PhaseIcon
                      className={`h-4 w-4 text-cyan-300 ${progress.phase === 'checking' || progress.phase === 'installing' ? 'animate-spin' : ''}`}
                    />
                    <span>{progress.message ?? 'Оновлення…'}</span>
                  </div>
                </>
              )}

              <div className="mt-6 grid grid-cols-4 gap-1">
                {STEPS.map((step, i) => {
                  const done = activeStep > i
                  const active = activeStep === i
                  return (
                    <div key={step.id} className="text-center">
                      <div
                        className={[
                          'mx-auto flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold transition-colors duration-200',
                          done
                            ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                            : active
                              ? 'border-cyan-400/35 bg-cyan-500/15 text-cyan-100'
                              : 'border-white/10 bg-white/[0.02] text-zinc-600'
                        ].join(' ')}
                      >
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                      </div>
                      <p
                        className={`mt-1.5 text-[9px] uppercase tracking-[0.1em] ${active ? 'text-cyan-200/90' : 'text-zinc-600'}`}
                      >
                        {step.label}
                      </p>
                    </div>
                  )
                })}
              </div>

              {progress.phase !== 'error' ? (
                <p className="mt-5 text-center text-[11px] leading-relaxed text-zinc-600">
                  Файли замінюються автоматично. Не закривайте вікно — програма перезапуститься
                  сама.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setProgress(null)}
                  className="mt-4 w-full cursor-pointer rounded-xl border border-white/10 py-2.5 text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  Закрити
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
