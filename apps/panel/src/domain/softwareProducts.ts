import type { LucideIcon } from 'lucide-react'
import { Layers, Link2, Megaphone } from 'lucide-react'

export type SoftwareId = 'dm-outreach' | 'auto-parser' | 'multi-channel'

export type SoftwareStatus = 'active' | 'coming_soon'

export type SoftwareProduct = {
  id: SoftwareId
  name: string
  shortName: string
  description: string
  version: string
  status: SoftwareStatus
  icon: LucideIcon
  accent: string
  glow: string
}

export const SOFTWARE_PRODUCTS: SoftwareProduct[] = [
  {
    id: 'dm-outreach',
    name: 'DM Outreach',
    shortName: 'Outreach',
    description: 'Telegram DM-кампанії, парсер, гуманізація та аналітика в одній консолі.',
    version: '0.2.1',
    status: 'active',
    icon: Megaphone,
    accent: 'from-cyan-500/25 via-sky-400/10 to-transparent',
    glow: 'rgba(94,200,255,0.45)'
  },
  {
    id: 'auto-parser',
    name: 'Auto Parser',
    shortName: 'Parser',
    description: 'Автоматичний збір аудиторії з каналів і чатів з розширеними фільтрами.',
    version: '—',
    status: 'coming_soon',
    icon: Link2,
    accent: 'from-violet-500/20 via-indigo-400/8 to-transparent',
    glow: 'rgba(139,92,246,0.35)'
  },
  {
    id: 'multi-channel',
    name: 'Multi-Channel',
    shortName: 'Channels',
    description: 'Крос-платформові розсилки та єдиний центр керування каналами.',
    version: '—',
    status: 'coming_soon',
    icon: Layers,
    accent: 'from-emerald-500/18 via-teal-400/8 to-transparent',
    glow: 'rgba(52,211,153,0.3)'
  }
]

export function getSoftwareProduct(id: SoftwareId): SoftwareProduct | undefined {
  return SOFTWARE_PRODUCTS.find((p) => p.id === id)
}
