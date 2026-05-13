---
phase: 02-content-schema-gallery
verified: 2026-05-13T16:05:00Z
status: gaps_found
score: 4/5 success criteria verified
overrides_applied: 0
gaps:
  - truth: "Site config (CNT-06) drives header/footer copy on the rendered preview"
    status: failed
    reason: "`site` content collection is defined, schema-validated, and seeded at `src/content/site/config.yaml`, but NO page or component calls `getCollection('site')` or `getEntry('site', ...)`. Footer.jsx and src/pages/gallery/[slug].astro hardcode all the values the site config is supposed to drive. Worse: Footer.jsx hardcodes IG handle `studio_bluemli` (underscore form) while the YAML sets `ig_handle: studiobluemli` (no underscore) — they cannot both be correct and the data file is NOT the source of truth. Editing the YAML changes nothing on the deployed site, breaking the founder workflow promise that motivates CNT-06."
    artifacts:
      - path: src/components/design-skill/Footer.jsx
        issue: "Lines 23 and 25 hardcode `https://instagram.com/studio_bluemli` and `mailto:hi@studiobluemli.com`. Should read from `getEntry('site','default').data.ig_handle` and `.data.contact_email`. Also: Footer is a React component (.jsx), so an Astro-side `getEntry()` call would need to pass values as props."
      - path: src/pages/gallery/[slug].astro
        issue: "Lines 90 and 92 hardcode `https://ig.me/m/studiobluemli` and `mailto:hi@studiobluemli.com`. Should read from `site.data.ig_dm_url` and `site.data.contact_email`."
      - path: src/content.config.ts
        issue: "Defines and validates a `site` collection (lines 60-73) that no caller reads — silent contract."
    missing:
      - "At least one `import { getEntry } from 'astro:content'` + `const site = await getEntry('site', 'default')` call in a Phase 2 page (gallery.astro or gallery/[slug].astro)"
      - "Wire the hardcoded `href='https://ig.me/m/studiobluemli'` on the detail page to `site.data.ig_dm_url`"
      - "Wire the hardcoded `mailto:hi@studiobluemli.com` on the detail page to `site.data.contact_email`"
      - "Convert Footer.jsx to take a `siteData` prop OR convert it to a `.astro` component that reads `getEntry('site','default')`; resolve the `studio_bluemli` vs `studiobluemli` handle drift in favor of the YAML"
      - "A smoke check that changing a value in `src/content/site/config.yaml` actually changes the deployed CTA href or email link"
deferred:
  - truth: "Site config (CNT-06) drives header/footer copy"
    addressed_in: "Phase 3"
    evidence: "Phase 3 SC1 reads: 'Landing page shows the hero, the next-upcoming pop-up callout, 3-6 featured gallery pieces, and the footer — all populated from content collections.' The phrase 'all populated from content collections' implies the `site` collection consumption is planned for Phase 3. NOTE: this is conservative — Phase 3's stated SC1 mentions hero/popup callout/featured-pieces/footer, but does NOT explicitly name 'site config' or the per-page contact CTA. The detail-page IG CTA hardcoded in Phase 2 is squarely within Phase 2's CNT-08 scope. Whether to defer the gap to Phase 3 is a HUMAN judgment call — see WARNING below."
