import { useEffect, useState } from 'react'
import {
  clearPanelSession,
  getPanelAccessToken,
  getStoredPanelEmail,
  getStoredPanelRole
} from './panelAuth'

export type PanelSession = {
  isLoggedIn: boolean
  email: string | null
  role: 'user' | 'admin' | null
  ready: boolean
}

function readSession(): Omit<PanelSession, 'ready'> {
  const token = getPanelAccessToken()
  if (!token) {
    return { isLoggedIn: false, email: null, role: null }
  }
  return {
    isLoggedIn: true,
    email: getStoredPanelEmail(),
    role: getStoredPanelRole()
  }
}

/** Швидка перевірка сесії з localStorage без мережевих запитів. */
export function usePanelSession(): PanelSession {
  const [session, setSession] = useState<PanelSession>(() => ({
    ...readSession(),
    ready: true
  }))

  useEffect(() => {
    const sync = (): void => {
      setSession({ ...readSession(), ready: true })
    }
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  return session
}

export function logoutFromSite(): void {
  clearPanelSession()
  window.dispatchEvent(new Event('storage'))
}
