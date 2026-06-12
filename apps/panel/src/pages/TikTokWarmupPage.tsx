import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Eye,
  Check,
  Flame,
  Hash,
  KeyRound,
  Loader2,
  Monitor,
  Pause,
  Pencil,
  Play,
  Plus,
  Rocket,
  Settings2,
  Sparkles,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  Wifi,
  Workflow
} from 'lucide-react'
import { TikTokCredentialsModal } from '@/components/tiktok/TikTokCredentialsModal'
import { TikTokEditModal } from '@/components/tiktok/TikTokEditModal'
import { TikTokWarmupStartModal } from '@/components/tiktok/TikTokWarmupStartModal'
import { GlassCard } from '@/components/ui/GlassCard'
import { useToast } from '@/context/ToastContext'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import type {
  TikTokAccountCredentials,
  TikTokAccountModel,
  TikTokAccountStatus
} from '@/domain/types'
import {
  apiCreateTikTokAccount,
  apiDeleteTikTokAccount,
  apiTestProxyAdhoc,
  apiUpdateTikTokAccount
} from '@/lib/api'
import {
  credentialsFromAccount,
  openTikTokFromCreateLaunch,
  openTikTokManageForAccount,
  openTikTokWarmupForAccount
} from '@/lib/openTikTokForAccount'
import {
  DEFAULT_WARMUP_SETTINGS,
  readTikTokWarmupSettings,
  type TikTokExecutionMode,
  type TikTokWarmupSettings,
  writeTikTokWarmupSettings
} from '@/lib/tiktokWarmupStorage'

function statusUi(status: TikTokAccountStatus): { label: string; className: string } {
  switch (status) {
    case 'creating':
      return {
        label: 'Реєстрація',
        className: 'border-sky-400/25 bg-sky-500/10 text-sky-200'
      }
    case 'warming':
      return {
        label: 'Прогрів',
        className: 'border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-200'
      }
    case 'ready':
      return {
        label: 'Готовий',
        className: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
      }
    case 'paused':
      return {
        label: 'Очікує',
        className: 'border-amber-400/25 bg-amber-500/10 text-amber-200'
      }
    case 'error':
      return {
        label: 'Помилка',
        className: 'border-red-400/25 bg-red-500/10 text-red-200'
      }
  }
}

const EXECUTION_MODES: Array<{
  id: TikTokExecutionMode
  label: string
  hint: string
  icon: typeof Eye
}> = [
  {
    id: 'visible',
    label: 'На екрані',
    hint: 'Відкривається антидетект-браузер — ви бачите TikTok і весь прогрів.',
    icon: Eye
  },
  {
    id: 'headless',
    label: 'Під капотом',
    hint: 'Прогрів без вікна. Керування акаунтом — кнопкою «Керувати».',
    icon: Workflow
  }
]

function buildWarmupSteps(account: TikTokAccountModel, settings: TikTokWarmupSettings): string[] {
  const scrollMin = Math.min(settings.scrollMinutesMin, settings.scrollMinutesMax)
  const scrollMax = Math.max(settings.scrollMinutesMin, settings.scrollMinutesMax)
  const scrollMins = scrollMin + Math.floor(Math.random() * (scrollMax - scrollMin + 1))
  const tags = account.watchHashtags.length > 0 ? account.watchHashtags : ['fyp']
  const tagLine = tags.map((t) => `#${t}`).join(' ')
  const steps = [
    `[${account.username}] Антидетект-профіль активний`,
    `[${account.username}] Тематика: ${tagLine}`,
    `[${account.username}] TikTok · скрол ~${scrollMins} хв`
  ]
  for (const tag of tags.slice(0, 3)) {
    steps.push(`[${account.username}] Перегляд #${tag}`)
  }
  for (let i = 1; i <= Math.min(settings.likesPerSession, 4); i++) {
    steps.push(`[${account.username}] Лайк #${i}`)
  }
  for (let i = 1; i <= Math.min(settings.commentsPerSession, 3); i++) {
    steps.push(`[${account.username}] Коментар #${i}`)
  }
  for (let i = 1; i <= Math.min(settings.followsPerSession, 2); i++) {
    steps.push(`[${account.username}] Підписка #${i}`)
  }
  if (settings.watchFullVideos) steps.push(`[${account.username}] Перегляд до кінця`)
  steps.push(`[${account.username}] Сесію завершено`)
  return steps
}

