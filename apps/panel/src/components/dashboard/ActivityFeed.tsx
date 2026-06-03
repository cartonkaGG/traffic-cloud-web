import { Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ActivityEntry } from '@/data/mocks'
import { GlassCard } from '@/components/ui/GlassCard'

function toneClass(tone: ActivityEntry['tone']): string {
  if (tone === 'ok') return 'bg-emerald-400/15 text-emerald-200'
  if (tone === 'warn') return 'bg-amber-400/15 text-amber-200'
  return 'bg-white/5 text-zinc-300'
}

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }): JSX.Element {
  return (
    <GlassCard className="p-0">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent" aria-hidden />
          <div className="text-sm font-semibold text-white">Живая лента событий</div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
          Live
        </div>
      </div>
      <div className="max-h-[340px] divide-y divide-white/[0.06] overflow-auto px-2 py-2">
        {entries.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex gap-4 rounded-xl px-4 py-3 hover:bg-white/[0.03]"
          >
            <div className="w-12 shrink-0 pt-0.5 font-mono text-[11px] text-zinc-500">{e.time}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-medium text-zinc-100">{e.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${toneClass(e.tone)}`}
                >
                  {e.tone === 'ok' ? 'ok' : e.tone === 'warn' ? 'warn' : 'info'}
                </span>
              </div>
              <div className="mt-1 text-[13px] leading-relaxed text-zinc-500">{e.detail}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}
