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

export type DesktopUpdatePhase =
  | 'idle'
  | 'checking'
  | 'downloading'
  | 'installing'
  | 'restarting'
  | 'uptodate'
  | 'error'

export type DesktopUpdateProgress = {
  phase: DesktopUpdatePhase
  percent?: number
  message?: string
  currentVersion?: string
  latestVersion?: string
  downloadUrl?: string
  notes?: string | null
  error?: string
}

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
  const apiBase = getApiBaseUrl()
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 12_000)

  let apiData: {
    configured?: boolean
    latestVersion?: string | null
    downloadUrl?: string | null
    notes?: string | null
  } | null = null

  try {
    const res = await fetch(`${apiBase}/v1/desktop/update-manifest?_=${Date.now()}`, {
      signal: controller.signal
    })
    if (res.ok) {
      apiData = (await res.json()) as typeof apiData
    }
  } catch {
    /* fallback below */
  } finally {
    window.clearTimeout(timeout)
  }

  let staticData: {
    latestVersion?: string | null
    downloadUrl?: string | null
    notes?: string | null
  } | null = null

  try {
    const staticController = new AbortController()
    const staticTimeout = window.setTimeout(() => staticController.abort(), 10_000)
    const staticRes = await fetch(
      `${window.location.origin}/downloads/latest.json?_=${Date.now()}`,
      { signal: staticController.signal }
    )
    window.clearTimeout(staticTimeout)
    if (staticRes.ok) {
      staticData = (await staticRes.json()) as typeof staticData
    }
  } catch {
    /* ignore */
  }

  const apiVersion = apiData?.latestVersion?.trim() || null
  const staticVersion = staticData?.latestVersion?.trim() || null
  const bundledVersion = BUNDLED_DESKTOP_VERSION

  let latestVersion = bundledVersion
  if (apiVersion && compareSemver(apiVersion, latestVersion) > 0) latestVersion = apiVersion
  if (staticVersion && compareSemver(staticVersion, latestVersion) > 0) {
    latestVersion = staticVersion
  }

  const pickUrl = (version: string): string => {
    if (staticVersion === version && staticData?.downloadUrl?.trim()) {
      return resolveDesktopDownloadUrl(staticData.downloadUrl)
    }
    if (apiVersion === version && apiData?.downloadUrl?.trim()) {
      return resolveDesktopDownloadUrl(apiData.downloadUrl)
    }
    return getBundledInstallerUrl()
  }

  const notes =
    (staticVersion === latestVersion ? staticData?.notes : null) ??
    apiData?.notes?.trim() ??
    null

  if (!apiData && !staticData) {
    return {
      configured: false,
      latestVersion: bundledVersion,
      downloadUrl: getBundledInstallerUrl(),
      notes: null
    }
  }

  return {
    configured: Boolean(apiData?.configured),
    latestVersion,
    downloadUrl: pickUrl(latestVersion),
    notes: typeof notes === 'string' ? notes.trim() || null : null
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
