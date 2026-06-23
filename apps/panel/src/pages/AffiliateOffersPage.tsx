import { motion } from 'framer-motion'
import { Loader2, RefreshCw } from 'lucide-react'
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

  async function createLink(offerId: string, label: string): Promise<void> {
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
    <div className="mx-auto w-full max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] pb-6"
      >
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Офери</h2>
          <p className="mt-1 max-w-lg text-sm text-zinc-500">
            Оберіть офер, створіть до 10 посилань з назвою методу заливу — статистика рахується окремо.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadOffers()}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Оновити
        </button>
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

      <div className="mt-6 flex flex-wrap gap-2">
        {['', ...categories.map((c) => c.slug)].map((slug) => {
          const label = slug ? categories.find((c) => c.slug === slug)?.name ?? slug : 'Усі'
          const active = activeCategory === slug
          return (
            <button
              key={slug || 'all'}
              type="button"
              onClick={() => setActiveCategory(slug)}
              className={[
                'cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
                active
                  ? 'border-white/20 bg-white/[0.08] text-white'
                  : 'border-white/[0.06] text-zinc-500 hover:border-white/12 hover:text-zinc-300'
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
