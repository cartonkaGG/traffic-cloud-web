import type { ReactNode } from 'react'

export function AuthPageBackdrop({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(34,211,238,0.14), transparent 50%), linear-gradient(180deg, #030712 0%, #0a0f1a 100%)'
        }}
      />
      <div
        className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-cyan-500/8 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-indigo-500/6 blur-2xl"
        aria-hidden
      />
      {children}
    </div>
  )
}
