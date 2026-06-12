import type { TikTokAccountCredentials } from '@/domain/types'
import type { AntidetectLaunchPayload } from '@/lib/api'
import { apiGetTikTokLaunch, apiTouchBrowserProfileLaunch } from '@/lib/api'
import { getAccessToken } from '@/lib/authSession'
import { canOpenAntidetectBrowser, isTrafficCloudShell } from '@/lib/desktopAppGate'
import { getApiBaseUrl } from '@/lib/settings'

export type TikTokLaunchResult =
  | { ok: true; mode: 'electron'; credentials: TikTokAccountCredentials }
  | { ok: false; error: string; needsDesktop?: boolean; needsUpdate?: boolean }

export type TikTokWarmupLaunchConfig = {
  hashtags: string[]
  durationMinutes: number
  likes: number
  comments: number
  follows: number
  watchSecondsMin: number
  watchSecondsMax: number
  commentTexts: string[]
}

const TIKTOK_HOME_URL = 'https://www.tiktok.com/'
const TIKTOK_SIGNUP_URL = 'https://www.tiktok.com/signup'
const MIN_TIKTOK_DESKTOP_VERSION = '0.2.5'

function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map((x) => Number(x) || 0)
  const pb = b.split('.').map((x) => Number(x) || 0)
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (d !== 0) return d
  }
  return 0
}

async function openLaunchPayload(
  workspaceId: string,
  launch: AntidetectLaunchPayload,
  credentials: TikTokAccountCredentials,
  accountId?: string,
  warmup?: TikTokWarmupLaunchConfig
): Promise<TikTokLaunchResult> {
  const tc = window.trafficCloud
  const startUrl =
    launch.startUrl?.trim() || (warmup ? TIKTOK_HOME_URL : TIKTOK_SIGNUP_URL)
  const baseAutoreg = launch.autoreg ?? credentials
  // Софт сам забере код підтвердження із серверного endpoint (temp mail.tm або IMAP).
  const token = getAccessToken()
  const apiBase = getApiBaseUrl()
  const autoreg =
    accountId && token
      ? {
          ...baseAutoreg,
          codeUrl: `${apiBase}/v1/workspaces/${workspaceId}/tiktok-accounts/${accountId}/email-code`,
          rotateUrl: `${apiBase}/v1/workspaces/${workspaceId}/tiktok-accounts/${accountId}/rotate-email`,
          authToken: token
        }
      : baseAutoreg

  if (!isTrafficCloudShell()) {
    return {
      ok: false,
      error: 'desktop_required',
      needsDesktop: true
    }
  }

  if (!canOpenAntidetectBrowser()) {
    return {
      ok: false,
      error: `Оновіть Traffic Cloud до ${MIN_TIKTOK_DESKTOP_VERSION}+ — антидетект-браузер не підключений.`,
      needsUpdate: true
    }
  }

  if (tc?.getAppVersion) {
    try {
      const appVersion = await tc.getAppVersion()
      if (compareSemver(appVersion, MIN_TIKTOK_DESKTOP_VERSION) < 0) {
        return {
          ok: false,
          error: `Оновіть Traffic Cloud до ${MIN_TIKTOK_DESKTOP_VERSION}+ (зараз ${appVersion}).`,
          needsUpdate: true
        }
      }
    } catch {
      /* ignore version probe */
    }
  }

  const result = await tc!.openBrowserProfile!({
    profileId: launch.profileId,
    userAgent: launch.userAgent,
    startUrl,
    // Під час прогріву акаунт уже зареєстрований — авторег не запускаємо.
    autoreg: warmup ? undefined : autoreg,
    warmup,
    proxy: launch.proxy
  })
  if (!result.ok) {
    return { ok: false, error: 'error' in result ? result.error : 'Не вдалося відкрити вікно' }
  }
  await apiTouchBrowserProfileLaunch(workspaceId, launch.profileId)
  return { ok: true, mode: 'electron', credentials }
}

export async function openTikTokLoginForAccount(
  workspaceId: string,
  accountId: string
): Promise<TikTokLaunchResult> {
  try {
    const r = await apiGetTikTokLaunch(workspaceId, accountId, { intent: 'login' })
    return openLaunchPayload(workspaceId, r.launch, r.credentials, accountId)
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export async function openTikTokManageForAccount(
  workspaceId: string,
  accountId: string,
  intent: 'signup' | 'login' | 'home' | 'tag' = 'login',
  tag?: string
): Promise<TikTokLaunchResult> {
  try {
    const r = await apiGetTikTokLaunch(workspaceId, accountId, { intent, tag })
    return openLaunchPayload(workspaceId, r.launch, r.credentials, accountId)
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export async function openTikTokWarmupForAccount(
  workspaceId: string,
  accountId: string,
  warmup: TikTokWarmupLaunchConfig
): Promise<TikTokLaunchResult> {
  try {
    const tag = warmup.hashtags[0]
    const r = await apiGetTikTokLaunch(workspaceId, accountId, {
      intent: tag ? 'tag' : 'home',
      tag
    })
    return openLaunchPayload(workspaceId, r.launch, r.credentials, accountId, warmup)
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export async function openTikTokFromCreateLaunch(
  workspaceId: string,
  launch: AntidetectLaunchPayload,
  credentials: TikTokAccountCredentials,
  accountId?: string
): Promise<TikTokLaunchResult> {
  return openLaunchPayload(workspaceId, launch, credentials, accountId)
}

export function credentialsFromAccount(account: {
  email: string
  username: string
  password: string
  emailIsTemp?: boolean
}): TikTokAccountCredentials {
  return {
    email: account.email,
    username: account.username,
    password: account.password,
    emailIsTemp: account.emailIsTemp ?? false
  }
}
