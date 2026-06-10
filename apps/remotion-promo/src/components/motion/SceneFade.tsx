import { Easing, interpolate, useCurrentFrame } from 'remotion';
import type { ReactNode } from 'react';

type Props = {
  durationInFrames: number;
  children: ReactNode;
};

export function SceneFade({ durationInFrames, children }: Props) {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  const fadeOut = interpolate(frame, [durationInFrames - 16, durationInFrames - 1], [1, 0], {
    extrapolateLeft: 'clamp',
    easing: Easing.in(Easing.cubic)
  });
  const enterY = interpolate(frame, [0, 18], [36, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });
  const exitY = interpolate(frame, [durationInFrames - 20, durationInFrames - 1], [0, -28], {
    extrapolateLeft: 'clamp',
    easing: Easing.in(Easing.cubic)
  });
  const y = frame < durationInFrames - 20 ? enterY : exitY;
  const scale = interpolate(frame, [0, 18], [0.97, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        opacity: Math.min(fadeIn, fadeOut),
        transform: `translateY(${y}px) scale(${scale})`
      }}
    >
      {children}
    </div>
  );
}
