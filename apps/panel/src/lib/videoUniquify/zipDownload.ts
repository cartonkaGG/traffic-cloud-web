import { zipSync } from 'fflate'

export async function buildZipArchive(
  items: { name: string; blob: Blob }[],
  zipName: string
): Promise<void> {
  const files: Record<string, Uint8Array> = {}
  for (const item of items) {
    files[item.name] = new Uint8Array(await item.blob.arrayBuffer())
  }
  const zipped = zipSync(files)
  const blob = new Blob([zipped], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = zipName
  a.click()
  URL.revokeObjectURL(url)
}
