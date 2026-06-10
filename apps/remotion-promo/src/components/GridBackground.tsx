import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export function GridBackground() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const pulse = interpolate(frame % (4 * fps), [0, 2 * fps, 4 * fps], [0.04, 0.09, 0.04]);
  const panX = interpolate(frame, [0, durationInFrames], [0, -80], {
    extrapolateRight: 'clamp'
  });
  const panY = interpolate(frame, [0, durationInFrames], [0, 40], {
    extrapolateRight: 'clamp'
  });
  const aurora = interpolate(frame % (6 * fps), [0, 3 * fps, 6 * fps], [0.08, 0.16, 0.08]);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 70% 50% at ${20 + panX * 0.02}% 0%, rgba(94,200,255,${aurora + 0.06}), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 20%, rgba(251,191,36,0.08), transparent 50%)`
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: -40,
          opacity: pulse,
          transform: `translate(${panX}px, ${panY}px)`,
          backgroundImage:
            'linear-gradient(rgba(94,200,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(94,200,255,0.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />
    </AbsoluteFill>
  );
}
