import { useEffect } from 'react';
import { motion, useSpring } from 'motion/react';

export default function ScrollProgressBar() {
  const scaleX = useSpring(0, { stiffness: 120, damping: 28, mass: 0.4 });

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      scaleX.set(max > 0 ? window.scrollY / max : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [scaleX]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none" aria-hidden>
      <motion.div
        className="h-full w-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
        style={{ scaleX, transformOrigin: '0% 50%' }}
      />
    </div>
  );
}