human_verification:
  - test: "Open the built gallery index `/gallery` in a browser via `pnpm run preview` (or open `dist/client/gallery/index.html` directly) and confirm all 6 seeded pieces render with photo + name + price + 'Available' badge as visually polished cards, with no broken images or layout breakage on mobile (≤ 640px)."
    expected: "Six cards in a responsive grid, all photos load (cluster-{blush,cobalt,coral,lavender,saffron,sage}/hero-400.webp), each card shows a quiet 'Available' status indicator and is clickable to /gallery/<slug>."
    why_human: "Visual layout polish, image quality, and the 'editorial / brand-clean' feel can only be confirmed by human eye; greps and astro check cannot prove the visual SC1 result."
  - test: "Open `/gallery/cluster-blush` in a browser and confirm the IG CTA button (`Ask about this pair on Instagram`) is visible, prominent, and the inline `mailto:hi@studiobluemli.com` fallback is below it. Confirm the page is single-column and photo-forward at 640px max width."
    expected: "Hero photo (800w) at native aspect ratio, then name + price + status badge + description + CTA button + mailto fallback, all centered, 640px max width."
    why_human: "SC1's 'IG CTA' visibility, and the D-13 'mailto fallback never replaces the IG CTA' check, require human visual inspection."
  - test: "Run the SC2 contract: change `status` in any gallery index.md to `availabilty: sold` (deliberate typo), then run `pnpm exec astro check` and confirm the build fails with a clear Zod error naming `availabilty`. Restore the file."
    expected: "Build fails with `Unrecognized key 'availabilty'` (or similar). Note: this is already covered by `scripts/test-content-contracts.sh` which I ran successfully (it passed all SC2 + SC3 mutations)."
    why_human: "Already verified programmatically via contract test, but human confirmation of the error message clarity satisfies SC2."
  - test: "Run the SC3 contract: change `status: available` to `status: sold` in any gallery index.md, run `pnpm run prebuild:images && pnpm exec astro build`, and visually confirm the sold piece's grid card shows a quiet 'Sold' label in lavender and the detail page CTA text flips to 'This pair sold — DM me about something similar'."
    expected: "Grid card renders 'Sold' (not hidden); detail page CTA text reads 'This pair sold — DM me about something similar'. Already verified by `scripts/test-content-contracts.sh` SC3 mutation."
    why_human: "Visual badge appearance and CTA copy flip are best confirmed by human reading the rendered HTML; the automated test passed."
  - test: "Simulate the founder workflow: create a new branch on GitHub.com, drag a photo into `src/content/gallery/cluster-test/`, add an `index.md` with valid frontmatter, open a PR, and wait for the Cloudflare preview deploy to ship. Confirm the new piece appears at `/gallery/cluster-test`."
    expected: "PR preview shows the new piece on /gallery and /gallery/cluster-test within ~5 minutes."
    why_human: "The end-to-end SC1 workflow (founder + GitHub web UI + Cloudflare preview) requires a real PR and a real preview deploy — can only be confirmed by a human dry-run that the founder workflow promised by the phase goal actually works."
---

# Phase 2: Content Schema & Gallery — Verification Report

**Phase Goal:** Founder can add a gallery piece via the GitHub web UI and see it on a preview deploy within ~5 minutes — including the gallery grid card, the per-piece detail page with availability badge, and the "Ask about this piece on Instagram" CTA.

**Verified:** 2026-05-13T16:05:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (vs. ROADMAP Success Criteria)

| #   | Truth (Success Criterion)                                                                                                                                        | Status     | Evidence                                                                                                                                                                                                                                                                              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | SC1: Founder can drag a photo into `src/content/gallery/<slug>/`, fill frontmatter, open PR, see piece on preview's `/gallery` index and `/gallery/<slug>` detail | PARTIAL — VERIFIED for the routing/build layer | All 6 seeded pieces present at `src/content/gallery/cluster-{blush,cobalt,coral,lavender,saffron,sage}/index.md`. `pnpm exec astro build` prerenders `/gallery/index.html` + 6 `/gallery/cluster-*/index.html` files. Gallery index HTML contains 6 `<img src="/gallery/<slug>/hero-400.webp">` and 4 status labels. Detail page renders hero 800w + name + price + status + description + IG CTA + mailto fallback. **CNT-06 site-config consumption gap (BL-02) is a real SC1 sub-issue — see Gap 1 below.** |
| 2   | SC2: Typo in frontmatter (`availabilty: sold`) fails the build with a clear Zod error                                                                            | VERIFIED   | `src/content.config.ts` uses `.strict()` on all 3 collections. `scripts/test-content-contracts.sh` ran in ~30s with PASS on the SC2 mutation: astro check rejected `availabilty: sold` with a clear schema error. Verified live: contract test exited 0.                              |
| 3   | SC3: A sold piece renders with quiet editorial 'Sold' badge in the gallery grid (not hidden), remains in portfolio archive                                       | VERIFIED   | `scripts/test-content-contracts.sh` SC3 mutation flipped `cluster-blush` to `status: sold`, rebuilt, and asserted `Sold` label + D-11 CTA copy ('This pair sold — DM me about something similar') in the built HTML. CSS at gallery.astro:50 sets `.card-status.sold { color: var(--lavender-500) }`. |
| 4   | SC4: Each `/gallery/<slug>` page emits `<meta property="og:image" content="<absolute URL>">` inside `<head>`                                                       | VERIFIED   | Built HTML inspection: `dist/client/gallery/cluster-blush/index.html` `<head>` contains `<meta property="og:image" content="https://studiobluemli.com/gallery/cluster-blush/hero-800.webp">`. The `<slot name="head" />` in BaseLayout.astro:43 routes the slug page's `<meta slot="head">` correctly. |
| 5   | SC5: `CONTENT_EDITING.md` exists at repo root, GitHub UI flow in prose, "never delete, flip availability" section, zero `git`/`npm`/`cd` words                  | VERIFIED   | `CONTENT_EDITING.md` (170 lines) at repo root. Greps confirm: 0 occurrences of `git`/`npm`/`pnpm`/`node`/`cd`/`terminal` (word-boundary case-insensitive); 0 occurrences of `flower`/`petal`/`floral`/`bloom`/`blossom`; 0 exclamation marks; level-2 heading `## Never delete a piece (flip availability instead)` present at line 65. |

