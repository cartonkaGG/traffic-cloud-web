import type { SafetyFiltersConfig, UserFiltersConfig } from '@/domain/types'

/** Має збігатися з ключем на сторінці «Фільтри». */
export const OUTREACH_FILTERS_STORAGE_KEY = 'traffic-cloud-filters-v1'

const defaultUser: UserFiltersConfig = {
  onlyPremium: false,
  onlyOnline: false,
  onlyRecentlyActive: true,
  requireUsername: true,
  ignoreBots: true,
  ignoreDeleted: true
}

const defaultSafety: SafetyFiltersConfig = {
  dedupeAcrossCampaigns: true,
  blacklistUsernames: [],
  stopOnFloodWarning: true,
  skipInactive: true
}

export function readOutreachFiltersFromStorage(): {
  user: UserFiltersConfig
  safety: SafetyFiltersConfig
} {
  if (typeof window === 'undefined') {
    return { user: { ...defaultUser }, safety: { ...defaultSafety } }
  }
  try {
    const raw = window.localStorage.getItem(OUTREACH_FILTERS_STORAGE_KEY)
    if (!raw) return { user: { ...defaultUser }, safety: { ...defaultSafety } }
    const p = JSON.parse(raw) as {
      user?: Partial<UserFiltersConfig>
      safety?: Partial<SafetyFiltersConfig>
    }
    const user = { ...defaultUser, ...p.user }
    const safety: SafetyFiltersConfig = {
      ...defaultSafety,
      ...p.safety,
      blacklistUsernames: Array.isArray(p.safety?.blacklistUsernames)
        ? p.safety!.blacklistUsernames
        : defaultSafety.blacklistUsernames
    }
    return { user, safety }
  } catch {
    return { user: { ...defaultUser }, safety: { ...defaultSafety } }
  }
}
