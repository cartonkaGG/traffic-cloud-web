import type { SoftwareId } from '@/domain/softwareProducts'

const SELECTED_SOFTWARE_KEY = 'traffic-cloud-selected-software'

export function getSelectedSoftware(): SoftwareId | null {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem(SELECTED_SOFTWARE_KEY)
  if (raw === 'dm-outreach' || raw === 'auto-parser' || raw === 'multi-channel') return raw
  return null
}

export function setSelectedSoftware(id: SoftwareId): void {
  window.sessionStorage.setItem(SELECTED_SOFTWARE_KEY, id)
}

export function clearSelectedSoftware(): void {
  window.sessionStorage.removeItem(SELECTED_SOFTWARE_KEY)
}