**Score:** 4/5 truths verified (SC1 partially verified — routing/build/render confirmed; site-config consumption gap is a real but arguably-deferrable SC1 sub-issue).

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Site config (CNT-06) drives header/footer copy on the rendered preview | Phase 3 (tentative) | Phase 3 SC1: "all populated from content collections" — implies site config consumption belongs to Phase 3. **HOWEVER, this is a conservative match — Phase 3's SC1 explicitly names hero/popup/featured-pieces/footer but does NOT name the detail-page IG CTA, which is squarely in Phase 2's CNT-08 scope.** Human judgment requested in the WARNING below. |

### Required Artifacts (Three Levels)

| Artifact                                          | Expected                                                | Status      | Details                                                                                            |
| ------------------------------------------------- | ------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `src/content.config.ts`                           | 3 strict Zod collections (gallery, popups, site)        | VERIFIED    | All 3 collections defined with `.strict()`. Imports `astro:content`, `astro/loaders`, `astro/zod` correctly. `hero: image()` (Outcome A from Task 0 probe). |
| `src/content/gallery/cluster-{6 slugs}/index.md`  | 6 valid frontmatter files                               | VERIFIED    | All 6 present with valid name/hero/price/status/description/featured/published_at. All `status: available` (see IN-01 — no non-default seed state). |
| `src/content/popups/.gitkeep`                     | Tracks empty popups directory                            | VERIFIED    | File exists at 0 bytes. Build emits `[WARN] No files found matching "*.md" in directory "src/content/popups"` (WR-03 from REVIEW) but doesn't error. |
| `src/content/site/config.yaml`                    | 7 site-wide config fields                                | VERIFIED    | All 7 fields present (note: file is `config.yaml` not `config.md` as Plan 01 specified — Plan 01 was rewritten during execution to `file('./src/content/site/config.yaml')`, see content.config.ts:62). |
| `src/layouts/BaseLayout.astro`                    | `<slot name="head" />` inside `<head>`                  | VERIFIED    | Slot at line 43, between Font preloads and `<style is:global>`. Built HTML proves slot routing works: og:image meta lands inside head. |
| `scripts/prebuild-images.mjs`                     | HEIC → WebP @ 3 widths + manifest + slug validation     | VERIFIED    | Script ran successfully: 18 WebP variants in `public/gallery/cluster-*/hero-{400,800,1600}.webp` + `_manifest.json` with `[w, h]` dimensions per slug per variant. |
| `package.json` + `pnpm-lock.yaml`                  | `sharp@^0.34.5`, `heic-convert@^2.1.0`, `prebuild:images` script | VERIFIED    | Script + both devDeps present.                                                                     |
| `.gitignore`                                      | `public/gallery/` excluded                              | VERIFIED    | Entry present at end of file; `git check-ignore` would confirm. |
| `.github/workflows/ci.yml`                        | Prebuild step BEFORE Typecheck step                     | VERIFIED    | Verified order: Install < Generate responsive WebP variants (prebuild) < Typecheck < Build.       |
| `src/pages/gallery.astro`                         | `getCollection('gallery')` + GalleryGrid + empty state | VERIFIED    | Uses `getCollection('gallery')` and sorts by `published_at` desc. Empty-state paragraph at lines 30-38 (LOW-4). |
| `src/pages/gallery/[slug].astro`                  | `getStaticPaths` + og:image + manifest dimensions      | VERIFIED    | Uses `getStaticPaths` over gallery collection; imports manifest; emits env-aware og:image via `<meta slot="head">`. |
| `src/components/design-skill/GalleryGrid.jsx`     | `<a>` link wrapper + per-status className + 240px       | VERIFIED    | Card uses `<a href={\`/gallery/\${piece.slug}\`}>`, `card-status ${piece.status}` className, minmax(240px, 1fr), `loading="lazy"`, `decoding="async"`. **WR-02 from REVIEW: `width={400} height={500}` hardcoded while manifest reports `[400, 533]` — slight CLS mismatch, not a goal blocker.** |
| `scripts/check-brand-rules.sh`                    | Rule 7 activated; Rule 1 catches `#FFF`                 | VERIFIED    | Rule 7 active (uncommented at line 114) scanning `src/content/` for `"Sample Piece"` / `^price: 0$`. Rule 1 uses `#[fF]{3}(?![0-9a-fA-F])`. |
| `scripts/test-content-contracts.sh`               | SC2 + SC3 mutate-build-assert-restore                   | VERIFIED    | Script runs in ~30s and passes both SC2 + SC3. |
| `CONTENT_EDITING.md`                              | Founder GitHub UI workflow guide                        | VERIFIED    | 170 lines; all required sections present; zero CLI/flower words; "Never delete" section labeled; uses `cluster-cobalt` worked example; HIGH-5 rename tip present; LOW-3 troubleshooting names `status`. |
| `.planning/REQUIREMENTS.md` CNT-03                | Updated to D-16/D-17 (singular hero + published_at)     | VERIFIED    | CNT-03 bullet matches D-16/D-17 wording. |
| `.planning/ROADMAP.md` Phase 2                    | 5 plans listed, `0/5` in progress table, SC5 amended    | VERIFIED    | Phase 2 lists all 5 plans across 3 waves; progress row shows `0/5`; SC5 narrative includes "screenshots deferred to first founder content-editing workflow review". |
| `.planning/phases/02-content-schema-gallery/02-CONTEXT.md` | D-18 recorded                                  | VERIFIED    | 4 occurrences of `D-18`; "Schema Adjustments to CNT-05" sub-heading present. |
| Phase 1 cleanup artifacts                         | ProductSheet.jsx deleted, sample-data.ts deleted        | VERIFIED    | All 3 files absent: `src/components/design-skill/ProductSheet.jsx`, `src/sample-data.ts`, `public/sample/*.svg`. |

