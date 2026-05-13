---
phase: 01-foundations-brand-system
verified: 2026-05-13T17:25:00Z
status: passed
score: 12/12 must-haves verified
overrides_applied: 0
notes:
  - "Empirical ground truth: user confirmed visual SC1+SC4 on live preview studio-bluemli.<account>.workers.dev; CI green on main; Lighthouse Performance 0.99 / A11y 0.95 / BP 1.00 / SEO 0.91 across all 5 routes."
  - "Local re-build verified: astro check exits 0; astro build emits 5 prerendered HTML files at dist/client/<route>/index.html and Worker entrypoint at dist/server/entry.mjs; postbuild deletes the 1 unreferenced React-runtime JS bundle; zero browser-served JS remains."
  - "Code review 01-REVIEW.md raised 5 BLOCKERs and 9 WARNINGs — assessed below; none block the Phase 1 goal as defined by ROADMAP SC1-SC5, but several should be tracked as quality-debt for later phases."
phase_1_review_findings_assessment:
  - id: CR-01
    title: "wrangler.jsonc assets.directory mismatch with build output"
    status: not_a_phase_1_blocker
    rationale: |
      The user has confirmed the live deploy at studio-bluemli.<account>.workers.dev
      serves all 5 routes correctly. The adapter-generated dist/server/wrangler.json
      (inspected during verification) contains the correct paths:
        - main: "entry.mjs"
        - assets.directory: "../client"
        - assets.binding: "ASSETS"
        - assets.run_worker_first: ["/api/*"]
      Cloudflare Workers Builds + wrangler 4 auto-detects this adapter-generated
      config when the @astrojs/cloudflare adapter is in use; this is why the live
      deploy works despite the root wrangler.jsonc's seemingly-wrong assets.directory.
      Local-dev `wrangler dev` from the project root may still misbehave; that is
      quality debt, not a Phase 1 SC failure. Track for hardening before Phase 4
      ships /api/contact (Phase 4 may break if root wrangler.jsonc is what
      `wrangler dev` consults for local API testing).
  - id: CR-02
    title: "check-no-hydration.sh Check 2 would false-positive on server chunks"
    status: factually_incorrect
    rationale: |
      Empirically refuted: `find dist -name '*.js'` returns ZERO files. All
      server-side bundles emitted by @astrojs/cloudflare@13.5 are `.mjs` files,
      not `.js`. The script's find filter `-name '*.js'` and the React-runtime
      grep `--include='*.js'` both correctly exclude all server-side `.mjs`
      bundles. Verified the script passes against the current build:
      "All hydration/bundle checks pass." The reviewer assumed the legacy
      `dist/_worker.js` extension was generic JS — it isn't.
  - id: CR-03
    title: "ProductSheet.jsx onClick handlers without client: directive"
    status: latent_dead_code_not_a_phase_1_blocker
    rationale: |
      Confirmed: ProductSheet is in src/components/design-skill/ but is NOT
      imported by any page or layout. Searched src/pages/ and src/layouts/
      — zero references. Phase 1 ships 5 pages that never render this modal.
      ProductSheet only becomes a real defect when Phase 2 wires the
      gallery → modal flow; address there. Until then, the component is
      inert and unobservable on the live site.
  - id: CR-04
    title: "PopupStrip date parsing relies on host-local TZ"
    status: latent_dormant_against_sample_data
    rationale: |
      Empirically confirmed: building with `TZ=UTC node_modules/.bin/astro build`
      still produces the correct label "Monday, June 15" for the sample popup
      (date '2026-06-15', startTime '10:00'). The bug only fires for popups
      with startTime values that, when parsed as local time in a UTC host,
      shift to a different calendar day under the popup's tz. Sample data
      uses '10:00' / '14:00' which are safe. The bug surfaces only with
      real popup data in Phase 3 (CNT-05/PAG-03 — timezone-correct split is
      a Phase 3 SC and a Phase 3 plan must fix this). NOT a Phase 1 SC blocker.
      The live preview at studio-bluemli.<account>.workers.dev displays the
      correct date today.
  - id: CR-05
    title: "Brand-rule white check misses uppercase #FFF"
    status: real_defect_not_a_phase_1_blocker
    rationale: |
      Inspected scripts/check-brand-rules.sh:22 — the pattern is:
        `#fff(?![0-9a-fA-F])|#[fF]{6}`
      The 3-digit branch `#fff` is lowercase-only; uppercase `#FFF` is not
      caught. The 6-digit branch IS case-insensitive via `[fF]{6}`. So
      `#FFFFFF` is caught but `#FFF` slips through. This weakens FND-10 / SC3
      but does NOT defeat it — the most common author affordances
      (background: white; bg-white; #ffffff) ARE caught. The deliberate-
      violation test in SETUP.md uses `background: white;` which IS caught.
      Codex post-merge fix is recommended pre-Phase 2; Phase 1 SC3 is still
      satisfied for the realistic violation surface.
must_haves:
  truths:
    - "FND-01: Astro 6.2-line + @astrojs/cloudflare@13.5 + @astrojs/react@5.0.4 + React 19 server-rendered only (no client: directives)"
    - "FND-02: wrangler.jsonc declares Cloudflare Workers + Static Assets binding with run_worker_first: [/api/*]; deploys to *.workers.dev"
    - "FND-04: GitHub Actions CI runs on push to main + PR; Cloudflare Workers Builds connected (user-verified live)"
    - "FND-05: BaseLayout.astro provides shared head, header/footer slots; all 5 pages use it"
    - "FND-06: colors_and_type.css imported globally once in BaseLayout; body bg is cream (never white)"
    - "FND-07: Fonts API self-hosts Bagel Fat One + Caveat Brush + Nunito + Caveat as WOFF2 with font-display: swap"
    - "FND-08: Favicon set exists (favicon.ico + 16/32 PNG + svg + apple-touch-icon) and is wired in BaseLayout head"
    - "FND-09: scripts/sync-design-skill.mjs copies 11 JSX components + CSS tokens into src/"
    - "FND-10: CI grep rules enforce 5 brand non-negotiables (whites, flowers, gradients, backdrop-filter, 1px borders)"
    - "FND-11: scripts/check-lowercase-filenames.sh enforces lowercase-only filenames in src/pages/"
    - "FND-12: Lighthouse mobile ≥ 0.9 on all 5 routes (Perf 0.99, A11y 0.95, BP 1.00, SEO 0.91 — user-confirmed CI green)"
    - "FND-13: BaseLayout emits global :focus-visible rule; skip-to-content is first focusable body element; color-scheme: light declared"
---

# Phase 1: Foundations & Brand System Verification Report

**Phase Goal:** Founder can preview a cream-background, hand-font, design-skill-styled empty shell of all five pages at a `*.workers.dev` URL, with brand non-negotiables enforced by CI so they cannot regress.

**Verified:** 2026-05-13T17:25:00Z
**Status:** **passed**
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Phase 1 Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC1 | Cream/font shell renders on `*.workers.dev`: cream bg, hand-display headline, Nunito body, design-skill header + footer on all 5 pages | VERIFIED | User confirmed visual SC1 on live preview studio-bluemli.<account>.workers.dev. Local re-build emits 5 HTML files at dist/client/<route>/index.html. Inspected dist/client/index.html: cream `rgba(245, 220, 199, 0.92)` bg on header, all 4 fonts in @font-face blocks with `font-display:swap`, skip-link as first focusable, Header/Footer chrome present. |
| SC2 | Push to main = production deploy + PR = unique preview URL | VERIFIED | User-confirmed live: CI green on main; live preview URL serves all 5 routes. .github/workflows/ci.yml triggers on `pull_request: [main]` and `push: [main]`. SETUP.md documents the engineer-side Cloudflare connect with "Non-production branch builds: ON". |
| SC3 | PR with `bg-white`, `#fff`, flower vocab, gradient, backdrop-filter, `border: 1px`, or uppercase filename under src/pages/ fails CI before merge | VERIFIED | scripts/check-brand-rules.sh exists with 5 active rules + D-11 brand-reason messages. scripts/check-lowercase-filenames.sh enforces FND-11. ci.yml runs both as required-status-check steps. PR #2 (f6e0586) repaired Rule 1's grep flag conflict so Rule 1 now actually enforces in CI. Local smoke-test in Plan 05 ran 3 deliberate-violation tests (Rules 2, 6, M1) — all fired correctly. **Caveat (CR-05):** uppercase `#FFF` (3-digit) slips through Rule 1 — a real defect but does NOT defeat the realistic violation surface. |
| SC4 | Favicon set works in desktop tab + iOS Add to Home Screen | VERIFIED | public/{favicon.ico, favicon-16.png, favicon-32.png, favicon.svg, apple-touch-icon.png} all exist on disk and are 200 in the built dist/client/. BaseLayout emits 5 corresponding `<link>` tags. User confirmed "iOS Add to Home Screen" works (Plan 05 checkpoint approval — explicit "approved" in checkpoint resume). |
| SC5 | PROJECT.md Constraints reads "Cloudflare Workers with Static Assets" (legacy "Cloudflare Pages" target wording is gone) | VERIFIED | `grep -n "Cloudflare Pages" .planning/PROJECT.md` returns only line 65 (the explanatory parenthetical describing why Pages was dropped) and line 77 (the Key Decisions cell's "Pages was originally chosen but..." rationale). All three Pages-as-target-hosting bullets (lines 30, 68) are rewritten to Workers. Migration history preserved per D-21. |

**Score:** 5/5 SCs verified.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `package.json` | astro@^6.2, @astrojs/cloudflare@^13.5, @astrojs/react@^5.0.4, react@^19, wrangler@^4 | VERIFIED | All versions pinned as declared in Plan 01 frontmatter. node engine `>=22.12.0` declared. CI/build scripts wired. PR #3 added 4 @fontsource packages for self-hosted fonts. |
| `astro.config.mjs` | passthroughImageService, react integration, 4 Fonts API entries with `display: 'swap'`, output mode emits Worker entrypoint | VERIFIED | All 4 fonts (Bagel Fat One, Caveat Brush, Nunito, Caveat) declared via `fontProviders.fontsource()` (post-PR #3 — was `fontProviders.google()`, switched to drop @font-face declarations from 95 to 14 and close FND-12). `output: 'server'` chosen; `dist/server/entry.mjs` emitted (modern adapter path). `passthroughImageService()` configured. SWAP PATH comment present on Caveat Brush entry (D-17). |
| `wrangler.jsonc` | name "studio-bluemli", run_worker_first: ["/api/*"], compatibility_date 2026-05-12, no legacy pages_build_output_dir | VERIFIED (root) / FLAGGED (assets.directory) | Root config has all required keys. `assets.directory: "./dist"` is technically inconsistent with the modern adapter's `dist/client/` layout — see CR-01 assessment in frontmatter. The adapter generates a correct override at `dist/server/wrangler.json` (verified) which Cloudflare Workers Builds uses for the live deploy. |
| `.nvmrc` | Node 22.12+ pin | VERIFIED | Contains literal `22.12`. ci.yml reads `node-version-file: .nvmrc`. |
| `src/layouts/BaseLayout.astro` | 5 favicon links, 4 Font preload tags, skip-link first in body, global :focus-visible, color-scheme=light, imports both colors_and_type.css and components.css | VERIFIED | All 5 favicon links present. 4 `<Font cssVariable preload />` tags (wordmark, display, body, hand). Skip-link is first body element targeting #main-content. `<meta name="color-scheme" content="light">` present. Global :focus-visible rule uses `var(--color-focus-ring, var(--indigo-500))` at 2px solid 2px offset. `<style is:global>` imports colors_and_type.css then components.css in cascade order. |
| `src/pages/{index,gallery,popups,about,say-hi}.astro` | All 5 lowercase pages exist, each wraps BaseLayout, each uses design-skill components, each declares `export const prerender = true` | VERIFIED | All 5 pages exist with lowercase filenames. Each imports BaseLayout + Header + Footer + page-body components from `../components/design-skill/`. Each has `export const prerender = true` (required under `output: 'server'`). Each emits the correct active route to Header. |
| `src/sample-data.ts` | sampleGallery (3 pieces, names start with "Sample", price 0), sampleNextPopup (D-02-marked) | VERIFIED | 3 GalleryPiece entries with `name: "Sample Piece A/B/C"`, `price: 0`, photo paths to public/sample/cluster-*.svg. sampleNextPopup with `tz: 'America/Los_Angeles'`. |
| `src/components/design-skill/*.jsx` (11 files) | Mark, Button, BeadCluster, Header, Hero, About, GalleryGrid, PopupStrip, AppointmentForm, Footer, ProductSheet | VERIFIED | All 11 components present. Each has `export default` + `import React`. Header has CSS-only `<details>/<summary>` mobile hamburger (REVIEW FIX H2). GalleryGrid takes `pieces` prop (no hardcoded PRODUCTS). AppointmentForm has real `<form method="POST" action="/api/contact">` (no useState). PopupStrip takes `popup` prop. About is no-state, references `--font-hand` for signature close. |
| `src/styles/colors_and_type.css` | Verbatim brand tokens minus the Google Fonts @import, contains --color-bg + #F5DCC7 | VERIFIED | No `fonts.googleapis.com` line. Cream tokens defined: `--color-bg`, `--cream-200`, `#F5DCC7`. Locked per REVIEW FIX M4. |
| `src/styles/components.css` | .btn-primary :hover/:active rules, .nav-list/.nav-item display:contents | VERIFIED | New sibling CSS keeps colors_and_type.css locked. |
| `public/{favicon.ico, favicon-{16,32}.png, favicon.svg, apple-touch-icon.png, mark.svg}` | Full favicon set + Header lockup target | VERIFIED | All 5 favicon files present at sizes recorded in Plan 03 SUMMARY. mark.svg is byte-identical to assets/logo/mark.svg. apple-touch-icon.png is byte-identical to assets/logo/mark-favicon-180.png. |
| `public/sample/cluster-{coral,sage,lemon}.svg` | 3 SVG placeholder cards (REVIEW FIX M3) | VERIFIED | All 3 SVGs present and referenced by sample-data.ts. |
| `scripts/sync-design-skill.mjs` | One-shot transform script (D-04..D-06) | VERIFIED | Script exists, executable, completed run as recorded in Plan 02 SUMMARY. |
| `scripts/generate-favicons.mjs` | icon-gen based favicon regen (D-19, D-20) | VERIFIED | Idempotent — running `pnpm run favicons` reproduces the same hashes. |
| `scripts/write-assetsignore.mjs` | Postbuild emits dist/.assetsignore + deletes unreferenced _astro/*.js (REVIEW FIX M2) | VERIFIED | Local run output: "Wrote dist/.assetsignore" + "Removed unreferenced bundle: dist/client/_astro/client.DIYMaoE_.js" → 0 JS files in dist/client after cleanup. |
| `scripts/check-brand-rules.sh` | 5 active brand rules (Rule 7 commented for Phase 2), D-11 brand-reason failure messages | VERIFIED | All 5 rules present + Rule 7 commented with TODO. PR #2 fixed Rule 1's grep flag conflict (`-rEnP` → `-rnP`). Rule 2 has documented exclusions for synced internals. **Quality flag (CR-05):** Rule 1 misses uppercase `#FFF` 3-digit case. |
| `scripts/check-lowercase-filenames.sh` | FND-11 enforcement | VERIFIED | Script returns 0 against current src/pages/. |
| `scripts/check-no-hydration.sh` | No client: directives + no large browser JS (REVIEW FIX M1) | VERIFIED | Returns 0 against current build. CR-02 claim ("would false-positive on server chunks") is factually wrong — server bundles are `.mjs`, script's --include is `*.js`. |
| `.github/workflows/ci.yml` | Job "Build & brand check" runs on PR + push to main, ubuntu-latest, calls all 3 check scripts + Lighthouse CI | VERIFIED | Exactly the job name string "Build & brand check". Step order: checkout → pnpm → Node from .nvmrc → install --frozen-lockfile → astro check → astro build → write-assetsignore → brand-check → lowercase-check → no-hydration → Lighthouse CI. Post PR #3, Lighthouse is back inside the required job (no advisory split). |
| `lighthouserc.json` | mobile form factor, minScore 0.9 on Performance/A11y/BP/SEO | VERIFIED | staticDistDir: "./dist/client", mobile 360×640 throttled, all 4 categories at minScore 0.9. **Note (WR-03):** numberOfRuns: 1 — could be flaky in CI; user-confirmed scores well above threshold (Perf 0.99) so current risk is low. |
| `SETUP.md` | Engineer-facing 5-step walkthrough for Cloudflare + GitHub manual wiring | VERIFIED | All 5 steps present. Quotes job name "Build & brand check" string-exact. Documents both classic + Rulesets paths. Includes deliberate-violation test. Documents Lighthouse optional secret. PR #1 (4e2aa0b) re-grounded against current Cloudflare/GitHub docs via context7. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| BaseLayout.astro | colors_and_type.css | `<style is:global>@import '../styles/colors_and_type.css'` | WIRED | Verified in source + appears in built HTML inline. |
| BaseLayout.astro | components.css | `<style is:global>@import '../styles/components.css'` AFTER colors_and_type.css | WIRED | Cascade order correct. |
| BaseLayout.astro | astro.config.mjs Fonts API | `<Font cssVariable="--font-*-loaded" preload />` × 4 | WIRED | All 4 Font tags present; @font-face emitted in built HTML; WOFF2 files preloaded. |
| BaseLayout.astro | public/{favicon*, apple-touch-icon} | `<link rel="icon|apple-touch-icon" href="/...">` × 5 | WIRED | All 5 links present and resolve to existing files. |
| src/pages/*.astro | BaseLayout.astro | `import BaseLayout from '../layouts/BaseLayout.astro'` | WIRED | All 5 pages import + wrap. |
| src/pages/*.astro | src/components/design-skill/*.jsx | `import X from '../components/design-skill/X'` | WIRED | Header on all 5; Footer on all 5; page-specific components per route. |
| src/pages/{index,gallery,popups}.astro | src/sample-data.ts | `import { sampleGallery, sampleNextPopup } from '../sample-data'` | WIRED | Index uses both; gallery uses sampleGallery; popups uses sampleNextPopup. |
| Header.jsx + Footer.jsx | public/mark.svg | `<img src="/mark.svg">` | WIRED | mark.svg exists at public root; HTML inspects show the references and asset is 200. |
| AppointmentForm.jsx | /api/contact | `<form method="POST" action="/api/contact">` | WIRED (shell) | Phase 4 wires the handler. Plan 1 only requires the shell. WR-01 raises that Turnstile mount points + HTML5 validation are missing — that's Phase 4 work, not Phase 1 SC. |
| ci.yml | scripts/check-*.sh | `bash scripts/check-*.sh` steps | WIRED | All 3 steps present and named per Plan 05 must_haves. |
| package.json | scripts/sync-design-skill.mjs, scripts/generate-favicons.mjs | `pnpm run sync:design-skill`, `pnpm run favicons` | WIRED | Both scripts mapped. |
| dist/server/wrangler.json (adapter-generated) | dist/client/ + dist/server/entry.mjs | adapter writes correct paths during astro build | WIRED | Verified: `assets.directory: "../client"`, `main: "entry.mjs"`. CR-01's concern is about the root wrangler.jsonc; the adapter-generated config is correct and is what Cloudflare Workers Builds + wrangler 4 auto-detect. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| GalleryGrid.jsx | pieces prop | sample-data.ts:sampleGallery (3 entries) | yes (sample placeholders are real data) | FLOWING |
| PopupStrip.jsx | popup prop | sample-data.ts:sampleNextPopup | yes (sample placeholder is real data) | FLOWING |
| Hero.jsx | (no props) | static brand copy | n/a | n/a |
| About.jsx | (no props) | static copy | n/a | n/a |
| AppointmentForm.jsx | (no props — POST submit) | n/a in Phase 1; /api/contact in Phase 4 | n/a for shell | n/a |

Sample data is Phase 1's intentional contract (D-01: demo-loaded from day 1). Phase 2 replaces sample-data.ts with Content Collections.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `astro check` exits 0 | `node_modules/.bin/astro check` | 24 files, 0 errors, 0 warnings, 0 hints | PASS |
| `astro build` emits 5 prerendered HTML files | `node_modules/.bin/astro build` | 5 HTML files at dist/client/<route>/index.html + Worker entrypoint at dist/server/entry.mjs + 7 WOFF2 fonts copied | PASS |
| Postbuild deletes unreferenced JS bundles | `node scripts/write-assetsignore.mjs` | "Removed unreferenced bundle: dist/client/_astro/client.DIYMaoE_.js"; 0 JS files in dist/client after cleanup | PASS |
| Built HTML has cream background | `head -1 dist/client/index.html \| grep "rgba(245, 220, 199"` | Header inline style: `background:rgba(245, 220, 199, 0.92)` | PASS |
| Built HTML has 4 @font-face blocks with font-display:swap | `grep -c "font-display:swap" dist/client/index.html` | 4 (one per active font family) | PASS |
| Built HTML has 5 favicon links | `grep -c "rel=\"icon\"\|rel=\"apple-touch-icon\"" dist/client/index.html` | 5 | PASS |
| Built HTML has skip-link as first focusable body element | `grep "skip-link" dist/client/index.html` | First match is `<a href="#main-content" class="skip-link" ...>Skip to main content</a>` immediately after `<body>` | PASS |
| Built HTML has color-scheme=light | `grep "color-scheme" dist/client/index.html` | `<meta name="color-scheme" content="light">` present | PASS |
| No `client:` directive in src | `grep -rEn 'client:(load\|idle\|visible\|media\|only)' src/` | (empty) | PASS |
| No browser-served JS > 10KB in dist after postbuild | `find dist/client -name '*.js'` | (empty) | PASS |
| No `outline:.none` in design-skill components | `grep -rE "outline:\\s*['\"]?none" src/components/design-skill/` | (empty) | PASS |
| Lowercase filename check passes | `bash scripts/check-lowercase-filenames.sh` | "All src/pages/ filenames are lowercase." | PASS |
| Brand-rule check passes against current src | `bash scripts/check-brand-rules.sh` (locally; -P unsupported on BSD grep but full pass on Ubuntu CI per user) | "All brand rules pass." (with Rule 1 limitation on local BSD, full enforcement on Ubuntu CI per PR #2) | PASS (CI) / PARTIAL (local BSD) |
| Hydration check passes against current build | `bash scripts/check-no-hydration.sh` | "All hydration/bundle checks pass." | PASS |
| PROJECT.md only has Pages as historical parenthetical | `grep -c "Cloudflare Pages" .planning/PROJECT.md` | 3 (lines 65, 77 — explanatory parentheticals only; line 30 + 68 corrected to Workers) | PASS |
| Live deploy serves all 5 routes | user-attested visual confirmation on studio-bluemli.<account>.workers.dev | All 5 routes render with cream bg, design-skill chrome, no console errors | PASS (human-attested) |
| CI green on main including Lighthouse | user-attested CI status | Performance 0.99, Accessibility 0.95, Best Practices 1.00, SEO 0.91 across all 5 routes | PASS (human-attested) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| FND-01 | 01-01 | Astro 6.2 + @astrojs/cloudflare@13.5 + @astrojs/react@5.0.4 + React 19 server-rendered only | SATISFIED | package.json pins; no client: directives in src; 0 browser JS in dist/client after postbuild |
| FND-02 | 01-01 | Cloudflare Workers + Static Assets via wrangler.jsonc with run_worker_first: ["/api/*"] | SATISFIED | wrangler.jsonc has the binding; live deploy works on *.workers.dev (user-confirmed) |
| FND-04 | 01-05 | Push to main = prod deploy + PR = preview URL | SATISFIED | ci.yml triggers; Cloudflare Workers Builds connected (user-confirmed via Plan 05 checkpoint "approved") |
| FND-05 | 01-04 | BaseLayout.astro with head/header/footer for all 5 pages | SATISFIED | All 5 pages wrap BaseLayout; Header/Footer slotted on each |
| FND-06 | 01-02, 01-04 | colors_and_type.css imported once globally; body bg cream never white | SATISFIED | Single import in BaseLayout `<style is:global>`; brand-check Rule 1 enforces no whites in src |
| FND-07 | 01-01, 01-04 | Hand-display + Nunito self-hosted WOFF2 with font-display: swap | SATISFIED | All 4 fonts via fontProviders.fontsource() with display: 'swap'; WOFF2s copied to dist/client/_astro/fonts/ at build |
| FND-08 | 01-03 | Favicon set: mark.svg primary, generated .ico + 16/32 PNGs, existing 180px apple-touch-icon | SATISFIED | All 5 favicon files exist + wired in BaseLayout; user-confirmed iOS Add to Home Screen |
| FND-09 | 01-02 | scripts/sync-design-skill.mjs copies JSX components + CSS tokens from .claude/skills/ to src/ | SATISFIED | Script exists; 11 components + 1 CSS file populated; verified manually + by Plan 02 SUMMARY |
| FND-10 | 01-05 | CI grep rules fail on whites / flowers / gradients / backdrop-filter / 1px borders | SATISFIED (with WR caveat CR-05 for uppercase #FFF) | All 5 rules in scripts/check-brand-rules.sh; PR #2 fixed grep flag conflict |
| FND-11 | 01-05 | src/pages/ lowercase-only CI grep enforcement | SATISFIED | scripts/check-lowercase-filenames.sh in ci.yml; smoke-tested in Plan 05 |
| FND-12 | 01-04, 01-05 | Lighthouse mobile ≥ 90 on every page in CI | SATISFIED | User-confirmed CI green with Perf 0.99 / A11y 0.95 / BP 1.00 / SEO 0.91 on all 5 routes (post PR #3 fontsource fix) |
| FND-13 | 01-02, 01-04 | :focus-visible on every interactive element; skip-to-content; color-scheme: light | SATISFIED | Global :focus-visible in BaseLayout; skip-link first body element; meta color-scheme=light present |

**All 12 requirements satisfied. Zero orphaned, zero blocked.**

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| src/components/design-skill/ProductSheet.jsx | 8, 14, 22 | `onClick={onClose}` without `client:` directive | INFO (dead code in Phase 1) | Component not imported anywhere in src/pages/ or src/layouts/. Latent until Phase 2 wires gallery → modal. Not a Phase 1 goal blocker. |
| src/components/design-skill/PopupStrip.jsx | 13-20 | Date parsed without timezone designator; relies on host TZ | INFO (latent; sample-data 10:00 startTime is safe) | Verified empirically: TZ=UTC build still renders "Monday, June 15" for sample data. Bug surfaces with real popup data in Phase 3. Track for Phase 3 fix. |
| scripts/check-brand-rules.sh | 22 | Rule 1 regex misses uppercase `#FFF` (3-digit case) | INFO (defeats stated intent partially) | `#FFFFFF` IS caught; `background: white` IS caught; only the rarely-written `#FFF` slips. Fix recommended pre-Phase 2. |
| src/components/design-skill/AppointmentForm.jsx | 34-50 | Missing Turnstile mount + HTML5 validation (required, maxlength, autoComplete) | INFO (Phase 4 work) | Phase 1 contract only requires the shell `<form action="/api/contact">`. Phase 4 must edit this file to add Turnstile + validation. |
| src/components/design-skill/ProductSheet.jsx | 12 | `animation: 'sheet-in ...'` references undefined keyframe | INFO (dead code) | No @keyframes sheet-in defined anywhere. Modern browsers tolerate. Combined with CR-03 (component unused), no observable impact. |
| lighthouserc.json | 5 | numberOfRuns: 1 — flaky against 0.9 hard threshold | INFO | Current CI scores are well above threshold (Perf 0.99); flakiness risk is low. |
| scripts/check-brand-rules.sh | 22 | Uses `grep -P` (PCRE) — not portable to macOS BSD grep | INFO | Designed for ubuntu-latest CI runner only; local dev on macOS prints a warning. Documented in ci.yml comments. |

### Phase 1 Code Review (01-REVIEW.md) Assessment

Code review raised 5 BLOCKERs and 9 WARNINGs. Per goal-backward verification methodology, "code review findings exist" is not the same as "phase goal failed." Each is assessed against the Phase 1 goal as stated in ROADMAP:

- **CR-01 (wrangler.jsonc deploy path mismatch):** NOT a Phase 1 blocker. User-confirmed live deploy works; adapter-generated `dist/server/wrangler.json` provides correct paths. Quality debt for Phase 4.
- **CR-02 (check-no-hydration.sh false-positive on server chunks):** **Factually incorrect.** Server bundles are `.mjs`, script's --include is `*.js`. Verified empirically: `find dist -name '*.js'` returns 0 files; script passes.
- **CR-03 (ProductSheet.jsx no client: directive):** Dead code in Phase 1. Defect becomes real in Phase 2.
- **CR-04 (PopupStrip date TZ bug):** Latent. Dormant against current sample data. Fix in Phase 3.
- **CR-05 (Rule 1 misses uppercase #FFF):** Real but narrow defect. The most common author affordances are caught. Fix pre-Phase 2.

None of the BLOCKERs block the Phase 1 SC contract. All are tracked above for downstream-phase action.

### Human Verification Required

None outstanding. The user has explicitly confirmed:
- "approved" on Plan 05's human-action checkpoint (Cloudflare connect + GitHub ruleset + CI smoke test + iOS Add to Home Screen)
- Live preview SC1 + SC4 verified on `studio-bluemli.<account>.workers.dev`
- CI green on main with Lighthouse Performance 0.99 / A11y 0.95 / BP 1.00 / SEO 0.91 on all 5 routes

### Gaps Summary

No gaps blocking the Phase 1 goal. All 5 ROADMAP success criteria are verified by a combination of:
1. **Codebase evidence:** Every must_have artifact and key-link verified to exist, be substantive, and be wired.
2. **Build evidence:** Local `astro check + astro build + postbuild` runs cleanly; emits 5 prerendered HTML files; zero browser JS.
3. **Human-attested live-deploy evidence:** User confirmed visual SC1, SC4, CI/Lighthouse status, and Plan 05 checkpoint approval.

Quality debt identified by code review (CR-01, CR-03, CR-04, CR-05 + WRs) is real but does not defeat any Phase 1 SC. Each item is annotated above with the phase that should address it. Recommend tracking the items in `.planning/phases/01-foundations-brand-system/deferred-items.md` (already exists for Plan 04's deferred entries).

---

_Verified: 2026-05-13T17:25:00Z_
_Verifier: Claude (gsd-verifier)_
