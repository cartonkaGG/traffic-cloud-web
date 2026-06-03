import { motion } from 'framer-motion'
import type { StatItem } from '@/data/mocks'

export function StatCard({
  item,
  index
}: {
  item: StatItem
  index: number
}): JSX.Element {
  const Icon = item.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel group relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-3xl transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            {item.label}
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{item.value}</div>
          <div
            className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
              item.positive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/5 text-zinc-400'
            }`}
          >
            {item.delta}
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-accent shadow-inner">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </motion.div>
  )
}
