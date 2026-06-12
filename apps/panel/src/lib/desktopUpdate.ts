import {
  BUNDLED_INSTALLER_FILENAME,
  getBundledInstallerUrl,
  isTrafficCloudShell,
  resolveDesktopDownloadUrl
} from '@/lib/desktopAppGate'
import { getApiBaseUrl } from '@/lib/settings'

/** Версія з імені інсталятора на сайті (fallback, якщо API manifest не налаштований). */
export const BUNDLED_DESKTOP_VERSION = BUNDLED_INSTALLER_FILENAME.replace(
  /^Traffic-Cloud-Setup-|\.exe$/g,
  ''
)

export type DesktopUpdateManifest = {
  configured: boolean
  latestVersion: string | null
  downloadUrl: string | null
  notes: string | null
}

export function parseSemverParts(s: string): [number, number, number] {
  const cleaned = s.trim().replace(/^v/i, '')
  const parts = cleaned.split('.').map((x) => {
    const m = /^(\d+)/.exec(x)
    return m ? parseInt(m[1], 10) : 0
  })
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
}

export function compareSemver(a: string, b: string): number {
  const A = parseSemverParts(a)
  const B = parseSemverParts(b)
  for (let i = 0; i < 3; i++) {
    if (A[i] !== B[i]) return A[i] - B[i]
  }
  return 0
}

export function readShellVersionFromUserAgent(): string | null {
  const m = navigator.userAgent.match(/\bTrafficCloudDesktop\/([\d.]+)/)
  return m?.[1] ?? null
}

export async function readCurrentDesktopVersion(): Promise<string | null> {
  const tc = window.trafficCloud
  if (tc?.getAppVersion) {
    try {
      const v = await tc.getAppVersion()
      if (v?.trim()) return v.trim()
    } catch {
      /* ignore */
    }
  }
  return readShellVersionFromUserAgent()
}

export async function fetchDesktopUpdateManifest(): Promise<DesktopUpdateManifest> {
  try {
    const apiBase = getApiBaseUrl()
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 12_000)
    const res = await fetch(`${apiBase}/v1/desktop/update-manifest`, {
      signal: controller.signal
    })
    window.clearTimeout(timeout)
    if (!res.ok) {
      return {
        configured: false,
        latestVersion: BUNDLED_DESKTOP_VERSION,
        downloadUrl: getBundledInstallerUrl(),
        notes: null
      }
    }
    const data = (await res.json()) as {
      configured?: boolean
      latestVersion?: string | null
      downloadUrl?: string | null
      notes?: string | null
    }
    const latestVersion = data.latestVersion?.trim() || BUNDLED_DESKTOP_VERSION
    const downloadUrl = resolveDesktopDownloadUrl(data.downloadUrl)
    return {
      configured: Boolean(data.configured),
      latestVersion,
      downloadUrl,
      notes: data.notes?.trim() || null
    }
  } catch {
    return {
      configured: false,
      latestVersion: BUNDLED_DESKTOP_VERSION,
      downloadUrl: getBundledInstallerUrl(),
      notes: null
    }
  }
}

export async function checkDesktopUpdateAvailable(): Promise<{
  currentVersion: string | null
  latestVersion: string
  downloadUrl: string
  notes: string | null
  updateAvailable: boolean
  inShell: boolean
}> {
  const manifest = await fetchDesktopUpdateManifest()
  const inShell = isTrafficCloudShell()
  const currentVersion = inShell ? await readCurrentDesktopVersion() : null
  const latestVersion = manifest.latestVersion ?? BUNDLED_DESKTOP_VERSION
  const downloadUrl = manifest.downloadUrl ?? getBundledInstallerUrl()
  const updateAvailable =
    inShell && currentVersion != null && compareSemver(latestVersion, currentVersion) > 0

  return {
    currentVersion,
    latestVersion,
    downloadUrl,
    notes: manifest.notes,
    updateAvailable,
    inShell
  }
}
