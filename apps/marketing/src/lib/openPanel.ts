type PanelEntry = 'affiliate' | 'admin'

/** Відкрити веб-панель (партнерка / адмін оферів). */
export function openPanelFromSite(entry: PanelEntry = 'affiliate'): void {
  const webPath = entry === 'admin' ? '/app/admin/affiliate' : '/app/affiliate/offers'
  const targetUrl = `${window.location.origin}${webPath}`
  const deepLink = `trafficcloud://panel/affiliate?url=${encodeURIComponent(targetUrl)}`

  let opened = false
  const fallbackTimer = window.setTimeout(() => {
    if (!opened) window.location.assign(webPath)
  }, 1600)

  const onBlur = (): void => {
    opened = true
    window.clearTimeout(fallbackTimer)
  }
  window.addEventListener('blur', onBlur, { once: true })
  window.addEventListener('pagehide', onBlur, { once: true })

  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = deepLink
  document.body.appendChild(iframe)

  const link = document.createElement('a')
  link.href = deepLink
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()

  window.setTimeout(() => {
    iframe.remove()
    link.remove()
    window.removeEventListener('blur', onBlur)
    window.removeEventListener('pagehide', onBlur)
  }, 3000)
}
