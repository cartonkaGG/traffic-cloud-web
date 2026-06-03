import { motion } from 'motion/react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import CloudLogo3D from './CloudLogo3D';

interface HeroProps {
  onContactClick: () => void;
}

export default function Hero({ onContactClick }: HeroProps) {
  const handleScrollDown = () => {
    const aboutSec = document.getElementById('about');
    if (aboutSec) aboutSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center items-center pt-24 pb-16 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gray-950 pointer-events-none" />
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 self-center lg:self-start px-3 py-1.5 rounded-full bg-blue-950/40 border border-blue-500/20 mb-6"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
              <span className="font-mono text-[10px] sm:text-xs text-blue-300 font-semibold tracking-wider uppercase">
                Telegram outreach
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-sans font-extrabold tracking-tight text-white leading-none mb-6"
            >
              Traffic Cloud —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-rose-400">
                панель у браузері
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-gray-400 font-sans max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Керуйте акаунтами, джерелами аудиторії, шаблонами повідомлень і кампаніями розсилки.
              Без десктоп-додатка — лише сайт та хмарний API.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <a
                href="/app/"
                className="relative overflow-hidden shimmer-btn px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 text-white font-semibold text-sm tracking-wide shadow-[0_4px_30px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Увійти в панель</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <button
                onClick={onContactClick}
                className="px-8 py-4 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white text-sm font-semibold tracking-wide transition-all cursor-pointer"
              >
                Зв&apos;язатися
              </button>
            </motion.div>
          </div>

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
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto hidden md:block">
        <motion.button
          onClick={handleScrollDown}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1.5 text-[10px] font-mono text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          <span>ДІЗНАТИСЬ БІЛЬШЕ</span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </div>
    </section>
  );
}
