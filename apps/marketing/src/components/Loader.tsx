import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import LoaderCloud3D from './LoaderCloud3D';
import { useIsMobile } from '../lib/useMediaQuery';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const duration = isMobile ? 2200 : 3000;
    const tick = 36;
    const step = 100 / (duration / tick);
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + step, 100);
        if (next >= 100) {
          clearInterval(timer);
          setExiting(true);
          setTimeout(onComplete, 950);
        }
        return next;
      });
    }, tick);
    return () => clearInterval(timer);
  }, [onComplete, isMobile]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="loader-screen fixed inset-0 z-50 flex items-center justify-center bg-[#030712] text-white overflow-hidden"
      role="status"
      aria-label="Загрузка"
    >
      <div className="hero-aurora absolute inset-0 opacity-80" />
      <div className="loader-vignette absolute inset-0" aria-hidden />
      {!isMobile && <div className="loader-light-beam absolute inset-0" aria-hidden />}

      <div className="loader-stack relative z-10 flex flex-col items-center">
        <LoaderCloud3D progress={progress} exiting={exiting} />
        <motion.p
          className="loader-caption"
          animate={exiting ? { opacity: 0, y: 6 } : { opacity: [0.45, 0.9, 0.45] }}
          transition={
            exiting
              ? { duration: 0.5 }
              : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          загрузка....
        </motion.p>
      </div>
    </motion.div>
  );
}
