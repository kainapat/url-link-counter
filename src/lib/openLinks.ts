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
export type BatchHistoryStatus = 'complete' | 'partial'

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
  status: BatchHistoryStatus
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
 * Default browser window opener with reliable popup blocker detection.
 *
 * Web API Limitation Note:
 * Passing 'noopener' directly in `window.open(url, '_blank', 'noopener')` causes
 * Chromium browsers to disown the window reference and return null even when opened
 * successfully. This pattern:
 * 1. Opens an initial blank window synchronously to capture the genuine Window handle.
 * 2. Inspects whether the browser blocked the window (null or synchronously closed).
 * 3. Sets `newWindow.opener = null` to protect against reverse-tabnabbing exploits.
 * 4. Navigates to the destination URL via `newWindow.location.replace(url)`.
 */
export function defaultBrowserOpener(url: string): Window | null {
  try {
    const newWindow = window.open('', '_blank')
    if (!newWindow || newWindow.closed) {
      return null
    }
    try {
      newWindow.opener = null
    } catch {
      // Silently ignore if browser restricts opener mutation
    }
    newWindow.location.replace(url)
    return newWindow
  } catch {
    return null
  }
}

/**
 * Opens a batch of URLs synchronously to preserve user-gesture activation context.
 * Checks the opener result to detect browser popup blockers.
 */
export function openUrlBatch(
  urls: string[],
  opener: UrlOpener = defaultBrowserOpener,
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
    status: result.blocked === 0 ? 'complete' : 'partial',
    timestamp: Date.now(),
  }
}

/**
 * Updates an existing batch history entry in place following a retry.
 * Adjusts opened and blocked counts, moves newly opened URLs, and updates status.
 */
export function updateBatchHistoryItem(
  item: BatchHistoryItem,
  retryResult: OpenBatchResult,
): BatchHistoryItem {
  const newOpened = item.opened + retryResult.opened
  const remainingBlocked = retryResult.blocked
  const newOpenedUrls = [...item.openedUrls, ...retryResult.openedUrls]
  const newBlockedUrls = retryResult.blockedUrls

  return {
    ...item,
    opened: newOpened,
    blocked: remainingBlocked,
    openedUrls: newOpenedUrls,
    blockedUrls: newBlockedUrls,
    status: remainingBlocked === 0 ? 'complete' : 'partial',
    timestamp: Date.now(),
  }
}

/**
 * Generates a deterministic signature string covering all parameters and URLs.
 * If any item in the list changes (including middle items) or batch size changes,
 * the signature changes and triggers a batch state reset.
 */
export function createResetSignature(params: {
  scope: string
  duplicateMode: string
  query: string
  filter: string
  effectiveBatchSize: number
  openableUrls: string[]
}): string {
  return [
    params.scope,
    params.duplicateMode,
    params.query.trim(),
    params.filter,
    String(params.effectiveBatchSize),
    ...params.openableUrls,
  ].join('\n')
}
