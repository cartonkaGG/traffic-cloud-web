import { motion } from 'framer-motion'
import TrafficCloudMark from '@/components/brand/TrafficCloudMark'

export function PanelLoadingScreen({ label }: { label: string }): JSX.Element {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#030712] px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(34,211,238,0.12), transparent 60%), linear-gradient(180deg, #030712 0%, #060a12 100%)'
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative flex flex-col items-center gap-5"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[0_0_40px_-12px_rgba(34,211,238,0.45)]">
          <TrafficCloudMark size={36} variant="logo" />
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-zinc-300">{label}</div>
          <div className="mt-3 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-accent/80"
                animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
