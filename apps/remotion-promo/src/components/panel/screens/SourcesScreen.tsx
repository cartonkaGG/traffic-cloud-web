import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { HighlightRing } from '../../motion/HighlightRing';
import { OutreachChrome } from '../OutreachChrome';

const SOURCES = [
  { title: '@crypto_chat_ua', kind: 'Група', members: '12 400', leads: 842, phase: 'Готово' },
  { title: 'Fitness RU Channel', kind: 'Канал', members: '8 900', leads: 316, phase: 'Збір учасників' },
  { title: 't.me/+trading_signals', kind: 'Invite link', members: '21 100', leads: 1204, phase: 'Готово' }
];

export function SourcesScreen() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const parsePct = interpolate(frame, [0.4 * fps, 2.2 * fps], [18, 74], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <OutreachChrome active="sources" path="/sources" kicker="Парсер · аудиторія" title="Джерела (Парсер)">
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {['Парсити всі', 'CSV', 'Mute notifications', 'Sync membership'].map((btn, i) => (
          <div
            key={btn}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: i === 0 ? 'rgba(94,200,255,0.12)' : 'rgba(255,255,255,0.03)',
              color: i === 0 ? '#5ec8ff' : '#94a3b8'
            }}
          >
            {btn}
          </div>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <HighlightRing x={0} y={98} width={780} height={56} label="Парсинг у реальному часі" delay={12} />
        {SOURCES.map((s, i) => (
          <div
            key={s.title}
            style={{
              marginBottom: 10,
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{s.title}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                  {s.kind} · {s.members} учасників
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'ui-monospace', fontSize: 13, color: '#5ec8ff' }}>{s.leads} лідів</div>
                <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 4 }}>{s.phase}</div>
              </div>
            </div>
            {i === 1 ? (
              <div style={{ marginTop: 10, height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.06)' }}>
                <div
                  style={{
                    width: `${parsePct}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #0ea5e9, #5ec8ff)'
                  }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </OutreachChrome>
  );
}
