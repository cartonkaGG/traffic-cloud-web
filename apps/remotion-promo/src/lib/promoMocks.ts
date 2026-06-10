/** Static demo data aligned with production panel UI (screenshots). */

export const PROMO_USER = {
  name: 'kobanarseniy',
  email: 'kobanarseniy@icloud.com',
  initials: 'KO'
} as const;

export const PROMO_STATS = [
  { label: 'Надіслано (24 год)', value: '4', delta: '', icon: 'radio' as const },
  { label: 'Всього DM', value: '0', delta: '', icon: 'mouse' as const },
  { label: 'Помилки', value: '0', delta: '', icon: 'trend' as const },
  { label: 'Активні акаунти', value: '1', delta: '', icon: 'chart' as const }
];

export const PROMO_ACCOUNT = {
  label: 'aghanimkycservice',
  username: 'aghanimkycservice',
  phone: '+380•••••••••',
  status: 'active' as const,
  statusLabel: 'Активний',
  lastActivity: '07.06.2025, 14:32',
  sentToday: 4,
  proxy: '138.249.154.109:64981 (SOCKS5 MTProto)',
  initials: 'AG'
};

export const PROMO_ACCOUNTS_GRID = [
  PROMO_ACCOUNT,
  {
    label: 'Lead UA #1',
    username: 'lead_bot_01',
    phone: '+380•••••421',
    status: 'active' as const,
    statusLabel: 'Активний',
    lastActivity: '07.06.2025, 12:10',
    sentToday: 12,
    proxy: 'Warsaw · SOCKS5',
    initials: 'LU'
  },
  {
    label: 'Traffic RU',
    username: 'traffic_ru',
    phone: '+7••••••882',
    status: 'warming' as const,
    statusLabel: 'Прогрів',
    lastActivity: '06.06.2025, 22:44',
    sentToday: 0,
    proxy: 'Berlin · SOCKS5',
    initials: 'TR'
  }
];

export const PROMO_LOGS = [
  { kind: 'message_sent', time: '14:32:08', text: 'DM надіслано · @user_crypto_01' },
  { kind: 'inbox_message', time: '14:31:52', text: 'Вхідні · нова відповідь від @lead_ua' },
  { kind: 'default', time: '14:30:11', text: 'Парсер · @crypto_chat_ua · +42 ліди' }
];
