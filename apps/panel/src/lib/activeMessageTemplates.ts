export type ResolveOutreachTemplates =
  | { mode: 'all' }
  | { mode: 'none' }
  | { mode: 'subset'; ids: string[] }

export function resolveOutreachTemplateIds(
  activeMessageTemplateIds: unknown,
  activeMessageTemplateId: string | null | undefined,
  allTemplateIds: string[]
): ResolveOutreachTemplates {
  if (activeMessageTemplateIds != null && Array.isArray(activeMessageTemplateIds)) {
    const filtered = [
      ...new Set(
        activeMessageTemplateIds
          .map((x) => (typeof x === 'string' ? x.trim() : ''))
          .filter(Boolean)
      )
    ].filter((id) => allTemplateIds.includes(id))
    if (filtered.length === 0) return { mode: 'none' }
    return { mode: 'subset', ids: filtered }
  }
  const leg = activeMessageTemplateId?.trim()
  if (leg && allTemplateIds.includes(leg)) return { mode: 'subset', ids: [leg] }
  return { mode: 'all' }
}

export function effectiveOutreachTemplateIds(
  r: ResolveOutreachTemplates,
  allTemplateIds: string[]
): string[] {
  if (r.mode === 'all') return [...allTemplateIds]
  if (r.mode === 'none') return []
  return r.ids
}