### Key Link Verification

| From                                                    | To                                                       | Via                                                                    | Status        | Details                                                                                                                                                       |
| ------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/gallery.astro`                               | `src/content.config.ts` gallery collection               | `await getCollection('gallery')`                                       | WIRED         | Line 15 calls `getCollection('gallery')` and maps 6 entries.                                                                                                  |
| `src/pages/gallery/[slug].astro`                        | `src/content.config.ts` gallery collection               | `getCollection('gallery')` in `getStaticPaths`                          | WIRED         | Line 23 calls `getCollection('gallery')` and emits 6 static paths.                                                                                            |
| `src/pages/gallery/[slug].astro`                        | `public/gallery/_manifest.json`                          | `import manifestJson from '../../../public/gallery/_manifest.json'`     | WIRED         | Line 17 imports the manifest; line 39 reads `manifest[slug]?.['hero-800']` for width/height attrs.                                                            |
| `src/pages/gallery/[slug].astro`                        | `BaseLayout.astro <slot name="head" />`                  | `<meta slot="head" property="og:image" content={ogImageUrl} />`         | WIRED         | Built HTML proves the meta tag lands inside `<head>` not `<body>`.                                                                                            |
| `scripts/prebuild-images.mjs`                           | `src/content/gallery/<slug>/hero.*`                      | `readdir` + `HERO_REGEX` (case-insensitive)                            | WIRED         | Script runs and processes all 6 slugs.                                                                                                                        |
| `scripts/prebuild-images.mjs`                           | `public/gallery/<slug>/hero-{400,800,1600}.webp`         | `sharp().resize().webp().toFile()`                                     | WIRED         | 18 variants present on disk.                                                                                                                                  |
| `.github/workflows/ci.yml`                              | `scripts/prebuild-images.mjs`                            | `pnpm run prebuild:images`                                             | WIRED         | Step present in CI YAML at correct position.                                                                                                                  |
| **Any page**                                            | **`src/content.config.ts` site collection**              | **`getCollection('site')` / `getEntry('site', ...)`**                  | **NOT_WIRED** | **0 calls in `src/`. The `site` collection is defined and validated but never consumed. See Gap 1.**                                                            |
| `src/components/design-skill/Footer.jsx`                | `src/content/site/config.yaml` (ig_handle, contact_email) | (none — hardcoded)                                                     | NOT_WIRED     | Footer.jsx hardcodes `https://instagram.com/studio_bluemli` (drifted handle) and `mailto:hi@studiobluemli.com`. See Gap 1.                                     |
| `src/pages/gallery/[slug].astro`                        | `src/content/site/config.yaml` (ig_dm_url, contact_email) | (none — hardcoded)                                                    | NOT_WIRED     | Lines 90 + 92 hardcode the IG DM URL and email. See Gap 1.                                                                                                    |

