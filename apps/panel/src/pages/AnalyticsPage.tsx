import { Activity, MessageSquare, Reply, Send, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import type { OutreachRunRecordModel } from '@/domain/types'
import * as mocks from '@/data/mocks'
import { apiListOutreachRunHistory } from '@/lib/api'

function runStatusUa(s: string): string {
  switch (s) {
    case 'completed':
      return 'Завершено'
    case 'cancelled':
      return 'Зупинено'
    case 'failed':
      return 'Помилка'
    default:
      return s
  }
}

/** Старі записи могли мати status completed при 0 надісланих — показуємо як невдалу доставку. */
function runDisplayStatusUa(r: OutreachRunRecordModel): string {
  if (r.status === 'completed' && r.cap > 0 && r.sent === 0) return 'Без доставки'
  return runStatusUa(r.status)
}

export function AnalyticsPage(): JSX.Element {
  const { bundle, workspaceId, status, refetch } = useWorkspaceData()
  const a = bundle?.analytics ?? mocks.analyticsSnapshot
  const [runs, setRuns] = useState<OutreachRunRecordModel[]>([])
  const bundleRefetchForWid = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      bundleRefetchForWid.current = null
    }
  }, [])

  useEffect(() => {
    if (!workspaceId || status !== 'online') return
    if (bundleRefetchForWid.current === workspaceId) return
    bundleRefetchForWid.current = workspaceId
    void refetch()
  }, [workspaceId, status, refetch])

  const loadRuns = useCallback(async () => {
    if (!workspaceId || status !== 'online') return
    try {
      const r = await apiListOutreachRunHistory(workspaceId)
      setRuns(r.runs ?? [])
    } catch {
      setRuns([])
    }
  }, [workspaceId, status])

  useEffect(() => {
    void loadRuns()
  }, [loadRuns])

  const outreachAgg = useMemo(() => {
    const sent = runs.reduce((acc, x) => acc + x.sent, 0)
    const failedRuns = runs.filter(
      (x) => x.status === 'failed' || (x.status === 'completed' && x.cap > 0 && x.sent === 0)
    ).length
    const okRuns = runs.filter((x) => x.status === 'completed' && x.sent > 0).length
    return { sent, failedRuns, okRuns, totalRuns: runs.length }
  }, [runs])

  const sentDisplay = Math.max(a.sent, outreachAgg.sent)

  const cards = [
    {
      label: 'Всього DM',
      value: sentDisplay.toLocaleString('uk-UA'),
      hint: 'Усі надіслані повідомлення (історія розсилок + лічильник)',
      icon: Send
    },
    {
      label: 'Доставлено',
      value: Math.max(a.delivered, sentDisplay).toLocaleString('uk-UA'),
      hint: 'Успішні відправки через MTProto',
      icon: MessageSquare
    },
    {
      label: 'Помилки',
      value: Math.max(a.failed, outreachAgg.failedRuns).toLocaleString('uk-UA'),
      hint: 'Невдалі DM та запуски без доставки',
      icon: Shield
    },
    {
      label: 'Успішні запуски',
      value: String(outreachAgg.okRuns),
      hint: `З ${outreachAgg.totalRuns} запусків розсилки`,
      icon: Zap
    },
    {
      label: 'Активні акаунти',
      value: String(a.activeAccounts),
      hint: 'Статуси active / warming',
      icon: Activity
    },
    {
      label: 'Відповіді',
      value: a.replies.toLocaleString('uk-UA'),
      hint: 'Відстеження відповідей — незабаром',
      icon: Reply
    }
  ] as const

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500">
          Реальні цифри з ваших розсилок. Після запуску DM у «Розсилка» дані з’являться тут автоматично.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-panel p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {c.label}
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight text-white">{c.value}</div>
                <div className="mt-2 text-[13px] text-zinc-500">{c.hint}</div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-accent">
                <c.icon className="h-5 w-5" aria-hidden />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel p-6">
        <div className="text-sm font-semibold text-white">Кампании в работе</div>
        <div className="mt-2 text-[13px] text-zinc-500">
          Сейчас активных кампаний:{' '}
          <span className="font-semibold text-white">{a.campaignsRunning}</span>.
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">DM outreach · історія запусків</div>
            <p className="mt-1 text-[13px] text-zinc-500">
              Усього записів: {outreachAgg.totalRuns}. Надіслано заархівовано:{' '}
              <span className="font-semibold text-white">{outreachAgg.sent}</span>. Успішних завершень:{' '}
              {outreachAgg.okRuns}, з помилкою: {outreachAgg.failedRuns}.
            </p>
          </div>
          <Link
            to="/campaigns"
            className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20"
          >
            До кампаній
          </Link>
        </div>

        {runs.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">Поки немає завершених запусків у локальному архіві.</p>
        ) : (
          <div className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-white/[0.06]">
            <table className="w-full text-left text-[13px] text-zinc-300">
              <thead className="sticky top-0 bg-black/60 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-3 py-2">Статус</th>
                  <th className="px-3 py-2">Акаунт</th>
                  <th className="px-3 py-2">Надіслано</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {runs.slice(0, 80).map((r) => (
                  <tr key={r.runId} className="border-t border-white/[0.05] hover:bg-white/[0.03]">
                    <td className="px-3 py-2">{runDisplayStatusUa(r)}</td>
                    <td className="px-3 py-2 font-medium text-white">{r.accountLabel}</td>
                    <td className="px-3 py-2 font-mono">
                      {r.sent} / {r.cap}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Link
                        to={`/campaigns?run=${encodeURIComponent(r.runId)}`}
                        className="text-accent hover:text-white"
                      >
                        Деталі
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
