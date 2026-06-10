import { FocusCard, GlassPanel } from '../../motion/FocusCard';
import { HubChrome } from '../HubChrome';
import { PANEL } from '../../../lib/panelTokens';

const PRODUCTS = [
  {
    id: 'dm-outreach',
    name: 'DM Outreach',
    version: 'v0.2.1',
    desc: 'Telegram DM-кампанії, парсер, гуманізація та аналітика в одній консолі.',
    accent: 'linear-gradient(135deg, rgba(14,165,233,0.45), rgba(37,99,235,0.25))',
    glow: 'rgba(94,200,255,0.45)',
    focus: true
  },
  {
    id: 'video-uniquify',
    name: 'Video Uniquify',
    version: 'v0.1.0',
    desc: 'Пакетна унікалізація вертикальних відео у браузері — Pro якість, локально на вашому ПК.',
    accent: 'linear-gradient(135deg, rgba(244,63,94,0.4), rgba(249,115,22,0.25))',
    glow: 'rgba(251,113,133,0.38)',
    focus: false
  }
] as const;

export function HubScreen() {
  return (
    <HubChrome>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: PANEL.dim }}>
        ✦ Traffic Cloud Hub
      </div>
      <h3 style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, color: PANEL.text }}>Оберіть застосунок</h3>
      <p style={{ margin: '8px 0 24px', fontSize: 12, color: PANEL.dim }}>Підписка Pro · NOWPayments</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 640 }}>
        {PRODUCTS.map((p) => {
          const tile = (
            <GlassPanel
              style={{
                padding: 16,
                minHeight: 248,
                border: p.focus ? `1px solid ${PANEL.accentBorder}` : `1px solid ${PANEL.glassBorder}`,
                boxShadow: p.focus ? `0 0 32px -8px ${p.glow}` : undefined
              }}
            >
              <div
                style={{
                  height: 88,
                  borderRadius: 14,
                  background: p.accent,
                  marginBottom: 14,
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{p.name}</span>
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
              <p style={{ margin: '10px 0 0', fontSize: 12, lineHeight: 1.5, color: PANEL.dim }}>{p.desc}</p>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'ui-monospace', fontSize: 11, color: '#52525b' }}>{p.version}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: PANEL.accent }}>Запустити →</span>
              </div>
            </GlassPanel>
          );

          return p.focus ? (
            <FocusCard key={p.id} label="DM Outreach · консоль" delay={10}>
              {tile}
            </FocusCard>
          ) : (
            <div key={p.id}>{tile}</div>
          );
        })}
      </div>
    </HubChrome>
  );
}
