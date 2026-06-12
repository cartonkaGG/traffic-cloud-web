import type { TikTokAccountCredentials } from '@/domain/types'
import type { AntidetectLaunchPayload } from '@/lib/api'
import { apiGetTikTokLaunch, apiTouchBrowserProfileLaunch } from '@/lib/api'
import { getApiBaseUrl } from '@/lib/settings'
import { getAccessToken } from '@/lib/authSession'

export type TikTokLaunchResult =
  | { ok: true; mode: 'electron' | 'web'; credentials: TikTokAccountCredentials }
  | { ok: false; error: string }

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

async function openLaunchPayload(
  workspaceId: string,
  launch: AntidetectLaunchPayload,
  credentials: TikTokAccountCredentials,
  accountId?: string,
  warmup?: TikTokWarmupLaunchConfig
): Promise<TikTokLaunchResult> {
  const tc = window.trafficCloud
  const startUrl = launch.startUrl?.trim() || TIKTOK_HOME_URL
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

  if (tc?.openBrowserProfile) {
    const result = await tc.openBrowserProfile({
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

  if (tc?.openExternal) {
    await tc.openExternal(startUrl)
    return { ok: true, mode: 'web', credentials }
  }

  window.open(startUrl, '_blank', 'noopener,noreferrer')
  return { ok: true, mode: 'web', credentials }
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
