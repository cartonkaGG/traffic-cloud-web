export {}

declare global {
  interface Window {
    trafficCloud: {
      platform: string
      getAppVersion?: () => Promise<string>
      openExternal?: (url: string) => Promise<{ ok: true } | { ok: false; error: string }>
      openBrowserProfile?: (payload: {
        profileId: string
        userAgent: string
        proxy: {
          protocol: 'http' | 'socks5'
          host: string
          port: number
          username?: string | null
          password?: string | null
        } | null
      }) => Promise<{ ok: true } | { ok: false; error: string }>
      clearBrowserProfileStorage?: (profileId: string) => Promise<{ ok: boolean }>
    }
  }
}
