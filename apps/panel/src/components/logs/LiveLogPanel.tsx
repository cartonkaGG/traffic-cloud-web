import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { LogEventKind } from '@/domain/types'
import { useLogs } from '@/context/LogContext'

function kindClasses(kind: LogEventKind): string {
  switch (kind) {
    case 'message_sent':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
    case 'message_failed':
    case 'proxy_error':
      return 'border-red-400/20 bg-red-400/10 text-red-200'
    case 'flood_warning':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
    case 'user_skipped':
      return 'border-white/10 bg-white/5 text-zinc-300'
    case 'account_paused':
      return 'border-orange-400/20 bg-orange-400/10 text-orange-200'
    case 'outreach_alert':
      return 'border-rose-400/30 bg-rose-500/15 text-rose-100'
    case 'inbox_message':
      return 'border-accent/25 bg-accent/10 text-accent'
    default:
      return 'border-sky-400/20 bg-sky-400/10 text-sky-200'
  }
}

function formatTime(ts: number): string {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(ts))
}

export function LiveLogPanel({
  compact = false,
  limit = 40,
  hideFooterLink = false
}: {
  compact?: boolean
  limit?: number
  hideFooterLink?: boolean
}): JSX.Element {
  const { entries } = useLogs()

  const visible = useMemo(() => entries.slice(0, limit), [entries, limit])

  return (
    <div className={compact ? 'glass-panel overflow-hidden' : 'glass-panel overflow-hidden'}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="text-sm font-semibold text-white">Живые логи</div>
        {!compact && !hideFooterLink && (
          <Link
            to="/logs"
            className="text-[12px] font-medium text-accent hover:text-white transition-colors"
          >
            Все события
          </Link>
        )}
      </div>
      <div
        className={
          compact
            ? 'max-h-[280px] divide-y divide-white/[0.06] overflow-auto px-2 py-2'
            : 'max-h-[min(720px,72vh)] divide-y divide-white/[0.06] overflow-auto px-2 py-2'
        }
      >
        {visible.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.015, 0.25) }}
            className="flex gap-4 rounded-xl px-4 py-3 hover:bg-white/[0.03]"
          >
            <div className="w-[92px] shrink-0 pt-0.5 font-mono text-[11px] text-zinc-500">
              {formatTime(e.ts)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${kindClasses(e.kind)}`}
                >
                  {e.kind.replaceAll('_', ' ')}
                </span>
              </div>
              <div className="mt-1 text-[13px] leading-relaxed text-zinc-300">{e.message}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
