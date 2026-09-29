// Mirror of src/lib/urls.ts for `npm run test:parser` (no extra deps).
// If you change cleanUrl/parseUrls, update both files.
const URL_REGEX = /https?:\/\/[^\s<>"'`]+/gi;
const ALWAYS_STRIP = new Set(['.', ',', ';', ':', '!', '?']);
const PAIRS = { ')': '(', ']': '[', '}': '{' };

function countChar(value, char) {
  let n = 0;
  for (const c of value) if (c === char) n += 1;
  return n;
}

function cleanUrl(value) {
  let url = value;
  for (;;) {
    if (!url) return url;
    const last = url[url.length - 1];
    if (ALWAYS_STRIP.has(last)) {
      url = url.slice(0, -1);
      continue;
    }
    const opener = PAIRS[last];
    if (opener) {
      const body = url.slice(0, -1);
      if (countChar(body, opener) < countChar(body, last) + 1) {
        url = body;
        continue;
      }
      return url;
    }
    return url;
  }
}

function parseUrls(input) {
  const rawUrls = input.match(URL_REGEX) ?? [];
  const seen = new Map();
  const base = rawUrls.map((raw) => {
    const normalized = cleanUrl(raw);
    let domain = 'Unknown';
    let valid = true;
    try {
      const parsed = new URL(normalized);
      domain = parsed.hostname.replace(/^www\./, '');
      if (!domain) {
        valid = false;
        domain = 'Unknown';
      }
    } catch {
      valid = false;
    }
    seen.set(normalized, (seen.get(normalized) ?? 0) + 1);
    return { raw, normalized, domain, valid, duplicate: false };
  });
  return base.map((item) => ({ ...item, duplicate: (seen.get(item.normalized) ?? 0) > 1 }));
}

let pass = 0;
let fail = 0;
function eq(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    pass += 1;
    console.log(`PASS ${name}`);
  } else {
    fail += 1;
    console.log(`FAIL ${name}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
  }
}

const single = (text) => parseUrls(text).map((u) => u.normalized);

// Q5 required cases
eq('trailing comma', single('see https://example.com,'), ['https://example.com']);
eq('wrapped parens', single('(https://example.com)'), ['https://example.com']);
eq('balanced parens in path', single('https://example.com/path_(test)'), ['https://example.com/path_(test)']);
eq('query preserved', single('https://example.com?a=1&b=2'), ['https://example.com?a=1&b=2']);
eq('fragment preserved', single('https://example.com/page#section'), ['https://example.com/page#section']);
eq('trailing paren+dot', single('see https://example.com/test).'), ['https://example.com/test']);
eq('wikipedia balanced', single('https://en.wikipedia.org/wiki/Link_(film)'), ['https://en.wikipedia.org/wiki/Link_(film)']);
eq('wikipedia outer parens', single('(see https://en.wikipedia.org/wiki/Link_(film))'), ['https://en.wikipedia.org/wiki/Link_(film)']);

// Q2 semantics
const dup = parseUrls('https://a.com/x https://a.com/x https://b.com/y');
eq('total', dup.length, 3);
eq('unique', new Set(dup.map((u) => u.normalized)).size, 2);
eq('duplicates occurrences-flagged', dup.filter((u) => u.duplicate).length, 2);
eq('both A flagged', dup.slice(0, 2).map((u) => u.duplicate), [true, true]);
eq('http vs https distinct', new Set(parseUrls('http://a.com https://a.com').map((u) => u.normalized)).size, 2);
eq('trailing slash distinct', new Set(parseUrls('https://a.com/path https://a.com/path/').map((u) => u.normalized)).size, 2);

// Q3 semantics
eq('scheme-less ignored', parseUrls('visit www.example.com today').length, 0);
eq('http invalid flagged', parseUrls('bad https://example.com:abc ok').map((u) => u.valid), [false]);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
