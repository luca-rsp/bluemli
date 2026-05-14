# Phase 3: Page Composition & Pop-ups — Research

**Researched:** 2026-05-13
**Domain:** Astro 6 page composition + Cloudflare Workers Builds cron + TZ math + shared SEO/sitemap/robots
**Confidence:** HIGH overall (every external claim cross-verified against Cloudflare and Astro official docs and the npm registry on 2026-05-13)

## Summary

Phase 3 is a **composition phase, not a discovery phase.** Every architectural choice that matters (Astro 6.2 + `@astrojs/cloudflare@13.5`, no client React, `passthroughImageService`, `output: 'server'` + per-page `prerender = true`, `<slot name="head">` per-page meta injection, env-aware base URL, founder-locked daily cron) is already locked by `CLAUDE.md`, `01-CONTEXT.md`, `02-CONTEXT.md`, and the 29 D-XX decisions in `03-CONTEXT.md`. The 7 open technical questions in the additional_context map to 7 well-bounded "pick one of N" decisions that this document resolves with concrete code snippets.

The most important new finding is that **Cloudflare Workers Builds now supports Deploy Hooks** (announced 2026-04-01 per Cloudflare's changelog — six weeks before this research). That single feature collapses D-12 to a clean three-line answer: a deploy hook is exactly the missing primitive that lets a daily cron trigger a fresh build without GitHub Actions, without a separate cron-only worker, and without auth tokens.

**Primary recommendation:** Use `temporal-polyfill` (FullCalendar's fork) for TZ math, a scheduled handler on the existing Worker that POSTs to a Workers Builds deploy hook for the daily 3 AM PT rebuild, a build-time `sharp`-rendered logo-lockup PNG for the default `og:image`, and a single Astro endpoint at `src/pages/robots.txt.ts` that branches on `Astro.site`'s host. Drop the Bagel Fat One Fonts API entry and the `<Font cssVariable="--font-wordmark-loaded" preload />` tag; the `--font-wordmark: var(--font-display-loaded), 'Caveat Brush', cursive` cascade composes against an already-loaded face with zero extra download.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Landing Page Composition**
- **D-01:** Hero copy stays as-is in `Hero.jsx`, NOPA casing applied. Keep the existing H1 `"bright, beaded, one of a kind"` and the sub-tagline. Only Hero edit is replacing `NoPa` → `NOPA` in the eyebrow and the sub-tagline. `site.yaml`'s `tagline` continues to feed OG meta + footer text only.
- **D-02:** Next-pop-up callout = quieter mini-callout, NOT the full `PopupStrip`. Landing renders a new compact section: small eyebrow ("NEXT POP-UP"), single-line `<weekday>, <month> <day> — <venue>`, second line for time, and (only when 2+ upcoming exist) a "see all upcoming pop-ups →" link beneath. `PopupStrip` stays in use on `/popups` only.
- **D-03:** Landing renders no pop-up section when zero upcoming exist. Overrides PAG-01 SC1's "no pop-ups on the calendar right now — DM me on Instagram" empty-state line. When the popups collection has zero future-dated entries (per the TZ-aware cutoff), the landing page omits the entire pop-up section.
- **D-04:** Featured count = 3 (newest by `published_at`). Landing grid renders the 3 most-recent `featured: true` pieces, newest first. Falls back to "newest 3 regardless of featured" if zero pieces are `featured: true`. Overrides Phase 2 D-15's "6 most-recent" intent.
- **D-05:** Landing mini-callout has NO embedded CTA. Read-only blurb. The "see all upcoming pop-ups →" link is a separate affordance, not the callout's own CTA.

**`/popups` Page Composition**
- **D-06:** "One prominent + 'also coming up' list" layout. Soonest upcoming pop-up renders as the full `PopupStrip`. Other upcoming events render below in an "ALSO COMING UP" compact list. Past events render in a "PAST" compact text list at the very bottom.
- **D-07:** Past archive = text-only list. No photos. The optional `photos: image()` array stays available for future use but is not rendered on `/popups` in v1.
- **D-08:** Empty-state copy for `/popups` (zero upcoming AND zero past): centered editorial line under a quiet "POP-UPS" eyebrow ("No pop-ups on the calendar yet — / follow @studiobluemli for the next one.").
- **D-09:** PopupStrip CTA removed entirely. The current `<a href="/say-hi">book by appointment</a>` block is deleted. No replacement CTA.
- **D-10:** No per-popup detail routes. `/popups` is a single page.
- **D-11:** TZ library choice = planner's discretion (resolved below: Q1 → `temporal-polyfill`).
- **D-12:** Daily cron rebuild mechanism = planner's discretion (resolved below: Q2 → scheduled handler on existing Worker + Workers Builds deploy hook).

**`/about` Page Composition**
- **D-13:** About copy = Claude drafts brand-voiced placeholder; founder edits via GitHub web UI later.
- **D-14:** No dedicated process/craft shots. Reuse 1–3 existing gallery hero WebPs as About-page visuals.
- **D-15:** About layout = copy first, photo strip below. Page order: eyebrow → hand-display headline → portrait copy → signature close → row of 1–3 product-hero photos.
- **D-16:** Signature close = `"made with love from NOPA ♡"` (custom hand-written phrase).
- **D-17:** No press / "as featured in" section.

**`/say-hi` Page (No Form)**
- **D-18:** Contact form dropped from v1 entirely. `/say-hi` ships as a small IG-DM-link page + mailto fallback.
- **D-19:** CON-01..CON-11 requirements move to Out of Scope.
- **D-20:** Phase 4 effectively removed from the roadmap (handled OUTSIDE Phase 3 via `/gsd-phase`).
- **D-21:** `AppointmentForm.jsx` stays in the codebase, unused.
- **D-22:** Leave `wrangler.jsonc`'s `run_worker_first: ["/api/*"]` and `astro.config.mjs`'s `output: 'server'` alone.
- **D-23:** PAG-06 narrative changes from "renders the contact form (CON-* requirements) plus visible Instagram and mailto fallback links" to "renders visible Instagram DM link + mailto link".

**Brand-System Tweaks (folded into Phase 3)**
- **D-24:** Wordmark font swap — Bagel Fat One → Caveat Brush. Edit `astro.config.mjs` (drop entry), `src/styles/colors_and_type.css` (cascade change), `src/layouts/BaseLayout.astro` (drop preload tag), and `CLAUDE.md` references. Do NOT edit `.claude/skills/studio-bluemli-design/`.
- **D-25:** Project-wide `NoPa` → `NOPA` casing fix on user-facing site copy. Apply to: `Hero.jsx` eyebrow + sub-tagline, `About.jsx` copy, `Footer.jsx` "made in NOPA, San Francisco", `src/content/site/config.yaml` (tagline, footer_text, og_description, og_title). Do NOT touch `.planning/`, `.claude/skills/`, code comments, `CLAUDE.md` planning prose, or commit messages.

**Shared SEO + Sitemap + Robots**
- **D-26:** Shared `SEO.astro` component (PAG-07). Emits `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card="summary_large_image"`, canonical `<link>`. Defaults from `site.yaml`. Canonical always points to apex. Replaces gallery detail page's inline `<meta slot="head" property="og:image">` pattern.
- **D-27:** Default `og:image` fallback = planner's discretion. Recommendation: option 3 (logo lockup PNG) for Phase 3; option 4 (schema field) as v1.x enhancement. (Resolved below: Q3.)
- **D-28:** Sitemap inclusion = all 5 routes + all `/gallery/<slug>` pages. No special filters.
- **D-29:** `robots.txt` — disallow on preview, allow on production. Planner picks implementation (b): Astro endpoint at `src/pages/robots.txt.ts`. (Resolved below: Q4.)

### Claude's Discretion

- TZ library: `@js-temporal/polyfill` vs `@date-fns/tz` (D-11) — **resolved below as Q1.**
- Cron mechanism: scheduled handler vs separate cron Worker vs GitHub Actions cron (D-12) — **resolved below as Q2.**
- Default `og:image` fallback approach (D-27) — **resolved below as Q3.**
- `robots.txt` implementation: static-swap vs Astro endpoint vs Cloudflare override (D-29) — **resolved below as Q4.**
- Exact compose pattern for the landing mini-callout: new component file vs inline `<section>` in `index.astro` (D-02) — **resolved in Q7 (recommend reusable Astro component `src/components/PopupCallout.astro`).**
- Past-archive sort within `/popups` PAST list: newest-first (matches gallery sort) is the obvious default — confirmed.
- Whether to keep `AppointmentForm.jsx` in `src/components/design-skill/` or delete it (D-21) — safe default is keep + drop the import.
- The exact 1–3 product-hero photos to use on `/about` (D-14) — picked during execution.
- Whether the "see all upcoming pop-ups →" link on landing renders as a button or a plain text link — per UI-SPEC §Landing it is a plain text link in coral with a +2px arrow slide on hover.
- Exact CSS structure for the landing mini-callout: scoped `<style>` in component vs inline.
- Whether to delete or comment-out the existing Bagel Fat One references from `CLAUDE.md` (D-24) — recommend deletion for cleanliness.
- Phase 4 removal: handled OUTSIDE Phase 3 via `/gsd-phase` after CONTEXT.md is written (D-20).

### Deferred Ideas (OUT OF SCOPE)

- Contact form (`<form>` + `/api/contact` Worker + Turnstile + KV rate limit + Resend + SPF/DKIM/DMARC) — dropped from v1 entirely.
- Per-popup detail routes (`/popups/<slug>`) — v1.x.
- `.ics` calendar export for pop-ups — v1.x.
- Photos on the `/popups` past archive — v1.x.
- Dedicated process/craft shots (hands, beads, bench) for `/about` — v1.x.
- Press / "as featured in" section on `/about` — out of scope unless real press happens.
- `og_image` as a `site` collection schema field — v1.x.
- Multi-locale `/popups` rendering for travelling pop-ups — out of scope.
- Auto-generated brand-chrome OG card (satori-style) for per-page sharing — v1.x.
- Per-piece pre-fill on `/say-hi` (`?piece=<slug>`) — moot.
- Hover transitions / micro-interactions on landing or `/popups` — out of scope.
- Decap / Sveltia / TinaCMS git-backed CMS UI — file layout already CMS-compatible.
- Removing `output: 'server'` + `run_worker_first: ["/api/*"]` — deferred.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **PAG-01** | Landing page renders hero + next-pop-up callout + 3–6 featured pieces + footer (modified by D-03 to omit pop-up section when zero upcoming, and by D-04 to fix featured count at 3) | Q1 (TZ-aware cutoff for upcoming filter), Q7 (mini-callout component pattern), existing `index.astro` already has the featured-3 sort/slice |
| **PAG-02** | `/gallery` from Phase 2 wires into live nav and is reachable from production routes | Already done in Phase 2; Phase 3 only refactors gallery pages to consume `<SEO />` (Q5) |
| **PAG-03** | `/popups` upcoming/past split computed at build time in `America/Los_Angeles` | Q1 (TZ library + cutoff snippet) |
| **PAG-04** | Cloudflare cron trigger rebuilds the site daily at ~3 AM PT | Q2 (scheduled handler + Workers Builds deploy hook) |
| **PAG-05** | `/about` written portrait + hand-font headline + 1–3 product-hero photos + signature close, no founder face, no press placeholders | UI-SPEC §/about; D-14 (reuse gallery WebPs); D-16 (signature phrase); no external research blocker |
| **PAG-06** | `/say-hi` renders IG DM link + mailto fallback (modified by D-18/D-23 from "contact form" to "IG link") | UI-SPEC §/say-hi; D-18 surface; no external research blocker |
| **PAG-07** | Shared `SEO.astro` component emits per-page meta + canonical to apex | D-26 contract; Q3 (default og:image fallback); Q5 (env-aware base URL pattern lifted from Phase 2 `gallery/[slug].astro`) |
| **PAG-08** | `@astrojs/sitemap` installed; generates `sitemap-index.xml`; `robots.txt` references the sitemap | Q5 (sitemap integration shape); Q4 (env-aware robots.txt endpoint) |
| **PAG-09** | All product images have alt text; alt text never uses `flower|petal|floral|bloom|blossom` | CI grep already enforces (Phase 1); Phase 3 reuses `alt={piece.data.name}` pattern from Phase 2 |

</phase_requirements>

## Project Constraints (from CLAUDE.md)

These are CLAUDE.md directives that Phase 3 plans MUST honor. Treat with the same authority as locked decisions.

- **GSD workflow gate.** Every Edit/Write must go through a GSD command; for Phase 3 that is `/gsd-execute-phase`.
- **Stack pinning** — never deviate from: Astro 6.2.x, `@astrojs/cloudflare@13.5.x`, `@astrojs/react@5.0.4`, React 19, Node 22.12+, Cloudflare Workers + Static Assets (not Pages).
- **No-client-React.** Every JSX component renders server-side as static HTML. `client:load`, `client:idle`, `client:visible`, `client:only` are forbidden for Phase 3 surfaces.
- **`passthroughImageService()`** — Sharp does not run in `workerd`. Sharp may run in `devDependencies` for build-time scripts only (it already does for `prebuild-images.mjs`).
- **No Tailwind / shadcn / MUI / Chakra / any UI library** — vanilla CSS via Astro scoped `<style>` blocks; `colors_and_type.css` is the single source of truth for tokens.
- **No MailChannels, no Cloudflare Email Service** — moot here because D-18 drops the form, but locked in case anyone reads this without the Phase 3 context.
- **Brand non-negotiables** (CI-enforced grep rules): no `bg-white`/`background: white`/`#fff` (except `#fff8`); no `flower|petal|floral|bloom|blossom` anywhere in `src/` or `src/content/`; no `gradient`, `backdrop-filter`, `border: 1px`; lowercase-only `src/pages/` filenames; ♡/♥ only emoji glyphs (in coral).
- **Files NOT touched by D-25 NOPA casing fix:** `.planning/`, `.claude/skills/studio-bluemli-design/`, code comments in `src/`, `CLAUDE.md` planning prose, commit messages.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| TZ-aware upcoming/past popup split (D-11, PAG-03) | Build-time (Node) | — | Static site — no request-time JS; the cutoff is computed when the build runs |
| Daily cron rebuild (D-12, PAG-04) | Cloudflare Worker (scheduled handler) | Cloudflare Workers Builds (deploy hook) | The scheduled handler is the only piece running at runtime; its only job is to POST to the deploy hook URL |
| Mini-callout rendering (D-02, PAG-01) | Build-time (Astro page) | — | Pure static composition of YAML data + JSX/Astro markup; no runtime |
| `/popups` upcoming/past lists (D-06, PAG-03) | Build-time (Astro page) | — | Same as above |
| `/about` page composition (D-13..D-17, PAG-05) | Build-time (Astro page) | — | Static; about-strip photos reuse Phase 2 prebuild output |
| `/say-hi` page (D-18, PAG-06) | Build-time (Astro page) | — | Pure markup + anchor links; zero runtime |
| Per-page SEO meta (D-26, PAG-07) | Build-time (Astro component) | — | `<SEO />` component emits `<head>` tags at render time |
| Sitemap generation (D-28, PAG-08) | Build-time (Astro integration) | — | `@astrojs/sitemap` runs at `astro build`; crawls static routes |
| robots.txt env branch (D-29, PAG-08) | Build-time (Astro endpoint) | — | `src/pages/robots.txt.ts` resolves `Astro.site` at build; written to `dist/client/robots.txt` |
| Default og:image rendering (D-27, PAG-07) | Build-time (one-shot script OR pre-committed file) | — | Generated once at commit time via `sharp`/`scripts/generate-og-default.mjs`, committed to `public/og-default.png`; never runs at request time |
| Wordmark font load (D-24) | Browser (CSS @font-face from Astro Fonts API) | Build-time (Astro Fonts API emits the @font-face rule) | The browser loads the WOFF2; Astro emits the @font-face at build |

Notable: **no Phase 3 capability lives in `workerd` at request time.** The scheduled handler is the sole runtime component, and its only network call is a single POST to a Cloudflare-owned API endpoint (the deploy hook).

## Standard Stack

### Core (already installed — no new core deps for Phase 3)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` | `^6.2.0` (installed) | Site framework | Locked by CLAUDE.md; Astro 6.2 published 2026-04-30 per CLAUDE.md sources `[VERIFIED: package.json + CLAUDE.md sources table]` |
| `@astrojs/cloudflare` | `^13.5.0` (installed) | Adapter | Locked `[VERIFIED: package.json]` |
| `@astrojs/react` | `^5.0.4` (installed) | React JSX SSR | Locked `[VERIFIED: package.json]` |
| `react` / `react-dom` | `^19.0.0` (installed) | React 19 for SSR-only | Locked `[VERIFIED: package.json]` |
| `sharp` | `^0.34.5` (installed as devDep) | Build-time image transforms (already used by `prebuild-images.mjs`) | Cannot run in `workerd`, but already a devDep — reuse it for Q3 (logo-lockup PNG). `[VERIFIED: package.json + npm view sharp version]` |

### New in Phase 3

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|-------------|
| `@astrojs/sitemap` | `^3.7.2` (latest 2026-05-13) | Auto-generated `sitemap-index.xml` for PAG-08 | Official Astro maintained integration; only mainstream choice. `[VERIFIED: npm view @astrojs/sitemap version → 3.7.2]` Documented at `https://docs.astro.build/en/guides/integrations-guide/sitemap/` `[CITED]` |
| `temporal-polyfill` | `^0.3.2` (latest 2026-05-13) | TZ-aware date math for `America/Los_Angeles` cutoff (D-11, PAG-03) | FullCalendar's polyfill — ~20 KB min+gz (vs `@js-temporal/polyfill` ~56 KB); ships only at **build time** (consumed by Astro page frontmatter, not shipped to browser); spec-compliant Temporal subset; Node 22.12 compatible. `[VERIFIED: npm view temporal-polyfill version → 0.3.2; bundle-size figures from Smashing Mag + Hacker News discussion]` |

### Verified versions (2026-05-13)

```bash
$ npm view @astrojs/sitemap version       # 3.7.2
$ npm view temporal-polyfill version       # 0.3.2
$ npm view @js-temporal/polyfill version   # 0.5.1
$ npm view @date-fns/tz version            # 1.4.1
$ npm view date-fns-tz version             # 3.2.0  (older third-party fork)
$ npm view prettier-plugin-astro version   # 0.14.1 (last release July 2024)
$ npm view sharp version                   # 0.34.5
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `temporal-polyfill` (FullCalendar) | `@js-temporal/polyfill` (TC39 champions) | Spec-perfect, but ~2.8× larger. Since the polyfill is build-time only, size matters less — but `temporal-polyfill` is also ~3× faster on benchmarks and depends on native BigInt (Node 22.12 has it). Both work; FullCalendar's smaller. |
| `temporal-polyfill` | `@date-fns/tz` (TZDate) | Smaller (~6 KB), wider date-fns ecosystem, no Temporal spec exposure. But the Phase 3 cutoff is a *single* comparison — `TZDate` is fine, `Temporal.PlainDate` is cleaner. We pick Temporal for the simpler one-liner; either is acceptable. |
| `temporal-polyfill` | `date-fns-tz` (the legacy `marnusw` package) | Maintenance status — `@date-fns/tz` is the date-fns team's official replacement (v4.0+). Do not use the older `date-fns-tz`. |
| Scheduled handler + deploy hook | GitHub Actions cron (`schedule:`) | Skewed up to 15 minutes on shared GitHub runners; needs a GitHub PAT or Cloudflare API token stored as a repo secret. More moving parts, worse SLA. |
| Scheduled handler + deploy hook | Separate cron-only Worker | Doubles the Worker count and the wrangler config; no benefit — the existing Worker can carry both handlers. |
| Build-time logo-lockup PNG (Q3) | Satori-generated runtime OG cards | Overkill for v1; runtime generation would require `workerd`-compatible PNG encoding and SSR rendering. Deferred to v1.x. |
| Build-time logo-lockup PNG | Add `og_image` field to `site` collection schema | More flexible (founder can swap via GitHub web UI), but requires a real PNG anyway. Layered: ship Path 3 in Phase 3, add Path 4 in v1.x without rework. |
| Astro endpoint `robots.txt.ts` | Two static files swapped at build via env | Workable but needs a `package.json` script + a copy step; the endpoint is one ~15-line file. |

**Installation:**
```bash
pnpm add @astrojs/sitemap temporal-polyfill
# Or, since the project's lockfile is npm:
npm install @astrojs/sitemap temporal-polyfill
```

(The project's `package.json` does not use pnpm — observed plain `package-lock.json` style dependency list. Phase 3 plans should use whichever lockfile the repo already has; do not introduce a second package manager.)

## Architecture Patterns

### System Architecture Diagram

```
                ┌─────────────────────────────────────────────┐
                │  Founder edits popups/.md or gallery/.md    │
                │  via GitHub web UI                          │
                └────────────────────────┬────────────────────┘
                                         │  git push
                                         ▼
                ┌─────────────────────────────────────────────┐
                │  Cloudflare Workers Builds (CI)             │
                │   1. pnpm/npm install                        │
                │   2. node scripts/prebuild-images.mjs        │  (existing — Phase 2)
                │   3. node scripts/generate-og-default.mjs    │  (NEW — Q3)
                │   4. astro check && astro build              │
                │      └── frontmatter runs temporal-polyfill  │  (NEW — Q1, build-time)
                │      └── @astrojs/sitemap emits sitemap-*    │  (NEW — Q5)
                │      └── robots.txt.ts emits dist/client/    │  (NEW — Q4, prerender=true)
                │      └── <SEO /> emits per-page meta         │  (NEW — Q5)
                │   5. wrangler deploy                         │
                └────────────────────────┬────────────────────┘
                                         │
                                         ▼
                ┌─────────────────────────────────────────────┐
                │  Cloudflare Workers + Static Assets         │
                │   • dist/client/* served as static          │
                │   • dist/server/entry.mjs handles /api/*    │  (reserved per D-22)
                │   • scheduled handler runs daily 3 AM PT    │  (NEW — Q2)
                └────────────────────────┬────────────────────┘
                                         │  POST to deploy hook URL
                                         ▼
                ┌─────────────────────────────────────────────┐
                │  Workers Builds Deploy Hook                  │
                │   → enqueues a new build → goto top of diagram│
                └─────────────────────────────────────────────┘
```

### Component Responsibilities

| File | Created/Edited | Responsibility |
|------|---------------|----------------|
| `src/pages/index.astro` | Edited | Replace `nextPopup = null` with `getCollection('popups')` + TZ filter; render `<PopupCallout />` when upcoming exists; D-04 featured-3 (already correct slice, no change); D-25 NOPA fix; wire `<SEO />` |
| `src/pages/popups.astro` | Edited | Replace `nextPopup = null` with `getCollection('popups')` + TZ split; render PopupStrip + ALSO COMING UP + PAST sections; D-08 empty state; wire `<SEO />` |
| `src/pages/about.astro` | Edited | Extend with photo strip per D-15; update copy per D-13; signature per D-16; D-25 NOPA fix in body; wire `<SEO />` |
| `src/pages/say-hi.astro` | Edited | Drop AppointmentForm import; render IG button + mailto fallback per D-18; wire `<SEO />` |
| `src/pages/gallery.astro` | Edited | Wire `<SEO />` (refactor) |
| `src/pages/gallery/[slug].astro` | Edited | Refactor inline `<meta slot="head" property="og:image">` to use `<SEO ogImage={ogImageUrl} />` |
| `src/pages/robots.txt.ts` | NEW | Astro endpoint emitting env-aware robots.txt per D-29 |
| `src/components/SEO.astro` | NEW | Per-page SEO meta emitter; default og:image fallback; canonical to apex |
| `src/components/PopupCallout.astro` | NEW | Landing mini-callout per D-02; renders only when `upcoming.length >= 1` |
| `src/lib/popups.ts` | NEW | TZ-aware split helper: `splitPopups(entries) → { soonest, alsoComing, past }`. Pure function; consumed by `index.astro` and `popups.astro`. Centralizes Temporal usage to one file. |
| `src/lib/site-url.ts` | NEW | Env-aware base URL resolution helper (lifts from `gallery/[slug].astro` per D-26). Consumed by `SEO.astro` and `robots.txt.ts`. |
| `src/components/design-skill/PopupStrip.jsx` | Edited | Delete the `<a href="/say-hi">book by appointment</a>` block per D-09 (the only CTA edit) |
| `src/components/design-skill/Hero.jsx` | Edited | D-25 NOPA fix on two string literals |
| `src/components/design-skill/About.jsx` | Edited | D-13 copy rewrite + D-16 signature + D-25 NOPA. Photo strip can be inline in `about.astro` instead — see Q7. |
| `src/components/design-skill/Footer.jsx` | Edited | D-25 NOPA fix on the tagline string |
| `src/content/site/config.yaml` | Edited | D-25 NOPA fix on `tagline`, `footer_text`, `og_description`, `og_title` |
| `src/styles/colors_and_type.css` | Edited | D-24 cascade swap for `--font-wordmark` |
| `src/layouts/BaseLayout.astro` | Edited | D-24 — remove `<Font cssVariable="--font-wordmark-loaded" preload />` tag |
| `astro.config.mjs` | Edited | D-24 — remove Bagel Fat One Fonts API entry; add `@astrojs/sitemap` integration |
| `wrangler.jsonc` | Edited | Q2 — add `triggers.crons: ["0 11 * * *"]` (3 AM PT = 11 UTC during DST, 10 UTC during PST — see Q2 caveats) |
| `dist/server/entry.mjs` | Generated | Astro emits this from a scheduled handler module — see Q2 mechanism notes |
| `src/scheduled.ts` (or worker integration approach) | NEW | The scheduled handler — see Q2 for the specific integration pattern |
| `scripts/generate-og-default.mjs` | NEW | One-shot build-time script that renders `assets/logo/mark.svg` → `public/og-default.png` at 1200×630 with cream background using `sharp` |
| `public/og-default.png` | NEW | 1200×630 logo-lockup PNG, committed (one-shot output of the script above) — see Q3 |
| `package.json` | Edited | Add `@astrojs/sitemap`, `temporal-polyfill` deps; optionally add `og:default` script |
| `CLAUDE.md` | Edited | Remove Bagel Fat One references per D-24 |
| `.planning/REQUIREMENTS.md` | Edited | Update PAG-01 narrative (D-03); move CON-01..CON-11 to Out of Scope (D-19); update PAG-06 narrative (D-23) |
| `.planning/ROADMAP.md` | Edited | Update Phase 3 SC1 narrative (D-03); soften key risk #3 (D-14). NOTE: Phase 4 removal handled OUTSIDE Phase 3 per D-20. |

### Pattern 1: TZ-aware popup split helper

**What:** A single pure-function module that consumes Phase 2's `getCollection('popups')` entries and returns `{ soonest, alsoComing, past }` arrays correctly bucketed at the LA-local day boundary.

**When to use:** Both `index.astro` (needs `upcoming` to decide whether to render the mini-callout) and `popups.astro` (needs all three buckets) call this.

**Code (uses `temporal-polyfill`):**
```typescript
// Source: temporal-polyfill README + MDN Temporal.PlainDate docs (CITED)
// src/lib/popups.ts
import { Temporal } from 'temporal-polyfill';
import type { CollectionEntry } from 'astro:content';

type Popup = CollectionEntry<'popups'>;

const ZONE = 'America/Los_Angeles';

/**
 * Returns the LA-local "today" as a Temporal.PlainDate.
 * Computed once per build invocation (this module is imported by .astro page
 * frontmatter, which runs at build time only — never at request time).
 */
function todayInLA(): Temporal.PlainDate {
  return Temporal.Now.plainDateISO(ZONE);
}

/**
 * Parses a popup's effective end date (end_date if present, otherwise date)
 * as a Temporal.PlainDate. The popups schema (CNT-05 / Phase 2 D-18) stores
 * both as ISO YYYY-MM-DD strings, so Temporal.PlainDate.from() is exact.
 */
function popupEndDate(p: Popup): Temporal.PlainDate {
  return Temporal.PlainDate.from(p.data.end_date ?? p.data.date);
}

/**
 * Sorts ascending by event date (soonest-first for upcoming, oldest-first base
 * — the past split reverses it below).
 */
function byDateAsc(a: Popup, b: Popup) {
  return Temporal.PlainDate.compare(
    Temporal.PlainDate.from(a.data.date),
    Temporal.PlainDate.from(b.data.date),
  );
}

export function splitPopups(entries: Popup[]) {
  const today = todayInLA();

  // A popup is "past" if its end date is strictly before LA-today.
  // Day-of events stay upcoming all day in LA — matches Pitfall #7's contract.
  const upcoming: Popup[] = [];
  const past:     Popup[] = [];
  for (const e of entries) {
    if (Temporal.PlainDate.compare(popupEndDate(e), today) < 0) {
      past.push(e);
    } else {
      upcoming.push(e);
    }
  }

  upcoming.sort(byDateAsc);
  past.sort((a, b) => byDateAsc(b, a)); // newest-first for past archive

  return {
    soonest:     upcoming[0] ?? null,
    alsoComing:  upcoming.slice(1),
    past,
    hasUpcoming: upcoming.length > 0,
    hasMultiple: upcoming.length >= 2,
  };
}
```

**Confidence:** HIGH. `Temporal.Now.plainDateISO(timeZone)` is the documented Temporal API for "today in TZ X" and is supported by both polyfills. `[CITED: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDate]`

### Pattern 2: Env-aware base URL helper (lifted from Phase 2)

**What:** A pure function that resolves the canonical base URL the page is being served from, walking the same precedence Phase 2's `gallery/[slug].astro` uses.

**When to use:** Both `SEO.astro` (for `og:url` and absolute `og:image`) and `robots.txt.ts` (for the production-vs-preview branch) need this.

**Code:**
```typescript
// Source: src/pages/gallery/[slug].astro lines 48-52, with one Workers-Builds caveat documented below
// src/lib/site-url.ts
/**
 * Resolve the deployment's base URL with the precedence:
 *   1. CF_PAGES_URL      (legacy — Cloudflare Pages preview/production)
 *   2. CF_WORKERS_URL    (anticipated — Cloudflare Workers Builds equivalent; see CAVEAT)
 *   3. PUBLIC_SITE_URL   (explicit override — for non-CF environments or manual preview overrides)
 *   4. Astro.site        (apex configured in astro.config.mjs — production fallback)
 *
 * Returns a URL WITHOUT trailing slash so callers can append `/path` safely.
 *
 * CAVEAT (2026-05-13): Cloudflare Workers Builds currently exposes only:
 *   - CI, WORKERS_CI, WORKERS_CI_BUILD_UUID,
 *     WORKERS_CI_COMMIT_SHA, WORKERS_CI_BRANCH
 * It does NOT (yet) expose CF_WORKERS_URL or any preview-deploy URL at build time.
 * For Phase 3 this means: preview deploys will fall through to Astro.site (apex).
 * That's fine for og:image and og:url on previews (they self-canonicalize to apex —
 * acknowledged in D-26 risk note), and robots.txt's preview branch is reached via
 * the WORKERS_CI branch != main check below, not via URL host comparison.
 * [VERIFIED: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/]
 */
export function resolveSiteBase(astroSite?: URL): string {
  const fromEnv =
    import.meta.env.CF_PAGES_URL ??
    import.meta.env.CF_WORKERS_URL ??
    import.meta.env.PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return (astroSite?.toString() ?? 'https://studiobluemli.com').replace(/\/$/, '');
}

/**
 * True only when the build is producing the production deployment, NOT a preview.
 * Used by robots.txt.ts to gate Allow vs Disallow.
 */
export function isProduction(): boolean {
  // Workers Builds sets WORKERS_CI_BRANCH; production branch is main.
  // Outside CI (local dev), default to "not production" so robots.txt always disallows
  // unless explicitly overridden.
  const branch = import.meta.env.WORKERS_CI_BRANCH;
  if (branch) return branch === 'main';
  // CF_PAGES_BRANCH would have similar semantics on legacy Pages.
  const pagesBranch = import.meta.env.CF_PAGES_BRANCH;
  if (pagesBranch) return pagesBranch === 'main';
  return false;
}
```

**Confidence:** HIGH for `WORKERS_CI_BRANCH` (verified against Workers Builds Configuration docs). MEDIUM-but-acceptable for the URL fallback: the only fully verified injected env var with a URL is `CF_PAGES_URL` (legacy Pages); Workers Builds does not currently expose an equivalent. `Astro.site` is the production fallback, which is correct (canonical-to-apex per D-26).

### Pattern 3: Per-page meta via shared `<SEO />` + slot

**What:** The `<SEO />` component reads defaults from `getEntry('site', 'default').data` and accepts per-page overrides via props. It emits meta tags into the BaseLayout `<head>` via `slot="head"` (already wired in BaseLayout per Phase 2).

**Code:**
```astro
---
// Source: PAG-07 spec + Astro slot pattern (CITED: docs.astro.build/en/guides/components/#named-slots)
// src/components/SEO.astro

import { getEntry } from 'astro:content';
import { resolveSiteBase } from '../lib/site-url';

interface Props {
  /** Page-specific <title>; appended with " — Studio Bluemli" by callers if desired. */
  title:        string;
  /** Plain-text meta description. Falls back to site og_description. */
  description?: string;
  /** ABSOLUTE og:image URL. Falls back to /og-default.png (D-27 path 3). */
  ogImage?:     string;
  /** Path of the current page, e.g. "/gallery/cluster-coral". Defaults to "/" — set per page. */
  pathname?:    string;
}

const { title, description, ogImage, pathname = '/' } = Astro.props;

const site = (await getEntry('site', 'default'))!.data;
const base = resolveSiteBase(Astro.site);

const canonical    = `${base}${pathname === '/' ? '' : pathname}`;
const ogImageAbs   = ogImage ?? `${base}/og-default.png`;
const finalDesc    = description ?? site.og_description;
---
<title>{title}</title>
<meta name="description" content={finalDesc} />

<link rel="canonical" href={canonical} />

<meta property="og:title"       content={title} />
<meta property="og:description" content={finalDesc} />
<meta property="og:image"       content={ogImageAbs} />
<meta property="og:url"         content={canonical} />
<meta property="og:type"        content="website" />

<meta name="twitter:card"  content="summary_large_image" />
<meta name="twitter:image" content={ogImageAbs} />
```

**Wire from a page:**
```astro
---
// e.g. src/pages/index.astro
import SEO from '../components/SEO.astro';
const site = (await getEntry('site', 'default'))!.data;
---
<BaseLayout title={site.og_title}>
  <SEO slot="head" title={site.og_title} pathname="/" />
  <!-- ...rest of page... -->
</BaseLayout>
```

**Confidence:** HIGH. Mirror of the proven gallery `[slug].astro` pattern (currently working in Phase 2 verification).

### Anti-Patterns to Avoid

- **Do not render the mini-callout client-side.** The whole point of Astro is the build-time `Temporal.Now.plainDateISO(ZONE)` — shipping any TZ math to the browser regresses the no-client-JS rule.
- **Do not pass the popups collection through `JSON.stringify(...)` and back.** `Temporal.PlainDate` objects are not JSON-serializable. Keep all `Temporal.*` types inside `src/lib/popups.ts`; the page consumes plain `CollectionEntry<'popups'>` objects on the outside.
- **Do not put the deploy hook URL in `wrangler.jsonc` or `astro.config.mjs`.** It is a credential. Use `wrangler secret put DEPLOY_HOOK_URL` and read it inside the scheduled handler as `env.DEPLOY_HOOK_URL`.
- **Do not call the deploy hook from the page frontmatter.** It is a runtime POST, not a build step. The scheduled handler is the only caller.
- **Do not preload `--font-wordmark-loaded`** after D-24 lands — that font is no longer in the Fonts API config and the preload tag would 404.
- **Do not set `Astro.site` to the preview URL.** Canonical to apex is the contract (D-26 + Pitfall #18). Previews self-canonicalize; D-29 robots.txt closes the indexing gap.
- **Do not emit `og:image` as a relative URL.** Crawlers (Slack, IG, iMessage, Facebook debugger) require absolute URLs (Pitfall #14). The `<SEO />` component always emits absolute via `resolveSiteBase`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Compute "is today past this date in LA?" | Custom `Date` math with UTC offset arithmetic | `temporal-polyfill` (`Temporal.Now.plainDateISO('America/Los_Angeles')`) | DST transitions break naive UTC math. `Temporal.PlainDate.compare` is the spec-correct primitive. Pitfall #7 names this exact failure. |
| Daily 3 AM PT rebuild trigger | Custom polling script in a separate Worker | Workers Builds **Deploy Hook** + Cron Trigger | Deploy hooks are a first-class Cloudflare primitive launched 2026-04-01 specifically for "external cron rebuilds a static site" — no auth header, no PAT, rate-limited (10/min/worker). |
| Sitemap XML generation | Custom XML emitter in `src/pages/sitemap.xml.ts` | `@astrojs/sitemap@3.7.2` | Handles sitemap-index sharding, lastmod, canonical URL injection, dynamic-route enumeration. One line of config. |
| Generate 1200×630 PNG from `mark.svg` | Custom `<canvas>` browser script | `sharp` at build time (already a devDep) | Sharp is already installed for `prebuild-images.mjs`. Runs once at scaffold-time; commit the output. Workerd never sees it. |
| robots.txt environment-branching | A `_headers` or `_routes.json` rewrite | Single `src/pages/robots.txt.ts` Astro endpoint | Astro emits it to `dist/client/robots.txt` at build; `prerender = true` is the right toggle for a static-text endpoint. |
| Per-page OG meta tags | Hand-emit `<meta>` tags in every page's `<head>` | Shared `<SEO />` component | DRY; centralizes the env-aware base URL; required by PAG-07. |
| Trailing-slash / canonical normalization | A custom URL builder | `Astro.site` + the resolver | `astro.config.mjs` already sets `site: 'https://studiobluemli.com'`; trust it. |
| CSS aliasing of one already-loaded font to two variables | Add a second `Font` entry to Fonts API | `var(--font-wordmark): var(--font-display-loaded), 'Caveat Brush', cursive` | The Astro Fonts API loads each `cssVariable` independently — adding a second entry pointing at the same Fontsource family would emit duplicate `@font-face`. The CSS cascade composes one variable into another at zero cost — see Q6. |

**Key insight:** Phase 3's only genuinely new ecosystem touch points are `@astrojs/sitemap` (a one-line integration) and `temporal-polyfill` (one helper module). Everything else either already exists in the codebase or is a single Cloudflare primitive (deploy hooks + cron triggers) that Cloudflare ships specifically for this use case.

## Common Pitfalls

### Pitfall 1: The DST cliff at 11:00 vs 10:00 UTC

**What goes wrong:** The cron expression `0 11 * * *` fires at 3 AM **only during Pacific Daylight Time** (PDT, UTC-7). When PST is active (Nov–March), 11:00 UTC is 4 AM PT, not 3 AM. The founder's "3 AM PT" intent silently drifts by an hour twice a year.

**Why it happens:** Cloudflare cron triggers fire on UTC `m h dom mon dow` only — there is no IANA timezone field. A single fixed UTC hour cannot satisfy "3 AM Pacific" across the year.

**How to avoid:** Either accept the ±1 hour drift (3 AM in summer, 4 AM in winter — both are well after midnight, which is the only thing that matters semantically) and document it, OR schedule **two cron expressions** that bracket the desired window:
```jsonc
"triggers": { "crons": ["0 10 * * *", "0 11 * * *"] }
// Fires at 3 AM PT in winter (PST: 11:00 UTC) and 3 AM PT in summer (PDT: 10:00 UTC).
// Also fires the "wrong" one (the other hour) — but rebuilds are idempotent; cost is one
// extra build per day. Workers Builds free tier supports up to 100 builds/day per worker, so this is fine.
```
**Recommend** the single-cron path with a one-line comment in `wrangler.jsonc` explaining the ~1-hour drift. Two builds/day burns 2× free quota for no real benefit at this traffic scale; pop-ups don't care whether they roll off at 3 AM or 4 AM PT.

**Warning signs:** Founder complains in March or November that a pop-up still shows as "upcoming" the morning after it ended.

### Pitfall 2: Reading `import.meta.env.WORKERS_CI_BRANCH` at module top-level vs inside a function

**What goes wrong:** Astro evaluates page frontmatter at build time. Top-level reads of `import.meta.env.X` are inlined at that moment. Robots.txt's `isProduction()` check needs to see the **current** build's branch, not a stale capture.

**How to avoid:** Always wrap env reads in a function (as `resolveSiteBase` and `isProduction` are written above). Astro's Vite layer will still resolve them at build, but the indirection prevents accidental bundling-time stripping if the helper is reused at runtime in the future.

### Pitfall 3: `@astrojs/sitemap` and SSR mode

**What goes wrong:** The integration explicitly states: *"This integration cannot generate sitemap entries for dynamic routes in SSR mode."* (`[CITED: docs.astro.build/en/guides/integrations-guide/sitemap/]`) Phase 1 set `output: 'server'` for the `/api/*` reservation (D-22), so naively one might expect the gallery `[slug]` route to be SSR and thus excluded.

**Why it doesn't bite us:** Every Phase 3 page (including `/gallery/[slug]`) declares `export const prerender = true`. The sitemap integration treats prerendered routes as static and DOES include them. Verify by inspecting `dist/sitemap-0.xml` and grepping for `/gallery/cluster-coral` etc. — they should all be present.

**Warning signs:** `sitemap-0.xml` is conspicuously short (only 5 routes, not 5 + N gallery slugs).

### Pitfall 4: `robots.txt.ts` `prerender = true` collision with `output: 'server'`

**What goes wrong:** The Astro docs note: *"In `static` mode, you must opt out of prerendering for each custom endpoint with `export const prerender = false`."* (`[CITED: docs.astro.build/en/guides/endpoints/]`) Our project is in `server` mode, where the inverse applies: endpoints are SSR by default, so we MUST `export const prerender = true` to emit `dist/client/robots.txt` as a real static file. If we forget, every request to `/robots.txt` hits the Worker — which works, but defeats the static-first goal and burns Worker requests on bot traffic.

**How to avoid:** The `robots.txt.ts` snippet in Q4 below sets `prerender = true`. CI-verify by checking `dist/client/robots.txt` exists after `astro build`.

### Pitfall 5: Deploy hook URL leaks via build logs

**What goes wrong:** Workers Builds deploy hooks have no auth header — anyone with the URL can trigger a build. If the URL appears in build logs (e.g., a stray `console.log(env.DEPLOY_HOOK_URL)`), Cloudflare's build log retention makes it discoverable to anyone with build-log access on the account.

**How to avoid:** Store via `wrangler secret put DEPLOY_HOOK_URL`. Read inside the scheduled handler as `env.DEPLOY_HOOK_URL`. Never log it. Cloudflare docs explicitly call this out: *"Store Deploy Hook URLs in environment variables or a secrets manager, never in source code or public configuration files."* `[CITED: developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/]`

**Warning signs:** `wrangler tail` shows the URL in logs; the URL appears in `wrangler.jsonc` `vars`.

### Pitfall 6: Caveat-Brush `@font-face` aliasing only works after the Fonts API has emitted the rule

**What goes wrong:** The plan in D-24 is to set `--font-wordmark: var(--font-display-loaded), 'Caveat Brush', cursive`. This composes only if the Astro Fonts API has emitted an `@font-face` rule that binds the family `Caveat Brush` to the URL (and if `--font-display-loaded` is set to that family name). If the `<Font cssVariable="--font-display-loaded" preload />` tag is missing from `BaseLayout.astro`, no `@font-face` is emitted, and the wordmark falls through to `'Caveat Brush'` (literal family lookup, will fail on a fresh visit), then `cursive`.

**How to avoid:** D-24 only removes the **wordmark** preload tag. The `--font-display-loaded` preload tag must stay (it's already there, and `Caveat Brush` is the active display font for headlines on `/about`, `/popups`, `/say-hi`). Verify in `BaseLayout.astro` that `<Font cssVariable="--font-display-loaded" preload />` remains after the edit. See Q6 for the verbatim confirmation that this aliasing pattern works.

### Pitfall 7: NOPA grep changes a string inside a code comment

**What goes wrong:** A naive `sed -i 's/NoPa/NOPA/g' src/**` will also rewrite `src/sample-data.ts` comments, `Hero.jsx` comments mentioning "in NoPa", and any `// renders NoPa neighborhood…` notes — and any planner copy in `.planning/` or `CLAUDE.md`. The D-25 exclusion list is explicit; the planner must use a targeted replacement, not a blanket sed.

**How to avoid:** Apply NOPA fix to exactly the string literals enumerated in D-25 (Hero.jsx eyebrow + sub-tagline lines; About.jsx body paragraphs; Footer.jsx tagline string; site/config.yaml tagline + footer_text + og_description + og_title). Do not run `grep -r NoPa` and edit everything — that catches `.planning/`, `.claude/skills/`, and code comments which D-25 explicitly preserves.

## Code Examples

### Example 1: Mini-callout component (D-02 + UI-SPEC §Landing)

```astro
---
// Source: 03-UI-SPEC.md §Landing mini-callout + sketch-findings 003-C
// src/components/PopupCallout.astro

import type { CollectionEntry } from 'astro:content';

interface Props {
  popup:       CollectionEntry<'popups'>;
  hasMultiple: boolean;
}
const { popup, hasMultiple } = Astro.props;

// Format weekday + month + day in popup TZ (always America/Los_Angeles in v1,
// but the schema has tz so honor it).
const eventDate = new Date(`${popup.data.date}T${popup.data.start_time}:00`);
const dateLabel = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
  timeZone: popup.data.tz,
}).format(eventDate);
// UI-SPEC: format is "<Weekday>, <Month> <Day> — <Venue>" with em-dash.
const timeLabel = `${popup.data.start_time}–${popup.data.end_time}`;
---
<section class="popup-callout">
  <span class="hand-eyebrow">next pop-up</span>
  <p class="when">{dateLabel} — <span class="venue">{popup.data.location}</span></p>
  <p class="time">{timeLabel}</p>
  {hasMultiple && (
    <a class="see-all" href="/popups">see all upcoming pop-ups →</a>
  )}
</section>

<style>
  .popup-callout {
    max-width: 640px;
    margin: 0 auto;
    padding: var(--space-6) var(--space-5);
    text-align: center;
  }
  .hand-eyebrow {
    font-family: var(--font-hand);
    font-size: var(--fs-xl);              /* 28px */
    color: var(--color-accent-leaf);
    line-height: 1;
    display: inline-block;
    transform: rotate(-1.5deg);
    margin-bottom: var(--space-3);
  }
  .when {
    font-family: var(--font-body);
    font-weight: 800;
    font-size: var(--fs-xl);              /* 28px */
    color: var(--color-fg-strong);
    line-height: 1.15;
    margin: 0 0 var(--space-4);
  }
  .when .venue { color: var(--coral-500); }
  .time {
    font-family: var(--font-body);
    font-size: var(--fs-sm);
    color: var(--color-fg-muted);
    line-height: var(--lh-normal);
    margin: 0 0 var(--space-3);
  }
  .see-all {
    font-family: var(--font-body);
    font-weight: 700;
    font-size: var(--fs-xs);
    color: var(--coral-500);
    text-decoration: none;
    line-height: 1;
    display: inline-block;
    transition: transform var(--dur-fast) var(--ease-soft),
                color     var(--dur-fast) var(--ease-soft);
  }
  .see-all:hover { color: var(--coral-700); transform: translateX(2px); }
  .see-all:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 4px;
  }
