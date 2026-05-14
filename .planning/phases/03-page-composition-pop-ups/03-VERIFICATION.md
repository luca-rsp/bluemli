---
phase: 03-page-composition-pop-ups
verified: 2026-05-13T22:30:00Z
status: gaps_found
score: 2/5 success-criteria verified (3 blocked by independent BL-01/BL-02/BL-03 evidence in built artifacts)
gaps:
  - truth: "SC4 — Sharing apex URLs produces correct unfurl previews AND `/sitemap-index.xml` + `/robots.txt` return valid content with sitemap reference"
    status: failed
    reason: "robots.txt published by `npm run deploy` contains `Disallow: /` (full deindex). The Allow + Sitemap branch of `isProduction()` cannot fire in the current deploy path (`astro build && wrangler deploy`); none of WORKERS_CI_BRANCH, CF_PAGES_BRANCH, or PUBLIC_DEPLOY_ENV are set by the script. Reproduced locally: `dist/client/robots.txt` (built 2026-05-14 by Plan 02 + later) literally contains `User-agent: *\nDisallow: /\n`. Independently confirms BL-03."
    artifacts:
      - path: "src/pages/robots.txt.ts:21-23"
        issue: "Conditional `isProduction() ? 'Allow: / + Sitemap' : 'Disallow: /'` — Allow branch unreachable on `npm run deploy`."
      - path: "src/lib/site-url.ts:77-100"
        issue: "isProduction() requires WORKERS_CI_BRANCH=main, CF_PAGES_BRANCH=main, or PUBLIC_DEPLOY_ENV=production — none are set by `package.json:12` deploy script. Project deploys via Wrangler CLI, not Workers Builds CI, so no env is auto-injected."
      - path: "dist/client/robots.txt"
        issue: "Built output literally contains `User-agent: *\\nDisallow: /\\n` — 26 bytes. Sitemap reference is absent. SC4's `/robots.txt` clause unmet for production."
      - path: "package.json:12"
        issue: "`deploy` script `astro build && wrangler deploy` does NOT export PUBLIC_DEPLOY_ENV=production. Production deploy will silently publish the Disallow build."
    missing:
      - "Production signal for `isProduction()` to fire on the actual deploy path. Recommended: prefix deploy script with `PUBLIC_DEPLOY_ENV=production` (cross-env-safe form) so `astro build` inlines the env var. Alternative: invert the predicate (default Allow, Disallow only when a preview signal is present)."
      - "A Playwright/curl smoke test that asserts `Sitemap: https://studiobluemli.com/sitemap-index.xml` appears in the production `dist/client/robots.txt` after running `npm run deploy` (or its env-var-equipped equivalent). Without this gate the same regression can re-land."

  - truth: "SC5 — Every page's `<link rel=\"canonical\">` points to the apex `studiobluemli.com`"
    status: partial
    reason: "Canonical IS apex (never preview-hostname) for non-root pages, which satisfies the literal SC5 wording. HOWEVER on the homepage the emitted canonical is `https://studiobluemli.com` (no trailing slash) while every internal link references `/` (which serves as `https://studiobluemli.com/` with trailing slash). Google treats `apex` and `apex/` as canonically distinct on the root, so `og:url` will unfurl as a different URL than the one users actually visit. Independently confirms BL-01."
    artifacts:
      - path: "dist/client/index.html"
        issue: "`<link rel=\"canonical\" href=\"https://studiobluemli.com\">` and `<meta property=\"og:url\" content=\"https://studiobluemli.com\">` — both with no trailing slash. Internal anchors (`Header.jsx`, `Hero.jsx`) use `href=\"/\"` which resolves to `https://studiobluemli.com/`. Per-page sitemap-0.xml also emits `<loc>https://studiobluemli.com/</loc>` WITH the trailing slash, contradicting the homepage canonical."
      - path: "src/components/SEO.astro:37"
        issue: "`canonical = ${canonicalBase}${pathname === '/' ? '' : pathname}` strips the trailing slash on root. Should be `pathname === '/' ? '/' : pathname` to keep `https://studiobluemli.com/` (matching the sitemap and the actual canonical address)."
      - path: "src/lib/site-url.ts:32-36"
        issue: "`resolveCanonicalBase()` strips trailing slash from `Astro.site.toString()` (which is always `https://studiobluemli.com/` per Astro's URL normalisation). Combined with the SEO.astro root-special-case above, this produces the bare-apex canonical on `/`."
    missing:
      - "Append a trailing slash for the root path so canonical = `https://studiobluemli.com/` (matches sitemap, matches actual page URL, matches og:url for unfurls)."
      - "Optional: an automated smoke check that compares `<link rel=canonical>` href to the URL the page is actually served from (e.g., the sitemap entry) for each prerendered page."

  - truth: "PAG-07 — Per-piece og:image base URL is preview-aware (PR-preview unfurls use the preview hostname, not the apex asset URL)"
    status: failed
    reason: "`resolveAssetBase()` reads `import.meta.env.CF_PAGES_URL` / `CF_WORKERS_URL` / `PUBLIC_SITE_URL`. Vite (which Astro builds on) ONLY exposes env vars prefixed with `PUBLIC_` to `import.meta.env`. `CF_PAGES_URL` and `CF_WORKERS_URL` are dropped silently — they live in `process.env`, not `import.meta.env`. So `resolveAssetBase()` is effectively `resolveCanonicalBase()` in every code path that matters, defeating the Phase 2 Codex HIGH-4 fix that this helper was created to address. Independently confirms BL-02."
    artifacts:
      - path: "src/lib/site-url.ts:55-62"
        issue: "`fromEnv = import.meta.env.CF_PAGES_URL ?? import.meta.env.CF_WORKERS_URL ?? import.meta.env.PUBLIC_SITE_URL;` — first two will be `undefined` on any real Cloudflare build. Note the same file's `isProduction()` correctly reads `process.env.WORKERS_CI_BRANCH` — so the pattern was understood elsewhere in the same file."
      - path: "src/pages/gallery/[slug].astro (Phase 2-touched, but consumed via this Plan 02 helper)"
        issue: "Per-piece `og:image` calls `resolveAssetBase(Astro.site)`; on a PR preview build this falls through to apex, so preview-deploy unfurls point at the production apex asset URL. The bug is silent — no crash, just a wrong image URL on previews."
    missing:
      - "Read CF_PAGES_URL / CF_WORKERS_URL from `process.env` (same pattern as `isProduction()`). Mirror that into `import.meta.env.PUBLIC_*` only as an explicit operator override. Recommended fix is in 03-REVIEW.md BL-02."
      - "A smoke test (or recorded grep snapshot) that builds with `CF_WORKERS_URL=https://preview.example.workers.dev` set in `process.env` (not just `import.meta.env`) and asserts per-piece `og:image` carries the preview hostname while `og:url` stays on apex."

  - truth: "WR-06 — About page signature renders the OUTLINE heart glyph `♡` per D-16 / UI-SPEC §Copywriting Contract"
    status: partial
    reason: "Built `/about` HTML contains `<span style=\"color:var(--coral-500);font-size:16px;line-height:1\">♥</span>` — the FILLED heart, not the outline `♡` that D-16 specifies. Visible brand-fidelity mismatch in the signature close (SC3 calls out this exact rule). Severity is WARNING not BLOCKER because the page does render a signature with the right phrase, just with a heavier glyph than the design contract."
    artifacts:
      - path: "src/components/design-skill/About.jsx (Mark.Heart invocation)"
        issue: "Mark.Heart defaults `filled = true`. The line `made with love from NOPA <Mark.Heart color=\"var(--coral-500)\" />` therefore renders `♥`."
      - path: "dist/client/about/index.html"
        issue: "Rendered HTML confirms `♥` (filled heart, U+2665), not `♡` (outline heart, U+2661)."
    missing:
      - "Pass `filled={false}` to Mark.Heart, OR inline the outline glyph (`<span style=\"color:var(--coral-500)\">♡</span>`) per the 03-REVIEW WR-06 fix."

