import { AbsoluteFill } from 'remotion';
import type { ReactNode } from 'react';
import { useUiScale } from '../../lib/useUiScale';
import { PanelCamera, type CameraKeyframe } from '../motion/PanelCamera';
import { SceneFade } from '../motion/SceneFade';
import { SceneCaption } from './SceneCaption';

type Props = {
  eyebrow: string;
  title: string;
  desc: string;
  durationInFrames: number;
  camera: CameraKeyframe[];
  children: ReactNode;
};

export function DynamicPanelScene({
  eyebrow,
  title,
  desc,
  durationInFrames,
  camera,
  children
}: Props) {
  const s = useUiScale();

  return (
    <AbsoluteFill>
      <SceneFade durationInFrames={durationInFrames}>
        <SceneCaption eyebrow={eyebrow} title={title} desc={desc} />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 118 * s,
            width: 1040 * s,
            height: 500 * s,
            transform: 'translateX(-50%)',
            overflow: 'hidden',
            borderRadius: 18 * s,
            boxShadow: '0 40px 100px rgba(0,0,0,0.45)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <PanelCamera keyframes={camera}>{children}</PanelCamera>
          </div>
        </div>
      </SceneFade>
    </AbsoluteFill>
  );
}
