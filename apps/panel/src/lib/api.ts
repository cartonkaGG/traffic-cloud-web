import type {
  AnalyticsSnapshot,
  BrowserProfile,
  CampaignModel,
  ChatSourceModel,
  LiveLogEntry,
  MessageTemplateModel,
  OutreachDmJobModel,
  OutreachRunRecordModel,
  ProxyEndpointModel,
  SafetyFiltersConfig,
  TelegramAccountModel,
  UserFiltersConfig
} from '@/domain/types'
import { getAccessToken } from './authSession'
import { getApiBaseUrl } from './settings'

export type UserRole = 'user' | 'admin'

export type SubscriptionInfo = {
  status: string
  currentPeriodEnd: string | null
  isActive: boolean
}

export type BillingPlanInfo = {
  monthlyPriceUsd: number
  compareAtPriceUsd?: number | null
  currency: string
  planTitle: string
}

export type AuthResponse = {
  token: string
  user: { id: string; email: string; role?: UserRole }
  workspaceId: string
}

export type RegisterResponse =
  | AuthResponse
  | {
      needsEmailVerification: true
      email: string
      message: string
      emailSent?: boolean
      emailError?: string
    }

export type BootstrapResponse = {
  workspaceId: string
  workspaceName: string
  activeMessageTemplateId?: string | null
  role?: UserRole
  subscription?: SubscriptionInfo
  billingPlan?: BillingPlanInfo
}

export type BillingStatusResponse = {
  subscription: SubscriptionInfo
  plan: BillingPlanInfo
}

export type CheckoutResponse = {
  orderId: string
  invoiceUrl: string
  amountUsd: number
  currency: string
  planTitle: string
}

export type AdminPaymentRow = {
  id: string
  orderId: string
  userId: string
  userEmail: string
  amountUsd: number
  currency: string
  status: string
  invoiceUrl: string | null
  payCurrency: string | null
  actuallyPaid: number | null
  nowPaymentsId: string | null
  createdAt: string
  updatedAt: string
}

export type DashboardStatRemote = {
  label: string
  value: string
  delta: string
  positive: boolean
  iconKey: 'radio' | 'mouse' | 'trend' | 'chart'
}

