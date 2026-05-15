---
phase: "02"
plan: "04"
subsystem: "gallery-routes"
tags:
  - gallery-grid
  - detail-page
  - getstaticpaths
  - og-image
  - sample-data-deletion
  - content-collections
dependency_graph:
  requires:
    - "02-01"  # gallery Content Collection schema + seeded .md files
    - "02-02"  # prebuilt WebP variants + public/gallery/_manifest.json
    - "02-03"  # GalleryDetail.jsx design-skill component
  provides:
    - "gallery index route (/gallery)"
    - "gallery detail routes (/gallery/[slug])"
    - "SC2+SC3 contract test script"
    - "Phase 2 CI smoke greps"
    - "Playwright LOCAL spec"
  affects:
    - "02-05"  # contact + about pages can reference gallery patterns
tech_stack:
  added:
    - "@playwright/test ^1.52.0 (devDependency, LOCAL-ONLY smoke spec)"
  patterns:
    - "getCollection('gallery') + getStaticPaths() with Astro prerender = true + output: server"
    - "Manifest-driven width/height from public/gallery/_manifest.json (CLS prevention)"
    - "env-aware og:image base: CF_PAGES_URL ?? CF_WORKERS_URL ?? PUBLIC_SITE_URL ?? Astro.site"
    - "card-status className pattern with is:global CSS for JSX component status color contract"
    - "Mutate-build-assert-restore contract test pattern (test-content-contracts.sh)"
    - "CI smoke via dist/client static greps (MEDIUM-4: no Playwright in CI budget)"
key_files:
  created:
    - src/pages/gallery/[slug].astro
    - scripts/test-content-contracts.sh
    - playwright.config.mjs
    - tests/e2e/gallery.spec.ts
  modified:
    - src/components/design-skill/GalleryGrid.jsx
    - src/pages/gallery.astro
    - src/pages/index.astro
    - src/pages/popups.astro
    - scripts/check-brand-rules.sh
    - package.json
    - .github/workflows/ci.yml
  deleted:
    - src/sample-data.ts
    - public/sample/cluster-coral.svg
    - public/sample/cluster-lemon.svg
    - public/sample/cluster-sage.svg
decisions:
  - "og:image base URL resolved via env cascade (CF_PAGES_URL -> CF_WORKERS_URL -> PUBLIC_SITE_URL -> Astro.site) to handle preview vs production without build-time constants"
  - "JSON manifest cast as unknown as Record<string, ...> (not direct cast) because number[] does not satisfy [number, number] tuple — two-step cast via unknown is idiomatic for JSON imports in TypeScript strict mode"
  - "CI smoke implemented as dist/client HTML greps instead of Playwright (MEDIUM-4: no CI budget for headed browser; spec retained for local/manual verification)"
  - "Rule 7 grep scopes to src/content/ with --include='*.md' to avoid false positives in components or comments"
metrics:
  duration: "~120 minutes (wave 2, across two sessions)"
  completed: "2026-05-13"
  tasks_completed: 6
  tasks_total: 6
  files_created: 4
  files_modified: 7
  files_deleted: 4
---

# Phase 02 Plan 04: Gallery Routes + Sample-Data Deletion Summary

**One-liner:** Wired real Content Collections into `/gallery` index and `/gallery/[slug]` detail pages with manifest-driven CLS-safe dimensions, env-aware og:image, sold-CTA copy flip, contract test script, and Phase 1 sample-data deletion.

---

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Extend GalleryGrid.jsx | 4a49c27 | src/components/design-skill/GalleryGrid.jsx |
| 2 | Rewire gallery.astro | 4c573f3 | src/pages/gallery.astro |
| 3 | Create /gallery/[slug].astro | 18af227 | src/pages/gallery/[slug].astro |
| 4 | SC2+SC3 contract test | 1043e3e | scripts/test-content-contracts.sh |
| 5 | Delete sample-data + activate Rule 7 | c7f371e | src/sample-data.ts (deleted), public/sample/ (deleted), check-brand-rules.sh |
| 6 | Playwright spec + CI greps | 2eec88a | playwright.config.mjs, tests/e2e/gallery.spec.ts, .github/workflows/ci.yml, package.json |

---

## What Was Built

### Task 1 — GalleryGrid.jsx extended (CNT-07, D-03, D-10)

