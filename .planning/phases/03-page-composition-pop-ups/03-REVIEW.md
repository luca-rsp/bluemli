---
phase: 03-page-composition-pop-ups
reviewed: 2026-05-14T07:32:45Z
depth: standard
files_reviewed: 23
files_reviewed_list:
  - CLAUDE.md
  - astro.config.mjs
  - package.json
  - public/og-default.png
  - scripts/generate-og-default.mjs
  - src/components/PopupCallout.astro
  - src/components/SEO.astro
  - src/components/design-skill/About.jsx
  - src/components/design-skill/Footer.jsx
  - src/components/design-skill/Hero.jsx
  - src/components/design-skill/PopupStrip.jsx
  - src/content/site/config.yaml
  - src/layouts/BaseLayout.astro
  - src/lib/popups.ts
  - src/lib/site-url.ts
  - src/pages/about.astro
  - src/pages/gallery.astro
  - src/pages/gallery/[slug].astro
  - src/pages/index.astro
  - src/pages/popups.astro
  - src/pages/robots.txt.ts
  - src/pages/say-hi.astro
  - src/styles/colors_and_type.css
findings:
  critical: 0
  blocker: 3
  warning: 9
  info: 6
  total: 18
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-05-14T07:32:45Z
**Depth:** standard
**Files Reviewed:** 23
**Status:** issues_found

## Summary

Phase 3 composes 5 pages (`/`, `/gallery`, `/popups`, `/about`, `/say-hi`), a shared `SEO.astro`, a `PopupCallout.astro`, a `popups.ts` TZ-aware splitter, a `site-url.ts` env-aware base helper, a `robots.txt.ts` endpoint, and a one-shot `generate-og-default.mjs` script. Brand tokens, Fonts API, and slot-based `<head>` injection are wired through `BaseLayout.astro`. The implementation correctly addressed the four prior "Concern" categories from `03-REVIEWS.md` (canonical-to-apex, Temporal date parsing, env-var hardening, title-tag ownership).

The review still surfaces real defects:

- **3 BLOCKER findings** — most importantly, `resolveCanonicalBase()` will silently leak the trailing-slash apex `https://studiobluemli.com/` into every `rel=canonical` and `og:url` on prerendered pages because `Astro.site` is always populated from `astro.config.mjs`; the function's own preview-URL guard is dead code under the current config. There is also an SEO/security gap (external Instagram link in the footer is missing `rel="noopener"`, exposing a `window.opener` reverse-tabnabbing vector pre-2021-cutover browsers + reducing Lighthouse score), and a real correctness bug in `robots.txt.ts` where the `Sitemap:` URL is hardcoded but the `Allow` branch only triggers when `WORKERS_CI_BRANCH=main`, meaning the production sitemap line is never emitted on local-or-preview but the canonical-to-apex behaviour means `Astro.site` is always apex — robots and SEO disagree about what "production" means.

- **9 WARNINGS** including: multi-day pop-ups (`end_date`) show only the start date in callout/list rendering; `splitPopups` uses LA date in the call but never consults `popup.data.tz` so a NYC pop-up at 11pm ET is bucketed wrong; off-by-one risk in `PopupCallout` time-line if `start_time`/`end_time` ever contains an en-dash (the verbatim interpolation already inserts one — no validation prevents `"11am – 12pm"` colliding); the about-page image-strip slugs are not URL-encoded; CSP-/maintainability concerns from `dangerouslySetInnerHTML` style block in `Header.jsx`; missing `rel="noopener"` on every `target="_blank"`; non-null assertion (`!`) on every `getEntry('site', 'default')` that will throw a confusing runtime/build error if the file is renamed; signature/Mark-import inconsistency (`Mark.Heart` imported but `About.jsx` uses literal heart glyph not `<Mark.Heart />`); and the OG generator's coral-on-cream image fails WCAG contrast for unfurl previews on cream Twitter cards.

- **6 INFO items** — TODO/style-consistency findings (dead `Date` parsing in `PopupStrip.jsx` despite the comment claiming Temporal use; bare `whiteSpace: nowrap` in Hero eyebrow that can overflow ≤320px viewports; duplicate `_status_` color tables across two files; etc.).

