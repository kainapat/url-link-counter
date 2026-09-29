<div align="center">

# 🔗 Linkcount

### Paste links. See what is actually there.

A blazing-fast, privacy-first URL inspector, counter, filter, batch opener, shortener, and exporter.<br/>
Crafted with a modern developer-utility aesthetic inspired by Linear, Raycast, and Vercel.

[![React 18](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 6](https://img.shields.io/badge/Vite-6.4-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS 3](https://img.shields.io/badge/Tailwind-3.4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-60_passed-6e9f18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Radix UI](https://img.shields.io/badge/Radix_UI-Primitives-black?style=for-the-badge&logo=radixui&logoColor=white)](https://www.radix-ui.com/)
[![Sonner](https://img.shields.io/badge/Sonner-Toaster-black?style=for-the-badge&logo=sonner&logoColor=white)](https://sonner.emilkowal.ski/)
[![Motion](https://img.shields.io/badge/Motion-12-ff0055?style=for-the-badge&logo=framer&logoColor=white)](https://motion.dev/)

[✨ Key Features](#-key-features) •
[🎨 Workspace Design](#-workspace-design--ui) •
[🚀 Batch Link Opener](#-batch-link-opener) •
[🛡️ Hardened Popup Detection & Recovery](#️-hardened-popup-detection--recovery) •
[📑 Tab Groups & Progressive Enhancement](#-tab-groups--progressive-enhancement) •
[🔄 Parser Pipeline](#-parser-pipeline) •
[⚡ URL Shortener](#-multi-provider-url-shortener) •
[📱 Mobile & Tablet First](#-mobile--tablet-first) •
[🛠️ Tech Stack](#️-tech-stack) •
[📁 Project Structure](#-project-structure) •
[🇹🇭 สรุปภาษาไทย](#-สรุปภาษาไทย)

</div>

---

## 🖥️ Preview & Interface

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│  🔗 Linkcount    URL workspace utility                      [ ☀️ / 🌙 ] [ GitHub ]│
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   URL Workspace                                                                  │
│   Paste, inspect, deduplicate, shorten, and open links in sequential batches.   │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │ Paste anything here — Markdown [links](https://...), <https://...>, raw... │  │
│  │                                                                            │  │
│  │ https://github.com/kainapat/url-link-counter                               │  │
│  │ https://vite.dev/guide/                                                    │  │
│  │                                                                            │  │
│  │ Source integrity: links are detected and counted, never modified.  [Clear] │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌─ 73 Total URLs ──┬─ 71 Unique ──┬─ 2 Duplicates ─┬─ 18 Domains ─┬─ 0 Invalid ┐│
│  └──────────────────┴──────────────┴────────────────┴──────────────┴─────────────┘│
│                                                                                  │
│  ┌─ Results (73 links) ─ [ Mode: Total URLs | Unique ] ─ [ Search... ] [All ▾] ─┐  │
│  │  [📋 Copy all]  [📥 TXT]  [📊 CSV]  [✂️ Shorten all]  [📋 Copy shortened (73)] │  │
│  ├────────────────────────────────────────────────────────────────────────────┤  │
│  │  OPEN LINKS IN BATCH                             [ Batch 2 of 8 ]          │  │
│  │                                                                            │  │
│  │  10 / 73 opened (Next: 11–20)                                          14% │  │
│  │  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  │                                                                            │  │
│  │  Open per batch: [ 10 links ▼ ]   Scope: [ Current ▼ ]   Duplicates: [Total ▼]
│  │                                                                            │  │
│  │  [ ↗ Open next 10 ]  [ ↺ Reset ]             [ ⏱ 1 batch opened ▾ ]        │  │
│  ├────────────────────────────────────────────────────────────────────────────┤  │
│  │  #1  github.com    [Valid]                                                 │  │
│  │      https://github.com/kainapat/url-link-counter         [📋] [✂️] [↗]    │  │
│  │  #2  github.com    [Valid] [Duplicate]                                     │  │
│  │      https://github.com/kainapat/url-link-counter         [📋] [✂️] [↗]    │  │
│  │  #3  wikipedia.org [Valid]                                                 │  │
│  │      https://en.wikipedia.org/wiki/URL_(disambiguation)   [📋] [✂️] [↗]    │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🎨 Workspace Design System
- **Unified Productivity Surface**: Replaces card-after-card clutter with a sleek, border-delimited workspace inspired by Linear, Raycast, and Vercel.
- **Compact Reactive StatsBar**: Numbers are prominently emphasized with subtle entry transitions (`StatsBar`), eliminating bulky stat cards.
- **Animated Segmented Tabs**: Seamless sliding pill indicator powered by `motion/react` layout springs for instant switching between **Total URLs** and **Unique URLs**.
- **Contextual Action Notifications**: Zero-shift transient feedback with **Sonner** (`Copied to clipboard`, `10 links opened`, `Batch shortening complete`).
- **Desktop Pointer Spotlight**: Subtle mouse-following radial light on desktop viewports that automatically disables on mobile, touchscreens, and when `prefers-reduced-motion` is active.

### 🚀 Batch Link Opener
- **Smart Paging**: Open links in customizable chunks (**10**, **20**, **30**, **50**, or **Custom 1–100**).
- **Fluid Spring Progress Bar**: Visual progress indicator that smoothly animates with spring physics on every opened batch.
- **Internal Batch Naming**: Automatically organizes links into clear numbered groups (**Batch 1**, **Batch 2**, etc., e.g. `Batch 2 of 8 (Links 11–20)`).
- **Open All Remaining Action**: Opens remaining links in a single operation while maintaining clear identity (**`Remaining: Links 21–73`** instead of resetting to `Batch 1`).
- **Session Batch History with In-Place Updates**: Real-time expandable drawer logging every opened batch (`✓ Batch 1: Links 1–10 (10 opened · 0 blocked)` vs `⚠ Batch 1: Links 1–10 (6 opened · 4 blocked)`). Retries update existing batch entries in place rather than creating duplicate logs.
- **Queue Row Suppression**: Hides next batch indicators when blocked links are pending retry (`shouldShowNextBatch`), preventing cursor skew.
- **Zero-Waste Reset**: Reset the cursor and history back to URL #1 anytime with the `Reset` action.
- **Strict Validity Filter**: Invalid URLs are automatically excluded; only valid, sanitized links are queued.
- **Occurrence Mode Control (Global Toolbar)**:
  - **Total URLs** *(Default)*: Operates on all valid occurrences in document order, including duplicates.
  - **Unique URLs**: Deduplicates valid URLs, targeting only distinct links.
  - *Integrity Guarantee*: The source text and Results display remain completely untouched.
- **Dynamic Scope Selection**:
  - **Current results** *(Default)*: Opens strictly what is visible after search queries or type filters.
  - **All valid URLs**: Opens all valid URLs from the entire input, ignoring active filters.
- **Whole-List Signature Tracking**: Detects any change across the entire list (including middle items `A, B, C` ➔ `A, X, C`) or batch size (10 ➔ 20), automatically resetting progress to prevent cursor skew.
- **Resource Safety Dialog**: Prompts lightweight Radix confirmation dialogs for large batches (**≥ 30 tabs**) or when using **Open all remaining** (capped at 100) to protect system memory.

### 🛡️ Hardened Popup Detection & Recovery
- **No False Positives**: Uses the reliable `window.open('', '_blank')` pattern followed by `newWindow.location.replace(url)` to prevent Chromium from disowning the handle (which happens when passing `'noopener'` directly).
- **Reverse-Tabnabbing Protection**: Automatically severs `newWindow.opener = null` without sacrificing blocker detection accuracy.
- **Blocked State Safeguards**:
  - Automatically disables `Open next` and `Open all remaining` whenever blocked URLs are pending.
  - Replaces next-batch hints with actionable retry guidance: `(4 blocked in current batch — retry required)`.
  - Displays a high-visibility alert banner: `Requested: 10 • Opened: 6 • Blocked: 4`.
  - Promotes **`[ ↺ Retry 4 blocked ]`** as the primary action to re-attempt only the un-opened URLs.
  - Advances the cursor strictly by the actual opened count, preventing duplicate tab opens on subsequent clicks.

### 🔍 Precision URL Extraction
- **Markdown Link Support**: Automatically parses `[label](https://destination.com)` and extracts **only** the destination URL, preventing label text from corrupting link statistics.
- **Autolink Parsing**: Correctly extracts Markdown autolinks enclosed in brackets like `<https://example.com>`.
- **Balanced Wrapper Stripping**: Safely un-wraps prose punctuation like `(https://example.com)` or `"https://example.com"`, while intelligently keeping balanced parentheses intact (e.g. `https://en.wikipedia.org/wiki/Link_(film)`).
- **Zero Hallucinations**: Scheme-strict matching (`http://` and `https://` only). Scheme-less words, email addresses, and invalid syntax are never guessed or rewritten.
- **Document Order Preserved**: Retains the exact appearance order from the original text.

### 📊 Real-Time Analytics & Filtering
- **Compact Stats Bar**: Instant feedback for **Total URLs**, **Unique**, **Duplicates**, **Domains**, and **Invalid** URLs.
- **Top Domain Quick Filters**: Displays top 5 domains with instant count pills. Click any domain to immediately filter the result list.
- **Instant Search & Type Filter**: Fast client-side search across URLs and domains, plus dropdown filters (`All`, `Valid`, `Invalid`, `Duplicate`).
- **Non-Destructive Integrity**: Duplicate links are prominently badged in amber—**never silently discarded or mutated**.

### ⚡ Multi-Provider Resilient Shortener
- **Triple-Fallback Queue**: Requests flow through **TinyURL** ➔ **da.gd** ➔ **is.gd**. If CORS or rate-limits block one provider, it seamlessly cascades to the next.
- **Controlled Concurrency**: Limits network traffic to a max of **5 concurrent requests** (`SHORTEN_CONCURRENCY = 5`), preventing browser resource exhaustion.
- **Isolated Run Tokens**: Separates batch runs (`batchRun`) and per-URL operations (`singleRuns`), preventing single-link actions from cancelling batch operations or hanging states.
- **Deduplicated Network Calls with Mapped Output**: Requests each distinct URL only once to avoid API rate limits, while mapping results back onto all occurrences in document order for Total URLs mode.
- **Failure Isolation**: An error on one URL never breaks the batch. Each link independently tracks `waiting` ➔ `shortening` ➔ `done` / `failed`.

### 💾 Export & Clipboard
- **Universal Clipboard**: Copy any individual URL, copy all original links, or copy all successfully shortened links in one click (includes automatic textarea fallback for restricted browser environments).
- **CSV Export**: Formatted with standard comma separation, cell quotation, and **UTF-8 BOM** (`\uFEFF`) for perfect display in Microsoft Excel, Numbers, and Google Sheets.
- **TXT Export**: Clean, newline-delimited list ready for terminal scripts or batch downloaders.

### 🎨 Modern UI & Accessibility
- **Theming**: Dark and Light themes with fluid transitions; persists in `localStorage` and automatically syncs with system preference (`prefers-color-scheme`).
- **Smooth Micro-Interactions**: Powered by `motion/react` spring physics (120–220ms), fully respecting `prefers-reduced-motion: reduce`.
- **Accessible Dialogs & Tooltips**: Built with WAI-ARIA compliant Radix UI primitives (`@radix-ui/react-alert-dialog`, `@radix-ui/react-tooltip`) with full keyboard navigation and focus trapping.
- **Mobile & Tablet First**: Custom stacked layouts with touch targets ≥ 44px and verified zero horizontal overflow on all screen sizes.

---

## 🎨 Workspace Design System

Linkcount's visual design embraces a clean, purposeful developer-utility ethos:

| Principle | Implementation |
|---|---|
| **No Card-Stacking Clutter** | Sections are visually anchored through clean borders, subtle surface levels, and balanced spacing scales. |
| **Typography Scale** | Page Title (`28–36px font-bold`), Section Headers (`15–18px font-semibold`), Monospace Data (`13–14px font-mono`), Metadata (`11–12px font-medium`). |
| **Motion Physics** | Controlled springs and gentle tweens (120–220ms); list staggering disables automatically when URLs exceed 40 items. |
| **Subtle Desktop Spotlight** | Desktop pointer coordinates update CSS variables through `requestAnimationFrame` for a faint radial highlight. |
| **Sonner Feedback** | Transient toast feedback at `bottom-right` (desktop) and `bottom-center` (mobile) avoiding layout shifts. |

---

## 🚀 Batch Link Opener

The batch link opener operates through a pure, decoupled architecture (`src/lib/openLinks.ts` and `src/components/OpenLinksControl.tsx`):

```mermaid
flowchart TD
    A["Source URLs (All or Filtered)"] --> B["getOpenableUrls()"]
    B -->|"Filter valid: true"| C{"Occurrence Mode"}
    C -->|"Total URLs (Default)"| D["Document-Order URL List with Duplicates"]
    C -->|"Unique URLs"| E["Deduplicated URL Set"]
    D --> F["Cursor Slice: getBatch(cursor, size)"]
    E --> F
    F --> G{"Action Type"}
    G -->|"Open Next"| H["Queue: Batch N (e.g. 1-10)"]
    G -->|"Open Remaining"| I["Queue: Remaining (e.g. 21-73)"]
    H --> J{"Batch Size ≥ 30?"}
    I --> J
    J -->|"Yes"| K["Radix Confirmation Dialog"]
    J -->|"No"| L["Direct User Gesture Click"]
    K -->|"Confirmed"| L
    K -->|"Cancelled"| M["Aborted"]
    L --> N["openUrlBatch() -> defaultBrowserOpener()"]
    N --> O{"Popup Blocker Check"}
    O -->|"All links opened"| P["Advance Cursor by Opened Count + Log History"]
    O -->|"Links blocked"| Q["Disable Open Next + Show Alert + Enable 'Retry Blocked'"]
    Q -->|"User clicks Retry"| N
    P --> R{"Cursor ≥ Total?"}
    R -->|"Yes"| S["State: Complete ('All opened ✓')"]
    R -->|"No"| T["State: Opened (Ready for next batch)"]
```

---

## 🛡️ Hardened Popup Detection & Recovery

Standard web applications face severe limitations when opening multiple tabs due to aggressive browser popup blockers:

| Challenge | Linkcount Solution |
|---|---|
| `'noopener'` causes Chromium to return `null` even on success | Uses `window.open('', '_blank')` + `location.replace(url)` to capture the window reference synchronously |
| Risk of Reverse-Tabnabbing | Severed via `try { newWindow.opener = null } catch {}` before navigation |
| Partial batch blocking corrupts cursor | Cursor increments strictly by `result.opened` (e.g. 6 of 10) |
| Next row shown prematurely while blocked | `shouldShowNextBatch` suppresses next-batch queue indicator until retries succeed |
| Open All Remaining batch misnumbering | Decoupled metadata (`actionType: 'remaining'`, `label: 'Remaining'`) ensures accurate history (e.g. `Remaining: Links 21–73`) |
| Blocked tab retry UX | Dedicated **`[ ↺ Retry {N} blocked ]`** button retries only the failed subset and updates history in place |

---

## 📑 Tab Groups & Progressive Enhancement

Standard browser security models restrict the Chrome Tab Groups API (`chrome.tabs.group()`, `chrome.tabGroups.update()`) exclusively to privileged browser extension contexts. Regular web pages—regardless of browser or device—do not possess permission to create or group browser tabs directly.

Linkcount approaches this with a strict **Progressive Enhancement** architecture (`src/lib/tabGroups.ts`):

```ts
export type TabGroupingCapability = 'unavailable' | 'extension'

export interface TabGroupBridge {
  readonly capability: TabGroupingCapability
  isAvailable(): boolean
  openInGroup(urls: string[], options?: TabGroupOptions): Promise<TabGroupResult>
}
```

In standard web browsers, `defaultTabGroupBridge` accurately returns `capability: 'unavailable'`. Linkcount never fabricates fake tab group statuses.

---

## 📱 Mobile & Tablet First

Linkcount is designed from the ground up for phones and tablets (Android, iPad, iPhone), where screen real estate and touch accuracy are critical:

- **Stacked Control Grid**: Grouped into three distinct dropdowns (`Open per batch`, `Scope`, `Duplicates`) that wrap smoothly without crowding.
- **Large Touch Targets**: All interactive elements strictly adhere to the ≥ 44px touch target guideline (`min-h-11`).
- **Responsive Viewport Verification**: Exhaustively verified with automated headless browsers across:
  - `320px` (Compact Mobile)
  - `375px` (Standard iPhone)
  - `390px` (Modern iPhone Pro)
  - `430px` (Modern Large Phone)
  - `768px` (iPad / Tablet Portrait)
  - `1024px` (Tablet Landscape / Laptop)
  - `1440px` (Desktop / Ultra-wide)
- **Zero Horizontal Overflow**: Guaranteed `scrollWidth <= clientWidth` on all viewport widths.
- **Context-Aware Information**: Extension limitations and tab group notes are tucked into desktop tooltips, keeping mobile interfaces uncluttered and fast.

---

## 🔄 Parser Pipeline

Linkcount uses a deterministic, multi-stage parser engine (`src/lib/urls.ts`):

```mermaid
flowchart TD
    A["Raw Input Text"] --> B["Pass 1: Extract Markdown Links [label](url)"]
    B --> C["Pass 2: Extract Autolinks &lt;http(s)://...&gt;"]
    C --> D["Pass 3: Extract Plain http(s):// URLs from unconsumed ranges"]
    D --> E["Pass 4: Balanced-Aware Cleaner"]
    E --> F["Pass 5: URL Validation & Host Normalization"]
    F --> G["Pass 6: Duplicate & Domain Aggregation"]
    G --> H["Final Structured UrlItem Stream"]
```

### Parsing Rules & Edge Cases

| Input Text | Resulting URL | Note |
|---|---|---|
| `[Homepage](https://github.com)` | `https://github.com` | Destination only; label discarded |
| `[https://a.com](https://a.com)` | `https://a.com` | Counted once (not double-counted) |
| `<https://vite.dev>` | `https://vite.dev` | Markdown autolink wrapper stripped |
| `(https://example.com)` | `https://example.com` | Prose parens cleanly stripped |
| `https://en.wikipedia.org/wiki/Link_(film)` | `https://en.wikipedia.org/wiki/Link_(film)` | Balanced parens preserved |
| `https://example.com/search?q=a,b&page=1` | `https://example.com/search?q=a,b&page=1` | Query strings and commas preserved |
| `Visit example.com today` | *(ignored)* | Scheme-less text is never guessed |

---

## ⚡ Multi-Provider URL Shortener

Network requests are managed by an asynchronous worker pool with automatic retry fallbacks (`src/lib/shorten.ts`):

- **TinyURL**: Primary shortener service.
- **da.gd**: Primary CORS-enabled fallback (`Access-Control-Allow-Origin: *`).
- **is.gd**: High-reliability secondary fallback.
- **Concurrency**: Processed in chunks of 5 simultaneous requests with cancellation support.
- **Token Isolation**: `batchRun` and `singleRuns` ensure concurrent operations never cancel each other.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Core** | [React 18](https://react.dev/) | Component architecture & declarative state |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict typing, robust parser models |
| **Build Tool** | [Vite 6](https://vite.dev/) | Lightning-fast HMR and optimized production bundles |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) | Responsive utility design & dark mode |
| **Animation** | [Motion](https://motion.dev/) | Spring transitions with reduced-motion support |
| **Toast** | [Sonner](https://sonner.emilkowal.ski/) | Opinionated, modern toast notifications |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible SVG iconography |
| **Primitives** | [Radix UI](https://www.radix-ui.com/) | Accessible dialogs (`AlertDialog`) & tooltips (`Tooltip`) |
| **Testing** | [Vitest](https://vitest.dev/) | 60 comprehensive unit, concurrency & batch opener tests |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (recommended package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/kainapat/url-link-counter.git

# Enter the directory
cd url-link-counter

# Install dependencies
npm install
```

### Development

```bash
# Start local development server (with HMR)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Testing

```bash
# Run Vitest test suite (60 tests)
npm run test
```

### Production Build

```bash
# Typecheck & build production bundle into dist/
npm run build

# Preview the production build locally
npm run preview
```

---

## 📁 Project Structure

```text
url-link-counter/
├── src/
│   ├── components/
│   │   ├── AppHeader.tsx        # Sticky top header, minimal glyph, theme toggle, GitHub
│   │   ├── UrlWorkspace.tsx     # Input area, source integrity note, clear action, domain pills
│   │   ├── StatsBar.tsx         # Compact stats bar with animated numbers
│   │   ├── ResultsToolbar.tsx   # Segmented mode switcher, search, filter, bulk export
│   │   ├── OpenLinksControl.tsx # Batch opener UI with fluid spring progress bar & presets
│   │   ├── BlockedAlert.tsx     # Popup blocked notification with inline retry action
│   │   ├── BatchHistory.tsx     # Collapsible session batch history with status badges
│   │   └── ResultRow.tsx        # Individual URL row with copy, shorten, open actions
│   ├── lib/
│   │   ├── utils.ts             # Tailwind class merging utility (cn)
│   │   ├── tabGroups.ts         # Progressive enhancement contract & web fallback
│   │   ├── openLinks.ts         # Pure batching logic, validation, history & opener engine
│   │   ├── openLinks.test.ts    # 34 tests: batching, history, retry, tab group fallback
│   │   ├── urls.ts              # Parser pipeline, cleaner & domain counter
│   │   ├── urls.test.ts         # 19 parser unit tests (parens, markdown, edge cases)
│   │   ├── shorten.ts           # Multi-provider fallback shortener & batch queue
│   │   └── shorten.test.ts      # 7 tests: concurrency, token isolation & total mapping
│   ├── App.tsx                  # Main workspace view & state coordinator
│   ├── main.tsx                 # Application entrypoint & MotionConfig setup
│   ├── index.css                # Tailwind base styles, theme variables, grid & glow
│   └── vite-env.d.ts            # Vite environment types
├── CONTEXT.md                   # Ubiquitous domain language & architecture model
├── package.json                 # Project scripts & dependencies
├── package-lock.json            # Deterministic lockfile (npm standard)
├── tailwind.config.js           # Tailwind configuration (dark mode, typography)
├── tsconfig.json                # TypeScript compiler settings
└── vite.config.ts               # Vite & Vitest configuration
```

---

## 🌿 Git Branch

Active development is maintained on the **`Chatgpt`** branch of [`kainapat/url-link-counter`](https://github.com/kainapat/url-link-counter).

```bash
# Switch to the development branch
git checkout Chatgpt
```

---

## 🇹🇭 สรุปภาษาไทย

**Linkcount** คือเว็บแอปพลิเคชันสำหรับวิเคราะห์ ตรวจนับ คัดกรอง เปิดลิงก์แบบแบ่งชุด (Batch Opener) ย่อลิงก์ และส่งออก URL จากข้อความใดๆ ได้อย่างแม่นยำ รวดเร็ว และปลอดภัย โดยทำงานบนเบราว์เซอร์ 100% ไม่มีการบันทึกหรือเปลี่ยนแปลงข้อความต้นฉบับของคุณ

### จุดเด่นที่สำคัญหลังการ Redesign
1. **ดีไซน์ใหม่สไตล์ Developer Utility Workspace**
   - ได้รับแรงบันดาลใจจากเครื่องมือชั้นนำอย่าง Linear, Raycast และ Vercel ลดความเกะกะของ Card กล่องสี่เหลี่ยมหลายชั้น ให้กลายเป็น Workspace ชิ้นเดียวที่ลื่นไหล
   - มี Desktop Pointer Spotlight ละเอียดอ่อนตามการขยับเมาส์
   - ระบบแจ้งเตือน Action ด้วย **Sonner Toast** สวยงาม รวดเร็ว ไม่เลื่อน Layout
   - แถบสถิติแบบกระชับ (`StatsBar`) ตัวเลขเด่นชัดพร้อมแอนิเมชันตัวเลขเมื่อค่าเปลี่ยน
   - ตัวสลับโหมด `Total URLs` และ `Unique URLs` แบบ Segmented Control มีแถบ Active สไลด์นุ่มนวล

2. **ระบบเปิดลิงก์พร้อมกันแบบแบ่งชุด (Batch Link Opener)**
   - หลอด Progress Bar เคลื่อนไหวลื่นไหลด้วย Motion Spring
   - กำหนดจำนวนเปิดต่อครั้งได้: **10**, **20**, **30**, **50** ลิงก์ หรือเลือก **Custom** (ระบุเองได้ 1–100)
   - **Internal Batch Naming**: แบ่งชุดเป็นลำดับชัดเจน เช่น `Batch 1 of 8 (Links 1–10)`, `Batch 2 of 8 (Links 11–20)`
   - **Open All Remaining Action**: รองรับการเปิดลิงก์ที่เหลือทั้งหมดในคลิกเดียว โดยบันทึกชื่อในประวัติเป็น **`Remaining`** ชัดเจน (เช่น `Remaining: Links 21–73`) ไม่ย้อนกลับไปตั้งชื่อผิดเป็น `Batch 1`
   - **Session Batch History with In-Place Updates**: บันทึกประวัติการเปิดในเซสชัน (`✓ Batch 1: Links 1–10 (10 opened · 0 blocked)` vs `⚠ Batch 1: Links 1–10 (6 opened · 4 blocked)`) โดยเมื่อ Retry สำเร็จจะอัปเดตรายการเดิมทันที ไม่สร้างประวัติซ้ำซ้อน
   - **ซ่อนแถว Next Batch อัตโนมัติเมื่อมีแท็บค้างบล็อก**: ระบบจะไม่แสดงช่วงถัดไปจนกว่าจะเคลียร์แท็บที่ถูกบล็อกสำเร็จ ป้องกันการสับสนและป้องกันการเปิดแท็บซ้ำซ้อน
   - **โหมด Total URLs (ค่าเริ่มต้น)**: เปิดทุกลิงก์ตามลำดับในเอกสารต้นฉบับ หรือเลือก **Unique URLs** เพื่อเปิดเฉพาะลิงก์ไม่ซ้ำ

3. **ตรวจจับ Popup Blocker และปุ่ม Retry เฉพาะกิจ**
   - ใช้เทคนิค `window.open('', '_blank')` แล้วจึง `location.replace` ป้องกันการเกิด False Positive บล็อกหลอก
   - ตัดสิทธิ์ `opener = null` ป้องกัน Reverse-Tabnabbing
   - บล็อกปุ่ม `Open next` และ `Open all remaining` ชั่วคราวเมื่อมีแท็บค้างบล็อก เพื่อป้องกัน Cursor ทับซ้อน
   - มีปุ่ม **`[ ↺ Retry {N} blocked ]`** เพื่อกดเปิดต่อเฉพาะรายการที่ค้างบล็อกจริง

4. **สถาปัตยกรรม Tab Groups & Progressive Enhancement**
   - หน้าเว็บทั่วไปไม่มีสิทธิ์เข้าถึง `chrome.tabs.group()` ซึ่งเป็นสิทธิ์เฉพาะของ Browser Extension
   - Linkcount ออกแบบด้วยระบบ **Progressive Enhancement** ผ่าน Interface `TabGroupBridge` โดยกำหนดค่า Web เริ่มต้นเป็น `unavailable` ไม่มีการแกล้งทำหรือหลอกผู้ใช้

5. **ออกแบบ Mobile & Tablet First**
   - ออกแบบสำหรับหน้าจอมือถือและแท็บเล็ตเป็นสำคัญ คอนโทรลจัดวางแบบ Stacked Grid สะอาดตา
   - ปุ่มและตัวเลือกทุกชิ้นมีขนาดสัมผัสไม่ต่ำกว่า 44px (`min-h-11`)
   - ผ่านการทดสอบบน Viewport ตั้งแต่ **320px ถึง 1440px** ปราศจากปัญหาแถบเลื่อนแนวนอน (Zero Horizontal Overflow)

6. **โครงสร้างโค้ดแบบ Modular (Clean Architecture)**
   - แยกหน้าที่ชัดเจนระหว่าง Business Logic ใน `src/lib/` และ Presentation Components ใน `src/components/`
   - ผ่านการทดสอบ Unit Tests ทั้งหมด 60 รายการ ผ่านครบ 100%

---

## 📄 License

Open-source under the [MIT License](LICENSE).