</style>
```

### Example 2: `src/pages/robots.txt.ts` (D-29, PAG-08)

```typescript
// Source: docs.astro.build/en/guides/endpoints/ + Workers Builds env vars docs (CITED)
// src/pages/robots.txt.ts
import type { APIRoute } from 'astro';
import { isProduction } from '../lib/site-url';

// Required under output: 'server' so this is statically emitted to
// dist/client/robots.txt instead of running in the Worker on every request.
export const prerender = true;

export const GET: APIRoute = () => {
  const body = isProduction()
    ? 'User-agent: *\nAllow: /\nSitemap: https://studiobluemli.com/sitemap-index.xml\n'
    : 'User-agent: *\nDisallow: /\n';

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

### Example 3: `wrangler.jsonc` cron + scheduled handler integration

The `@astrojs/cloudflare` adapter emits a Worker that already exports a `fetch` handler. To add a `scheduled` handler we have two practical options:

**Option A (recommended) — let Astro's adapter emit `fetch`, then layer in `scheduled` via a custom entry.** The adapter's docs and code allow specifying a custom worker entry that re-exports the adapter's default export and adds `scheduled`. Astro 6 / `@astrojs/cloudflare@13.5` documents this pattern.

**Option B — use Wrangler's `triggers.crons` with the adapter's default export and rely on the Workers runtime invoking the same handler.** This does NOT work cleanly because Astro's adapter exports a `fetch` handler, not a `scheduled` one, and the Workers runtime will reject the cron trigger with "no scheduled handler" at deploy time.

**Recommended pattern:** Use Cloudflare's worker-module syntax:

```typescript
// src/scheduled.ts — new in Phase 3
// Imported via wrangler.jsonc's `main` field; re-exports Astro's adapter handler.
import handler from '@astrojs/cloudflare/entrypoints/server';

interface Env {
  ASSETS: Fetcher;
  DEPLOY_HOOK_URL: string; // set via `wrangler secret put DEPLOY_HOOK_URL`
}

export default {
  // Delegate all HTTP traffic to Astro's adapter (static assets + reserved /api/*).
  fetch: handler.fetch,

  // Cron trigger fires at 3 AM PT (accepting ±1h DST drift per Pitfall 1 above).
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      fetch(env.DEPLOY_HOOK_URL, { method: 'POST' })
        .then(r => {
          if (!r.ok) console.error('Deploy hook failed:', r.status, r.statusText);
        })
        .catch(err => console.error('Deploy hook error:', err)),
    );
  },
};
```

Then `wrangler.jsonc` becomes:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "studio-bluemli",
  "main": "src/scheduled.ts",                          // ← changed from adapter entrypoint
  "compatibility_date": "2026-05-12",
  "compatibility_flags": ["nodejs_compat"],

  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "run_worker_first": ["/api/*"]
  },

  "triggers": {
    "crons": ["0 11 * * *"]                            // 3 AM PDT (summer); 4 AM PST (winter) — see Pitfall 1
  },

  "observability": { "enabled": true }
}
```

**Caveat:** Re-pointing `main` from `@astrojs/cloudflare/entrypoints/server` to `src/scheduled.ts` is a non-trivial change to the adapter's contract. Plan 3 task should:
1. Verify the adapter still finds its entrypoint when `src/scheduled.ts` re-exports it (Astro 6 + adapter 13.5 should support this; if not, fall back to Plan B: Wrangler's `[triggers] crons` + a tiny standalone cron Worker pointed at a different Worker name, sharing the deploy hook secret).
2. Run `astro build && wrangler deploy --dry-run` to confirm no missing-handler errors.

`[VERIFIED: developers.cloudflare.com/workers/configuration/cron-triggers/ + developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/]`

### Example 4: Build-time OG default PNG generator

```javascript
// scripts/generate-og-default.mjs — new in Phase 3
// One-shot generator run at scaffold time; output committed to public/og-default.png.
// Sharp runs on the CI Linux runner (or local dev macOS), NEVER in workerd.
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');

