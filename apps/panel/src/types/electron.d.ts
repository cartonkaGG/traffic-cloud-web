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
          searchQueries: string[]
          hashtags: string[]
          durationMinutes: number
          likes: number
          comments: number
          follows: number
          watchSecondsMin: number
          watchSecondsMax: number
          watchFullVideos: boolean
          minimizeWindow: boolean
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
      closeBrowserProfile?: (
        profileId: string
      ) => Promise<{ ok: true } | { ok: false; error: string }>
      checkDesktopUpdate?: () => Promise<import('@/lib/desktopUpdate').DesktopUpdateProgress>
      startDesktopUpdate?: () => Promise<{ ok: true } | { ok: false; error: string }>
      onDesktopUpdateProgress?: (
        callback: (payload: import('@/lib/desktopUpdate').DesktopUpdateProgress) => void
      ) => () => void
      onTikTokWarmupProgress?: (
        callback: (payload: {
          profileId: string
          running: boolean
          logs: string[]
          likesDone: number
          commentsDone: number
          followsDone: number
          videosWatched: number
          phase: string
        }) => void
      ) => () => void
    }
  }
}
