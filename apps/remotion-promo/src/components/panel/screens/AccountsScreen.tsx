import { FocusCard, GlassPanel } from '../../motion/FocusCard';
import { OutreachChrome } from '../OutreachChrome';
import { PANEL } from '../../../lib/panelTokens';

const ACCOUNTS = [
  { label: 'Lead UA #1', user: '@lead_bot_01', phone: '+380•••••421', status: 'Активний', proxy: 'SOCKS5 · Warsaw', online: true },
  { label: 'Traffic RU', user: '@traffic_ru', phone: '+7•••••••882', status: 'Прогрів', proxy: 'SOCKS5 · Berlin', online: true },
  { label: 'DM Warm', user: '@dm_warm', phone: '+380•••••109', status: 'FloodWait', proxy: '—', online: false }
];

export function AccountsScreen() {
  return (
    <OutreachChrome active="accounts" path="/accounts" kicker="Session · MTProto" title="Акаунти Telegram">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: PANEL.dim }}>MTProto-сесія · проксі SOCKS5 · health</span>
        <div style={{ fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 10, background: PANEL.vuCta, color: '#fff' }}>
          + Додати акаунт
        </div>
      </div>
      <FocusCard label="MTProto + SOCKS5" delay={10}>
        <GlassPanel style={{ padding: 0, overflow: 'hidden' }}>
          {ACCOUNTS.map((a, i) => (
            <div
              key={a.label}
              style={{
                padding: '12px 14px',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined,
                background: i === 0 ? 'rgba(94,200,255,0.04)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>
                    {a.label} · {a.user}
                  </div>
                  <div style={{ fontSize: 11, color: PANEL.dim, marginTop: 4, fontFamily: 'ui-monospace' }}>
                    {a.phone} · {a.proxy}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: a.online ? '#34d399' : '#fbbf24',
                      border: `1px solid ${a.online ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                      background: a.online ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                      borderRadius: 999,
                      padding: '3px 8px'
                    }}
                  >
                    {a.status}
                  </span>
                  <div style={{ fontSize: 10, color: '#52525b', marginTop: 6 }}>Open Telegram · Test proxy</div>
                </div>
              </div>
            </div>
          ))}
        </GlassPanel>
      </FocusCard>
    </OutreachChrome>
  );
}
