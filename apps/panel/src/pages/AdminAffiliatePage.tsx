import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  Bot,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Webhook
} from 'lucide-react'
import {
  apiAdminAffiliateCategories,
  apiAdminAffiliateOffers,
  apiAdminAffiliateOverview,
  apiAdminAffiliateWithdrawals,
  apiAdminCreateAffiliateCategory,
  apiAdminCreateAffiliateOffer,
  apiAdminSetupAffiliateWebhook,
  apiAdminUpdateAffiliateCategory,
  apiAdminUpdateAffiliateOffer,
  apiAdminUpdateAffiliateWithdrawal,
  apiAdminVerifyAffiliateBot,
  type AdminAffiliateCategory,
  type AdminAffiliateOffer,
  type AffiliateWithdrawalRow
} from '@/lib/api'

type Tab = 'offers' | 'categories' | 'withdrawals'

function affiliateErrorMessage(code: string): string {
  const map: Record<string, string> = {
    missing_required_fields: 'Заповніть назву, канал, токен бота та виплату',
    missing_channel: 'Вкажіть канал (@username)',
    invalid_payout: 'Виплата за підписника має бути більше 0',
    channel_not_found: 'Канал не знайдено. Перевірте @username і що бот доданий у канал',
    not_a_channel: 'Це не Telegram-канал',
    bot_not_in_channel: 'Бот не в каналі — додайте його адміном',
    bot_must_be_admin: 'Бот має бути адміном каналу',
    bot_needs_invite_permission: 'Боту потрібне право запрошувати користувачів'
  }
  return map[code] ?? code
}