### Data-Flow Trace (Level 4)

| Artifact                                          | Data Variable / Source                                                 | Produces Real Data                                                                                                | Status      |
| ------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------- |
| `src/pages/gallery.astro`                         | `pieces` ← `getCollection('gallery')` → sorted + mapped                | YES — 6 entries pulled from `src/content/gallery/cluster-*/index.md` flow into the rendered HTML.                  | FLOWING     |
| `src/pages/gallery/[slug].astro`                  | `entry` ← `getCollection('gallery')` (via getStaticPaths props)        | YES — entry data renders into HTML (name, price, status, description).                                            | FLOWING     |
| `src/pages/gallery/[slug].astro`                  | `manifest[slug]['hero-800']` ← `public/gallery/_manifest.json`         | YES — manifest data (e.g., `[800, 1067]`) is the source of width/height attrs. Build artifact verified on disk.    | FLOWING     |
| `src/pages/gallery/[slug].astro`                  | `ogImageUrl` ← `Astro.site` (production) — env-aware                    | YES — `Astro.site` is set to `https://studiobluemli.com`; built HTML contains absolute URL.                       | FLOWING     |
| `src/components/design-skill/GalleryGrid.jsx`     | `pieces` prop (passed from `gallery.astro`)                            | YES — props flow from gallery.astro's mapped `pieces` array.                                                       | FLOWING     |
| `src/components/design-skill/Footer.jsx`          | (would-be) site collection values                                       | **NO — Footer hardcodes IG handle + email. Site collection data does not flow to Footer.**                          | DISCONNECTED |
| `src/pages/gallery/[slug].astro` IG CTA / mailto  | (would-be) `site.data.ig_dm_url` / `site.data.contact_email`            | **NO — values hardcoded inline.**                                                                                  | DISCONNECTED |

### Behavioral Spot-Checks

