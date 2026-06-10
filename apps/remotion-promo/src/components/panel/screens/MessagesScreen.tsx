import { FocusCard, GlassPanel } from '../../motion/FocusCard';
import { OutreachChrome } from '../OutreachChrome';
import { PANEL } from '../../../lib/panelTokens';

const TEMPLATES = [
  { title: 'Crypto intro UA', active: true, preview: 'Привіт {name}! Бачив твій інтерес до крипто — коротке питання…' },
  { title: 'Fitness follow-up', active: false, preview: 'Доброго дня, {name}. Пишу щодо програми тренувань…' }
];

export function MessagesScreen() {
  return (
    <OutreachChrome active="campaigns" kicker="Розсилка · тексти DM" title="Шаблони">
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {['Шаблони', 'Кампанії', 'Фільтри'].map((tab, i) => (
          <div
            key={tab}
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: '5px 10px',
              borderRadius: 8,
              border: i === 0 ? `1px solid ${PANEL.accentBorder}` : '1px solid rgba(255,255,255,0.08)',
              background: i === 0 ? PANEL.accentSoft : 'transparent',
              color: i === 0 ? PANEL.accent : PANEL.dim
            }}
          >
            {tab}
          </div>
        ))}
      </div>
      <FocusCard label="Змінні {name} · {geo}" delay={10}>
        <GlassPanel style={{ padding: 0, overflow: 'hidden' }}>
          {TEMPLATES.map((t, i) => (
            <div
              key={t.title}
              style={{
                padding: '11px 13px',
                borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined,
                background: t.active ? 'rgba(94,200,255,0.04)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {t.active ? <span style={{ color: '#fbbf24' }}>★</span> : null}
                <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{t.title}</span>
                {t.active ? (
                  <span style={{ fontSize: 9, color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>Активний</span>
                ) : null}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: PANEL.muted }}>{t.preview}</p>
            </div>
          ))}
        </GlassPanel>
      </FocusCard>
      <p style={{ marginTop: 10, fontSize: 10, color: '#52525b' }}>
        Редагування → нова копія шаблону, без перезапису.
      </p>
    </OutreachChrome>
  );
}