export function TikTokWarmupPage(): JSX.Element {
  const { pushToast } = useToast()
  const { bundle, workspaceId, status, refetch } = useWorkspaceData()
  const accounts = bundle?.tiktokAccounts ?? []
  const proxiesList = bundle?.proxies ?? []

  const proxyLabel = useMemo(() => {
    const m: Record<string, string> = {}
    for (const p of proxiesList) m[p.id] = p.label
    return m
  }, [proxiesList])

  const [settings, setSettings] = useState<TikTokWarmupSettings>(() => readTikTokWarmupSettings())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [username, setUsername] = useState('')
  const [proxyHost, setProxyHost] = useState('')
  const [proxyPort, setProxyPort] = useState('')
  const [proxyType, setProxyType] = useState<'http' | 'socks5'>('socks5')
  const [proxyUser, setProxyUser] = useState('')
  const [proxyPass, setProxyPass] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [manageBusyId, setManageBusyId] = useState<string | null>(null)
  const [createBusy, setCreateBusy] = useState(false)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [warmupModal, setWarmupModal] = useState<{
    account: TikTokAccountModel
    hashtagsRaw: string
  } | null>(null)
  const [warmupStartBusy, setWarmupStartBusy] = useState(false)
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null)
  const [activityLog, setActivityLog] = useState<string[]>([])
  const [credentialsModal, setCredentialsModal] = useState<{
    credentials: TikTokAccountCredentials
    watchHashtags: string[]
    accountId?: string
  } | null>(null)
  const [editAccount, setEditAccount] = useState<TikTokAccountModel | null>(null)
  const [proxyTestBusyId, setProxyTestBusyId] = useState<string | null>(null)
  const logTimersRef = useRef<number[]>([])

  const persistSettings = useCallback((next: TikTokWarmupSettings) => {
    setSettings(next)
    writeTikTokWarmupSettings(next)
  }, [])

  const clearLogTimers = useCallback(() => {
    for (const id of logTimersRef.current) window.clearTimeout(id)
    logTimersRef.current = []
  }, [])

  const appendLog = useCallback((line: string) => {
    setActivityLog((prev) => [...prev.slice(-24), line])
  }, [])

  const runVisibleSteps = useCallback(
    (steps: string[], onDone: () => void) => {
      clearLogTimers()
      setActivityLog([])
      steps.forEach((step, index) => {
        const timerId = window.setTimeout(() => {
          appendLog(step)
          if (index === steps.length - 1) onDone()
        }, 450 + index * 520)
        logTimersRef.current.push(timerId)
      })
    },
    [appendLog, clearLogTimers]
  )

  const stats = useMemo(() => {
    const warming = accounts.filter((a) => a.status === 'warming').length
    const ready = accounts.filter((a) => a.status === 'ready').length
    const avgTrust =
      accounts.length > 0
        ? Math.round(accounts.reduce((s, a) => s + a.trustScore, 0) / accounts.length)
        : 0
    return { total: accounts.length, warming, ready, avgTrust }
  }, [accounts])

  const resetCreateForm = useCallback(() => {
    setEmail('')
    setEmailPassword('')
    setUsername('')
    setProxyHost('')
    setProxyPort('')
    setProxyType('socks5')
    setProxyUser('')
    setProxyPass('')
  }, [])

  const parsePort = (raw: string): number | null => {
    const n = Number(raw.trim())
    return Number.isFinite(n) && n >= 1 && n <= 65535 ? Math.floor(n) : null
  }

  const createAccount = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      pushToast('Немає підключення до API', 'error')
      return
    }
    const trimmedEmail = email.trim()
    const trimmedEmailPassword = emailPassword.trim()
    const trimmedUsername = username.trim().replace(/^@+/, '')
    const host = proxyHost.trim()
    const port = host ? parsePort(proxyPort) : null

    if (trimmedEmail && !trimmedEmail.includes('@')) {
      pushToast('Некоректний email', 'error')
      return
    }
    if (host && port === null) {
      pushToast('Вкажіть коректний порт проксі', 'error')
      return
    }

    setCreateBusy(true)
    try {
      const r = await apiCreateTikTokAccount(workspaceId, {
        ...(trimmedEmail ? { email: trimmedEmail } : {}),
        ...(trimmedEmail && trimmedEmailPassword ? { emailPassword: trimmedEmailPassword } : {}),
        ...(trimmedUsername ? { username: trimmedUsername } : {}),
        ...(host && port
          ? {
              proxyHost: host,
              proxyPort: port,
              proxyProtocol: proxyType,
              proxyUsername: proxyUser.trim() || null,
              proxyPassword: proxyPass.trim() || null
            }
          : {})
      })
      setCreateOpen(false)
      resetCreateForm()
      await refetch()

      setCredentialsModal({
        credentials: r.credentials,
        watchHashtags: [],
        accountId: r.account.id
      })

      const launchResult = await openTikTokFromCreateLaunch(
        workspaceId,
        r.launch,
        r.credentials,
        r.account.id
      )
      if (!launchResult.ok) {
        pushToast(launchResult.error, 'error')
      } else if (launchResult.mode === 'electron') {
        pushToast(
          `Автореєстрація @${r.account.username} — форма, код і Next автоматично (Electron)`,
          'ok'
        )
      } else {
        pushToast(
          'Відкрито TikTok у браузері. Автозаповнення працює лише в десктоп-додатку Traffic Cloud.',
          'error'
        )
      }
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), 'error')
    } finally {
      setCreateBusy(false)
    }
  }, [
    email,
    emailPassword,
    proxyHost,
    proxyPass,
    proxyPort,
    proxyType,
    proxyUser,
    pushToast,
    refetch,
    resetCreateForm,
    status,
    username,
    workspaceId
  ])

  const testAccountProxy = useCallback(
    async (account: TikTokAccountModel) => {
      if (!workspaceId) return
      const proxy = account.proxyId ? proxiesList.find((p) => p.id === account.proxyId) : null
      if (!proxy) {
        pushToast(`@${account.username}: проксі не призначено`, 'error')
        return
      }
      setProxyTestBusyId(account.id)
      try {
        const r = await apiTestProxyAdhoc(workspaceId, {
          protocol: proxy.protocol,
          host: proxy.host,
          port: proxy.port,
          username: proxy.username,
          password: proxy.password
        })
        if (r.ok) {
          pushToast(`Проксі працює · ${r.latencyMs} мс`, 'ok')
        } else {
          pushToast(`Проксі не працює: ${r.error}`, 'error')
        }
      } catch (e) {
        pushToast(e instanceof Error ? e.message : String(e), 'error')
      } finally {
        setProxyTestBusyId(null)
      }
    },
    [proxiesList, pushToast, workspaceId]
  )

  const markRegistered = useCallback(
    async (account: TikTokAccountModel) => {
      if (!workspaceId) return
      await apiUpdateTikTokAccount(workspaceId, account.id, { status: 'paused', trustScore: 15 })
      await refetch()
      pushToast(`@${account.username} позначено як зареєстрований`, 'ok')
    },
    [pushToast, refetch, workspaceId]
  )

  const manageAccount = useCallback(
    async (account: TikTokAccountModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Немає підключення до API', 'error')
        return
      }
      setManageBusyId(account.id)
      try {
        const intent =
          account.status === 'ready' ? 'home' : account.status === 'creating' ? 'signup' : 'login'
        const r = await openTikTokManageForAccount(workspaceId, account.id, intent)
        if (!r.ok) {
          pushToast(r.error, 'error')
          return
        }
        if (intent === 'signup' || intent === 'login') {
          setCredentialsModal({
            credentials: r.credentials,
            watchHashtags: account.watchHashtags,
            accountId: account.id
          })
        }
        pushToast(
          r.mode === 'electron'
            ? intent === 'home'
              ? `Стрічка @${account.username}`
              : intent === 'signup'
                ? `Автореєстрація @${account.username} — перевірте код з email`
                : `Вхід @${account.username}`
            : `TikTok @${account.username} відкрито у браузері`,
          'ok'
        )
        await refetch()
      } finally {
        setManageBusyId(null)
      }
    },
    [pushToast, refetch, status, workspaceId]
  )

  const finishWarmup = useCallback(
    async (account: TikTokAccountModel, nextTrust: number) => {
      if (!workspaceId) return
      const nextStatus: TikTokAccountStatus = nextTrust >= 70 ? 'ready' : 'paused'
      await apiUpdateTikTokAccount(workspaceId, account.id, {
        status: nextStatus,
        trustScore: nextTrust,
        lastWarmupAt: new Date().toISOString()
      })
      await refetch()
      setBusyId(null)
      pushToast(
        nextStatus === 'ready'
          ? `@${account.username} готовий до публікацій`
          : `Сесію прогріву @${account.username} завершено`,
        'ok'
      )
    },
    [pushToast, refetch, workspaceId]
  )

  const startWarmup = useCallback(
    async (account: TikTokAccountModel, watchHashtags: string[]) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Немає підключення до API', 'error')
        return
      }

      setWarmupStartBusy(true)
      setBusyId(account.id)
      try {
        const updated = await apiUpdateTikTokAccount(workspaceId, account.id, {
          watchHashtags,
          status: 'warming'
        })
        await refetch()
        setWarmupModal(null)

        const warmedAccount = updated.account
        const nextTrust = Math.min(
          100,
          warmedAccount.trustScore + 8 + Math.floor(Math.random() * 10)
        )

        const durationMin = Math.min(settings.scrollMinutesMin, settings.scrollMinutesMax)
        const durationMax = Math.max(settings.scrollMinutesMin, settings.scrollMinutesMax)
        const durationMinutes = durationMin + Math.floor(Math.random() * (durationMax - durationMin + 1))
        const tags = watchHashtags.length > 0 ? watchHashtags : ['fyp']

        const opened = await openTikTokWarmupForAccount(workspaceId, warmedAccount.id, {
          hashtags: tags,
          durationMinutes,
          likes: settings.likesPerSession,
          comments: settings.commentsPerSession,
          follows: settings.followsPerSession,
          watchSecondsMin: settings.watchSecondsMin,
          watchSecondsMax: settings.watchSecondsMax,
          commentTexts: settings.commentTexts
        })
        if (!opened.ok) {
          pushToast(opened.error, 'error')
          await apiUpdateTikTokAccount(workspaceId, warmedAccount.id, { status: 'paused' })
          await refetch()
          setBusyId(null)
          return
        }

        const steps = buildWarmupSteps(warmedAccount, settings)
        if (settings.executionMode === 'visible') {
          runVisibleSteps(steps, () => {
            void finishWarmup(warmedAccount, nextTrust)
          })
        } else {
          pushToast(`Прогрів @${warmedAccount.username} запущено`, 'ok')
          window.setTimeout(
            () => {
              void finishWarmup(warmedAccount, nextTrust)
            },
            Math.min(durationMinutes, 2) * 60_000
          )
        }
      } catch (e) {
        setBusyId(null)
        pushToast(e instanceof Error ? e.message : String(e), 'error')
      } finally {
        setWarmupStartBusy(false)
      }
    },
    [finishWarmup, pushToast, refetch, runVisibleSteps, settings, status, workspaceId]
  )

  const toggleWarmup = useCallback(
    async (account: TikTokAccountModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Немає підключення до API', 'error')
        return
      }
      if (account.status === 'warming') {
        clearLogTimers()
        await apiUpdateTikTokAccount(workspaceId, account.id, { status: 'paused' })
        await refetch()
        setBusyId(null)
        pushToast(`Прогрів @${account.username} зупинено`, 'ok')
        return
      }

      setWarmupModal({
        account,
        hashtagsRaw: account.watchHashtags.map((t) => `#${t}`).join(', ')
      })
    },
    [clearLogTimers, pushToast, refetch, status, workspaceId]
  )

  const deleteAccount = useCallback(
    async (account: TikTokAccountModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Немає підключення до API', 'error')
        return
      }
      if (account.status === 'warming') {
        pushToast('Спочатку зупиніть прогрів', 'error')
        return
      }
      const ok = window.confirm(
        `Видалити TikTok @${account.username} разом з антидетект-профілем? Дію не скасувати.`
      )
      if (!ok) return
      setDeleteBusyId(account.id)
      try {
        await apiDeleteTikTokAccount(workspaceId, account.id)
        if (warmupModal?.account.id === account.id) setWarmupModal(null)
        if (credentialsModal && credentialsModal.credentials.username === account.username) {
          setCredentialsModal(null)
        }
        pushToast(`@${account.username} видалено`, 'ok')
        await refetch()
      } catch (e) {
        pushToast(e instanceof Error ? e.message : String(e), 'error')
      } finally {
        setDeleteBusyId(null)
      }
    },
    [credentialsModal, pushToast, refetch, status, warmupModal, workspaceId]
  )

  const startBulkWarmup = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      pushToast('Немає підключення до API', 'error')
      return
    }
    const targets = accounts.filter((a) => a.status !== 'warming')
    if (targets.length === 0) {
      pushToast('Немає акаунтів для прогріву', 'error')
      return
    }
    setBulkBusy(true)
    for (const t of targets) {
      await apiUpdateTikTokAccount(workspaceId, t.id, { status: 'warming' })
    }
    await refetch()
    pushToast(`Запущено прогрів для ${targets.length} акаунтів`, 'ok')

    window.setTimeout(async () => {
      for (const t of targets) {
        const nextTrust = Math.min(100, t.trustScore + 10 + Math.floor(Math.random() * 8))
        await apiUpdateTikTokAccount(workspaceId, t.id, {
          status: nextTrust >= 70 ? 'ready' : 'paused',
          trustScore: nextTrust,
          lastWarmupAt: new Date().toISOString()
        })
      }
      await refetch()
      setBulkBusy(false)
      pushToast('Пакетний прогрів завершено', 'ok')
    }, 3500)
  }, [accounts, pushToast, refetch, status, workspaceId])

  return (
    <div className="relative space-y-8 p-6 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 20% 0%, rgba(217,70,239,0.12), transparent 55%)'
        }}
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
            Email не обовʼязковий — створиться тимчасова пошта, код підставиться сам. Повна автоматизація
            лише в десктоп-додатку Traffic Cloud (Electron).
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-zinc-400">
            {settings.executionMode === 'visible' ? (
              <>
                <Eye className="h-3.5 w-3.5 text-cyan-300" />
                Режим: процес на екрані
              </>
            ) : (
              <>
                <Workflow className="h-3.5 w-3.5 text-fuchsia-300" />
                Режим: під капотом
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:border-fuchsia-400/25 hover:text-white"
          >
            <Settings2 className="h-4 w-4" />
            Налаштування
          </button>
          <button
            type="button"
            disabled={bulkBusy || accounts.length === 0}
            onClick={() => void startBulkWarmup()}
            className="inline-flex items-center gap-2 rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/10 px-4 py-2.5 text-sm font-medium text-fuchsia-100 transition-colors hover:border-fuchsia-400/40 disabled:opacity-50"
          >
            {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
            Прогріти всі
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-medium text-cyan-100 transition-colors hover:border-accent/45"
          >
            <Plus className="h-4 w-4" />
            Новий акаунт
          </button>
        </div>
      </div>

      <div className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Усього акаунтів', value: stats.total, icon: Users },
          { label: 'На прогріві', value: stats.warming, icon: Flame },
          { label: 'Готові', value: stats.ready, icon: Sparkles },
          { label: 'Середній траст', value: `${stats.avgTrust}%`, icon: TrendingUp }
        ].map((item) => {
          const Icon = item.icon
          return (
            <GlassCard key={item.label} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                    {item.label}
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-white">{item.value}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-fuchsia-300">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {settingsOpen ? (
        <GlassCard className="relative space-y-6 p-6">
          <div>
            <h2 className="text-sm font-semibold text-white">Режим виконання</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {EXECUTION_MODES.map((mode) => {
                const Icon = mode.icon
                const active = settings.executionMode === mode.id
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => persistSettings({ ...settings, executionMode: mode.id })}
                    className={[
                      'rounded-2xl border p-4 text-left transition-colors',
                      active
                        ? 'border-fuchsia-400/35 bg-fuchsia-500/10'
                        : 'border-white/[0.08] bg-black/20 hover:border-white/15'
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-fuchsia-300" />
                      <span className="text-sm font-semibold text-white">{mode.label}</span>
                    </div>
                    <p className="mt-2 text-[12px] text-zinc-500">{mode.hint}</p>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-6">
            <h2 className="text-sm font-semibold text-white">Профіль прогріву</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block space-y-1.5">
                <span className="text-[11px] uppercase text-zinc-500">Скрол мін (хв)</span>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={settings.scrollMinutesMin}
                  onChange={(e) =>
                    persistSettings({
                      ...settings,
                      scrollMinutesMin:
                        Number(e.target.value) || DEFAULT_WARMUP_SETTINGS.scrollMinutesMin
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400/40"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] uppercase text-zinc-500">Скрол макс (хв)</span>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={settings.scrollMinutesMax}
                  onChange={(e) =>
                    persistSettings({
                      ...settings,
                      scrollMinutesMax:
                        Number(e.target.value) || DEFAULT_WARMUP_SETTINGS.scrollMinutesMax
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400/40"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] uppercase text-zinc-500">Лайків</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={settings.likesPerSession}
                  onChange={(e) =>
                    persistSettings({
                      ...settings,
                      likesPerSession: Number(e.target.value) || 0
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400/40"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] uppercase text-zinc-500">Підписок</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={settings.followsPerSession}
                  onChange={(e) =>
                    persistSettings({
                      ...settings,
                      followsPerSession: Number(e.target.value) || 0
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400/40"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] uppercase text-zinc-500">Коментарів</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={settings.commentsPerSession}
                  onChange={(e) =>
                    persistSettings({
                      ...settings,
                      commentsPerSession: Number(e.target.value) || 0
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400/40"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] uppercase text-zinc-500">Перегляд мін (с)</span>
                <input
                  type="number"
                  min={2}
                  max={120}
                  value={settings.watchSecondsMin}
                  onChange={(e) =>
                    persistSettings({
                      ...settings,
                      watchSecondsMin:
                        Number(e.target.value) || DEFAULT_WARMUP_SETTINGS.watchSecondsMin
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400/40"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] uppercase text-zinc-500">Перегляд макс (с)</span>
                <input
                  type="number"
                  min={2}
                  max={180}
                  value={settings.watchSecondsMax}
                  onChange={(e) =>
                    persistSettings({
                      ...settings,
                      watchSecondsMax:
                        Number(e.target.value) || DEFAULT_WARMUP_SETTINGS.watchSecondsMax
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400/40"
                />
              </label>
            </div>
            <label className="mt-4 block space-y-1.5">
              <span className="text-[11px] uppercase text-zinc-500">
                Тексти коментарів (кожен з нового рядка)
              </span>
              <textarea
                rows={4}
                value={settings.commentTexts.join('\n')}
                onChange={(e) =>
                  persistSettings({
                    ...settings,
                    commentTexts: e.target.value
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  })
                }
                placeholder={'🔥🔥🔥\nТопчик\nКласне відео'}
                className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400/40"
              />
              <span className="text-[11px] text-zinc-600">
                Софт обирає випадковий текст для кожного коментаря.
              </span>
            </label>
          </div>
        </GlassCard>
      ) : null}

      {settings.executionMode === 'visible' && activityLog.length > 0 ? (
        <GlassCard className="relative p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            <Monitor className="h-4 w-4 text-cyan-300" />
            Журнал процесу
          </div>
          <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto font-mono text-[12px]">
            {activityLog.map((line, i) => (
              <div key={`${line}-${i}`} className="text-zinc-400">
                <span className="text-zinc-600">{String(i + 1).padStart(2, '0')}</span> {line}
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}

      <GlassCard className="relative overflow-hidden">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <UserRound className="h-12 w-12 text-fuchsia-300" />
            <h3 className="mt-4 text-lg font-semibold text-white">Ще немає TikTok акаунтів</h3>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Додайте існуючий акаунт — email, логін і пароль. Тематику відео оберете при прогріві.
            </p>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-medium text-cyan-100"
            >
              <Plus className="h-4 w-4" />
              Новий акаунт
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                  <th className="px-6 py-4 font-semibold">Акаунт</th>
                  <th className="px-4 py-4 font-semibold">Тематика</th>
                  <th className="px-4 py-4 font-semibold">Проксі</th>
                  <th className="px-4 py-4 font-semibold">Статус</th>
                  <th className="px-4 py-4 font-semibold">Траст</th>
                  <th className="px-6 py-4 text-right font-semibold">Дії</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => {
                  const ui = statusUi(account.status)
                  const isBusy = busyId === account.id
                  const isManageBusy = manageBusyId === account.id
                  const isDeleteBusy = deleteBusyId === account.id
                  return (
                    <tr
                      key={account.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">@{account.username}</div>
                        <div className="text-[12px] text-zinc-500">{account.email}</div>
                      </td>
                      <td className="px-4 py-4">
                        {account.watchHashtags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {account.watchHashtags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-0.5 rounded-full border border-fuchsia-400/15 bg-fuchsia-500/5 px-2 py-0.5 text-[10px] text-fuchsia-200"
                              >
                                <Hash className="h-2.5 w-2.5" />#{tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[12px] text-zinc-600">При прогріві</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-zinc-400">
                        {account.proxyId ? (proxyLabel[account.proxyId] ?? '—') : 'Без проксі'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${ui.className}`}
                        >
                          {ui.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-400"
                              style={{ width: `${account.trustScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-[12px] text-zinc-400">
                            {account.trustScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setCredentialsModal({
                                credentials: credentialsFromAccount(account),
                                watchHashtags: account.watchHashtags,
                                accountId: account.id
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-zinc-300 hover:border-fuchsia-400/30"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                            Дані
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditAccount(account)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-zinc-300 hover:border-fuchsia-400/30"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Змінити
                          </button>
                          <button
                            type="button"
                            disabled={proxyTestBusyId === account.id || !account.proxyId}
                            onClick={() => void testAccountProxy(account)}
                            title={account.proxyId ? 'Перевірити проксі' : 'Проксі не призначено'}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-zinc-300 hover:border-cyan-400/30 disabled:opacity-40"
                          >
                            {proxyTestBusyId === account.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Wifi className="h-3.5 w-3.5" />
                            )}
                            Проксі
                          </button>
                          <button
                            type="button"
                            disabled={isManageBusy}
                            onClick={() => void manageAccount(account)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-[12px] text-cyan-100 disabled:opacity-40"
                          >
                            {isManageBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Rocket className="h-3.5 w-3.5" />
                            )}
                            {account.status === 'creating' ? 'Авторег' : 'Керувати'}
                          </button>
                          {account.status === 'creating' ? (
                            <button
                              type="button"
                              onClick={() => void markRegistered(account)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[12px] text-emerald-100"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Готово
                            </button>
                          ) : null}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void toggleWarmup(account)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-zinc-300 disabled:opacity-40"
                          >
                            {isBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : account.status === 'warming' ? (
                              <Pause className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5 fill-current" />
                            )}
                            {account.status === 'warming' ? 'Стоп' : 'Прогрів'}
                          </button>
                          <button
                            type="button"
                            disabled={isDeleteBusy || isBusy || account.status === 'warming'}
                            onClick={() => void deleteAccount(account)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/15 px-3 py-1.5 text-[12px] text-red-200/90 transition-colors hover:border-red-400/35 hover:bg-red-500/10 disabled:opacity-40"
                            title="Видалити акаунт і антидетект-профіль"
                          >
                            {isDeleteBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {warmupModal ? (
        <TikTokWarmupStartModal
          account={warmupModal.account}
          hashtagsRaw={warmupModal.hashtagsRaw}
          onHashtagsChange={(value) =>
            setWarmupModal((prev) => (prev ? { ...prev, hashtagsRaw: value } : null))
          }
          busy={warmupStartBusy}
          onClose={() => {
            if (!warmupStartBusy) setWarmupModal(null)
          }}
          onConfirm={(tags) => void startWarmup(warmupModal.account, tags)}
        />
      ) : null}

      {credentialsModal ? (
        <TikTokCredentialsModal
          credentials={credentialsModal.credentials}
          watchHashtags={credentialsModal.watchHashtags}
          workspaceId={workspaceId ?? undefined}
          accountId={credentialsModal.accountId}
          onClose={() => setCredentialsModal(null)}
        />
      ) : null}

      {editAccount && workspaceId ? (
        <TikTokEditModal
          account={editAccount}
          proxy={
            editAccount.proxyId
              ? (proxiesList.find((p) => p.id === editAccount.proxyId) ?? null)
              : null
          }
          workspaceId={workspaceId}
          onClose={() => setEditAccount(null)}
          onSaved={async () => {
            await refetch()
            pushToast('Акаунт оновлено', 'ok')
          }}
          onError={(message) => pushToast(message, 'error')}
        />
      ) : null}

      {createOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-white">Автореєстрація TikTok</h2>
            <p className="mt-1 text-[13px] text-zinc-500">
              Email опційний — якщо порожньо, створиться тимчасова пошта. Вкажіть свою пошту + пароль
              (для Gmail/Outlook — app-password), і софт сам прочитає код підтвердження та введе його.
            </p>
            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-[11px] uppercase text-zinc-500">Email (опційно)</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="авто — тимчасова пошта"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/40"
                />
              </label>
              {email.trim() ? (
                <label className="block space-y-1.5">
                  <span className="text-[11px] uppercase text-zinc-500">
                    Пароль пошти (app-password, для авто-коду)
                  </span>
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="app-password для IMAP"
                    autoComplete="off"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/40"
                  />
                  <span className="block text-[11px] text-zinc-600">
                    Gmail: увімкніть IMAP і створіть app-password. Без пароля код доведеться ввести вручну.
                  </span>
                </label>
              ) : null}
              <label className="block space-y-1.5">
                <span className="text-[11px] uppercase text-zinc-500">Логін (@username, опційно)</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="авто: creator_1234"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/40"
                />
              </label>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Проксі (опціонально)
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1.5 sm:col-span-2">
                    <span className="text-[11px] uppercase text-zinc-500">Host</span>
                    <input
                      value={proxyHost}
                      onChange={(e) => setProxyHost(e.target.value)}
                      placeholder="proxy.example.com"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-accent/40"
                      autoComplete="off"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[11px] uppercase text-zinc-500">Порт</span>
                    <input
                      value={proxyPort}
                      onChange={(e) => setProxyPort(e.target.value)}
                      inputMode="numeric"
                      disabled={!proxyHost.trim()}
                      placeholder="1080"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-accent/40 disabled:opacity-40"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[11px] uppercase text-zinc-500">Тип</span>
                    <select
                      value={proxyType}
                      onChange={(e) =>
                        setProxyType(e.target.value === 'socks5' ? 'socks5' : 'http')
                      }
                      disabled={!proxyHost.trim()}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/40 disabled:opacity-40"
                    >
                      <option value="socks5">SOCKS5</option>
                      <option value="http">HTTP</option>
                    </select>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[11px] uppercase text-zinc-500">Логін</span>
                    <input
                      value={proxyUser}
                      onChange={(e) => setProxyUser(e.target.value)}
                      disabled={!proxyHost.trim()}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/40 disabled:opacity-40"
                      autoComplete="off"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[11px] uppercase text-zinc-500">Пароль</span>
                    <input
                      type="password"
                      value={proxyPass}
                      onChange={(e) => setProxyPass(e.target.value)}
                      disabled={!proxyHost.trim()}
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/40 disabled:opacity-40"
                      autoComplete="off"
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={createBusy}
                onClick={() => {
                  setCreateOpen(false)
                  resetCreateForm()
                }}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400"
              >
                Скасувати
              </button>
              <button
                type="button"
                disabled={createBusy}
                onClick={() => void createAccount()}
                className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-cyan-100 disabled:opacity-50"
              >
                {createBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Створити і авторег (повністю)
              </button>
            </div>
          </GlassCard>
        </div>
      ) : null}
    </div>
  )
}
