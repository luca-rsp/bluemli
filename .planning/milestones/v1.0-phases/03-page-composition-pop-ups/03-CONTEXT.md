# Phase 3: Page Composition & Pop-ups - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Compose the four remaining pages with real content — landing (Hero + quieter next-pop-up callout + 3 featured pieces + footer), `/popups` (timezone-correct upcoming + past with editorial layout, daily 3 AM PT cron rebuild for freshness), `/about` (first-person written portrait + signature close + product-hero photo strip — **no founder face, no dedicated process/craft shots**), `/say-hi` (IG DM link + mailto fallback — **no contact form**) — plus a shared `SEO.astro` component, `@astrojs/sitemap`, `robots.txt`, the wordmark font swap from Bagel Fat One → Caveat Brush, and a project-wide `NoPa → NOPA` casing fix across user-facing site copy.

**Major v1 scope cut (decided in this discussion):** The contact form is **dropped from v1 entirely**. `/say-hi` becomes a small IG-link page. Phase 4 (Contact Form & Deliverability) is effectively removed from the roadmap; CON-01..CON-11 move to Out of Scope. PAG-06 narrative is rewritten. A separate `/gsd-phase` op after this discussion removes Phase 4 from `ROADMAP.md` and updates Phase 5's dependency to point at Phase 3.

**Not in this phase:** the `/api/contact` Worker endpoint (deleted from v1, was Phase 4), Umami analytics + security headers + DNS cutover (Phase 5), gallery surfaces (Phase 2, done).

</domain>

<decisions>
## Implementation Decisions

### Landing Page Composition

- **D-01: Hero copy stays as-is in `Hero.jsx`, NOPA casing applied.** Keep the existing H1 `"bright, beaded, one of a kind"` and the sub-tagline. The only Hero edit is replacing `NoPa` → `NOPA` in the eyebrow and the sub-tagline. `site.yaml`'s `tagline` continues to feed OG meta + footer text only — Hero stays the polished design-skill version. No prop plumbing, no schema change. Two voices coexist by design (Hero = brand line, site.yaml = OG description).

- **D-02: Next-pop-up callout = quieter mini-callout, NOT the full `PopupStrip`.** Landing renders a new compact section: small eyebrow ("NEXT POP-UP"), single-line `<weekday>, <month> <day> · <venue>`, second line for time, and (only when 2+ upcoming exist) a "see all upcoming pop-ups →" link beneath. `PopupStrip` (the 80px Caveat Brush "pop-up" headline + color-stripe bar) stays in use on `/popups` only — its loud editorial weight earns the dedicated page but would compete with the 88px Hero headline on landing. Phase 3 builds the mini-callout as a small new component or inline section in `src/pages/index.astro`.

- **D-03: Landing renders no pop-up section when zero upcoming exist.** Override of `PAG-01` SC1's "no pop-ups on the calendar right now — DM me on Instagram" empty-state line. When the popups collection has zero future-dated entries (per the TZ-aware cutoff), the landing page **omits the entire pop-up section** — no eyebrow, no copy, no empty-state line. The visitor sees Hero → featured pieces → footer with no gap. Recorded as a divergence; planner updates `ROADMAP.md` SC1 + `REQUIREMENTS.md` PAG-01 narrative during planning.

- **D-04: Featured count = 3 (newest by `published_at`).** Landing grid renders the 3 most-recent `featured: true` pieces, newest first. Matches Phase 2's `.slice(0, 3)` placeholder in `index.astro` (no code change for the slice itself). Falls back to "newest 3 regardless of featured" if zero pieces are `featured: true`. Overrides Phase 2 D-15's "6 most-recent featured" plan-time intent in favor of a tighter editorial register.

- **D-05: Landing mini-callout has NO embedded CTA.** Read-only blurb. The "see all upcoming pop-ups →" link (when 2+ upcoming) is a separate affordance beneath, not the callout's own CTA. The site nav's "pop-ups" link is the always-on path to `/popups`.

### `/popups` Page Composition

- **D-06: "One prominent + 'also coming up' list" layout.** The soonest upcoming pop-up renders as the full `PopupStrip` (eyebrow → "pop-up" headline → "at <venue>" → date+time). Other upcoming events render below in an "ALSO COMING UP" compact list (one line each: `<weekday> <date> · <venue> · <time>`). Past events render in a "PAST" compact text list at the very bottom: `<weekday> <date> · <venue>, <city>`.

- **D-07: Past archive = text-only list. No photos.** The optional `photos: image()` array in the popups schema (added per Phase 2 D-18) stays available for future use but is **not rendered on `/popups`** in v1. No thumbnails, no card grid. Keeps the page editorial and dense; future v1.x can introduce photos in the past archive if the founder ever asks.

