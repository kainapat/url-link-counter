# Linkcount Domain

The Linkcount domain models URL extraction, classification, batch operations, and shortener management over unformatted user text.

## Language

### URL Classification

**UrlItem**:
A structured record representing a matched URL, preserving its raw extraction text, normalized target, host domain, validation status, and duplication state.
_Avoid_: LinkObject, UrlEntity

**Valid URL**:
A URL conforming strictly to standard web schemes (`http://` or `https://`) with a resolvable hostname.
_Avoid_: Good URL, Working URL

**Invalid URL**:
A matched text fragment failing RFC/WHATWG URL parsing criteria or possessing an unsupported scheme.
_Avoid_: Broken URL, Malformed link

**Duplicate URL**:
A valid URL whose normalized representation has already appeared earlier in the document stream.
_Avoid_: Repeated link, Redundant URL

### Occurrence Modes

**Total URLs Mode**:
An operation mode that targets all valid occurrences of URLs in their original document appearance order, including duplicates.
_Avoid_: All occurrences, Full list, Raw count

**Unique URLs Mode**:
An operation mode that deduplicates valid URLs, targeting only the first appearance of each normalized URL.
_Avoid_: Distinct URLs, Deduplicated mode

### Batch Operations

**Scope**:
The boundary determining whether an action applies strictly to currently filtered and searched items or to the entire parsed document.
_Avoid_: Target range, Filter boundary

**Batch Slice**:
A subset of openable URLs calculated from a cursor position and batch size for sequential browser opening.
_Avoid_: Page chunk, Batch window

**Cursor**:
The zero-based sequential pointer tracking how many URLs have been opened in the active batch sequence.
_Avoid_: Offset, Head position

### Shortener Lifecycle

**Shorten Target**:
A distinct valid URL queued for transformation through an external shortener service.
_Avoid_: Link to shorten, Target long URL

**Mapped Shortened Output**:
The final collection of shortened links mapped back onto original document occurrences while only executing unique API requests.
_Avoid_: Expanded shortened list, Reconstructed URLs

### Tab Grouping & Progressive Enhancement

**TabGroupingCapability**:
An indicator declaring whether the current execution runtime supports native browser tab grouping (`unavailable` in standard web pages, `extension` when backed by a browser extension bridge).
_Avoid_: TabGroupSupport, ExtensionPermission

**TabGroupBridge**:
An interface contract for dispatching tab creation and grouping commands to a privileged environment without coupling the web app to Extension APIs.
_Avoid_: ChromeBridge, ExtensionClient

**Internal Batch**:
A named conceptual grouping within Linkcount (`Batch 1`, `Batch 2`, etc.) that labels sequential slices of opened URLs for user orientation.
_Avoid_: BrowserGroup, TabFolder

**Batch History**:
An in-memory, session-only log of opened batches tracking opened counts, blocked counts, and URL index ranges.
_Avoid_: PersistentHistory, OpenLog

**Blocked Retry Queue**:
The subset of URLs within an opened batch that failed to launch due to browser popup restrictions, held for immediate re-attempt.
_Avoid_: FailedList, RetryPool

**Batch Resolution Status**:
The completion state of an internal batch, marked as `complete` only when all requested URLs have been successfully opened, and `partial` while blocked URLs remain pending retry.
_Avoid_: BatchSuccess, BatchFinished

**Batch In-Place Update**:
The operation that updates an existing batch history entry following a retry attempt rather than appending a redundant record.
_Avoid_: HistoryPatch, RetryLog

**Batch Action Type**:
A discriminator characterizing whether an execution opened a standard sized sequential batch (`batch`) or flushed the remainder of queued URLs (`remaining`).
_Avoid_: OpenKind, BatchMode

**Remaining Action**:
A batch opening operation targeting all remaining queued URLs in a single action up to the safety limit.
_Avoid_: BulkFlush, TailOpen