export type WorkspaceBundle = {
  workspace: { id: string; name: string }
  telegramAccounts: TelegramAccountModel[]
  proxies: ProxyEndpointModel[]
  browserProfiles: BrowserProfile[]
  chatSources: ChatSourceModel[]
  messageTemplates: MessageTemplateModel[]
  campaigns: Array<
    CampaignModel & {
      channelLabel: string
      reachLabel: string
      ctrLabel: string
    }
  >
  analytics: AnalyticsSnapshot
  dashboardStats: DashboardStatRemote[]
  logs: LiveLogEntry[]
  activeMessageTemplateId?: string | null
  /** Серверний авто-blacklist (заблокували акаунт під час розсилки), без @, lower-case */
  outreachAutoBlacklistUsernames?: string[]
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl()
  const token = getAccessToken()
  const headers = new Headers(init?.headers)
  if (!headers.has('Accept')) headers.set('Accept', 'application/json')
  if (
    token &&
    !path.includes('/auth/login') &&
    !path.includes('/auth/register')
  ) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers
  })
  if (!res.ok) {
    const text = await res.text()
    let hint: string | undefined
    let detail: string | undefined
    let errKey: string | undefined
    try {
      const j = JSON.parse(text) as { hint?: unknown; error?: unknown; detail?: unknown }
      if (typeof j.hint === 'string') hint = j.hint
      if (typeof j.detail === 'string') detail = j.detail
      if (typeof j.error === 'string') errKey = j.error
    } catch {
      /* not JSON */
    }
    const message =
      hint ??
      detail ??
      (errKey ? `${errKey} (${res.status})` : `${res.status} ${text}`)
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export async function apiLogin(body: { email: string; password: string }): Promise<AuthResponse> {
  return fetchJson<AuthResponse>('/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiRegister(body: { email: string; password: string }): Promise<RegisterResponse> {
  return fetchJson<RegisterResponse>('/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiForgotPassword(email: string): Promise<{ ok: boolean }> {
  return fetchJson('/v1/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
}

export async function apiResetPassword(token: string, password: string): Promise<{ ok: boolean }> {
  return fetchJson('/v1/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password })
  })
}

export async function apiVerifyEmail(token: string): Promise<{ ok: boolean; email: string }> {
  return fetchJson(`/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
}

export async function apiResendVerification(
  email: string
): Promise<{
  ok: boolean
  cooldownSec?: number
  emailSent?: boolean
  emailError?: string
  hint?: string
}> {
  return fetchJson('/v1/auth/resend-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
}

export async function apiVerificationStatus(email: string): Promise<{ verified: boolean }> {
  return fetchJson(
    `/v1/auth/verification-status?email=${encodeURIComponent(email.trim().toLowerCase())}`
  )
}

export async function apiUpdateBrowserProfile(
  workspaceId: string,
  profileId: string,
  body: {
    name?: string
    proxyId?: string | null
    timezone?: string
    locale?: string
    userAgent?: string
    webglVendor?: string
    canvasNoise?: boolean
  }
): Promise<{ profile: BrowserProfile }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/browser-profiles/${profileId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiCreateBrowserProfile(
  workspaceId: string,
  body: {
    name: string
    proxyId?: string | null
    timezone?: string
    locale?: string
    userAgent?: string
    webglVendor?: string
    canvasNoise?: boolean
  }
): Promise<{ profile: BrowserProfile }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/browser-profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiCreateProxy(
  workspaceId: string,
  body: {
    label: string
    host: string
    port: number
    username?: string | null
    password?: string | null
    protocol: ProxyEndpointModel['protocol']
    rotation: ProxyEndpointModel['rotation']
    endpointKind: ProxyEndpointModel['endpointKind']
  }
): Promise<{ proxy: ProxyEndpointModel }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/proxies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiTestProxy(
  workspaceId: string,
  proxyId: string
): Promise<
  | { ok: true; latencyMs: number; proxy: ProxyEndpointModel }
  | { ok: false; error: string; proxy: ProxyEndpointModel }
> {
  return fetchJson(`/v1/workspaces/${workspaceId}/proxies/${proxyId}/test`, {
    method: 'POST'
  })
}

export async function apiDeleteProxy(
  workspaceId: string,
  proxyId: string
): Promise<{ ok: boolean }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/proxies/${proxyId}`, {
    method: 'DELETE'
  })
}

export async function apiTouchBrowserProfileLaunch(
  workspaceId: string,
  profileId: string
): Promise<{ ok: boolean }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/browser-profiles/${profileId}/launch`, {
    method: 'POST'
  })
}

export async function apiDeleteBrowserProfile(
  workspaceId: string,
  profileId: string
): Promise<{ ok: boolean }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/browser-profiles/${profileId}`, {
    method: 'DELETE'
  })
}

export async function apiBootstrap(): Promise<BootstrapResponse> {
  return fetchJson<BootstrapResponse>('/v1/bootstrap')
}

export async function apiBillingStatus(): Promise<BillingStatusResponse> {
  return fetchJson<BillingStatusResponse>('/v1/billing/status')
}

export async function apiBillingCheckout(
  acceptedTerms: boolean,
  payCurrency: string
): Promise<CheckoutResponse> {
  return fetchJson<CheckoutResponse>('/v1/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acceptedTerms, payCurrency })
  })
}

export async function apiAdminGetPlan(): Promise<BillingPlanInfo> {
  return fetchJson<BillingPlanInfo>('/v1/admin/billing/plan')
}

