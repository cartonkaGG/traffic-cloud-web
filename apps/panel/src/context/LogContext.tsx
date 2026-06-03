import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import type { LiveLogEntry, LogEventKind } from '@/domain/types'

type LogContextValue = {
  entries: LiveLogEntry[]
  push: (kind: LogEventKind, message: string, meta?: LiveLogEntry['meta']) => void
  /** Полная замена (например после загрузки с API). */
  replaceEntries: (entries: LiveLogEntry[]) => void
  /** Событие с сервера с готовым id; добавляется в начало без дубликатов по id. */
  ingest: (entry: LiveLogEntry) => void
  clear: () => void
}

const LogContext = createContext<LogContextValue | null>(null)

function seedLogs(): LiveLogEntry[] {
  const now = Date.now()
  return [
    {
      id: crypto.randomUUID(),
      ts: now - 120_000,
      kind: 'system',
      message:
        'Локальный офлайн. Запустите API (папка server) — данные подтянутся автоматически.'
    }
  ]
}

export function LogProvider({ children }: { children: ReactNode }): JSX.Element {
  const [entries, setEntries] = useState<LiveLogEntry[]>(seedLogs)

  const push = useCallback((kind: LogEventKind, message: string, meta?: LiveLogEntry['meta']) => {
    setEntries((prev) => {
      const next: LiveLogEntry = {
        id: crypto.randomUUID(),
        ts: Date.now(),
        kind,
        message,
        meta
      }
      return [next, ...prev].slice(0, 500)
    })
  }, [])

  const replaceEntries = useCallback((next: LiveLogEntry[]) => {
    setEntries(next.slice(0, 500))
  }, [])

  const ingest = useCallback((entry: LiveLogEntry) => {
    setEntries((prev) => {
      if (prev.some((e) => e.id === entry.id)) return prev
      return [entry, ...prev].slice(0, 500)
    })
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  const value = useMemo(
    () => ({ entries, push, replaceEntries, ingest, clear }),
    [entries, push, replaceEntries, ingest, clear]
  )

  return <LogContext.Provider value={value}>{children}</LogContext.Provider>
}

export function useLogs(): LogContextValue {
  const ctx = useContext(LogContext)
  if (!ctx) throw new Error('useLogs must be used within LogProvider')
  return ctx
}
