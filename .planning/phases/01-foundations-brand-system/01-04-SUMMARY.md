---
plan_id: 01-04
phase: 1
phase_slug: 01-foundations-brand-system
plan: 04
subsystem: ui
tags: [astro-layout, fonts-api, accessibility, sample-data, page-routes, prerender, cloudflare-workers]
status: complete
requirements: [FND-05, FND-12, FND-13, FND-06, FND-07]
dependency_graph:
  requires:
    - "Plan 01-01 (astro.config.mjs Fonts API cssVariables + wrangler.jsonc Cloudflare adapter)"
    - "Plan 01-02 (11 design-skill JSX components + src/styles/colors_and_type.css + src/styles/components.css)"
    - "Plan 01-03 (5 favicon files + 3 sample SVG placeholders + public/mark.svg)"
  provides:
    - "src/sample-data.ts — sampleGallery (3 D-03-marked pieces) + sampleNextPopup (D-02-marked)"
    - "src/layouts/BaseLayout.astro — shared <head>, favicon set, Fonts API <Font> tags, skip-link, global :focus-visible (FND-13)"
    - "5 prerendered pages at /, /gallery, /popups, /about, /say-hi (D-18) — every page renders the demo-loaded design-skill composition (D-01)"
    - "scripts/write-assetsignore.mjs — postbuild writes dist/.assetsignore (REVIEW FIX M2) + removes unreferenced dist/client/_astro/*.js (Plan 04 Rule 2 auto-fix)"
    - "Deployable dist/ with 5 HTML files at dist/client/ + Cloudflare Worker entrypoint at dist/server/entry.mjs + dist/server/wrangler.json"
  affects:
    - "Plan 05 (CI + Cloudflare connect) — pnpm run build is now green end-to-end; Plan 05 wires it into GitHub Actions and the Cloudflare git integration"
    - "Phase 2 (content collections) — deletes src/sample-data.ts and the demo-loaded composition; the routing skeleton stays"
    - "Phase 4 (/api/contact Worker handler) — say-hi.astro's <form action='/api/contact'> shell is in place; just needs the endpoint"
tech_stack:
  added:
    - "Astro export const prerender = true per-page directive (Plan 01 chose output: 'server' so pages opt-in to static generation individually)"
    - "Astro <Font cssVariable> preload tags from astro:assets (Plan 01 declared the four cssVariables)"
    - "Astro <slot name='...'> named slots for header/footer composition"
  patterns:
    - "Single BaseLayout.astro is the only place src/styles/*.css is imported (FND-06 — pages never re-import)"
    - "<style is:global>@import 'colors_and_type.css'; @import 'components.css';</style> in cascade order so Plan 02 .btn-primary/.nav-item rules win"
    - "Global :focus-visible rule (FND-13) in BaseLayout's <style is:global> using var(--color-focus-ring, var(--indigo-500))"
    - "Per-page export const prerender = true under output: 'server' — opts each Phase 1 page into static prerendering while leaving Worker entrypoint emitted for Phase 4's /api/contact"
    - "Postbuild cleanup: walk dist/client/**/*.html for /_astro/*.js references, delete unreferenced JS bundles (preserves the 'no client: directive → zero React shipped' contract literally, not just operationally)"
key_files:
  created:
    - "src/sample-data.ts"
    - "src/layouts/BaseLayout.astro"
    - "src/pages/index.astro"
    - "src/pages/gallery.astro"
    - "src/pages/popups.astro"
    - "src/pages/about.astro"
    - "src/pages/say-hi.astro"
    - "scripts/write-assetsignore.mjs"
    - ".planning/phases/01-foundations-brand-system/deferred-items.md"
  modified:
    - "src/components/design-skill/GalleryGrid.jsx (added JSDoc typedef so astro check infers pieces prop as GalleryGridPiece[] not never[])"
