import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

type Props = {
  eyebrow: string;
  title: string;
  desc: string;
};

export function SceneCaption({ eyebrow, title, desc }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  const y = interpolate(frame, [0, 0.5 * fps], [12, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 36,
        textAlign: 'center',
        opacity,
        transform: `translateY(${y}px)`,
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
        pointerEvents: 'none'
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#5ec8ff'
        }}
      >
        {eyebrow}
      </p>
      <h2 style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 800, color: '#f8fafc' }}>{title}</h2>
      <p style={{ margin: '8px auto 0', maxWidth: 560, fontSize: 15, color: '#94a3b8', lineHeight: 1.45 }}>
        {desc}
      </p>
    </div>
  );
}