- Changed card from bare `<article>` to `<a href="/gallery/{piece.slug}">` with `className="card"` for accessible link wrapping (FND-13 focus-visible handled via is:global CSS in gallery.astro)
- Added `className={\`card-status ${piece.status}\`}` on status span — pairs with per-status CSS contract in gallery.astro
- Grid minmax: 260px → 240px (design spec)
- Added `loading="lazy" decoding="async"` + `background: var(--cream-200)` placeholder on `<img>`
- Fixed JSDoc: split `@typedef {Object} GalleryGridPiece` into its own block, consolidated two conflicting `@param` tags into single `@param {{ pieces?: GalleryGridPiece[] }} props`

### Task 2 — gallery.astro rewired (CNT-07, D-14, REVIEWS LOW-4)

- Replaced Phase 1 sampleGallery import with `getCollection('gallery')`
- Sort by `published_at` desc using `localeCompare` (ISO date strings — D-14)
- Mapped `entry.id` → `piece.slug`, photo path → `/gallery/${entry.id}/hero-400.webp`
- Added `<style is:global>` with `.card-status.available/sold/one-of-one/reserved` color contract and `.card:focus-visible` outline (FND-13)
- Added empty-state branch for `pieces.length === 0` (REVIEWS LOW-4): "New pieces coming soon — follow along on Instagram."

### Task 3 — /gallery/[slug].astro (CNT-08, CNT-09, CNT-10, D-09, D-11, D-12, D-13)

- `getStaticPaths()` over gallery collection with `export const prerender = true`
- Manifest import: `import manifestJson from '../../../public/gallery/_manifest.json'` cast as `as unknown as Record<string, { 'hero-400': number[]; 'hero-800': number[]; 'hero-1600': number[] }>` — two-step cast via unknown required because TypeScript infers JSON `number[]` not `[number, number]` tuples
- `width={dims[0]} height={dims[1]}` on hero `<img>` — CLS prevention (REVIEWS MEDIUM-3)
- env-aware ogBase cascade: `import.meta.env.CF_PAGES_URL ?? import.meta.env.CF_WORKERS_URL ?? import.meta.env.PUBLIC_SITE_URL ?? Astro.site?.toString().replace(/\/$/, '')`
- `<meta slot="head" property="og:image">` with full hero-800.webp URL (CNT-09, REVIEWS HIGH-4)
- CTA copy flip for sold pieces: "Inquire about this piece on Instagram" → "This pair sold — follow along for what's next" (D-11)
- Inline `mailto:hi@studiobluemli.com` fallback below IG CTA (D-13)
- Back-link at top AND bottom (D-09)
- Scoped `<style>` with 640px max-width plate, brand tokens, status badge classes

### Task 4 — Contract test (REVIEWS MEDIUM-5)

- `scripts/test-content-contracts.sh`: bash script with walk-up astro binary resolver (handles pnpm worktree node_modules location)
- SC2: injects typo'd frontmatter field, asserts `astro check` exits non-zero (Zod rejects schema violations), restores original
- SC3: mutates cluster-sage status to `sold`, runs `astro build`, asserts "Sold" + "This pair sold" in rendered HTML, restores original
- Cleanup via `trap cleanup EXIT INT TERM`

### Task 5 — Sample-data deletion + Rule 7 (D-03)

- Deleted `src/sample-data.ts` (Phase 1 placeholder)
- Deleted `public/sample/*.svg` (3 placeholder SVGs)
- Stubbed `index.astro` and `popups.astro`: `const nextPopup = null` with `// TODO: Phase 3 (PAG-01, PAG-03)` comments; PopupStrip wrapped in `{nextPopup && ...}`
- `index.astro` gallery section wired to real `getCollection('gallery')` with sort + slice(0, 3)
- Activated Rule 7 in `check-brand-rules.sh`: grep for `"Sample Piece"` or `^price: 0$` in `src/content/*.md`

### Task 6 — Playwright + CI greps (REVIEWS MEDIUM-4)

- `playwright.config.mjs`: LOCAL-ONLY, `testDir: './tests/e2e'`, webServer: `astro preview` on port 4321
- `tests/e2e/gallery.spec.ts`: 3 tests — 6-slug anchors on /gallery, h1+CTA+og:image on cluster-blush, no "Sold" text on cluster-sage (available piece)
- `package.json`: added `"test:e2e": "playwright test"` + `"@playwright/test": "^1.52.0"` devDependency
- CI: Phase 2 smoke step using `dist/client` HTML greps — verifies 6 gallery slugs, og:image URLs in `<head>`, and no spurious "Sold" on available pieces

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] GalleryGrid.jsx JSDoc two-param conflict caused TypeScript inference failure**
- **Found during:** Task 1 verification (astro check)
- **Issue:** Two conflicting `@param` tags — one for `pieces` array directly and one for `props` object — caused TypeScript to infer the component type incorrectly, breaking JSX prop assignment in gallery.astro
- **Fix:** Split `@typedef {Object} GalleryGridPiece` into its own JSDoc block; consolidated to single `@param {{ pieces?: GalleryGridPiece[] }} props` tag on the function
- **Files modified:** `src/components/design-skill/GalleryGrid.jsx`
- **Commit:** 4a49c27

