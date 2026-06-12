import {
  CalendarClock,
  History,
  Loader2,
  Pause,
  Play,
  Rocket,
  Square,
  Users,
  X
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import { useToast } from '@/context/ToastContext'
import * as mocks from '@/data/mocks'
import type {
  CampaignRunStatus,
  OutreachDmJobModel,
  OutreachDmJobStatus,
  OutreachRunRecordModel,
  TelegramAccountModel
} from '@/domain/types'
import {
  apiGetOutreachRun,
  apiListOutreachJobs,
  apiListOutreachRunHistory,
  apiPauseOutreachJob,
  apiResumeOutreachJob,
  apiStopOutreachJob,
  apiTelegramAccountOutreachStart
} from '@/lib/api'
import { loadCampaignsUi, saveCampaignsUi } from '@/lib/campaignsUiStorage'
import { CampaignsSubNav } from '@/components/layout/CampaignsSubNav'
import { readOutreachFiltersFromStorage } from '@/lib/outreachFiltersStorage'
import { migrateDelayFieldToSeconds, parseDelaySecondsToMs } from '@/lib/delaySecondsUi'

function statusUi(s: CampaignRunStatus): { label: string; className: string } {
  switch (s) {
    case 'running':
      return {
        label: 'Запущена',
        className: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
      }
    case 'scheduled':
      return {
        label: 'Запланирована',
        className: 'border-sky-400/20 bg-sky-400/10 text-sky-200'
      }
    case 'paused':
      return {
        label: 'Пауза',
        className: 'border-amber-400/20 bg-amber-400/10 text-amber-200'
      }
    case 'stopped':
      return {
        label: 'Остановлена',
        className: 'border-white/10 bg-white/5 text-zinc-300'
      }
    case 'completed':
      return {
        label: 'Завершена',
        className: 'border-emerald-400/15 bg-emerald-400/5 text-emerald-200'
      }
    case 'failed':
      return {
        label: 'Ошибка',
        className: 'border-red-400/20 bg-red-400/10 text-red-200'
      }
    default:
      return { label: 'Черновик', className: 'border-white/10 bg-white/5 text-zinc-300' }
  }
}

function outreachStatusUi(s: OutreachDmJobStatus): { label: string; className: string } {
  switch (s) {
    case 'starting':
      return { label: 'Запуск…', className: 'border-sky-400/25 bg-sky-500/10 text-sky-200' }
    case 'running':
      return { label: 'Активна', className: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200' }
    case 'paused':
      return { label: 'Пауза', className: 'border-amber-400/25 bg-amber-500/10 text-amber-200' }
    case 'completed':
      return { label: 'Завершена', className: 'border-zinc-500/20 bg-white/5 text-zinc-300' }
    case 'cancelled':
      return { label: 'Зупинена', className: 'border-orange-400/25 bg-orange-500/10 text-orange-200' }
    case 'failed':
      return { label: 'Помилка', className: 'border-red-400/25 bg-red-500/10 text-red-200' }
    default:
      return { label: s, className: 'border-white/10 bg-white/5 text-zinc-400' }
  }
}

function runRecordStatusLabel(s: string): string {
  switch (s) {
    case 'completed':
      return 'Завершена'
    case 'cancelled':
      return 'Зупинена'
    case 'failed':
      return 'Помилка'
    default:
      return s
  }
}

/** Старі записи: completed при 0 надісланих — показуємо як невдалу доставку. */
function runRecordDisplayStatusLabel(row: OutreachRunRecordModel): string {
  if (row.status === 'completed' && row.cap > 0 && row.sent === 0) return 'Без доставки'
  return runRecordStatusLabel(row.status)
}

function isOutreachJobLive(job: OutreachDmJobModel): boolean {
  return job.status === 'starting' || job.status === 'running' || job.status === 'paused'
}

function formatFinishedAt(iso: string | null): string | null {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

type DmJobCardProps = {
  job: OutreachDmJobModel
  index: number
  showActions: boolean
  outreachBusyId: string | null
  workspaceId: string | null
  apiOnline: boolean
  runOutreachAction: (
    accountId: string,
    fn: () => Promise<{ ok: boolean }>,
    okMsg: string,
    errPrefix: string
  ) => Promise<void>
}

function DmJobCard({
  job,
  index,
  showActions,
  outreachBusyId,
  workspaceId,
  apiOnline,
  runOutreachAction
}: DmJobCardProps): JSX.Element {
  const st = outreachStatusUi(job.status)
  const busy = outreachBusyId === job.accountId
  const canPause = job.status === 'running' && !job.cancelPending
  const canResume = job.status === 'paused'
  const canStop =
    !job.cancelPending &&
    (job.status === 'starting' || job.status === 'running' || job.status === 'paused')
  const finishedLabel = formatFinishedAt(job.finishedAt)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-panel relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-500/10 blur-2xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[11px] text-zinc-500">{job.accountId.slice(0, 12)}…</div>
          <div className="font-mono text-[10px] text-zinc-600">run {job.runId?.slice(0, 8) ?? '—'}…</div>
          <div className="mt-1 text-base font-semibold text-white">{job.accountLabel}</div>
          <div className="mt-1 truncate text-sm text-zinc-400" title={job.sourceLabel ?? job.sourceId}>
            Джерело: {job.sourceLabel ?? job.sourceId}
          </div>
          <div className="mt-3 grid gap-1 font-mono text-[12px] text-zinc-500">
            <div>
              Надіслано: <span className="text-zinc-200">{job.sent}</span> / {job.cap} · кандидатів у черзі:{' '}
              {job.candidates}
            </div>
            <div>Затримка між DM: {job.delayMs} мс</div>
            {!showActions && finishedLabel ? (
              <div className="text-zinc-400">Завершено: {finishedLabel}</div>
            ) : null}
            {job.lastError ? <div className="text-red-300/90">Помилка: {job.lastError}</div> : null}
            {job.cancelPending ? <div className="text-amber-200/90">Запит на зупинку…</div> : null}
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${st.className}`}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden /> : null}
          {st.label}
        </span>
      </div>

      {showActions && workspaceId ? (
        <div className="relative mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canPause || busy || !apiOnline}
            onClick={() =>
              void runOutreachAction(
                job.accountId,
                () => apiPauseOutreachJob(workspaceId, job.accountId),
                'Розсилку призупинено',
                'Пауза'
              )
            }
            className="inline-flex min-w-[120px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-amber-400/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Pause className="h-4 w-4" aria-hidden />
            Пауза
          </button>
          <button
            type="button"
            disabled={!canResume || busy || !apiOnline}
            onClick={() =>
              void runOutreachAction(
                job.accountId,
                () => apiResumeOutreachJob(workspaceId, job.accountId),
                'Розсилку відновлено',
                'Продовження'
              )
            }
            className="inline-flex min-w-[120px] flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Play className="h-4 w-4" aria-hidden />
            Далі
          </button>
          <button
            type="button"
            disabled={!canStop || busy || !apiOnline}
            onClick={() =>
              void runOutreachAction(
                job.accountId,
                () => apiStopOutreachJob(workspaceId, job.accountId),
                'Надіслано сигнал зупинки',
                'Зупинка'
              )
            }
            className="inline-flex min-w-[120px] flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100 transition-colors hover:bg-red-500/18 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Square className="h-4 w-4" aria-hidden />
            Стоп
          </button>
        </div>
      ) : null}
    </motion.div>
  )
}

export function CampaignsPage(): JSX.Element {
  const { bundle, workspaceId, status, refetch } = useWorkspaceData()
  const { pushToast } = useToast()
  const campaigns = bundle?.campaigns ?? mocks.campaigns

  const [outreachJobs, setOutreachJobs] = useState<OutreachDmJobModel[]>([])
  const [outreachBusyId, setOutreachBusyId] = useState<string | null>(null)
  const [bulkSourceId, setBulkSourceId] = useState('')
  const [bulkMax, setBulkMax] = useState('40')
  const [bulkDelay, setBulkDelay] = useState('3')
  const [bulkSelectedIds, setBulkSelectedIds] = useState<string[]>([])
  const [bulkLaunchBusy, setBulkLaunchBusy] = useState(false)
  const [runHistory, setRunHistory] = useState<OutreachRunRecordModel[]>([])
  const [detailRun, setDetailRun] = useState<OutreachRunRecordModel | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const campaignsHydrateRef = useRef<{ wid: string | null; done: boolean }>({ wid: null, done: false })

  const liveOutreachJobs = useMemo(
    () => outreachJobs.filter(isOutreachJobLive),
    [outreachJobs]
  )

  const runningAccountIds = useMemo(
    () => new Set(liveOutreachJobs.map((j) => j.accountId)),
    [liveOutreachJobs]
  )

  const telegramAccounts = bundle?.telegramAccounts ?? []
  const chatSources = bundle?.chatSources ?? []

  const defaultSourceId = chatSources[0]?.id ?? ''

  useEffect(() => {
    if (!workspaceId) {
      campaignsHydrateRef.current = { wid: null, done: false }
      return
    }
    if (campaignsHydrateRef.current.wid !== workspaceId) {
      campaignsHydrateRef.current = { wid: workspaceId, done: false }
    }
    if (campaignsHydrateRef.current.done) return
    if (!chatSources.length) return

    campaignsHydrateRef.current.done = true
    const s = loadCampaignsUi(workspaceId)
    if (s.bulkMax != null && s.bulkMax !== '') setBulkMax(s.bulkMax)
    if (s.bulkDelay != null && s.bulkDelay !== '')
      setBulkDelay(migrateDelayFieldToSeconds(s.bulkDelay, '3'))
    if (s.bulkSourceId && chatSources.some((c) => c.id === s.bulkSourceId)) {
      setBulkSourceId(s.bulkSourceId)
    }
    if (s.bulkSelectedIds?.length) {
      const valid = s.bulkSelectedIds.filter((id) => telegramAccounts.some((a) => a.id === id))
      setBulkSelectedIds(valid)
    }
  }, [workspaceId, chatSources, telegramAccounts])

  useEffect(() => {
    if (!bulkSourceId && defaultSourceId) setBulkSourceId(defaultSourceId)
  }, [bulkSourceId, defaultSourceId])

  useEffect(() => {
    if (!workspaceId) return
    saveCampaignsUi(workspaceId, {
      bulkSourceId,
      bulkMax,
      bulkDelay,
      bulkSelectedIds
    })
  }, [workspaceId, bulkSourceId, bulkMax, bulkDelay, bulkSelectedIds])

  const eligibleForBulk = useMemo(
    () =>
      telegramAccounts.filter(
        (a) => a.hasMtprotoSession === true && !runningAccountIds.has(a.id)
      ),
    [telegramAccounts, runningAccountIds]
  )

  const toggleBulkAccount = useCallback((id: string) => {
    setBulkSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const selectAllEligibleBulk = useCallback(() => {
    setBulkSelectedIds(eligibleForBulk.map((a) => a.id))
  }, [eligibleForBulk])

  const clearBulkSelection = useCallback(() => setBulkSelectedIds([]), [])

  const loadRunHistory = useCallback(async () => {
    if (!workspaceId || status !== 'online') return
    try {
      const r = await apiListOutreachRunHistory(workspaceId)
      setRunHistory(r.runs ?? [])
    } catch {
      /* ignore */
    }
  }, [workspaceId, status])

  const loadOutreachJobs = useCallback(async () => {
    if (!workspaceId || status !== 'online') return
    try {
      const r = await apiListOutreachJobs(workspaceId)
      setOutreachJobs(r.jobs ?? [])
    } catch {
      /* тихо при офлайні */
    }
  }, [workspaceId, status])

  useEffect(() => {
    void loadOutreachJobs()
    void loadRunHistory()
  }, [loadOutreachJobs, loadRunHistory])

  useEffect(() => {
    if (!workspaceId || status !== 'online') return
    const id = window.setInterval(() => {
      void loadOutreachJobs()
      void loadRunHistory()
    }, 2000)
    return () => window.clearInterval(id)
  }, [workspaceId, status, loadOutreachJobs, loadRunHistory])

  const runIdOpen = searchParams.get('run')
  useEffect(() => {
    if (!runIdOpen || !workspaceId || status !== 'online') {
      setDetailRun(null)
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const r = await apiGetOutreachRun(workspaceId, runIdOpen)
        if (!cancelled) setDetailRun(r.run)
      } catch {
        if (!cancelled) setDetailRun(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [runIdOpen, workspaceId, status])

  const runOutreachAction = useCallback(
    async (
      accountId: string,
      fn: () => Promise<{ ok: boolean }>,
      okMsg: string,
      errPrefix: string
    ) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Нет подключения к API', 'error')
        return
      }
      setOutreachBusyId(accountId)
      try {
        await fn()
        pushToast(okMsg, 'ok')
        await loadOutreachJobs()
        await loadRunHistory()
        await refetch()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        pushToast(`${errPrefix}: ${msg}`, 'error')
      } finally {
        setOutreachBusyId(null)
      }
    },
    [workspaceId, status, loadOutreachJobs, loadRunHistory, refetch, pushToast]
  )

  const launchBulkOutreach = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      pushToast('Немає підключення до API', 'error')
      return
    }
    if (!bulkSourceId.trim()) {
      pushToast('Оберіть джерело аудиторії', 'error')
      return
    }
    if (bulkSelectedIds.length === 0) {
      pushToast('Оберіть хоча б один акаунт', 'error')
      return
    }
    const maxN = Number(bulkMax)
    if (!Number.isFinite(maxN) || maxN < 1) {
      pushToast('Ліміт повідомлень: число від 1', 'error')
      return
    }
    const delayParsed = parseDelaySecondsToMs(bulkDelay)
    if (!delayParsed.ok) {
      pushToast(delayParsed.error, 'error')
      return
    }
    const delayMs = delayParsed.ms
    setBulkLaunchBusy(true)
    const labelById = new Map(telegramAccounts.map((a) => [a.id, a.label]))
    const { user, safety } = readOutreachFiltersFromStorage()
    const bodyBase = {
      sourceId: bulkSourceId.trim(),
      maxMessages: Math.floor(maxN),
      delayMs,
      templateMode: 'random' as const,
      userFilters: user,
      safetyFilters: safety
    }
    const failures: string[] = []
    let ok = 0
    try {
      for (const id of bulkSelectedIds) {
        const r = await apiTelegramAccountOutreachStart(workspaceId, id, bodyBase)
        if (r.ok) ok++
        else failures.push(`${labelById.get(id) ?? id.slice(0, 8)}: ${r.error ?? 'помилка'}`)
      }
    } finally {
      setBulkLaunchBusy(false)
    }
    await loadOutreachJobs()
    await loadRunHistory()
    await refetch()
    if (failures.length === 0) {
      pushToast(`Розсилку запущено на ${ok} акаунт(ів)`, 'ok')
      setBulkSelectedIds([])
    } else if (ok > 0) {
      pushToast(`Запущено ${ok}, помилок ${failures.length}. ${failures.slice(0, 2).join('; ')}`, 'error')
    } else {
      pushToast(`Не вдалося запустити: ${failures.slice(0, 3).join('; ')}`, 'error')
    }
  }, [
    workspaceId,
    status,
    bulkSourceId,
    bulkMax,
    bulkDelay,
    bulkSelectedIds,
    telegramAccounts,
    loadOutreachJobs,
    loadRunHistory,
    refetch,
    pushToast
  ])

  const historyStats = useMemo(() => {
    const totalSent = runHistory.reduce((acc, r) => acc + r.sent, 0)
    const failed = runHistory.filter(
      (r) => r.status === 'failed' || (r.status === 'completed' && r.cap > 0 && r.sent === 0)
    ).length
    return { totalSent, totalRuns: runHistory.length, failed }
  }, [runHistory])

  return (
    <div className="space-y-8">
      <CampaignsSubNav />

      <section className="glass-panel space-y-5 p-6">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <Users className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-white">Запуск розсилки · кілька акаунтів</h2>
            <p className="mt-1 text-[13px] text-zinc-500">
              Текст кожного DM — випадковий шаблон зі списку «Повідомлення». Фільтри аудиторії та безпеки беруться з
              вкладки «Фільтри» (localStorage).
            </p>
          </div>
        </div>

        {status !== 'online' ? (
          <p className="text-sm text-zinc-500">Потрібне підключення до API.</p>
        ) : chatSources.length === 0 ? (
          <p className="text-sm text-amber-200/90">
            Немає джерел аудиторії — спочатку додайте та розпарсіть чат у розділі «Джерела».
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block space-y-1.5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Джерело</span>
                <select
                  value={bulkSourceId}
                  onChange={(e) => setBulkSourceId(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/40"
                >
                  {chatSources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title ?? s.value}
                      {s.participantListHidden ? ' · прихований список' : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Ліміт DM</span>
                <input
                  type="number"
                  min={1}
                  value={bulkMax}
                  onChange={(e) => setBulkMax(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-accent/40"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Затримка, с</span>
                <input
                  type="number"
                  min={500}
                  step={100}
                  value={bulkDelay}
                  onChange={(e) => setBulkDelay(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-black/40 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-accent/40"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={selectAllEligibleBulk}
                disabled={eligibleForBulk.length === 0 || bulkLaunchBusy}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-white/20 hover:text-white disabled:opacity-40"
              >
                Обрати всі доступні
              </button>
              <button
                type="button"
                onClick={clearBulkSelection}
                disabled={bulkSelectedIds.length === 0 || bulkLaunchBusy}
                className="rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
              >
                Зняти вибір
              </button>
              <span className="text-xs text-zinc-600">
                Обрано: {bulkSelectedIds.length} / {eligibleForBulk.length} доступних
              </span>
            </div>

            <div className="max-h-[280px] space-y-2 overflow-y-auto rounded-xl border border-white/[0.06] bg-black/20 p-3">
              {telegramAccounts.length === 0 ? (
                <p className="text-sm text-zinc-500">Немає акаунтів у workspace.</p>
              ) : (
                telegramAccounts.map((a: TelegramAccountModel) => {
                  const hasSession = a.hasMtprotoSession === true
                  const busyRun = runningAccountIds.has(a.id)
                  const eligible = hasSession && !busyRun
                  const checked = bulkSelectedIds.includes(a.id)
                  return (
                    <label
                      key={a.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.04] ${
                        !eligible ? 'opacity-40' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!eligible || bulkLaunchBusy}
                        onChange={() => toggleBulkAccount(a.id)}
                        className="h-4 w-4 shrink-0 rounded border-white/20 bg-black/50 accent-emerald-400"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-white">{a.label}</div>
                        <div className="truncate font-mono text-[11px] text-zinc-500">
                          {a.username ? `@${a.username}` : a.phone}
                          {!hasSession ? ' · немає MTProto' : null}
                          {busyRun ? ' · розсилка вже йде' : null}
                        </div>
                      </div>
                    </label>
                  )
                })
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={
                  bulkLaunchBusy ||
                  bulkSelectedIds.length === 0 ||
                  !bulkSourceId ||
                  status !== 'online'
                }
                onClick={() => void launchBulkOutreach()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-5 py-2.5 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {bulkLaunchBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Rocket className="h-4 w-4" aria-hidden />
                )}
                Запустити на обраних
              </motion.button>
            </div>
          </>
        )}
      </section>

      <section className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">DM розсилка · активні</h2>
              <p className="mt-1 text-[13px] text-zinc-500">
                Оновлення кожні ~2 с. Завершені запуски — у таблиці «Архів» нижче (деталі по кліку).
              </p>
            </div>
          </div>

          {liveOutreachJobs.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-white/[0.06] px-6 py-10 text-center text-sm text-zinc-500">
              Немає активних розсилок. Запустіть з блоку «кілька акаунтів» вище або «Запустити спам» у вкладці
              «Аккаунты».
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {liveOutreachJobs.map((job, i) => (
                <DmJobCard
                  key={`${job.accountId}-${job.startedAt}`}
                  job={job}
                  index={i}
                  showActions
                  outreachBusyId={outreachBusyId}
                  workspaceId={workspaceId}
                  apiOnline={status === 'online'}
                  runOutreachAction={runOutreachAction}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <History className="h-5 w-5 text-zinc-500" aria-hidden />
            <h2 className="text-lg font-semibold text-white">Архів запусків DM</h2>
          </div>
          <p className="text-[13px] text-zinc-500">
            Локальна історія до 500 записів. Натисніть рядок, щоб відкрити статистику запуску. Загалом:{' '}
            <span className="text-zinc-300">{historyStats.totalRuns}</span> запусків · надіслано{' '}
            <span className="text-zinc-300">{historyStats.totalSent}</span> · невдалих{' '}
            <span className="text-zinc-300">{historyStats.failed}</span>.
          </p>

          {runHistory.length === 0 ? (
            <div className="glass-panel rounded-2xl border border-white/[0.06] px-6 py-8 text-center text-sm text-zinc-500">
              Поки немає завершених запусків у архіві. Після завершення розсилки запис з&apos;явиться тут.
            </div>
          ) : (
            <div className="glass-panel overflow-hidden">
              <div className="grid grid-cols-[1.2fr_1fr_0.7fr_0.9fr_0.6fr] gap-2 border-b border-white/[0.06] bg-black/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                <div>Завершено</div>
                <div>Акаунт</div>
                <div>Статус</div>
                <div>Надіслано</div>
                <div>Шаблон</div>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {runHistory.map((row) => (
                  <button
                    key={row.runId}
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams)
                      next.set('run', row.runId)
                      setSearchParams(next)
                    }}
                    className="grid w-full grid-cols-[1.2fr_1fr_0.7fr_0.9fr_0.6fr] gap-2 border-b border-white/[0.04] px-4 py-2.5 text-left text-[13px] text-zinc-300 transition-colors hover:bg-white/[0.05]"
                  >
                    <div className="font-mono text-[12px] text-zinc-400">
                      {formatFinishedAt(row.finishedAt) ?? '—'}
                    </div>
                    <div className="truncate font-medium text-white">{row.accountLabel}</div>
                    <div>{runRecordDisplayStatusLabel(row)}</div>
                    <div className="font-mono text-zinc-200">
                      {row.sent} / {row.cap}
                    </div>
                    <div className="text-zinc-500">{row.templateMode === 'random' ? 'random' : 'fixed'}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Кампанії (Mongo)</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {campaigns.map((c, i) => {
            const st = statusUi(c.status as CampaignRunStatus)
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-panel relative overflow-hidden p-6"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-accent/10 blur-3xl" />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-white">{c.name}</div>
                    <div className="mt-1 text-sm text-zinc-500">{c.channelLabel}</div>
                    <div className="mt-3 font-mono text-[11px] text-zinc-600">
                      Очередь · {c.queueDepth.toLocaleString('ru-RU')} задач
                    </div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${st.className}`}>
                    {st.label}
                  </span>
                </div>

                <div className="relative mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                      Охват
                    </div>
                    <div className="mt-1 font-semibold text-white">{c.reachLabel}</div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                      CTR
                    </div>
                    <div className="mt-1 font-semibold text-white">{c.ctrLabel}</div>
                  </div>
                </div>

                <div className="relative mt-6 flex gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-accent/30 hover:text-white"
                  >
                    <CalendarClock className="h-4 w-4 text-accent" aria-hidden />
                    Расписание
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-accent/25 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/15"
                  >
                    {c.status === 'running' ? (
                      <>
                        <Play className="h-4 w-4" aria-hidden />
                        Управлять
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4" aria-hidden />
                        Запустить
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {runIdOpen ? (
        <div className="fixed inset-0 z-[140] flex items-start justify-center overflow-y-auto bg-black/75 px-4 py-10 backdrop-blur-md">
          <button
            type="button"
            aria-label="Закрити"
            className="absolute inset-0 z-0 cursor-default"
            onClick={() => {
              const next = new URLSearchParams(searchParams)
              next.delete('run')
              setSearchParams(next)
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 mt-4 w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950/95 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Статистика запуску</h3>
              <button
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(searchParams)
                  next.delete('run')
                  setSearchParams(next)
                }}
                className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            {detailRun ? (
              <div className="mt-5 space-y-3 text-[13px] leading-relaxed text-zinc-300">
                <div>
                  <span className="text-zinc-500">runId</span>{' '}
                  <span className="break-all font-mono text-[11px] text-accent">{detailRun.runId}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Акаунт</span> {detailRun.accountLabel}
                </div>
                <div>
                  <span className="text-zinc-500">Джерело</span> {detailRun.sourceLabel ?? detailRun.sourceId}
                </div>
                <div>
                  <span className="text-zinc-500">Статус</span> {runRecordDisplayStatusLabel(detailRun)}
                </div>
                <div>
                  <span className="text-zinc-500">Надіслано / ліміт</span>{' '}
                  <span className="font-mono text-white">
                    {detailRun.sent} / {detailRun.cap}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Кандидатів у черзі (на старті)</span> {detailRun.candidates}
                </div>
                <div>
                  <span className="text-zinc-500">Затримка між DM</span> {detailRun.delayMs} мс
                </div>
                <div>
                  <span className="text-zinc-500">Режим шаблону</span>{' '}
                  {detailRun.templateMode === 'random' ? 'випадковий зі списку' : 'фіксований / активний'}
                </div>
                <div>
                  <span className="text-zinc-500">Старт</span> {formatFinishedAt(detailRun.startedAt) ?? '—'}
                </div>
                <div>
                  <span className="text-zinc-500">Завершення</span> {formatFinishedAt(detailRun.finishedAt) ?? '—'}
                </div>
                {detailRun.lastError ? (
                  <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-red-200">
                    {detailRun.lastError}
                  </div>
                ) : null}
                <div className="pt-2 text-[12px] text-zinc-500">
                  Успішність відносно ліміту:{' '}
                  <span className="font-semibold text-white">
                    {detailRun.cap > 0 ? Math.round((100 * detailRun.sent) / detailRun.cap) : 0}%
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm text-zinc-500">Завантаження або запис не знайдений…</p>
            )}
          </motion.div>
        </div>
      ) : null}
    </div>
  )
}
