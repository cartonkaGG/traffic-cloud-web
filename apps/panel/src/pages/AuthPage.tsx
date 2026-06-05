import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2, Mail } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PanelBrand } from '@/components/brand/PanelBrand'
import { AuthPageBackdrop } from '@/components/layout/AuthPageBackdrop'
import { useAuth } from '@/context/AuthContext'
import { apiResendVerification, apiVerificationStatus } from '@/lib/api'
import { BILLING_SUBSCRIBE_PATH } from '@/lib/panelRoutes'
import {
  getResendCooldownLeft,
  RESEND_COOLDOWN_SEC,
  startResendCooldown
} from '@/lib/resendCooldown'
import { getMarketingHomeUrl } from '@/lib/site'

export function AuthPage(): JSX.Element {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || BILLING_SUBSCRIBE_PATH
  const subscribeFlow = redirectTo.includes('/billing')

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState<string | null>(null)
  const [resendOk, setResendOk] = useState(false)
  const [cooldownLeft, setCooldownLeft] = useState(0)
  const [emailJustVerified, setEmailJustVerified] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [initialEmailSent, setInitialEmailSent] = useState(true)

  const title = useMemo(() => (mode === 'login' ? 'Вхід' : 'Реєстрація'), [mode])
  const activeEmail = pendingVerifyEmail ?? email.trim().toLowerCase()

  useEffect(() => {
    if (!pendingVerifyEmail) return
    setCooldownLeft(getResendCooldownLeft(pendingVerifyEmail))
    const tick = window.setInterval(() => {
      setCooldownLeft(getResendCooldownLeft(pendingVerifyEmail))
    }, 1000)
    return () => window.clearInterval(tick)
  }, [pendingVerifyEmail])

  useEffect(() => {
    if (!pendingVerifyEmail || emailJustVerified) return
    const poll = window.setInterval(() => {
      void (async () => {
        try {
          const res = await apiVerificationStatus(pendingVerifyEmail)
          if (res.verified) {
            setEmailJustVerified(true)
            window.setTimeout(() => {
              navigate('/subscribe', { replace: true })
            }, 1800)
          }
        } catch {
          /* ignore poll errors */
        }
      })()
    }, 3000)
    return () => window.clearInterval(poll)
  }, [pendingVerifyEmail, emailJustVerified, navigate])

  function mapAuthError(err: unknown): string {
    const raw = err instanceof Error ? err.message : String(err)
    if (raw.includes('email_taken')) {
      return 'Цей email вже зареєстровано та підтверджено. Увійдіть або скиньте пароль.'
    }
    if (raw.includes('register_failed') || raw.includes('Connection timeout')) {
      return 'Сервер не відповів вчасно. Спробуйте ще раз — акаунт міг уже створитись, перевірте пошту.'
    }
    if (raw.includes('Підтвердіть email') || raw.includes('email_not_verified')) {
      return 'Підтвердіть email — відкрийте лист у пошті або надішліть його повторно.'
    }
    return raw
  }

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (submitting) return
    setFormError(null)
    setResendOk(false)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        const safe =
          redirectTo.startsWith('/') && !redirectTo.startsWith('//')
            ? redirectTo
            : BILLING_SUBSCRIBE_PATH
        navigate(safe)
      } else {
        const result = await register(email, password)
        if (result.needsEmailVerification) {
          const normalized = email.trim().toLowerCase()
          setInitialEmailSent(result.emailSent !== false)
          setPendingVerifyEmail(normalized)
          startResendCooldown(normalized, RESEND_COOLDOWN_SEC)
          setCooldownLeft(RESEND_COOLDOWN_SEC)
          return
        }
        const safe =
          redirectTo.startsWith('/') && !redirectTo.startsWith('//')
            ? redirectTo
            : BILLING_SUBSCRIBE_PATH
        navigate(safe)
      }
    } catch (err) {
      setFormError(mapAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function resendVerification(): Promise<void> {
    if (!activeEmail || cooldownLeft > 0) return
    setResendOk(false)
    setFormError(null)
    try {
      await apiResendVerification(activeEmail)
      startResendCooldown(activeEmail, RESEND_COOLDOWN_SEC)
      setCooldownLeft(RESEND_COOLDOWN_SEC)
      setResendOk(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err))
      const left = getResendCooldownLeft(activeEmail)
      if (left > 0) setCooldownLeft(left)
    }
  }

  if (pendingVerifyEmail) {
    return (
      <AuthPageBackdrop>
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.985 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[440px]"
        >
          <div className="glass-panel-strong relative overflow-hidden p-8 text-center shadow-glow">
            <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-[0.35]" />
            <div className="relative">
              <PanelBrand layout="auth" />
              {emailJustVerified ? (
                <div className="mt-8">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                  <h1 className="mt-4 text-xl font-semibold text-white">Email підтверджено!</h1>
                  <p className="mt-2 text-sm text-zinc-400">Перенаправляємо до входу…</p>
                </div>
              ) : (
                <>
                  <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10 shadow-[0_0_40px_-12px_rgba(34,211,238,0.5)]">
                    <Mail className="h-7 w-7 text-cyan-200" />
                  </div>
                  <h1 className="mt-5 text-xl font-semibold text-white">Підтвердіть email</h1>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {initialEmailSent ? (
                      <>
                        Лист надіслано на{' '}
                        <span className="font-medium text-white">{pendingVerifyEmail}</span>. Відкрийте
                        посилання у листі — ця сторінка оновиться автоматично.
                      </>
                    ) : (
                      <>
                        Акаунт для{' '}
                        <span className="font-medium text-white">{pendingVerifyEmail}</span> створено.
                        Лист не надіслано — натисніть кнопку нижче, щоб отримати посилання
                        підтвердження.
                      </>
                    )}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-zinc-500">
                    <Loader2 className="h-3 w-3 animate-spin text-accent" />
                    Очікуємо підтвердження…
                  </div>
                  {resendOk ? (
                    <p className="mt-4 text-sm text-emerald-300">Лист надіслано повторно.</p>
                  ) : null}
                  {formError ? (
                    <p className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
                      {formError}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    disabled={cooldownLeft > 0}
                    onClick={() => void resendVerification()}
                    className="mt-6 w-full rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {cooldownLeft > 0
                      ? `Надіслати знову через ${cooldownLeft} с`
                      : 'Надіслати лист ще раз'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingVerifyEmail(null)
                      setMode('login')
                    }}
                    className="mt-4 text-sm text-zinc-500 hover:text-zinc-300"
                  >
                    Повернутися до входу
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </AuthPageBackdrop>
    )
  }

  return (
    <AuthPageBackdrop>
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.985 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[440px]"
      >
        <div className="glass-panel-strong relative overflow-hidden p-8 shadow-glow">
          <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-[0.35]" />
          <div className="relative">
            <PanelBrand layout="auth" />
            <div className="mt-6 text-xl font-semibold tracking-tight text-white">
              {subscribeFlow ? 'Увійдіть для підписки' : title}
            </div>
            {subscribeFlow ? (
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Спочатку увійдіть або зареєструйтесь — потім відкриється сторінка оплати.
              </p>
            ) : null}

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
                    <span className="relative z-10">{m === 'login' ? 'Вхід' : 'Реєстрація'}</span>
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
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Пароль
                  </div>
                  {mode === 'login' ? (
                    <Link to="/forgot-password" className="text-[11px] text-accent hover:underline">
                      Забули пароль?
                    </Link>
                  ) : null}
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
                <div className="space-y-2">
                  <p className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-[13px] text-red-200/95">
                    {formError}
                  </p>
                  {formError.includes('Підтвердіть email') ? (
                    <button
                      type="button"
                      disabled={getResendCooldownLeft(email.trim().toLowerCase()) > 0}
                      onClick={() => void resendVerification()}
                      className="text-[13px] text-accent hover:underline disabled:opacity-50"
                    >
                      {getResendCooldownLeft(email.trim().toLowerCase()) > 0
                        ? `Повторний лист через ${getResendCooldownLeft(email.trim().toLowerCase())} с`
                        : 'Надіслати лист підтвердження ще раз'}
                    </button>
                  ) : null}
                </div>
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
                    ? 'Після входу без активної підписки ви потрапите на сторінку оплати.'
                    : 'Мінімум 8 символів. Після реєстрації надішлемо лист для підтвердження email.'}
                </motion.div>
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={submitting ? undefined : { scale: 1.01 }}
                whileTap={submitting ? undefined : { scale: 0.99 }}
                className="group relative w-full overflow-hidden rounded-xl border border-accent/35 bg-gradient-to-r from-accent/20 via-accent/10 to-transparent px-4 py-3 text-sm font-semibold text-white shadow-[0_0_40px_-18px_rgba(94,200,255,0.85)] transition-[box-shadow] hover:shadow-[0_0_52px_-18px_rgba(94,200,255,0.95)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {mode === 'login' ? 'Вхід…' : 'Створення…'}
                    </>
                  ) : mode === 'login' ? (
                    'Увійти'
                  ) : (
                    'Створити акаунт'
                  )}
                </span>
              </motion.button>
            </form>

            <div className="mt-6 text-center text-[12px] text-zinc-600">
              <a href={getMarketingHomeUrl()} className="text-accent hover:underline">
                На головний сайт
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </AuthPageBackdrop>
  )
}
