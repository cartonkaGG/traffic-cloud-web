import { getApiBaseUrl } from '@/lib/settings'

export type DesktopGateResult =
  | { ok: true }
  | { ok: false; reason: 'no_desktop' | 'user_declined'; downloadUrl?: string | null }

export function hasTrafficCloudDesktop(): boolean {
  return Boolean(window.trafficCloud?.openBrowserProfile)
}

export async function fetchDesktopDownloadUrl(): Promise<string | null> {
  const fallback = import.meta.env.VITE_DESKTOP_DOWNLOAD_URL?.trim() || null

  try {
    const apiBase = getApiBaseUrl()
    const res = await fetch(`${apiBase}/v1/desktop/update-manifest`)
    if (!res.ok) return fallback
    const data = (await res.json()) as { downloadUrl?: string | null }
    return data.downloadUrl?.trim() || fallback
  } catch {
    return fallback
  }
}