## Blocker Issues

### BL-01: Canonical URL always emits trailing slash + apex regardless of preview state

**File:** `src/lib/site-url.ts:32-36`, `src/components/SEO.astro:35-37`, `astro.config.mjs:8`

**Issue:**
`astro.config.mjs` sets `site: 'https://studiobluemli.com'` (no trailing slash). When `URL` is constructed from this string, `Astro.site.toString()` returns **`'https://studiobluemli.com/'`** (Astro always normalises to a trailing-slash URL object). `resolveCanonicalBase()` then runs `.replace(/\/$/, '')` and returns `'https://studiobluemli.com'`, which seems correct.

However, the intent of REVIEWS-MODE Concern 1 was for the canonical resolver to *not* leak preview hostnames. Because `Astro.site` is hardcoded in `astro.config.mjs`, it is **always** apex — meaning the `astroSite?` parameter is never `undefined` in practice and the fallback `return APEX` branch is dead code. That is fine for canonical-to-apex behaviour today, but it also means a future maintainer who edits `astro.config.mjs` to use an env var (a common pattern for preview deploys) immediately leaks preview hostnames into canonical with no test coverage flagging it.

Worse, on `src/pages/index.astro` the code builds `canonical = ${canonicalBase}${pathname === '/' ? '' : pathname}` which produces `https://studiobluemli.com` (no trailing slash) for the root path. Major search engines (Google) treat trailing-slash and non-trailing-slash as canonically distinct on the root. Studio Bluemli's `og:url` will now point at the non-slash variant, while every internal anchor in `Hero.jsx`/`Header.jsx` links to `/` (which renders at `https://studiobluemli.com/`). This is a real canonicalization bug — every page on the site references the wrong canonical for the homepage.

**Fix:**
```ts
// src/lib/site-url.ts
export function resolveCanonicalBase(astroSite?: URL): string {
  // Always strip trailing slash from the base so we control concatenation.
  const fromAstroSite = astroSite?.toString().replace(/\/$/, '');
  return fromAstroSite ?? APEX;
}
```
```astro
// src/components/SEO.astro — keep trailing slash on root
const canonical = pathname === '/'
  ? `${canonicalBase}/`
  : `${canonicalBase}${pathname}`;
```
Alternatively: stop relying on `Astro.site` entirely in this helper and just return the constant `APEX`. The current code path is over-engineered for a property that cannot vary.

---

### BL-02: `import.meta.env.CF_PAGES_URL` is never populated by Vite — `resolveAssetBase()` always returns apex

**File:** `src/lib/site-url.ts:55-62`

**Issue:**
Vite (which Astro 6.2 sits on top of) **only exposes env vars prefixed with `PUBLIC_`** to `import.meta.env`. Plain `CF_PAGES_URL` and `CF_WORKERS_URL` are NOT prefixed and are silently dropped — see https://vitejs.dev/guide/env-and-mode.html and Astro's own docs at https://docs.astro.build/en/guides/environment-variables/. This means `resolveAssetBase()` will *always* return `resolveCanonicalBase(astroSite)` (the apex) regardless of which env vars Cloudflare exposes during a preview build.

Consequence: the gallery `[slug].astro`'s per-piece `og:image` URL (`resolveAssetBase(Astro.site)/gallery/<slug>/hero-800.webp`) **always** points to apex even on PR-preview deploys. That defeats the entire point of distinguishing `resolveAssetBase` from `resolveCanonicalBase` — Codex's HIGH-4 from Phase 2 (the *reason* this helper exists) is therefore unfixed despite the comment claiming "PAG-07: og:image base URL via resolveAssetBase (preview-aware)".

The docstring in `site-url.ts:49-51` ("CF_PAGES_URL (legacy — Cloudflare Pages preview/production); CF_WORKERS_URL (anticipated — Cloudflare Workers Builds preview hostname)") is incorrect: those vars are exposed to **`process.env`** in Cloudflare's build runtime, not `import.meta.env`.

