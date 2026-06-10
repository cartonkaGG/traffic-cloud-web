const CLOUD_PATH =
  'M 60,130 H 240 C 265,130 280,112 280,90 C 280,68 262,52 235,52 C 230,52 224,53 218,55 C 205,33 182,18 155,18 C 122,18 95,39 90,67 C 84,64 78,63 72,63 C 49,63 35,79 35,98 C 35,118 48,130 60,130 Z';

type Props = { size?: number };

export function CloudMark({ size = 120 }: Props) {
  const height = Math.round(size * (118 / 255));

  return (
    <svg
      viewBox="30 14 255 118"
      width={size}
      height={height}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5ec8ff" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <path
        d={CLOUD_PATH}
        fill="none"
        stroke="#5ec8ff"
        strokeWidth={18}
        opacity={0.35}
        filter="url(#glow)"
      />
      <path d={CLOUD_PATH} fill="url(#cloudGrad)" opacity={0.95} />
    </svg>
  );
}