| Behavior                                                    | Command                                                                         | Result                                                  | Status |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------- | ------ |
| Astro check passes with 0 errors                            | `pnpm exec astro check 2>&1 \| tail -5`                                          | `26 files: 0 errors, 0 warnings, 7 hints`               | PASS   |
| Astro build prerenders 6 detail pages                       | `pnpm exec astro build`                                                         | All 6 `/gallery/cluster-*/index.html` emitted           | PASS   |
| Prebuild produces 18 WebP variants                          | `find public/gallery -name "hero-*.webp" \| wc -l`                              | 18                                                      | PASS   |
| og:image meta lands inside `<head>`                         | `awk '/<head>/,/<\/head>/' dist/client/gallery/cluster-blush/index.html \| grep -c og:image` | 1                                                       | PASS   |
| Contract test SC2 + SC3                                     | `bash scripts/test-content-contracts.sh`                                        | `[SC2] PASS`, `[SC3] PASS`, file restored cleanly       | PASS   |
| Brand-check still passes                                    | `bash scripts/check-brand-rules.sh`                                             | `All brand rules pass` (Rule 1 skipped on macOS due to grep -P; CI Ubuntu validates) | PASS (CI authoritative) |
| Gallery grid HTML has 6 `<img>` tags with hero-400.webp     | `grep -o 'src="[^"]*hero-400.webp"' dist/client/gallery/index.html \| wc -l`    | 6                                                       | PASS   |

### Requirements Coverage

| Requirement | Source Plan              | Description                                                                            | Status      | Evidence                                                                                                              |
| ----------- | ------------------------ | -------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------- |
| CNT-01      | 02-01-PLAN.md            | 3 strict Zod content collections (gallery, popups, site)                               | SATISFIED   | content.config.ts has all 3 with `.strict()`                                                                          |
| CNT-02      | 02-01-PLAN.md, 02-04     | Per-slug folder layout `src/content/gallery/<slug>/index.md` with co-located photo     | SATISFIED   | 6 slug folders + 6 hero.heic files; glob loader pattern `*/index.md`                                                  |
| CNT-03      | 02-01-PLAN.md, 02-05     | Gallery schema: name/hero/price/status/description/featured/published_at               | SATISFIED   | Schema in content.config.ts matches D-16/D-17 narrative in REQUIREMENTS.md                                            |
| CNT-04      | 02-01-PLAN.md            | Pop-up files at `src/content/popups/YYYY-MM-DD-<slug>.md`                              | SATISFIED   | popups loader pattern `*.md`; `.gitkeep` keeps dir tracked (no popups yet — Phase 3 ships first one)                  |
| CNT-05      | 02-01-PLAN.md, 02-05     | Pop-up schema: name/date/end_date/start_time/end_time/tz/location/address/photos/link (description in body) | SATISFIED   | popups schema matches D-18; REQUIREMENTS.md CNT-05 narrative still aligned                                            |
| CNT-06      | 02-01-PLAN.md            | Site config file with tagline/contact_email/IG handle/IG DM URL/footer_text/OG defaults | **PARTIAL** | **File exists at `config.yaml` and is schema-validated, BUT no caller reads it. Mapped to SC1 in REQUIREMENTS.md traceability — "site config drives header/footer copy on the rendered preview". See Gap 1.** |
| CNT-07      | 02-04-PLAN.md            | `/gallery` index renders all pieces in responsive grid (2-col mobile, 3-col desktop)   | SATISFIED   | Grid renders 6 cards; 240px minmax (will likely give 2-col on mobile, 3-4 col on desktop)                             |
| CNT-08      | 02-04-PLAN.md            | `/gallery/<slug>` shows photo/name/price/availability/description + IG CTA              | SATISFIED   | Detail page renders all required fields + IG CTA + mailto fallback. **Note: IG CTA href is hardcoded — see Gap 1.**    |
| CNT-09      | 02-04-PLAN.md            | Per-piece og:image emits hero photo for IG/iMessage unfurls                            | SATISFIED   | Built HTML proves og:image meta inside `<head>` with absolute URL                                                     |
| CNT-10      | 02-01, 02-03, 02-04      | Quiet editorial availability badges (4 states)                                          | SATISFIED   | Status enum locked to 4 values; CSS contract in `gallery.astro` and `[slug].astro` ensures quiet-lavender for sold     |
| CNT-11      | 02-02-PLAN.md            | All product photography pre-optimized WebP at commit/CI time + passthroughImageService | SATISFIED   | Prebuild produces 18 WebPs; `astro.config.mjs` uses passthroughImageService (inherited from Phase 1)                  |
| CNT-12      | 02-05-PLAN.md            | CONTENT_EDITING.md walks GitHub web UI flow with zero CLI                              | SATISFIED   | All SC5 greps pass                                                                                                    |
| PAG-09      | 02-04-PLAN.md            | All product images have alt text                                                       | SATISFIED   | GalleryGrid img has `alt={piece.name}`; detail page img has `alt={name}`                                              |

