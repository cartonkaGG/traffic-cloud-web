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
import { useLocation } from 'react-router-dom'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import { useToast } from '@/context/ToastContext'
import { useLogs } from '@/context/LogContext'
import { apiInboxDialogs, type InboxDialogRow } from '@/lib/api'

const POLL_MS = 50_000
const SUPPRESS_MS = 12_000
const SNAP_STORAGE_PREFIX = 'tc-inbox-snap:'

type DialogSnap = {
  lastMessageAt: string | null
  unreadCount: number
  lastMessage: string | null
  peerKind?: InboxDialogRow['peerKind']
}

function isUserDialog(d: Pick<InboxDialogRow, 'peerKind'>): boolean {
  return d.peerKind === 'user'
}

function unreadFromSnap(snap: SnapStore): number {
  let total = 0
  for (const [key, s] of Object.entries(snap)) {
    const peerKey = key.includes('::') ? key.split('::').slice(1).join('::') : key
    const kind =
      s.peerKind ??
      (peerKey.startsWith('user:') ? 'user' : peerKey.startsWith('chat:') || peerKey.startsWith('channel:') ? 'chat' : null)
    if (kind === 'user') total += s.unreadCount ?? 0
  }
  return total
}

type SnapStore = Record<string, DialogSnap>

function snapKey(accountId: string, peerKey: string): string {
  return `${accountId}::${peerKey}`
}

function loadSnap(workspaceId: string): SnapStore | null {
  try {
    const raw = sessionStorage.getItem(`${SNAP_STORAGE_PREFIX}${workspaceId}`)
    if (!raw) return null
    return JSON.parse(raw) as SnapStore
  } catch {
    return null
  }
}

function saveSnap(workspaceId: string, snap: SnapStore): void {
  try {
    sessionStorage.setItem(`${SNAP_STORAGE_PREFIX}${workspaceId}`, JSON.stringify(snap))
  } catch {
    /* ignore */
  }
}

function isNewIncoming(prev: DialogSnap | undefined, next: InboxDialogRow): boolean {
  if (!prev) return false
  if (next.unreadCount > prev.unreadCount) return true
  if (!next.lastMessageAt) return false
  const nextTs = new Date(next.lastMessageAt).getTime()
  const prevTs = prev.lastMessageAt ? new Date(prev.lastMessageAt).getTime() : 0
  if (nextTs > prevTs && next.lastMessage !== prev.lastMessage) return true
  return false
}

function previewText(text: string | null): string {
  const t = (text ?? '').trim()
  if (!t) return 'Нове повідомлення'
  return t.length > 120 ? `${t.slice(0, 117)}…` : t
}

function accountDisplayName(account: { label: string; username?: string | null }): string {
  const u = account.username?.trim()
  return u ? `${account.label} (@${u.replace(/^@/, '')})` : account.label
}

type InboxNotifyApi = {
  unreadTotal: number
  setInboxFocus: (accountId: string | null, peerKey: string | null) => void
  suppressPeerBriefly: (accountId: string, peerKey: string) => void
  refreshNow: () => void
}

const InboxNotifyContext = createContext<InboxNotifyApi | null>(null)

