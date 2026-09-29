import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react'
import type { UrlItem } from '../lib/urls'
import {
  CONFIRM_BATCH_THRESHOLD,
  DEFAULT_BATCH_SIZE,
  DEFAULT_OCCURRENCE_MODE,
  MAX_CUSTOM_BATCH,
  getBatch,
  getOpenableUrls,
  openUrlBatch,
  parseCustomBatchSize,
  type BatchPreset,
  type BatchSizeSelection,
  type OccurrenceMode,
  type OpenBatchResult,
  type OpenLinksDuplicateMode,
  type OpenLinksScope,
  type OpenLinksState,
} from '../lib/openLinks'

export type OpenLinksControlProps = {
  allUrls: UrlItem[]
  visibleUrls: UrlItem[]
  query: string
  filter: string
  mode?: OccurrenceMode
  onModeChange?: (mode: OccurrenceMode) => void
}

export function OpenLinksControl({
  allUrls,
  visibleUrls,
  query,
  filter,
  mode,
  onModeChange,
}: OpenLinksControlProps) {
  const [scope, setScope] = useState<OpenLinksScope>('current')
  const [internalDuplicateMode, setInternalDuplicateMode] = useState<OpenLinksDuplicateMode>(DEFAULT_OCCURRENCE_MODE)
  const duplicateMode = mode ?? internalDuplicateMode
  const setDuplicateMode = (newMode: OccurrenceMode) => {
    setInternalDuplicateMode(newMode)
    if (onModeChange) onModeChange(newMode)
  }
  const [batchPreset, setBatchPreset] = useState<BatchSizeSelection>(DEFAULT_BATCH_SIZE)
  const [customInput, setCustomInput] = useState('25')
  const [cursor, setCursor] = useState(0)
  const [status, setStatus] = useState<OpenLinksState>('ready')
  const [showOptions, setShowOptions] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ count: number; isAll: boolean } | null>(null)
  const [blockedNotice, setBlockedNotice] = useState<{ requested: number; opened: number; blocked: number } | null>(null)
  const [ariaAnnouncement, setAriaAnnouncement] = useState('')

  const selectId = useId()
  const customInputId = useId()

  // Compute available openable URLs
  const openableUrls = useMemo(
    () => getOpenableUrls({ allUrls, visibleUrls, scope, duplicateMode }),
    [allUrls, visibleUrls, scope, duplicateMode],
  )

  // Track signature of openable URLs to automatically reset cursor when the list changes
  const prevSignature = useRef('')
  useEffect(() => {
    const currentSignature = `${scope}:${duplicateMode}:${query}:${filter}:${openableUrls.length}:${openableUrls[0] ?? ''}:${openableUrls[openableUrls.length - 1] ?? ''}`
    if (prevSignature.current && prevSignature.current !== currentSignature) {
      setCursor(0)
      setStatus('ready')
      setBlockedNotice(null)
    }
    prevSignature.current = currentSignature
  }, [openableUrls, scope, duplicateMode, query, filter])

  // Resolve effective batch size
  const effectiveBatchSize = useMemo(() => {
    if (batchPreset === 'custom') {
      const parsed = parseCustomBatchSize(customInput)
      return parsed ?? DEFAULT_BATCH_SIZE
    }
    return batchPreset
  }, [batchPreset, customInput])

  const isCustomInvalid = batchPreset === 'custom' && parseCustomBatchSize(customInput) === null

  // Current batch slice
  const batchSlice = useMemo(
    () => getBatch(openableUrls, cursor, effectiveBatchSize),
    [openableUrls, cursor, effectiveBatchSize],
  )

  const isComplete = openableUrls.length > 0 && cursor >= openableUrls.length
  const remainingCount = Math.max(0, openableUrls.length - cursor)

  // Core open execution
  const executeOpen = (count: number) => {
    const slice = getBatch(openableUrls, cursor, count)
    if (slice.urls.length === 0) return

    setStatus('opening')
    const result: OpenBatchResult = openUrlBatch(slice.urls)

    if (result.blocked > 0) {
      setStatus('blocked')
      setBlockedNotice({
        requested: result.requested,
        opened: result.opened,
        blocked: result.blocked,
      })
    } else {
      setBlockedNotice(null)
      const nextCursor = cursor + result.opened
      if (nextCursor >= openableUrls.length) {
        setStatus('complete')
      } else {
        setStatus('opened')
      }
    }

    // Advance cursor strictly by successfully opened count
    const newCursor = cursor + result.opened
    setCursor(newCursor)

    setAriaAnnouncement(
      `Opened ${newCursor} of ${openableUrls.length} links. ${result.opened} links opened this batch.${
        result.blocked > 0 ? ` ${result.blocked} links blocked by browser popup blocker.` : ''
      }`,
    )
  }

  const handleOpenNext = () => {
    if (isComplete || batchSlice.urls.length === 0 || isCustomInvalid) return
    const targetCount = batchSlice.urls.length
    if (targetCount >= CONFIRM_BATCH_THRESHOLD) {
      setConfirmAction({ count: targetCount, isAll: false })
      setConfirmOpen(true)
    } else {
      executeOpen(targetCount)
    }
  }

  const handleOpenAllRemaining = () => {
    if (isComplete || remainingCount === 0) return
    const cappedCount = Math.min(remainingCount, MAX_CUSTOM_BATCH)
    setConfirmAction({ count: cappedCount, isAll: true })
    setConfirmOpen(true)
  }

  const handleConfirm = () => {
    if (!confirmAction) return
    const { count } = confirmAction
    setConfirmOpen(false)
    setConfirmAction(null)
    executeOpen(count)
  }

  const handleReset = () => {
    setCursor(0)
    setStatus('ready')
    setBlockedNotice(null)
    setAriaAnnouncement(`Reset batch cursor. Opened 0 of ${openableUrls.length} links.`)
  }

  if (allUrls.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-4">
      {/* Top row: Main Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Open links
          </span>

          {/* Batch size selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor={selectId} className="sr-only">
              Open per batch
            </label>
            <div className="relative">
              <select
                id={selectId}
                value={batchPreset}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === 'custom') {
                    setBatchPreset('custom')
                  } else {
                    setBatchPreset(Number(val) as BatchPreset)
                  }
                }}
                className="min-h-11 appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value={10}>10 links</option>
                <option value={20}>20 links</option>
                <option value={30}>30 links</option>
                <option value={50}>50 links</option>
                <option value="custom">Custom</option>
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
            </div>

            {/* Custom batch input if Custom is selected */}
            {batchPreset === 'custom' && (
              <div className="flex items-center gap-1">
                <label htmlFor={customInputId} className="sr-only">
                  Custom batch size between 1 and 100
                </label>
                <input
                  id={customInputId}
                  type="number"
                  min={1}
                  max={MAX_CUSTOM_BATCH}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="1-100"
                  className={`min-h-11 w-20 rounded-lg border bg-white px-2.5 py-1 text-center text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-950 ${
                    isCustomInvalid
                      ? 'border-rose-500 text-rose-600 focus-visible:ring-rose-500 dark:border-rose-400 dark:text-rose-300'
                      : 'border-zinc-300 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100'
                  }`}
                />
              </div>
            )}
          </div>

          {/* Action: Open Next */}
          <button
            type="button"
            disabled={isComplete || batchSlice.urls.length === 0 || isCustomInvalid}
            onClick={handleOpenNext}
            aria-label={
              isComplete
                ? `All ${openableUrls.length} links opened`
                : `Open next ${batchSlice.urls.length} links (items ${batchSlice.displayStart} to ${batchSlice.displayEnd})`
            }
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${
              isComplete
                ? 'bg-emerald-600 text-white dark:bg-emerald-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
            }`}
          >
            {isComplete ? <Check size={16} /> : <ExternalLink size={16} />}
            <span>
              {isComplete ? 'All opened ✓' : `Open next ${batchSlice.urls.length}`}
            </span>
          </button>

          {/* Action: Reset */}
          <button
            type="button"
            disabled={cursor === 0}
            onClick={handleReset}
            aria-label="Reset batch cursor to beginning"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        {/* Options toggle & Open all remaining */}
        <div className="flex items-center gap-2">
          {remainingCount > 0 && remainingCount !== batchSlice.urls.length && (
            <button
              type="button"
              onClick={handleOpenAllRemaining}
              className="min-h-11 rounded-lg px-2.5 text-xs font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Open all remaining ({remainingCount > MAX_CUSTOM_BATCH ? `${MAX_CUSTOM_BATCH} max` : remainingCount})
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowOptions((v) => !v)}
            aria-expanded={showOptions}
            aria-controls="open-links-options"
            aria-label="Toggle batch open options"
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition dark:border-zinc-700 ${
              showOptions
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Options</span>
          </button>
        </div>
      </div>

      {/* Progress & Next batch status */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {isComplete ? `All ${openableUrls.length} links opened` : `Opened ${cursor} / ${openableUrls.length}`}
          </span>
          {!isComplete && openableUrls.length > 0 && (
            <span className="text-zinc-500 dark:text-zinc-400">
              (Next: {batchSlice.displayStart}–{batchSlice.displayEnd})
            </span>
          )}
        </div>

        <div className="text-zinc-500 dark:text-zinc-400">
          Scope:{' '}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {scope === 'current' ? 'Current results' : 'All valid URLs'}
          </span>{' '}
          • Mode:{' '}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {duplicateMode === 'unique' ? 'Unique URLs' : 'Total URLs'}
          </span>
        </div>
      </div>

      {/* Options Panel */}
      <AnimatePresence initial={false}>
        {showOptions && (
          <motion.div
            id="open-links-options"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-t border-zinc-200 pt-3 dark:border-zinc-800"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Scope Radio Group */}
              <fieldset className="flex flex-col gap-1.5">
                <legend className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Links to open (Scope)
                </legend>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <input
                    type="radio"
                    name="open-scope"
                    value="current"
                    checked={scope === 'current'}
                    onChange={() => setScope('current')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Current results ({visibleUrls.filter((u) => u.valid).length} valid)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <input
                    type="radio"
                    name="open-scope"
                    value="all"
                    checked={scope === 'all'}
                    onChange={() => setScope('all')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>All valid URLs ({allUrls.filter((u) => u.valid).length} valid)</span>
                </label>
              </fieldset>

              {/* Duplicate Handling Radio Group */}
              <fieldset className="flex flex-col gap-1.5">
                <legend className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Occurrence mode
                </legend>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <input
                    type="radio"
                    name="duplicate-mode"
                    value="total"
                    checked={duplicateMode === 'total' || duplicateMode === 'all'}
                    onChange={() => setDuplicateMode('total')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Total URLs (Open all occurrences in order)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <input
                    type="radio"
                    name="duplicate-mode"
                    value="unique"
                    checked={duplicateMode === 'unique'}
                    onChange={() => setDuplicateMode('unique')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Unique URLs (Skip duplicate tabs)</span>
                </label>
              </fieldset>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup Blocker Alert Notification */}
      {blockedNotice && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold">
              Browser blocked some tabs. Allow pop-ups for this site, then try again.
            </p>
            <p className="text-amber-800 dark:text-amber-300">
              Requested: {blockedNotice.requested} • Opened: {blockedNotice.opened} • Blocked: {blockedNotice.blocked}
            </p>
          </div>
        </div>
      )}

      {/* Screen Reader Progress Announcement */}
      <p aria-live="polite" className="sr-only">
        {ariaAnnouncement}
      </p>

      {/* Safety Confirmation Dialog */}
      <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl focus:outline-none dark:border-zinc-800 dark:bg-zinc-900">
            <AlertDialog.Title className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Open {confirmAction?.count} tabs?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {confirmAction?.isAll
                ? `You are about to open ${confirmAction.count} tabs. Opening many tabs simultaneously may consume significant memory and slow down your browser.`
                : `Opening ${confirmAction?.count} tabs simultaneously may use significant memory. Are you sure you want to proceed?`}
            </AlertDialog.Description>

            <div className="mt-6 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="min-h-11 rounded-lg border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="min-h-11 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Open {confirmAction?.count} tabs
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
