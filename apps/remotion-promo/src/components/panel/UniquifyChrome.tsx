import type { ReactNode } from 'react';
import { CloudMark } from '../CloudMark';
import { PANEL } from '../../lib/panelTokens';

export function UniquifyChrome({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 1040,
        borderRadius: 16,
        overflow: 'hidden',
        border: `1px solid ${PANEL.glassBorder}`,
        boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
        background: PANEL.ink,
        display: 'flex',
        minHeight: 480
      }}
    >
      <aside
        style={{
          width: 200,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(3,7,18,0.95)',
          padding: '20px 14px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ marginBottom: 20, padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CloudMark size={24} />
            <span style={{ fontSize: 10, fontWeight: 800, color: PANEL.text, letterSpacing: '0.08em' }}>
              TRAFFIC CLOUD
            </span>
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(94,200,255,0.7)'
            }}
          >
            Video Uniquify
          </div>
        </div>
        <div
          style={{
            padding: '9px 12px',
            borderRadius: 12,
            background: PANEL.accentSoft,
            border: `1px solid ${PANEL.accentBorder}`,
            fontSize: 13,
            fontWeight: 600,
            color: PANEL.text
          }}
        >
          Студія
        </div>
        <div
          style={{
            marginTop: 'auto',
            padding: '12px 14px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            fontSize: 12,
            color: PANEL.muted
          }}
        >
          Traffic Cloud Hub
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(3,7,18,0.8)'
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: PANEL.dim }}>
            Локальна обробка · Pro
          </div>
          <div style={{ marginTop: 4, fontSize: 17, fontWeight: 600, color: PANEL.text }}>Video Uniquify</div>
        </header>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 70% 55% at 15% 0%, rgba(94,200,255,0.1), transparent 58%), radial-gradient(ellipse 50% 40% at 90% 20%, rgba(99,102,241,0.06), transparent 55%)'
            }}
          />
          <div style={{ position: 'relative', padding: '18px 20px' }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
