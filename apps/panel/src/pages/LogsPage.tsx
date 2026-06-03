import { Trash2, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { LiveLogPanel } from '@/components/logs/LiveLogPanel'
import { useLogs } from '@/context/LogContext'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import { apiPostLog } from '@/lib/api'

export function LogsPage(): JSX.Element {
  const { push, clear, ingest } = useLogs()
  const { workspaceId, status } = useWorkspaceData()

  async function addTestLog(): Promise<void> {
    const msg = 'Тестовое событие · DM успешно поставлено в очередь'
    if (workspaceId && status === 'online') {
      try {
        const r = await apiPostLog(workspaceId, {
          kind: 'message_sent',
          message: msg,
          meta: { demo: true }
        })
        ingest(r.log)
      } catch {
        push('message_sent', msg, { demo: true })
      }
    } else {
      push('message_sent', msg, { demo: true })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500">
            События из MongoDB Atlas + WebSocket. Новое событие через API появляется у всех клиентов в реальном времени.
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void addTestLog()}
            className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/15"
          >
            <Zap className="h-4 w-4" aria-hidden />
            Добавить тестовый лог
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clear}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Очистить
          </motion.button>
        </div>
      </div>

      <LiveLogPanel compact={false} limit={200} hideFooterLink />
    </div>
  )
}
