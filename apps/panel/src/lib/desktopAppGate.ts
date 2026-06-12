import { getApiBaseUrl } from '@/lib/settings'

export type DesktopGateResult =
  | { ok: true }
  | { ok: false; reason: 'no_desktop' | 'user_declined'; downloadUrl?: string | null }

/** Продакшен-панель (Vercel), якщо потрібен статичний fallback поза браузером. */
export const DEFAULT_PANEL_ORIGIN = 'https://traffic-cloud-web.vercel.app'

export const DESKTOP_SUPPORT_TELEGRAM_URL = 'https://t.me/trafficcloud_team'

export function hasTrafficCloudDesktop(): boolean {
  return Boolean(window.trafficCloud?.openBrowserProfile)
}

export function getPanelBaseUrl(): string {
  const base = import.meta.env.BASE_URL || '/app/'
  if (typeof window === 'undefined') {
    const fromEnv = import.meta.env.VITE_MARKETING_HOME_URL?.trim()
    return fromEnv ? fromEnv.replace(/\/$/, '') + '/app' : `${DEFAULT_PANEL_ORIGIN}/app`
  }
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

/** Пряме посилання на .exe — лише з API manifest або VITE_DESKTOP_DOWNLOAD_URL. */
export function resolveDesktopDownloadUrl(fetched: string | null | undefined): string | null {
  const fromEnv = import.meta.env.VITE_DESKTOP_DOWNLOAD_URL?.trim()
  const fromApi = fetched?.trim()
  return fromApi || fromEnv || null
}

export async function fetchDesktopDownloadUrl(): Promise<string | null> {
  try {
    const apiBase = getApiBaseUrl()
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12_000)
    const res = await fetch(`${apiBase}/v1/desktop/update-manifest`, {
      signal: controller.signal
    })
    window.clearTimeout(timeout)
    if (!res.ok) return resolveDesktopDownloadUrl(null)
    const data = (await res.json()) as { downloadUrl?: string | null; configured?: boolean }
    if (data.configured === false && !data.downloadUrl) {
      return resolveDesktopDownloadUrl(null)
    }
    return resolveDesktopDownloadUrl(data.downloadUrl)
  } catch {
    return resolveDesktopDownloadUrl(null)
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
