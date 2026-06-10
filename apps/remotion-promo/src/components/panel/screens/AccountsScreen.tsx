import { FocusCard } from '../../motion/FocusCard';
import { OutreachChrome } from '../OutreachChrome';
import { PromoAccountCard } from '../PromoUi';
import { PROMO_ACCOUNTS_GRID } from '../../../lib/promoMocks';
import { PANEL } from '../../../lib/panelTokens';

export function AccountsScreen() {
  return (
    <OutreachChrome active="accounts" kicker="Session · MTProto" title="Акаунти Telegram">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: PANEL.dim }}>
          MTProto-сесія · проксі SOCKS5 · health · фільтри
        </span>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '7px 12px',
            borderRadius: 10,
            background: PANEL.vuCta,
            color: '#fff',
            boxShadow: PANEL.vuCtaShadow
          }}
        >
          + Додати акаунт
        </div>
      </div>

      <FocusCard label="Акаунти з кнопками DM / Web / спам" delay={8}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {PROMO_ACCOUNTS_GRID.map((a) => (
            <PromoAccountCard key={a.username} {...a} />
          ))}
        </div>
      </FocusCard>
    </OutreachChrome>
  );
}
