import type { SubscriptionInfo } from '@/lib/api'
import { hasPanelAccess } from '@/lib/subscriptionAccess'

/** Після входу — сторінка оформлення підписки. */
export const BILLING_SUBSCRIBE_PATH = '/billing?gate=1'

export const HUB_PATH = '/hub'

export const BILLING_SUBSCRIBE_REDIRECT = encodeURIComponent(BILLING_SUBSCRIBE_PATH)

/** Єдиний вхід на оформлення підписки: спочатку auth, потім billing. */
export const SUBSCRIBE_ENTRY_PATH = `/auth?redirect=${BILLING_SUBSCRIBE_REDIRECT}`

/** Куди відправити після входу: hub якщо підписка вже є, інакше billing або явний redirect. */
export function resolvePostAuthPath(
  redirectTo: string | null | undefined,
  subscription: SubscriptionInfo | null | undefined,
  isAdmin: boolean
): string {
  const safe =
    redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : null
  const hasAccess = hasPanelAccess(subscription, isAdmin)

  if (safe) {
    if (safe.includes('/billing') && hasAccess) return HUB_PATH
    return safe
  }
  if (hasAccess) return HUB_PATH
  return BILLING_SUBSCRIBE_PATH
}