export async function apiAdminUpdatePlan(body: Partial<BillingPlanInfo>): Promise<BillingPlanInfo> {
  return fetchJson<BillingPlanInfo>('/v1/admin/billing/plan', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiAdminPayments(): Promise<{ items: AdminPaymentRow[] }> {
  return fetchJson<{ items: AdminPaymentRow[] }>('/v1/admin/payments')
}

export type AdminGrantSubscriptionResponse = {
  ok: boolean
  email: string
  periodDays: number
  subscription: SubscriptionInfo
}

export async function apiAdminGrantSubscription(
  email: string,
  periodDays?: number
): Promise<AdminGrantSubscriptionResponse> {
  return fetchJson<AdminGrantSubscriptionResponse>('/v1/admin/subscriptions/grant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), periodDays })
  })
}

export async function apiFetchBundle(workspaceId: string): Promise<WorkspaceBundle> {
  return fetchJson<WorkspaceBundle>(`/v1/workspaces/${workspaceId}/bundle`)
}

export async function apiPostLog(
  workspaceId: string,
  body: { kind: string; message: string; meta?: Record<string, unknown> }
): Promise<{ ok: boolean; log: LiveLogEntry }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiCreateChatSource(
  workspaceId: string,
  body: { value: string; title?: string | null }
): Promise<{ source: ChatSourceModel }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiCreateChatSourcesBulk(
  workspaceId: string,
  body: { values?: string[]; lines?: string }
): Promise<{
  created: number
  sources: ChatSourceModel[]
  skipped: string[]
  failed: Array<{ value: string; error: string }>
}> {
  return fetchJson(`/v1/workspaces/${workspaceId}/sources/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiDeleteChatSource(workspaceId: string, sourceId: string): Promise<{ ok: boolean }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/sources/${sourceId}`, {
    method: 'DELETE'
  })
}

export async function apiParseChatSource(
  workspaceId: string,
  sourceId: string
): Promise<{
  ok: boolean
  imported: number
  warning?: string
  membership?: { ok: number; fail: number }
  participantListHidden?: boolean
}> {
  return fetchJson(`/v1/workspaces/${workspaceId}/sources/${sourceId}/parse`, {
    method: 'POST'
  })
}

export async function apiParseAllChatSources(
  workspaceId: string,
  body?: { delayMsBetweenSources?: number; membershipJoinDelayMs?: number }
): Promise<{
  ok: boolean
  results: Array<{
    sourceId: string
    value: string
    ok: boolean
    imported?: number
    warning?: string
    membership?: { ok: number; fail: number }
    error?: string
  }>
  totalImported: number
}> {
  return fetchJson(`/v1/workspaces/${workspaceId}/sources/parse-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {})
  })
}

export async function apiMuteAllChatSourceNotifications(
  workspaceId: string,
  body?: { delayMs?: number }
): Promise<{
  ok: boolean
  stats: { ok: number; fail: number }
  failures: Array<{ accountId: string; accountLabel: string; sourceValue: string; ok: boolean; error?: string }>
}> {
  return fetchJson(`/v1/workspaces/${workspaceId}/sources/mute-all-notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {})
  })
}

export async function apiSyncAllSourceMemberships(
  workspaceId: string,
  body?: { delayMs?: number }
): Promise<{
  ok: boolean
  stats: { ok: number; fail: number }
  failures: Array<{ accountId: string; accountLabel: string; sourceValue: string; ok: boolean; error?: string }>
}> {
  return fetchJson(`/v1/workspaces/${workspaceId}/sources/sync-memberships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {})
  })
}

export async function apiDownloadChatSourceCsv(workspaceId: string, sourceId: string): Promise<void> {
  const base = getApiBaseUrl()
  const token = getAccessToken()
  const res = await fetch(
    `${base}/v1/workspaces/${workspaceId}/sources/${sourceId}/export.csv`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status} ${text}`)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audience-${sourceId.slice(0, 8)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export type TelegramMtprotoStatus = {
  parseReady: boolean
  activeSource: 'workspace' | 'env' | 'none'
  apiId: number | null
  workspace: {
    apiId: number | null
    hasApiHash: boolean
    hasSession: boolean
  }
}

export async function apiGetTelegramMtproto(
  workspaceId: string
): Promise<TelegramMtprotoStatus> {
  return fetchJson<TelegramMtprotoStatus>(
    `/v1/workspaces/${workspaceId}/settings/telegram-mtproto`
  )
}

export async function apiPutTelegramMtproto(
  workspaceId: string,
  body: { apiId?: string | number; apiHash?: string; sessionString?: string }
): Promise<{ ok: boolean }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/settings/telegram-mtproto`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiDeleteTelegramMtproto(workspaceId: string): Promise<{ ok: boolean }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/settings/telegram-mtproto`, {
    method: 'DELETE'
  })
}

export async function apiTelegramMtprotoSendCode(
  workspaceId: string,
  body: { apiId?: string | number; apiHash?: string; phone: string; forceSMS?: boolean }
): Promise<{ ok: boolean; isCodeViaApp: boolean }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/settings/telegram-mtproto/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export type MtprotoWorkspaceCompleteResponse =
  | {
      ok: true
      sessionString: string
      telegramUsername: string | null
      phone: string | null
    }
  | { ok: false; twoFactorRequired: true }
  | { ok: false; message: string }

