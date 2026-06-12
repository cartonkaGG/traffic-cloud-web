export type TikTokExecutionMode = 'visible' | 'headless'

export type TikTokWarmupSettings = {
  executionMode: TikTokExecutionMode
  scrollMinutesMin: number
  scrollMinutesMax: number
  likesPerSession: number
  followsPerSession: number
  commentsPerSession: number
  commentTexts: string[]
  watchSecondsMin: number
  watchSecondsMax: number
  watchFullVideos: boolean
}

export const DEFAULT_COMMENT_TEXTS = [
  '🔥🔥🔥',
  'Топчик',
  'Класне відео',
  'Огонь',
  '😍😍',
  'Супер',
  'Залип капітально',
  'Wow',
  '💯',
  'Красава'
]

export const DEFAULT_WARMUP_SETTINGS: TikTokWarmupSettings = {
  executionMode: 'visible',
  scrollMinutesMin: 8,
  scrollMinutesMax: 15,
  likesPerSession: 6,
  followsPerSession: 2,
  commentsPerSession: 2,
  commentTexts: DEFAULT_COMMENT_TEXTS,
  watchSecondsMin: 5,
  watchSecondsMax: 18,
  watchFullVideos: true
}

const STORAGE_KEY = 'traffic-cloud-tiktok-warmup-settings'

export function readTikTokWarmupSettings(): TikTokWarmupSettings {
  if (typeof window === 'undefined') return DEFAULT_WARMUP_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_WARMUP_SETTINGS
    const parsed = JSON.parse(raw) as Partial<TikTokWarmupSettings>
    return {
      ...DEFAULT_WARMUP_SETTINGS,
      ...parsed,
      commentTexts:
        Array.isArray(parsed.commentTexts) && parsed.commentTexts.length > 0
          ? parsed.commentTexts
          : DEFAULT_COMMENT_TEXTS,
      executionMode: parsed.executionMode === 'headless' ? 'headless' : 'visible'
    }
  } catch {
    return DEFAULT_WARMUP_SETTINGS
  }
}

export function writeTikTokWarmupSettings(settings: TikTokWarmupSettings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function parseHashtagInput(raw: string): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const part of raw.split(/[\s,;]+/)) {
    const tag = part.replace(/^#+/, '').trim().toLowerCase()
    if (!tag || seen.has(tag)) continue
    seen.add(tag)
    out.push(tag)
  }
  return out
}
