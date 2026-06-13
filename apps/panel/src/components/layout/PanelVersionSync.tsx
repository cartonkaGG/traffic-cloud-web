import { useEffect } from 'react'
import { isTrafficCloudShell } from '@/lib/desktopAppGate'

const STORAGE_KEY = 'tc-panel-build-id'

/** У Electron після деплою Vercel — один раз перезавантажити, якщо збірка панелі змінилась. */
export function PanelVersionSync(): null {
  useEffect(() => {
    if (!isTrafficCloudShell()) return
    const buildId = import.meta.env.VITE_PANEL_BUILD_ID?.trim()
    if (!buildId || buildId === 'dev') return

    const prev = sessionStorage.getItem(STORAGE_KEY)
    sessionStorage.setItem(STORAGE_KEY, buildId)
    if (prev && prev !== buildId) {
      window.location.reload()
    }
  }, [])

  return null
}
