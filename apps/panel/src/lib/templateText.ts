import type { MessageTemplateModel } from '@/domain/types'

export function templateTitle(t: MessageTemplateModel): string {
  return t.title || t.name || 'Без названия'
}

export function templateContent(t: MessageTemplateModel): string {
  return t.content || t.body || ''
}
