import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { apiForgotPassword } from '@/lib/api'

export function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await apiForgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="glass-panel-strong w-full max-w-md p-8">
        <h1 className="text-xl font-semibold text-white">Скидання пароля</h1>
        <p className="mt-2 text-sm text-zinc-500">Надішлемо лист з посиланням на вашу пошту.</p>
        {sent ? (
          <p className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Якщо email зареєстровано, лист надіслано. Перевірте вхідні та спам.
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={(ev) => void submit(ev)}>
            <input
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
            />
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border border-accent/35 bg-accent/15 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              Надіслати лист
            </button>
          </form>
        )}
        <Link to="/auth" className="mt-6 block text-center text-sm text-accent hover:underline">
          Назад до входу
        </Link>
      </div>
    </div>
  )
}
