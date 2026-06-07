import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Link2,
  Megaphone,
  MessageCircle,
  Settings,
  Shield,
  Users,
  CreditCard
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { PanelBrand } from '@/components/brand/PanelBrand'
import { SubscriptionTerm } from '@/components/billing/SubscriptionTerm'
import { useInboxNotify } from '@/context/InboxNotifyContext'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean }

const mainNav: NavItem[] = [
  { to: '/', label: 'Огляд', icon: LayoutDashboard, end: true },
  { to: '/accounts', label: 'Акаунти', icon: Users },
  { to: '/sources', label: 'Парсер', icon: Link2 },
  { to: '/campaigns', label: 'Розсилка', icon: Megaphone },
  { to: '/inbox', label: 'Вхідні', icon: MessageCircle }
]

export function AppShell(): JSX.Element {
  const { isAdmin } = useAuth()
  const { unreadTotal } = useInboxNotify()

  const systemNav: NavItem[] = [
    { to: '/settings', label: 'Налаштування', icon: Settings },
    { to: '/billing', label: 'Підписка', icon: CreditCard }
  ]
  if (isAdmin) {
    systemNav.push({ to: '/admin', label: 'Адмін', icon: Shield })
  }

  return (
    <div className="flex h-full min-h-0 bg-ink">
      <Sidebar>
        <div className="mb-8 px-2">
          <PanelBrand layout="sidebar" />
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
          <div>
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
              Панель
            </div>
            <div className="flex flex-col gap-1">
              {mainNav.map((item) => {
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
                        {isActive && (
                          <motion.span
                            layoutId="nav-pill"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/15 to-transparent"
                            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                          />
                        )}
                        <Icon
                          className={`relative z-10 h-[18px] w-[18px] ${isActive ? 'text-accent' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                          aria-hidden
                        />
                        <span className="relative z-10 flex flex-1 items-center justify-between gap-2">
                          {item.label}
                          {item.to === '/inbox' && unreadTotal > 0 ? (
                            <span className="rounded-full bg-accent/25 px-2 py-0.5 text-[10px] font-bold text-accent">
                              {unreadTotal > 99 ? '99+' : unreadTotal}
                            </span>
                          ) : null}
                        </span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
              Система
            </div>
            <div className="flex flex-col gap-1">
              {systemNav.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
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
                        {isActive && (
                          <motion.span
                            layoutId="nav-pill-system"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/15 to-transparent"
                            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                          />
                        )}
                        <Icon
                          className={`relative z-10 h-[18px] w-[18px] ${isActive ? 'text-accent' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                          aria-hidden
                        />
                        <span className="relative z-10">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        </nav>

        <div className="mt-4 space-y-3">
          <SubscriptionTerm variant="card" />
        </div>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-auto px-6 pb-8 pt-5 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
