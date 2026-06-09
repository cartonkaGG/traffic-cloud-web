import type { AdminPaymentRow } from '@/lib/api'

function weekBuckets(payments: AdminPaymentRow[]): { label: string; count: number }[] {
  const buckets: { key: string; label: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = new Intl.DateTimeFormat('uk-UA', { weekday: 'short' }).format(d)
    buckets.push({ key, label, count: 0 })
  }
  const map = new Map(buckets.map((b) => [b.key, b]))
  for (const p of payments) {
    const key = p.createdAt.slice(0, 10)
    const b = map.get(key)
    if (b) b.count++
  }
  return buckets.map(({ label, count }) => ({ label, count }))
}

export function AdminWeeklyActivity({ payments }: { payments: AdminPaymentRow[] }): JSX.Element {
  const data = weekBuckets(payments)
  const max = Math.max(1, ...data.map((d) => d.count))

  return (
    <div className="admin-stat-card">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        Активність · 7 днів
      </div>
      <div className="mt-4 flex h-24 items-end justify-between gap-2">
        {data.map(({ label, count }) => (
          <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div
              className="admin-activity-bar w-full max-w-[2.25rem] rounded-t-md bg-gradient-to-t from-accent/25 to-accent/70 transition-all duration-300"
              style={{ height: `${Math.max(8, (count / max) * 100)}%` }}
              title={`${count} заявок`}
            />
            <span className="text-[10px] font-medium uppercase text-zinc-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
