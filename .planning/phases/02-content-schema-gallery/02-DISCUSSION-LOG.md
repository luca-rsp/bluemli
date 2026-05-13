# Phase 2: Content Schema & Gallery - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 2-content-schema-gallery
**Areas discussed:** Image pre-optimization workflow, Initial seed content on preview, Detail page composition, Sort + featured mechanics

---

## Image pre-optimization workflow

### Q1 — How should the WebP variants be produced and stored?

| Option | Description | Selected |
|--------|-------------|----------|
| Build-time generation, gitignored output (Recommended) | Per-slug folder has `index.md` + `hero.jpg` only. A `prebuild` Node script (using sharp) reads every `src/content/gallery/*/hero.jpg`, writes variants to `public/gallery/<slug>/hero-{400,800,1600}.webp` (gitignored). Astro bundles `public/` into `dist/` automatically. One CI build per push, no bot commits, source tree is clean. | ✓ |
| Drop folder → commit variants alongside source | Drop folder `incoming/<slug>/hero.jpg`. Local watcher during `pnpm dev` (chokidar + sharp) emits variants into per-slug folder, deletes incoming file, creates stub `index.md`. Variants ARE committed. Engineer-only flow. | |
| Drop folder → Astro build-time integration | Drop folder `incoming/<slug>/hero.jpg` (committed). Astro/Vite integration at build time emits variants to `dist/client/...` (deployed only, not committed). Originals accumulate forever in `incoming/`. | |

**User's choice:** Build-time generation, gitignored output (Recommended)

