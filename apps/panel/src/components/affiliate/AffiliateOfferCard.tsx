import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Loader2, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { AffiliateLinkRow, AffiliateOffer } from '@/lib/api'
import { AffiliateLinkItem } from './AffiliateLinkItem'

const MAX_LINKS = 10

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
  onRepair
}: Props): JSX.Element {
  const [newLabel, setNewLabel] = useState('')
  const totalJoins = links.reduce((s, l) => s + (l.joins ?? 0), 0)
  const canCreate = links.length < MAX_LINKS

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0e16]/90 shadow-[0_24px_80px_-40px_rgba(14,165,233,0.35)] backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-start gap-4 p-5 text-left transition hover:bg-white/[0.02] sm:p-6"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 ring-1 ring-emerald-400/20">
          <Sparkles className="h-5 w-5 text-emerald-300" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {offer.categoryName}
            </span>
            {links.length > 0 ? (
              <span className="text-[10px] text-sky-400/90">
                {links.length}/{MAX_LINKS} посилань · {totalJoins} підп.
              </span>
            ) : null}
          </div>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-white">{offer.title}</h3>
          {offer.channelUsername ? (
            <p className="mt-0.5 text-sm text-zinc-500">@{offer.channelUsername}</p>
          ) : null}
          {offer.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">{offer.description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-200">
            {usd(offer.payoutPerJoinUsd)}
            <span className="text-[10px] font-normal text-emerald-300/80">/підп.</span>
          </span>
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} className="text-zinc-500">
            <ChevronDown className="h-5 w-5" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="links"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/[0.06] bg-black/20"
          >
            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">Посилання для заливу</h4>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Як у Telegram — до {MAX_LINKS} унікальних лінків з власними назвами.
                  </p>
                </div>
              </div>

              {links.length > 0 ? (
                <motion.ul layout className="space-y-2">
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
                      />
                    ))}
                  </AnimatePresence>
                </motion.ul>
              ) : (
                <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-500">
                  Ще немає посилань. Створіть перше нижче.
                </p>
              )}

              {canCreate ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    void onCreateLink(offer.id, newLabel)
                    setNewLabel('')
                  }}
                  className="flex flex-col gap-2 rounded-2xl border border-sky-400/15 bg-sky-500/[0.06] p-4 sm:flex-row"
                >
                  <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    maxLength={32}
                    placeholder="Назва посилання (напр. tg ads, переходник…)"
                    className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
                  />
                  <button
                    type="submit"
                    disabled={creating}
                    className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:brightness-110 disabled:opacity-60"
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Створити посилання
                  </button>
                </form>
              ) : (
                <p className="text-center text-xs text-zinc-500">Досягнуто ліміт {MAX_LINKS} посилань для цього оферу.</p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  )
}
