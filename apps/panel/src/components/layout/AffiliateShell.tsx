import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { BarChart3, Home, Link2, Shield } from 'lucide-react'
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
            <motion.span
              layoutId="affiliate-nav-pill"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/15 to-emerald-500/10 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.25)]"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
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
  const meta = ROUTE_META[pathname] ?? ROUTE_META['/affiliate/offers']

  const mainNav: NavItem[] = [
    { to: '/affiliate/offers', label: 'Офери', icon: Link2, end: true },
    { to: '/affiliate/stats', label: 'Статистика', icon: BarChart3, end: true }
  ]
  const systemNav: NavItem[] = isAdmin
    ? [{ to: '/admin/affiliate', label: 'Адмін', icon: Shield }]
    : []

  return (
    <div className="flex h-full min-h-0 bg-[#06080d]">
      <Sidebar>
        <div className="mb-8 px-2">
          <PanelBrand layout="sidebar" homeTo="/affiliate/offers" />
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
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

        <div className="mt-4 rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent px-3 py-3 text-[11px] leading-relaxed text-zinc-500">
          До 10 посилань на офер · окрема статистика кожного лінка.
        </div>
      </Sidebar>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(56,189,248,0.12), transparent 55%), radial-gradient(ellipse 40% 30% at 100% 0%, rgba(52,211,153,0.08), transparent 50%)'
          }}
        />

        <header className="relative z-10 flex items-center justify-between gap-4 border-b border-white/[0.06] px-6 py-4 backdrop-blur-xl sm:px-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400/80">
              {meta.kicker}
            </div>
            <h1 className="text-lg font-semibold text-white sm:text-xl">{meta.title}</h1>
          </motion.div>
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
      </div>
    </div>
  )
}
