import { Play } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const PROMO_MP4 = '/promo/traffic-cloud-promo.mp4';
const PROMO_WEBM = '/promo/traffic-cloud-promo.webm';

export default function HeroPromoVideo() {
  return (
    <section
      id="promo-video"
      className="relative py-14 sm:py-20 bg-gray-950 overflow-hidden border-t border-white/[0.04]"
      aria-label="Презентація Traffic Cloud"
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(94,200,255,0.08),transparent_60%)]" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal variant="up" className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/90 mb-4">
            <Play className="w-3 h-3" />
            Презентація
          </div>
          <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-white tracking-tight">
            Повний тур платформою за 35 секунд
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
            Hub → акаунти → парсер → шаблони → розсилка → inbox → Video Uniquify. Зум на реальні екрани панелі.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="up" delay={0.1}>
          <div className="promo-video-frame relative rounded-2xl sm:rounded-3xl border border-white/[0.1] bg-black/40 p-1 sm:p-1.5 shadow-[0_0_80px_-20px_rgba(94,200,255,0.35)]">
            <video
              className="promo-video-player w-full rounded-xl sm:rounded-[1.25rem] aspect-video bg-[#030712]"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/promo/traffic-cloud-promo-poster.jpg"
            >
              <source src={PROMO_MP4} type="video/mp4" />
              <source src={PROMO_WEBM} type="video/webm" />
            </video>
          </div>
          <p className="mt-4 text-center text-[11px] text-gray-600">
            Без звуку · автовідтворення ·{' '}
            <a href="/app/hub" className="text-cyan-400/80 hover:text-cyan-300 transition-colors">
              увійти в панель →
            </a>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
