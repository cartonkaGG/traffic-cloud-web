import { motion } from 'motion/react';
import { Target, Zap, Shield, Sparkles, RefreshCw, Layers } from 'lucide-react';

export default function About() {
  const pillars = [
    {
      icon: Target,
      title: 'Універсальний Таргетинг',
      desc: 'Точне націлювання на конвертувальну аудиторію. Працюємо на будь-якому географічному ринку (Global GEOs).',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Ультра-мобільний Креатив',
      desc: 'Власний відділ дизайнерів та відеомонтажерів, який генерує понад 100 унікальних креативів щотижня.',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Shield,
      title: 'Власні Системи Клоакінгу',
      desc: 'Стабільний обхід найсуворіших модераційних ліній, що забезпечує довговічність та стабільність кампаній.',
      color: 'from-rose-500 to-orange-500',
    },
    {
      icon: RefreshCw,
      title: 'Авто-Оптимізація та ШІ',
      desc: 'Інтегровані скрипти та нейромережі, які автоматично коригують ставки за клік кожні 15 хвилин.',
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <section id="about" className="relative py-24 bg-gray-950 overflow-hidden">
      {/* Background decoration lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/20 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-[10px] text-indigo-300 font-semibold tracking-wider uppercase">
              ПРО НАШУ СИСТЕМУ
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-sans font-extrabold text-white tracking-tight mb-6"
          >
            Ми купуємо трафік. Масштабно.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-400 font-sans"
          >
            Traffic Cloud — це злагоджена інфраструктура з медіабайєрів, розробників 
            веб-додатків та фармерів акаунтів. Ми поєднуємо досвід та передові ШІ-технології 
            для отримання максимального ROI на будь-яких обсягах.
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="p-6 sm:p-8 rounded-3xl bg-gray-900/40 border border-gray-900/80 hover:border-gray-800 hover:bg-gray-900/60 transition-all duration-300 group relative overflow-hidden"
              >
                {/* Decorative background visual node */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${pillar.color} opacity-[0.02] rounded-bl-full pointer-events-none group-hover:opacity-[0.05] transition-opacity`} />
                
                <div className="flex gap-5 items-start">
                  
                  {/* Icon Box */}
                  <div className={`p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 text-white relative flex-shrink-0 group-hover:scale-105 group-hover:border-gray-700/80 transition-all`}>
                    <Icon className="w-6 h-6 text-indigo-400 group-hover:text-blue-400 transition-colors" />
                    {/* Shadow pulse */}
                    <div className="absolute inset-0 bg-indigo-500/10 blur-md rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-sans font-semibold text-white mb-2 tracking-wide flex items-center gap-2">
                      <span>{pillar.title}</span>
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-sans">
                      {pillar.desc}
                    </p>
                  </div>

                </div>

                {/* Cyber index label */}
                <div className="absolute bottom-4 right-6 font-mono text-[9px] text-gray-700 select-none">
                  TC // TASK_ID_0{i + 1}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Trust Banner with beautiful icons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-16 p-6 sm:p-8 rounded-3xl bg-radial-[circle_at_center,rgba(59,130,246,0.06)_10%,transparent_90%] border border-blue-500/15 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-full bg-blue-950/50 border border-blue-500/20 text-blue-400 animate-pulse">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-sans font-bold text-white">Всі вертикалі під ключем</h4>
              <p className="text-xs sm:text-sm text-gray-400">Ми успішно працюємо в iGaming, Finance, Nutra, Crypto та LeadGen напрямках.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-mono text-xs text-gray-300">
            <span className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 tracking-wider">#IGAMING</span>
            <span className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 tracking-wider">#FINANCE</span>
            <span className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 tracking-wider">#CRYPTO</span>
            <span className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 tracking-wider">#NUTRA</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
