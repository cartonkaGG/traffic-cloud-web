import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { Loader2, ShieldCheck } from 'lucide-react'

type LoginCodeFormProps = {
  emailMasked: string
  expiresInSec: number
  submitting: boolean
  resendCooldownSec: number
  error: string | null
  onSubmit: (code: string) => void
  onResend: () => void
  onBack: () => void
}

const CELL_COUNT = 6

export function LoginCodeForm({
  emailMasked,
  expiresInSec,
  submitting,
  resendCooldownSec,
  error,
  onSubmit,
  onResend,
  onBack
}: LoginCodeFormProps): JSX.Element {
  const [digits, setDigits] = useState<string[]>(() => Array(CELL_COUNT).fill(''))
  const [timeLeft, setTimeLeft] = useState(expiresInSec)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    setTimeLeft(expiresInSec)
    const tick = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(tick)
  }, [expiresInSec])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  const code = digits.join('')

  const trySubmit = useCallback(
    (nextDigits: string[]) => {
      const value = nextDigits.join('')
      if (value.length === CELL_COUNT && /^\d{6}$/.test(value)) {
        onSubmit(value)
      }
    },
    [onSubmit]
  )

  function updateDigit(index: number, value: string): void {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < CELL_COUNT - 1) {
      inputsRef.current[index + 1]?.focus()
    }
    trySubmit(next)
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === 'Enter' && code.length === CELL_COUNT) {
      onSubmit(code)
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>): void {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CELL_COUNT)
    if (!pasted) return
    const next = Array(CELL_COUNT).fill('')
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i]!
    setDigits(next)
    const focusIndex = Math.min(pasted.length, CELL_COUNT - 1)
    inputsRef.current[focusIndex]?.focus()
    trySubmit(next)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="mt-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10 shadow-[0_0_40px_-12px_rgba(34,211,238,0.5)]">
        <ShieldCheck className="h-7 w-7 text-cyan-200" />
      </div>
      <h2 className="mt-5 text-center text-xl font-semibold text-white">Код підтвердження</h2>
      <p className="mt-3 text-center text-sm leading-relaxed text-zinc-400">
        Надіслали 6-значний код на{' '}
        <span className="font-medium text-white">{emailMasked}</span>
      </p>

      <div className="mt-8 flex justify-center gap-2 sm:gap-2.5">
        {digits.map((digit, index) => (
          <motion.input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            disabled={submitting || timeLeft <= 0}
            onChange={(e) => updateDigit(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            className={[
              'h-12 w-10 rounded-xl border bg-white/[0.03] text-center text-lg font-bold text-white outline-none transition-[border,box-shadow]',
              'sm:h-14 sm:w-12 sm:text-xl',
              digit
                ? 'border-cyan-400/45 shadow-[0_0_20px_-8px_rgba(34,211,238,0.65)]'
                : 'border-white/[0.10] focus:border-cyan-400/40 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.12)]'
            ].join(' ')}
          />
        ))}
      </div>

      <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
        {timeLeft > 0
          ? `Дійсний ${minutes}:${String(seconds).padStart(2, '0')}`
          : 'Код прострочено — увійдіть знову'}
      </p>

      {error ? (
        <p className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-center text-[13px] text-red-200">
          {error}
        </p>
      ) : null}

      <motion.button
        type="button"
        disabled={submitting || code.length !== CELL_COUNT || timeLeft <= 0}
        whileHover={submitting ? undefined : { scale: 1.01 }}
        whileTap={submitting ? undefined : { scale: 0.99 }}
        onClick={() => onSubmit(code)}
        className="mt-6 w-full rounded-xl border border-accent/35 bg-gradient-to-r from-cyan-600/25 via-sky-600/15 to-transparent px-4 py-3 text-sm font-semibold text-white shadow-[0_0_40px_-18px_rgba(34,211,238,0.85)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="inline-flex items-center justify-center gap-2">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Перевірка…
            </>
          ) : (
            'Підтвердити вхід'
          )}
        </span>
      </motion.button>

      <button
        type="button"
        disabled={resendCooldownSec > 0 || submitting || timeLeft <= 0}
        onClick={onResend}
        className="mt-4 w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-zinc-300 transition-opacity hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {resendCooldownSec > 0
          ? `Надіслати код знову через ${resendCooldownSec} с`
          : 'Надіслати код знову'}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 w-full text-sm text-zinc-500 hover:text-zinc-300"
      >
        Повернутися до входу
      </button>
    </div>
  )
}
