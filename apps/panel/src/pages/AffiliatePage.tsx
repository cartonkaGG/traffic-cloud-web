import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import {
  Copy,
  DollarSign,
  Link2,
  Loader2,
  RefreshCw,
  Send,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react'
import { AffiliateStatsChart } from '@/components/affiliate/AffiliateStatsChart'
import {
  apiAffiliateBalance,
  apiAffiliateCategories,
  apiAffiliateGetLink,
  apiAffiliateMyLinks,
  apiAffiliateOffers,
  apiAffiliateRequestWithdrawal,
  apiAffiliateStats,
  apiAffiliateWithdrawals,
  type AffiliateBalanceInfo,
  type AffiliateCategory,
  type AffiliateLinkRow,
  type AffiliateOffer,
  type AffiliateWithdrawalRow
} from '@/lib/api'

function usd(n: number): string {
  return `$${n.toFixed(2)}`
}

function withdrawalStatusLabel(s: string): string {
  if (s === 'paid') return 'Виплачено'
  if (s === 'approved') return 'Схвалено'
  if (s === 'rejected') return 'Відхилено'
  return 'Очікує'
}

export function AffiliatePage(): JSX.Element {
  const [categories, setCategories] = useState<AffiliateCategory[]>([])
  const [offers, setOffers] = useState<AffiliateOffer[]>([])
  const [myLinks, setMyLinks] = useState<AffiliateLinkRow[]>([])
  const [balance, setBalance] = useState<AffiliateBalanceInfo | null>(null)
  const [daily, setDaily] = useState<{ date: string; joins: number; earnedUsd: number }[]>([])
  const [withdrawals, setWithdrawals] = useState<AffiliateWithdrawalRow[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [linkLoading, setLinkLoading] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawWallet, setWithdrawWallet] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [withdrawOk, setWithdrawOk] = useState(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [cats, bal, stats, links, wds] = await Promise.all([
        apiAffiliateCategories(),
        apiAffiliateBalance(),
        apiAffiliateStats(14),
        apiAffiliateMyLinks(),
        apiAffiliateWithdrawals()
      ])
      setCategories(cats.items)
      setBalance(bal)
      setDaily(stats.daily)
      setMyLinks(links.items)
      setWithdrawals(wds.items)
      const off = await apiAffiliateOffers(activeCategory || undefined)
      setOffers(off.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка завантаження')
    } finally {
      setLoading(false)
    }
  }, [activeCategory])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  useEffect(() => {
    void apiAffiliateOffers(activeCategory || undefined)
      .then((r) => setOffers(r.items))
      .catch(() => {})
  }, [activeCategory])

  const linksByOffer = useMemo(() => {
    const m = new Map<string, AffiliateLinkRow>()
    for (const l of myLinks) m.set(l.offerId, l)
    return m
  }, [myLinks])

  async function getLink(offerId: string): Promise<void> {
    setLinkLoading(offerId)
    try {
      const { link } = await apiAffiliateGetLink(offerId)
      setMyLinks((prev) => {
        const rest = prev.filter((l) => l.offerId !== offerId)
        const offer = offers.find((o) => o.id === offerId)
        return [
          {
            ...link,
            offerTitle: offer?.title,
            categoryName: offer?.categoryName ?? undefined,
            payoutPerJoinUsd: offer?.payoutPerJoinUsd
          },
          ...rest
        ]
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося створити посилання')
    } finally {
      setLinkLoading(null)
    }
  }

  function copyLink(url: string, id: string): void {
    void navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  async function submitWithdraw(e: FormEvent): Promise<void> {
    e.preventDefault()
    const amount = Number(withdrawAmount)
    if (!amount || !withdrawWallet.trim()) return
    setWithdrawing(true)
    setWithdrawOk(false)
    setError(null)
    try {
      await apiAffiliateRequestWithdrawal(amount, withdrawWallet.trim())
      setWithdrawAmount('')
      setWithdrawWallet('')
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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">
              Обирайте офер, отримуйте унікальне посилання та заробляйте за кожного підписника.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadAll()}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Оновити
          </button>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {loading && !balance ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        ) : (
          <>
            {balance ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Баланс', value: usd(balance.balanceUsd), icon: Wallet, accent: 'text-emerald-300' },
                  { label: 'Сьогодні підписників', value: String(balance.today.joins), icon: Users, accent: 'text-cyan-300' },
                  { label: 'Сьогодні заробіток', value: usd(balance.today.earnedUsd), icon: DollarSign, accent: 'text-amber-200' },
                  { label: 'Всього перегнано', value: String(balance.totalJoins), icon: TrendingUp, accent: 'text-violet-300' }
                ].map(({ label, value, icon: Icon, accent }) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Icon className="h-4 w-4" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
                    </div>
                    <div className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</div>
                  </motion.div>
                ))}
              </div>
            ) : null}

            {daily.length > 0 ? (
              <div className="mt-8">
                <AffiliateStatsChart daily={daily} />
              </div>
            ) : null}

            <section className="mt-10">
              <h2 className="text-lg font-semibold text-white">Офери</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory('')}
                  className={[
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    !activeCategory
                      ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                      : 'border-white/10 text-zinc-500 hover:text-zinc-300'
                  ].join(' ')}
                >
                  Усі
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCategory(c.slug)}
                    className={[
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      activeCategory === c.slug
                        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                        : 'border-white/10 text-zinc-500 hover:text-zinc-300'
                    ].join(' ')}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {offers.length === 0 ? (
                  <p className="text-sm text-zinc-500">Наразі немає активних оферів у цій категорії.</p>
                ) : (
                  offers.map((offer) => {
                    const link = linksByOffer.get(offer.id)
                    return (
                      <div
                        key={offer.id}
                        className="rounded-2xl border border-white/[0.08] bg-[#0c1019]/80 p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                              {offer.categoryName}
                            </span>
                            <h3 className="mt-1 text-base font-semibold text-white">{offer.title}</h3>
                            {offer.channelUsername ? (
                              <p className="mt-1 text-xs text-zinc-500">@{offer.channelUsername}</p>
                            ) : null}
                          </div>
                          <span className="shrink-0 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-sm font-semibold text-emerald-200">
                            {usd(offer.payoutPerJoinUsd)}/підп.
                          </span>
                        </div>
                        {offer.description ? (
                          <p className="mt-3 text-sm leading-relaxed text-zinc-500">{offer.description}</p>
                        ) : null}

                        {link ? (
                          <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/30 p-3">
                            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                              <Link2 className="h-3.5 w-3.5" />
                              Ваше посилання
                              {link.joins != null ? (
                                <span className="ml-auto text-cyan-400">{link.joins} підписників</span>
                              ) : null}
                            </div>
                            <div className="mt-2 flex gap-2">
                              <input
                                readOnly
                                value={link.inviteLink}
                                className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-zinc-300"
                              />
                              <button
                                type="button"
                                onClick={() => copyLink(link.inviteLink, link.id)}
                                className="flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.1] px-3 py-2 text-xs text-zinc-300 hover:text-white"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                {copied === link.id ? 'OK' : 'Копіювати'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={linkLoading === offer.id}
                            onClick={() => void getLink(offer.id)}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500/90 to-cyan-500/80 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            {linkLoading === offer.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Link2 className="h-4 w-4" />
                            )}
                            Отримати посилання
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </section>

            <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <h2 className="text-lg font-semibold text-white">Виведення коштів</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Доступно: {balance ? usd(balance.balanceUsd) : '—'}
                  {balance && balance.pendingUsd > 0 ? ` · в обробці ${usd(balance.pendingUsd)}` : ''}
                </p>
                <form onSubmit={(e) => void submitWithdraw(e)} className="mt-4 space-y-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Сума USD"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600"
                  />
                  <input
                    type="text"
                    placeholder="USDT TRC20 / гаманець"
                    value={withdrawWallet}
                    onChange={(e) => setWithdrawWallet(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600"
                  />
                  <button
                    type="submit"
                    disabled={withdrawing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 py-2.5 text-sm font-medium text-emerald-200 disabled:opacity-60"
                  >
                    {withdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Запросити виведення
                  </button>
                </form>
                {withdrawOk ? (
                  <p className="mt-3 text-sm text-emerald-400">Заявку надіслано. Очікуйте підтвердження адміна.</p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <h3 className="text-sm font-semibold text-white">Історія виведень</h3>
                <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                  {withdrawals.length === 0 ? (
                    <li className="text-sm text-zinc-600">Ще немає заявок</li>
                  ) : (
                    withdrawals.map((w) => (
                      <li
                        key={w.id}
                        className="flex items-center justify-between rounded-lg border border-white/[0.05] px-3 py-2 text-sm"
                      >
                        <span className="text-zinc-300">{usd(w.amountUsd)}</span>
                        <span className="text-xs text-zinc-500">{withdrawalStatusLabel(w.status)}</span>
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
