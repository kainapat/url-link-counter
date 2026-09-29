import { describe, expect, it } from 'vitest'
import { cleanUrl, parseUrls } from './urls'

const normalized = (text: string) => parseUrls(text).map((u) => u.normalized)

describe('plain urls', () => {
  it('extracts a bare url', () => {
    expect(normalized('https://example.com')).toEqual(['https://example.com'])
  })

  it('extracts a url inside prose', () => {
    expect(normalized('เว็บไซต์นี้ https://example.com ดูได้เลย')).toEqual(['https://example.com'])
  })

  it('ignores scheme-less hosts', () => {
    expect(parseUrls('visit www.example.com today')).toHaveLength(0)
  })

  it('flags unparsable http urls as invalid without guessing a scheme', () => {
    const [item] = parseUrls('bad https://example.com:abc ok')
    expect(item.valid).toBe(false)
  })
})

describe('markdown links (destination only)', () => {
  it('[Example](url) counts one url', () => {
    expect(normalized('[Example](https://example.com)')).toEqual(['https://example.com'])
  })

  it('[url](url) counts one url, not two', () => {
    expect(normalized('[https://example.com](https://example.com)')).toEqual(['https://example.com'])
  })

  it('[a](b) counts only the destination', () => {
    expect(normalized('[https://a.com](https://b.com)')).toEqual(['https://b.com'])
  })

  it('[Google](url) counts the destination', () => {
    expect(normalized('[Google](https://google.com)')).toEqual(['https://google.com'])
  })

  it('handles numbered markdown lists', () => {
    expect(normalized('1. [Example](https://example.com)\n2. [Google](https://google.com)')).toEqual([
      'https://example.com',
      'https://google.com',
    ])
  })

  it('handles the escaped manga list as 3 unique urls', () => {
    const input =
      '1\\. [https://ntrnaja.com/manga/m-pz5bcod9/?chapter=-54](https://ntrnaja.com/manga/m-pz5bcod9/?chapter=-54)\\\n' +
      '2\\. [https://readtoon.com/content/gsjmdkxp/36](https://readtoon.com/content/gsjmdkxp/36)\\\n' +
      '3\\. [https://www.go-manga.com/shepherd-wizard/](https://www.go-manga.com/shepherd-wizard/)'
    const items = parseUrls(input)
    expect(items).toHaveLength(3)
    expect(new Set(items.map((u) => u.normalized)).size).toBe(3)
    expect(items.filter((u) => u.duplicate)).toHaveLength(0)
    expect(items.map((u) => u.normalized)).toEqual([
      'https://ntrnaja.com/manga/m-pz5bcod9/?chapter=-54',
      'https://readtoon.com/content/gsjmdkxp/36',
      'https://www.go-manga.com/shepherd-wizard/',
    ])
  })

  it('handles mixed plain + markdown input', () => {
    const input =
      'Website:\nhttps://example.com\n\n1. [Google](https://google.com)\n\nAnother:\nhttps://github.com/kainapat/url-link-counter'
    expect(normalized(input)).toEqual([
      'https://example.com',
      'https://google.com',
      'https://github.com/kainapat/url-link-counter',
    ])
  })
})

describe('autolinks', () => {
  it('<url> yields one url without brackets', () => {
    expect(normalized('<https://example.com>')).toEqual(['https://example.com'])
  })
})

describe('query, fragment, parentheses', () => {
  it('preserves query strings', () => {
    expect(normalized('https://example.com/?chapter=-54')).toEqual(['https://example.com/?chapter=-54'])
    expect(normalized('see https://example.com?a=1&b=2 ok')).toEqual(['https://example.com?a=1&b=2'])
  })

  it('preserves fragments', () => {
    expect(normalized('https://example.com/page#section')).toEqual(['https://example.com/page#section'])
  })

  it('preserves balanced parentheses inside the url', () => {
    expect(normalized('https://example.com/path_(test)')).toEqual(['https://example.com/path_(test)'])
    expect(normalized('https://en.wikipedia.org/wiki/Link_(film)')).toEqual([
      'https://en.wikipedia.org/wiki/Link_(film)',
    ])
  })

  it('strips outer prose wrappers', () => {
    expect(normalized('(https://example.com)')).toEqual(['https://example.com'])
    expect(normalized('see https://example.com/test).')).toEqual(['https://example.com/test'])
    expect(normalized('see https://example.com, next')).toEqual(['https://example.com'])
  })

  it('does not strip ; : ! ? unconditionally', () => {
    expect(cleanUrl('https://example.com/?q=test')).toBe('https://example.com/?q=test')
    expect(cleanUrl('https://example.com/a!')).toBe('https://example.com/a!')
  })
})

describe('duplicate semantics', () => {
  it('[A, A, B] → total 3, unique 2, duplicates 2, both A flagged', () => {
    const items = parseUrls('https://a.com\nhttps://a.com\nhttps://b.com')
    expect(items).toHaveLength(3)
    expect(new Set(items.map((u) => u.normalized)).size).toBe(2)
    expect(items.filter((u) => u.duplicate)).toHaveLength(2)
    expect(items.slice(0, 2).map((u) => u.duplicate)).toEqual([true, true])
  })

  it('treats http vs https and trailing slash as distinct', () => {
    expect(new Set(normalized('http://a.com https://a.com')).size).toBe(2)
    expect(new Set(normalized('https://a.com/path https://a.com/path/')).size).toBe(2)
  })
})
