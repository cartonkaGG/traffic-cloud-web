import { Download, Monitor, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { launchTrafficCloudDesktop, resolveDesktopDownloadUrl } from '@/lib/desktopAppGate'

export function DesktopAppGateModal({
  open,
  onClose,
  onContinueInDesktop,
  downloadUrl
}: {
  open: boolean
  onClose: () => void
  onContinueInDesktop?: () => void
  downloadUrl?: string | null
}): JSX.Element | null {
  if (!open) return null

  const effectiveDownloadUrl = resolveDesktopDownloadUrl(downloadUrl)

  const openDownload = (): void => {
    window.open(effectiveDownloadUrl, '_blank', 'noopener,noreferrer')
  }

  const openInDesktop = (): void => {
    launchTrafficCloudDesktop('tiktok')
    onContinueInDesktop?.()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <GlassCard className="relative w-full max-w-md p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 hover:text-zinc-200"
          aria-label="Закрити"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 text-fuchsia-300">
          <Monitor className="h-5 w-5" />
          <h2 className="pr-8 text-lg font-semibold text-white">
            TikTok Warmup працює лише в десктоп-додатку
          </h2>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-zinc-500">
          Автореєстрація та прогрів TikTok потребують антидетект-браузера Electron у додатку Traffic
          Cloud. У звичайному браузері ці дії недоступні — немає автозаповнення форм, тимчасової
          пошти та керування профілем.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={openDownload}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-100"
          >
            <Download className="h-4 w-4" />
            Завантажити додаток
          </button>
          <button
            type="button"
            onClick={openInDesktop}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-100"
          >
            <Monitor className="h-4 w-4" />
            Відкрити в додатку
          </button>
        </div>
        <p className="mt-4 text-[11px] text-zinc-600">
          Спочатку встановіть додаток кнопкою «Завантажити». Якщо вже встановлено — «Відкрити в
          додатку» запустить Traffic Cloud і відкриє TikTok Warmup у вікні програми.
        </p>
      </GlassCard>
    </div>
  )
}
