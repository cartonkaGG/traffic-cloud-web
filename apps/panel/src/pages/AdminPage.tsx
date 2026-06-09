import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Gift,
  Home,
  Loader2,
  Receipt,
  Save,
  Search,
  Shield,
  TrendingUp,
  XCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AdminAmbient } from '@/components/admin/AdminAmbient'
import { PanelBrand } from '@/components/brand/PanelBrand'
import { AccountMenu } from '@/components/account/AccountMenu'
import { useAuth } from '@/context/AuthContext'
import {
  apiAdminGetPlan,
  apiAdminGrantSubscription,
  apiAdminPayments,
  apiAdminUpdatePlan,
  type AdminPaymentRow
} from '@/lib/api'
import { getMarketingHomeUrl } from '@/lib/site'

type PaymentFilter = 'all' | 'success' | 'pending' | 'failed'

function statusBadge(status: string): string {
  const s = status.toLowerCase()
  if (s === 'finished' || s === 'confirmed') return 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200'
  if (s === 'failed' || s === 'expired') return 'border-red-400/35 bg-red-500/15 text-red-200'
  return 'border-amber-400/25 bg-amber-500/10 text-amber-100/90'
}

function statusLabel(status: string): string {
  const s = status.toLowerCase()
  if (s === 'finished' || s === 'confirmed') return 'Оплачено'
  if (s === 'failed' || s === 'expired') return 'Помилка'
  return 'Очікує'
}

function isSuccessStatus(status: string): boolean {
  const s = status.toLowerCase()
  return s === 'finished' || s === 'confirmed'
}

function isFailedStatus(status: string): boolean {
  const s = status.toLowerCase()
  return s === 'failed' || s === 'expired'
}

function AdminSkeleton(): JSX.Element {
  return (
    <div className="mt-8 animate-pulse space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-6">
          <div className="h-72 rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
          <div className="h-80 rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
        </div>
        <div className="h-[480px] rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      </div>
    </div>
  )
}

