import { HighlightRing } from '../../motion/HighlightRing';
import { HubChrome } from '../HubChrome';

export function HubScreen() {
  return (
    <HubChrome>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#f8fafc' }}>Software Hub</h3>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#64748b', maxWidth: 520 }}>
          Два активні модулі: Telegram DM Outreach і Video Uniquify у браузері.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, position: 'relative' }}>
        <HighlightRing x={0} y={0} width={470} height={248} label="DM Outreach · запустити" />
        <HubTile
          title="DM Outreach"
          version="v0.2.1"
          desc="Telegram DM-кампанії, парсер, гуманізація та аналітика в одній консолі."
          accent="linear-gradient(135deg, rgba(14,165,233,0.5), rgba(37,99,235,0.35))"
          glow
        />
        <HubTile
          title="Video Uniquify"
          version="v0.1.0"
          desc="Пакетна унікалізація вертикальних відео у браузері — Pro якість, локально на ПК."
          accent="linear-gradient(135deg, rgba(244,63,94,0.45), rgba(249,115,22,0.3))"
        />
      </div>
    </HubChrome>
  );
}

function HubTile({
  title,
  version,
  desc,
  accent,
  glow
}: {
  title: string;
  version: string;
  desc: string;
  accent: string;
  glow?: boolean;
}) {
  return (
    <div
      style={{
        borderRadius: 20,
        border: glow ? '1px solid rgba(94,200,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
        background: '#0c1019',
        padding: 16,
        minHeight: 248,
        boxShadow: glow ? '0 0 40px rgba(94,200,255,0.12)' : undefined
      }}
    >
      <div
        style={{
          height: 88,
          borderRadius: 14,
          background: accent,
          marginBottom: 14,
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>{title}</span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#6ee7b7',
            border: '1px solid rgba(52,211,153,0.3)',
            background: 'rgba(52,211,153,0.1)',
            borderRadius: 999,
            padding: '3px 8px'
          }}
        >
          Доступно
        </span>
      </div>
      <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.5, color: '#64748b' }}>{desc}</p>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'ui-monospace', fontSize: 11, color: '#52525b' }}>{version}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#5ec8ff' }}>Запустити →</span>
      </div>
    </div>
  );
}