export function AdminAffiliatePage(): JSX.Element {
  const [tab, setTab] = useState<Tab>('offers')
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<{
    activeOffers: number
    totalConversions: number
    totalEarnedUsd: number
    pendingWithdrawals: number
    totalPaidUsd: number
  } | null>(null)
  const [categories, setCategories] = useState<AdminAffiliateCategory[]>([])
  const [offers, setOffers] = useState<AdminAffiliateOffer[]>([])
  const [withdrawals, setWithdrawals] = useState<AffiliateWithdrawalRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const [catName, setCatName] = useState('')
  const [catDesc, setCatDesc] = useState('')

  const [offerForm, setOfferForm] = useState({
    categoryId: '',
    title: '',
    description: '',
    channel: '',
    botToken: '',
    payoutPerJoinUsd: '0.5',
    minWithdrawalUsd: '10'
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ov, cats, offs, wds] = await Promise.all([
        apiAdminAffiliateOverview(),
        apiAdminAffiliateCategories(),
        apiAdminAffiliateOffers(),
        apiAdminAffiliateWithdrawals()
      ])
      setOverview(ov)
      setCategories(cats.items)
      setOffers(offs.items)
      setWithdrawals(wds.items)
      if (!offerForm.categoryId && cats.items[0]) {
        setOfferForm((f) => ({ ...f, categoryId: cats.items[0].id }))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setLoading(false)
    }
  }, [offerForm.categoryId])

  useEffect(() => {
    void load()
  }, [load])

  async function createCategory(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!catName.trim()) return
    setBusy('cat')
    try {
      await apiAdminCreateAffiliateCategory({ name: catName.trim(), description: catDesc.trim() || undefined })
      setCatName('')
      setCatDesc('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка')
    } finally {
      setBusy(null)
    }
  }

  async function createOffer(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!offerForm.title.trim() || !offerForm.channel.trim() || !offerForm.botToken.trim()) {
      setError('Заповніть назву, канал (@username) та токен бота')
      return
    }
    const payout = Number(offerForm.payoutPerJoinUsd)
    if (!payout || payout <= 0) {
      setError('Вкажіть виплату за підписника (більше 0)')
      return
    }
    setBusy('offer')
    setError(null)
    try {
      await apiAdminCreateAffiliateOffer({
        categoryId: offerForm.categoryId,
        title: offerForm.title.trim(),
        description: offerForm.description.trim() || undefined,
        channelUsername: offerForm.channel.trim(),
        botToken: offerForm.botToken.trim(),
        payoutPerJoinUsd: payout,
        minWithdrawalUsd: Number(offerForm.minWithdrawalUsd) || 10
      })
      setOfferForm((f) => ({
        ...f,
        title: '',
        description: '',
        channel: '',
        botToken: ''
      }))
      await load()
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Помилка'
      const code = raw.replace(/\s*\(\d+\)\s*$/, '').trim()
      setError(affiliateErrorMessage(code))
    } finally {
      setBusy(null)
    }
  }

  async function verifyBot(offerId: string): Promise<void> {
    setBusy(`verify-${offerId}`)
    try {
      await apiAdminVerifyAffiliateBot(offerId)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Бот не перевірений')
    } finally {
      setBusy(null)
    }
  }

  async function setupWebhook(offerId: string): Promise<void> {
    setBusy(`wh-${offerId}`)
    try {
      await apiAdminSetupAffiliateWebhook(offerId)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Webhook не налаштовано')
    } finally {
      setBusy(null)
    }
  }

  async function toggleOfferActive(o: AdminAffiliateOffer): Promise<void> {
    setBusy(`toggle-${o.id}`)
    try {
      await apiAdminUpdateAffiliateOffer(o.id, { isActive: !o.isActive })
      await load()
    } finally {
      setBusy(null)
    }
  }

  async function updateWithdrawal(id: string, status: string): Promise<void> {
    setBusy(`wd-${id}`)
    try {
      await apiAdminUpdateAffiliateWithdrawal(id, { status })
      await load()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">Категорії, офери, боти та виведення партнерів.</p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
            <button type="button" className="ml-3 underline" onClick={() => setError(null)}>
              Закрити
            </button>
          </div>
        ) : null}

        {overview ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Активні офери', overview.activeOffers],
              ['Конверсії', overview.totalConversions],
              ['Зароблено', `$${overview.totalEarnedUsd.toFixed(2)}`],
              ['Очікують виведення', overview.pendingWithdrawals],
              ['Виплачено', `$${overview.totalPaidUsd.toFixed(2)}`]
            ].map(([label, val]) => (
              <div key={String(label)} className="admin-stat-card">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
                <div className="mt-1 text-xl font-semibold text-white">{val}</div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex gap-2 border-b border-white/[0.06] pb-2">
          {(['offers', 'categories', 'withdrawals'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={[
                'rounded-lg px-4 py-2 text-sm font-medium',
                tab === t ? 'bg-violet-500/15 text-violet-200' : 'text-zinc-500 hover:text-zinc-300'
              ].join(' ')}
            >
              {t === 'offers' ? 'Офери' : t === 'categories' ? 'Категорії' : 'Виведення'}
            </button>
          ))}
        </div>

        {tab === 'categories' ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <form onSubmit={(e) => void createCategory(e)} className="admin-stat-card space-y-3">
              <h2 className="font-semibold text-white">Нова категорія</h2>
              <input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Крипто Telegram-канали"
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              />
              <textarea
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Опис категорії"
                rows={2}
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              />
              <button
                type="submit"
                disabled={busy === 'cat'}
                className="flex items-center gap-2 rounded-xl bg-violet-500/20 px-4 py-2 text-sm text-violet-200"
              >
                {busy === 'cat' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Додати
              </button>
            </form>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.id} className="admin-stat-card flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{c.name}</div>
                    <div className="text-xs text-zinc-500">{c.slug} · {c.offerCount} оферів</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      void apiAdminUpdateAffiliateCategory(c.id, { isActive: !c.isActive }).then(() => load())
                    }
                    className={[
                      'rounded-lg px-2 py-1 text-xs',
                      c.isActive ? 'text-emerald-400' : 'text-zinc-600'
                    ].join(' ')}
                  >
                    {c.isActive ? 'Активна' : 'Вимкнена'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {tab === 'offers' ? (
          <div className="mt-6 space-y-8">
            <form onSubmit={(e) => void createOffer(e)} className="admin-stat-card grid gap-3 lg:grid-cols-2">
              <h2 className="font-semibold text-white lg:col-span-2">Новий офер</h2>
              <select
                value={offerForm.categoryId}
                onChange={(e) => setOfferForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                value={offerForm.title}
                onChange={(e) => setOfferForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Назва оферу"
                className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              />
              <input
                value={offerForm.channel}
                onChange={(e) => setOfferForm((f) => ({ ...f, channel: e.target.value }))}
                placeholder="Канал @username"
                className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white lg:col-span-2"
              />
              <input
                value={offerForm.botToken}
                onChange={(e) => setOfferForm((f) => ({ ...f, botToken: e.target.value }))}
                placeholder="Токен бота (@BotFather)"
                className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white lg:col-span-2"
              />
              <input
                value={offerForm.payoutPerJoinUsd}
                onChange={(e) => setOfferForm((f) => ({ ...f, payoutPerJoinUsd: e.target.value }))}
                placeholder="Виплата за підписника USD"
                className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              />
              <input
                value={offerForm.minWithdrawalUsd}
                onChange={(e) => setOfferForm((f) => ({ ...f, minWithdrawalUsd: e.target.value }))}
                placeholder="Мін. виведення USD"
                className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              />
              <textarea
                value={offerForm.description}
                onChange={(e) => setOfferForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Опис для партнерів"
                rows={2}
                className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white lg:col-span-2"
              />
              <p className="text-xs text-zinc-500 lg:col-span-2">
                1. Створіть бота в @BotFather · 2. Додайте його адміном у канал з правом «запрошувати
                користувачів» · 3. Вкажіть лише @username каналу — chat id визначиться автоматично · 4.
                Після створення натисніть «Перевірити бота» та «Webhook».
              </p>
              <button
                type="submit"
                disabled={busy === 'offer'}
                className="flex items-center gap-2 rounded-xl bg-violet-500/20 px-4 py-2 text-sm text-violet-200 lg:col-span-2"
              >
                {busy === 'offer' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Створити офер
              </button>
            </form>

            <div className="space-y-3">
              {offers.map((o) => (
                <div key={o.id} className="admin-stat-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-zinc-500">{o.categoryName}</div>
                      <h3 className="font-semibold text-white">{o.title}</h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        {o.channelUsername ? `@${o.channelUsername}` : o.channelTelegramId} · $
                        {o.payoutPerJoinUsd}/підп. · {o.conversionCount} конверсій
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void verifyBot(o.id)}
                        disabled={busy === `verify-${o.id}`}
                        className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300"
                      >
                        {busy === `verify-${o.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : o.botVerified ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                        Бот
                      </button>
                      <button
                        type="button"
                        onClick={() => void setupWebhook(o.id)}
                        disabled={busy === `wh-${o.id}`}
                        className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300"
                      >
                        {busy === `wh-${o.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : o.webhookConfigured ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Webhook className="h-3 w-3" />
                        )}
                        Webhook
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleOfferActive(o)}
                        className={[
                          'rounded-lg px-2 py-1 text-xs',
                          o.isActive ? 'text-emerald-400' : 'text-zinc-600'
                        ].join(' ')}
                      >
                        {o.isActive ? 'Активний' : 'Вимкнений'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {tab === 'withdrawals' ? (
          <div className="mt-6 space-y-2">
            {withdrawals.length === 0 ? (
              <p className="text-sm text-zinc-500">Немає заявок</p>
            ) : (
              withdrawals.map((w) => (
                <div key={w.id} className="admin-stat-card flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">${w.amountUsd.toFixed(2)}</div>
                    <div className="text-xs text-zinc-500">{w.userEmail}</div>
                    <div className="mt-1 font-mono text-xs text-zinc-400">{w.walletInfo}</div>
                  </div>
                  <div className="flex gap-2">
                    {(['approved', 'paid', 'rejected'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={busy === `wd-${w.id}`}
                        onClick={() => void updateWithdrawal(w.id, s)}
                        className="rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-400 hover:text-white"
                      >
                        {s === 'approved' ? 'Схвалити' : s === 'paid' ? 'Виплачено' : 'Відхилити'}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
    </div>
  )
}