decisions:
  - "Each page declares `export const prerender = true` because Plan 01 chose output: 'server' (modern @astrojs/cloudflare adapter pattern). Without this, the routes are SSR-only chunks in dist/server/chunks/ and dist/client/ gets zero HTML files. With it, all 5 pages prerender to dist/client/<route>/index.html AND the Worker entrypoint dist/server/entry.mjs persists for Phase 4."
  - "Plan's verification expected dist/_worker.js/index.js (legacy adapter path). Modern @astrojs/cloudflare@13.5 emits dist/server/entry.mjs instead — same semantic role, different filesystem location. Plan 01-01 SUMMARY documents this; Plan 04 verification recognizes both paths."
  - "Plan's verification expected zero JS bundles >5KB in dist/. @astrojs/react@5 emits a ~190KB unreferenced React-runtime island bundle even when no `client:*` directive exists. The postbuild script deletes it after scanning HTML for references (Rule 2 auto-fix). After cleanup, dist/client has zero browser-served JS files."
  - "GalleryGrid.jsx received a JSDoc typedef (GalleryGridPiece + GalleryGridProps) so astro check stops inferring `pieces = []` as `never[]`. JSDoc deliberately defines a local shape rather than importing GalleryPiece from sample-data.ts — Phase 2 will replace sample-data with a Content Collection whose per-item type may diverge, and we only need the component-facing shape."
  - "Rewrote one BaseLayout.astro comment to not contain the literal string 'outline: none' — same class of fix Plan 02 made to PopupStrip/Button/AppointmentForm comments. CI grep gate is intentionally string-level (no AST awareness)."
metrics:
  duration: "~13 minutes (worktree mode)"
  completed: "2026-05-13"
  tasks_completed: 4
  tasks_total: 4
  commits: 7
  files_created: 9
  files_modified: 1
---

# Phase 1 Plan 04: BaseLayout, Pages, Sample Data Summary

**Five prerendered routes (/, /gallery, /popups, /about, /say-hi) composing the design-skill React JSX into a single BaseLayout with Fonts API preload, favicon set, skip-link, and a site-wide FND-13 `:focus-visible` rule — all backed by `src/sample-data.ts` placeholders and shipping zero client-side JavaScript to the browser.**

## Performance

- **Duration:** ~13 min (including pnpm install + 2 rebuild iterations)
- **Started:** 2026-05-12 (worktree spawn)
- **Completed:** 2026-05-13T00:59:51Z
- **Tasks:** 4 (1, 2, 2b, 3)
- **Files created:** 9 (5 pages + BaseLayout + sample-data + postbuild script + deferred-items log)
- **Files modified:** 1 (GalleryGrid.jsx — JSDoc typedef only, no runtime change)
- **Commits:** 7 atomic per-task commits

## Accomplishments

- All 5 routes from D-18 buildable as lowercase Astro page files.
- Demo-loaded compositions visible after `pnpm run build`: landing has Hero + PopupStrip + GalleryGrid (3 cards); /gallery shows full sampleGallery; /popups shows sampleNextPopup; /about shows the design-skill About component; /say-hi shows AppointmentForm shell pointed at `/api/contact`.
- BaseLayout consumes all four Fonts API `cssVariable` entries Plan 01 declared (wordmark/display/body/hand) via `<Font cssVariable preload />` from `astro:assets`.
- BaseLayout's `<style is:global>` block imports `colors_and_type.css` then `components.css` (cascade order — REVIEW FIX iteration 2 BLOCKER 3), making Plan 02's `.btn-primary` and `.nav-list/.nav-item` rules live at runtime.
- Site-wide `:focus-visible` rule (FND-13) in BaseLayout: `outline: 2px solid var(--color-focus-ring, var(--indigo-500)); outline-offset: 2px;` — applies to every interactive element.
- `pnpm exec astro check` exits 0 (no errors, no warnings).
- `pnpm exec astro build` exits 0 with a clean log; emits 5 HTML files at `dist/client/<route>/index.html` + Cloudflare Worker entrypoint at `dist/server/entry.mjs` + the adapter-generated `dist/server/wrangler.json`.
- After postbuild cleanup: **zero browser-served JS files** in `dist/client/`. The 190KB unreferenced React runtime bundle that `@astrojs/react@5` preemptively emits is deleted.
- `dist/.assetsignore` exists and contains `_worker.js`, `_worker.js/**`, `_routes.json` (REVIEW FIX M2 — defensive against future adapter versions reverting to the legacy path).

## Task Commits

1. **Task 1: Write `src/sample-data.ts`** — `bde1fa9` (feat)
   - sampleGallery: 3 D-03-marked pieces (`Sample Piece A/B/C`, price 0, SVG photos from Plan 03).
   - sampleNextPopup: D-02-marked popup with `tz: 'America/Los_Angeles'`, ISO date, HH:MM times.
   - Exported `GalleryPiece` and `Popup` type aliases.

