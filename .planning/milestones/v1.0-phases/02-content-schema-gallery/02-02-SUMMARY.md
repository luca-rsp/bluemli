---
phase: "02"
plan: "02"
subsystem: image-pipeline
tags:
  - heic-convert
  - sharp
  - prebuild
  - image-pipeline
  - ci
dependency_graph:
  requires:
    - "02-01 (base Astro site with passthroughImageService)"
    - "src/content/gallery/<slug>/hero.heic (6 founder photos seeded in D-06)"
  provides:
    - "scripts/prebuild-images.mjs (HEIC→WebP batch converter)"
    - "public/gallery/<slug>/hero-{400,800,1600}.webp (build artifacts, gitignored)"
    - "public/gallery/_manifest.json (actual per-variant dimensions for Plan 04)"
    - "CI step ordering: Install < Prebuild < Typecheck < Build"
  affects:
    - ".github/workflows/ci.yml (prebuild step inserted before Typecheck)"
    - "package.json (sharp + heic-convert devDeps + prebuild:images script)"
    - ".gitignore (public/gallery/ excluded)"
tech_stack:
  added:
    - "sharp@0.34.5 (devDep — WebP encoding, aspect-preserving resize)"
    - "heic-convert@2.1.0 (devDep — pure-JS HEIC decoder, no libheif-dev needed)"
  patterns:
    - "heic-convert ArrayBuffer → Buffer.from() → sharp pipeline"
    - "readdir + HERO_REGEX case-insensitive discovery"
    - "rm -rf public/gallery/ at start for stale cleanup"
    - "sharp().metadata() for actual dimensions in manifest"
key_files:
  created:
    - "scripts/prebuild-images.mjs"
    - "public/gallery/_manifest.json (build artifact, gitignored)"
    - "public/gallery/<slug>/hero-{400,800,1600}.webp (18 files, gitignored)"
  modified:
    - "package.json"
    - "pnpm-lock.yaml"
    - ".gitignore"
    - ".github/workflows/ci.yml"
decisions:
  - "Use heic-convert@2.1.0 (pure JS) not libheif-dev apt step — sharp prebuilt binaries ignore system libheif"
  - "Explicit CI step not npm prebuild lifecycle hook — pnpm 10 silently skips pre/post hooks"
  - "Prebuild runs BEFORE Typecheck (not just before Build) — Plan 04 [slug].astro statically imports _manifest.json"
  - "Stale cleanup via rm -rf at script start — handles slug renames/removals"
  - "Case-insensitive HERO_REGEX — tolerates HERO.HEIC, Hero.JPG, etc. from founder camera filenames"
metrics:
  duration: "~8 minutes"
  completed: "2026-05-13"
  tasks_completed: 3
  files_modified: 5
---

# Phase 2 Plan 2: Image Pipeline (HEIC → WebP Prebuild) Summary

Deterministic image pipeline using pure-JS heic-convert@2.1.0 + sharp@0.34.5 that converts founder iPhone HEIC uploads into 3-width responsive WebP variants at CI build time, emits a per-variant dimensions manifest, and wires into the CI workflow before the Typecheck step.

## What Was Built

### Pipeline Contract

**Input:** `src/content/gallery/<slug>/hero.*` where `*` matches `/^hero\.(heic|jpg|jpeg|png)$/i` (case-insensitive — tolerates `HERO.HEIC`, `Hero.JPG`, etc.)

**Output:**
- `public/gallery/<slug>/hero-400.webp` (400px wide, aspect-preserving)
- `public/gallery/<slug>/hero-800.webp` (800px wide, aspect-preserving)
- `public/gallery/<slug>/hero-1600.webp` (1600px wide, aspect-preserving)
- `public/gallery/_manifest.json` (per-slug, per-variant `[width, height]` pairs)

**Quality:** WebP 80 (chosen for jewelry photography — richer color detail than the default 75, still ~60% smaller than source HEIC).

**Widths:** 400 / 800 / 1600 (D-03). `fit: 'inside'` preserves native aspect ratio. `withoutEnlargement: true` prevents upscaling if source is smaller than a target width.

### Manifest Schema

Consumed by Plan 04's `[slug].astro` for CLS-safe `width`/`height` attributes:

