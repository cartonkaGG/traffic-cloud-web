import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ChevronDown, TrendingUp } from 'lucide-react';
import CloudLogo3D from './CloudLogo3D';
import HeroAmbient from './HeroAmbient';
import { ScrollReveal } from './ScrollReveal';
import { FEATURES } from '../config/features';
import { usePanelAdmin } from '../lib/usePanelAdmin';
import { usePanelSession } from '../lib/usePanelSession';

interface HeroProps {
  onContactClick: () => void;
}

const PANEL_ENTRY = '/app/affiliate/offers';

function panelAuthHref(): string {
  return `/app/auth?redirect=${encodeURIComponent(PANEL_ENTRY)}`;
}

export default function Hero({ onContactClick }: HeroProps) {
  const { isAdmin } = usePanelAdmin();
  const { isLoggedIn } = usePanelSession();
  const affiliate = FEATURES.affiliateOnlyMode;

  const scrollToOffers = useCallback(() => {
    document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] lg:min-h-screen flex flex-col justify-center items-center pt-[max(5.5rem,env(safe-area-inset-top))] pb-12 sm:pb-16 lg:pb-20 overflow-x-clip"
    >
      <HeroAmbient />
      <div className="absolute inset-0 cyber-grid opacity-[0.06] md:opacity-[0.08] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          <ScrollReveal
            variant="up"
            duration={0.65}
            className="lg:col-span-6 flex flex-col justify-center text-center lg:text-left order-2 lg:order-1"
          >
            <div className="hero-copy self-center lg:self-start max-w-xl w-full">
              {affiliate ? (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Партнерська платформа
                </div>
              ) : null}

              <h1 className="hero-title mb-4 sm:mb-5">
                <span className="hero-title-glow">
                  {affiliate ? 'Заливай трафік' : 'Traffic Cloud'}
                </span>
              </h1>

              <p className="hero-lead mb-6 sm:mb-8">
                {affiliate ? (
                  <>
                    Обирай офери Telegram-каналів, отримуй{' '}
                    <span className="text-emerald-200/95">унікальні посилання</span> (до 10 на офер) і
                    заробляй за кожного підписника. Статистика та виведення — в особистому кабінеті.
                  </>
                ) : (
                  <>
                    Ми займаємося трафіком: заливаємо обсяги на різні платформи, масштабуємо
                    кампанії та працюємо з цільовою аудиторією в потрібних гео. Допомагаємо
                    партнерам отримувати{' '}
                    <span className="text-cyan-200/95">стабільний потік лідів</span> і рости в
                    прибутку.
                  </>
                )}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a
                  href={isLoggedIn ? PANEL_ENTRY : panelAuthHref()}
                  className="hero-cta-primary shimmer-btn min-h-[48px] px-8 py-3.5 sm:py-4 rounded-xl text-white font-semibold text-sm tracking-wide cursor-pointer flex items-center justify-center gap-2 touch-manipulation bg-gradient-to-r from-emerald-500 to-cyan-500"
                >
                  <span>{isLoggedIn ? 'Відкрити панель' : 'Увійти в панель'}</span>
                </a>
                {affiliate ? (
                  <button
                    type="button"
                    onClick={scrollToOffers}
                    className="hero-cta-secondary min-h-[48px] px-8 py-3.5 sm:py-4 rounded-xl text-gray-200 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 touch-manipulation border border-white/10"
                  >
                    Як це працює
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onContactClick}
                  className="hero-cta-secondary min-h-[48px] px-8 py-3.5 sm:py-4 rounded-xl text-gray-200 text-sm font-semibold transition-colors cursor-pointer touch-manipulation"
                >
                  Зв&apos;язатися
                </button>
              </div>

              {affiliate && isAdmin ? (
                <p className="mt-4 text-xs text-zinc-500">
                  Адмін: кнопка в шапці сайту або{' '}
                  <a href="/app/admin/affiliate" className="text-amber-300/90 hover:underline">
                    керування оферами
                  </a>
                </p>
              ) : null}
            </div>
          </ScrollReveal>

          <ScrollReveal
            variant="right"
            delay={0.08}
            duration={0.7}
            className="lg:col-span-6 flex justify-center items-center w-full order-1 lg:order-2 -mt-2 sm:mt-0"
          >
            <CloudLogo3D />
          </ScrollReveal>
        </div>
      </div>

      <button
        type="button"
        onClick={() =>
          document
            .getElementById(affiliate ? 'offers' : 'about')
            ?.scrollIntoView({ behavior: 'smooth' })
        }
        className="hero-scroll-hint hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-cyan-300 transition-colors cursor-pointer touch-manipulation"
      >
        <span>{affiliate ? 'ЯК ЦЕ ПРАЦЮЄ' : 'ДІЗНАТИСЬ БІЛЬШЕ'}</span>
        <ChevronDown className="w-4 h-4 hero-scroll-chevron" />
      </button>
    </section>
  );
}
