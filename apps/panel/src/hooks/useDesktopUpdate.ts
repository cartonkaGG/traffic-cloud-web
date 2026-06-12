import { useCallback, useEffect, useState } from 'react'
import { openDesktopInstaller } from '@/lib/desktopAppGate'
import { checkDesktopUpdateAvailable } from '@/lib/desktopUpdate'

export type DesktopUpdateState = {
  loading: boolean
  currentVersion: string | null
  latestVersion: string | null
  downloadUrl: string | null
  notes: string | null
  updateAvailable: boolean
  inShell: boolean
}

const INITIAL: DesktopUpdateState = {
  loading: true,
  currentVersion: null,
  latestVersion: null,
  downloadUrl: null,
  notes: null,
  updateAvailable: false,
  inShell: false
}

export function useDesktopUpdate(): DesktopUpdateState & {
  refresh: () => void
  openUpdate: () => void
} {
  const [state, setState] = useState<DesktopUpdateState>(INITIAL)

  const refresh = useCallback(() => {
    setState((s) => ({ ...s, loading: true }))
    void checkDesktopUpdateAvailable()
      .then((r) => {
        setState({
          loading: false,
          currentVersion: r.currentVersion,
          latestVersion: r.latestVersion,
          downloadUrl: r.downloadUrl,
          notes: r.notes,
          updateAvailable: r.updateAvailable,
          inShell: r.inShell
        })
      })
      .catch(() => setState({ ...INITIAL, loading: false }))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const openUpdate = useCallback(() => {
    openDesktopInstaller(state.downloadUrl)
  }, [state.downloadUrl])

  return { ...state, refresh, openUpdate }
}
