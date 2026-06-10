import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export function GridBackground() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pulse = interpolate(frame % (4 * fps), [0, 2 * fps, 4 * fps], [0.04, 0.08, 0.04]);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 50% at 20% 0%, rgba(94,200,255,0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 20%, rgba(251,191,36,0.08), transparent 50%)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: pulse,
          backgroundImage:
            'linear-gradient(rgba(94,200,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(94,200,255,0.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />
    </AbsoluteFill>
  );
}
