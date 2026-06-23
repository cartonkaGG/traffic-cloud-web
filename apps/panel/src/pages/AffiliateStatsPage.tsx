import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { DollarSign, Loader2, RefreshCw, Send, TrendingUp, Users, Wallet } from 'lucide-react'
import { AffiliateStatsChart } from '@/components/affiliate/AffiliateStatsChart'
import {
  apiAffiliateBalance,
  apiAffiliateRequestWithdrawal,
  apiAffiliateStats,
  apiAffiliateWithdrawals,
  type AffiliateBalanceInfo,
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

export function AffiliateStatsPage(): JSX.Element {
  const [balance, setBalance] = useState<AffiliateBalanceInfo | null>(null)
  const [daily, setDaily] = useState<{ date: string; joins: number; earnedUsd: number }[]>([])
  const [withdrawals, setWithdrawals] = useState<AffiliateWithdrawalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawWallet, setWithdrawWallet] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [withdrawOk, setWithdrawOk] = useState(false)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [bal, stats, wds] = await Promise.all([
        apiAffiliateBalance(),
        apiAffiliateStats(14),
        apiAffiliateWithdrawals()
      ])
      setBalance(bal)
      setDaily(stats.daily)
      setWithdrawals(wds.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка завантаження')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

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
        <p className="text-sm text-zinc-500">Баланс, діаграми та виведення коштів.</p>
        <button
          type="button"
          onClick={() => void loadStats()}
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
                <div
                  key={label}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
                >
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Icon className="h-4 w-4" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
                  </div>
                  <div className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</div>
                </div>
              ))}
            </div>
          ) : null}

          {daily.length > 0 ? (
            <div className="mt-8">
              <AffiliateStatsChart daily={daily} />
            </div>
          ) : null}

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
