---
phase: 04-analytics-polish-launch
plan: 01
subsystem: analytics
tags: [umami, cloudflare-workers, astro, cookieless-analytics, env-aware]

# Dependency graph
requires:
  - phase: 03-pages-content
    provides: "src/lib/site-url.ts (isProduction helper, REVIEWS Concern 7 hardening); src/pages/say-hi.astro; src/pages/gallery/[slug].astro CTAs"
  - phase: 02-content-collections
    provides: "src/layouts/BaseLayout.astro <head> + named head slot; src/components/design-skill/GalleryGrid.jsx wrapping <a>"
provides:
  - "Env-aware Umami <script async> in every page (rendered when PUBLIC_UMAMI_WEBSITE_ID is set)"
  - "data-domains driven by isProduction() — apex in prod, apex + workers.dev preview hostname in non-prod"
  - "4 data-umami-event slugs wired on the 4 D-01 anchors (gallery_card_click, inquire_ig_per_piece, say_hi_ig_dm, say_hi_mailto)"
  - "Per-piece dashboard segmentation via data-umami-event-piece={slug} on the per-piece IG inquire CTA"
affects: [04-02, 04-03, headers, csp, dns-cutover, founder-dashboard]

# Tech tracking
tech-stack:
  added: []  # No new dependencies — Umami is loaded directly from cloud.umami.is, no npm package.
  patterns:
    - "Vite env-read inside per-render frontmatter (never module top-level) — see src/lib/site-url.ts Pitfall 2"
    - "Dual-source env reads: procEnv.X ?? import.meta.env.PUBLIC_X (Node + Vite/workerd safety)"
    - "Safe-default omission: feature disabled when its config env-var is unset (mirrors robots.txt Disallow fallback)"

key-files:
  created: []
  modified:
    - "src/layouts/BaseLayout.astro — env-aware Umami snippet in <head>"
    - "src/components/design-skill/GalleryGrid.jsx — gallery_card_click attribute on wrapping <a>"
    - "src/pages/gallery/[slug].astro — inquire_ig_per_piece + per-piece slug metadata"
    - "src/pages/say-hi.astro — say_hi_ig_dm and say_hi_mailto attributes"

key-decisions:
  - "Reused isProduction() verbatim from src/lib/site-url.ts (REVIEWS Concern 7 hardened) rather than re-implementing env-var checks"
  - "data-domains is composed at build time (apex + optional preview hostname) so cutover is an env-var swap, not a code change"
  - "Omit the Umami script entirely when PUBLIC_UMAMI_WEBSITE_ID is unset (safe-default — no broken script tag in local dev)"
  - "Per-piece slug carried as data-umami-event-piece (Umami auto-promotes any data-umami-event-* attribute to event metadata) — keeps the 4-event slug list canonical while still surfacing per-piece counts"
  - "Mailto fallback on per-piece pages intentionally left untagged (D-01 specifies 4 events total; per-piece mailto is not in the set)"

patterns-established:
  - "Pattern: conditional render of third-party <script> in BaseLayout — `{ENV_ID && <script .../>}`, never assign URL inputs at module top-level (Vite would inline at build)"
  - "Pattern: env-aware data-domains composition — production = apex only; non-prod = apex + preview hostname extracted via new URL(rawUrl).hostname with try/catch fallback"
  - "Pattern: data-umami-event slugs come from a single canonical table (04-RESEARCH.md §Code Examples) — no slug-naming creativity at edit time"

requirements-completed: [LCH-01, LCH-02, LCH-03]

# Metrics
duration: ~10min
completed: 2026-05-15
---

# Phase 4 Plan 01: Analytics Wiring (Umami Cloud) Summary

**Env-aware Umami Cloud snippet wired into BaseLayout + 4 data-umami-event slugs on the 4 D-01 anchors, zero new client-side JS.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-05-15T15:40:30Z (approx — wall clock)
- **Completed:** 2026-05-15T15:50:31Z
- **Tasks:** 2/2
- **Files modified:** 4

## Accomplishments

- BaseLayout emits Umami `<script async src="https://cloud.umami.is/script.js" data-website-id={UMAMI_ID} data-domains={dataDomains}>` conditionally, gated on `PUBLIC_UMAMI_WEBSITE_ID` being set.
- `data-domains` is composed via the hardened `isProduction()` helper: apex-only in production, apex + workers.dev preview hostname in non-production (extracted from `CF_WORKERS_URL` / `PUBLIC_CF_WORKERS_URL`).
- 4 anchors carry the canonical D-01 event slugs:
  - `gallery_card_click` — gallery grid card (every piece on `/gallery`)
  - `inquire_ig_per_piece` + `data-umami-event-piece={slug}` — per-piece IG CTA on `/gallery/[slug]`
  - `say_hi_ig_dm` — IG DM button on `/say-hi`
  - `say_hi_mailto` — mailto fallback on `/say-hi`
