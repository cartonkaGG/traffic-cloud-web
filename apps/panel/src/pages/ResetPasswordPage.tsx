import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiResetPassword } from '@/lib/api'

export function ResetPasswordPage(): JSX.Element {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!token) {
      setError('Невірне посилання')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await apiResetPassword(token, password)
      navigate('/auth')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="glass-panel-strong w-full max-w-md p-8">
        <h1 className="text-xl font-semibold text-white">Новий пароль</h1>
        <form className="mt-6 space-y-4" onSubmit={(ev) => void submit(ev)}>
          <input
            type="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            placeholder="Мінімум 8 символів"
            className="w-full rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-accent/35 bg-accent/15 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            Зберегти пароль
          </button>
        </form>
        <Link to="/auth" className="mt-6 block text-center text-sm text-accent hover:underline">
          На сторінку входу
        </Link>
      </div>
    </div>
  )
}
