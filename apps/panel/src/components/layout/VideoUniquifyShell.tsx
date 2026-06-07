import { Clapperboard, LayoutGrid } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AccountMenu } from '@/components/account/AccountMenu'
import TrafficCloudMark from '@/components/brand/TrafficCloudMark'
import { PanelBrand } from '@/components/brand/PanelBrand'
import { SubscriptionTerm } from '@/components/billing/SubscriptionTerm'
import { Sidebar } from './Sidebar'

const nav = [{ to: '/uniquify', label: 'Студія', icon: Clapperboard, end: true }]

export function VideoUniquifyShell(): JSX.Element {
  const navigate = useNavigate()

  return (
    <div className="relative flex h-full min-h-0 bg-ink">
      <Sidebar>
        <div className="mb-8 px-2">
          <PanelBrand layout="sidebar" homeTo="/hub" />
          <p className="mt-2 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent/70">
            Video Uniquify
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 pr-1">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent/10 text-white shadow-[inset_0_0_0_1px_rgba(94,200,255,0.25)]'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <motion.span
                        layoutId="vu-nav-pill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/15 to-transparent"
                        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      />
                    ) : null}
                    <Icon
                      className={`relative z-10 h-[18px] w-[18px] ${isActive ? 'text-accent neon-cloud-icon' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                    />
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-4 space-y-3">
          <SubscriptionTerm variant="card" />
          <button
            type="button"
            onClick={() => navigate('/hub')}
            className="flex w-full items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left text-sm text-zinc-400 transition-colors hover:border-accent/25 hover:text-zinc-200"
          >
            <LayoutGrid className="h-4 w-4 text-accent/70" />
            Traffic Cloud Hub
          </button>
        </div>
      </Sidebar>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-gray-800/60 bg-gray-950/80 px-6 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="mt-0.5 hidden shrink-0 sm:flex">
                <TrafficCloudMark size={30} variant="logo" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                  Локальна обробка · Pro
                </div>
                <h1 className="mt-1 text-lg font-semibold tracking-tight text-white">Video Uniquify</h1>
                <div className="mt-1 hidden sm:block">
                  <SubscriptionTerm variant="inline" />
                </div>
              </div>
            </div>
            <AccountMenu redirectAfterSwitch="/hub" />
          </div>
        </header>
        <main className="relative min-h-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
