/** Якщо збережене значення схоже на старі мілісекунди (ціле ≥ 500) — конвертуємо в секунди для поля вводу. */
export function migrateDelayFieldToSeconds(raw: string | undefined, fallbackSec: string): string {
  if (raw == null || String(raw).trim() === '') return fallbackSec
  const t = String(raw).trim().replace(',', '.')
  const n = Number(t)
  if (!Number.isFinite(n) || n <= 0) return fallbackSec
  if (t.includes('.') || t.includes(',')) return t
  if (n >= 500 && Number.isInteger(n)) return String(n / 1000)
  return t
}

export function parseDelaySecondsToMs(
  raw: string,
  opts: { minSec?: number; maxSec?: number } = {}
): { ok: true; ms: number } | { ok: false; error: string } {
  const minSec = opts.minSec ?? 0.5
  const maxSec = opts.maxSec ?? 3600
  const n = Number(String(raw).trim().replace(',', '.'))
  if (!Number.isFinite(n) || n < minSec) {
    return { ok: false, error: `Затримка (с): мінімум ${minSec}` }
  }
  if (n > maxSec) {
    return { ok: false, error: `Затримка (с): максимум ${maxSec}` }
  }
  return { ok: true, ms: Math.round(n * 1000) }
}
