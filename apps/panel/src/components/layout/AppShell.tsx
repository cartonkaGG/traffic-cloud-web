import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Filter,
  Globe,
  LayoutDashboard,
  Link2,
  Megaphone,
  ScrollText,
  Server,
  Settings,
  Timer,
  Users,
  Mail
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean }
type NavSection = { title: string; items: NavItem[] }

const sections: NavSection[] = [
  {
    title: 'Операции',
    items: [
      { to: '/', label: 'Обзор', icon: LayoutDashboard, end: true },
      { to: '/browser', label: 'Anti-detect', icon: Globe, end: false },
      { to: '/accounts', label: 'Аккаунты', icon: Users, end: false },
      { to: '/proxy', label: 'Прокси', icon: Server, end: false }
    ]
  },
  {
    title: 'Outreach',
    items: [
      { to: '/sources', label: 'Источники / парсер', icon: Link2, end: false },
      { to: '/messages', label: 'Сообщения', icon: Mail, end: false },
      { to: '/filters', label: 'Фильтры', icon: Filter, end: false },
      { to: '/humanization', label: 'Гуманизация', icon: Timer, end: false },
      { to: '/campaigns', label: 'Кампании', icon: Megaphone, end: false }
    ]
  },
  {
    title: 'Аналитика',
    items: [
      { to: '/analytics', label: 'Аналитика', icon: BarChart3, end: false },
      { to: '/logs', label: 'Логи', icon: ScrollText, end: false }
    ]
  },
  {
    title: 'Система',
    items: [{ to: '/settings', label: 'Настройки', icon: Settings, end: false }]
  }
]

export function AppShell(): JSX.Element {
  return (
    <div className="flex h-full min-h-0 bg-ink">
      <Sidebar>
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-transparent shadow-glow">
            <img
              src="./cloud-icon.png"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              draggable={false}
            />
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              Traffic Cloud
            </div>
            <div className="text-sm font-semibold text-gradient">Outreach OS</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
          {sections.map((section) => (
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
                          <span className="relative z-10">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Архитектура
          </div>
          <p className="text-[12px] leading-relaxed text-zinc-500">
            Desktop shell + Node workers + MongoDB Atlas + Redis (опционально). Слой Anti-detect подключается как
            отдельный сервис автоматизации браузера.
          </p>
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
