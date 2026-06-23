import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Bot,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X
} from 'lucide-react'
import {
  apiAdminAddAffiliateBotChannel,
  apiAdminAffiliateBots,
  apiAdminAffiliateCategories,
  apiAdminAffiliateLinks,
  apiAdminAffiliateOffers,
  apiAdminAffiliateOverview,
  apiAdminAffiliateWithdrawals,
  apiAdminAffiliateBotWebhookStatus,
  apiAdminCreateAffiliateBot,
  apiAdminCreateAffiliateCategory,
  apiAdminCreateAffiliateOffer,
  apiAdminDeleteAffiliateBot,
  apiAdminDeleteAffiliateBotChannel,
  apiAdminDeleteAffiliateOffer,
  apiAdminSetupAffiliateBotWebhook,
  apiAdminUpdateAffiliateCategory,
  apiAdminUpdateAffiliateOffer,
  apiAdminUpdateAffiliateWithdrawal,
  apiAdminVerifyAffiliateBot,
  type AdminAffiliateBot,
  type AdminAffiliateCategory,
  type AdminAffiliateLinkRow,
  type AdminAffiliateOffer,
  type AffiliateWithdrawalRow
} from '@/lib/api'

type Tab = 'bots' | 'offers' | 'links' | 'categories' | 'withdrawals'

function affiliateErrorMessage(code: string): string {
  const map: Record<string, string> = {
    missing_required_fields: 'Заповніть обовʼязкові поля',
    missing_channel: 'Вкажіть канал (@username або -100… для приватного)',
    bot_required: 'Спочатку додайте бота у вкладці «Боти»',
    channel_not_in_bot: 'Канал не в списку бота — додайте його в боті',
    offer_exists_for_channel: 'Для цього каналу вже є активний офер',
    invalid_payout: 'Виплата за підписника має бути більше 0',
    channel_not_found: 'Канал не знайдено',
    bot_not_in_channel: 'Бот не в каналі — додайте адміном',
    bot_must_be_admin: 'Бот має бути адміном каналу',
    channel_has_offer: 'Спочатку видаліть офер для цього каналу',
    bot_has_offers: 'Спочатку видаліть офери цього бота',
    bot_needs_invite_permission: 'Боту потрібне право запрошувати користувачів'
  }
  return map[code] ?? code
}

const offerFormDefaults = {
  categoryId: '',
  botId: '',
  channelTelegramId: '',
  title: '',
  description: '',
  payoutPerJoinUsd: '0.5',
  minWithdrawalUsd: '10',
  joinRequiresApproval: false
}

function syncOfferForm(
  f: typeof offerFormDefaults,
  cats: AdminAffiliateCategory[],
  bts: AdminAffiliateBot[]
): typeof offerFormDefaults {
  const validBotId =
    f.botId && bts.some((b) => b.id === f.botId) ? f.botId : bts[0]?.id ?? ''
  const bot = bts.find((b) => b.id === validBotId)
  const channels = bot?.channels ?? []
  const validChannelId =
    f.channelTelegramId &&
    channels.some((c) => String(c.channelTelegramId) === String(f.channelTelegramId))
      ? String(f.channelTelegramId)
      : channels[0]
        ? String(channels[0].channelTelegramId)
        : ''
  return {
    ...f,
    categoryId:
      f.categoryId && cats.some((c) => c.id === f.categoryId) ? f.categoryId : cats[0]?.id ?? '',
    botId: validBotId,
    channelTelegramId: validChannelId
  }
}

function parseApiError(err: unknown): string {
  const raw = err instanceof Error ? err.message : 'Помилка'
  const code = raw.replace(/\s*\(\d+\)\s*$/, '').trim()
  return affiliateErrorMessage(code)
}

