import { useMemo, useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function AuthPage(): JSX.Element {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const title = useMemo(() => (mode === 'login' ? 'Вход' : 'Регистрация'), [mode])

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setFormError(null)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password)
      navigate('/')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(94,200,255,0.35), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 20%, rgba(120,160,255,0.18), transparent 50%), radial-gradient(ellipse 60% 50% at 0% 80%, rgba(94,200,255,0.12), transparent 55%), linear-gradient(180deg, #050507 0%, #07080c 100%)'
        }}
      />
      <motion.div
        className="pointer-events-none absolute -left-40 top-24 h-[520px] w-[520px] rounded-full bg-accent/20 blur-[120px]"
        animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -right-32 bottom-10 h-[460px] w-[460px] rounded-full bg-indigo-500/15 blur-[110px]"
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [1.03, 1, 1.03] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[440px]"
      >
        <div className="glass-panel-strong relative overflow-hidden p-8 shadow-glow">
          <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-[0.35]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_0_40px_-16px_rgba(94,200,255,0.65)]">
                <Sparkles className="h-5 w-5 text-accent" aria-hidden />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                  Traffic Cloud
                </div>
                <div className="text-xl font-semibold tracking-tight text-white">{title}</div>
              </div>
            </div>

            <div className="mt-8 flex rounded-2xl border border-white/[0.08] bg-black/30 p-1">
              {(['login', 'register'] as const).map((m) => {
                const active = mode === m
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={[
                      'relative flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                      active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                    ].join(' ')}
                  >
                    {active && (
                      <motion.span
                        layoutId="auth-tab"
                        className="absolute inset-0 rounded-xl bg-white/[0.07] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative z-10">{m === 'login' ? 'Вход' : 'Регистрация'}</span>
                  </button>
                )
              })}
            </div>

            <form className="mt-8 space-y-5" onSubmit={(ev) => void submit(ev)}>
              <label className="block">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Email
                </div>
                <input
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  type="email"
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none ring-0 transition-[border,box-shadow] placeholder:text-zinc-600 focus:border-accent/35 focus:shadow-[0_0_0_4px_rgba(94,200,255,0.12)]"
                  placeholder="name@company.com"
                />
              </label>

              <label className="block">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Пароль
                </div>
                <input
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-[border,box-shadow] placeholder:text-zinc-600 focus:border-accent/35 focus:shadow-[0_0_0_4px_rgba(94,200,255,0.12)]"
                  placeholder="••••••••"
                />
              </label>

              {formError ? (
                <p className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-[13px] text-red-200/95">
                  {formError}
                </p>
              ) : null}

              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[13px] leading-relaxed text-zinc-500"
                >
                  {mode === 'login'
                    ? 'Учётная запись хранится в MongoDB (email и хеш пароля). Остальные данные приложения — только на этом компьютере.'
                    : 'Минимум 8 символов в пароле. После регистрации данные workspace создаются локально на ПК.'}
                </motion.div>
              </AnimatePresence>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="group relative w-full overflow-hidden rounded-xl border border-accent/35 bg-gradient-to-r from-accent/20 via-accent/10 to-transparent px-4 py-3 text-sm font-semibold text-white shadow-[0_0_40px_-18px_rgba(94,200,255,0.85)] transition-[box-shadow] hover:shadow-[0_0_52px_-18px_rgba(94,200,255,0.95)]"
              >
                <span className="relative z-10">
                  {mode === 'login' ? 'Войти в консоль' : 'Создать аккаунт'}
                </span>
                <motion.span
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.10) 45%, transparent 70%)'
                  }}
                  aria-hidden
                />
              </motion.button>
            </form>

            <div className="mt-6 text-center text-[12px] text-zinc-600">
              Нажимая кнопку, вы соглашаетесь с условиями использования (черновик).
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
