import type { ReactNode } from 'react';
import { CloudMark } from '../CloudMark';

const NAV = [
  { id: 'hub', label: 'Hub' },
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'accounts', label: 'Акаунти' },
  { id: 'sources', label: 'Джерела' },
  { id: 'campaigns', label: 'Кампанії' },
  { id: 'analytics', label: 'Аналітика' }
] as const;

export type PanelNavId = (typeof NAV)[number]['id'];

type Props = {
  active: PanelNavId;
  path: string;
  children: ReactNode;
};

export function PanelChrome({ active, path, children }: Props) {
  return (
    <div
      style={{
        width: 1040,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 60px rgba(94,200,255,0.12)',
        background: '#030712'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: '#0a0f18'
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {['#f87171', '#fbbf24', '#34d399'].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.85 }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            marginLeft: 8,
            padding: '6px 12px',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: 12,
            color: '#94a3b8',
            fontFamily: 'ui-monospace, monospace'
          }}
        >
          traffic-cloud.app/app/{path}
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 420 }}>
        <aside
          style={{
            width: 200,
            flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(3,7,18,0.95)',
            padding: '20px 14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <CloudMark size={28} />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>
              TRAFFIC CLOUD
            </span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV.map((item) => {
              const isActive = item.id === active;
              return (
                <div
                  key={item.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#5ec8ff' : '#94a3b8',
                    background: isActive ? 'rgba(94,200,255,0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(94,200,255,0.25)' : '1px solid transparent'
                  }}
                >
                  {item.label}
                </div>
              );
            })}
          </nav>
        </aside>
        <main style={{ flex: 1, padding: 22, background: '#060a14', overflow: 'hidden' }}>{children}</main>
      </div>
    </div>
  );
}
