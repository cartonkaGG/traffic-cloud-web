import { useState } from 'react'
import { CheckCircle2, Loader2, Pencil, Wifi, X, XCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import type { ProxyEndpointModel, TikTokAccountModel } from '@/domain/types'
import { apiTestProxyAdhoc, apiUpdateTikTokAccount } from '@/lib/api'

type Props = {
  account: TikTokAccountModel
  proxy: ProxyEndpointModel | null
  workspaceId: string
  onClose: () => void
  onSaved: () => void | Promise<void>
  onError: (message: string) => void
}

const inputCls =
  'w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-accent/40'
const labelCls = 'text-[11px] uppercase text-zinc-500'

export function TikTokEditModal({
  account,
  proxy,
  workspaceId,
  onClose,
  onSaved,
  onError
}: Props): JSX.Element {
  const [username, setUsername] = useState(account.username)
  const [email, setEmail] = useState(account.email)
  const [password, setPassword] = useState(account.password)
  const [emailPassword, setEmailPassword] = useState(account.emailPassword ?? '')
  const [imapHost, setImapHost] = useState(account.imapHost ?? '')
  const [hashtags, setHashtags] = useState(account.watchHashtags.join(', '))
  const [busy, setBusy] = useState(false)

  const [proxyHost, setProxyHost] = useState(proxy?.host ?? '')
  const [proxyPort, setProxyPort] = useState(proxy ? String(proxy.port) : '')
  const [proxyProtocol, setProxyProtocol] = useState<'http' | 'socks5'>(proxy?.protocol ?? 'socks5')
  const [proxyUser, setProxyUser] = useState(proxy?.username ?? '')
  const [proxyPass, setProxyPass] = useState(proxy?.password ?? '')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<
    { ok: true; latencyMs: number } | { ok: false; error: string } | null
  >(null)

  const parsePort = (raw: string): number | null => {
    const n = Number(raw.trim())
    return Number.isFinite(n) && n >= 1 && n <= 65535 ? Math.floor(n) : null
  }

  const testProxy = async (): Promise<void> => {
    const host = proxyHost.trim()
    const port = parsePort(proxyPort)
    if (!host || port === null) {
      setTestResult({ ok: false, error: 'Вкажіть host і коректний порт' })
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const r = await apiTestProxyAdhoc(workspaceId, {
        protocol: proxyProtocol,
        host,
        port,
        username: proxyUser.trim() || null,
        password: proxyPass.trim() || null
      })
      setTestResult(r)
    } catch (e) {
      setTestResult({ ok: false, error: e instanceof Error ? e.message : String(e) })
    } finally {
      setTesting(false)
    }
  }

  const save = async (): Promise<void> => {
    const trimmedEmail = email.trim()
    if (trimmedEmail && !trimmedEmail.includes('@')) {
      onError('Некоректний email')
      return
    }
    const host = proxyHost.trim()
    const port = parsePort(proxyPort)
    if (host && port === null) {
      onError('Вкажіть коректний порт проксі')
      return
    }
    setBusy(true)
    try {
      await apiUpdateTikTokAccount(workspaceId, account.id, {
        username: username.trim().replace(/^@+/, ''),
        email: trimmedEmail,
        password,
        emailPassword: emailPassword.trim() || null,
        imapHost: imapHost.trim() || null,
        watchHashtags: hashtags,
        proxyHost: host || null,
        proxyPort: host ? port : null,
        proxyProtocol,
        proxyUsername: proxyUser.trim() || null,
        proxyPassword: proxyPass.trim() || null
      })
      await onSaved()
      onClose()
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <GlassCard className="relative w-full max-w-md p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Pencil className="h-4 w-4 text-fuchsia-300" />
          Редагувати акаунт
        </h2>
        <p className="mt-1 text-[13px] text-zinc-500">
          Зміни будь-яке поле акаунта. Пароль пошти + IMAP-host потрібні для авто-зчитування коду.
        </p>

        <div className="mt-5 space-y-4">
          <label className="block space-y-1.5">
            <span className={labelCls}>Логін (@username)</span>
            <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className={labelCls}>Email</span>
            <input
              className={inputCls}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block space-y-1.5">
            <span className={labelCls}>Пароль TikTok</span>
            <input className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className={labelCls}>Пароль пошти (app-password)</span>
            <input
              className={inputCls}
              type="password"
              value={emailPassword}
              autoComplete="off"
              placeholder="для авто-зчитування коду (IMAP)"
              onChange={(e) => setEmailPassword(e.target.value)}
            />
          </label>
          <label className="block space-y-1.5">
            <span className={labelCls}>IMAP host (опційно)</span>
            <input
              className={inputCls}
              value={imapHost}
              placeholder="авто за доменом, напр. imap.gmail.com"
              onChange={(e) => setImapHost(e.target.value)}
            />
          </label>
          <label className="block space-y-1.5">
            <span className={labelCls}>Тематика (хештеги через кому)</span>
            <input
              className={inputCls}
              value={hashtags}
              placeholder="music, dance, comedy"
              onChange={(e) => setHashtags(e.target.value)}
            />
          </label>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className={labelCls}>Проксі</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5 sm:col-span-2">
                <span className={labelCls}>Host (порожньо — без проксі)</span>
                <input
                  className={inputCls}
                  value={proxyHost}
                  placeholder="proxy.example.com"
                  autoComplete="off"
                  onChange={(e) => {
                    setProxyHost(e.target.value)
                    setTestResult(null)
                  }}
                />
              </label>
              <label className="block space-y-1.5">
                <span className={labelCls}>Порт</span>
                <input
                  className={inputCls}
                  value={proxyPort}
                  placeholder="8080"
                  onChange={(e) => {
                    setProxyPort(e.target.value)
                    setTestResult(null)
                  }}
                />
              </label>
              <label className="block space-y-1.5">
                <span className={labelCls}>Протокол</span>
                <select
                  className={inputCls}
                  value={proxyProtocol}
                  onChange={(e) => setProxyProtocol(e.target.value as 'http' | 'socks5')}
                >
                  <option value="socks5">SOCKS5</option>
                  <option value="http">HTTP</option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className={labelCls}>Логін (опційно)</span>
                <input
                  className={inputCls}
                  value={proxyUser}
                  autoComplete="off"
                  onChange={(e) => setProxyUser(e.target.value)}
                />
              </label>
              <label className="block space-y-1.5">
                <span className={labelCls}>Пароль (опційно)</span>
                <input
                  className={inputCls}
                  type="password"
                  value={proxyPass}
                  autoComplete="off"
                  onChange={(e) => setProxyPass(e.target.value)}
                />
              </label>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => void testProxy()}
                disabled={testing || !proxyHost.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5 text-[12px] text-cyan-100 disabled:opacity-40"
              >
                {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wifi className="h-3.5 w-3.5" />}
                Перевірити
              </button>
              {testResult ? (
                testResult.ok ? (
                  <span className="inline-flex items-center gap-1 text-[12px] text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Працює · {testResult.latencyMs} мс
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[12px] text-red-300">
                    <XCircle className="h-3.5 w-3.5" />
                    {testResult.error}
                  </span>
                )
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 disabled:opacity-50"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-medium text-fuchsia-100 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Зберегти
          </button>
        </div>
      </GlassCard>
    </div>
  )
}
