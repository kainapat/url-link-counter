# Linkcount v2

A focused URL utility for counting, inspecting, filtering and exporting links from pasted text.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Radix Tooltip
- Motion
- Lucide Icons

## Features

- Total URL count
- Unique URL count
- Duplicate detection
- Domain count + per-domain breakdown (top 5 + show all)
- Valid / invalid detection (`http(s)://` only; scheme-less text is ignored)
- Markdown link support — `[label](destination)` counts destination only
- Markdown autolink support — `<https://example.com>`
- URL shortener (TinyURL, max 5 concurrent requests, per-item + shorten all)
- Search
- Filter by status
- Copy individual links
- Copy all links
- Copy shortened links (per-item + all)
- Export TXT
- Export CSV
- Dark / light theme
- Responsive layout
- Keyboard-friendly controls
- Reduced-motion support (`MotionConfig reducedMotion="user"` + CSS fallback)
- Accessible labels and focus states

> Duplicate links are detected but never removed.

## Parser

`src/lib/urls.ts` runs a pipeline: markdown links → autolinks → plain
`http(s)://` URLs (skipping consumed ranges) → wrapper cleanup → validate →
duplicate analysis. Only the markdown *destination* is counted, so
`[https://a.com](https://b.com)` yields `https://b.com`. Query strings and
fragments are preserved verbatim; trailing `; : ! ?` are never stripped.

## Run locally

```bash
npm install
npm run dev
```

Tests (Vitest, runs against the real parser module):

```bash
npm run test
```

Build:

```bash
npm run build
```

## Branch target

Designed for the `Chatgpt` branch of `kainapat/url-link-counter`.
