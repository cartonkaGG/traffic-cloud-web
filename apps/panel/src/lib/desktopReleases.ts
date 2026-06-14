/** GitHub Releases — Vercel не віддає .exe ~80MB (ERR_INVALID_RESPONSE / 503). */
export const GITHUB_DESKTOP_REPO = 'cartonkaGG/trafficcloud'

export const GITHUB_DESKTOP_RELEASES_BASE = `https://github.com/${GITHUB_DESKTOP_REPO}/releases/download`

export function githubDesktopInstallerUrl(version: string): string {
  const v = version.trim().replace(/^v/i, '')
  return `${GITHUB_DESKTOP_RELEASES_BASE}/v${v}/Traffic-Cloud-Setup-${v}.exe`
}

/** Фактична назва asset на GitHub (Windows gh інколи змінює дефіси на крапки). */
export function githubDesktopInstallerUrlFallback(version: string): string {
  const v = version.trim().replace(/^v/i, '')
  return `${GITHUB_DESKTOP_RELEASES_BASE}/v${v}/Traffic.Cloud.Setup.${v}.exe`
}
