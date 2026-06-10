import type { ReactNode } from 'react';
import { CloudMark } from '../CloudMark';
import { PANEL } from '../../lib/panelTokens';

const NAV = [
  { id: 'overview', label: 'Огляд' },
  { id: 'accounts', label: 'Акаунти' },
  { id: 'sources', label: 'Парсер' },
  { id: 'campaigns', label: 'Розсилка' },
  { id: 'inbox', label: 'Вхідні' }
] as const;

export type OutreachNavId = (typeof NAV)[number]['id'];

type Props = {
  active: OutreachNavId;
  path: string;
  kicker: string;
  title: string;
  children: ReactNode;
  inboxBadge?: number;
};

export function OutreachChrome({ active, path, kicker, title, children, inboxBadge }: Props) {
  return (
    <div
      style={{
        width: 1040,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 60px rgba(94,200,255,0.12)',
        background: '#030712',
        position: 'relative'
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
          traffic-cloud.app/app{path}
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 440 }}>
        <aside
          style={{
            width: 200,
            flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(3,7,18,0.95)',
            padding: '18px 12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '0 6px' }}>
            <CloudMark size={26} />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc', letterSpacing: '0.06em' }}>
              TRAFFIC CLOUD
            </span>
          </div>
          <div style={{ marginBottom: 8, padding: '0 10px', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#52525b' }}>
            Панель
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {NAV.map((item) => {
              const isActive = item.id === active;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? PANEL.accent : PANEL.muted,
                    background: isActive ? PANEL.accentSoft : 'transparent',
                    border: isActive ? `1px solid ${PANEL.accentBorder}` : '1px solid transparent',
                    boxShadow: isActive ? 'inset 0 0 0 1px rgba(94,200,255,0.08)' : undefined
                  }}
                >
                  <span>{item.label}</span>
                  {item.id === 'inbox' && inboxBadge ? (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 999,
                        background: '#5ec8ff',
                        color: '#030712'
                      }}
                    >
                      {inboxBadge}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </aside>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)'
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5ec8ff' }}>
              {kicker}
            </div>
            <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>{title}</div>
          </div>
          <main style={{ flex: 1, padding: 18, background: '#060a14', overflow: 'hidden', position: 'relative' }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
