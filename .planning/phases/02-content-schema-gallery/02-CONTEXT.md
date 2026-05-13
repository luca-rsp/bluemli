# Phase 2: Content Schema & Gallery - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Define the three strict Zod content collections (`gallery`, `popups`, `site`) in `src/content.config.ts` with per-slug image co-location, ship a `prebuild` image pipeline that turns raw founder uploads (HEIC/JPEG/PNG, any size) into responsive WebP variants at build time, and render `/gallery` (grid) + `/gallery/<slug>` (per-piece detail) live on preview — so the founder can edit any piece's `index.md` via the GitHub web UI and see it on a preview deploy within ~5 minutes. `CONTENT_EDITING.md` ships at repo root with screenshots of the GitHub web UI flow.

**Not in this phase:** the landing page composition with the featured carousel (Phase 3), the popups page rendering (Phase 3 — Phase 2 only defines the schema), the `/api/contact` endpoint (Phase 4), DNS cutover to apex (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Image Pre-Optimization Workflow

- **D-01:** **Build-time variant generation, gitignored output.** Per-slug folder contains exactly two committed files: `index.md` (frontmatter) + `hero.{heic|jpg|jpeg|png}` (the raw source photo). A `prebuild` Node script (sharp + heif-convert) reads every `src/content/gallery/*/hero.*` and writes responsive WebP variants to `public/gallery/<slug>/hero-{400,800,1600}.webp`. The `public/gallery/` path is **gitignored** — variants are build artifacts, regenerated on every build, never committed. Astro automatically bundles `public/` into `dist/client/` at build time. Result: one CI build per push, zero bot commits, clean source tree, single source of truth per piece.

- **D-02:** **Hero-only for v1; multi-photo deferred to v1.x.** Schema's `photos` (from CNT-03) collapses to a single `hero: image()` field. One photo per piece. Multi-photo carousel / detail thumbnails become a v1.x feature when the founder asks. **Note:** This modifies CNT-03 — the spec's `photos: array` becomes singular `hero` for v1.

- **D-03:** **3 responsive widths: 400 / 800 / 1600.** WebP only. Aspect ratio preserved via sharp `fit: 'inside'` (no cropping in the prebuild step — cropping is a CSS concern at render time). 400w for grid thumbnail on phones, 800w for detail-page on phones + grid on desktop, 1600w for Retina detail-page hero on 2x displays. Smallest realistic set that covers phones, desktop, and Retina.

- **D-04:** **HEIC supported end-to-end via pure-JS `heic-convert` (amended 2026-05-13).** Prebuild script detects `.heic` extensions and uses the `heic-convert@2.1.0` npm package to decode HEIC to a JPEG buffer in-memory, then pipes the buffer to sharp for WebP resize. **No system dependency on `libheif-dev`.** The originally proposed `apt-get install libheif-dev` CI step is NOT required and is omitted. Founder uploads whatever her iPhone produces — no manual format conversion required, no need to toggle iOS Camera → Formats → Most Compatible. *Amended during Phase 2 research (RESEARCH.md §2): sharp's prebuilt binaries don't include HEIC support regardless of system `libheif`, and `heic-convert` is the smallest-dependency, pure-JS path that works headlessly in CI.*

- **D-05:** **No staging folder.** The per-slug folder under `src/content/gallery/<slug>/` is the canonical drop location. The earlier "incoming/" pattern was considered and rejected in favor of this single-location model — it eliminates the staging-cleanup question and keeps the founder workflow identical (drop one file via GitHub web UI, done).

### Seed Content Strategy

- **D-06:** **Ship with 6 real founder photos.** Six HEIC files (originally `IMG_6327`, `6329`, `6330`, `6333`, `6334`, `6336.HEIC`) provided by the user have already been moved to:
  ```
  src/content/gallery/cluster-blush/hero.heic
  src/content/gallery/cluster-cobalt/hero.heic
  src/content/gallery/cluster-coral/hero.heic
  src/content/gallery/cluster-lavender/hero.heic
  src/content/gallery/cluster-saffron/hero.heic
  src/content/gallery/cluster-sage/hero.heic
  ```
  Slugs are palette-spread placeholders picked by Claude (the photos were not visually inspected). Founder renames slugs later via GitHub web UI if desired (folder rename = edit-file-path on `index.md`).

- **D-07:** **Brand-voiced realistic placeholder metadata.** Phase 2's executor writes `index.md` for each piece with: name matching slug color (e.g., "Coral cluster"), `price` spread $42–$58 (integer USD), `status: available`, `published_at: 2026-05-13`, `featured: true`, and a one-sentence brand-voice description per piece. Founder flips name/price/description to real via GitHub web UI piece by piece, on her own timeline. **Risk mitigation:** preview only — apex domain cutover is Phase 5, so no real customer sees the placeholders.

- **D-08:** **No ceremonial dry-run.** Phase 2's SC1 verification is met by the natural founder workflow: when she edits one of the six placeholder pieces to real metadata via the GitHub web UI, the workflow is demonstrated end-to-end. No separate "add a 7th piece" dry-run is required (rejected as over-ceremony).

### Detail Page Composition

- **D-09:** **Photo-forward single column for `/gallery/<slug>`.** Layout (top to bottom): big hero photo (full viewport width on mobile, max ~720px on desktop, native aspect ratio preserved) → name (hand-display font, `--font-display`) → price + status badge on one line → 1–2 sentence description (Nunito) → IG CTA button → small `hi@studiobluemli.com` text link as fallback → small back-to-gallery link at bottom. Single column at all viewports.

- **D-10:** **Photo aspect ratio: native on detail page, CSS-cropped to 4/5 in the grid card.** The prebuild script preserves the source photo's aspect ratio (sharp `fit: 'inside'`). The detail page renders `<img>` at native ratio. The grid card uses CSS `object-fit: cover; aspect-ratio: 4/5;` to keep cards uniform (same pattern as the existing `GalleryGrid.jsx`).

- **D-11:** **Sold pieces keep the IG CTA; copy adjusts.** Sold pieces remain visible (CNT-10). On the detail page, the CTA button text flips from "Ask about this piece on Instagram" → "This pair sold — DM me about something similar." Same target (`https://ig.me/m/studiobluemli`). Status badge renders "Sold" in muted indigo (a quiet editorial label, not a red stamp — CNT-10).

- **D-12:** **Per-piece `og:image` uses the 800w variant.** Absolute URL pointing at `https://studiobluemli.com/gallery/<slug>/hero-800.webp` (or the preview hostname). 800w is a good balance for IG/iMessage unfurl preview cards — bigger than necessary at typical preview-card sizes, future-proof for Retina.

- **D-13:** **Inline `mailto` fallback near the IG CTA.** Per Pitfall 20's "always show an alternative" principle — even though the IG CTA itself is a real `<a>` link that works without JS, the detail page renders a small `hi@studiobluemli.com` text link beneath the button as a second path.

### Sort + Featured Mechanics

- **D-14:** **Sort key: `published_at` (ISO date string), required field, newest-first default sort on `/gallery`.** Frontmatter format: `published_at: 2026-05-13`. CONTENT_EDITING.md instructs the founder: "set this to today's date when you add a new piece." Predictable, no integer management, future-CMS-compatible (Decap / Sveltia / Tina all handle date fields natively). The `order` (manual int) alternative from CNT-03 is rejected.

- **D-15:** **`featured: z.boolean().default(false)`.** Plain boolean. Phase 3 landing page picks the 6 most-recent featured pieces (sorted by `published_at` desc). If the founder marks zero pieces featured, Phase 3 falls back to "newest 6 regardless." If she marks 20, only the newest 6 surface. Phase 3 consumes this; Phase 2 only ships the schema field. **Seed:** all 6 seeded pieces ship with `featured: true` so Phase 3 has explicit picks on day one.

### Schema Adjustments to CNT-03 (record-of-divergence)

Two REQUIREMENTS.md / ROADMAP.md edits required during planning to keep the spec aligned:

- **D-16:** **CNT-03 `photos` → `hero`.** Singular `hero: image()` (required) replaces array `photos`. Multi-photo carry-over deferred to v1.x.
- **D-17:** **CNT-03 sort key: pick `published_at` (drop the "`order` or" alternative).** Schema field name: `published_at`, ISO date string, required.

### Claude's Discretion

- Exact sharp options for HEIC decode (in-memory via `heic-convert` npm package vs `heif-convert` CLI vs `libvips`'s built-in HEIC support) — planner picks based on the smallest-dependency option.
- Prebuild trigger mechanism (a `prebuild` npm script invoked by `pnpm build` vs an Astro integration with a `astro:config:setup` / `astro:build:setup` hook vs a Vite plugin) — planner picks. The build-time pipeline contract is fixed; the implementation strategy is open.
- WebP quality setting (default 75 is the recommendation; planner may tune up to 80 if visual quality concerns arise during planning).
- Whether to emit a tiny LQIP / blurhash placeholder for the grid (cosmetic; default to "no" unless mobile FCP shows visible empty squares during preview testing).
- Exact CSS for the gallery grid (the existing `GalleryGrid.jsx` already does `repeat(auto-fill, minmax(260px, 1fr))` — planner reuses, tunes if needed).
- The 1-sentence brand-voice placeholder description per piece — planner / executor writes these in keeping with the design skill's voice rules.
- Whether `src/sample-data.ts` is deleted before or after the Content Collections come online (planner sequences; brand-rule Rule 7 grep should fire on any surviving "Sample Piece" / `price: 0` markers in `src/content/`).
- Astro Content Collections file location (`src/content.config.ts` is the current Astro 6 convention vs `src/content/config.ts`) — planner pins against current Astro docs.
- Exact CSS structure for the detail page (Astro scoped `<style>` block in `src/pages/gallery/[slug].astro` vs a reusable component in `src/components/`) — planner picks.
- Whether `og:image` is emitted by `BaseLayout.astro` (which doesn't know the piece) or by a per-page `<Astro.props>` mechanism / new `<SEO />` component — planner picks. PAG-07 ships the shared `SEO.astro` component in Phase 3, so Phase 2 may either (a) inline the og:image on each detail page, or (b) add a minimal `<SEO />` component now that Phase 3 extends.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning (always)
- `.planning/PROJECT.md` — Project overview, constraints, brand non-negotiables, Out of Scope
- `.planning/REQUIREMENTS.md` §CNT-01..CNT-12 — the 12 content requirements traced to Phase 2 (note D-16, D-17 modify CNT-03)
- `.planning/ROADMAP.md` §"Phase 2: Content Schema & Gallery" — goal, SC1..SC5, key risks/pitfalls
- `.planning/STATE.md` — Locked decisions from prior research (per-slug folders, WebP pre-opt tool flagged as open — resolved here)
- `CLAUDE.md` — Project conventions, technology stack table (`zod@4`, `astro:assets`, `astro/loaders`, `passthroughImageService()`), "What NOT to Use"

### Phase 1 carry-over (read before planning Phase 2)
- `.planning/phases/01-foundations-brand-system/01-CONTEXT.md` — D-01..D-21 from Phase 1; sample-data.ts (D-02, D-03) gets deleted in Phase 2; brand-rule Rule 7 grep (Phase 1 CI) uncommented in Phase 2
- `.planning/phases/01-foundations-brand-system/01-VERIFICATION.md` — Phase 1 anti-patterns and quality flags; CR-03 (ProductSheet unused), CR-05 (Rule 1 `#FFF` 3-digit miss) carry into Phase 2 cleanup territory; CR-04 (PopupStrip TZ bug) is Phase 3, not Phase 2

### Pitfalls relevant to Phase 2
- `.planning/research/PITFALLS.md` #6 (sold pieces removed not marked) — addressed by D-11 + CNT-10 enum
- `.planning/research/PITFALLS.md` #8 (unoptimized photos blow up LCP) — addressed by D-01..D-04 (prebuild WebP pipeline)
- `.planning/research/PITFALLS.md` #11 (Zod schema not strict, allows typos) — addressed by `.strict()` on all 3 collections (CNT-01)
- `.planning/research/PITFALLS.md` #12 (image filename rename breaks references) — addressed by `image()` schema helper (D-02) + per-slug co-location (CNT-02)
- `.planning/research/PITFALLS.md` #23 (founder workflow requires CLI) — addressed by `CONTENT_EDITING.md` + zero-CLI prebuild pipeline (D-01)
- `.planning/research/PITFALLS.md` Anti-feature list — never delete a piece, never write "under $100", never use flower vocabulary in alt text

### Brand & design
- `.claude/skills/studio-bluemli-design/SKILL.md` — Brand non-negotiables (no flowers, cream not white, no center bead, ♡/♥ only emoji)
- `.claude/skills/studio-bluemli-design/colors_and_type.css` — Color + font tokens used by detail page name (`--font-display`), description (`--font-body`), CTA button (`--coral-500` etc.)
- `.claude/skills/studio-bluemli-design/README.md` — Voice rules ("warm, casual, founder-first, sentence-case, friendly parentheticals, no emoji") used when writing placeholder descriptions

### Existing code to read before extending
- `src/components/design-skill/GalleryGrid.jsx` — Already takes `pieces` prop with `slug/name/price/status/photo` shape (D-10 keeps this CSS pattern; the prop shape may need to add `description`/`published_at` for grid display)
- `src/sample-data.ts` — Soon-to-be-deleted Phase 1 throwaway; Phase 2 plan must sequence its removal alongside Rule 7 grep enabling
- `src/layouts/BaseLayout.astro` — Where global `<head>` lives; per-piece `og:image` (D-12) may need a slot or `<Astro.props>` plumbing
- `src/pages/gallery.astro` — Phase 1 wired this to `sampleGallery`; Phase 2 rewires to `await getCollection('gallery')`
- `astro.config.mjs` — Already has `passthroughImageService()` configured (Phase 1); Phase 2 may add Astro integration for prebuild hook

### External docs to consult during research/planning
- Astro 6 Content Collections guide — `glob()` loader for `src/content/gallery/*/index.md`; `image()` schema helper; `.strict()` Zod usage
- Astro 6 image guide — `passthroughImageService()` semantics; what gets bundled from `public/` into `dist/client/`
- Cloudflare Workers Builds CI environment — confirm `ubuntu-latest` allows `apt-get install libheif-dev` (yes; standard)
- `sharp` npm package docs — HEIC support, `fit: 'inside'`, WebP quality tuning
- `heic-convert` or `heic-decode` npm package — JS-only HEIC decoder if `libheif`-based sharp HEIC support isn't viable

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/components/design-skill/GalleryGrid.jsx`** — Phase 1 already takes a `pieces` prop with the shape Phase 2 needs (slug/name/price/status/photo). Phase 2 swaps the data source from `sampleGallery` to `await getCollection('gallery')` + a small mapper. May need to extend the prop shape with `description` or `published_at` for sort.
- **`src/pages/gallery.astro`** — Phase 1 wired GalleryGrid to sample data; Phase 2 rewires the import + adds `getCollection`.
- **`src/components/design-skill/ProductSheet.jsx`** — Phase 1 verification (CR-03) flagged this as unused. Phase 2 either wires it to the detail page or deletes it; D-09 picks photo-forward single column on the actual route, so ProductSheet (a modal) likely stays deferred and may be removed for cleanliness.
- **`.claude/skills/studio-bluemli-design/colors_and_type.css`** (synced to `src/styles/`) — Tokens for hand-display name, Nunito description, coral CTA, muted-indigo "Sold" badge.

### Established Patterns
- **`passthroughImageService()`** is non-negotiable — Sharp doesn't run in `workerd` at runtime. The build-time prebuild script is the *only* place that runs sharp, and it runs on the CI Linux runner. (Note: per amended D-04, HEIC decoding is handled by pure-JS `heic-convert` — no system `libheif` dependency required.)
- **Brand non-negotiables enforced by CI grep** — every placeholder description must avoid `flower|petal|floral|bloom|blossom`; Phase 1's brand-check Rule 2 currently excludes `colors_and_type.css` + `src/components/design-skill/` but DOES scan `src/content/`. Phase 2's seed `index.md` files MUST pass the rule.
- **Per-slug folders are LAW** — never put gallery photos in `public/` (Pitfall #8) or `src/assets/`. Always `src/content/gallery/<slug>/hero.*`.
- **`.strict()` on every collection schema** — typos like `availabilty` fail the build with a clear Zod message.
- **Output mode `output: 'server'` + `export const prerender = true` on every page** — Phase 1's contract. Detail pages under `src/pages/gallery/[slug].astro` must declare `prerender = true` and use `getStaticPaths()` to enumerate all slugs at build time.
- **`src/pages/` filenames are lowercase-only** — CI enforces. Dynamic-route file is `src/pages/gallery/[slug].astro` (lowercase brackets and slug).

### Integration Points
- `src/content.config.ts` ← (new in Phase 2) ← defines all 3 collections, imported by every page using `getCollection()`
- `src/pages/gallery.astro` ← swaps `sampleGallery` import for `getCollection('gallery')` + applies `published_at` desc sort
- `src/pages/gallery/[slug].astro` ← (new in Phase 2) ← detail page with `getStaticPaths()` enumerating all gallery slugs
- `public/gallery/<slug>/hero-*.webp` ← (gitignored, generated each build) ← `prebuild` sharp script ← `src/content/gallery/<slug>/hero.*`
- `BaseLayout.astro` ← may extend to accept a per-page `ogImage` prop for D-12 (or Phase 2 inlines the meta tag on the detail page directly and Phase 3's PAG-07 refactor pulls it into the shared `<SEO />` component)
- `.github/workflows/ci.yml` ← Phase 2 adds a single `Generate responsive WebP variants` step BEFORE the `Build` step (calls `pnpm run prebuild:images`). **No `apt-get install libheif-dev` step is needed** — superseded by D-04's amendment: pure-JS `heic-convert@2.1.0` removes the system-libheif requirement (see RESEARCH.md §2).
- `scripts/check-brand-rules.sh` ← Phase 2 uncomments Rule 7 (sample-marker grep: `Sample Piece|price: 0` under `src/content/`)
- `.gitignore` ← Phase 2 adds `public/gallery/` so the build-time variants don't get committed
- `package.json` ← Phase 2 adds `sharp` + (optionally) `heic-convert` as devDependencies; wires `prebuild` script (or uses Astro integration hook instead)

</code_context>

<specifics>
## Specific Ideas

- **The user (engineer Luca) said "I want it clean and neat. I also don't want to run unnecessary builds on GitHub or Cloudflare to save budget."** This drove D-01 — build-time generation with gitignored output, no bot commits, single CI build per push. Stay loyal to this constraint when planning the prebuild script.
- **6 real photos already in repo at chosen slug paths.** Founder provided them mid-discussion. Slugs `cluster-{blush, cobalt, coral, lavender, saffron, sage}` are placeholder; founder may rename. Photos are HEIC.
- **Founder gave creative license on placeholder metadata** ("you can make something up as placeholder"). Brand-voiced realistic placeholders (D-07) — never $0 fake markers. Preview-only safety net since apex cutover is Phase 5.
- **Don't over-complicate** — feedback during discussion. Skip ceremony (no dry-run gate), prefer the cleanest mental model over the most-feature-complete option.
- **Schema is permitted to deviate from CNT-03** — D-16 (singular `hero`, not `photos` array) and D-17 (`published_at`, not `order`) are explicit narrow modifications. Planner updates REQUIREMENTS.md / ROADMAP.md narrative to match before/during execution.

</specifics>

<deferred>
## Deferred Ideas

- **Multi-photo per piece (carousel, detail thumbnails)** — v1.x. Schema migration from singular `hero` to plural `photos` array required. Founder workflow stays the same (drop additional files into per-slug folder, prebuild numbers them).
- **Browser-side HEIC conversion at upload time** — v1.x if/when an admin/CMS UI lands.
- **A pre-commit hook running the prebuild locally for instant dev preview** — engineer-only nicety, not founder-relevant. Defer until a second engineer joins.
- **Cloudflare Images (`$5/mo`) replacing the prebuild WebP pipeline** — defer. Free-tier sharp + gitignored output is sufficient for ~30 pieces.
- **Decap / Sveltia / TinaCMS git-backed CMS UI** — file layout deliberately CMS-compatible (per PROJECT.md decision and Phase 1 D-01). Add later if the GitHub web UI workflow becomes friction.
- **Per-piece OG image auto-generation (satori-style cards with brand chrome)** — v1.x. v1 uses the piece's hero photo at 800w as `og:image` (D-12).
- **LQIP / blurhash placeholders for grid cards** — defer until Lighthouse mobile FCP shows visible empty squares during real-content preview testing.
- **Hover transitions on gallery cards** — out-of-scope per PROJECT.md anti-features.
- **Lightbox / fullscreen image overlay on detail page** — out-of-scope per REQUIREMENTS.md Out of Scope.
- **Filter / search / category navigation on `/gallery`** — out-of-scope per REQUIREMENTS.md; revisit at ~50+ pieces.
- **`.ics` calendar export for popups** — Phase 3 v1.x.
- **Contact-form pre-fill from gallery (`?piece=<slug>`)** — Phase 4 v1.x per REQUIREMENTS.md Out of Scope.
- **Per-piece alt text / captions schema fields** — not requested; Phase 2 emits `alt={piece.name}` by default; tighten later if a11y audit flags it.

</deferred>

---

*Phase: 2-Content Schema & Gallery*
*Context gathered: 2026-05-13*
