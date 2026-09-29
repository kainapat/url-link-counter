import type { UrlItem } from './urls'

export type OccurrenceMode = 'total' | 'unique'
export type OpenLinksScope = 'current' | 'all'
export type OpenLinksDuplicateMode = OccurrenceMode | 'all'
export const DEFAULT_OCCURRENCE_MODE: OccurrenceMode = 'total'
export type BatchPreset = 10 | 20 | 30 | 50
export type BatchSizeSelection = BatchPreset | 'custom'

export type OpenLinksState = 'ready' | 'opening' | 'opened' | 'blocked' | 'complete'

export type BatchSlice = {
  urls: string[]
  startIndex: number
  endIndex: number
  total: number
  displayStart: number
  displayEnd: number
  batchNumber: number
  totalBatches: number
}

export type OpenBatchResult = {
  requested: number
  opened: number
  blocked: number
  openedUrls: string[]
  blockedUrls: string[]
}

export type BatchHistoryItem = {
  id: string
  batchNumber: number
  displayStart: number
  displayEnd: number
  requested: number
  opened: number
  blocked: number
  openedUrls: string[]
  blockedUrls: string[]
  timestamp: number
}

export const DEFAULT_BATCH_SIZE: BatchPreset = 10
export const BATCH_SIZE_PRESETS: readonly BatchPreset[] = [10, 20, 30, 50]
export const CONFIRM_BATCH_THRESHOLD = 30
export const MAX_CUSTOM_BATCH = 100
export const MIN_CUSTOM_BATCH = 1

/**
 * Filter and deduplicate URLs according to scope and duplicateMode.
 * ALWAYS skips invalid URLs. Never alters the original input objects.
 */
export function getOpenableUrls(params: {
  allUrls: UrlItem[]
  visibleUrls: UrlItem[]
  scope: OpenLinksScope
  duplicateMode: OpenLinksDuplicateMode
}): string[] {
  const source = params.scope === 'current' ? params.visibleUrls : params.allUrls
  const validItems = source.filter((item) => item.valid)

  if (params.duplicateMode === 'all' || params.duplicateMode === 'total') {
    return validItems.map((item) => item.normalized)
  }

  const seen = new Set<string>()
  const result: string[] = []
  for (const item of validItems) {
    if (!seen.has(item.normalized)) {
      seen.add(item.normalized)
      result.push(item.normalized)
    }
  }
  return result
}

/**
 * Extract the slice of URLs for the next batch from the current cursor.
 */
export function getBatch(urls: string[], cursor: number, batchSize: number): BatchSlice {
  const safeCursor = Math.max(0, Math.min(cursor, urls.length))
  const safeSize = Math.max(1, Math.floor(batchSize))
  const batch = urls.slice(safeCursor, safeCursor + safeSize)
  const endIndex = safeCursor + batch.length

  const batchNumber = safeSize > 0 ? 1 + Math.floor(safeCursor / safeSize) : 1
  const totalBatches = safeSize > 0 ? Math.max(1, Math.ceil(urls.length / safeSize)) : 1

  return {
    urls: batch,
    startIndex: safeCursor,
    endIndex,
    total: urls.length,
    displayStart: batch.length === 0 ? 0 : safeCursor + 1,
    displayEnd: endIndex,
    batchNumber,
    totalBatches,
  }
}

/**
 * Validates custom batch size input string.
 * Returns parsed number in [MIN_CUSTOM_BATCH, MAX_CUSTOM_BATCH] or null if invalid.
 */
export function parseCustomBatchSize(value: string): number | null {
  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const num = parseInt(trimmed, 10)
  if (num < MIN_CUSTOM_BATCH || num > MAX_CUSTOM_BATCH) return null
  return num
}

export type UrlOpener = (url: string) => Window | null | undefined

/**
 * Opens a batch of URLs synchronously to preserve user-gesture activation context.
 * Checks the opener result to detect browser popup blockers.
 */
export function openUrlBatch(
  urls: string[],
  opener: UrlOpener = (url) => window.open(url, '_blank', 'noopener,noreferrer'),
): OpenBatchResult {
  let opened = 0
  let blocked = 0
  const openedUrls: string[] = []
  const blockedUrls: string[] = []

  for (const url of urls) {
    try {
      const win = opener(url)
      // If win is null/undefined, or if browser closed it immediately via blocker
      if (win && !win.closed) {
        opened += 1
        openedUrls.push(url)
      } else {
        blocked += 1
        blockedUrls.push(url)
      }
    } catch {
      blocked += 1
      blockedUrls.push(url)
    }
  }

  return {
    requested: urls.length,
    opened,
    blocked,
    openedUrls,
    blockedUrls,
  }
}

export function createBatchHistoryItem(
  batchNumber: number,
  slice: Pick<BatchSlice, 'displayStart' | 'displayEnd'>,
  result: OpenBatchResult,
): BatchHistoryItem {
  return {
    id: `batch-${batchNumber}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    batchNumber,
    displayStart: slice.displayStart,
    displayEnd: slice.displayEnd,
    requested: result.requested,
    opened: result.opened,
    blocked: result.blocked,
    openedUrls: result.openedUrls,
    blockedUrls: result.blockedUrls,
    timestamp: Date.now(),
  }
}
