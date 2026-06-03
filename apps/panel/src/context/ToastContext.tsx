import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export type ToastKind = 'ok' | 'error' | 'info'

type ToastItem = { id: string; message: string; kind: ToastKind }

type ToastApi = {
  pushToast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
  const [items, setItems] = useState<ToastItem[]>([])

  const pushToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = crypto.randomUUID()
    setItems((prev) => [...prev, { id, message, kind }])
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 4200)
  }, [])

  const value = useMemo(() => ({ pushToast }), [pushToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex w-[min(100vw-2rem,22rem)] flex-col gap-2">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={[
                'pointer-events-auto rounded-xl border px-4 py-3 text-sm leading-snug shadow-glow backdrop-blur-md',
                t.kind === 'error'
                  ? 'border-red-400/25 bg-red-500/15 text-red-100'
                  : t.kind === 'ok'
                    ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-100'
                    : 'border-white/12 bg-black/75 text-zinc-100'
              ].join(' ')}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return { pushToast: () => {} }
  }
  return ctx
}
