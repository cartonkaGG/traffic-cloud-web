import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  DollarSign,
  Loader2,
  RefreshCw,
  Send,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react'
import { AffiliateLinkBreakdown } from '@/components/affiliate/AffiliateLinkBreakdown'
import { AffiliateStatsChart } from '@/components/affiliate/AffiliateStatsChart'
import { networkById, PAY_NETWORKS, type PayNetworkId } from '@/lib/billingNetworks'
import {
  apiAffiliateBalance,
  apiAffiliateMyLinks,
  apiAffiliateRequestWithdrawal,
  apiAffiliateStats,
  apiAffiliateWithdrawals,
  type AffiliateBalanceInfo,
  type AffiliateLinkRow,
  type AffiliateLinkStat,
  type AffiliatePeriodSummary,
  type AffiliateWithdrawalRow
} from '@/lib/api'

const PERIODS = [
  { days: 3, label: '3 дні' },
  { days: 7, label: '7 днів' },
  { days: 30, label: '30 днів' }
] as const

function usd(n: number): string {
  return `$${n.toFixed(2)}`
}

function withdrawalStatusLabel(s: string): string {
  if (s === 'paid') return 'Виплачено'
  if (s === 'approved') return 'Схвалено'
  if (s === 'rejected') return 'Відхилено'
  return 'Очікує'
}

