import type { CSSProperties } from 'react';

/** Mirrors Traffic Cloud panel design tokens (apps/panel globals.css). */
export const PANEL = {
  ink: '#030712',
  surface: '#0c1019',
  glass: 'rgba(3, 7, 18, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
  accent: '#5ec8ff',
  accentSoft: 'rgba(94, 200, 255, 0.12)',
  accentBorder: 'rgba(94, 200, 255, 0.25)',
  text: '#f8fafc',
  muted: '#94a3b8',
  dim: '#64748b',
  vuCta: 'linear-gradient(135deg, rgba(34, 211, 238, 0.95) 0%, rgba(59, 130, 246, 0.92) 55%, rgba(99, 102, 241, 0.9) 100%)',
  vuCtaShadow: '0 0 0 1px rgba(94, 200, 255, 0.25), 0 12px 40px -12px rgba(34, 211, 238, 0.45)',
  textGradient: 'linear-gradient(135deg, #ffffff 0%, #a5f3fc 45%, #93c5fd 100%)'
} as const;

export function glassPanel(extra?: CSSProperties): CSSProperties {
  return {
    borderRadius: 16,
    border: `1px solid rgba(255,255,255,0.08)`,
    background: 'rgba(3, 7, 18, 0.75)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.35)',
    ...extra
  };
}
