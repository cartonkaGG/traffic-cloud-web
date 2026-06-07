import { Loader2, Plus, SlidersHorizontal, UserCircle, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { TelegramAccountCard } from '@/components/accounts/TelegramAccountCard'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import { useToast } from '@/context/ToastContext'
import * as mocks from '@/data/mocks'
import type { ChatSourceModel, TelegramAccountModel, TelegramAccountStatus } from '@/domain/types'
import {
  apiCreateTelegramAccount,
  apiDeleteTelegramAccount,
  apiProbeProxy,
  apiTestTelegramAccountProxy,
  apiTelegramAccountMtprotoComplete,
  apiTelegramAccountMtprotoImportSession,
  apiTelegramAccountMtprotoSendCode,
  apiTelegramAccountOutreachStart,
  apiTelegramAccountsBulkAbout,
  apiUpdateTelegramAccountProxy
} from '@/lib/api'
import { openTelegramForAccount } from '@/lib/openTelegramForAccount'
import { formatProxyProbeError } from '@/lib/proxyProbeErrors'
import { readOutreachFiltersFromStorage } from '@/lib/outreachFiltersStorage'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type SortKey = 'created_desc' | 'created_asc'

const STATUS_OPTIONS: Array<{ value: TelegramAccountStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Все статусы' },
  { value: 'active', label: 'Активный' },
  { value: 'warming', label: 'Прогрев' },
  { value: 'flood', label: 'FloodWait' },
  { value: 'limited', label: 'Ограничен' },
  { value: 'banned', label: 'Заблокирован' },
  { value: 'disconnected', label: 'Офлайн' }
]

function parsePort(raw: string): number | null {
  const n = Number(raw.trim())
  if (!Number.isFinite(n) || n < 1 || n > 65535) return null
  return Math.floor(n)
}

function socks5ProxyConfigured(
  host: string,
  port: number | string | null | undefined,
  protocol: 'http' | 'socks5'
): boolean {
  const h = host.trim()
  if (!h || protocol !== 'socks5') return false
  const p = typeof port === 'number' ? port : parsePort(String(port ?? ''))
  return p != null
}

function applyMtprotoProxyFromAccount(
  account: TelegramAccountModel,
  setters: {
    setHost: (v: string) => void
    setPort: (v: string) => void
    setType: (v: 'http' | 'socks5') => void
    setEditing: (v: boolean) => void
  }
): void {
  const host = account.proxyHost?.trim() ?? ''
  const port = account.proxyPort ? String(account.proxyPort) : ''
  const type = account.proxyProtocol === 'http' ? 'http' : 'socks5'
  setters.setHost(host)
  setters.setPort(port)
  setters.setType(type)
  setters.setEditing(!socks5ProxyConfigured(host, account.proxyPort, type))
}

export function AccountsPage(): JSX.Element {
  const { bundle, workspaceId, status, refetch } = useWorkspaceData()
  const { pushToast } = useToast()
  const navigate = useNavigate()

  const telegramAccounts = bundle?.telegramAccounts ?? mocks.telegramAccounts
  const providerMtprotoApiConfigured = bundle?.providerMtprotoApiConfigured === true
  const proxiesList = bundle?.proxies ?? mocks.proxies

  const proxyLabel = useMemo(() => {
    const m: Record<string, string> = {}
    for (const p of proxiesList) m[p.id] = p.label
    return m
  }, [proxiesList])

  const [addOpen, setAddOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [proxyHost, setProxyHost] = useState('')
  const [proxyPort, setProxyPort] = useState('')
  const [proxyType, setProxyType] = useState<'http' | 'socks5'>('socks5')
  const [proxyUser, setProxyUser] = useState('')
  const [proxyPass, setProxyPass] = useState('')
  const [addProxyProbeBusy, setAddProxyProbeBusy] = useState(false)
  const [addProxyProbeMsg, setAddProxyProbeMsg] = useState<string | null>(null)
  const [addMtprotoApiId, setAddMtprotoApiId] = useState('')
  const [addMtprotoApiHash, setAddMtprotoApiHash] = useState('')
  const [addMtprotoSession, setAddMtprotoSession] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TelegramAccountStatus | 'all'>('all')
  const [proxyFilter, setProxyFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_desc')
  const chatSources = bundle?.chatSources ?? mocks.chatSources

  const [mtprotoAccount, setMtprotoAccount] = useState<TelegramAccountModel | null>(null)
  const [mtprotoPhone, setMtprotoPhone] = useState('')
  const [mtprotoCode, setMtprotoCode] = useState('')
  const [mtprotoPassword, setMtprotoPassword] = useState('')
  const [mtprotoForceSms, setMtprotoForceSms] = useState(false)
  const [mtprotoBusy, setMtprotoBusy] = useState(false)
  const [mtprotoErr, setMtprotoErr] = useState<string | null>(null)
  const [mtprotoAwait2fa, setMtprotoAwait2fa] = useState(false)
  const [mtprotoCodeHint, setMtprotoCodeHint] = useState<string | null>(null)
  const [mtprotoApiId, setMtprotoApiId] = useState('')
  const [mtprotoApiHash, setMtprotoApiHash] = useState('')
  const [mtprotoSessionPaste, setMtprotoSessionPaste] = useState('')
  const [mtprotoUseSessionPaste, setMtprotoUseSessionPaste] = useState(false)
  const [mtprotoProxyHost, setMtprotoProxyHost] = useState('')
  const [mtprotoProxyPort, setMtprotoProxyPort] = useState('')
  const [mtprotoProxyType, setMtprotoProxyType] = useState<'http' | 'socks5'>('socks5')
  const [mtprotoProxyUser, setMtprotoProxyUser] = useState('')
  const [mtprotoProxyPass, setMtprotoProxyPass] = useState('')
  const [mtprotoProxyEditing, setMtprotoProxyEditing] = useState(false)
  const [mtprotoProxyProbeBusy, setMtprotoProxyProbeBusy] = useState(false)
  const [mtprotoProxyProbeMsg, setMtprotoProxyProbeMsg] = useState<string | null>(null)
  const [telegramWebAccountId, setTelegramWebAccountId] = useState<string | null>(null)
  const mtprotoRequestAbortRef = useRef<AbortController | null>(null)

  function mtprotoNeedsApiInput(): boolean {
    return !mtprotoAccount?.hasMtprotoApiCreds && !providerMtprotoApiConfigured
  }

  function mtprotoApiBody(): { apiId?: string; apiHash?: string } {
    if (!mtprotoNeedsApiInput()) return {}
    const apiId = mtprotoApiId.trim()
    const apiHash = mtprotoApiHash.trim()
    return {
      ...(apiId ? { apiId } : {}),
      ...(apiHash ? { apiHash } : {})
    }
  }

  function mtprotoApiInputError(): string | null {
    if (!mtprotoNeedsApiInput()) return null
    if (!mtprotoApiId.trim() || !mtprotoApiHash.trim()) {
      return 'Вкажіть App api_id та App api_hash (або налаштуйте їх на сервері Traffic Cloud)'
    }
    return null
  }

  const [spamAccount, setSpamAccount] = useState<TelegramAccountModel | null>(null)
  const [spamSourceId, setSpamSourceId] = useState('')
  const [spamMax, setSpamMax] = useState('40')
  const [spamDelay, setSpamDelay] = useState('2800')
  const [spamBusy, setSpamBusy] = useState(false)
  const [spamErr, setSpamErr] = useState<string | null>(null)

  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null)

  const [proxyEditAccount, setProxyEditAccount] = useState<TelegramAccountModel | null>(null)
  const [proxyEditHost, setProxyEditHost] = useState('')
  const [proxyEditPort, setProxyEditPort] = useState('')
  const [proxyEditType, setProxyEditType] = useState<'http' | 'socks5'>('socks5')
  const [proxyEditUser, setProxyEditUser] = useState('')
  const [proxyEditPass, setProxyEditPass] = useState('')
  const [proxyEditBusy, setProxyEditBusy] = useState(false)
  const [proxyEditErr, setProxyEditErr] = useState<string | null>(null)
  const [proxyEditProbeBusy, setProxyEditProbeBusy] = useState(false)
  const [proxyEditProbeMsg, setProxyEditProbeMsg] = useState<string | null>(null)

  const [bulkAbout, setBulkAbout] = useState('')
  const [bulkAboutBusy, setBulkAboutBusy] = useState(false)

  const probeProxyFields = useCallback(
    async (fields: {
      host: string
      portRaw: string
      protocol: 'http' | 'socks5'
      username: string
      password: string
      setBusy: (v: boolean) => void
      setMsg: (v: string | null) => void
    }): Promise<void> => {
      if (!workspaceId || status !== 'online') {
        pushToast('Немає підключення до API', 'error')
        return
      }
      const host = fields.host.trim()
      if (!host) {
        fields.setMsg('Вкажіть host проксі')
        return
      }
      const port = parsePort(fields.portRaw)
      if (port === null) {
        fields.setMsg(formatProxyProbeError('invalid_port'))
        return
      }
      fields.setBusy(true)
      fields.setMsg(null)
      try {
        const r = await apiProbeProxy(workspaceId, {
          host,
          port,
          protocol: fields.protocol,
          username: fields.username.trim() || null,
          password: fields.password.trim() || null
        })
        if (r.ok) {
          const note =
            fields.protocol === 'socks5'
              ? `OK · ${r.latencyMs} ms до Telegram (з сервера API, SOCKS5)`
              : `OK · ${r.latencyMs} ms до Telegram (HTTP; для MTProto потрібен SOCKS5)`
          fields.setMsg(note)
          pushToast(`Проксі працює · ${r.latencyMs} ms`, 'ok')
          return
        }
        const err = formatProxyProbeError(r.error)
        fields.setMsg(err)
        pushToast(err, 'error')
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        fields.setMsg(msg)
        pushToast(msg, 'error')
      } finally {
        fields.setBusy(false)
      }
    },
    [workspaceId, status, pushToast]
  )

  const probeSavedAccountProxy = useCallback(async (): Promise<void> => {
    if (!workspaceId || status !== 'online' || !mtprotoAccount) {
      pushToast('Немає підключення до API', 'error')
      return
    }
    setMtprotoProxyProbeBusy(true)
    setMtprotoProxyProbeMsg(null)
    try {
      const r = await apiTestTelegramAccountProxy(workspaceId, mtprotoAccount.id)
      if (r.ok) {
        const note = `OK · ${r.latencyMs} ms до Telegram (з сервера API)`
        setMtprotoProxyProbeMsg(note)
        pushToast(`Проксі працює · ${r.latencyMs} ms`, 'ok')
        return
      }
      const err = formatProxyProbeError(r.error)
      setMtprotoProxyProbeMsg(err)
      pushToast(err, 'error')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setMtprotoProxyProbeMsg(msg)
      pushToast(msg, 'error')
    } finally {
      setMtprotoProxyProbeBusy(false)
    }
  }, [workspaceId, status, mtprotoAccount, pushToast])

  const resetForm = useCallback(() => {
    setUsername('')
    setPhone('')
    setProxyHost('')
    setProxyPort('')
    setProxyType('socks5')
    setProxyUser('')
    setProxyPass('')
    setAddProxyProbeMsg(null)
    setAddMtprotoApiId('')
    setAddMtprotoApiHash('')
    setAddMtprotoSession('')
    setFormError(null)
  }, [])

  const closeAdd = useCallback(() => {
    if (busy) return
    setAddOpen(false)
    resetForm()
  }, [busy, resetForm])

  const filteredAccounts = useMemo(() => {
    let list: TelegramAccountModel[] = [...telegramAccounts]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((a) => {
        const u = (a.username ?? '').toLowerCase()
        const l = a.label.toLowerCase()
        return u.includes(q) || l.includes(q) || `@${u}`.includes(q)
      })
    }
    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter)
    }
    if (proxyFilter !== 'all') {
      list = list.filter((a) => a.proxyId === proxyFilter)
    }
    return list
  }, [telegramAccounts, search, statusFilter, proxyFilter])

  const openProxyEditModal = useCallback((account: TelegramAccountModel) => {
    setProxyEditErr(null)
    setProxyEditProbeMsg(null)
    setProxyEditUser('')
    setProxyEditPass('')
    setProxyEditHost(account.proxyHost?.trim() ?? '')
    setProxyEditPort(account.proxyPort ? String(account.proxyPort) : '')
    setProxyEditType(account.proxyProtocol === 'http' ? 'http' : 'socks5')
    setProxyEditAccount(account)
  }, [])

  const closeProxyEditModal = useCallback(() => {
    if (proxyEditBusy) return
    setProxyEditAccount(null)
    setProxyEditErr(null)
    setProxyEditProbeMsg(null)
    setProxyEditHost('')
    setProxyEditPort('')
    setProxyEditType('socks5')
    setProxyEditUser('')
    setProxyEditPass('')
  }, [proxyEditBusy])

  const saveProxyEdit = useCallback(async () => {
    if (!workspaceId || status !== 'online' || !proxyEditAccount) {
      pushToast('Немає підключення до API', 'error')
      return
    }
    const host = proxyEditHost.trim()
    let port: number | null = null
    if (host) {
      const parsed = parsePort(proxyEditPort)
      if (parsed === null) {
        setProxyEditErr('Порт проксі: число 1–65535')
        return
      }
      port = parsed
    }
    setProxyEditBusy(true)
    setProxyEditErr(null)
    try {
      const pass = proxyEditPass.trim()
      const r = await apiUpdateTelegramAccountProxy(workspaceId, proxyEditAccount.id, {
        proxyHost: host || null,
        proxyPort: port,
        proxyProtocol: proxyEditType,
        proxyUsername: proxyEditUser.trim() || null,
        ...(pass ? { proxyPassword: pass } : {})
      })
      setProxyEditAccount(r.account)
      setMtprotoAccount((a) => (a?.id === r.account.id ? r.account : a))
      await refetch()
      pushToast(host ? 'Проксі збережено' : 'Проксі прибрано', 'ok')
      closeProxyEditModal()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setProxyEditErr(msg)
      pushToast(msg, 'error')
    } finally {
      setProxyEditBusy(false)
    }
  }, [
    workspaceId,
    status,
    proxyEditAccount,
    proxyEditHost,
    proxyEditPort,
    proxyEditType,
    proxyEditUser,
    proxyEditPass,
    refetch,
    pushToast,
    closeProxyEditModal
  ])

  const openMtprotoModal = useCallback((account: TelegramAccountModel) => {
    setMtprotoErr(null)
    setMtprotoAwait2fa(false)
    setMtprotoCodeHint(null)
    setMtprotoCode('')
    setMtprotoPassword('')
    const ph =
      account.phone && account.phone !== '—'
        ? account.phone.replace(/[^\d+]/g, '') || account.phone.trim()
        : ''
    setMtprotoPhone(ph)
    setMtprotoForceSms(false)
    setMtprotoApiId(account.mtprotoApiId ? String(account.mtprotoApiId) : '')
    setMtprotoApiHash('')
    setMtprotoSessionPaste('')
    setMtprotoUseSessionPaste(false)
    setMtprotoProxyUser('')
    setMtprotoProxyPass('')
    applyMtprotoProxyFromAccount(account, {
      setHost: setMtprotoProxyHost,
      setPort: setMtprotoProxyPort,
      setType: setMtprotoProxyType,
      setEditing: setMtprotoProxyEditing
    })
    setMtprotoAccount(account)
  }, [])

  const persistMtprotoProxy = useCallback(async (): Promise<boolean> => {
    if (!workspaceId || status !== 'online' || !mtprotoAccount) return false
    const host = mtprotoProxyHost.trim()
    let port: number | null = null
    if (host) {
      const parsed = parsePort(mtprotoProxyPort)
      if (parsed === null) {
        setMtprotoErr('Порт проксі: число 1–65535')
        return false
      }
      port = parsed
    }
    const acc = mtprotoAccount
    const accType = acc.proxyProtocol === 'http' ? 'http' : 'socks5'
    const proxyUnchanged =
      !mtprotoProxyPass.trim() &&
      !mtprotoProxyUser.trim() &&
      (acc.proxyHost?.trim() ?? '') === host &&
      (host ? acc.proxyPort === port : !acc.proxyHost?.trim()) &&
      accType === mtprotoProxyType
    if (proxyUnchanged) return true
    try {
      const pass = mtprotoProxyPass.trim()
      const r = await apiUpdateTelegramAccountProxy(workspaceId, mtprotoAccount.id, {
        proxyHost: host || null,
        proxyPort: port,
        proxyProtocol: mtprotoProxyType,
        proxyUsername: mtprotoProxyUser.trim() || null,
        ...(pass ? { proxyPassword: pass } : {})
      })
      setMtprotoAccount(r.account)
      await refetch()
      return true
    } catch (e) {
      setMtprotoErr(e instanceof Error ? e.message : String(e))
      return false
    }
  }, [
    workspaceId,
    status,
    mtprotoAccount,
    mtprotoProxyHost,
    mtprotoProxyPort,
    mtprotoProxyType,
    mtprotoProxyUser,
    mtprotoProxyPass,
    refetch
  ])

  const openInbox = useCallback(
    (account: TelegramAccountModel) => {
      navigate(`/inbox?account=${encodeURIComponent(account.id)}`)
    },
    [navigate]
  )

  const openTelegramWeb = useCallback(
    async (account: TelegramAccountModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Немає підключення до API', 'error')
        return
      }
      setTelegramWebAccountId(account.id)
      try {
        const r = await openTelegramForAccount(workspaceId, account)
        if (!r.ok) {
          pushToast(r.error, 'error')
          return
        }
        if (r.mode === 'electron') {
          pushToast('Telegram Web відкрито з проксі цього акаунта', 'ok')
        } else {
          pushToast(
            'Відкрито web.telegram.org. Для проксі в браузері використовуйте десктоп-додаток Traffic Cloud.',
            'info'
          )
        }
      } finally {
        setTelegramWebAccountId(null)
      }
    },
    [workspaceId, status, pushToast]
  )

  const closeMtprotoModal = useCallback(() => {
    mtprotoRequestAbortRef.current?.abort()
    mtprotoRequestAbortRef.current = null
    setMtprotoAccount(null)
    setMtprotoErr(null)
    setMtprotoAwait2fa(false)
    setMtprotoCodeHint(null)
    setMtprotoCode('')
    setMtprotoPassword('')
    setMtprotoApiId('')
    setMtprotoApiHash('')
    setMtprotoSessionPaste('')
    setMtprotoUseSessionPaste(false)
    setMtprotoProxyHost('')
    setMtprotoProxyPort('')
    setMtprotoProxyType('socks5')
    setMtprotoProxyUser('')
    setMtprotoProxyPass('')
    setMtprotoProxyEditing(false)
    setMtprotoProxyProbeMsg(null)
  }, [])

  const sendMtprotoCode = useCallback(async () => {
    if (!workspaceId || status !== 'online' || !mtprotoAccount) {
      pushToast('Нет подключения к API', 'error')
      return
    }
    const apiErr = mtprotoApiInputError()
    if (apiErr) {
      setMtprotoErr(apiErr)
      return
    }
    const ph = mtprotoPhone.trim()
    if (!ph) {
      setMtprotoErr('Вкажіть номер телефона')
      return
    }
    if (!(await persistMtprotoProxy())) return
    mtprotoRequestAbortRef.current?.abort()
    const ac = new AbortController()
    mtprotoRequestAbortRef.current = ac
    setMtprotoBusy(true)
    setMtprotoErr(null)
    try {
      const r = await apiTelegramAccountMtprotoSendCode(
        workspaceId,
        mtprotoAccount.id,
        {
          phone: ph,
          forceSMS: mtprotoForceSms,
          ...mtprotoApiBody()
        },
        { signal: ac.signal }
      )
      setMtprotoCodeHint(
        r.isCodeViaApp
          ? 'Код у застосунку Telegram на цьому номері. За потреби увімкніть «Лише SMS» і надішліть код знову.'
          : 'Код надіслано SMS.'
      )
      if (r.mtprotoProxyMode === 'socks5') {
        pushToast('Код надіслано через SOCKS5 — у Telegram буде IP проксі', 'ok')
      } else if (r.httpProxySkipped || r.mtprotoProxyMode === 'http_ignored') {
        pushToast(
          'HTTP-проксі не працює для MTProto. Оберіть SOCKS5 перед входом — інакше в сесії буде IP сервера API.',
          'error'
        )
      } else {
        pushToast('Код надіслано (без проксі — IP сервера API)', 'info')
      }
    } catch (e) {
      if (ac.signal.aborted) return
      const msg = e instanceof Error ? e.message : String(e)
      setMtprotoErr(msg)
      pushToast(msg, 'error')
    } finally {
      if (mtprotoRequestAbortRef.current === ac) mtprotoRequestAbortRef.current = null
      setMtprotoBusy(false)
    }
  }, [
    workspaceId,
    status,
    mtprotoAccount,
    mtprotoPhone,
    mtprotoForceSms,
    mtprotoApiId,
    mtprotoApiHash,
    persistMtprotoProxy,
    pushToast
  ])

  const importMtprotoSession = useCallback(async () => {
    if (!workspaceId || status !== 'online' || !mtprotoAccount) {
      pushToast('Нет подключения к API', 'error')
      return
    }
    const apiErr = mtprotoApiInputError()
    if (apiErr) {
      setMtprotoErr(apiErr)
      return
    }
    if (!mtprotoSessionPaste.trim()) {
      setMtprotoErr('Вставте session string')
      return
    }
    if (!(await persistMtprotoProxy())) return
    setMtprotoBusy(true)
    setMtprotoErr(null)
    try {
      const r = await apiTelegramAccountMtprotoImportSession(workspaceId, mtprotoAccount.id, {
        sessionString: mtprotoSessionPaste.trim(),
        ...mtprotoApiBody()
      })
      if (!r.ok) {
        setMtprotoErr(r.message)
        pushToast(r.message, 'error')
        return
      }
      pushToast('Session string збережено', 'ok')
      closeMtprotoModal()
      await refetch()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setMtprotoErr(msg)
      pushToast(msg, 'error')
    } finally {
      setMtprotoBusy(false)
    }
  }, [
    workspaceId,
    status,
    mtprotoAccount,
    mtprotoApiId,
    mtprotoApiHash,
    mtprotoSessionPaste,
    refetch,
    pushToast,
    closeMtprotoModal,
    persistMtprotoProxy
  ])

  const completeMtprotoLogin = useCallback(async () => {
    if (!workspaceId || status !== 'online' || !mtprotoAccount) {
      pushToast('Нет подключения к API', 'error')
      return
    }
    const apiErr = mtprotoApiInputError()
    if (apiErr) {
      setMtprotoErr(apiErr)
      return
    }
    if (!mtprotoAwait2fa && !mtprotoCode.trim()) {
      setMtprotoErr('Введіть код з Telegram або SMS')
      return
    }
    if (mtprotoAwait2fa && !mtprotoPassword.trim()) {
      setMtprotoErr('Введіть пароль 2FA')
      return
    }
    mtprotoRequestAbortRef.current?.abort()
    const ac = new AbortController()
    mtprotoRequestAbortRef.current = ac
    setMtprotoBusy(true)
    setMtprotoErr(null)
    try {
      const r = await apiTelegramAccountMtprotoComplete(
        workspaceId,
        mtprotoAccount.id,
        {
          phoneCode: mtprotoAwait2fa ? '' : mtprotoCode.trim(),
          password: mtprotoPassword.trim() || null,
          ...mtprotoApiBody()
        },
        { signal: ac.signal }
      )
      if (r.ok) {
        pushToast(
          'Session string згенеровано і збережено автоматично. Можна «Запустити спам» по розпарсеній базі.',
          'ok'
        )
        closeMtprotoModal()
        await refetch()
        return
      }
      if (r.twoFactorRequired) {
        setMtprotoAwait2fa(true)
        pushToast('Потрібен пароль двофакторної аутентифікації Telegram.', 'info')
        return
      }
      setMtprotoErr(r.message)
      pushToast(r.message, 'error')
    } catch (e) {
      if (ac.signal.aborted) return
      const msg = e instanceof Error ? e.message : String(e)
      setMtprotoErr(msg)
      pushToast(msg, 'error')
    } finally {
      if (mtprotoRequestAbortRef.current === ac) mtprotoRequestAbortRef.current = null
      setMtprotoBusy(false)
    }
  }, [
    workspaceId,
    status,
    mtprotoAccount,
    mtprotoCode,
    mtprotoPassword,
    mtprotoAwait2fa,
    mtprotoApiId,
    mtprotoApiHash,
    refetch,
    pushToast,
    closeMtprotoModal
  ])

  const openSpamModal = useCallback(
    (account: TelegramAccountModel) => {
      setSpamErr(null)
      setSpamAccount(account)
      const first = chatSources[0]?.id ?? ''
      setSpamSourceId(first)
      setSpamMax('40')
      setSpamDelay('2800')
    },
    [chatSources]
  )

  const closeSpamModal = useCallback(() => {
    if (spamBusy) return
    setSpamAccount(null)
    setSpamErr(null)
  }, [spamBusy])

  const startSpamOutreach = useCallback(async () => {
    if (!workspaceId || status !== 'online' || !spamAccount) return
    if (!spamSourceId) {
      setSpamErr('Оберіть джерело аудиторії (спочатку розпарсіть чат у «Джерела»).')
      return
    }
    const maxN = Number(spamMax)
    const delayN = Number(spamDelay)
    if (!Number.isFinite(maxN) || maxN < 1) {
      setSpamErr('Ліміт повідомлень: число від 1')
      return
    }
    if (!Number.isFinite(delayN) || delayN < 500) {
      setSpamErr('Затримка (мс): мінімум 500')
      return
    }
    setSpamBusy(true)
    setSpamErr(null)
    try {
      const { user, safety } = readOutreachFiltersFromStorage()
      const r = await apiTelegramAccountOutreachStart(workspaceId, spamAccount.id, {
        sourceId: spamSourceId,
        maxMessages: Math.floor(maxN),
        delayMs: Math.floor(delayN),
        templateMode: 'random',
        userFilters: user,
        safetyFilters: safety
      })
      if (!r.ok) {
        setSpamErr(r.error ?? 'Помилка')
        pushToast(r.error ?? 'Помилка', 'error')
        return
      }
      pushToast('Розсилку запущено у фоні — стежте за журналом подій.', 'ok')
      closeSpamModal()
      await refetch()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setSpamErr(msg)
      pushToast(msg, 'error')
    } finally {
      setSpamBusy(false)
    }
  }, [
    workspaceId,
    status,
    spamAccount,
    spamSourceId,
    spamMax,
    spamDelay,
    refetch,
    pushToast,
    closeSpamModal
  ])

  const deleteTelegramAccount = useCallback(
    async (account: TelegramAccountModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Нет подключения к API', 'error')
        return
      }
      const ok = window.confirm(
        `Видалити акаунт «${account.label}» (@${account.username ?? '—'})? Дію не скасувати.`
      )
      if (!ok) return
      setDeletingAccountId(account.id)
      try {
        await apiDeleteTelegramAccount(workspaceId, account.id)
        setMtprotoAccount((a) => (a?.id === account.id ? null : a))
        setSpamAccount((a) => (a?.id === account.id ? null : a))
        pushToast('Акаунт видалено', 'ok')
        await refetch()
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        pushToast(msg, 'error')
      } finally {
        setDeletingAccountId(null)
      }
    },
    [workspaceId, status, pushToast, refetch]
  )

  const submitAdd = useCallback(async () => {
    setFormError(null)
    if (!workspaceId || status !== 'online') {
      setFormError('Нет подключения к API')
      return
    }
    const u = username.trim()
    if (!u) {
      setFormError('Укажите Telegram username')
      return
    }
    const host = proxyHost.trim()
    let port: number | undefined
    if (host) {
      const parsed = parsePort(proxyPort)
      if (parsed === null) {
        setFormError('Порт прокси: число 1–65535')
        return
      }
      port = parsed
    }
    const apiId = addMtprotoApiId.trim()
    const apiHash = addMtprotoApiHash.trim()
    const sessionPaste = addMtprotoSession.trim()
    if (sessionPaste && !apiId && !apiHash && !providerMtprotoApiConfigured) {
      setFormError('Для session string потрібні API-ключі (на сервері або вручну)')
      return
    }
    setBusy(true)
    try {
      const res = await apiCreateTelegramAccount(workspaceId, {
        telegramUsername: u,
        phone: phone.trim() || null,
        ...(host && port != null
          ? {
              proxyHost: host,
              proxyPort: port,
              proxyProtocol: proxyType,
              proxyUsername: proxyUser.trim() || null,
              proxyPassword: proxyPass.trim() || null
            }
          : {}),
        ...(apiId && apiHash ? { mtprotoApiId: apiId, mtprotoApiHash: apiHash } : {}),
        ...(sessionPaste ? { mtprotoSessionString: sessionPaste } : {})
      })
      const sessionSaved = res.account.hasMtprotoSession === true
      pushToast(
        sessionSaved ? 'Акаунт і MTProto session збережені' : 'Акаунт збережено',
        'ok'
      )
      closeAdd()
      await refetch()

      const needsMtprotoLogin = !sessionSaved && (providerMtprotoApiConfigured || (apiId && apiHash))
      if (needsMtprotoLogin) {
        setMtprotoAccount(res.account)
        setMtprotoApiId(apiId)
        setMtprotoApiHash(apiHash)
        setMtprotoPhone(
          phone.trim() ||
            (res.account.phone && res.account.phone !== '—'
              ? res.account.phone.replace(/[^\d+]/g, '') || res.account.phone.trim()
              : '')
        )
        setMtprotoProxyUser(proxyUser)
        setMtprotoProxyPass(proxyPass)
        const savedHost = res.account.proxyHost?.trim() || host
        const savedPort = res.account.proxyPort ?? port
        const savedType =
          res.account.proxyProtocol === 'http'
            ? 'http'
            : res.account.proxyProtocol === 'socks5'
              ? 'socks5'
              : proxyType
        setMtprotoProxyHost(savedHost)
        setMtprotoProxyPort(savedPort != null ? String(savedPort) : '')
        setMtprotoProxyType(savedType)
        setMtprotoProxyEditing(!socks5ProxyConfigured(savedHost, savedPort, savedType))
        setMtprotoCode('')
        setMtprotoPassword('')
        setMtprotoAwait2fa(false)
        setMtprotoErr(null)
        setMtprotoCodeHint(null)
        setMtprotoForceSms(false)
      }

    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setFormError(msg)
      pushToast(msg, 'error')
    } finally {
      setBusy(false)
    }
  }, [
    workspaceId,
    status,
    username,
    phone,
    proxyHost,
    proxyPort,
    proxyType,
    proxyUser,
    proxyPass,
    addMtprotoApiId,
    addMtprotoApiHash,
    addMtprotoSession,
    providerMtprotoApiConfigured,
    refetch,
    closeAdd,
    pushToast
  ])

  const runBulkAbout = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      pushToast('Немає підключення до API', 'error')
      return
    }
    const withMt = telegramAccounts.filter((a) => a.hasMtprotoSession)
    if (withMt.length === 0) {
      pushToast('Немає акаунтів з MTProto-сесією (спочатку «Код Telegram»)', 'error')
      return
    }
    setBulkAboutBusy(true)
    try {
      const r = await apiTelegramAccountsBulkAbout(workspaceId, { about: bulkAbout })
      const ok = r.results.filter((x) => x.ok).length
      const bad = r.results.filter((x) => !x.ok)
      pushToast(`Bio оновлено: ${ok} з ${r.results.length}`, ok === r.results.length ? 'ok' : 'info')
      if (bad.length > 0 && bad.length <= 3) {
        bad.forEach((b) => pushToast(`${b.label}: ${b.error ?? 'помилка'}`, 'error'))
      }
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), 'error')
    } finally {
      setBulkAboutBusy(false)
    }
  }, [workspaceId, status, bulkAbout, telegramAccounts, pushToast])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500">
            Додайте Telegram-акаунт з MTProto session — через нього йде парсинг і розсилка DM. Проксі (SOCKS5)
            опціонально вказується тут же, якщо потрібен окремий IP для акаунта.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/15 hover:text-white"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Фильтры
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              resetForm()
              setAddOpen(true)
            }}
            disabled={status !== 'online' || !workspaceId}
            className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent shadow-[0_0_24px_-8px_rgba(94,200,255,0.55)] transition-colors hover:bg-accent/15 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Добавить аккаунт
          </motion.button>
        </div>
      </div>

      <div className="glass-panel max-w-3xl space-y-4 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
            <UserCircle className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white">Масове оновлення bio (Telegram «Про себе»)</div>
            <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">
              Для всіх акаунтів з активною MTProto-сесією (той самий api_id/api_hash, що в налаштуваннях парсера).
              До 70 символів; між акаунтами є пауза проти flood.
            </p>
            <textarea
              value={bulkAbout}
              onChange={(e) => setBulkAbout(e.target.value)}
              rows={3}
              maxLength={70}
              placeholder="Текст bio для всіх акаунтів…"
              className="mt-3 w-full resize-y rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
            />
            <div className="mt-1 text-right text-[11px] text-zinc-600">{bulkAbout.length}/70</div>
            <motion.button
              type="button"
              disabled={bulkAboutBusy || status !== 'online' || !workspaceId}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => void runBulkAbout()}
              className="mt-2 inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent/15 disabled:opacity-40"
            >
              {bulkAboutBusy ? 'Оновлення…' : 'Застосувати до всіх'}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {addOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeAdd()}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="glass-panel relative max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-6 shadow-glow"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">Новый Telegram-аккаунт</div>
                  <p className="mt-1 text-[13px] text-zinc-500">
                    Проксі необов&apos;язковий — можна залишити порожнім. Після збереження налаштуйте MTProto session
                    (код Telegram або вставка session string).
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                  aria-label="Закрыть"
                  onClick={() => closeAdd()}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {formError ? <p className="text-[13px] text-red-300/95">{formError}</p> : null}

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Telegram username
                </span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  placeholder="@orbit_ops или orbit_ops"
                  autoComplete="off"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Телефон (опционально)
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  placeholder="+380…"
                  autoComplete="tel"
                />
              </label>

              <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.04] p-4 space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  MTProto (опционально)
                </p>
                {providerMtprotoApiConfigured ? (
                  <p className="text-[12px] text-emerald-200/90">
                    API-ключі Telegram підставляються автоматично. Після збереження акаунта увійдіть через «Код
                    Telegram» — session string згенерується сам.
                  </p>
                ) : (
                  <>
                    <p className="text-[12px] text-zinc-500">
                      Вкажіть api_id та api_hash, або зверніться до підтримки Traffic Cloud для автоматичного
                      підключення.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          App api_id
                        </span>
                        <input
                          value={addMtprotoApiId}
                          onChange={(e) => setAddMtprotoApiId(e.target.value)}
                          inputMode="numeric"
                          className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                          placeholder="12345678"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          App api_hash
                        </span>
                        <input
                          value={addMtprotoApiHash}
                          onChange={(e) => setAddMtprotoApiHash(e.target.value)}
                          type="password"
                          className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                          placeholder="hex-строка"
                        />
                      </label>
                    </div>
                  </>
                )}
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Session string (опционально)
                  </span>
                  <textarea
                    value={addMtprotoSession}
                    onChange={(e) => setAddMtprotoSession(e.target.value)}
                    className="mt-2 min-h-[72px] w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-[12px] text-white outline-none focus:border-accent/35"
                    placeholder="1AAg… — лише якщо вже є готовий session; інакше залиште порожнім"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Проксі (опціонально)
                </p>
                <p className="mt-2 text-[12px] text-zinc-500">
                  Для MTProto-розсилки краще SOCKS5. HTTP-проксі GramJS не використовує — з’єднання піде напряму.
                  Можна залишити порожнім.
                </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Host
                  </span>
                  <input
                    value={proxyHost}
                    onChange={(e) => {
                      setProxyHost(e.target.value)
                      setAddProxyProbeMsg(null)
                    }}
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                    placeholder="proxy.example.com"
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Порт
                  </span>
                  <input
                    value={proxyPort}
                    onChange={(e) => {
                      setProxyPort(e.target.value)
                      setAddProxyProbeMsg(null)
                    }}
                    inputMode="numeric"
                    disabled={!proxyHost.trim()}
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35 disabled:opacity-40"
                    placeholder="1080"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Тип прокси
                  </span>
                  <select
                    value={proxyType}
                    onChange={(e) => {
                      setProxyType(e.target.value === 'socks5' ? 'socks5' : 'http')
                      setAddProxyProbeMsg(null)
                    }}
                    disabled={!proxyHost.trim()}
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35 disabled:opacity-40"
                  >
                    <option value="socks5">SOCKS5 (рекомендовано)</option>
                    <option value="http">HTTP</option>
                  </select>
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Логин прокси (если есть)
                </span>
                <input
                  value={proxyUser}
                  onChange={(e) => {
                    setProxyUser(e.target.value)
                    setAddProxyProbeMsg(null)
                  }}
                  disabled={!proxyHost.trim()}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35 disabled:opacity-40"
                  autoComplete="off"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Пароль прокси (если есть)
                </span>
                <input
                  type="password"
                  value={proxyPass}
                  onChange={(e) => {
                    setProxyPass(e.target.value)
                    setAddProxyProbeMsg(null)
                  }}
                  disabled={!proxyHost.trim()}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35 disabled:opacity-40"
                  autoComplete="new-password"
                />
              </label>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={addProxyProbeBusy || !proxyHost.trim() || status !== 'online'}
                  onClick={() =>
                    void probeProxyFields({
                      host: proxyHost,
                      portRaw: proxyPort,
                      protocol: proxyType,
                      username: proxyUser,
                      password: proxyPass,
                      setBusy: setAddProxyProbeBusy,
                      setMsg: setAddProxyProbeMsg
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-[13px] font-medium text-zinc-200 hover:border-accent/30 hover:text-white disabled:opacity-40"
                >
                  {addProxyProbeBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
                  ) : null}
                  {addProxyProbeBusy ? 'Перевірка…' : 'Перевірити проксі'}
                </button>
                {addProxyProbeMsg ? (
                  <span
                    className={[
                      'text-[12px]',
                      addProxyProbeMsg.startsWith('OK')
                        ? 'text-emerald-300/90'
                        : 'text-rose-300/90'
                    ].join(' ')}
                  >
                    {addProxyProbeMsg}
                  </span>
                ) : null}
              </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => closeAdd()}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.04] disabled:opacity-40"
                >
                  Отмена
                </button>
                <motion.button
                  type="button"
                  disabled={busy || status !== 'online'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void submitAdd()}
                  className="rounded-xl border border-accent/35 bg-accent/15 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-40"
                >
                  {busy ? 'Сохранение…' : 'Сохранить'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {filtersOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFiltersOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              className="glass-panel w-full max-w-md space-y-4 p-6 shadow-glow"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-white">Фильтры аккаунтов</div>
                <button
                  type="button"
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                  aria-label="Закрыть"
                  onClick={() => setFiltersOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Поиск по username / label
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  placeholder="@neo или имя"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Статус
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TelegramAccountStatus | 'all')}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Прокси
                </span>
                <select
                  value={proxyFilter}
                  onChange={(e) => setProxyFilter(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                >
                  <option value="all">Все прокси</option>
                  {proxiesList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} · {p.host}:{p.port}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Сортировка по дате добавления
                </span>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                >
                  <option value="created_desc">Сначала новые</option>
                  <option value="created_asc">Сначала старые</option>
                </select>
              </label>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-xl border border-accent/35 bg-accent/15 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20"
                >
                  Готово
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mtprotoAccount ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeMtprotoModal()}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="glass-panel relative max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-6 shadow-glow"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">Вхід MTProto (код)</div>
                  <p className="mt-1 text-[13px] text-zinc-500">
                    <span className="font-mono text-zinc-300">{mtprotoAccount.label}</span>
                  </p>
                </div>
                <button
                  type="button"
                  disabled={mtprotoBusy}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                  aria-label="Закрити"
                  onClick={() => closeMtprotoModal()}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {mtprotoErr ? <p className="text-[13px] text-red-300/95">{mtprotoErr}</p> : null}

              {mtprotoAccount.hasMtprotoApiCreds ? (
                <p className="text-[13px] text-emerald-200/90">
                  API-ключі вже збережені для цього акаунта (api_id: {mtprotoAccount.mtprotoApiId ?? '—'}).
                  Можна одразу надсилати код або вставити session string.
                </p>
              ) : providerMtprotoApiConfigured ? (
                <p className="text-[13px] text-emerald-200/90">
                  API-ключі Traffic Cloud підключені автоматично — введіть номер і код Telegram.
                </p>
              ) : (
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-4 space-y-3">
                  <p className="text-[12px] text-zinc-400">
                    Вкажіть App api_id та App api_hash для входу, або зверніться до підтримки Traffic Cloud.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block sm:col-span-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        App api_id
                      </span>
                      <input
                        value={mtprotoApiId}
                        onChange={(e) => setMtprotoApiId(e.target.value)}
                        inputMode="numeric"
                        className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                        placeholder="12345678"
                      />
                    </label>
                    <label className="block sm:col-span-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        App api_hash
                      </span>
                      <input
                        value={mtprotoApiHash}
                        onChange={(e) => setMtprotoApiHash(e.target.value)}
                        type="password"
                        className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                        placeholder="hex-строка"
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 space-y-3">
                {socks5ProxyConfigured(mtprotoProxyHost, mtprotoProxyPort, mtprotoProxyType) &&
                !mtprotoProxyEditing ? (
                  <>
                    <p className="text-[12px] text-emerald-100/90">
                      <strong className="font-medium">Проксі вже збережено</strong> — MTProto піде через{' '}
                      <span className="font-mono text-emerald-50">
                        {mtprotoProxyHost}:{mtprotoProxyPort}
                      </span>{' '}
                      (SOCKS5). Повторно вводити не потрібно.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={mtprotoProxyProbeBusy || status !== 'online'}
                        onClick={() => void probeSavedAccountProxy()}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-1.5 text-[12px] font-medium text-zinc-200 hover:border-accent/30 hover:text-white disabled:opacity-40"
                      >
                        {mtprotoProxyProbeBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" aria-hidden />
                        ) : null}
                        {mtprotoProxyProbeBusy ? 'Перевірка…' : 'Перевірити проксі'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMtprotoProxyEditing(true)}
                        className="text-[12px] font-medium text-amber-200/90 hover:text-amber-100"
                      >
                        Змінити проксі
                      </button>
                    </div>
                    {mtprotoProxyProbeMsg ? (
                      <p
                        className={[
                          'text-[12px]',
                          mtprotoProxyProbeMsg.startsWith('OK')
                            ? 'text-emerald-300/90'
                            : 'text-rose-300/90'
                        ].join(' ')}
                      >
                        {mtprotoProxyProbeMsg}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p className="text-[12px] text-amber-100/90">
                      <strong className="font-medium">SOCKS5 проксі</strong> — щоб у Telegram був IP проксі, а не
                      сервера API. Якщо вже вказали при додаванні акаунта — просто надішліть код.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          Host
                        </span>
                        <input
                          value={mtprotoProxyHost}
                          onChange={(e) => {
                            setMtprotoProxyHost(e.target.value)
                            setMtprotoProxyProbeMsg(null)
                          }}
                          className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                          placeholder="proxy.example.com"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          Порт
                        </span>
                        <input
                          value={mtprotoProxyPort}
                          onChange={(e) => {
                            setMtprotoProxyPort(e.target.value)
                            setMtprotoProxyProbeMsg(null)
                          }}
                          inputMode="numeric"
                          className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                          placeholder="1080"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          Тип
                        </span>
                        <select
                          value={mtprotoProxyType}
                          onChange={(e) => {
                            setMtprotoProxyType(e.target.value === 'http' ? 'http' : 'socks5')
                            setMtprotoProxyProbeMsg(null)
                          }}
                          className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                        >
                          <option value="socks5">SOCKS5 (для MTProto)</option>
                          <option value="http">HTTP (лише браузер)</option>
                        </select>
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          Логін (якщо є)
                        </span>
                        <input
                          value={mtprotoProxyUser}
                          onChange={(e) => {
                            setMtprotoProxyUser(e.target.value)
                            setMtprotoProxyProbeMsg(null)
                          }}
                          className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                          autoComplete="off"
                        />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                          Пароль (якщо є)
                        </span>
                        <input
                          type="password"
                          value={mtprotoProxyPass}
                          onChange={(e) => {
                            setMtprotoProxyPass(e.target.value)
                            setMtprotoProxyProbeMsg(null)
                          }}
                          className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                          autoComplete="new-password"
                          placeholder="Залиште порожнім, якщо не змінюєте"
                        />
                      </label>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={
                          mtprotoProxyProbeBusy || !mtprotoProxyHost.trim() || status !== 'online'
                        }
                        onClick={() =>
                          void probeProxyFields({
                            host: mtprotoProxyHost,
                            portRaw: mtprotoProxyPort,
                            protocol: mtprotoProxyType,
                            username: mtprotoProxyUser,
                            password: mtprotoProxyPass,
                            setBusy: setMtprotoProxyProbeBusy,
                            setMsg: setMtprotoProxyProbeMsg
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-1.5 text-[12px] font-medium text-zinc-200 hover:border-accent/30 hover:text-white disabled:opacity-40"
                      >
                        {mtprotoProxyProbeBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" aria-hidden />
                        ) : null}
                        {mtprotoProxyProbeBusy ? 'Перевірка…' : 'Перевірити проксі'}
                      </button>
                      {mtprotoAccount?.mtprotoUsesProxy ? (
                        <button
                          type="button"
                          onClick={() => {
                            applyMtprotoProxyFromAccount(mtprotoAccount, {
                              setHost: setMtprotoProxyHost,
                              setPort: setMtprotoProxyPort,
                              setType: setMtprotoProxyType,
                              setEditing: setMtprotoProxyEditing
                            })
                            setMtprotoProxyProbeMsg(null)
                          }}
                          className="text-[12px] text-zinc-500 hover:text-zinc-300"
                        >
                          Скасувати зміни
                        </button>
                      ) : null}
                    </div>
                    {mtprotoProxyProbeMsg ? (
                      <p
                        className={[
                          'text-[12px]',
                          mtprotoProxyProbeMsg.startsWith('OK')
                            ? 'text-emerald-300/90'
                            : 'text-rose-300/90'
                        ].join(' ')}
                      >
                        {mtprotoProxyProbeMsg}
                      </p>
                    ) : null}
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMtprotoUseSessionPaste(false)}
                  className={[
                    'flex-1 rounded-xl border px-3 py-2 text-[12px] font-medium',
                    !mtprotoUseSessionPaste
                      ? 'border-accent/35 bg-accent/15 text-accent'
                      : 'border-white/10 text-zinc-500'
                  ].join(' ')}
                >
                  Вхід по коду
                </button>
                <button
                  type="button"
                  onClick={() => setMtprotoUseSessionPaste(true)}
                  className={[
                    'flex-1 rounded-xl border px-3 py-2 text-[12px] font-medium',
                    mtprotoUseSessionPaste
                      ? 'border-accent/35 bg-accent/15 text-accent'
                      : 'border-white/10 text-zinc-500'
                  ].join(' ')}
                >
                  Вставити session
                </button>
              </div>

              {mtprotoUseSessionPaste ? (
                <>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Session string
                    </span>
                    <textarea
                      value={mtprotoSessionPaste}
                      onChange={(e) => setMtprotoSessionPaste(e.target.value)}
                      className="mt-2 min-h-[88px] w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-[12px] text-white outline-none focus:border-accent/35"
                      placeholder="1AAg…"
                    />
                  </label>
                  <div className="flex flex-wrap justify-end gap-3 pt-2">
                    <button
                      type="button"
                      disabled={mtprotoBusy}
                      onClick={() => closeMtprotoModal()}
                      className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.04] disabled:opacity-40"
                    >
                      Закрити
                    </button>
                    <motion.button
                      type="button"
                      disabled={mtprotoBusy || status !== 'online'}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => void importMtprotoSession()}
                      className="rounded-xl border border-accent/35 bg-accent/15 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-40"
                    >
                      {mtprotoBusy ? 'Зачекайте…' : 'Зберегти session'}
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
              {mtprotoCodeHint && !mtprotoAwait2fa ? (
                <p className="text-[13px] text-sky-200/90">{mtprotoCodeHint}</p>
              ) : null}
              {mtprotoAwait2fa ? (
                <p className="text-[13px] text-amber-200/90">Введіть пароль двофакторної аутентифікації.</p>
              ) : null}

              {!mtprotoAwait2fa ? (
                <>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Телефон
                    </span>
                    <input
                      value={mtprotoPhone}
                      onChange={(e) => setMtprotoPhone(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                      placeholder="+380…"
                      autoComplete="tel"
                    />
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-zinc-400">
                    <input
                      type="checkbox"
                      checked={mtprotoForceSms}
                      onChange={(e) => setMtprotoForceSms(e.target.checked)}
                      className="rounded border-white/20 bg-black/40"
                    />
                    Лише SMS (повторно надішле код SMS)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={mtprotoBusy || status !== 'online'}
                      onClick={() => void sendMtprotoCode()}
                      className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white hover:bg-white/[0.1] disabled:opacity-40"
                    >
                      Надіслати код
                    </button>
                  </div>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Код з Telegram / SMS
                    </span>
                    <input
                      value={mtprotoCode}
                      onChange={(e) => setMtprotoCode(e.target.value)}
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
                  value={mtprotoPassword}
                  onChange={(e) => setMtprotoPassword(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                  autoComplete="current-password"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={mtprotoBusy}
                  onClick={() => closeMtprotoModal()}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.04] disabled:opacity-40"
                >
                  Закрити
                </button>
                <motion.button
                  type="button"
                  disabled={mtprotoBusy || status !== 'online'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void completeMtprotoLogin()}
                  className="rounded-xl border border-accent/35 bg-accent/15 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-40"
                >
                  {mtprotoBusy ? 'Зачекайте…' : mtprotoAwait2fa ? 'Підтвердити 2FA' : 'Увійти та зберегти сесію'}
                </motion.button>
              </div>
                </>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {spamAccount ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeSpamModal()}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              className="glass-panel w-full max-w-md space-y-4 p-6 shadow-glow"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">Запустити розсилку DM</div>
                  <p className="mt-1 text-[13px] text-zinc-500">
                    Текст — з активного шаблону. Отримувачі — у випадковому порядку, лише з @username; кожному
                    користувачу з цього акаунта пишемо один раз (повтори збережені локально).
                  </p>
                </div>
                <button
                  type="button"
                  disabled={spamBusy}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                  aria-label="Закрити"
                  onClick={() => closeSpamModal()}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {spamErr ? <p className="text-[13px] text-red-300/95">{spamErr}</p> : null}

              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Джерело аудиторії
                </span>
                <select
                  value={spamSourceId}
                  onChange={(e) => setSpamSourceId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                >
                  {chatSources.length === 0 ? (
                    <option value="">Немає джерел — додайте та розпарсіть у розділі «Джерела»</option>
                  ) : (
                    chatSources.map((s: ChatSourceModel) => (
                      <option key={s.id} value={s.id}>
                        {s.title ?? s.value} · {s.parsedMemberCount ?? 0} у базі
                        {s.participantListHidden ? ' · прихований список' : ''}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Макс. повідомлень
                  </span>
                  <input
                    value={spamMax}
                    onChange={(e) => setSpamMax(e.target.value)}
                    inputMode="numeric"
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Пауза між DM (мс)
                  </span>
                  <input
                    value={spamDelay}
                    onChange={(e) => setSpamDelay(e.target.value)}
                    inputMode="numeric"
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                  />
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={spamBusy}
                  onClick={() => closeSpamModal()}
                  className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.04] disabled:opacity-40"
                >
                  Скасувати
                </button>
                <motion.button
                  type="button"
                  disabled={spamBusy || status !== 'online' || !spamSourceId}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void startSpamOutreach()}
                  className="rounded-xl border border-amber-400/35 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-100 hover:bg-amber-500/25 disabled:opacity-40"
                >
                  {spamBusy ? 'Запуск…' : 'Запустити спам'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {proxyEditAccount ? (
          <motion.div
            className="fixed inset-0 z-[58] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeProxyEditModal()}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
              className="glass-panel relative w-full max-w-lg space-y-4 p-6 shadow-glow"
              onClick={(ev) => ev.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">Проксі акаунта</div>
                  <p className="mt-1 font-mono text-[13px] text-zinc-500">{proxyEditAccount.label}</p>
                </div>
                <button
                  type="button"
                  disabled={proxyEditBusy}
                  className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                  aria-label="Закрити"
                  onClick={() => closeProxyEditModal()}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[12px] text-zinc-500">
                Для MTProto (код Telegram, розсилка, inbox) потрібен <strong className="text-zinc-300">SOCKS5</strong>.
                Після зміни проксі для нової сесії увійдіть через «Код Telegram».
              </p>

              {proxyEditErr ? <p className="text-[13px] text-red-300/95">{proxyEditErr}</p> : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Host</span>
                  <input
                    value={proxyEditHost}
                    onChange={(e) => {
                      setProxyEditHost(e.target.value)
                      setProxyEditProbeMsg(null)
                    }}
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35"
                    placeholder="138.249.154.109"
                    autoComplete="off"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Порт</span>
                  <input
                    value={proxyEditPort}
                    onChange={(e) => {
                      setProxyEditPort(e.target.value)
                      setProxyEditProbeMsg(null)
                    }}
                    inputMode="numeric"
                    disabled={!proxyEditHost.trim()}
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/35 disabled:opacity-40"
                    placeholder="1080"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Тип</span>
                  <select
                    value={proxyEditType}
                    onChange={(e) => {
                      setProxyEditType(e.target.value === 'http' ? 'http' : 'socks5')
                      setProxyEditProbeMsg(null)
                    }}
                    disabled={!proxyEditHost.trim()}
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35 disabled:opacity-40"
                  >
                    <option value="socks5">SOCKS5 (для MTProto)</option>
                    <option value="http">HTTP (лише браузер)</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Логін (якщо є)
                  </span>
                  <input
                    value={proxyEditUser}
                    onChange={(e) => {
                      setProxyEditUser(e.target.value)
                      setProxyEditProbeMsg(null)
                    }}
                    disabled={!proxyEditHost.trim()}
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35 disabled:opacity-40"
                    autoComplete="off"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    Пароль (якщо змінюєте)
                  </span>
                  <input
                    type="password"
                    value={proxyEditPass}
                    onChange={(e) => {
                      setProxyEditPass(e.target.value)
                      setProxyEditProbeMsg(null)
                    }}
                    disabled={!proxyEditHost.trim()}
                    className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35 disabled:opacity-40"
                    autoComplete="new-password"
                    placeholder="Залиште порожнім, щоб не змінювати"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={proxyEditProbeBusy || !proxyEditHost.trim() || status !== 'online'}
                  onClick={() =>
                    void probeProxyFields({
                      host: proxyEditHost,
                      portRaw: proxyEditPort,
                      protocol: proxyEditType,
                      username: proxyEditUser,
                      password: proxyEditPass,
                      setBusy: setProxyEditProbeBusy,
                      setMsg: setProxyEditProbeMsg
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-[13px] font-medium text-zinc-200 hover:border-accent/30 hover:text-white disabled:opacity-40"
                >
                  {proxyEditProbeBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
                  ) : null}
                  {proxyEditProbeBusy ? 'Перевірка…' : 'Перевірити проксі'}
                </button>
                {proxyEditProbeMsg ? (
                  <span
                    className={[
                      'text-[12px]',
                      proxyEditProbeMsg.startsWith('OK') ? 'text-emerald-300/90' : 'text-rose-300/90'
                    ].join(' ')}
                  >
                    {proxyEditProbeMsg}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap justify-between gap-3 pt-2">
                <button
                  type="button"
                  disabled={proxyEditBusy}
                  onClick={() => {
                    setProxyEditHost('')
                    setProxyEditPort('')
                    setProxyEditUser('')
                    setProxyEditPass('')
                    setProxyEditProbeMsg(null)
                  }}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
                >
                  Очистити поля
                </button>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={proxyEditBusy}
                    onClick={() => closeProxyEditModal()}
                    className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/[0.04] disabled:opacity-40"
                  >
                    Скасувати
                  </button>
                  <motion.button
                    type="button"
                    disabled={proxyEditBusy || status !== 'online'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => void saveProxyEdit()}
                    className="rounded-xl border border-accent/35 bg-accent/15 px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-40"
                  >
                    {proxyEditBusy ? 'Збереження…' : 'Зберегти'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AccountsGrid
        accounts={filteredAccounts}
        proxyLabel={proxyLabel}
        sortKey={sortKey}
        mtprotoBusyId={mtprotoBusy && mtprotoAccount ? mtprotoAccount.id : null}
        spamBusyId={spamBusy && spamAccount ? spamAccount.id : null}
        deletingAccountId={deletingAccountId}
        onOpenMtprotoLogin={openMtprotoModal}
        onEditProxy={openProxyEditModal}
        onOpenInbox={openInbox}
        onOpenTelegramWeb={(a) => void openTelegramWeb(a)}
        telegramWebAccountId={telegramWebAccountId}
        onOpenSpam={openSpamModal}
        onDeleteAccount={deleteTelegramAccount}
      />
    </div>
  )
}

function AccountsGrid({
  accounts,
  proxyLabel,
  sortKey,
  mtprotoBusyId,
  spamBusyId,
  deletingAccountId,
  onOpenMtprotoLogin,
  onEditProxy,
  onOpenInbox,
  onOpenTelegramWeb,
  telegramWebAccountId,
  onOpenSpam,
  onDeleteAccount
}: {
  accounts: TelegramAccountModel[]
  proxyLabel: Record<string, string>
  sortKey: SortKey
  mtprotoBusyId: string | null
  telegramWebAccountId: string | null
  spamBusyId: string | null
  deletingAccountId: string | null
  onOpenMtprotoLogin: (account: TelegramAccountModel) => void
  onEditProxy: (account: TelegramAccountModel) => void
  onOpenInbox: (account: TelegramAccountModel) => void
  onOpenTelegramWeb: (account: TelegramAccountModel) => void
  onOpenSpam: (account: TelegramAccountModel) => void
  onDeleteAccount: (account: TelegramAccountModel) => void
}): JSX.Element {
  const sorted = useMemo(() => {
    const copy = [...accounts]
    const ts = (x: TelegramAccountModel) => {
      const raw = x.createdAt ?? x.lastActivity
      return raw ? new Date(raw).getTime() : 0
    }
    copy.sort((a, b) => {
      const ta = ts(a)
      const tb = ts(b)
      if (sortKey === 'created_desc') return tb - ta
      return ta - tb
    })
    return copy
  }, [accounts, sortKey])

  if (sorted.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-white/[0.06] px-6 py-12 text-center text-sm text-zinc-500">
        Нет аккаунтов по текущим фильтрам. Добавьте аккаунт или сбросьте фильтры.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sorted.map((a, i) => (
        <TelegramAccountCard
          key={a.id}
          account={a}
          index={i}
          proxyLabel={a.proxyId ? proxyLabel[a.proxyId] : null}
          onOpenMtprotoLogin={onOpenMtprotoLogin}
          onEditProxy={onEditProxy}
          onOpenInbox={onOpenInbox}
          onOpenTelegramWeb={onOpenTelegramWeb}
          telegramWebBusy={telegramWebAccountId === a.id}
          onOpenSpam={onOpenSpam}
          onDeleteAccount={onDeleteAccount}
          mtprotoBusy={mtprotoBusyId === a.id}
          spamBusy={spamBusyId === a.id}
          deleteBusy={deletingAccountId === a.id}
        />
      ))}
    </div>
  )
}
