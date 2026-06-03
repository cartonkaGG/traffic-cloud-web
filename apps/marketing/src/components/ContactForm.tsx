import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle, RefreshCw, SendHorizontal } from 'lucide-react';

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
    <section id="contact" className="relative py-24 bg-gray-950 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-sans font-extrabold text-white tracking-tight mb-4"
          >
            Зв&apos;язок
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 font-sans"
          >
            Питання щодо панелі — напишіть у форму або в Telegram.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-6 sm:p-8 border border-gray-800/80 relative"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="user-name" className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                Ім&apos;я
              </label>
              <input
                id="user-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 bg-gray-950/60 border border-gray-900 rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 font-sans"
              />
            </div>

            <div className="flex flex-col gap-1.5">
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
                className="px-4 py-3 bg-gray-950/60 border border-gray-900 rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 font-sans"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="lead-message" className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                Повідомлення
              </label>
              <textarea
                id="lead-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="px-4 py-3 bg-gray-950/60 border border-gray-900 rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 font-sans resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
          </form>

          <div className="mt-6 text-center">
            <a
              href="https://t.me/trafficcloud_team"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyan-400 hover:text-cyan-300 font-sans"
            >
              @trafficcloud_team
            </a>
          </div>

          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-4 rounded-2xl glass flex flex-col items-center justify-center text-center p-6 z-20"
              >
                <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Надіслано</h4>
                <p className="text-sm text-gray-400">Ми відповімо в Telegram.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
