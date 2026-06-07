import type { LucideIcon } from 'lucide-react'
import {
  Filter,
  LayoutDashboard,
  Link2,
  Megaphone,
  MessageCircle,
  ScrollText,
  Settings,
  Shield,
  Users,
  Mail,
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
type NavSection = { title: string; items: NavItem[] }

const sections: NavSection[] = [
  {
    title: 'Початок',
    items: [
      { to: '/', label: 'Огляд', icon: LayoutDashboard, end: true },
      { to: '/accounts', label: 'Акаунти', icon: Users, end: false },
      { to: '/sources', label: 'Парсер чатів', icon: Link2, end: false },
      { to: '/campaigns', label: 'Розсилка', icon: Megaphone, end: false },
      { to: '/inbox', label: 'Повідомлення', icon: MessageCircle, end: false }
    ]
  },
  {
    title: 'Додатково',
    items: [
      { to: '/messages', label: 'Шаблони', icon: Mail, end: false },
      { to: '/filters', label: 'Фільтри', icon: Filter, end: false },
      { to: '/logs', label: 'Логи', icon: ScrollText, end: false }
    ]
  },
  {
    title: 'Система',
    items: [{ to: '/settings', label: 'Налаштування', icon: Settings, end: false }]
  }
]

export function AppShell(): JSX.Element {
  const { isAdmin } = useAuth()
  const { unreadTotal } = useInboxNotify()

  const systemItems: NavItem[] = [
    { to: '/settings', label: 'Настройки', icon: Settings, end: false },
    { to: '/billing', label: 'Підписка', icon: CreditCard, end: false }
  ]
  if (isAdmin) {
    systemItems.push({ to: '/admin', label: 'Адмін', icon: Shield, end: false })
  }

  const allSections: NavSection[] = sections.map((section) =>
    section.title === 'Система' ? { ...section, items: systemItems } : section
  )

  return (
    <div className="flex h-full min-h-0 bg-ink">
      <Sidebar>
        <div className="mb-10 px-2">
          <PanelBrand layout="sidebar" />
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
          {allSections.map((section) => (
            <div key={section.title}>
              <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                {section.title}
              </div>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
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
          ))}
        </nav>

        <div className="mt-6 space-y-3">
          <SubscriptionTerm variant="card" />
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Швидкий старт
            </div>
            <p className="text-[12px] leading-relaxed text-zinc-500">
              1. Акаунт + SOCKS5 + session · 2. Парсер · 3. Розсилка · 4. Повідомлення для відповідей.
            </p>
          </div>
        </div>
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-auto px-8 pb-10 pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
