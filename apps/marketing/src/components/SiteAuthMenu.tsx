import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { logoutFromSite, usePanelSession } from '../lib/usePanelSession'

const PANEL_OFFERS = '/app/affiliate/offers'
const PANEL_STATS = '/app/affiliate/stats'

function authUrl(register = false): string {
  const redirect = encodeURIComponent(PANEL_OFFERS)
  return register ? `/app/auth?register=1&redirect=${redirect}` : `/app/auth?redirect=${redirect}`
}

export default function SiteAuthMenu() {
  const { isLoggedIn, email } = usePanelSession()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const short = useMemo(() => email?.split('@')[0] ?? 'you', [email])

  useEffect(() => {
    if (!open) return
    const onDoc = (ev: MouseEvent) => {
      const el = wrapRef.current
      if (el && !el.contains(ev.target as Node)) setOpen(false)
    }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={authUrl(false)}
          className="px-4 py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-all"
        >
          Увійти
        </a>
        <a
          href={authUrl(true)}
          className="relative overflow-hidden shimmer-btn bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-medium text-xs tracking-wider px-5 py-2.5 rounded-lg shadow-[0_4px_20px_rgba(52,211,153,0.25)] transition-all uppercase"
        >
          Реєстрація
        </a>
      </div>
    )
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-gray-700/80 bg-gray-900/60 px-3 py-2 text-sm text-gray-200 hover:border-gray-600 hover:text-white transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 text-xs font-semibold text-white">
          {short.slice(0, 2).toUpperCase()}
        </div>
        <span className="hidden sm:inline max-w-[120px] truncate">{short}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[220px] overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/95 py-1 shadow-2xl backdrop-blur-xl"
          role="menu"
        >
          <div className="border-b border-gray-800 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">Профіль</div>
            <div className="mt-1 truncate text-sm text-white">{email ?? '—'}</div>
          </div>
          <a
            href={PANEL_OFFERS}
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-900 hover:text-white"
          >
            Офери
          </a>
          <a
            href={PANEL_STATS}
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-900 hover:text-white"
          >
            Статистика
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              logoutFromSite()
              window.location.assign(
                `/app/auth?redirect=${encodeURIComponent(PANEL_OFFERS)}`
              )
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-900 hover:text-white"
          >
            <UserRound className="h-4 w-4 text-emerald-400/80" />
            Змінити акаунт
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              logoutFromSite()
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-200"
          >
            <LogOut className="h-4 w-4" />
            Вийти
          </button>
        </div>
      ) : null}
    </div>
  )
}
