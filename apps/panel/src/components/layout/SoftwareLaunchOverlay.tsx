import { type CSSProperties } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { SoftwareProduct } from '@/domain/softwareProducts'
import { useSoftware } from '@/context/SoftwareContext'

export function SoftwareLaunchOverlay(): JSX.Element {
  const { launchingProduct } = useSoftware()
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {launchingProduct ? (
        <LaunchScene product={launchingProduct} reduceMotion={reduceMotion} />
      ) : null}
    </AnimatePresence>
  )
}

function LaunchScene({
  product,
  reduceMotion
}: {
  product: SoftwareProduct
  reduceMotion: boolean | null
}): JSX.Element {
  const Icon = product.icon

  return (
    <motion.div
      key={product.id}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="polite"
      aria-label={`Відкриваємо ${product.name}`}
    >
      <div className="absolute inset-0 bg-[#020408]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 50% 20%, rgba(34,211,238,0.22), transparent 58%), radial-gradient(ellipse 70% 55% at 85% 75%, rgba(99,102,241,0.16), transparent 55%), radial-gradient(ellipse 60% 50% at 10% 80%, rgba(217,70,239,0.14), transparent 52%), linear-gradient(165deg, #030712 0%, #060b14 42%, #04060c 100%)'
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-[0.28] [mask-image:radial-gradient(ellipse_85%_75%_at_50%_45%,black,transparent)]"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[18%] h-[420px] w-[620px] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: product.glow }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 0.55, scale: 1 }}
        exit={{ opacity: 0, scale: 1.08 }}
        transition={{ duration: reduceMotion ? 0.15 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />

      <motion.div
        className="relative z-10 flex w-full max-w-[300px] flex-col items-center px-6 text-center"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : -10, scale: 0.98 }}
        transition={{ duration: reduceMotion ? 0.12 : 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="relative flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-[22px] border border-white/[0.12] bg-white/[0.04] shadow-[0_24px_80px_-28px_var(--launch-glow),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl"
          style={{ '--launch-glow': product.glow } as CSSProperties}
          initial={{ scale: reduceMotion ? 1 : 0.88 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${product.accent}`} aria-hidden />
          <Icon className="relative z-10 h-8 w-8 text-white/95" strokeWidth={1.6} />
        </motion.div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
          Traffic Cloud
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">{product.name}</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{product.shortName}</p>

        <motion.div
          className="mt-8 h-[2px] w-24 overflow-hidden rounded-full bg-white/[0.08]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400/80 via-white/70 to-fuchsia-400/70"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={
              reduceMotion ? { duration: 0.2 } : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
            }
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
