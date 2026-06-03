import { Pencil, Plus, Rocket, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useMemo, useState } from 'react'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import * as mocks from '@/data/mocks'
import type { BrowserProfile } from '@/domain/types'
import {
  apiCreateBrowserProfile,
  apiDeleteBrowserProfile,
  apiTouchBrowserProfileLaunch,
  apiUpdateBrowserProfile
} from '@/lib/api'
import {
  FINGERPRINT_PRESETS,
  generateRandomFingerprint,
  LOCALE_CHOICES,
  TIMEZONE_CHOICES
} from '@/lib/randomFingerprint'

export function BrowserProfilesPage(): JSX.Element {
  const { bundle, workspaceId, status, refetch } = useWorkspaceData()
  const browserProfiles = bundle?.browserProfiles ?? mocks.browserProfiles
  const proxiesList = bundle?.proxies ?? mocks.proxies

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null)
  const [useRandomFingerprint, setUseRandomFingerprint] = useState(true)
  const [name, setName] = useState('')
  const [proxyId, setProxyId] = useState<string>('')
  const [timezone, setTimezone] = useState('Europe/Warsaw')
  const [locale, setLocale] = useState('ru-RU')
  const [userAgent, setUserAgent] = useState('')
  const [webglVendor, setWebglVendor] = useState('Google Inc. (ANGLE)')
  const [canvasNoise, setCanvasNoise] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [launchingId, setLaunchingId] = useState<string | null>(null)
  const [launchError, setLaunchError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const proxyById = useMemo(() => {
    const m: Record<string, (typeof proxiesList)[0]> = {}
    for (const p of proxiesList) m[p.id] = p
    return m
  }, [proxiesList])

  const resetForm = useCallback(() => {
    const fp = generateRandomFingerprint()
    setEditingProfileId(null)
    setUseRandomFingerprint(true)
    setName('')
    setProxyId('')
    setTimezone(fp.timezone)
    setLocale(fp.locale)
    setUserAgent(fp.userAgent)
    setWebglVendor(fp.webglVendor)
    setCanvasNoise(fp.canvasNoise)
    setError(null)
  }, [])

  const closeModal = useCallback(() => {
    if (busy) return
    setModalOpen(false)
    resetForm()
  }, [busy, resetForm])

  const openEditProfile = useCallback((bp: BrowserProfile) => {
    setEditingProfileId(bp.id)
    setUseRandomFingerprint(false)
    setName(bp.name)
    setProxyId(bp.proxyId ?? '')
    setTimezone(bp.fingerprint.timezone)
    setLocale(bp.fingerprint.locale)
    setUserAgent(bp.fingerprint.userAgent)
    setWebglVendor(bp.fingerprint.webglVendor)
    setCanvasNoise(bp.fingerprint.canvasNoise)
    setError(null)
    setModalOpen(true)
  }, [])

  const saveProfile = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      setError('Нет подключения к API')
      return
    }
    const n = name.trim()
    if (!n) {
      setError('Укажите название профиля')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const roll = generateRandomFingerprint()
      const fp =
        !editingProfileId && useRandomFingerprint
          ? roll
          : {
              timezone: timezone.trim() || roll.timezone,
              locale: locale.trim() || roll.locale,
              userAgent: userAgent.trim() || roll.userAgent,
              webglVendor: webglVendor.trim() || roll.webglVendor,
              canvasNoise
            }

      if (editingProfileId) {
        await apiUpdateBrowserProfile(workspaceId, editingProfileId, {
          name: n,
          proxyId: proxyId === '' ? null : proxyId,
          timezone: fp.timezone,
          locale: fp.locale,
          userAgent: fp.userAgent,
          webglVendor: fp.webglVendor,
          canvasNoise: fp.canvasNoise
        })
      } else {
        await apiCreateBrowserProfile(workspaceId, {
          name: n,
          proxyId: proxyId === '' ? null : proxyId,
          timezone: fp.timezone,
          locale: fp.locale,
          userAgent: fp.userAgent,
          webglVendor: fp.webglVendor,
          canvasNoise: fp.canvasNoise
        })
      }
      closeModal()
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }, [
    workspaceId,
    status,
    name,
    proxyId,
    editingProfileId,
    useRandomFingerprint,
    timezone,
    locale,
    userAgent,
    webglVendor,
    canvasNoise,
    closeModal,
    refetch
  ])

  const launchProfile = useCallback(
    async (bp: BrowserProfile) => {
      if (!workspaceId || status !== 'online') {
        setLaunchError('Нет подключения к API')
        return
      }
      const tc = window.trafficCloud
      if (!tc?.openBrowserProfile) {
        setLaunchError('Запуск доступен только в десктоп-приложении (Electron).')
        return
      }
      setLaunchingId(bp.id)
      setLaunchError(null)
      try {
        const proxy = bp.proxyId ? proxyById[bp.proxyId] : undefined
        const result = await tc.openBrowserProfile({
          profileId: bp.id,
          userAgent: bp.fingerprint.userAgent,
          proxy: proxy
            ? {
                protocol: proxy.protocol,
                host: proxy.host,
                port: proxy.port,
                username: proxy.username,
                password: proxy.password
              }
            : null
        })
        if (!result.ok) {
          setLaunchError('error' in result ? result.error : 'Не удалось открыть окно')
          return
        }
        await apiTouchBrowserProfileLaunch(workspaceId, bp.id)
        await refetch()
      } catch (e) {
        setLaunchError(e instanceof Error ? e.message : String(e))
      } finally {
        setLaunchingId(null)
      }
    },
    [workspaceId, status, proxyById, refetch]
  )

  const deleteProfile = useCallback(
    async (bp: BrowserProfile) => {
      if (!workspaceId || status !== 'online') {
        setLaunchError('Нет подключения к API')
        return
      }
      const ok = window.confirm(`Удалить профиль «${bp.name}»? Данные сессии в приложении будут очищены.`)
      if (!ok) return
      setDeletingId(bp.id)
      setLaunchError(null)
      try {
        await apiDeleteBrowserProfile(workspaceId, bp.id)
        const tc = window.trafficCloud
        if (tc?.clearBrowserProfileStorage) {
          await tc.clearBrowserProfileStorage(bp.id)
        }
        await refetch()
      } catch (e) {
        setLaunchError(e instanceof Error ? e.message : String(e))
      } finally {
        setDeletingId(null)
      }
    },
    [workspaceId, status, refetch]
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500">
            Профили сохраняются локально. При создании можно сразу привязать прокси из списка узлов (страница
            «Прокси»).
          </p>
          {error && !modalOpen ? (
            <p className="mt-2 max-w-3xl text-sm text-red-300/90">{error}</p>
          ) : null}
          {launchError ? (
            <p className="mt-2 max-w-3xl text-sm text-red-300/90">{launchError}</p>
          ) : null}
        </div>
        <motion.button
          type="button"
          disabled={status !== 'online' || !workspaceId}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            resetForm()
            setModalOpen(true)
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/15 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Новый профиль
        </motion.button>
      </div>

      <AnimatePresence>
        {modalOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeModal()}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="glass-panel relative max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto p-6 shadow-glow"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {editingProfileId ? 'Редактировать профиль' : 'Новый браузерный профиль'}
                  </div>
                  <p className="mt-1 text-[13px] text-zinc-500">
                    {editingProfileId
                      ? 'Измените название, прокси или отпечаток. Сохранённые данные сессии Telegram остаются в приложении.'
                      : 'Отпечаток можно оставить случайным или выбрать шаблон / задать поля вручную. Прокси опционально.'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                  aria-label="Закрыть"
                  onClick={() => closeModal()}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {error ? <p className="text-[13px] text-red-300/95">{error}</p> : null}

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Название
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  placeholder="Например Orbit · Chromium"
                  autoComplete="off"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {editingProfileId ? 'Прокси' : 'Прокси при создании'}
                </span>
                <select
                  value={proxyId}
                  onChange={(e) => setProxyId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                >
                  <option value="">Без прокси</option>
                  {proxiesList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} · {p.protocol} {p.host}:{p.port}
                    </option>
                  ))}
                </select>
                {proxiesList.length === 0 ? (
                  <p className="mt-2 text-[12px] text-amber-400/90">
                    Узлов прокси пока нет — сначала добавьте записи на странице «Прокси» (или создайте профиль без
                    прокси).
                  </p>
                ) : null}
              </label>

              {!editingProfileId ? (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={useRandomFingerprint}
                    onChange={(e) => setUseRandomFingerprint(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-black/40 text-accent"
                  />
                  <span className="text-[13px] text-zinc-300">
                    Случайный отпечаток при сохранении (UA, часовой пояс, locale…)
                  </span>
                </label>
              ) : null}

              {(editingProfileId || !useRandomFingerprint) && (
                <div className="space-y-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Шаблоны отпечатка
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {FINGERPRINT_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setTimezone(preset.fingerprint.timezone)
                            setLocale(preset.fingerprint.locale)
                            setUserAgent(preset.fingerprint.userAgent)
                            setWebglVendor(preset.fingerprint.webglVendor)
                            setCanvasNoise(preset.fingerprint.canvasNoise)
                          }}
                          className="rounded-lg border border-white/10 bg-black/25 px-3 py-1.5 text-[11px] font-medium text-zinc-300 hover:border-accent/25 hover:text-white disabled:opacity-40"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      const fp = generateRandomFingerprint()
                      setTimezone(fp.timezone)
                      setLocale(fp.locale)
                      setUserAgent(fp.userAgent)
                      setWebglVendor(fp.webglVendor)
                      setCanvasNoise(fp.canvasNoise)
                    }}
                    className="text-[12px] font-medium text-zinc-400 underline-offset-2 hover:text-accent hover:underline disabled:opacity-40"
                  >
                    Сгенерировать новый отпечаток (случайно)
                  </button>

                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Timezone
                    </span>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-2 font-mono text-[13px] text-white outline-none focus:border-accent/35"
                    >
                      {!(TIMEZONE_CHOICES as readonly string[]).includes(timezone) ? (
                        <option value={timezone}>{timezone}</option>
                      ) : null}
                      {TIMEZONE_CHOICES.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Locale
                    </span>
                    <select
                      value={locale}
                      onChange={(e) => setLocale(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-2 font-mono text-[13px] text-white outline-none focus:border-accent/35"
                    >
                      {!(LOCALE_CHOICES as readonly string[]).includes(locale) ? (
                        <option value={locale}>{locale}</option>
                      ) : null}
                      {LOCALE_CHOICES.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      User-Agent
                    </span>
                    <textarea
                      value={userAgent}
                      onChange={(e) => setUserAgent(e.target.value)}
                      rows={3}
                      className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-2 font-mono text-[11px] text-zinc-200 outline-none focus:border-accent/35"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      WebGL vendor (stub)
                    </span>
                    <input
                      value={webglVendor}
                      onChange={(e) => setWebglVendor(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-2 font-mono text-[13px] text-white outline-none focus:border-accent/35"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={canvasNoise}
                      onChange={(e) => setCanvasNoise(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-black/40 text-accent"
                    />
                    <span className="text-[13px] text-zinc-300">Canvas noise</span>
                  </label>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => closeModal()}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.04] disabled:opacity-40"
                >
                  Отмена
                </button>
                <motion.button
                  type="button"
                  disabled={busy || status !== 'online'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void saveProfile()}
                  className="rounded-xl border border-accent/35 bg-accent/15 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-40"
                >
                  {busy
                    ? editingProfileId
                      ? 'Сохранение…'
                      : 'Создание…'
                    : editingProfileId
                      ? 'Сохранить'
                      : 'Создать профиль'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="glass-panel overflow-hidden">
        <div className="border-b border-white/[0.06] px-6 py-4 text-sm font-semibold text-white">
          Браузерные профили
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                <th className="px-6 py-4 font-medium">Название</th>
                <th className="px-6 py-4 font-medium">Timezone</th>
                <th className="px-6 py-4 font-medium">UA (сокр.)</th>
                <th className="px-6 py-4 font-medium">Canvas</th>
                <th className="px-6 py-4 font-medium">Прокси</th>
                <th className="px-6 py-4 font-medium">Последний запуск</th>
                <th className="px-6 py-4 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {browserProfiles.map((bp, i) => {
                const proxy = bp.proxyId ? proxyById[bp.proxyId] : undefined
                return (
                  <motion.tr
                    key={bp.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-100">{bp.name}</td>
                    <td className="px-6 py-4 font-mono text-[12px] text-zinc-400">{bp.fingerprint.timezone}</td>
                    <td className="max-w-[320px] truncate px-6 py-4 font-mono text-[11px] text-zinc-500">
                      {bp.fingerprint.userAgent.slice(0, 72)}…
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {bp.fingerprint.canvasNoise ? 'noise on' : 'off'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{proxy?.label ?? '—'}</td>
                    <td className="px-6 py-4 font-mono text-[12px] text-zinc-500">
                      {bp.lastLaunchedAt
                        ? new Date(bp.lastLaunchedAt).toLocaleString('ru-RU')
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={
                            launchingId !== null || deletingId !== null || status !== 'online'
                          }
                          onClick={() => openEditProfile(bp)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] font-medium text-zinc-200 hover:border-accent/30 hover:text-white disabled:opacity-40"
                          title="Редактировать профиль"
                        >
                          <Pencil className="h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden />
                          <span className="hidden sm:inline">Изменить</span>
                        </button>
                        <button
                          type="button"
                          disabled={launchingId !== null || status !== 'online'}
                          onClick={() => void launchProfile(bp)}
                          className="inline-flex items-center gap-2 rounded-xl border border-accent/25 bg-accent/10 px-3 py-2 text-[12px] font-semibold text-accent hover:bg-accent/15 disabled:opacity-40"
                        >
                          <Rocket className="h-3.5 w-3.5" aria-hidden />
                          {launchingId === bp.id ? 'Запуск…' : 'Запуск'}
                        </button>
                        <button
                          type="button"
                          disabled={
                            launchingId !== null || deletingId !== null || status !== 'online'
                          }
                          onClick={() => void deleteProfile(bp)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[12px] font-medium text-red-300 hover:bg-red-500/15 disabled:opacity-40"
                          title="Удалить профиль"
                        >
                          <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          <span className="hidden sm:inline">
                            {deletingId === bp.id ? 'Удаление…' : 'Удалить'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
