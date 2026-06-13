import { ArrowUpCircle, Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesktopUpdate } from '@/hooks/useDesktopUpdate'

export function DesktopUpdateBanner(): JSX.Element | null {
  const { loading, updateAvailable, latestVersion, currentVersion, openUpdate, inAppUpdate } =
    useDesktopUpdate()
  const [dismissed, setDismissed] = useState(false)

  if (loading || !updateAvailable || !latestVersion || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="fixed inset-x-0 top-0 z-[190] flex justify-center px-4 pt-3"
      >
        <div className="flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-cyan-400/25 bg-[#0a0f18]/95 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-200">
            <ArrowUpCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">
              Доступне оновлення Traffic Cloud
            </p>
            <p className="text-[12px] text-zinc-500">
              {currentVersion ? `v${currentVersion} → v${latestVersion}` : `v${latestVersion}`}
              {inAppUpdate ? ' · встановлення в один клік' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void openUpdate()}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-cyan-400/35 bg-cyan-500/15 px-4 py-2 text-[13px] font-semibold text-cyan-100 transition-colors hover:border-cyan-400/55"
          >
            {inAppUpdate ? 'Оновити зараз' : 'Завантажити'}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="shrink-0 cursor-pointer rounded-lg p-1.5 text-zinc-500 transition-colors hover:text-zinc-300"
            aria-label="Закрити"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function DesktopUpdateBannerSkeleton(): JSX.Element {
  return (
    <div className="fixed inset-x-0 top-0 z-[190] flex justify-center px-4 pt-3">
      <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-black/40 px-4 py-2 text-[12px] text-zinc-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Перевірка оновлень…
      </div>
    </div>
  )
}
