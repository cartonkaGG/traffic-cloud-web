import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, CreditCard, Grid3x3, Home } from 'lucide-react'
import { AccountMenu } from '@/components/account/AccountMenu'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TrafficCloudMark from '@/components/brand/TrafficCloudMark'
import { useSoftware } from '@/context/SoftwareContext'
import { getMarketingHomeUrl } from '@/lib/site'
import { useLogs } from '@/context/LogContext'

const ROUTE_TITLES: Record<string, { title: string; kicker?: string }> = {
  '/': { title: 'Огляд', kicker: 'Головна панель' },
  '/browser': { title: 'Браузер', kicker: 'Anti-detect профілі' },
  '/accounts': { title: 'Акаунти Telegram', kicker: 'Session · проксі' },
  '/sources': { title: 'Парсер чатів', kicker: 'Джерела · аудиторія' },
  '/messages': { title: 'Шаблони', kicker: 'Тексти для DM' },
  '/filters': { title: 'Фільтри', kicker: 'Кому писати · безпека' },
  '/campaigns': { title: 'Розсилка', kicker: 'Запуск DM по базі' },
  '/proxy': { title: 'Проксі', kicker: 'HTTP · SOCKS5' },
  '/analytics': { title: 'Статистика', kicker: 'Надіслані · помилки' },
  '/logs': { title: 'Логи', kicker: 'Події в реальному часі' },
  '/settings': { title: 'Налаштування', kicker: 'MTProto · парсер' }
}

const BELL_LAST_READ_TS_KEY = 'trafficcloud-bell-last-read-ts'

function formatBellTime(ts: number): string {
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(ts))
}

function kindShort(kind: string): string {
  if (kind === 'outreach_alert') return 'Важливо'
  return kind.replaceAll('_', ' ')
}

export function TopBar(): JSX.Element {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { selectedSoftware } = useSoftware()
  const { entries } = useLogs()
  const meta = ROUTE_TITLES[pathname] ?? {
    title: 'Traffic Cloud',
    kicker: 'Рабочее пространство'
  }

  const [bellOpen, setBellOpen] = useState(false)
  const [lastReadBellTs, setLastReadBellTs] = useState(() => {
    if (typeof window === 'undefined') return 0
    const raw = window.sessionStorage.getItem(BELL_LAST_READ_TS_KEY)
    const n = raw ? Number(raw) : 0
    return Number.isFinite(n) ? n : 0
  })
  const bellWrapRef = useRef<HTMLDivElement>(null)

  const bellFeed = useMemo(() => entries.slice(0, 35), [entries])

  const unreadAlertCount = useMemo(
    () => entries.filter((e) => e.kind === 'outreach_alert' && e.ts > lastReadBellTs).length,
    [entries, lastReadBellTs]
  )

  useEffect(() => {
    if (!bellOpen) return
    const onDoc = (ev: MouseEvent) => {
      const el = bellWrapRef.current
      if (el && !el.contains(ev.target as Node)) setBellOpen(false)
    }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setBellOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [bellOpen])

  const toggleBell = () => {
    setBellOpen((wasOpen) => {
      if (!wasOpen) {
        const now = Date.now()
        setLastReadBellTs(now)
        try {
          window.sessionStorage.setItem(BELL_LAST_READ_TS_KEY, String(now))
        } catch {
          /* ignore */
        }
      }
      return !wasOpen
    })
  }

  return (
    <header className="sticky top-0 z-20 border-b border-gray-800/60 bg-gray-950/80 px-8 py-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="mt-0.5 hidden shrink-0 items-center justify-center overflow-visible sm:flex">
            <TrafficCloudMark size={30} variant="logo" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              {meta.kicker}
            </div>
            <h1 className="mt-1 truncate text-lg font-semibold tracking-tight text-white">{meta.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={getMarketingHomeUrl()}
            className="hidden items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:border-accent/25 hover:text-zinc-300 md:flex"
            title="На головну сторінку"
          >
            <Home className="h-3.5 w-3.5 text-accent/70" />
            Головна
          </a>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/billing')}
            className="hidden items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:border-accent/25 hover:text-zinc-300 lg:flex"
          >
            <CreditCard className="h-3.5 w-3.5 text-accent/70" />
            Підписка
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/hub')}
            className="hidden items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:border-accent/25 hover:text-zinc-300 lg:flex"
            title="Повернутися до Traffic Cloud Hub"
          >
            <Grid3x3 className="h-3.5 w-3.5 text-accent/70" />
            {selectedSoftware?.name ?? 'Traffic Cloud Hub'}
          </motion.button>

          <div className="relative" ref={bellWrapRef}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleBell}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-300 shadow-glass transition-colors hover:border-accent/30 hover:text-white"
              aria-label="Сповіщення та останні події"
              aria-expanded={bellOpen}
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadAlertCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-[0_0_12px_rgba(251,113,133,0.65)]">
                  {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
                </span>
              ) : (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent/40 shadow-[0_0_8px_rgba(94,200,255,0.35)]" />
              )}
            </motion.button>

            <AnimatePresence>
              {bellOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-950/95 py-2 shadow-2xl backdrop-blur-xl"
                  role="dialog"
                  aria-label="Сповіщення"
                >
                  <div className="border-b border-white/[0.06] px-4 py-2">
                    <div className="text-sm font-semibold text-white">Сповіщення</div>
                    <div className="text-[11px] text-zinc-500">
                      Критичні події outreach і останні записи з логів
                    </div>
                  </div>
                  <div className="max-h-[min(70vh,420px)] overflow-y-auto px-2 py-2">
                    {bellFeed.length === 0 ? (
                      <div className="px-3 py-6 text-center text-[13px] text-zinc-500">Поки порожньо</div>
                    ) : (
                      bellFeed.map((e) => {
                        const critical = e.kind === 'outreach_alert'
                        return (
                          <div
                            key={e.id}
                            className={[
                              'mb-1 rounded-xl px-3 py-2.5 text-left transition-colors',
                              critical ? 'bg-rose-500/10 border border-rose-400/20' : 'hover:bg-white/[0.04]'
                            ].join(' ')}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={[
                                  'shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide',
                                  critical
                                    ? 'border-rose-400/30 bg-rose-500/20 text-rose-100'
                                    : 'border-white/10 bg-white/[0.06] text-zinc-400'
                                ].join(' ')}
                              >
                                {kindShort(e.kind)}
                              </span>
                              <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                                {formatBellTime(e.ts)}
                              </span>
                            </div>
                            <p className="mt-1.5 text-[12px] leading-snug text-zinc-200">{e.message}</p>
                          </div>
                        )
                      })
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="hidden h-8 w-px bg-white/10 sm:block" />

          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
