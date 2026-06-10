import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { FocusCard, GlassPanel } from '../../motion/FocusCard';
import { OutreachChrome } from '../OutreachChrome';
import { PANEL } from '../../../lib/panelTokens';

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
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {['Парсити всі', 'CSV', 'Mute notifications', 'Sync membership'].map((btn, i) => (
          <div
            key={btn}
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '5px 10px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: i === 0 ? PANEL.accentSoft : 'rgba(255,255,255,0.03)',
              color: i === 0 ? PANEL.accent : PANEL.muted
            }}
          >
            {btn}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SOURCES.map((s, i) => {
          const row = (
            <GlassPanel style={{ padding: '11px 13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: PANEL.dim, marginTop: 3 }}>
                    {s.kind} · {s.members} учасників
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'ui-monospace', fontSize: 12, color: PANEL.accent }}>{s.leads} лідів</div>
                  <div style={{ fontSize: 10, color: '#fbbf24', marginTop: 3 }}>{s.phase}</div>
                </div>
              </div>
              {i === 1 ? (
                <div style={{ marginTop: 8, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.06)' }}>
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
            </GlassPanel>
          );

          return i === 1 ? (
            <FocusCard key={s.title} label="Парсинг у реальному часі" delay={12}>
              {row}
            </FocusCard>
          ) : (
            <div key={s.title}>{row}</div>
          );
        })}
      </div>
    </OutreachChrome>
  );
}
