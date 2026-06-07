import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Crown,
  ExternalLink,
  Home,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PanelBrand } from '@/components/brand/PanelBrand'
import { AccountMenu } from '@/components/account/AccountMenu'
import { BillingAmbient } from '@/components/billing/BillingAmbient'
import { useSoftware } from '@/context/SoftwareContext'
import { useAuth } from '@/context/AuthContext'
import { apiBillingCheckout, apiBillingStatus } from '@/lib/api'
import { networkById, PAY_NETWORKS, type PayNetworkId } from '@/lib/billingNetworks'
import { BILLING_SUBSCRIBE_PATH, SUBSCRIBE_ENTRY_PATH } from '@/lib/panelRoutes'
import { formatSubscriptionEnd } from '@/lib/formatSubscription'
import { getMarketingHomeUrl } from '@/lib/site'

const PLAN_HIGHLIGHTS = [
  'DM Outreach консоль на 30 днів',
  'Telegram, проксі та anti-detect',
  'Кампанії та аналітика в реальному часі'
]

function formatUsd(n: number): string {
  if (Number.isInteger(n)) return String(n)
  const s = n.toFixed(2)
  return s.endsWith('0') ? s.slice(0, -1) : s
}

export function BillingPage(): JSX.Element {
  const { isAuthenticated, email } = useAuth()
  const navigate = useNavigate()
  const { selectSoftware } = useSoftware()
  const [params] = useSearchParams()
  const statusParam = params.get('status')
  const gateParam = params.get('gate')
  const fromHub = params.get('from') === 'hub'

  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [planTitle, setPlanTitle] = useState('DM Outreach — 1 місяць')
  const [price, setPrice] = useState(29)
  const [compareAtPrice, setCompareAtPrice] = useState<number | null>(null)
  const [currency, setCurrency] = useState('usd')
  const [isActive, setIsActive] = useState(false)
  const [periodEnd, setPeriodEnd] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [payNetwork, setPayNetwork] = useState<PayNetworkId>('trc20')

  const selectedNetwork = networkById(payNetwork)
  const hasDiscount = compareAtPrice != null && compareAtPrice > price
  const discountPct = hasDiscount
    ? Math.max(1, Math.round((1 - price / compareAtPrice!) * 100))
    : 0

  async function load(): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const data = await apiBillingStatus()
      setPlanTitle(data.plan.planTitle)
      setPrice(data.plan.monthlyPriceUsd)
      setCompareAtPrice(data.plan.compareAtPriceUsd ?? null)
      setCurrency(data.plan.currency)
      setPeriodEnd(data.subscription.currentPeriodEnd)
      setIsActive(data.subscription.isActive)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    if (!gateParam || !isActive) return
    navigate('/hub', { replace: true })
  }, [gateParam, isActive, navigate])

  useEffect(() => {
    if (statusParam !== 'success' || isActive) return
    const id = window.setInterval(() => void load(), 15_000)
    return () => window.clearInterval(id)
  }, [statusParam, isActive])

  async function subscribe(): Promise<void> {
    if (!isAuthenticated) {
      navigate(SUBSCRIBE_ENTRY_PATH)
      return
    }
    if (!isActive && !acceptedTerms) {
      setError('Потрібно погодитися з умовами використання.')
      return
    }
    setPaying(true)
    setError(null)
    try {
      const checkout = await apiBillingCheckout(true, selectedNetwork.currency)
      window.open(checkout.invoiceUrl, '_blank', 'noopener,noreferrer')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setPaying(false)
    }
  }

  const notice =
    statusParam === 'success'
      ? 'Після підтвердження транзакції підписка активується автоматично.'
      : statusParam === 'cancel'
        ? 'Оплату скасовано. Можете спробувати знову.'
        : gateParam && !isActive
          ? fromHub
            ? 'Оплатіть підписку, щоб запустити DM Outreach.'
            : 'Оплатіть місяць, щоб відкрити Hub і панель.'
          : null

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-gray-950">
      <BillingAmbient />

      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-white/[0.05] px-6 py-5 sm:px-8">
        <PanelBrand layout="sidebar" />
        <div className="flex items-center gap-2">
          <a
            href={getMarketingHomeUrl()}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-cyan-500/25 hover:text-zinc-200"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Головна</span>
          </a>
          {isActive ? (
            <button
              type="button"
              onClick={() => navigate('/hub')}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-cyan-500/25 hover:text-zinc-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Hub
            </button>
          ) : null}
          {isAuthenticated ? (
            <AccountMenu redirectAfterSwitch={BILLING_SUBSCRIBE_PATH} />
          ) : null}
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-10 sm:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Traffic Cloud Pro
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {gateParam ? 'Оформіть підписку' : 'Ваша підписка'}
          </h1>
          {isAuthenticated && email ? (
            <p className="mt-3 inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[12px] text-zinc-500">
              {email}
            </p>
          ) : null}
        </div>

        {notice ? (
          <p className="mx-auto mt-5 max-w-sm text-center text-[13px] leading-relaxed text-zinc-500">
            {notice}
          </p>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="billing-card relative mt-8 p-7 sm:p-9"
        >
          <div className="absolute inset-0 cyber-grid opacity-[0.22] pointer-events-none" />

          {loading ? (
            <div className="relative py-16 text-center text-sm text-zinc-500">Завантаження…</div>
          ) : (
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10 shadow-[0_0_32px_-12px_rgba(34,211,238,0.55)]">
                    <Crown className="h-6 w-6 text-cyan-300" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/90">
                      Pro
                    </p>
                    <p className="text-lg font-bold text-white">{planTitle}</p>
                    <p className="mt-0.5 text-[12px] text-zinc-500">30 днів · USDT</p>
                  </div>
                </div>
                {isActive ? (
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
                    Активна
                  </span>
                ) : hasDiscount ? (
                  <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-100">
                    −{discountPct}%
                  </span>
                ) : null}
              </div>

              <div className="mt-8">
                <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                  {hasDiscount ? (
                    <span className="text-2xl font-semibold text-zinc-600 line-through decoration-zinc-600/80">
                      ${formatUsd(compareAtPrice!)}
                    </span>
                  ) : null}
                  <span className="billing-price-sale text-5xl font-extrabold tracking-tight sm:text-[3.25rem]">
                    ${formatUsd(price)}
                  </span>
                  <span className="mb-1.5 text-sm text-zinc-500">
                    / {currency.toUpperCase()} · місяць
                  </span>
                </div>
                {hasDiscount ? (
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-400/90">
                    Акційна ціна
                  </p>
                ) : null}
              </div>

              <ul className="mt-7 space-y-2.5 border-t border-white/[0.06] pt-6">
                {PLAN_HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[13px] text-zinc-400">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-cyan-500/10">
                      <Check className="h-3 w-3 text-cyan-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {isActive ? (
                <p className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[13px] text-zinc-500">
                  Діє до{' '}
                  <span className="font-medium text-zinc-200">{formatSubscriptionEnd(periodEnd)}</span>
                </p>
              ) : (
                <>
                  <div className="mt-7">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Мережа USDT
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2.5">
                      {PAY_NETWORKS.map((net) => {
                        const active = payNetwork === net.id
                        return (
                          <button
                            key={net.id}
                            type="button"
                            onClick={() => setPayNetwork(net.id)}
                            className={[
                              'rounded-xl border px-3.5 py-3 text-left transition-all duration-300',
                              active
                                ? 'billing-network-active border-cyan-400/35 bg-gradient-to-br from-cyan-500/15 to-blue-600/10 text-white'
                                : 'border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:border-white/[0.14] hover:text-zinc-300'
                            ].join(' ')}
                          >
                            <span className="block text-sm font-semibold">{net.label}</span>
                            <span className="mt-0.5 block text-[11px] opacity-70">{net.chain}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3.5 transition-colors hover:border-white/[0.1]">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(ev) => setAcceptedTerms(ev.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-white/20 accent-cyan-400"
                    />
                    <span className="text-[12px] leading-relaxed text-zinc-500">
                      Погоджуюсь з{' '}
                      <a
                        href={`${getMarketingHomeUrl()}/#terms`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300/90 underline-offset-2 hover:text-cyan-200 hover:underline"
                      >
                        умовами
                      </a>{' '}
                      Traffic Cloud
                    </span>
                  </label>

                  {error ? (
                    <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
                      {error}
                    </p>
                  ) : null}

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={paying || !acceptedTerms}
                    onClick={() => void subscribe()}
                    className="billing-cta mt-6 flex w-full min-h-[52px] items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {paying ? 'Відкриваємо…' : isActive ? 'Продовжити' : 'Оплатити місяць'}
                    {paying ? (
                      <RefreshCw className="h-4 w-4 animate-spin opacity-80" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => void load()}
                    className="mt-4 flex w-full items-center justify-center gap-1.5 text-[11px] text-zinc-600 transition-colors hover:text-zinc-400"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Оновити статус
                  </button>

                  <p className="mt-3 text-center text-[10px] text-zinc-600">
                    Оплата через NOWPayments · {selectedNetwork.label}
                  </p>
                </>
              )}

              {isActive ? (
                <div className="mt-7 flex flex-col gap-3 border-t border-white/[0.06] pt-6">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={paying}
                    onClick={() => void subscribe()}
                    className="billing-cta flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-45"
                  >
                    Продовжити підписку
                    <ExternalLink className="h-4 w-4 opacity-80" />
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      selectSoftware('dm-outreach')
                      navigate('/')
                    }}
                    className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/15"
                  >
                    Увійти в панель
                  </motion.button>
                </div>
              ) : null}
            </div>
          )}
        </motion.div>

        {isActive ? (
          <p className="mt-6 text-center text-[12px] text-zinc-600">
            <Link to="/hub" className="text-zinc-500 transition-colors hover:text-cyan-300/90">
              Повернутися в Hub
            </Link>
          </p>
        ) : null}
      </main>
    </div>
  )
}
