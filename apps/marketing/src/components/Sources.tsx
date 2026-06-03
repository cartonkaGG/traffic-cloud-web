import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrafficSource } from '../types';
import { Facebook, Chrome, Music, Flame, Send, CheckCircle2, TrendingUp, BarChart2 } from 'lucide-react';

const SOURCES_DATA: TrafficSource[] = [
  {
    id: 'facebook',
    name: 'Facebook Ads',
    icon: 'facebook',
    description: 'Наше основне джерело трафіку. Працюємо з авторитетними агентськими акаунтами, кастомними клоаками та власними серверами автозапуску.',
    volume: '2.5M+ хостів / місяць',
    ctr: '3.8% - 5.5%',
    roi: '160% - 210%',
    color: 'indigo',
    keyFeatures: [
      'Власна система автоматичного дублювання адсетів (Auto-Scaling)',
      'Нейромережі для автоматичного обходу систем розпізнавання облич',
      'Оренда найстабільніших платіжних рішень (BINs) з низьким declinerate',
      'Цілодобовий моніторинг штормів модерації'
    ],
    conversionTrend: [20, 35, 45, 30, 55, 75, 80, 70, 95]
  },
  {
    id: 'google',
    name: 'Google Ads & YouTube',
    icon: 'chrome',
    description: 'Максимально платоспроможний трафік. Охоплюємо контекстні оголошення (PPC), YouTube Pre-rolls та рекламні кампанії для мобільних додатків (UAC).',
    volume: '1.2M+ хостів / місяць',
    ctr: '6.2% - 11.0%',
    roi: '140% - 180%',
    color: 'emerald',
    keyFeatures: [
      'Високоякісний пошуковий трафік з гарячим наміром',
      'Запуск UAC кампаній за допомогою смарт-конверсій',
      'Професійний прогрів акаунтів з реальними пошуковими запитами',
      'Моментальна аналітика відмов через Google Analytics 4 API'
    ],
    conversionTrend: [40, 45, 42, 58, 65, 60, 72, 85, 90]
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    icon: 'music',
    description: 'Вірусний та швидкий трафік з акцентом на молоде покоління. Ідеально підходить для фінансових мобільних застосунків, ігрової вертикалі та e-commerce.',
    volume: '1.8M+ хостів / місяць',
    ctr: '2.5% - 4.2%',
    roi: '150% - 195%',
    color: 'rose',
    keyFeatures: [
      'Генерація Spark Ads за участю реальних блогерів (UGC)',
      'Швидке тестування до 20 креативів на одному адсеті за годину',
      'Спеціальний AI-модуль для адаптації звукового супроводу під тренди',
      'Низький CPM на Tier-2 та Tier-3 географіях'
    ],
    conversionTrend: [10, 20, 15, 30, 48, 40, 55, 80, 85]
  },
  {
    id: 'telegram',
    name: 'Telegram Ads & PPC',
    icon: 'send',
    description: 'Найбільш швидкозростаюче джерело у Східній Європі. Пряма таргетована реклама в каналах, кастомні бот-лінійки та робота з лідерами думок.',
    volume: '800K+ хостів / місяць',
    ctr: '8.0% - 14.5%',
    roi: '190% - 240%',
    color: 'cyan',
    keyFeatures: [
      'Висока лояльність аудиторії за рахунок Telegram-формату',
      'Створення складних інтерактивних ботів для утеплення лідів',
      'Прямий таргетинг за списком тематичних каналів конкурентів',
      'Космічні показники Retention Rate (повторні конверсії)'
    ],
    conversionTrend: [30, 40, 50, 45, 62, 70, 68, 85, 100]
  },
  {
    id: 'native',
    name: 'Native & Push Ads',
    icon: 'flame',
    description: 'Нативна банерна реклама на найбільших новинних сайтах та тизерних мережах. Стабільний обсяг на Tier-1 країни.',
    volume: '3.0M+ хостів / місяць',
    ctr: '0.8% - 1.5%',
    roi: '110% - 150%',
    color: 'amber',
    keyFeatures: [
      'Величезні обсяги дешевих показів у Taboola та Outbrain',
      'Розумні блеклісти майданчиків, що оновлюються автоматично',
      'Спліт-тестування прелендінгів з високим рівнем залучення',
      'Відсутність прямої модерації та банів'
    ],
    conversionTrend: [50, 55, 52, 58, 54, 59, 61, 65, 70]
  }
];

