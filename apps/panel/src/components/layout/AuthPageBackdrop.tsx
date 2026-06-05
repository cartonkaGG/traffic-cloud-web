import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function AuthPageBackdrop({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(34,211,238,0.22), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 20%, rgba(99,102,241,0.12), transparent 50%), radial-gradient(ellipse 60% 50% at 0% 80%, rgba(34,211,238,0.08), transparent 55%), linear-gradient(180deg, #030712 0%, #0a0f1a 100%)'
        }}
      />
      <motion.div
        className="pointer-events-none absolute -left-40 top-24 h-[520px] w-[520px] rounded-full bg-accent/20 blur-[120px]"
        animate={{ opacity: [0.35, 0.6, 0.35], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -right-32 bottom-10 h-[460px] w-[460px] rounded-full bg-indigo-500/15 blur-[110px]"
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [1.03, 1, 1.03] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden
      />
      {children}
    </div>
  )
}