export function AffiliateStatsPage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams()
  const offerId = searchParams.get('offer') ?? ''
  const linkId = searchParams.get('link') ?? ''
  const periodDays = Number(searchParams.get('days') ?? '7')
  const days = PERIODS.some((p) => p.days === periodDays) ? periodDays : 7

  const [balance, setBalance] = useState<AffiliateBalanceInfo | null>(null)
  const [daily, setDaily] = useState<
    { date: string; joins: number; leaves: number; earnedUsd: number }[]
  >([])
  const [byLink, setByLink] = useState<AffiliateLinkStat[]>([])
  const [summary, setSummary] = useState<AffiliatePeriodSummary | null>(null)
  const [withdrawals, setWithdrawals] = useState<AffiliateWithdrawalRow[]>([])
  const [myLinks, setMyLinks] = useState<AffiliateLinkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [payNetwork, setPayNetwork] = useState<PayNetworkId>('trc20')
  const [withdrawing, setWithdrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [withdrawOk, setWithdrawOk] = useState(false)
  const [selectedChartDate, setSelectedChartDate] = useState<string | null>(null)

  const selectedLink = useMemo(
    () => myLinks.find((l) => l.id === linkId) ?? null,
    [myLinks, linkId]
  )

  const offerOptions = useMemo(
    () => [...new Map(myLinks.map((l) => [l.offerId, l])).values()],
    [myLinks]
  )

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const filterOffer = offerId || undefined
      const filterLink = linkId || undefined
      const [bal, stats, wds, links] = await Promise.all([
        apiAffiliateBalance(filterOffer),
        apiAffiliateStats(days, filterOffer, filterLink),
        apiAffiliateWithdrawals(),
        apiAffiliateMyLinks()
      ])
      setBalance(bal)
      setDaily(stats.daily)
      setByLink(stats.byLink)
      setSummary(stats.summary)
      setWithdrawals(wds.items)
      setMyLinks(links.items)
      setSelectedChartDate(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка завантаження')
    } finally {
      setLoading(false)
    }
  }, [offerId, linkId, days])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  function updateParams(patch: Record<string, string | null>): void {
    const params: Record<string, string> = {}
    const nextOffer = patch.offer !== undefined ? patch.offer : offerId
    const nextLink = patch.link !== undefined ? patch.link : linkId
    const nextDays = patch.days !== undefined ? patch.days : String(days)
    if (nextOffer) params.offer = nextOffer
    if (nextLink) params.link = nextLink
    if (nextDays && nextDays !== '7') params.days = nextDays
    setSearchParams(params)
  }

  async function submitWithdraw(e: FormEvent): Promise<void> {
    e.preventDefault()
    const amount = Number(withdrawAmount)
    const address = withdrawAddress.trim()
    if (!amount || !address) return
    const net = networkById(payNetwork)
    const walletInfo = `USDT ${net.label} · ${address}`
    setWithdrawing(true)
    setWithdrawOk(false)
    setError(null)
    try {
      await apiAffiliateRequestWithdrawal(amount, walletInfo)
      setWithdrawAmount('')
      setWithdrawAddress('')
      setWithdrawOk(true)
      const [bal, wds] = await Promise.all([apiAffiliateBalance(), apiAffiliateWithdrawals()])
      setBalance(bal)
      setWithdrawals(wds.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка виведення')
    } finally {
      setWithdrawing(false)
    }
  }

  const period = summary ?? {
    joins: 0,
    leaves: 0,
    netJoins: 0,
    earnedUsd: 0,
    lostUsd: 0,
    netEarnedUsd: 0,
    activeJoins: balance?.totalJoins ?? 0
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Статистика</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Аналітика по методах заливу, оферах і виведення USDT. Відписки автоматично списуються з балансу.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadStats()}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-zinc-400 transition hover:border-white/15 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Оновити
        </button>
      </motion.div>

      <div className="mt-6 flex flex-wrap gap-2">
        {PERIODS.map((p) => {
          const active = days === p.days
          return (
            <button
              key={p.days}
              type="button"
              onClick={() => updateParams({ days: String(p.days) })}
              className={[
                'cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition-all',
                active
                  ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100'
                  : 'border-white/[0.08] text-zinc-500 hover:border-white/15 hover:text-zinc-200'
              ].join(' ')}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {myLinks.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            value={offerId}
            onChange={(e) => updateParams({ offer: e.target.value || null, link: null })}
            className="cursor-pointer rounded-xl border border-white/[0.08] bg-[#0a0e14] px-3 py-2 text-sm text-white outline-none focus:border-white/20"
          >
            <option value="">Усі офери</option>
            {offerOptions.map((l) => (
              <option key={l.offerId} value={l.offerId}>
                {l.offerTitle ?? l.offerId}
              </option>
            ))}
          </select>
          {selectedLink ? (
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400">
              Метод: <span className="text-white">{selectedLink.label}</span>
            </span>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading && !balance ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : (
        <>
          {balance ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {[
                {
                  label: 'Баланс',
                  value: usd(balance.balanceUsd),
                  sub: balance.pendingUsd > 0 ? `в обробці ${usd(balance.pendingUsd)}` : undefined,
                  icon: Wallet,
                  accent: 'text-emerald-300'
                },
                {
                  label: `Підписки (${days} д.)`,
                  value: `+${period.joins}`,
                  icon: TrendingUp,
                  accent: 'text-cyan-300'
                },
                {
                  label: `Відписки (${days} д.)`,
                  value: `−${period.leaves}`,
                  icon: TrendingDown,
                  accent: 'text-rose-300'
                },
                {
                  label: 'Чистий приріст',
                  value: `${period.netJoins >= 0 ? '+' : ''}${period.netJoins}`,
                  icon: Users,
                  accent: 'text-violet-300'
                },
                {
                  label: 'Нараховано',
                  value: usd(period.earnedUsd),
                  sub: period.lostUsd > 0 ? `списано ${usd(period.lostUsd)}` : undefined,
                  icon: DollarSign,
                  accent: 'text-amber-200'
                },
                {
                  label: 'Чистий прибуток',
                  value: usd(period.netEarnedUsd),
                  sub: `${period.activeJoins} активних`,
                  icon: TrendingUp,
                  accent: period.netEarnedUsd >= 0 ? 'text-emerald-300' : 'text-rose-300'
                }
              ].map(({ label, value, sub, icon: Icon, accent }) => (
                <motion.div
                  key={label}
                  layout
                  className="rounded-2xl border border-white/[0.06] bg-[#0a0e14]/60 p-4"
                >
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
                  </div>
                  <div className={`mt-2 text-2xl font-semibold tabular-nums ${accent}`}>{value}</div>
                  {sub ? <div className="mt-1 text-[11px] text-zinc-600">{sub}</div> : null}
                </motion.div>
              ))}
            </div>
          ) : null}

          {daily.length > 0 ? (
            <div className="mt-8">
              <AffiliateStatsChart
                daily={daily}
                selectedDate={selectedChartDate}
                onSelectDate={setSelectedChartDate}
              />
            </div>
          ) : null}

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">Методи заливу</h3>
              <span className="text-[11px] text-zinc-600">Назва посилання = джерело трафіку</span>
            </div>
            <AffiliateLinkBreakdown
              rows={byLink}
              selectedLinkId={linkId}
              onSelectLink={(id) => updateParams({ link: id || null })}
              showOffer={!offerId}
            />
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0e14]/60 p-5">
              <h2 className="text-lg font-semibold text-white">Виведення USDT</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Доступно: {balance ? usd(balance.balanceUsd) : '—'}
              </p>

              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  Мережа
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {PAY_NETWORKS.map((net) => {
                    const active = payNetwork === net.id
                    return (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setPayNetwork(net.id)}
                        className={[
                          'cursor-pointer rounded-xl border px-3 py-3 text-left transition-all',
                          active
                            ? 'border-emerald-400/35 bg-emerald-500/10 text-white'
                            : 'border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:border-white/15'
                        ].join(' ')}
                      >
                        <span className="block text-sm font-semibold">{net.label}</span>
                        <span className="mt-0.5 block text-[11px] opacity-70">{net.chain}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <form onSubmit={(e) => void submitWithdraw(e)} className="mt-4 space-y-3">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Сума USD"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/30"
                />
                <input
                  type="text"
                  placeholder={`Адреса USDT ${networkById(payNetwork).label}`}
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/30"
                />
                <button
                  type="submit"
                  disabled={withdrawing}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 py-2.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-60"
                >
                  {withdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Запросити виведення
                </button>
              </form>
              {withdrawOk ? (
                <p className="mt-3 text-sm text-emerald-400">
                  Заявку надіслано. Очікуйте підтвердження адміна.
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-[#0a0e14]/60 p-5">
              <h3 className="text-sm font-semibold text-white">Історія виведень</h3>
              <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
                {withdrawals.length === 0 ? (
                  <li className="text-sm text-zinc-600">Ще немає заявок</li>
                ) : (
                  withdrawals.map((w) => (
                    <li
                      key={w.id}
                      className="rounded-xl border border-white/[0.05] bg-black/20 px-3 py-2.5 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-zinc-200">{usd(w.amountUsd)}</span>
                        <span className="text-xs text-zinc-500">{withdrawalStatusLabel(w.status)}</span>
                      </div>
                      {w.walletInfo ? (
                        <p className="mt-1 truncate text-[11px] text-zinc-600">{w.walletInfo}</p>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
