import { motion } from 'motion/react'
import {
  Check,
  Clipboard,
  Download,
  Loader2,
  Scissors,
  Search,
} from 'lucide-react'
import type { OccurrenceMode } from '../lib/openLinks'

export type ResultsToolbarProps = {
  occurrenceMode: OccurrenceMode
  onModeChange: (mode: OccurrenceMode) => void
  query: string
  onQueryChange: (q: string) => void
  filter: 'all' | 'valid' | 'invalid' | 'duplicate'
  onFilterChange: (f: 'all' | 'valid' | 'invalid' | 'duplicate') => void
  urlsCount: number
  copiedKey: string | null
  onCopyAll: () => void
  onExport: (type: 'txt' | 'csv') => void
  shortenActive: boolean
  shortenProgress: { done: number; total: number }
  shortenTargetsCount: number
  onShortenAll: () => void
  shortenedDoneCount: number
  onCopyShortened: () => void
}

export function ResultsToolbar({
  occurrenceMode,
  onModeChange,
  query,
  onQueryChange,
  filter,
  onFilterChange,
  urlsCount,
  copiedKey,
  onCopyAll,
  onExport,
  shortenActive,
  shortenProgress,
  shortenTargetsCount,
  onShortenAll,
  shortenedDoneCount,
  onCopyShortened,
}: ResultsToolbarProps) {
  return (
    <div className="flex flex-col gap-3.5 border-b border-zinc-200/80 p-4 dark:border-zinc-800/80 sm:p-5">
      {/* Upper toolbar: Segmented Mode Selector & Search/Filter */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Mode Segmented Control (Total URLs vs Unique URLs) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Mode:</span>
          <div
            role="group"
            aria-label="URL occurrence mode"
            className="inline-flex rounded-lg border border-zinc-200/80 bg-zinc-100/80 p-0.5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <button
              type="button"
              onClick={() => onModeChange('total')}
              aria-pressed={occurrenceMode === 'total'}
              className={`relative min-h-8 rounded-md px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                occurrenceMode === 'total'
                  ? 'text-zinc-950 dark:text-zinc-50'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {occurrenceMode === 'total' && (
                <motion.div
                  layoutId="activeModePill"
                  className="absolute inset-0 rounded-md bg-white shadow-xs dark:bg-zinc-800"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">Total URLs</span>
            </button>

            <button
              type="button"
              onClick={() => onModeChange('unique')}
              aria-pressed={occurrenceMode === 'unique'}
              className={`relative min-h-8 rounded-md px-3 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                occurrenceMode === 'unique'
                  ? 'text-zinc-950 dark:text-zinc-50'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              {occurrenceMode === 'unique' && (
                <motion.div
                  layoutId="activeModePill"
                  className="absolute inset-0 rounded-md bg-white shadow-xs dark:bg-zinc-800"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">Unique URLs</span>
            </button>
          </div>
        </div>

        {/* Search & Type Filter Controls */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400"
            />
            <label htmlFor="search-results" className="sr-only">
              Search results
            </label>
            <input
              id="search-results"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search URLs or domains…"
              className="min-h-10 w-full rounded-lg border border-zinc-200/90 bg-white pr-3 pl-9 text-xs text-zinc-900 shadow-2xs transition placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="relative">
            <label htmlFor="result-filter" className="sr-only">
              Filter results
            </label>
            <select
              id="result-filter"
              value={filter}
              onChange={(e) => onFilterChange(e.target.value as typeof filter)}
              className="min-h-10 w-full rounded-lg border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-800 shadow-2xs transition hover:border-zinc-300 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="all">All links</option>
              <option value="valid">Valid only</option>
              <option value="invalid">Invalid only</option>
              <option value="duplicate">Duplicates only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lower toolbar: Bulk Action Buttons */}
      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Bulk actions">
        {/* Copy All */}
        <button
          type="button"
          disabled={urlsCount === 0}
          onClick={onCopyAll}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-800 shadow-2xs transition hover:bg-zinc-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
        >
          {copiedKey === 'all' ? <Check size={14} className="text-emerald-600" /> : <Clipboard size={14} />}
          <span>{copiedKey === 'all' ? 'Copied' : 'Copy all'}</span>
        </button>

        {/* Export TXT */}
        <button
          type="button"
          disabled={urlsCount === 0}
          onClick={() => onExport('txt')}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-800 shadow-2xs transition hover:bg-zinc-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
        >
          <Download size={14} />
          <span>TXT</span>
        </button>

        {/* Export CSV */}
        <button
          type="button"
          disabled={urlsCount === 0}
          onClick={() => onExport('csv')}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-800 shadow-2xs transition hover:bg-zinc-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
        >
          <Download size={14} />
          <span>CSV</span>
        </button>

        {/* Shorten All */}
        <button
          type="button"
          disabled={shortenTargetsCount === 0 || shortenActive}
          onClick={onShortenAll}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3 text-xs font-medium text-zinc-800 shadow-2xs transition hover:bg-zinc-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800/80"
        >
          {shortenActive ? <Loader2 size={14} className="animate-spin" /> : <Scissors size={14} />}
          <span>
            {shortenActive
              ? `Shortening ${shortenProgress.done}/${shortenProgress.total}`
              : 'Shorten all'}
          </span>
        </button>

        {/* Copy Shortened (if any available) */}
        {shortenedDoneCount > 0 && (
          <button
            type="button"
            onClick={onCopyShortened}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 px-3 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100/60 active:scale-[0.98] dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
          >
            {copiedKey === 'short-all' ? (
              <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Clipboard size={14} />
            )}
            <span>
              {copiedKey === 'short-all' ? 'Copied' : `Copy shortened (${shortenedDoneCount})`}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
