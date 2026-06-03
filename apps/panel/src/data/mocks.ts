import {
  BarChart3,
  MousePointerClick,
  Radio,
  TrendingUp
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type {
  AnalyticsSnapshot,
  BrowserProfile,
  CampaignModel,
  ChatSourceModel,
  MessageTemplateModel,
  ProxyEndpointModel,
  TelegramAccountModel
} from '@/domain/types'

export type StatItem = {
  label: string
  value: string
  delta: string
  positive: boolean
  icon: LucideIcon
}

export type ActivityEntry = {
  id: string
  time: string
  label: string
  detail: string
  tone: 'ok' | 'warn' | 'neutral'
}

export type CampaignCardModel = CampaignModel & {
  channelLabel: string
  reachLabel: string
  ctrLabel: string
}

export const analyticsSnapshot: AnalyticsSnapshot = {
  sent: 12840,
  delivered: 12102,
  replies: 612,
  failed: 318,
  conversionRate: 4.8,
  activeAccounts: 14,
  campaignsRunning: 3
}

export const stats: StatItem[] = [
  {
    label: 'Отправлено (24ч)',
    value: '12 840',
    delta: '+6.2%',
    positive: true,
    icon: Radio
  },
  {
    label: 'Доставлено',
    value: '12 102',
    delta: '+5.1%',
    positive: true,
    icon: MousePointerClick
  },
  {
    label: 'Ответы',
    value: '612',
    delta: '+2.4%',
    positive: true,
    icon: TrendingUp
  },
  {
    label: 'Конверсия DM',
    value: '4.8%',
    delta: '+0.3 п.п.',
    positive: true,
    icon: BarChart3
  }
]

export const activityLog: ActivityEntry[] = [
  {
    id: '1',
    time: '14:02',
    label: 'Кампания «Night Pulse»',
    detail: 'Очередь outreach · пауза между DM в пределах лимита',
    tone: 'ok'
  },
  {
    id: '2',
    time: '13:58',
    label: 'Аккаунт @orbit_ops',
    detail: 'Прокси переключён на резервный узел',
    tone: 'neutral'
  },
  {
    id: '3',
    time: '13:41',
    label: 'Proxy EU-03',
    detail: 'Латентность выросла до 340 мс — мониторинг',
    tone: 'warn'
  },
  {
    id: '4',
    time: '13:22',
    label: 'Парсер источника',
    detail: 'Обновлён сегмент аудитории · +820 записей',
    tone: 'ok'
  },
  {
    id: '5',
    time: '12:55',
    label: 'Система безопасности',
    detail: 'Сигнал Flood · кампания приостановлена автоматически',
    tone: 'warn'
  }
]

export const telegramAccounts: TelegramAccountModel[] = [
  {
    id: 'a1',
    label: 'Orbit Ops',
    username: 'orbit_ops',
    phone: '+380 •• •• ••91',
    avatarUrl: null,
    status: 'active',
    proxyId: 'p1',
    browserProfileId: 'bp1',
    healthScore: 94,
    sentToday: 412,
    lastActivity: '2 мин назад'
  },
  {
    id: 'a2',
    label: 'Nova Traffic',
    username: 'nova_traffic',
    phone: '+1 ••• ••• ••02',
    avatarUrl: null,
    status: 'warming',
    proxyId: 'p2',
    browserProfileId: 'bp2',
    healthScore: 72,
    sentToday: 189,
    lastActivity: '14 мин назад'
  },
  {
    id: 'a3',
    label: 'Silent Layer',
    username: 'silent_layer',
    phone: '+65 ••• ••• ••88',
    avatarUrl: null,
    status: 'limited',
    proxyId: 'p3',
    browserProfileId: 'bp3',
    healthScore: 41,
    sentToday: 0,
    lastActivity: '3 ч назад'
  },
  {
    id: 'a4',
    label: 'Pulse Desk',
    username: 'pulse_desk',
    phone: '+48 •• •• ••44',
    avatarUrl: null,
    status: 'active',
    proxyId: 'p4',
    browserProfileId: 'bp4',
    healthScore: 88,
    sentToday: 276,
    lastActivity: '6 мин назад'
  }
]

export const proxies: ProxyEndpointModel[] = [
  {
    id: 'p1',
    label: 'EU-FRA edge',
    host: 'eu-frankfurt.edge',
    port: 1080,
    username: null,
    password: null,
    protocol: 'socks5',
    rotation: 'sticky',
    endpointKind: 'residential',
    latencyMs: 42,
    health: 'good'
  },
  {
    id: 'p2',
    label: 'US-East route',
    host: 'us-east.route',
    port: 1080,
    username: null,
    password: null,
    protocol: 'socks5',
    rotation: 'rotating',
    endpointKind: 'residential',
    latencyMs: 118,
    health: 'good'
  },
  {
    id: 'p3',
    label: 'Asia bridge',
    host: 'asia-sin.bridge',
    port: 8080,
    username: null,
    password: null,
    protocol: 'http',
    rotation: 'rotating',
    endpointKind: 'datacenter',
    latencyMs: 312,
    health: 'degraded'
  },
  {
    id: 'p4',
    label: 'EU-WAW node',
    host: 'eu-warsaw.node',
    port: 1080,
    username: null,
    password: null,
    protocol: 'socks5',
    rotation: 'sticky',
    endpointKind: 'datacenter',
    latencyMs: 56,
    health: 'good'
  }
]

export const campaigns: CampaignCardModel[] = [
  {
    id: 'c1',
    name: 'Night Pulse',
    status: 'running',
    accountIds: ['a1', 'a4'],
    sourceIds: ['s1'],
    templateId: 't1',
    scheduledAt: null,
    queueDepth: 1820,
    channelLabel: 'Private funnel',
    reachLabel: '182k',
    ctrLabel: '3.8%'
  },
  {
    id: 'c2',
    name: 'Signal Drop',
    status: 'scheduled',
    accountIds: ['a2'],
    sourceIds: ['s2'],
    templateId: 't2',
    scheduledAt: new Date(Date.now() + 3600_000).toISOString(),
    queueDepth: 940,
    channelLabel: 'Invite wave',
    reachLabel: '48k',
    ctrLabel: '—'
  },
  {
    id: 'c3',
    name: 'Orbit Cold',
    status: 'draft',
    accountIds: [],
    sourceIds: [],
    templateId: null,
    scheduledAt: null,
    queueDepth: 0,
    channelLabel: 'DM sequence',
    reachLabel: '—',
    ctrLabel: '—'
  }
]

export const browserProfiles: BrowserProfile[] = [
  {
    id: 'bp1',
    name: 'Orbit · Chromium',
    fingerprint: {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      timezone: 'Europe/Warsaw',
      locale: 'ru-RU',
      webglVendor: 'Google Inc. (ANGLE)',
      canvasNoise: true
    },
    proxyId: 'p1',
    storagePath: '%APP%/profiles/bp1',
    telegramAccountId: 'a1',
    lastLaunchedAt: new Date(Date.now() - 120_000).toISOString()
  },
  {
    id: 'bp2',
    name: 'Nova · Chromium',
    fingerprint: {
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      timezone: 'America/New_York',
      locale: 'en-US',
      webglVendor: 'Apple GPU',
      canvasNoise: true
    },
    proxyId: 'p2',
    storagePath: '%APP%/profiles/bp2',
    telegramAccountId: 'a2',
    lastLaunchedAt: null
  }
]

export const chatSources: ChatSourceModel[] = []

export const messageTemplates: MessageTemplateModel[] = [
  {
    id: 't1',
    title: 'Intro · спинтакс',
    content:
      '{Привет|Хей|Йо}, {first_name}! Кратко про {chat_name} — оставили инвайт в профиле.',
    name: 'Intro · спинтакс',
    body: '{Привет|Хей|Йо}, {first_name}! Кратко про {chat_name} — оставили инвайт в профиле.',
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
    updatedAt: new Date(Date.now() - 7200_000).toISOString()
  },
  {
    id: 't2',
    title: 'Follow-up',
    content: 'Привет {username}, видели ваш интерес к {chat_name}. Можем скинуть демо?',
    name: 'Follow-up',
    body: 'Привет {username}, видели ваш интерес к {chat_name}. Можем скинуть демо?',
    createdAt: new Date(Date.now() - 172800_000).toISOString(),
    updatedAt: new Date(Date.now() - 172800_000).toISOString()
  }
]
