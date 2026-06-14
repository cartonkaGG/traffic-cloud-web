import { motion, useReducedMotion } from 'framer-motion'
import TrafficCloudMark from '@/components/brand/TrafficCloudMark'

export function PanelLoadingScreen({ label }: { label: string }): JSX.Element {
  const reduceMotion = useReducedMotion()

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#020408] px-6">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 110% 70% at 50% 0%, rgba(34,211,238,0.2), transparent 58%), radial-gradient(ellipse 55% 45% at 100% 85%, rgba(99,102,241,0.14), transparent 55%), radial-gradient(ellipse 50% 42% at 0% 70%, rgba(217,70,239,0.12), transparent 52%), linear-gradient(180deg, #030712 0%, #050a12 50%, #030508 100%)'
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-[0.26] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_42%,black,transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[22%] h-[380px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[110px]"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.1 : 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm text-center"
      >
        <div className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-[20px] border border-white/[0.1] bg-white/[0.04] shadow-[0_20px_60px_-24px_rgba(34,211,238,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
          <TrafficCloudMark size={36} variant="auth" />
        </div>

        <h1 className="mt-7 text-[11px] font-extrabold tracking-[0.3em] text-white">
          TRAFFIC CLOUD
        </h1>
        <p className="mt-2 text-sm font-medium text-zinc-400">{label}</p>
      </motion.div>
    </div>
  )
}
