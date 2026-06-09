import { Eye, Sparkles } from 'lucide-react'

type Props = {
  planTitle: string
  price: string
  compareAtPrice: string
  currency: string
}

function formatUsd(raw: string): string {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return '—'
  if (Number.isInteger(n)) return String(n)
  const s = n.toFixed(2)
  return s.endsWith('0') ? s.slice(0, -1) : s
}

export function AdminPlanPreview({ planTitle, price, compareAtPrice, currency }: Props): JSX.Element {
  const current = formatUsd(price)
  const compare = formatUsd(compareAtPrice)
  const hasDiscount = compare !== '—' && Number(compare) > Number(current)
  const discountPct = hasDiscount
    ? Math.max(1, Math.round((1 - Number(current) / Number(compare)) * 100))
    : 0

  return (
    <div className="admin-plan-preview mt-5 rounded-2xl border border-white/[0.08] bg-black/25 p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        <Eye className="h-3.5 w-3.5 text-accent/80" />
        Превʼю для користувача
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-accent" />
            <span className="truncate text-sm font-semibold text-zinc-100">{planTitle.trim() || '—'}</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-600">Сторінка Billing · NOWPayments</p>
        </div>
        <div className="text-right">
          {hasDiscount ? (
            <div className="text-[12px] text-zinc-500 line-through">
              ${compare} {currency.toUpperCase()}
            </div>
          ) : null}
          <div className="font-mono text-2xl font-bold tabular-nums text-white">
            ${current}
            <span className="ml-1 text-sm font-medium text-zinc-500">/ міс</span>
          </div>
          {hasDiscount ? (
            <span className="mt-1 inline-block rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
              −{discountPct}%
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
