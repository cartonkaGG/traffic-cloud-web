import { motion } from 'motion/react';
import { ArrowRight, ChevronDown, Rocket, Users, Milestone, TrendingUp } from 'lucide-react';
import CloudLogo3D from './CloudLogo3D';

interface HeroProps {
  onContactClick: () => void;
}

export default function Hero({ onContactClick }: HeroProps) {
  const metrics = [
    { label: 'Кліків / добу', value: '5.2M+', desc: 'Стабільний потік целевих лідів', icon: Milestone, color: 'blue' },
    { label: 'ROI середній', value: '185%', desc: 'Надійне масштабування', icon: TrendingUp, color: 'rose' },
    { label: 'Кампаній', value: '340+', desc: 'Активних зв\'язок у роботі', icon: Rocket, color: 'cyan' },
    { label: 'Баєрів у штаті', value: '18+', desc: 'Досвідчені медіабайєри', icon: Users, color: 'indigo' },
  ];

  const handleScrollDown = () => {
    const aboutSec = document.getElementById('about');
    if (aboutSec) {
      aboutSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center items-center pt-24 pb-16 overflow-hidden"
    >
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gray-950 pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      
      {/* Big radial backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-rose-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 self-center lg:self-start px-3 py-1.5 rounded-full bg-blue-950/40 border border-blue-500/20 mb-6"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              <span className="font-mono text-[10px] sm:text-xs text-blue-300 font-semibold tracking-wider uppercase">
                ТОП ТРАФІК-КОМАНДА УКРАЇНИ
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-sans font-extrabold tracking-tight text-white leading-none mb-6"
            >
              Масштабуємо ваш прибуток через{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-rose-400">
                Хмарні Технології
              </span>{' '}
              Трафіку
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-gray-400 font-sans max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Ми — <strong className="text-white">Traffic Cloud</strong>, професійна медіабаїнгова команда. 
              Генеруємо гігабайти цільового конвертованого трафіку для найкращих світових офферів. 
              Ми не просто купуємо кліки — ми створюємо стабільний потік ROI.
            </motion.p>

            {/* CTA action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={onContactClick}
                className="relative overflow-hidden shimmer-btn px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 text-white font-semibold text-sm tracking-wide shadow-[0_4px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_4px_35px_rgba(99,102,241,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Обговорити Трафік</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="/app/"
                className="px-8 py-4 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white text-sm font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Увійти в панель</span>
              </a>
              <button
                onClick={() => {
                  const srcSec = document.getElementById('sources');
                  if (srcSec) srcSec.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 rounded-xl bg-gray-900/60 hover:bg-gray-800 border border-gray-800/80 hover:border-gray-700 text-gray-400 hover:text-white text-sm font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Наші джерела</span>
              </button>
            </motion.div>
          </div>

          {/* Right Column with Interactive 3D Cloud */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full flex justify-center"
            >
              <CloudLogo3D />
            </motion.div>
          </div>

        </div>

        {/* Dynamic Metric Tickers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-16 sm:mt-24 pt-8 border-t border-gray-900">
          {metrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 + i * 0.1 }}
                className="p-5 sm:p-6 rounded-2xl bg-gray-950/40 border border-gray-900/60 hover:border-gray-800 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] sm:text-xs font-mono font-medium tracking-widest text-gray-500 uppercase">
                    {metric.label}
                  </span>
                  <div className={`p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 group-hover:text-white transition-colors`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className={`text-2xl sm:text-4xl font-sans font-black tracking-tight text-white`}>
                    {metric.value}
                  </span>
                  <p className="text-xs text-gray-500 font-sans mt-1">
                    {metric.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* Floating Animated Scroll Down Button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto hidden md:block">
        <motion.button
          onClick={handleScrollDown}
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="flex flex-col items-center gap-1.5 text-[10px] font-mono text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          <span>ДІЗНАТИСЬ БІЛЬШЕ</span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </div>

    </section>
  );
}