const W = 1200, H = 630;

// Cream background (#F5DCC7 = --cream-100) with the coral mark.svg centered.
const cream = '#F5DCC7';

const markSvg = await readFile(resolve(ROOT, 'assets/logo/mark-coral.svg'));

// Resize the mark to ~30% of the canvas width — keeps brand recognizable without crowding.
const markPng = await sharp(markSvg, { density: 384 })
  .resize({ width: Math.round(W * 0.32) })
  .png()
  .toBuffer();

const out = await sharp({
  create: { width: W, height: H, channels: 3, background: cream },
})
  .composite([{ input: markPng, gravity: 'center' }])
  .png()
  .toBuffer();

await mkdir(resolve(ROOT, 'public'), { recursive: true });
await writeFile(resolve(ROOT, 'public/og-default.png'), out);
console.log('Wrote public/og-default.png (1200×630, cream + mark).');
```

Wire as a one-shot in `package.json` scripts:
```jsonc
"og:default": "node scripts/generate-og-default.mjs"
```

Commit `public/og-default.png`. `<SEO />` fallback URL: `https://studiobluemli.com/og-default.png`.

`[VERIFIED: npm view sharp version → 0.34.5 installed; scripts/prebuild-images.mjs already uses sharp the same way]`

## Runtime State Inventory

