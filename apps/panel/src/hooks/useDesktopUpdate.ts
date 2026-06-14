import { useCallback, useEffect, useState } from 'react'
import { openDesktopInstaller } from '@/lib/desktopAppGate'
import { checkDesktopUpdateAvailable, compareSemver } from '@/lib/desktopUpdate'
import {
  canRunInAppDesktopUpdate,
  checkInAppDesktopUpdate,
  startInAppDesktopUpdate
} from '@/lib/desktopUpdateRunner'

export type DesktopUpdateState = {
  loading: boolean
  currentVersion: string | null
  latestVersion: string | null
  downloadUrl: string | null
  notes: string | null
  updateAvailable: boolean
  inShell: boolean
  inAppUpdate: boolean
}

const INITIAL: DesktopUpdateState = {
  loading: true,
  currentVersion: null,
  latestVersion: null,
  downloadUrl: null,
  notes: null,
  updateAvailable: false,
  inShell: false,
  inAppUpdate: false
}

export function useDesktopUpdate(): DesktopUpdateState & {
  refresh: () => void
  openUpdate: () => Promise<void>
} {
  const [state, setState] = useState<DesktopUpdateState>(INITIAL)

  const refresh = useCallback(() => {
    setState((s) => ({ ...s, loading: true }))
    void (async () => {
      const base = await checkDesktopUpdateAvailable()
      let merged = base

      if (canRunInAppDesktopUpdate()) {
        const ipc = await checkInAppDesktopUpdate()
        if (ipc?.currentVersion) {
          const latestCandidates = [base.latestVersion, ipc.latestVersion].filter(
            (v): v is string => Boolean(v?.trim())
          )
          const latestVersion = latestCandidates.reduce((best, v) =>
            compareSemver(v, best) > 0 ? v : best
          , latestCandidates[0] ?? base.latestVersion ?? '')
          const updateAvailable =
            Boolean(latestVersion) &&
            compareSemver(latestVersion, ipc.currentVersion) > 0
          merged = {
            ...base,
            currentVersion: ipc.currentVersion,
            latestVersion: latestVersion || base.latestVersion,
            downloadUrl: ipc.downloadUrl ?? base.downloadUrl,
            updateAvailable,
            inShell: true
          }
        }
      }

      setState({
        loading: false,
        currentVersion: merged.currentVersion,
        latestVersion: merged.latestVersion,
        downloadUrl: merged.downloadUrl,
        notes: merged.notes,
        updateAvailable: merged.updateAvailable,
        inShell: merged.inShell,
        inAppUpdate: canRunInAppDesktopUpdate()
      })
    })().catch(() => setState({ ...INITIAL, loading: false }))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const openUpdate = useCallback(async () => {
    if (canRunInAppDesktopUpdate()) {
      await startInAppDesktopUpdate(state.downloadUrl)
      return
    }
    openDesktopInstaller(state.downloadUrl)
  }, [state.downloadUrl])

  return { ...state, refresh, openUpdate }
}
