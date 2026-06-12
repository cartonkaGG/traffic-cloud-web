import {
  Download,
  Fingerprint,
  Mail,
  Monitor,
  RefreshCw,
  Shield,
  Sparkles,
  Wand2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { BUNDLED_DESKTOP_VERSION } from '@/lib/desktopUpdate'
import { WindowsUnblockHelp } from '@/components/desktop/WindowsUnblockHelp'

const FEATURES = [
  {
    icon: Fingerprint,
    title: 'Антидетект',
    hint: 'Ізольований профіль + проксі'
  },
  {
    icon: Wand2,
    title: 'Автореєстрація',
    hint: 'Форма, код, Next автоматично'
  },
  {
    icon: Mail,
    title: 'Email-код',
    hint: 'Gmail app-password / IMAP'
  }
] as const

const INSTALL_STEPS = [
  'Завантажте інсталятор Traffic Cloud (~83 МБ)',
  'Встановіть і запустіть з меню Пуск',
  'Увійдіть у той самий акаунт у додатку'
] as const

const UPDATE_STEPS = [
  'Завантажте новий інсталятор',
  'Закрийте старе вікно Traffic Cloud',
  'Перевстановіть і відкрийте TikTok Warmup'
] as const

export function DesktopInstallCard({
  variant,
  latestVersion = BUNDLED_DESKTOP_VERSION,
  currentVersion,
  onPrimary,
  onSecondary,
  primaryBusy = false,
  compact = false,
  inAppUpdate = false
}: {
  variant: 'install' | 'update'
  latestVersion?: string
  currentVersion?: string | null
  onPrimary: () => void
  onSecondary?: () => void
  primaryBusy?: boolean
  compact?: boolean
  inAppUpdate?: boolean
}): JSX.Element {
  const isUpdate = variant === 'update'
  const steps = isUpdate ? UPDATE_STEPS : INSTALL_STEPS

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl border',
        isUpdate
          ? 'border-cyan-400/20 bg-gradient-to-br from-cyan-500/[0.07] via-black/20 to-fuchsia-500/[0.04]'
          : 'border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/[0.08] via-black/20 to-cyan-500/[0.04]',
        compact ? 'p-4' : 'p-6'
      ].join(' ')}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl"
        style={{
          background: isUpdate ? 'rgba(34,211,238,0.15)' : 'rgba(217,70,239,0.15)'
        }}
        aria-hidden
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
              isUpdate
                ? 'border-cyan-400/25 bg-cyan-500/10 text-cyan-300'
                : 'border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-300'
            ].join(' ')}
          >
            {isUpdate ? <RefreshCw className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                {isUpdate ? 'Доступне оновлення Traffic Cloud' : 'Потрібен десктоп-додаток'}
              </h3>
              <span
                className={[
                  'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]',
                  isUpdate
                    ? 'border-cyan-400/25 bg-cyan-500/10 text-cyan-200'
                    : 'border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-200'
                ].join(' ')}
              >
                v{latestVersion}
              </span>
            </div>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-zinc-500">
              {isUpdate ? (
                <>
                  Ви в додатку
                  {currentVersion ? (
                    <>
                      {' '}
                      (<span className="font-mono text-zinc-400">v{currentVersion}</span>)
                    </>
                  ) : null}
                  , але для TikTok потрібна новіша версія з антидетект-браузером.
                </>
              ) : (
                <>
                  TikTok Warmup працює лише в Traffic Cloud для Windows — автореєстрація, прогрів і
                  керування профілями недоступні у звичайному браузері.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {!compact ? (
        <div className="relative mt-5 grid gap-2 sm:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25 }}
                className="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${isUpdate ? 'text-cyan-300' : 'text-fuchsia-300'}`} />
                  <span className="text-[12px] font-medium text-zinc-200">{f.title}</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-600">{f.hint}</p>
              </motion.div>
            )
          })}
        </div>
      ) : null}

      <ol className="relative mt-4 space-y-2">
        {steps.map((step, i) => (
          <li key={step} className="flex items-start gap-3 text-[12px] text-zinc-400">
            <span
              className={[
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold',
                isUpdate
                  ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
                  : 'border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200'
              ].join(' ')}
            >
              {i + 1}
            </span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>

      <div className="relative mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={primaryBusy}
          onClick={onPrimary}
          className={[
            'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-60',
            isUpdate
              ? 'border-cyan-400/35 bg-gradient-to-r from-cyan-500/20 to-cyan-400/10 text-cyan-50 hover:border-cyan-400/55 hover:shadow-[0_0_28px_rgba(34,211,238,0.15)]'
              : 'border-fuchsia-400/35 bg-gradient-to-r from-fuchsia-500/20 to-violet-500/10 text-fuchsia-50 hover:border-fuchsia-400/55 hover:shadow-[0_0_28px_rgba(217,70,239,0.15)]'
          ].join(' ')}
        >
          {primaryBusy ? (
            <Sparkles className="h-4 w-4 animate-pulse" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {primaryBusy
            ? 'Запуск оновлення…'
            : isUpdate
              ? inAppUpdate
                ? `Оновити зараз до v${latestVersion}`
                : `Оновити до v${latestVersion}`
              : inAppUpdate
                ? 'Встановити з автооновленням'
                : 'Завантажити додаток'}
        </button>
        {onSecondary && !isUpdate ? (
          <button
            type="button"
            onClick={onSecondary}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition-colors duration-200 hover:border-white/20 hover:text-white"
          >
            <Shield className="h-4 w-4 text-zinc-500" />
            Відкрити в додатку
          </button>
        ) : null}
      </div>

      <p className="relative mt-3 flex items-center gap-1.5 text-[11px] text-zinc-600">
        <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px]">
          ~83 MB
        </span>
        {inAppUpdate && isUpdate
          ? 'Файли замінюються автоматично · перезапуск через кілька секунд'
          : 'Інсталятор з цього сайту · Windows x64'}
      </p>

      <div className="relative mt-3">
        <WindowsUnblockHelp compact={compact} />
      </div>
    </div>
  )
}
