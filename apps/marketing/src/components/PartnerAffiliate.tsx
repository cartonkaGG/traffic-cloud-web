import { motion } from 'motion/react';
import { BarChart3, Link2, TrendingUp, Wallet } from 'lucide-react';
import { ScrollReveal, ScrollRevealStagger, staggerItem } from './ScrollReveal';

const PANEL_OFFERS = '/app/affiliate';
const PANEL_STATS = '/app/affiliate';

export default function PartnerAffiliate() {
  const steps = [
    {
      icon: Link2,
      title: 'Обирай офер',
      desc: 'Категорії Telegram-каналів: крипта, ніша, гео. Бачиш виплату за кожного підписника.',
      color: 'from-emerald-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'Отримуй посилання',
      desc: 'Унікальне invite-посилання в один клік. Трекінг підписників через бота в каналі.',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: Wallet,
      title: 'Заробляй і виводь',
      desc: 'Баланс, діаграми по днях, історія виведень. Без підписки та десктоп-софту.',
      color: 'from-violet-500 to-fuchsia-500'
    }
  ];

  return (
    <>
      <section id="offers" className="relative py-16 sm:py-24 bg-gray-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <ScrollReveal variant="up">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200 mb-4">
                Офери
              </div>
              <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-white tracking-tight mb-4">
                Заливай трафік у Telegram-канали
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="up" delay={0.1}>
              <p className="text-base sm:text-lg text-gray-400">
                У панелі — активні офери з виплатою за підписника. Обираєш нішу, копіюєш своє
                посилання і ведеш аудиторію в канал.
              </p>
            </ScrollReveal>
          </div>

          <ScrollRevealStagger className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  variants={staggerItem}
                  className="rounded-2xl border border-gray-800/80 bg-gray-900/40 p-6 backdrop-blur-sm"
                >
                  <div
                    className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${s.color} p-3 text-white shadow-lg`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{s.desc}</p>
                </motion.div>
              );
            })}
          </ScrollRevealStagger>

          <ScrollReveal variant="up" delay={0.15} className="mt-10 text-center">
            <a
              href={PANEL_OFFERS}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-3 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(52,211,153,0.25)] transition-transform hover:scale-[1.02]"
            >
              Перейти до оферів
            </a>
          </ScrollReveal>
        </div>
      </section>

      <section id="stats" className="relative py-16 sm:py-24 bg-[#060a12] border-y border-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <ScrollReveal variant="up">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200 mb-4">
                  Статистика
                </div>
                <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-white tracking-tight mb-4">
                  Бачиш результат у реальному часі
                </h2>
                <p className="text-base text-gray-400 leading-relaxed">
                  Баланс, підписники за сьогодні, заробіток і діаграми за 14 днів. Вся аналітика —
                  в особистому кабінеті після входу.
                </p>
              </ScrollReveal>
              <ScrollReveal variant="up" delay={0.1} className="mt-8">
                <a
                  href={PANEL_STATS}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20"
                >
                  <BarChart3 className="h-4 w-4" />
                  Відкрити статистику
                </a>
              </ScrollReveal>
            </div>

            <ScrollReveal variant="right" delay={0.08}>
              <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-5 shadow-2xl">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Баланс', '$124.50'],
                    ['Сьогодні', '12 підп.'],
                    ['Заробіток', '$18.00'],
                    ['Всього', '340 підп.']
                  ].map(([label, val]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
                    >
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
                      <div className="mt-1 text-lg font-semibold text-white">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex h-24 items-end justify-between gap-1.5">
                  {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-emerald-500/30 to-emerald-400/80"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="mt-3 text-center text-[11px] text-gray-600">Приклад дашборду партнера</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
