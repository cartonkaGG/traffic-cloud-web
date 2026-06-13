/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Попадает в клиент на этапе build. Для продакшена укажите URL API (например Render). */
  readonly VITE_API_BASE_URL?: string
  /** Build ID для авто-оновлення панелі в desktop shell. */
  readonly VITE_PANEL_BUILD_ID?: string
  /** Fallback URL для завантаження desktop-додатку, якщо update-manifest недоступний. */
  readonly VITE_DESKTOP_DOWNLOAD_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface TrafficCloudOpenBrowserProfilePayload {
  profileId: string
  userAgent: string
  proxy: {
    protocol: 'http' | 'socks5'
    host: string
    port: number
    username?: string | null
    password?: string | null
  } | null
}

interface TrafficCloudBridge {
  platform: string
  getAppVersion?: () => Promise<string>
  openExternal?: (url: string) => Promise<{ ok: true } | { ok: false; error: string }>
  openBrowserProfile: (
    payload: TrafficCloudOpenBrowserProfilePayload
  ) => Promise<{ ok: true } | { ok: false; error: string }>
  clearBrowserProfileStorage?: (
    profileId: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>
}

interface Window {
  trafficCloud?: TrafficCloudBridge
}
