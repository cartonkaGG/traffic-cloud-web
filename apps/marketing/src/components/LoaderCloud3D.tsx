import { motion } from 'motion/react';
import TrafficCloudMark from './brand/TrafficCloudMark';

const MARK_SIZE = 148;
const RING_LEN = 289;

type Props = {
  progress: number;
  exiting: boolean;
};

export default function LoaderCloud3D({ progress, exiting }: Props) {
  const ringOffset = RING_LEN - (RING_LEN * progress) / 100;

  return (
    <div className="loader-scene">
      <svg className="loader-progress-ring" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <linearGradient id="loader-ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(195 100% 45%)" />
            <stop offset="50%" stopColor="hsl(195 100% 70%)" />
            <stop offset="100%" stopColor="hsl(195 100% 50%)" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="hsl(195 100% 50% / 0.14)"
          strokeWidth="1"
        />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="url(#loader-ring-grad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={RING_LEN}
          strokeDashoffset={ringOffset}
          transform="rotate(-90 50 50)"
          className="loader-progress-ring-stroke"
        />
      </svg>

      <div className="loader-core">
        <div className="loader-glow" aria-hidden />
        <div className="loader-halo" aria-hidden />

        <motion.div
          className="loader-mark-wrap"
          animate={
            exiting
              ? { scale: 1.1, opacity: 0, filter: 'blur(12px)' }
              : { y: [0, -8, 0] }
          }
          transition={
            exiting
              ? { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
              : { duration: 8, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <TrafficCloudMark size={MARK_SIZE} variant="hero" glow="lean" />
        </motion.div>
      </div>
    </div>
  );
}
