import { ArrowUpCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useDesktopUpdate } from '@/hooks/useDesktopUpdate'

export function DesktopUpdatePill(): JSX.Element | null {
  const { loading, updateAvailable, latestVersion, currentVersion, openUpdate, inAppUpdate } =
    useDesktopUpdate()

  if (loading || !updateAvailable || !latestVersion) return null

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => void openUpdate()}
      className="group inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-500/15 to-fuchsia-500/10 px-3.5 py-1.5 text-[12px] font-medium text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)] transition-all duration-200 hover:border-cyan-400/50 hover:shadow-[0_0_32px_rgba(34,211,238,0.2)]"
      title={
        currentVersion
          ? `Оновити з ${currentVersion} до ${latestVersion}`
          : `Доступна версія ${latestVersion}`
      }
    >
      <ArrowUpCircle className="h-3.5 w-3.5 text-cyan-300 transition-transform duration-200 group-hover:scale-110" />
      <span>{inAppUpdate ? 'Оновити зараз' : 'Оновити'} · v{latestVersion}</span>
    </motion.button>
  )
}

export function DesktopUpdatePillSkeleton(): JSX.Element {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/5 px-3 py-1.5 text-[12px] text-zinc-600">
      <Loader2 className="h-3 w-3 animate-spin" />
    </span>
  )
}
