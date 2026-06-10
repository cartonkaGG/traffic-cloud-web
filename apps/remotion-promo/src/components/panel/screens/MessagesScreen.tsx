import { HighlightRing } from '../../motion/HighlightRing';
import { OutreachChrome } from '../OutreachChrome';

const TEMPLATES = [
  { title: 'Crypto intro UA', active: true, preview: 'Привіт {name}! Бачив твій інтерес до крипто — коротке питання…' },
  { title: 'Fitness follow-up', active: false, preview: 'Доброго дня, {name}. Пишу щодо програми тренувань…' },
  { title: 'Trading soft CTA', active: false, preview: 'Hi {name}, we run signals for {geo} traders — interested?' }
];

export function MessagesScreen() {
  return (
    <OutreachChrome
      active="campaigns"
      path="/messages"
      kicker="Розсилка · тексти DM"
      title="Шаблони повідомлень"
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {['Шаблони', 'Кампанії', 'Фільтри'].map((tab, i) => (
          <div
            key={tab}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 8,
              border: i === 0 ? '1px solid rgba(94,200,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
              background: i === 0 ? 'rgba(94,200,255,0.12)' : 'transparent',
              color: i === 0 ? '#5ec8ff' : '#64748b'
            }}
          >
            {tab}
          </div>
        ))}
      </div>
      <div style={{ position: 'relative' }}>
        <HighlightRing x={0} y={0} width={780} height={88} label="Змінні {name} · {geo}" />
        {TEMPLATES.map((t, i) => (
          <div
            key={t.title}
            style={{
              marginBottom: 10,
              padding: '12px 14px',
              borderRadius: 12,
              border: t.active ? '1px solid rgba(94,200,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
              background: t.active ? 'rgba(94,200,255,0.06)' : 'rgba(255,255,255,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {t.active ? <span style={{ color: '#fbbf24', fontSize: 14 }}>★</span> : null}
              <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{t.title}</span>
              {t.active ? (
                <span style={{ fontSize: 9, color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                  Активний
                </span>
              ) : null}
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#94a3b8', fontStyle: i === 0 ? 'normal' : 'italic' }}>
              {t.preview}
            </p>
          </div>
        ))}
        <div style={{ marginTop: 12, fontSize: 11, color: '#52525b' }}>
          Редагування зберігається як нова копія шаблону — без перезапису старих.
        </div>
      </div>
    </OutreachChrome>
  );
}
