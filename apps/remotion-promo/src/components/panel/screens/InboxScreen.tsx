import { FocusCard, GlassPanel } from '../../motion/FocusCard';
import { OutreachChrome } from '../OutreachChrome';
import { PANEL } from '../../../lib/panelTokens';

const DIALOGS = [
  { name: 'Alex K.', preview: 'Так, цікаво — напишіть деталі', unread: true, time: '12:04' },
  { name: 'Maria S.', preview: 'Дякую, вже зареєструвалась', unread: false, time: '11:51' },
  { name: 'Trader EN', preview: 'What is the pricing?', unread: true, time: '11:38' }
];

export function InboxScreen() {
  return (
    <OutreachChrome active="inbox" path="/inbox" kicker="Відповіді в панелі" title="Вхідні" inboxBadge={2}>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 10, height: 270 }}>
        <GlassPanel style={{ padding: 0, overflow: 'hidden' }}>
          {DIALOGS.map((d, i) => (
            <div
              key={d.name}
              style={{
                padding: '9px 11px',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined,
                background: d.unread ? 'rgba(94,200,255,0.06)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{d.name}</span>
                <span style={{ fontSize: 9, color: '#52525b' }}>{d.time}</span>
              </div>
              <div style={{ fontSize: 10, color: PANEL.dim, marginTop: 3 }}>{d.preview}</div>
            </div>
          ))}
        </GlassPanel>
        <FocusCard label="Відповідь у панелі" delay={12}>
          <GlassPanel style={{ padding: 12, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: PANEL.text, marginBottom: 10 }}>Alex K.</div>
            <div
              style={{
                alignSelf: 'flex-start',
                maxWidth: '88%',
                padding: '8px 11px',
                borderRadius: '11px 11px 11px 4px',
                background: 'rgba(255,255,255,0.06)',
                fontSize: 11,
                color: '#e2e8f0',
                marginBottom: 6
              }}
            >
              Так, цікаво — напишіть деталі
            </div>
            <div
              style={{
                alignSelf: 'flex-end',
                maxWidth: '88%',
                padding: '8px 11px',
                borderRadius: '11px 11px 4px 11px',
                background: PANEL.accentSoft,
                border: `1px solid ${PANEL.accentBorder}`,
                fontSize: 11,
                color: '#e0f2fe'
              }}
            >
              Супер! Ось короткий огляд продукту…
            </div>
            <div
              style={{
                marginTop: 'auto',
                padding: '8px 10px',
                borderRadius: 9,
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 10,
                color: PANEL.dim
              }}
            >
              Написати відповідь…
            </div>
          </GlassPanel>
        </FocusCard>
      </div>
    </OutreachChrome>
  );
}
