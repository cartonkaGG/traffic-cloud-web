import { unzipSync } from 'fflate'
import { getAccessToken } from '@/lib/authSession'
import { getApiBaseUrl } from '@/lib/settings'

export type ServerUniquifyStatus = {
  available: boolean
  maxFileMb: number
  maxCopies: number
}

export type ServerUniquifyJob = {
  jobId: string
  status: 'queued' | 'processing' | 'done' | 'failed'
  progress: number
  label: string
  error: string | null
  copies: number
}

function authHeaders(): HeadersInit {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseApiError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { hint?: string; error?: string }
    return data.hint ?? data.error ?? `HTTP ${res.status}`
  } catch {
    return `HTTP ${res.status}`
  }
}

export async function fetchServerUniquifyStatus(): Promise<ServerUniquifyStatus> {
  const res = await fetch(`${getApiBaseUrl()}/v1/video/uniquify/status`, {
    headers: { ...authHeaders(), Accept: 'application/json' }
  })
  if (!res.ok) throw new Error(await parseApiError(res))
  return res.json() as Promise<ServerUniquifyStatus>
}

export async function startServerUniquifyJob(file: File, copies: number): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  body.append('copies', String(copies))
  const res = await fetch(`${getApiBaseUrl()}/v1/video/uniquify/jobs`, {
    method: 'POST',
    headers: authHeaders(),
    body
  })
  if (!res.ok) throw new Error(await parseApiError(res))
  const data = (await res.json()) as { jobId: string }
  return data.jobId
}

export async function pollServerUniquifyJob(jobId: string): Promise<ServerUniquifyJob> {
  const res = await fetch(`${getApiBaseUrl()}/v1/video/uniquify/jobs/${jobId}`, {
    headers: { ...authHeaders(), Accept: 'application/json' }
  })
  if (!res.ok) throw new Error(await parseApiError(res))
  return res.json() as Promise<ServerUniquifyJob>
}

export async function downloadServerUniquifyZip(jobId: string): Promise<Blob> {
  const res = await fetch(`${getApiBaseUrl()}/v1/video/uniquify/jobs/${jobId}/zip`, {
    headers: authHeaders()
  })
  if (!res.ok) throw new Error(await parseApiError(res))
  return res.blob()
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runServerUniquify(params: {
  file: File
  copies: number
  onProgress: (label: string, pct: number) => void
}): Promise<{ name: string; blob: Blob }[]> {
  const jobId = await startServerUniquifyJob(params.file, params.copies)
  params.onProgress('Завантаження на сервер…', 5)

  while (true) {
    const job = await pollServerUniquifyJob(jobId)
    params.onProgress(job.label, Math.max(5, job.progress))
    if (job.status === 'failed') {
      throw new Error(job.error ?? 'Серверна обробка не вдалася.')
    }
    if (job.status === 'done') break
    await sleep(1500)
  }

  params.onProgress('Завантаження результатів…', 99)
  const zipBlob = await downloadServerUniquifyZip(jobId)
  const entries = unzipSync(new Uint8Array(await zipBlob.arrayBuffer()))
  const results: { name: string; blob: Blob }[] = []
  for (const [name, bytes] of Object.entries(entries)) {
    if (name.endsWith('/')) continue
    const base = name.split('/').pop() ?? name
    results.push({ name: base, blob: new Blob([bytes], { type: 'video/mp4' }) })
  }
  results.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  if (results.length === 0) throw new Error('Сервер повернув порожній архів.')
  return results
}
