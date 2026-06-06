/** Domain model — shared between desktop UI and backend workers. */

export type TelegramAccountStatus =
  | 'active'
  | 'warming'
  | 'flood'
  | 'limited'
  | 'banned'
  | 'disconnected'

export type ProxyProtocol = 'http' | 'socks5'

export type ProxyRotationMode = 'sticky' | 'rotating'

export type ProxyEndpointKind = 'residential' | 'datacenter'

export type CampaignRunStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'stopped'
  | 'completed'
  | 'failed'

/** Фонова DM-розсилка (spam) з акаунта — статус для вкладки «Кампанії». */
export type OutreachDmJobStatus =
  | 'starting'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed'

export interface OutreachDmJobModel {
  workspaceId: string
  accountId: string
  accountLabel: string
  sourceId: string
  sourceLabel: string | null
  status: OutreachDmJobStatus
  sent: number
  cap: number
  delayMs: number
  candidates: number
  startedAt: string
  updatedAt: string
  finishedAt: string | null
  lastError: string | null
  cancelPending: boolean
  runId?: string
  templateMode?: 'fixed' | 'random'
}

/** Запис з історії завершених DM-запусків (локальний snapshot). */
export interface OutreachRunRecordModel {
  runId: string
  workspaceId: string
  accountId: string
  accountLabel: string
  sourceId: string
  sourceLabel: string | null
  status: string
  sent: number
  cap: number
  candidates: number
  delayMs: number
  startedAt: string
  finishedAt: string | null
  lastError: string | null
  templateMode: 'fixed' | 'random'
}

export type ChatSourceKind = 'username' | 'invite_link' | 'channel' | 'group'

export type ParsedUserPremium = 'unknown' | 'yes' | 'no'

export type OnlineStatus =
  | 'unknown'
  | 'online'
  | 'recently'
  | 'offline'
  | 'last_week'
  | 'last_month'
  | 'hidden'

export type LogEventKind =
  | 'message_sent'
  | 'message_failed'
  | 'flood_warning'
  | 'user_skipped'
  | 'account_paused'
  | 'proxy_error'
  | 'parser_progress'
  | 'session_refresh'
  | 'system'
  /** Критичні події outreach (бан/ліміт) — показ у дзвіночку зверху */
  | 'outreach_alert'

export interface BrowserFingerprintStub {
  userAgent: string
  timezone: string
  locale: string
  webglVendor: string
  canvasNoise: boolean
}

export interface BrowserProfile {
  id: string
  name: string
  fingerprint: BrowserFingerprintStub
  proxyId: string | null
  storagePath: string
  telegramAccountId: string | null
  lastLaunchedAt: string | null
}

export interface TelegramAccountModel {
  id: string
  label: string
  username: string | null
  phone: string
  avatarUrl: string | null
  status: TelegramAccountStatus
  proxyId: string | null
  browserProfileId: string | null
  healthScore: number
  sentToday: number
  lastActivity: string | null
  /** ISO дата створення (Mongo outreach) */
  createdAt?: string | null
  /** Є збережена MTProto-сесія для розсилки через GramJS */
  hasMtprotoSession?: boolean
  /** Збережений App api_id (hash лише на сервері) */
  mtprotoApiId?: number | null
  /** api_id + api_hash збережені для цього акаунта */
  hasMtprotoApiCreds?: boolean
  hasProxy?: boolean
  /** SOCKS5 — для MTProto session і розсилки */
  mtprotoUsesProxy?: boolean
  proxyHost?: string | null
  proxyPort?: number | null
  proxyProtocol?: 'http' | 'socks5' | null
}

export interface ProxyEndpointModel {
  id: string
  label: string
  host: string
  port: number
  /** Логін до проксі (якщо є). Пароль зберігається локально разом із записом. */
  username: string | null
  password: string | null
  protocol: ProxyProtocol
  rotation: ProxyRotationMode
  /** Резидентські або датацентр (орієнтир для провайдера). */
  endpointKind: ProxyEndpointKind
  latencyMs: number | null
  health: 'good' | 'degraded' | 'bad'
}

export interface ChatSourceModel {
  id: string
  kind: ChatSourceKind
  value: string
  title: string | null
  membersApprox: number | null
  lastParsedAt: string | null
  /** Фактическое число записей AudienceMember (из БД) */
  parsedMemberCount?: number
  /** Після парсингу: список учасників у Telegram, ймовірно, прихований */
  participantListHidden?: boolean
}

export interface ParsedAudienceMember {
  id: string
  sourceId: string
  username: string | null
  firstName: string | null
  premium: ParsedUserPremium
  online: OnlineStatus
  bio: string | null
  lastSeen: string | null
}

export interface MessageTemplateModel {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  /** @deprecated use title */
  name?: string
  /** @deprecated use content */
  body?: string
}

export interface UserFiltersConfig {
  onlyPremium: boolean
  onlyOnline: boolean
  onlyRecentlyActive: boolean
  requireUsername: boolean
  ignoreBots: boolean
  ignoreDeleted: boolean
}

export interface SafetyFiltersConfig {
  dedupeAcrossCampaigns: boolean
  blacklistUsernames: string[]
  stopOnFloodWarning: boolean
  skipInactive: boolean
}

export interface HumanizationConfig {
  delayMinMs: number
  delayMaxMs: number
  typingSimulation: boolean
  readingSimulation: boolean
  randomPauses: boolean
  accountCooldownMinutes: number
  smartDailyCap: number
}

export interface CampaignModel {
  id: string
  name: string
  status: CampaignRunStatus
  accountIds: string[]
  sourceIds: string[]
  templateId: string | null
  scheduledAt: string | null
  queueDepth: number
}

export interface AnalyticsSnapshot {
  sent: number
  delivered: number
  replies: number
  failed: number
  conversionRate: number
  activeAccounts: number
  campaignsRunning: number
}

export interface BotTrackingSettings {
  botToken: string | null
  channelId: string | null
  notes: string | null
}

export interface LiveLogEntry {
  id: string
  ts: number
  kind: LogEventKind
  message: string
  meta?: Record<string, string | number | boolean | null>
}
