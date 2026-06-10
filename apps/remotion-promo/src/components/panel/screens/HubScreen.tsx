import { PanelChrome } from '../PanelChrome';

export function HubScreen() {
  return (
    <PanelChrome active="hub" path="hub">
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f8fafc' }}>Software Hub</h3>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748b' }}>
          Оберіть інструмент для роботи з трафіком
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <HubTile
          title="DM Outreach"
          desc="Telegram розсилка, кампанії, inbox"
          accent="linear-gradient(135deg, #0ea5e9, #2563eb)"
          active
        />
        <HubTile
          title="Video Uniquify"
          desc="Унікалізація відео для заливів"
          accent="linear-gradient(135deg, #8b5cf6, #6366f1)"
          active
        />
        <HubTile title="Humanization" desc="Скоро" accent="linear-gradient(135deg, #334155, #1e293b)" />
        <HubTile title="Browser Profiles" desc="Скоро" accent="linear-gradient(135deg, #334155, #1e293b)" />
      </div>
    </PanelChrome>
  );
}

function HubTile({
  title,
  desc,
  accent,
  active
}: {
  title: string;
  desc: string;
  accent: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: active ? '1px solid rgba(94,200,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
        background: '#0c1019',
        padding: 14,
        opacity: active ? 1 : 0.55
      }}
    >
      <div
        style={{
          height: 72,
          borderRadius: 12,
          background: accent,
          marginBottom: 12,
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      />
      <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{title}</div>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{desc}</div>
      {active ? (
        <div
          style={{
            marginTop: 10,
            display: 'inline-block',
            fontSize: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#34d399',
            border: '1px solid rgba(52,211,153,0.3)',
            background: 'rgba(52,211,153,0.1)',
            borderRadius: 999,
            padding: '3px 8px'
          }}
        >
          Доступно
        </div>
      ) : null}
    </div>
  );
}
