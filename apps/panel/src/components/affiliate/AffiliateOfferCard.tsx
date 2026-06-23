import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ExternalLink, Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AffiliateLinkRow, AffiliateOffer } from '@/lib/api'
import { AFFILIATE_STATS_PATH } from '@/lib/panelRoutes'
import { AffiliateLinkItem } from './AffiliateLinkItem'

const MAX_LINKS = 10

const TRAFFIC_PRESETS = [
  'TT спам',
  'TG спам',
  'Рілси',
  'TG ads',
  'Переходник',
  'Інше'
] as const

type Props = {
  offer: AffiliateOffer
  links: AffiliateLinkRow[]
  expanded: boolean
  onToggle: () => void
  linkBusyId: string | null
  creating: boolean
  copiedId: string | null
  onCreateLink: (offerId: string, label: string) => Promise<void>
  onCopy: (url: string, id: string) => void
  onRename: (linkId: string, label: string) => Promise<void>
  onRegenerate: (linkId: string) => Promise<void>
  onRepair: (linkId: string) => Promise<void>
  onDeleteLink: (linkId: string) => Promise<void>
}

function usd(n: number): string {
  return `$${n.toFixed(2)}`
}

export function AffiliateOfferCard({
  offer,
  links,
  expanded,
  onToggle,
  linkBusyId,
  creating,
  copiedId,
  onCreateLink,
  onCopy,
  onRename,
  onRegenerate,
  onRepair,
  onDeleteLink
}: Props): JSX.Element {
  const [newLabel, setNewLabel] = useState('')
  const totalJoins = links.reduce((s, l) => s + (l.joins ?? 0), 0)
  const canCreate = links.length < MAX_LINKS

  async function submitNewLink(label: string): Promise<void> {
    const trimmed = label.trim()
    if (!trimmed) return
    await onCreateLink(offer.id, trimmed)
    setNewLabel('')
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        'overflow-hidden rounded-2xl border transition-colors',
        expanded
          ? 'border-white/[0.1] bg-[#0a0e14]'
          : 'border-white/[0.06] bg-[#080b10] hover:border-white/[0.09]'
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-4 p-4 text-left sm:p-5"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
              {offer.categoryName}
            </span>
            {links.length > 0 ? (
              <span className="text-[10px] text-zinc-500">
                {links.length}/{MAX_LINKS} · {totalJoins} підп.
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 text-base font-semibold text-white sm:text-lg">{offer.title}</h3>
          {offer.channelUsername ? (
            <p className="mt-0.5 text-xs text-zinc-500">@{offer.channelUsername}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold tabular-nums text-emerald-300">
              {usd(offer.payoutPerJoinUsd)}
            </div>
            <div className="text-[10px] text-zinc-600">за підп.</div>
          </div>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-zinc-500">
            <ChevronDown className="h-5 w-5" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            <div className="space-y-4 p-4 sm:p-5">
              {offer.description ? (
                <p className="text-sm leading-relaxed text-zinc-500">{offer.description}</p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-medium text-white">Посилання для заливу</h4>
                  <p className="mt-0.5 text-xs text-zinc-600">
                    Назвіть метод — так ви побачите статистику по TT, TG, рілсах тощо.
                  </p>
                </div>
                <Link
                  to={`${AFFILIATE_STATS_PATH}?offer=${encodeURIComponent(offer.id)}`}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-[11px] text-zinc-400 transition hover:text-white"
                >
                  Статистика
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {links.length > 0 ? (
                <ul className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {links.map((link) => (
                      <AffiliateLinkItem
                        key={link.id}
                        link={link}
                        offerId={offer.id}
                        joinRequiresApproval={offer.joinRequiresApproval}
                        copiedId={copiedId}
                        busyId={linkBusyId}
                        onCopy={onCopy}
                        onRename={onRename}
                        onRegenerate={onRegenerate}
                        onRepair={onRepair}
                        onDelete={onDeleteLink}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-white/[0.08] px-4 py-5 text-center text-sm text-zinc-600">
                  Ще немає посилань. Оберіть метод нижче.
                </p>
              )}

              {canCreate ? (
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                    Швидкий вибір методу
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {TRAFFIC_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        disabled={creating}
                        onClick={() => void submitNewLink(preset)}
                        className="cursor-pointer rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-400 transition hover:border-sky-400/25 hover:text-sky-200 disabled:opacity-50"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      void submitNewLink(newLabel)
                    }}
                    className="mt-3 flex flex-col gap-2 sm:flex-row"
                  >
                    <input
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      maxLength={32}
                      placeholder="Або власна назва (напр. крео #2)"
                      className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#06080d] px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/20"
                    />
                    <button
                      type="submit"
                      disabled={creating || !newLabel.trim()}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-100 disabled:opacity-50"
                    >
                      {creating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Створити
                    </button>
                  </form>
                  <p className="mt-2 text-[11px] text-zinc-600">
                    Посилання з&apos;явиться в Telegram-каналі з цією назвою. Бот має бути адміном з
                    правом запрошень.
                  </p>
                </div>
              ) : (
                <p className="text-center text-xs text-zinc-600">
                  Ліміт {MAX_LINKS} посилань для цього оферу.
                </p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  )
}
