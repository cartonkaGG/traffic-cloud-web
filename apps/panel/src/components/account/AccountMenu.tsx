import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

type AccountMenuProps = {
  /** Після «Змінити акаунт» повернути сюди після входу. */
  redirectAfterSwitch?: string
  className?: string
  compact?: boolean
}

export function AccountMenu({
  redirectAfterSwitch,
  className = '',
  compact = false
}: AccountMenuProps): JSX.Element {
  const { email, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  const short = useMemo(() => email?.split('@')[0] ?? 'you', [email])
  const redirect =
    redirectAfterSwitch ?? `${location.pathname}${location.search}`

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

  function exit(): void {
    setOpen(false)
    logout()
    navigate('/auth')
  }

  function switchAccount(): void {
    setOpen(false)
    logout()
    const safe =
      redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/hub'
    navigate(`/auth?redirect=${encodeURIComponent(safe)}`)
  }

  return (
    <div className={`relative ${className}`} ref={wrapRef}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 shadow-glass transition-colors hover:border-white/[0.14] hover:text-white"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-white/15 to-white/5 text-xs font-semibold text-white">
          {short.slice(0, 2).toUpperCase()}
        </div>
        {!compact ? (
          <div className="hidden text-left sm:block">
            <div className="text-sm font-medium text-white">{short}</div>
            <div className="max-w-[140px] truncate text-[11px] text-zinc-500">{email ?? '—'}</div>
          </div>
        ) : null}
        <ChevronDown
          className={['h-4 w-4 text-zinc-500 transition-transform', open ? 'rotate-180' : ''].join(
            ' '
          )}
          aria-hidden
        />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[220px] overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-950/95 py-1 shadow-2xl backdrop-blur-xl"
            role="menu"
          >
            <div className="border-b border-white/[0.06] px-4 py-3">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500">Акаунт</div>
              <div className="mt-1 truncate text-sm text-white">{email ?? '—'}</div>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={switchAccount}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              <UserRound className="h-4 w-4 text-accent/80" />
              Змінити акаунт
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={exit}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-200"
            >
              <LogOut className="h-4 w-4" />
              Вийти
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
