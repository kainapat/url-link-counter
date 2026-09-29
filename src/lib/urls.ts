export type UrlItem = {
  raw: string
  normalized: string
  domain: string
  valid: boolean
  duplicate: boolean
}

export const URL_REGEX = /https?:\/\/[^\s<>"'`]+/gi

const ALWAYS_STRIP = new Set(['.', ',', ';', ':', '!', '?'])
const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' }

function countChar(value: string, char: string): number {
  let n = 0
  for (const c of value) if (c === char) n += 1
  return n
}

/**
 * Balanced-aware trailing punctuation strip (Q5).
 * - Strips trailing .,;:!? unconditionally (wrappers, never part of a URL end).
 * - Strips a trailing closer (), [], {} only when it is unbalanced,
 *   i.e. closers outnumber openers in the remaining string.
 * - Preserves query parameters and fragments verbatim.
 * - No decode/encode, no lowercasing, no slash-trimming (Q2).
 */
export function cleanUrl(value: string): string {
  let url = value

  for (;;) {
    if (!url) return url
    const last = url[url.length - 1]

    if (ALWAYS_STRIP.has(last)) {
      url = url.slice(0, -1)
      continue
    }

    const opener = PAIRS[last]
    if (opener) {
      const body = url.slice(0, -1)
      if (countChar(body, opener) < countChar(body, last) + 1) {
        url = body
        continue
      }
      return url
    }

    return url
  }
}

export function parseUrls(input: string): UrlItem[] {
  const rawUrls = input.match(URL_REGEX) ?? []
  const seen = new Map<string, number>()

  const base = rawUrls.map((raw) => {
    const normalized = cleanUrl(raw)
    let domain = 'Unknown'
    let valid = true

    try {
      const parsed = new URL(normalized)
      domain = parsed.hostname.replace(/^www\./, '')
      if (!domain) {
        valid = false
        domain = 'Unknown'
      }
    } catch {
      valid = false
    }

    seen.set(normalized, (seen.get(normalized) ?? 0) + 1)

    return { raw, normalized, domain, valid, duplicate: false }
  })

  return base.map((item) => ({
    ...item,
    duplicate: (seen.get(item.normalized) ?? 0) > 1,
  }))
}

export function countDomains(urls: Pick<UrlItem, 'domain' | 'valid'>[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const u of urls) {
    if (!u.valid || u.domain === 'Unknown') continue
    counts.set(u.domain, (counts.get(u.domain) ?? 0) + 1)
  }
  return new Map([...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])))
}
