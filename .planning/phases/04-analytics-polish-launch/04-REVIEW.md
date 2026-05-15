---
phase: 04-analytics-polish-launch
reviewed: 2026-05-15T00:00:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - .gitignore
  - CONTENT_EDITING.md
  - SETUP-DNS.md
  - lighthouserc.json
  - package.json
  - public/_headers
  - scripts/check-og-images.sh
  - scripts/generate-og-default.mjs
  - scripts/lighthouse-production.sh
  - src/components/design-skill/Footer.jsx
  - src/components/design-skill/GalleryGrid.jsx
  - src/layouts/BaseLayout.astro
  - src/pages/gallery/[slug].astro
  - src/pages/popups.astro
  - src/pages/say-hi.astro
findings:
  critical: 0
  warning: 5
  info: 7
  total: 12
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-05-15
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

Phase 4 ships the analytics snippet, security/cache headers, founder runbooks, and
launch-audit scripts cleanly. The CSP is well thought through (Umami origin drift
is mitigated with wildcards), the `_headers` directives are correct for the
Cloudflare Workers Static Assets header-inheritance model, and the og-default
generator picks the full-palette mark first (PR #9 fix verified). The Umami snippet
is correctly env-gated and correctly omitted when `PUBLIC_UMAMI_WEBSITE_ID` is unset.

No BLOCKERs were found — no security holes, no data loss, no broken behavior I
could prove on this code path. The WARNINGs cluster around audit-script robustness
(hardcoded slug in the Lighthouse runner, brittle sitemap fixture in the og-image
checker, error reporting that conflates curl failure with "no og:image"), one
header-spec nit (HSTS preload is being shipped on day one without the documented
caveats), and the BaseLayout's silent swallow of malformed preview URLs which can
mask a misconfigured analytics rollout.

The Info items are minor (dead inline style, unused `previewRaw` fallback branch
on production builds, missing `noopener`, a hardcoded `San Francisco` city
default that papers over a real address parse failure).

---

## Warnings

### WR-01: `lighthouse-production.sh` hardcodes a single gallery slug that the founder is documented to flip

**File:** `scripts/lighthouse-production.sh:22`
**Issue:** `ROUTES=(/ /gallery /gallery/cluster-coral /popups /about /say-hi)` hardcodes `cluster-coral` as the single per-piece detail route audited. `CONTENT_EDITING.md` lines 65-78 explicitly instruct the founder to flip the `status` field on pieces over time, and gallery pieces' slugs can be renamed via new folders. If `cluster-coral` is ever renamed, removed (against the documented "never delete" rule but possible), or the founder reorganises, the production Lighthouse audit will 404 on that route, fail the script with a misleading "score below 90" error, and the launch-checklist signal becomes noisy.

Independently: this script is supposed to be the recurring launch-health audit (the `npm run ci:lighthouse-prod` alias is wired). Auditing a fixed sample of one detail page silently misses regressions on the other 5 pieces.

**Fix:** Read the actual sitemap and audit a representative sample (or all 6 detail pages):
```bash
# Replace the hardcoded ROUTES array with sitemap-derived URLs.
SITE="https://studiobluemli.com"
SITEMAP_URLS=$(curl -fsS "$SITE/sitemap-0.xml" | grep -oE '<loc>[^<]+</loc>' | sed -E 's|</?loc>||g')
# Convert to path-only, keep root + section pages + one or more detail pages.
ROUTES=$(echo "$SITEMAP_URLS" | sed "s|$SITE||" | sort -u)
```

At minimum, source the slug from a single source of truth (e.g. read the first gallery markdown alphabetically) rather than literal `cluster-coral`.

---

### WR-02: `check-og-images.sh` HEAD-checks with `-f` and silently drops the curl error onto the user's terminal

**File:** `scripts/check-og-images.sh:43`
**Issue:** `STATUS=$(curl -fsS -o /dev/null -w '%{http_code}' -I "$OG")` uses both `-f` (fail on HTTP errors) and `-S` (show errors when silent). When the og:image URL returns 404/500, the script still captures the correct `STATUS` value (verified empirically), but `-S` writes `curl: (22) The requested URL returned error: 404 Not Found` to stderr, **then** the script prints its own `FAIL: ... -> HTTP 404` line. The founder sees both messages and may interpret them as two separate failures.

Additionally, `STATUS` is captured from a subshell whose exit code is discarded (the `$(...)` only captures stdout). If curl fails to connect at all (DNS, TCP), `STATUS` is empty string — the comparison `[ "$STATUS" != "200" ]` correctly fires, but the printed message reads `og:image $OG -> HTTP ` with a blank status, which is confusing.

The same pattern appears for the page fetch on line 37: `OG=$(curl -fsS "$URL" ...)`. If the page itself 404s (e.g. sitemap stale after deploy), the script prints `FAIL: $URL has no og:image` — the page failure looks like a content failure.

**Fix:** Drop `-f` and `-S` from the HEAD check (so curl never prints to stderr), and distinguish "page unreachable" from "og:image missing":
```bash
# Page fetch — separate the network failure from the content failure.
PAGE_BODY=$(curl -sS -w '\nHTTP_STATUS:%{http_code}' "$URL")
PAGE_STATUS=$(echo "$PAGE_BODY" | grep -oE 'HTTP_STATUS:[0-9]+$' | cut -d: -f2)
if [ "$PAGE_STATUS" != "200" ]; then
  echo "FAIL: $URL returned HTTP $PAGE_STATUS (page itself unreachable)"
  FAIL=1
  continue
fi
OG=$(echo "$PAGE_BODY" | grep -oE '<meta property="og:image" content="[^"]+"' | head -1 | sed -E 's|.*content="([^"]+)".*|\1|')
# ... og:image HEAD check, drop -f to keep the message clean:
STATUS=$(curl -sS -o /dev/null -w '%{http_code}' -I "$OG" 2>/dev/null || echo "000")
```

---

### WR-03: `check-og-images.sh` is hardcoded to `sitemap-0.xml` — Astro will start emitting `sitemap-1.xml`, `sitemap-2.xml`, … when entries grow past the chunk threshold

**File:** `scripts/check-og-images.sh:20`
**Issue:** `SITEMAP="$SITE/sitemap-0.xml"`. The `@astrojs/sitemap` integration splits sitemaps once entries exceed 45,000 URLs (irrelevant for a portfolio site) **but also if `entryLimit` is set**. More immediately: the canonical entry point Astro generates is `sitemap-index.xml`. The current site emits both `sitemap-index.xml` and `sitemap-0.xml` (confirmed in `dist/client/`), so this works today, but the script's contract should be "audit every URL Astro publishes," not "audit one specific chunk."

If a future operator ever sets a custom `entryLimit` in `astro.config.mjs` or renames sitemap chunks, this script silently audits only the first chunk and misreports the rest.

**Fix:** Walk `sitemap-index.xml` to enumerate all chunks, then fetch each chunk:
```bash
SITEMAP_INDEX="$SITE/sitemap-index.xml"
CHUNKS=$(curl -fsS "$SITEMAP_INDEX" | grep -oE '<loc>[^<]+</loc>' | sed -E 's|</?loc>||g')
if [ -z "$CHUNKS" ]; then
  echo "FAIL: $SITEMAP_INDEX returned no <loc> entries"
  exit 1
fi
URLS=$(for chunk in $CHUNKS; do
  curl -fsS "$chunk" | grep -oE '<loc>[^<]+</loc>' | sed -E 's|</?loc>||g'
done)
```

---

### WR-04: HSTS `preload` directive ships on day one — registers the site for browser preload lists even though SETUP-DNS.md says preload registration is "intentionally skipped"

**File:** `public/_headers:42`
**Issue:** The header `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` includes the `preload` token. Per the HSTS preload [specification](https://hstspreload.org/#submission-requirements), `preload` is a self-declaration that the site WANTS to be added to the Chromium preload list, and serving it implies the operator has read and accepts the preload list submission terms. The site can be picked up by browser vendors who scrape HSTS headers from the wild — not just from explicit submissions — and getting removed takes months.

`SETUP-DNS.md:117-121` explicitly says "registering it with browser vendors is intentionally skipped right now — it's effectively a one-year commitment once submitted. Revisit after the site has been live for 30 days without issue." But the header itself advertises preload-readiness from day one. This is internally inconsistent — either the founder's documented stance is wrong, or the header should drop `preload` until the 30-day soak is over.

This is also irreversible-ish: once the header is live for any length of time and a vendor scrapes it, the only way to back out is to drop `includeSubDomains` and the `preload` token AND wait for browsers to refresh, which can take months.

**Fix:** Drop `preload` until SETUP-DNS Step 5+30 days passes; ship just `max-age=63072000; includeSubDomains` for the soak window. Re-add `preload` (and submit to hstspreload.org) only after the 30-day soak passes.

```
Strict-Transport-Security: max-age=63072000; includeSubDomains
```

Alternatively: update `SETUP-DNS.md` to acknowledge that the header advertises preload-readiness from day one (i.e. that the "intentionally skipped" framing is about the SUBMISSION step only, and browser-vendor scrapers may still pick it up).

---

### WR-05: BaseLayout silently swallows malformed `CF_WORKERS_URL` and emits an `<script data-domains="studiobluemli.com">` that drops preview-deploy events

**File:** `src/layouts/BaseLayout.astro:29`
**Issue:** `try { previewHostname = previewRaw ? new URL(previewRaw).hostname : ''; } catch { /* ignore malformed URL */ }`. If a Worker build sets `CF_WORKERS_URL` to a malformed value (e.g. missing scheme, typo'd by a future operator), the `URL` constructor throws, the catch eats it, `previewHostname` stays `''`, and `dataDomains` becomes just `studiobluemli.com`.

Result on a preview build: the Umami script loads but `data-domains="studiobluemli.com"` rejects every event from the workers.dev preview hostname. The founder runs through D-02 acceptance ("click the 4 conversion events on the preview deploy and see them in Realtime") and sees nothing — which is *exactly* the Pitfall #19 / RESEARCH Pitfall 1 footgun the wildcards in `connect-src` were supposed to defuse. No error is logged anywhere; the failure is silent.

For a launch-critical signal that the founder is told to verify before cutover, swallowing a config error silently undermines the verification.

**Fix:** Surface the error during build (or at least log it to the build console), so the operator sees the misconfiguration:
```js
let previewHostname = '';
if (previewRaw) {
  try {
    previewHostname = new URL(previewRaw).hostname;
  } catch (err) {
    // Build-time visibility — Astro prerender prints these to the CI build log.
    console.warn(`[BaseLayout] CF_WORKERS_URL is set but not a valid URL: "${previewRaw}". Umami preview-deploy events will be dropped.`);
  }
}
```

Also worth considering: if `previewRaw` is set but parse-fails, fall back to including a wildcard via a documented escape hatch, or fail the build (`throw new Error(...)`) so this can't ship unnoticed.

---

## Info

### IN-01: Dead `borderTop: 'none'` inline style on the footer `<footer>` element

**File:** `src/components/design-skill/Footer.jsx:10`
**Issue:** `borderTop: 'none'` is the browser default — the rule has no effect. Reads like a leftover from a previous iteration where a border was being conditionally rendered.
**Fix:** Remove the line:
```jsx
<footer role="contentinfo" style={{
  padding: '48px 32px 56px',
  textAlign: 'center',
  position: 'relative',
}}>
```

---

### IN-02: BaseLayout's `procEnv` / `previewRaw` block runs on every render but is dead on production

**File:** `src/layouts/BaseLayout.astro:24-29`
**Issue:** The `procEnv` lookup and the `previewRaw ? ... : ''` parsing both run on every page render, but on a production build `isProd === true` so `previewRaw` is `''` by construction. The work is harmless (it's prerender-time, not request-time) but the branch reads as if it does something on production. A reader has to trace `isProd` to confirm.
**Fix:** Make the intent explicit:
```js
let previewHostname = '';
if (!isProd) {
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};
  const previewRaw = procEnv.CF_WORKERS_URL ?? import.meta.env.PUBLIC_CF_WORKERS_URL ?? '';
  if (previewRaw) {
    try { previewHostname = new URL(previewRaw).hostname; }
    catch { /* see WR-05 — should not swallow */ }
  }
}
```

---

### IN-03: Footer IG link uses `rel="noreferrer"` only — paired `noopener` is implicit but not explicit

**File:** `src/components/design-skill/Footer.jsx:23`
**Issue:** `target="_blank" rel="noreferrer"`. Per the HTML spec, `noreferrer` implies `noopener` in modern browsers, but some linters and security policies flag `target="_blank"` without an explicit `noopener` because the implication is a runtime spec inference, not a tag-string contract.
**Fix:** Spell both out for clarity and tool compatibility:
```jsx
<a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noopener noreferrer" ...>
```

---

### IN-04: `popups.astro` hardcoded "San Francisco" city fallback masks a real address-parse failure

**File:** `src/pages/popups.astro:69-76`
**Issue:** `rowCity(p)` defaults to `"San Francisco"` both when `address` is missing AND when the address parse fails (fewer than 2 comma-separated parts). The fallback is fine for the in-NoPa-only event reality, but if the founder ever schedules an Oakland or Berkeley pop-up and forgets `address:` (or writes a single-part address), the past-row will silently mislabel the city as "San Francisco."

The schema (`src/content.config.ts:53`) marks `address` as optional but the operator copy in `CONTENT_EDITING.md` doesn't say "include the city in the address or the past-row will be wrong." The implicit assumption isn't surfaced anywhere.

**Fix:** Either (a) extract city from `location` as a secondary signal, (b) make `address` required (schema change), or (c) silently omit the city when it can't be derived rather than printing a confidently-wrong value:
```ts
function rowCity(p: typeof soonest): string | null {
  if (!p) return null;
  const addr = p.data.address;
  if (!addr) return null;
  const parts = addr.split(',').map((s) => s.trim());
  if (parts.length >= 2) return parts[parts.length - 2];
  return null;
}
// Usage: omit the city span when null instead of printing "San Francisco".
```

---

### IN-05: `lighthouse-production.sh` safe-route slug naming produces awkward `rootgallery_cluster-coral` filenames

**File:** `scripts/lighthouse-production.sh:35`
**Issue:** `SAFE=$(echo "$ROUTE" | tr '/' '_' | sed 's/^_/root/')`. For `/gallery/cluster-coral`, the transform yields `rootgallery_cluster-coral` (because the leading `_` is replaced with `root` but the second `_` is kept). The resulting filename `rootgallery_cluster-coral.report.html` is ugly and easy to misread.
**Fix:** Use a different separator for the root prefix or strip-then-prepend:
```bash
# Build a friendlier name.
if [ "$ROUTE" = "/" ]; then
  SAFE="root"
else
  SAFE="root$(echo "$ROUTE" | tr '/' '_')"  # → root_gallery_cluster-coral
fi
```

---

### IN-06: `check-og-images.sh` URL count via `wc -l` is off-by-one when sitemap lacks trailing newline

**File:** `scripts/check-og-images.sh:30`
**Issue:** `URL_COUNT=$(echo "$URLS" | wc -l | tr -d ' ')`. `echo` adds a trailing newline, so `wc -l` sees N lines for N URLs. Currently correct. But if anyone refactors to use `printf "%s"` or pipes from a different source, the count would be off by one. The variable is also only used for display, so any wrong value is cosmetic — but it's a fragile pattern that's easy to break without test coverage.
**Fix:** Use a more robust count:
```bash
URL_COUNT=$(echo "$URLS" | grep -c .)
```

---

### IN-07: SETUP-DNS.md Step 3 instructs setting the env var as **Plaintext** "Not Secret" — defensible but worth a one-line rationale link

**File:** `SETUP-DNS.md:83-84`
**Issue:** The runbook tells the founder to set `PUBLIC_UMAMI_WEBSITE_ID` as Plaintext type because "This is a public identifier, not a credential." This is correct — Umami website IDs are exposed in client-side HTML by design — but a non-engineer founder reading this might still wonder if they should "be safe" and pick Secret. The justification is correct; one extra sentence ("Umami's website ID appears in every page's source HTML — there is nothing to protect") would make the choice obvious.
**Fix:** Add a single line after step 6:
> The website ID is rendered into every page's HTML — it's part of the analytics snippet visitors download. Setting it as Secret would hide it from the build but it would still be visible to anyone who views the page source.

---

_Reviewed: 2026-05-15_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
