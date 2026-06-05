import { useEffect, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, Save, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PanelBrand } from '@/components/brand/PanelBrand'
import { AccountMenu } from '@/components/account/AccountMenu'
import { useAuth } from '@/context/AuthContext'
import {
  apiAdminGetPlan,
  apiAdminPayments,
  apiAdminUpdatePlan,
  type AdminPaymentRow
} from '@/lib/api'
import { getMarketingHomeUrl } from '@/lib/site'

function statusBadge(status: string): string {
  const s = status.toLowerCase()
  if (s === 'finished' || s === 'confirmed') return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
  if (s === 'failed' || s === 'expired') return 'border-red-400/30 bg-red-500/15 text-red-200'
  return 'border-white/10 bg-white/[0.04] text-zinc-400'
}

export function AdminPage(): JSX.Element {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [price, setPrice] = useState('29')
  const [currency, setCurrency] = useState('usd')
  const [planTitle, setPlanTitle] = useState('DM Outreach — 1 місяць')
  const [payments, setPayments] = useState<AdminPaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const [plan, pay] = await Promise.all([apiAdminGetPlan(), apiAdminPayments()])
        setPrice(String(plan.monthlyPriceUsd))
        setCurrency(plan.currency)
        setPlanTitle(plan.planTitle)
        setPayments(pay.items)
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    })()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="flex min-h-full items-center justify-center px-6">
        <div className="glass-panel max-w-md p-8 text-center">
          <Shield className="mx-auto h-10 w-10 text-zinc-500" />
          <h1 className="mt-4 text-lg font-semibold text-white">Доступ заборонено</h1>
          <p className="mt-2 text-sm text-zinc-500">Ця сторінка лише для адміністраторів.</p>
          <button
            type="button"
            onClick={() => navigate('/hub')}
            className="mt-6 rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-zinc-300 hover:text-white"
          >
            Назад в Hub
          </button>
        </div>
      </div>
    )
  }

  async function savePlan(e: FormEvent): Promise<void> {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const num = Number(price)
      if (!Number.isFinite(num) || num <= 0) throw new Error('Некоректна ціна')
      const updated = await apiAdminUpdatePlan({
        monthlyPriceUsd: num,
        currency: currency.trim().toLowerCase(),
        planTitle: planTitle.trim()
      })
      setPrice(String(updated.monthlyPriceUsd))
      setCurrency(updated.currency)
      setPlanTitle(updated.planTitle)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-white/[0.06] px-8 py-5">
        <PanelBrand layout="sidebar" />
        <div className="flex items-center gap-2">
          <a
            href={getMarketingHomeUrl()}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Головна</span>
          </a>
          <button
            type="button"
            onClick={() => navigate('/hub')}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Hub
          </button>
          <AccountMenu redirectAfterSwitch="/admin" />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-8 py-10">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          <Shield className="h-3.5 w-3.5 text-accent/80" />
          Адмін-панель
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Billing & заявки</h1>

        {loading ? (
          <div className="mt-10 text-sm text-zinc-500">Завантаження…</div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
            <form onSubmit={(ev) => void savePlan(ev)} className="glass-panel-strong h-fit p-6">
              <h2 className="text-lg font-semibold text-white">Ціна підписки</h2>
              <p className="mt-1 text-[13px] text-zinc-500">Зміни застосовуються до нових інвойсів NOWPayments.</p>

              <label className="mt-5 block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Назва плану</span>
                <input
                  value={planTitle}
                  onChange={(ev) => setPlanTitle(ev.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                />
              </label>

              <label className="mt-4 block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Ціна (USD)</span>
                <input
                  value={price}
                  onChange={(ev) => setPrice(ev.target.value)}
                  type="number"
                  min="1"
                  step="0.01"
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                />
              </label>

              <label className="mt-4 block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Валюта</span>
                <input
                  value={currency}
                  onChange={(ev) => setCurrency(ev.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                />
              </label>

              {error ? (
                <p className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-[13px] text-red-200">
                  {error}
                </p>
              ) : null}
              {saved ? (
                <p className="mt-4 text-[13px] text-emerald-300">Збережено</p>
              ) : null}

              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent/35 bg-accent/15 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                Зберегти
              </motion.button>
            </form>

            <div className="glass-panel overflow-hidden">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <h2 className="font-semibold text-white">Заявки на оплату</h2>
                <p className="text-[12px] text-zinc-500">{payments.length} записів</p>
              </div>
              <div className="max-h-[min(70vh,640px)] overflow-auto">
                {payments.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-zinc-500">Поки немає заявок</div>
                ) : (
                  <table className="w-full min-w-[720px] text-left text-[13px]">
                    <thead className="sticky top-0 bg-zinc-950/95 text-[11px] uppercase tracking-wide text-zinc-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Сума</th>
                        <th className="px-4 py-3 font-medium">Статус</th>
                        <th className="px-4 py-3 font-medium">Дата</th>
                        <th className="px-4 py-3 font-medium">Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-zinc-200">{p.userEmail}</td>
                          <td className="px-4 py-3 text-zinc-300">
                            ${p.amountUsd} {p.currency.toUpperCase()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${statusBadge(p.status)}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">
                            {new Intl.DateTimeFormat('uk-UA', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            }).format(new Date(p.createdAt))}
                          </td>
                          <td className="px-4 py-3 font-mono text-[10px] text-zinc-600">{p.orderId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
