---
plan_id: 01-03
phase: 1
phase_slug: 01-foundations-brand-system
plan: 03
subsystem: public-assets
tags: [favicons, public-assets, sample-data, icon-gen, review-fix-m3]
status: complete
requirements: [FND-08]
dependency_graph:
  requires:
    - "assets/logo/mark.svg (filesystem input — untracked repo asset)"
    - "assets/logo/mark-favicon-180.png (filesystem input — untracked repo asset, D-19 reuse)"
    - "icon-gen@5 npm package (declared by Plan 01-01 in package.json; installed transiently here in worktree mode)"
  provides:
    - "public/favicon.ico, public/favicon-{16,32}.png, public/favicon.svg, public/apple-touch-icon.png (5 favicon link-tag targets for Plan 04 BaseLayout)"
    - "public/mark.svg (Header.jsx <img src=\"/mark.svg\"> target)"
    - "public/sample/cluster-{coral,sage,lemon}.svg (3 placeholder gallery cards for Plan 04 sample-data.ts)"
    - "scripts/generate-favicons.mjs (one-shot, idempotent regen path — wired to `pnpm run favicons` script declared in Plan 01-01)"
    - "public/favicon/README.md (D-20 — documents regen workflow + DO-NOT-regen guardrail on apple-touch-icon)"
  affects:
    - "Plan 04 (BaseLayout.astro) — 5 favicon <link> tags and Header.jsx /mark.svg reference resolve to real files instead of 404s"
tech_stack:
  added:
    - "icon-gen@5 (used at build-time only via scripts/; transitively pulls sharp — only relevant in the favicon regen run, not at request time)"
  patterns:
    - "REVIEW FIX M3: SVG-only placeholder images. No sharp dependency at the top level; no `pnpm add -D sharp` mutation of package.json/lockfile from this plan."
    - "Static-asset web root convention: anything under public/ is served verbatim by Cloudflare Workers Static Assets at the corresponding URL path."
    - "Generate-then-commit: favicon binaries are checked into git so prod deploys don't re-run icon-gen and so Workers Static Assets serves them directly."
key_files:
  created:
    - "scripts/generate-favicons.mjs"
    - "public/favicon.ico"
    - "public/favicon-16.png"
    - "public/favicon-32.png"
    - "public/favicon.svg"
    - "public/apple-touch-icon.png"
    - "public/mark.svg"
    - "public/favicon/README.md"
    - "public/sample/cluster-coral.svg"
    - "public/sample/cluster-sage.svg"
    - "public/sample/cluster-lemon.svg"
  modified: []
decisions:
  - "D-19 honored: public/apple-touch-icon.png is a byte-identical copy of assets/logo/mark-favicon-180.png (sha e5ac160c…), NOT regenerated. The pre-existing 180px PNG already has the right rounded-corners-friendly styling."
  - "D-20 honored: regen path is documented at public/favicon/README.md as a single command (`pnpm run favicons`) with an explicit DO-NOT-regenerate warning on apple-touch-icon."
  - "REVIEW FIX M3 (Codex): placeholder gallery cards ship as SVG, not WebP. Removed any need for `sharp` at the top level. package.json and pnpm-lock.yaml were NOT modified by this plan."
metrics:
  duration_minutes: 1.1
  completed_at: "2026-05-13T00:39:09Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 11
  files_modified: 0
  deviations: 0
---

# Phase 1 Plan 03: Favicon and Public Assets Summary

Generated the full Phase 1 favicon set (`favicon.ico` + `favicon-16/32.png` + `favicon.svg` + `apple-touch-icon.png`) plus `public/mark.svg` from `assets/logo/mark.svg` via a one-shot `pnpm run favicons` script using `icon-gen@5`, with `public/apple-touch-icon.png` reused byte-identically from `assets/logo/mark-favicon-180.png` (D-19) and the regen path documented at `public/favicon/README.md` (D-20); also shipped three SVG placeholder gallery cards under `public/sample/` to give Plan 04's sample data real files to render against — SVG instead of WebP per Codex REVIEW FIX M3 to avoid an unpinned `sharp` dep.

## What Was Built

### Task 1 — Favicon set + mark.svg (commit `17abcfe`)

