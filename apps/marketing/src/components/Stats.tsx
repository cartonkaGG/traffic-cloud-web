import { useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Award, Gauge, Play, BarChart, ServerCrash, RefreshCw } from 'lucide-react';

interface MetricDetail {
  label: string;
  fb: number;
  google: number;
  tiktok: number;
  telegram: number;
  suffix: string;
}

const STATS_MAP: Record<string, MetricDetail> = {
  clicks: {
    label: 'Обсяг Кліків (За вчора)',
    fb: 1820000,
    google: 920000,
    tiktok: 1450000,
    telegram: 640000,
    suffix: 'кліків'
  },
  conversions: {
    label: 'Конверсії / Ліди (За вчора)',
    fb: 145600,
    google: 87400,
    tiktok: 94500,
    telegram: 68100,
    suffix: 'лідів'
  },
  revenue: {
    label: 'Генерація доходу (За вчора)',
    fb: 43200,
    google: 34800,
    tiktok: 28500,
    telegram: 22400,
    suffix: 'USD'
  }
};

export default function Stats() {
  const [activeMetric, setActiveMetric] = useState<'clicks' | 'conversions' | 'revenue'>('clicks');
  const [selectedBar, setSelectedBar] = useState<string | null>(null);

  const data = STATS_MAP[activeMetric];
  
  // Find maximum to scale bars proportionally
  const maxVal = Math.max(data.fb, data.google, data.tiktok, data.telegram);

  const formatNumber = (num: number) => {
    return num.toLocaleString('uk-UA');
  };

  const barSegments = [
    { key: 'fb', name: 'Facebook Ads', value: data.fb, color: 'from-blue-600 to-indigo-600', glow: 'glow-blue' },
    { key: 'google', name: 'Google Search', value: data.google, color: 'from-emerald-500 to-cyan-500', glow: 'glow-blue' },
    { key: 'tiktok', name: 'TikTok UGC', value: data.tiktok, color: 'from-rose-500 to-pink-500', glow: 'glow-rose' },
    { key: 'telegram', name: 'Telegram Ads', value: data.telegram, color: 'from-cyan-400 to-blue-500', glow: 'glow-cyan' },
  ];

  return (
    <section id="stats" className="relative py-24 bg-gray-950 overflow-hidden">
      {/* Visual separators */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
      
      {/* Large cosmic orb in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/5 to-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/20 mb-4"
          >
            <Gauge className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="font-mono text-[10px] text-rose-300 font-semibold tracking-wider uppercase">
              ЖИВА АНАЛІТИКА
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-sans font-extrabold text-white tracking-tight mb-6"
          >
            Показники нашої продуктивності
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-400 font-sans"
          >
            Ми відкриті до довгострокових партнерств та пишаємося стабільністю наших цифр. 
            Виберіть метрику, щоб побачити обсяги трафіку в реальному часі.
          </motion.p>
        </div>

        {/* Dashboard Frame */}
        <div className="glass rounded-3xl p-6 sm:p-10 border border-gray-800/80">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-gray-900 pb-8 mb-8">
            {/* Metric Switchers */}
            <div className="flex flex-wrap gap-2.5 bg-gray-950/80 p-1.5 rounded-xl border border-gray-900/60 w-full sm:w-auto justify-center">
              <button
                onClick={() => { setActiveMetric('clicks'); setSelectedBar(null); }}
                className={`px-4.5 py-2 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  activeMetric === 'clicks'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                КЛІКИ
              </button>
              <button
                onClick={() => { setActiveMetric('conversions'); setSelectedBar(null); }}
                className={`px-4.5 py-2 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  activeMetric === 'conversions'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                КОНВЕРСІЇ
              </button>
              <button
                onClick={() => { setActiveMetric('revenue'); setSelectedBar(null); }}
                className={`px-4.5 py-2 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  activeMetric === 'revenue'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ПРИБУТОК (USD)
              </button>
            </div>

            {/* Live Telemetry Node */}
            <div className="flex items-center gap-3 font-mono text-xs text-gray-400 bg-gray-950/40 border border-gray-900 px-4 py-2 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span>ОНОВЛЕНО: 1 ХВ. ТОМУ</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left side: Interactive Bar Chart */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <h4 className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-2">
                {data.label}
              </h4>

              <div className="space-y-6">
                {barSegments.map((seg) => {
                  const percentage = (seg.value / maxVal) * 100;
                  const isSelected = selectedBar === seg.key;

                  return (
                    <div
                      key={seg.key}
                      onClick={() => setSelectedBar(isSelected ? null : seg.key)}
                      className="cursor-pointer group flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-end">
                        <span className="font-sans font-semibold text-sm sm:text-base text-gray-200 group-hover:text-white transition-colors">
                          {seg.name}
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-gray-300">
                          {formatNumber(seg.value)} {data.suffix}
                        </span>
                      </div>

                      {/* Bar fill rail */}
                      <div className="h-4 w-full bg-gray-900 border border-gray-800 rounded-full overflow-hidden p-[2px] transition-all group-hover:border-gray-700">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          className={`h-full bg-gradient-to-r ${seg.color} rounded-full relative overflow-hidden`}
                        >
                          {/* Inner shimmer animation */}
                          <div className="absolute inset-0 shimmer-btn opacity-30" />
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Detailed telemetry breakdown box */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-2xl bg-gray-950 border border-gray-900 relative overflow-hidden flex flex-col justify-between h-full min-h-[300px]">
                {/* Backdrop design block */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-900/40 rounded-bl-full border-l border-b border-gray-800/40 pointer-events-none" />

                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart className="w-5 h-5 text-indigo-400" />
                    <span className="font-mono text-xs font-bold text-indigo-300 tracking-wider">
                      АНАЛІТИЧНИЙ ВИСНОВОК
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 font-sans leading-relaxed mb-6">
                    {selectedBar === null ? (
                      'Клацніть на будь-яку смугу джерела ліворуч, щоб вивантажити більш глибокий аналітичний репорт та параметри пропускної здатності нашої медіамережі.'
                    ) : selectedBar === 'fb' ? (
                      'Facebook Ads демонструє стабільний ріст за рахунок інноваційних методів обходу обмежень модерації. Масштабування відбувається через кастомні ланцюжки прогріву БМ.'
                    ) : selectedBar === 'google' ? (
                      'Пошуковий трафік Google тримає першість за якістю лідів (FTD - перші депозити). Реклама UAC залучає максимальні обсяги лояльних користувачів для нативних програм.'
                    ) : selectedBar === 'tiktok' ? (
                      'Аудиторія TikTok залучає вірусні переходи через короткі креативи. Ми оптимізували середню вартість інсталяції (CPI) на 35% за останні три тижні.'
                    ) : (
                      'Telegram бот-коридори показують рекордний LTV (життєвий цикл ліда) за рахунок щоденного контент-маркетингу та затишних внутрішніх пуш-сповіщень.'
                    )}
                  </p>
                </div>

                {/* Micro tech metrics stats box */}
                <div className="border-t border-gray-900 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] text-gray-500 uppercase">СЕРДНІЙ ROI СИСТЕМИ</span>
                      <span className="text-xl font-sans font-extrabold text-green-400">+192.4%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] text-gray-500 uppercase">БЕЗВІДМОВНІСТЬ СЛУЖБИ</span>
                      <span className="text-xl font-sans font-extrabold text-blue-400">99.98%</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
