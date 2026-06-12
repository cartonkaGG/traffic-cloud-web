import { openDesktopInstaller } from '@/lib/desktopAppGate'
import type { DesktopUpdateProgress } from '@/lib/desktopUpdate'

export function canRunInAppDesktopUpdate(): boolean {
  return Boolean(window.trafficCloud?.startDesktopUpdate)
}

export async function checkInAppDesktopUpdate(): Promise<DesktopUpdateProgress | null> {
  const tc = window.trafficCloud
  if (!tc?.checkDesktopUpdate) return null
  try {
    return await tc.checkDesktopUpdate()
  } catch {
    return null
  }
}

export async function startInAppDesktopUpdate(
  fallbackDownloadUrl?: string | null
): Promise<{ ok: true; mode: 'in_app' } | { ok: false; error: string; mode: 'fallback' | 'failed' }> {
  const tc = window.trafficCloud
  if (tc?.startDesktopUpdate) {
    try {
      const r = await tc.startDesktopUpdate()
      if (r.ok) return { ok: true, mode: 'in_app' }
      if (r.error === 'already_latest' || r.error === 'dev_mode') {
        return { ok: false, error: r.error, mode: 'failed' }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      return { ok: false, error: msg, mode: 'failed' }
    }
  }

  openDesktopInstaller(fallbackDownloadUrl)
  return { ok: false, error: 'fallback_download', mode: 'fallback' }
}

export function subscribeDesktopUpdateProgress(
  callback: (payload: DesktopUpdateProgress) => void
): (() => void) | undefined {
  const tc = window.trafficCloud
  if (!tc?.onDesktopUpdateProgress) return undefined
  return tc.onDesktopUpdateProgress(callback)
}
