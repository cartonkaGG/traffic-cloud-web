import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { HighlightRing } from '../../motion/HighlightRing';
import { OutreachChrome } from '../OutreachChrome';

const STATS = [
  { label: 'Надіслано DM', value: '1 284', delta: '+12%', color: '#34d399' },
  { label: 'Відповіді', value: '96', delta: '+8%', color: '#5ec8ff' },
  { label: 'Акаунтів online', value: '4 / 5', delta: '', color: '#a78bfa' },
  { label: 'Конверсія', value: '7.4%', delta: '+0.6%', color: '#fbbf24' }
];

const LOGS = [
  { t: '12:04:11', msg: 'DM sent → @user_2841', color: '#34d399' },
  { t: '12:04:09', msg: 'Parsed 42 leads · @crypto_chat_ua', color: '#5ec8ff' },
  { t: '12:03:58', msg: 'Campaign Crypto UA · running', color: '#94a3b8' },
  { t: '12:03:41', msg: 'Inbox reply from @lead_992', color: '#fbbf24' }
];

export function DashboardScreen() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logOpacity = interpolate(frame, [0.5 * fps, 1.2 * fps], [0.3, 1], { extrapolateRight: 'clamp' });

  return (
    <OutreachChrome active="overview" path="/" kicker="Огляд workspace" title="Дашборд">
      <p style={{ margin: '0 0 14px', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
        Додайте Telegram-акаунт, розпарсіть чат і запустіть розсилку. Цифри оновлюються після кожного DM.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14, position: 'relative' }}>
        <HighlightRing x={0} y={-4} width={760} height={72} label="Метрики workspace" />
        {STATS.map((s) => (
          <div
            key={s.label}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)'
            }}
          >
            <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginTop: 4, fontFamily: 'ui-monospace' }}>
              {s.value}
            </div>
            {s.delta ? <div style={{ fontSize: 10, color: '#34d399', marginTop: 2 }}>{s.delta}</div> : null}
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
          fontSize: 10,
          opacity: logOpacity,
          position: 'relative'
        }}
      >
        <HighlightRing x={-4} y={-4} width={788} height={108} label="WebSocket live log" delay={14} />
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8, fontFamily: 'system-ui' }}>
          Live log · WebSocket
        </div>
        {LOGS.map((l) => (
          <div key={l.t} style={{ color: l.color, marginTop: 4 }}>
            [{l.t}] {l.msg}
          </div>
        ))}
      </div>
    </OutreachChrome>
  );
}
