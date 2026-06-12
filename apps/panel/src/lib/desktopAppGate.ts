import { getApiBaseUrl } from '@/lib/settings'

export type DesktopGateResult =
  | { ok: true }
  | { ok: false; reason: 'no_desktop' | 'user_declined'; downloadUrl?: string | null }

/** Сторінка з інструкцією / посиланням на інсталятор, якщо API ще не віддає downloadUrl. */
export const FALLBACK_DESKTOP_DOWNLOAD_URL = 'https://traffic-cloud.app/'

export function hasTrafficCloudDesktop(): boolean {
  return Boolean(window.trafficCloud?.openBrowserProfile)
}

export function getPanelBaseUrl(): string {
  const base = import.meta.env.BASE_URL || '/app/'
  if (typeof window === 'undefined') return base
  const origin = window.location.origin
  if (base.startsWith('http')) {
    try {
      return new URL(base).href.replace(/\/$/, '')
    } catch {
      return `${origin}${base}`.replace(/\/$/, '')
    }
  }
  return `${origin}${base}`.replace(/\/$/, '')
}

export function resolveDesktopDownloadUrl(fetched: string | null | undefined): string {
  const fromEnv = import.meta.env.VITE_DESKTOP_DOWNLOAD_URL?.trim()
  return fetched?.trim() || fromEnv || FALLBACK_DESKTOP_DOWNLOAD_URL
}

export async function fetchDesktopDownloadUrl(): Promise<string> {
  const fallback = resolveDesktopDownloadUrl(null)

  try {
    const apiBase = getApiBaseUrl()
    const res = await fetch(`${apiBase}/v1/desktop/update-manifest`)
    if (!res.ok) return fallback
    const data = (await res.json()) as { downloadUrl?: string | null }
    return resolveDesktopDownloadUrl(data.downloadUrl)
  } catch {
    return fallback
  }
}

/** Відкриває встановлений Traffic Cloud (custom protocol). Працює лише після реєстрації протоколу в інсталяторі. */
export function launchTrafficCloudDesktop(panelPath: 'tiktok' | 'hub' = 'tiktok'): void {
  const targetUrl = `${getPanelBaseUrl()}/${panelPath === 'hub' ? 'hub' : 'tiktok'}`
  const deepLink = `trafficcloud://panel/${panelPath}?url=${encodeURIComponent(targetUrl)}`

  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = deepLink
  document.body.appendChild(iframe)

  const link = document.createElement('a')
  link.href = deepLink
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()

  window.setTimeout(() => {
    iframe.remove()
    link.remove()
  }, 2500)
}
