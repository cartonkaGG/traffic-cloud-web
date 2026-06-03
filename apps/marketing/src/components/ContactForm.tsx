import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserLead } from '../types';
import { Send, CheckCircle, RefreshCw, SendHorizontal, Trash2, Smartphone, ShieldCheck } from 'lucide-react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [offerType, setOfferType] = useState('igaming');
  const [budget, setBudget] = useState('5k-20k');
  const [message, setMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Real-time local state to display submitted leads
  const [leads, setLeads] = useState<UserLead[]>([]);

  // Load existing leads from localStorage
  useEffect(() => {
    const savedLeads = localStorage.getItem('traffic_cloud_leads');
    if (savedLeads) {
      try {
        setLeads(JSON.parse(savedLeads));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Add a couple of initial mock "active leads" for visual completeness
      const initialLeads: UserLead[] = [
        {
          id: 'lead-1',
          name: 'CEO PinUp Partners',
          telegram: '@pinup_ceo',
          offerType: 'igaming',
          budget: '50k+',
          message: 'Шукаємо надійну команду на залив Tier-1 гео на ексклюзивних умовах. ROI тримайте високим.',
          createdAt: new Date(Date.now() - 3600000 * 4).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'lead-2',
          name: 'Артур (Lead Advert)',
          telegram: '@artur_leads',
          offerType: 'crypto',
          budget: '20k-50k',
          message: 'Потрібні обсяги на крипту по Італії та Іспанії. Готові платити за CPL.',
          createdAt: new Date(Date.now() - 3600000 * 24).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setLeads(initialLeads);
      localStorage.setItem('traffic_cloud_leads', JSON.stringify(initialLeads));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !telegram) return;

    setIsLoading(true);

    // Simulate sending network request (1.5 seconds)
    setTimeout(() => {
      const newLead: UserLead = {
        id: `lead-${Date.now()}`,
        name,
        telegram: telegram.startsWith('@') ? telegram : `@${telegram}`,
        offerType,
        budget,
        message,
        createdAt: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
      };

      const updatedLeads = [newLead, ...leads];
      setLeads(updatedLeads);
      localStorage.setItem('traffic_cloud_leads', JSON.stringify(updatedLeads));

      setIsLoading(false);
      setIsSuccess(true);

      // Reset form fields
      setName('');
      setTelegram('');
      setMessage('');
      
      // Auto-dismiss success notification
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }, 1500);
  };

  const clearLeads = () => {
    setLeads([]);
    localStorage.removeItem('traffic_cloud_leads');
  };

  const getVerticalLabel = (val: string) => {
    switch(val) {
      case 'igaming': return 'iGaming / Казино';
      case 'crypto': return 'Crypto / Інвестиції';
      case 'nutra': return 'Nutra / Здоров\'я';
      case 'finance': return 'Finance / Кредити';
      default: return 'Інша вертикаль';
    }
  };

  return (
    <section id="contact" className="relative py-24 bg-gray-950 overflow-hidden">
      {/* Background Separators */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
      
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-900/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-blue-900/5 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-500/20 mb-4"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-[10px] text-blue-300 font-semibold tracking-wider uppercase">
              ОБГОВОРИТИ СПІВПРАЦЮ
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-sans font-extrabold text-white tracking-tight mb-6"
          >
            Готові наливати трафік?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-400 font-sans"
          >
            Маєте крутий продукт чи ексклюзивний оффер? Заповніть форму, і наш Head of Media 
            зв'яжеться з вами протягом години в Telegram для обговорення тестового заливу.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Glassmorphic Feedback Form */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-3xl p-6 sm:p-8 border border-gray-800/80 h-full relative"
            >
              <h3 className="text-xl sm:text-2xl font-sans font-bold text-white mb-6 flex items-center gap-2">
                <span>Заявка на партнерство</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="user-name" className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                      Ваше ім'я / Компанія
                    </label>
                    <input
                      id="user-name"
                      type="text"
                      required
                      placeholder="Наприклад, Олександр"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="px-4 py-3 bg-gray-950/60 border border-gray-900 rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 focus:bg-gray-950 transition-all font-sans placeholder-gray-600"
                    />
                  </div>

                  {/* Telegram Handle */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="user-telegram" className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                      Telegram Username
                    </label>
                    <input
                      id="user-telegram"
                      type="text"
                      required
                      placeholder="Наприклад: @yourusername"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      className="px-4 py-3 bg-gray-950/60 border border-gray-900 rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 focus:bg-gray-950 transition-all font-sans placeholder-gray-600"
                    />
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Vertical / Offer Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="offer-type" className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                      Основний напрямок
                    </label>
                    <select
                      id="offer-type"
                      value={offerType}
                      onChange={(e) => setOfferType(e.target.value)}
                      className="px-4 py-3 bg-gray-950/60 border border-gray-900 rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 transition-all font-sans"
                    >
                      <option value="igaming">iGaming / Казино</option>
                      <option value="crypto">Crypto / Інвестиції</option>
                      <option value="nutra">Nutra / Здоров'я</option>
                      <option value="finance">Finance / Мікрокредити</option>
                      <option value="other">Інший напрямок</option>
                    </select>
                  </div>

                  {/* Monthly Budget */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="budget-range" className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                      Очікуваний бюджет (місяць)
                    </label>
                    <select
                      id="budget-range"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="px-4 py-3 bg-gray-950/60 border border-gray-900 rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 transition-all font-sans"
                    >
                      <option value="under-5k">До $5,000</option>
                      <option value="5k-20k">$5,000 — $20,000</option>
                      <option value="20k-50k">$20,000 — $50,000</option>
                      <option value="50k+">Більше $50,000</option>
                    </select>
                  </div>

                </div>

                {/* Vertical Offer Message */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lead-message" className="font-mono text-[11px] text-gray-400 uppercase tracking-wider">
                    Опис пропозиції / Повідомлення
                  </label>
                  <textarea
                    id="lead-message"
                    rows={4}
                    placeholder="Напишіть деталі про ваш продукт, гео та ставки..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="px-4 py-3 bg-gray-950/60 border border-gray-900 rounded-xl text-white text-sm outline-none focus:border-indigo-500/50 focus:bg-gray-950 transition-all font-sans placeholder-gray-600 resize-none"
                  />
                </div>

                {/* Submitting Trigger actions */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative overflow-hidden shimmer-btn w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm tracking-wider shadow-[0_4px_20px_rgba(59,130,246,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 uppercase disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Надсилання даних...</span>
                      </>
                    ) : (
                      <>
                        <SendHorizontal className="w-4 h-4" />
                        <span>Надіслати запит</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Direct Telegram Link Button */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gray-950/40 border border-gray-900">
                <span className="text-xs text-gray-400 font-sans">Або напишіть нам напряму:</span>
                <a
                  href="https://t.me/trafficcloud_team"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-sans font-bold text-xs text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                  <span>@TRAFFICCLOUD_TEAM</span>
                </a>
              </div>

              {/* Success Overlay Panel */}
              <AnimatePresence>
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-4 rounded-2xl glass flex flex-col items-center justify-center text-center p-6 z-20"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="p-4 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-4"
                    >
                      <CheckCircle className="w-12 h-12" />
                    </motion.div>
                    <h4 className="text-xl font-sans font-extrabold text-white mb-2">Дані успішно надіслано!</h4>
                    <p className="text-sm text-gray-400 font-sans max-w-sm mb-6">
                      Вашу заявку оброблено. Наш медіабайер вже перевіряє параметри у реальному часі та напише вам у Telegram.
                    </p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="px-5 py-2.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white font-mono text-xs cursor-pointer"
                    >
                      ПОВЕРНУТИСЬ ДО ФОРМИ
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Column: Dynamic Traffic Hub Lead Console (Visual Simulator) */}
          <div className="lg:col-span-5 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-6 sm:p-8 border border-gray-800/80 flex-1 flex flex-col h-full min-h-[380px]"
            >
              <div className="flex items-center justify-between border-b border-gray-900 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-mono text-xs font-bold text-gray-300">LIVE HUB FEED (CONSOLE)</span>
                </div>
                {leads.length > 0 && (
                  <button
                    onClick={clearLeads}
                    className="text-gray-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-gray-900/50 transition-colors cursor-pointer"
                    title="Очистити список логів"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Console log description */}
              <p className="text-[11px] font-mono text-gray-500 leading-normal mb-4">
                Запити на інтеграцію в реальному часі. Тут виводяться всі заявки партнерів, надіслані через форму ліворуч.
              </p>

              {/* Feed List wrapping */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[320px] scrollbar-none">
                <AnimatePresence initial={false}>
                  {leads.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-600"
                    >
                      <span className="font-mono text-xs">ЛОГИ ОТРИМАННЯ ПУСТІ</span>
                    </motion.div>
                  ) : (
                    leads.map((lead) => (
                      <motion.div
                        key={lead.id}
                        initial={{ opacity: 0, x: -15, y: -5 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="p-4 rounded-2xl bg-gray-950/70 border border-gray-900/80 text-left relative overflow-hidden"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-sans font-extrabold text-sm text-indigo-400">
                            {lead.name}
                          </span>
                          <span className="font-mono text-[9px] text-gray-500">
                            {lead.createdAt}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-sans font-semibold text-xs text-white bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                            {getVerticalLabel(lead.offerType)}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-500/10">
                            Бюджет: {lead.budget}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 font-sans leading-relaxed mb-3">
                          {lead.message || 'Опис відсутній. Тільки контактні дані.'}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-900/60 font-mono text-[10px]">
                          <span className="text-gray-500">TG HANDLE:</span>
                          <span className="text-cyan-400 font-bold">{lead.telegram}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Secure guarantee check */}
              <div className="mt-4 pt-4 border-t border-gray-900 flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Захищене з'єднання з вузлом Traffic Cloud</span>
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
}
