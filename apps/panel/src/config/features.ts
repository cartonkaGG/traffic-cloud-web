/**
 * Режим панелі на Vercel: лише залив трафіку + адмін оферів (без Hub і підписок).
 * Постав `affiliateOnlyMode: false`, щоб повернути DM Outreach / Hub.
 */
export const FEATURES = {
  affiliateOnlyMode: true
} as const
