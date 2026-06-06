import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { BotTrackingSettings } from '@/domain/types'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import {
  apiDeleteTelegramMtproto,
  apiGetTelegramMtproto,
  apiPutTelegramMtproto,
  apiTelegramMtprotoComplete,
  apiTelegramMtprotoSendCode,
  type TelegramMtprotoStatus
} from '@/lib/api'

const STORAGE_KEY = 'traffic-cloud-settings-v1'

type StoredSettings = {
  bot: BotTrackingSettings
}

const defaults: StoredSettings = {
  bot: {
    botToken: '',
    channelId: '',
    notes: ''
  }
}

export function SettingsPage(): JSX.Element {
  const { status, workspaceName, error, refetch, workspaceId } = useWorkspaceData()
  const [settings, setSettings] = useState<StoredSettings>(defaults)

  const [tgStatus, setTgStatus] = useState<TelegramMtprotoStatus | null>(null)
  const [tgApiId, setTgApiId] = useState('')
  const [tgApiHash, setTgApiHash] = useState('')
  const [tgSession, setTgSession] = useState('')
  const [tgBusy, setTgBusy] = useState(false)
  const [tgMsg, setTgMsg] = useState<string | null>(null)
  const [loginPhone, setLoginPhone] = useState('')
  const [loginCode, setLoginCode] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginForceSms, setLoginForceSms] = useState(false)
  const [loginBusy, setLoginBusy] = useState(false)
  const [loginAwait2fa, setLoginAwait2fa] = useState(false)
  const [loginHint, setLoginHint] = useState<string | null>(null)

  const hasApiHashInput = tgApiHash.trim().length > 0 || tgStatus?.workspace.hasApiHash === true
  const canMtprotoLogin = tgApiId.trim().length > 0 && hasApiHashInput

  function mtprotoCredsBody(): { apiId?: string; apiHash?: string } {
    const apiId = tgApiId.trim()
    const apiHash = tgApiHash.trim()
    return {
      ...(apiId ? { apiId } : {}),
      ...(apiHash ? { apiHash } : {})
    }
  }

  const loadTg = useCallback(async () => {
    if (!workspaceId || status !== 'online') return
    setTgMsg(null)
    try {
      const s = await apiGetTelegramMtproto(workspaceId)
      setTgStatus(s)
      setTgApiId(s.workspace.apiId != null ? String(s.workspace.apiId) : '')
      setTgApiHash('')
      setTgSession('')
    } catch (e) {
      setTgMsg(e instanceof Error ? e.message : String(e))
    }
  }, [workspaceId, status])

  useEffect(() => {
    void loadTg()
  }, [loadTg])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as StoredSettings
      setSettings({ ...defaults, ...parsed, bot: { ...defaults.bot, ...parsed.bot } })
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* ignore */
    }
  }, [settings])

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500">
          Токен бота ниже хранится локально в Electron. Параметры MTProto для парсинга чатов — на сервере в базе
          (раздел выше).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-[13px] text-zinc-500">
            Состояние API:{' '}
            <span
              className={
                status === 'online'
                  ? 'font-semibold text-emerald-400'
                  : status === 'loading'
                    ? 'font-semibold text-zinc-400'
                    : 'font-semibold text-amber-400'
              }
            >
              {status === 'online'
                ? `online · ${workspaceName ?? 'workspace'}`
                : status === 'loading'
                  ? 'загрузка…'
                  : `offline${error ? ` · ${error.slice(0, 120)}` : ''}`}
            </span>
          </p>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl border border-accent/25 bg-accent/10 px-4 py-2 text-[13px] font-semibold text-accent hover:bg-accent/15"
            onClick={() => void refetch()}
          >
            Обновить данные
          </motion.button>
        </div>
      </div>

      <div className="glass-panel max-w-3xl space-y-5 p-6">
        <div className="text-sm font-semibold text-white">Telegram MTProto · парсинг чатов</div>
        <p className="text-[13px] leading-relaxed text-zinc-500">
          Данные сохраняются локально на этом компьютере в файле workspace (папка данных приложения). Учётная
          запись (email / пароль) — на сервере в MongoDB.
        </p>
        <p className="text-[13px] leading-relaxed text-zinc-500">
          <span className="text-zinc-400">Где взять api_id и api_hash:</span>{' '}
          <a
            href="https://my.telegram.org/apps"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline decoration-accent/40 underline-offset-2 hover:text-accent/90"
          >
            my.telegram.org/apps
          </a>
          — войдите номером телефона, создайте приложение «Desktop», скопируйте числовой App api_id и строку App
          api_hash.
        </p>
        <p className="text-[13px] leading-relaxed text-zinc-500">
          <span className="text-zinc-400">Session string</span> генерується автоматично після входу в Telegram
          (номер → код → 2FA за потреби). Вставляти вручну не потрібно.
        </p>
        {tgStatus ? (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[13px] text-zinc-400">
            Парсинг готов:{' '}
            <span className={tgStatus.parseReady ? 'font-semibold text-emerald-400' : 'font-semibold text-amber-400'}>
              {tgStatus.parseReady ? 'да' : 'нет'}
            </span>
            {tgStatus.parseReady ? (
              <>
                {' '}
                · источник:{' '}
                <span className="text-zinc-300">
                  {tgStatus.activeSource === 'workspace'
                    ? 'настройки приложения'
                    : tgStatus.activeSource === 'env'
                      ? 'server/.env'
                      : '—'}
                </span>
              </>
            ) : null}
          </div>
        ) : null}
        {tgMsg ? <p className="text-[13px] text-red-300/90">{tgMsg}</p> : null}

        <label className="block">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">App api_id</div>
          <input
            value={tgApiId}
            onChange={(e) => setTgApiId(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-[13px] text-white outline-none focus:border-accent/35"
            placeholder="12345678"
          />
        </label>
        <label className="block">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            App api_hash {tgStatus?.workspace.hasApiHash ? '(оставьте пустым, чтобы не менять)' : ''}
          </div>
          <input
            value={tgApiHash}
            onChange={(e) => setTgApiHash(e.target.value)}
            type="password"
            autoComplete="off"
            className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-[13px] text-white outline-none focus:border-accent/35"
            placeholder={tgStatus?.workspace.hasApiHash ? '••••••••' : 'hex-строка из my.telegram.org'}
          />
        </label>
        {canMtprotoLogin ? (
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-4 space-y-4">
            <div className="text-[13px] font-medium text-zinc-200">Увійти в Telegram</div>
            {loginHint ? <p className="text-[12px] text-sky-200/90">{loginHint}</p> : null}
            {loginAwait2fa ? (
              <p className="text-[12px] text-amber-200/90">Введіть пароль двофакторної аутентифікації.</p>
            ) : null}

            {!loginAwait2fa ? (
              <>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Телефон
                  </span>
                  <input
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                    placeholder="+380…"
                    autoComplete="tel"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[12px] text-zinc-500">
                  <input
                    type="checkbox"
                    checked={loginForceSms}
                    onChange={(e) => setLoginForceSms(e.target.checked)}
                    className="rounded border-white/20 bg-black/40"
                  />
                  Надіслати код SMS
                </label>
                <button
                  type="button"
                  disabled={loginBusy || status !== 'online' || !workspaceId || !loginPhone.trim()}
                  onClick={() => {
                    if (!workspaceId) return
                    setLoginBusy(true)
                    setLoginHint(null)
                    setTgMsg(null)
                    void (async () => {
                      try {
                        const r = await apiTelegramMtprotoSendCode(workspaceId, {
                          ...mtprotoCredsBody(),
                          phone: loginPhone.trim(),
                          forceSMS: loginForceSms
                        })
                        setLoginHint(
                          r.isCodeViaApp
                            ? 'Код надіслано в додаток Telegram.'
                            : 'Код надіслано SMS — введіть його нижче.'
                        )
                      } catch (e) {
                        setTgMsg(e instanceof Error ? e.message : String(e))
                      } finally {
                        setLoginBusy(false)
                      }
                    })()
                  }}
                  className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white hover:bg-white/[0.1] disabled:opacity-40"
                >
                  Надіслати код
                </button>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Код з Telegram / SMS
                  </span>
                  <input
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                    placeholder="12345"
                    autoComplete="one-time-code"
                  />
                </label>
              </>
            ) : null}

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Пароль 2FA (якщо увімкнено)
              </span>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                autoComplete="current-password"
              />
            </label>

            <motion.button
              type="button"
              disabled={loginBusy || status !== 'online' || !workspaceId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl border border-accent/35 bg-accent/15 px-4 py-2 text-[13px] font-semibold text-accent hover:bg-accent/20 disabled:opacity-40"
              onClick={() => {
                if (!workspaceId) return
                setLoginBusy(true)
                setTgMsg(null)
                void (async () => {
                  try {
                    const r = await apiTelegramMtprotoComplete(workspaceId, {
                      ...mtprotoCredsBody(),
                      phoneCode: loginCode,
                      password: loginPassword.trim() || undefined
                    })
                    if (!r.ok) {
                      if (r.twoFactorRequired) {
                        setLoginAwait2fa(true)
                        setLoginHint('Потрібен пароль 2FA.')
                      } else {
                        setTgMsg(r.message)
                      }
                      return
                    }
                    setTgSession(r.sessionString)
                    setLoginAwait2fa(false)
                    setLoginCode('')
                    setLoginPassword('')
                    await apiPutTelegramMtproto(workspaceId, {
                      apiId: tgApiId.trim() || undefined,
                      apiHash: tgApiHash.trim() || undefined,
                      sessionString: r.sessionString
                    })
                    setTgMsg(
                      r.telegramUsername
                        ? `Session string згенеровано (@${r.telegramUsername}) і збережено.`
                        : 'Session string згенеровано і збережено.'
                    )
                    await loadTg()
                    await refetch()
                  } catch (e) {
                    setTgMsg(e instanceof Error ? e.message : String(e))
                  } finally {
                    setLoginBusy(false)
                  }
                })()
              }}
            >
              {loginBusy ? 'Вхід…' : 'Отримати session string'}
            </motion.button>
          </div>
        ) : (
          <p className="text-[12px] text-zinc-600">
            Заповніть App api_id та App api_hash — з’явиться форма входу для автоматичного session string.
          </p>
        )}

        <label className="block">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Session string{' '}
            {tgSession.trim() || tgStatus?.workspace.hasSession
              ? '(згенеровано автоматично)'
              : ''}
          </div>
          <textarea
            value={tgSession}
            readOnly
            autoComplete="off"
            className="mt-2 min-h-[72px] w-full rounded-xl border border-white/[0.10] bg-black/40 px-4 py-3 font-mono text-[12px] text-zinc-400 outline-none"
            placeholder={
              tgStatus?.workspace.hasSession
                ? '•••• (збережено в базі — увійдіть знову, щоб оновити)'
                : 'З’явиться після входу в Telegram'
            }
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <motion.button
            type="button"
            disabled={tgBusy || status !== 'online' || !workspaceId}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl border border-accent/25 bg-accent/10 px-4 py-2 text-[13px] font-semibold text-accent hover:bg-accent/15 disabled:opacity-40"
            onClick={() => {
              if (!workspaceId) return
              setTgBusy(true)
              setTgMsg(null)
              void (async () => {
                try {
                  await apiPutTelegramMtproto(workspaceId, {
                    apiId: tgApiId.trim() || undefined,
                    apiHash: tgApiHash.trim() || undefined,
                    sessionString: tgSession.trim() || undefined
                  })
                  setTgMsg('Сохранено.')
                  await loadTg()
                  await refetch()
                } catch (e) {
                  setTgMsg(e instanceof Error ? e.message : String(e))
                } finally {
                  setTgBusy(false)
                }
              })()
            }}
          >
            {tgBusy ? 'Сохранение…' : 'Сохранить MTProto'}
          </motion.button>
          <motion.button
            type="button"
            disabled={
              tgBusy ||
              status !== 'online' ||
              !workspaceId ||
              !(
                tgStatus?.workspace.hasApiHash ||
                tgStatus?.workspace.hasSession ||
                tgStatus?.workspace.apiId != null
              )
            }
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-zinc-300 hover:border-red-400/35 hover:text-red-200 disabled:opacity-40"
            onClick={() => {
              if (!workspaceId) return
              setTgBusy(true)
              setTgMsg(null)
              void (async () => {
                try {
                  await apiDeleteTelegramMtproto(workspaceId)
                  setTgMsg('Настройки MTProto удалены из базы (останется только server/.env, если задан).')
                  await loadTg()
                  await refetch()
                } catch (e) {
                  setTgMsg(e instanceof Error ? e.message : String(e))
                } finally {
                  setTgBusy(false)
                }
              })()
            }}
          >
            Удалить из базы
          </motion.button>
        </div>
      </div>

      <div className="glass-panel max-w-3xl space-y-5 p-6">
        <div className="text-sm font-semibold text-white">Telegram Bot API · трекинг конверсий</div>
        <p className="text-[13px] leading-relaxed text-zinc-500">
          Добавьте бота в канал как администратора. Далее подключим обработчик событий на бэкенде.
        </p>

        <label className="block">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Bot token
          </div>
          <input
            value={settings.bot.botToken ?? ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                bot: { ...settings.bot, botToken: e.target.value || null }
              })
            }
            type="password"
            autoComplete="off"
            className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-[13px] text-white outline-none focus:border-accent/35"
            placeholder="123456:ABC..."
          />
        </label>

        <label className="block">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Channel / chat id (опционально)
          </div>
          <input
            value={settings.bot.channelId ?? ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                bot: { ...settings.bot, channelId: e.target.value || null }
              })
            }
            className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-[13px] text-white outline-none focus:border-accent/35"
            placeholder="-1001234567890"
          />
        </label>

        <label className="block">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Заметки
          </div>
          <textarea
            value={settings.bot.notes ?? ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                bot: { ...settings.bot, notes: e.target.value || null }
              })
            }
            className="mt-2 min-h-[96px] w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-[13px] text-zinc-200 outline-none focus:border-accent/35"
            placeholder="Какие события собираем, какие метки в текстах DM..."
          />
        </label>
      </div>
    </div>
  )
}
