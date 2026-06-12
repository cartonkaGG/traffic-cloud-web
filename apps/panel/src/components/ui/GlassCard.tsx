import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type Props = {
  children: ReactNode
  className?: string
  glow?: boolean
}

export function GlassCard({ children, className = '', glow = false }: Props): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'glass-panel relative overflow-hidden',
        glow ? 'shadow-glow' : '',
        className
      ].join(' ')}
    >
      <div
        className="pointer-events-none absolute inset-px rounded-[15px] bg-gradient-to-br from-white/[0.07] via-transparent to-transparent opacity-60"
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
