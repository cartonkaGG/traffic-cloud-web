import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Check,
  Flame,
  KeyRound,
  Loader2,
  Pause,
  Pencil,
  Play,
  Plus,
  Rocket,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  Wifi
} from 'lucide-react'
import { DesktopAppGateModal } from '@/components/tiktok/DesktopAppGateModal'
import { TikTokCredentialsModal } from '@/components/tiktok/TikTokCredentialsModal'
import { TikTokEditModal } from '@/components/tiktok/TikTokEditModal'
import { TikTokWarmupPanel } from '@/components/tiktok/TikTokWarmupPanel'
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
import { DesktopInstallCard } from '@/components/desktop/DesktopInstallCard'
import {
  canOpenAntidetectBrowser,
  fetchDesktopDownloadUrl,
  isTrafficCloudShell,
  launchTrafficCloudDesktop,
  openDesktopInstaller
} from '@/lib/desktopAppGate'
import { useDesktopUpdate } from '@/hooks/useDesktopUpdate'
import { startInAppDesktopUpdate } from '@/lib/desktopUpdateRunner'
import {
  credentialsFromAccount,
  openTikTokFromCreateLaunch,
  openTikTokManageForAccount,
  openTikTokWarmupForAccount,
  formatTikTokAccountEmail
} from '@/lib/openTikTokForAccount'
import {
  parseSearchTopicsInput,
  readTikTokWarmupSettings,
  type TikTokWarmupSettings,
  writeTikTokWarmupSettings
} from '@/lib/tiktokWarmupStorage'
import {
  tabFromPathname,
  tiktokSectionPath,
  writeTikTokActiveTab,
  type TikTokTabId
} from '@/lib/tiktokTabStorage'

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
        label: 'Очікує входу',
        className: 'border-amber-400/25 bg-amber-500/10 text-amber-200'
      }
    case 'error':
      return {
        label: 'Помилка',
        className: 'border-red-400/25 bg-red-500/10 text-red-200'
      }
  }
}

