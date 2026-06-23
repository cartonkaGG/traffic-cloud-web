import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { AffiliateLinkStat } from '@/lib/api'

type Props = {
  rows: AffiliateLinkStat[]
  selectedLinkId: string
  onSelectLink: (linkId: string) => void
  showOffer?: boolean
}

function usd(n: number): string {
  return `$${n.toFixed(2)}`
}

const METHOD_COLORS = [
  'from-sky-500/20 to-cyan-500/5 border-sky-400/20 text-sky-200',
  'from-violet-500/20 to-purple-500/5 border-violet-400/20 text-violet-200',
  'from-amber-500/20 to-orange-500/5 border-amber-400/20 text-amber-200',
  'from-emerald-500/20 to-teal-500/5 border-emerald-400/20 text-emerald-200',
  'from-rose-500/20 to-pink-500/5 border-rose-400/20 text-rose-200'
]

export function AffiliateLinkBreakdown({
  rows,
  selectedLinkId,
  onSelectLink,
  showOffer = false
}: Props): JSX.Element {
  const maxJoins = Math.max(1, ...rows.map((r) => r.joins))

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-8 text-center text-sm text-zinc-600">
        Немає даних за обраний період. Створіть посилання на вкладці «Офери».
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {rows.map((row, i) => {
        const active = selectedLinkId === row.linkId
        const color = METHOD_COLORS[i % METHOD_COLORS.length]
        const pct = Math.round((row.joins / maxJoins) * 100)
        return (
          <motion.button
            key={row.linkId}
            type="button"
            layout
            onClick={() => onSelectLink(active ? '' : row.linkId)}
            className={[
              'group flex w-full cursor-pointer items-center gap-4 rounded-2xl border bg-gradient-to-r p-4 text-left transition-all',
              color,
              active ? 'ring-1 ring-white/20' : 'hover:brightness-110'
            ].join(' ')}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-semibold">{row.label}</span>
                {showOffer && row.offerTitle ? (
                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] text-zinc-400">
                    {row.offerTitle}
                  </span>
                ) : null}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/30">
                <motion.div
                  className="h-full rounded-full bg-white/30"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-zinc-400">
                <span className="text-cyan-300/90">+{row.joins} підп.</span>
                {row.leaves > 0 ? <span className="text-rose-300/90">−{row.leaves} відп.</span> : null}
                <span>{row.activeJoins} активних</span>
                <span className="text-emerald-300/90">+{usd(row.earnedUsd)}</span>
                {(row.lostUsd ?? 0) > 0 ? (
                  <span className="text-rose-300/90">−{usd(row.lostUsd ?? 0)}</span>
                ) : null}
                <span className="text-white/80">
                  чистий {usd(row.earnedUsd - (row.lostUsd ?? 0))}
                </span>
              </div>
            </div>
            <ChevronRight
              className={[
                'h-4 w-4 shrink-0 transition-transform',
                active ? 'rotate-90 text-white' : 'text-zinc-500 group-hover:text-zinc-300'
              ].join(' ')}
            />
          </motion.button>
        )
      })}
    </div>
  )
}
