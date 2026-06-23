import { useCallback, useEffect, useMemo, useState } from 'react'
import { Copy, Link2, Loader2, RefreshCw } from 'lucide-react'
import {
  apiAffiliateCategories,
  apiAffiliateGetLink,
  apiAffiliateMyLinks,
  apiAffiliateOffers,
  type AffiliateCategory,
  type AffiliateLinkRow,
  type AffiliateOffer
} from '@/lib/api'

export function AffiliateOffersPage(): JSX.Element {
  const [categories, setCategories] = useState<AffiliateCategory[]>([])
  const [offers, setOffers] = useState<AffiliateOffer[]>([])
  const [myLinks, setMyLinks] = useState<AffiliateLinkRow[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [linkLoading, setLinkLoading] = useState<string | null>(null)
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
    const m = new Map<string, AffiliateLinkRow>()
    for (const l of myLinks) m.set(l.offerId, l)
    return m
  }, [myLinks])

  async function getLink(offerId: string): Promise<void> {
    setLinkLoading(offerId)
    try {
      const { link } = await apiAffiliateGetLink(offerId)
      setMyLinks((prev) => {
        const rest = prev.filter((l) => l.offerId !== offerId)
        const offer = offers.find((o) => o.id === offerId)
        return [
          {
            ...link,
            offerTitle: offer?.title,
            categoryName: offer?.categoryName ?? undefined,
            payoutPerJoinUsd: offer?.payoutPerJoinUsd
          },
          ...rest
        ]
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не вдалося створити посилання')
    } finally {
      setLinkLoading(null)
    }
  }

  function copyLink(url: string, id: string): void {
    void navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  function usd(n: number): string {
    return `$${n.toFixed(2)}`
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="text-sm text-zinc-500">
          Обирайте офер і отримуйте унікальне посилання для заливу трафіку.
        </p>
        <button
          type="button"
          onClick={() => void loadOffers()}
          className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Оновити
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loading && offers.length === 0 ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : (
        <section className="mt-8">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('')}
              className={[
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                !activeCategory
                  ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                  : 'border-white/10 text-zinc-500 hover:text-zinc-300'
              ].join(' ')}
            >
              Усі
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.slug)}
                className={[
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  activeCategory === c.slug
                    ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                    : 'border-white/10 text-zinc-500 hover:text-zinc-300'
                ].join(' ')}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {offers.length === 0 ? (
              <p className="text-sm text-zinc-500">Наразі немає активних оферів у цій категорії.</p>
            ) : (
              offers.map((offer) => {
                const link = linksByOffer.get(offer.id)
                return (
                  <div
                    key={offer.id}
                    className="rounded-2xl border border-white/[0.08] bg-[#0c1019]/80 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                          {offer.categoryName}
                        </span>
                        <h3 className="mt-1 text-base font-semibold text-white">{offer.title}</h3>
                        {offer.channelUsername ? (
                          <p className="mt-1 text-xs text-zinc-500">@{offer.channelUsername}</p>
                        ) : null}
                      </div>
                      <span className="shrink-0 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-2 py-1 text-sm font-semibold text-emerald-200">
                        {usd(offer.payoutPerJoinUsd)}/підп.
                      </span>
                    </div>
                    {offer.description ? (
                      <p className="mt-3 text-sm leading-relaxed text-zinc-500">{offer.description}</p>
                    ) : null}

                    {link ? (
                      <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/30 p-3">
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                          <Link2 className="h-3.5 w-3.5" />
                          Ваше посилання
                          {link.joins != null ? (
                            <span className="ml-auto text-cyan-400">{link.joins} підписників</span>
                          ) : null}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <input
                            readOnly
                            value={link.inviteLink}
                            className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-zinc-300"
                          />
                          <button
                            type="button"
                            onClick={() => copyLink(link.inviteLink, link.id)}
                            className="flex shrink-0 items-center gap-1 rounded-lg border border-white/[0.1] px-3 py-2 text-xs text-zinc-300 hover:text-white"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copied === link.id ? 'OK' : 'Копіювати'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={linkLoading === offer.id}
                        onClick={() => void getLink(offer.id)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500/90 to-cyan-500/80 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {linkLoading === offer.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Link2 className="h-4 w-4" />
                        )}
                        Отримати посилання
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </section>
      )}
    </div>
  )
}
