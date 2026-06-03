/** Рядок виду host:port:user:pass або з префіксом http(s):// / socks5:// */

export type ParsedProxyConnection = {
  host: string
  port: number
  username: string | null
  password: string | null
  /** Якщо задано префікс у рядку — збігається з вибраним протоколом або перевизначає його */
  protocol?: 'http' | 'socks5'
}

export function parseProxyConnectionLine(line: string): ParsedProxyConnection | null {
  let s = line.trim()
  if (!s) return null

  let protocol: 'http' | 'socks5' | undefined
  if (/^socks5:\/\//i.test(s)) {
    protocol = 'socks5'
    s = s.replace(/^socks5:\/\//i, '')
  } else if (/^https?:\/\//i.test(s)) {
    protocol = 'http'
    s = s.replace(/^https?:\/\//i, '')
  }

  const parts = s.split(':')
  if (parts.length >= 4) {
    const host = parts[0]!.trim()
    const port = Number(parts[1])
    const username = parts[2]!.trim()
    const password = parts.slice(3).join(':').trim()
    if (!host || !Number.isFinite(port) || port < 1 || port > 65535) return null
    return {
      host,
      port: Math.floor(port),
      username: username || null,
      password: password || null,
      protocol
    }
  }

  if (parts.length === 2) {
    const host = parts[0]!.trim()
    const port = Number(parts[1])
    if (!host || !Number.isFinite(port) || port < 1 || port > 65535) return null
    return {
      host,
      port: Math.floor(port),
      username: null,
      password: null,
      protocol
    }
  }

  return null
}
