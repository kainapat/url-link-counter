import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, MotionConfig } from 'motion/react'
import { Toaster, toast } from 'sonner'
import { countDomains, parseUrls } from './lib/urls'
import { getDoneShortenedUrls, shortenBatch, shortenOne, type ShortenEntry } from './lib/shorten'
import { DEFAULT_OCCURRENCE_MODE, type OccurrenceMode } from './lib/openLinks'
import { AppHeader } from './components/AppHeader'
import { StatsBar } from './components/StatsBar'
import { UrlWorkspace } from './components/UrlWorkspace'
import { ResultsToolbar } from './components/ResultsToolbar'
import { OpenLinksControl } from './components/OpenLinksControl'
import { ResultRow } from './components/ResultRow'

export default function App() {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'valid' | 'invalid' | 'duplicate'>('all')
  const [copied, setCopied] = useState<string | null>(null)
  const [occurrenceMode, setOccurrenceMode] = useState<OccurrenceMode>(DEFAULT_OCCURRENCE_MODE)
  const [shortened, setShortened] = useState<Record<string, ShortenEntry>>({})
  const [shortenActive, setShortenActive] = useState(false)
  const [shortenProgress, setShortenProgress] = useState({ done: 0, total: 0 })
  const batchRun = useRef(0)
  const singleRuns = useRef<Record<string, number>>({})
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  // Desktop subtle spotlight coordinates
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only enable pointer spotlight on non-touch desktop devices
    if (window.matchMedia('(pointer: coarse)').matches) return
    const el = containerRef.current
    if (!el) return

    let rafId: number | null = null
    const handlePointerMove = (e: PointerEvent) => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--spotlight-x', `${e.clientX - rect.left}px`)
        el.style.setProperty('--spotlight-y', `${e.clientY - rect.top}px`)
      })
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  // Core URL parsing (cached on input changes)
  const urls = useMemo(() => parseUrls(input), [input])
  const uniqueCount = useMemo(() => new Set(urls.map((u) => u.normalized)).size, [urls])
  const duplicates = urls.filter((u) => u.duplicate).length
  const invalid = urls.filter((u) => !u.valid).length
  const domainCounts = useMemo(() => countDomains(urls), [urls])
  const domains = domainCounts.size

  // Filtered & searched URLs
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
    toast(next ? 'Dark mode enabled' : 'Light mode enabled')
  }

  const copyText = async (text: string, key: string, successMessage = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      toast.success(successMessage)
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
        setCopied(key)
        toast.success(successMessage)
      } catch {
        toast.error('Copy failed — your browser blocked clipboard access')
        return
      }
    }
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
    toast.success(`Exported ${urls.length} links to ${type.toUpperCase()}`)
  }

  const domainEntries = [...domainCounts.entries()]
  const topDomains = domainEntries.slice(0, 5)

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

  const shortenedDoneList = useMemo(
    () => getDoneShortenedUrls(urls, shortened, occurrenceMode),
    [urls, shortened, occurrenceMode],
  )

  const shortenTargets = useMemo(
    () => uniqueValid.filter((u) => shortened[u]?.status !== 'done'),
    [uniqueValid, shortened],
  )

  const shortenSingle = async (longUrl: string) => {
    const run = (singleRuns.current[longUrl] = (singleRuns.current[longUrl] || 0) + 1)
    setShortened((prev) => ({ ...prev, [longUrl]: { status: 'shortening' } }))
    try {
      const shortUrl = await shortenOne(longUrl)
      if (singleRuns.current[longUrl] !== run) return
      setShortened((prev) => ({ ...prev, [longUrl]: { status: 'done', shortUrl } }))
      toast.success('Link shortened')
    } catch (err) {
      if (singleRuns.current[longUrl] !== run) return
      setShortened((prev) => ({
        ...prev,
        [longUrl]: { status: 'failed', error: err instanceof Error ? err.message : 'Failed' },
      }))
      toast.error('Shorten failed')
    }
  }

  const shortenAllUrls = async () => {
    if (shortenActive || shortenTargets.length === 0) return
    const run = ++batchRun.current
    const targets = shortenTargets
    setShortenActive(true)
    setShortenProgress({ done: 0, total: targets.length })
    await shortenBatch(
      targets,
      (index, entry, done, total) => {
        if (batchRun.current !== run) return
        const url = targets[index]
        setShortened((prev) => ({ ...prev, [url]: entry }))
        setShortenProgress({ done, total })
      },
      { isCancelled: () => batchRun.current !== run },
    )
    if (batchRun.current === run) {
      setShortenActive(false)
      toast.success('Batch shortening complete')
    }
  }

  const openSingleUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // Stagger animation threshold
  const shouldStagger = visibleUrls.length <= 40

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={containerRef}
        className="relative min-h-screen overflow-x-hidden bg-zinc-50/50 text-zinc-900 selection:bg-indigo-500/20 selection:text-indigo-900 dark:bg-zinc-950 dark:text-zinc-100 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-200"
      >
        {/* Subtle Ambient Desktop Spotlight */}
        <div
          className="pointer-events-none fixed inset-0 z-0 hidden transition-opacity duration-300 md:block dark:opacity-40"
          style={{
            background:
              'radial-gradient(600px circle at var(--spotlight-x, 50%) var(--spotlight-y, 30%), rgba(99, 102, 241, 0.04), transparent 80%)',
          }}
        />

        {/* Global App Header */}
        <AppHeader dark={dark} onToggleTheme={toggleTheme} />

        {/* Main Workspace Container */}
        <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
          {/* Workspace Intro Title */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50">
              URL Workspace
            </h1>
            <p className="max-w-2xl text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
              Paste, inspect, deduplicate, shorten, and open links in sequential batches — without modifying your source text.
            </p>
          </div>

          {/* URL Input Workspace */}
          <UrlWorkspace
            input={input}
            onChange={setInput}
            onClear={() => {
              setInput('')
              toast('Workspace cleared')
            }}
            topDomains={topDomains}
            onSelectDomain={(d) => setQuery(d)}
            selectedQuery={query}
          />

          {/* Compact Stats Bar */}
          <StatsBar
            total={urls.length}
            unique={uniqueCount}
            duplicates={duplicates}
            domains={domains}
            invalid={invalid}
          />

          {/* Results Workspace Section */}
          {urls.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              {/* Results Toolbar with Segmented Mode Tabs & Search/Filter */}
              <ResultsToolbar
                occurrenceMode={occurrenceMode}
                onModeChange={(m) => {
                  setOccurrenceMode(m)
                  toast(`Switched to ${m === 'total' ? 'Total URLs' : 'Unique URLs'} mode`)
                }}
                query={query}
                onQueryChange={setQuery}
                filter={filter}
                onFilterChange={setFilter}
                urlsCount={urls.length}
                copiedKey={copied}
                onCopyAll={() =>
                  copyText(
                    urls.map((u) => u.normalized).join('\n'),
                    'all',
                    `Copied ${urls.length} URLs to clipboard`,
                  )
                }
                onExport={exportFile}
                shortenActive={shortenActive}
                shortenProgress={shortenProgress}
                shortenTargetsCount={shortenTargets.length}
                onShortenAll={shortenAllUrls}
                shortenedDoneCount={shortenedDoneList.length}
                onCopyShortened={() =>
                  copyText(
                    shortenedDoneList.join('\n'),
                    'short-all',
                    `Copied ${shortenedDoneList.length} shortened links`,
                  )
                }
              />

              {/* Open Links In Batch Controls */}
              <div className="border-b border-zinc-200/80 p-4 dark:border-zinc-800/80 sm:p-5">
                <OpenLinksControl
                  allUrls={urls}
                  visibleUrls={visibleUrls}
                  query={query}
                  filter={filter}
                  mode={occurrenceMode}
                  onModeChange={setOccurrenceMode}
                />
              </div>

              {/* URL Results Rows */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {visibleUrls.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    No matching links found for this filter or search query.
                  </div>
                ) : (
                  visibleUrls.map((item, index) => (
                    <motion.div
                      key={`${item.normalized}-${index}`}
                      initial={shouldStagger ? { opacity: 0, y: 4 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.14, delay: shouldStagger ? Math.min(index * 0.015, 0.3) : 0 }}
                    >
                      <ResultRow
                        item={item}
                        index={index}
                        copiedKey={copied}
                        shortenEntry={shortened[item.normalized]}
                        onCopy={(text, key) => copyText(text, key, 'Link copied')}
                        onShorten={shortenSingle}
                        onOpen={openSingleUrl}
                      />
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>
          )}
        </main>

        {/* Global Toast Provider */}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          theme={dark ? 'dark' : 'light'}
        />
      </div>
    </MotionConfig>
  )
}
