import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { BotTrackingSettings } from '@/domain/types'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import {
  apiDeleteTelegramMtproto,
  apiGetTelegramMtproto,
  apiPutTelegramMtproto,
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
          <span className="text-zinc-400">Строка сессии:</span> в терминале из папки{' '}
          <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[12px] text-zinc-300">server</code>{' '}
          выполните{' '}
          <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[12px] text-zinc-300">
            npm run telegram:login
          </code>
          — после входа по SMS скопируйте выведенную строку <code className="text-zinc-400">TELEGRAM_SESSION_STRING=…</code>{' '}
          сюда (или в .env на сервере).
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
        <label className="block">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Session string {tgStatus?.workspace.hasSession ? '(оставьте пустым, чтобы не менять)' : ''}
          </div>
          <textarea
            value={tgSession}
            onChange={(e) => setTgSession(e.target.value)}
            autoComplete="off"
            className="mt-2 min-h-[88px] w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-[12px] text-white outline-none focus:border-accent/35"
            placeholder={
              tgStatus?.workspace.hasSession
                ? '•••• (сохранено в базе)'
                : 'вставьте строку после telegram:login'
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
