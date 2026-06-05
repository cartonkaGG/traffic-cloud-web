import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BarChart3, MousePointerClick, Radio, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { LiveLogPanel } from '@/components/logs/LiveLogPanel'
import { TelegramAccountCard } from '@/components/accounts/TelegramAccountCard'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import { useToast } from '@/context/ToastContext'
import * as mocks from '@/data/mocks'
import { launchAntidetectBrowserForAccount } from '@/lib/launchAntidetectBrowser'
import type { StatItem } from '@/data/mocks'
import type { TelegramAccountModel } from '@/domain/types'
import type { DashboardStatRemote } from '@/lib/api'

const ICONS: Record<DashboardStatRemote['iconKey'], StatItem['icon']> = {
  radio: Radio,
  mouse: MousePointerClick,
  trend: TrendingUp,
  chart: BarChart3
}

function mapDashboardStats(remote: DashboardStatRemote[]): StatItem[] {
  return remote.map((r) => ({
    label: r.label,
    value: r.value,
    delta: r.delta,
    positive: r.positive,
    icon: ICONS[r.iconKey]
  }))
}

export function DashboardPage(): JSX.Element {
  const { bundle, status, error, apiBaseUrl, workspaceId, refetch } = useWorkspaceData()
  const { pushToast } = useToast()
  const [launchingAccountId, setLaunchingAccountId] = useState<string | null>(null)
  /** refetch() ставить status у loading — без цього ref було б нескінченне online → refetch → loading → online. */
  const bundleRefetchForWid = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      bundleRefetchForWid.current = null
    }
  }, [])

  useEffect(() => {
    if (!workspaceId || status !== 'online' || bundle) return
    if (bundleRefetchForWid.current === workspaceId) return
    bundleRefetchForWid.current = workspaceId
    void refetch()
  }, [workspaceId, status, bundle, refetch])

  const statItems = useMemo(() => {
    if (bundle?.dashboardStats?.length) return mapDashboardStats(bundle.dashboardStats)
    return mocks.stats
  }, [bundle])

  const proxiesList = bundle?.proxies ?? mocks.proxies
  const accountsList = bundle?.telegramAccounts ?? mocks.telegramAccounts

  const proxyLabel = useMemo(() => {
    const m: Record<string, string> = {}
    for (const p of proxiesList) m[p.id] = p.label
    return m
  }, [proxiesList])

  const openAntidetectForAccount = useCallback(
    async (account: TelegramAccountModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Нет подключения к API', 'error')
        return
      }
      setLaunchingAccountId(account.id)
      try {
        const r = await launchAntidetectBrowserForAccount({
          workspaceId,
          account,
          browserProfiles: bundle?.browserProfiles ?? [],
          proxies: proxiesList
        })
        if (!r.ok) {
          pushToast(r.error, 'error')
          return
        }
        await refetch()
        pushToast('Профіль відкрито', 'ok')
      } finally {
        setLaunchingAccountId(null)
      }
    },
    [workspaceId, status, bundle?.browserProfiles, proxiesList, refetch, pushToast]
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-500">
          Премиум-консоль для Telegram outreach: изолированные браузер-профили, прокси-слои, DM-кампании и
          безопасные паузы.
        </p>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
            status === 'online'
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
              : status === 'loading'
                ? 'border-white/15 bg-white/5 text-zinc-400'
                : 'border-amber-400/25 bg-amber-400/10 text-amber-200'
          }`}
          title={
            status === 'offline' && error
              ? `${apiBaseUrl} — ${error}`
              : status === 'online'
                ? `Подключено к ${apiBaseUrl}`
                : undefined
          }
        >
          API · {status === 'online' ? 'online' : status === 'loading' ? '…' : 'offline'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item, index) => (
          <StatCard key={item.label} item={item} index={index} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <LiveLogPanel compact limit={14} />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                Telegram
              </div>
              <div className="mt-1 text-lg font-semibold text-white">Аккаунты · быстрый статус</div>
            </div>
          </div>
          <div className="space-y-3">
            {accountsList.slice(0, 3).map((a, i) => (
              <TelegramAccountCard
                key={a.id}
                account={a}
                index={i}
                proxyLabel={a.proxyId ? proxyLabel[a.proxyId] : null}
                onOpenAntidetect={openAntidetectForAccount}
                antidetectLaunching={launchingAccountId === a.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
