import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import TrafficCloudMark from '@/components/brand/TrafficCloudMark'

const STATUS_LINES = [
  'Підключення до панелі…',
  'Синхронізація даних…',
  'Підготовка робочого простору…'
]

export function PanelLoadingScreen({ label }: { label: string }): JSX.Element {
  const [lineIdx, setLineIdx] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setLineIdx((i) => (i + 1) % STATUS_LINES.length)
    }, 2400)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#030712] px-6">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 50% -5%, rgba(34,211,238,0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 80%, rgba(217,70,239,0.08), transparent 60%)'
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-[0.22] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm text-center"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/[0.1] bg-white/[0.03] shadow-[0_0_70px_-20px_rgba(34,211,238,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]"
        >
          <TrafficCloudMark size={52} variant="auth" />
        </motion.div>

        <h1 className="mt-8 text-[13px] font-extrabold tracking-[0.28em] text-white">
          TRAFFIC CLOUD
        </h1>
        <p className="mt-2 text-sm font-medium text-zinc-400">{label}</p>

        <div className="mt-10">
          <div className="mx-auto h-1 max-w-[260px] overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400"
              style={{ backgroundSize: '200% 100%' }}
              initial={{ width: '8%' }}
              animate={{
                width: ['8%', '55%', '78%', '62%', '88%'],
                backgroundPosition: ['100% 0%', '0% 0%', '100% 0%']
              }}
              transition={{
                width: { duration: 3.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' },
                backgroundPosition: { duration: 1.6, repeat: Infinity, ease: 'linear' }
              }}
            />
          </div>
          <motion.p
            key={lineIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-[12px] text-zinc-500"
          >
            {STATUS_LINES[lineIdx]}
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
