import type { BrowserFingerprintStub } from '@/domain/types'

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

export const TIMEZONE_CHOICES = [
  'Europe/Kyiv',
  'Europe/Warsaw',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/London',
  'Europe/Amsterdam',
  'Europe/Prague',
  'Europe/Bucharest',
  'Europe/Moscow',
  'America/New_York',
  'America/Los_Angeles'
] as const

export const LOCALE_CHOICES = [
  'uk-UA',
  'ru-RU',
  'pl-PL',
  'de-DE',
  'en-US',
  'ro-RO',
  'cs-CZ'
] as const

const WEBGL_VENDORS = [
  'Google Inc. (ANGLE)',
  'Google Inc. (Google)',
  'Intel Inc.',
  'NVIDIA Corporation',
  'AMD'
] as const

/** Реалістичні гілки Chrome для Win x64. */
const CHROME_MAJORS = [
  126, 127, 128, 129, 130, 131, 132, 133, 134
] as const

/** Готові відбитки для швидкого вибору (Windows / Chrome). */
export const FINGERPRINT_PRESETS: ReadonlyArray<{
  id: string
  label: string
  fingerprint: BrowserFingerprintStub
}> = [
  {
    id: 'chrome-win-pl',
    label: 'Chrome · Win · PL',
    fingerprint: {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.109 Safari/537.36',
      timezone: 'Europe/Warsaw',
      locale: 'pl-PL',
      webglVendor: 'Google Inc. (ANGLE)',
      canvasNoise: true
    }
  },
  {
    id: 'chrome-win-ua',
    label: 'Chrome · Win · UA',
    fingerprint: {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.109 Safari/537.36',
      timezone: 'Europe/Kyiv',
      locale: 'uk-UA',
      webglVendor: 'Google Inc. (ANGLE)',
      canvasNoise: true
    }
  },
  {
    id: 'chrome-win-ru',
    label: 'Chrome · Win · RU',
    fingerprint: {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.92 Safari/537.36',
      timezone: 'Europe/Moscow',
      locale: 'ru-RU',
      webglVendor: 'NVIDIA Corporation',
      canvasNoise: true
    }
  },
  {
    id: 'chrome-win-us',
    label: 'Chrome · Win · US',
    fingerprint: {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.109 Safari/537.36',
      timezone: 'America/New_York',
      locale: 'en-US',
      webglVendor: 'Intel Inc.',
      canvasNoise: false
    }
  },
  {
    id: 'chrome-win-de',
    label: 'Chrome · Win · DE',
    fingerprint: {
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.6834.83 Safari/537.36',
      timezone: 'Europe/Berlin',
      locale: 'de-DE',
      webglVendor: 'Google Inc. (Google)',
      canvasNoise: true
    }
  }
]

/**
 * Новий випадковий відбиток для запису профілю (UA задається в Electron через session).
 */
export function generateRandomFingerprint(): BrowserFingerprintStub {
  const major = pick(CHROME_MAJORS)
  const build = Math.floor(5800 + Math.random() * 1200)
  const patch = Math.floor(Math.random() * 280)
  return {
    userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.${build}.${patch} Safari/537.36`,
    timezone: pick(TIMEZONE_CHOICES),
    locale: pick(LOCALE_CHOICES),
    webglVendor: pick(WEBGL_VENDORS),
    canvasNoise: Math.random() < 0.82
  }
}
