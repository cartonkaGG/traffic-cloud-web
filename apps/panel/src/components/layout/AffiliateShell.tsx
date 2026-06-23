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
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-emerald-500/10 text-white shadow-[inset_0_0_0_1px_rgba(52,211,153,0.28)]'
            : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`relative z-10 h-[18px] w-[18px] ${isActive ? 'text-emerald-300' : 'text-zinc-500 group-hover:text-zinc-300'}`}
            aria-hidden
          />
          <span className="relative z-10">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

function TopTab({ item }: { item: NavItem }): JSX.Element {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        [
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
          isActive
            ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/25'
            : 'text-zinc-500 hover:text-zinc-200 border border-transparent'
        ].join(' ')
      }
    >
      <Icon className="h-4 w-4" aria-hidden />
      {item.label}
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
    <div className="flex h-full min-h-0 bg-ink">
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

        <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-[11px] leading-relaxed text-zinc-500">
          Офери та статистика — окремі розділи. Вхід через меню профілю.
          {import.meta.env.VITE_PANEL_BUILD_ID ? (
            <div className="mt-2 font-mono text-[9px] text-zinc-600">
              build {String(import.meta.env.VITE_PANEL_BUILD_ID).slice(0, 12)}
            </div>
          ) : null}
        </div>
      </Sidebar>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 80% 45% at 50% -5%, rgba(52,211,153,0.08), transparent 55%)'
          }}
        />

        <header className="relative z-10 border-b border-white/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-6 py-4 sm:px-8">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
                {meta.kicker}
              </div>
              <h1 className="text-lg font-semibold text-white sm:text-xl">{meta.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={getMarketingHomeUrl()}
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Сайт</span>
              </a>
              <AccountMenu redirectAfterSwitch={pathname} />
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto border-t border-white/[0.04] px-4 py-2.5 sm:px-8">
            {mainNav.map((item) => (
              <TopTab key={item.to} item={item} />
            ))}
            {systemNav.map((item) => (
              <TopTab key={item.to} item={item} />
            ))}
          </nav>
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