**Orphaned requirements:** None — every Phase 2 requirement ID is claimed by a plan.

### Anti-Patterns Found

| File                                                     | Line  | Pattern                                                                                                   | Severity   | Impact                                                                                                                                                                       |
| -------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/design-skill/Footer.jsx`                 | 23    | `href="https://instagram.com/studio_bluemli"` — hardcoded handle drifts from YAML `studiobluemli`         | Blocker    | Two-source-of-truth bug. CNT-06's promise that the founder can edit `config.yaml` to change the IG handle is broken. See Gap 1.                                              |
| `src/components/design-skill/Footer.jsx`                 | 25    | `href="mailto:hi@studiobluemli.com"` — hardcoded                                                          | Warning    | Per BL-02. Founder cannot change the contact email by editing YAML.                                                                                                          |
| `src/pages/gallery/[slug].astro`                         | 90,92 | IG DM URL + mailto hardcoded                                                                              | Warning    | Same root cause as Gap 1 — site collection not consumed.                                                                                                                     |
| `scripts/prebuild-images.mjs`                            | 30,122| `MANIFEST_PATH = './public/gallery/_manifest.json'`                                                       | Warning    | BL-01 from REVIEW: manifest leaks publicly to `dist/client/gallery/_manifest.json` — internal build state on the public deploy. Not a SC blocker, but a real security/hygiene concern. |
| `src/pages/gallery/[slug].astro`                         | 39    | `manifest[slug]?.['hero-800'] ?? [800, 1000]` — silent fallback hides missing-prebuild bugs               | Info       | WR-05 from REVIEW. Would surface as bogus CLS rather than a build failure.                                                                                                   |
| `src/components/design-skill/GalleryGrid.jsx`            | 53    | `width={400} height={500}` — hardcoded, but manifest reports `[400, 533]`                                  | Info       | WR-02. Minor CLS bump (~33px per card). Layout looks correct due to `aspect-ratio: 4/5; object-fit: cover`.                                                                  |
| `src/pages/gallery/[slug].astro`                         | 46-49 | `Astro.site?.toString().replace(/\/$/, '')` — only strips trailing slash on the `Astro.site` branch       | Info       | WR-01. If a future CF_PAGES_URL has a trailing slash, og:image emits `//`.                                                                                                   |
| Built output: `dist/client/gallery/_manifest.json`        | n/a   | Internal manifest publicly served                                                                          | Warning    | BL-01 from REVIEW.                                                                                                                                                           |
| All 6 seed `index.md` files                              | n/a   | All have `status: available`; no piece in `sold`/`one-of-one`/`reserved` state                             | Info       | IN-01 from REVIEW. The visual SC3 ("sold piece in grid") cannot be visually confirmed against the static seed corpus — only via the contract-test mutation, which passes.    |
| Build emits `[WARN] [glob-loader] No files found matching "*.md" in directory "src/content/popups"` | n/a | Empty popups dir, glob warning | Info | WR-03 from REVIEW. Not a build failure; first popup ships in Phase 3. |
| `src/content.config.ts`                                  | 55,65,67 | `z.string().email()` / `z.string().url()` deprecation hints                                            | Info       | IN-03 from REVIEW. Zod 4 prefers `z.email()` / `z.url()`. Not blocking; 0 errors / 0 warnings overall.                                                                       |
| `scripts/prebuild-images.mjs`                            | 38,61,78,82 | `process.exit(1)` — `tsconfig.json` includes `scripts/*.mjs` without `@types/node`, so 4 hints emit | Info       | IN-04 from REVIEW. Not blocking; emits as `hint`-level warnings only.                                                                                                        |

