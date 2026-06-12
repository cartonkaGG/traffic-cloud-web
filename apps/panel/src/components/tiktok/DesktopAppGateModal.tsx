import { useState } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { DesktopInstallCard } from '@/components/desktop/DesktopInstallCard'
import { useDesktopUpdate } from '@/hooks/useDesktopUpdate'
import {
  canOpenAntidetectBrowser,
  isTrafficCloudShell,
  launchTrafficCloudDesktop
} from '@/lib/desktopAppGate'
import { startInAppDesktopUpdate } from '@/lib/desktopUpdateRunner'

export function DesktopAppGateModal({
  open,
  onClose,
  onContinueInDesktop,
  downloadUrl,
  forceUpdate = false
}: {
  open: boolean
  onClose: () => void
  onContinueInDesktop?: () => void
  downloadUrl?: string | null
  forceUpdate?: boolean
}): JSX.Element | null {
  const desktopUpdate = useDesktopUpdate()
  const [downloadBusy, setDownloadBusy] = useState(false)

  const inShell = isTrafficCloudShell()
  const needsUpdate = forceUpdate || (inShell && !canOpenAntidetectBrowser()) || desktopUpdate.updateAvailable

  const latestVersion = desktopUpdate.latestVersion ?? '0.2.6'
  const resolvedUrl = downloadUrl ?? desktopUpdate.downloadUrl

  const handleDownload = (): void => {
    setDownloadBusy(true)
    void startInAppDesktopUpdate(resolvedUrl).finally(() => {
      window.setTimeout(() => setDownloadBusy(false), 1200)
    })
  }

  const handleOpenInApp = (): void => {
    launchTrafficCloudDesktop('tiktok')
    onContinueInDesktop?.()
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-black/75 backdrop-blur-md"
            aria-label="Закрити"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-lg"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="desktop-gate-title"
          >
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gray-950/90 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-fuchsia-500/10 via-cyan-500/5 to-transparent"
                aria-hidden
              />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 z-10 cursor-pointer rounded-lg border border-white/10 bg-black/40 p-1.5 text-zinc-500 transition-colors duration-200 hover:text-zinc-200"
                aria-label="Закрити"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative p-6 pt-7">
                <p
                  id="desktop-gate-title"
                  className="text-[10px] font-semibold uppercase tracking-[0.22em] text-fuchsia-400/80"
                >
                  Traffic Cloud Desktop
                </p>
                <h2 className="mt-2 pr-10 text-xl font-bold tracking-tight text-white">
                  {needsUpdate ? 'Оновлення для TikTok Warmup' : 'Десктоп для TikTok Warmup'}
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
                  {needsUpdate
                    ? 'Автореєстрація та прогрів потребують актуального антидетект-браузера в Electron.'
                    : 'Автореєстрація, тимчасова пошта, автозаповнення форм і прогрів — лише в десктоп-додатку.'}
                </p>

                <div className="mt-5">
                  <DesktopInstallCard
                    variant={needsUpdate ? 'update' : 'install'}
                    latestVersion={latestVersion}
                    currentVersion={desktopUpdate.currentVersion}
                    onPrimary={handleDownload}
                    onSecondary={needsUpdate ? undefined : handleOpenInApp}
                    primaryBusy={downloadBusy}
                    inAppUpdate={desktopUpdate.inAppUpdate}
                  />
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 w-full cursor-pointer rounded-xl border border-white/[0.06] py-2.5 text-sm text-zinc-500 transition-colors duration-200 hover:border-white/12 hover:text-zinc-300"
                >
                  Скасувати
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
