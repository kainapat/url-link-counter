<div align="center">

# 🔗 Linkcount

### Paste links. See what is actually there.

A blazing-fast, privacy-first URL inspector, counter, filter, batch opener, shortener, and exporter.<br/>
Accurately dissects complex pasted text and Markdown without ever mutating your source list.

[![React 18](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 6](https://img.shields.io/badge/Vite-6.4-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS 3](https://img.shields.io/badge/Tailwind-3.4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-38_passed-6e9f18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Radix UI](https://img.shields.io/badge/Radix_UI-Primitives-black?style=for-the-badge&logo=radixui&logoColor=white)](https://www.radix-ui.com/)
[![Motion](https://img.shields.io/badge/Motion-12-ff0055?style=for-the-badge&logo=framer&logoColor=white)](https://motion.dev/)

[✨ Key Features](#-key-features) •
[🚀 Batch Link Opener](#-batch-link-opener) •
[🔄 Parser Pipeline](#-parser-pipeline) •
[⚡ URL Shortener](#-multi-provider-url-shortener) •
[🛠️ Tech Stack](#️-tech-stack) •
[📁 Project Structure](#-project-structure) •
[🇹🇭 สรุปภาษาไทย](#-สรุปภาษาไทย)

</div>

---

## 🖥️ Preview & Interface

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│  🔗 Linkcount    URL utility, without the clutter           [ ☀️ / 🌙 ] [ GitHub ]│
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Analyze URLs                                                                   │
│   Paste links. See what is actually there.                                       │
│                                                                                  │
│  ┌──────────────────────────────────────────────┐  ┌──────────────────────────┐  │
│  │ URLs or text containing URLs                 │  │ TOTAL URLS            73 │  │
│  │                                              │  ├──────────────────────────┤  │
│  │  https://github.com/kainapat/url-link-counter│  │ UNIQUE                71 │  │
│  │  [Documentation](https://vite.dev/guide/)    │  ├──────────────────────────┤  │
│  │  Check out: <https://tailwindcss.com>        │  │ DUPLICATES             2 │  │
│  │                                              │  ├──────────────────────────┤  │
│  │                                              │  │ DOMAINS               18 │  │
│  │                                              │  ├──────────────────────────┤  │
│  │ [Clear]        Duplicate links are badged.   │  │ INVALID                0 │  │
│  └──────────────────────────────────────────────┘  └──────────────────────────┘  │
│                                                                                  │
│  ┌─ Domains ──────────────────────────────────────────────────────────────────┐  │
│  │  github.com (24)  •  vite.dev (12)  •  tailwindcss.com (8)   [Show all...] │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌─ Results (73 links) ──────────────────── [ Search URLs... ] [ Filter: All ▾ ] ┐  │
│  │  [📋 Copy all]  [📥 TXT]  [📊 CSV]  [✂️ Shorten all]                         │  │
│  ├────────────────────────────────────────────────────────────────────────────┤  │
│  │  OPEN LINKS                                                                │  │
│  │  [ 10 links ▾ ]  [ ↗ Open next 10 ]  [ ↺ Reset ]        [ ⚙ Options ▾ ]    │  │
│  │  Opened 20 / 71 (Next: 21–30) • Scope: Current results • Mode: Unique URLs │  │
│  ├────────────────────────────────────────────────────────────────────────────┤  │
│  │  #1  https://github.com/kainapat...    github.com     [Valid]   [📋] [✂️]    │  │
│  │  #2  https://github.com/kainapat...    github.com     [Valid] [Duplicate]    │  │
│  │  #3  https://en.wikipedia.org/wiki/URL_(disambiguation)                      │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🚀 Batch Link Opener *(New)*
- **Smart Paging**: Open links in customizable chunks (**10**, **20**, **30**, **50**, or **Custom 1–100**).
- **Sequential Cursor Progression**: Automatically steps through ranges (1–10 ➔ 11–20 ➔ 21–30 ➔ ...).
- **Zero-Waste Reset**: Reset the cursor back to URL #1 anytime with the `Reset` action.
- **Strict Validity Filter**: Invalid URLs are automatically excluded; only valid, sanitized links are queued.
- **Duplicate Protection**:
  - **Unique URLs** *(Default)*: Prevents opening duplicate tabs accidentally.
  - **All occurrences**: Allows opening duplicate entries if desired.
  - *Integrity Guarantee*: The source text and Results display remain completely untouched.
- **Dynamic Scope Selection**:
  - **Current results** *(Default)*: Opens strictly what is visible after search queries or type filters.
  - **All valid URLs**: Opens all valid URLs from the entire input, ignoring active filters.
- **Browser Popup Blocker Detection**: Validates `window.open` return handles, informs the user with an actionable alert banner, accurately details `Requested`, `Opened`, and `Blocked` counts, and holds the cursor at the last successfully opened URL for seamless retries.
- **Resource Safety Dialog**: Prompts lightweight Radix confirmation dialogs for large batches (**≥ 30 tabs**) or when using **Open all remaining** (capped at 100) to protect system memory.

### 🔍 Precision URL Extraction
- **Markdown Link Support**: Automatically parses `[label](https://destination.com)` and extracts **only** the destination URL, preventing label text from corrupting link statistics.
- **Autolink Parsing**: Correctly extracts Markdown autolinks enclosed in brackets like `<https://example.com>`.
- **Balanced Wrapper Stripping**: Safely un-wraps prose punctuation like `(https://example.com)` or `"https://example.com"`, while intelligently keeping balanced parentheses intact (e.g. `https://en.wikipedia.org/wiki/Link_(film)`).
- **Zero Hallucinations**: Scheme-strict matching (`http://` and `https://` only). Scheme-less words, email addresses, and invalid syntax are never guessed or rewritten.
- **Document Order Preserved**: Retains the exact appearance order from the original text.

### 📊 Real-Time Analytics & Filtering
- **Reactive Stat Cards**: Instant feedback for **Total URLs**, **Unique**, **Duplicates**, **Domains**, and **Invalid** URLs.
- **Per-Domain Breakdown**: Displays top 5 domains with instant count pills + expandable drawer for the rest. Click any domain to immediately filter the result list.
- **Instant Search & Type Filter**: Fast client-side search across URLs and domains, plus dropdown filters (`All`, `Valid`, `Invalid`, `Duplicate`).
- **Non-Destructive Integrity**: Duplicate links are prominently badged in amber—**never silently discarded or mutated**.

### ⚡ Multi-Provider Resilient Shortener
- **Triple-Fallback Queue**: Requests flow through **TinyURL** ➔ **da.gd** ➔ **is.gd**. If CORS or rate-limits block one provider, it seamlessly cascades to the next.
- **Controlled Concurrency**: Limits network traffic to a max of **5 concurrent requests** (`SHORTEN_CONCURRENCY = 5`), preventing browser resource exhaustion.
- **Isolated Run Tokens**: Separates batch runs (`batchRun`) and per-URL operations (`singleRuns`), preventing single-link actions from cancelling batch operations or hanging states.
- **Failure Isolation**: An error on one URL never breaks the batch. Each link independently tracks `waiting` ➔ `shortening` ➔ `done` / `failed`.
- **Accessible Live Progress**: Displays dynamic visual counts (`Shortening 14/50`) paired with an `aria-live="polite"` screen-reader announcer.

### 💾 Export & Clipboard
- **Universal Clipboard**: Copy any individual URL, copy all original links, or copy all successfully shortened links in one click (includes automatic textarea fallback for restricted browser environments).
- **CSV Export**: Formatted with standard comma separation, cell quotation, and **UTF-8 BOM** (`\uFEFF`) for perfect display in Microsoft Excel, Numbers, and Google Sheets.
- **TXT Export**: Clean, newline-delimited list ready for terminal scripts or batch downloaders.

### 🎨 Modern UI & Accessibility
- **Theming**: Dark and Light themes with fluid transitions; persists in `localStorage` and automatically syncs with system preference (`prefers-color-scheme`).
- **Smooth Micro-Interactions**: Powered by `motion/react` spring physics, fully respecting `prefers-reduced-motion: reduce`.
- **Accessible Dialogs & Tooltips**: Built with WAI-ARIA compliant Radix UI primitives (`@radix-ui/react-alert-dialog`, `@radix-ui/react-tooltip`) with full keyboard navigation and focus trapping.
- **Mobile First**: Fully responsive layout from 320px screens to ultra-wide displays with touch targets ≥ 44px.

---

## 🚀 Batch Link Opener

The batch link opener operates through a pure, decoupled architecture (`src/lib/openLinks.ts` and `src/components/OpenLinksControl.tsx`):

```mermaid
flowchart TD
    A["Source URLs (All or Filtered)"] --> B["getOpenableUrls()"]
    B -->|"Filter valid: true"| C{"Duplicate Mode"}
    C -->|"Unique URLs (Default)"| D["Deduplicated URL Set"]
    C -->|"All occurrences"| E["Raw Valid URL List"]
    D --> F["Cursor Slice: getBatch(cursor, size)"]
    E --> F
    F --> G{"Batch Size ≥ 30?"}
    G -->|"Yes"| H["Radix Confirmation Dialog"]
    G -->|"No"| I["Direct User Gesture Click"]
    H -->|"Confirmed"| I
    H -->|"Cancelled"| J["Aborted"]
    I --> K["openUrlBatch() -> window.open()"]
    K --> L{"Popup Blocker Check"}
    L -->|"All tabs opened"| M["Advance Cursor by Opened Count"]
    L -->|"Tabs blocked"| N["Show Alert: Blocked count & Advance cursor only by opened tabs"]
    M --> O{"Cursor ≥ Total?"}
    O -->|"Yes"| P["State: Complete ('All opened ✓')"]
    O -->|"No"| Q["State: Opened (Ready for next batch)"]
```

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

> 🛡️ **Cleaner Invariant**: Linkcount never unconditionally strips `; : ! ?`, never decodes or re-encodes query components, never trims trailing slashes, and never alters `http` ↔ `https`.

---

## ⚡ Multi-Provider URL Shortener

Network requests are managed by an asynchronous worker pool with automatic retry fallbacks (`src/lib/shorten.ts`):

```text
 ┌────────────────┐
 │  Link to Short │
 └───────┬────────┘
         │
         ▼
 ┌───────────────┐      CORS / Error
 │   TinyURL     ├──────────────────────┐
 └───────┬───────┘                      │
         │ HTTP 200                     ▼
         │                      ┌───────────────┐      CORS / Error
         │                      │     da.gd     ├─────────────────────┐
         │                      └───────┬───────┘                     │
         │                              │ HTTP 200                    ▼
         │                              │                     ┌───────────────┐
         │                              │                     │     is.gd     │
         ▼                              ▼                     └───────┬───────┘
 ┌─────────────────────────────────────────────────────────────┐      │ HTTP 200
 │                  Shortened URL Verified                     │◄─────┘
 └─────────────────────────────────────────────────────────────┘
```

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
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) | Responsive design & dark mode utility classes |
| **Animation** | [Motion](https://motion.dev/) | Spring transitions with reduced-motion support |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible SVG iconography |
| **Primitives** | [Radix UI](https://www.radix-ui.com/) | Accessible dialogs (`AlertDialog`) & tooltips (`Tooltip`) |
| **Testing** | [Vitest](https://vitest.dev/) | 38 comprehensive unit, concurrency & batch opener tests |

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
# Run Vitest test suite (38 tests)
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
│   │   └── OpenLinksControl.tsx # Batch opener UI, presets, popup alert & Radix dialog
│   ├── lib/
│   │   ├── openLinks.ts         # Pure batching logic, validation & opener engine
│   │   ├── openLinks.test.ts    # 14 tests: 73-URL batching, popup blocking, duplicates
│   │   ├── urls.ts              # Parser pipeline, cleaner & domain counter
│   │   ├── urls.test.ts         # 19 parser unit tests (parens, markdown, edge cases)
│   │   ├── shorten.ts           # Multi-provider fallback shortener & batch queue
│   │   └── shorten.test.ts      # 5 tests: concurrency, cancellation & token isolation
│   ├── App.tsx                  # Main UI: input, analytics, results, bulk actions
│   ├── main.tsx                 # Application entrypoint & MotionConfig setup
│   ├── index.css                # Tailwind base styles, theme variables, grid & glow
│   └── vite-env.d.ts            # Vite environment types
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

**Linkcount** คือเว็บแอปพลิเคชันสำหรับวิเคราะห์ ตรวจนับ คัดกรอง เปิดแท็บแบบแบ่งชุด (Batch Opener) ย่อลิงก์ และส่งออก URL จากข้อความใดๆ ได้อย่างแม่นยำ รวดเร็ว และปลอดภัย โดยทำงานบนเบราว์เซอร์ 100% ไม่มีการบันทึกหรือเปลี่ยนแปลงข้อความต้นฉบับของคุณ

### จุดเด่นที่สำคัญ
1. **ระบบเปิดลิงก์พร้อมกันแบบแบ่งชุด (Batch Link Opener - ใหม่)**
   - กำหนดจำนวนเปิดต่อครั้งได้: **10**, **20**, **30**, **50** ลิงก์ หรือเลือก **Custom** (ระบุเองได้ 1–100)
   - เปิดแบบต่อเนื่องเป็นลำดับ (เช่น 1–10 ➔ 11–20 ➔ 21–30 จนครบ) พร้อมแสดง Progress ชัดเจน
   - มีปุ่ม `Reset` เริ่มต้นนับ URL ใหม่ได้ตลอดเวลา
   - ปลอดภัย: เปิดเฉพาะ URL ที่ถูกต้อง (Valid) เท่านั้น ข้าม Invalid อัตโนมัติ
   - เลือกระหว่าง **Unique URLs** (เปิดเฉพาะลิงก์ไม่ซ้ำ ป้องกันเปิดแท็บซ้ำซ้อน) หรือ **All occurrences** โดยไม่แตะต้องข้อมูลต้นฉบับ
   - เลือกระหว่าง **Current results** (เปิดเฉพาะที่กำลัง filter/ค้นหา) หรือ **All valid URLs**
   - ตรวจจับ Browser Popup Blocker อัตโนมัติ แจ้งเตือนจำนวนที่เปิดได้และถูกบล็อก และหยุด cursor ไว้ที่แท็บที่เปิดสำเร็จเพื่อให้กดต่อได้ทันที
   - มีหน้าต่างแจ้งเตือนยืนยัน (Confirmation Dialog) เมื่อเปิดตั้งแต่ **30 แท็บขึ้นไป** หรือเมื่อกด **Open all remaining** เพื่อความปลอดภัยของหน่วยความจำเครื่อง

2. **แกะและแยกแยะ URL แม่นยำสูง (Precision Parser)**
   - รองรับรูปแบบ Markdown: `[ข้อความ](https://target.com)` โดยจะนับเฉพาะ URL ปลายทางเท่านั้น
   - รองรับ Autolink ในรูปแบบ `<https://example.com>`
   - ตัดเครื่องหมายวรรคตอนภายนอกอัตโนมัติ เช่น `(https://example.com)` หรือ `"https://example.com"` โดยยังคงรักษาวงเล็บที่เป็นส่วนหนึ่งของ URL ไว้ได้สมบูรณ์ (เช่น ลิงก์ Wikipedia)
   - ไม่มีการเดา URL ที่ไม่มี scheme (`http://` หรือ `https://`) เพื่อป้องกันข้อมูลผิดพลาด

3. **สถิติและการวิเคราะห์ทันที (Real-Time Stats)**
   - สรุปตัวเลขอัตโนมัติ: ลิงก์ทั้งหมด (Total), ลิงก์ที่ไม่ซ้ำ (Unique), ลิงก์ซ้ำ (Duplicates), จำนวนโดเมน (Domains) และลิงก์ที่ไม่ถูกต้อง (Invalid)
   - สรุปโดเมนยอดนิยม 5 อันดับแรก พร้อมปุ่มเปิดดูโดเมนทั้งหมด และคลิกเพื่อค้นหาได้ทันที
   - ค้นหา (Search) และกรอง (Filter) ตามสถานะ: ทั้งหมด / ใช้ได้ / ไม่ถูกต้อง / ลิงก์ซ้ำ

4. **ระบบย่อลิงก์อัจฉริยะ (Multi-Provider Shortener)**
   - ทำงานแบบ Fallback อัตโนมัติ: **TinyURL** ➔ **da.gd** ➔ **is.gd**
   - ควบคุมการส่งคำขอพร้อมกันสูงสุด 5 คำขอ (`concurrency: 5`) ไม่ทำให้เบราว์เซอร์ค้าง
   - แยก token อิสระระหว่างย่อรายตัว (`singleRuns`) และย่อทั้งหมด (`batchRun`) ป้องกันการกวนสถานะกัน
   - หากมีลิงก์ใดย่อไม่สำเร็จ ลิงก์อื่นในชุดจะยังทำงานต่อได้ตามปกติ ไม่หยุดชะงัก
   - ดูความคืบหน้าแบบสด (เช่น `Shortening 14/50`) และคัดลอกลิงก์ที่ย่อแล้วทั้งหมดได้ในคลิกเดียว

5. **การส่งออกและคัดลอก (Export & Copy)**
   - คัดลอกแบบแยกรายแถว หรือคัดลอกทั้งหมด
   - ส่งออกเป็นไฟล์ **CSV** (พร้อม UTF-8 BOM สำหรับเปิดใน Excel ได้ภาษาไทยไม่เพี้ยน) และไฟล์ข้อความ **TXT**

6. **ดีไซน์สวยงามและเข้าถึงง่าย (UI & Accessibility)**
   - รองรับโหมดมืด (Dark Mode) และโหมดสว่าง (Light Mode) จดจำค่าผ่าน `localStorage`
   - แอนิเมชันลื่นไหลด้วย `Motion` พร้อมรองรับ `prefers-reduced-motion`
   - ใช้ Radix UI Dialog และ Tooltip พร้อมระบบ Focus Trapping สำหรับการควบคุมด้วยคีย์บอร์ด
   - ใช้งานได้ดีทั้งบนมือถือและคอมพิวเตอร์ ไม่มีปัญหาแถบเลื่อนแนวนอน และ Touch targets ≥ 44px

---

## 📄 License

Open-source under the [MIT License](LICENSE).
