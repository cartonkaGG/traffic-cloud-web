import type { TelegramAccountModel } from '@/domain/types'
import { apiGetTelegramWebLaunch, apiTouchBrowserProfileLaunch } from '@/lib/api'

export type OpenTelegramResult = { ok: true; mode: 'electron' | 'web' } | { ok: false; error: string }

/**
 * Відкриває Telegram Web: у Electron — з проксі акаунта; у звичайному браузері — web.telegram.org.
 */
export async function openTelegramForAccount(
  workspaceId: string,
  account: TelegramAccountModel
): Promise<OpenTelegramResult> {
  const tc = window.trafficCloud
  try {
    const r = await apiGetTelegramWebLaunch(workspaceId, account.id)
    if (tc?.openBrowserProfile) {
      const result = await tc.openBrowserProfile({
        profileId: r.launch.profileId,
        userAgent: r.launch.userAgent,
        startUrl: r.launch.startUrl?.trim() || r.webUrl || 'https://web.telegram.org/k/',
        proxy: r.launch.proxy
      })
      if (!result.ok) {
        return { ok: false, error: 'error' in result ? result.error : 'Не вдалося відкрити вікно' }
      }
      await apiTouchBrowserProfileLaunch(workspaceId, r.launch.profileId)
      return { ok: true, mode: 'electron' }
    }
    if (tc?.openExternal) {
      await tc.openExternal(r.webUrl)
      return { ok: true, mode: 'web' }
    }
    window.open(r.webUrl, '_blank', 'noopener,noreferrer')
    return { ok: true, mode: 'web' }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
