import { afterEach, describe, expect, it, vi } from 'vitest'
import { shortenBatch } from './shorten'

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
  it('caps concurrency at 5 and keeps going after a failure', async () => {
    const gates = Array.from({ length: 8 }, () => deferred<Response>())
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

    // Fail the first request — the batch must continue.
    gates[0].reject(new Error('boom'))
    await vi.waitFor(() => expect(calls.length).toBe(6))

    // Resolve everything else.
    for (let i = 1; i < 8; i++) {
      gates[i].resolve(new Response(`https://tinyurl.com/x${i}`, { status: 200 }))
    }
    await run

    expect(maxInFlight).toBeLessThanOrEqual(5)
    expect(calls).toHaveLength(8)
    expect(updates.filter((u) => u.endsWith(':done'))).toHaveLength(7)
    expect(updates.filter((u) => u.endsWith(':failed'))).toHaveLength(1)
  })

  it('shortenOne rejects non-url responses', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('Error: not found', { status: 200 })))
    const { shortenOne } = await import('./shorten')
    await expect(shortenOne('https://example.com')).rejects.toThrow()
  })
})
