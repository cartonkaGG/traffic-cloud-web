/** Стан форми «Кампанії» (розсилка кількох акаунтів), щоб не губився при переході на інші вкладки. */

const STORAGE_KEY = 'traffic-cloud-campaigns-ui-v1'

export type CampaignsUiPersisted = {
  bulkSourceId: string
  bulkMax: string
  bulkDelay: string
  bulkSelectedIds: string[]
}

type Root = Record<string, CampaignsUiPersisted>

function readRoot(): Root {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const p = JSON.parse(raw) as Root
    return p && typeof p === 'object' ? p : {}
  } catch {
    return {}
  }
}

function writeRoot(root: Root): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(root))
  } catch {
    /* ignore */
  }
}

export function loadCampaignsUi(workspaceId: string | null): Partial<CampaignsUiPersisted> {
  if (!workspaceId) return {}
  const row = readRoot()[workspaceId]
  if (!row || typeof row !== 'object') return {}
  return {
    bulkSourceId: typeof row.bulkSourceId === 'string' ? row.bulkSourceId : undefined,
    bulkMax: typeof row.bulkMax === 'string' ? row.bulkMax : undefined,
    bulkDelay: typeof row.bulkDelay === 'string' ? row.bulkDelay : undefined,
    bulkSelectedIds: Array.isArray(row.bulkSelectedIds)
      ? row.bulkSelectedIds.filter((x): x is string => typeof x === 'string')
      : undefined
  }
}

export function saveCampaignsUi(workspaceId: string | null, state: CampaignsUiPersisted): void {
  if (!workspaceId) return
  const root = readRoot()
  root[workspaceId] = {
    bulkSourceId: state.bulkSourceId,
    bulkMax: state.bulkMax,
    bulkDelay: state.bulkDelay,
    bulkSelectedIds: [...state.bulkSelectedIds]
  }
  writeRoot(root)
}
