import { motion, useReducedMotion } from 'motion/react';
import TrafficCloudMark from './brand/TrafficCloudMark';

export default function HeroCloudShowcase() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="hero-cloud-visual mx-auto">
      <div className="hero-cloud-aura" aria-hidden />
      <div className="hero-cloud-pulse-ring" aria-hidden />
      <div className="hero-cloud-ground-glow" aria-hidden />

      <motion.div
        className="hero-cloud-float"
        animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        {!reduceMotion && <div className="hero-cloud-shimmer" aria-hidden />}
        <div className="hero-cloud-mark-main">
          <TrafficCloudMark size={280} variant="hero" glow="lean" />
        </div>
      </motion.div>
    </div>
  );
}
