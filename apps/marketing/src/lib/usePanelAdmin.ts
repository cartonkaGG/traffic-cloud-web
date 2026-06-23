import { useEffect, useState } from 'react'
import { getPanelAccessToken, getStoredPanelRole, resolveIsPanelAdmin } from './panelAuth'

export function usePanelAdmin(): { isAdmin: boolean; ready: boolean } {
  const [isAdmin, setIsAdmin] = useState(() => getStoredPanelRole() === 'admin')
  const [ready, setReady] = useState(() => !getPanelAccessToken() || getStoredPanelRole() === 'admin')

  useEffect(() => {
    let cancelled = false
    const token = getPanelAccessToken()
    if (!token) {
      setIsAdmin(false)
      setReady(true)
      return
    }
    if (getStoredPanelRole() === 'admin') {
      setIsAdmin(true)
      setReady(true)
      return
    }
    const check = async (): Promise<void> => {
      const admin = await resolveIsPanelAdmin()
      if (!cancelled) {
        setIsAdmin(admin)
        setReady(true)
      }
    }
    void check()
    const onStorage = (): void => {
      void resolveIsPanelAdmin().then((admin) => {
        if (!cancelled) setIsAdmin(admin)
      })
    }
    window.addEventListener('storage', onStorage)
    return () => {
      cancelled = true
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return { isAdmin, ready }
}
