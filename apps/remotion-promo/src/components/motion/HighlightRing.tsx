import { interpolate, useCurrentFrame } from 'remotion';

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  delay?: number;
  label?: string;
};

export function HighlightRing({ x, y, width, height, delay = 8, label }: Props) {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - delay);
  const pulse = interpolate(t % 24, [0, 12, 24], [0.45, 1, 0.45]);
  const grow = interpolate(t, [0, 12], [0.92, 1], { extrapolateRight: 'clamp' });

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: width * grow,
          height: height * grow,
          borderRadius: 12,
          border: `2px solid rgba(94, 200, 255, ${pulse})`,
          boxShadow: `0 0 ${22 * pulse}px rgba(94, 200, 255, 0.35), inset 0 0 ${12 * pulse}px rgba(94, 200, 255, 0.08)`,
          pointerEvents: 'none'
        }}
      />
      {label ? (
        <div
          style={{
            position: 'absolute',
            left: x,
            top: y - 26,
            padding: '4px 10px',
            borderRadius: 8,
            background: 'rgba(94, 200, 255, 0.15)',
            border: '1px solid rgba(94, 200, 255, 0.35)',
            fontSize: 11,
            fontWeight: 700,
            color: '#a5f3fc',
            letterSpacing: '0.04em',
            opacity: pulse
          }}
        >
          {label}
        </div>
      ) : null}
    </>
  );
}
