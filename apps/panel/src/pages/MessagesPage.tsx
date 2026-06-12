import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FilePlus, Layers, Save, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import { useToast } from '@/context/ToastContext'
import * as mocks from '@/data/mocks'
import type { MessageTemplateModel } from '@/domain/types'
import {
  apiCreateMessageTemplate,
  apiDeleteMessageTemplate,
  apiReorderMessageTemplates,
  apiSetActiveMessageTemplates,
  apiUpdateMessageTemplate
} from '@/lib/api'
import {
  effectiveOutreachTemplateIds,
  resolveOutreachTemplateIds
} from '@/lib/activeMessageTemplates'
import { renderMessageTemplate } from '@/lib/messageEngine'
import { CampaignsSubNav } from '@/components/layout/CampaignsSubNav'
import { templateContent, templateTitle } from '@/lib/templateText'

/** Кілька шаблонів: блоки розділені рядком «---». Якщо в блоці лише один непустий рядок — це текст, назву підставить сервер. Інакше перший непустий рядок — назва, решта — текст. */
function parseBulkTemplates(raw: string): { title: string; content: string }[] {
  const normalized = raw.replace(/\r\n/g, '\n')
  const blocks = normalized
    .split(/\n---\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
  const out: { title: string; content: string }[] = []
  for (const block of blocks) {
    const lines = block.split('\n')
    const nonempty = lines.map((l) => l.trim()).filter(Boolean)
    if (nonempty.length === 0) continue
    if (nonempty.length === 1) {
      out.push({ title: '', content: nonempty[0]! })
      continue
    }
    let titleLine = ''
    let start = 0
    for (let i = 0; i < lines.length; i++) {
      const L = lines[i]?.trim() ?? ''
      if (L) {
        titleLine = L
        start = i + 1
        break
      }
    }
    const content = lines.slice(start).join('\n').trim()
    if (!content) continue
    out.push({ title: titleLine, content })
  }
  return out
}

const TEMPLATE_SORT_STORAGE_KEY = 'traffic-cloud-templates-sort-v1'

const TEMPLATE_SORT_MODES = [
  'manual',
  'title_asc',
  'title_desc',
  'updated_desc',
  'updated_asc',
  'created_desc'
] as const

type TemplateSortMode = (typeof TEMPLATE_SORT_MODES)[number]

function isTemplateSortMode(v: string | null): v is TemplateSortMode {
  return (TEMPLATE_SORT_MODES as readonly string[]).includes(v ?? '')
}

function readStoredTemplateSortMode(): TemplateSortMode {
  try {
    const raw = localStorage.getItem(TEMPLATE_SORT_STORAGE_KEY)
    if (raw && isTemplateSortMode(raw)) return raw
  } catch {
    /* ignore */
  }
  return 'manual'
}

export function MessagesPage(): JSX.Element {
  const { bundle, workspaceId, status, refetch } = useWorkspaceData()
  const { pushToast } = useToast()
  const messageTemplates = bundle?.messageTemplates ?? mocks.messageTemplates
  const activeFromServer = bundle?.activeMessageTemplateId ?? null

  const allTemplateIds = useMemo(() => messageTemplates.map((t) => t.id), [messageTemplates])

  const outreachPoolIds = useMemo(() => {
    const r = resolveOutreachTemplateIds(
      bundle?.activeMessageTemplateIds ?? undefined,
      bundle?.activeMessageTemplateId,
      allTemplateIds
    )
    return effectiveOutreachTemplateIds(r, allTemplateIds)
  }, [bundle?.activeMessageTemplateIds, bundle?.activeMessageTemplateId, allTemplateIds])

  const outreachPoolSet = useMemo(() => new Set(outreachPoolIds), [outreachPoolIds])

  const allOutreachActive = useMemo(
    () =>
      messageTemplates.length > 0 &&
      outreachPoolIds.length === messageTemplates.length,
    [messageTemplates.length, outreachPoolIds.length]
  )
  const noneOutreachActive = useMemo(() => outreachPoolIds.length === 0, [outreachPoolIds.length])

  const [activeId, setActiveId] = useState<string>('')
  const [draftTitle, setDraftTitle] = useState('')
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [bulkDraft, setBulkDraft] = useState('')
  const [creatingNew, setCreatingNew] = useState(false)
  const [sortMode, setSortMode] = useState<TemplateSortMode>(() => readStoredTemplateSortMode())

  useEffect(() => {
    try {
      localStorage.setItem(TEMPLATE_SORT_STORAGE_KEY, sortMode)
    } catch {
      /* ignore */
    }
  }, [sortMode])

  const sortedTemplates = useMemo(() => {
    const list = [...messageTemplates]
    const sortOrderVal = (t: MessageTemplateModel) =>
      typeof t.sortOrder === 'number' && Number.isFinite(t.sortOrder) ? t.sortOrder : 0
    const byManual = (a: MessageTemplateModel, b: MessageTemplateModel) => {
      const d = sortOrderVal(a) - sortOrderVal(b)
      if (d !== 0) return d
      return (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')
    }
    const titleCmp = (a: MessageTemplateModel, b: MessageTemplateModel) =>
      templateTitle(a).localeCompare(templateTitle(b), 'uk', { sensitivity: 'base' })
    const createdCmp = (a: MessageTemplateModel, b: MessageTemplateModel) => {
      const ca = a.createdAt ?? a.updatedAt ?? ''
      const cb = b.createdAt ?? b.updatedAt ?? ''
      return ca.localeCompare(cb)
    }
    const updatedCmp = (a: MessageTemplateModel, b: MessageTemplateModel) =>
      (a.updatedAt ?? '').localeCompare(b.updatedAt ?? '')

    switch (sortMode) {
      case 'manual':
        return list.sort(byManual)
      case 'title_asc':
        return list.sort(titleCmp)
      case 'title_desc':
        return list.sort((a, b) => titleCmp(b, a))
      case 'updated_desc':
        return list.sort((a, b) => updatedCmp(b, a))
      case 'updated_asc':
        return list.sort(updatedCmp)
      case 'created_desc':
        return list.sort((a, b) => createdCmp(b, a))
      default:
        return list.sort(byManual)
    }
  }, [messageTemplates, sortMode])

  const activeTemplateSyncToken = useMemo(() => {
    const t = messageTemplates.find((x) => x.id === activeId)
    if (!t) return `__none__:${activeId}`
    return `${t.id}:${t.updatedAt}`
  }, [messageTemplates, activeId])

  useEffect(() => {
    if (creatingNew) return
    if (!messageTemplates.length) {
      setActiveId('')
      setDraft('')
      setDraftTitle('')
      return
    }
    const fromServer =
      activeFromServer && messageTemplates.some((t) => t.id === activeFromServer)
        ? activeFromServer
        : null
    if (fromServer) {
      setActiveId(fromServer)
      return
    }
    setActiveId((prev) => (messageTemplates.some((t) => t.id === prev) ? prev : messageTemplates[0]!.id))
  }, [messageTemplates, activeFromServer, creatingNew])

  useEffect(() => {
    if (creatingNew) return
    const t = messageTemplates.find((x) => x.id === activeId)
    if (!t) {
      setDraft('')
      setDraftTitle('')
      return
    }
    setDraft(templateContent(t))
    setDraftTitle(templateTitle(t))
  }, [activeId, activeTemplateSyncToken, creatingNew])

  const active = useMemo(() => {
    if (creatingNew) return undefined
    return messageTemplates.find((t) => t.id === activeId) ?? messageTemplates[0]
  }, [messageTemplates, activeId, creatingNew])

  const preview = useMemo(() => {
    return renderMessageTemplate(draft, {
      username: 'neo_wave',
      first_name: 'Алексей',
      chat_name: 'Traffic Signals'
    })
  }, [draft])

  const selectTemplate = useCallback((t: MessageTemplateModel) => {
    setCreatingNew(false)
    setActiveId(t.id)
    setDraft(templateContent(t))
    setDraftTitle(templateTitle(t))
    setEditingId(t.id)
  }, [])

  const saveNewTemplate = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      pushToast('Нет подключения к API', 'error')
      return
    }
    const title = draftTitle.trim()
    const content = draft.trim()
    if (!content) {
      pushToast('Введите текст сообщения', 'error')
      return
    }
    if (title) {
      const titleNorm = title.toLowerCase()
      if (
        messageTemplates.some((t) => templateTitle(t).trim().toLowerCase() === titleNorm)
      ) {
        pushToast('Шаблон з такою назвою вже є. Оберіть іншу назву.', 'error')
        return
      }
    }
    setBusy(true)
    try {
      const { template } = await apiCreateMessageTemplate(workspaceId, { title, content })
      pushToast('Шаблон сохранён', 'ok')
      setCreatingNew(false)
      setEditingId(template.id)
      setActiveId(template.id)
      setDraftTitle(templateTitle(template))
      await refetch()
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), 'error')
    } finally {
      setBusy(false)
    }
  }, [workspaceId, status, draftTitle, draft, messageTemplates, refetch, pushToast])

  const updateCurrent = useCallback(async () => {
    if (!workspaceId || status !== 'online' || !active) {
      pushToast('Нет подключения к API', 'error')
      return
    }
    const title = draftTitle.trim()
    const content = draft.trim()
    if (!title || !content) {
      pushToast('Заполните название и текст', 'error')
      return
    }
    const titleNorm = title.toLowerCase()
    if (
      messageTemplates.some(
        (t) => t.id !== active.id && templateTitle(t).trim().toLowerCase() === titleNorm
      )
    ) {
      pushToast('Шаблон з такою назвою вже є. Оберіть іншу назву.', 'error')
      return
    }
    setBusy(true)
    try {
      await apiUpdateMessageTemplate(workspaceId, active.id, { title, content })
      pushToast('Шаблон обновлён', 'ok')
      setCreatingNew(false)
      setEditingId(null)
      await refetch()
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), 'error')
    } finally {
      setBusy(false)
    }
  }, [workspaceId, status, active, draftTitle, draft, messageTemplates, refetch, pushToast])

  const removeTemplate = useCallback(
    async (t: MessageTemplateModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Нет подключения к API', 'error')
        return
      }
      const ok = window.confirm(`Удалить шаблон «${templateTitle(t)}»?`)
      if (!ok) return
      setBusy(true)
      try {
        await apiDeleteMessageTemplate(workspaceId, t.id)
        pushToast('Шаблон удалён', 'ok')
        if (activeId === t.id) {
          setActiveId('')
        }
        await refetch()
      } catch (e) {
        pushToast(e instanceof Error ? e.message : String(e), 'error')
      } finally {
        setBusy(false)
      }
    },
    [workspaceId, status, activeId, refetch, pushToast]
  )

  const toggleOutreachTemplate = useCallback(
    async (t: MessageTemplateModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Нет подключения к API', 'error')
        return
      }
      const r = resolveOutreachTemplateIds(
        bundle?.activeMessageTemplateIds ?? undefined,
        bundle?.activeMessageTemplateId,
        allTemplateIds
      )
      const cur = effectiveOutreachTemplateIds(r, allTemplateIds)
      const has = cur.includes(t.id)
      const rawNext = has ? cur.filter((id) => id !== t.id) : [...cur, t.id]
      const rank = new Map(sortedTemplates.map((x, i) => [x.id, i]))
      const next = [...rawNext].sort((a, b) => (rank.get(a) ?? 999) - (rank.get(b) ?? 999))
      setBusy(true)
      try {
        await apiSetActiveMessageTemplates(workspaceId, next)
        setCreatingNew(false)
        pushToast(has ? 'Активність знято' : 'Шаблон активовано', 'ok')
        await refetch()
      } catch (e) {
        pushToast(e instanceof Error ? e.message : String(e), 'error')
      } finally {
        setBusy(false)
      }
    },
    [
      workspaceId,
      status,
      bundle?.activeMessageTemplateIds,
      bundle?.activeMessageTemplateId,
      allTemplateIds,
      sortedTemplates,
      refetch,
      pushToast
    ]
  )

  const activateAllOutreachTemplates = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      pushToast('Нет подключения к API', 'error')
      return
    }
    if (messageTemplates.length === 0) return
    const ids = sortedTemplates.map((t) => t.id)
    setBusy(true)
    try {
      await apiSetActiveMessageTemplates(workspaceId, ids)
      setCreatingNew(false)
      pushToast('Усі шаблони активовано', 'ok')
      await refetch()
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), 'error')
    } finally {
      setBusy(false)
    }
  }, [workspaceId, status, messageTemplates.length, sortedTemplates, refetch, pushToast])

  const deactivateAllOutreachTemplates = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      pushToast('Нет подключения к API', 'error')
      return
    }
    setBusy(true)
    try {
      await apiSetActiveMessageTemplates(workspaceId, [])
      setCreatingNew(false)
      pushToast('Усі шаблони деактивовано', 'ok')
      await refetch()
    } catch (e) {
      pushToast(e instanceof Error ? e.message : String(e), 'error')
    } finally {
      setBusy(false)
    }
  }, [workspaceId, status, refetch, pushToast])

  const moveTemplate = useCallback(
    async (templateId: string, dir: 'up' | 'down') => {
      if (!workspaceId || status !== 'online') {
        pushToast('Нет подключения к API', 'error')
        return
      }
      const manualBase = [...messageTemplates].sort((a, b) => {
        const sa =
          typeof a.sortOrder === 'number' && Number.isFinite(a.sortOrder) ? a.sortOrder : 0
        const sb =
          typeof b.sortOrder === 'number' && Number.isFinite(b.sortOrder) ? b.sortOrder : 0
        if (sa !== sb) return sa - sb
        return (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')
      })
      const idx = manualBase.findIndex((x) => x.id === templateId)
      if (idx < 0) return
      const j = dir === 'up' ? idx - 1 : idx + 1
      if (j < 0 || j >= manualBase.length) return
      const next = [...manualBase]
      const tmp = next[idx]!
      next[idx] = next[j]!
      next[j] = tmp
      setBusy(true)
      try {
        await apiReorderMessageTemplates(
          workspaceId,
          next.map((x) => x.id)
        )
        pushToast('Порядок збережено', 'ok')
        await refetch()
      } catch (e) {
        pushToast(e instanceof Error ? e.message : String(e), 'error')
      } finally {
        setBusy(false)
      }
    },
    [workspaceId, status, messageTemplates, refetch, pushToast]
  )

  const saveBulkTemplates = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      pushToast('Нет подключения к API', 'error')
      return
    }
    const items = parseBulkTemplates(bulkDraft)
    if (!items.length) {
      pushToast(
        'Немає валідних блоків: один непустий рядок — лише текст (назву дасть сервер), або перший рядок — назва, далі текст. Між шаблонами — рядок ---',
        'error'
      )
      return
    }
    setBusy(true)
    let created = 0
    let skippedDup = 0
    let skippedBatchDup = 0
    let failed = 0
    const seenNorm = new Set<string>()
    const existingNorm = new Set(
      messageTemplates.map((t) => templateTitle(t).trim().toLowerCase()).filter(Boolean)
    )
    try {
      for (const { title, content } of items) {
        const trimmedTitle = title.trim()
        const norm = trimmedTitle.toLowerCase()
        if (trimmedTitle) {
          if (seenNorm.has(norm)) {
            skippedBatchDup++
            continue
          }
          if (existingNorm.has(norm)) {
            skippedDup++
            continue
          }
        }
        try {
          await apiCreateMessageTemplate(workspaceId, {
            title: trimmedTitle,
            content
          })
          if (trimmedTitle) {
            seenNorm.add(norm)
            existingNorm.add(norm)
          }
          created++
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          if (/template_title_duplicate|такою назвою/i.test(msg)) {
            skippedDup++
            if (trimmedTitle) existingNorm.add(norm)
          } else {
            failed++
          }
        }
      }
      if (created > 0) {
        await refetch()
        setBulkDraft('')
      }
      const parts: string[] = []
      if (created) parts.push(`додано ${created}`)
      if (skippedDup) parts.push(`пропущено (назва вже є): ${skippedDup}`)
      if (skippedBatchDup) parts.push(`дублікат у списку: ${skippedBatchDup}`)
      if (failed) parts.push(`помилок: ${failed}`)
      const summary = parts.join(' · ') || 'Нічого не збережено'
      pushToast(summary, failed > 0 ? 'error' : 'ok')
    } finally {
      setBusy(false)
    }
  }, [workspaceId, status, bulkDraft, messageTemplates, refetch, pushToast])

  return (
    <div className="space-y-8">
      <CampaignsSubNav />
      <div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500">
          Шаблони зберігаються в MongoDB Atlas. Натисніть «Активувати», щоб шаблон брав участь у
          розсилці (у т. ч. у випадковому режимі); неактивні не відправляються, доки їх не активують.
          У фіксованому режимі першим береться перший активний у списку (порядок як нижче).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Шаблоны
            </div>
            <label className="flex items-center gap-2 text-[11px] text-zinc-500">
              <span className="whitespace-nowrap max-sm:hidden">Сортування</span>
              <select
                value={sortMode}
                onChange={(e) => {
                  const v = e.target.value
                  if (isTemplateSortMode(v)) setSortMode(v)
                }}
                disabled={messageTemplates.length === 0}
                className="max-w-[220px] rounded-lg border border-white/[0.10] bg-black/40 px-2 py-1.5 text-[11px] font-medium text-zinc-200 outline-none focus:border-accent/35 disabled:opacity-40"
              >
                <option value="manual">Власний порядок</option>
                <option value="title_asc">Назва (А → Я)</option>
                <option value="title_desc">Назва (Я → А)</option>
                <option value="updated_desc">Оновлено (новіші зверху)</option>
                <option value="updated_asc">Оновлено (старіші зверху)</option>
                <option value="created_desc">Створено (новіші зверху)</option>
              </select>
            </label>
          </div>
          {messageTemplates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || status !== 'online' || allOutreachActive}
                onClick={() => void activateAllOutreachTemplates()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-zinc-100 disabled:opacity-40"
              >
                Активувати всі
              </button>
              <button
                type="button"
                disabled={busy || status !== 'online' || noneOutreachActive}
                onClick={() => void deactivateAllOutreachTemplates()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-zinc-100 disabled:opacity-40"
              >
                Деактивувати всі
              </button>
            </div>
          ) : null}
          <div className="space-y-2">
            {messageTemplates.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-6 text-center text-sm text-zinc-500">
                Пока нет шаблонов. Создайте первый справа и нажмите «Сохранить шаблон».
              </div>
            ) : null}
            {sortedTemplates.map((t, idx) => {
              const selected = !creatingNew && t.id === activeId
              const inOutreachPool = outreachPoolSet.has(t.id)
              return (
                <div
                  key={t.id}
                  className={[
                    'w-full rounded-2xl border px-4 py-3 text-left transition-colors',
                    selected
                      ? 'border-accent/35 bg-accent/10 text-white'
                      : 'border-white/[0.08] bg-white/[0.03] text-zinc-300'
                  ].join(' ')}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => selectTemplate(t)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">{templateTitle(t)}</div>
                      {inOutreachPool ? (
                        <span className="rounded-md border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-200/95">
                          Активний
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 line-clamp-2 font-mono text-[11px] text-zinc-500">
                      {templateContent(t)}
                    </div>
                  </button>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
                    {sortMode === 'manual' && messageTemplates.length > 1 ? (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          title="Вгору"
                          disabled={busy || status !== 'online' || idx === 0}
                          onClick={() => void moveTemplate(t.id, 'up')}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-200 hover:border-accent/30 hover:text-white disabled:opacity-40"
                        >
                          <ChevronUp className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          title="Вниз"
                          disabled={
                            busy ||
                            status !== 'online' ||
                            idx === sortedTemplates.length - 1
                          }
                          onClick={() => void moveTemplate(t.id, 'down')}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-200 hover:border-accent/30 hover:text-white disabled:opacity-40"
                        >
                          <ChevronDown className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      disabled={busy || status !== 'online'}
                      onClick={() => void toggleOutreachTemplate(t)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-zinc-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-zinc-100 disabled:opacity-40"
                    >
                      {inOutreachPool ? 'Зняти' : 'Активувати'}
                    </button>
                    <button
                      type="button"
                      disabled={busy || status !== 'online'}
                      onClick={() => void removeTemplate(t)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 px-3 py-2 text-xs font-medium text-red-300/90 hover:bg-red-500/10 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Удалить
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm font-semibold text-white">Редактор</div>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-[12px] font-medium text-emerald-100 hover:border-emerald-400/40 hover:bg-emerald-500/15"
                  onClick={() => {
                    setCreatingNew(true)
                    setEditingId(null)
                    setDraftTitle('')
                    setDraft('')
                  }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <FilePlus className="h-3.5 w-3.5" aria-hidden />
                    Новий шаблон
                  </span>
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] font-medium text-zinc-200 hover:border-accent/30 hover:text-white"
                  onClick={() =>
                    setDraft(
                      '{Привет|Хей|Йо}, {first_name}! Это тест для {chat_name} · @{username}'
                    )
                  }
                >
                  Вставить пример
                </motion.button>
              </div>
            </div>
            <label className="mt-4 block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Название шаблона
              </span>
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-accent/35"
                placeholder="За потреби залиште порожнім — назва 1, 2, 3…"
              />
            </label>
            <label className="mt-4 block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Текст сообщения
              </span>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="mt-2 min-h-[160px] w-full resize-y rounded-2xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-[13px] leading-relaxed text-zinc-100 outline-none focus:border-accent/35 focus:shadow-[0_0_0_4px_rgba(94,200,255,0.12)]"
                spellCheck={false}
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <motion.button
                type="button"
                disabled={busy || status !== 'online'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => void saveNewTemplate()}
                className="inline-flex items-center gap-2 rounded-xl border border-accent/35 bg-accent/15 px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 disabled:opacity-40"
              >
                <Save className="h-4 w-4" aria-hidden />
                {busy ? 'Сохранение…' : 'Сохранить шаблон'}
              </motion.button>
              {active && editingId === active.id && !creatingNew ? (
                <motion.button
                  type="button"
                  disabled={busy || status !== 'online'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void updateCurrent()}
                  className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-200 hover:border-accent/30 hover:text-white disabled:opacity-40"
                >
                  Обновить текущий
                </motion.button>
              ) : null}
            </div>

            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <div className="flex flex-wrap items-center gap-2">
                <Layers className="h-4 w-4 text-zinc-500" aria-hidden />
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Кілька шаблонів за раз
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                Кожен блок: якщо лише один непустий рядок — це текст шаблону (назву дасть сервер). Інакше перший непустий рядок — назва, усі наступні — текст. Розділювач між шаблонами — окремий рядок{' '}
                <span className="font-mono text-zinc-500">---</span>.
              </p>
              <textarea
                value={bulkDraft}
                onChange={(e) => setBulkDraft(e.target.value)}
                className="mt-3 min-h-[120px] w-full resize-y rounded-2xl border border-white/[0.10] bg-black/30 px-4 py-3 font-mono text-[12px] leading-relaxed text-zinc-100 outline-none focus:border-accent/35"
                spellCheck={false}
                placeholder={'Intro A\nТекст першого шаблону…\n\n---\nIntro B\nТекст другого…'}
              />
              <motion.button
                type="button"
                disabled={busy || status !== 'online'}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => void saveBulkTemplates()}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-200 hover:border-accent/30 hover:text-white disabled:opacity-40"
              >
                <Layers className="h-4 w-4" aria-hidden />
                {busy ? 'Збереження…' : 'Зберегти всі з поля'}
              </motion.button>
            </div>
          </div>

          <div className="glass-panel p-5">
            <div className="text-sm font-semibold text-white">Предпросмотр</div>
            <div className="mt-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-[13px] leading-relaxed text-zinc-200">
              {preview}
            </div>
            <div className="mt-3 text-[11px] text-zinc-600">
              Выбран в редакторе:{' '}
              {creatingNew ? 'Новий шаблон' : active ? templateTitle(active) : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
