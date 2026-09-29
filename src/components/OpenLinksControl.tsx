import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FolderPlus,
  History,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import type { UrlItem } from '../lib/urls'
import {
  CONFIRM_BATCH_THRESHOLD,
  DEFAULT_BATCH_SIZE,
  DEFAULT_OCCURRENCE_MODE,
  MAX_CUSTOM_BATCH,
  createBatchHistoryItem,
  createResetSignature,
  getBatch,
  getOpenableUrls,
  openUrlBatch,
  parseCustomBatchSize,
  shouldShowNextBatch,
  updateBatchHistoryItem,
  type BatchActionType,
  type BatchHistoryItem,
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
  const [justOpenedCount, setJustOpenedCount] = useState<number | null>(null)
  const [history, setHistory] = useState<BatchHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    count: number
    isAll: boolean
    batchNumber: number
    actionType: BatchActionType
    label: string
  } | null>(null)
  const [blockedNotice, setBlockedNotice] = useState<{
    requested: number
    opened: number
    blocked: number
    blockedUrls: string[]
  } | null>(null)
  const [ariaAnnouncement, setAriaAnnouncement] = useState('')

  const selectId = useId()
  const customInputId = useId()
  const scopeSelectId = useId()
  const modeSelectId = useId()

  // Compute available openable URLs
  const openableUrls = useMemo(
    () => getOpenableUrls({ allUrls, visibleUrls, scope, duplicateMode }),
    [allUrls, visibleUrls, scope, duplicateMode],
  )

  // Resolve effective batch size
  const effectiveBatchSize = useMemo(() => {
    if (batchPreset === 'custom') {
      const parsed = parseCustomBatchSize(customInput)
      return parsed ?? DEFAULT_BATCH_SIZE
    }
    return batchPreset
  }, [batchPreset, customInput])

  const isCustomInvalid = batchPreset === 'custom' && parseCustomBatchSize(customInput) === null

  // Track signature to automatically reset cursor, history, and blocked state when URLs or settings change
  const prevSignature = useRef('')
  useEffect(() => {
    const currentSignature = createResetSignature({
      scope,
      duplicateMode,
      query,
      filter,
      effectiveBatchSize,
      openableUrls,
    })
    if (prevSignature.current && prevSignature.current !== currentSignature) {
      setCursor(0)
      setStatus('ready')
      setBlockedNotice(null)
      setHistory([])
      setJustOpenedCount(null)
    }
    prevSignature.current = currentSignature
  }, [openableUrls, scope, duplicateMode, query, filter, effectiveBatchSize])
  // Current batch slice
  const batchSlice = useMemo(
    () => getBatch(openableUrls, cursor, effectiveBatchSize),
    [openableUrls, cursor, effectiveBatchSize],
  )

  const isComplete = openableUrls.length > 0 && cursor >= openableUrls.length
  const remainingCount = Math.max(0, openableUrls.length - cursor)

  // Core open execution
  type ExecuteOpenOptions = {
    count: number
    batchNumber: number
    actionType: BatchActionType
    label?: string
  }

  const executeOpen = (options: ExecuteOpenOptions) => {
    const { count, batchNumber, actionType } = options
    const sliceUrls = openableUrls.slice(cursor, cursor + count)
    if (sliceUrls.length === 0) return

    const displayStart = cursor + 1
    const displayEnd = cursor + sliceUrls.length
    const label = options.label ?? (actionType === 'remaining' ? 'Remaining' : `Batch ${batchNumber}`)

    setStatus('opening')
    const result: OpenBatchResult = openUrlBatch(sliceUrls)

    // Log to session history with accurate batch metadata
    const historyItem = createBatchHistoryItem({
      batchNumber,
      displayStart,
      displayEnd,
      result,
      actionType,
      label,
    })
    setHistory((prev) => [...prev, historyItem])

    if (result.blocked > 0) {
      setStatus('blocked')
      setBlockedNotice({
        requested: result.requested,
        opened: result.opened,
        blocked: result.blocked,
        blockedUrls: result.blockedUrls,
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

    if (result.opened > 0) {
      setJustOpenedCount(result.opened)
      setTimeout(() => setJustOpenedCount(null), 1600)
    }

    // Advance cursor strictly by successfully opened count
    const newCursor = cursor + result.opened
    setCursor(newCursor)

    setAriaAnnouncement(
      `Opened ${label}. ${newCursor} of ${openableUrls.length} links opened.${
        result.blocked > 0 ? ` ${result.blocked} links blocked by browser popup blocker.` : ''
      }`,
    )
  }

  const handleOpenNext = () => {
    if (
      isComplete ||
      batchSlice.urls.length === 0 ||
      isCustomInvalid ||
      status === 'opening' ||
      blockedNotice !== null
    ) {
      return
    }
    const targetCount = batchSlice.urls.length
    const nextBatchNumber = history.length + 1
    if (targetCount >= CONFIRM_BATCH_THRESHOLD) {
      setConfirmAction({
        count: targetCount,
        isAll: false,
        batchNumber: nextBatchNumber,
        actionType: 'batch',
        label: `Batch ${nextBatchNumber}`,
      })
      setConfirmOpen(true)
    } else {
      executeOpen({
        count: targetCount,
        batchNumber: nextBatchNumber,
        actionType: 'batch',
        label: `Batch ${nextBatchNumber}`,
      })
    }
  }

  const handleRetryBlocked = () => {
    if (!blockedNotice || blockedNotice.blockedUrls.length === 0 || status === 'opening') return
    setStatus('opening')
    const retryResult = openUrlBatch(blockedNotice.blockedUrls)
    const newCursor = cursor + retryResult.opened
    setCursor(newCursor)

    // Update existing batch history item in place
    setHistory((prev) => {
      if (prev.length === 0) return prev
      const lastIndex = prev.length - 1
      const updated = updateBatchHistoryItem(prev[lastIndex], retryResult)
      const next = [...prev]
      next[lastIndex] = updated
      return next
    })

    if (retryResult.opened > 0) {
      setJustOpenedCount(retryResult.opened)
      setTimeout(() => setJustOpenedCount(null), 1600)
    }

    if (retryResult.blocked > 0) {
      setStatus('blocked')
      setBlockedNotice({
        requested: retryResult.requested,
        opened: retryResult.opened,
        blocked: retryResult.blocked,
        blockedUrls: retryResult.blockedUrls,
      })
    } else {
      setStatus(newCursor >= openableUrls.length ? 'complete' : 'opened')
      setBlockedNotice(null)
    }

    setAriaAnnouncement(
      `Retried ${blockedNotice.blockedUrls.length} links: ${retryResult.opened} opened, ${retryResult.blocked} blocked.`,
    )
  }
  const handleOpenAllRemaining = () => {
    if (isComplete || remainingCount === 0 || status === 'opening' || blockedNotice !== null) return
    const cappedCount = Math.min(remainingCount, MAX_CUSTOM_BATCH)
    const nextBatchNumber = history.length + 1
    setConfirmAction({
      count: cappedCount,
      isAll: true,
      batchNumber: nextBatchNumber,
      actionType: 'remaining',
      label: 'Remaining',
    })
    setConfirmOpen(true)
  }

  const handleConfirm = () => {
    if (!confirmAction) return
    const { count, batchNumber, actionType, label } = confirmAction
    setConfirmOpen(false)
    setConfirmAction(null)
    executeOpen({ count, batchNumber, actionType, label })
  }
  const handleReset = () => {
    setCursor(0)
    setStatus('ready')
    setBlockedNotice(null)
    setHistory([])
    setJustOpenedCount(null)
    setAriaAnnouncement(`Reset batch cursor. Opened 0 of ${openableUrls.length} links.`)
  }

  if (allUrls.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-5">
      {/* Header and Progressive Enhancement Desktop Tooltip */}
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 pb-3 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Open links in batch
          </span>
          {!isComplete && openableUrls.length > 0 && (
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              Batch {batchSlice.batchNumber} of {batchSlice.totalBatches}
            </span>
          )}
        </div>

        {/* Desktop Tab Group Progressive Enhancement Tooltip (hidden on mobile) */}
        <div className="hidden sm:flex sm:items-center sm:gap-2">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-zinc-400 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                <FolderPlus size={14} />
                <span>Tab groups</span>
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="top"
                sideOffset={6}
                className="z-50 max-w-xs rounded-lg border border-zinc-200 bg-white p-3 text-xs leading-relaxed text-zinc-700 shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Automatic tab grouping is unavailable to standard websites. You can open links in batches, or connect a browser extension in the future.
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </div>

      {/* Mobile/Tablet Stacked Controls Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Control 1: Batch Size */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={selectId} className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Open per batch
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
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
                className="min-h-11 w-full appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
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

            {batchPreset === 'custom' && (
              <div className="flex items-center">
                <label htmlFor={customInputId} className="sr-only">
                  Custom batch size 1 to 100
                </label>
                <input
                  id={customInputId}
                  type="number"
                  min={1}
                  max={MAX_CUSTOM_BATCH}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="1-100"
                  className={`min-h-11 w-20 rounded-lg border bg-white px-2.5 py-1 text-center text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-zinc-950 ${
                    isCustomInvalid
                      ? 'border-rose-500 text-rose-600 focus-visible:ring-rose-500 dark:border-rose-400 dark:text-rose-300'
                      : 'border-zinc-300 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100'
                  }`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Control 2: Scope Selector */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={scopeSelectId} className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Scope
          </label>
          <div className="relative">
            <select
              id={scopeSelectId}
              value={scope}
              onChange={(e) => setScope(e.target.value as OpenLinksScope)}
              className="min-h-11 w-full appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="current">Current results ({visibleUrls.filter((u) => u.valid).length} valid)</option>
              <option value="all">All valid URLs ({allUrls.filter((u) => u.valid).length} valid)</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
          </div>
        </div>

        {/* Control 3: Occurrence Mode Selector */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={modeSelectId} className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Duplicates
          </label>
          <div className="relative">
            <select
              id={modeSelectId}
              value={duplicateMode === 'all' ? 'total' : duplicateMode}
              onChange={(e) => setDuplicateMode(e.target.value as OccurrenceMode)}
              className="min-h-11 w-full appearance-none rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-zinc-900 shadow-sm transition hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              <option value="total">Total URLs (All occurrences)</option>
              <option value="unique">Unique URLs (Skip duplicates)</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
          </div>
        </div>
      </div>

      {/* Primary Actions & Status Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Open Next Button */}
          <button
            type="button"
            disabled={
              isComplete ||
              batchSlice.urls.length === 0 ||
              isCustomInvalid ||
              status === 'opening' ||
              blockedNotice !== null
            }
            onClick={handleOpenNext}
            aria-label={
              blockedNotice
                ? `Please retry ${blockedNotice.blocked} blocked links before continuing`
                : isComplete
                  ? `All ${openableUrls.length} links opened`
                  : `Open next ${batchSlice.urls.length} links (items ${batchSlice.displayStart} to ${batchSlice.displayEnd})`
            }
            className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:flex-initial ${
              isComplete
                ? 'bg-emerald-600 text-white dark:bg-emerald-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
            }`}
          >
            {status === 'opening' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isComplete || justOpenedCount !== null ? (
              <Check size={16} />
            ) : (
              <ExternalLink size={16} />
            )}
            <span>
              {status === 'opening'
                ? 'Opening…'
                : blockedNotice !== null
                  ? `Blocked (${blockedNotice.blocked} pending retry)`
                  : isComplete
                    ? 'All opened ✓'
                    : justOpenedCount !== null
                      ? `${justOpenedCount} links opened ✓`
                      : `Open next ${batchSlice.urls.length}`}
            </span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            disabled={cursor === 0 && history.length === 0}
            onClick={handleReset}
            aria-label="Reset batch cursor to beginning"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>

        {/* Secondary actions & History Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          {remainingCount > 0 && remainingCount !== batchSlice.urls.length && (
            <button
              type="button"
              disabled={blockedNotice !== null}
              onClick={handleOpenAllRemaining}
              className="min-h-11 rounded-lg px-2 text-xs font-semibold text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Open all remaining ({remainingCount > MAX_CUSTOM_BATCH ? `${MAX_CUSTOM_BATCH} max` : remainingCount})
            </button>
          )}

          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              aria-expanded={showHistory}
              aria-label="Toggle batch history log"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <History size={13} />
              <span>{history.length} {history.length === 1 ? 'batch' : 'batches'} opened</span>
              {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* Progress & Next Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200/80 pt-3 text-xs text-zinc-600 dark:border-zinc-800/80 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {isComplete ? `All ${openableUrls.length} links opened` : `${cursor} / ${openableUrls.length} opened`}
          </span>
          {blockedNotice ? (
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              ({blockedNotice.blocked} blocked in current batch — retry required)
            </span>
          ) : !isComplete && openableUrls.length > 0 ? (
            <span className="font-medium text-zinc-500 dark:text-zinc-400">
              Next: {batchSlice.displayStart}–{batchSlice.displayEnd}
            </span>
          ) : null}
        </div>

        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
          Scope: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{scope === 'current' ? 'Current' : 'All'}</span>
          {' '}• Duplicates: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{duplicateMode === 'unique' ? 'Unique' : 'Total'}</span>
        </div>
      </div>

      {/* Popup Blocker Alert Notification with Primary Retry Button */}
      {blockedNotice && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-950 dark:text-amber-100">
                Browser blocked {blockedNotice.blocked} links
              </p>
              <p className="leading-relaxed text-amber-900 dark:text-amber-200">
                Your browser blocked some tabs. Allow pop-ups for Linkcount and try the remaining links again.
              </p>
              <p className="font-medium text-amber-800 dark:text-amber-300">
                Requested: {blockedNotice.requested} • Opened: {blockedNotice.opened} • Blocked: {blockedNotice.blocked}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 sm:justify-end">
            <button
              type="button"
              onClick={handleRetryBlocked}
              disabled={status === 'opening'}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none sm:flex-initial"
            >
              <RotateCcw size={15} />
              <span>Retry {blockedNotice.blocked} blocked</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-white px-4 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 active:scale-[0.98] motion-reduce:transition-none dark:border-amber-800 dark:bg-zinc-900 dark:text-amber-200 dark:hover:bg-zinc-800"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Session Batch History Drawer */}
      <AnimatePresence initial={false}>
        {showHistory && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.16 }}
            className="overflow-hidden border-t border-zinc-200 pt-3 dark:border-zinc-800"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Opened batches in this session
              </span>
              <ul className="divide-y divide-zinc-200/60 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800/60 dark:border-zinc-800 dark:bg-zinc-950">
                {history.map((item) => (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-between px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {item.status === 'complete' ? (
                        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check size={13} strokeWidth={2.5} />
                          <span>{item.label}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                          <AlertTriangle size={13} />
                          <span>{item.label}</span>
                        </span>
                      )}
                      <span className="text-zinc-500 dark:text-zinc-400">Links {item.displayStart}–{item.displayEnd}</span>
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-400">
                      {item.opened} opened · {item.blocked} blocked
                    </div>
                  </motion.li>
                ))}
                {shouldShowNextBatch({
                  isComplete,
                  hasBlockedNotice: blockedNotice !== null,
                  remainingUrlsCount: remainingCount,
                }) && (
                  <li className="flex items-center justify-between bg-zinc-50/50 px-3 py-2 text-xs font-medium text-indigo-700 dark:bg-zinc-900/50 dark:text-indigo-300">
                    <div className="flex items-center gap-2">
                      <span>→ Batch {history.length + 1} (Next)</span>
                      <span className="text-zinc-500 dark:text-zinc-400">Links {batchSlice.displayStart}–{batchSlice.displayEnd}</span>
                    </div>
                    <span>{batchSlice.urls.length} links queued</span>
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Reader Announcement */}
      <p aria-live="polite" className="sr-only">
        {ariaAnnouncement}
      </p>

      {/* Safety Confirmation Dialog for batches >= 30 */}
      <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl focus:outline-none dark:border-zinc-800 dark:bg-zinc-900">
            <AlertDialog.Title className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Open {confirmAction?.count} links?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {confirmAction?.isAll
                ? `You are about to open ${confirmAction.count} links. Opening many links simultaneously may consume significant memory and slow down your browser.`
                : `Opening ${confirmAction?.count} links simultaneously may use significant memory. Are you sure you want to proceed?`}
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
                  Open {confirmAction?.count} links
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}
