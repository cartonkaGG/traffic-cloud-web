import { Easing, interpolate, useCurrentFrame } from 'remotion';
import type { ReactNode } from 'react';

type Props = {
  durationInFrames: number;
  children: ReactNode;
};

export function SceneFade({ durationInFrames, children }: Props) {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1)
  });
  const fadeOut = interpolate(frame, [durationInFrames - 22, durationInFrames - 1], [1, 0], {
    extrapolateLeft: 'clamp',
    easing: Easing.bezier(0.4, 0, 0.2, 1)
  });
  const opacity = Math.min(fadeIn, fadeOut);

  const enterScale = interpolate(frame, [0, 22], [0.94, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  const exitScale = interpolate(frame, [durationInFrames - 24, durationInFrames - 1], [1, 1.04], {
    extrapolateLeft: 'clamp',
    easing: Easing.in(Easing.cubic)
  });
  const scale = frame < durationInFrames - 24 ? enterScale : exitScale;

  const enterY = interpolate(frame, [0, 22], [28, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  const exitY = interpolate(frame, [durationInFrames - 24, durationInFrames - 1], [0, -18], {
    extrapolateLeft: 'clamp'
  });
  const y = frame < durationInFrames - 24 ? enterY : exitY;

  const sweep = interpolate(frame, [0, 14, 28], [0.12, 0, 0], { extrapolateRight: 'clamp' });
  const exitSweep = interpolate(
    frame,
    [durationInFrames - 18, durationInFrames - 10, durationInFrames - 1],
    [0, 0.08, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          opacity,
          transform: `translateY(${y}px) scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {children}
      </div>
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(105deg, rgba(94,200,255,${sweep}) 0%, transparent 42%)`,
          mixBlendMode: 'screen'
        }}
      />
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, rgba(94,200,255,${exitSweep}) 0%, transparent 70%)`,
          mixBlendMode: 'screen'
        }}
      />
    </div>
  );
}