**Fix:**
```ts
export function resolveAssetBase(astroSite?: URL): string {
  // Cloudflare Workers Builds exposes preview URLs via process.env, not import.meta.env.
  // import.meta.env only exposes PUBLIC_-prefixed vars.
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};
  const fromEnv =
    procEnv.CF_PAGES_URL ??
    procEnv.CF_WORKERS_URL ??
    procEnv.PUBLIC_SITE_URL ??       // process-side
    import.meta.env.PUBLIC_SITE_URL; // vite-side (if operator explicitly uses PUBLIC_ prefix)
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  return resolveCanonicalBase(astroSite);
}
```
This also matches the (correct) pattern `isProduction()` uses elsewhere in the same file.

---

### BL-03: `robots.txt` Allow + Sitemap branch is unreachable in production unless the operator manually sets `WORKERS_CI_BRANCH=main`

**File:** `src/pages/robots.txt.ts:21-23`, `src/lib/site-url.ts:77-100`

**Issue:**
`robots.txt.ts` runs at build time (`export const prerender = true`). `isProduction()` returns `true` only when one of these is set: `process.env.WORKERS_CI_BRANCH === 'main'`, `process.env.CF_PAGES_BRANCH === 'main'`, `process.env.PUBLIC_DEPLOY_ENV === 'production'`, or the same set via `import.meta.env`.

**None of these are set when you run `npm run deploy` locally** (the script is `astro build && wrangler deploy` — neither step exports `WORKERS_CI_BRANCH`). The site is hosted on Cloudflare Workers + Static Assets with Wrangler deploys (per `package.json:12-13`), not Workers Builds CI. `CF_PAGES_BRANCH` is a Cloudflare Pages variable — the project explicitly migrated off Pages per `CLAUDE.md:12,31`. `WORKERS_CI_BRANCH` is a Workers Builds variable — but the project deploys via Wrangler CLI, not Workers Builds (which was confirmed by the spike-FAIL on plan 03-05).

Result: a production deploy via `npm run deploy` will publish `User-agent: *\nDisallow: /\n` to apex `https://studiobluemli.com/robots.txt`, **fully deindexing the site from search engines**. There is no test or CI gate that catches this. The PAG-08 requirement ("robots.txt references the sitemap on production") is unmet, and worse, the site becomes invisible.

**Fix:** Pick one:

**(a)** Add an explicit production signal to the deploy script:
```json
// package.json
"deploy": "PUBLIC_DEPLOY_ENV=production astro build && wrangler deploy"
```

**(b)** Default `isProduction()` to `true` and disallow only when an explicit *preview* signal is present:
```ts
export function isProduction(): boolean {
  const isPreview =
    process.env.WORKERS_CI_BRANCH && process.env.WORKERS_CI_BRANCH !== 'main' ||
    process.env.PUBLIC_DEPLOY_ENV === 'preview';
  return !isPreview;
}
```

**(c)** Branch on `Astro.site.hostname === 'studiobluemli.com'` inside `robots.txt.ts` directly — since the site is set in `astro.config.mjs` and only differs on preview deploys configured to override it, this is the most reliable signal.

Whichever path you pick, add a Playwright smoke test that hits `/robots.txt` after build and asserts `Sitemap:` appears.

---

## Warnings

### WR-01: Multi-day pop-ups render only the start date

**File:** `src/components/PopupCallout.astro:27-32`, `src/pages/popups.astro:55-60`

**Issue:**
The Zod schema (`src/content.config.ts:45-48`) defines an optional `end_date` field, and `popups.ts:44` uses it for the upcoming/past cutoff. But neither `PopupCallout.astro` nor `popups.astro`'s `formatRowDate` consults `end_date`. A weekend pop-up like `{ date: 2026-06-13, end_date: 2026-06-14, location: "Mission Flea" }` renders as "Saturday, June 13 — Mission Flea" with no indication it runs Sunday too.

