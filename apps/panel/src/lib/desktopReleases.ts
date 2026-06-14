const DEFAULT_API_BASE = 'https://traffic-cloud-api.onrender.com'

export function resolveDesktopApiBase(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return String(import.meta.env.VITE_API_BASE_URL).trim().replace(/\/$/, '')
  }
  return DEFAULT_API_BASE
}

export function desktopInstallerProxyUrl(version: string): string {
  const v = version.trim().replace(/^v/i, '')
  return `${resolveDesktopApiBase()}/v1/desktop/installer/${v}.exe`
}
