const TOKEN_KEY = 'traffic-cloud-access-token'
const ROLE_KEY = 'traffic-cloud-user-role'

function apiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (fromEnv?.trim()) return fromEnv.trim().replace(/\/$/, '')
  return 'http://127.0.0.1:8787'
}

export function getPanelAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getStoredPanelRole(): 'user' | 'admin' | null {
  try {
    const r = localStorage.getItem(ROLE_KEY)
    return r === 'admin' ? 'admin' : r === 'user' ? 'user' : null
  } catch {
    return null
  }
}

export async function resolveIsPanelAdmin(): Promise<boolean> {
  const token = getPanelAccessToken()
  if (!token) return false
  if (getStoredPanelRole() === 'admin') return true

  try {
    const res = await fetch(`${apiBase()}/v1/bootstrap`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
    })
    if (!res.ok) return false
    const data = (await res.json()) as { role?: string }
    if (data.role === 'admin') {
      try {
        localStorage.setItem(ROLE_KEY, 'admin')
      } catch {
        /* ignore */
      }
      return true
    }
    return false
  } catch {
    return false
  }
}
