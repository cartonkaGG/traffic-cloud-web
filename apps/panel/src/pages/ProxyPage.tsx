import { Activity, Gauge, Plus, Shield, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import { apiCreateProxy, apiDeleteProxy, apiTestProxy } from '@/lib/api'
import { parseProxyConnectionLine } from '@/lib/parseProxyLine'
import * as mocks from '@/data/mocks'
import type { ProxyEndpointModel } from '@/domain/types'

function healthLabel(h: ProxyEndpointModel['health']): string {
  if (h === 'good') return 'Стабильно'
  if (h === 'degraded') return 'Деградация'
  return 'Критично'
}

function healthClass(h: ProxyEndpointModel['health']): string {
  if (h === 'good') return 'text-emerald-300 bg-emerald-400/10 border-emerald-400/15'
  if (h === 'degraded') return 'text-amber-300 bg-amber-400/10 border-amber-400/15'
  return 'text-red-300 bg-red-400/10 border-red-400/15'
}

function endpointKindLabel(k: ProxyEndpointModel['endpointKind']): string {
  return k === 'datacenter' ? 'Датацентр' : 'Резидентські'
}

export function ProxyPage(): JSX.Element {
  const { bundle, workspaceId, status, refetch } = useWorkspaceData()
  const proxies = bundle?.proxies ?? mocks.proxies

  const [modalOpen, setModalOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [proxyLine, setProxyLine] = useState('')
  const [protocol, setProtocol] = useState<'http' | 'socks5'>('http')
  const [rotation, setRotation] = useState<'sticky' | 'rotating'>('sticky')
  const [endpointKind, setEndpointKind] = useState<'residential' | 'datacenter'>('residential')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setLabel('')
    setProxyLine('')
    setProtocol('http')
    setRotation('sticky')
    setEndpointKind('residential')
    setError(null)
  }, [])

  const submitProxy = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      setError('Нет подключения к API')
      return
    }
    const line = proxyLine.trim()
    if (!line) {
      setError('Вставьте строку прокси (IP:PORT или IP:PORT:USER:PASS)')
      return
    }
    const parsed = parseProxyConnectionLine(line)
    if (!parsed) {
      setError(
        'Формат: IP:PORT или IP:PORT:USER:PASS. Можно с префиксом http:// или socks5://'
      )
      return
    }
    const effectiveProtocol = parsed.protocol ?? protocol

    if (!label.trim()) {
      setError('Укажите название узла')
      return
    }

    setBusy(true)
    setError(null)
    try {
      await apiCreateProxy(workspaceId, {
        label: label.trim(),
        host: parsed.host,
        port: parsed.port,
        username: parsed.username,
        password: parsed.password,
        protocol: effectiveProtocol,
        rotation,
        endpointKind
      })
      resetForm()
      setModalOpen(false)
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }, [
    workspaceId,
    status,
    label,
    proxyLine,
    protocol,
    rotation,
    endpointKind,
    resetForm,
    refetch
  ])

  const runProxyTest = useCallback(
    async (p: ProxyEndpointModel) => {
      if (!workspaceId || status !== 'online') {
        setError('Немає зʼєднання з API')
        return
      }
      setTestingId(p.id)
      setError(null)
      try {
        const r = await apiTestProxy(workspaceId, p.id)
        await refetch()
        if (!r.ok) {
          setError(`Перевірка: ${r.error}`)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setTestingId(null)
      }
    },
    [workspaceId, status, refetch]
  )

  const removeProxy = useCallback(
    async (p: ProxyEndpointModel) => {
      if (!workspaceId || status !== 'online') {
        setError('Немає зʼєднання з API')
        return
      }
      const ok = window.confirm(`Видалити проксі «${p.label}»? Профілі з цим вузлом знімуть привʼязку.`)
      if (!ok) return
      setDeletingId(p.id)
      setError(null)
      try {
        await apiDeleteProxy(workspaceId, p.id)
        await refetch()
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
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
            Одна строка на узел: <span className="font-mono text-zinc-400">IP:PORT:USER:PASS</span> або{' '}
            <span className="font-mono text-zinc-400">IP:PORT</span>. За потреби додайте на початку{' '}
            <span className="font-mono text-zinc-400">http://</span> або{' '}
            <span className="font-mono text-zinc-400">socks5://</span> — інакше протокол береться з поля нижче.
          </p>
          {error && !modalOpen ? (
            <p className="mt-2 max-w-3xl text-sm text-red-300/90">{error}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
            Добавить прокси
          </motion.button>
          <div className="glass-panel inline-flex items-center gap-2 px-4 py-3 text-sm text-zinc-400">
            <Gauge className="h-4 w-4 text-accent" aria-hidden />
            {proxies.length} узлов
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !busy && setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="glass-panel relative w-full max-w-md space-y-4 p-6 shadow-glow"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-white">Новый прокси</div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/[0.05]"
                  aria-label="Закрыть"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              {error ? <p className="text-[13px] text-red-300/95">{error}</p> : null}

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Название
                </span>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  placeholder="Мой резидентский узел"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Строка прокси
                </span>
                <textarea
                  value={proxyLine}
                  onChange={(e) => setProxyLine(e.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-y rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-[13px] leading-relaxed text-white outline-none focus:border-accent/35"
                  placeholder={
                    '154.94.58.159:63075:user:pass\nили socks5://154.94.58.159:1080:user:pass'
                  }
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Тип вузла
                  </span>
                  <select
                    value={endpointKind}
                    onChange={(e) =>
                      setEndpointKind(e.target.value as 'residential' | 'datacenter')
                    }
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  >
                    <option value="residential">Резидентські</option>
                    <option value="datacenter">Датацентр</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Протокол
                  </span>
                  <select
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value as 'http' | 'socks5')}
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  >
                    <option value="http">HTTP</option>
                    <option value="socks5">SOCKS5</option>
                  </select>
                </label>
              </div>

              <p className="text-[11px] leading-relaxed text-zinc-600">
                Протокол из списка используется, только если в строке нет префикса{' '}
                <span className="font-mono text-zinc-500">http://</span> или{' '}
                <span className="font-mono text-zinc-500">socks5://</span>.
              </p>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Ротация
                </span>
                <select
                  value={rotation}
                  onChange={(e) => setRotation(e.target.value as 'sticky' | 'rotating')}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                >
                  <option value="sticky">Sticky</option>
                  <option value="rotating">Rotating</option>
                </select>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.04]"
                >
                  Отмена
                </button>
                <motion.button
                  type="button"
                  disabled={busy || status !== 'online'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void submitProxy()}
                  className="rounded-xl border border-accent/35 bg-accent/15 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-40"
                >
                  {busy ? 'Сохранение…' : 'Сохранить'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="glass-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Shield className="h-4 w-4 text-accent" aria-hidden />
            Узлы
          </div>
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
            {proxies.length} записей
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                <th className="px-6 py-4 font-medium">Название</th>
                <th className="px-6 py-4 font-medium">Хост</th>
                <th className="px-6 py-4 font-medium">Порт</th>
                <th className="px-6 py-4 font-medium">Логин</th>
                <th className="px-6 py-4 font-medium">Протокол</th>
                <th className="px-6 py-4 font-medium">Ротация</th>
                <th className="px-6 py-4 font-medium">Тип</th>
                <th className="px-6 py-4 font-medium">Latency</th>
                <th className="px-6 py-4 font-medium">Состояние</th>
                <th className="px-6 py-4 font-medium text-right">Дії</th>
              </tr>
            </thead>
            <tbody>
              {proxies.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4 text-[13px] text-zinc-200">{p.label}</td>
                  <td className="px-6 py-4 font-mono text-[13px] text-zinc-200">{p.host}</td>
                  <td className="px-6 py-4 font-mono text-[13px] text-zinc-400">{p.port}</td>
                  <td className="px-6 py-4 font-mono text-[13px] text-zinc-400">
                    {p.username ?? '—'}
                    {p.password ? (
                      <span className="ml-1 text-[11px] text-zinc-600">(+ пароль)</span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[12px] text-zinc-300">
                      {p.protocol}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{p.rotation}</td>
                  <td className="px-6 py-4 text-zinc-400">{endpointKindLabel(p.endpointKind)}</td>
                  <td className="px-6 py-4 font-mono text-[13px] text-zinc-300">
                    {p.latencyMs != null ? `${p.latencyMs} ms` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${healthClass(p.health)}`}
                    >
                      {healthLabel(p.health)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={
                          testingId !== null || deletingId !== null || status !== 'online'
                        }
                        onClick={() => void runProxyTest(p)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-zinc-200 hover:border-accent/30 hover:text-white disabled:opacity-40"
                        title="Перевірити зʼєднання до Telegram"
                      >
                        <Activity className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                        {testingId === p.id ? '…' : 'Перевірити'}
                      </button>
                      <button
                        type="button"
                        disabled={
                          testingId !== null || deletingId !== null || status !== 'online'
                        }
                        onClick={() => void removeProxy(p)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-[11px] font-medium text-red-300 hover:bg-red-500/15 disabled:opacity-40"
                        title="Видалити"
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span className="hidden sm:inline">
                          {deletingId === p.id ? 'Видалення…' : 'Видалити'}
                        </span>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
