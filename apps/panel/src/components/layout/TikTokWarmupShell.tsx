import { Flame, LayoutGrid } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AccountMenu } from '@/components/account/AccountMenu'
import { PanelBrand } from '@/components/brand/PanelBrand'
import { SubscriptionTerm } from '@/components/billing/SubscriptionTerm'
import { Sidebar } from './Sidebar'

const nav = [{ to: '/tiktok', label: 'Прогрів', icon: Flame, end: true }]

export function TikTokWarmupShell(): JSX.Element {
  const navigate = useNavigate()

  return (
    <div className="relative flex h-full min-h-0 bg-ink">
      <Sidebar>
        <div className="mb-8 px-2">
          <PanelBrand layout="sidebar" homeTo="/hub" />
          <p className="mt-2 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-fuchsia-400/70">
            TikTok Warmup
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
                      ? 'bg-fuchsia-500/10 text-white shadow-[inset_0_0_0_1px_rgba(217,70,239,0.25)]'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <motion.span
                        layoutId="tt-nav-pill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-fuchsia-500/15 to-transparent"
                        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      />
                    ) : null}
                    <Icon
                      className={`relative z-10 h-[18px] w-[18px] ${isActive ? 'text-fuchsia-300' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                    />
                    <span className="relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => navigate('/hub')}
          className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-[12px] text-zinc-500 transition-colors hover:border-white/15 hover:text-zinc-300"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Hub
        </button>
      </Sidebar>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] px-6 py-4">
          <SubscriptionTerm variant="inline" />
          <AccountMenu redirectAfterSwitch="/hub" />
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
