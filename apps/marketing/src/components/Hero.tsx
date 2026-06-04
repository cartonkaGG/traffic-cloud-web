import { ArrowRight, ChevronDown } from 'lucide-react';
import CloudLogo3D from './CloudLogo3D';
import HeroAmbient from './HeroAmbient';
import { ScrollReveal } from './ScrollReveal';

interface HeroProps {
  onContactClick: () => void;
}

export default function Hero({ onContactClick }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center items-center pt-24 pb-20 overflow-x-clip"
    >
      <HeroAmbient />
      <div className="absolute inset-0 cyber-grid opacity-[0.08] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <ScrollReveal
            variant="up"
            duration={0.65}
            className="lg:col-span-6 flex flex-col justify-center text-center lg:text-left"
          >
            <div className="hero-copy self-center lg:self-start max-w-xl w-full">
              <h1 className="hero-title mb-5">
                <span className="hero-title-glow">Traffic Cloud</span>
              </h1>

              <p className="hero-lead mb-8">
                Ми займаємося трафіком: заливаємо обсяги на різні платформи, масштабуємо кампанії
                та працюємо з цільовою аудиторією в потрібних гео. Допомагаємо партнерам отримувати{' '}
                <span className="text-cyan-200/95">стабільний потік лідів</span> і рости в прибутку.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a
                  href="/app/"
                  className="hero-cta-primary shimmer-btn px-8 py-4 rounded-xl text-white font-semibold text-sm tracking-wide cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>Увійти в панель</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <button
                  type="button"
                  onClick={onContactClick}
                  className="hero-cta-secondary px-8 py-4 rounded-xl text-gray-200 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Зв&apos;язатися
                </button>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal
            variant="right"
            delay={0.08}
            duration={0.7}
            className="lg:col-span-6 flex justify-center items-center w-full"
          >
            <CloudLogo3D />
          </ScrollReveal>
        </div>
      </div>

      <button
        type="button"
        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        className="hero-scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-[10px] font-mono text-gray-500 hover:text-cyan-300 transition-colors cursor-pointer"
      >
        <span>ДІЗНАТИСЬ БІЛЬШЕ</span>
        <ChevronDown className="w-4 h-4 hero-scroll-chevron" />
      </button>
    </section>
  );
}
