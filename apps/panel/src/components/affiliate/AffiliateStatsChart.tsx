import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import type { AffiliateDailyStat } from '@/lib/api'

type Props = {
  daily: AffiliateDailyStat[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
}

function formatDayLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
}

function formatFullDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('uk-UA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

export function AffiliateStatsChart({ daily, selectedDate, onSelectDate }: Props): JSX.Element {
  const maxJoins = Math.max(1, ...daily.map((d) => d.joins + (d.leaves ?? 0)))
  const maxEarned = Math.max(0.01, ...daily.map((d) => d.earnedUsd))
  const selected = selectedDate ? daily.find((d) => d.date === selectedDate) ?? null : null

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0e14]/80 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Підписки / відписки
            </span>
            <span className="text-[10px] text-zinc-600">{daily.length} днів</span>
          </div>
          <div className="mt-5 flex h-32 items-end justify-between gap-1">
            {daily.map((d) => {
              const active = selectedDate === d.date
              return (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => onSelectDate(active ? null : d.date)}
                  className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-2 focus:outline-none"
                  aria-pressed={active}
                >
                  <div
                    className="flex w-full max-w-[2.25rem] flex-col items-stretch justify-end gap-0.5"
                    style={{ height: '100%' }}
                  >
                    <motion.div
                      layout
                      className={[
                        'w-full rounded-t-md bg-gradient-to-t from-cyan-500/25 to-cyan-400/80 transition-opacity',
                        active ? 'ring-1 ring-cyan-300/60' : 'group-hover:opacity-90'
                      ].join(' ')}
                      style={{ height: `${Math.max(6, (d.joins / maxJoins) * 72)}%` }}
                    />
                    {(d.leaves ?? 0) > 0 ? (
                      <motion.div
                        layout
                        className="w-full rounded-t-md bg-gradient-to-t from-rose-500/25 to-rose-400/70"
                        style={{ height: `${Math.max(4, ((d.leaves ?? 0) / maxJoins) * 72)}%` }}
                      />
                    ) : null}
                  </div>
                  <span
                    className={[
                      'text-[9px] font-medium transition-colors',
                      active ? 'text-cyan-300' : 'text-zinc-600 group-hover:text-zinc-400'
                    ].join(' ')}
                  >
                    {d.date.slice(8)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0a0e14]/80 p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Заробіток USD
          </div>
          <div className="mt-5 flex h-32 items-end justify-between gap-1">
            {daily.map((d) => {
              const active = selectedDate === d.date
              return (
                <button
                  key={`e-${d.date}`}
                  type="button"
                  onClick={() => onSelectDate(active ? null : d.date)}
                  className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-2 focus:outline-none"
                  aria-pressed={active}
                >
                  <motion.div
                    layout
                    className={[
                      'w-full max-w-[2.25rem] rounded-t-md bg-gradient-to-t from-emerald-500/25 to-emerald-400/80 transition-opacity',
                      active ? 'ring-1 ring-emerald-300/60' : 'group-hover:opacity-90'
                    ].join(' ')}
                    style={{ height: `${Math.max(6, (d.earnedUsd / maxEarned) * 100)}%` }}
                  />
                  <span
                    className={[
                      'text-[9px] font-medium transition-colors',
                      active ? 'text-emerald-300' : 'text-zinc-600 group-hover:text-zinc-400'
                    ].join(' ')}
                  >
                    {d.date.slice(8)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            key={selected.date}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <CalendarDays className="h-4 w-4 text-zinc-500" />
                  {formatFullDate(selected.date)}
                </div>
                <p className="mt-1 text-xs text-zinc-500">Деталі за обраний день</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectDate(null)}
                className="cursor-pointer rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Закрити
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
                  <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
                  Підписки
                </div>
                <div className="mt-1 text-2xl font-semibold text-cyan-200">+{selected.joins}</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
                  <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
                  Відписки
                </div>
                <div className="mt-1 text-2xl font-semibold text-rose-200">−{selected.leaves ?? 0}</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
                  <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                  Заробіток
                </div>
                <div className="mt-1 text-2xl font-semibold text-emerald-200">
                  ${selected.earnedUsd.toFixed(2)}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-600">
              Чистий приріст: {selected.joins - (selected.leaves ?? 0)} ·{' '}
              {formatDayLabel(selected.date)}
            </p>
          </motion.div>
        ) : (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-xs text-zinc-600"
          >
            Натисніть на стовпчик графіка, щоб переглянути деталі за день
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
