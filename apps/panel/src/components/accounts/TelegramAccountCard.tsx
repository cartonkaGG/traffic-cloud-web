import { ArrowUpRight, Circle, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { TelegramAccountModel } from '@/domain/types'
import { formatActivityLabel } from '@/lib/formatActivity'

const statusLabel: Record<TelegramAccountModel['status'], string> = {
  active: 'Активный',
  warming: 'Прогрев',
  flood: 'FloodWait',
  limited: 'Ограничен',
  banned: 'Заблокирован',
  disconnected: 'Офлайн'
}

const statusStyle: Record<TelegramAccountModel['status'], string> = {
  active: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  warming: 'text-sky-300 bg-sky-400/10 border-sky-400/20',
  flood: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  limited: 'text-orange-300 bg-orange-400/10 border-orange-400/20',
  banned: 'text-red-300 bg-red-400/10 border-red-400/20',
  disconnected: 'text-zinc-400 bg-white/5 border-white/10'
}

export function TelegramAccountCard({
  account,
  index,
  proxyLabel,
  onOpenAntidetect,
  antidetectLaunching,
  onOpenMtprotoLogin,
  onOpenSpam,
  onDeleteAccount,
  mtprotoBusy,
  spamBusy,
  deleteBusy
}: {
  account: TelegramAccountModel
  index: number
  proxyLabel?: string | null
  onOpenAntidetect?: (account: TelegramAccountModel) => void
  antidetectLaunching?: boolean
  onOpenMtprotoLogin?: (account: TelegramAccountModel) => void
  onOpenSpam?: (account: TelegramAccountModel) => void
  onDeleteAccount?: (account: TelegramAccountModel) => void
  mtprotoBusy?: boolean
  spamBusy?: boolean
  deleteBusy?: boolean
}): JSX.Element {
  const uname = account.username ? `@${account.username}` : 'без username'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="glass-panel group relative overflow-hidden p-5"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/15 to-white/5 text-sm font-semibold text-white">
            {account.label
              .split(' ')
              .map((w) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="truncate text-base font-semibold text-white">{account.label}</div>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyle[account.status]}`}
              >
                <Circle className="h-2 w-2 fill-current" aria-hidden />
                {statusLabel[account.status]}
              </span>
            </div>
            <div className="mt-1 font-mono text-[13px] text-zinc-400">{uname}</div>
            <div className="mt-3 grid gap-1 text-[13px] text-zinc-500">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <span>{account.phone}</span>
                <span className="text-zinc-600">·</span>
                <span>Последняя активность · {formatActivityLabel(account.lastActivity)}</span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <span>Отправлено сегодня · {account.sentToday}</span>
                <span className="text-zinc-600">·</span>
                <span>Прокси · {proxyLabel ?? '—'}</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!onOpenMtprotoLogin || mtprotoBusy === true}
                onClick={() => onOpenMtprotoLogin?.(account)}
                className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-zinc-200 transition-colors hover:border-accent/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {mtprotoBusy ? '…' : 'Код Telegram'}
              </button>
              <button
                type="button"
                disabled={
                  !onOpenSpam ||
                  spamBusy === true ||
                  account.hasMtprotoSession !== true
                }
                onClick={() => onOpenSpam?.(account)}
                className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-1.5 text-[12px] font-medium text-amber-200/95 transition-colors hover:border-amber-400/40 hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                title={
                  account.hasMtprotoSession
                    ? 'Розсилка DM по розпарсеній аудиторії (активний шаблон)'
                    : 'Спочатку увійдіть через «Код Telegram»'
                }
              >
                {spamBusy ? '…' : 'Запустити спам'}
              </button>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <motion.button
            type="button"
            disabled={
              !account.browserProfileId ||
              !onOpenAntidetect ||
              antidetectLaunching === true
            }
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenAntidetect?.(account)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition-colors hover:border-accent/35 hover:text-accent disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Відкрити anti-detect профіль"
            title="Відкрити браузерний профіль цього акаунта"
          >
            <ArrowUpRight className="h-4 w-4" />
          </motion.button>
          <motion.button
            type="button"
            disabled={!onDeleteAccount || deleteBusy === true}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDeleteAccount?.(account)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300/95 transition-colors hover:border-red-400/40 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Видалити акаунт"
            title="Видалити акаунт і профіль браузера"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