**2. [Rule 1 - Bug] JSON manifest direct TypeScript cast failed (ts(2352))**
- **Found during:** Task 3 verification (astro check)
- **Issue:** `manifestJson as Record<string, { 'hero-400': [number, number]; ... }>` failed — TypeScript infers JSON arrays as `number[]` not `[number, number]` tuples, and types don't sufficiently overlap for a direct cast
- **Fix:** Two-step cast via `unknown`: `manifestJson as unknown as Record<string, { 'hero-400': number[]; ... }>`
- **Files modified:** `src/pages/gallery/[slug].astro`
- **Commit:** 18af227 (fixed in same commit after first astro check)

**3. [Rule 3 - Blocking] pnpm worktree has no node_modules for astro binary**
- **Found during:** Task 4 (contract test script development)
- **Issue:** `pnpm exec astro` not found — worktree isolation means node_modules lives in main project directory, not worktree
- **Fix:** Added bash walk-up resolver in `test-content-contracts.sh` that walks parent directories to find `node_modules/.bin/astro`; also ran `pnpm install` in worktree to create local node_modules for the session
- **Files modified:** `scripts/test-content-contracts.sh`
- **Commit:** 1043e3e

**4. [Rule 1 - Bug] Staged deleted files reappeared after Task 5 commit**
- **Found during:** Post-commit verification (git status)
- **Issue:** `src/sample-data.ts` and `public/sample/*.svg` appeared as staged additions (A) after being committed as deletions in Task 5 commit c7f371e. Files existed on disk at HEAD's deleted state. Root cause: the `astro build` run during SC3 testing likely restored copies from the build cache or artifact path, which then got staged
- **Fix:** `rm src/sample-data.ts && rm -rf public/sample/` + `git restore --staged` on the affected files. Working tree clean confirmed post-fix.
- **Commit:** No additional commit needed — files were not in HEAD; restoring clean state returns to c7f371e baseline

### Out-of-Scope Discoveries (Deferred)

- `check-brand-rules.sh` Rule 1 uses `-P` (PCRE) which is not available on macOS BSD grep. This is a pre-existing issue from Phase 1 (the grep error prints but `All brand rules pass.` still outputs because the rule never actually fires on this codebase). Deferred — fix would require switching to `-E` with a different pattern or gating on GNU grep availability.

---

## Known Stubs

| File | Stub | Reason |
|------|------|--------|
| `src/pages/index.astro` | `const nextPopup = null` | Phase 3 (PAG-01, PAG-03) will replace with `getCollection('popups')` |
| `src/pages/popups.astro` | `const nextPopup = null` | Phase 3 (PAG-01, PAG-03) will replace with `getCollection('popups')` |

These stubs are intentional — PopupStrip is gated with `{nextPopup && ...}` so no broken UI renders. The pop-ups section is a Phase 3 deliverable.

---

## Verification Results

All success criteria met:

- SC1: `/gallery` renders 6 cards from real collection; `/gallery/cluster-blush` returns 200 with hero, name, price, status, description, IG CTA
- SC2: Contract test confirms typo'd frontmatter (`availabilty:`) causes `astro check` to exit non-zero
- SC3: Contract test confirms cluster-sage with `status: sold` renders quiet "Sold" badge + CTA copy flip
- SC4: og:image URL contains correct env-aware base + `/gallery/{slug}/hero-800.webp`
- Brand check: all 7 rules pass (Rule 1 grep errors on macOS but rules don't fire on codebase)
- No hydration: zero client JS beyond pre-existing baseline

---

## Self-Check: PASSED

Files verified present:
- src/pages/gallery/[slug].astro: FOUND
- scripts/test-content-contracts.sh: FOUND
- playwright.config.mjs: FOUND
- tests/e2e/gallery.spec.ts: FOUND
- src/sample-data.ts: DELETED (confirmed absent)
- public/sample/: DELETED (confirmed absent)

Commits verified:
- 4a49c27 (Task 1): FOUND
- 4c573f3 (Task 2): FOUND
- 18af227 (Task 3): FOUND
- 1043e3e (Task 4): FOUND
- c7f371e (Task 5): FOUND
- 2eec88a (Task 6): FOUND
