import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Check, Crown, Sparkles } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { fetchPublicBillingPlan } from '../lib/api'

const PANEL_SUBSCRIBE_HREF = '/app/subscribe'

const features = [
  'DM Outreach консоль на місяць',
  'Telegram акаунти, проксі, anti-detect',
  'Парсер джерел і кампанії',
  'Логи та аналітика в реальному часі',
  'Оплата криптою через NOWPayments'
]

export default function PricingPro() {
  const [price, setPrice] = useState(29)
  const [currency, setCurrency] = useState('usd')
  const [planTitle, setPlanTitle] = useState('Traffic Cloud Pro')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const plan = await fetchPublicBillingPlan()
        setPrice(plan.monthlyPriceUsd)
        setCurrency(plan.currency)
        setPlanTitle(plan.planTitle)
      } catch {
        /* fallback defaults */
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <section id="pricing" className="relative py-16 sm:py-24 bg-gray-950 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <ScrollReveal variant="up">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Traffic Cloud Pro
            </div>
            <h2 className="mt-4 text-2xl sm:text-5xl font-sans font-extrabold text-white tracking-tight">
              Підписка на панель
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={0.1}>
            <p className="mt-4 text-base sm:text-lg text-gray-400 font-sans">
              Один план — повний доступ до outreach-інфраструктури. Оплата криптою, місяць за місяцем.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal variant="up" delay={0.15}>
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative mx-auto max-w-lg overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-gray-900/90 to-gray-950/95 p-8 sm:p-10 shadow-[0_0_60px_-20px_rgba(6,182,212,0.35)]"
          >
            <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10">
                  <Crown className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300/90">
                    Pro
                  </div>
                  <div className="text-xl font-bold text-white">{planTitle}</div>
                </div>
              </div>

              <div className="mt-8 flex items-end gap-2">
                {loading ? (
                  <span className="text-4xl font-extrabold text-white">…</span>
                ) : (
                  <>
                    <span className="text-5xl font-extrabold text-white">${price}</span>
                    <span className="mb-1 text-sm text-gray-500">
                      / {currency.toUpperCase()} · місяць
                    </span>
                  </>
                )}
              </div>

              <ul className="mt-8 space-y-3">
                {features.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href={PANEL_SUBSCRIBE_HREF}
                className="mt-8 flex w-full min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_4px_24px_rgba(6,182,212,0.35)] transition-all hover:from-cyan-500 hover:to-blue-500"
              >
                Оформити підписку
                <ArrowRight className="h-4 w-4" />
              </a>

              <p className="mt-4 text-center text-[11px] text-gray-500">
                Потрібен вхід або реєстрація — потім сторінка оплати NOWPayments
              </p>
            </div>
          </motion.div>
        </ScrollReveal>
      </div>
    </section>
  )
}
