import { Github, Link2, Moon, Sun } from 'lucide-react'
import * as Tooltip from '@radix-ui/react-tooltip'

export type AppHeaderProps = {
  dark: boolean
  onToggleTheme: () => void
}

export function AppHeader({ dark, onToggleTheme }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-900 text-zinc-50 shadow-sm dark:bg-white dark:text-zinc-950">
            <Link2 size={16} strokeWidth={2.2} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Linkcount
            </span>
            <span className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:inline">
              URL workspace utility
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle Button */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:min-h-11 sm:w-11"
              >
                {dark ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="bottom"
                sideOffset={6}
                className="z-50 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {dark ? 'Switch to light mode' : 'Switch to dark mode'}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          {/* GitHub Link */}
          <a
            href="https://github.com/kainapat/url-link-counter"
            target="_blank"
            rel="noreferrer"
            aria-label="Open GitHub repository"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50/50 px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <Github size={15} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  )
}
