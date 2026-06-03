/** ISO или уже отформатированная строка из моков. */
export function formatActivityLabel(isoOrText: string | null): string {
  if (!isoOrText) return '—'
  const ms = Date.parse(isoOrText)
  if (Number.isNaN(ms)) return isoOrText
  const diff = Date.now() - ms
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'только что'
  if (mins < 60) return `${mins} мин назад`
  const hours = Math.floor(mins / 60)
  if (hours < 48) return `${hours} ч назад`
  return new Date(ms).toLocaleString('ru-RU')
}
