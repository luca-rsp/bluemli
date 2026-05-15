# Roadmap: Studio Bluemli Website

## Overview

Ship the five-page editorial portfolio at studiobluemli.com in four coarse, dependency-driven phases. Phase 1 stands up the Astro 6.2 + React 19 + Cloudflare Workers (Static Assets) shell, copies in the design-skill components, encodes brand non-negotiables as CI grep rules, and corrects PROJECT.md's "Cloudflare Pages" constraint to "Cloudflare Workers with Static Assets." Phase 2 defines the strict Zod content schemas (gallery + popups + site) with per-slug image co-location and ships the gallery grid + per-piece detail pages. Phase 3 composes the remaining four pages — landing, popups (with build-time PT-aware past/upcoming split and a daily cron rebuild), about (written portrait + process shots, no founder face), say-hi (IG-DM-link + mailto fallback, no form per D-18) — plus shared SEO + sitemap. Phase 4 wires Umami, security/cache headers, runs Lighthouse + OG validation, performs the DNS cutover (apex + `www` 301), and walks the "Looks Done But Isn't" checklist.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundations & Brand System** - Astro 6 on Workers + Static Assets, design-skill components copied in, brand non-negotiables enforced via CI _(complete 2026-05-13)_
- [ ] **Phase 2: Content Schema & Gallery** - Strict Zod collections with per-slug image co-location; gallery grid + per-piece detail pages live on preview
- [ ] **Phase 3: Page Composition & Pop-ups** - Landing, popups (timezone-correct split + daily cron), about, say-hi shell, shared SEO, sitemap
- [ ] **Phase 4: Analytics, Polish & Launch** - Umami events, security headers, Lighthouse/OG validation, DNS cutover to studiobluemli.com

## Phase Details

### Phase 1: Foundations & Brand System
**Goal**: Founder can preview a cream-background, hand-font, design-skill-styled empty shell of all five pages at a `*.workers.dev` URL, with brand non-negotiables enforced by CI so they cannot regress.
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-04, FND-05, FND-06, FND-07, FND-08, FND-09, FND-10, FND-11, FND-12, FND-13
**Success Criteria** (what must be TRUE):
  1. Founder can open a `*.workers.dev` preview URL and confirm cream background, hand-display headline font, Nunito body, and the design-skill header + footer chrome on a placeholder page.
  2. Every push to `main` produces a production deploy and every PR produces a unique preview URL (founder can click both from GitHub).
  3. A pull request that introduces `bg-white`, `#fff`, `flower`/`petal`/`floral`/`bloom`/`blossom`, `gradient`, `backdrop-filter`, `border: 1px`, or an uppercase filename under `src/pages/` fails CI before it can be merged.
  4. Favicon (mark.svg + generated .ico/16/32 + existing 180×180 apple-touch-icon) renders correctly in a desktop browser tab and an iOS "add to home screen" preview.
  5. PROJECT.md's Constraints section reads "Cloudflare Workers with Static Assets" (the legacy "Cloudflare Pages" wording is gone).
**Plans**: 5 plans
Plans:
**Wave 1**
- [x] 01-01-scaffold-astro-cloudflare-PLAN.md — Scaffold Astro 6.2 + Cloudflare adapter, wrangler.jsonc, Fonts API config, PROJECT.md correction (FND-01, FND-02, FND-07)
- [x] 01-02-sync-design-skill-PLAN.md — Sync 11 design-skill JSX components + brand-token CSS into src/ with mechanical transforms + manual SSR-safe edits (FND-06, FND-09)
- [x] 01-03-favicon-and-public-assets-PLAN.md — Generate favicon set from mark.svg, copy apple-touch-icon as-is, ship 3 placeholder gallery WebPs (FND-08)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 01-04-baselayout-pages-sample-data-PLAN.md — BaseLayout.astro + 5 page placeholders + sample-data.ts; demo-loaded shell renders (FND-05, FND-12, FND-13)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 01-05-ci-brand-check-and-setup-PLAN.md — GitHub Actions required status check + brand grep scripts + Lighthouse CI on preview URL + SETUP.md for Cloudflare connect (FND-04, FND-10, FND-11, FND-12)
**UI hint**: yes