export function TikTokWarmupPage(): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const activeTab = useMemo(() => tabFromPathname(location.pathname), [location.pathname])
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
  const [username, setUsername] = useState('')
  const [proxyHost, setProxyHost] = useState('')
  const [proxyPort, setProxyPort] = useState('')
  const [proxyType, setProxyType] = useState<'http' | 'socks5'>('socks5')
  const [proxyUser, setProxyUser] = useState('')
  const [proxyPass, setProxyPass] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [manageBusyId, setManageBusyId] = useState<string | null>(null)
  const [createBusy, setCreateBusy] = useState(false)
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null)
  const [activityLog, setActivityLog] = useState<string[]>([])
  const [credentialsModal, setCredentialsModal] = useState<{
    credentials: TikTokAccountCredentials
    watchHashtags: string[]
    accountId?: string
  } | null>(null)
  const [editAccount, setEditAccount] = useState<TikTokAccountModel | null>(null)
  const [proxyTestBusyId, setProxyTestBusyId] = useState<string | null>(null)
  const [desktopGateOpen, setDesktopGateOpen] = useState(false)
  const [desktopGateForceUpdate, setDesktopGateForceUpdate] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const logTimersRef = useRef<number[]>([])
  const warmupFinishTimerRef = useRef<number | null>(null)
  const warmupProfileIdRef = useRef<string | null>(null)

  const isDesktopShell = isTrafficCloudShell()
  const canLaunchBrowser = canOpenAntidetectBrowser()
  const desktopUpdate = useDesktopUpdate()
  const [bannerDownloadBusy, setBannerDownloadBusy] = useState(false)

  useEffect(() => {
    void fetchDesktopDownloadUrl().then(setDownloadUrl)
  }, [])

  useEffect(() => {
    writeTikTokActiveTab(activeTab)
  }, [activeTab])

  useEffect(() => {
    const tc = window.trafficCloud
    if (!tc?.onTikTokWarmupProgress) return undefined
    return tc.onTikTokWarmupProgress((payload) => {
      const activeProfile = warmupProfileIdRef.current
      if (!activeProfile || payload.profileId !== activeProfile) return
      if (payload.logs.length > 0) {
        setActivityLog(payload.logs.slice(-30))
      }
    })
  }, [])

  const showDesktopGate = useCallback((forceUpdate = false) => {
    setDesktopGateForceUpdate(forceUpdate)
    setDesktopGateOpen(true)
  }, [])

  const setTab = useCallback(
    (tab: TikTokTabId) => {
      writeTikTokActiveTab(tab)
      navigate(tiktokSectionPath(tab))
    },
    [navigate]
  )

  const openCreateFlow = useCallback(() => {
    if (!isTrafficCloudShell()) {
      showDesktopGate(false)
      return
    }
    if (!canOpenAntidetectBrowser()) {
      showDesktopGate(true)
      return
    }
    setTab('create')
  }, [setTab, showDesktopGate])

  const persistSettings = useCallback((next: TikTokWarmupSettings) => {
    setSettings(next)
    writeTikTokWarmupSettings(next)
  }, [])

  const clearLogTimers = useCallback(() => {
    for (const id of logTimersRef.current) window.clearTimeout(id)
    logTimersRef.current = []
  }, [])

  const stopWarmupSession = useCallback(async (account: TikTokAccountModel) => {
    if (warmupFinishTimerRef.current != null) {
      window.clearTimeout(warmupFinishTimerRef.current)
      warmupFinishTimerRef.current = null
    }
    clearLogTimers()
    warmupProfileIdRef.current = null
    const tc = window.trafficCloud
    if (tc?.closeBrowserProfile && account.browserProfileId) {
      await tc.closeBrowserProfile(account.browserProfileId)
    }
  }, [clearLogTimers])

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
    if (!isTrafficCloudShell()) {
      showDesktopGate(false)
      return
    }
    if (!canOpenAntidetectBrowser()) {
      showDesktopGate(true)
      return
    }
    const trimmedUsername = username.trim().replace(/^@+/, '')
    const host = proxyHost.trim()
    const port = host ? parsePort(proxyPort) : null

    if (host && port === null) {
      pushToast('Вкажіть коректний порт проксі', 'error')
      return
    }

    setCreateBusy(true)
    try {
      const r = await apiCreateTikTokAccount(workspaceId, {
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
      resetCreateForm()
      setTab('accounts')
      await refetch()

      const launchResult = await openTikTokFromCreateLaunch(
        workspaceId,
        r.launch,
        r.credentials,
        r.account.id
      )
      if (!launchResult.ok) {
        if (launchResult.needsUpdate) {
          showDesktopGate(true)
          pushToast(launchResult.error, 'error')
        } else if (launchResult.needsDesktop) {
          showDesktopGate(false)
        } else {
          pushToast(launchResult.error, 'error')
        }
      } else {
        pushToast(
          `@${r.account.username} — увійдіть у TikTok вручну в антидетект-браузері`,
          'ok'
        )
      }
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), 'error')
    } finally {
      setCreateBusy(false)
    }
  }, [
    proxyHost,
    proxyPass,
    proxyPort,
    proxyType,
    proxyUser,
    pushToast,
    refetch,
    resetCreateForm,
    setTab,
    showDesktopGate,
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
      pushToast(`@${account.username} — вхід у TikTok завершено`, 'ok')
    },
    [pushToast, refetch, workspaceId]
  )

  const manageAccount = useCallback(
    async (account: TikTokAccountModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Немає підключення до API', 'error')
        return
      }
      if (!isTrafficCloudShell()) {
        showDesktopGate(false)
        return
      }
      if (!canOpenAntidetectBrowser()) {
        showDesktopGate(true)
        return
      }
      setManageBusyId(account.id)
      try {
        const intent = account.status === 'ready' ? 'home' : 'login'
        const r = await openTikTokManageForAccount(workspaceId, account.id, intent)
        if (!r.ok) {
          if (r.needsUpdate) {
            showDesktopGate(true)
            pushToast(r.error, 'error')
          } else if (r.needsDesktop) {
            showDesktopGate(false)
          } else {
            pushToast(r.error, 'error')
          }
          return
        }
        if (intent === 'login') {
          pushToast(`Відкрито TikTok (Android) для @${account.username} — увійдіть вручну`, 'ok')
        } else if (intent === 'home') {
          pushToast(`Стрічка TikTok (Android) @${account.username}`, 'ok')
        }
        await refetch()
      } finally {
        setManageBusyId(null)
      }
    },
    [pushToast, refetch, showDesktopGate, status, workspaceId]
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
    async (account: TikTokAccountModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Немає підключення до API', 'error')
        return
      }
      const topics = parseSearchTopicsInput(settings.searchTopicsRaw)
      const effectiveTopics =
        topics.length > 0 ? topics : account.watchHashtags.filter(Boolean)
      if (effectiveTopics.length === 0) {
        pushToast('Вкажіть теми пошуку — що дивитися в TikTok', 'error')
        setTab('warmup')
        return
      }
      if (!isTrafficCloudShell()) {
        showDesktopGate(false)
        return
      }
      if (!canOpenAntidetectBrowser()) {
        showDesktopGate(true)
        return
      }

      setBusyId(account.id)
      try {
        const updated = await apiUpdateTikTokAccount(workspaceId, account.id, {
          watchHashtags: effectiveTopics,
          status: 'warming'
        })
        await refetch()

        const warmedAccount = updated.account
        const nextTrust = Math.min(
          100,
          warmedAccount.trustScore + 8 + Math.floor(Math.random() * 10)
        )

        const durationMin = Math.min(settings.scrollMinutesMin, settings.scrollMinutesMax)
        const durationMax = Math.max(settings.scrollMinutesMin, settings.scrollMinutesMax)
        const durationMinutes = durationMin + Math.floor(Math.random() * (durationMax - durationMin + 1))

        const opened = await openTikTokWarmupForAccount(workspaceId, warmedAccount.id, {
          searchQueries: effectiveTopics,
          hashtags: [],
          durationMinutes,
          likes: settings.likesPerSession,
          comments: settings.commentsPerSession,
          follows: settings.followsPerSession,
          watchSecondsMin: settings.watchSecondsMin,
          watchSecondsMax: settings.watchSecondsMax,
          watchFullVideos: settings.watchFullVideos,
          minimizeWindow: settings.executionMode === 'headless',
          commentTexts: settings.commentTexts
        })
        if (!opened.ok) {
          if (opened.needsUpdate) {
            showDesktopGate(true)
            pushToast(opened.error, 'error')
          } else if (opened.needsDesktop) {
            showDesktopGate(false)
          } else {
            pushToast(opened.error, 'error')
          }
          await apiUpdateTikTokAccount(workspaceId, warmedAccount.id, { status: 'paused' })
          await refetch()
          setBusyId(null)
          return
        }

        warmupProfileIdRef.current = warmedAccount.browserProfileId
        setActivityLog([`[${warmedAccount.username}] Прогрів запущено — логи з вікна TikTok`])

        const warmupDurationMs = durationMinutes * 60_000
        if (settings.executionMode === 'headless') {
          pushToast(`Прогрів @${warmedAccount.username} · пошук «${effectiveTopics[0]}»`, 'ok')
        }
        warmupFinishTimerRef.current = window.setTimeout(() => {
          warmupFinishTimerRef.current = null
          void finishWarmup(warmedAccount, nextTrust)
        }, warmupDurationMs)
      } catch (e) {
        setBusyId(null)
        pushToast(e instanceof Error ? e.message : String(e), 'error')
      }
    },
    [finishWarmup, pushToast, refetch, setTab, settings, showDesktopGate, status, workspaceId]
  )

  const toggleWarmup = useCallback(
    async (account: TikTokAccountModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Немає підключення до API', 'error')
        return
      }
      if (account.status === 'warming') {
        await stopWarmupSession(account)
        await apiUpdateTikTokAccount(workspaceId, account.id, { status: 'paused' })
        await refetch()
        setBusyId(null)
        pushToast(`Прогрів @${account.username} зупинено`, 'ok')
        return
      }

      if (!isTrafficCloudShell()) {
        showDesktopGate(false)
        return
      }
      if (!canOpenAntidetectBrowser()) {
        showDesktopGate(true)
        return
      }

      void startWarmup(account)
    },
    [pushToast, refetch, showDesktopGate, startWarmup, status, stopWarmupSession, workspaceId]
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
    [credentialsModal, pushToast, refetch, status, workspaceId]
  )

  return (
    <div className="relative isolate p-6 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 20% 0%, rgba(217,70,239,0.12), transparent 55%)'
        }}
      />

      <div className="relative z-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {activeTab === 'create'
            ? 'Додати акаунт'
            : activeTab === 'warmup'
              ? 'Прогрів'
              : 'Акаунти TikTok'}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          {activeTab === 'create'
            ? 'Створіть слот акаунта — відкриється tiktok.com/login, увійдіть вручну у вікні десктоп-додатку.'
            : activeTab === 'warmup'
              ? 'Вкажіть теми пошуку, налаштуйте сесію і натисніть Старт біля акаунта.'
              : 'Список акаунтів, проксі та керування профілями.'}
        </p>
      </div>

      {!isDesktopShell ? (
        <DesktopInstallCard
          variant="install"
          latestVersion={desktopUpdate.latestVersion ?? undefined}
          compact
          primaryBusy={bannerDownloadBusy}
          onPrimary={() => {
            setBannerDownloadBusy(true)
            void startInAppDesktopUpdate(downloadUrl ?? desktopUpdate.downloadUrl).finally(() => {
              window.setTimeout(() => setBannerDownloadBusy(false), 1200)
            })
          }}
          onSecondary={() => launchTrafficCloudDesktop('tiktok')}
          inAppUpdate={desktopUpdate.inAppUpdate}
        />
      ) : !canLaunchBrowser || desktopUpdate.updateAvailable ? (
        <DesktopInstallCard
          variant="update"
          latestVersion={desktopUpdate.latestVersion ?? undefined}
          currentVersion={desktopUpdate.currentVersion}
          compact
          primaryBusy={bannerDownloadBusy}
          inAppUpdate={desktopUpdate.inAppUpdate}
          onPrimary={() => {
            setBannerDownloadBusy(true)
            void startInAppDesktopUpdate(downloadUrl ?? desktopUpdate.downloadUrl).finally(() => {
              window.setTimeout(() => setBannerDownloadBusy(false), 1200)
            })
          }}
        />
      ) : null}

      {activeTab !== 'warmup' ? (
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
      ) : null}

      {activeTab === 'warmup' ? (
        <TikTokWarmupPanel
          accounts={accounts}
          settings={settings}
          onSettingsChange={persistSettings}
          busyId={busyId}
          activityLog={activityLog}
          onToggleAccount={(account) => void toggleWarmup(account)}
        />
      ) : null}

      {activeTab === 'create' ? (
        <GlassCard className="relative z-10 max-w-2xl space-y-5 p-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Додати TikTok акаунт</h2>
            <p className="mt-1 text-[13px] text-zinc-500">
              Відкриється TikTok у режимі <strong className="font-medium text-fuchsia-200">Android-телефону</strong>{' '}
              (як встановлений додаток). Увійдіть email/телефоном і паролем — сесія збережеться в профілі.
            </p>
          </div>
          <div className="pointer-events-auto space-y-4">
            <label className="block space-y-1.5">
              <span className="text-[11px] uppercase text-zinc-500">Назва в панелі (@username, опційно)</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="напр. my_tiktok або залиште порожнім"
                autoComplete="off"
                className="pointer-events-auto w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-fuchsia-400/40"
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
                    className="pointer-events-auto w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-fuchsia-400/40"
                    autoComplete="off"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] uppercase text-zinc-500">Порт</span>
                  <input
                    value={proxyPort}
                    onChange={(e) => setProxyPort(e.target.value)}
                    inputMode="numeric"
                    placeholder="1080"
                    className="pointer-events-auto w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-fuchsia-400/40"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] uppercase text-zinc-500">Тип</span>
                  <select
                    value={proxyType}
                    onChange={(e) => setProxyType(e.target.value === 'socks5' ? 'socks5' : 'http')}
                    className="pointer-events-auto w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-fuchsia-400/40"
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
                    className="pointer-events-auto w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-fuchsia-400/40"
                    autoComplete="off"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] uppercase text-zinc-500">Пароль</span>
                  <input
                    type="password"
                    value={proxyPass}
                    onChange={(e) => setProxyPass(e.target.value)}
                    className="pointer-events-auto w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-fuchsia-400/40"
                    autoComplete="off"
                  />
                </label>
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={createBusy}
            onClick={() => void createAccount()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-3 text-sm font-medium text-fuchsia-100 disabled:opacity-50 sm:w-auto"
          >
            {createBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Додати акаунт і встановити TikTok
          </button>
        </GlassCard>
      ) : null}

      {activeTab === 'accounts' ? (
      <GlassCard className="relative overflow-hidden">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <UserRound className="h-12 w-12 text-fuchsia-300" />
            <h3 className="mt-4 text-lg font-semibold text-white">Ще немає TikTok акаунтів</h3>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Додайте акаунт — відкриється TikTok як на Android. Після входу натисніть «Готово».
            </p>
            <button
              type="button"
              onClick={() => openCreateFlow()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-5 py-2.5 text-sm font-medium text-fuchsia-100"
            >
              <Plus className="h-4 w-4" />
              Додати акаунт
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                  <th className="px-6 py-4 font-semibold">Акаунт</th>
                  <th className="px-4 py-4 font-semibold">Пошук</th>
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
                        <div className="text-[12px] text-zinc-500">
                          {formatTikTokAccountEmail(account.email)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {account.watchHashtags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {account.watchHashtags.slice(0, 3).map((topic) => (
                              <span
                                key={topic}
                                className="inline-flex items-center gap-0.5 rounded-full border border-fuchsia-400/15 bg-fuchsia-500/5 px-2 py-0.5 text-[10px] text-fuchsia-200"
                              >
                                <Search className="h-2.5 w-2.5" />
                                {topic}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[12px] text-zinc-600">—</span>
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
                            {account.status === 'ready' ? 'Керувати' : 'Встановити'}
                          </button>
                          {account.status === 'creating' || account.status === 'paused' ? (
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

      <DesktopAppGateModal
        open={desktopGateOpen}
        forceUpdate={desktopGateForceUpdate}
        onClose={() => setDesktopGateOpen(false)}
        onContinueInDesktop={() => window.location.reload()}
        downloadUrl={downloadUrl}
      />
      </div>
    </div>
  )
}
