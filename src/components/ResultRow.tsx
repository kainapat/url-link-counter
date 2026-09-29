import { Check, Copy, ExternalLink, Loader2, Scissors } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { UrlItem } from '../lib/urls'
import type { ShortenEntry } from '../lib/shorten'

export type ResultRowProps = {
  item: UrlItem
  index: number
  copiedKey: string | null
  shortenEntry?: ShortenEntry
  onCopy: (text: string, key: string) => void
  onShorten: (url: string) => void
  onOpen: (url: string) => void
}

export function ResultRow({
  item,
  index,
  copiedKey,
  shortenEntry,
  onCopy,
  onShorten,
  onOpen,
}: ResultRowProps) {
  const isCopied = copiedKey === `item-${index}`
  const isShortening = shortenEntry?.status === 'shortening'
  const isShortened = shortenEntry?.status === 'done' && shortenEntry.shortUrl

  return (
    <div className="group flex flex-col justify-between gap-3 p-3.5 transition hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      {/* Left Column: Number, Domain, Badges, and Full URL */}
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {/* Index badge */}
        <span className="font-mono text-xs font-semibold text-zinc-400 select-none dark:text-zinc-500">
          #{index + 1}
        </span>

        {/* URL details */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {item.domain}
            </span>

            {/* Validation & Duplication Badges */}
            {item.valid ? (
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Valid
              </span>
            ) : (
              <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                Invalid
              </span>
            )}

            {item.duplicate && (
              <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                Duplicate
              </span>
            )}
          </div>

          {/* Long URL text (truncated with break-all to prevent overflow) */}
          <p className="font-mono text-xs leading-relaxed text-zinc-600 break-all select-all dark:text-zinc-400">
            {item.normalized}
          </p>

          {/* Display Short URL if available */}
          {isShortened && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">Short:</span>
              <a
                href={shortenEntry.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs font-medium text-indigo-700 underline-offset-2 hover:underline dark:text-indigo-300"
              >
                {shortenEntry.shortUrl}
              </a>
            </div>
          )}

          {/* Shorten Error if failed */}
          {shortenEntry?.status === 'failed' && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400">
              {shortenEntry.error ?? 'Shorten failed'}
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Actions (Copy, Shorten, Open) */}
      <div className="flex shrink-0 items-center gap-1.5 sm:self-center">
        {/* Copy Button */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => onCopy(isShortened ? shortenEntry.shortUrl! : item.normalized, `item-${index}`)}
              aria-label={`Copy URL #${index + 1}`}
              className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-zinc-200/80 bg-white p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:min-h-10 sm:min-w-10"
            >
              {isCopied ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="top" sideOffset={5} className="z-50 rounded-md bg-zinc-900 px-2 py-1 text-[11px] text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900">
              {isCopied ? 'Copied' : 'Copy link'}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Shorten Single Button */}
        {item.valid && (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                disabled={isShortening}
                onClick={() => onShorten(item.normalized)}
                aria-label={`Shorten URL #${index + 1}`}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-zinc-200/80 bg-white p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 active:scale-95 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:min-h-10 sm:min-w-10"
              >
                {isShortening ? (
                  <Loader2 size={14} className="animate-spin text-indigo-600" />
                ) : isShortened ? (
                  <Check size={14} className="text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Scissors size={14} />
                )}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="top" sideOffset={5} className="z-50 rounded-md bg-zinc-900 px-2 py-1 text-[11px] text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900">
                {isShortening ? 'Shortening…' : isShortened ? 'Shortened' : 'Shorten URL'}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        )}

        {/* Open Link Button */}
        {item.valid && (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={() => onOpen(item.normalized)}
                aria-label={`Open URL #${index + 1} in new tab`}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-zinc-200/80 bg-white p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 active:scale-95 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:min-h-10 sm:min-w-10"
              >
                <ExternalLink size={14} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="top" sideOffset={5} className="z-50 rounded-md bg-zinc-900 px-2 py-1 text-[11px] text-white shadow-md dark:bg-zinc-100 dark:text-zinc-900">
                Open in tab
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        )}
      </div>
    </div>
  )
}