deferred:
  - truth: "SC2 (cron portion) — Daily 3 AM PT auto-rebuild via Cloudflare cron"
    addressed_in: "Future phase (PAG-04 explicitly marked deferred in REQUIREMENTS.md + ROADMAP.md)"
    evidence: "REQUIREMENTS.md line: 'PAG-04 (deferred from Phase 3): A Cloudflare cron trigger rebuilds the site daily at ~3:00 AM Pacific... Phase 3 spike confirmed integrated approach incompatible with @astrojs/cloudflare@13.5. Fallback: separate cron-only Worker. To be implemented in a later phase.' ROADMAP SC2 explicitly softened: 'Daily auto-rebuild cron deferred... until cron is added in a future phase the founder triggers a rebuild manually.' Build-time TZ-correct split remains a separate truth — see SC2 (build-time) below, which IS verified."

human_verification:
  - test: "Share https://studiobluemli.com/ in iMessage/Slack/IG DM after the BL-01 fix lands and verify the unfurl preview shows the correct title, description, and og:image (and that the unfurled URL matches what users actually visit)."
    expected: "All three platforms render a card with `Studio Bluemli — hand-clustered beaded earrings`, the og_description, and the og-default.png. The URL pill matches `https://studiobluemli.com/` (with slash)."
    why_human: "Each unfurl platform (Apple, Slack, Meta) has its own cache + image-fetch behavior; programmatic HTML inspection cannot prove the rendered card."
  - test: "Share `https://studiobluemli.com/gallery/cluster-coral/` in the same three platforms; verify the per-piece og:image (hero-800.webp) renders correctly in the unfurl card."
    expected: "Card shows the cluster-coral hero photo as the unfurl image, not the default coral-on-cream mark."
    why_human: "Per-piece og:image override on apex is currently the only `og:image` path that diverges from the default; cannot verify rendered preview without the actual platforms."
  - test: "On a phone at 320px viewport (or DevTools iPhone SE preset), confirm the hero eyebrow `Studio Bluemli · NOPA, San Francisco` does not overflow or push horizontal scroll (IN-02 from 03-REVIEW)."
    expected: "Eyebrow fits within the section padding; no horizontal scroll bar."
    why_human: "CLAUDE.md targets Lighthouse mobile ≥ 90 and phone-first responsive; visual verification at the smallest target viewport is the only way to know."
  - test: "After the BL-03 fix, deploy to production and curl `https://studiobluemli.com/robots.txt`. Assert the body contains `Allow: /` and a literal `Sitemap: https://studiobluemli.com/sitemap-index.xml` line, AND that `https://studiobluemli.com/sitemap-index.xml` returns 200 with the expected `<loc>` for the 5 top-level routes + 6 gallery slugs."
    expected: "200 on both, robots body contains Allow + Sitemap, sitemap-index references sitemap-0.xml which contains all 11 entries."
    why_human: "Production-only signal (apex DNS + Cloudflare deploy) — `npm run build` locally always produces the Disallow body because no `PUBLIC_DEPLOY_ENV=production` is set on the dev machine."
