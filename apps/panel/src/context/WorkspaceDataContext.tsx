import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import type { LiveLogEntry } from '@/domain/types'
import {
  apiBootstrap,
  apiFetchBundle,
  wsUrlFromHttpBase,
  type WorkspaceBundle
} from '@/lib/api'
import { getApiBaseUrl } from '@/lib/settings'
import { useLogs } from '@/context/LogContext'
import { useAuth } from '@/context/AuthContext'

export type ApiConnectionStatus = 'idle' | 'loading' | 'online' | 'offline'

export type ParseProgressEntry = { percent: number; phase?: string }

type WorkspaceDataValue = {
  status: ApiConnectionStatus
  error: string | null
  workspaceId: string | null
  workspaceName: string | null
  bundle: WorkspaceBundle | null
  refetch: () => Promise<void>
  apiBaseUrl: string
  /** Прогрес парсингу джерела за id (оновлюється по WebSocket). */
  parseProgressBySourceId: Record<string, ParseProgressEntry>
}

const WorkspaceDataContext = createContext<WorkspaceDataValue | null>(null)

export function WorkspaceDataProvider({ children }: { children: ReactNode }): JSX.Element {
  const { replaceEntries, ingest } = useLogs()
  const { isAuthenticated } = useAuth()
  const [status, setStatus] = useState<ApiConnectionStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [workspaceName, setWorkspaceName] = useState<string | null>(null)
  const [bundle, setBundle] = useState<WorkspaceBundle | null>(null)
  const [parseProgressBySourceId, setParseProgressBySourceId] = useState<
    Record<string, ParseProgressEntry>
  >({})
  const [apiBaseUrl, setApiBaseUrl] = useState(() => getApiBaseUrl())
  const wsRef = useRef<WebSocket | null>(null)
  const widRef = useRef<string | null>(null)

  const connectWs = useCallback(
    (wid: string, base: string) => {
      wsRef.current?.close()
      const url = wsUrlFromHttpBase(base)
      const ws = new WebSocket(url)
      wsRef.current = ws
      widRef.current = wid
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data as string) as {
            type?: string
            workspaceId?: string
            payload?: unknown
          }
          if (data.type === 'log' && data.payload && data.workspaceId === widRef.current) {
            ingest(data.payload as LiveLogEntry)
            return
          }
          if (data.type === 'parse_progress' && data.workspaceId === widRef.current) {
            const p = data.payload as { sourceId?: string; percent?: number; phase?: string }
            if (!p.sourceId || typeof p.percent !== 'number') return
            if (p.phase === 'failed') {
              setParseProgressBySourceId((prev) => {
                const { [p.sourceId!]: _, ...rest } = prev
                return rest
              })
              return
            }
            setParseProgressBySourceId((prev) => {
              const next: Record<string, ParseProgressEntry> = {
                ...prev,
                [p.sourceId!]: { percent: p.percent, phase: p.phase }
              }
              if (p.percent >= 100) {
                const { [p.sourceId!]: __, ...rest } = next
                return rest
              }
              return next
            })
          }
        } catch {
          /* ignore */
        }
      }
    },
    [ingest]
  )

  const load = useCallback(async () => {
    const base = getApiBaseUrl()
    setApiBaseUrl(base)
    setStatus('loading')
    setError(null)
    try {
      const boot = await apiBootstrap()
      setWorkspaceId(boot.workspaceId)
      setWorkspaceName(boot.workspaceName)
      const b = await apiFetchBundle(boot.workspaceId)
      setBundle(b)
      replaceEntries(b.logs)
      setStatus('online')
      connectWs(boot.workspaceId, base)
    } catch (e) {
      setStatus('offline')
      setError(e instanceof Error ? e.message : String(e))
      setWorkspaceId(null)
      setWorkspaceName(null)
      setBundle(null)
      setParseProgressBySourceId({})
      wsRef.current?.close()
      wsRef.current = null
      widRef.current = null
    }
  }, [connectWs, replaceEntries])

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus('idle')
      setError(null)
      setWorkspaceId(null)
      setWorkspaceName(null)
      setBundle(null)
      setParseProgressBySourceId({})
      wsRef.current?.close()
      wsRef.current = null
      widRef.current = null
      return
    }
    void load()
  }, [isAuthenticated, load])

  useEffect(() => {
    return () => {
      wsRef.current?.close()
    }
  }, [])

  const value = useMemo(
    () => ({
      status,
      error,
      workspaceId,
      workspaceName,
      bundle,
      refetch: load,
      apiBaseUrl,
      parseProgressBySourceId
    }),
    [status, error, workspaceId, workspaceName, bundle, load, apiBaseUrl, parseProgressBySourceId]
  )

  return (
    <WorkspaceDataContext.Provider value={value}>{children}</WorkspaceDataContext.Provider>
  )
}

export function useWorkspaceData(): WorkspaceDataValue {
  const ctx = useContext(WorkspaceDataContext)
  if (!ctx) throw new Error('useWorkspaceData must be used within WorkspaceDataProvider')
  return ctx
}
