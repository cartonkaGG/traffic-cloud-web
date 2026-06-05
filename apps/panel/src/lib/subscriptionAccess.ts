import type { SubscriptionInfo } from '@/lib/api'

export function hasPanelAccess(
  subscription: SubscriptionInfo | null | undefined,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true
  return Boolean(subscription?.isActive)
}
