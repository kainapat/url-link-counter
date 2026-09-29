import { AlertTriangle, RotateCcw } from 'lucide-react'

export type BlockedAlertProps = {
  requested: number
  opened: number
  blocked: number
  onRetry: () => void
  onReset: () => void
  isOpening?: boolean
}

export function BlockedAlert({
  requested,
  opened,
  blocked,
  onRetry,
  onReset,
  isOpening = false,
}: BlockedAlertProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-xs text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950 dark:text-amber-100">
            Browser blocked {blocked} links
          </p>
          <p className="text-amber-800/90 dark:text-amber-300/90">
            Your browser blocked some tabs from opening. Allow pop-ups for Linkcount and retry the remaining links.
          </p>
          <p className="font-mono text-[11px] text-amber-700 dark:text-amber-400">
            Requested: {requested} • Opened: {opened} • Blocked: {blocked}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 sm:justify-end">
        <button
          type="button"
          onClick={onRetry}
          disabled={isOpening}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial"
        >
          <RotateCcw size={14} />
          <span>Retry {blocked} blocked</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3.5 text-xs font-medium text-amber-900 transition hover:bg-amber-100 active:scale-[0.98] dark:border-amber-800 dark:bg-zinc-900 dark:text-amber-200 dark:hover:bg-zinc-800"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