- Per-piece slug metadata flows through to dist HTML as a double-quoted string (verified for all 6 pieces: cluster-blush, cluster-cobalt, cluster-coral, cluster-lavender, cluster-saffron, cluster-sage).
- No `client:` directive introduced; Phase 1 zero-client-React contract preserved.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add env-aware Umami snippet to BaseLayout.astro** — `f928f77` (feat)
2. **Task 2: Add data-umami-event attributes on the 4 anchors** — `f64348f` (feat)

_Plan metadata commit (this SUMMARY.md + deferred-items.md) will follow as the final commit on this worktree._

## Where the Umami snippet lives in BaseLayout.astro

**Frontmatter (lines 1–34)** — env-var reads and `dataDomains` composition:

```astro
// (lines 5–7)
// Phase 4 (LCH-01, D-01, D-02, D-03): env-aware Umami Cloud snippet — see <head> below.
import { Font } from 'astro:assets';
import { isProduction } from '../lib/site-url';

// (lines 14–33)
// Phase 4 LCH-01 / D-02: env-aware Umami snippet inputs.
const UMAMI_ID = import.meta.env.PUBLIC_UMAMI_WEBSITE_ID;
const APEX = 'studiobluemli.com';
const isProd = isProduction();

const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};
const previewRaw = !isProd
  ? (procEnv.CF_WORKERS_URL ?? import.meta.env.PUBLIC_CF_WORKERS_URL ?? '')
  : '';
let previewHostname = '';
try { previewHostname = previewRaw ? new URL(previewRaw).hostname : ''; } catch { /* ignore malformed URL */ }

const dataDomains = isProd
  ? APEX
  : [APEX, previewHostname].filter(Boolean).join(',');
```

**`<head>` insertion (lines 61–74)** — inserted between the `<Font cssVariable="--font-hand-loaded" preload />` (line 59) and the existing `<slot name="head" />` (now line 80):

```astro
{/* Phase 4 LCH-01 / D-01 / D-02: Umami Cloud analytics — cookieless, no consent
    banner. data-domains restricts event collection to apex (production) and the
    active workers.dev preview hostname (pre-cutover only). Snippet omitted entirely
    when PUBLIC_UMAMI_WEBSITE_ID is unset (local dev / misconfig) — same safe-default
    stance as src/pages/robots.txt.ts's Disallow fallback. The script URL is versionless;
    SRI hashes are not pinned (would break on every Umami release — deferred to v1.x). */}
{UMAMI_ID && (
  <script
    async
    src="https://cloud.umami.is/script.js"
    data-website-id={UMAMI_ID}
    data-domains={dataDomains}
  />
)}
```

## Exact final attribute strings on the 4 anchors

**1. `src/components/design-skill/GalleryGrid.jsx` line 45 — gallery card wrapping `<a>`:**

```jsx
<a key={piece.slug} href={`/gallery/${piece.slug}`} className="card" data-umami-event="gallery_card_click" style={{
```

**2. `src/pages/gallery/[slug].astro` lines 92–95 — per-piece IG inquire CTA:**

```astro
<a class="cta-button"
   href={site.ig_dm_url}
   data-umami-event="inquire_ig_per_piece"
   data-umami-event-piece={slug}>{ctaCopy}</a>
```

**3. `src/pages/say-hi.astro` line 28 — IG DM button:**

```astro
<a class="ig-button" href={site.ig_dm_url} data-umami-event="say_hi_ig_dm">
```

**4. `src/pages/say-hi.astro` line 32 — mailto fallback `<a>`:**

```astro
or email <a href={`mailto:${site.contact_email}`} data-umami-event="say_hi_mailto">{site.contact_email}</a>
```

## Founder setup (still required)

`PUBLIC_UMAMI_WEBSITE_ID` must still be set in **Cloudflare Workers Builds env vars** for the script to render in production. This plan ONLY scaffolds the consumer side — the one-time paste of the Umami site UUID happens in Plan 03's `SETUP-DNS.md` Step 3 (or wherever 04-03 documents the env-var add). Until then, every build will safely omit the script tag (verified locally — `dist/client/index.html` contains no `cloud.umami.is` string when `PUBLIC_UMAMI_WEBSITE_ID` is unset).

## Build success log tail (last 10 lines of `npm run build`)

```
08:50:18   ├─ /say-hi/index.html (+4ms)
08:50:18   ├─ /index.htmlThe collection "popups" does not exist or is empty. Please check your content config file for errors.
 (+6ms)
08:50:18 ✓ Completed in 281ms.

08:50:18 [build] Rearranging server assets...
08:50:18 [build] ✓ Completed in 1.98s.
08:50:18 [@astrojs/sitemap] `sitemap-index.xml` created at `dist/client`
08:50:18 [build] Server built in 2.81s
08:50:18 [build] Complete!
```

The "popups collection empty" message is a pre-existing Phase 3 condition (no popup markdown files yet) and is unrelated to this plan.

## Files Created/Modified

