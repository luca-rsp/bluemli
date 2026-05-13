---
plan_id: 01-03
phase: 1
phase_slug: 01-foundations-brand-system
plan: 03
type: execute
wave: 1
depends_on: []
autonomous: true
requirements: [FND-08]
files_modified:
  - scripts/generate-favicons.mjs
  - public/favicon.ico
  - public/favicon-16.png
  - public/favicon-32.png
  - public/favicon.svg
  - public/apple-touch-icon.png
  - public/mark.svg
  - public/favicon/README.md
  - public/sample/cluster-coral.svg
  - public/sample/cluster-sage.svg
  - public/sample/cluster-lemon.svg
tags: [favicons, public-assets, sample-data, icon-gen]
must_haves:
  truths:
    - "Running `pnpm run favicons` produces favicon.ico, favicon-16.png, favicon-32.png from assets/logo/mark.svg without founder action (D-19)"
    - "public/apple-touch-icon.png is a byte-identical copy of assets/logo/mark-favicon-180.png (D-19 — do NOT regenerate)"
    - "public/mark.svg is a copy of assets/logo/mark.svg so Header.jsx can reference <img src=\"/mark.svg\">"
    - "public/favicon/README.md documents the single-command regen path (D-20)"
    - "public/sample/cluster-{coral,sage,lemon}.svg exist as SVG placeholder cards (cream background + single coral/sage/lemon dot motif + 'Cluster · <color>' label) that GalleryGrid can render in Phase 1 shell (REVIEW FIX M3: SVG, not WebP — avoids the unpinned sharp dep)"
  artifacts:
    - path: "scripts/generate-favicons.mjs"
      provides: "one-shot favicon generation script using icon-gen@5"
      contains: "iconGen"
    - path: "public/favicon.ico"
      provides: "multi-size .ico (16/32/48)"
    - path: "public/apple-touch-icon.png"
      provides: "180x180 iOS home-screen icon (copy of mark-favicon-180.png)"
    - path: "public/mark.svg"
      provides: "header lockup SVG referenced by Header.jsx and Footer.jsx as `/mark.svg`"
    - path: "public/favicon/README.md"
      provides: "regen documentation (D-20)"
  key_links:
    - from: "src/components/design-skill/Header.jsx"
      to: "public/mark.svg"
      via: "<img src=\"/mark.svg\"> (Astro serves anything in public/ from web root)"
      pattern: "src=\"/mark.svg\""
    - from: "src/layouts/BaseLayout.astro (Plan 04)"
      to: "public/favicon.{ico,svg}, public/favicon-{16,32}.png, public/apple-touch-icon.png"
      via: "<link rel=\"icon\" href=\"/favicon.ico\"> etc."
      pattern: "rel=\"icon\""
    - from: "src/sample-data.ts (Plan 04)"
      to: "public/sample/cluster-{coral,sage,lemon}.svg"
      via: "{ photo: '/sample/cluster-coral.svg' } in sampleGallery"
      pattern: "/sample/cluster-"
---

<objective>
Write `scripts/generate-favicons.mjs` and run it once to produce the full Phase 1 favicon set + the `public/mark.svg` copy that the synced Header/Footer reference. Also ship 3 SVG placeholder cards under `public/sample/` (REVIEW FIX M3 — SVG instead of WebP, no sharp dep needed) so Plan 04's sample-data can render placeholder gallery cards without 404s.

Purpose: Ship FND-08 satisfaction (favicon visible in desktop browser tab + iOS home-screen) entirely from automation, no founder action. The `public/` directory is the "static asset web root" that Cloudflare Workers Static Assets serves directly via the ASSETS binding configured in Plan 01.

Output: 8 static files in `public/` plus 1 script + 1 README, all committed to git. ROADMAP SC4 (favicon renders in browser tab + iOS preview) is unblocked.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundations-brand-system/01-CONTEXT.md
@.planning/phases/01-foundations-brand-system/01-RESEARCH.md
@.planning/phases/01-foundations-brand-system/01-PATTERNS.md
@.planning/phases/01-foundations-brand-system/01-UI-SPEC.md

<interfaces>
<!-- Required inputs (verified present in repo): -->
<!-- assets/logo/mark.svg — source SVG for favicon generation -->
<!-- assets/logo/mark-favicon-180.png — existing apple-touch-icon (reuse, do not regen per D-19) -->

