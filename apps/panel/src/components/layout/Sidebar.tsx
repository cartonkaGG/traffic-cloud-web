import type { ReactNode } from 'react'

export function Sidebar({ children }: { children: ReactNode }): JSX.Element {
  return (
    <aside className="sticky top-0 flex h-screen min-h-screen w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-[#06080d] px-5 py-8 backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-0 bg-radial-fog opacity-50"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </aside>
  )
}
