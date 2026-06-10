import { interpolate, useCurrentFrame } from 'remotion';
import type { CSSProperties, ReactNode } from 'react';
import { PANEL } from '../../lib/panelTokens';

type Props = {
  children: ReactNode;
  label?: string;
  delay?: number;
  active?: boolean;
  style?: CSSProperties;
  radius?: number;
};

/** Wraps a UI block — glow follows the real element, not a guessed absolute box. */
export function FocusCard({ children, label, delay = 12, active = true, style, radius = 16 }: Props) {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - delay);
  const pulse = interpolate(t % 28, [0, 14, 28], [0.55, 1, 0.55]);
  const strength = active ? pulse : 0.35;

  return (
    <div style={{ position: 'relative', borderRadius: radius, ...style }}>
      {label && active ? (
        <div
          style={{
            position: 'absolute',
            zIndex: 3,
            top: -30,
            left: 0,
            padding: '5px 11px',
            borderRadius: 8,
            background: 'rgba(94, 200, 255, 0.12)',
            border: `1px solid rgba(94, 200, 255, ${0.35 * strength})`,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#a5f3fc',
            opacity: strength,
            whiteSpace: 'nowrap'
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          pointerEvents: 'none',
          zIndex: 2,
          boxShadow: active
            ? `inset 0 0 0 1px rgba(94, 200, 255, ${0.45 * strength}), 0 0 ${28 * strength}px rgba(94, 200, 255, 0.22)`
            : undefined
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

export function GlassPanel({
  children,
  style
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: `1px solid ${PANEL.glassBorder}`,
        background: PANEL.glass,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        ...style
      }}
    >
      {children}
    </div>
  );
}