### Human Verification Required

See YAML frontmatter `human_verification:` section for 5 items the user should run manually:

1. Visual confirmation of `/gallery` rendering (6 cards, mobile responsive).
2. Visual confirmation of `/gallery/cluster-blush` (IG CTA prominent, mailto fallback below).
3. SC2 typo reject (covered programmatically — confirm error-message clarity).
4. SC3 sold-badge visual (covered programmatically — confirm visual polish).
5. **End-to-end SC1 dry-run**: actually open a PR via GitHub web UI, drop a photo, edit frontmatter, and confirm the Cloudflare preview deploy shows the new piece within ~5 minutes. **This is the canonical SC1 test and cannot be confirmed from static code analysis alone.**

### Gaps Summary

**Gap 1 (BLOCKER candidate):** The `site` content collection at `src/content/site/config.yaml` is defined, validated, and seeded with all 7 fields (tagline, contact_email, ig_handle, ig_dm_url, footer_text, og_title, og_description) — but **no page or component reads it**. Every value the founder would want to edit via `config.yaml` is hardcoded somewhere else:

- `src/components/design-skill/Footer.jsx` hardcodes `https://instagram.com/studio_bluemli` (with underscore, drifting from YAML's `studiobluemli` without one) and `mailto:hi@studiobluemli.com`.
- `src/pages/gallery/[slug].astro` hardcodes `https://ig.me/m/studiobluemli` and `mailto:hi@studiobluemli.com`.

The schema gives false reassurance: a founder edit to the YAML validates, the build succeeds, but nothing on the deployed site changes. **The `studio_bluemli` vs `studiobluemli` drift means the data file and the rendered site disagree right now — they cannot both be correct.** This breaks the implicit phase value statement ("the founder can add or remove gallery pieces and pop-up events without writing code") for the contact/IG fields covered by CNT-06.

REQUIREMENTS.md maps CNT-06 to "SC1 (site config drives header/footer copy on the rendered preview)" — so under a strict reading, Gap 1 is a Phase 2 SC1 failure.

**Mitigating factor (why this is escalated to human judgment, not auto-failed):** Phase 3 SC1 says "all populated from content collections" and ships PAG-01 (landing hero + next-popup callout + featured pieces + footer). It is plausible the planner intended Phase 3 to wire up the `site` collection alongside the popups collection — the Phase 2 plans never explicitly required `getCollection('site')` to be called by a page (none of the 5 plans' `must_haves.truths` mention site-config consumption). This is consistent with the BL-02 finding in the code review: the schema landed in Phase 2 (CNT-06 file scope), but consumption may be Phase 3 work.

**However:** The Phase 2 detail page (`gallery/[slug].astro`) was newly written this phase and contains hardcoded IG/mailto strings. Those are squarely Phase 2 code. If they had used `getEntry('site', 'default')` directly, both Gap 1 and BL-02 would be closed within Phase 2 scope at very low marginal cost.

**The escalation question for the human verifier:** Is Gap 1 a Phase 2 blocker (because CNT-06 is mapped to SC1 in REQUIREMENTS.md and because Phase 2 code is the place hardcoding IG/mailto) — or is it acceptable to defer site-config wiring to Phase 3's "populated from content collections" SC1?

**Other findings (non-blocking):**
- BL-01: The dimensions manifest leaks publicly into `dist/client/gallery/_manifest.json`. Not a SC blocker but a real hygiene problem.
- WR-02: GalleryGrid hardcodes `height={500}` while manifest records `[400, 533]` — small CLS bump.
- WR-01: og:image base URL has a trailing-slash bug for CF_PAGES_URL / PUBLIC_SITE_URL branches.
- IN-01: All 6 seed pieces are `status: available`; SC3 sold rendering is only covered by the mutation contract test, not the static seed corpus.
- WR-03: Empty popups dir emits `[WARN]` on every build.

---

_Verified: 2026-05-13T16:05:00Z_
_Verifier: Claude (gsd-verifier)_
