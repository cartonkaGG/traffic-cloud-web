export type PublicBillingPlan = {
  monthlyPriceUsd: number
  compareAtPriceUsd?: number | null
  currency: string
  planTitle: string
}

function apiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (fromEnv?.trim()) return fromEnv.trim().replace(/\/$/, '')
  return 'http://127.0.0.1:8787'
}

export async function fetchPublicBillingPlan(): Promise<PublicBillingPlan> {
  const res = await fetch(`${apiBase()}/v1/billing/plan`, {
    headers: { Accept: 'application/json' }
  })
  if (!res.ok) {
    throw new Error(`billing_plan_${res.status}`)
  }
  return res.json() as Promise<PublicBillingPlan>
}
