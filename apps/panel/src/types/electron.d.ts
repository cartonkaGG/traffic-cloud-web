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
        startUrl?: string
        autoreg?: {
          email: string
          password: string
          username: string
          emailIsTemp?: boolean
          codeUrl?: string
          rotateUrl?: string
          authToken?: string
        }
        warmup?: {
          hashtags: string[]
          durationMinutes: number
          likes: number
          comments: number
          follows: number
          watchSecondsMin: number
          watchSecondsMax: number
          commentTexts: string[]
        }
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
