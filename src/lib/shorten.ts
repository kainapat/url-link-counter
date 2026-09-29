export type ShortenStatus = 'waiting' | 'shortening' | 'done' | 'failed'

export type ShortenEntry = {
  status: ShortenStatus
  shortUrl?: string
  error?: string
}

export const SHORTEN_CONCURRENCY = 5

export async function shortenOne(longUrl: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`, {
    signal,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = (await res.text()).trim()
  if (!/^https?:\/\//.test(text)) throw new Error(text.slice(0, 120) || 'Bad response')
  return text
}

export type BatchUpdate = (index: number, entry: ShortenEntry, done: number, total: number) => void

/**
 * Shorten a batch with at most `concurrency` in-flight requests.
 * One failure never aborts the batch — it is recorded and the rest continue.
 * `isCancelled` is polled so a new run can supersede an old one.
 */
export async function shortenBatch(
  urls: string[],
  onUpdate: BatchUpdate,
  options?: { concurrency?: number; isCancelled?: () => boolean },
): Promise<void> {
  const concurrency = Math.max(1, options?.concurrency ?? SHORTEN_CONCURRENCY)
  const isCancelled = options?.isCancelled ?? (() => false)
  let next = 0
  let done = 0
  const total = urls.length

  urls.forEach((_, index) => onUpdate(index, { status: 'waiting' }, done, total))

  async function worker(): Promise<void> {
    while (next < urls.length) {
      if (isCancelled()) return
      const index = next
      next += 1
      onUpdate(index, { status: 'shortening' }, done, total)
      try {
        const shortUrl = await shortenOne(urls[index])
        if (isCancelled()) return
        done += 1
        onUpdate(index, { status: 'done', shortUrl }, done, total)
      } catch (err) {
        if (isCancelled()) return
        done += 1
        onUpdate(
          index,
          { status: 'failed', error: err instanceof Error ? err.message : 'Failed' },
          done,
          total,
        )
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, total) }, () => worker()))
}