**Key risks / pitfalls:**
- Pages → Workers swap during scaffold — most online Astro 6 + Cloudflare templates still reference `pages_build_output_dir`; verify `wrangler.toml` shape (`assets.directory`, `assets.binding`, `assets.run_worker_first: ["/api/*"]`, `main = "./dist/_worker.js/index.js"`) against current Cloudflare docs during planning.
- Design-skill JSX may import across the `.claude/skills/` boundary in ways the sync script needs to rewrite; expect manual cleanup on first run.
- FOIT on the hand-display font if `font-display: swap` is forgotten (Pitfall #10) — encode in the `@font-face` rule from day one.
- Coral-on-cream contrast (Pitfall #16) — never use coral for body text; verify with Lighthouse a11y on the first preview.
- Removed focus styles (Pitfall #17) — every `outline: none` must be paired with a `:focus-visible` indicator.
- Lowercase filename CI rule (Pitfall #13) — macOS dev vs Linux deploy case-sensitivity bug is silent until production.
- Favicon generation — only the 180×180 PNG exists; the .ico + 16/32 PNGs must be generated from `assets/logo/mark.svg` during this phase (no founder action needed).

### Phase 2: Content Schema & Gallery
**Goal**: Founder can add a gallery piece via the GitHub web UI and see it on a preview deploy within ~5 minutes — including the gallery grid card, the per-piece detail page with availability badge, and the "Ask about this piece on Instagram" CTA.
**Depends on**: Phase 1
**Requirements**: CNT-01, CNT-02, CNT-03, CNT-04, CNT-05, CNT-06, CNT-07, CNT-08, CNT-09, CNT-10, CNT-11, CNT-12
**Success Criteria** (what must be TRUE):
  1. Founder can drag a photo into a new `src/content/gallery/<slug>/` folder via the GitHub web UI, fill in frontmatter (name, price, status, description), open a PR, and see the new piece on the preview deploy's `/gallery` index and `/gallery/<slug>` detail page.
  2. A typo in a gallery frontmatter field (e.g., `availabilty: sold`) fails the build with a clear Zod error message, before the bad data ever ships.
  3. A sold piece, marked `status: sold`, renders in the gallery grid with a quiet editorial "Sold" badge (not hidden) and remains in the portfolio archive.
  4. The per-piece detail page emits a per-piece `og:image` (the piece's hero photo, absolute URL) so an Instagram or iMessage link unfurls correctly.
  5. `CONTENT_EDITING.md` exists at the repo root with the GitHub web UI flow documented in prose (screenshots deferred to first founder content-editing workflow review — section §3 of CONTENT_EDITING.md flags this) and a clearly labeled "never delete, flip availability" section; zero `git`/`npm`/`cd` instructions appear in any content-editing step.
**Plans**: 5 plans
Plans:
**Wave 1**
- [x] 02-01-PLAN.md — Schema + 6 seed pieces + site config + BaseLayout head slot (CNT-01..CNT-06, CNT-10)
- [x] 02-02-PLAN.md — HEIC→WebP prebuild pipeline + CI step + gitignore (CNT-11)
- [x] 02-03-PLAN.md — Phase 1 cleanup (delete ProductSheet, fix #FFF regex)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 02-04-PLAN.md — Wire schema into /gallery + /gallery/<slug> + delete sample-data + activate Rule 7 (CNT-02, CNT-07, CNT-08, CNT-09, CNT-10, CNT-11, PAG-09)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 02-05-PLAN.md — CONTENT_EDITING.md + REQUIREMENTS/ROADMAP narrative sync (CNT-12)

**Key risks / pitfalls:**
- Schema design is one-shot: every `.strict()` enum, every required field, and the per-slug image co-location pattern must be baked in now (Pitfalls #6, #11, #12) — migrating later means rewriting every existing file.
- `passthroughImageService()` is required because Sharp doesn't run in `workerd` (Pitfall #8) — photos must be pre-optimized as WebP at commit time; lock the exact pre-optimization tool (squoosh-cli vs sharp-cli) and document it in `CONTENT_EDITING.md`.
- Founder workflow risk (Pitfall #23) — the GitHub web UI flow must be documented with screenshots and the founder should dry-run adding a piece before this phase is signed off.

### Phase 3: Page Composition & Pop-ups
**Goal**: All five pages render their real content on preview — landing (hero + OPTIONAL mini-callout for the next pop-up, omitted on zero upcoming per D-03 + 3 featured pieces + footer), gallery (from Phase 2), popups (timezone-correct upcoming + past archive, auto-refreshing daily), about (written portrait + closing photo strip reusing gallery hero WebPs per D-14), say-hi (Instagram DM link + mailto fallback, no form per D-18) — with per-page SEO meta and a published sitemap.
**Depends on**: Phase 2
**Requirements**: PAG-01, PAG-02, PAG-03, PAG-05, PAG-06, PAG-07, PAG-08, PAG-09 (PAG-04 deferred to a later phase — see Wave 3 note on 03-05)
**Success Criteria** (what must be TRUE):
  1. Landing page shows the hero, a mini-callout for the next-upcoming pop-up (per D-02; OMITTED entirely when no future pop-up exists per D-03 — no eyebrow, no copy, no empty-state line), 3 featured gallery pieces (per D-04), and the footer — all populated from content collections.
  2. A pop-up dated for "today" in Pacific time appears in the Upcoming section all day on its date in San Francisco (does not flip to Past at UTC midnight); after its end date, the next deploy moves it to the Past archive automatically. *(Daily auto-rebuild cron deferred — see 03-05 SUMMARY: integrated `wrangler.jsonc` approach proved structurally incompatible with `@astrojs/cloudflare@13.5`; until cron is added in a future phase the founder triggers a rebuild manually when a popup ends.)*
  3. The About page renders a first-person written portrait with hand-font headline and the "made with love from NOPA ♡" signature close (D-16), plus a closing photo strip of 1–3 gallery hero WebPs (per D-14 — dedicated process/craft shots deferred to v1.x; the no-founder-face rule stays intact since gallery photos don't show the founder), with no empty "press" or "as featured in" placeholders.
  4. Sharing the home, a gallery piece, and a pop-up URL in iMessage/Slack/IG DM each produce a correct unfurl preview (title, description, og:image), and `https://studiobluemli.com/sitemap-index.xml` + `/robots.txt` return valid content with the sitemap reference.
  5. Every page's `<link rel="canonical">` points to the apex `studiobluemli.com` (not `www.`, not a preview hostname).
**Plans**: 7 plans (5 original + 2 gap-closure)
Plans:
**Wave 1**
- [x] 03-01-brand-system-tweaks-PLAN.md — Wordmark font swap (Bagel Fat One -> Caveat Brush) and project-wide NoPa -> NOPA casing fix on user-facing copy (D-24, D-25)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 03-02-seo-sitemap-robots-PLAN.md — Shared <SEO /> + @astrojs/sitemap + env-aware /robots.txt endpoint + default og:image PNG + REQUIREMENTS.md edits (PAG-02, PAG-06, PAG-07, PAG-08; D-19, D-23, D-26-D-29)

**Wave 3** *(blocked on Wave 2 completion; three plans run in parallel)*
- [x] 03-03-popups-and-landing-PLAN.md — TZ-aware splitPopups() helper + landing mini-callout + /popups page with ALSO COMING UP/PAST/empty-state + PopupStrip CTA delete (PAG-01, PAG-03; D-02-D-11)
- [x] 03-04-about-and-say-hi-PLAN.md — /about copy rewrite + photo strip + signature + /say-hi IG-link page (form dropped) (PAG-05, PAG-06, PAG-09; D-13-D-18, D-21-D-23)
- [~] 03-05-cron-rebuild-PLAN.md — DEFERRED (spike FAIL): integrated `wrangler.jsonc` + `src/scheduled.ts` approach proved structurally incompatible with `@astrojs/cloudflare@13.5`, which writes `dist/server/wrangler.json` and silently strips user-level `main` + `triggers.crons` at deploy time. Per user decision, cron rebuild is deferred to a future phase; founder triggers manual rebuild when a popup ends. Full root-cause analysis in `03-05-SUMMARY.md`. (PAG-04 deferred; D-12)

**Gap-closure (post-verification; run in parallel, independent of original waves):**
- [x] 03-06-seo-robots-gap-closure-PLAN.md — Fix BL-01 (homepage canonical trailing slash) + BL-02 (resolveAssetBase reads process.env not import.meta.env) + BL-03 (PUBLIC_DEPLOY_ENV=production prefix on deploy script so robots.txt ships Allow + Sitemap); add scripts/check-seo-output.mjs + ci:seo-check npm gate (closes GAP-01, GAP-02, GAP-03; PAG-07, PAG-08)
- [x] 03-07-about-heart-glyph-PLAN.md — Pass filled={false} to Mark.Heart in About.jsx so /about signature renders outline ♡ per D-16 (closes GAP-04 / WR-06; PAG-05)
**UI hint**: yes

**Key risks / pitfalls:**
- Timezone math is subtle (Pitfall #7) — store `date` + `start_time` + `tz: "America/Los_Angeles"`; compute cutoff in studio timezone using a real TZ library (`Temporal` polyfill or `@date-fns/tz`), never naive `new Date()` UTC math.
- Daily auto-rebuild via Cloudflare cron — DEFERRED. Phase 3 spike (03-05) confirmed the integrated approach is structurally incompatible with `@astrojs/cloudflare@13.5` (adapter overwrites `wrangler.jsonc`). Documented fallback path: a SEPARATE cron-only Worker (`studio-bluemli-cron`) with its own `wrangler-cron.jsonc` + minimal `src/cron-only.ts`. Until that ships in a future phase, the founder triggers rebuilds manually when a popup ends.
- Process/craft shots availability — SOFTENED in Phase 3 planning (D-14): the founder doesn't currently have dedicated bench/hands/beads photos; the About page reuses 1–3 existing gallery hero WebPs as the closing visual flourish. Real bench shots can be swapped in later via a small follow-up commit by the founder via the GitHub web UI when the photos exist. The no-founder-face lock is preserved.
- Missing per-page `og:image` (Pitfall #14) — verify the shared `SEO.astro` component on every page during planning; emit absolute URLs (not relative) for og/twitter image meta.
- Empty placeholders — if the founder has no real press, the About page ships without a press section; never show "as featured in" as an empty slot (Pitfall: anti-feature from FEATURES.md).
- Contact form scope cut (Phase 3 D-18) — `/say-hi` ships in v1 as an IG-DM-link page + mailto fallback only. The original Phase 4 (Contact Form & Deliverability) entry was removed via `/gsd-phase --remove 4` after Phase 3 completed (per D-20); what was Phase 5 (Analytics, Polish & Launch) is now Phase 4 and depends on Phase 3.

### Phase 4: Analytics, Polish & Launch
**Goal**: `https://studiobluemli.com` resolves to the production Worker, `www.` 301-redirects to apex, Umami records every visit and event from the production domain, all 5 pages score Lighthouse mobile ≥ 90, and the founder has walked the "Looks Done But Isn't" launch checklist end-to-end.
**Depends on**: Phase 3
**Requirements**: FND-03, LCH-01, LCH-02, LCH-03, LCH-04, LCH-05, LCH-06, LCH-07, LCH-08
**Success Criteria** (what must be TRUE):
  1. Visiting `https://studiobluemli.com` shows the live production site over HTTPS with a valid certificate, and `https://www.studiobluemli.com/anything` returns a 301 to `https://studiobluemli.com/anything`.
  2. Within 5 minutes of cutover, the Umami Cloud dashboard's Realtime view shows the founder's own visit plus custom events (gallery-card click, "inquire on Instagram" click on `/say-hi`) — events from preview deploys do **not** appear (`data-domains` is enforced).
  3. Lighthouse mobile audit on the production URL scores ≥ 90 on Performance, Accessibility, Best Practices, and SEO for all 5 pages (landing, gallery, gallery detail sample, popups, about, say-hi).
  4. The Facebook Sharing Debugger and Twitter Card validator return valid previews (image, title, description) for the home, a representative gallery piece, and a pop-up URL.
  5. The "Looks Done But Isn't" checklist (LCH-08) is walked top-to-bottom: sitemap + robots.txt return 200; every `og:image` URL returns 200; no console errors on any page; all 5 pages load < 2s on a throttled mobile connection.
**Plans**: 5 plans
Plans:
**Wave 1** *(four plans run in parallel — independent files, no shared file conflicts)*
- [x] 04-01-PLAN.md — Env-aware Umami snippet in BaseLayout reusing isProduction() + 4 data-umami-event attributes on gallery card / per-piece IG inquire / say-hi IG DM / say-hi mailto (LCH-01, LCH-02 scaffolding, LCH-03; D-01, D-02, D-03)
- [x] 04-02-PLAN.md — public/_headers with HSTS + CSP (Umami wildcards) + Permissions-Policy + Referrer-Policy + X-Content-Type-Options + Cache-Control buckets (LCH-04; D-08, D-09)
- [x] 04-03-PLAN.md — SETUP-DNS.md at repo root (founder-facing 5-step walkthrough); verify astro.config.mjs site:apex (D-07) + public/og-default.png brand fidelity (D-10); cross-link from CONTENT_EDITING.md (FND-03, LCH-07; D-06)
- [x] 04-04-PLAN.md — scripts/check-og-images.sh + scripts/lighthouse-production.sh + npm ci:og-check / ci:lighthouse-prod scripts; LCH-06 acceptance pivoted off the deprecated Twitter Card Validator to FB Sharing Debugger + real iMessage/IG unfurl (LCH-05, LCH-06, LCH-08)

**Wave 2** *(blocked on Wave 1 completion — depends on all four)*
- [ ] 04-05-PLAN.md — Cutover execution + LAUNCH-REPORT.md: founder walks SETUP-DNS.md; Claude scripts checklist items 1-8; founder walks items 9-11 (phone checks); Umami site-list housekeeping; HSTS preload-list submission DEFERRED to v1.x (FND-03, LCH-02, LCH-05, LCH-06, LCH-07, LCH-08; D-04, D-05)
**UI hint**: no

**Key risks / pitfalls:**
- DNS cutover is one-way-ish — sequence it last in the phase, after final About copy is locked and Umami's domain registration is verified (Pitfall #19).
- Umami "0 events" after cutover almost always means the production domain wasn't added to Umami's website list (Pitfall #19) — register `studiobluemli.com` (not the `*.workers.dev` preview) in Umami settings before cutover.
- WWW vs apex split (Pitfall #18) — pick apex as canonical; verify the Cloudflare Redirect Rule fires *before* announcing.
- `_headers` for security (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) and long-cache for static assets must ship with the cutover, not after — HSTS in particular is sticky once issued.
- Twitter Card Validator deprecated 2022 — LCH-06 acceptance is pivoted in Plan 04 to Facebook Sharing Debugger + real iMessage/IG unfurl test on the founder's phone. The dead validator URL is explicitly excluded from `scripts/check-og-images.sh`.
- Umami events endpoint origin has drifted three times in two years — CSP `connect-src` allows `https://*.umami.is https://*.umami.dev` wildcards as a defensive measure (RESEARCH.md Pitfall 1); Plan 05 launch-checklist item 5 confirms empirically by reading DevTools Network on each event click.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundations & Brand System | 5/5 | Complete | 2026-05-13 |
| 2. Content Schema & Gallery | 5/5 | Complete | 2026-05-14 |
| 3. Page Composition & Pop-ups | 0/TBD | Not started | - |
| 4. Analytics, Polish & Launch | 0/5 | Not started | - |
