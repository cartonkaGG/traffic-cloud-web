import type { BrowserProfile, ProxyEndpointModel, TelegramAccountModel } from '@/domain/types'
import {
  apiTouchBrowserProfileLaunch,
  type AntidetectLaunchPayload
} from '@/lib/api'

export type AntidetectLaunchResult = { ok: true } | { ok: false; error: string }

/**
 * Відкриває вікно Electron з ізольованим профілем (partition) і проксі, як на сторінці Anti-detect.
 */
export async function launchAntidetectBrowserForAccount(opts: {
  workspaceId: string
  account: TelegramAccountModel
  browserProfiles: BrowserProfile[]
  proxies: ProxyEndpointModel[]
}): Promise<AntidetectLaunchResult> {
  const pid = opts.account.browserProfileId
  if (!pid) {
    return { ok: false, error: 'У аккаунта нет привязанного anti-detect профиля' }
  }
  const bp = opts.browserProfiles.find((p) => p.id === pid)
  if (!bp) {
    return { ok: false, error: 'Профиль не найден в данных workspace' }
  }
  const tc = window.trafficCloud
  if (!tc?.openBrowserProfile) {
    return {
      ok: false,
      error: 'Запуск доступен только в десктоп-приложении (Electron).'
    }
  }
  const proxy = bp.proxyId ? opts.proxies.find((x) => x.id === bp.proxyId) : undefined
  const result = await tc.openBrowserProfile({
    profileId: bp.id,
    userAgent: bp.fingerprint.userAgent,
    proxy: proxy
      ? {
          protocol: proxy.protocol,
          host: proxy.host,
          port: proxy.port,
          username: proxy.username,
          password: proxy.password
        }
      : null
  })
  if (!result.ok) {
    return {
      ok: false,
      error: 'error' in result ? result.error : 'Не удалось открыть окно'
    }
  }
  await apiTouchBrowserProfileLaunch(opts.workspaceId, bp.id)
  return { ok: true }
}

export async function launchAntidetectFromPayload(
  workspaceId: string,
  payload: AntidetectLaunchPayload
): Promise<AntidetectLaunchResult> {
  const tc = window.trafficCloud
  if (!tc?.openBrowserProfile) {
    return {
      ok: false,
      error: 'Запуск доступен только в десктоп-приложении (Electron).'
    }
  }
  const result = await tc.openBrowserProfile({
    profileId: payload.profileId,
    userAgent: payload.userAgent,
    proxy: payload.proxy
  })
  if (!result.ok) {
    return {
      ok: false,
      error: 'error' in result ? result.error : 'Не удалось открыть окно'
    }
  }
  await apiTouchBrowserProfileLaunch(workspaceId, payload.profileId)
  return { ok: true }
}
