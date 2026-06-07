import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/campaigns', label: 'Запуск', end: true },
  { to: '/messages', label: 'Шаблони', end: true },
  { to: '/filters', label: 'Фільтри', end: true }
] as const

export function CampaignsSubNav(): JSX.Element {
  return (
    <nav className="flex flex-wrap gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1.5">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            [
              'rounded-xl px-4 py-2 text-[13px] font-medium transition-colors',
              isActive
                ? 'bg-accent/15 text-accent shadow-[inset_0_0_0_1px_rgba(94,200,255,0.2)]'
                : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200'
            ].join(' ')
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
