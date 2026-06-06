import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'

import {

  ArrowLeft,

  Check,

  Crown,

  ExternalLink,

  Gem,

  Home,

  RefreshCw,

  ShieldCheck,

  Sparkles,

  Wallet

} from 'lucide-react'

import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { PanelBrand } from '@/components/brand/PanelBrand'

import { AccountMenu } from '@/components/account/AccountMenu'

import { useSoftware } from '@/context/SoftwareContext'

import { useAuth } from '@/context/AuthContext'

import { apiBillingCheckout, apiBillingStatus } from '@/lib/api'

import { networkById, PAY_NETWORKS, type PayNetworkId } from '@/lib/billingNetworks'

import { BILLING_SUBSCRIBE_PATH, SUBSCRIBE_ENTRY_PATH } from '@/lib/panelRoutes'

import { getMarketingHomeUrl } from '@/lib/site'



const PLAN_PERKS = [

  'Повний доступ до DM Outreach на 30 днів',

  'Telegram-акаунти, проксі та anti-detect',

  'Парсер, кампанії та аналітика в реальному часі'

]



function formatDate(iso: string | null): string {

  if (!iso) return '—'

  return new Intl.DateTimeFormat('uk-UA', {

    day: '2-digit',

    month: 'long',

    year: 'numeric',

    hour: '2-digit',

    minute: '2-digit'

  }).format(new Date(iso))

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

  const [currency, setCurrency] = useState('usd')

  const [subStatus, setSubStatus] = useState('inactive')

  const [periodEnd, setPeriodEnd] = useState<string | null>(null)

  const [isActive, setIsActive] = useState(false)

  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [payNetwork, setPayNetwork] = useState<PayNetworkId>('trc20')



  const selectedNetwork = networkById(payNetwork)



  async function load(): Promise<void> {

    setLoading(true)

    setError(null)

    try {

      const data = await apiBillingStatus()

      setPlanTitle(data.plan.planTitle)

      setPrice(data.plan.monthlyPriceUsd)

      setCurrency(data.plan.currency)

      setSubStatus(data.subscription.status)

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

    if (!acceptedTerms) {

      setError('Потрібно погодитися з умовами використання та політикою конфіденційності.')

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



  return (

    <div className="relative flex min-h-full flex-col overflow-hidden">

      <div

        className="pointer-events-none absolute inset-0"

        aria-hidden

        style={{

          background:

            'radial-gradient(ellipse 110% 70% at 50% -25%, rgba(34,211,238,0.16), transparent 58%), radial-gradient(ellipse 55% 45% at 100% 15%, rgba(99,102,241,0.12), transparent 50%), radial-gradient(ellipse 45% 40% at 0% 85%, rgba(251,191,36,0.06), transparent 55%), linear-gradient(180deg, #020617 0%, #060a14 45%, #030712 100%)'

        }}

      />

      <motion.div

        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[130px]"

        animate={{ opacity: [0.35, 0.55, 0.35] }}

        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}

        aria-hidden

      />



      <header className="relative z-10 flex items-center justify-between gap-4 border-b border-white/[0.06] px-6 py-5 sm:px-8">

        <PanelBrand layout="sidebar" />

        <div className="flex items-center gap-2">

          <a

            href={getMarketingHomeUrl()}

            className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-accent/25 hover:text-zinc-200"

          >

            <Home className="h-4 w-4" />

            <span className="hidden sm:inline">Головна</span>

          </a>

          {isActive ? (

            <button

              type="button"

              onClick={() => navigate('/hub')}

              className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-accent/25 hover:text-zinc-200"

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



      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-6 py-10 sm:px-8">

        <div className="text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100/90">

            <Crown className="h-3.5 w-3.5 text-amber-300" />

            Traffic Cloud Pro

          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">

            {gateParam ? 'Оформіть підписку' : 'Ваша підписка'}

          </h1>

          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-zinc-500">

            {gateParam

              ? 'Преміум-доступ до Hub і панелі DM Outreach. Оплата криптовалютою — швидко та безпечно.'

              : 'Керуйте місячним доступом до DM Outreach та продовжуйте підписку в один клік.'}

          </p>

          {isAuthenticated && email ? (

            <p className="mt-3 text-sm text-zinc-600">

              Акаунт · <span className="text-zinc-300">{email}</span>

            </p>

          ) : null}

        </div>



        {gateParam && !isActive ? (

          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-amber-400/20 bg-amber-500/[0.07] px-4 py-3 text-center text-sm text-amber-100/95">

            {fromHub

              ? 'Ви обрали DM Outreach — оплатіть підписку, потім знову натисніть «Запустити» в Hub.'

              : 'Підписка неактивна. Оплатіть місяць, щоб відкрити Hub і панель.'}

          </div>

        ) : null}



        {statusParam === 'success' ? (

          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-100">

            Дякуємо! Після підтвердження транзакції підписка активується автоматично.

          </div>

        ) : null}

        {statusParam === 'cancel' ? (

          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100">

            Оплату скасовано. Можете спробувати знову.

          </div>

        ) : null}



        <motion.div

          initial={{ opacity: 0, y: 16 }}

          animate={{ opacity: 1, y: 0 }}

          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}

          className="relative mt-10 overflow-hidden rounded-[28px] border border-white/[0.10] bg-[#070b14]/90 shadow-[0_0_80px_-30px_rgba(34,211,238,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]"

        >

          <div

            className="pointer-events-none absolute inset-0 opacity-60"

            aria-hidden

            style={{

              background:

                'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, transparent 40%, rgba(251,191,36,0.05) 100%)'

            }}

          />

          <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-[0.18]" aria-hidden />



          <div className="relative p-6 sm:p-8">

            {loading ? (

              <div className="py-16 text-center text-sm text-zinc-500">Завантаження…</div>

            ) : (

              <>

                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

                  <div className="flex items-start gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/20 to-indigo-600/10 shadow-[0_0_40px_-12px_rgba(34,211,238,0.55)]">

                      <Gem className="h-7 w-7 text-cyan-200" strokeWidth={1.5} />

                    </div>

                    <div>

                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">

                        Місячний план

                      </div>

                      <div className="mt-1 text-xl font-semibold text-white">{planTitle}</div>

                      <div className="mt-3 flex items-end gap-2">

                        <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">

                          ${price}

                        </span>

                        <span className="mb-1.5 text-sm font-medium text-zinc-500">

                          / {currency.toUpperCase()} · 30 днів

                        </span>

                      </div>

                    </div>

                  </div>

                  <div

                    className={[

                      'self-start rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]',

                      isActive

                        ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200 shadow-[0_0_24px_-8px_rgba(52,211,153,0.5)]'

                        : 'border-white/10 bg-white/[0.04] text-zinc-500'

                    ].join(' ')}

                  >

                    {isActive ? 'Активна' : subStatus}

                  </div>

                </div>



                <ul className="mt-8 space-y-3">

                  {PLAN_PERKS.map((perk) => (

                    <li

                      key={perk}

                      className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 text-[13px] text-zinc-300"

                    >

                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">

                        <Check className="h-3.5 w-3.5" />

                      </span>

                      {perk}

                    </li>

                  ))}

                </ul>



                {isActive ? (

                  <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-4">

                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">

                      Діє до

                    </div>

                    <div className="mt-1 text-lg font-medium text-white">{formatDate(periodEnd)}</div>

                  </div>

                ) : null}



                {!isActive ? (

                  <div className="mt-8">

                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">

                      <Wallet className="h-3.5 w-3.5 text-accent/80" />

                      Спосіб оплати

                    </div>



                    <div className="mt-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.06] px-4 py-3">

                      <div className="flex items-center justify-between gap-3">

                        <div>

                          <div className="text-sm font-semibold text-white">Криптовалюта</div>

                          <div className="text-[12px] text-zinc-500">USDT · стейблкоїн</div>

                        </div>

                        <div className="rounded-lg border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-200">

                          USDT

                        </div>

                      </div>

                    </div>



                    <div className="mt-4">

                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">

                        Мережа

                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">

                        {PAY_NETWORKS.map((net) => {

                          const active = payNetwork === net.id

                          return (

                            <button

                              key={net.id}

                              type="button"

                              onClick={() => setPayNetwork(net.id)}

                              className={[

                                'group relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-300',

                                active

                                  ? 'border-cyan-400/40 bg-gradient-to-br from-cyan-500/15 to-indigo-600/10 shadow-[0_0_32px_-12px_rgba(34,211,238,0.45)]'

                                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]'

                              ].join(' ')}

                            >

                              <div className="flex items-center justify-between gap-2">

                                <span

                                  className={[

                                    'text-base font-bold',

                                    active ? 'text-white' : 'text-zinc-300'

                                  ].join(' ')}

                                >

                                  {net.label}

                                </span>

                                {active ? (

                                  <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase text-cyan-200">

                                    обрано

                                  </span>

                                ) : null}

                              </div>

                              <div className="mt-1 text-[12px] text-zinc-500">{net.chain}</div>

                              <div className="mt-2 text-[11px] text-zinc-600">{net.hint}</div>

                            </button>

                          )

                        })}

                      </div>

                    </div>

                  </div>

                ) : null}



                <div className="mt-6 flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[12px] text-zinc-500">

                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />

                  <span>

                    Підписка продовжується на 30 днів після підтвердження оплати. Обрана мережа:{' '}

                    <span className="text-zinc-300">

                      USDT · {selectedNetwork.label} ({selectedNetwork.chain})

                    </span>

                  </span>

                </div>



                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-4 transition-colors hover:border-white/[0.12]">

                  <input

                    type="checkbox"

                    checked={acceptedTerms}

                    onChange={(ev) => setAcceptedTerms(ev.target.checked)}

                    className="mt-1 h-4 w-4 rounded border-white/20 accent-cyan-400"

                  />

                  <span className="text-[13px] leading-relaxed text-zinc-400">

                    Я погоджуюся з{' '}

                    <a

                      href={`${getMarketingHomeUrl()}/#terms`}

                      target="_blank"

                      rel="noopener noreferrer"

                      className="text-cyan-300 hover:underline"

                    >

                      умовами використання

                    </a>{' '}

                    та політикою конфіденційності Traffic Cloud.

                  </span>

                </label>



                {error ? (

                  <p className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">

                    {error}

                  </p>

                ) : null}



                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

                  <motion.button

                    type="button"

                    whileHover={{ scale: 1.01 }}

                    whileTap={{ scale: 0.99 }}

                    disabled={paying || !acceptedTerms}

                    onClick={() => void subscribe()}

                    className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl border border-cyan-400/35 bg-gradient-to-r from-cyan-500/25 via-cyan-600/15 to-indigo-600/10 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_0_48px_-16px_rgba(34,211,238,0.65)] transition-shadow hover:shadow-[0_0_56px_-14px_rgba(34,211,238,0.75)] disabled:opacity-50 sm:flex-none sm:min-w-[220px]"

                  >

                    <Sparkles className="h-4 w-4" />

                    {isActive ? 'Продовжити підписку' : 'Оплатити місяць'}

                    <ExternalLink className="h-4 w-4 opacity-80" />

                  </motion.button>

                  <button

                    type="button"

                    onClick={() => void load()}

                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-3 text-sm text-zinc-400 transition-colors hover:border-white/[0.14] hover:text-white"

                  >

                    <RefreshCw className="h-4 w-4" />

                    Оновити статус

                  </button>

                  {isActive ? (

                    <motion.button

                      type="button"

                      whileHover={{ scale: 1.01 }}

                      whileTap={{ scale: 0.99 }}

                      onClick={() => {

                        selectSoftware('dm-outreach')

                        navigate('/')

                      }}

                      className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-100"

                    >

                      Увійти в панель

                    </motion.button>

                  ) : null}

                </div>

              </>

            )}

          </div>

        </motion.div>



        {isActive ? (

          <p className="mt-8 text-center text-[12px] text-zinc-600">

            Питання з оплатою?{' '}

            <Link to="/hub" className="text-accent hover:underline">

              Повернутися в Hub

            </Link>

          </p>

        ) : null}

      </main>

    </div>

  )

}