---

# Phase 3: Page Composition & Pop-ups Verification Report

**Phase Goal:** All five pages render their real content on preview — landing (hero + OPTIONAL mini-callout for the next pop-up, omitted on zero upcoming per D-03 + 3 featured pieces + footer), gallery (from Phase 2), popups (timezone-correct upcoming + past archive), about (written portrait + closing photo strip reusing gallery hero WebPs per D-14), say-hi (Instagram DM link + mailto fallback, no form per D-18) — with per-page SEO meta and a published sitemap.

**Verified:** 2026-05-13T22:30:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth (ROADMAP SC) | Status | Evidence |
|---|--------------------|--------|----------|
| SC1 | Landing renders hero + OPTIONAL mini-callout (omitted on zero upcoming per D-03) + 3 featured pieces + footer, all from content collections | ✓ VERIFIED | `dist/client/index.html`: zero popup-callout section in current zero-popup state; 3 featured pieces `cluster-blush`, `cluster-cobalt`, `cluster-coral` render as `/gallery/<slug>/hero-400.webp`; Footer rendered (`mark.svg`, IG handle, contact email, NOPA tagline, copyright). Plan 03 SUMMARY documents successful seeded-state build (mini-callout + see-all link when ≥2 upcoming exist). |
| SC2 (build-time portion) | A pop-up dated for "today" in Pacific time stays in the Upcoming bucket all day in SF (does not flip at UTC midnight); after end_date the next deploy moves it to Past | ✓ VERIFIED (build-time) | `src/lib/popups.ts:67` uses `Temporal.PlainDate.compare(popupEndDate(e), today) < 0` where today = `Temporal.Now.plainDateISO('America/Los_Angeles')`. Date-only comparison means TZ-of-build-machine cannot flip the bucket. Reproduced inline: today=2026-05-14 LA, popup_date=2026-05-13 → `compare < 0` = true (past), as expected. Day-of equality stays upcoming. NOTE: SC2's cron auto-rebuild portion is EXPLICITLY DEFERRED (PAG-04, see deferred section). |
| SC3 | About renders first-person written portrait + hand-font headline + "made with love from NOPA ♡" signature (D-16) + closing photo strip of 1–3 gallery hero WebPs (D-14), no empty press placeholders | ⚠️ PARTIAL | First-person written portrait (3 paragraphs) ✓ verified in built HTML; hand-font headline "made by hand" ✓ (Caveat Brush, coral, 56px); 3 photo strip cells (`cluster-blush`, `cluster-cobalt`, `cluster-coral` hero-800.webp) ✓; zero press/featured-in matches ✓. **But signature renders `♥` (filled heart, U+2665) instead of `♡` (outline heart, U+2661) — see WR-06 gap above.** D-16 explicitly specifies the outline glyph. |
| SC4 | Sharing apex URLs produces correct unfurl previews (title, description, og:image) AND `https://studiobluemli.com/sitemap-index.xml` + `/robots.txt` return valid content with sitemap reference | ✗ FAILED | Sitemap portion: `dist/client/sitemap-index.xml` returns 200-shaped XML, references `sitemap-0.xml` which contains 11 `<loc>` entries (5 top-level + 6 gallery slugs) all on apex ✓. Unfurl meta is present (og:title, og:description, og:image, twitter:card) ✓. **HOWEVER `dist/client/robots.txt` literally contains `User-agent: *\nDisallow: /\n`** — the `Allow + Sitemap` branch is unreachable under `npm run deploy` because the production signal `WORKERS_CI_BRANCH=main` / `PUBLIC_DEPLOY_ENV=production` is never set by the deploy script. Deploying as-is would publish a full-deindex robots.txt to apex. Independently confirms BL-03 from 03-REVIEW.md. |
| SC5 | Every page's `<link rel="canonical">` points to the apex `studiobluemli.com` (not www, not preview) | ⚠️ PARTIAL | All 5 pages' canonicals point to `https://studiobluemli.com[/path]` on apex ✓ (no preview hostnames). Preview-build smoke test in Plan 02 SUMMARY confirms zero canonical leaks under `CF_PAGES_URL=...` env. **HOWEVER on the homepage canonical = `https://studiobluemli.com` (no trailing slash) while sitemap-0.xml emits `https://studiobluemli.com/` AND internal links resolve to the slash form** — canonical mismatch on root. Independently confirms BL-01 from 03-REVIEW.md. |

