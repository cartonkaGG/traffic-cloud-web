import type { ReactNode } from 'react';
import { CloudMark } from '../CloudMark';
import { PANEL } from '../../lib/panelTokens';
import { PROMO_USER } from '../../lib/promoMocks';

const MAIN_NAV = [
  { id: 'overview', label: 'Огляд', icon: 'grid' },
  { id: 'accounts', label: 'Акаунти', icon: 'users' },
  { id: 'sources', label: 'Парсер', icon: 'link' },
  { id: 'campaigns', label: 'Розсилка', icon: 'megaphone' },
  { id: 'inbox', label: 'Вхідні', icon: 'inbox' }
] as const;

const SYSTEM_NAV = [
  { id: 'settings', label: 'Налаштування', icon: 'settings' },
  { id: 'admin', label: 'Адмін', icon: 'shield' }
] as const;

export type OutreachNavId = (typeof MAIN_NAV)[number]['id'];

type Props = {
  active: OutreachNavId | 'settings' | 'admin';
  kicker: string;
  title: string;
  children: ReactNode;
  inboxBadge?: number;
};

function NavIcon({ kind }: { kind: string }) {
  const s = { width: 15, height: 15, stroke: 'currentColor', fill: 'none', strokeWidth: 1.8 };
  if (kind === 'users') {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    );
  }
  if (kind === 'link') {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    );
  }
  if (kind === 'megaphone') {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M3 11v2a2 2 0 002 2h1l6 4V5L6 9H5a2 2 0 00-2 2zM16 8.5a5 5 0 010 7M19 6a8 8 0 010 12" />
      </svg>
    );
  }
  if (kind === 'inbox') {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    );
  }
  if (kind === 'settings') {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68V4a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.36 0 .7.07 1.01.2H21a2 2 0 110 4h-.09c-.67 0-1.27.4-1.51 1z" />
      </svg>
    );
  }
  if (kind === 'shield') {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" style={s}>
      <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
    </svg>
  );
}

function NavItem({
  label,
  icon,
  active,
  badge
}: {
  label: string;
  icon: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        color: active ? '#fff' : '#a1a1aa',
        background: active ? PANEL.accentSoft : 'transparent',
        boxShadow: active ? 'inset 0 0 0 1px rgba(94,200,255,0.25)' : undefined,
        position: 'relative'
      }}
    >
      <span style={{ color: active ? PANEL.accent : '#71717a', display: 'flex' }}>
        <NavIcon kind={icon} />
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge ? (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 999,
            background: 'rgba(94,200,255,0.25)',
            color: PANEL.accent
          }}
        >
          {badge}
        </span>
      ) : null}
    </div>
  );
}

export function OutreachChrome({ active, kicker, title, children, inboxBadge }: Props) {
  return (
    <div
      style={{
        width: 1120,
        height: 620,
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 60px rgba(94,200,255,0.1)',
        background: PANEL.ink,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <aside
          style={{
            width: 228,
            flexShrink: 0,
            borderRight: '1px solid rgba(39,39,42,0.6)',
            background: 'rgba(3,7,18,0.92)',
            padding: '22px 16px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '0 4px' }}>
            <CloudMark size={28} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', color: '#fff' }}>
              TRAFFIC CLOUD
            </span>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ marginBottom: 6, padding: '0 10px', fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', color: '#52525b' }}>
              Панель
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {MAIN_NAV.map((item) => (
                <NavItem
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  active={item.id === active}
                  badge={item.id === 'inbox' ? inboxBadge : undefined}
                />
              ))}
            </div>

            <div style={{ marginTop: 18, marginBottom: 6, padding: '0 10px', fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', color: '#52525b' }}>
              Система
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {SYSTEM_NAV.map((item) => (
                <NavItem key={item.id} label={item.label} icon={item.icon} active={item.id === active} />
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 14,
              border: '1px solid rgba(139,92,246,0.2)',
              background: 'rgba(139,92,246,0.1)',
              padding: 14
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(196,181,253,0.8)', textTransform: 'uppercase' }}>
              Підписка
            </div>
            <div style={{ marginTop: 6, fontSize: 24, fontWeight: 600, color: '#ddd6fe' }}>∞</div>
          </div>
        </aside>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(3,7,18,0.6)'
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#71717a' }}>
                {kicker}
              </div>
              <div style={{ marginTop: 2, fontSize: 17, fontWeight: 700, color: '#fff' }}>{title}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.85 }}>
              <CloudMark size={18} />
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', color: '#d4d4d8' }}>TRAFFIC CLOUD</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '6px 10px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#d4d4d8'
                }}
              >
                Головна
              </span>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a1a1aa',
                  fontSize: 14
                }}
              >
                🔔
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{PROMO_USER.name}</div>
                  <div style={{ fontSize: 9, color: '#71717a' }}>{PROMO_USER.email}</div>
                </div>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    border: '1px solid rgba(94,200,255,0.25)',
                    background: 'rgba(94,200,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: PANEL.accent
                  }}
                >
                  {PROMO_USER.initials}
                </div>
              </div>
            </div>
          </header>

          <main style={{ flex: 1, padding: '16px 20px 18px', overflow: 'hidden', background: PANEL.ink }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
