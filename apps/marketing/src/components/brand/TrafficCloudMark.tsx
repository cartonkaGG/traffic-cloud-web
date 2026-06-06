import { CLOUD_SHAPE_PATH, CLOUD_VIEWBOX, cloudMarkAspect } from './cloudMarkPaths';

type Props = {
  className?: string;
  size?: number;
  glowColor?: string;
  /** hero — неон; logo/ambient — легший */
  variant?: 'hero' | 'logo' | 'ambient';
  /** lean — один bloom замість трьох (швидше на головній) */
  glow?: 'full' | 'lean';
};

export default function TrafficCloudMark({
  className = '',
  size = 120,
  glowColor = 'var(--color-neon-cloud, hsl(195, 100%, 55%))',
  variant = 'hero',
  glow = 'full',
}: Props) {
  const height = Math.round(size * cloudMarkAspect);
  const isLight = variant === 'logo' || variant === 'ambient';
  const leanHero = variant === 'hero' && glow === 'lean';
  const markClass =
    variant === 'hero' ? 'neon-cloud-mark hero-cloud-neon' : 'neon-cloud-icon opacity-90';

  return (
    <div className={`relative inline-block ${markClass} ${className}`.trim()}>
      <svg
        viewBox={`${CLOUD_VIEWBOX.x} ${CLOUD_VIEWBOX.y} ${CLOUD_VIEWBOX.w} ${CLOUD_VIEWBOX.h}`}
        width={size}
        height={height}
        className="neon-cloud-svg block overflow-visible"
        aria-hidden
      >
        {!isLight && leanHero && (
          <path
            d={CLOUD_SHAPE_PATH}
            fill="none"
            stroke={glowColor}
            strokeWidth={24}
            opacity={0.35}
            className="hero-neon-bloom"
            style={{ filter: 'blur(10px)' }}
          />
        )}
        {!isLight && !leanHero && (
          <>
            <path
              d={CLOUD_SHAPE_PATH}
              fill="none"
              stroke={glowColor}
              strokeWidth={42}
              opacity={0.45}
              className="hero-neon-bloom"
              style={{ filter: 'blur(20px)' }}
            />
            <path
              d={CLOUD_SHAPE_PATH}
              fill="none"
              stroke={glowColor}
              strokeWidth={30}
              opacity={0.35}
              style={{ filter: 'blur(14px)' }}
            />
            <path
              d={CLOUD_SHAPE_PATH}
              fill="none"
              stroke={glowColor}
              strokeWidth={22}
              opacity={0.55}
              style={{ filter: 'blur(8px)' }}
            />
          </>
        )}
        {isLight ? (
          <path
            d={CLOUD_SHAPE_PATH}
            fill="none"
            stroke={glowColor}
            strokeWidth={8}
            opacity={0.5}
            style={{ filter: 'blur(4px)' }}
          />
        ) : (
          <path
            d={CLOUD_SHAPE_PATH}
            fill="none"
            stroke={glowColor}
            strokeWidth={leanHero ? 14 : 16}
            opacity={0.8}
            style={{ filter: leanHero ? undefined : 'blur(3px)' }}
          />
        )}
        <path
          d={CLOUD_SHAPE_PATH}
          fill="none"
          stroke={glowColor}
          strokeWidth={isLight ? 3 : 12}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.95}
          className={!isLight ? 'hero-neon-core' : undefined}
        />
        <path
          d={CLOUD_SHAPE_PATH}
          fill="none"
          stroke="hsl(195, 100%, 96%)"
          strokeWidth={isLight ? 1.5 : 5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
