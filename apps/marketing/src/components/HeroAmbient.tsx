import TrafficCloudMark from './brand/TrafficCloudMark';
import { useIsMobile } from '../lib/useMediaQuery';

const FLOATERS_DESKTOP = [
  { x: '4%', y: '12%', size: 44, delay: 0 },
  { x: '22%', y: '6%', size: 30, delay: 2.2 },
  { x: '8%', y: '38%', size: 36, delay: 1.1 },
  { x: '18%', y: '72%', size: 48, delay: 3.1 },
  { x: '32%', y: '82%', size: 26, delay: 1.7 },
  { x: '6%', y: '58%', size: 22, delay: 2.8 },
];

const FLOATERS_MOBILE = [
  { x: '6%', y: '14%', size: 32, delay: 0 },
  { x: '12%', y: '68%', size: 28, delay: 1.5 },
  { x: '24%', y: '38%', size: 24, delay: 2.5 },
];

export default function HeroAmbient() {
  const isMobile = useIsMobile();
  const floaters = isMobile ? FLOATERS_MOBILE : FLOATERS_DESKTOP;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="hero-aurora absolute inset-0 opacity-65" />
      <div className="hero-ambient-glow hero-ambient-glow--cyan" />
      {!isMobile && <div className="hero-ambient-glow hero-ambient-glow--indigo" />}

      {floaters.map((f, i) => (
        <div
          key={i}
          className="hero-ambient-floater"
          style={{
            left: f.x,
            top: f.y,
            animationDelay: `${f.delay}s`,
            animationDuration: `${14 + (i % 3) * 3}s`,
          }}
        >
          <TrafficCloudMark size={f.size} variant="ambient" />
        </div>
      ))}
    </div>
  );
}
