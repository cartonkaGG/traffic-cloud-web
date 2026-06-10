import { OutreachChrome } from '../OutreachChrome';
import { PromoAccountCard, PromoLiveLog, PromoStatCard } from '../PromoUi';
import { PROMO_ACCOUNT, PROMO_STATS } from '../../../lib/promoMocks';
export function DashboardScreen() {
  return (
    <OutreachChrome active="overview" kicker="Головна панель" title="Огляд">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <p style={{ margin: 0, maxWidth: 520, fontSize: 11, lineHeight: 1.55, color: '#71717a' }}>
          Додайте Telegram-акаунт, розпарсіть чат і запустіть розсилку. Цифри нижче оновлюються після кожного
          надісланого DM.
        </p>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#a7f3d0',
            border: '1px solid rgba(52,211,153,0.3)',
            background: 'rgba(52,211,153,0.1)',
            borderRadius: 999,
            padding: '4px 10px'
          }}
        >
          API · online
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
        {PROMO_STATS.map((s) => (
          <PromoStatCard key={s.label} {...s} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 10, minHeight: 250 }}>
        <PromoLiveLog />
        <div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#71717a' }}>
              Telegram
            </div>
            <div style={{ marginTop: 2, fontSize: 14, fontWeight: 600, color: '#fff' }}>Ваші акаунти</div>
          </div>
          <PromoAccountCard {...PROMO_ACCOUNT} compact />
        </div>
      </div>
    </OutreachChrome>
  );
}