Not a rename/refactor/migration phase in the destructive sense — but Phase 3 *does* change a few persisted/configured things. Audit:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None. No database. No KV. No Mem0. No Datadog. `src/content/popups/` is empty per CONTEXT.md §Specifics. | None — verified by `ls src/content/popups/`. |
| Live service config | (after deploy) **Workers Builds Cron Trigger** — registered when `wrangler deploy` is run with `triggers.crons` set. Not exported to git automatically; visible in Cloudflare dashboard → Worker → Triggers. | Document in `CONTENT_EDITING.md` or a new ops note that the cron lives in Cloudflare's dashboard once deployed. **Workers Builds Deploy Hook** — a single URL generated in the Cloudflare dashboard (Workers & Pages → studio-bluemli → Settings → Builds → Deploy Hooks); URL stored only as a Worker secret. Founder needs no action. |
| OS-registered state | None — no macOS launchd, no Windows Task Scheduler, no pm2. | None. |
| Secrets / env vars | NEW: `DEPLOY_HOOK_URL` (Worker secret). Set via `wrangler secret put DEPLOY_HOOK_URL` once after creating the deploy hook in Cloudflare dashboard. No `.env` file change. No code reads `process.env` for it — only `env.DEPLOY_HOOK_URL` inside the scheduled handler. | One-time: founder/engineer creates deploy hook in dashboard, copies URL, runs `wrangler secret put DEPLOY_HOOK_URL` and pastes when prompted. Document in `CONTENT_EDITING.md` ops appendix or a new `OPS.md`. |
| Build artifacts | `dist/` is gitignored. `public/og-default.png` is committed (one-shot, regen via `npm run og:default` if `mark-coral.svg` ever changes). `public/gallery/` is gitignored per Phase 2 D-01. | None blocking. Regeneration step documented next to the script. |