**Score:** 2 / 5 success criteria fully verified; 1 deferred portion (SC2 cron); 2 PARTIAL (SC3 heart glyph, SC5 trailing-slash); 1 FAILED (SC4 robots.txt).

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | SC2 cron portion / PAG-04 — daily 3 AM PT auto-rebuild | Future phase (post-Phase 3) | REQUIREMENTS.md PAG-04 marked "(deferred from Phase 3): ... To be implemented in a later phase." ROADMAP SC2 explicitly softened: "Daily auto-rebuild cron deferred... founder triggers manual rebuild." Phase 3 spike (Plan 05) verified the integrated `wrangler.jsonc` cron approach is structurally incompatible with `@astrojs/cloudflare@13.5`. Build-time bucketing (the other half of SC2) IS verified above. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/site-url.ts` | Three helpers — `resolveCanonicalBase`, `resolveAssetBase`, `isProduction` | ⚠️ WIRED-BUT-BUGGY | Imported by SEO.astro + robots.txt.ts ✓; substantive ✓; but `resolveAssetBase` reads `import.meta.env.CF_*` which is always undefined (BL-02), and `isProduction` requires env vars never set by `npm run deploy` (BL-03). |
| `src/lib/popups.ts` | TZ-aware `splitPopups()` | ✓ VERIFIED | Imported by index.astro + popups.astro; uses Temporal.PlainDate.from on date-only; date-only compare keeps day-of upcoming in LA; returns plain `CollectionEntry` arrays (no Temporal type leak). |
| `src/components/SEO.astro` | Emits 9 head elements (no `<title>` per Concern 4) | ⚠️ WIRED-BUT-BUGGY | Confirmed 9 head elements (description, canonical, og:title, og:description, og:image, og:url, og:type, twitter:card, twitter:image); zero `<title>` ✓. But the root-special-case strips the trailing slash on `/` (BL-01). |
| `src/components/PopupCallout.astro` | Landing mini-callout | ✓ VERIFIED | Uses Temporal.PlainDate.from for date; start_time/end_time interpolated verbatim; scoped styles match UI-SPEC §Landing. |
| `src/pages/index.astro` | Hero + conditional callout + 3 featured + footer | ✓ VERIFIED | Built HTML shows hero, 3 featured gallery thumbs, footer; mini-callout omitted on zero popups (D-03 ✓). |
| `src/pages/popups.astro` | Soonest + ALSO COMING UP + PAST + empty state | ✓ VERIFIED | Empty-state copy `No pop-ups on the calendar yet — follow @studiobluemli` rendered in current zero-popup state; full layout verified seeded in Plan 03 SUMMARY. |
| `src/pages/about.astro` | Portrait + signature + photo strip, no press placeholders | ⚠️ PARTIAL | All three sections render; 0 matches for `press|featured in|as seen in`; but signature heart is filled `♥` not outline `♡` (WR-06). |
| `src/pages/say-hi.astro` | IG DM link + mailto, no form | ✓ VERIFIED | Built HTML has zero `<form>` and zero `<input>` matches; `DM me on Instagram → https://ig.me/m/studiobluemli` button present; mailto fallback to hi@studiobluemli.com present. |
| `src/pages/robots.txt.ts` | Production: Allow + Sitemap; preview: Disallow | ✗ MISWIRED | File exists, prerender=true, branching logic exists — but the production branch cannot fire under the current deploy script. Built output is `Disallow: /` (BL-03). |
| `public/og-default.png` | 1200x630 fallback og:image | ✓ VERIFIED | Committed at 11625 bytes; referenced by every page's `og:image` and `twitter:image` in built HTML. Note: WR-08 from 03-REVIEW flags potential contrast issue at unfurl-crop size — handed to Human Verification. |
| `dist/client/sitemap-index.xml` | Valid sitemap-index referencing sitemap-0.xml | ✓ VERIFIED | 188 bytes, references `sitemap-0.xml`. |
| `dist/client/sitemap-0.xml` | 11 `<loc>` entries on apex | ✓ VERIFIED | 1027 bytes; contains all 5 top-level routes + 6 gallery slugs, all `https://studiobluemli.com/...`. |
| `astro.config.mjs` | sitemap integration + Fonts API | ✓ VERIFIED | `integrations: [react(), sitemap()]`; 3 fonts entries (Caveat Brush, Nunito, Caveat) each with `display: 'swap'`. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/pages/index.astro` | `splitPopups()` + `<PopupCallout />` | import | ✓ WIRED | Imports `splitPopups` from `../lib/popups`; imports `PopupCallout`; renders `<PopupCallout popup={soonest} hasMultiple={hasMultiple} />` conditionally. |
| `src/pages/popups.astro` | `splitPopups()` + Astro `render()` for body markdown | import | ✓ WIRED | Soonest description rendered via `astro:content`'s render → Content component. |
| `src/pages/{index,popups,about,say-hi,gallery,gallery/[slug]}.astro` | `<SEO />` | `<SEO slot="head" ... />` | ✓ WIRED | All 6 prerendered surfaces use SEO.astro with title + pathname props; verified in 9-element head emission per page. |
| `src/pages/robots.txt.ts` | `isProduction()` | import | ✗ NOT_WIRED FOR DEPLOY | Import exists; logic runs at build time; but in the actual `npm run deploy` pipeline `isProduction()` always returns false because no env var is set. The wiring is structurally complete but functionally inert. |
| `src/components/SEO.astro` | `resolveCanonicalBase(Astro.site)` | import | ✓ WIRED (logic-buggy) | Wired correctly; helper returns apex; but downstream concatenation drops the trailing slash on `/` (BL-01). |
| `src/components/SEO.astro` | `resolveAssetBase(Astro.site)` | — | n/a IN SEO.astro | SEO.astro uses `canonicalBase` for the default og:image; `resolveAssetBase` is consumed by `src/pages/gallery/[slug].astro` for per-piece overrides — which is exactly where BL-02 silently degrades to apex. |
| `src/pages/about.astro` | gallery hero WebPs | `/gallery/<slug>/hero-800.webp` URLs | ✓ WIRED | 3 img tags with the expected URLs in built HTML. |
| `src/pages/say-hi.astro` | IG DM URL + mailto | `site.ig_dm_url` + `mailto:${site.contact_email}` | ✓ WIRED | `https://ig.me/m/studiobluemli` + `mailto:hi@studiobluemli.com` both present and clickable. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `src/pages/index.astro` | `featuredSorted` (3 pieces) | `getCollection('gallery')` → filter `featured===true` → sort by `published_at` desc → slice 3 | ✓ Yes — 6 gallery entries on disk, all featured=true; alphabetic tie-break yields cluster-blush, cluster-cobalt, cluster-coral | ✓ FLOWING |
| `src/pages/index.astro` | `{soonest, hasUpcoming}` | `getCollection('popups')` → `splitPopups(...)` | Currently empty (popups collection is .gitkeep only) — by D-03 design, the mini-callout is OMITTED. Built HTML confirms zero `<section class="popup-callout">` matches. | ✓ FLOWING (empty-state path) |
| `src/pages/popups.astro` | `soonest/alsoComing/past` | Same `splitPopups` pipeline | Currently empty → D-08 empty state rendered ("No pop-ups on the calendar yet — follow @studiobluemli for the next one.") | ✓ FLOWING (empty-state path) |
| `src/pages/about.astro` | `stripPieces` (3 entries) | gallery collection → featured filter → sort → slice 3 → `{slug, name}` | ✓ Yes — same 3 slugs as landing | ✓ FLOWING |
| `src/pages/say-hi.astro` | `site.ig_dm_url`, `site.contact_email` | `getEntry('site','default').data` | ✓ Yes — config.yaml populates both | ✓ FLOWING |
| `src/components/SEO.astro` | `canonical`, `ogImageAbs`, etc. | site config + props + Astro.site | Produces strings, but **canonical is wrong on root** (no trailing slash, BL-01) and og:image is on apex on previews instead of preview hostname (BL-02) | ⚠️ FLOWING WITH BUGS |
| `src/pages/robots.txt.ts` | body string | `isProduction()` | Always false on `npm run deploy` → always Disallow body (BL-03) | ⚠️ FLOWING WRONG VALUE |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Built homepage HTML contains hero + footer + canonical | `grep -c 'rel="canonical"' dist/client/index.html` | 1 | ✓ PASS |
| Built /say-hi has zero form/input | `grep -c '<form\|<input' dist/client/say-hi/index.html` | 0 | ✓ PASS (D-18 v1 scope cut verified) |
| Built /about has zero press/featured/as-seen-in | `grep -ciE 'press\|featured in\|as seen in' dist/client/about/index.html` | 0 | ✓ PASS (D-17 no-empty-placeholder) |
| Built /about renders 3 gallery hero-800.webp cells | `grep -oE '/gallery/[a-z-]+/hero-800.webp' dist/client/about/index.html` | 3 distinct URLs (blush/cobalt/coral) | ✓ PASS |
| Built /popups empty-state copy | `grep -E 'No pop-ups on the calendar' dist/client/popups/index.html` | 1 match | ✓ PASS |
| Sitemap-0.xml has 11 `<loc>` entries | `grep -oE '<loc>' dist/client/sitemap-0.xml \| wc -l` | 11 | ✓ PASS |
| Sitemap-index.xml references sitemap-0.xml | `grep 'sitemap-0.xml' dist/client/sitemap-index.xml` | match | ✓ PASS |
| robots.txt contains Sitemap reference | `grep -c 'Sitemap:' dist/client/robots.txt` | **0** | ✗ FAIL (BL-03) |
| robots.txt contains Allow rather than Disallow | `grep -c 'Allow:' dist/client/robots.txt` | **0** | ✗ FAIL (BL-03) |
| Built homepage canonical includes trailing slash | `grep 'rel="canonical" href="https://studiobluemli.com/"' dist/client/index.html` | **0** matches; instead has `href="https://studiobluemli.com"` (no slash) | ✗ FAIL (BL-01) |
| TZ logic: today=2026-05-14 LA, popup_date=2026-05-13 → past | `node` + Temporal sanity check | `compare < 0` = true ✓ | ✓ PASS |
| About signature has outline heart `♡` (D-16) | `grep -oE '♡' dist/client/about/index.html` | 0 (instead finds `♥` filled) | ✗ FAIL (WR-06) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PAG-01 | 03-01, 03-03 | Landing renders hero, next-popup callout (empty-state per D-03 = OMIT), 3-6 featured pieces, footer | ✓ SATISFIED | Built index.html verifies hero, 3 featured pieces, footer, empty-state OMIT per D-03. |
| PAG-02 | 03-02 | Gallery page renders the grid | ✓ SATISFIED | Phase 2 deliverable; SEO.astro wired into gallery.astro + gallery/[slug].astro. Sitemap-0.xml confirms gallery routes prerendered. |
| PAG-03 | 03-03 | /popups renders upcoming + past; TZ-correct LA cutoff at build time | ✓ SATISFIED | splitPopups uses Temporal.PlainDate + LA zone; popups page renders empty state today; Plan 03 SUMMARY documents seeded-state working. |
| PAG-04 | 03-05 | Cloudflare cron daily rebuild | DEFERRED | Spike-FAIL; PAG-04 explicitly deferred per REQUIREMENTS.md + ROADMAP.md. Not a Phase 3 gap. |
| PAG-05 | 03-04 | About renders portrait + signature + 1–3 photo strip, no founder face, no empty press | ⚠️ PARTIAL | Portrait + photo strip + zero-press all verified; signature heart is `♥` not `♡` (WR-06). |
| PAG-06 | 03-02 (narrative), 03-04 (impl) | Say Hi renders IG DM link + mailto fallback, no form | ✓ SATISFIED | Built say-hi.html has zero form/input, IG button + mailto present. |
| PAG-07 | 03-02 | Shared SEO emits per-page title/description/og/twitter/canonical-to-apex | ⚠️ PARTIAL | All meta tags emitted; canonical points to apex (no preview leak). BUT root path canonical drops trailing slash (BL-01) AND per-piece og:image base is not preview-aware due to Vite env-exposure bug (BL-02). |
| PAG-08 | 03-02 | @astrojs/sitemap generates sitemap-index.xml; robots.txt references the sitemap | ⚠️ PARTIAL | Sitemap generation verified (sitemap-index.xml + sitemap-0.xml both valid, 11 routes). robots.txt does NOT reference the sitemap on production deploy (BL-03). |
| PAG-09 | 03-04 | All product images have alt text; never uses flower/petal/floral/bloom/blossom | ✓ SATISFIED | Phase 2 Zod schema requires alt; about photo strip uses piece names as alt; landing/gallery confirmed by Phase 2 verification. (Brand-CI grep is in place.) |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/site-url.ts` | 56-58 | `import.meta.env.CF_PAGES_URL ?? CF_WORKERS_URL` — Vite drops non-PUBLIC_ vars | 🛑 Blocker (BL-02) | Per-piece og:image base never gets preview hostname; defeats Phase 2 HIGH-4 fix this helper was built for. |
| `src/lib/site-url.ts` | 77-100 + `package.json:12` | `isProduction()` checks env vars never set by `npm run deploy` | 🛑 Blocker (BL-03) | Production robots.txt publishes `Disallow: /` — full deindex. |
| `src/components/SEO.astro` | 37 | `canonical = ${base}${pathname === '/' ? '' : pathname}` — drops slash on root | 🛑 Blocker (BL-01) | Homepage canonical/og:url mismatches actual served URL + sitemap entry. |
| `src/components/design-skill/About.jsx` | Mark.Heart call | Default `filled=true` renders `♥` instead of D-16's `♡` | ⚠️ Warning (WR-06) | Visible brand-fidelity defect on the signature close. |
| `src/components/design-skill/Footer.jsx` | 23 | `target="_blank"` without `rel="noopener"` | ⚠️ Warning (WR-03) | Reverse-tabnabbing vector on older browsers; Lighthouse Best Practices ding. |
| `src/lib/popups.ts` | 25-33 | `todayInLA()` hardcodes LA zone; ignores per-popup `tz` field | ⚠️ Warning (WR-02) | Today benign (SF-only); non-SF popups in `tz` field would bucket wrong. Code-defect signal. |
| `src/components/PopupCallout.astro` + `popups.astro` | 27-32 / 55-60 | Multi-day popups (`end_date`) only show start date in callout/list | ⚠️ Warning (WR-01) | Weekend popups render as one-day events. |
| `src/components/PopupCallout.astro` | 36 | `${start_time}–${end_time}` — verbatim interpolation, no en-dash collision guard | ⚠️ Warning (WR-09) | Founder typing "11 – 11:30am" would produce double-en-dash output. |
| Multiple .astro pages | various | `(await getEntry('site','default'))!.data` non-null assertion | ⚠️ Warning (WR-04) | YAML rename → confusing build-time crash with no help text. |
| `src/components/design-skill/Header.jsx` | 113 | `dangerouslySetInnerHTML` for styles | ⚠️ Warning (WR-05) | CSP regression + circumvents brand-CI grep gate. |
| `src/pages/about.astro` + index/gallery | various | `src={`/gallery/${slug}/hero-800.webp`}` — slug not URL-encoded | ⚠️ Warning (WR-07) | Today benign; future non-ASCII slug breaks. |
| `scripts/generate-og-default.mjs` | 18-54 | Coral-on-cream contrast ~3.2:1 at unfurl crop | ⚠️ Warning (WR-08) | Borderline WCAG; brand mark unreadable at small unfurl size. |
| `src/components/design-skill/PopupStrip.jsx` | 11-22 | Doc comment claims Temporal but uses `new Date()` | ℹ️ Info (IN-01) | Strip date may render 1 day off vs other surfaces. |
| `src/components/design-skill/Hero.jsx` | 13-16 | `whiteSpace: nowrap` on eyebrow overflows at 320px | ℹ️ Info (IN-02) | Mobile horizontal scroll on smallest target viewport. |

### Human Verification Required

See `human_verification:` in frontmatter — 4 items routed to human:

1. **Unfurl preview verification** for `/` after BL-01 fix lands — iMessage/Slack/IG DM each render the correct card.
2. **Per-piece og:image unfurl** for `/gallery/cluster-coral/` — verify the hero photo loads, not the default mark.
3. **320px viewport eyebrow overflow** check (IN-02).
4. **Production /robots.txt + /sitemap-index.xml curl test** after BL-03 fix — assert Allow + Sitemap line on actual deployed apex.

### Gaps Summary

Phase 3 successfully landed the visible-page composition for all five surfaces:
- Landing renders hero + 3 featured pieces + footer (D-03 omit verified for zero upcoming).
- /popups handles empty + seeded + past states with TZ-correct LA bucketing at build time.
- /about ships a 3-paragraph first-person portrait + photo strip + signature.
- /say-hi is the no-form IG-link + mailto page.
- Per-page SEO meta, sitemap-index, and og-default.png are all wired.

**However, three production-critical SEO defects are present in the SEO-infrastructure subsystem (BL-01, BL-02, BL-03):**

1. **BL-03 is the most damaging:** the current `npm run deploy` pipeline ships `robots.txt` as `Disallow: /`. This would deindex Studio Bluemli from Google on the next deploy. The fix is a one-line addition to the deploy script (`PUBLIC_DEPLOY_ENV=production astro build && wrangler deploy`) or an invert-the-predicate refactor of `isProduction()`. **Must be fixed before any production deploy that the founder expects users to find via search.**
2. **BL-01 produces a homepage canonical of `https://studiobluemli.com` (no slash) while sitemap-0.xml and internal anchors use the slash form** — a real canonicalization bug that splits Google's view of the homepage. The fix is one line in SEO.astro.
3. **BL-02 silently degrades per-piece og:image to apex on PR-preview deploys**, defeating the entire purpose of the `resolveAssetBase` helper (which exists precisely to address a Phase 2 Codex HIGH finding). The fix is to read `process.env.CF_*` instead of `import.meta.env.CF_*`.

WR-06 (signature heart glyph) is a visible D-16 brand-fidelity miss on the About page — `♥` filled instead of `♡` outline — and should be fixed in the same closure pass.

The 8 remaining warnings (WR-01 multi-day popups, WR-02 tz field unused, WR-03 noopener, WR-04 non-null assertion, WR-05 dangerouslySetInnerHTML, WR-07 slug encoding, WR-08 og contrast, WR-09 en-dash collision) plus 3 info items are real but non-blocking for the phase goal; recommend tracking them but not gating Phase 3 closure on them.

The Phase 3 page composition is structurally complete and visually correct on the 5 pages. The gaps are concentrated in the shared SEO infrastructure that all pages consume — fixing the 3 blockers in `site-url.ts` + `SEO.astro` + `package.json` (and WR-06 in About.jsx) is a tight, focused closure scope.

---

_Verified: 2026-05-13T22:30:00Z_
_Verifier: Claude (gsd-verifier)_