- **D-08: Empty-state copy for `/popups` (zero upcoming AND zero past):** Centered editorial line under a quiet "POP-UPS" eyebrow:

      No pop-ups on the calendar yet —
      follow @studiobluemli for the next one.

  No hand-display headline, no big visual. Header + footer render normally. The day-one shipping state — content folder `src/content/popups/` is empty, so this is what visitors see until the founder adds her first pop-up via the GitHub web UI.

- **D-09: PopupStrip CTA removed entirely.** The current `<a href="/say-hi">book by appointment</a>` block in `src/components/design-skill/PopupStrip.jsx` is **deleted**. Pop-ups are public events at named venues — visitors show up at the venue, they don't "book" anything. No replacement CTA. PopupStrip becomes: eyebrow + "pop-up" headline + "at <venue>" + date/time, full stop.

- **D-10: No per-popup detail routes.** `/popups` is a single page that lists everything. `REQUIREMENTS.md` doesn't define `/popups/<slug>` routes and the founder hasn't asked for them. Defer to v1.x if a market needs a deep-link landing page.

- **D-11: TZ library choice = planner's discretion.** Pitfall #7's locked rule: compute upcoming/past cutoff in `America/Los_Angeles` using a real library, never naive `new Date()`. Options: `Temporal` polyfill (`@js-temporal/polyfill`) or `@date-fns/tz` — planner picks during research based on bundle size + DX. Both are acceptable.

- **D-12: Daily cron rebuild mechanism = planner's discretion.** ROADMAP-locked: 3 AM PT daily Cloudflare cron rebuild so expired pop-ups fall off the upcoming list without founder action. Open mechanism: (a) Cloudflare Workers scheduled handler on the same Worker that POSTs to a Workers Builds deploy hook, (b) separate cron-only Worker, (c) GitHub Actions schedule that runs `gh workflow run` against the build workflow. Planner picks based on Cloudflare Workers Builds' current deploy-hook API + free-tier scheduled-handler limits.

### `/about` Page Composition

- **D-13: About copy = Claude drafts brand-voiced placeholder; founder edits via GitHub web UI later.** I write a first-person portrait in the design-skill voice (warm, casual, sentence-case, friendly parentheticals, NOPA in caps, no emoji except ♡). Founder updates the copy on her own timeline by editing the file via the GitHub web UI — no engineer turnaround. Phase 3 ships immediately with brand-aligned placeholder text that reads as real founder voice.