2. **Task 2: Write `src/layouts/BaseLayout.astro`** — `9515e94` (feat)
   - 5 favicon `<link>` tags, 4 `<Font cssVariable>` preload tags, `<meta name="color-scheme" content="light">`, skip-link `Skip to main content` targeting `#main-content`, `<style is:global>` importing colors_and_type.css then components.css, global `:focus-visible` rule using `--color-focus-ring`, named `header` and `footer` slots, `max-width: 1200px` main container with responsive padding.
   - **[Rule 1 — Bug auto-fix]** Reworded a comment that contained the literal string `outline: none` so the CI grep gate passes.

3. **Task 2b: Write `scripts/write-assetsignore.mjs`** — `c6721e9` (feat)
   - Writes `dist/.assetsignore` with `_worker.js`, `_worker.js/**`, `_routes.json` (REVIEW FIX M2).
   - Exits 1 with a clear error if `dist/` doesn't exist.

4. **[Auto-fix] GalleryGrid JSDoc typedef** — `afdec28` (fix)
   - **[Rule 1 — Bug]** Added `@typedef GalleryGridPiece` + `@typedef GalleryGridProps` + `@param` annotation. Without this, `astro check` inferred `pieces = []` as `never[]` and rejected callers passing `sampleGallery`.

5. **[Auto-fix] Postbuild script extended to delete unreferenced `_astro/*.js`** — `975b777` (feat)
   - **[Rule 2 — Critical functionality]** Walks `dist/client/**/*.html`, collects `/_astro/<file>.js` references, deletes any `dist/client/_astro/*.js` not in the set. Removes the unreferenced React-runtime bundle.

6. **Task 3: Write the 5 Astro page placeholders** — `48df79d` (feat)
   - `index.astro`, `gallery.astro`, `popups.astro`, `about.astro`, `say-hi.astro`. All lowercase, all `export const prerender = true`, all wrap BaseLayout with UI-SPEC titles, all slot `<Header slot="header" active="...">` + `<Footer slot="footer">`.

7. **Deferred items log** — `5803782` (docs)
   - Logged a pre-existing CI Rule 2 ("flower" comment in verbatim-synced colors_and_type.css) for Plan 05 to triage.

## Files Created / Modified

### Created

- `src/sample-data.ts` — exports `sampleGallery`, `sampleNextPopup`, type aliases `GalleryPiece`, `Popup`. Phase 2 deletes this when real Content Collections come online.
- `src/layouts/BaseLayout.astro` — shared shell; FND-05, FND-06, FND-07, FND-13.
- `src/pages/index.astro` — `/` landing (Hero + PopupStrip + GalleryGrid 3-card slice).
- `src/pages/gallery.astro` — `/gallery` (full sampleGallery).
- `src/pages/popups.astro` — `/popups` (sampleNextPopup).
- `src/pages/about.astro` — `/about` (About component, no props).
- `src/pages/say-hi.astro` — `/say-hi` (AppointmentForm shell; POSTs to /api/contact in Phase 4).
- `scripts/write-assetsignore.mjs` — postbuild: writes `dist/.assetsignore` AND deletes unreferenced `dist/client/_astro/*.js` bundles.
- `.planning/phases/01-foundations-brand-system/deferred-items.md` — Phase-1 deferred-items log seeded with one entry.

### Modified

- `src/components/design-skill/GalleryGrid.jsx` — added JSDoc typedef block above the function declaration; runtime unchanged. Necessary so `astro check` doesn't reject `<GalleryGrid pieces={sampleGallery} />` with `TS2322: Type 'GalleryPiece[]' is not assignable to type 'never[]'`.

## Route → file mapping (for Plan 05's setup checklist)

| Route       | Source file                  | Built path                            |
| ----------- | ---------------------------- | ------------------------------------- |
| `/`         | `src/pages/index.astro`      | `dist/client/index.html`              |
| `/gallery`  | `src/pages/gallery.astro`    | `dist/client/gallery/index.html`      |
| `/popups`   | `src/pages/popups.astro`     | `dist/client/popups/index.html`       |
| `/about`    | `src/pages/about.astro`      | `dist/client/about/index.html`        |
| `/say-hi`   | `src/pages/say-hi.astro`     | `dist/client/say-hi/index.html`       |

Plan 05's founder-facing click-through verification list (after `wrangler deploy`) should hit:
- `https://studio-bluemli.<account>.workers.dev/`
- `https://studio-bluemli.<account>.workers.dev/gallery`
- `https://studio-bluemli.<account>.workers.dev/popups`
- `https://studio-bluemli.<account>.workers.dev/about`
- `https://studio-bluemli.<account>.workers.dev/say-hi`

