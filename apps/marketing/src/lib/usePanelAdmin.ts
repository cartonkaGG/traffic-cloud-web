import { useEffect, useState } from 'react'
import { resolveIsPanelAdmin } from './panelAuth'

export function usePanelAdmin(): { isAdmin: boolean; ready: boolean } {
  const [isAdmin, setIsAdmin] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
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
