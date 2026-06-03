/**
 * Одна итерация: находит первый блок `{a|b|c}` и заменяет случайным вариантом.
 * Блоки без `|` (например `{username}`) пропускает.
 */
export function expandOneSpintax(input: string): string | null {
  const re = /\{([^{}]*)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(input))) {
    const inner = m[1]
    if (inner.includes('|')) {
      const options = inner.split('|').map((x) => x.trim())
      const pick = options[Math.floor(Math.random() * options.length)] ?? ''
      return input.slice(0, m.index) + pick + input.slice(m.index + m[0].length)
    }
  }
  return null
}

export function expandSpintaxFull(template: string): string {
  let s = template
  for (let i = 0; i < 10_000; i++) {
    const next = expandOneSpintax(s)
    if (!next) break
    s = next
  }
  return s
}

const VAR_RE = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g

export type TemplateVariables = Record<string, string>

export function applyVariables(text: string, vars: TemplateVariables): string {
  return text.replace(VAR_RE, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : `{${key}}`
  )
}

/** Полный пайплайн: spintax → переменные. */
export function renderMessageTemplate(template: string, vars: TemplateVariables): string {
  const spun = expandSpintaxFull(template)
  return applyVariables(spun, vars)
}
