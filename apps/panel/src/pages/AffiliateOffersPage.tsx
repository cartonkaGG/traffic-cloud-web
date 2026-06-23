import { motion } from 'framer-motion'
import { Loader2, RefreshCw, Zap } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  apiAffiliateCategories,
  apiAffiliateCreateLink,
  apiAffiliateMyLinks,
  apiAffiliateOffers,
  apiAffiliateRegenerateLink,
  apiAffiliateRepairLink,
  apiAffiliateRenameLink,
  type AffiliateCategory,
  type AffiliateLinkRow,
  type AffiliateOffer
} from '@/lib/api'
import { AffiliateOfferCard } from '@/components/affiliate/AffiliateOfferCard'

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
}

function linkErrorMessage(code: string): string {
  const map: Record<string, string> = {
    link_limit_reached: 'Максимум 10 посилань на один офер',
    telegram_invite_failed: 'Telegram не створив посилання — перевірте права бота',
    bot_not_configured: 'Бот не налаштований для цього оферу',
    link_has_active_joins: 'Неможливо перестворити — є активні підписники'
  }
  return map[code] ?? code
}

export function AffiliateOffersPage(): JSX.Element {
  const [categories, setCategories] = useState<AffiliateCategory[]>([])
  const [offers, setOffers] = useState<AffiliateOffer[]>([])
  const [myLinks, setMyLinks] = useState<AffiliateLinkRow[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingOfferId, setCreatingOfferId] = useState<string | null>(null)
  const [linkBusyId, setLinkBusyId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadOffers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [cats, links, off] = await Promise.all([
        apiAffiliateCategories(),
        apiAffiliateMyLinks(),
        apiAffiliateOffers(activeCategory || undefined)
      ])
      setCategories(cats.items)
      setMyLinks(links.items)
      setOffers(off.items)
      if (off.items.length === 1) {
        setExpandedOfferId(off.items[0].id)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка завантаження')
    } finally {
      setLoading(false)
    }
  }, [activeCategory])

  useEffect(() => {
    void loadOffers()
  }, [loadOffers])

  const linksByOffer = useMemo(() => {
    const m = new Map<string, AffiliateLinkRow[]>()
    for (const l of myLinks) {
      const list = m.get(l.offerId) ?? []
      list.push(l)
      m.set(l.offerId, list)
    }
    for (const [, list] of m) {
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    }
    return m
  }, [myLinks])

  function upsertLink(link: AffiliateLinkRow, meta?: Partial<AffiliateLinkRow>): void {
    setMyLinks((prev) => {
      const offer = offers.find((o) => o.id === link.offerId)
      const enriched = {
        ...link,
        ...meta,
        offerTitle: meta?.offerTitle ?? offer?.title,
        categoryName: meta?.categoryName ?? offer?.categoryName ?? undefined,
        payoutPerJoinUsd: meta?.payoutPerJoinUsd ?? offer?.payoutPerJoinUsd
      }
      const rest = prev.filter((l) => l.id !== link.id)
      return [enriched, ...rest]
    })
  }

  async function repairLink(linkId: string): Promise<void> {
    setCreatingOfferId(offerId)
    setError(null)
    try {
      const { link } = await apiAffiliateCreateLink(offerId, label)
      upsertLink(link)
      setExpandedOfferId(offerId)
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Помилка'
      setError(linkErrorMessage(raw.replace(/\s*\(\d+\)\s*$/, '').trim()))
    } finally {
      setCreatingOfferId(null)
    }
  }

  async function renameLink(linkId: string, label: string): Promise<void> {
    setLinkBusyId(linkId)
    try {
      const { link } = await apiAffiliateRenameLink(linkId, label)
      upsertLink(link)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося перейменувати')
    } finally {
      setLinkBusyId(null)
    }
  }

  async function regenerateLink(linkId: string): Promise<void> {
    setLinkBusyId(linkId)
    try {
      const { link } = await apiAffiliateRegenerateLink(linkId)
      upsertLink(link)
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Помилка'
      setError(linkErrorMessage(raw.replace(/\s*\(\d+\)\s*$/, '').trim()))
    } finally {
      setLinkBusyId(null)
    }
  }

  async function repairLink(linkId: string): Promise<void> {
    setLinkBusyId(linkId)
    try {
      const { link } = await apiAffiliateRepairLink(linkId)
      upsertLink(link)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося створити посилання')
    } finally {
      setLinkBusyId(null)
    }
  }

  function copyLink(url: string, id: string): void {
    void navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-sky-500/[0.08] p-6 sm:p-8"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
              <Zap className="h-3.5 w-3.5" />
              Партнерська панель
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Офери та посилання
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
              Створюйте до 10 іменованих invite-лінків на кожен офер — як у Telegram. Кожне
              посилання рахує своїх підписників окремо.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadOffers()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.1] bg-black/30 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Оновити
          </button>
        </div>
      </motion.div>

      {error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </motion.div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        {['', ...categories.map((c) => c.slug)].map((slug) => {
          const label = slug ? categories.find((c) => c.slug === slug)?.name ?? slug : 'Усі'
          const active = activeCategory === slug
          return (
            <button
              key={slug || 'all'}
              type="button"
              onClick={() => setActiveCategory(slug)}
              className={[
                'cursor-pointer rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200',
                active
                  ? 'border-sky-400/40 bg-sky-500/15 text-sky-100 shadow-[0_0_24px_-8px_rgba(56,189,248,0.5)]'
                  : 'border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-200'
              ].join(' ')}
            >
              {label}
            </button>
          )
        })}
      </div>

      {loading && offers.length === 0 ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-9 w-9 animate-spin text-sky-400" />
        </div>
      ) : (
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mt-8 space-y-4"
        >
          {offers.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">Наразі немає активних оферів у цій категорії.</p>
          ) : (
            offers.map((offer) => (
              <AffiliateOfferCard
                key={offer.id}
                offer={offer}
                links={linksByOffer.get(offer.id) ?? []}
                expanded={expandedOfferId === offer.id}
                onToggle={() =>
                  setExpandedOfferId((id) => (id === offer.id ? null : offer.id))
                }
                linkBusyId={linkBusyId}
                creating={creatingOfferId === offer.id}
                copiedId={copied}
                onCreateLink={createLink}
                onCopy={copyLink}
                onRename={renameLink}
                onRegenerate={regenerateLink}
                onRepair={repairLink}
              />
            ))
          )}
        </motion.section>
      )}
    </div>
  )
}
