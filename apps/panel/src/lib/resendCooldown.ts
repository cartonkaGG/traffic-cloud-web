const STORAGE_KEY = 'traffic-cloud-resend-cooldown'
export const RESEND_COOLDOWN_SEC = 60

export function getResendCooldownLeft(email: string): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const map = JSON.parse(raw) as Record<string, number>
    const until = map[email.trim().toLowerCase()]
    if (!until) return 0
    return Math.max(0, Math.ceil((until - Date.now()) / 1000))
  } catch {
    return 0
  }
}

export function startResendCooldown(email: string, seconds = RESEND_COOLDOWN_SEC): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const map = (raw ? JSON.parse(raw) : {}) as Record<string, number>
    map[email.trim().toLowerCase()] = Date.now() + seconds * 1000
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}
