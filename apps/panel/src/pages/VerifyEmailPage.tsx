import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthPageBackdrop } from '@/components/layout/AuthPageBackdrop'
import { PanelBrand } from '@/components/brand/PanelBrand'
import { apiVerifyEmail } from '@/lib/api'

export function VerifyEmailPage(): JSX.Element {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [email, setEmail] = useState<string | null>(null)
  const [redirectIn, setRedirectIn] = useState(3)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    void (async () => {
      try {
        const res = await apiVerifyEmail(token)
        setEmail(res.email)
        setStatus('ok')
      } catch {
        setStatus('error')
      }
    })()
  }, [token])

  useEffect(() => {
    if (status !== 'ok') return
    const tick = window.setInterval(() => {
      setRedirectIn((s) => {
        if (s <= 1) {
          window.clearInterval(tick)
          navigate('/subscribe', { replace: true })
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(tick)
  }, [status, navigate])

  return (
    <AuthPageBackdrop>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-panel-strong relative overflow-hidden p-8 text-center shadow-glow">
          <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-[0.3]" />
          <div className="relative">
            <PanelBrand layout="auth" />
            {status === 'loading' ? (
              <div className="mt-8 flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <p className="text-sm text-zinc-400">Підтвердження email…</p>
              </div>
            ) : null}
            {status === 'ok' ? (
              <div className="mt-8">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                <h1 className="mt-4 text-xl font-semibold text-white">Email підтверджено</h1>
                <p className="mt-2 text-sm text-zinc-400">{email}</p>
                <p className="mt-4 text-xs text-zinc-500">
                  Перенаправлення через {redirectIn} с…
                </p>
                <Link
                  to="/subscribe"
                  className="mt-6 inline-block rounded-xl border border-accent/35 bg-accent/15 px-5 py-3 text-sm font-semibold text-white"
                >
                  Увійти та оформити підписку
                </Link>
              </div>
            ) : null}
            {status === 'error' ? (
              <div className="mt-8">
                <XCircle className="mx-auto h-12 w-12 text-red-400/90" />
                <h1 className="mt-4 text-xl font-semibold text-white">Посилання недійсне</h1>
                <p className="mt-2 text-sm text-zinc-400">Термін минув або лист уже використано.</p>
                <Link to="/auth" className="mt-6 inline-block text-sm text-accent hover:underline">
                  На сторінку входу
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </AuthPageBackdrop>
  )
}
