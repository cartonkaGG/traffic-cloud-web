const LOCAL_DEFAULT = 'http://127.0.0.1:8787'

/** URL REST API: продакшен — через `VITE_API_BASE_URL` при сборке; локально — 8787. */
export function getApiBaseUrl(): string {
  const baked = import.meta.env.VITE_API_BASE_URL?.trim()
  if (baked) return baked.replace(/\/$/, '')
  return LOCAL_DEFAULT
}

export function subscribeSettingsChange(cb: () => void): () => void {
  const handler = (): void => cb()
  window.addEventListener('storage', handler)
  window.addEventListener('traffic-cloud-settings', handler)
  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener('traffic-cloud-settings', handler)
  }
}

export function notifySettingsChanged(): void {
  window.dispatchEvent(new Event('traffic-cloud-settings'))
}
