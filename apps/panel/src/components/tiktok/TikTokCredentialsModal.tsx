import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Hash, KeyRound, Loader2, MailCheck, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { apiGetTikTokEmailCode } from '@/lib/api'
import type { TikTokAccountCredentials } from '@/domain/types'

function copyText(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

function CredentialRow({
  label,
  value,
  mono = false
}: {
  label: string
  value: string
  mono?: boolean
}): JSX.Element {
  const [copied, setCopied] = useState(false)

  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className={`min-w-0 break-all text-sm text-white ${mono ? 'font-mono' : ''}`}>{value}</span>
        <button
          type="button"
          onClick={() => {
            void copyText(value).then(() => {
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1500)
            })
          }}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[11px] text-zinc-400 hover:border-cyan-400/30 hover:text-cyan-200"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'OK' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

function EmailCodeBox({
  workspaceId,
  accountId
}: {
  workspaceId: string
  accountId: string
}): JSX.Element {
  const [code, setCode] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    let stopped = false
    const tick = async (): Promise<void> => {
      try {
        const r = await apiGetTikTokEmailCode(workspaceId, accountId)
        if (stopped) return
        if (!r.supported) {
          setSupported(false)
          return
        }
        if (r.code) {
          setCode(r.code)
          return
        }
      } catch {
        /* ignore, keep polling */
      }
      if (!stopped) timerRef.current = window.setTimeout(() => void tick(), 4000)
    }
    void tick()
    return () => {
      stopped = true
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [workspaceId, accountId])

  if (!supported) return <></>

  return (
    <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-500/5 px-3 py-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-300/80">
        <MailCheck className="h-3 w-3" />
        Код підтвердження з пошти
      </div>
      {code ? (
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-mono text-2xl tracking-[0.3em] text-white">{code}</span>
          <button
            type="button"
            onClick={() => {
              void copyText(code).then(() => {
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1500)
              })
            }}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[11px] text-zinc-300 hover:border-cyan-400/30 hover:text-cyan-200"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'OK' : 'Copy'}
          </button>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2 text-[13px] text-zinc-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Очікую лист від TikTok… (натисніть «Send code» у вікні)
        </div>
      )}
    </div>
  )
}

export function TikTokCredentialsModal({
  credentials,
  watchHashtags = [],
  title = 'Дані для входу в TikTok',
  hint = 'Повна автоматизація в Electron: birthday, email, пароль, Send code, код з пошти, Next. Свій Gmail — код треба ввести вручну.',
  workspaceId,
  accountId,
  onClose
}: {
  credentials: TikTokAccountCredentials
  watchHashtags?: string[]
  title?: string
  hint?: string
  workspaceId?: string
  accountId?: string
  onClose: () => void
}): JSX.Element {
  const showCodeBox = Boolean(workspaceId && accountId)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <GlassCard className="relative w-full max-w-md p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 hover:text-zinc-200"
          aria-label="Закрити"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 text-fuchsia-300">
          <KeyRound className="h-5 w-5" />
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{hint}</p>
        <div className="mt-5 space-y-3">
          <CredentialRow label="Email" value={credentials.email} />
          <CredentialRow label="Логін TikTok" value={`@${credentials.username}`} mono />
          <CredentialRow label="Пароль" value={credentials.password} mono />
        </div>
        {watchHashtags.length > 0 ? (
          <div className="mt-4 rounded-xl border border-fuchsia-400/15 bg-fuchsia-500/5 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-300/80">
              <Hash className="h-3 w-3" />
              Тематика прогріву
            </div>
            <p className="mt-1.5 text-sm text-zinc-300">
              {watchHashtags.map((h) => `#${h}`).join(' · ')}
            </p>
          </div>
        ) : null}
        {showCodeBox ? (
          <EmailCodeBox workspaceId={workspaceId!} accountId={accountId!} />
        ) : null}
        <ol className="mt-4 list-decimal space-y-1 pl-4 text-[12px] leading-relaxed text-zinc-500">
          <li>Скопіюйте email і пароль у форму реєстрації TikTok.</li>
          <li>Натисніть «Send code» — код зʼявиться тут автоматично.</li>
          <li>Введіть код, завершіть реєстрацію, тоді «Готово» в таблиці.</li>
        </ol>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 hover:border-fuchsia-400/30 hover:text-white"
        >
          Зрозуміло
        </button>
      </GlassCard>
    </div>
  )
}
