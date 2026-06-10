import type { ReactNode } from 'react';
import { CloudMark } from '../CloudMark';
import { PANEL } from '../../lib/panelTokens';

export function HubChrome({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 1040,
        borderRadius: 16,
        overflow: 'hidden',
        border: `1px solid ${PANEL.glassBorder}`,
        boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 48px rgba(94,200,255,0.08)',
        background: PANEL.ink,
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 100% 60% at 50% -20%, rgba(34,211,238,0.14), transparent 55%), linear-gradient(180deg, #030712 0%, #060a12 100%)',
          pointerEvents: 'none'
        }}
      />
      <header
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          background: 'rgba(3,7,18,0.65)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CloudMark size={28} />
          <span style={{ fontSize: 11, fontWeight: 800, color: PANEL.text, letterSpacing: '0.1em' }}>
            TRAFFIC CLOUD
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Головна', 'Підписка'].map((l) => (
            <div
              key={l}
              style={{
                fontSize: 12,
                color: PANEL.muted,
                padding: '7px 12px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)'
              }}
            >
              {l}
            </div>
          ))}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)'
            }}
          />
        </div>
      </header>
      <main style={{ position: 'relative', zIndex: 1, padding: '28px 32px 32px', minHeight: 420 }}>
        {children}
      </main>
    </div>
  );
}
