const DAY_MS = 24 * 60 * 60 * 1000

export function subscriptionDaysLeft(iso: string | null | undefined): number | null {
  if (!iso) return null
  const end = new Date(iso)
  if (Number.isNaN(end.getTime())) return null
  const ms = end.getTime() - Date.now()
  if (ms <= 0) return 0
  return Math.ceil(ms / DAY_MS)
}

export function formatSubscriptionCountdown(iso: string | null | undefined): string {
  const days = subscriptionDaysLeft(iso)
  if (days === null) return '—'
  return `${days}д`
}

export function formatSubscriptionEnd(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(d)
}