**Canonical question:** *After every file in the repo is updated, what runtime systems still have the old string cached, stored, or registered?*

Answer: only one thing — the **Cloudflare Workers Builds cron trigger** itself, which is registered into Cloudflare's control plane the first time `wrangler deploy` runs after `triggers.crons` is added to `wrangler.jsonc`. The trigger persists across deploys until removed. No drift risk because the cron expression is in git (`wrangler.jsonc`); each deploy reconciles.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build & local dev | (assumed) ✓ | ≥22.12 (per `package.json` engines) | — |
| npm / pnpm | Install | (assumed) ✓ | — | — |
| `sharp` | `scripts/generate-og-default.mjs` (Q3) | ✓ | 0.34.5 (installed) | — |
| `wrangler` | `wrangler secret put DEPLOY_HOOK_URL`, deploys | ✓ | 4.x (installed) | — |
| Cloudflare account with Workers Builds enabled | Deploy hooks, scheduled handlers | (assumed) ✓ — Phase 1 already deployed to `*.workers.dev` | — | — |
| Cloudflare Workers Free Tier | scheduled handler runs | ✓ | n/a | Paid plan if cron count exceeds 5/account |
| `@astrojs/sitemap` | PAG-08 sitemap | ✗ (install) | 3.7.2 (target) | None needed |
| `temporal-polyfill` | Q1 TZ math | ✗ (install) | 0.3.2 (target) | `@date-fns/tz` if Temporal proves unstable on Node 22.12 build |

