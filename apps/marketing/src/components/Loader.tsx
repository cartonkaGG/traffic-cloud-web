import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cloud, Cpu, Activity, ShieldAlert, CheckCircle } from 'lucide-react';

const MESSAGES = [
  { text: 'Ініціалізація хмарного хабу...', delay: 0 },
  { text: 'Оптимізація серверних проксі-каналів...', delay: 10 },
  { text: 'Парсинг та сегментація аудиторії...', delay: 25 },
  { text: 'Завантаження AI креативів у роботу...', delay: 45 },
  { text: 'Синхронізація клоакінг-систем...', delay: 65 },
  { text: 'Перевірка пропускної здатності трафіку...', delay: 80 },
  { text: 'Зв\'язок налагоджено. Запуск інтерфейсу...', delay: 95 },
];

interface LoaderProps {
  onComplete: () => void;
  key?: string;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(MESSAGES[0].text);

  useEffect(() => {
    // Progress counter animation logic
    const duration = 2400; // 2.4 seconds
    const intervalTime = 30;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + step, 100);
        
        // Update statuses depending on progress
        let appropriateMessage = MESSAGES[0];
        for (let idx = MESSAGES.length - 1; idx >= 0; idx--) {
          if (next >= MESSAGES[idx].delay) {
            appropriateMessage = MESSAGES[idx];
            break;
          }
        }
        if (appropriateMessage) {
          setCurrentMessage(appropriateMessage.text);
        }

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 400); // Small grace transition
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      id="site-loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950 text-white select-none"
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_60%)] pointer-events-none" />
      
      {/* Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />

      {/* Main Animated Glowing Cloud Icon */}
      <div className="relative mb-12">
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative z-10 p-6 rounded-full bg-blue-950/40 border border-blue-500/20 shadow-[0_0_50px_rgba(37,99,235,0.2)]"
        >
          <Cloud className="w-16 h-16 text-blue-400 glow-blue animate-pulse" />
        </motion.div>

        {/* Orbiting particles */}
        <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
          <motion.div 
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-2 w-3 h-3 rounded-full bg-cyan-400 glow-cyan" 
          />
          <motion.div 
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute -bottom-2 w-2.5 h-2.5 rounded-full bg-rose-500 glow-rose" 
          />
        </div>
      </div>

      {/* Digital readout and Progress */}
      <div className="w-full max-w-sm px-6 text-center z-10">
        <div className="mb-3 flex justify-between items-end">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 tracking-wider">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span>TRAFFIC FLOW ACTIVE</span>
          </div>
          <span className="text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-rose-400">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="h-1.5 w-full bg-gray-900 border border-gray-800 rounded-full overflow-hidden p-[1px]">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-rose-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic status line with nice transition */}
        <div className="mt-4 h-6">
          <motion.p
            key={currentMessage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-mono text-gray-400 tracking-wide text-center"
          >
            {currentMessage}
          </motion.p>
        </div>
      </div>

      {/* Corner Status Indicators (Cyberpunk Style Aesthetics) */}
      <div className="absolute top-6 left-6 flex items-center gap-2 font-mono text-[9px] text-gray-500">
        <Cpu className="w-3.5 h-3.5" />
        <span>SYS.ENG // SHIELD ENABLED</span>
      </div>
      <div className="absolute top-6 right-6 flex items-center gap-2 font-mono text-[9px] text-gray-500">
        <Activity className="w-3.5 h-3.5" />
        <span>FLOW.RATE // OOPS_OK</span>
      </div>
      <div className="absolute bottom-6 left-6 font-mono text-[9px] text-gray-600">
        LATENCY.CHECK // READY
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[9px] text-gray-600">
        © TRAFFIC CLOUD © {new Date().getFullYear()}
      </div>
    </motion.div>
  );
}
