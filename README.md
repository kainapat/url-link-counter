# Linkcount

> Paste links. See what is actually there.

A focused URL utility for counting, inspecting, filtering, shortening, and
exporting links from pasted text — without ever changing your source list.

[![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-tested-6e9f18?logo=vitest&logoColor=white)](https://vitest.dev/)

## Features

**Analyze**

- Total, unique, and duplicate URL counts
- Per-domain breakdown (top 5 + show all, click a domain to search it)
- Valid / invalid detection (`http(s)://` only — scheme-less text is ignored, never guessed)
- Markdown link support: `[label](destination)` counts the destination only
- Markdown autolink support: `<https://example.com>`
- Search across URLs and domains
- Filter by All / Valid / Invalid / Duplicate

**Shorten**

- URL shortener via TinyURL with at most 5 concurrent requests
- Shorten per link or shorten all (valid links only)
- Per-link status: waiting → shortening → done / failed (one failure never stops the batch)
- Live progress (`Shortening 14/50`) with screen-reader announcements
- Copy shortened links per link or all at once

**Export & productivity**

- Copy per link / copy all, export TXT / CSV (UTF-8 BOM, quoted)
- Dark / light theme (persisted, respects system preference)
- Responsive from 320px phones to desktop, touch targets ≥ 44px
- Keyboard-friendly, visible focus, `prefers-reduced-motion` respected

> Duplicate links are detected and badged — never removed.

## Parser

`src/lib/urls.ts` runs an ordered pipeline:

```text
Input
 ↓
Extract Markdown links [label](destination)   → count destination only
 ↓
Extract autolinks <https://…>
 ↓
Extract remaining plain http(s) URLs          → skip consumed ranges
 ↓
Clean wrapper punctuation (balanced-aware)
 ↓
Validate → duplicate analysis (document order preserved)
```

Rules worth knowing:

| Input | Counted as |
|---|---|
| `[https://a.com](https://b.com)` | `https://b.com` (destination only) |
| `[https://example.com](https://example.com)` | 1 URL, not 2 |
| `<https://example.com>` | `https://example.com` |
| `(https://example.com)`, `https://example.com,` | `https://example.com` |
| `https://en.wikipedia.org/wiki/Link_(film)` | kept intact (balanced parens) |
| `https://example.com/?q=test#sec` | query + fragment preserved verbatim |

The cleaner never strips `; : ! ?` unconditionally, and never decodes,
re-encodes, trims slashes, or flips `http` ↔ `https`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run test     # Vitest — runs against the real parser module
npm run build    # tsc + vite build → dist/
npm run preview  # preview the production build
```

## Project structure

```text
src/
├── App.tsx          # UI: input, stats, domains, results, shortener
├── main.tsx         # entry (MotionConfig reducedMotion="user")
├── index.css        # theme, faint grid + top glow, focus, reduced-motion
└── lib/
    ├── urls.ts        # parser pipeline
    ├── urls.test.ts   # 19 parser tests
    ├── shorten.ts     # TinyURL batch queue (concurrency 5)
    └── shorten.test.ts# concurrency + failure-isolation tests
```

## Branch

Active development happens on the `Chatgpt` branch of
[`kainapat/url-link-counter`](https://github.com/kainapat/url-link-counter).
`main` is untouched.

---

## สรุปภาษาไทย

Linkcount คือเว็บเครื่องมือช่วยนับและจัดการลิงก์จากข้อความที่วางเข้าไป —
นับจำนวนทั้งหมด/ไม่ซ้ำ/ซ้ำ แยกตามโดเมน ตรวจ valid/invalid ค้นหา กรอง
ย่อลิงก์ด้วย TinyURL (สูงสุด 5 คำขอพร้อมกัน) คัดลอกและ export TXT/CSV
รองรับ Markdown link (`[label](dest)` นับเฉพาะปลายทาง) และ autolink
`<url>` ธีมมืด/สว่าง รองรับมือถือ คีย์บอร์ด และ `prefers-reduced-motion`
ลิงก์ซ้ำจะถูกติดป้ายกำกับไว้เท่านั้น ไม่มีการลบออกจากรายการเดิม

```bash
npm install
npm run dev
```
