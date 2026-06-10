import { Easing, interpolate, useCurrentFrame } from 'remotion';

export type CameraKeyframe = {
  frame: number;
  scale: number;
  x: number;
  y: number;
};

type Props = {
  keyframes: CameraKeyframe[];
  children: React.ReactNode;
};

export function PanelCamera({ keyframes, children }: Props) {
  const frame = useCurrentFrame();
  const at = keyframes.map((k) => k.frame);
  const scale = interpolate(
    frame,
    at,
    keyframes.map((k) => k.scale),
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );
  const x = interpolate(
    frame,
    at,
    keyframes.map((k) => k.x),
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );
  const y = interpolate(
    frame,
    at,
    keyframes.map((k) => k.y),
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) }
  );

  return (
    <div
      style={{
        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        transformOrigin: 'center center'
      }}
    >
      {children}
    </div>
  );
}