export function InboxNotifyProvider({ children }: { children: ReactNode }): JSX.Element {
  const { bundle, workspaceId, status } = useWorkspaceData()
  const { pushToast } = useToast()
  const { push: pushLog } = useLogs()
  const { pathname } = useLocation()

  const [unreadTotal, setUnreadTotal] = useState(0)

  const snapRef = useRef<SnapStore>({})
  const seededRef = useRef(false)
  const focusRef = useRef<{ accountId: string; peerKey: string } | null>(null)
  const suppressUntilRef = useRef<Map<string, number>>(new Map())
  const pollingRef = useRef(false)

  const sessionAccounts = useMemo(
    () => (bundle?.telegramAccounts ?? []).filter((a) => a.hasMtprotoSession === true),
    [bundle?.telegramAccounts]
  )

  const setInboxFocus = useCallback((accountId: string | null, peerKey: string | null) => {
    if (accountId && peerKey) {
      focusRef.current = { accountId, peerKey }
    } else {
      focusRef.current = null
    }
  }, [])

  const suppressPeerBriefly = useCallback((accountId: string, peerKey: string) => {
    suppressUntilRef.current.set(snapKey(accountId, peerKey), Date.now() + SUPPRESS_MS)
  }, [])

  const shouldNotify = useCallback((accountId: string, peerKey: string): boolean => {
    const f = focusRef.current
    if (pathname === '/inbox' && f?.accountId === accountId && f?.peerKey === peerKey) {
      return false
    }
    const until = suppressUntilRef.current.get(snapKey(accountId, peerKey))
    if (until && Date.now() < until) return false
    return true
  }, [pathname])

  const showBrowserNotification = useCallback(
    (title: string, body: string, accountId: string, peerKey: string) => {
      if (typeof window === 'undefined' || !('Notification' in window)) return
      if (Notification.permission !== 'granted') return
      if (!document.hidden) return
      try {
        const n = new Notification(title, { body, tag: snapKey(accountId, peerKey) })
        n.onclick = () => {
          window.focus()
          const base = import.meta.env.BASE_URL.replace(/\/$/, '') || '/app'
          const url = `${window.location.origin}${base}/inbox?account=${encodeURIComponent(accountId)}&peer=${encodeURIComponent(peerKey)}`
          window.location.href = url
          n.close()
        }
      } catch {
        /* ignore */
      }
    },
    []
  )

  const pollInbox = useCallback(async () => {
    if (!workspaceId || status !== 'online' || sessionAccounts.length === 0) return
    if (pollingRef.current) return
    pollingRef.current = true
    try {
      if (!seededRef.current) {
        const stored = loadSnap(workspaceId)
        if (stored) {
          snapRef.current = stored
          seededRef.current = true
        }
      }

      let totalUnread = 0
      const nextSnap: SnapStore = { ...snapRef.current }
      const isSeedPass = !seededRef.current

      for (const account of sessionAccounts) {
        try {
          const r = await apiInboxDialogs(workspaceId, account.id)
          for (const d of r.dialogs) {
            const key = snapKey(account.id, d.peerKey)
            if (isUserDialog(d)) totalUnread += d.unreadCount
            const prev = snapRef.current[key]

            if (
              isUserDialog(d) &&
              !isSeedPass &&
              isNewIncoming(prev, d) &&
              shouldNotify(account.id, d.peerKey)
            ) {
              const title = d.title || 'Нове повідомлення'
              const preview = previewText(d.lastMessage)
              const accName = accountDisplayName(account)
              const toastMsg = `${accName} · ${title}: ${preview}`
              pushToast(toastMsg, 'info')
              pushLog('inbox_message', toastMsg, {
                accountId: account.id,
                accountLabel: accName,
                peerKey: d.peerKey
              })
              showBrowserNotification(
                `📩 ${accName}`,
                `${title}: ${preview}`,
                account.id,
                d.peerKey
              )
            }

            nextSnap[key] = {
              lastMessageAt: d.lastMessageAt,
              unreadCount: d.unreadCount,
              lastMessage: d.lastMessage,
              peerKind: d.peerKind
            }
          }
        } catch {
          /* skip account on poll error */
        }
      }

      snapRef.current = nextSnap
      saveSnap(workspaceId, nextSnap)
      seededRef.current = true
      setUnreadTotal(totalUnread)
    } finally {
      pollingRef.current = false
    }
  }, [
    workspaceId,
    status,
    sessionAccounts,
    shouldNotify,
    pushToast,
    pushLog,
    showBrowserNotification
  ])

  const refreshNow = useCallback(() => {
    void pollInbox()
  }, [pollInbox])

  useEffect(() => {
    if (!workspaceId || status !== 'online' || sessionAccounts.length === 0) {
      setUnreadTotal(0)
      return
    }
    const stored = loadSnap(workspaceId)
    if (stored) {
      snapRef.current = stored
      seededRef.current = true
      setUnreadTotal(unreadFromSnap(stored))
    } else {
      seededRef.current = false
    }
    void pollInbox()
    const id = window.setInterval(() => void pollInbox(), POLL_MS)
    return () => window.clearInterval(id)
  }, [workspaceId, status, sessionAccounts.length, pollInbox])

  const value = useMemo(
    () => ({ unreadTotal, setInboxFocus, suppressPeerBriefly, refreshNow }),
    [unreadTotal, setInboxFocus, suppressPeerBriefly, refreshNow]
  )

  return <InboxNotifyContext.Provider value={value}>{children}</InboxNotifyContext.Provider>
}

export function useInboxNotify(): InboxNotifyApi {
  const ctx = useContext(InboxNotifyContext)
  if (!ctx) {
    return {
      unreadTotal: 0,
      setInboxFocus: () => {},
      suppressPeerBriefly: () => {},
      refreshNow: () => {}
    }
  }
  return ctx
}