- **D-14: No dedicated process/craft shots. Reuse 1–3 existing gallery hero WebPs as About-page visuals.** Softens the ROADMAP "process/craft shots (hands, beads, bench)" lock — the founder doesn't currently have these photos and Phase 3 isn't blocking on a photography session. The no-founder-face rule stays intact (gallery hero photos don't show the founder). Founder can swap to real bench shots later via a small follow-up commit. Recorded as a divergence; planner updates ROADMAP key-risk wording during planning.

- **D-15: About layout = copy first, photo strip below.** Page order: eyebrow ("ABOUT THE STUDIO") → hand-display headline → portrait copy paragraphs → signature close → row of 1–3 product-hero photos as a closing visual flourish. The current `About.jsx` (text-only, centered, max 720px) gets extended with a photo strip below the signature. Single column, mobile-first.

- **D-16: Signature close = `"made with love from NOPA ♡"`** (custom hand-written phrase). Replaces the current `About.jsx` default `"— the founder ♡"`. Uses `--font-hand` (Caveat), matching About.jsx's existing signature treatment. ♡ in `--coral-500`.

- **D-17: No press / "as featured in" section.** Anti-feature per `REQUIREMENTS.md` Out of Scope + `FEATURES.md`. Phase 3 ships About without any press placeholder; if real press happens later, that's a separate v1.x phase.

### `/say-hi` Page (No Form)

- **D-18: Contact form dropped from v1 entirely.** Major v1 scope cut. `/say-hi` ships as a small IG-DM-link page with the following surface:

      [Header]

           SAY HI

      let's talk earrings

      DM me on Instagram →   (button-like link to ig.me/m/studiobluemli)
      or email hi@studiobluemli.com

      [Footer]

  No `<form>`, no fields, no submit button, no Turnstile, no Worker endpoint.

- **D-19: CON-01..CON-11 requirements move to Out of Scope.** Planner updates `REQUIREMENTS.md` (Contact Form & Deliverability section → Out of Scope subsection with reason "v1 scope cut: contact form deferred; visitors reach the founder via IG DM or mailto") and `PROJECT.md` Active Requirements + Out of Scope list during planning.

- **D-20: Phase 4 effectively removed from the roadmap.** Requires a separate `/gsd-phase` operation **after this discussion completes** (not part of Phase 3 execution itself). `ROADMAP.md` Phase 4 entry is deleted; Phase 5's `Depends on: Phase 4` becomes `Depends on: Phase 3`; the Phases overview prose is rewritten. Phase 3 plans should NOT touch ROADMAP Phase 4 — that's a roadmap structural edit, owned by the user via `/gsd-phase`.

- **D-21: `AppointmentForm.jsx` stays in the codebase, unused.** No deletion. The synced design-skill component remains available for future re-introduction. CI grep brand rules still apply to it. Planner can decide whether to drop the import from `src/pages/say-hi.astro` cleanly or also delete the component file — both are acceptable; the safe choice is "drop the import, leave the file" (minimum-blast-radius).

- **D-22: Leave `wrangler.jsonc`'s `run_worker_first: ["/api/*"]` and `astro.config.mjs`'s `output: 'server'` alone.** Phase 3 does NOT revert these to pure static. Cost: an empty Worker entrypoint persists in `dist/server/entry.mjs`. Benefit: zero rewiring needed if the form is added back as a v1.x phase later. No live `/api/*` route ships, so visitors never hit the Worker dynamic path.

- **D-23: PAG-06 narrative changes.** From "renders the contact form (CON-* requirements) plus visible Instagram and mailto fallback links" to "renders visible Instagram DM link + mailto link". Planner updates `REQUIREMENTS.md` PAG-06 + `ROADMAP.md` Phase 3 SC narrative during planning.

### Brand-System Tweaks (folded into Phase 3)

- **D-24: Wordmark font swap — Bagel Fat One → Caveat Brush.** The `"Studio Bluemli"` wordmark in the Header (top-left), Footer, and any other use of `--font-wordmark` reads as out-of-style next to the Caveat Brush display headlines. Fold into Phase 3 (small, contained, naturally surfaced during page composition).
  - Edit `astro.config.mjs`: remove the Bagel Fat One Fonts API entry.
  - Edit `src/styles/colors_and_type.css`: change the `--font-wordmark` cascade from `'Bagel Fat One', 'Pacifico', 'Lobster', cursive` to `var(--font-display-loaded), 'Caveat Brush', cursive` (aliases to the existing Caveat Brush face — no second download).
  - Edit `src/layouts/BaseLayout.astro`: remove the `<Font cssVariable="--font-wordmark-loaded" preload />` tag (no longer needed; Caveat Brush is already preloaded for `--font-display-loaded`).
  - Edit `CLAUDE.md` references to Bagel Fat One.
  - **Do NOT edit `.claude/skills/studio-bluemli-design/`** — the design skill remains the canonical brand reference per Phase 1 D-04; project may diverge from it.
  - Phase 1 D-16 is superseded by this decision (record-of-divergence).

- **D-25: Project-wide `NoPa` → `NOPA` casing fix on user-facing site copy.** Apply to: `Hero.jsx` eyebrow + sub-tagline, `About.jsx` copy, `Footer.jsx` "made in NOPA, San Francisco", `src/content/site/config.yaml` (tagline, footer_text, og_description, og_title), and any new Phase 3 copy. **Do NOT touch:** `.planning/` documents (audit trail), `.claude/skills/studio-bluemli-design/` (brand reference), code comments in `src/`, `CLAUDE.md` planning prose, or commit messages. Single grep + commit early in execution.

### Shared SEO + Sitemap + Robots

- **D-26: Shared `SEO.astro` component (PAG-07) — props shape and emission:** Planner's discretion on the exact prop shape, but the contract is:
  - Emits `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card="summary_large_image"`, canonical `<link>`.
  - Reads defaults from `src/content/site/config.yaml`: `og_title`, `og_description` are the fallbacks; per-page overrides via props.
  - Canonical always points to apex `https://studiobluemli.com` (Astro.site in production), even on preview deploys. Risk acknowledged: previews self-canonicalize to apex, but `*.workers.dev` hosts are not indexed by major search engines for non-custom-domain sites; D-29's robots.txt closes the remaining gap.
  - Per-piece `og:image` on `/gallery/<slug>` already follows the env-aware base-URL pattern from Phase 2 (`gallery/[slug].astro` uses `CF_PAGES_URL` / `CF_WORKERS_URL` / `PUBLIC_SITE_URL` / `Astro.site`). PAG-07's `SEO.astro` adopts the same resolution helper.
  - Replaces the gallery detail page's inline `<meta slot="head" property="og:image">` pattern — that page also switches to `<SEO ... />`.

- **D-27: Default `og:image` fallback = planner's discretion.** `site.yaml` has `og_title` + `og_description` but no `og_image`. The shared `SEO.astro` needs a fallback for landing, `/popups`, `/about`, `/say-hi`. Options for the planner:
  - A pre-composed brand image (e.g., wordmark in coral on cream background, 1200×630) — most polished, but needs design work.
  - The 800w hero of the newest piece in the gallery — auto-updating, no design work, but the image semantically belongs to a piece, not the site.
  - The Studio Bluemli logo lockup (`mark.svg` rendered to PNG at 1200×630 on cream) — brand-faithful, low-effort.
  - Add `og_image` as a string field to the `site` collection schema (new schema entry) and let the founder set it via the GitHub web UI — most flexible.
  - **Recommendation for planner:** option 3 (logo lockup PNG) for Phase 3; option 4 (schema field) as a v1.x enhancement.

- **D-28: Sitemap inclusion = all 5 routes + all `/gallery/<slug>` pages.** Configure `@astrojs/sitemap` defaults; no special filters. No `/popups/<slug>` (those routes don't exist per D-10). Sitemap reference in `robots.txt`.

- **D-29: `robots.txt` — disallow on preview, allow on production.** Planner emits a `robots.txt` that's environment-aware:
  - Production (`studiobluemli.com`, post-Phase-5): `Allow: /` + `Sitemap: https://studiobluemli.com/sitemap-index.xml`.
  - Preview/worker.dev hosts: `Disallow: /` (so previews never index).
  - Implementation can be: (a) two static files swapped at build via env, (b) an Astro endpoint at `src/pages/robots.txt.ts` that branches on the env-aware base URL, or (c) Cloudflare-side override. Planner picks (b) as the most portable.

### Carrying Forward (locked from prior phases / roadmap — recorded, not re-discussed)

- TZ math via a real library (`Temporal` polyfill or `@date-fns/tz`); never naive `new Date()` (Pitfall #7).
- Daily 3 AM PT cron rebuild for popup freshness (founder-locked, ROADMAP).
- Hand-display headline on `/about`; first-person written portrait; signature close (founder-locked, ROADMAP).
- No founder face anywhere on the site (founder-locked, ROADMAP).
- Brand non-negotiables: cream not white, no flower vocabulary, no center bead, no gradients, no backdrop-filter, no 1px borders (Phase 1 CI grep).
- Voice: warm, casual, founder-first, sentence-case, friendly parentheticals, no emoji except ♡/♥ in coral.
- Anti-features: no autoplay video, no carousels, no testimonial sliders, no exit-intent modals, no parallax, no fake "as featured in" (`PROJECT.md` Out of Scope + `FEATURES.md`).
- PAG-09: every product image has alt text; alt text never uses `flower|petal|floral|bloom|blossom` (CI enforced).
- BaseLayout's `<slot name="head" />` is the per-page head-injection pattern (already used by `gallery/[slug].astro`).

### Claude's Discretion (planner picks during research/planning)

- TZ library: `@js-temporal/polyfill` vs `@date-fns/tz` (D-11).
- Cron mechanism: scheduled handler vs separate cron Worker vs GitHub Actions cron (D-12).
- Default `og:image` fallback approach (D-27).
- `robots.txt` implementation: static-swap vs Astro endpoint vs Cloudflare override (D-29).
- Exact compose pattern for the landing mini-callout: new component file vs inline `<section>` in `index.astro` (D-02).
- Past-archive sort within `/popups` PAST list: newest-first (matches gallery sort) is the obvious default.
- Whether to keep `AppointmentForm.jsx` in `src/components/design-skill/` or delete it (D-21) — safe default is keep + drop the import.
- The exact 1–3 product-hero photos to use on `/about` (D-14) — Claude picks during execution based on visual balance (color spread that matches the design-skill palette guidance).
- The drafted About-page portrait copy itself (D-13) — Claude writes per voice rules; founder edits later.
- Whether the "see all upcoming pop-ups →" link on landing (when 2+ upcoming) renders as a button or a plain text link with arrow — planner picks based on visual register.
- Exact CSS structure for the landing mini-callout: scoped `<style>` in `index.astro` vs reusable Astro component file.
- Whether to delete or comment-out the existing `Bagel Fat One` references from CLAUDE.md (D-24) — Claude picks; deletion is preferable for cleanliness.
- Phase 4 removal: handled OUTSIDE Phase 3 via `/gsd-phase` after CONTEXT.md is written — NOT a planner task for Phase 3 (D-20).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning (always)
- `.planning/PROJECT.md` — Project overview, constraints, brand non-negotiables, Out of Scope, key decisions table
- `.planning/REQUIREMENTS.md` §PAG-01..PAG-09 — the 9 page-composition requirements traced to Phase 3 (note D-03/D-04 modify PAG-01; D-14 softens PAG-05 process-shot lock; D-23 modifies PAG-06)
- `.planning/REQUIREMENTS.md` §CON-01..CON-11 — to-be-moved to Out of Scope (D-19)
- `.planning/ROADMAP.md` §"Phase 3: Page Composition & Pop-ups" — goal, SC1..SC5, key risks/pitfalls (D-03 modifies SC1; D-14 softens key risk #3; D-23 modifies SC narrative implicitly)
- `.planning/ROADMAP.md` §"Phase 4: Contact Form & Deliverability" — to-be-removed via `/gsd-phase` after CONTEXT.md is committed (D-20)
- `.planning/STATE.md` — Locked decisions (Phase 3 daily cron, Phase 3 About imagery — D-14 softens the latter)
- `CLAUDE.md` — Project conventions, technology stack table (`@astrojs/sitemap`, `Temporal` polyfill candidates), version compatibility matrix, "What NOT to Use"

### Phase carry-over (read before planning Phase 3)
- `.planning/phases/01-foundations-brand-system/01-CONTEXT.md` — D-04 (design-skill copy may diverge), D-14..D-17 (Fonts API + wordmark cascade — superseded by D-24), D-18 (5-route inventory), D-19..D-20 (favicon set)
- `.planning/phases/02-content-schema-gallery/02-CONTEXT.md` — D-12 (per-piece og:image 800w pattern, env-aware base URL — SEO.astro adopts this), D-14 (`published_at` desc sort key — landing mini-callout + featured ordering use this), D-15 (`featured: boolean` schema field — overridden from "6 most-recent" to "3 most-recent" by D-04), D-18 (popups schema realignment — `description` is markdown body, `photos` is optional `image()` array)
- `.planning/phases/02-content-schema-gallery/02-UI-SPEC.md` — design contract for editorial-plate visual register; Phase 3 surfaces extend the same tokens + voice
- `.planning/phases/02-content-schema-gallery/02-VERIFICATION.md` — Phase 2 verified state; gallery surfaces are LIVE on preview

### Brand & design (Phase 3 reuses + extends)
- `.claude/skills/studio-bluemli-design/SKILL.md` — Brand non-negotiables. Wordmark font guidance is superseded by D-24 for this project (skill stays unedited as the canonical reference).
- `.claude/skills/studio-bluemli-design/README.md` — Voice rules ("warm, casual, founder-first, sentence-case, friendly parentheticals, no emoji"); informs D-13 about-page draft + D-25 NOPA casing.
- `.claude/skills/studio-bluemli-design/colors_and_type.css` — Color + font tokens. `--font-wordmark` cascade gets edited (D-24); other tokens consumed unchanged.
- `.claude/skills/sketch-findings-bluemli/SKILL.md` + `references/gallery-surfaces.md` — Validated editorial register (centered narrow plate, hand-display headlines, restrained type, status-color contract); future per-piece templates and any new Phase 3 surfaces (mini-callout, About photo strip) should stay in this visual register.

### Pitfalls relevant to Phase 3
- `.planning/research/PITFALLS.md` #7 (pop-up timezone bugs) — addressed by D-11 (TZ library) + D-12 (cron rebuild)
- `.planning/research/PITFALLS.md` #14 (missing per-page og:image) — addressed by D-26 (shared `SEO.astro`) + D-27 (fallback strategy)
- `.planning/research/PITFALLS.md` #18 (www vs apex split) — canonical to apex (D-26) prepares for Phase 5 cutover
- `.planning/research/PITFALLS.md` #19 (Umami "0 events" after cutover) — not Phase 3; informational
- `.planning/research/PITFALLS.md` anti-feature list — never show empty "as featured in" (D-17), never use flower vocabulary in alt text (Phase 1 CI), never autoplay video, never carousel pop-ups

### Existing code to read before extending
- `src/pages/index.astro` — Phase 1 demo-loaded shell (Hero + null PopupStrip + GalleryGrid(3) + Footer); Phase 3 replaces null popup stub with `getCollection('popups')` + mini-callout, applies D-04 featured count, applies D-25 NOPA fix where copy lives in this file.
- `src/pages/popups.astro` — Phase 1 shell with null popup stub; Phase 3 wires `getCollection('popups')` + TZ-aware split + ALSO COMING UP / PAST sections.
- `src/pages/about.astro` — Phase 1 placeholder rendering `About.jsx`; Phase 3 extends with photo strip (D-15) + updated copy (D-13) + signature swap (D-16). Either edit `About.jsx` directly OR replace with inline Astro `<section>` — planner picks.
- `src/pages/say-hi.astro` — Phase 1 placeholder rendering `AppointmentForm.jsx`; Phase 3 replaces import with a small IG-link section (D-18). AppointmentForm.jsx import is dropped.
- `src/pages/gallery/[slug].astro` — already uses BaseLayout's `<slot name="head">` for per-piece og:image; Phase 3's `SEO.astro` (D-26) refactor replaces this inline pattern.
- `src/pages/gallery.astro` — uses `<style is:global>` for status-color contract; informational reference for Phase 3's CSS approach.
- `src/components/design-skill/Hero.jsx` — current hardcoded H1 + sub-tagline; D-01 keeps as-is + D-25 applies NOPA casing fix to copy strings.
- `src/components/design-skill/PopupStrip.jsx` — D-09 deletes the `<a href="/say-hi">book by appointment</a>` block; rest of component kept.
- `src/components/design-skill/About.jsx` — D-15 extends with photo strip below signature; D-16 swaps signature phrase; D-25 applies NOPA casing fix.
- `src/components/design-skill/AppointmentForm.jsx` — D-21 unused but kept in codebase.
- `src/components/design-skill/Footer.jsx` — D-25 NOPA fix on `"hand-assembled earrings · made in NOPA, San Francisco"` line.
- `src/components/design-skill/Header.jsx` — Wordmark font picks up D-24 automatically via `var(--font-wordmark)`.
- `src/layouts/BaseLayout.astro` — D-24 removes the `<Font cssVariable="--font-wordmark-loaded" preload />` tag; preserves `<slot name="head">` for SEO.astro.
- `src/styles/colors_and_type.css` — D-24 changes the `--font-wordmark` cascade.
- `src/content.config.ts` — popups collection schema is already complete (Phase 2); Phase 3 only consumes, doesn't extend (unless D-27 path 4 is picked for og_image).
- `src/content/site/config.yaml` — D-25 NOPA casing in tagline + footer_text + og_description.
- `astro.config.mjs` — D-24 removes the Bagel Fat One entry from the Fonts API; Phase 3 also adds `@astrojs/sitemap` integration here.
- `wrangler.jsonc` — D-22 leaves `run_worker_first: ["/api/*"]` alone.

### External docs to consult during research/planning
- Astro 6 SEO patterns: `<head>` slot composition, canonical link emission, `Astro.site` usage in preview vs production.
- `@astrojs/sitemap` integration — current config shape for Astro 6.
- Cloudflare Workers Builds deploy-hook API — D-12 cron mechanism research.
- `@js-temporal/polyfill` vs `@date-fns/tz` — TZ library comparison (D-11) including bundle size + tree-shake behavior.
- Astro endpoints (`src/pages/<path>.ts` returning a `Response`) — for env-aware `robots.txt` per D-29.
- Cloudflare Workers scheduled handlers — `wrangler.jsonc` `triggers.crons` syntax + free-tier limits.
- Astro Fonts API — confirming a single Caveat Brush face can power both `--font-display-loaded` and the wordmark via CSS aliasing without a second WOFF2 download (D-24).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/components/design-skill/Hero.jsx`** — Already does the Hero shape Phase 3 wants (eyebrow + H1 + sub + dual CTA + bead cluster bottom). D-01 keeps as-is + NOPA casing fix in two strings.
- **`src/components/design-skill/PopupStrip.jsx`** — The big editorial pop-up block used on `/popups`. D-09 deletes the "book by appointment" CTA. The TZ-correct date formatting via `Intl.DateTimeFormat` with `timeZone: popup.tz` is already implemented (good for D-11 — server-rendered, no JS shipped).
- **`src/components/design-skill/About.jsx`** — Text-only About at max 720px centered. D-15 extends with photo strip. D-16 swaps signature. D-25 NOPA fix in body copy.
- **`src/components/design-skill/Footer.jsx`** — Already renders IG handle + contact email from props. D-25 NOPA fix in tagline string.
- **`src/components/design-skill/Header.jsx`** — Wordmark text node uses `var(--font-wordmark)`; D-24 swap propagates automatically.
- **`src/components/design-skill/AppointmentForm.jsx`** — D-21 unused but kept; CI grep + brand rules still apply.
- **`src/content.config.ts`** — Popups schema is already complete (Phase 2 D-18): `name`, `date` (ISO), `end_date` (optional ISO), `start_time`, `end_time`, `tz` (default `America/Los_Angeles`), `location`, `address` (optional), `photos` (optional `image()` array), `link` (optional URL). Description lives in markdown body.
- **`src/content/site/config.yaml`** — `tagline`, `contact_email`, `ig_handle`, `ig_dm_url`, `footer_text`, `og_title`, `og_description` already exist. Phase 3 reads these in landing + `/say-hi` + the shared `SEO.astro` component.
- **`src/pages/gallery/[slug].astro`** — Env-aware og base-URL resolution helper (CF_PAGES_URL → CF_WORKERS_URL → PUBLIC_SITE_URL → Astro.site). D-26 lifts this helper into `SEO.astro`.
- **`src/layouts/BaseLayout.astro`** — `<slot name="head" />` already wired; `SEO.astro` outputs go through this slot.
- **`src/styles/colors_and_type.css`** — All tokens for landing/popups/about/say-hi. D-24 edits only the `--font-wordmark` cascade.

### Established Patterns
- **No client-side React** — every JSX component renders server-side as static HTML. Phase 3 keeps this. `PopupStrip.jsx`'s `Intl.DateTimeFormat` runs at build time, not in the browser.
- **`prerender = true` on every page** — Phase 1 contract under `output: 'server'`. All Phase 3 pages (`index.astro`, `popups.astro`, `about.astro`, `say-hi.astro`) declare `export const prerender = true`. `robots.txt.ts` if used per D-29 is the only SSR endpoint Phase 3 introduces (acceptable — no Worker code, just env branching at build time).
- **Per-slug folder + `image()` schema helper** — Phase 2 pattern. Phase 3 doesn't add new content collections; it consumes the existing gallery + popups + site collections.
- **`getCollection()` + `.sort()` + `.slice()`** — Phase 2's landing already uses this for featured pieces. Phase 3 extends with `getCollection('popups')` + TZ-aware filter.
- **`passthroughImageService()`** — Sharp doesn't run in `workerd`. Photos on `/about` (D-14) reuse the gallery's already-prebuilt 800w WebPs at `/gallery/<slug>/hero-800.webp` — no new prebuild step.
- **CI brand-rule grep** — Phase 1 enforces no `flower|petal|floral|bloom|blossom`, no `bg-white`/`#fff` (with `#fff8` exception), no gradients, no backdrop-filter, no 1px borders, lowercase-only `src/pages/`. Phase 3 copy + new components must pass.
- **BaseLayout `<slot name="head">` for per-page meta** — already used by `gallery/[slug].astro`; `SEO.astro` adopts the same pattern (D-26).

### Integration Points
- `src/pages/index.astro` ← Phase 3 replaces `const nextPopup = null` with `getCollection('popups')` + TZ-aware filter; adds landing mini-callout section (D-02, D-05); changes featured slice from 3 (unchanged, D-04) to use the same selection logic from `/gallery` (sort by `published_at` desc); wires `<SEO />` component (D-26).
- `src/pages/popups.astro` ← Phase 3 replaces `nextPopup = null` with `getCollection('popups')` + TZ-aware upcoming/past split + ALSO COMING UP / PAST sections (D-06, D-07, D-08); wires `<SEO />`.
- `src/pages/about.astro` ← Phase 3 extends with photo strip (D-15) + updated copy (D-13) + signature swap (D-16); wires `<SEO />`.
- `src/pages/say-hi.astro` ← Phase 3 drops `AppointmentForm` import; replaces with small IG-link section (D-18); wires `<SEO />`.
- `src/pages/gallery.astro` ← wires `<SEO />` (refactor from inline meta).
- `src/pages/gallery/[slug].astro` ← refactor from inline `<meta slot="head">` to `<SEO />` (D-26).
- `src/pages/robots.txt.ts` ← (new in Phase 3) ← Astro endpoint emitting env-aware robots.txt (D-29).
- `src/pages/sitemap-index.xml` / `sitemap-*.xml` ← (auto-generated by `@astrojs/sitemap` integration) ← Phase 3 adds the integration to `astro.config.mjs`.
- `src/components/SEO.astro` ← (new in Phase 3) ← consumed by every page; reads defaults from `getEntry('site', 'default').data`; emits all SEO meta (D-26).
- `src/components/PopupCallout.astro` (or similar, planner picks naming) ← (new in Phase 3) ← landing-page mini-callout (D-02).
- `src/components/design-skill/PopupStrip.jsx` ← D-09 deletes the CTA block.
- `src/components/design-skill/Hero.jsx` ← D-01 + D-25 NOPA fix on two string literals.
- `src/components/design-skill/About.jsx` ← D-13 (copy rewrite), D-15 (photo strip extension), D-16 (signature swap), D-25 (NOPA in body copy).
- `src/components/design-skill/Footer.jsx` ← D-25 NOPA fix on one string.
- `src/content/site/config.yaml` ← D-25 NOPA fix on tagline + footer_text + og_description; optionally D-27 path 4 adds `og_image` schema field.
- `src/styles/colors_and_type.css` ← D-24 wordmark cascade edit.
- `src/layouts/BaseLayout.astro` ← D-24 drops `<Font cssVariable="--font-wordmark-loaded" preload />`.
- `astro.config.mjs` ← D-24 removes the Bagel Fat One Fonts API entry; Phase 3 also adds `@astrojs/sitemap` integration.
- `CLAUDE.md` ← D-24 updates references to Bagel Fat One; D-23/D-19 may need PAG-06 + Out of Scope updates (or those live in REQUIREMENTS.md only).
- `wrangler.jsonc` ← D-22 unchanged.

</code_context>

<specifics>
## Specific Ideas

- **"I only want the next popup listed on the landing page. if there are more popups coming, there should be a button 'see all future popups' or something like that. if there is no upcoming popup, there shouldnt be any mention of popups on the landing page."** — drove D-02, D-03, D-05. The "see all upcoming pop-ups →" affordance is a separate link beneath the mini-callout, not the callout's own CTA.
- **"there should just be a link to dm on instagram for now"** for `/say-hi` — drove D-18..D-23 (the v1 contact-form scope cut). This is the major v1 scope decision of this discussion.
- **"on the landing page it has a 'book by appointment' cta button within the 'next pop-up' section. that does not make sense at all."** — drove D-09 (remove PopupStrip CTA entirely; pop-ups are public events, no booking needed) + D-05 (landing mini-callout has no embedded CTA).
- **"I like the font 'bright, beaded, one of a kind' is written in. the font for 'Studio Bluemli' in the top left corner does not look good. it seems out of style for the rest of the site."** — drove D-24 (wordmark → Caveat Brush, dropping Bagel Fat One).
- **"change 'NoPa' to NOPA"** — drove D-25 (project-wide casing fix on user-facing site copy, excluding `.planning/`, design-skill SKILL.md, comments).
- **"made with love from NOPA ♡"** as the About signature close (D-16) — specific phrase chosen by the user.
- **Founder is the only content editor** (PROJECT.md context) — drove D-13 (Claude drafts placeholder; founder edits via GitHub web UI later) and the general "no engineer turnaround for copy changes" stance.
- **Phase 3 ships against zero seed popup events** (`src/content/popups/` is empty) — drove D-08 (specific empty-state copy) + D-03 (landing omits section entirely on zero upcoming).
- **Editorial register, not poster** (sketch-findings, Phase 2 carry-over) — drove D-02 (quieter mini-callout, not loud PopupStrip on landing) + D-07 (text-only past archive, no thumbnails) + D-04 (3 featured, not 6).

</specifics>

<deferred>
## Deferred Ideas

- **Contact form (`<form>` + `/api/contact` Worker + Turnstile + KV rate limit + Resend + SPF/DKIM/DMARC)** — dropped from v1 entirely (D-18). Can return as a v1.x phase if the IG-only contact channel ever stops scaling. `wrangler.jsonc`'s `run_worker_first` reservation + `astro.config.mjs`'s `output: 'server'` preserved (D-22) so the rewiring cost is minimal.
- **Per-popup detail routes (`/popups/<slug>`)** — v1.x. Single page lists everything (D-10). Add if a market venue ever needs a deep-link landing surface.
- **`.ics` calendar export for pop-ups** — v1.x (per `REQUIREMENTS.md` Out of Scope).
- **Photos on the `/popups` past archive** — v1.x. Schema already has optional `photos: image()` array (Phase 2 D-18); D-07 just chooses not to render them in v1.
- **Dedicated process/craft shots (hands, beads, bench)** for `/about` — v1.x. D-14 reuses gallery hero WebPs for now; founder swaps to real bench photography later via GitHub web UI when the shots exist.
- **Press / "as featured in" section on `/about`** — out-of-scope unless real press happens (anti-feature, D-17).
- **`og_image` as a `site` collection schema field** — v1.x if the planner picks a static fallback for Phase 3 (D-27).
- **Multi-locale `/popups` rendering for travelling pop-ups** — Pitfall #7 footnote; out-of-scope while the studio is in NOPA.
- **Auto-generated brand-chrome OG card (satori-style)** for per-page sharing — v1.x.
- **Per-piece pre-fill on `/say-hi`** (`?piece=<slug>`) — moot because there's no form in v1 (D-18). If the form ever returns, revisit per `REQUIREMENTS.md` Out of Scope.
- **Hover transitions / micro-interactions on landing or `/popups`** — out-of-scope per `PROJECT.md` anti-features.
- **Decap / Sveltia / TinaCMS git-backed CMS UI** — file layout deliberately CMS-compatible; add later if the GitHub web UI workflow becomes friction.
- **Removing `output: 'server'` + `run_worker_first: ["/api/*"]`** to revert to pure static — deferred (D-22). Cost of preserving them is one unused entrypoint file in `dist/server/`; benefit is zero-friction reintroduction if the form returns.

</deferred>

---

*Phase: 3-Page Composition & Pop-ups*
*Context gathered: 2026-05-13*
