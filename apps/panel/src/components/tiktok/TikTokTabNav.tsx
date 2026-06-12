import { Flame, Plus, Users } from 'lucide-react'
import { motion } from 'framer-motion'

export type TikTokTabId = 'accounts' | 'create' | 'warmup'

const TABS: Array<{
  id: TikTokTabId
  label: string
  icon: typeof Users
}> = [
  { id: 'accounts', label: 'Акаунти', icon: Users },
  { id: 'create', label: 'Створити акаунт', icon: Plus },
  { id: 'warmup', label: 'Запустити прогрів', icon: Flame }
]

export function TikTokTabNav({
  active,
  onChange
}: {
  active: TikTokTabId
  onChange: (tab: TikTokTabId) => void
}): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-white/[0.08] bg-black/25 p-1.5">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              'relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'text-white'
                : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
            ].join(' ')}
          >
            {isActive ? (
              <motion.span
                layoutId="tiktok-tab-pill"
                className="absolute inset-0 rounded-xl border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500/20 to-violet-500/10 shadow-[0_0_24px_rgba(217,70,239,0.12)]"
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              />
            ) : null}
            <Icon
              className={`relative z-10 h-4 w-4 ${isActive ? 'text-fuchsia-300' : 'text-zinc-500'}`}
            />
            <span className="relative z-10">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
