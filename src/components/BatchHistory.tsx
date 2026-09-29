import { AnimatePresence, motion } from 'motion/react'
import { AlertTriangle, Check, ChevronDown, ChevronUp, History } from 'lucide-react'
import type { BatchHistoryItem } from '../lib/openLinks'

export type BatchHistoryProps = {
  history: BatchHistoryItem[]
  isOpen: boolean
  onToggle: () => void
  shouldShowNext: boolean
  nextBatchNumber: number
  nextDisplayStart: number
  nextDisplayEnd: number
  nextCount: number
}

export function BatchHistory({
  history,
  isOpen,
  onToggle,
  shouldShowNext,
  nextBatchNumber,
  nextDisplayStart,
  nextDisplayEnd,
  nextCount,
}: BatchHistoryProps) {
  if (history.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg text-xs font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <History size={13} />
          <span>{history.length} {history.length === 1 ? 'batch' : 'batches'} opened</span>
          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.16 }}
            className="overflow-hidden"
          >
            <ul className="divide-y divide-zinc-200/70 rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:divide-zinc-800/70 dark:border-zinc-800 dark:bg-zinc-950">
              {history.map((item) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.14 }}
                  className="flex items-center justify-between px-3.5 py-2.5 text-xs"
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
                    <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      Links {item.displayStart}–{item.displayEnd}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">{item.opened}</span> opened
                    {item.blocked > 0 && (
                      <span className="ml-1 text-rose-600 dark:text-rose-400 font-medium">
                        ({item.blocked} blocked)
                      </span>
                    )}
                  </div>
                </motion.li>
              ))}

              {shouldShowNext && (
                <li className="flex items-center justify-between bg-zinc-50/60 px-3.5 py-2 text-xs font-medium text-indigo-700 dark:bg-zinc-900/50 dark:text-indigo-300">
                  <div className="flex items-center gap-2">
                    <span>→ Batch {nextBatchNumber} (Next)</span>
                    <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                      Links {nextDisplayStart}–{nextDisplayEnd}
                    </span>
                  </div>
                  <span className="text-[11px] opacity-75">{nextCount} queued</span>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
