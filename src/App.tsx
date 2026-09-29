import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Check,
  Clipboard,
  Copy,
  Download,
  ExternalLink,
  Github,
  Link2,
  Loader2,
  Moon,
  Scissors,
  Search,
  Sun,
} from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { countDomains, parseUrls } from './lib/urls'
import { shortenBatch, shortenOne, type ShortenEntry } from './lib/shorten'

function StatCard({ label, value, index = 0 }: { label: string; value: number; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 + index * 0.05 }}
      className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{label}</div>
      <motion.div
        key={value}
        initial={{ opacity: 0.3, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-2xl font-semibold tracking-tight"
        aria-live="polite"
      >
        {value}
      </motion.div>
    </motion.div>
  )
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-zinc-200 bg-white transition hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={8}
          className="z-50 rounded-lg bg-zinc-950 px-2.5 py-1.5 text-xs text-white shadow-lg"
        >
          {label}
          <Tooltip.Arrow className="fill-zinc-950" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export default function App() {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'valid' | 'invalid' | 'duplicate'>('all')
  const [copied, setCopied] = useState<string | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)
  const [showAllDomains, setShowAllDomains] = useState(false)
  const [shortened, setShortened] = useState<Record<string, ShortenEntry>>({})
  const [shortenActive, setShortenActive] = useState(false)
  const [shortenProgress, setShortenProgress] = useState({ done: 0, total: 0 })
  const shortenRun = useRef(0)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const urls = useMemo(() => parseUrls(input), [input])
  const uniqueCount = useMemo(() => new Set(urls.map((u) => u.normalized)).size, [urls])
  const duplicates = urls.filter((u) => u.duplicate).length
  const invalid = urls.filter((u) => !u.valid).length
  const domainCounts = useMemo(() => countDomains(urls), [urls])
  const domains = domainCounts.size

  const visibleUrls = urls.filter((item) => {
    const q = query.trim().toLowerCase()
    const matchesQuery =
      !q ||
      item.normalized.toLowerCase().includes(q) ||
      item.domain.toLowerCase().includes(q)

    const matchesFilter =
      filter === 'all' ||
      (filter === 'valid' && item.valid) ||
      (filter === 'invalid' && !item.valid) ||
      (filter === 'duplicate' && item.duplicate)

    return matchesQuery && matchesFilter
  })

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const copyText = async (text: string, key: string) => {
    setCopyError(null)
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      } catch {
        setCopyError('Copy failed — your browser blocked clipboard access.')
        return
      }
    }
    setCopied(key)
    window.setTimeout(() => setCopied(null), 1400)
  }

  const exportFile = (type: 'txt' | 'csv') => {
    const body =
      type === 'txt'
        ? urls.map((u) => u.normalized).join('\n')
        : '\uFEFF' +
          ['url,domain,valid,duplicate', ...urls.map((u) =>
            [u.normalized, u.domain, u.valid, u.duplicate]
              .map((v) => `"${String(v).replaceAll('"', '""')}"`)
              .join(',')
          )].join('\n')

    const blob = new Blob([body], { type: type === 'txt' ? 'text/plain;charset=utf-8' : 'text/csv;charset=utf-8' })
    const href = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.download = `linkcount-export.${type}`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(href)
  }

  const domainEntries = [...domainCounts.entries()]
  const topDomains = domainEntries.slice(0, 5)
  const restDomains = domainEntries.slice(5)

  const uniqueValid = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const u of urls) {
      if (!u.valid) continue
      if (seen.has(u.normalized)) continue
      seen.add(u.normalized)
      out.push(u.normalized)
    }
    return out
  }, [urls])

  const shortenedDone = useMemo(
    () => uniqueValid.filter((u) => shortened[u]?.status === 'done'),
    [uniqueValid, shortened],
  )

  const shortenSingle = async (longUrl: string) => {
    const run = ++shortenRun.current
    setShortened((prev) => ({ ...prev, [longUrl]: { status: 'shortening' } }))
    try {
      const shortUrl = await shortenOne(longUrl)
      if (shortenRun.current !== run) return
      setShortened((prev) => ({ ...prev, [longUrl]: { status: 'done', shortUrl } }))
    } catch (err) {
      if (shortenRun.current !== run) return
      setShortened((prev) => ({
        ...prev,
        [longUrl]: { status: 'failed', error: err instanceof Error ? err.message : 'Failed' },
      }))
    }
  }

  const shortenAllUrls = async () => {
    if (shortenActive || uniqueValid.length === 0) return
    const run = ++shortenRun.current
    const targets = uniqueValid.filter((u) => shortened[u]?.status !== 'done')
    setShortenActive(true)
    setShortenProgress({ done: 0, total: targets.length })
    await shortenBatch(
      targets,
      (index, entry, done, total) => {
        if (shortenRun.current !== run) return
        const url = targets[index]
        setShortened((prev) => ({ ...prev, [url]: entry }))
        setShortenProgress({ done, total })
      },
      { isCancelled: () => shortenRun.current !== run },
    )
    if (shortenRun.current === run) setShortenActive(false)
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-700 bg-zinc-950 text-white dark:border-zinc-200 dark:bg-white dark:text-zinc-950">
              <Link2 size={19} strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-semibold tracking-tight">Linkcount</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">URL utility, without the clutter</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <IconButton label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </IconButton>
            <a
              aria-label="Open GitHub repository"
              href="https://github.com/kainapat/url-link-counter"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <Github size={18} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </motion.header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 max-w-2xl"
        >
          <p className="mb-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">Analyze URLs</p>
          <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Paste links. See what is actually there.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base">
            Count URLs, inspect duplicates, validate links, search results and export them — without changing your source list.
          </p>
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,.5fr)]">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
          >
            <label htmlFor="url-input" className="mb-2 block text-sm font-medium">
              URLs or text containing URLs
            </label>
            <textarea
              id="url-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"Paste anything here…\nhttps://github.com/kainapat/url-link-counter\nhttps://example.com/docs"}
              className="min-h-72 w-full resize-y rounded-lg border border-zinc-300 bg-zinc-50 p-4 text-[15px] leading-7 text-zinc-900 transition placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Duplicate links are detected, never removed.
              </p>
              <button
                type="button"
                onClick={() => setInput('')}
                className="min-h-11 rounded-lg px-4 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Clear
              </button>
            </div>
          </motion.div>

          <aside className="grid grid-cols-2 gap-3 lg:grid-cols-1" aria-label="URL statistics">
            <StatCard label="Total URLs" value={urls.length} index={0} />
            <StatCard label="Unique" value={uniqueCount} index={1} />
            <StatCard label="Duplicates" value={duplicates} index={2} />
            <StatCard label="Domains" value={domains} index={3} />
            <StatCard label="Invalid" value={invalid} index={4} />
          </aside>
        </section>

        <section aria-label="Domain breakdown" className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold tracking-tight">Domains</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {domains === 0 ? 'No domains yet' : `${domains} unique`}
            </p>
          </div>
          {domainEntries.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Paste URLs above to see per-domain counts.
            </p>
          ) : (
            <>
              <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                {topDomains.map(([domain, count]) => (
                  <li key={domain} className="flex min-w-0 items-center justify-between gap-3 py-2">
                    <button
                      type="button"
                      onClick={() => { setQuery(domain); setFilter('all') }}
                      title={`Search ${domain}`}
                      className="min-w-0 flex-1 truncate rounded text-left text-sm font-medium hover:underline focus-visible:underline"
                    >
                      {domain}
                    </button>
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
              <AnimatePresence initial={false}>
                {showAllDomains && restDomains.length > 0 && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="divide-y divide-zinc-100 overflow-hidden dark:divide-zinc-800"
                  >
                    {restDomains.map(([domain, count]) => (
                      <li key={domain} className="flex min-w-0 items-center justify-between gap-3 py-2">
                        <button
                          type="button"
                          onClick={() => { setQuery(domain); setFilter('all') }}
                          title={`Search ${domain}`}
                          className="min-w-0 flex-1 truncate rounded text-left text-sm font-medium hover:underline focus-visible:underline"
                        >
                          {domain}
                        </button>
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                          {count}
                        </span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
              {domainEntries.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllDomains((v) => !v)}
                  aria-expanded={showAllDomains}
                  className="mt-2 min-h-11 rounded-lg px-3 text-sm font-medium text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-zinc-800"
                >
                  {showAllDomains ? `Show less` : `Show all ${domainEntries.length} domains`}
                </button>
              )}
            </>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 border-b border-zinc-200 p-4 dark:border-zinc-800 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold tracking-tight">Results</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {visibleUrls.length} of {urls.length} links shown
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
                <label htmlFor="search-results" className="sr-only">Search results</label>
                <input
                  id="search-results"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search URLs or domains"
                  className="min-h-11 w-full rounded-lg border border-zinc-300 bg-transparent pl-9 pr-3 text-sm sm:w-64 dark:border-zinc-700"
                />
              </div>

              <label className="sr-only" htmlFor="result-filter">Filter results</label>
              <select
                id="result-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="min-h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                <option value="all">All</option>
                <option value="valid">Valid</option>
                <option value="invalid">Invalid</option>
                <option value="duplicate">Duplicate</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-zinc-200 p-4 dark:border-zinc-800 sm:px-6" role="toolbar" aria-label="Bulk actions">
            <button
              type="button"
              disabled={!urls.length}
              onClick={() => copyText(urls.map((u) => u.normalized).join('\n'), 'all')}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {copied === 'all' ? <Check size={17} /> : <Clipboard size={17} />}
              {copied === 'all' ? 'Copied' : 'Copy all'}
            </button>

            <button
              type="button"
              disabled={!urls.length}
              onClick={() => exportFile('txt')}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-300 px-4 text-sm font-medium transition active:scale-[0.98] disabled:opacity-40 dark:border-zinc-700"
            >
              <Download size={17} />
              TXT
            </button>

            <button
              type="button"
              disabled={!urls.length}
              onClick={() => exportFile('csv')}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-300 px-4 text-sm font-medium transition active:scale-[0.98] disabled:opacity-40 dark:border-zinc-700"
            >
              <Download size={17} />
              CSV
            </button>

            <button
              type="button"
              disabled={uniqueValid.length === 0 || shortenActive}
              onClick={shortenAllUrls}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-300 px-4 text-sm font-medium transition active:scale-[0.98] disabled:opacity-40 dark:border-zinc-700"
            >
              {shortenActive ? <Loader2 size={17} className="animate-spin" /> : <Scissors size={17} />}
              {shortenActive ? `Shortening ${shortenProgress.done}/${shortenProgress.total}` : 'Shorten all'}
            </button>

            {shortenedDone.length > 0 && (
              <button
                type="button"
                onClick={() => copyText(shortenedDone.map((u) => shortened[u]?.shortUrl ?? u).join('\n'), 'short-all')}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-300 px-4 text-sm font-medium transition active:scale-[0.98] dark:border-zinc-700"
              >
                {copied === 'short-all' ? <Check size={17} /> : <Clipboard size={17} />}
                {copied === 'short-all' ? 'Copied' : `Copy shortened (${shortenedDone.length})`}
              </button>
            )}
          </div>
          <p aria-live="polite" className="sr-only">
            {shortenActive
              ? `Shortening URLs, ${shortenProgress.done} of ${shortenProgress.total} done.`
              : shortenedDone.length > 0
                ? `${shortenedDone.length} shortened URLs ready.`
                : ''}
          </p>
          {copyError && (
            <p role="alert" className="border-b border-zinc-200 px-4 py-2 text-sm text-rose-700 dark:border-zinc-800 dark:text-rose-300 sm:px-6">
              {copyError}
            </p>
          )}

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <AnimatePresence initial={false}>
              {visibleUrls.map((item, index) => (
                <motion.article
                  key={`${item.normalized}-${index}`}
                  initial={index < 60 ? { opacity: 0, y: 6 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16, delay: index < 40 ? Math.min(index * 0.015, 0.3) : 0 }}
                  className="grid gap-3 p-4 transition-colors hover:bg-zinc-50 sm:p-6 lg:grid-cols-[44px_minmax(0,1fr)_180px_140px_minmax(0,auto)] lg:items-center dark:hover:bg-zinc-800/40"
                >
                  <div className="text-xs tabular-nums text-zinc-400">#{index + 1}</div>

                  <div className="min-w-0">
                    <a
                      href={item.valid ? item.normalized : undefined}
                      target="_blank"
                      rel="noreferrer"
                      title={item.normalized}
                      className="group flex min-w-0 items-center gap-2 font-medium"
                    >
                      <span className="block truncate">{item.normalized}</span>
                      {item.valid && <ExternalLink aria-hidden="true" className="shrink-0 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100" size={15} />}
                    </a>
                    {item.valid && shortened[item.normalized]?.status === 'done' && (
                      <p className="mt-1 truncate text-sm text-indigo-700 dark:text-indigo-300" title={shortened[item.normalized]?.shortUrl}>
                        → {shortened[item.normalized]?.shortUrl}
                      </p>
                    )}
                    {item.valid && shortened[item.normalized]?.status === 'failed' && (
                      <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
                        Shorten failed{shortened[item.normalized]?.error ? ` — ${shortened[item.normalized]?.error}` : ''}. Try again.
                      </p>
                    )}
                  </div>

                  <div className="truncate text-sm text-zinc-600 dark:text-zinc-400" title={item.domain}>{item.domain}</div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      item.valid
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                    }`}>
                      {item.valid ? 'Valid' : 'Invalid'}
                    </span>
                    {item.duplicate && (
                      <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                        Duplicate
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 lg:justify-end">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={copied === `row-${index}` ? 'check' : 'copy'}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.12 }}
                        className="inline-flex"
                      >
                        <IconButton
                          label="Copy URL"
                          onClick={() => copyText(item.normalized, `row-${index}`)}
                        >
                          {copied === `row-${index}` ? <Check size={17} /> : <Copy size={17} />}
                        </IconButton>
                      </motion.span>
                    </AnimatePresence>
                    {item.valid && (
                      <IconButton
                        label={
                          shortened[item.normalized]?.status === 'shortening'
                            ? 'Shortening…'
                            : shortened[item.normalized]?.status === 'done'
                              ? 'Shorten again'
                              : 'Shorten URL'
                        }
                        onClick={() => shortenSingle(item.normalized)}
                      >
                        {shortened[item.normalized]?.status === 'shortening' ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : shortened[item.normalized]?.status === 'done' ? (
                          <Check size={17} />
                        ) : (
                          <Scissors size={17} />
                        )}
                      </IconButton>
                    )}
                    {item.valid && shortened[item.normalized]?.status === 'done' && (
                      <IconButton
                        label="Copy shortened URL"
                        onClick={() => copyText(shortened[item.normalized]?.shortUrl ?? item.normalized, `short-${index}`)}
                      >
                        {copied === `short-${index}` ? <Check size={17} /> : <Clipboard size={17} />}
                      </IconButton>
                    )}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>

            {!visibleUrls.length && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <Link2 size={20} />
                </div>
                <p className="mt-4 font-medium">
                  {urls.length ? 'No links match this filter' : 'No URLs yet'}
                </p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {urls.length ? 'Try another search or filter.' : 'Paste text above and results appear instantly.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
