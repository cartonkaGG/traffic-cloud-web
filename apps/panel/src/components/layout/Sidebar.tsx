import type { ReactNode } from 'react'

export function Sidebar({ children }: { children: ReactNode }): JSX.Element {
  return (
    <aside className="relative flex w-[260px] shrink-0 flex-col border-r border-gray-800/60 bg-gray-950/90 px-5 py-8 backdrop-blur-xl">
      <div
        className="pointer-events-none absolute inset-0 bg-radial-fog opacity-70"
        aria-hidden
      />
      <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
    </aside>
  )
}
