export type TikTokTabId = 'accounts' | 'create' | 'warmup'

const KEY = 'traffic-cloud-tiktok-active-tab'

export function tiktokSectionPath(tab: TikTokTabId): string {
  return `/tiktok/${tab}`
}

export function readTikTokActiveTab(): TikTokTabId {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === 'accounts' || raw === 'create' || raw === 'warmup') return raw
  } catch {
    /* ignore */
  }
  return 'accounts'
}

export function writeTikTokActiveTab(tab: TikTokTabId): void {
  try {
    localStorage.setItem(KEY, tab)
  } catch {
    /* ignore */
  }
}

export function tabFromPathname(pathname: string): TikTokTabId {
  if (pathname.endsWith('/create')) return 'create'
  if (pathname.endsWith('/warmup')) return 'warmup'
  return 'accounts'
}