export async function apiTelegramMtprotoComplete(
  workspaceId: string,
  body: {
    apiId?: string | number
    apiHash?: string
    phoneCode: string
    password?: string | null
  }
): Promise<MtprotoWorkspaceCompleteResponse> {
  const base = getApiBaseUrl()
  const token = getAccessToken()
  const res = await fetch(`${base}/v1/workspaces/${workspaceId}/settings/telegram-mtproto/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  })
  const j = (await res.json()) as {
    ok?: boolean
    sessionString?: string
    telegramUsername?: string | null
    phone?: string | null
    error?: string
    hint?: string
  }
  if (res.ok && typeof j.sessionString === 'string') {
    return {
      ok: true,
      sessionString: j.sessionString,
      telegramUsername: j.telegramUsername ?? null,
      phone: j.phone ?? null
    }
  }
  if (j.error === 'two_factor_required' || j.error === 'password_required') {
    return { ok: false, twoFactorRequired: true }
  }
  const message = typeof j.hint === 'string' && j.hint ? j.hint : `${j.error ?? 'error'} (${res.status})`
  return { ok: false, message }
}

export type AntidetectLaunchPayload = {
  profileId: string
  userAgent: string
  proxy: {
    protocol: 'http' | 'socks5'
    host: string
    port: number
    username?: string | null
    password?: string | null
  } | null
}

export async function apiCreateTelegramAccount(
  workspaceId: string,
  body: {
    telegramUsername: string
    phone?: string | null
    proxyHost?: string
    proxyPort?: number
    proxyProtocol?: 'http' | 'socks5'
    proxyUsername?: string | null
    proxyPassword?: string | null
    mtprotoApiId?: string | number
    mtprotoApiHash?: string
    mtprotoSessionString?: string
  }
): Promise<{
  account: TelegramAccountModel
  profile: BrowserProfile
  launch: AntidetectLaunchPayload
}> {
  return fetchJson(`/v1/workspaces/${workspaceId}/telegram-accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiDeleteTelegramAccount(
  workspaceId: string,
  accountId: string
): Promise<{ ok: boolean; profileId: string }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/telegram-accounts/${accountId}`, {
    method: 'DELETE'
  })
}

export async function apiUpdateTelegramAccountProxy(
  workspaceId: string,
  accountId: string,
  body: {
    proxyHost?: string | null
    proxyPort?: number | null
    proxyProtocol?: 'http' | 'socks5'
    proxyUsername?: string | null
    proxyPassword?: string | null
  }
): Promise<{ ok: true; account: TelegramAccountModel }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/telegram-accounts/${accountId}/proxy`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiGetTelegramWebLaunch(
  workspaceId: string,
  accountId: string
): Promise<{
  ok: true
  webUrl: string
  launch: AntidetectLaunchPayload
  mtprotoProxyMode: 'socks5' | 'direct'
}> {
  return fetchJson(`/v1/workspaces/${workspaceId}/telegram-accounts/${accountId}/telegram-web-launch`)
}

export async function apiTelegramAccountMtprotoSendCode(
  workspaceId: string,
  accountId: string,
  body: { phone?: string; forceSMS?: boolean; apiId?: string | number; apiHash?: string },
  init?: Pick<RequestInit, 'signal'>
): Promise<{
  ok: true
  isCodeViaApp: boolean
  httpProxySkipped: boolean
  mtprotoProxyMode?: 'socks5' | 'http_ignored' | 'direct'
}> {
  return fetchJson(`/v1/workspaces/${workspaceId}/telegram-accounts/${accountId}/mtproto/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: init?.signal
  })
}

export type MtprotoCompleteResponse =
  | { ok: true; account: TelegramAccountModel }
  | { ok: false; twoFactorRequired: true }
  | { ok: false; message: string }

export async function apiTelegramAccountMtprotoComplete(
  workspaceId: string,
  accountId: string,
  body: {
    phoneCode: string
    password?: string | null
    apiId?: string | number
    apiHash?: string
  },
  init?: Pick<RequestInit, 'signal'>
): Promise<MtprotoCompleteResponse> {
  const base = getApiBaseUrl()
  const token = getAccessToken()
  const res = await fetch(
    `${base}/v1/workspaces/${workspaceId}/telegram-accounts/${accountId}/mtproto/complete`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body),
      signal: init?.signal
    }
  )
  const j = (await res.json()) as {
    ok?: boolean
    account?: TelegramAccountModel
    error?: string
    hint?: string
  }
  if (res.ok && j.account) {
    return { ok: true, account: j.account }
  }
  if (j.error === 'two_factor_required' || j.error === 'password_required') {
    return { ok: false, twoFactorRequired: true }
  }
  const message = typeof j.hint === 'string' && j.hint ? j.hint : `${j.error ?? 'error'} (${res.status})`
  return { ok: false, message }
}

export async function apiTelegramAccountMtprotoImportSession(
  workspaceId: string,
  accountId: string,
  body: { sessionString: string; apiId?: string | number; apiHash?: string }
): Promise<{ ok: true; account: TelegramAccountModel } | { ok: false; message: string }> {
  const base = getApiBaseUrl()
  const token = getAccessToken()
  const res = await fetch(
    `${base}/v1/workspaces/${workspaceId}/telegram-accounts/${accountId}/mtproto/import-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    }
  )
  const j = (await res.json()) as {
    ok?: boolean
    account?: TelegramAccountModel
    error?: string
    hint?: string
  }
  if (res.ok && j.account) {
    return { ok: true, account: j.account }
  }
  const message = typeof j.hint === 'string' && j.hint ? j.hint : `${j.error ?? 'error'} (${res.status})`
  return { ok: false, message }
}

export async function apiTelegramAccountsBulkAbout(
  workspaceId: string,
  body: { about: string; delayMs?: number }
): Promise<{
  ok: boolean
  results: Array<{ accountId: string; label: string; ok: boolean; error?: string }>
}> {
  return fetchJson(`/v1/workspaces/${workspaceId}/telegram-accounts/bulk/about`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiTelegramAccountOutreachStart(
  workspaceId: string,
  accountId: string,
  body: {
    sourceId: string
    templateId?: string | null
    templateMode?: 'fixed' | 'random'
    maxMessages?: number
    delayMs?: number
    userFilters?: UserFiltersConfig
    safetyFilters?: SafetyFiltersConfig
  }
): Promise<{ ok: boolean; started?: boolean; error?: string }> {
  const base = getApiBaseUrl()
  const token = getAccessToken()
  const res = await fetch(
    `${base}/v1/workspaces/${workspaceId}/telegram-accounts/${accountId}/outreach/start`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    }
  )
  const j = (await res.json()) as { ok?: boolean; started?: boolean; error?: string }
  if (!res.ok) {
    const message =
      j.error === 'outreach_already_running'
        ? 'Розсилка вже виконується для цього акаунта.'
        : `${j.error ?? 'error'} (${res.status})`
    return { ok: false, error: message }
  }
  return { ok: true, started: j.started === true }
}

export async function apiListOutreachJobs(
  workspaceId: string
): Promise<{ jobs: OutreachDmJobModel[] }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/outreach-jobs`)
}

export async function apiListOutreachRunHistory(
  workspaceId: string
): Promise<{ runs: OutreachRunRecordModel[] }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/outreach-run-history`)
}