```json
{
  "cluster-blush":  { "hero-400": [400, 533], "hero-800": [800, 1067], "hero-1600": [1600, 2133] },
  "cluster-cobalt": { "hero-400": [400, 533], "hero-800": [800, 1067], "hero-1600": [1600, 2133] }
}
```

All 6 founder photos are 3:4 portrait ratio (3/4 × 400 = 533, etc.).

### Slug Validation

Script rejects folder names violating `/^[a-z0-9-]+$/` with a hard-fail and a descriptive error naming the offending slug (MEDIUM-7). This prevents broken URLs from spaces, uppercase letters, or punctuation in folder names.

### HEIC Decoding

Uses `heic-convert@2.1.0` (pure JS, no system deps). Sharp's prebuilt binaries bundle a `libvips` compiled WITHOUT `libheif` — installing `libheif-dev` on the CI runner would have NO effect on sharp's HEIC support. The `heic-convert` package decodes HEIC to an `ArrayBuffer`; the script wraps it with `Buffer.from(arrayBuffer)` before passing to sharp (critical — omitting the wrap fails silently in some Node versions).

### Stale Cleanup

Script removes `public/gallery/` entirely at start (`rm -rf`) before regenerating. This handles slug renames and removals during local development — a renamed folder no longer leaves an orphan directory.

### CI Ordering (BLOCKER #1 Closure)

The prebuild step runs **BEFORE Typecheck** (not just before Build):

```
Install dependencies → Generate WebP variants (prebuild) → Typecheck → Build
```

This order is required because Plan 04's `[slug].astro` statically imports `public/gallery/_manifest.json`. With `astro/tsconfigs/strict` + `resolveJsonModule`, `astro check` resolves that JSON import at type-check time — the file must exist on disk before `astro check` runs. The same file is also needed by `astro build` (copies `public/` into `dist/client/`). One reordered step satisfies both consumers.

### Build Artifact Confirmation

`astro build` copies everything in `public/` into `dist/client/` verbatim (Assumption A1 from RESEARCH.md). After the prebuild runs and `astro build` completes:
- `dist/client/gallery/cluster-blush/hero-800.webp` exists
- `dist/client/gallery/_manifest.json` exists

This confirms the WebP variants and manifest are included in the Cloudflare Static Assets deploy bundle.

## Deviations from Plan

None. Plan executed exactly as written.

The plan's `<verify>` block for Task 2 included programmatic stale-cleanup and case-insensitive hero discovery checks — both passed:
- Stale cleanup: created `public/gallery/orphan-slug/`, ran prebuild, confirmed directory absent afterward.
- Case-insensitive: renamed `cluster-blush/hero.heic` → `HERO.HEIC`, ran prebuild, confirmed `hero-800.webp` still produced, restored original file.

## Security / Threat Surface

T-02-04 (HEIC parse-bomb DoS): heic-convert throws on malformed input → script exits non-zero → CI build fails. No try/catch wrapping the conversion — error surfaces loudly. CI `timeout-minutes: 10` bounds a hung decode.

T-02-05 (EXIF/GPS leakage): sharp's WebP encoder strips EXIF/IPTC/XMP by default. The script does NOT call `.withMetadata()`.

T-02-16 (broken URL from bad folder name): Slug regex `/^[a-z0-9-]+$/` hard-fails before any variant is generated, with an error naming the offending slug.

## Plan 04 Consumption Points

Plan 04 (`[slug].astro`) consumes:
- `<img src="/gallery/${slug}/hero-800.webp" srcset="...hero-800.webp 800w, ...hero-1600.webp 1600w" ...>` — served as Cloudflare static assets
- `import manifest from '../../../public/gallery/_manifest.json'` — provides `[width, height]` for CLS-safe attributes

## Self-Check: PASSED

| Item | Status |
|------|--------|
| scripts/prebuild-images.mjs | FOUND |
| package.json (sharp + heic-convert + script) | FOUND |
| pnpm-lock.yaml (updated) | FOUND |
| .gitignore (public/gallery/) | FOUND |
| .github/workflows/ci.yml (prebuild step) | FOUND |
| Task 1 commit ba9799d | FOUND |
| Task 2 commit c9ac53a | FOUND |
| Task 3 commit 0246e22 | FOUND |
