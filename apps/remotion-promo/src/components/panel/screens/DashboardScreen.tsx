import { PanelChrome } from '../PanelChrome';

const STATS = [
  { label: 'Надіслано DM', value: '1 284', delta: '+12%', color: '#34d399' },
  { label: 'Відповіді', value: '96', delta: '+8%', color: '#5ec8ff' },
  { label: 'Акаунтів online', value: '4 / 5', delta: '', color: '#a78bfa' },
  { label: 'Конверсія', value: '7.4%', delta: '+0.6%', color: '#fbbf24' }
];

export function DashboardScreen() {
  return (
    <PanelChrome active="dashboard" path="dashboard">
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
        Додайте акаунт, розпарсіть чат і запустіть розсилку. Цифри оновлюються після кожного DM.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {STATS.map((s) => (
          <div
            key={s.label}
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)'
            }}
          >
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4, fontFamily: 'ui-monospace' }}>
              {s.value}
            </div>
            {s.delta ? (
              <div style={{ fontSize: 11, color: '#34d399', marginTop: 2 }}>{s.delta}</div>
            ) : null}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div
          style={{
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.25)',
            padding: 12
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 10 }}>Акаунти</div>
          {['@lead_bot_01 · online', '@traffic_ua · online', '@dm_warm · pause'].map((a) => (
            <div
              key={a}
              style={{
                fontSize: 11,
                color: '#94a3b8',
                padding: '6px 0',
                borderTop: '1px solid rgba(255,255,255,0.04)'
              }}
            >
              {a}
            </div>
          ))}
        </div>
        <div
          style={{
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.25)',
            padding: 12,
            fontFamily: 'ui-monospace',
            fontSize: 10
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8, fontFamily: 'system-ui' }}>
            Live log
          </div>
          <div style={{ color: '#34d399' }}>[12:04:11] DM sent → @user_2841</div>
          <div style={{ color: '#5ec8ff', marginTop: 4 }}>[12:04:09] Parsed 42 leads from chat</div>
          <div style={{ color: '#94a3b8', marginTop: 4 }}>[12:03:58] Campaign #7 running…</div>
        </div>
      </div>
    </PanelChrome>
  );
}
