import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

type Props = {
  title: string;
  desc: string;
  color: string;
  delayFrames: number;
};

export function FeatureCard({ title, desc, color, delayFrames }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = Math.max(0, frame - delayFrames);

  const enter = spring({ frame: local, fps, config: { damping: 14, stiffness: 140 } });
  const opacity = interpolate(local, [0, 0.4 * fps], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  const y = interpolate(enter, [0, 1], [28, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        padding: '22px 24px',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.04)',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 32px ${color}22`
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: color,
          marginBottom: 14,
          boxShadow: `0 0 12px ${color}`
        }}
      />
      <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 15, color: '#94a3b8' }}>{desc}</div>
    </div>
  );
}
