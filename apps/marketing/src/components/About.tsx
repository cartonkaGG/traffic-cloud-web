import { motion } from 'motion/react';
import { Users, MessageSquare, Filter, BarChart3 } from 'lucide-react';

export default function About() {
  const pillars = [
    {
      icon: Users,
      title: 'Акаунти Telegram',
      desc: 'Підключення через MTProto, проксі SOCKS5, статуси та health.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MessageSquare,
      title: 'Кампанії та шаблони',
      desc: 'Розсилка DM, пауза, ліміти, змінні в текстах повідомлень.',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Filter,
      title: 'Парсинг джерел',
      desc: 'Збір аудиторії з чатів і каналів, фільтри та blacklist.',
      color: 'from-rose-500 to-orange-500',
    },
    {
      icon: BarChart3,
      title: 'Логи та аналітика',
      desc: 'Події в реальному часі через WebSocket, історія запусків.',
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <section id="about" className="relative py-24 bg-gray-950 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-sans font-extrabold text-white tracking-tight mb-6"
          >
            Що вміє панель
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-gray-400 font-sans"
          >
            Усе керування — у веб-інтерфейсі. Telegram-підключення та розсилка виконуються на сервері.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-gray-950/60 border border-gray-900 hover:border-gray-800 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-sans font-bold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500 font-sans leading-relaxed">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