Each should render with: cream background, design-skill chrome (Header + Footer), the page-specific body component, no broken images (favicons + mark.svg + 3 sample SVGs all 200), no console errors. The `/say-hi` form submit will 404 until Phase 4 ships `/api/contact`.

## Build output mode + Worker entrypoint (checker WARNING #7 follow-through)

**Plan 01 chose `output: 'server'`** (documented in `01-01-SUMMARY.md` "Output Mode Verification" section). With Astro 6.3 + `@astrojs/cloudflare@13.5`:

- Worker entrypoint is at `dist/server/entry.mjs` (NOT the legacy `dist/_worker.js/index.js` path the plan was written against).
- `dist/server/wrangler.json` is adapter-generated with `main: "entry.mjs"` and `assets.directory: "../client"`. The top-level `wrangler.jsonc` references this via `main: "@astrojs/cloudflare/entrypoints/server"`.
- Pages MUST opt into prerendering individually via `export const prerender = true`. Without it, dist/client/ would have zero HTML files.

**Plan 04's verification adaptation:** the plan's gate `test -f dist/_worker.js/index.js || test -f dist/_worker.js` is satisfied by recognizing the modern path `dist/server/entry.mjs` as the same-role artifact. Plan 01-01's SUMMARY pre-anticipated this. No `astro.config.mjs` change was needed in Plan 04.

## Build output mode (checker WARNING #6 follow-through)

**Plan gate:** No browser-served JS bundle in `dist/` exceeds 5KB excluding `_worker.js`.

**Build emits:**
- `dist/client/_astro/client.<hash>.js` (~190KB) — React 19 runtime bundle, NOT referenced by any of the 5 HTML files. Pre-emitted by `@astrojs/react@5` as a hydration fallback that no page actually uses (no `client:*` directive exists in src/).

**Fix:** Postbuild script walks `dist/client/**/*.html`, collects `/_astro/*.js` references into a set, deletes any `dist/client/_astro/*.js` not in the set. After cleanup: **zero JS files in `dist/client`**. Verified:
```
find dist/client -name "*.js"
# (empty)
```

Server-side `.mjs` files in `dist/server/chunks/` (largest is `worker-entry_BtwbHbIC.mjs` at 472KB) are intentionally retained — they ship to the Cloudflare Worker, not to the browser. These are NOT what the plan's gate forbids.

## BaseLayout cascade order (checker iteration 2 BLOCKER 3 confirmation)

The `<style is:global>` block in BaseLayout.astro imports CSS in this exact order:
```css
@import '../styles/colors_and_type.css';
@import '../styles/components.css';
```

This is the order Plan 02's REVIEW FIX iteration 2 BLOCKER 3 mandated:
- `colors_and_type.css` defines `--coral-*`, `--indigo-*`, `--cream-*`, `--color-focus-ring`, `--font-*`, `--space-*` tokens. Must be loaded first so component rules can reference the tokens.
- `components.css` defines `.btn-primary:hover { background: var(--coral-700); }`, `.btn-primary:active { transform: scale(0.97); }`, `.nav-list { display: contents; }`, `.nav-item { display: contents; }`. Must be loaded AFTER colors_and_type.css so its component overrides win the cascade.

Without either import, Plan 02's component visuals would be dead at runtime. Both are now wired.

## Prop-shape adjustments vs Plan 02 synced components

**One adjustment, in GalleryGrid.jsx:** added a JSDoc `@typedef GalleryGridPiece` / `@typedef GalleryGridProps` block above the function declaration. Runtime behavior unchanged. Necessary because Astro 6 typechecks `.jsx` files via TypeScript's `allowJs` mode (no `checkJs` — but Astro's own JSX→TSX inference still flags `never[]` for an untyped default-`[]` prop). The typedef intentionally declares a local shape rather than importing `GalleryPiece` from `src/sample-data.ts`, because:
1. Phase 2 deletes `src/sample-data.ts` when real Content Collections come online — the import would dangle.
2. The Content Collection's per-item shape might add extra fields (description, materials, dimensions) the component doesn't read; a local typedef captures only what the component actually consumes.

No other prop shapes required adjustment. PopupStrip's `popup` prop matches Plan 02's refactor (no more `onAppointment` handler). Header's `active` union already includes `/about`.

## Verbatim build log (`/tmp/astro-build.log` — final clean build)

