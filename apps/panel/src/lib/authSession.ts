const TOKEN_KEY = 'traffic-cloud-access-token'
const EMAIL_KEY = 'traffic-cloud-user-email'
const ROLE_KEY = 'traffic-cloud-user-role'

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAccessSession(token: string, email: string, role?: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(EMAIL_KEY, email)
    if (role) localStorage.setItem(ROLE_KEY, role)
  } catch {
    /* ignore */
  }
}

export function clearAccessSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    localStorage.removeItem(ROLE_KEY)
  } catch {
    /* ignore */
  }
}

export function getStoredRole(): 'user' | 'admin' | null {
  try {
    const r = localStorage.getItem(ROLE_KEY)
    return r === 'admin' ? 'admin' : r === 'user' ? 'user' : null
  } catch {
    return null
  }
}

export function setStoredRole(role: 'user' | 'admin'): void {
  try {
    localStorage.setItem(ROLE_KEY, role)
  } catch {
    /* ignore */
  }
}

export function getStoredEmail(): string | null {
  try {
    return localStorage.getItem(EMAIL_KEY)
  } catch {
    return null
  }
}