**Notes:** User explicitly framed the constraint as "clean and neat, no unnecessary builds on GitHub or Cloudflare to save budget." Discussion explored a drop-folder pattern, then analyzed the cost of bot commits (GITHUB_TOKEN doesn't trigger downstream workflows, double Cloudflare deploys, PR commit noise, loop risk). Reframed: the optimized variants are build artifacts, treat them like `dist/` — no need for a staging area at all. The per-slug folder IS the canonical location for the single source `hero.*`.

### Q2 — How should multi-photo pieces work?

| Option | Description | Selected |
|--------|-------------|----------|
| Numbered convention (Recommended) | Per-slug folder: `hero.jpg` + optional `02.jpg`, `03.jpg`. Frontmatter `photos` array auto-inferred from file list. | |
| Frontmatter-driven explicit list | Frontmatter lists `photos: [hero.jpg, side.jpg, ...]`. More control, two places to keep in sync. | |
| Hero-only for v1, defer multi-photo to v1.x | Schema's `photos` collapses to a single `hero` field. One photo per piece. | ✓ |

**User's choice:** Hero-only for v1, defer multi-photo to v1.x

**Notes:** Simpler script, simpler founder workflow. Schema modification: CNT-03 `photos: array` → singular `hero: image()`.

### Q3 — Which responsive-width set?

| Option | Description | Selected |
|--------|-------------|----------|
| 3 widths: 400 / 800 / 1600 (Recommended) | Covers phones, desktop, Retina. ~50–80KB at 800w typical. | ✓ |
| 4 widths: 320 / 640 / 960 / 1920 | Finer granularity. 33% more storage + sharp time. | |
| 2 widths: 800 / 1600 | Simpler script, slightly oversized images on phones. | |

**User's choice:** 3 widths: 400 / 800 / 1600 (Recommended)

### Q4 — How to handle iPhone HEIC?

| Option | Description | Selected |
|--------|-------------|----------|
| JPEG/PNG only, document the workaround (Recommended) | Build fails on `.heic`. Document AirDrop / iOS Camera setting workaround in CONTENT_EDITING.md. | |
| Support HEIC end-to-end | CI installs `libheif-dev`. Prebuild auto-converts HEIC → JPEG before sharp. Founder uploads phone-native format. | ✓ |
| Convert in the browser at upload time | v1.x; requires admin/CMS UI. | |

**User's choice:** Support HEIC end-to-end

---

## Initial seed content on preview

### Q1 — What should `/gallery` show on preview at end of Phase 2?

| Option | Description | Selected |
|--------|-------------|----------|
| Seed 6 pieces from design skill | Sync 6 product photos from `.claude/skills/studio-bluemli-design/assets/product/`. | |
| Seed 3 pieces, leave 3 for founder | Half-populated; founder demonstrates "add a piece" on remaining 3. | |
| Empty gallery + dry-run instructions | Empty state copy; founder's dry-run produces first real entry. | |
| Wait for founder's real photos + copy | Phase 2 blocks on founder availability. | |

**User's choice:** (Question reformulated mid-discussion.) User volunteered: "I have the original photo files ready. I can put them wherever you want so we use them instead of some scraped examples." Six HEIC files (`IMG_6327`, `6329`, `6330`, `6333`, `6334`, `6336.HEIC`) were dropped in the repo root and moved by Claude into `src/content/gallery/cluster-{blush, cobalt, coral, lavender, saffron, sage}/hero.heic`. Slugs are placeholder palette-spread (photos not visually inspected).

**Notes:** Question collapsed: 6 real photos seeded with placeholder metadata to be written by Phase 2's executor.

### Q2 — How should placeholder metadata read?

| Option | Description | Selected |
|--------|-------------|----------|
| Brand-voiced realistic placeholders (Recommended) | Slug-color names, $42–$58 prices, all `available`, brand-voice 1-sentence descriptions. Looks like a real working store. | ✓ |
| Obvious placeholders ($0 + "TBD" copy) | Impossible to mistake for real. Scaffold-y preview. | |
| Empty descriptions, real-ish names, no price | Quiet visual; requires relaxing CNT-03's required-price field. | |

**User's choice:** Brand-voiced realistic placeholders (Recommended)

**Notes:** Mitigation = preview-only; apex cutover is Phase 5.

### Q3 — Founder dry-run question

**Status:** Rejected as over-ceremony by user feedback ("are you over-complicating things?"). SC1 verification is met by the natural founder workflow (her first real edit demonstrates the GitHub web UI flow end-to-end). No separate ceremony required.

---

## Detail page composition

### Q1 — Basic shape of `/gallery/<slug>`?

| Option | Description | Selected |
|--------|-------------|----------|
| Photo-forward single column (Recommended) | Hero photo top, name (hand-display), price + status, description, CTA, back link. Editorial. | ✓ |
| Two-column on desktop, stacked on mobile | Photo left, metadata right (desktop ≥ 900px). More "product page" feel. | |
| Sketch later — minimal detail page | Ship photo + name + price + status + CTA only; polish post-Phase-2. | |

**User's choice:** Photo-forward single column (Recommended)

### Q2 — Sold-piece CTA copy?

| Option | Description | Selected |
|--------|-------------|----------|
| Same IG CTA, copy adjusts (Recommended) | "This pair sold — DM me about something similar." | ✓ |
| Soften the CTA visually, same copy | Outlined button vs solid coral. Same "ask about this piece" copy. | |
| No CTA on sold pieces | Photo + name + 'Sold' + description only. | |

**User's choice:** Same IG CTA, copy adjusts (Recommended)

**Notes:** Claude-discretion items: photo aspect ratio (native on detail page, 4/5 crop on grid card via CSS `object-fit: cover`); inline `mailto` fallback near the CTA per Pitfall #20.

---

## Sort + featured mechanics

### Q1 — Primary sort key?

| Option | Description | Selected |
|--------|-------------|----------|
| `published_at` date, newest first (Recommended) | ISO date in frontmatter. Founder sets to today's date when adding. | ✓ |
| Manual `order` integer, lowest first | Founder controls ordering. More friction at web UI. | |
| Filesystem-derived (no field) | Sort by git commit date. Implicit; harder to reason about. | |

**User's choice:** `published_at` date, newest first (Recommended)

**Notes:** Modifies CNT-03's "`order` or `published_at`" — picks `published_at` and drops `order`.

### Q2 — How should `featured: true` work?

| Option | Description | Selected |
|--------|-------------|----------|
| Plain boolean, Phase 3 picks newest 6 (Recommended) | Phase 3 landing carousel = 6 most-recent featured (fallback: newest 6 regardless). | ✓ |
| Manual `featured_order` integer | Founder controls exact order. Fiddly. | |
| No featured flag in Phase 2 schema | Phase 3 derives from `published_at` only. Less curation. | |

**User's choice:** Plain boolean, Phase 3 picks newest 6 (Recommended)

---

## Claude's Discretion

- HEIC decode mechanism (sharp + libheif vs `heic-convert` npm vs `heif-convert` CLI) — planner picks smallest-dependency option.
- Prebuild trigger (npm `prebuild` script vs Astro integration hook vs Vite plugin) — planner picks.
- WebP quality (default 75; planner may tune to 80 if needed).
- Whether to emit LQIP / blurhash placeholders — defer to mobile FCP measurement.
- Whether to mark seed pieces `featured: true` on Phase 2 ship — Claude picked yes (so Phase 3 carousel has explicit picks day-one).
- 1-sentence brand-voice description per piece — Phase 2 executor writes them in keeping with the design skill's voice rules (no flowers, sentence-case, friendly parentheticals).
- Sequencing `src/sample-data.ts` deletion + Rule 7 grep uncomment.
- Per-piece `og:image` mechanism (inline on detail page in Phase 2 vs early `<SEO />` component that Phase 3's PAG-07 extends) — planner picks.

## Deferred Ideas

- Multi-photo per piece (carousel / detail thumbnails) — v1.x.
- Browser-side HEIC conversion at upload time — v1.x.
- Pre-commit hook for engineer-local instant preview — defer until 2nd engineer.
- Cloudflare Images ($5/mo) — defer; free-tier sharp suffices for ~30 pieces.
- Decap / Sveltia / TinaCMS git-backed CMS UI — file layout stays compatible; add later.
- Per-piece OG-image auto-generation (satori) — v1.x.
- LQIP / blurhash grid placeholders — defer until measured-need.
- Hover transitions on gallery cards — out-of-scope per PROJECT.md.
- Lightbox / fullscreen overlay on detail page — out-of-scope.
- Filter / search / category navigation on `/gallery` — revisit at ~50+ pieces.
- `.ics` calendar export for popups — Phase 3 v1.x.
- Contact-form pre-fill from gallery (`?piece=<slug>`) — Phase 4 v1.x.
- Per-piece alt text / captions schema fields — tighten later if a11y audit flags.
