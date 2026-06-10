import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { ReactNode } from 'react';
import { SceneCaption } from './SceneCaption';

type Props = {
  eyebrow: string;
  title: string;
  desc: string;
  children: ReactNode;
};

export function PanelSlide({ eyebrow, title, desc, children }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const scale = interpolate(enter, [0, 1], [0.94, 1]);
  const panelY = interpolate(enter, [0, 1], [40, 0]);
  const opacity = interpolate(frame, [0, 0.35 * fps], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic)
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20
      }}
    >
      <SceneCaption eyebrow={eyebrow} title={title} desc={desc} />
      <div
        style={{
          marginTop: 108,
          opacity,
          transform: `translateY(${panelY}px) scale(${scale})`
        }}
      >
        {children}
      </div>
    </div>
  );
}
