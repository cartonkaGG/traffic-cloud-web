import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { FocusCard, GlassPanel } from '../../motion/FocusCard';
import { OutreachChrome } from '../OutreachChrome';
import { PANEL } from '../../../lib/panelTokens';

const STATS = [
  { label: 'Надіслано DM', value: '1 284', delta: '+12%', color: '#34d399' },
  { label: 'Відповіді', value: '96', delta: '+8%', color: '#5ec8ff' },
  { label: 'Акаунтів online', value: '4 / 5', delta: '', color: '#a78bfa' },
  { label: 'Конверсія', value: '7.4%', delta: '+0.6%', color: '#fbbf24' }
];

const LOGS = [
  { t: '12:04:11', msg: 'DM sent → @user_2841', color: '#34d399' },
  { t: '12:04:09', msg: 'Parsed 42 leads · @crypto_chat_ua', color: '#5ec8ff' },
  { t: '12:03:58', msg: 'Campaign Crypto UA · running', color: '#94a3b8' }
];

export function DashboardScreen() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logOpacity = interpolate(frame, [0.5 * fps, 1.2 * fps], [0.4, 1], { extrapolateRight: 'clamp' });

  return (
    <OutreachChrome active="overview" path="/" kicker="Огляд workspace" title="Дашборд">
      <p style={{ margin: '0 0 12px', fontSize: 11, color: PANEL.dim, lineHeight: 1.5 }}>
        Додайте Telegram-акаунт, розпарсіть чат і запустіть розсилку.
      </p>
      <FocusCard label="Метрики workspace" delay={8} style={{ marginBottom: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {STATS.map((s) => (
            <GlassPanel key={s.label} style={{ padding: '9px 11px' }}>
              <div style={{ fontSize: 8, color: PANEL.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {s.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color, marginTop: 3, fontFamily: 'ui-monospace' }}>
                {s.value}
              </div>
              {s.delta ? <div style={{ fontSize: 9, color: '#34d399', marginTop: 2 }}>{s.delta}</div> : null}
            </GlassPanel>
          ))}
        </div>
      </FocusCard>
      <FocusCard label="WebSocket live log" delay={20}>
        <GlassPanel
          style={{
            padding: 11,
            fontFamily: 'ui-monospace',
            fontSize: 10,
            opacity: logOpacity
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', marginBottom: 6, fontFamily: 'system-ui' }}>
            Live log · WebSocket
          </div>
          {LOGS.map((l) => (
            <div key={l.t} style={{ color: l.color, marginTop: 3 }}>
              [{l.t}] {l.msg}
            </div>
          ))}
        </GlassPanel>
      </FocusCard>
    </OutreachChrome>
  );
}
