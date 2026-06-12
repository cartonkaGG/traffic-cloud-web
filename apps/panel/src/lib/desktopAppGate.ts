import { getApiBaseUrl } from '@/lib/settings'

export type DesktopGateResult =
  | { ok: true }
  | { ok: false; reason: 'no_desktop' | 'user_declined'; downloadUrl?: string | null }

/** Продакшен-панель (Vercel), якщо потрібен статичний fallback поза браузером. */
export const DEFAULT_PANEL_ORIGIN = 'https://traffic-cloud-web.vercel.app'

export const BUNDLED_INSTALLER_FILENAME = 'Traffic-Cloud-Setup-0.2.5.exe'

export const DESKTOP_SUPPORT_TELEGRAM_URL = 'https://t.me/trafficcloud_team'

const DESKTOP_UA_RE = /\bTrafficCloudDesktop\/[\d.]+/

/** Вікно Traffic Cloud (Electron), навіть якщо preload ще не підключився. */
export function isTrafficCloudShell(): boolean {
  const tc = window.trafficCloud
  if (tc?.platform || tc?.getAppVersion || tc?.openBrowserProfile) return true
  return DESKTOP_UA_RE.test(navigator.userAgent)
}

/** Є IPC-міст для антидетект-браузера TikTok / Telegram. */
export function canOpenAntidetectBrowser(): boolean {
  return Boolean(window.trafficCloud?.openBrowserProfile)
}

/** @deprecated Використовуйте isTrafficCloudShell / canOpenAntidetectBrowser */
export function hasTrafficCloudDesktop(): boolean {
  return isTrafficCloudShell()
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

export function getBundledInstallerUrl(): string {
  const path = `/downloads/${BUNDLED_INSTALLER_FILENAME}`
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`
  }
  return `${DEFAULT_PANEL_ORIGIN}${path}`
}

/** API manifest → env override → інсталятор з /downloads на цьому ж сайті. */
export function resolveDesktopDownloadUrl(fetched: string | null | undefined): string {
  const fromEnv = import.meta.env.VITE_DESKTOP_DOWNLOAD_URL?.trim()
  const fromApi = fetched?.trim()
  return fromApi || fromEnv || getBundledInstallerUrl()
}

export async function fetchDesktopDownloadUrl(): Promise<string> {
  try {
    const apiBase = getApiBaseUrl()
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12_000)
    const res = await fetch(`${apiBase}/v1/desktop/update-manifest`, {
      signal: controller.signal
    })
    window.clearTimeout(timeout)
    if (!res.ok) return resolveDesktopDownloadUrl(null)
    const data = (await res.json()) as { downloadUrl?: string | null }
    return resolveDesktopDownloadUrl(data.downloadUrl)
  } catch {
    return resolveDesktopDownloadUrl(null)
  }
}

export function openDesktopInstaller(downloadUrl?: string | null): void {
  const installerUrl = resolveDesktopDownloadUrl(downloadUrl)
  const tc = window.trafficCloud
  if (tc?.openExternal) {
    void tc.openExternal(installerUrl)
    return
  }
  window.open(installerUrl, '_blank', 'noopener,noreferrer')
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