```
17:56:02 [@astrojs/cloudflare] Enabling image processing with Cloudflare Images for production with the "IMAGES" Images binding.
17:56:02 [@astrojs/cloudflare] Enabling sessions with Cloudflare KV with the "SESSION" KV binding.
17:56:02 [types] Generated 495ms
17:56:02 [build] output: "server"
17:56:02 [build] mode: "server"
17:56:02 [build] directory: /Users/lucacanonica/Documents/projects/bluemli/.claude/worktrees/agent-acaac92ad291ba83e/dist/
17:56:02 [build] adapter: @astrojs/cloudflare
17:56:02 [build] Collecting build info...
17:56:02 [build] ✓ Completed in 506ms.
17:56:02 [build] Building server entrypoints...
17:56:03 [assets] Copying fonts (95 files)...
17:56:03 [vite] ✓ built in 790ms
17:56:03 [vite] ✓ built in 354ms
17:56:04 [vite] ✓ built in 243ms
Default inspector port 9229 not available, using 9230 instead


 prerendering static routes 
17:56:04   ├─ /about/index.html (+13ms) 
17:56:04   ├─ /gallery/index.html (+5ms) 
17:56:04   ├─ /popups/index.html (+5ms) 
17:56:04   ├─ /say-hi/index.html (+4ms) 
17:56:04   ├─ /index.html (+5ms) 
17:56:04 ✓ Completed in 201ms.

17:56:04 [build] Rearranging server assets...
17:56:04 [build] ✓ Completed in 1.62s.
17:56:04 [build] Server built in 2.12s
17:56:04 [build] Complete!
```

Inline allowlist scan: `grep -iE "(^|\s)(warn|error)" /tmp/astro-build.log | grep -vE "(Browserslist|deprecat|^\s*$|at .*node:internal)"` returns empty. No `tail -5` masking. The "Default inspector port" notice is a single info line from the build env, not a warning.

## Decisions Made

| Decision | Rationale | Outcome |
|---|---|---|
| `export const prerender = true` on every page | Plan 01 chose `output: 'server'` because the modern adapter no longer emits the legacy `dist/_worker.js` path under static mode. Under server mode, pages SSR by default — adding `prerender = true` per-page is the documented Astro 6 idiom to opt back into static generation while keeping the Worker entrypoint emitted for Phase 4's `/api/contact`. | 5 HTML files at `dist/client/<route>/index.html`, Worker entrypoint at `dist/server/entry.mjs`. |
| Delete unreferenced React island bundle in postbuild | `@astrojs/react@5` preemptively emits ~190KB at `dist/client/_astro/client.<hash>.js` even with zero `client:*` directives. The bundle is never referenced by any HTML. The plan's gate "no JS >5KB browser-served" is satisfied operationally (no browser ever requests it) but trips on the file's existence. Deleting it honors the gate literally. | `dist/client/` has zero JS files post-cleanup; ~190KB removed from deploy. |
| JSDoc typedef on GalleryGrid (not TS prop interface) | The component is a `.jsx` file (Plan 02 chose JSX-not-TSX for minimal surface change from skill source). JSDoc is sufficient for `astro check` to drop the `never[]` inference. Migration to `.tsx` is a future, larger change. | `pnpm exec astro check` exits 0. |
| Reword comment containing literal `outline: none` | The CI grep gate (FND-13) is string-level. Same class of fix Plan 02 made (Deviation #3 in 01-02-SUMMARY.md). | Gate passes; intent preserved. |
| Recognize modern Cloudflare adapter path in verification | Plan 01-01 SUMMARY documented this deviation upfront: adapter@13.5 emits `dist/server/entry.mjs` not `dist/_worker.js/index.js`. | No `astro.config.mjs` change in Plan 04. |
| Log the colors_and_type.css "flower" comment hit as deferred, not fix in Plan 04 | colors_and_type.css is verbatim-synced from the skill (REVIEW FIX M4 — Plan 02 locked it). Editing it inside Plan 04 would mutate a managed file outside this plan's scope, AND would drift the worktree's copy from the skill source. Plan 05 owns CI gate decisions. | Deferred-items.md created with 3 resolution paths for Plan 05. |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] `astro check` rejected `<GalleryGrid pieces={sampleGallery} />` with TS2322**
- **Found during:** Task 3 (first `pnpm exec astro check` after writing the 5 pages)
- **Issue:** `Type 'GalleryPiece[]' is not assignable to type 'never[]'.` The synced `GalleryGrid.jsx` had `function GalleryGrid({ pieces = [] })` with no JSDoc — Astro's inference picked `never[]` from the empty default and rejected the typed sampleGallery payload. Without this fix, Task 3's verify gate (`pnpm exec astro check && pnpm exec astro build`) cannot pass.
- **Fix:** Added a JSDoc block above the function declaration declaring `@typedef GalleryGridPiece` + `@typedef GalleryGridProps` + `@param {GalleryGridProps} props`. Local shape (not imported from sample-data.ts) so Phase 2 can delete sample-data without breaking the component.
- **Files modified:** `src/components/design-skill/GalleryGrid.jsx`
- **Verification:** `pnpm exec astro check` exits 0 (24 files, 0 errors, 0 warnings) after the edit.
- **Committed in:** `afdec28`

