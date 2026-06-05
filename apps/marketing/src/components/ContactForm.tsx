import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle, RefreshCw, SendHorizontal } from 'lucide-react';
import { ScrollReveal, ScrollRevealStagger, staggerItem } from './ScrollReveal';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !telegram) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setName('');
      setTelegram('');
      setMessage('');
      setTimeout(() => setIsSuccess(false), 5000);
    }, 800);
  };

  return (
    <section id="contact" className="relative py-16 sm:py-24 bg-gray-950 overflow-hidden">
      <ScrollReveal variant="scale" amount={0.4} className="absolute top-0 inset-x-0 flex justify-center pointer-events-none">
        <div className="h-px w-full max-w-3xl bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      </ScrollReveal>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <ScrollReveal variant="up">
            <h2 className="text-3xl sm:text-4xl font-sans font-extrabold text-white tracking-tight mb-4">
              Зв&apos;язок
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={0.1}>
            <p className="text-gray-400 font-sans">
              Питання щодо панелі — напишіть у форму або в Telegram.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal variant="scale" delay={0.08}>
          <div className="contact-form-panel rounded-3xl p-5 sm:p-8 border border-gray-800/80 relative">
            <form onSubmit={handleSubmit} className="space-y-5">
            <ScrollRevealStagger className="space-y-5">
              <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
                <label htmlFor="user-name" className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                  Ім&apos;я
                </label>
                <input
                  id="user-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[48px] px-4 py-3 bg-gray-950/60 border border-gray-900 rounded-xl text-white text-base outline-none focus:border-cyan-500/50 font-sans transition-colors"
                />
              </motion.div>

              <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
                <label htmlFor="user-telegram" className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                  Telegram
                </label>
                <input
                  id="user-telegram"
                  type="text"
                  required
                  placeholder="@username"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="w-full min-h-[48px] px-4 py-3 bg-gray-950/60 border border-gray-900 rounded-xl text-white text-base outline-none focus:border-cyan-500/50 font-sans transition-colors"
                />
              </motion.div>

              <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
                <label htmlFor="lead-message" className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                  Повідомлення
                </label>
                <textarea
                  id="lead-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full min-h-[120px] px-4 py-3 bg-gray-950/60 border border-gray-900 rounded-xl text-white text-base outline-none focus:border-cyan-500/50 font-sans resize-none transition-colors"
                />
              </motion.div>

              <motion.div variants={staggerItem}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[48px] py-4 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99] transition-transform shadow-[0_4px_28px_rgba(34,211,238,0.25)] touch-manipulation"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Надсилання...
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="w-4 h-4" />
                      Надіслати
                    </>
                  )}
                </button>
              </motion.div>
            </ScrollRevealStagger>
            </form>

            <ScrollReveal variant="fade" delay={0.3} className="mt-6 text-center">
              <a
                href="https://t.me/trafficcloud_team"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-400 hover:text-cyan-300 font-sans"
              >
                @trafficcloud_team
              </a>
            </ScrollReveal>

            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-4 rounded-2xl contact-form-panel flex flex-col items-center justify-center text-center p-6 z-20"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                  </motion.div>
                  <h4 className="text-xl font-bold text-white mb-2">Надіслано</h4>
                  <p className="text-sm text-gray-400">Ми відповімо в Telegram.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
