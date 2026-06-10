import type { ReactNode } from 'react';
import { CloudMark } from '../CloudMark';

export function HubChrome({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 1040,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 60px rgba(94,200,255,0.12)',
        background: 'linear-gradient(180deg, #030712 0%, #060a12 100%)',
        position: 'relative'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(3,7,18,0.8)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CloudMark size={30} />
          <span style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc', letterSpacing: '0.08em' }}>
            TRAFFIC CLOUD
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Головна', 'Підписка', 'Акаунт'].map((l) => (
            <div
              key={l}
              style={{
                fontSize: 11,
                color: '#94a3b8',
                padding: '6px 12px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              {l}
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: 24, minHeight: 400, position: 'relative' }}>{children}</div>
    </div>
  );
}
