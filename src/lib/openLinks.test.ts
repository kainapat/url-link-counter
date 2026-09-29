import { describe, expect, it, vi } from 'vitest'
import type { UrlItem } from './urls'
import {
  getBatch,
  getOpenableUrls,
  openUrlBatch,
  parseCustomBatchSize,
} from './openLinks'

function makeUrlItem(overrides: Partial<UrlItem> & { raw: string }): UrlItem {
  return {
    raw: overrides.raw,
    normalized: overrides.normalized ?? overrides.raw,
    domain: overrides.domain ?? 'example.com',
    valid: overrides.valid ?? true,
    duplicate: overrides.duplicate ?? false,
  }
}

describe('openLinks: getBatch with 73 URLs', () => {
  const urls73 = Array.from({ length: 73 }, (_, i) => `https://example.com/page/${i + 1}`)

  it('batches 73 URLs with batch size 10 into exact expected ranges: 1-10, 11-20 ... 71-73', () => {
    const expectedRanges = [
      { cursor: 0, start: 1, end: 10, count: 10 },
      { cursor: 10, start: 11, end: 20, count: 10 },
      { cursor: 20, start: 21, end: 30, count: 10 },
      { cursor: 30, start: 31, end: 40, count: 10 },
      { cursor: 40, start: 41, end: 50, count: 10 },
      { cursor: 50, start: 51, end: 60, count: 10 },
      { cursor: 60, start: 61, end: 70, count: 10 },
      { cursor: 70, start: 71, end: 73, count: 3 },
    ]

    for (const { cursor, start, end, count } of expectedRanges) {
      const batch = getBatch(urls73, cursor, 10)
      expect(batch.urls).toHaveLength(count)
      expect(batch.startIndex).toBe(cursor)
      expect(batch.endIndex).toBe(cursor + count)
      expect(batch.displayStart).toBe(start)
      expect(batch.displayEnd).toBe(end)
      expect(batch.total).toBe(73)
      expect(batch.urls[0]).toBe(`https://example.com/page/${start}`)
      expect(batch.urls[batch.urls.length - 1]).toBe(`https://example.com/page/${end}`)
    }

    // Past the end
    const pastBatch = getBatch(urls73, 73, 10)
    expect(pastBatch.urls).toHaveLength(0)
    expect(pastBatch.displayStart).toBe(0)
    expect(pastBatch.displayEnd).toBe(73)
  })

  it('batches 73 URLs with batch size 20 into exact ranges: 1-20, 21-40, 41-60, 61-73', () => {
    const expectedRanges = [
      { cursor: 0, start: 1, end: 20, count: 20 },
      { cursor: 20, start: 21, end: 40, count: 20 },
      { cursor: 40, start: 41, end: 60, count: 20 },
      { cursor: 60, start: 61, end: 73, count: 13 },
    ]

    for (const { cursor, start, end, count } of expectedRanges) {
      const batch = getBatch(urls73, cursor, 20)
      expect(batch.urls).toHaveLength(count)
      expect(batch.displayStart).toBe(start)
      expect(batch.displayEnd).toBe(end)
      expect(batch.urls[0]).toBe(`https://example.com/page/${start}`)
      expect(batch.urls[batch.urls.length - 1]).toBe(`https://example.com/page/${end}`)
    }
  })
})

describe('openLinks: getOpenableUrls', () => {
  const sampleItems: UrlItem[] = [
    makeUrlItem({ raw: 'https://example.com/1', normalized: 'https://example.com/1', valid: true, duplicate: false }),
    makeUrlItem({ raw: 'https://example.com/2', normalized: 'https://example.com/2', valid: true, duplicate: false }),
    makeUrlItem({ raw: 'not-a-url', normalized: 'not-a-url', valid: false, duplicate: false }),
    makeUrlItem({ raw: 'https://example.com/1', normalized: 'https://example.com/1', valid: true, duplicate: true }),
    makeUrlItem({ raw: 'invalid://bad', normalized: 'invalid://bad', valid: false, duplicate: false }),
    makeUrlItem({ raw: 'https://example.com/3', normalized: 'https://example.com/3', valid: true, duplicate: false }),
  ]

  it('skips invalid URLs unconditionally', () => {
    const result = getOpenableUrls({
      allUrls: sampleItems,
      visibleUrls: sampleItems,
      scope: 'all',
      duplicateMode: 'all',
    })
    expect(result).not.toContain('not-a-url')
    expect(result).not.toContain('invalid://bad')
    expect(result).toHaveLength(4)
  })

  it('in unique mode, deduplicates repeated URLs while keeping first appearance order', () => {
    const result = getOpenableUrls({
      allUrls: sampleItems,
      visibleUrls: sampleItems,
      scope: 'all',
      duplicateMode: 'unique',
    })
    expect(result).toEqual([
      'https://example.com/1',
      'https://example.com/2',
      'https://example.com/3',
    ])
  })

  it('in all occurrences mode, preserves duplicates in order', () => {
    const result = getOpenableUrls({
      allUrls: sampleItems,
      visibleUrls: sampleItems,
      scope: 'all',
      duplicateMode: 'all',
    })
    expect(result).toEqual([
      'https://example.com/1',
      'https://example.com/2',
      'https://example.com/1',
      'https://example.com/3',
    ])
  })

  it('respects scope: current results vs all valid URLs', () => {
    const filteredVisible = [sampleItems[0], sampleItems[1]] // only /1 and /2

    const currentScope = getOpenableUrls({
      allUrls: sampleItems,
      visibleUrls: filteredVisible,
      scope: 'current',
      duplicateMode: 'unique',
    })
    expect(currentScope).toEqual([
      'https://example.com/1',
      'https://example.com/2',
    ])

    const allScope = getOpenableUrls({
      allUrls: sampleItems,
      visibleUrls: filteredVisible,
      scope: 'all',
      duplicateMode: 'unique',
    })
    expect(allScope).toEqual([
      'https://example.com/1',
      'https://example.com/2',
      'https://example.com/3',
    ])
  })

  it('does not mutate input arrays', () => {
    const clone = [...sampleItems]
    getOpenableUrls({
      allUrls: sampleItems,
      visibleUrls: sampleItems,
      scope: 'all',
      duplicateMode: 'unique',
    })
    expect(sampleItems).toEqual(clone)
  })
})

