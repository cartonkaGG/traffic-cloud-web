import { motion, useReducedMotion } from 'motion/react';
import TrafficCloudMark from './brand/TrafficCloudMark';
import { useIsMobile } from '../lib/useMediaQuery';

const PARTICLES = [
  { left: '18%', top: '16%', delay: 0 },
  { left: '80%', top: '22%', delay: 1.1 },
  { left: '74%', top: '78%', delay: 0.5 },
  { left: '22%', top: '82%', delay: 1.8 },
];

const SPARKS = [
  { left: '32%', top: '28%', delay: 0 },
  { left: '68%', top: '34%', delay: 0.7 },
];

export default function HeroCloudShowcase() {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const lite = reduceMotion || isMobile;
  const markSize = isMobile ? 200 : 280;

  return (
    <div className="hero-cloud-visual mx-auto">
      <motion.div
        className="hero-cloud-float"
        animate={lite ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="hero-cloud-hub">
          <div className="hero-cloud-fx-clip" aria-hidden>
            <div className="hero-cloud-aura" />
            <div className="hero-cloud-halo" />
            {!lite && <div className="hero-cloud-orbit" />}
            {!lite && <div className="hero-cloud-shimmer" />}

            {!lite &&
              SPARKS.map((s, i) => (
                <span
                  key={`spark-${i}`}
                  className="hero-cloud-spark"
                  style={{ left: s.left, top: s.top, animationDelay: `${s.delay}s` }}
                />
              ))}

            {!lite &&
              PARTICLES.map((p, i) => (
                <span
                  key={`particle-${i}`}
                  className="hero-cloud-particle"
                  style={{ left: p.left, top: p.top, animationDelay: `${p.delay}s` }}
                />
              ))}
          </div>

          <div className="hero-cloud-mark-main">
            <TrafficCloudMark size={markSize} variant="hero" glow="lean" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