export default function Sources() {
  const [activeTab, setActiveTab] = useState<string>('facebook');
  const activeSource = SOURCES_DATA.find((s) => s.id === activeTab) || SOURCES_DATA[0];

  const getIcon = (iconName: string, colorClass: string) => {
    switch (iconName) {
      case 'facebook': return <Facebook className={`w-5 h-5 ${colorClass}`} />;
      case 'chrome': return <Chrome className={`w-5 h-5 ${colorClass}`} />;
      case 'music': return <Music className={`w-5 h-5 ${colorClass}`} />;
      case 'send': return <Send className={`w-5 h-5 ${colorClass}`} />;
      default: return <Flame className={`w-5 h-5 ${colorClass}`} />;
    }
  };

  const getColorTheme = (color: string) => {
    switch (color) {
      case 'indigo': return { text: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/10', glow: 'glow-purple', solidBg: 'bg-indigo-600' };
      case 'emerald': return { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', glow: 'glow-blue', solidBg: 'bg-emerald-600' };
      case 'rose': return { text: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/10', glow: 'glow-rose', solidBg: 'bg-rose-600' };
      case 'cyan': return { text: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/10', glow: 'glow-cyan', solidBg: 'bg-cyan-600' };
      default: return { text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10', glow: 'glow-rose', solidBg: 'bg-amber-600' };
    }
  };

  const theme = getColorTheme(activeSource.color);

  return (
    <section id="sources" className="relative py-24 bg-gray-950/60 overflow-hidden">
      {/* Background design elements */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-900/5 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-500/20 mb-4"
          >
            <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-[10px] text-blue-300 font-semibold tracking-wider uppercase">
              ДЖЕРЕЛА ТРАФІКУ
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-sans font-extrabold text-white tracking-tight mb-6"
          >
            Звідки ми наливаємо обсяги?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-400 font-sans"
          >
            Кожен байєр у нашій команді спеціалізується на конкретному джерелі, 
            що гарантує максимально глибоку експертизу в алгоритмах та оптимізації платформ.
          </motion.p>
        </div>

        {/* Outer Dashboard layout wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation vertical list (Source Selector) */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-none">
            {SOURCES_DATA.map((source) => {
              const active = source.id === activeTab;
              const sTheme = getColorTheme(source.color);
              return (
                <button
                  key={source.id}
                  onClick={() => setActiveTab(source.id)}
                  className={`flex-shrink-0 flex items-center gap-3.5 px-5 py-4 rounded-xl text-left border transition-all cursor-pointer ${
                    active
                      ? 'bg-gray-900 border-gray-800 text-white shadow-lg shadow-black/40'
                      : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-gray-900/30'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg border transition-all ${
                    active ? 'bg-gray-950 ' + sTheme.border : 'bg-gray-900/50 border-gray-800/40'
                  }`}>
                    {getIcon(source.icon, active ? sTheme.text : 'text-gray-500')}
                  </div>
                  <div className="flex flex-col pr-4">
                    <span className="font-sans font-bold text-sm tracking-wide">{source.name}</span>
                    <span className="font-mono text-[9px] text-gray-500">{source.volume}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Source Details Panel Card */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSource.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-3xl p-6 sm:p-8 relative overflow-hidden"
              >
                {/* Floating ambient glow corresponding to specific brand color */}
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full bg-radial-[circle_at_center,rgba(59,130,246,0.04)_10%,transparent_70%] pointer-events-none ${theme.glow}`} />

                {/* Card Title & General details */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-900 pb-6 mb-6">
                  <div>
                    <span className={`font-mono text-xs font-semibold ${theme.text} tracking-wider uppercase`}>
                      TC.ACTIVE_SOURCE // {activeSource.id}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-sans font-extrabold text-white mt-1">
                      {activeSource.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>СТАБІЛЬНИЙ СКАЛІНГ</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-gray-300 mb-8 leading-relaxed font-sans">
                  {activeSource.description}
                </p>

                {/* Source KPI stats highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-gray-950/60 border border-gray-900 flex flex-col justify-between">
                    <span className="font-mono text-[10px] text-gray-500 uppercase">ОБСЯГ (МЕСЯЦ)</span>
                    <span className="text-lg font-sans font-extrabold text-white mt-1">{activeSource.volume}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-950/60 border border-gray-900 flex flex-col justify-between">
                    <span className="font-mono text-[10px] text-gray-500 uppercase">СЕРЕДНІЙ CTR</span>
                    <span className="text-lg font-sans font-extrabold text-white mt-1">{activeSource.ctr}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-950/60 border border-gray-900 flex flex-col justify-between">
                    <span className="font-mono text-[10px] text-gray-500 uppercase">СЕРЕДНІЙ ROI</span>
                    <span className={`text-lg font-sans font-extrabold ${theme.text} mt-1`}>{activeSource.roi}</span>
                  </div>
                </div>

                {/* Key operational features bullet points */}
                <div className="mb-8">
                  <h4 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-4">
                    Медіабаїнг інструментарій:
                  </h4>
                  <ul className="space-y-3 font-sans">
                    {activeSource.keyFeatures.map((feat, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme.text}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* SVG Mini Interactive Chart Sparkline */}
                <div className="mt-6 pt-6 border-t border-gray-900">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                      ГРАФІК КОНВЕРСІЙНОЇ СТАТИСТИКИ (ТИЖДЕНЬ)
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">+18.4%</span>
                  </div>
                  <div className="h-24 w-full flex items-end">
                    <svg
                      viewBox="0 0 400 100"
                      className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id={`grad-${activeSource.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={activeSource.color === 'indigo' ? '#818cf8' : activeSource.color === 'emerald' ? '#34d399' : activeSource.color === 'rose' ? '#fb7185' : '#22d3ee'} stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#030712" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Drawing the path */}
                      <motion.path
                        d={`M ${activeSource.conversionTrend.map((val, idx) => `${(idx / (activeSource.conversionTrend.length - 1)) * 400} ${100 - val}`).join(' L ')}`}
                        fill="none"
                        stroke={activeSource.color === 'indigo' ? '#6366f1' : activeSource.color === 'emerald' ? '#10b981' : activeSource.color === 'rose' ? '#f43f5e' : '#06b6d4'}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />

                      {/* Area Fill */}
                      <motion.path
                        d={`M 0 100 L ${activeSource.conversionTrend.map((val, idx) => `${(idx / (activeSource.conversionTrend.length - 1)) * 400} ${100 - val}`).join(' L ')} L 400 100 Z`}
                        fill={`url(#grad-${activeSource.id})`}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                      />

                      {/* Hover / Tracking circles at each node */}
                      {activeSource.conversionTrend.map((val, idx) => {
                        const cx = (idx / (activeSource.conversionTrend.length - 1)) * 400;
                        const cy = 100 - val;
                        return (
                          <motion.circle
                            key={idx}
                            cx={cx}
                            cy={cy}
                            r="4"
                            className="fill-gray-950 stroke-indigo-400"
                            strokeWidth="2.5"
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1 + idx * 0.05 }}
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
}