export function AdminAffiliatePage(): JSX.Element {
  const [tab, setTab] = useState<Tab>('bots')
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
  const [bots, setBots] = useState<AdminAffiliateBot[]>([])
  const [withdrawals, setWithdrawals] = useState<AffiliateWithdrawalRow[]>([])
  const [partnerLinks, setPartnerLinks] = useState<AdminAffiliateLinkRow[]>([])
  const [linkOfferFilter, setLinkOfferFilter] = useState('')
  const [webhookInfo, setWebhookInfo] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const [catName, setCatName] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [botToken, setBotToken] = useState('')
  const [addChannelBotId, setAddChannelBotId] = useState('')
  const [addChannelRef, setAddChannelRef] = useState('')

  const [offerForm, setOfferForm] = useState(offerFormDefaults)

  const [editing, setEditing] = useState<AdminAffiliateOffer | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    payoutPerJoinUsd: '',
    minWithdrawalUsd: '',
    joinRequiresApproval: false,
    categoryId: ''
  })

  const selectedBot = useMemo(
    () => bots.find((b) => b.id === offerForm.botId) ?? null,
    [bots, offerForm.botId]
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ov, cats, offs, bts, wds] = await Promise.all([
        apiAdminAffiliateOverview(),
        apiAdminAffiliateCategories(),
        apiAdminAffiliateOffers(),
        apiAdminAffiliateBots(),
        apiAdminAffiliateWithdrawals()
      ])
      setOverview(ov)
      setCategories(cats.items)
      setOffers(offs.items)
      setBots(bts.items)
      setWithdrawals(wds.items)
      setOfferForm((f) => syncOfferForm(f, cats.items, bts.items))
      if (!addChannelBotId && bts.items[0]) setAddChannelBotId(bts.items[0].id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (tab === 'offers') void load()
  }, [tab])

  const loadPartnerLinks = useCallback(async () => {
    setBusy('links')
    try {
      const res = await apiAdminAffiliateLinks({
        offerId: linkOfferFilter || undefined
      })
      setPartnerLinks(res.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка')
    } finally {
      setBusy(null)
    }
  }, [linkOfferFilter])

  useEffect(() => {
    if (tab === 'links') void loadPartnerLinks()
  }, [tab, loadPartnerLinks])

  async function createBot(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!botToken.trim()) return
    setBusy('bot')
    setError(null)
    try {
      await apiAdminCreateAffiliateBot({ token: botToken.trim() })
      setBotToken('')
      await load()
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setBusy(null)
    }
  }

  async function addChannel(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!addChannelBotId || !addChannelRef.trim()) return
    setBusy('channel')
    setError(null)
    try {
      await apiAdminAddAffiliateBotChannel(addChannelBotId, addChannelRef.trim())
      setAddChannelRef('')
      await load()
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setBusy(null)
    }
  }

  async function deleteBot(botId: string): Promise<void> {
    if (!window.confirm('Видалити бота? Канали теж зникнуть. Офери спочатку треба видалити.')) return
    setBusy(`del-bot-${botId}`)
    setError(null)
    try {
      await apiAdminDeleteAffiliateBot(botId)
      await load()
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setBusy(null)
    }
  }

  async function deleteChannel(botId: string, channelId: string): Promise<void> {
    if (!window.confirm('Видалити канал зі списку бота?')) return
    setBusy(`del-ch-${channelId}`)
    try {
      await apiAdminDeleteAffiliateBotChannel(botId, channelId)
      await load()
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setBusy(null)
    }
  }

  async function deleteOffer(offerId: string): Promise<void> {
    if (!window.confirm('Видалити офер? Посилання партнерів і статистика по ньому зникнуть.')) return
    setBusy(`del-offer-${offerId}`)
    try {
      await apiAdminDeleteAffiliateOffer(offerId)
      await load()
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setBusy(null)
    }
  }

  function useChannelForOffer(botId: string, channelTelegramId: string): void {
    setTab('offers')
    setOfferForm((f) =>
      syncOfferForm({ ...f, botId, channelTelegramId: String(channelTelegramId) }, categories, bots)
    )
  }

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
      setError(parseApiError(err))
    } finally {
      setBusy(null)
    }
  }

  async function createOffer(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!offerForm.title.trim() || !offerForm.botId || !offerForm.channelTelegramId) {
      setError('Оберіть бота, канал і назву оферу')
      return
    }
    const payout = Number(offerForm.payoutPerJoinUsd)
    if (!payout || payout <= 0) {
      setError('Вкажіть виплату за підписника')
      return
    }
    setBusy('offer')
    setError(null)
    try {
      await apiAdminCreateAffiliateOffer({
        categoryId: offerForm.categoryId,
        botId: offerForm.botId,
        channelTelegramId: offerForm.channelTelegramId,
        title: offerForm.title.trim(),
        description: offerForm.description.trim() || undefined,
        joinRequiresApproval: offerForm.joinRequiresApproval,
        payoutPerJoinUsd: payout,
        minWithdrawalUsd: Number(offerForm.minWithdrawalUsd) || 10
      })
      setOfferForm((f) => ({
        ...f,
        title: '',
        description: '',
        channelTelegramId: ''
      }))
      await load()
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setBusy(null)
    }
  }

  function openEdit(o: AdminAffiliateOffer): void {
    setEditing(o)
    setEditForm({
      title: o.title,
      description: o.description ?? '',
      payoutPerJoinUsd: String(o.payoutPerJoinUsd),
      minWithdrawalUsd: String(o.minWithdrawalUsd),
      joinRequiresApproval: o.joinRequiresApproval,
      categoryId: o.categoryId
    })
  }

  async function saveEdit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!editing) return
    setBusy('edit')
    setError(null)
    try {
      await apiAdminUpdateAffiliateOffer(editing.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        categoryId: editForm.categoryId,
        payoutPerJoinUsd: Number(editForm.payoutPerJoinUsd),
        minWithdrawalUsd: Number(editForm.minWithdrawalUsd),
        joinRequiresApproval: editForm.joinRequiresApproval
      })
      setEditing(null)
      await load()
    } catch (err) {
      setError(parseApiError(err))
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
      setError(parseApiError(err))
    } finally {
      setBusy(null)
    }
  }

  async function setupBotWebhook(botId: string): Promise<void> {
    setBusy(`wh-bot-${botId}`)
    try {
      await apiAdminSetupAffiliateBotWebhook(botId)
      await load()
    } catch (err) {
      setError(parseApiError(err))
    } finally {
      setBusy(null)
    }
  }

  async function checkBotWebhook(botId: string): Promise<void> {
    setBusy(`wh-check-${botId}`)
    try {
      const info = await apiAdminAffiliateBotWebhookStatus(botId)
      const tg = info.telegram
      const summary = tg.error
        ? `Помилка: ${tg.error}`
        : `URL: ${tg.url || '—'}\nОчікується: ${info.expectedUrl}\nПодії: ${(tg.allowedUpdates ?? []).join(', ') || '—'}`
      setWebhookInfo((prev) => ({ ...prev, [botId]: summary }))
    } catch (err) {
      setError(parseApiError(err))
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
        <p className="text-sm text-zinc-500">
          Один бот на всі канали · webhook налаштовується автоматично · відписки враховуються.
        </p>
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

      <div className="mt-8 flex flex-wrap gap-2 border-b border-white/[0.06] pb-2">
        {(['bots', 'offers', 'links', 'categories', 'withdrawals'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              'rounded-lg px-4 py-2 text-sm font-medium',
              tab === t ? 'bg-violet-500/15 text-violet-200' : 'text-zinc-500 hover:text-zinc-300'
            ].join(' ')}
          >
            {t === 'bots'
              ? 'Боти'
              : t === 'offers'
                ? 'Офери'
                : t === 'links'
                  ? 'Посилання'
                  : t === 'categories'
                    ? 'Категорії'
                    : 'Виведення'}
          </button>
        ))}
      </div>

      {tab === 'bots' ? (
        <div className="mt-6 space-y-8">
          <form onSubmit={(e) => void createBot(e)} className="admin-stat-card space-y-3 max-w-xl">
            <h2 className="font-semibold text-white">Додати бота</h2>
            <p className="text-xs text-zinc-500">
              Токен з @BotFather. Webhook підключиться автоматично — він потрібен, щоб Telegram
              повідомляв про підписки та відписки в каналі.
            </p>
            <input
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Токен бота"
              className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
            />
            <button
              type="submit"
              disabled={busy === 'bot'}
              className="flex items-center gap-2 rounded-xl bg-violet-500/20 px-4 py-2 text-sm text-violet-200"
            >
              {busy === 'bot' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
              Зберегти бота
            </button>
          </form>

          <form onSubmit={(e) => void addChannel(e)} className="admin-stat-card grid gap-3 lg:grid-cols-3">
            <h2 className="font-semibold text-white lg:col-span-3">Додати канал до бота</h2>
            <select
              value={addChannelBotId}
              onChange={(e) => setAddChannelBotId(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
            >
              {bots.map((b) => (
                <option key={b.id} value={b.id}>
                  @{b.botUsername ?? b.label}
                </option>
              ))}
            </select>
            <input
              value={addChannelRef}
              onChange={(e) => setAddChannelRef(e.target.value)}
              placeholder="@channel або -1001234567890"
              className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
            />
            <button
              type="submit"
              disabled={busy === 'channel' || bots.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300"
            >
              {busy === 'channel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Додати канал
            </button>
            <p className="text-xs text-zinc-500 lg:col-span-3">
              Публічний канал — вкажіть @username. Приватний — числовий id на кшталт{' '}
              <span className="font-mono text-zinc-400">-1001234567890</span> (бот має бути адміном).
              Id дізнаєтесь: перешліть будь-який пост з каналу боту @userinfobot або @getidsbot.
              Якщо webhook увімкнено, канал може зʼявитися сам після додавання бота адміном — натисніть
              «Оновити».
            </p>
          </form>

          <div className="space-y-4">
            {bots.map((b) => (
              <div key={b.id} className="admin-stat-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">
                      @{b.botUsername ?? 'bot'} · {b.label}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      {b.channelCount} каналів · {b.offerCount} оферів ·{' '}
                      {b.webhookConfigured ? (
                        <span className="text-emerald-400">webhook OK</span>
                      ) : (
                        <span className="text-amber-300">webhook не налаштовано</span>
                      )}
                    </p>
                  </div>
                  {!b.webhookConfigured ? (
                    <button
                      type="button"
                      onClick={() => void setupBotWebhook(b.id)}
                      disabled={busy === `wh-bot-${b.id}`}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300"
                    >
                      {busy === `wh-bot-${b.id}` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Підключити webhook'
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      <button
                        type="button"
                        onClick={() => void checkBotWebhook(b.id)}
                        disabled={busy === `wh-check-${b.id}`}
                        className="rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-400 hover:text-white"
                      >
                        {busy === `wh-check-${b.id}` ? '…' : 'Перевірити'}
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => void deleteBot(b.id)}
                    disabled={busy === `del-bot-${b.id}`}
                    className="rounded-lg border border-red-500/30 px-2 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                    title="Видалити бота"
                  >
                    {busy === `del-bot-${b.id}` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                {webhookInfo[b.id] ? (
                  <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-white/[0.06] bg-black/30 p-2 text-[10px] text-zinc-400">
                    {webhookInfo[b.id]}
                  </pre>
                ) : null}
                {b.channels.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {b.channels.map((c) => (
                      <li key={c.id} className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => useChannelForOffer(b.id, c.channelTelegramId)}
                          className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-1.5 text-xs text-zinc-300 hover:border-emerald-500/30 hover:text-emerald-200"
                          title="Створити офер для цього каналу"
                        >
                          {c.channelTitle ||
                            (c.channelUsername ? `@${c.channelUsername}` : c.channelTelegramId)}
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteChannel(b.id, c.id)}
                          disabled={busy === `del-ch-${c.id}`}
                          className="rounded-lg border border-white/10 p-1 text-zinc-500 hover:text-red-300"
                          title="Видалити канал"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-xs text-zinc-600">Ще немає каналів — додайте @username вище.</p>
                )}
              </div>
            ))}
            {bots.length === 0 ? (
              <p className="text-sm text-zinc-500">Спочатку додайте бота.</p>
            ) : null}
          </div>
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
            <select
              value={offerForm.botId}
              onChange={(e) => {
                const botId = e.target.value
                const bot = bots.find((b) => b.id === botId)
                const firstCh = bot?.channels[0]
                setOfferForm((f) => ({
                  ...f,
                  botId,
                  channelTelegramId: firstCh ? String(firstCh.channelTelegramId) : ''
                }))
              }}
              className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
            >
              {bots.map((b) => (
                <option key={b.id} value={b.id}>
                  @{b.botUsername ?? b.label}
                </option>
              ))}
            </select>
            <select
              value={offerForm.channelTelegramId}
              onChange={(e) =>
                setOfferForm((f) => ({ ...f, channelTelegramId: e.target.value }))
              }
              className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white lg:col-span-2"
            >
              <option value="">
                {(selectedBot?.channels.length ?? 0) === 0
                  ? 'Немає каналів — додайте на вкладці «Боти»'
                  : 'Оберіть канал'}
              </option>
              {(selectedBot?.channels ?? []).map((c) => (
                <option key={c.id} value={String(c.channelTelegramId)}>
                  {c.channelTitle ||
                    (c.channelUsername ? `@${c.channelUsername}` : c.channelTelegramId)}
                </option>
              ))}
            </select>
            {(selectedBot?.channels.length ?? 0) > 0 ? (
              <p className="text-xs text-zinc-600 lg:col-span-2">
                Або натисніть канал на вкладці «Боти» — він підставиться сюди автоматично.
              </p>
            ) : null}
            <input
              value={offerForm.title}
              onChange={(e) => setOfferForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Назва оферу"
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
            <label className="flex items-center gap-2 text-sm text-zinc-400 lg:col-span-2">
              <input
                type="checkbox"
                checked={offerForm.joinRequiresApproval}
                onChange={(e) =>
                  setOfferForm((f) => ({ ...f, joinRequiresApproval: e.target.checked }))
                }
                className="rounded border-white/20"
              />
              Вхід лише після схвалення заявки (join request)
            </label>
            <textarea
              value={offerForm.description}
              onChange={(e) => setOfferForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Опис для партнерів"
              rows={2}
              className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white lg:col-span-2"
            />
            <button
              type="submit"
              disabled={busy === 'offer' || bots.length === 0}
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
                      {o.payoutPerJoinUsd}/підп. · {o.conversionCount} підп. ·{' '}
                      {o.joinRequiresApproval ? 'заявки з апрувом' : 'вхід без апруву'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(o)}
                      className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300"
                    >
                      <Pencil className="h-3 w-3" />
                      Редагувати
                    </button>
                    {!o.botVerified ? (
                      <button
                        type="button"
                        onClick={() => void verifyBot(o.id)}
                        disabled={busy === `verify-${o.id}`}
                        className="flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-300"
                      >
                        {busy === `verify-${o.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                        Перевірити
                      </button>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 self-center" />
                    )}
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
                    <button
                      type="button"
                      onClick={() => void deleteOffer(o.id)}
                      disabled={busy === `del-offer-${o.id}`}
                      className="flex items-center gap-1 rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-300"
                    >
                      {busy === `del-offer-${o.id}` ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
                  <div className="text-xs text-zinc-500">
                    {c.slug} · {c.offerCount} оферів
                  </div>
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

      {tab === 'links' ? (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={linkOfferFilter}
              onChange={(e) => setLinkOfferFilter(e.target.value)}
              className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
            >
              <option value="">Усі офери</option>
              {offers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void loadPartnerLinks()}
              disabled={busy === 'links'}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400"
            >
              <RefreshCw className={`h-4 w-4 ${busy === 'links' ? 'animate-spin' : ''}`} />
              Оновити
            </button>
          </div>

          {partnerLinks.length === 0 ? (
            <p className="text-sm text-zinc-500">Посилання партнерів ще не створені.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-3 py-2">Партнер</th>
                    <th className="px-3 py-2">Назва</th>
                    <th className="px-3 py-2">Офер</th>
                    <th className="px-3 py-2">Підп.</th>
                    <th className="px-3 py-2">Заробіток</th>
                    <th className="px-3 py-2">Посилання</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerLinks.map((l) => (
                    <tr key={l.id} className="border-b border-white/[0.04] text-zinc-300">
                      <td className="px-3 py-2">
                        <div className="text-white">{l.userEmail}</div>
                        <div className="text-[10px] text-zinc-600">{new Date(l.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-3 py-2 font-medium text-sky-200">{l.label}</td>
                      <td className="px-3 py-2">
                        <div>{l.offerTitle}</div>
                        <div className="text-[10px] text-zinc-600">{l.categoryName}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-cyan-300">{l.joins}</span>
                        {l.leaves > 0 ? (
                          <span className="text-zinc-500"> / −{l.leaves}</span>
                        ) : null}
                        <div className="text-[10px] text-zinc-600">всього {l.totalJoins}</div>
                      </td>
                      <td className="px-3 py-2 text-emerald-300">${l.earnedUsd.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <a
                          href={l.inviteLink}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all font-mono text-[11px] text-violet-300 hover:underline"
                        >
                          {l.inviteLink}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={(e) => void saveEdit(e)}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Редагувати офер</h2>
              <button type="button" onClick={() => setEditing(null)} className="text-zinc-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <select
                value={editForm.categoryId}
                onChange={(e) => setEditForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                value={editForm.title}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              />
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={editForm.payoutPerJoinUsd}
                  onChange={(e) => setEditForm((f) => ({ ...f, payoutPerJoinUsd: e.target.value }))}
                  placeholder="Виплата USD"
                  className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
                />
                <input
                  value={editForm.minWithdrawalUsd}
                  onChange={(e) => setEditForm((f) => ({ ...f, minWithdrawalUsd: e.target.value }))}
                  placeholder="Мін. виведення"
                  className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input
                  type="checkbox"
                  checked={editForm.joinRequiresApproval}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, joinRequiresApproval: e.target.checked }))
                  }
                />
                Вхід лише після схвалення заявки
              </label>
              <p className="text-xs text-zinc-600">
                Нові посилання партнерів отримають цей режим. Старі посилання не змінюються.
              </p>
            </div>
            <button
              type="submit"
              disabled={busy === 'edit'}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500/20 py-2.5 text-sm text-violet-200"
            >
              {busy === 'edit' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Зберегти
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
