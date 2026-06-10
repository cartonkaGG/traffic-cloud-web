import { HighlightRing } from '../../motion/HighlightRing';
import { OutreachChrome } from '../OutreachChrome';

const DIALOGS = [
  { name: 'Alex K.', preview: 'Так, цікаво — напишіть деталі', unread: true, time: '12:04' },
  { name: 'Maria S.', preview: 'Дякую, вже зареєструвалась', unread: false, time: '11:51' },
  { name: 'Trader EN', preview: 'What is the pricing?', unread: true, time: '11:38' }
];

export function InboxScreen() {
  return (
    <OutreachChrome
      active="inbox"
      path="/inbox"
      kicker="Відповіді в панелі"
      title="Вхідні"
      inboxBadge={2}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 12, height: 280, position: 'relative' }}>
        <HighlightRing x={248} y={0} width={520} height={280} label="Відповідь без Telegram Desktop" delay={10} />
        <div
          style={{
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }}
        >
          {DIALOGS.map((d) => (
            <div
              key={d.name}
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: d.unread ? 'rgba(94,200,255,0.06)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{d.name}</span>
                <span style={{ fontSize: 10, color: '#52525b' }}>{d.time}</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{d.preview}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
            padding: 14,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginBottom: 12 }}>Alex K.</div>
          <div
            style={{
              alignSelf: 'flex-start',
              maxWidth: '85%',
              padding: '10px 12px',
              borderRadius: '12px 12px 12px 4px',
              background: 'rgba(255,255,255,0.06)',
              fontSize: 12,
              color: '#e2e8f0',
              marginBottom: 8
            }}
          >
            Так, цікаво — напишіть деталі
          </div>
          <div
            style={{
              alignSelf: 'flex-end',
              maxWidth: '85%',
              padding: '10px 12px',
              borderRadius: '12px 12px 4px 12px',
              background: 'rgba(94,200,255,0.15)',
              border: '1px solid rgba(94,200,255,0.25)',
              fontSize: 12,
              color: '#e0f2fe'
            }}
          >
            Супер! Ось короткий огляд продукту та умов…
          </div>
          <div
            style={{
              marginTop: 'auto',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: 11,
              color: '#64748b'
            }}
          >
            Написати відповідь… · Send
          </div>
        </div>
      </div>
    </OutreachChrome>
  );
}
