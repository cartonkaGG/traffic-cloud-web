import type { CSSProperties, ReactNode } from 'react';
import { PROMO_LOGS } from '../../lib/promoMocks';
import { PANEL, glassPanel } from '../../lib/panelTokens';

const STATUS_STYLES = {
  active: { color: '#6ee7b7', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
  warming: { color: '#7dd3fc', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)' },
  flood: { color: '#fcd34d', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' }
} as const;

function statIcon(kind: 'radio' | 'mouse' | 'trend' | 'chart'): ReactNode {
  const s = { width: 18, height: 18, stroke: PANEL.accent, fill: 'none', strokeWidth: 1.8 };
  if (kind === 'radio') {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M4.9 4.9a10 10 0 0114.2 0M7.8 7.8a6 6 0 018.4 0M10.7 10.7a2 2 0 012.6 0" />
      </svg>
    );
  }
  if (kind === 'mouse') {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M12 3v10m0 0l-3-3m3 3l3-3M5 21h14" />
      </svg>
    );
  }
  if (kind === 'trend') {
    return (
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M3 17l6-6 4 4 8-10" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" style={s}>
      <path d="M4 19V5M4 19h16M8 15v-4M12 15V9M16 15v-2" />
    </svg>
  );
}

export function PromoStatCard({
  label,
  value,
  delta,
  icon
}: {
  label: string;
  value: string;
  delta?: string;
  icon: 'radio' | 'mouse' | 'trend' | 'chart';
}) {
  return (
    <div style={{ ...glassPanel({ padding: '14px 16px', position: 'relative', overflow: 'hidden' }) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#71717a'
            }}
          >
            {label}
          </div>
          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em' }}>
            {value}
          </div>
          {delta ? (
            <div
              style={{
                marginTop: 6,
                display: 'inline-block',
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 999,
                background: 'rgba(16,185,129,0.1)',
                color: '#6ee7b7'
              }}
            >
              {delta}
            </div>
          ) : null}
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {statIcon(icon)}
        </div>
      </div>
    </div>
  );
}

export function PromoAccountCard({
  label,
  username,
  phone,
  status,
  statusLabel,
  lastActivity,
  sentToday,
  proxy,
  initials,
  compact = false
}: {
  label: string;
  username: string;
  phone: string;
  status: keyof typeof STATUS_STYLES;
  statusLabel: string;
  lastActivity: string;
  sentToday: number;
  proxy: string;
  initials: string;
  compact?: boolean;
}) {
  const st = STATUS_STYLES[status] ?? STATUS_STYLES.active;
  const btn: CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    padding: '5px 9px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    color: '#e4e4e7'
  };

  return (
    <div style={{ ...glassPanel({ padding: compact ? 12 : 16 }) }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: compact ? 13 : 14, fontWeight: 600, color: '#fff' }}>{label}</span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: st.color,
                border: `1px solid ${st.border}`,
                background: st.bg,
                borderRadius: 999,
                padding: '2px 7px'
              }}
            >
              {statusLabel}
            </span>
          </div>
          <div style={{ marginTop: 3, fontFamily: 'ui-monospace', fontSize: 11, color: '#a1a1aa' }}>
            @{username}
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: '#71717a', lineHeight: 1.55 }}>
            <div>
              {phone} · Остання активність · {lastActivity}
            </div>
            <div>
              Відправлено сьогодні · {sentToday} · Проксі · {proxy}
            </div>
          </div>
          {!compact ? (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              <span style={{ ...btn, borderColor: 'rgba(94,200,255,0.3)', background: PANEL.accentSoft, color: PANEL.accent }}>
                Повідомлення
              </span>
              <span style={{ ...btn, borderColor: 'rgba(56,189,248,0.25)', background: 'rgba(14,165,233,0.1)', color: '#e0f2fe' }}>
                Telegram Web
              </span>
              <span style={btn}>Проксі</span>
              <span style={btn}>Код Telegram</span>
              <span
                style={{
                  ...btn,
                  borderColor: 'rgba(251,191,36,0.25)',
                  background: 'rgba(245,158,11,0.1)',
                  color: '#fde68a'
                }}
              >
                Запустити спам
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PromoLiveLog() {
  const kindStyle: Record<string, CSSProperties> = {
    message_sent: { borderColor: 'rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.1)', color: '#a7f3d0' },
    inbox_message: { borderColor: 'rgba(94,200,255,0.25)', background: PANEL.accentSoft, color: PANEL.accent },
    default: { borderColor: 'rgba(56,189,248,0.2)', background: 'rgba(14,165,233,0.1)', color: '#bae6fd' }
  };

  return (
    <div style={{ ...glassPanel({ overflow: 'hidden', height: '100%' }) }}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontSize: 12,
          fontWeight: 600,
          color: '#fff'
        }}
      >
        Живі логи
      </div>
      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {PROMO_LOGS.map((l) => (
          <div
            key={l.time}
            style={{
              borderRadius: 10,
              border: '1px solid',
              padding: '8px 10px',
              fontSize: 10,
              lineHeight: 1.45,
              ...(kindStyle[l.kind] ?? kindStyle.default)
            }}
          >
            <span style={{ opacity: 0.75, marginRight: 6, fontFamily: 'ui-monospace' }}>{l.time}</span>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}
