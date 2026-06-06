import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, ExternalLink, Loader2, MessageCircle, RefreshCw, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInboxNotify } from '@/context/InboxNotifyContext'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import { useToast } from '@/context/ToastContext'
import type { TelegramAccountModel } from '@/domain/types'
import {
  apiInboxDialogs,
  apiInboxMessages,
  apiInboxSend,
  type InboxDialogRow,
  type InboxMessageRow
} from '@/lib/api'
import { openTelegramForAccount } from '@/lib/openTelegramForAccount'

function formatMsgTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  return new Intl.DateTimeFormat('uk-UA', {
    day: sameDay ? undefined : '2-digit',
    month: sameDay ? undefined : '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

function accountLabel(a: TelegramAccountModel): string {
  const un = a.username ? `@${a.username}` : a.phone
  return `${a.label} · ${un}`
}

export function InboxPage(): JSX.Element {
  const { bundle, workspaceId, status } = useWorkspaceData()
  const { pushToast } = useToast()
  const { setInboxFocus, suppressPeerBriefly, refreshNow } = useInboxNotify()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [notifyPermission, setNotifyPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
    return Notification.permission
  })

  const accounts = useMemo(
    () => (bundle?.telegramAccounts ?? []).filter((a) => a.hasMtprotoSession === true),
    [bundle?.telegramAccounts]
  )

  const accountIdParam = searchParams.get('account') ?? ''
  const selectedAccountId = useMemo(() => {
    if (accountIdParam && accounts.some((a) => a.id === accountIdParam)) return accountIdParam
    return accounts[0]?.id ?? ''
  }, [accountIdParam, accounts])

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId)

  const [dialogs, setDialogs] = useState<InboxDialogRow[]>([])
  const [dialogsBusy, setDialogsBusy] = useState(false)
  const [dialogsError, setDialogsError] = useState<string | null>(null)

  const [peerKey, setPeerKey] = useState<string | null>(null)
  const [messages, setMessages] = useState<InboxMessageRow[]>([])
  const [messagesBusy, setMessagesBusy] = useState(false)

  const [replyText, setReplyText] = useState('')
  const [sendBusy, setSendBusy] = useState(false)
  const [telegramWebBusy, setTelegramWebBusy] = useState(false)

  const activeDialog = dialogs.find((d) => d.peerKey === peerKey) ?? null

  const peerParam = searchParams.get('peer') ?? ''

  useEffect(() => {
    if (!selectedAccountId || accountIdParam === selectedAccountId) return
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('account', selectedAccountId)
        return next
      },
      { replace: true }
    )
  }, [selectedAccountId, accountIdParam, setSearchParams])

  useEffect(() => {
    if (peerParam) setPeerKey(peerParam)
  }, [peerParam])

  useEffect(() => {
    setInboxFocus(selectedAccountId || null, peerKey)
    return () => setInboxFocus(null, null)
  }, [selectedAccountId, peerKey, setInboxFocus])

  const loadDialogs = useCallback(async () => {
    if (!workspaceId || status !== 'online' || !selectedAccountId) return
    setDialogsBusy(true)
    setDialogsError(null)
    try {
      const r = await apiInboxDialogs(workspaceId, selectedAccountId)
      setDialogs(r.dialogs)
      setPeerKey((prev) => {
        if (prev && r.dialogs.some((d) => d.peerKey === prev)) return prev
        return r.dialogs[0]?.peerKey ?? null
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setDialogsError(msg)
      setDialogs([])
      pushToast(msg, 'error')
    } finally {
      setDialogsBusy(false)
      refreshNow()
    }
  }, [workspaceId, status, selectedAccountId, pushToast, refreshNow])

  const loadMessages = useCallback(async () => {
    if (!workspaceId || status !== 'online' || !selectedAccountId || !peerKey) {
      setMessages([])
      return
    }
    setMessagesBusy(true)
    try {
      const r = await apiInboxMessages(workspaceId, selectedAccountId, peerKey)
      setMessages(r.messages)
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), 'error')
      setMessages([])
    } finally {
      setMessagesBusy(false)
    }
  }, [workspaceId, status, selectedAccountId, peerKey, pushToast])

  useEffect(() => {
    void loadDialogs()
  }, [loadDialogs])

  useEffect(() => {
    void loadMessages()
  }, [loadMessages])

  const sendReply = useCallback(async () => {
    if (!workspaceId || status !== 'online' || !selectedAccountId || !peerKey) return
    const text = replyText.trim()
    if (!text) {
      pushToast('Введіть текст відповіді', 'error')
      return
    }
    setSendBusy(true)
    try {
      await apiInboxSend(workspaceId, selectedAccountId, { peerKey, text })
      suppressPeerBriefly(selectedAccountId, peerKey)
      setReplyText('')
      pushToast('Повідомлення надіслано', 'ok')
      await loadMessages()
      await loadDialogs()
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), 'error')
    } finally {
      setSendBusy(false)
    }
  }, [
    workspaceId,
    status,
    selectedAccountId,
    peerKey,
    replyText,
    pushToast,
    loadMessages,
    loadDialogs,
    suppressPeerBriefly
  ])

  const enableBrowserNotify = useCallback(async () => {
    if (!('Notification' in window)) {
      pushToast('Браузер не підтримує сповіщення', 'error')
      return
    }
    const p = await Notification.requestPermission()
    setNotifyPermission(p)
    if (p === 'granted') {
      pushToast('Сповіщення увімкнено — отримаєте їх, коли вкладка у фоні', 'ok')
    } else if (p === 'denied') {
      pushToast('Сповіщення заблоковано в налаштуваннях браузера', 'error')
    }
  }, [pushToast])

  const openTelegramWeb = useCallback(async () => {
    if (!workspaceId || !selectedAccount) return
    setTelegramWebBusy(true)
    try {
      const r = await openTelegramForAccount(workspaceId, selectedAccount)
      if (!r.ok) {
        pushToast(r.error, 'error')
        return
      }
      pushToast(
        r.mode === 'electron'
          ? 'Telegram Web відкрито з проксі акаунта'
          : 'Відкрито web.telegram.org у новій вкладці',
        'ok'
      )
    } finally {
      setTelegramWebBusy(false)
    }
  }, [workspaceId, selectedAccount, pushToast])

  if (!accounts.length) {
    return (
      <div className="glass-panel rounded-2xl border border-white/[0.06] px-6 py-14 text-center">
        <MessageCircle className="mx-auto h-10 w-10 text-zinc-600" aria-hidden />
        <p className="mt-4 text-sm text-zinc-400">
          Немає акаунтів з MTProto-сесією. Спочатку увійдіть через «Код Telegram» на сторінці акаунтів.
        </p>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/accounts')}
          className="mt-6 rounded-xl border border-accent/35 bg-accent/15 px-5 py-2.5 text-sm font-semibold text-accent"
        >
          Перейти до акаунтів
        </motion.button>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] min-h-[420px] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
          Відповіді через MTProto прямо в панелі — без iframe Telegram. Повідомлення йдуть через SOCKS5
          проксі акаунта, як і розсилка.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-[12px] text-zinc-500">
            Акаунт
            <select
              value={selectedAccountId}
              onChange={(e) => {
                setPeerKey(null)
                setSearchParams({ account: e.target.value })
              }}
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-accent/35"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {accountLabel(a)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={dialogsBusy}
            onClick={() => void loadDialogs()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-zinc-200 hover:border-accent/30 disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${dialogsBusy ? 'animate-spin' : ''}`} aria-hidden />
            Оновити
          </button>
          {notifyPermission !== 'granted' && notifyPermission !== 'unsupported' ? (
            <button
              type="button"
              onClick={() => void enableBrowserNotify()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-[12px] font-medium text-amber-100 hover:border-amber-400/40"
            >
              <Bell className="h-3.5 w-3.5" aria-hidden />
              Увімкнути сповіщення
            </button>
          ) : null}
          <button
            type="button"
            disabled={telegramWebBusy || !selectedAccount}
            onClick={() => void openTelegramWeb()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-[12px] font-medium text-sky-100 hover:border-sky-400/40 disabled:opacity-40"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            {telegramWebBusy ? '…' : 'Telegram Web'}
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(240px,280px)_1fr]">
        <div className="glass-panel flex min-h-0 flex-col overflow-hidden p-0">
          <div className="border-b border-white/[0.06] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Діалоги
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {dialogsBusy && !dialogs.length ? (
              <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-zinc-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Завантаження…
              </div>
            ) : dialogsError ? (
              <div className="px-4 py-8 text-center text-sm text-red-300/90">{dialogsError}</div>
            ) : dialogs.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-zinc-500">Діалогів поки немає</div>
            ) : (
              dialogs.map((d) => {
                const active = d.peerKey === peerKey
                return (
                  <button
                    key={d.peerKey}
                    type="button"
                    onClick={() => {
                      setPeerKey(d.peerKey)
                      const next = new URLSearchParams(searchParams)
                      next.set('account', selectedAccountId)
                      next.set('peer', d.peerKey)
                      setSearchParams(next, { replace: true })
                    }}
                    className={[
                      'w-full border-b border-white/[0.04] px-4 py-3 text-left transition-colors',
                      active ? 'bg-accent/10' : 'hover:bg-white/[0.03]'
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 font-medium text-white">{d.title}</div>
                      {d.unreadCount > 0 ? (
                        <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">
                          {d.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    {d.lastMessage ? (
                      <div className="mt-1 line-clamp-2 text-[12px] text-zinc-500">{d.lastMessage}</div>
                    ) : null}
                    {d.lastMessageAt ? (
                      <div className="mt-1 font-mono text-[10px] text-zinc-600">
                        {formatMsgTime(d.lastMessageAt)}
                      </div>
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="glass-panel flex min-h-0 flex-col overflow-hidden p-0">
          {activeDialog ? (
            <>
              <div className="border-b border-white/[0.06] px-5 py-3">
                <div className="text-sm font-semibold text-white">{activeDialog.title}</div>
                {activeDialog.username ? (
                  <div className="font-mono text-[12px] text-zinc-500">@{activeDialog.username}</div>
                ) : null}
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 py-4">
                {messagesBusy && !messages.length ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Завантаження повідомлень…
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-sm text-zinc-500">Повідомлень немає</div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.out ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={[
                          'max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed',
                          m.out
                            ? 'border border-accent/25 bg-accent/15 text-white'
                            : 'border border-white/[0.08] bg-white/[0.04] text-zinc-200'
                        ].join(' ')}
                      >
                        <div className="whitespace-pre-wrap break-words">{m.text || '—'}</div>
                        <div className="mt-1 text-right font-mono text-[10px] text-zinc-500">
                          {formatMsgTime(m.date)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-white/[0.06] p-4">
                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        void sendReply()
                      }
                    }}
                    rows={2}
                    placeholder="Відповідь… (Enter — надіслати, Shift+Enter — новий рядок)"
                    className="min-h-[52px] flex-1 resize-y rounded-2xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  />
                  <motion.button
                    type="button"
                    disabled={sendBusy || status !== 'online' || !replyText.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void sendReply()}
                    className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/15 text-accent hover:bg-accent/20 disabled:opacity-40"
                    aria-label="Надіслати"
                  >
                    {sendBusy ? (
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    ) : (
                      <Send className="h-5 w-5" aria-hidden />
                    )}
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center text-sm text-zinc-500">
              <MessageCircle className="mb-3 h-10 w-10 text-zinc-600" aria-hidden />
              Оберіть діалог зліва
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
