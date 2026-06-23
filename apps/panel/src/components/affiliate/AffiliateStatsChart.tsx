import type { AffiliateDailyStat } from '@/lib/api'

export function AffiliateStatsChart({ daily }: { daily: AffiliateDailyStat[] }): JSX.Element {
  const maxJoins = Math.max(1, ...daily.map((d) => d.joins + (d.leaves ?? 0)))
  const maxEarned = Math.max(0.01, ...daily.map((d) => d.earnedUsd))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Підписки / відписки · {daily.length} днів
        </div>
        <div className="mt-4 flex h-28 items-end justify-between gap-1.5">
          {daily.map((d) => (
            <div key={d.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex w-full max-w-[2rem] flex-col items-stretch justify-end gap-0.5" style={{ height: '100%' }}>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-cyan-500/20 to-cyan-400/70"
                  style={{ height: `${Math.max(4, (d.joins / maxJoins) * 70)}%` }}
                  title={`+${d.joins} підписників`}
                />
                {(d.leaves ?? 0) > 0 ? (
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-red-500/20 to-red-400/60"
                    style={{ height: `${Math.max(4, ((d.leaves ?? 0) / maxJoins) * 70)}%` }}
                    title={`−${d.leaves} відписок`}
                  />
                ) : null}
              </div>
              <span className="text-[9px] font-medium text-zinc-600">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Заробіток USD
        </div>
        <div className="mt-4 flex h-28 items-end justify-between gap-1.5">
          {daily.map((d) => (
            <div key={`e-${d.date}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full max-w-[2rem] rounded-t-md bg-gradient-to-t from-emerald-500/20 to-emerald-400/70"
                style={{ height: `${Math.max(6, (d.earnedUsd / maxEarned) * 100)}%` }}
                title={`$${d.earnedUsd.toFixed(2)}`}
              />
              <span className="text-[9px] font-medium text-zinc-600">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
