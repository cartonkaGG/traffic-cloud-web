import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FilePlus, Layers, Pencil, Save, Star, Trash2 } from 'lucide-react'
import { useWorkspaceData } from '@/context/WorkspaceDataContext'
import { useToast } from '@/context/ToastContext'
import * as mocks from '@/data/mocks'
import type { MessageTemplateModel } from '@/domain/types'
import {
  apiCreateMessageTemplate,
  apiDeleteMessageTemplate,
  apiSetActiveMessageTemplate,
  apiUpdateMessageTemplate
} from '@/lib/api'
import { renderMessageTemplate } from '@/lib/messageEngine'
import { CampaignsSubNav } from '@/components/layout/CampaignsSubNav'
import { templateContent, templateTitle } from '@/lib/templateText'

/** Кілька шаблонів: блоки розділені рядком «---». У кожному блоці перший непустий рядок — назва, решта — текст. */
function parseBulkTemplates(raw: string): { title: string; content: string }[] {
  const normalized = raw.replace(/\r\n/g, '\n')
  const blocks = normalized
    .split(/\n---\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
  const out: { title: string; content: string }[] = []
  for (const block of blocks) {
    const lines = block.split('\n')
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
    if (!titleLine) continue
    const content = lines.slice(start).join('\n').trim()
    if (!content) continue
    out.push({ title: titleLine, content })
  }
  return out
}

export function MessagesPage(): JSX.Element {
  const { bundle, workspaceId, status, refetch } = useWorkspaceData()
  const { pushToast } = useToast()
  const messageTemplates = bundle?.messageTemplates ?? mocks.messageTemplates
  const activeFromServer = bundle?.activeMessageTemplateId ?? null

  const [activeId, setActiveId] = useState<string>('')
  const [draftTitle, setDraftTitle] = useState('')
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [bulkDraft, setBulkDraft] = useState('')
  const [creatingNew, setCreatingNew] = useState(false)

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
    setEditingId(null)
  }, [])

  const saveNewTemplate = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      pushToast('Нет подключения к API', 'error')
      return
    }
    const title = draftTitle.trim()
    const content = draft.trim()
    if (!title) {
      pushToast('Укажите название шаблона', 'error')
      return
    }
    if (!content) {
      pushToast('Введите текст сообщения', 'error')
      return
    }
    const titleNorm = title.toLowerCase()
    if (
      messageTemplates.some((t) => templateTitle(t).trim().toLowerCase() === titleNorm)
    ) {
      pushToast('Шаблон з такою назвою вже є. Оберіть іншу назву.', 'error')
      return
    }
    setBusy(true)
    try {
      const { template } = await apiCreateMessageTemplate(workspaceId, { title, content })
      pushToast('Шаблон сохранён', 'ok')
      setCreatingNew(false)
      setEditingId(null)
      setActiveId(template.id)
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

  const markActive = useCallback(
    async (t: MessageTemplateModel) => {
      if (!workspaceId || status !== 'online') {
        pushToast('Нет подключения к API', 'error')
        return
      }
      setBusy(true)
      try {
        await apiSetActiveMessageTemplate(workspaceId, t.id)
        setCreatingNew(false)
        setActiveId(t.id)
        setDraft(templateContent(t))
        setDraftTitle(templateTitle(t))
        pushToast('Активный шаблон выбран', 'ok')
        await refetch()
      } catch (e) {
        pushToast(e instanceof Error ? e.message : String(e), 'error')
      } finally {
        setBusy(false)
      }
    },
    [workspaceId, status, refetch, pushToast]
  )

  const saveBulkTemplates = useCallback(async () => {
    if (!workspaceId || status !== 'online') {
      pushToast('Нет подключения к API', 'error')
      return
    }
    const items = parseBulkTemplates(bulkDraft)
    if (!items.length) {
      pushToast(
        'Немає валідних блоків: перший непустий рядок — назва, далі текст повідомлення. Між шаблонами — рядок ---',
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
        const norm = title.trim().toLowerCase()
        if (seenNorm.has(norm)) {
          skippedBatchDup++
          continue
        }
        if (existingNorm.has(norm)) {
          skippedDup++
          continue
        }
        try {
          await apiCreateMessageTemplate(workspaceId, {
            title: title.trim(),
            content
          })
          seenNorm.add(norm)
          existingNorm.add(norm)
          created++
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          if (/template_title_duplicate|такою назвою/i.test(msg)) {
            skippedDup++
            existingNorm.add(norm)
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
      <p className="max-w-2xl text-sm text-zinc-500">
        Тексти для DM. Активний шаблон використовується при розсилці; підтримуються змінні та спінтакс.
      </p>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Шаблоны
            </div>
          </div>
          <div className="space-y-2">
            {messageTemplates.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-6 text-center text-sm text-zinc-500">
                Пока нет шаблонов. Создайте первый справа и нажмите «Сохранить шаблон».
              </div>
            ) : null}
            {messageTemplates.map((t) => {
              const selected = !creatingNew && t.id === activeId
              const isActiveGlobal = activeFromServer === t.id
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
                      {isActiveGlobal ? (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                          активный
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 line-clamp-2 font-mono text-[11px] text-zinc-500">
                      {templateContent(t)}
                    </div>
                  </button>
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
                    <button
                      type="button"
                      disabled={busy || status !== 'online'}
                      onClick={() => void markActive(t)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-medium text-zinc-200 hover:border-accent/30 hover:text-white disabled:opacity-40"
                    >
                      <Star className="h-3.5 w-3.5" aria-hidden />
                      Сделать активным
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setCreatingNew(false)
                        setEditingId(t.id)
                        setActiveId(t.id)
                        setDraftTitle(templateTitle(t))
                        setDraft(templateContent(t))
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 hover:border-accent/25 hover:text-white disabled:opacity-40"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Править
                    </button>
                    <button
                      type="button"
                      disabled={busy || status !== 'online'}
                      onClick={() => void removeTemplate(t)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 px-2.5 py-1.5 text-[11px] font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-40"
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
                placeholder="Например Intro · cold DM"
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
                Кожен блок: перший непустий рядок — назва, усі наступні — текст. Розділювач між шаблонами — окремий
                рядок <span className="font-mono text-zinc-500">---</span>.
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
