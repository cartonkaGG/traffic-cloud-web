/** Головна сторінка маркетингу (той самий origin у проді). */
export function getMarketingHomeUrl(): string {
  const fromEnv = import.meta.env.VITE_MARKETING_HOME_URL as string | undefined
  if (fromEnv?.trim()) return fromEnv.trim()
  const base = import.meta.env.BASE_URL || '/app/'
  if (typeof window !== 'undefined') {
    const origin = window.location.origin
    if (base.startsWith('http')) {
      try {
        return new URL(base).origin + '/'
      } catch {
        return origin + '/'
      }
    }
    return origin + '/'
  }
  return '/'
}
