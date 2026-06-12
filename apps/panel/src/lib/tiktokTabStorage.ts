import type { TikTokTabId } from '@/components/tiktok/TikTokTabNav'

const KEY = 'traffic-cloud-tiktok-active-tab'

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
