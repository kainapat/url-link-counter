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