**Fix:**
```astro
const startDate = Temporal.PlainDate.from(popup.data.date);
const endDate = popup.data.end_date
  ? Temporal.PlainDate.from(popup.data.end_date)
  : null;
const isMultiDay = endDate && Temporal.PlainDate.compare(endDate, startDate) > 0;
const dateLabel = isMultiDay
  ? `${startDate.toLocaleString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })} – ${endDate.toLocaleString('en-US', { weekday: 'short', day: 'numeric' })}`
  : startDate.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
```

---

### WR-02: `splitPopups` ignores per-popup `tz` — non-LA pop-ups bucketed incorrectly

**File:** `src/lib/popups.ts:25-33,62`

**Issue:**
`todayInLA()` hardcodes the cutoff zone to `'America/Los_Angeles'`. Each popup carries a `tz` field (default `'America/Los_Angeles'`, schema line `content.config.ts:51`), explicitly designed for travelling pop-ups (per `03-CONTEXT.md` deferred ideas mention multi-locale). A New York pop-up dated `2026-06-15` will move into the `past` bucket at midnight LA (3 AM NYC on June 16), even though it actually ran on June 15 NYC time and could still be running into the late evening.

In practice today this is benign (Bluemli pops up in SF), but the `tz` field is on every entry and is unused — that's a code-defect signal, not a feature-completeness one.

**Fix:** Either remove the `tz` field from the schema (declare LA-only) and update the comment, or honor it:
```ts
function popupIsPast(p: Popup, nowUtc: Temporal.Instant): boolean {
  const endLocal = Temporal.PlainDate.from(p.data.end_date ?? p.data.date);
  // End-of-day in the popup's own tz.
  const endInstant = endLocal.toZonedDateTime({ timeZone: p.data.tz }).with({ hour: 23, minute: 59 }).toInstant();
  return Temporal.Instant.compare(endInstant, nowUtc) < 0;
}
```

---

### WR-03: `target="_blank"` without `rel="noopener"` in Footer.jsx

**File:** `src/components/design-skill/Footer.jsx:23`

**Issue:**
```jsx
<a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noreferrer" ...>
```
`rel="noreferrer"` implies `noopener` in modern browsers, but several SEO/security linters (and Lighthouse Best Practices audit prior to v10) flag this as missing. More importantly, the `instagram.com` link in `popups.astro:89` doesn't carry `target="_blank"` at all — inconsistent UX (one link in footer opens new tab, another in body navigates away). Either pattern is defensible; mixing them is not.