| File                         | Size (bytes) | Source                                    | Purpose                                              |
|------------------------------|--------------|-------------------------------------------|------------------------------------------------------|
| `scripts/generate-favicons.mjs` | 2194 | (new) | One-shot generator: `pnpm run favicons`. Idempotent. Uses `icon-gen@5`. |
| `public/favicon.ico`         | 5238 | generated from `assets/logo/mark.svg`     | Multi-size .ico (16/32/48) for legacy browser tabs   |
| `public/favicon-16.png`      | 583  | generated from `assets/logo/mark.svg`     | 16×16 PNG (renamed from icon-gen's `favicon16.png` to match UI-SPEC link tags) |
| `public/favicon-32.png`      | 1070 | generated from `assets/logo/mark.svg`     | 32×32 PNG (renamed from `favicon32.png`)             |
| `public/favicon.svg`         | 527  | copy of `assets/logo/mark.svg`            | `<link rel="icon" type="image/svg+xml">` target      |
| `public/apple-touch-icon.png`| 9261 | copy of `assets/logo/mark-favicon-180.png` (**D-19: NOT regenerated**) | 180×180 iOS home-screen icon |
| `public/mark.svg`            | 527  | copy of `assets/logo/mark.svg`            | Header.jsx / Footer.jsx `<img src="/mark.svg">` target |
| `public/favicon/README.md`   | 484  | (new)                                     | D-20 regen documentation                             |

**Byte-identical reuse confirmations (sha1):**
- `assets/logo/mark-favicon-180.png` = `public/apple-touch-icon.png` = `e5ac160cd4aced50dcff784804f98e1cb95bccb8` ✓ (D-19 honored)
- `assets/logo/mark.svg` = `public/mark.svg` = `public/favicon.svg` = `b08437dba962f26b8e457c56da22ebcf6413c6b6` ✓

### Task 2 — SVG placeholder gallery cards (commit `8ea8cac`)

| File                                | Size (bytes) | Plan 04 slug reference        | Visual                                            |
|-------------------------------------|--------------|-------------------------------|---------------------------------------------------|
| `public/sample/cluster-coral.svg`   | 930          | `sample-cluster-coral` → photo `/sample/cluster-coral.svg`  | Cream #F5DCC7 card + coral #D6553B 4-bead cluster + "Cluster · Coral" label + "sample placeholder" subline |
| `public/sample/cluster-sage.svg`    | 886          | `sample-cluster-sage`  → photo `/sample/cluster-sage.svg`   | Cream + sage #6E7438 cluster + "Cluster · Sage"   |
| `public/sample/cluster-lemon.svg`   | 889          | `sample-cluster-lemon` → photo `/sample/cluster-lemon.svg`  | Cream + lemon/mustard #C99A2E cluster + "Cluster · Lemon" |

All three are 400×500 viewBox (4:5 aspect — matches GalleryGrid card geometry from Plan 02). Each declares the brand cream `#F5DCC7` as the background and uses only one accent hex (per brand rule "three accent colors per composition", here scoped to one per card). Each is visually self-identifying as a sample (the literal text "sample placeholder" appears under the title), satisfying D-03's "samples must look obviously sample-like" intent.

## Decisions Made

- **D-19 reuse path**: `apple-touch-icon.png` is a `fs.copyFile` of the existing 180px PNG, not a fresh `icon-gen` rasterization. Confirmed byte-identical via sha1 in verification. Rationale: the existing PNG was already styled for iOS rounded-corner masking; regenerating from the SVG would lose that styling.
- **D-20 single-command regen**: A one-line `pnpm run favicons` rebuilds the entire set. The README.md inside `public/favicon/` documents both the command and the explicit DO-NOT-regenerate guardrail for `apple-touch-icon.png`, so a future contributor reading the script alone (which copies it) is reminded why.
- **REVIEW FIX M3 — SVG over WebP**: Codex's Phase 1 cross-AI review flagged that the earlier WebP plan would have required `pnpm add -D sharp` (or relied on an unpinned transitive dep), mutating `package.json`/`pnpm-lock.yaml` outside Plan 03's declared `files_modified`. The fix: ship 3 plain SVGs committed verbatim — no image library, no `scripts/_gen-sample-images.mjs`, no `.webp` files. Verified post-commit: `git status --porcelain package.json pnpm-lock.yaml` is empty.

## Deviations from Plan

None — plan executed exactly as written.

The plan declared a wave-1 parallel execution model where Plan 01-01 (sibling, same wave) is responsible for adding `icon-gen` to `package.json` and wiring the `pnpm run favicons` script. To exercise Task 1 (generation) inside this worktree without prematurely committing files owned by Plan 01-01, `icon-gen@5.0.0` was installed transiently in a temp dir and exposed via a `node_modules` symlink in the worktree — none of which were committed. The committed deliverable is exactly the file set declared in the plan's `files_modified`: 11 files under `public/` and `scripts/`, plus the SUMMARY itself. Confirmed by `git status` showing `package.json`, `pnpm-lock.yaml`, `node_modules`, and `assets/` as untracked (correct — owned by Plan 01-01 or by the founder's untracked source-asset directory).

