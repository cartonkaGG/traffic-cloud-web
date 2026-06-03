import { Plus, SlidersHorizontal, UserCircle, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { TelegramAccountCard } from '@/components/accounts/TelegramAccountCard'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import { useToast } from '@/context/ToastContext'
import * as mocks from '@/data/mocks'
import type { ChatSourceModel, TelegramAccountModel, TelegramAccountStatus } from '@/domain/types'
import {
  apiCreateTelegramAccount,
  apiDeleteTelegramAccount,
  apiTelegramAccountMtprotoComplete,
  apiTelegramAccountMtprotoSendCode,
  apiTelegramAccountOutreachStart,
  apiTelegramAccountsBulkAbout
} from '@/lib/api'
import { readOutreachFiltersFromStorage } from '@/lib/outreachFiltersStorage'
import {
  launchAntidetectBrowserForAccount,
  launchAntidetectFromPayload
} from '@/lib/launchAntidetectBrowser'
import { useCallback, useMemo, useRef, useState } from 'react'

type SortKey = 'created_desc' | 'created_asc'

const STATUS_OPTIONS: Array<{ value: TelegramAccountStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Все статусы' },
  { value: 'active', label: 'Активный' },
  { value: 'warming', label: 'Прогрев' },
  { value: 'flood', label: 'FloodWait' },
  { value: 'limited', label: 'Ограничен' },
  { value: 'banned', label: 'Заблокирован' },
  { value: 'disconnected', label: 'Офлайн' }
]

function parsePort(raw: string): number | null {
  const n = Number(raw.trim())
  if (!Number.isFinite(n) || n < 1 || n > 65535) return null
  return Math.floor(n)
}

export function AccountsPage(): JSX.Element {
  const { bundle, workspaceId, status, refetch } = useWorkspaceData()
  const { pushToast } = useToast()

  const telegramAccounts = bundle?.telegramAccounts ?? mocks.telegramAccounts
  const proxiesList = bundle?.proxies ?? mocks.proxies

  const proxyLabel = useMemo(() => {
    const m: Record<string, string> = {}
    for (const p of proxiesList) m[p.id] = p.label
    return m
  }, [proxiesList])

  const [addOpen, setAddOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [proxyHost, setProxyHost] = useState('')
  const [proxyPort, setProxyPort] = useState('')
  const [proxyType, setProxyType] = useState<'http' | 'socks5'>('http')
  const [proxyUser, setProxyUser] = useState('')
  const [proxyPass, setProxyPass] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TelegramAccountStatus | 'all'>('all')
  const [proxyFilter, setProxyFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_desc')
  const [launchingAccountId, setLaunchingAccountId] = useState<string | null>(null)

  const chatSources = bundle?.chatSources ?? mocks.chatSources

  const [mtprotoAccount, setMtprotoAccount] = useState<TelegramAccountModel | null>(null)
  const [mtprotoPhone, setMtprotoPhone] = useState('')
  const [mtprotoCode, setMtprotoCode] = useState('')
  const [mtprotoPassword, setMtprotoPassword] = useState('')
  const [mtprotoForceSms, setMtprotoForceSms] = useState(false)
  const [mtprotoBusy, setMtprotoBusy] = useState(false)
  const [mtprotoErr, setMtprotoErr] = useState<string | null>(null)
  const [mtprotoAwait2fa, setMtprotoAwait2fa] = useState(false)
  const [mtprotoCodeHint, setMtprotoCodeHint] = useState<string | null>(null)
  const mtprotoRequestAbortRef = useRef<AbortController | null>(null)

  const [spamAccount, setSpamAccount] = useState<TelegramAccountModel | null>(null)
  const [spamSourceId, setSpamSourceId] = useState('')
  const [spamMax, setSpamMax] = useState('40')
  const [spamDelay, setSpamDelay] = useState('2800')
  const [spamBusy, setSpamBusy] = useState(false)
  const [spamErr, setSpamErr] = useState<string | null>(null)

  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null)

  const [bulkAbout, setBulkAbout] = useState('')
  const [bulkAboutBusy, setBulkAboutBusy] = useState(false)

  const resetForm = useCallback(() => {
    setUsername('')
    setPhone('')
    setProxyHost('')
    setProxyPort('')
    setProxyType('http')
    setProxyUser('')
    setProxyPass('')
    setFormError(null)
  }, [])

  const closeAdd = useCallback(() => {
    if (busy) return
    setAddOpen(false)
    resetForm()
  }, [busy, resetForm])

  const filteredAccounts = useMemo(() => {
    let list: TelegramAccountModel[] = [...telegramAccounts]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((a) => {
        const u = (a.username ?? '').toLowerCase()
        const l = a.label.toLowerCase()
        return u.includes(q) || l.includes(q) || `@${u}`.includes(q)
      })
    }
    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter)
    }
    if (proxyFilter !== 'all') {
      list = list.filter((a) => a.proxyId === proxyFilter)
    }
    return list
  }, [telegramAccounts, search, statusFilter, proxyFilter])

  const openAntidetectForAccount = useCallback(
    async (account: TelegramAccountModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Нет подключения к API', 'error')
        return
      }
      setLaunchingAccountId(account.id)
      try {
        const r = await launchAntidetectBrowserForAccount({
          workspaceId,
          account,
          browserProfiles: bundle?.browserProfiles ?? [],
          proxies: proxiesList
        })
        if (!r.ok) {
          pushToast(r.error, 'error')
          return
        }
        await refetch()
        pushToast('Профиль відкрито в anti-detect браузері', 'ok')
      } finally {
        setLaunchingAccountId(null)
      }
    },
    [workspaceId, status, bundle?.browserProfiles, proxiesList, refetch, pushToast]
  )

  const openMtprotoModal = useCallback((account: TelegramAccountModel) => {
    setMtprotoErr(null)
    setMtprotoAwait2fa(false)
    setMtprotoCodeHint(null)
    setMtprotoCode('')
    setMtprotoPassword('')
    const ph =
      account.phone && account.phone !== '—'
        ? account.phone.replace(/[^\d+]/g, '') || account.phone.trim()
        : ''
    setMtprotoPhone(ph)
    setMtprotoForceSms(false)
    setMtprotoAccount(account)
  }, [])

  const closeMtprotoModal = useCallback(() => {
    mtprotoRequestAbortRef.current?.abort()
    mtprotoRequestAbortRef.current = null
    setMtprotoAccount(null)
    setMtprotoErr(null)
    setMtprotoAwait2fa(false)
    setMtprotoCodeHint(null)
    setMtprotoCode('')
    setMtprotoPassword('')
  }, [])

  const sendMtprotoCode = useCallback(async () => {
    if (!workspaceId || status !== 'online' || !mtprotoAccount) {
      pushToast('Нет подключения к API', 'error')
      return
    }
    const ph = mtprotoPhone.trim()
    if (!ph) {
      setMtprotoErr('Вкажіть номер телефона')
      return
    }
    mtprotoRequestAbortRef.current?.abort()
    const ac = new AbortController()
    mtprotoRequestAbortRef.current = ac
    setMtprotoBusy(true)
    setMtprotoErr(null)
    try {
      const r = await apiTelegramAccountMtprotoSendCode(
        workspaceId,
        mtprotoAccount.id,
        {
          phone: ph,
          forceSMS: mtprotoForceSms
        },
        { signal: ac.signal }
      )
      setMtprotoCodeHint(
        r.isCodeViaApp
          ? 'Код у застосунку Telegram на цьому номері. За потреби увімкніть «Лише SMS» і надішліть код знову.'
          : 'Код надіслано SMS.'
      )
      if (r.httpProxySkipped) {
        pushToast(
          'Для MTProto HTTP-проксі не підтримується GramJS — з’єднання з Telegram без проксі. Для проксі використайте SOCKS5 у картці акаунта.',
          'info'
        )
      }
      pushToast('Код надіслано', 'ok')
    } catch (e) {
      if (ac.signal.aborted) return
      const msg = e instanceof Error ? e.message : String(e)
      setMtprotoErr(msg)
      pushToast(msg, 'error')
    } finally {
      if (mtprotoRequestAbortRef.current === ac) mtprotoRequestAbortRef.current = null
      setMtprotoBusy(false)
    }
  }, [
    workspaceId,
    status,
    mtprotoAccount,
    mtprotoPhone,
    mtprotoForceSms,
    pushToast
  ])

  const completeMtprotoLogin = useCallback(async () => {
    if (!workspaceId || status !== 'online' || !mtprotoAccount) {
      pushToast('Нет подключения к API', 'error')
      return
    }
    if (!mtprotoAwait2fa && !mtprotoCode.trim()) {
      setMtprotoErr('Введіть код з Telegram або SMS')
      return
    }
    if (mtprotoAwait2fa && !mtprotoPassword.trim()) {
      setMtprotoErr('Введіть пароль 2FA')
      return
    }
    mtprotoRequestAbortRef.current?.abort()
    const ac = new AbortController()
    mtprotoRequestAbortRef.current = ac
    setMtprotoBusy(true)
    setMtprotoErr(null)
    try {
      const r = await apiTelegramAccountMtprotoComplete(
        workspaceId,
        mtprotoAccount.id,
        {
          phoneCode: mtprotoAwait2fa ? '' : mtprotoCode.trim(),
          password: mtprotoPassword.trim() || null
        },
        { signal: ac.signal }
      )
      if (r.ok) {
        pushToast('MTProto-сесію збережено. Можна «Запустити спам» по розпарсеній базі.', 'ok')
        closeMtprotoModal()
        await refetch()
        return
      }
      if (r.twoFactorRequired) {
        setMtprotoAwait2fa(true)
        pushToast('Потрібен пароль двофакторної аутентифікації Telegram.', 'info')
        return
      }
      setMtprotoErr(r.message)
      pushToast(r.message, 'error')
    } catch (e) {
      if (ac.signal.aborted) return
      const msg = e instanceof Error ? e.message : String(e)
      setMtprotoErr(msg)
      pushToast(msg, 'error')
    } finally {
      if (mtprotoRequestAbortRef.current === ac) mtprotoRequestAbortRef.current = null
      setMtprotoBusy(false)
    }
  }, [
    workspaceId,
    status,
    mtprotoAccount,
    mtprotoCode,
    mtprotoPassword,
    mtprotoAwait2fa,
    refetch,
    pushToast,
    closeMtprotoModal
  ])

  const openSpamModal = useCallback(
    (account: TelegramAccountModel) => {
      setSpamErr(null)
      setSpamAccount(account)
      const first = chatSources[0]?.id ?? ''
      setSpamSourceId(first)
      setSpamMax('40')
      setSpamDelay('2800')
    },
    [chatSources]
  )

  const closeSpamModal = useCallback(() => {
    if (spamBusy) return
    setSpamAccount(null)
    setSpamErr(null)
  }, [spamBusy])

  const startSpamOutreach = useCallback(async () => {
    if (!workspaceId || status !== 'online' || !spamAccount) return
    if (!spamSourceId) {
      setSpamErr('Оберіть джерело аудиторії (спочатку розпарсіть чат у «Джерела»).')
      return
    }
    const maxN = Number(spamMax)
    const delayN = Number(spamDelay)
    if (!Number.isFinite(maxN) || maxN < 1) {
      setSpamErr('Ліміт повідомлень: число від 1')
      return
    }
    if (!Number.isFinite(delayN) || delayN < 500) {
      setSpamErr('Затримка (мс): мінімум 500')
      return
    }
    setSpamBusy(true)
    setSpamErr(null)
    try {
      const { user, safety } = readOutreachFiltersFromStorage()
      const r = await apiTelegramAccountOutreachStart(workspaceId, spamAccount.id, {
        sourceId: spamSourceId,
        maxMessages: Math.floor(maxN),
        delayMs: Math.floor(delayN),
        templateMode: 'random',
        userFilters: user,
        safetyFilters: safety
      })
      if (!r.ok) {
        setSpamErr(r.error ?? 'Помилка')
        pushToast(r.error ?? 'Помилка', 'error')
        return
      }
      pushToast('Розсилку запущено у фоні — стежте за журналом подій.', 'ok')
      closeSpamModal()
      await refetch()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setSpamErr(msg)
      pushToast(msg, 'error')
    } finally {
      setSpamBusy(false)
    }
  }, [
    workspaceId,
    status,
    spamAccount,
    spamSourceId,
    spamMax,
    spamDelay,
    refetch,
    pushToast,
    closeSpamModal
  ])

  const deleteTelegramAccount = useCallback(
    async (account: TelegramAccountModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Нет подключения к API', 'error')
        return
      }
      const ok = window.confirm(
        `Видалити акаунт «${account.label}» (@${account.username ?? '—'}) і пов’язаний anti-detect профіль у MongoDB? Дію не скасувати.`
      )
      if (!ok) return
      setDeletingAccountId(account.id)
      try {
        await apiDeleteTelegramAccount(workspaceId, account.id)
        setMtprotoAccount((a) => (a?.id === account.id ? null : a))
        setSpamAccount((a) => (a?.id === account.id ? null : a))
        pushToast('Акаунт видалено', 'ok')
        await refetch()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        pushToast(msg, 'error')
      } finally {
        setDeletingAccountId(null)
      }
    },
    [workspaceId, status, pushToast, refetch]
  )

  const submitAdd = useCallback(async () => {
    setFormError(null)
    if (!workspaceId || status !== 'online') {
      setFormError('Нет подключения к API')
      return
    }
    const u = username.trim()
    if (!u) {
      setFormError('Укажите Telegram username')
      return
    }
    const host = proxyHost.trim()
    if (!host) {
      setFormError('Укажите адрес прокси (host)')
      return
    }
    const port = parsePort(proxyPort)
    if (port === null) {
      setFormError('Порт прокси: число 1–65535')
      return
    }
    setBusy(true)
    try {
      const res = await apiCreateTelegramAccount(workspaceId, {
        telegramUsername: u,
        phone: phone.trim() || null,
        proxyHost: host,
        proxyPort: port,
        proxyProtocol: proxyType,
        proxyUsername: proxyUser.trim() || null,
        proxyPassword: proxyPass.trim() || null
      })
      pushToast('Аккаунт и anti-detect профиль сохранены в MongoDB', 'ok')
      closeAdd()
      await refetch()

      setMtprotoAccount(res.account)
      setMtprotoPhone(
        phone.trim() ||
          (res.account.phone && res.account.phone !== '—'
            ? res.account.phone.replace(/[^\d+]/g, '') || res.account.phone.trim()
            : '')
      )
      setMtprotoCode('')
      setMtprotoPassword('')
      setMtprotoAwait2fa(false)
      setMtprotoErr(null)
      setMtprotoCodeHint(null)
      setMtprotoForceSms(false)

      const tc = window.trafficCloud
      if (tc?.openBrowserProfile && res.launch) {
        setLaunchingAccountId(res.account.id)
        try {
          const lr = await launchAntidetectFromPayload(workspaceId, res.launch)
          if (lr.ok) {
            pushToast(
              'Відкрито Telegram Web у профілі акаунта — увійдіть (телефон / QR), після цього можна надсилати повідомлення з цього сеансу.',
              'ok'
            )
            await refetch()
          } else {
            pushToast(lr.error, 'error')
          }
        } finally {
          setLaunchingAccountId(null)
        }
      } else if (!tc?.openBrowserProfile) {
        pushToast('Відкрийте профіль стрілкою на картці — автозапуск браузера лише в Electron.', 'info')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setFormError(msg)
      pushToast(msg, 'error')
    } finally {
      setBusy(false)
    }
  }, [
    workspaceId,
    status,
    username,
    phone,
    proxyHost,
    proxyPort,
    proxyType,
    proxyUser,
    proxyPass,
    refetch,
    closeAdd,
    pushToast
  ])

  const runBulkAbout = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      pushToast('Немає підключення до API', 'error')
      return
    }
    const withMt = telegramAccounts.filter((a) => a.hasMtprotoSession)
    if (withMt.length === 0) {
      pushToast('Немає акаунтів з MTProto-сесією (спочатку «Код Telegram»)', 'error')
      return
    }
    setBulkAboutBusy(true)
    try {
      const r = await apiTelegramAccountsBulkAbout(workspaceId, { about: bulkAbout })
      const ok = r.results.filter((x) => x.ok).length
      const bad = r.results.filter((x) => !x.ok)
      pushToast(`Bio оновлено: ${ok} з ${r.results.length}`, ok === r.results.length ? 'ok' : 'info')
      if (bad.length > 0 && bad.length <= 3) {
        bad.forEach((b) => pushToast(`${b.label}: ${b.error ?? 'помилка'}`, 'error'))
      }
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), 'error')
    } finally {
      setBulkAboutBusy(false)
    }
  }, [workspaceId, status, bulkAbout, telegramAccounts, pushToast])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500">
            У каждого аккаунта свой browser profile, cookies/session storage и закреплённый прокси. Новые аккаунты
            сохраняются в MongoDB Atlas; профиль для Electron изолирован по{' '}
            <span className="font-mono text-zinc-400">profileId</span>. Після створення відкриється вікно входу
            MTProto (код з Telegram/SMS) — це окрема сесія для розсилки; антидетект-браузер лишається для Web.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/15 hover:text-white"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Фильтры
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              resetForm()
              setAddOpen(true)
            }}
            disabled={status !== 'online' || !workspaceId}
            className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent shadow-[0_0_24px_-8px_rgba(94,200,255,0.55)] transition-colors hover:bg-accent/15 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Добавить аккаунт
          </motion.button>
        </div>
      </div>

      <div className="glass-panel max-w-3xl space-y-4 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <UserCircle className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white">Масове оновлення bio (Telegram «Про себе»)</div>
            <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
              Для всіх акаунтів з активною MTProto-сесією (той самий api_id/api_hash, що в налаштуваннях парсера).
              До 70 символів; між акаунтами є пауза проти flood.
            </p>
            <textarea
              value={bulkAbout}
              onChange={(e) => setBulkAbout(e.target.value)}
              rows={3}
              maxLength={70}
              placeholder="Текст bio для всіх акаунтів…"
              className="mt-3 w-full resize-y rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
            />
            <div className="mt-1 text-right text-[11px] text-zinc-600">{bulkAbout.length}/70</div>
            <motion.button
              type="button"
              disabled={bulkAboutBusy || status !== 'online' || !workspaceId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => void runBulkAbout()}
              className="mt-2 inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent/15 disabled:opacity-40"
            >
              {bulkAboutBusy ? 'Оновлення…' : 'Застосувати до всіх'}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {addOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeAdd()}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="glass-panel relative max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-6 shadow-glow"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">Новый Telegram-аккаунт</div>
                  <p className="mt-1 text-[13px] text-zinc-500">
                    Прокси обязателен. После сохранения автоматически создаётся anti-detect профиль с тем же
                    username и изолированной сессией браузера.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                  aria-label="Закрыть"
                  onClick={() => closeAdd()}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {formError ? <p className="text-[13px] text-red-300/95">{formError}</p> : null}

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Telegram username
                </span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  placeholder="@orbit_ops или orbit_ops"
                  autoComplete="off"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Телефон (опционально)
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  placeholder="+380…"
                  autoComplete="tel"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Прокси · host
                  </span>
                  <input
                    value={proxyHost}
                    onChange={(e) => setProxyHost(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                    placeholder="proxy.example.com"
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Порт
                  </span>
                  <input
                    value={proxyPort}
                    onChange={(e) => setProxyPort(e.target.value)}
                    inputMode="numeric"
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                    placeholder="1080"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Тип прокси
                  </span>
                  <select
                    value={proxyType}
                    onChange={(e) => setProxyType(e.target.value === 'socks5' ? 'socks5' : 'http')}
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  >
                    <option value="http">HTTP</option>
                    <option value="socks5">SOCKS5</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Логин прокси (если есть)
                </span>
                <input
                  value={proxyUser}
                  onChange={(e) => setProxyUser(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  autoComplete="off"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Пароль прокси (если есть)
                </span>
                <input
                  type="password"
                  value={proxyPass}
                  onChange={(e) => setProxyPass(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  autoComplete="new-password"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => closeAdd()}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.04] disabled:opacity-40"
                >
                  Отмена
                </button>
                <motion.button
                  type="button"
                  disabled={busy || status !== 'online'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void submitAdd()}
                  className="rounded-xl border border-accent/35 bg-accent/15 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-40"
                >
                  {busy ? 'Сохранение…' : 'Сохранить'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {filtersOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFiltersOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              className="glass-panel w-full max-w-md space-y-4 p-6 shadow-glow"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Фильтры аккаунтов</div>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                  aria-label="Закрыть"
                  onClick={() => setFiltersOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Поиск по username / label
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  placeholder="@neo или имя"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Статус
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TelegramAccountStatus | 'all')}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Прокси
                </span>
                <select
                  value={proxyFilter}
                  onChange={(e) => setProxyFilter(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                >
                  <option value="all">Все прокси</option>
                  {proxiesList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} · {p.host}:{p.port}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Сортировка по дате добавления
                </span>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                >
                  <option value="created_desc">Сначала новые</option>
                  <option value="created_asc">Сначала старые</option>
                </select>
              </label>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-xl border border-accent/35 bg-accent/15 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20"
                >
                  Готово
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mtprotoAccount ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeMtprotoModal()}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="glass-panel relative max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-6 shadow-glow"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">Вхід MTProto (код)</div>
                  <p className="mt-1 text-[13px] text-zinc-500">
                    <span className="font-mono text-zinc-300">{mtprotoAccount.label}</span>
                  </p>
                </div>
                <button
                  type="button"
                  disabled={mtprotoBusy}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                  aria-label="Закрити"
                  onClick={() => closeMtprotoModal()}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {mtprotoErr ? <p className="text-[13px] text-red-300/95">{mtprotoErr}</p> : null}
              {mtprotoCodeHint && !mtprotoAwait2fa ? (
                <p className="text-[13px] text-sky-200/90">{mtprotoCodeHint}</p>
              ) : null}
              {mtprotoAwait2fa ? (
                <p className="text-[13px] text-amber-200/90">Введіть пароль двофакторної аутентифікації.</p>
              ) : null}

              {!mtprotoAwait2fa ? (
                <>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Телефон
                    </span>
                    <input
                      value={mtprotoPhone}
                      onChange={(e) => setMtprotoPhone(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                      placeholder="+380…"
                      autoComplete="tel"
                    />
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-zinc-400">
                    <input
                      type="checkbox"
                      checked={mtprotoForceSms}
                      onChange={(e) => setMtprotoForceSms(e.target.checked)}
                      className="rounded border-white/20 bg-black/40"
                    />
                    Лише SMS (повторно надішле код SMS)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={mtprotoBusy || status !== 'online'}
                      onClick={() => void sendMtprotoCode()}
                      className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white hover:bg-white/[0.1] disabled:opacity-40"
                    >
                      Надіслати код
                    </button>
                  </div>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Код з Telegram / SMS
                    </span>
                    <input
                      value={mtprotoCode}
                      onChange={(e) => setMtprotoCode(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                      placeholder="12345"
                      autoComplete="one-time-code"
                    />
                  </label>
                </>
              ) : null}

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Пароль 2FA (якщо увімкнено)
                </span>
                <input
                  type="password"
                  value={mtprotoPassword}
                  onChange={(e) => setMtprotoPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  autoComplete="current-password"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={mtprotoBusy}
                  onClick={() => closeMtprotoModal()}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.04] disabled:opacity-40"
                >
                  Закрити
                </button>
                <motion.button
                  type="button"
                  disabled={mtprotoBusy || status !== 'online'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void completeMtprotoLogin()}
                  className="rounded-xl border border-accent/35 bg-accent/15 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-40"
                >
                  {mtprotoBusy ? 'Зачекайте…' : mtprotoAwait2fa ? 'Підтвердити 2FA' : 'Увійти та зберегти сесію'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {spamAccount ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeSpamModal()}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              className="glass-panel w-full max-w-md space-y-4 p-6 shadow-glow"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">Запустити розсилку DM</div>
                  <p className="mt-1 text-[13px] text-zinc-500">
                    Текст — з активного шаблону. Отримувачі — у випадковому порядку, лише з @username; кожному
                    користувачу з цього акаунта пишемо один раз (повтори збережені локально).
                  </p>
                </div>
                <button
                  type="button"
                  disabled={spamBusy}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                  aria-label="Закрити"
                  onClick={() => closeSpamModal()}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {spamErr ? <p className="text-[13px] text-red-300/95">{spamErr}</p> : null}

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Джерело аудиторії
                </span>
                <select
                  value={spamSourceId}
                  onChange={(e) => setSpamSourceId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                >
                  {chatSources.length === 0 ? (
                    <option value="">Немає джерел — додайте та розпарсіть у розділі «Джерела»</option>
                  ) : (
                    chatSources.map((s: ChatSourceModel) => (
                      <option key={s.id} value={s.id}>
                        {s.title ?? s.value} · {s.parsedMemberCount ?? 0} у базі
                        {s.participantListHidden ? ' · прихований список' : ''}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Макс. повідомлень
                  </span>
                  <input
                    value={spamMax}
                    onChange={(e) => setSpamMax(e.target.value)}
                    inputMode="numeric"
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Пауза між DM (мс)
                  </span>
                  <input
                    value={spamDelay}
                    onChange={(e) => setSpamDelay(e.target.value)}
                    inputMode="numeric"
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                  />
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={spamBusy}
                  onClick={() => closeSpamModal()}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.04] disabled:opacity-40"
                >
                  Скасувати
                </button>
                <motion.button
                  type="button"
                  disabled={spamBusy || status !== 'online' || !spamSourceId}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void startSpamOutreach()}
                  className="rounded-xl border border-amber-400/35 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-100 hover:bg-amber-500/25 disabled:opacity-40"
                >
                  {spamBusy ? 'Запуск…' : 'Запустити спам'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AccountsGrid
        accounts={filteredAccounts}
        proxyLabel={proxyLabel}
        sortKey={sortKey}
        launchingAccountId={launchingAccountId}
        mtprotoBusyId={mtprotoBusy && mtprotoAccount ? mtprotoAccount.id : null}
        spamBusyId={spamBusy && spamAccount ? spamAccount.id : null}
        deletingAccountId={deletingAccountId}
        onOpenAntidetect={openAntidetectForAccount}
        onOpenMtprotoLogin={openMtprotoModal}
        onOpenSpam={openSpamModal}
        onDeleteAccount={deleteTelegramAccount}
      />
    </div>
  )
}

function AccountsGrid({
  accounts,
  proxyLabel,
  sortKey,
  launchingAccountId,
  mtprotoBusyId,
  spamBusyId,
  deletingAccountId,
  onOpenAntidetect,
  onOpenMtprotoLogin,
  onOpenSpam,
  onDeleteAccount
}: {
  accounts: TelegramAccountModel[]
  proxyLabel: Record<string, string>
  sortKey: SortKey
  launchingAccountId: string | null
  mtprotoBusyId: string | null
  spamBusyId: string | null
  deletingAccountId: string | null
  onOpenAntidetect: (account: TelegramAccountModel) => void
  onOpenMtprotoLogin: (account: TelegramAccountModel) => void
  onOpenSpam: (account: TelegramAccountModel) => void
  onDeleteAccount: (account: TelegramAccountModel) => void
}): JSX.Element {
  const sorted = useMemo(() => {
    const copy = [...accounts]
    const ts = (x: TelegramAccountModel) => {
      const raw = x.createdAt ?? x.lastActivity
      return raw ? new Date(raw).getTime() : 0
    }
    copy.sort((a, b) => {
      const ta = ts(a)
      const tb = ts(b)
      if (sortKey === 'created_desc') return tb - ta
      return ta - tb
    })
    return copy
  }, [accounts, sortKey])

  if (sorted.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-white/[0.06] px-6 py-12 text-center text-sm text-zinc-500">
        Нет аккаунтов по текущим фильтрам. Добавьте аккаунт или сбросьте фильтры.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sorted.map((a, i) => (
        <TelegramAccountCard
          key={a.id}
          account={a}
          index={i}
          proxyLabel={a.proxyId ? proxyLabel[a.proxyId] : null}
          onOpenAntidetect={onOpenAntidetect}
          antidetectLaunching={launchingAccountId === a.id}
          onOpenMtprotoLogin={onOpenMtprotoLogin}
          onOpenSpam={onOpenSpam}
          onDeleteAccount={onDeleteAccount}
          mtprotoBusy={mtprotoBusyId === a.id}
          spamBusy={spamBusyId === a.id}
          deleteBusy={deletingAccountId === a.id}
        />
      ))}
    </div>
  )
}