**Fix:**
```jsx
<a href={`https://instagram.com/${igHandle}`} target="_blank" rel="noopener noreferrer" ...>
```
And decide on a single convention for IG links sitewide (recommend: always new-tab + `rel="noopener noreferrer"`).

---

### WR-04: `getEntry('site', 'default')!.data` — non-null assertion masks build failure

**File:** `src/pages/index.astro:24`, `src/pages/gallery.astro:16`, `src/pages/gallery/[slug].astro:36`, `src/pages/about.astro:31`, `src/pages/popups.astro:32`, `src/pages/say-hi.astro:19`, `src/components/SEO.astro:34`

**Issue:**
Every page uses the TypeScript non-null assertion `(await getEntry('site', 'default'))!.data`. If `src/content/site/config.yaml` ever has its YAML root key renamed away from `default:` (line 1 of `config.yaml`), `getEntry` returns `undefined` and the `!.data` access throws `Cannot read property 'data' of undefined` at *build time*, with no helpful context for the founder who's editing YAML through the GitHub web UI.

The schema is `.strict()` so Zod rejects unknown keys — but it does not require the entry id to be `'default'`. A rename like `studio:` instead of `default:` builds the collection (one entry with id `studio`) but every page crashes.

**Fix:** Either centralize the lookup with a clear error, or use optional chaining + a defaulted object:
```ts
// src/lib/site.ts (new)
import { getEntry } from 'astro:content';
export async function getSite() {
  const entry = await getEntry('site', 'default');
  if (!entry) {
    throw new Error(
      "Missing site config: src/content/site/config.yaml must have a top-level 'default:' key. " +
      "See CNT-06 in the Phase 2 plan."
    );
  }
  return entry.data;
}
```

---

### WR-05: `dangerouslySetInnerHTML` for nav styles in `Header.jsx` — CSP-incompatible and stale-style risk

**File:** `src/components/design-skill/Header.jsx:113`

**Issue:**
```jsx
<style dangerouslySetInnerHTML={{ __html: styleBlock }} />
```
This injects an unscoped, unhashed `<style>` block at SSR time. Two problems:

1. **CSP regression** — if the operator ever adds a `style-src 'self'` CSP header (a sensible v1.1 hardening), this block is blocked unless `'unsafe-inline'` is allowed. The same selectors could move to a static `.css` file with zero behavioural change.
2. **Brand-rule grep** — the project's CI rules (`scripts/check-brand-rules.sh`, per CLAUDE.md) forbid inline display rules in `Header.jsx`. The current code circumvents the grep gate by hiding the inline rules inside a template literal. That defeats the gate's purpose without addressing the underlying concern. The comment on line 76-78 even acknowledges the workaround.

**Fix:** Move the entire `styleBlock` into `src/styles/components.css` (next to the existing `.btn-primary` rules) or a new `src/styles/header.css` imported once from `BaseLayout.astro`. Drop `dangerouslySetInnerHTML`. The CI gate then evaluates real code, not a stringly-typed escape hatch.

---

### WR-06: `Mark` imported but unused in `About.jsx`

**File:** `src/components/design-skill/About.jsx:3,49-50`

**Issue:**
```jsx
import Mark from './Mark';
...
made with love from NOPA <Mark.Heart color="var(--coral-500)" />
```
The line *does* use `Mark.Heart`. But the rendered output is a plain `<span>♥</span>` (per `Mark.jsx:17-19`), which is also what CLAUDE.md's brand rule "♡/♥ only emoji glyphs (in coral)" requires. The indirection through `Mark.Heart` adds no value here over a literal `♥` inline — and worse, `Mark.Heart` defaults `filled = true` producing `♥` (heavy heart) while the design skill's D-16 spec (per `03-CONTEXT.md`) says "made with love from NOPA ♡" — i.e. the *outline* heart `♡`. This is a visible brand-fidelity mismatch.

**Fix:**
```jsx
made with love from NOPA <Mark.Heart color="var(--coral-500)" filled={false} />
```
Or inline: `made with love from NOPA <span style={{ color: 'var(--coral-500)' }}>♡</span>`.

---

### WR-07: About photo strip uses raw slug as URL — no encoding

**File:** `src/pages/about.astro:53-58`

**Issue:**
```astro
<img class="strip-cell" src={`/gallery/${p.slug}/hero-800.webp`} ... />
```
`p.slug` is `entry.id` (the directory name under `src/content/gallery/`). Today the founder hand-writes lowercase ASCII slugs like `cluster-blush`, so this works. But the schema (`content.config.ts:14-31`) imposes no slug regex — a future entry id `cluster blush` (typo space) or `clúster-pésimo` (Unicode) produces a broken HTML URL. The same issue exists in `gallery.astro:27` and `index.astro:43`.

**Fix:** Either add a slug regex to the schema (cleaner, fail at build):
```ts
// src/content.config.ts gallery schema:
// id is derived from the dirname — add a runtime check
```
Or URL-encode at render:
```astro
src={`/gallery/${encodeURIComponent(p.slug)}/hero-800.webp`}
```
Recommend the schema-level fix because mismatched-encoding-elsewhere is the more common source of bugs.

---

### WR-08: OG default image color contrast — coral on cream fails WCAG AA at the rendered size

**File:** `scripts/generate-og-default.mjs:18-54`

**Issue:**
The generator composites the coral SVG mark (#D6553B, --coral-500) onto a cream-100 background (#F5DCC7). The mark renders at ~32% canvas width (~384px out of 1200px). At the Twitter/IG unfurl preview crop (~600x315 → ~150px effective mark), the coral/cream contrast ratio is **~3.2:1**, which fails WCAG AA for non-text content (3:1 minimum) only by a slim margin and fails AA for any thin parts of the mark.

More importantly, the design skill's product photography is the brand — a logo-on-cream PNG is the *fallback* by design (PAG-07 / D-27 path 3). When this PNG is the unfurl image (e.g. landing page shared on iMessage), the link recipient sees only the mark, not the product, with poor contrast. This is a brand defect, not a hard correctness bug, but it undermines the "product photography is the brand" CLAUDE.md constraint.

**Fix:** Generate a higher-contrast lockup — either:

- Composite the mark onto a `--cream-50` (#FAEDE0, lighter) background for better contrast with coral.
- Add the wordmark text alongside the mark so the unfurl carries brand recognition beyond a 384px symbol.
- Switch to a high-quality product hero (e.g. `cluster-coral/hero-800.webp`) and accept that some unfurls show product, not brand.

The current image (committed at `public/og-default.png`, 11625 bytes) was generated 2026-05-14 and is identical to the script output.

---

### WR-09: `popup.data.start_time` interpolated verbatim — en-dash collision risk

**File:** `src/components/PopupCallout.astro:36`, `src/pages/popups.astro:64`

**Issue:**
```astro
const timeLabel = `${popup.data.start_time}–${popup.data.end_time}`;
```
The schema declares `start_time: z.string()` with no validation. A founder typing `"11 – 11:30am"` (already containing an en-dash, e.g. for a "first half" annotation) renders as `"11 – 11:30am–<endtime>"` with two en-dashes and ambiguous parsing for the reader. CLAUDE.md's design rules require en-dash, not hyphen, as separator — but the schema doesn't enforce *which* characters belong inside the value vs around it.

**Fix:** Add a Zod regex that forbids en-dashes inside the time string:
```ts
start_time: z.string().regex(/^[^–]+$/, 'start_time must not contain an en-dash (–)'),
end_time:   z.string().regex(/^[^–]+$/, 'end_time must not contain an en-dash (–)'),
```
Or, more robust, parse the times into a structured form (`HH:MM` + meridiem) and render with a consistent separator. That's bigger surgery — the regex is the cheap fix.

---

## Info

### IN-01: `PopupStrip.jsx` doc comment claims Temporal but code uses `new Date(...)`

**File:** `src/components/design-skill/PopupStrip.jsx:11-22`

**Issue:**
The comment ("REVIEWS-MODE Concern 2 fix: build the Date from `popup.date` ALONE") is misleading — the code still uses `new Date(popup.date)` (line 17), which interprets `'2026-06-13'` as UTC midnight, then formats it in the popup's tz. For a date string `'2026-06-13'` displayed in `America/Los_Angeles`, UTC midnight is 5 PM PDT June 12, so the weekday formats as **Friday June 12**, not Saturday June 13. The `timeZone: popup.tz` option in `Intl.DateTimeFormat` makes this *worse*, not better, for the LA case.

The other consumers (`PopupCallout.astro:27`, `popups.astro:57`) correctly use `Temporal.PlainDate.from()`. This file is the inconsistent one — and since `popups.astro` passes the soonest popup into `PopupStrip` for the strip rendering, **the date displayed on the strip will be one day earlier than every other surface on the same page**.

**Fix:** Either replace `new Date(popup.date)` with `Temporal.PlainDate.from(popup.date).toLocaleString('en-US', { weekday, month, day })` (preferred — matches the other surfaces), or split `popup.date` manually and pass `{ year, month-1, day }` to the Date constructor in a Date-tz-safe way.

---

### IN-02: Hero eyebrow `whiteSpace: 'nowrap'` overflows at 320px viewport

**File:** `src/components/design-skill/Hero.jsx:13-16`

**Issue:**
`"Studio Bluemli · NOPA, San Francisco"` with `whiteSpace: 'nowrap'` at `fontSize: 13` + `letterSpacing: 0.16em` is ~310px wide. At iPhone SE width (320px viewport, ~256px content after the section's `padding: '80px 32px'`), the line is clipped or pushes horizontal scroll. CLAUDE.md targets "Lighthouse mobile ≥ 90" and the design system is "phone-first".

**Fix:** Remove the `whiteSpace: nowrap`, or break the eyebrow into two lines on narrow viewports:
```jsx
<div className="eyebrow"><span>Studio Bluemli</span> · <span style={{whiteSpace:'nowrap'}}>NOPA, San Francisco</span></div>
```

---

### IN-03: Duplicate per-status color contracts in two files

**File:** `src/pages/gallery.astro:52-55`, `src/pages/gallery/[slug].astro:149-152`

**Issue:**
The four-line per-status color rules (`.available`, `.sold`, `.one-of-one`, `.reserved`) appear identically in both files. If the design skill's UI-SPEC changes a status color, two places must update — easy to miss.

**Fix:** Move to `src/styles/components.css`:
```css
.card-status.available, .status-badge.available { color: var(--color-fg-muted); font-weight: 400; }
.card-status.sold,      .status-badge.sold      { color: var(--lavender-500);   font-weight: 700; }
/* etc. */
```

---

### IN-04: Hardcoded `'San Francisco'` city fallback in `popups.astro`

**File:** `src/pages/popups.astro:67-76`

**Issue:**
```ts
function rowCity(p: typeof soonest) {
  if (!p) return 'San Francisco';
  ...
  return 'San Francisco';
}
```
Two hardcoded "San Francisco" literals where a missing or unparseable `address` field is encountered. This conflicts with the WR-02 observation that the schema *already* allows non-SF pop-ups (the `tz` field exists). The past-list will silently lie about a Brooklyn pop-up if its address didn't include a comma-separated city.

**Fix:** If the project remains SF-only in v1, document the assumption in a comment and lock the schema (`location: z.string().regex(/, (San Francisco|...)/i)`). If multi-city is planned, change the fallback to render only the venue without the city:
```ts
function rowCity(p) {
  const addr = p?.data.address;
  if (!addr) return null;
  const parts = addr.split(',').map(s => s.trim());
  return parts.length >= 2 ? parts[parts.length - 2] : null;
}
// In template: {city && <span class="past-city">, {city}</span>}
```

---

### IN-05: `astro.config.mjs` font config repeats `display: 'swap'` four times — could refactor

**File:** `astro.config.mjs:30-59`

**Issue:**
Four font entries, each with `display: 'swap'`. Astro's Fonts API doesn't currently support config-level defaults, so this is unavoidable today — but it makes a regression (one entry omitted) easy and silent. The FND-07 comment ("`display: 'swap'` is required on every face") is correct but only enforced by reviewer attention.

**Fix:** Add a CI grep that asserts every `fontProviders.fontsource()` entry has `display: 'swap'` (or `display: 'optional'`, per FOIT acceptability rules):
```bash
# scripts/check-font-display.sh
node -e "const c=require('./astro.config.mjs').default; for (const f of c.fonts) if (!['swap','optional'].includes(f.display)) { process.exit(1); }"
```

---

### IN-06: `<title>` and `og:title` not single-sourced — drift risk

**File:** `src/pages/about.astro:44-45`, `src/pages/gallery.astro:30-31`, `src/pages/popups.astro:80-81`, `src/pages/say-hi.astro:21-22`

**Issue:**
Each page passes its title to both `BaseLayout` (for `<title>`) and `SEO` (for `og:title`):
```astro
<BaseLayout title="About — Studio Bluemli">
  <SEO slot="head" title="About — Studio Bluemli" pathname="/about" />
```
This is REVIEWS-MODE Concern 4's intended pattern, but it's manually duplicated on every page. A future edit on one site misses the other and `<title>` ≠ `og:title`. The Phase 3 plan explicitly noted this in `SEO.astro:11-14` as "the least-blast-radius choice" — acknowledged tech debt.

**Fix (low priority):** Have `SEO.astro` slot the `<title>` itself, and remove the `title` prop from `BaseLayout`:
```astro
// SEO.astro
<title>{finalOgTitle}</title>
<meta property="og:title" content={finalOgTitle} />
```
Then each page passes title to `SEO` only. The current design rejected this; revisit if `<title>` drift is observed.

---

_Reviewed: 2026-05-14T07:32:45Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
