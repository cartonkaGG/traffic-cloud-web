import type { ReactNode } from 'react'
import { BarChart3 } from 'lucide-react'
import type { AffiliateDailyStat } from '@/lib/api'

type Props = {
  daily: AffiliateDailyStat[]
}

const CHART_HEIGHT_PX = 112

function formatDayLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
}

function ChartTooltip({
  children,
  className = ''
}: {
  children: ReactNode
  className?: string
}): JSX.Element {
  return (
    <div
      className={[
        'pointer-events-none absolute bottom-[calc(100%-0.25rem)] left-1/2 z-20 -translate-x-1/2',
        'opacity-0 transition-opacity duration-150 group-hover:opacity-100',
        className
      ].join(' ')}
    >
      <div className="rounded-lg border border-white/[0.12] bg-[#121820] px-2.5 py-2 text-[10px] leading-snug text-zinc-200 shadow-xl shadow-black/40">
        {children}
      </div>
      <div className="mx-auto h-0 w-0 border-x-[5px] border-t-[5px] border-x-transparent border-t-white/[0.12]" />
    </div>
  )
}

export function AffiliateStatsChart({ daily }: Props): JSX.Element {
  const maxJoins = Math.max(1, ...daily.map((d) => d.joins + (d.leaves ?? 0)))
  const maxEarned = Math.max(0.01, ...daily.map((d) => d.earnedUsd))
  const hasActivity = daily.some(
    (d) => d.joins > 0 || (d.leaves ?? 0) > 0 || d.earnedUsd > 0 || (d.lostUsd ?? 0) > 0
  )

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/[0.06] bg-[#0a0e14]/80 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Підписки / відписки
          </span>
          <span className="text-[10px] text-zinc-600">{daily.length} днів</span>
        </div>
        {hasActivity ? (
          <div className="mt-5 flex h-32 items-end gap-1">
            {daily.map((d) => {
              const joinPx = Math.round((d.joins / maxJoins) * CHART_HEIGHT_PX)
              const leavePx = Math.round(((d.leaves ?? 0) / maxJoins) * CHART_HEIGHT_PX)
              return (
                <div
                  key={d.date}
                  className="group relative flex h-32 min-w-0 flex-1 cursor-default flex-col items-center justify-end gap-2"
                >
                  <ChartTooltip>
                    <div className="font-medium text-white">{formatDayLabel(d.date)}</div>
                    <div className="mt-1 space-y-0.5 text-zinc-400">
                      <div className="text-cyan-300">+{d.joins} підп.</div>
                      <div className="text-rose-300">−{d.leaves ?? 0} відп.</div>
                    </div>
                  </ChartTooltip>
                  <div
                    className="flex w-full max-w-[2.25rem] flex-col items-stretch justify-end gap-0.5"
                    style={{ height: CHART_HEIGHT_PX }}
                  >
                    {joinPx > 0 ? (
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-cyan-500/25 to-cyan-400/80 transition-opacity group-hover:opacity-90"
                        style={{ height: joinPx }}
                      />
                    ) : null}
                    {leavePx > 0 ? (
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-rose-500/25 to-rose-400/70"
                        style={{ height: leavePx }}
                      />
                    ) : (
                      <div className="min-h-[2px] w-full" />
                    )}
                  </div>
                  <span className="text-[9px] font-medium text-zinc-600 transition-colors group-hover:text-zinc-400">
                    {d.date.slice(8)}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-5 flex h-32 flex-col items-center justify-center gap-2 text-center">
            <BarChart3 className="h-8 w-8 text-zinc-700" />
            <p className="text-xs text-zinc-500">Немає підписок і відписок за обраний період</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-[#0a0e14]/80 p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Заробіток USD
        </div>
        {hasActivity ? (
          <div className="mt-5 flex h-32 items-end gap-1">
            {daily.map((d) => {
              const earnPx = Math.max(
                d.earnedUsd > 0 ? 4 : 0,
                Math.round((d.earnedUsd / maxEarned) * CHART_HEIGHT_PX)
              )
              const lost = d.lostUsd ?? 0
              return (
                <div
                  key={`e-${d.date}`}
                  className="group relative flex h-32 min-w-0 flex-1 cursor-default flex-col items-center justify-end gap-2"
                >
                  <ChartTooltip>
                    <div className="font-medium text-white">{formatDayLabel(d.date)}</div>
                    <div className="mt-1 space-y-0.5 text-zinc-400">
                      <div className="text-emerald-300">+${d.earnedUsd.toFixed(2)}</div>
                      {lost > 0 ? <div className="text-rose-300">−${lost.toFixed(2)}</div> : null}
                    </div>
                  </ChartTooltip>
                  <div
                    className={[
                      'w-full max-w-[2.25rem] rounded-t-md bg-gradient-to-t from-emerald-500/25 to-emerald-400/80 transition-opacity group-hover:opacity-90',
                      earnPx === 0 ? 'min-h-[2px]' : ''
                    ].join(' ')}
                    style={{ height: earnPx > 0 ? earnPx : 2 }}
                  />
                  <span className="text-[9px] font-medium text-zinc-600 transition-colors group-hover:text-zinc-400">
                    {d.date.slice(8)}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-5 flex h-32 flex-col items-center justify-center gap-2 text-center">
            <BarChart3 className="h-8 w-8 text-zinc-700" />
            <p className="text-xs text-zinc-500">Немає нарахувань за обраний період</p>
          </div>
        )}
      </div>
    </div>
  )
}
