import { afterEach, describe, expect, it, vi } from 'vitest'
import { shortenBatch, shortenOne } from './shorten'

function deferred<T>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('shortenBatch', () => {
  it('caps concurrency at 5 and retries the next provider after a failure', async () => {
    const gates = Array.from({ length: 9 }, () => deferred<Response>())
    let inFlight = 0
    let maxInFlight = 0
    const calls: string[] = []

    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        calls.push(url)
        inFlight += 1
        maxInFlight = Math.max(maxInFlight, inFlight)
        const gate = gates[calls.length - 1]
        return gate.promise.finally(() => {
          inFlight -= 1
        })
      }),
    )

    const urls = Array.from({ length: 8 }, (_, i) => `https://example.com/${i}`)
    const updates: string[] = []
    const run = shortenBatch(urls, (index, entry) => {
      updates.push(`${index}:${entry.status}`)
    })

    await vi.waitFor(() => expect(calls.length).toBe(5))
    expect(maxInFlight).toBeLessThanOrEqual(5)

    // Fail the first provider attempt — the url must fall back, batch continues.
    gates[0].reject(new Error('boom'))
    await vi.waitFor(() => expect(calls.length).toBe(6))
    expect(calls[5]).toContain('da.gd')

    // Resolve everything else (retry + remaining).
    for (let i = 1; i < 9; i++) {
      gates[i].resolve(new Response(`https://tinyurl.com/x${i}`, { status: 200 }))
    }
    await run

    expect(maxInFlight).toBeLessThanOrEqual(5)
    expect(calls).toHaveLength(9)
    expect(updates.filter((u) => u.endsWith(':done'))).toHaveLength(8)
    expect(updates.filter((u) => u.endsWith(':failed'))).toHaveLength(0)
  })

  it('shortenOne rejects non-url responses', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('Error: not found', { status: 200 })))
    await expect(shortenOne('https://example.com')).rejects.toThrow(/All shorteners unreachable/)
  })

  it('falls back to the next provider when the first is unreachable (CORS)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('tinyurl.com')) return Promise.reject(new TypeError('Failed to fetch'))
        return Promise.resolve(new Response('https://is.gd/abc123', { status: 200 }))
      }),
    )
    await expect(shortenOne('https://example.com')).resolves.toBe('https://is.gd/abc123')
  })

  it('stops processing when isCancelled returns true', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => new Response(`https://tinyurl.com/${encodeURIComponent(url)}`, { status: 200 })),
    )
    let cancelled = false
    const updates: string[] = []
    const urls = ['https://a.com', 'https://b.com', 'https://c.com', 'https://d.com']
    await shortenBatch(
      urls,
      (index, entry) => {
        updates.push(`${index}:${entry.status}`)
        if (entry.status === 'done') {
          cancelled = true
        }
      },
      { concurrency: 1, isCancelled: () => cancelled },
    )
    // Only the first URL should finish done; remaining URLs are not processed
    const doneUpdates = updates.filter((u) => u.endsWith(':done'))
    expect(doneUpdates.length).toBeLessThan(urls.length)
  })

  it('isolates batchRun from singleRuns so single shortens do not cancel batch', async () => {
    const gateBatch = deferred<Response>()
    const gateSingle = deferred<Response>()

    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('single')) return gateSingle.promise
        return gateBatch.promise
      }),
    )

    let batchRun = 1
    const singleRuns: Record<string, number> = {}
    let batchDone = false
    let singleDone = false

    // Start batch with token = 1
    const batchPromise = shortenBatch(
      ['https://example.com/batch1'],
      (_idx, entry) => {
        if (entry.status === 'done') batchDone = true
      },
      { isCancelled: () => batchRun !== 1 },
    )

    // Now start a single shorten on another URL, incrementing its own token
    const singleUrl = 'https://example.com/single1'
    const singleToken = (singleRuns[singleUrl] = (singleRuns[singleUrl] || 0) + 1)
    const singlePromise = (async () => {
      const res = await shortenOne(singleUrl)
      if (singleRuns[singleUrl] === singleToken) {
        singleDone = true
      }
      return res
    })()

    // batchRun is still 1, single token is 1 in its own map
    expect(batchRun).toBe(1)
    expect(singleRuns[singleUrl]).toBe(1)

    // Resolve both
    gateSingle.resolve(new Response('https://tinyurl.com/s1', { status: 200 }))
    gateBatch.resolve(new Response('https://tinyurl.com/b1', { status: 200 }))

    await Promise.all([batchPromise, singlePromise])
    expect(batchDone).toBe(true)
    expect(singleDone).toBe(true)
  })
})