**2. [Rule 1 — Bug] BaseLayout.astro comment text tripped the CI `outline: none` grep gate**
- **Found during:** Task 2 verification (post-write grep scan)
- **Issue:** The plan's BaseLayout template included a comment "none may suppress with \`outline: none\`" — accurate semantically, but the literal string trips the FND-13 CI grep (which is string-level, not AST-aware). Same exact class of issue Plan 02 hit and documented (Deviation #3 in 01-02-SUMMARY.md).
- **Fix:** Reworded the comment to "none may suppress the outline (Plan 02 Task 3 Edit 4 strips any such suppression from design-skill components)" — same meaning, different surface string.
- **Files modified:** `src/layouts/BaseLayout.astro`
- **Verification:** `! grep -qE "outline:\\s*['\"]?none" src/layouts/BaseLayout.astro` exits 0.
- **Committed in:** `9515e94` (Task 2 commit, fix applied before commit)

**3. [Rule 2 — Critical functionality] Unreferenced React runtime bundle shipped to dist/client/**
- **Found during:** Task 3 build verification (large JS bundle scan)
- **Issue:** After `pnpm exec astro build`, `dist/client/_astro/client.<hash>.js` exists at ~190KB — the React 19 runtime. It is NOT referenced by any of the 5 prerendered HTML files (verified by `grep -rl "client.<hash>" dist/client/*.html dist/client/*/index.html` returning empty). It's pre-emitted by `@astrojs/react@5` as a hydration fallback for hypothetical `client:*` directives. Phase 1's contract is "no `client:` directive → zero React shipped to browser". The plan's gate `find dist -name '*.js' -size +5k | grep -v '_worker.js' | wc -l == 0` trips on this file's existence even though Cloudflare Static Assets only serves what's actually requested (operationally zero React shipped).
- **Fix:** Extended `scripts/write-assetsignore.mjs` (Task 2b's script) to:
  1. Walk `dist/client/**/*.html` and collect every `/_astro/<file>.js` reference into a set.
  2. Read `dist/client/_astro/`; delete any `.js` file whose name is NOT in the set.
  Since every Phase 1 page declares `export const prerender = true` and no `client:*` directive exists in src/, the bundle is provably unreferenced.
- **Files modified:** `scripts/write-assetsignore.mjs`
- **Verification:** After running the script, `find dist/client -name '*.js'` returns empty. The 5 HTML files still render correctly (verified by inspecting `dist/client/index.html` — has cream `#F5DCC7`, mark.svg, all Studio Bluemli content).
- **Committed in:** `975b777`

