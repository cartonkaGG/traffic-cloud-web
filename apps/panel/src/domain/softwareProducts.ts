import type { LucideIcon } from 'lucide-react'

import { Clapperboard, Megaphone } from 'lucide-react'



export type SoftwareId = 'dm-outreach' | 'video-uniquify'



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

    id: 'video-uniquify',

    name: 'Video Uniquify',

    shortName: 'Uniquify',

    description:

      'Пакетна унікалізація вертикальних відео у браузері — Pro якість, локально на вашому ПК.',

    version: '0.1.0',

    status: 'active',

    icon: Clapperboard,

    accent: 'from-rose-500/20 via-orange-400/10 to-transparent',

    glow: 'rgba(251,113,133,0.38)'

  }

]



export function getSoftwareProduct(id: SoftwareId): SoftwareProduct | undefined {

  return SOFTWARE_PRODUCTS.find((p) => p.id === id)

}