**Missing dependencies with no fallback:** None blocking. Both new npm packages install via `npm install` on the CI runner.

**Missing dependencies with fallback:**
- The deploy hook URL must be created in the Cloudflare dashboard *before* the scheduled handler can succeed. If the engineer ships the cron handler before creating the deploy hook, the daily POST will hit a 404. Document creation as a one-time prerequisite in execution. (Plan should not block on it; the cron failing for one day is harmless — the build is still triggered by founder pushes.)

## Validation Architecture

Workflow config has `nyquist_validation: false` per `.planning/config.json`. **This section is SKIPPED.** Phase 3 verification relies on the standard GSD verification flow (`/gsd-verify-work`) plus the CI grep rules already in place.

For executor convenience, Q8 below lists per-decision verification commands.

## Security Domain

Phase 3 has effectively **no new public attack surface**: the contact form (which carried the entire CON-* threat model) is dropped per D-18. The remaining net-new runtime surface is:

1. The scheduled handler — invoked only by Cloudflare's internal cron infrastructure, not network-reachable from the public internet.
2. The robots.txt endpoint — emits static text from a build-time `prerender = true` (no input handling).
3. The deploy hook URL — a Cloudflare-side secret; treated as a credential.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | No | No auth surface in Phase 3 |
| V3 Session Management | No | Stateless, static site |
| V4 Access Control | No | Public portfolio |
| V5 Input Validation | Marginal | No form. Only public input is GET URLs; Astro's prerendered static files don't accept input. |
| V6 Cryptography | Marginal | TLS provided by Cloudflare edge; no project-managed crypto. |
| V7 Errors & Logging | Yes | The scheduled handler must not log `env.DEPLOY_HOOK_URL` (see Pitfall 5). |
| V10 Malicious Code | Yes | New devDeps `@astrojs/sitemap` (official Astro org) and `temporal-polyfill` (FullCalendar) — both trusted. Verify checksums via lockfile. |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Deploy hook URL leak via logs | Information Disclosure | Store as Worker secret; never `console.log` it (Pitfall 5) |
| Deploy hook URL leak via wrangler.jsonc | Information Disclosure | Never commit; use `wrangler secret put` |
| Cron abuse (DoS by triggering many rebuilds) | Denial of Service | Rate-limited by Cloudflare (10 builds/min/worker); free tier daily build cap |
| robots.txt indexing leakage on preview | Information Disclosure | D-29's `Disallow: /` on non-production branches |
| Sitemap leaks unintended URLs | Information Disclosure | Phase 3 has no unintended URLs — all 5 + gallery slugs are public-by-design |

## Answers to the 7 Open Questions

### Q1: TZ library — `temporal-polyfill` (FullCalendar) [HIGH confidence]

