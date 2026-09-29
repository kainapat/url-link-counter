import { AnimatePresence, motion } from 'motion/react'

export type StatsBarProps = {
  total: number
  unique: number
  duplicates: number
  domains: number
  invalid: number
}

function StatItem({
  label,
  value,
  highlight = false,
  badge = false,
}: {
  label: string
  value: number
  highlight?: boolean
  badge?: boolean
}) {
  return (
    <div className="flex flex-col items-start justify-center py-2 px-3 sm:px-4">
      <div className="flex items-center gap-1.5 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.14 }}
            className={`text-xl font-bold tracking-tight sm:text-2xl ${
              highlight
                ? 'text-indigo-600 dark:text-indigo-400'
                : badge && value > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-zinc-900 dark:text-zinc-100'
            }`}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
    </div>
  )
}

export function StatsBar({
  total,
  unique,
  duplicates,
  domains,
  invalid,
}: StatsBarProps) {
  return (
    <div className="w-full rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/40">
      <div className="grid grid-cols-2 divide-x divide-y divide-zinc-200/60 dark:divide-zinc-800/60 sm:grid-cols-5 sm:divide-y-0">
        <div className="col-span-2 border-b border-zinc-200/60 p-1 dark:border-zinc-800/60 sm:col-span-1 sm:border-b-0">
          <StatItem label="Total URLs" value={total} highlight />
        </div>
        <div className="p-1">
          <StatItem label="Unique" value={unique} />
        </div>
        <div className="p-1">
          <StatItem label="Duplicates" value={duplicates} badge />
        </div>
        <div className="p-1">
          <StatItem label="Domains" value={domains} />
        </div>
        <div className="p-1">
          <StatItem label="Invalid" value={invalid} badge={invalid > 0} />
        </div>
      </div>
    </div>
  )
}
