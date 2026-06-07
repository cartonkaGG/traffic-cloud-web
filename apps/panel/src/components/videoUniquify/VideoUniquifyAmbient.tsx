import { motion } from 'framer-motion'

export function VideoUniquifyAmbient(): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="vu-aurora absolute inset-0" />
      <div className="vu-glow vu-glow--cyan" />
      <div className="vu-glow vu-glow--violet hidden md:block" />
      <motion.div
        className="absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-accent/10 blur-[100px]"
        animate={{ opacity: [0.15, 0.28, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
