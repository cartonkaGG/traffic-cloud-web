import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Home, RefreshCw } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PanelBrand } from '@/components/brand/PanelBrand'
import { AccountMenu } from '@/components/account/AccountMenu'
import { BillingAmbient } from '@/components/billing/BillingAmbient'
import { useSoftware } from '@/context/SoftwareContext'
import { useAuth } from '@/context/AuthContext'
import { apiBillingCheckout, apiBillingStatus } from '@/lib/api'
import { networkById, PAY_NETWORKS, type PayNetworkId } from '@/lib/billingNetworks'
import { BILLING_SUBSCRIBE_PATH, SUBSCRIBE_ENTRY_PATH } from '@/lib/panelRoutes'
import { getMarketingHomeUrl } from '@/lib/site'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(iso))
}

function formatUsd(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
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
  const hasDiscount =
    compareAtPrice != null && compareAtPrice > price

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
        ? 'Оплату скасовано.'
        : gateParam && !isActive
          ? fromHub
            ? 'Оплатіть підписку, щоб запустити DM Outreach.'
            : 'Оплатіть місяць, щоб відкрити Hub.'
          : null

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-[#030712]">
      <BillingAmbient />

      <header className="relative z-10 flex items-center justify-between gap-4 px-6 py-5 sm:px-8">
        <PanelBrand layout="sidebar" />
        <div className="flex items-center gap-2">
          <a
            href={getMarketingHomeUrl()}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-2 text-sm text-zinc-500 transition-colors hover:border-white/10 hover:text-zinc-300"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Головна</span>
          </a>
          {isActive ? (
            <button
              type="button"
              onClick={() => navigate('/hub')}
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-2 text-sm text-zinc-500 transition-colors hover:border-white/10 hover:text-zinc-300"
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

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8 sm:px-8">
        <div className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-600">
            Traffic Cloud Pro
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
            {gateParam ? 'Оформіть підписку' : 'Ваша підписка'}
          </h1>
          {isAuthenticated && email ? (
            <p className="mt-2 text-[13px] text-zinc-600">{email}</p>
          ) : null}
        </div>

        {notice ? (
          <p className="mt-5 text-center text-[13px] text-zinc-500">{notice}</p>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 rounded-3xl border border-white/[0.08] bg-gray-950/50 p-6 shadow-[0_24px_80px_-40px_rgba(34,211,238,0.35)] backdrop-blur-xl sm:p-8"
        >
          {loading ? (
            <div className="py-12 text-center text-sm text-zinc-600">Завантаження…</div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[15px] font-medium text-zinc-300">{planTitle}</p>
                  <p className="mt-1 text-[12px] text-zinc-600">30 днів · USDT</p>
                </div>
                {isActive ? (
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                    Активна
                  </span>
                ) : null}
              </div>

              <div className="mt-6 flex items-end gap-3">
                {hasDiscount ? (
                  <span className="mb-1 text-2xl font-medium text-zinc-600 line-through decoration-zinc-600/80">
                    ${formatUsd(compareAtPrice!)}
                  </span>
                ) : null}
                <span className="text-5xl font-light tracking-tight text-white">
                  ${formatUsd(price)}
                </span>
                <span className="mb-2 text-sm text-zinc-600">{currency.toUpperCase()}</span>
              </div>

              {hasDiscount ? (
                <p className="mt-2 text-[12px] text-cyan-400/80">
                  Акційна ціна
                </p>
              ) : null}

              {isActive ? (
                <p className="mt-6 text-[13px] text-zinc-500">
                  Діє до{' '}
                  <span className="text-zinc-300">{formatDate(periodEnd)}</span>
                </p>
              ) : (
                <>
                  <div className="mt-8">
                    <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-600">
                      Мережа
                    </p>
                    <div className="mt-3 flex gap-2">
                      {PAY_NETWORKS.map((net) => {
                        const active = payNetwork === net.id
                        return (
                          <button
                            key={net.id}
                            type="button"
                            onClick={() => setPayNetwork(net.id)}
                            className={[
                              'flex-1 rounded-xl border px-3 py-2.5 text-left transition-colors',
                              active
                                ? 'border-cyan-400/30 bg-cyan-500/10 text-white'
                                : 'border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:border-white/10 hover:text-zinc-300'
                            ].join(' ')}
                          >
                            <span className="block text-sm font-medium">{net.label}</span>
                            <span className="block text-[11px] opacity-70">{net.chain}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <label className="mt-6 flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(ev) => setAcceptedTerms(ev.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-white/15 accent-cyan-400"
                    />
                    <span className="text-[12px] leading-relaxed text-zinc-600">
                      Погоджуюсь з{' '}
                      <a
                        href={`${getMarketingHomeUrl()}/#terms`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 underline-offset-2 hover:text-zinc-300 hover:underline"
                      >
                        умовами
                      </a>{' '}
                      Traffic Cloud
                    </span>
                  </label>

                  {error ? (
                    <p className="mt-4 text-[13px] text-red-300/90">{error}</p>
                  ) : null}

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={paying || !acceptedTerms}
                    onClick={() => void subscribe()}
                    className="mt-6 flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white text-sm font-semibold text-gray-950 transition-opacity hover:bg-zinc-100 disabled:opacity-40"
                  >
                    {isActive ? 'Продовжити' : 'Оплатити'}
                    <ExternalLink className="h-4 w-4 opacity-60" />
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => void load()}
                    className="mt-4 flex w-full items-center justify-center gap-1.5 text-[12px] text-zinc-600 transition-colors hover:text-zinc-400"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Оновити статус
                  </button>
                </>
              )}

              {isActive ? (
                <div className="mt-8 flex flex-col gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={paying}
                    onClick={() => void subscribe()}
                    className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-medium text-white transition-colors hover:bg-white/[0.07] disabled:opacity-40"
                  >
                    Продовжити підписку
                    <ExternalLink className="h-4 w-4 opacity-60" />
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      selectSoftware('dm-outreach')
                      navigate('/')
                    }}
                    className="flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-sm font-medium text-emerald-100"
                  >
                    Увійти в панель
                  </motion.button>
                </div>
              ) : null}
            </>
          )}
        </motion.div>

        {isActive ? (
          <p className="mt-6 text-center text-[12px] text-zinc-700">
            <Link to="/hub" className="text-zinc-500 hover:text-zinc-400">
              Повернутися в Hub
            </Link>
          </p>
        ) : null}
      </main>
    </div>
  )
}