export async function apiGetOutreachRun(
  workspaceId: string,
  runId: string
): Promise<{ run: OutreachRunRecordModel }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/outreach-runs/${runId}`)
}

export async function apiPauseOutreachJob(
  workspaceId: string,
  accountId: string
): Promise<{ ok: boolean }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/outreach-jobs/${accountId}/pause`, {
    method: 'POST'
  })
}

export async function apiResumeOutreachJob(
  workspaceId: string,
  accountId: string
): Promise<{ ok: boolean }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/outreach-jobs/${accountId}/resume`, {
    method: 'POST'
  })
}

export async function apiStopOutreachJob(
  workspaceId: string,
  accountId: string
): Promise<{ ok: boolean }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/outreach-jobs/${accountId}/stop`, {
    method: 'POST'
  })
}

export async function apiCreateMessageTemplate(
  workspaceId: string,
  body: { title: string; content: string }
): Promise<{ template: MessageTemplateModel }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/message-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiUpdateMessageTemplate(
  workspaceId: string,
  templateId: string,
  body: { title?: string; content?: string }
): Promise<{ template: MessageTemplateModel }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/message-templates/${templateId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
}

export async function apiDeleteMessageTemplate(
  workspaceId: string,
  templateId: string
): Promise<{ ok: boolean }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/message-templates/${templateId}`, {
    method: 'DELETE'
  })
}

export async function apiSetActiveMessageTemplate(
  workspaceId: string,
  templateId: string | null
): Promise<{ ok: boolean; activeMessageTemplateId: string | null }> {
  return fetchJson(`/v1/workspaces/${workspaceId}/settings/active-message-template`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId })
  })
}

export function wsUrlFromHttpBase(base: string): string {
  const u = new URL(base)
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:'
  u.pathname = '/ws'
  u.search = ''
  return u.toString()
}