**4. [Rule 3 — Blocking] Plan's expected `dist/_worker.js` path doesn't exist under modern adapter**
- **Found during:** Task 3 Worker entrypoint check
- **Issue:** The plan's verification expected `dist/_worker.js/index.js` (or `dist/_worker.js` file). Plan 01-01 SUMMARY already documented this: Astro 6.3 + `@astrojs/cloudflare@13.5` emits the entrypoint at `dist/server/entry.mjs` (modern unified path) and auto-generates `dist/server/wrangler.json` with `main: "entry.mjs"`. The legacy `_worker.js` path is a pre-Astro-6 / Pages-Functions convention.
- **Fix:** No source change. Verification logic accepts `dist/server/entry.mjs` as the same-role artifact. This is the deviation Plan 01-01 SUMMARY pre-anticipated.
- **Files modified:** none (the only change is in this SUMMARY's verification narrative)
- **Verification:** `test -f dist/server/entry.mjs` returns 0. `wrangler deploy --config dist/server/wrangler.json` is the modern deploy command Plan 05 will wire.
- **Committed in:** N/A (no code change)

**5. [Rule 3 — Blocking] Plan's expected `≥5 dist/*.html` doesn't match `output: 'server'` default**
- **Found during:** Task 3 HTML count check (first build, before `prerender = true` was added)
- **Issue:** With `output: 'server'`, Astro defaults to SSR-only — pages compile to `dist/server/chunks/<route>_*.mjs` rather than `dist/<route>/index.html`. First build produced 0 HTML files. The plan was written assuming `output: 'static'`, but Plan 01 had to switch to `'server'` (documented in 01-01 SUMMARY).
- **Fix:** Added `export const prerender = true;` to each of the 5 page files (above the `import BaseLayout` line). This is Astro 6's documented per-page opt-in to static generation under server output mode (verified via Context7 docs lookup: "Enable Prerendering in Server Mode" — `astro@1.0.0`+).
- **Files modified:** `src/pages/index.astro`, `gallery.astro`, `popups.astro`, `about.astro`, `say-hi.astro`
- **Verification:** Rebuilt; `find dist -name "*.html" | wc -l` returns 5 at `dist/client/<route>/index.html`.
- **Committed in:** `48df79d` (the original page-creation commit incorporated the directive)

### Authentication Gates

None — no auth was required for any task in this plan.

### Deferred (NOT Auto-fixed)

**1. CI Rule 2 "flower" hit in src/styles/colors_and_type.css:53**
- The line `/* Lavender — bottom-right pressed flower */` is pre-existing comment text in the verbatim-synced design-skill CSS (Plan 02 REVIEW FIX M4 locks colors_and_type.css as a verbatim copy of the skill source).
- Editing it inside Plan 04 would mutate a managed file outside this plan's scope AND drift from the skill source. Logged in `.planning/phases/01-foundations-brand-system/deferred-items.md` with 3 resolution paths for Plan 05 to choose from (edit skill source, add CSS-comment allowlist to grep, or narrow rule scope to product copy only).

---

**Total deviations:** 5 auto-fixed (2 Rule 1 bugs, 1 Rule 2 critical functionality, 2 Rule 3 blocking adapter-path mismatches). 1 deferred (pre-existing comment in verbatim-synced file, not Plan 04's scope).
**Impact on plan:** All auto-fixes were necessary for either correctness (Rule 1), the plan's literal gate (Rule 2), or recognizing Plan 01's already-documented adapter-path deviation (Rule 3). No scope creep — the only file modified outside the plan's declared `files_modified` is GalleryGrid.jsx, and that change is a comment-only typedef.

## Threat Surface Scan

Checked the `<threat_model>` register in the plan. All five threats (T-04-01 through T-04-05) have appropriate dispositions:

- **T-04-01 (Sample-data leak):** Mitigated as planned. Every name in `src/sample-data.ts` starts with "Sample", every price is `0`. Phase 2's CI Rule 7 (currently commented out) will fire on `"Sample Piece"` in `src/content/` if this content survives.
- **T-04-02 (Stored XSS via title):** Accepted; Phase 1 page titles are static literals in source, Astro escapes interpolations.
- **T-04-03 (Font payload DoS):** Accepted; Astro Fonts API with `font-display: swap` on all four entries (Plan 01).
- **T-04-04 (assets/logo/ leak):** Accepted; not in asset root.
- **T-04-05 (Future contributor adds `client:load`):** Mitigated. Postbuild script now ALSO scans HTML for `/_astro/*.js` references and only retains referenced bundles. If a future contributor adds `client:load`, the relevant page's HTML will reference the corresponding island bundle, the bundle survives the cleanup, AND the plan's `find dist -name '*.js' -size +5k` gate would fail at CI time — alerting the team to the unintended hydration.

No new security-relevant surface introduced beyond the threat model.

## Self-Check: PASSED

**Files exist (worktree FS):**
- `src/sample-data.ts` — FOUND
- `src/layouts/BaseLayout.astro` — FOUND
- `src/pages/index.astro` — FOUND
- `src/pages/gallery.astro` — FOUND
- `src/pages/popups.astro` — FOUND
- `src/pages/about.astro` — FOUND
- `src/pages/say-hi.astro` — FOUND
- `scripts/write-assetsignore.mjs` — FOUND
- `.planning/phases/01-foundations-brand-system/deferred-items.md` — FOUND
- `src/components/design-skill/GalleryGrid.jsx` — FOUND (modified)

**Commits exist in git log:**
- `bde1fa9` — FOUND (Task 1)
- `9515e94` — FOUND (Task 2)
- `c6721e9` — FOUND (Task 2b)
- `afdec28` — FOUND (GalleryGrid fix)
- `975b777` — FOUND (script extension)
- `48df79d` — FOUND (Task 3 pages)
- `5803782` — FOUND (deferred-items log)

**Plan-level acceptance criteria all satisfied:**
- `pnpm exec astro check` exits 0 ✓
- `pnpm exec astro build` exits 0 with clean log ✓
- ≥ 5 HTML files in dist/ ✓ (exactly 5 at `dist/client/<route>/index.html`)
- Cloudflare Worker entrypoint exists ✓ (modern path `dist/server/entry.mjs` per Plan 01-01 documented deviation)
- No browser-served JS > 5KB excluding _worker.js ✓ (zero JS files in `dist/client/` after postbuild cleanup)
- `dist/.assetsignore` exists with required entries ✓
- No `client:*` directives in src/ ✓
- All CI brand rules pass on changes introduced by Plan 04 ✓ (1 pre-existing hit in verbatim-synced CSS deferred to Plan 05)
- Site-wide `:focus-visible` rule emitted ✓ (FND-13)
- `<meta name="color-scheme" content="light">` present ✓ (FND-13)
- Skip-to-content link is first focusable body element ✓ (FND-13)

## Known Stubs

- **`src/sample-data.ts`** is itself the stub — the entire file is placeholder Phase-1 demo content (D-02, D-03). Phase 2 deletes it when real Content Collections come online. This is intentional and documented in the file's own header comment. NOT a stub-in-the-bad-sense; the design-skill components ARE wired to it (not to `null`/`[]`/`""`) and render real visual content.
- `say-hi.astro`'s `<form action="/api/contact">` POSTs to an endpoint that 404s in Phase 1. This is the planned shape — Phase 4 wires `/api/contact`. The form itself is fully functional client-side (HTML inputs, no JS), just the server side is absent. Documented in `say-hi.astro`'s comment block and in 01-02-SUMMARY.md (Phase 4 readiness section).

No unintended stubs.

## TDD Gate Compliance

Not applicable — plan `type: execute` (not `tdd`). No RED/GREEN/REFACTOR gates required.

## Next Phase Readiness

**Plan 05 (CI + Cloudflare connect) is unblocked:**
- `pnpm run build` (= `astro check && astro build`) is green end-to-end. Plan 05 can wire it into GitHub Actions with `pnpm install --frozen-lockfile && pnpm run build` and expect green CI on first run.
- `node scripts/write-assetsignore.mjs` is the postbuild step Plan 05 should invoke after `astro build` in CI (and the Cloudflare git integration's "Build command" field). Wiring it into `package.json` as a `postbuild` script in Plan 05 would make it run automatically — that's a Plan 05 decision since `package.json` belongs to its scope.
- `dist/server/wrangler.json` is the adapter-generated config Plan 05's `wrangler deploy --config dist/server/wrangler.json` should target. The top-level `wrangler.jsonc` is for local `wrangler dev`.
- All 5 routes prerender; founder click-through verification list is in the route table above.

**Phase 2 (content collections) is unblocked:**
- The routing skeleton (5 lowercase Astro pages wrapping BaseLayout) is the keep-as-is shell.
- Phase 2 deletes `src/sample-data.ts` and replaces the demo composition with `getCollection('gallery')` / `getCollection('popups')` calls.
- GalleryGrid's `pieces` prop accepts whatever shape Phase 2 hands it (the JSDoc typedef is permissive enough to accept any superset of `{slug, name, price, status, photo}`).

**Phase 4 (/api/contact Worker handler) is unblocked:**
- `src/pages/say-hi.astro` already renders the AppointmentForm with the correct `<form method="POST" action="/api/contact">` per Plan 02's edits. Phase 4 just adds `src/pages/api/contact.ts` (or similar — exact path depends on Astro endpoint convention chosen there).
- Worker entrypoint exists; `wrangler.jsonc`'s `assets.run_worker_first: ["/api/*"]` reserves the namespace.

## Threat Flags

None — no new threat surface introduced beyond what's already in the plan's threat model. The bundle cleanup (Deviation #3) actually tightens T-04-05's mitigation: any future contributor adding `client:load` will now leave an HTML reference to a JS bundle that the postbuild script preserves, and the plan's CI gate will catch the resulting >5KB browser-served JS at the next build.

---
*Phase: 01-foundations-brand-system*
*Plan: 04 (BaseLayout + Pages + Sample Data)*
*Completed: 2026-05-13*