export function AdminPage(): JSX.Element {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [price, setPrice] = useState('29')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [currency, setCurrency] = useState('usd')
  const [planTitle, setPlanTitle] = useState('DM Outreach — 1 місяць')
  const [payments, setPayments] = useState<AdminPaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [grantEmail, setGrantEmail] = useState('')
  const [grantDays, setGrantDays] = useState('30')
  const [granting, setGranting] = useState(false)
  const [grantOk, setGrantOk] = useState<string | null>(null)
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all')
  const [paymentSearch, setPaymentSearch] = useState('')

  useEffect(() => {
    if (!isAdmin) return
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const [plan, pay] = await Promise.all([apiAdminGetPlan(), apiAdminPayments()])
        setPrice(String(plan.monthlyPriceUsd))
        setCompareAtPrice(
          plan.compareAtPriceUsd != null && plan.compareAtPriceUsd > 0
            ? String(plan.compareAtPriceUsd)
            : ''
        )
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

  const stats = useMemo(() => {
    let success = 0
    let pending = 0
    let failed = 0
    let revenue = 0
    for (const p of payments) {
      if (isSuccessStatus(p.status)) {
        success++
        revenue += p.amountUsd
      } else if (isFailedStatus(p.status)) {
        failed++
      } else {
        pending++
      }
    }
    return { total: payments.length, success, pending, failed, revenue }
  }, [payments])

  const filteredPayments = useMemo(() => {
    const q = paymentSearch.trim().toLowerCase()
    return payments.filter((p) => {
      if (paymentFilter === 'success' && !isSuccessStatus(p.status)) return false
      if (paymentFilter === 'failed' && !isFailedStatus(p.status)) return false
      if (paymentFilter === 'pending' && (isSuccessStatus(p.status) || isFailedStatus(p.status))) {
        return false
      }
      if (q && !p.userEmail.toLowerCase().includes(q) && !p.orderId.toLowerCase().includes(q)) {
        return false
      }
      return true
    })
  }, [payments, paymentFilter, paymentSearch])

  if (!isAdmin) {
    return (
      <div className="relative flex min-h-full items-center justify-center overflow-hidden px-6">
        <AdminAmbient />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel-strong relative z-10 max-w-md p-8 text-center"
        >
          <div className="admin-section-icon mx-auto border-red-400/20 bg-red-500/10">
            <Shield className="h-5 w-5 text-red-300" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-white">Доступ заборонено</h1>
          <p className="mt-2 text-sm text-zinc-500">Ця сторінка лише для адміністраторів Traffic Cloud.</p>
          <button
            type="button"
            onClick={() => navigate('/hub')}
            className="mt-6 rounded-xl border border-white/[0.10] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-accent/30 hover:text-white"
          >
            Назад в Hub
          </button>
        </motion.div>
      </div>
    )
  }

  async function grantSubscription(e: FormEvent): Promise<void> {
    e.preventDefault()
    const email = grantEmail.trim().toLowerCase()
    if (!email) return
    setGranting(true)
    setError(null)
    setGrantOk(null)
    try {
      const days = Number(grantDays)
      const res = await apiAdminGrantSubscription(
        email,
        Number.isFinite(days) && days > 0 ? days : 30
      )
      const end = res.subscription.currentPeriodEnd
        ? new Intl.DateTimeFormat('uk-UA', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(res.subscription.currentPeriodEnd))
        : '—'
      setGrantOk(`Підписку видано ${res.email} до ${end}`)
      setGrantEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setGranting(false)
    }
  }

  async function savePlan(e: FormEvent): Promise<void> {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const num = Number(price)
      if (!Number.isFinite(num) || num <= 0) throw new Error('Некоректна ціна')
      const compareRaw = compareAtPrice.trim()
      let compareAtPriceUsd: number | null = null
      if (compareRaw) {
        const compareNum = Number(compareRaw)
        if (!Number.isFinite(compareNum) || compareNum <= 0) {
          throw new Error('Некоректна стара ціна')
        }
        if (compareNum <= num) {
          throw new Error('Стара ціна має бути вищою за поточну (акційну)')
        }
        compareAtPriceUsd = compareNum
      }

      const updated = await apiAdminUpdatePlan({
        monthlyPriceUsd: num,
        compareAtPriceUsd,
        currency: currency.trim().toLowerCase(),
        planTitle: planTitle.trim()
      })
      setPrice(String(updated.monthlyPriceUsd))
      setCompareAtPrice(
        updated.compareAtPriceUsd != null && updated.compareAtPriceUsd > 0
          ? String(updated.compareAtPriceUsd)
          : ''
      )
      setCurrency(updated.currency)
      setPlanTitle(updated.planTitle)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const filterTabs: { id: PaymentFilter; label: string }[] = [
    { id: 'all', label: 'Усі' },
    { id: 'success', label: 'Оплачені' },
    { id: 'pending', label: 'Очікують' },
    { id: 'failed', label: 'Помилки' }
  ]

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      <AdminAmbient />

      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-white/[0.06] bg-[#030712]/60 px-6 py-4 backdrop-blur-xl sm:px-8">
        <PanelBrand layout="sidebar" />
        <div className="flex items-center gap-2">
          <a
            href={getMarketingHomeUrl()}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-white/[0.14] hover:text-zinc-200"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Головна</span>
          </a>
          <button
            type="button"
            onClick={() => navigate('/hub')}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-white/[0.14] hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Hub
          </button>
          <AccountMenu redirectAfterSwitch="/admin" />
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:px-8 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] via-gray-950/50 to-transparent p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-start gap-4">
            <div className="admin-section-icon border-amber-400/25 bg-amber-500/10 shadow-[0_0_32px_-12px_rgba(251,191,36,0.45)]">
              <Shield className="h-5 w-5 text-amber-200" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/70">
                Traffic Cloud · Admin
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="text-gradient">Billing & заявки</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
                Керування підписками, цінами NOWPayments та історія оплат користувачів.
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <AdminSkeleton />
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Усього заявок', value: stats.total, icon: Receipt, tone: 'text-zinc-200' },
                { label: 'Оплачено', value: stats.success, icon: CheckCircle2, tone: 'text-emerald-300' },
                { label: 'Очікують', value: stats.pending, icon: Clock, tone: 'text-amber-200' },
                {
                  label: 'Сума (USD)',
                  value: `$${stats.revenue.toFixed(0)}`,
                  icon: TrendingUp,
                  tone: 'text-accent'
                }
              ].map(({ label, value, icon: Icon, tone }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="admin-stat-card"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      {label}
                    </span>
                    <Icon className={`h-4 w-4 ${tone} opacity-80`} />
                  </div>
                  <div className={`mt-2 font-mono text-2xl font-bold tabular-nums ${tone}`}>{value}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
              <div className="flex flex-col gap-6">
                <form
                  onSubmit={(ev) => void grantSubscription(ev)}
                  className="glass-panel-strong p-6"
                >
                  <div className="flex items-start gap-3">
                    <div className="admin-section-icon border-amber-400/20 bg-amber-500/10">
                      <Gift className="h-5 w-5 text-amber-200" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Видати підписку</h2>
                      <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
                        Активує Pro за email. Користувач має бути зареєстрований — лист надійде автоматично.
                      </p>
                    </div>
                  </div>

                  <label className="mt-5 block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Email
                    </span>
                    <input
                      value={grantEmail}
                      onChange={(ev) => setGrantEmail(ev.target.value)}
                      type="email"
                      placeholder="user@example.com"
                      className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400/35"
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Днів
                    </span>
                    <input
                      value={grantDays}
                      onChange={(ev) => setGrantDays(ev.target.value)}
                      type="number"
                      min="1"
                      max="365"
                      className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-amber-400/35"
                    />
                  </label>

                  {grantOk ? (
                    <p className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2.5 text-[13px] text-emerald-200">
                      {grantOk}
                    </p>
                  ) : null}

                  <motion.button
                    type="submit"
                    disabled={granting || !grantEmail.trim()}
                    whileHover={{ scale: granting ? 1 : 1.01 }}
                    whileTap={{ scale: granting ? 1 : 0.99 }}
                    className="admin-grant-cta mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-shadow disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {granting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                    Видати підписку
                  </motion.button>
                </form>

                <form onSubmit={(ev) => void savePlan(ev)} className="glass-panel-strong p-6">
                  <div className="flex items-start gap-3">
                    <div className="admin-section-icon border-accent/20 bg-accent/10">
                      <CreditCard className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Ціна підписки</h2>
                      <p className="mt-1 text-[13px] text-zinc-500">
                        Зміни застосовуються до нових інвойсів NOWPayments.
                      </p>
                    </div>
                  </div>

                  <label className="mt-5 block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Назва плану
                    </span>
                    <input
                      value={planTitle}
                      onChange={(ev) => setPlanTitle(ev.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-accent/35"
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Акційна ціна (USD)
                    </span>
                    <input
                      value={price}
                      onChange={(ev) => setPrice(ev.target.value)}
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none transition-colors focus:border-accent/35"
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Стара ціна (закреслена)
                    </span>
                    <input
                      value={compareAtPrice}
                      onChange={(ev) => setCompareAtPrice(ev.target.value)}
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Порожньо — без знижки"
                      className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600 transition-colors focus:border-accent/35"
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Валюта
                    </span>
                    <input
                      value={currency}
                      onChange={(ev) => setCurrency(ev.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white uppercase outline-none transition-colors focus:border-accent/35"
                    />
                  </label>

                  {error ? (
                    <p className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2.5 text-[13px] text-red-200">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      {error}
                    </p>
                  ) : null}
                  {saved ? (
                    <p className="mt-4 flex items-center gap-2 text-[13px] text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Збережено
                    </p>
                  ) : null}

                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: saving ? 1 : 1.01 }}
                    whileTap={{ scale: saving ? 1 : 0.99 }}
                    className="admin-save-cta mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-shadow disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Зберегти тариф
                  </motion.button>
                </form>
              </div>

              <div className="glass-panel-strong overflow-hidden">
                <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="admin-section-icon">
                        <Receipt className="h-5 w-5 text-zinc-300" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-white">Заявки на оплату</h2>
                        <p className="text-[12px] text-zinc-500">
                          {filteredPayments.length} з {payments.length} записів
                        </p>
                      </div>
                    </div>
                    <div className="relative w-full min-w-[200px] max-w-xs">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <input
                        value={paymentSearch}
                        onChange={(ev) => setPaymentSearch(ev.target.value)}
                        placeholder="Пошук email або order…"
                        className="w-full rounded-xl border border-white/[0.10] bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition-colors focus:border-accent/35"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {filterTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPaymentFilter(tab.id)}
                        className={[
                          'cursor-pointer rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors',
                          paymentFilter === tab.id
                            ? 'border-accent/35 bg-accent/15 text-accent'
                            : 'border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:border-white/[0.14] hover:text-zinc-200'
                        ].join(' ')}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-[min(70vh,640px)] overflow-auto">
                  {filteredPayments.length === 0 ? (
                    <div className="flex flex-col items-center px-6 py-16 text-center">
                      <div className="admin-section-icon mb-4">
                        <Receipt className="h-5 w-5 text-zinc-500" />
                      </div>
                      <p className="text-sm font-medium text-zinc-400">
                        {payments.length === 0 ? 'Поки немає заявок' : 'Нічого не знайдено'}
                      </p>
                      <p className="mt-1 text-[12px] text-zinc-600">
                        {payments.length === 0
                          ? 'Перші оплати зʼявляться тут автоматично'
                          : 'Спробуйте інший фільтр або пошук'}
                      </p>
                    </div>
                  ) : (
                    <table className="w-full min-w-[720px] text-left text-[13px]">
                      <thead className="sticky top-0 z-10 bg-[#0a0f18]/95 text-[11px] uppercase tracking-[0.14em] text-zinc-500 backdrop-blur-md">
                        <tr>
                          <th className="px-5 py-3 font-medium">Email</th>
                          <th className="px-4 py-3 font-medium">Сума</th>
                          <th className="px-4 py-3 font-medium">Статус</th>
                          <th className="px-4 py-3 font-medium">Дата</th>
                          <th className="px-4 py-3 font-medium">Order</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map((p) => (
                          <tr
                            key={p.id}
                            className="border-t border-white/[0.04] transition-colors hover:bg-white/[0.03]"
                          >
                            <td className="px-5 py-3.5 font-medium text-zinc-100">{p.userEmail}</td>
                            <td className="px-4 py-3.5 font-mono text-zinc-300">
                              ${p.amountUsd}{' '}
                              <span className="text-zinc-600">{p.currency.toUpperCase()}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadge(p.status)}`}
                              >
                                {statusLabel(p.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-[11px] text-zinc-500">
                              {new Intl.DateTimeFormat('uk-UA', {
                                day: '2-digit',
                                month: '2-digit',
                                year: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              }).format(new Date(p.createdAt))}
                            </td>
                            <td className="max-w-[140px] truncate px-4 py-3.5 font-mono text-[10px] text-zinc-600">
                              {p.orderId}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
