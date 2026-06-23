import { FEATURES } from '@/config/features'
import type { SubscriptionInfo } from '@/lib/api'
import { hasPanelAccess } from '@/lib/subscriptionAccess'

/** Головна сторінка партнерки (без підписки). */
export const AFFILIATE_HOME_PATH = '/affiliate/offers'
export const AFFILIATE_STATS_PATH = '/affiliate/stats'

/** Після входу — сторінка оформлення підписки (лише коли софти увімкнені). */
export const BILLING_SUBSCRIBE_PATH = '/billing?gate=1'

export const HUB_PATH = '/hub'

export const BILLING_SUBSCRIBE_REDIRECT = encodeURIComponent(BILLING_SUBSCRIBE_PATH)

/** Єдиний вхід на оформлення підписки: спочатку auth, потім billing. */
export const SUBSCRIBE_ENTRY_PATH = FEATURES.affiliateOnlyMode
  ? `/auth?redirect=${encodeURIComponent(AFFILIATE_HOME_PATH)}`
  : `/auth?redirect=${BILLING_SUBSCRIBE_REDIRECT}`

/** Дефолтний redirect після входу (query `redirect` на /auth). */
export function defaultAuthRedirect(): string {
  return FEATURES.affiliateOnlyMode ? AFFILIATE_HOME_PATH : BILLING_SUBSCRIBE_PATH
}

/** Куди відправити після входу. */
export function resolvePostAuthPath(
  redirectTo: string | null | undefined,
  subscription: SubscriptionInfo | null | undefined,
  isAdmin: boolean
): string {
  const safe =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : null

  if (FEATURES.affiliateOnlyMode) {
    if (safe) {
      if (safe.startsWith('/hub') || safe === '/') return AFFILIATE_HOME_PATH
      return safe
    }
    return AFFILIATE_HOME_PATH
  }

  const hasAccess = hasPanelAccess(subscription, isAdmin)

  if (safe) {
    if (safe.includes('/billing') && hasAccess) return HUB_PATH
    return safe
  }
  if (hasAccess) return HUB_PATH
  return BILLING_SUBSCRIBE_PATH
}
