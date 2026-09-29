export type UrlItem = {
  raw: string
  normalized: string
  domain: string
  valid: boolean
  duplicate: boolean
}

type Span = {
  /** Matched text that produced the URL (markdown source, autolink, or plain match). */
  raw: string
  /** URL after wrapper-syntax cleaning. Query/fragment preserved verbatim. */
  normalized: string
  /** Source range consumed by this match — plain-URL extraction must skip it. */
  start: number
  end: number
}

export const URL_REGEX = /https?:\/\/[^\s<>"'`]+/gi
const AUTOLINK_REGEX = /<(https?:\/\/[^<>\s]+)>/gi

/**
 * Punctuation stripped unconditionally from the end of a URL.
 * Deliberately NOT including `; : ! ?` — those can be a real part of a URL
 * (query strings, fragments, matrix params). Only `.,'"` and a trailing
 * markdown-escape backslash are safe wrappers.
 */
const ALWAYS_STRIP = new Set(['.', ',', '"', "'", '\\'])
const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' }

function countChar(value: string, char: string): number {
  let n = 0
  for (const c of value) if (c === char) n += 1
  return n
}

/**
 * Balanced-aware trailing wrapper strip.
 * - Strips trailing `. , " ' \` unconditionally.
 * - Strips a trailing closer `) ] }` only when unbalanced in the remainder,
 *   so `…/Link_(film)` and `/path_(test)` survive while prose wrappers like
 *   `(https://example.com)` and `https://example.com).` are cleaned.
 * - Never touches query parameters, fragments, casing, slashes, or scheme.
 * - No decode/encode.
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

function overlaps(spans: Span[], start: number, end: number): boolean {
  return spans.some((s) => start < s.end && end > s.start)
}

/**
 * Scan `[label](destination)` links (including escaped/numbered-list forms
 * like `1\. [label](dest)\`). Only `destination` is counted — a URL in the
 * label is consumed, never double-counted.
 */
export function extractMarkdownLinks(input: string): Span[] {
  const spans: Span[] = []
  let i = 0

  while (i < input.length) {
    const open = input.indexOf('[', i)
    if (open === -1) break

    // Find closing `]` honoring `\]` escapes.
    let j = open + 1
    let closeBracket = -1
    while (j < input.length) {
      const c = input[j]
      if (c === '\\') {
        j += 2
        continue
      }
      if (c === ']') {
        closeBracket = j
        break
      }
      if (c === '\n') break
      j += 1
    }
    if (closeBracket === -1 || input[closeBracket + 1] !== '(') {
      i = open + 1
      continue
    }

    // Parse destination with balanced parens, honoring `\` escapes.
    let k = closeBracket + 2
    let depth = 1
    let destEnd = -1
    let aborted = false
    while (k < input.length) {
      const c = input[k]
      if (c === '\\') {
        k += 2
        continue
      }
      if (c === '(') depth += 1
      else if (c === ')') {
        depth -= 1
        if (depth === 0) {
          destEnd = k
          break
        }
      } else if (c === '\n' || c === ' ') {
        aborted = true
        break
      }
      k += 1
    }
    if (aborted || destEnd === -1) {
      i = open + 1
      continue
    }

    const dest = input.slice(closeBracket + 2, destEnd).trim().replace(/^<|>$/g, '')
    if (/^https?:\/\//i.test(dest)) {
      const normalized = cleanUrl(dest)
      if (normalized) {
        spans.push({ raw: input.slice(open, destEnd + 1), normalized, start: open, end: destEnd + 1 })
      }
    }
    i = destEnd + 1
  }

  return spans
}

export function extractAutolinks(input: string, consumed: Span[]): Span[] {
  const spans: Span[] = []
  AUTOLINK_REGEX.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = AUTOLINK_REGEX.exec(input)) !== null) {
    const start = m.index
    const end = start + m[0].length
    if (overlaps(consumed, start, end)) continue
    const normalized = cleanUrl(m[1])
    if (normalized) spans.push({ raw: m[0], normalized, start, end })
  }
  return spans
}

export function extractPlainUrls(input: string, consumed: Span[]): Span[] {
  const spans: Span[] = []
  URL_REGEX.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = URL_REGEX.exec(input)) !== null) {
    const start = m.index
    const end = start + m[0].length
    if (overlaps(consumed, start, end)) continue
    const normalized = cleanUrl(m[0])
    if (normalized) spans.push({ raw: m[0], normalized, start, end })
  }
  return spans
}

/**
 * Pipeline: markdown links → autolinks → plain URLs (skipping consumed
 * ranges) → validate → duplicate analysis. Results stay in document order.
 */
export function parseUrls(input: string): UrlItem[] {
  const md = extractMarkdownLinks(input)
  const auto = extractAutolinks(input, md)
  const plain = extractPlainUrls(input, [...md, ...auto])
  const ordered = [...md, ...auto, ...plain].sort((a, b) => a.start - b.start)

  const seen = new Map<string, number>()
  const base = ordered.map((span) => {
    let domain = 'Unknown'
    let valid = true

    try {
      const parsed = new URL(span.normalized)
      domain = parsed.hostname.replace(/^www\./, '')
      if (!domain) {
        valid = false
        domain = 'Unknown'
      }
    } catch {
      valid = false
    }

    seen.set(span.normalized, (seen.get(span.normalized) ?? 0) + 1)

    return { raw: span.raw, normalized: span.normalized, domain, valid, duplicate: false }
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