- `src/layouts/BaseLayout.astro` — frontmatter `isProduction` import + `UMAMI_ID` / `dataDomains` composition; conditional `<script async>` inserted in `<head>` between the last `<Font />` and the `<slot name="head" />`.
- `src/components/design-skill/GalleryGrid.jsx` — `data-umami-event="gallery_card_click"` added to the wrapping `<a>` (line 45).
- `src/pages/gallery/[slug].astro` — `data-umami-event="inquire_ig_per_piece"` + `data-umami-event-piece={slug}` added to the per-piece IG CTA (lines 92–95).
- `src/pages/say-hi.astro` — `data-umami-event="say_hi_ig_dm"` on the IG button (line 28); `data-umami-event="say_hi_mailto"` on the mailto anchor (line 32).
- `.planning/phases/04-analytics-polish-launch/deferred-items.md` — new file logging the pre-existing `check-no-hydration.sh` failure that this plan did not cause and does not address (scope-boundary respected).

## Decisions Made

- **Followed the plan as specified.** The only nominal deviation is a single-character discrepancy between the plan's prescribed code (which uses `PUBLIC_UMAMI_WEBSITE_ID` twice — once as the env-var read and once in the inline comment) and the plan's `grep -c 'PUBLIC_UMAMI_WEBSITE_ID' ... returns 1` acceptance criterion. Since the plan's own action text explicitly dictates both occurrences, the action text takes precedence. Actual count: 2.

## Deviations from Plan

**One trivial discrepancy in the plan's own acceptance criteria** (not a true deviation — the code matches the plan's action text exactly):

| Acceptance line | Stated expected | Actual | Resolution |
|---|---|---|---|
| `grep -c 'PUBLIC_UMAMI_WEBSITE_ID' src/layouts/BaseLayout.astro returns 1` | `1` | `2` | The plan's Edit 1 (frontmatter `const UMAMI_ID = import.meta.env.PUBLIC_UMAMI_WEBSITE_ID`) AND Edit 2 (inline `<head>` comment text "when PUBLIC_UMAMI_WEBSITE_ID is unset") both contain the literal string. The plan's action text prescribes both. The acceptance count of `1` appears to be an off-by-one in the planner's grep count — not a planner instruction to remove the comment. Code matches the prescribed action text. |

All other source-side and dist-side grep counts pass exactly as specified.

---

**Total deviations:** 0 functional. 1 cosmetic mismatch in the plan's own grep acceptance count (resolved in favor of the plan's prescribed action text — see table above).
**Impact on plan:** None. All 7 must-have truths from frontmatter are satisfied.

## Issues Encountered

### Pre-existing `scripts/check-no-hydration.sh` failure (out of scope)

`bash scripts/check-no-hydration.sh` exits 1, flagging `dist/client/_astro/client.DIYMaoE_.js` (~194 KB) as evidence of an accidental React-runtime ship.

**Verification this is pre-existing:** Stashed Task 1 + Task 2 edits, re-ran the script — same failure. The Phase 1 zero-client-React contract was already broken before this plan touched anything.

**Why not auto-fixed:** Per execute-plan.md SCOPE BOUNDARY, only directly-caused issues get auto-fixed. This bundle is emitted regardless of any 04-01 edit (no `client:` directives in `src/` — confirmed via `grep -rn 'client:' src/`, only matches are comments inside `Button.jsx` and `Hero.jsx`). Root cause needs investigation in a follow-up plan or earlier-phase backfix.

**Logged in:** `.planning/phases/04-analytics-polish-launch/deferred-items.md`.

### Pre-existing `grep -P` warning in `check-brand-rules.sh` (cosmetic)

`scripts/check-brand-rules.sh` prints a BSD-grep "invalid option -- P" usage notice on macOS but still exits 0 with "All brand rules pass." Pre-existing — not caused by this plan. Cosmetic noise only.

## User Setup Required

Founder must add `PUBLIC_UMAMI_WEBSITE_ID` (and optionally `PUBLIC_CF_WORKERS_URL` for the preview-hostname workflow) to **Cloudflare Workers Builds environment variables**. Until then, the build safely omits the Umami script tag entirely.

The actual env-var-add documentation lives in Plan 03's `SETUP-DNS.md` Step 3 (or wherever Phase 4's user-setup doc places it). This plan ONLY scaffolds the consumer.

## Next Plan Readiness

- Plan 04-02 (security headers + CSP) can now reference `cloud.umami.is` as the single third-party `script-src` origin — this plan validates that origin is the ONLY external script the site emits (verified — no other `https://` script tags in dist HTML).
- Plan 04-03 (DNS cutover + final verification) can drive the env-var swap that flips `data-domains` from apex+preview to apex-only.

## Self-Check: PASSED

**Created files verified:**
- `.planning/phases/04-analytics-polish-launch/04-01-SUMMARY.md` — FOUND
- `.planning/phases/04-analytics-polish-launch/deferred-items.md` — FOUND

**Commits verified:**
- `f928f77` (Task 1) — FOUND in `git log`
- `f64348f` (Task 2) — FOUND in `git log`

---
*Phase: 04-analytics-polish-launch*
*Completed: 2026-05-15*
