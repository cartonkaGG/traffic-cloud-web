import { useState } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { BarChart3, Home, Link2, Menu, Shield, X } from 'lucide-react'
import { Suspense } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AccountMenu } from '@/components/account/AccountMenu'
import { PanelBrand } from '@/components/brand/PanelBrand'
import { PanelLoadingScreen } from '@/components/layout/PanelLoadingScreen'
import { useAuth } from '@/context/AuthContext'
import { getMarketingHomeUrl } from '@/lib/site'
import { Sidebar } from './Sidebar'

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean }

const ROUTE_META: Record<string, { title: string; kicker: string }> = {
  '/affiliate/offers': { title: 'Офери', kicker: 'Партнерка' },
  '/affiliate/stats': { title: 'Статистика', kicker: 'Партнерка' },
  '/affiliate': { title: 'Офери', kicker: 'Партнерка' },
  '/admin/affiliate': { title: 'Керування оферами', kicker: 'Адмін' }
}

function NavItemLink({ item }: { item: NavItem }): JSX.Element {
  const Icon = item.icon
  return (
    <NavLink to={item.to} end={item.end} className="block">
      {({ isActive }) => (
        <motion.div
          layout
          className={[
            'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            isActive
              ? 'text-white'
              : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
          ].join(' ')}
          whileHover={{ x: isActive ? 0 : 2 }}
          whileTap={{ scale: 0.98 }}
        >
          {isActive ? (
            <span
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/15 to-emerald-500/10 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.25)]"
              aria-hidden
            />
          ) : null}
          <Icon
            className={`relative z-10 h-[18px] w-[18px] ${isActive ? 'text-sky-300' : 'text-zinc-500 group-hover:text-zinc-300'}`}
            aria-hidden
          />
          <span className="relative z-10">{item.label}</span>
        </motion.div>
      )}
    </NavLink>
  )
}

export function AffiliateShell(): JSX.Element {
  const { isAdmin } = useAuth()
  const { pathname } = useLocation()
  const [mobileNav, setMobileNav] = useState(false)
  const meta = ROUTE_META[pathname] ?? ROUTE_META['/affiliate/offers']

  const mainNav: NavItem[] = [
    { to: '/affiliate/offers', label: 'Офери', icon: Link2, end: true },
    { to: '/affiliate/stats', label: 'Статистика', icon: BarChart3, end: true }
  ]
  const systemNav: NavItem[] = isAdmin
    ? [{ to: '/admin/affiliate', label: 'Адмін', icon: Shield }]
    : []
  const allNav = [...mainNav, ...systemNav]

  return (
    <div className="flex min-h-screen h-full bg-[#06080d]">
      <div className="hidden shrink-0 lg:block">
        <Sidebar>
        <div className="mb-8 px-2">
          <PanelBrand layout="sidebar" homeTo="/affiliate/offers" />
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-1">
          <div>
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
              Партнерка
            </div>
            <div className="flex flex-col gap-1">
              {mainNav.map((item) => (
                <NavItemLink key={item.to} item={item} />
              ))}
            </div>
          </div>

          {systemNav.length > 0 ? (
            <div>
              <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
                Керування
              </div>
              <div className="flex flex-col gap-1">
                {systemNav.map((item) => (
                  <NavItemLink key={item.to} item={item} />
                ))}
              </div>
            </div>
          ) : null}
        </nav>

        <div className="mt-auto shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-[11px] leading-relaxed text-zinc-500">
          До 10 посилань на офер · окрема статистика кожного лінка.
        </div>
        </Sidebar>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(56,189,248,0.12), transparent 55%), radial-gradient(ellipse 40% 30% at 100% 0%, rgba(52,211,153,0.08), transparent 50%)'
          }}
        />

        <header className="relative z-10 flex items-center justify-between gap-4 border-b border-white/[0.06] px-4 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNav(true)}
              className="lg:hidden rounded-xl border border-white/[0.08] p-2 text-zinc-400"
              aria-label="Меню"
            >
              <Menu className="h-5 w-5" />
            </button>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="min-w-0"
            >
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400/80">
              {meta.kicker}
            </div>
            <h1 className="truncate text-lg font-semibold text-white sm:text-xl">{meta.title}</h1>
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={getMarketingHomeUrl()}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 transition hover:border-white/15 hover:text-zinc-200"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Сайт</span>
            </a>
            <AccountMenu redirectAfterSwitch={pathname} />
          </div>
        </header>

        <main className="relative z-10 min-h-0 flex-1 overflow-auto">
          <Suspense fallback={<PanelLoadingScreen label="Завантаження…" />}>
            <Outlet />
          </Suspense>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-white/[0.08] bg-[#06080d]/95 backdrop-blur-xl lg:hidden">
          {allNav.map((item) => {
            const Icon = item.icon
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium ${
                  active ? 'text-sky-300' : 'text-zinc-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {mobileNav ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              aria-label="Закрити"
              onClick={() => setMobileNav(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-[min(280px,85vw)] flex-col border-r border-white/[0.08] bg-[#06080d] p-5">
              <div className="mb-6 flex items-center justify-between">
                <PanelBrand layout="sidebar" homeTo="/affiliate/offers" />
                <button type="button" onClick={() => setMobileNav(false)} className="text-zinc-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {allNav.map((item) => (
                  <div key={item.to} onClick={() => setMobileNav(false)}>
                    <NavItemLink item={item} />
                  </div>
                ))}
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  )
}
