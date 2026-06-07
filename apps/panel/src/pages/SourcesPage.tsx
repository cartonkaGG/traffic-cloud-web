import { BellOff, Download, Link2, PlayCircle, Trash2, UserPlus, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import type { ChatSourceKind } from '@/domain/types'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import {
  apiCreateChatSource,
  apiCreateChatSourcesBulk,
  apiDeleteChatSource,
  apiDownloadChatSourceCsv,
  apiMuteAllChatSourceNotifications,
  apiParseAllChatSources,
  apiParseChatSource,
  apiSyncAllSourceMemberships
} from '@/lib/api'

const kindLabel: Record<ChatSourceKind, string> = {
  username: 'Username',
  invite_link: 'Invite link',
  channel: 'Канал',
  group: 'Группа'
}

function parsePhaseLabelUk(phase?: string): string {
  switch (phase) {
    case 'start':
      return 'Підготовка'
    case 'telegram':
      return 'Звʼязок з Telegram'
    case 'resolve':
      return 'Розпізнавання каналу'
    case 'resolved':
      return 'Чат відкрито'
    case 'collect':
      return 'Збір учасників'
    case 'blocked':
      return 'Список недоступний'
    case 'collect_done':
      return 'Зібрано'
    case 'peer':
      return 'Канал'
    case 'save':
      return 'Збереження в базу'
    case 'persist':
      return 'Фіналізація'
    case 'membership':
      return 'Підписка акаунтів'
    case 'done':
      return 'Готово'
    default:
      return 'Парсинг'
  }
}

export function SourcesPage(): JSX.Element {
  const { bundle, workspaceId, status, refetch, upsertChatSources, parseProgressBySourceId } =
    useWorkspaceData()
  const chatSources = bundle?.chatSources ?? []

  const [value, setValue] = useState('')
  const [title, setTitle] = useState('')
  const [bulkLines, setBulkLines] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [parseInfo, setParseInfo] = useState<string | null>(null)

  const addSource = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      setError('Нет подключения к API')
      return
    }
    const v = value.trim()
    if (!v) return
    setError(null)
    setBusyId('new')
    try {
      const { source } = await apiCreateChatSource(workspaceId, {
        value: v,
        title: title.trim() || null
      })
      upsertChatSources([source])
      setValue('')
      setTitle('')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusyId(null)
    }
  }, [workspaceId, status, value, title, upsertChatSources])

  const addSourcesBulk = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      setError('Нет подключения к API')
      return
    }
    const values = [
      ...new Set(
        bulkLines
          .split(/[\r\n,;]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      )
    ]
    if (values.length === 0) {
      setError('Введіть хоча б один канал або посилання')
      return
    }
    setError(null)
    setParseInfo(null)
    setBusyId('bulk')
    try {
      const res = await apiCreateChatSourcesBulk(workspaceId, { values })
      const parts: string[] = []
      if (res.created > 0) parts.push(`Додано джерел: ${res.created}`)
      if (res.skipped.length > 0) {
        parts.push(`Пропущено (дублікат або вже в списку): ${res.skipped.length}`)
      }
      if (res.failed.length > 0) {
        parts.push(`Помилки: ${res.failed.map((f) => `${f.value} — ${f.error}`).join('; ')}`)
      }
      if (parts.length > 0) setParseInfo(parts.join('. '))
      if (res.created > 0) {
        upsertChatSources(res.sources)
        setBulkLines('')
      } else if (res.sources.length > 0) {
        upsertChatSources(res.sources)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusyId(null)
    }
  }, [workspaceId, status, bulkLines, upsertChatSources])

  const runParse = useCallback(
    async (sid: string) => {
      if (!workspaceId) return
      setError(null)
      setParseInfo(null)
      setBusyId(sid)
      try {
        const res = await apiParseChatSource(workspaceId, sid)
        const parts: string[] = []
        if (res.warning) parts.push(res.warning)
        if (res.membership && res.membership.ok + res.membership.fail > 0) {
          parts.push(
            `Участь MTProto-акаунтів у каналі: успіх ${res.membership.ok}, помилок ${res.membership.fail}`
          )
        }
        if (parts.length) setParseInfo(parts.join(' · '))
        await refetch()
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setBusyId(null)
      }
    },
    [workspaceId, refetch]
  )

  const downloadCsv = useCallback(
    async (sid: string) => {
      if (!workspaceId) return
      setError(null)
      try {
        await apiDownloadChatSourceCsv(workspaceId, sid)
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      }
    },
    [workspaceId]
  )

  const syncAllMemberships = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      setError('Нет подключения к API')
      return
    }
    if (chatSources.length === 0) {
      setError('Спочатку додайте хоча б одне джерело')
      return
    }
    setError(null)
    setParseInfo(null)
    setBusyId('sync-memb')
    try {
      const res = await apiSyncAllSourceMemberships(workspaceId)
      setParseInfo(
        `Усі джерела (${chatSources.length}): успіх ${res.stats.ok}, помилок ${res.stats.fail}` +
          (res.failures.length > 0 ? ' — частина помилок у відповіді API' : '')
      )
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusyId(null)
    }
  }, [workspaceId, status, chatSources.length, refetch])

  const parseAllSources = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      setError('Нет подключения к API')
      return
    }
    if (chatSources.length === 0) {
      setError('Спочатку додайте хоча б одне джерело')
      return
    }
    setError(null)
    setParseInfo(null)
    setBusyId('parse-all')
    try {
      const res = await apiParseAllChatSources(workspaceId, {
        delayMsBetweenSources: 900,
        membershipJoinDelayMs: 600
      })
      const ok = res.results.filter((r) => r.ok).length
      const fail = res.results.length - ok
      const parts: string[] = [
        `Парсинг усіх джерел: ${ok}/${res.results.length} успішно, ~${res.totalImported.toLocaleString('uk-UA')} учасників`
      ]
      if (fail > 0) parts.push(`помилок: ${fail}`)
      setParseInfo(parts.join('. '))
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusyId(null)
    }
  }, [workspaceId, status, chatSources.length, refetch])

  const muteAllChannels = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      setError('Нет подключения к API')
      return
    }
    if (chatSources.length === 0) {
      setError('Спочатку додайте хоча б одне джерело')
      return
    }
    setError(null)
    setParseInfo(null)
    setBusyId('mute-all')
    try {
      const res = await apiMuteAllChatSourceNotifications(workspaceId, { delayMs: 800 })
      setParseInfo(
        `Замутити в Telegram: успішних дій ${res.stats.ok}, помилок ${res.stats.fail} (потрібні MTProto-сесії та вже підписані акаунти на канал).`
      )
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusyId(null)
    }
  }, [workspaceId, status, chatSources.length, refetch])

  const removeSource = useCallback(
    async (sid: string) => {
      if (!workspaceId) return
      setError(null)
      setBusyId(sid)
      try {
        await apiDeleteChatSource(workspaceId, sid)
        await refetch()
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setBusyId(null)
      }
    },
    [workspaceId, refetch]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
            Додайте канали або групи, натисніть «Парсинг» — аудиторія збережеться для розсилки. Потрібна
            MTProto-сесія на акаунті (див. «Акаунти»).
          </p>
          {error ? (
            <p className="mt-2 max-w-3xl text-sm text-red-300/90">{error}</p>
          ) : null}
          {parseInfo ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-amber-200/90">{parseInfo}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <motion.button
            type="button"
            disabled={
              busyId !== null || status !== 'online' || !workspaceId || chatSources.length === 0
            }
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void parseAllSources()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-accent/30 hover:text-white disabled:opacity-40"
          >
            <PlayCircle className="h-4 w-4 text-accent" aria-hidden />
            {busyId === 'parse-all' ? '…' : 'Парсинг усіх'}
          </motion.button>
          <motion.button
            type="button"
            disabled={
              busyId !== null || status !== 'online' || !workspaceId || chatSources.length === 0
            }
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void muteAllChannels()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-accent/30 hover:text-white disabled:opacity-40"
          >
            <BellOff className="h-4 w-4 text-accent" aria-hidden />
            {busyId === 'mute-all' ? '…' : 'Замутити всі канали'}
          </motion.button>
          <motion.button
            type="button"
            disabled={busyId !== null || status !== 'online' || !workspaceId || chatSources.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void syncAllMemberships()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-accent/30 hover:text-white disabled:opacity-40"
          >
            <UserPlus className="h-4 w-4 text-accent" aria-hidden />
            {busyId === 'sync-memb' ? '…' : 'Усі акаунти → джерела'}
          </motion.button>
        </div>
      </div>

      <div className="glass-panel max-w-3xl space-y-6 p-6">
        <div className="text-sm font-semibold text-white">Один джерело</div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-3">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Посилання або @channel
              </span>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="https://t.me/username або @channel"
                className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Назва (необовʼязково)
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="У списку джерел"
                className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
              />
            </label>
          </div>
          <motion.button
            type="button"
            disabled={busyId !== null || status !== 'online'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void addSource()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/15 disabled:opacity-40"
          >
            <Link2 className="h-4 w-4" aria-hidden />
            {busyId === 'new' ? '…' : 'Додати'}
          </motion.button>
        </div>

        <div className="border-t border-white/[0.06] pt-6">
          <div className="text-sm font-semibold text-white">Кілька каналів</div>
          <p className="mt-1 text-[12px] text-zinc-500">
            По одному на рядок або через кому / крапку з комою. Дублікати та вже додані посилання
            пропускаються (до 120 за раз).
          </p>
          <label className="mt-3 block">
            <span className="sr-only">Список каналів</span>
            <textarea
              value={bulkLines}
              onChange={(e) => setBulkLines(e.target.value)}
              rows={8}
              placeholder={'@channel_one\nhttps://t.me/channel_two\nt.me/+inviteHash'}
              className="w-full resize-y rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-[13px] text-white outline-none focus:border-accent/35"
            />
          </label>
          <motion.button
            type="button"
            disabled={busyId !== null || status !== 'online'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void addSourcesBulk()}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/15 disabled:opacity-40"
          >
            <Link2 className="h-4 w-4" aria-hidden />
            {busyId === 'bulk' ? '…' : 'Додати всі'}
          </motion.button>
        </div>
      </div>

      {chatSources.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-12 text-center text-sm text-zinc-500">
          Джерел ще немає. Додайте канал або групу вище — потім запустіть парсинг.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {chatSources.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    {kindLabel[s.kind]}
                  </div>
                  <div className="mt-2 truncate text-lg font-semibold text-white">
                    {s.title ?? 'Без названия'}
                  </div>
                  <div className="mt-2 break-all font-mono text-[12px] text-zinc-400">{s.value}</div>
                </div>
                <Users className="h-5 w-5 shrink-0 text-accent" aria-hidden />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                    В базе
                  </div>
                  <div className="mt-1 font-semibold text-white">
                    {(s.parsedMemberCount ?? 0).toLocaleString('ru-RU')}
                  </div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
                    Последний парсинг
                  </div>
                  <div className="mt-1 font-semibold text-white">
                    {s.lastParsedAt
                      ? new Date(s.lastParsedAt).toLocaleString('ru-RU')
                      : '—'}
                  </div>
                </div>
              </div>
              {(() => {
                const prog = parseProgressBySourceId[s.id]
                const showProg = prog != null || busyId === s.id
                if (!showProg) return null
                const pct = Math.min(100, Math.max(0, prog?.percent ?? 0))
                return (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400">
                      <span className="min-w-0 truncate">{parsePhaseLabelUk(prog?.phase)}</span>
                      <span className="shrink-0 font-mono text-[12px] font-semibold text-accent">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full max-w-full rounded-full bg-gradient-to-r from-accent/90 to-emerald-400/85 transition-[width] duration-300 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })()}
              {s.participantListHidden ? (
                <p className="mt-4 text-[12px] leading-relaxed text-amber-200/90">
                  Список користувачів у цьому каналі прихований. Зібрати повний список учасників через API не
                  вийде без доступу адміністратора до списку учасників.
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId !== null || status !== 'online'}
                  onClick={() => void runParse(s.id)}
                  className="inline-flex flex-1 min-w-[120px] items-center justify-center gap-2 rounded-xl border border-accent/25 bg-accent/10 px-3 py-2 text-[12px] font-semibold text-accent hover:bg-accent/15 disabled:opacity-40"
                >
                  {busyId === s.id ? 'Парсинг…' : 'Парсинг'}
                </button>
                <button
                  type="button"
                  disabled={busyId !== null || status !== 'online' || !workspaceId}
                  onClick={() => void downloadCsv(s.id)}
                  className="inline-flex flex-1 min-w-[120px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] font-medium text-zinc-200 hover:border-accent/30 hover:text-white disabled:opacity-40"
                >
                  <Download className="h-4 w-4 text-accent" aria-hidden />
                  CSV
                </button>
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => void removeSource(s.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-zinc-500 hover:border-red-400/40 hover:text-red-300 disabled:opacity-40"
                  aria-label="Удалить источник"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