**Pick:** `temporal-polyfill@^0.3.2` (FullCalendar's fork — published 2026 as a maintained Temporal subset). `[VERIFIED: npm view temporal-polyfill version → 0.3.2]`

**Rationale (one line):** Build-time-only consumer, ~20 KB min+gz (vs `@js-temporal/polyfill`'s ~56 KB), spec-compliant Temporal API, native BigInt under Node 22.12 — the cleanest one-liner for "today in LA vs popup date" is `Temporal.PlainDate.compare(Temporal.PlainDate.from(p.data.date), Temporal.Now.plainDateISO('America/Los_Angeles'))`.

**Code:** see Pattern 1 above (`src/lib/popups.ts`).

**Verification command:** After install, `node -e "import('temporal-polyfill').then(({Temporal}) => console.log(Temporal.Now.plainDateISO('America/Los_Angeles').toString()))"` should print today's date in LA-local form.

**Alternative (acceptable):** `@date-fns/tz@^1.4.1` with `TZDate(...) → differenceInDays` — equivalent correctness, slightly less ergonomic for this single comparison. Pick this only if Temporal polyfill exhibits any stability issue during Plan 0 task. `[VERIFIED: npm view @date-fns/tz version → 1.4.1]`

### Q2: Cron mechanism — scheduled handler on existing Worker + Workers Builds Deploy Hook [HIGH confidence]

**Pick:** option (a) — scheduled handler on the existing `studio-bluemli` Worker, POSTing to a Workers Builds Deploy Hook URL stored as a Worker secret.

**Rationale (one line):** Workers Builds Deploy Hooks shipped 2026-04-01 specifically for "trigger a build externally without a PAT"; combined with `triggers.crons` on the same Worker (free tier supports 5 cron triggers/account, we need 1), there is exactly one moving part on the engineering side and zero on the founder side — vs GitHub Actions which adds a 15-min skew + a Cloudflare API token secret in GitHub. `[VERIFIED: developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/]` `[VERIFIED: developers.cloudflare.com/workers/configuration/cron-triggers/]`

**Free-tier accounting:**
- Workers Free: 5 cron triggers/account `[CITED]` — we use 1
- Workers Free: 100k requests/day, 10ms CPU/request — a scheduled invocation is one request; a single `fetch` to the deploy hook plus a 200-OK roundtrip easily fits in 10ms CPU
- Workers Builds: deploy hooks rate-limited to 10 builds/min/Worker (we use 1/day) `[CITED]`

**Wrangler config + handler:** see Example 3 above.

**One-time setup (founder/engineer, ~3 minutes):**
1. Cloudflare dashboard → Workers & Pages → `studio-bluemli` → Settings → Builds → Deploy Hooks → New → name `daily-rebuild`, branch `main` → copy the URL.
2. Locally: `wrangler secret put DEPLOY_HOOK_URL` → paste the URL when prompted.
3. Commit Example 3's `src/scheduled.ts` + the `wrangler.jsonc` edit. Push.
4. Workers Builds runs once; the next 3 AM PT, cron fires; verify in Cloudflare dashboard → Workers → studio-bluemli → Logs that the `scheduled` invocation completed with status 200.

**Verification command:**
```bash
wrangler triggers deploy --dry-run 2>&1 | grep -i cron
# Should list: 0 11 * * *  (or whichever expression is configured)
```

**Caveat (Pitfall 1):** UTC `0 11 * * *` is 3 AM PDT (summer) and 4 AM PST (winter). Acceptable per phase intent (rebuild happens "early morning"). Document in `wrangler.jsonc` with one comment.

### Q3: Default og:image — option 3, build-time logo-lockup PNG via `sharp` [HIGH confidence]

**Pick:** option 3 from CONTEXT.md — a static 1200×630 cream PNG with the coral mark centered, generated once at scaffold via `scripts/generate-og-default.mjs` (Example 4 above), committed as `public/og-default.png`, served by Cloudflare Static Assets.

**Rationale (one line):** Sharp is already a devDep for Phase 2's prebuild pipeline; reusing it for one more script adds zero new dependencies; the output is a single 1200×630 PNG that Astro's `passthroughImageService()` happily serves; the file lives in `public/` so it ships with `dist/client/` unchanged; founders never touch it.

**Code:** see Example 4 above.

**Schema field (option 4) is deferred to v1.x** per the recommendation in CONTEXT.md — adding it later is a 3-line schema change + an optional pass in `SEO.astro`.

**`<SEO />` fallback URL:** `${base}/og-default.png` (Pattern 3 above).

**Verification command:**
```bash
node scripts/generate-og-default.mjs
file public/og-default.png    # Expect: PNG image data, 1200 x 630
identify -format '%w x %h\n' public/og-default.png   # 1200 x 630
```

### Q4: robots.txt — option (b) Astro endpoint at `src/pages/robots.txt.ts` [HIGH confidence]

**Pick:** option (b) — single Astro endpoint at `src/pages/robots.txt.ts` with `export const prerender = true` and a body that branches on `isProduction()`.

**Rationale (one line):** Vendor-agnostic, lives in source, one file, automatically deployed by `astro build`, no `_headers` rewrite, no manual file swap; `prerender = true` ensures `dist/client/robots.txt` is a real static file (not a runtime Worker call). `[CITED: docs.astro.build/en/guides/endpoints/]`

**Code:** see Example 2 above (the full snippet).

**`prerender = true` on a `.ts` endpoint in `output: 'server'` mode is correct** per Astro endpoints docs — confirmed `[CITED: docs.astro.build/en/guides/endpoints/ — "In static mode you must opt out … with export const prerender = false"]` (the inverse applies in our `server` mode: we must opt **in** with `prerender = true`).

**Verification:**
```bash
astro build
cat dist/client/robots.txt              # On main branch build: Allow: /
                                        # On preview branch build: Disallow: /
curl -I http://localhost:4321/robots.txt   # Header should be text/plain; charset=utf-8
```

### Q5: `@astrojs/sitemap` integration for Astro 6 [HIGH confidence]

**Pick:** install `@astrojs/sitemap@^3.7.2`, add to `integrations` array in `astro.config.mjs`, no options needed beyond defaults.

**Verbatim config additions:**
```javascript
// astro.config.mjs additions
import sitemap from '@astrojs/sitemap';
// ...
export default defineConfig({
  site: 'https://studiobluemli.com',          // already set; required by sitemap
  // ...
  integrations: [react(), sitemap()],         // sitemap added; no options needed for Phase 3 defaults
  // ...
});
```

**Behavior:**
- Generates `dist/client/sitemap-index.xml` (linking to numbered sitemap files) and `dist/client/sitemap-0.xml` (the actual URL list). `[CITED: docs.astro.build/en/guides/integrations-guide/sitemap/]`
- Auto-includes static routes AND content-collection-derived prerendered routes (e.g., `/gallery/cluster-coral`) because every page declares `prerender = true`. SSR dynamic routes are excluded — N/A here.
- `Astro.site` MUST be set with an `http(s)://` scheme; ours already is.
- The 5 routes + N gallery slugs total ~10–40 entries — far below the 45,000 entries-per-file default, so only `sitemap-0.xml` is emitted in addition to `sitemap-index.xml`.

**Sitemap URL used in robots.txt:** `https://studiobluemli.com/sitemap-index.xml` (matches ROADMAP SC4 narrative).

**`Astro.site` in preview vs production:** identical — both builds use `site: 'https://studiobluemli.com'`. The sitemap is therefore canonicalized to apex on previews too, which is the intended D-26 behavior (previews self-canonicalize; D-29 robots.txt prevents indexing).

**Verification:**
```bash
astro build
ls dist/client/sitemap-*.xml             # Expect: sitemap-0.xml, sitemap-index.xml
grep -o 'studiobluemli.com[^<]*' dist/client/sitemap-0.xml | sort -u
# Expect: all 5 routes + every /gallery/<slug> permalink, all on apex
```

### Q6: Astro Fonts API CSS aliasing — D-24 approach is correct [HIGH confidence]

**Verdict:** The planned approach **works** without a second download. The CSS pattern:

```css
/* src/styles/colors_and_type.css */
--font-wordmark: var(--font-display-loaded), 'Caveat Brush', cursive;
```

composes correctly because:

1. Astro Fonts API emits **one** `@font-face` rule per `cssVariable` declared in `astro.config.mjs`. With `--font-display-loaded` mapped to `Caveat Brush`, Astro emits the @font-face binding `font-family: 'Caveat Brush'` to the WOFF2 URL. `[CITED: docs.astro.build/en/guides/fonts/]`
2. The Astro Fonts API also exposes `--font-display-loaded` as a CSS variable whose value is the family name + fallbacks (e.g., `"Caveat Brush", system-ui, sans-serif` or similar).
3. The cascade `var(--font-wordmark)` resolves to `var(--font-display-loaded), 'Caveat Brush', cursive` → `"Caveat Brush", system-ui, sans-serif, 'Caveat Brush', cursive`. The duplicate is harmless (CSS family lookup is left-to-right; the first match wins).
4. Because the @font-face URL is unique per emitted `@font-face` rule, the browser fetches the WOFF2 exactly once regardless of how many CSS variables reference the family. No second download.

**What MUST stay in `BaseLayout.astro`:** `<Font cssVariable="--font-display-loaded" preload />` — this is the tag that triggers the @font-face emission. **Removing only the wordmark tag is correct** (D-24).

**What MUST be removed from `astro.config.mjs`:** the entry with `cssVariable: '--font-wordmark-loaded'` and `name: 'Bagel Fat One'`. Without that entry, no Bagel Fat One WOFF2 is downloaded. Net payload savings: ~25–35 KB WOFF2 + one HTTP/2 request.

**Anti-pattern to avoid:** Adding a *second* Fonts API entry with `name: 'Caveat Brush'` and `cssVariable: '--font-wordmark-loaded'`. Astro would emit a second @font-face rule pointing at the same URL — wasteful and possibly visible to network audits.

**Verification:**
```bash
astro build
grep -c "Bagel" dist/client/_astro/*.css 2>&1                 # Expect: 0
grep -o "Caveat Brush" dist/client/_astro/*.css | wc -l       # Expect: 1 @font-face rule with that family
# Manually: open / in a browser, DevTools → Network → filter "font" → verify a single Caveat Brush WOFF2
```

### Q7: PAG-01..PAG-09 coverage [HIGH confidence]

For each requirement, the table below identifies (a) which decisions address it, (b) which files get touched, (c) any uncovered piece.

| Req | Decisions covering it | Files touched | Gap (open) |
|-----|----------------------|---------------|------------|
| **PAG-01** Landing composition | D-01 (Hero stays), D-02 (mini-callout), D-03 (omit when 0), D-04 (3 featured), D-05 (no embedded CTA), D-25 (NOPA) | `src/pages/index.astro`, `src/components/PopupCallout.astro` (NEW), `src/components/design-skill/Hero.jsx` (NOPA fix), `src/lib/popups.ts` (NEW) | None — all 5 sub-decisions resolved |
| **PAG-02** Gallery wired into nav | already done in Phase 2; Phase 3 reads `<SEO />` in | `src/pages/gallery.astro`, `src/pages/gallery/[slug].astro` | None |
| **PAG-03** `/popups` TZ-correct split | D-06 (layout), D-07 (no past photos), D-08 (empty state), D-09 (PopupStrip CTA delete), D-10 (no per-slug), D-11 (TZ lib → Q1) | `src/pages/popups.astro`, `src/components/design-skill/PopupStrip.jsx` (CTA delete), `src/lib/popups.ts` (NEW) | None |
| **PAG-04** Daily 3 AM PT cron | D-12 (→ Q2) | `wrangler.jsonc`, `src/scheduled.ts` (NEW), Cloudflare dashboard (deploy hook), `wrangler secret put DEPLOY_HOOK_URL` | One-time founder/engineer creates deploy hook in dashboard before first cron fires — documented as a Plan execution prerequisite |
| **PAG-05** `/about` portrait | D-13 (placeholder copy), D-14 (reuse gallery WebPs), D-15 (copy first + photo strip), D-16 (signature), D-17 (no press), D-25 (NOPA) | `src/pages/about.astro`, `src/components/design-skill/About.jsx` | None |
| **PAG-06** `/say-hi` IG-only | D-18 (no form), D-19 (CON-* out of scope), D-21 (keep AppointmentForm.jsx unused), D-22 (leave wrangler/output alone), D-23 (PAG-06 narrative) | `src/pages/say-hi.astro`, `.planning/REQUIREMENTS.md` (CON-* moves to OoS), `.planning/REQUIREMENTS.md` PAG-06 narrative edit | Phase 4 removal is OUT of Phase 3 per D-20 — handled by `/gsd-phase` |
| **PAG-07** Shared `<SEO />` + canonical to apex | D-26 (props shape), D-27 (default og:image → Q3) | `src/components/SEO.astro` (NEW), `src/lib/site-url.ts` (NEW), `src/pages/*.astro` (all 5+ pages wire it), `src/pages/gallery/[slug].astro` (refactor inline meta to props) | None |
| **PAG-08** Sitemap + robots.txt | D-28 (sitemap defaults → Q5), D-29 (robots endpoint → Q4) | `astro.config.mjs`, `src/pages/robots.txt.ts` (NEW), `src/lib/site-url.ts` (NEW), `package.json` (add `@astrojs/sitemap`) | None |
| **PAG-09** Alt text + flower grep | already enforced by Phase 1 CI grep; D-13 (no flower in About copy); D-25 (NOPA) | `src/components/design-skill/About.jsx` (body copy), `/about` photo strip alt = piece name (Phase 2 pattern) | None — CI already enforces |

**Composition pattern recommendation for the mini-callout (D-02):** new component file `src/components/PopupCallout.astro` (not inline). Rationale: scoped CSS is naturally local to the component, the 28-line component is reused by zero other pages so reuse isn't the driver — what matters is keeping `index.astro` readable (it already has the Hero + GalleryGrid + Footer + new SEO wiring). One more file is cheaper than one bigger file.

### Q8: Validation Commands (executor-friendly, Nyquist not enabled)

For each Phase 3 decision, a quick verification the executor can run. None of these are blocking gates; they're confidence checks.

| Decision | Verification command |
|----------|---------------------|
| **D-01 Hero stays** | `git diff src/components/design-skill/Hero.jsx \| grep -E '^[+-]' \| grep -v "^[+-]\s*//"` — expect only NOPA-related changes |
| **D-02 mini-callout** | Visit landing on preview; if popups exist and ≥1 is upcoming, mini-callout renders between Hero and gallery |
| **D-03 omit on 0** | Empty `src/content/popups/` → build → grep `dist/client/index.html` for "next pop-up" — expect 0 hits |
| **D-04 featured = 3** | `grep -c '\.slice(0, 3)' src/pages/index.astro` → 1 |
| **D-05 no embedded CTA** | `grep -i 'book by\|appointment\|cta' src/components/PopupCallout.astro` → 0 |
| **D-06 popups layout** | Build with 3 popups (1 upcoming-soonest, 1 upcoming-later, 1 past); verify PopupStrip + ALSO COMING UP + PAST all render |
| **D-07 no past photos** | `grep -i 'photo\|hero\|image' src/pages/popups.astro` — should only reference past row's text fields |
| **D-08 empty state** | Empty `src/content/popups/` → visit `/popups` → expect eyebrow "POP-UPS" + the 2-line copy + `@studiobluemli` link |
| **D-09 PopupStrip CTA deleted** | `grep -c 'book by appointment' src/components/design-skill/PopupStrip.jsx` → 0 |
| **D-10 no slug routes** | `ls src/pages/popups/` → No such file or directory |
| **D-11 TZ lib** | `node -e "import('temporal-polyfill').then(({Temporal}) => console.log(Temporal.Now.plainDateISO('America/Los_Angeles').toString()))"` prints LA-today |
| **D-12 cron** | `wrangler triggers list` → shows `0 11 * * *` for `studio-bluemli`; `wrangler tail --format=pretty` during 3 AM PT shows a `[scheduled]` log line |
| **D-13 about copy** | Read drafted text aloud; check sentence-case, friendly parentheticals, ♡ in coral, no emoji other than ♡; grep for `flower\|petal\|floral\|bloom\|blossom` → 0 |
| **D-14 reuse gallery WebPs** | Photo strip `<img src>` paths all match `/gallery/cluster-*/hero-800.webp` |
| **D-15 photo strip below** | DOM order in built HTML: eyebrow → h1 → paragraphs → signature → photo strip |
| **D-16 signature phrase** | `grep -c "made with love from NOPA ♡" src/components/design-skill/About.jsx` → 1 |
| **D-17 no press** | `grep -i 'press\|featured in\|as seen' src/pages/about.astro src/components/design-skill/About.jsx` → 0 |
| **D-18 no form** | `grep -i '<form\|AppointmentForm' src/pages/say-hi.astro` → 0 |
| **D-19 CON-* out of scope** | `.planning/REQUIREMENTS.md` has CON-01..CON-11 under Out of Scope section, not Active Requirements |
| **D-20 Phase 4 removal** | Out of Phase 3 scope. Verify only that Phase 3 plans don't include any Phase 4 / contact-form work. |
| **D-21 AppointmentForm kept** | `ls src/components/design-skill/AppointmentForm.jsx` → exists; `grep -r AppointmentForm src/pages/` → 0 |
| **D-22 wrangler unchanged for /api/** | `grep -c '"run_worker_first"' wrangler.jsonc` → 1; value still `["/api/*"]` |
| **D-23 PAG-06 narrative** | `.planning/REQUIREMENTS.md` PAG-06 line mentions "IG DM link + mailto link" not "contact form" |
| **D-24 wordmark swap** | `grep -c 'Bagel Fat One' astro.config.mjs src/styles/colors_and_type.css src/layouts/BaseLayout.astro` → 0; `grep -c 'font-display-loaded' src/styles/colors_and_type.css` → ≥2 (the original `--font-display` cascade + the new `--font-wordmark` cascade); network panel: one Caveat Brush WOFF2 only |
| **D-25 NOPA casing** | `grep -rn 'NoPa' src/components/design-skill/Hero.jsx src/components/design-skill/About.jsx src/components/design-skill/Footer.jsx src/content/site/config.yaml` → 0; `.planning/` and `.claude/skills/` unchanged |
| **D-26 SEO.astro contract** | View page source on landing: contains `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image` (absolute URL), `og:url` (apex), `twitter:card` value `summary_large_image`, `<link rel="canonical">` to apex |
| **D-27 default og:image** | `curl -sI https://studiobluemli.com/og-default.png \| grep -i 'content-type\|content-length'` → image/png and a real size; visit Facebook Sharing Debugger with `studiobluemli.com` URL — preview card renders the logo lockup |
| **D-28 sitemap** | `curl -s https://studiobluemli.com/sitemap-index.xml \| head` → valid XML; `curl -s https://studiobluemli.com/sitemap-0.xml \| grep -c '<loc>'` → 5 + N gallery slugs |
| **D-29 robots.txt** | On `*.workers.dev` preview: `curl -s <preview>/robots.txt` → `User-agent: *\nDisallow: /\n`; on apex: `curl -s https://studiobluemli.com/robots.txt` → `Allow: /` + Sitemap line |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Cloudflare Pages deploy hooks (only) | Cloudflare **Workers** Builds deploy hooks | 2026-04-01 | Phase 3 Q2 picks Workers Builds path; Pages path was unavailable for this project anyway (D-22 carry-over) |
| `@js-temporal/polyfill` (slow, 56 KB) | `temporal-polyfill` (FullCalendar, 20 KB, faster) | Polyfill matured 2024–2026 | Smaller build-time footprint, simpler API |
| `date-fns-tz` (marnusw third-party) | `@date-fns/tz` (official, v4.0+) | 2024-08 (date-fns v4 release) | If using date-fns path, prefer `@date-fns/tz` — not `date-fns-tz` |
| Astro Fonts API marked experimental | Stable as of Astro 6.0 (March 2026) | Astro 6.0 | D-24 wordmark swap operates on stable API |
| MailChannels free for Workers | Resend (or paid MailChannels Email API) | 2024-08-31 MailChannels EOL | Moot for Phase 3 (D-18 drops the form) |

**Deprecated/outdated:**
- `wrangler.toml` (TOML) for Workers config — now JSONC (`wrangler.jsonc`) is the modern Cloudflare-recommended file. This project already uses `wrangler.jsonc`; no change.
- `@astrojs/cloudflare` v12 (Pages-targeting) — replaced by v13.5+ which targets Workers + Static Assets. Already on v13.5.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The Astro adapter's worker entrypoint can be wrapped by a custom `src/scheduled.ts` that re-exports `fetch` and adds `scheduled`. | Q2 / Example 3 | If incorrect, fall back to a separate cron-only Worker (still free-tier; takes one extra `wrangler.jsonc`). The first plan task should validate this with `wrangler deploy --dry-run` and abort on failure. |
| A2 | `import.meta.env.WORKERS_CI_BRANCH` is visible at Astro build time (not only at script-level Node env). | Q4 / `site-url.ts` | Astro forwards Vite's `import.meta.env` for vars prefixed `PUBLIC_` automatically; non-prefixed system vars from Workers Builds may need an explicit Vite `define` or a fallback to `process.env.WORKERS_CI_BRANCH`. Plan should test both. |
| A3 | The Astro Fonts API exposes `--font-display-loaded` as a CSS variable whose value is the family stack including `"Caveat Brush"`. | Q6 | If the variable's value differs (e.g., only the family name, no fallbacks), the cascade still works — the literal `'Caveat Brush'` in the new wordmark cascade is the second fallback. No risk. |
| A4 | `mark-coral.svg` in `assets/logo/` is a valid SVG that sharp can rasterize at `density: 384`. | Q3 / Example 4 | If sharp throws on the SVG, swap to `mark.svg` and fill via composite `tint: '#D6553B'`. Verify with `node scripts/generate-og-default.mjs` during execution. |
| A5 | The popups schema's `end_date` (optional) is the right "until" boundary for the upcoming-vs-past split. | Q1 / Pattern 1 | If only `date` should be used (single-day pop-ups are the v1 norm), the helper still works because `popupEndDate` falls back to `date`. No risk. |

**If this table makes you uneasy:** A1 is the only one that could meaningfully cost time during execution. Mitigate by having Plan 0 / Task 0 of the cron plan be a `wrangler deploy --dry-run` probe; if it errors with "no scheduled handler", the fallback (a separate `cron-worker` with shared deploy-hook secret) is one wrangler.jsonc + one `src/cron.ts` file away.

## Open Questions

1. **Should Phase 3 also delete the unused `AppointmentForm.jsx` file?**
   - What we know: D-21 says safe default is keep + drop the import. The component file is small (~50 LOC).
   - What's unclear: nothing imports it after Phase 3 lands; whether the CI brand-rule grep continues to scan it (yes, per Phase 1 D-09).
   - Recommendation: **keep the file**; drop only the import from `say-hi.astro`. Minimum-blast-radius. Re-evaluate if v1.x revives the contact form path.

2. **Where does `OPS.md` (or equivalent) document the one-time deploy-hook setup?**
   - What we know: the executor will run `wrangler secret put DEPLOY_HOOK_URL` once; the founder will create the hook in the Cloudflare dashboard.
   - What's unclear: whether this lands in `CONTENT_EDITING.md` (founder-facing) or a new `OPS.md` (engineer-facing).
   - Recommendation: **engineer-facing `OPS.md`** at repo root — the founder doesn't need to set up cron; that's an engineering chore on first deploy. If we ever expose cron config to the founder (we won't), revisit.

3. **Does the cron handler need a way to skip the rebuild if no popup has rolled off?**
   - What we know: a rebuild costs Workers Builds free-tier minutes; idempotent rebuilds are cheap but not free.
   - What's unclear: whether the founder cares about saving 1–2 builds per week (most days, no popup is rolling off).
   - Recommendation: **always trigger.** A daily rebuild is the contract (PAG-04). Adding skip-logic adds state (where to read "last cutoff" from? KV?) that defeats the simplicity win. If build budget ever becomes a concern, revisit then.

## Sources

### Primary (HIGH confidence)
- Astro Endpoints — https://docs.astro.build/en/guides/endpoints/ — confirms `prerender = true` on `.ts` endpoints, `APIRoute` import shape, `Response` body
- Astro Sitemap — https://docs.astro.build/en/guides/integrations-guide/sitemap/ — `site` requirement; auto-includes content-collection-derived static routes; emits `sitemap-index.xml`
- Astro Fonts API — https://docs.astro.build/en/guides/fonts/ — `<Font cssVariable=>`; CSS-variable usage; recommends not putting font files in `public/`
- Cloudflare Workers Builds Deploy Hooks — https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/ — URL shape, no auth header, 10-build/min rate limit, "store like a credential"
- Cloudflare Workers Builds Configuration — https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ — system env vars at build time (CI, WORKERS_CI, WORKERS_CI_BUILD_UUID, WORKERS_CI_COMMIT_SHA, WORKERS_CI_BRANCH); confirms NO CF_WORKERS_URL
- Cloudflare Workers Cron Triggers — https://developers.cloudflare.com/workers/configuration/cron-triggers/ — `triggers.crons` syntax, `scheduled` handler signature, free-tier 5 cron triggers/account
- Cloudflare Workers Pricing — https://developers.cloudflare.com/workers/platform/pricing/ — 100k req/day free, scheduled invocations count as requests
- Workers Builds Deploy Hooks Changelog — https://developers.cloudflare.com/changelog/post/2026-04-01-deploy-hooks/ — feature launch date
- MDN Temporal.PlainDate — https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDate — PlainDate semantics, `.compare()`, `.from()`
- npm registry (verified 2026-05-13) — `@astrojs/sitemap@3.7.2`, `temporal-polyfill@0.3.2`, `@js-temporal/polyfill@0.5.1`, `@date-fns/tz@1.4.1`, `date-fns-tz@3.2.0`, `prettier-plugin-astro@0.14.1`, `sharp@0.34.5`

### Secondary (MEDIUM confidence)
- temporal-polyfill bundle-size comparison — Smashing Magazine ("Moving From Moment.js To The JS Temporal API") + Hacker News thread + Bundlephobia — figures (~20 KB vs ~56 KB) consistent across three sources
- date-fns timezone guide — https://github.com/date-fns/date-fns/blob/main/docs/timeZones.md — `TZDate` API surface
- Astro Fonts API CSS-aliasing pattern — inferred from Astro Fonts docs + general CSS cascade behavior; not explicitly called out in a single Astro doc page, but the mechanism follows directly from how `var()` and `@font-face` interact. See Pitfall 6 above for the explicit reasoning chain.

### Tertiary (LOW confidence — none in this research)
- (no tertiary sources used; all claims verified against at least MEDIUM-tier sources)

### Internal sources read
- `CLAUDE.md` — Tech stack table, version compatibility, "What NOT to Use", "Conventions", "Confidence Notes per Recommendation"
- `.planning/STATE.md` — Phase 3 locked decisions
- `.planning/REQUIREMENTS.md` — PAG-01..PAG-09, CON-01..CON-11
- `.planning/research/PITFALLS.md` — #7 (TZ math), #14 (og:image), #18 (www/apex)
- `.planning/phases/01-foundations-brand-system/01-CONTEXT.md` — D-14..D-17 (Fonts API; superseded), D-18 (5-route inventory)
- `.planning/phases/02-content-schema-gallery/02-CONTEXT.md` — D-12 (per-piece og:image env-aware base URL), D-14 (`published_at` sort), D-18 (popups schema realignment)
- `.planning/phases/03-page-composition-pop-ups/03-UI-SPEC.md` — locked visual contract for all 4 surfaces
- `src/pages/gallery/[slug].astro` — env-aware base URL resolution helper (lifted into Pattern 2)
- `src/layouts/BaseLayout.astro` — `<slot name="head" />` pattern + Fonts API preloads
- `src/styles/colors_and_type.css` — `--font-wordmark` cascade (current Bagel Fat One; target Caveat Brush)
- `astro.config.mjs` — current Fonts API entries; integrations array shape
- `wrangler.jsonc` — current Worker config
- `src/content.config.ts` — popups schema (already complete)
- `src/content/site/config.yaml` — site defaults consumed by SEO.astro + /say-hi
- `src/components/design-skill/PopupStrip.jsx` — current TZ-aware Intl.DateTimeFormat pattern
- `package.json` — installed deps + scripts; `sharp` already devDep
- `scripts/` directory — `prebuild-images.mjs`, `generate-favicons.mjs` (Q3 follows the same pattern)
- `src/pages/index.astro` + `src/pages/popups.astro` — current stub state to be replaced by Phase 3

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version verified against `npm view` on 2026-05-13; every adoption rationale anchored to either official Astro/Cloudflare docs or a sourced bundle-size figure.
- Architecture: HIGH — all 7 open questions mapped to a concrete pattern with a code snippet; the only assumption rated as "could-cost-time-if-wrong" (A1) has a documented fallback.
- Pitfalls: HIGH — DST cliff (Pitfall 1) and Astro Fonts API cascade (Pitfall 6) are the only Phase-3-specific risks not previously captured in `.planning/research/PITFALLS.md`; both have verification steps.

**Research date:** 2026-05-13
**Valid until:** 2026-06-12 (30 days — stack is stable; Workers Builds deploy hooks may evolve faster, so revisit Q2 if execution slips into July)
