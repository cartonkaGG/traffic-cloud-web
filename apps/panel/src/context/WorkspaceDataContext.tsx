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
import type { ChatSourceModel, LiveLogEntry } from '@/domain/types'
import type { WorkspaceBundle } from '@/lib/api'
import {
  apiBootstrap,
  apiFetchBundle,
  wsUrlFromHttpBase,
  type BillingPlanInfo,
  type SubscriptionInfo,
  type UserRole,
} from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { getApiBaseUrl } from '@/lib/settings'
import { useLogs } from '@/context/LogContext'
export type ApiConnectionStatus = 'idle' | 'loading' | 'online' | 'offline'

export type ParseProgressEntry = { percent: number; phase?: string }

type WorkspaceDataValue = {
  status: ApiConnectionStatus
  error: string | null
  workspaceId: string | null
  workspaceName: string | null
  bundle: WorkspaceBundle | null
  role: UserRole
  subscription: SubscriptionInfo | null
  billingPlan: BillingPlanInfo | null
  refetch: () => Promise<void>
  /** Додати/оновити джерела в bundle одразу після create (до refetch). */
  upsertChatSources: (sources: ChatSourceModel[]) => void
  apiBaseUrl: string
  /** Прогрес парсингу джерела за id (оновлюється по WebSocket). */
  parseProgressBySourceId: Record<string, ParseProgressEntry>
}

const WorkspaceDataContext = createContext<WorkspaceDataValue | null>(null)

/** Не даємо старому refetch затерти новіші джерела після create. */
function mergeWorkspaceBundle(
  prev: WorkspaceBundle | null,
  next: WorkspaceBundle
): WorkspaceBundle {
  if (!prev?.chatSources?.length) return next
  const byId = new Map(next.chatSources.map((s) => [s.id, s]))
  for (const s of prev.chatSources) {
    if (!byId.has(s.id)) byId.set(s.id, s)
  }
  return { ...next, chatSources: Array.from(byId.values()) }
}

export function WorkspaceDataProvider({ children }: { children: ReactNode }): JSX.Element {
  const { replaceEntries, ingest } = useLogs()
  const { isAuthenticated, setRole } = useAuth()
  const [status, setStatus] = useState<ApiConnectionStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [workspaceName, setWorkspaceName] = useState<string | null>(null)
  const [bundle, setBundle] = useState<WorkspaceBundle | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [billingPlan, setBillingPlan] = useState<BillingPlanInfo | null>(null)
  const [role, setRoleState] = useState<UserRole>('user')
  const [parseProgressBySourceId, setParseProgressBySourceId] = useState<
    Record<string, ParseProgressEntry>
  >({})
  const [apiBaseUrl, setApiBaseUrl] = useState(() => getApiBaseUrl())
  const wsRef = useRef<WebSocket | null>(null)
  const widRef = useRef<string | null>(null)
  const loadGenerationRef = useRef(0)

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

  const load = useCallback(async (options?: { background?: boolean }) => {
    const base = getApiBaseUrl()
    setApiBaseUrl(base)
    const background = options?.background ?? false
    const generation = ++loadGenerationRef.current
    if (!background) {
      setStatus('loading')
      setError(null)
    }
    try {
      const boot = await apiBootstrap()
      if (generation !== loadGenerationRef.current) return
      setWorkspaceId(boot.workspaceId)
      setWorkspaceName(boot.workspaceName)
      if (boot.role) {
        setRoleState(boot.role)
        setRole(boot.role)
      }
      setSubscription(boot.subscription ?? null)
      setBillingPlan(boot.billingPlan ?? null)
      const b = await apiFetchBundle(boot.workspaceId)
      if (generation !== loadGenerationRef.current) return
      setBundle((prev) => mergeWorkspaceBundle(prev, b))
      replaceEntries(b.logs)
      setStatus('online')
      connectWs(boot.workspaceId, base)
    } catch (e) {
      if (generation !== loadGenerationRef.current) return
      if (!background) {
        setStatus('offline')
        setWorkspaceId(null)
        setWorkspaceName(null)
        setBundle(null)
        setSubscription(null)
        setBillingPlan(null)
        setRoleState('user')
        setParseProgressBySourceId({})
        wsRef.current?.close()
        wsRef.current = null
        widRef.current = null
      }
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [connectWs, replaceEntries, setRole])

  const refetch = useCallback(async () => {
    await load({ background: true })
  }, [load])

  const upsertChatSources = useCallback((sources: ChatSourceModel[]) => {
    if (!sources.length) return
    setBundle((prev) => {
      if (!prev) return prev
      const byId = new Map(prev.chatSources.map((s) => [s.id, s]))
      for (const s of sources) byId.set(s.id, s)
      return { ...prev, chatSources: Array.from(byId.values()) }
    })
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus('idle')
      setError(null)
      setWorkspaceId(null)
      setWorkspaceName(null)
      setBundle(null)
      setSubscription(null)
      setBillingPlan(null)
      setRoleState('user')
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
      role,
      subscription,
      billingPlan,
      refetch,
      upsertChatSources,
      apiBaseUrl,
      parseProgressBySourceId
    }),
    [
      status,
      error,
      workspaceId,
      workspaceName,
      bundle,
      role,
      subscription,
      billingPlan,
      refetch,
      upsertChatSources,
      apiBaseUrl,
      parseProgressBySourceId
    ]
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
