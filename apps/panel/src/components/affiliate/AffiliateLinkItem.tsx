import { motion } from 'framer-motion'
import {
  BarChart3,
  Check,
  Copy,
  Link2,
  Loader2,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Wrench
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AffiliateLinkRow } from '@/lib/api'
import { AFFILIATE_STATS_PATH } from '@/lib/panelRoutes'

type Props = {
  link: AffiliateLinkRow
  offerId: string
  joinRequiresApproval?: boolean
  copiedId: string | null
  busyId: string | null
  onCopy: (url: string, id: string) => void
  onRename: (linkId: string, label: string) => Promise<void>
  onRegenerate: (linkId: string) => Promise<void>
  onRepair: (linkId: string) => Promise<void>
}

function joinLabel(link: AffiliateLinkRow, joinRequiresApproval?: boolean): string {
  const joins = link.joins ?? 0
  const leaves = link.leaves ?? 0
  if (joins === 0 && leaves === 0) {
    return joinRequiresApproval ? 'Ще ніхто не подав заявку' : 'Ще ніхто не приєднався'
  }
  const parts: string[] = []
  if (joins > 0) parts.push(`${joins} підписник${joins === 1 ? '' : joins < 5 ? 'и' : 'ів'}`)
  if (leaves > 0) parts.push(`−${leaves} відп.`)
  if (joinRequiresApproval && joins === 0) parts.push('очікує схвалення')
  return parts.join(' · ')
}

export function AffiliateLinkItem({
  link,
  offerId,
  joinRequiresApproval,
  copiedId,
  busyId,
  onCopy,
  onRename,
  onRegenerate,
  onRepair
}: Props): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draftLabel, setDraftLabel] = useState(link.label ?? '')
  const isBusy = busyId === link.id
  const ready = link.isReady !== false && Boolean(link.inviteLink?.trim())

  async function saveLabel(): Promise<void> {
    const next = draftLabel.trim()
    if (!next || next === link.label) {
      setEditing(false)
      return
    }
    await onRename(link.id, next)
    setEditing(false)
    setMenuOpen(false)
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-3 transition-colors hover:border-sky-400/20 hover:bg-sky-500/[0.04]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/20">
          <Link2 className="h-4 w-4" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={draftLabel}
                maxLength={32}
                onChange={(e) => setDraftLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void saveLabel()
                  if (e.key === 'Escape') setEditing(false)
                }}
                className="min-w-0 flex-1 rounded-lg border border-sky-400/30 bg-black/40 px-2.5 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-sky-400/30"
              />
              <button
                type="button"
                onClick={() => void saveLabel()}
                disabled={isBusy}
                className="rounded-lg bg-sky-500/20 px-2.5 py-1.5 text-sky-200"
              >
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftLabel(link.label ?? '')
                setEditing(true)
              }}
              className="flex max-w-full items-center gap-1.5 text-left text-sm font-medium text-white hover:text-sky-200"
            >
              <span className="truncate">{link.label || 'Посилання'}</span>
              <Pencil className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
            </button>
          )}

          <p className="mt-0.5 text-xs text-zinc-500">{joinLabel(link, joinRequiresApproval)}</p>

          {ready ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2">
                <span className="truncate font-mono text-[11px] text-zinc-400">{link.inviteLink}</span>
              </div>
              <button
                type="button"
                onClick={() => onCopy(link.inviteLink, link.id)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-sky-500/90 px-3 py-2 text-xs font-medium text-white transition hover:bg-sky-400"
              >
                {copiedId === link.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedId === link.id ? 'Скопійовано' : 'Копіювати'}
              </button>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2">
              <span className="text-xs text-amber-100/90">Посилання не згенеровано</span>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void onRepair(link.id)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs text-amber-100 hover:bg-amber-500/30"
              >
                {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wrench className="h-3 w-3" />}
                Створити
              </button>
            </div>
          )}
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            aria-label="Меню посилання"
            onClick={() => setMenuOpen((v) => !v)}
            className="cursor-pointer rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10 cursor-default"
                aria-label="Закрити меню"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#12161f] py-1 shadow-2xl"
              >
                <Link
                  to={`${AFFILIATE_STATS_PATH}?offer=${encodeURIComponent(offerId)}&link=${encodeURIComponent(link.id)}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Статистика
                </Link>
                {(link.joins ?? 0) === 0 && ready ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      setMenuOpen(false)
                      void onRegenerate(link.id)
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Перестворити
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setDraftLabel(link.label ?? '')
                    setEditing(true)
                    setMenuOpen(false)
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Перейменувати
                </button>
              </motion.div>
            </>
          ) : null}
        </div>
      </div>
    </motion.li>
  )
}