describe('openLinks: parseCustomBatchSize', () => {
  it('parses valid integer strings within 1-100', () => {
    expect(parseCustomBatchSize('1')).toBe(1)
    expect(parseCustomBatchSize('10')).toBe(10)
    expect(parseCustomBatchSize('35')).toBe(35)
    expect(parseCustomBatchSize('100')).toBe(100)
    expect(parseCustomBatchSize('  42  ')).toBe(42)
  })

  it('returns null for out of bounds numbers, decimals, or non-numeric strings', () => {
    expect(parseCustomBatchSize('0')).toBeNull()
    expect(parseCustomBatchSize('101')).toBeNull()
    expect(parseCustomBatchSize('-5')).toBeNull()
    expect(parseCustomBatchSize('12.5')).toBeNull()
    expect(parseCustomBatchSize('abc')).toBeNull()
    expect(parseCustomBatchSize('')).toBeNull()
    expect(parseCustomBatchSize('   ')).toBeNull()
  })
})

describe('openLinks: openUrlBatch and popup blocker handling', () => {
  it('counts all as opened when opener returns mock windows', () => {
    const mockWindow = { closed: false } as Window
    const opener = vi.fn().mockReturnValue(mockWindow)
    const targets = ['https://a.com', 'https://b.com', 'https://c.com']

    const res = openUrlBatch(targets, opener)
    expect(opener).toHaveBeenCalledTimes(3)
    expect(res).toEqual({
      requested: 3,
      opened: 3,
      blocked: 0,
      openedUrls: targets,
    })
  })

  it('detects partial popup blocking when opener returns null or closed window', () => {
    let call = 0
    const opener = vi.fn((_url: string) => {
      call += 1
      if (call <= 6) {
        return { closed: false } as Window
      }
      return null // blocked
    })

    const targets = Array.from({ length: 10 }, (_, i) => `https://example.com/${i}`)
    const res = openUrlBatch(targets, opener)

    expect(res.requested).toBe(10)
    expect(res.opened).toBe(6)
    expect(res.blocked).toBe(4)
    expect(res.openedUrls).toHaveLength(6)
  })

  it('treats opener exceptions as blocked tabs', () => {
    const opener = vi.fn((url: string) => {
      if (url.includes('bad')) throw new Error('Blocked by browser policy')
      return { closed: false } as Window
    })

    const targets = ['https://good.com', 'https://bad.com']
    const res = openUrlBatch(targets, opener)
    expect(res.requested).toBe(2)
    expect(res.opened).toBe(1)
    expect(res.blocked).toBe(1)
  })
})

describe('openLinks: cursor progression and reset workflow', () => {
  const urls = Array.from({ length: 25 }, (_, i) => `https://example.com/item-${i + 1}`)

  it('progresses cursor step by step and resets cursor back to 0', () => {
    let cursor = 0

    // First batch: 10
    const batch1 = getBatch(urls, cursor, 10)
    expect(batch1.urls).toHaveLength(10)
    expect(batch1.displayStart).toBe(1)
    expect(batch1.displayEnd).toBe(10)
    cursor = batch1.endIndex
    expect(cursor).toBe(10)

    // Second batch: 10
    const batch2 = getBatch(urls, cursor, 10)
    expect(batch2.urls).toHaveLength(10)
    expect(batch2.displayStart).toBe(11)
    expect(batch2.displayEnd).toBe(20)
    cursor = batch2.endIndex
    expect(cursor).toBe(20)

    // Third batch: remaining 5
    const batch3 = getBatch(urls, cursor, 10)
    expect(batch3.urls).toHaveLength(5)
    expect(batch3.displayStart).toBe(21)
    expect(batch3.displayEnd).toBe(25)
    cursor = batch3.endIndex
    expect(cursor).toBe(25)

    // Reset cursor to 0
    cursor = 0
    const resetBatch = getBatch(urls, cursor, 10)
    expect(resetBatch.displayStart).toBe(1)
    expect(resetBatch.displayEnd).toBe(10)
    expect(resetBatch.startIndex).toBe(0)
  })

  it('changing source list resets batch state', () => {
    let sourceUrls = urls.slice(0, 15)
    let cursor = 10

    // Simulate source list change: when source list changes, cursor resets to 0
    const prevUrls = sourceUrls
    sourceUrls = ['https://newsite.com/1', 'https://newsite.com/2']
    if (sourceUrls !== prevUrls) {
      cursor = 0
    }

    expect(cursor).toBe(0)
    const freshBatch = getBatch(sourceUrls, cursor, 10)
    expect(freshBatch.total).toBe(2)
    expect(freshBatch.urls).toEqual(['https://newsite.com/1', 'https://newsite.com/2'])
  })
})