## Authentication Gates

None encountered.

## Verification Results

**Task 1 automated verification (plan-supplied one-liner):** PASS
- All 7 favicon files exist and are non-empty
- Script references `icon-gen`, `favicon-16.png`, and `mark-favicon-180.png`
- `public/apple-touch-icon.png` sha1 = `assets/logo/mark-favicon-180.png` sha1
- README contains both `pnpm run favicons` and `DO NOT regenerate`

**Task 2 automated verification (plan-supplied one-liner):** PASS
- All 3 sample SVGs exist with size > 200 bytes
- Each contains `<svg`, the cream hex `#F5DCC7`, and its color label (`Cluster · Coral` / `Cluster · Sage` / `Cluster · Lemon`)
- No "flower" vocabulary anywhere in filenames (`ls public/sample/ | grep -Ei "flower|petal|floral|bloom|blossom"` exits 1) — brand non-negotiable #2 honored.

**Plan-level verification:** PASS
- All 7 favicon files + 3 sample SVGs present on disk and committed.
- `shasum` equality confirmed for D-19 (apple-touch-icon) and the two mark.svg copies.
- Idempotence: rerunning `node scripts/generate-favicons.mjs` produces an identical set (rerun-then-`git diff` shows no changes vs HEAD).

**REVIEW FIX M3 verification:** PASS
- `git status --porcelain package.json pnpm-lock.yaml` is empty.
- `scripts/_gen-sample-images.mjs` does not exist.
- `ls public/sample/ | grep .webp` exits 1 — no WebPs.

## Commits

| Hash       | Type | Message                                                                       |
|------------|------|-------------------------------------------------------------------------------|
| `17abcfe`  | feat | generate favicon set + public mark.svg via icon-gen                           |
| `8ea8cac`  | feat | add 3 SVG placeholder gallery cards (REVIEW FIX M3)                           |

## Downstream Effects

- **FND-08 (favicon visible in tab + iOS home-screen):** Unblocked. Plan 04 can now emit 5 `<link rel="icon" …>` tags in BaseLayout.astro pointing at `/favicon.ico`, `/favicon.svg`, `/favicon-16.png`, `/favicon-32.png`, `/apple-touch-icon.png` and have all 5 resolve.
- **Plan 04 Header/Footer:** Header.jsx and Footer.jsx can reference `<img src="/mark.svg">` without 404ing — `public/mark.svg` is a byte-identical brand mark served at the web root.
- **Plan 04 sample-data.ts:** Three sample gallery pieces (`sample-cluster-coral`, `sample-cluster-sage`, `sample-cluster-lemon`) have real `/sample/cluster-*.svg` photo paths to render against. The 3-card gallery shell will paint without 404s.
- **Phase 2 (real product photography):** When real WebPs land in `src/content/gallery/<slug>/`, the three placeholder SVGs and the sample slugs in `sampleGallery` are deleted in one PR. No code-side migration required.

## Self-Check: PASSED

Files verified:
- FOUND: scripts/generate-favicons.mjs
- FOUND: public/favicon.ico
- FOUND: public/favicon-16.png
- FOUND: public/favicon-32.png
- FOUND: public/favicon.svg
- FOUND: public/apple-touch-icon.png
- FOUND: public/mark.svg
- FOUND: public/favicon/README.md
- FOUND: public/sample/cluster-coral.svg
- FOUND: public/sample/cluster-sage.svg
- FOUND: public/sample/cluster-lemon.svg

Commits verified:
- FOUND: 17abcfe (feat(01-03): generate favicon set + public mark.svg via icon-gen)
- FOUND: 8ea8cac (feat(01-03): add 3 SVG placeholder gallery cards (REVIEW FIX M3))
