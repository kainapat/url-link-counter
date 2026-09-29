import { Eraser } from 'lucide-react'

export type UrlWorkspaceProps = {
  input: string
  onChange: (value: string) => void
  onClear: () => void
  topDomains?: [string, number][]
  onSelectDomain?: (domain: string) => void
  selectedQuery?: string
}

export function UrlWorkspace({
  input,
  onChange,
  onClear,
  topDomains = [],
  onSelectDomain,
  selectedQuery = '',
}: UrlWorkspaceProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Textarea container */}
      <div className="group relative rounded-xl border border-zinc-300 bg-white transition focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-900/60 dark:focus-within:border-zinc-600 dark:focus-within:ring-zinc-100/10">
        <label htmlFor="url-input" className="sr-only">
          URLs or text containing URLs
        </label>
        <textarea
          id="url-input"
          value={input}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            "Paste anything here — Markdown [links](https://...), autolinks <https://...>, or raw URLs\nhttps://github.com/kainapat/url-link-counter\nhttps://example.com/docs"
          }
          className="min-h-56 w-full resize-y rounded-xl bg-transparent p-4 font-mono text-[13.5px] leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500 sm:min-h-64 sm:text-sm"
        />

        {/* Footer inside workspace container */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800/80">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Source integrity: links are detected and counted, never modified or removed.
          </p>

          {input.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 active:scale-[0.98] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <Eraser size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Top domain pills if any */}
      {topDomains.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-medium text-zinc-500 dark:text-zinc-400">Top domains:</span>
          {topDomains.map(([domain, count]) => {
            const isSelected = selectedQuery.toLowerCase() === domain.toLowerCase()
            return (
              <button
                key={domain}
                type="button"
                onClick={() => onSelectDomain?.(isSelected ? '' : domain)}
                className={`inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-xs transition active:scale-95 ${
                  isSelected
                    ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                <span>{domain}</span>
                <span className="opacity-60">({count})</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