<!-- Required outputs (consumed by BaseLayout.astro in Plan 04): -->
<!-- public/favicon.ico — multi-size 16/32/48, generated -->
<!-- public/favicon-16.png — generated -->
<!-- public/favicon-32.png — generated -->
<!-- public/favicon.svg — copy of mark.svg -->
<!-- public/apple-touch-icon.png — copy of mark-favicon-180.png -->
<!-- public/mark.svg — copy of mark.svg (Header.jsx uses <img src="/mark.svg">) -->

<!-- icon-gen@5 API (RESEARCH.md lines 1061-1089): -->
<!-- await iconGen(SVG_IN, OUT_DIR, { report: true, favicon: { name: 'favicon', pngSizes: [16,32], icoSizes: [16,32,48] } }); -->
<!-- icon-gen emits `favicon16.png`/`favicon32.png` (no hyphen); script renames to `favicon-16.png`/`favicon-32.png` to match UI-SPEC <link> tag references -->

<!-- Phase 1 placeholder gallery samples (Plan 04's src/sample-data.ts will reference these paths): -->
<!-- REVIEW FIX M3 (Codex review): switched from WebP to SVG. The WebP path required `sharp`,
     which was either an unpinned transitive dep of icon-gen (not guaranteed by pnpm) or
     would require `pnpm add -D sharp` that mutates package.json/lockfile outside Plan 03's
     declared files_modified. SVG placeholders ship the visual intent (cream card + single
     dot motif + label) without any runtime image library. -->
<!-- /sample/cluster-coral.svg — cream card with a coral cluster dot + "Cluster · Coral" label -->
<!-- /sample/cluster-sage.svg  — cream card with a sage cluster dot + "Cluster · Sage" label -->
<!-- /sample/cluster-lemon.svg — cream card with a lemon cluster dot + "Cluster · Lemon" label -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write scripts/generate-favicons.mjs and run it to produce the favicon set</name>
  <files>scripts/generate-favicons.mjs, public/favicon.ico, public/favicon-16.png, public/favicon-32.png, public/favicon.svg, public/apple-touch-icon.png, public/mark.svg, public/favicon/README.md</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-RESEARCH.md (§"Favicon generation script" lines 1061-1110 — copy verbatim; verified against icon-gen@5 API)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-PATTERNS.md (lines 730-779 — verified shape + critical constraints; D-19/D-20 constraints encoded)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-CONTEXT.md (D-19: "Reuse existing `assets/logo/mark-favicon-180.png` as `apple-touch-icon`. No founder action needed."; D-20: "Document the regen command in a `public/favicon/README.md` so a future regen is one command.")
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-UI-SPEC.md (§"Favicon Set" lines 255-269 — the 5 link tags BaseLayout will emit)
    - Verify inputs exist: `ls assets/logo/mark.svg assets/logo/mark-favicon-180.png`
  </read_first>
  <action>
**Step 1 — Write `scripts/generate-favicons.mjs`** at the path `scripts/generate-favicons.mjs`. Content (per RESEARCH.md lines 1061-1089 verbatim):

```js
// scripts/generate-favicons.mjs
// One-shot favicon generation (D-19, D-20). Runs via: pnpm run favicons
//
// Inputs:
//   assets/logo/mark.svg            — source SVG, drives favicon.ico + favicon-16/32.png + favicon.svg
//   assets/logo/mark-favicon-180.png — existing iOS touch icon (DO NOT regenerate per D-19; copied as-is)
//
// Outputs (committed into public/):
//   favicon.ico             multi-size 16/32/48 .ico
//   favicon-16.png          16x16 PNG
//   favicon-32.png          32x32 PNG
//   favicon.svg             copy of mark.svg
//   apple-touch-icon.png    copy of mark-favicon-180.png
//   mark.svg                copy of mark.svg (Header/Footer reference <img src="/mark.svg">)

import iconGen from 'icon-gen';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const SVG_IN  = 'assets/logo/mark.svg';
const TOUCH_IN = 'assets/logo/mark-favicon-180.png';
const OUT_DIR = 'public';

await fs.mkdir(OUT_DIR, { recursive: true });

await iconGen(SVG_IN, OUT_DIR, {
  report: true,
  favicon: {
    name: 'favicon',
    pngSizes: [16, 32],
    icoSizes: [16, 32, 48],
  },
});

// icon-gen emits favicon16.png and favicon32.png (no hyphen).
// Rename to match UI-SPEC <link> tag references (favicon-16.png / favicon-32.png).
await fs.rename(path.join(OUT_DIR, 'favicon16.png'), path.join(OUT_DIR, 'favicon-16.png'));
await fs.rename(path.join(OUT_DIR, 'favicon32.png'), path.join(OUT_DIR, 'favicon-32.png'));

// Copy the SVG mark in two places:
// - public/favicon.svg → <link rel="icon" type="image/svg+xml">
// - public/mark.svg    → Header.jsx <img src="/mark.svg">
await fs.copyFile(SVG_IN, path.join(OUT_DIR, 'favicon.svg'));
await fs.copyFile(SVG_IN, path.join(OUT_DIR, 'mark.svg'));

// Copy the pre-existing 180x180 PNG as the apple-touch-icon (D-19: no regeneration).
await fs.copyFile(TOUCH_IN, path.join(OUT_DIR, 'apple-touch-icon.png'));

console.log('Generated favicon set in public/:');
console.log('  favicon.ico, favicon-16.png, favicon-32.png');
console.log('  favicon.svg, mark.svg (copies of assets/logo/mark.svg)');
console.log('  apple-touch-icon.png (copy of assets/logo/mark-favicon-180.png, not regenerated per D-19)');
```

**Step 2 — Run the script** from repo root:
```bash
pnpm run favicons
```

Expected output: the "Generated favicon set in public/:" log line followed by the listed files in `public/`.

If `icon-gen` is not installed yet, run `pnpm install` first (it's already a devDependency from Plan 01 Task 1). If the script fails with "ENOENT: assets/logo/mark.svg", verify input file exists at `/Users/lucacanonica/Documents/projects/bluemli/assets/logo/mark.svg`.

**Step 3 — Write `public/favicon/README.md`** (per D-20 and RESEARCH.md lines 1098-1110, content verbatim):
```markdown
# Favicon regeneration

These files are generated from `assets/logo/mark.svg`. To regenerate:

    pnpm run favicons

The script lives at `scripts/generate-favicons.mjs`. It writes:
- favicon.ico (multi-size 16/32/48)
- favicon-16.png
- favicon-32.png
- favicon.svg (copy of mark.svg)
- mark.svg (copy of mark.svg — used by Header.jsx `<img src="/mark.svg">`)
- apple-touch-icon.png (copy of assets/logo/mark-favicon-180.png — DO NOT regenerate, it already has the right styling)
```

**Step 4 — Verify output files exist and are non-empty.** Run:
```bash
ls -la public/favicon.ico public/favicon-16.png public/favicon-32.png public/favicon.svg public/apple-touch-icon.png public/mark.svg public/favicon/README.md
```

Each file must exist with size > 0.

Then verify `apple-touch-icon.png` is byte-identical to the source (D-19: "DO NOT regenerate"):
```bash
diff <(shasum assets/logo/mark-favicon-180.png | cut -d' ' -f1) <(shasum public/apple-touch-icon.png | cut -d' ' -f1)
```
Empty diff = identical = PASS.
  </action>
  <verify>
    <automated>test -f scripts/generate-favicons.mjs && grep -q "icon-gen" scripts/generate-favicons.mjs && grep -q "favicon-16.png" scripts/generate-favicons.mjs && grep -q "mark-favicon-180.png" scripts/generate-favicons.mjs && test -f public/favicon.ico && test -f public/favicon-16.png && test -f public/favicon-32.png && test -f public/favicon.svg && test -f public/apple-touch-icon.png && test -f public/mark.svg && test -f public/favicon/README.md && test -s public/favicon.ico && test -s public/apple-touch-icon.png && test -s public/mark.svg && [ "$(shasum assets/logo/mark-favicon-180.png | cut -d' ' -f1)" = "$(shasum public/apple-touch-icon.png | cut -d' ' -f1)" ] && grep -q "pnpm run favicons" public/favicon/README.md && grep -q "DO NOT regenerate" public/favicon/README.md</automated>
  </verify>
  <acceptance_criteria>
    - File `scripts/generate-favicons.mjs` exists
    - Script contains `import iconGen from 'icon-gen'` and references both `mark.svg` and `mark-favicon-180.png`
    - Script renames icon-gen's `favicon16.png`/`favicon32.png` outputs to `favicon-16.png`/`favicon-32.png` (hyphenated form matching UI-SPEC link tags)
    - File `public/favicon.ico` exists with size > 0
    - File `public/favicon-16.png` exists with size > 0
    - File `public/favicon-32.png` exists with size > 0
    - File `public/favicon.svg` exists with size > 0
    - File `public/apple-touch-icon.png` exists with size > 0
    - File `public/mark.svg` exists with size > 0 (this is what Header.jsx references)
    - File `public/favicon/README.md` exists, contains the regen command `pnpm run favicons` and the warning `DO NOT regenerate` for apple-touch-icon (D-20)
    - `public/apple-touch-icon.png` is byte-identical to `assets/logo/mark-favicon-180.png` (D-19: no regen): the shasum equality check returns true
    - `public/mark.svg` is byte-identical to `assets/logo/mark.svg` (same shasum)
  </acceptance_criteria>
  <done>Favicon set is generated and committed; FND-08 unblocked; Plan 04's BaseLayout can wire 5 `<link rel="icon">` tags against existing files; the regen path is documented in `public/favicon/README.md`.</done>
</task>

<task type="auto">
  <name>Task 2: Write 3 SVG placeholder cards for the Phase 1 gallery shell (REVIEW FIX M3 — no sharp dep)</name>
  <files>public/sample/cluster-coral.svg, public/sample/cluster-sage.svg, public/sample/cluster-lemon.svg</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-PATTERNS.md (line 672 — "ship 3 small flat-color placeholders"; Decisions the Planner Needs to Make #9; sample-data file will reference these paths)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-UI-SPEC.md (§"Demo-Loaded Page Shells" line 327 — gallery shows "3 cards"; Sample piece price `$0`; alt text follows Accessibility Floor pattern)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-CONTEXT.md (D-03: sample data marked obviously — names start with "Sample", prices $0 — so the placeholder images should also look obviously sample-like)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-REVIEWS.md (§"Concerns" MEDIUM bullet — Codex flagged sharp as unpinned)
  </read_first>
  <action>
**REVIEW FIX M3 (Codex review):** The prior version used `sharp` to generate WebPs. Codex flagged that `sharp` is either an unpinned transitive dep of `icon-gen` (not guaranteed by pnpm to be resolvable at the top level) or would require `pnpm add -D sharp` — which mutates `package.json`/`pnpm-lock.yaml` outside this plan's declared `files_modified`. **The fix: ship three plain SVG placeholder cards, committed verbatim into `public/sample/`. No image library, no scripts, no dep.**

**Goal:** Create 3 SVG placeholder cards at `public/sample/cluster-{coral,sage,lemon}.svg`, each ~400×500px viewBox (4:5 aspect — matches the GalleryGrid card aspect ratio from Plan 02), each with a cream background + a single 3-bead cluster motif in the accent color + an embedded text label `Cluster · <Color>` so the founder instantly sees it's a placeholder (not an empty box). These are throwaways — Phase 2 deletes them when real photos arrive.

**Step 1 — Create `public/sample/` directory.**
```bash
mkdir -p public/sample
```

**Step 2 — Write the three SVG files.** Use the Write tool. Each file is committed verbatim — no runtime processing.

**File `public/sample/cluster-coral.svg`** (cream background + coral cluster):
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500" role="img" aria-label="Sample placeholder — coral bead cluster">
  <title>Sample placeholder — coral bead cluster</title>
  <rect width="400" height="500" fill="#F5DCC7"/>
  <!-- 3-bead cluster motif in coral -->
  <circle cx="200" cy="210" r="56" fill="#D6553B" opacity="0.85"/>
  <circle cx="156" cy="184" r="22" fill="#D6553B" opacity="0.65"/>
  <circle cx="246" cy="234" r="22" fill="#D6553B" opacity="0.65"/>
  <circle cx="208" cy="266" r="14" fill="#D6553B" opacity="0.5"/>
  <text x="200" y="380" font-family="ui-sans-serif, system-ui, sans-serif" font-size="32" font-weight="700" fill="#D6553B" text-anchor="middle">Cluster · Coral</text>
  <text x="200" y="416" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="400" fill="#4A4A4A" text-anchor="middle" opacity="0.7">sample placeholder</text>
</svg>
```

**File `public/sample/cluster-sage.svg`** (cream background + sage/olive cluster):
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500" role="img" aria-label="Sample placeholder — sage bead cluster">
  <title>Sample placeholder — sage bead cluster</title>
  <rect width="400" height="500" fill="#F5DCC7"/>
  <circle cx="200" cy="210" r="56" fill="#6E7438" opacity="0.85"/>
  <circle cx="156" cy="184" r="22" fill="#6E7438" opacity="0.65"/>
  <circle cx="246" cy="234" r="22" fill="#6E7438" opacity="0.65"/>
  <circle cx="208" cy="266" r="14" fill="#6E7438" opacity="0.5"/>
  <text x="200" y="380" font-family="ui-sans-serif, system-ui, sans-serif" font-size="32" font-weight="700" fill="#6E7438" text-anchor="middle">Cluster · Sage</text>
  <text x="200" y="416" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="400" fill="#4A4A4A" text-anchor="middle" opacity="0.7">sample placeholder</text>
</svg>
```

**File `public/sample/cluster-lemon.svg`** (cream background + mustard/lemon cluster):
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500" role="img" aria-label="Sample placeholder — lemon bead cluster">
  <title>Sample placeholder — lemon bead cluster</title>
  <rect width="400" height="500" fill="#F5DCC7"/>
  <circle cx="200" cy="210" r="56" fill="#C99A2E" opacity="0.85"/>
  <circle cx="156" cy="184" r="22" fill="#C99A2E" opacity="0.65"/>
  <circle cx="246" cy="234" r="22" fill="#C99A2E" opacity="0.65"/>
  <circle cx="208" cy="266" r="14" fill="#C99A2E" opacity="0.5"/>
  <text x="200" y="380" font-family="ui-sans-serif, system-ui, sans-serif" font-size="32" font-weight="700" fill="#C99A2E" text-anchor="middle">Cluster · Lemon</text>
  <text x="200" y="416" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="400" fill="#4A4A4A" text-anchor="middle" opacity="0.7">sample placeholder</text>
</svg>
```

**Step 3 — Verify all three files exist and are valid SVGs.**
```bash
ls -la public/sample/cluster-coral.svg public/sample/cluster-sage.svg public/sample/cluster-lemon.svg
file public/sample/cluster-coral.svg public/sample/cluster-sage.svg public/sample/cluster-lemon.svg
# Expected: each line ends with "SVG Scalable Vector Graphics image" or "XML"
```

Each file must:
- exist
- have size > 200 bytes
- contain the literal string `<svg` at the start (valid SVG root element)
- contain the brand hex colors as written above (`#F5DCC7` for the cream background)

**Step 4 — Verify package.json was NOT modified by this task** (REVIEW FIX M3 — Codex's specific concern):
```bash
# This task must NOT touch package.json or pnpm-lock.yaml. The only file changes
# are the three new SVGs under public/sample/. If git status shows package.json
# modified, something went wrong.
git status --porcelain package.json pnpm-lock.yaml
# Expected output: empty (no modifications)
```
  </action>
  <verify>
    <automated>test -d public/sample && test -f public/sample/cluster-coral.svg && test -f public/sample/cluster-sage.svg && test -f public/sample/cluster-lemon.svg && test "$(wc -c < public/sample/cluster-coral.svg)" -gt 200 && test "$(wc -c < public/sample/cluster-sage.svg)" -gt 200 && test "$(wc -c < public/sample/cluster-lemon.svg)" -gt 200 && grep -q "<svg" public/sample/cluster-coral.svg && grep -q "<svg" public/sample/cluster-sage.svg && grep -q "<svg" public/sample/cluster-lemon.svg && grep -q "#F5DCC7" public/sample/cluster-coral.svg && grep -q "Cluster · Coral" public/sample/cluster-coral.svg && grep -q "Cluster · Sage" public/sample/cluster-sage.svg && grep -q "Cluster · Lemon" public/sample/cluster-lemon.svg && ! ls public/sample/ | grep -Ei "flower|petal|floral|bloom|blossom"</automated>
  </verify>
  <acceptance_criteria>
    - Directory `public/sample/` exists
    - File `public/sample/cluster-coral.svg` exists with size > 200 bytes and contains `<svg`, `#F5DCC7`, and `Cluster · Coral`
    - File `public/sample/cluster-sage.svg` exists with size > 200 bytes and contains `<svg`, `#F5DCC7`, and `Cluster · Sage`
    - File `public/sample/cluster-lemon.svg` exists with size > 200 bytes and contains `<svg`, `#F5DCC7`, and `Cluster · Lemon`
    - No flower vocabulary in filenames: `ls public/sample/ | grep -Ei "flower|petal|floral|bloom|blossom"` exits 1
    - **NEW (REVIEW FIX M3):** This task does NOT modify `package.json` or `pnpm-lock.yaml`: `test -z "$(git status --porcelain package.json pnpm-lock.yaml)"` exits 0 (no `sharp` install was needed)
    - **NEW (REVIEW FIX M3):** No `_gen-sample-images.mjs` or similar throwaway script is committed under `scripts/`: `test -f scripts/_gen-sample-images.mjs` exits 1
    - **NEW (REVIEW FIX M3):** No `.webp` files appear under `public/sample/`: `ls public/sample/ | grep -E '\.webp$'` exits 1 (legacy WebP path is gone)
  </acceptance_criteria>
  <done>3 SVG placeholder cards render in the Phase 1 GalleryGrid shell when Plan 04 wires sample-data.ts. Phase 2 deletes these the moment real photos land in `src/content/gallery/<slug>/`. No runtime image library was needed (REVIEW FIX M3).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| repo → public/ | The `public/` directory is served verbatim at the web root by Cloudflare Static Assets. Anything committed here is publicly fetchable. |
| build-time scripts → filesystem | `scripts/generate-favicons.mjs` reads from `assets/logo/` and writes to `public/`. Inputs are committed repo assets, not external. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-01 | Information Disclosure | sample placeholder SVGs accidentally contain real product photos or unintended visual content | mitigate | The 3 SVGs are committed verbatim with the only color inputs being brand palette hex values (`#F5DCC7`, `#D6553B`, `#6E7438`, `#C99A2E`). No external images. Visually obvious that they're samples (`Cluster · <Color>` + `sample placeholder` text). REVIEW FIX M3: no runtime image library (sharp) needed — eliminates supply-chain surface. |
| T-03-02 | Tampering | favicon generator script modified to ship a malicious .ico containing a polyglot or unexpected payload | accept | `icon-gen@5` is a widely-used npm package pinned in package.json from Plan 01. Lockfile prevents drift. Generated favicons are committed and reviewable. No code execution surface from a .ico file in modern browsers. |
| T-03-03 | Information Disclosure | path traversal in dev when serving public/ via astro dev | accept | Astro's dev server enforces the public/ boundary; static-asset paths cannot escape with `..` segments. Standard framework behavior; no custom serving logic in Phase 1. Phase 4 will introduce a Worker handler for /api/* but with its own sandbox. |
</threat_model>

<verification>
After both tasks complete:
1. `ls public/favicon.ico public/favicon-16.png public/favicon-32.png public/favicon.svg public/apple-touch-icon.png public/mark.svg public/favicon/README.md` — all 7 files exist
2. `ls public/sample/cluster-coral.svg public/sample/cluster-sage.svg public/sample/cluster-lemon.svg` — all 3 sample SVGs exist (REVIEW FIX M3)
3. `shasum assets/logo/mark-favicon-180.png public/apple-touch-icon.png` shows identical hashes (D-19 reuse, no regen)
4. `shasum assets/logo/mark.svg public/mark.svg public/favicon.svg` shows the latter two are byte-identical to the source
5. `pnpm run favicons` is rerunnable and idempotent (re-running produces the same output set)
</verification>

<success_criteria>
- FND-08 unblocked — favicon set generated and committed without founder action
- D-19 honored — apple-touch-icon is a byte-identical copy of the existing 180px PNG
- D-20 honored — regen documented in `public/favicon/README.md`
- Header.jsx and Footer.jsx have a real `/mark.svg` to reference
- Plan 04 has 3 SVG placeholder gallery cards to render in the shell (REVIEW FIX M3: SVG instead of WebP, no sharp dep)
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundations-brand-system/01-03-SUMMARY.md` with:
- The 6 favicon files + 3 sample SVGs created (sizes for each) — REVIEW FIX M3 applied
- Confirmation that `public/apple-touch-icon.png` is unmodified from `assets/logo/mark-favicon-180.png` (shasum equality)
- Confirmation that `public/mark.svg` is unmodified from `assets/logo/mark.svg` (shasum equality)
- The 3 sample piece slugs (`sample-cluster-coral`, `sample-cluster-sage`, `sample-cluster-lemon`) that Plan 04's `src/sample-data.ts` will reference; photo paths are `/sample/cluster-coral.svg`, `/sample/cluster-sage.svg`, `/sample/cluster-lemon.svg`
</output>
