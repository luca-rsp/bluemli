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
  - public/sample/piece-a.webp
  - public/sample/piece-b.webp
  - public/sample/piece-c.webp
tags: [favicons, public-assets, sample-data, icon-gen]
must_haves:
  truths:
    - "Running `pnpm run favicons` produces favicon.ico, favicon-16.png, favicon-32.png from assets/logo/mark.svg without founder action (D-19)"
    - "public/apple-touch-icon.png is a byte-identical copy of assets/logo/mark-favicon-180.png (D-19 — do NOT regenerate)"
    - "public/mark.svg is a copy of assets/logo/mark.svg so Header.jsx can reference <img src=\"/mark.svg\">"
    - "public/favicon/README.md documents the single-command regen path (D-20)"
    - "public/sample/piece-{a,b,c}.webp exist as placeholder cream-colored 4:5 images that GalleryGrid can render in Phase 1 shell"
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
      to: "public/sample/piece-{a,b,c}.webp"
      via: "{ photo: '/sample/piece-a.webp' } in sampleGallery"
      pattern: "/sample/piece-"
---

<objective>
Write `scripts/generate-favicons.mjs` and run it once to produce the full Phase 1 favicon set + the `public/mark.svg` copy that the synced Header/Footer reference. Also ship 3 placeholder WebPs under `public/sample/` so Plan 04's sample-data can render placeholder gallery cards without 404s.

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
<!-- /sample/piece-a.webp — flat-color WebP placeholder (cream/coral) -->
<!-- /sample/piece-b.webp — flat-color WebP placeholder (cream/indigo) -->
<!-- /sample/piece-c.webp — flat-color WebP placeholder (cream/olive) -->
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
  <name>Task 2: Create 3 placeholder sample WebPs for the Phase 1 gallery shell</name>
  <files>public/sample/piece-a.webp, public/sample/piece-b.webp, public/sample/piece-c.webp</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-PATTERNS.md (line 672 — "ship 3 small flat-color WebPs"; Decisions the Planner Needs to Make #9; sample-data file references paths `/sample/piece-{a,b,c}.webp`)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-UI-SPEC.md (§"Demo-Loaded Page Shells" line 327 — gallery shows "3 cards"; Sample piece price `$0`; alt text must follow Accessibility Floor pattern e.g. "Confetti earrings — colorful beaded cluster with mixed bead sizes")
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-CONTEXT.md (D-03: sample data marked obviously — names start with "Sample", prices $0 — so the placeholder images should also look obviously sample-like)
  </read_first>
  <action>
**Goal:** Create 3 small placeholder WebPs at `public/sample/piece-{a,b,c}.webp`, each ~400×500px (4:5 aspect — matches the GalleryGrid card aspect ratio from Plan 02), with a flat brand-palette color so they look obviously "placeholder" but still on-brand. These are throwaways — Phase 2 deletes them when real photos arrive.

**Step 1 — Create `public/sample/` directory.**
```bash
mkdir -p public/sample
```

**Step 2 — Generate 3 placeholder WebPs using `sharp` directly** (no need for a committed script — this is one-time scaffold work; the sharp CLI is available via `npx sharp-cli` if installed, or use a one-liner Node script). Use one of these two approaches:

**Approach A (preferred — small Node script, single run, do not commit the script):**
Write a tiny throwaway Node script `scripts/_gen-sample-images.mjs` (the underscore prefix marks it as not-for-CI), run it, then delete the script:

```js
// scripts/_gen-sample-images.mjs — one-time placeholder generator; delete after run
// Run via: node scripts/_gen-sample-images.mjs
import { promises as fs } from 'node:fs';

// Plain 400x500 flat-color WebP via on-the-fly SVG → WebP using sharp.
// sharp is already an indirect dep via icon-gen; if not resolvable, install: pnpm add -D sharp
import sharp from 'sharp';

const PIECES = [
  { file: 'piece-a.webp', bg: '#F5DCC7', fg: '#D6553B', label: 'A' }, // cream + coral
  { file: 'piece-b.webp', bg: '#F5DCC7', fg: '#3E4E8B', label: 'B' }, // cream + indigo
  { file: 'piece-c.webp', bg: '#F5DCC7', fg: '#6E7438', label: 'C' }, // cream + olive
];

await fs.mkdir('public/sample', { recursive: true });

for (const { file, bg, fg, label } of PIECES) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
    <rect width="400" height="500" fill="${bg}"/>
    <circle cx="200" cy="220" r="60" fill="${fg}" opacity="0.85"/>
    <circle cx="160" cy="200" r="22" fill="${fg}" opacity="0.6"/>
    <circle cx="240" cy="240" r="22" fill="${fg}" opacity="0.6"/>
    <text x="200" y="380" font-family="sans-serif" font-size="38" font-weight="700" fill="${fg}" text-anchor="middle">Sample ${label}</text>
  </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(`public/sample/${file}`);
  console.log(`Wrote public/sample/${file}`);
}
```

Run it:
```bash
# If sharp isn't installed: pnpm add -D sharp
node scripts/_gen-sample-images.mjs
```

Then DELETE the script:
```bash
rm scripts/_gen-sample-images.mjs
```

(Sharp running on the developer's local machine is fine — Pitfall #9 only forbids Sharp inside `workerd` at build/request time on Cloudflare. This is a local one-shot.)

**Approach B (fallback if sharp install fails — copy any existing 4:5 product photo from the design skill, three times):**
```bash
mkdir -p public/sample
# Look for any existing photo in .claude/skills/studio-bluemli-design/uploads/ that's roughly 4:5 aspect.
ls .claude/skills/studio-bluemli-design/uploads/ 2>/dev/null || echo "No skill uploads dir"
# If a suitable photo exists, copy it three times. Otherwise fall back to creating empty-but-valid WebPs:
# (Empty WebPs are NOT acceptable — they will appear broken. Prefer Approach A.)
```

**Step 3 — Verify all three files exist and are valid WebPs.**

```bash
file public/sample/piece-a.webp public/sample/piece-b.webp public/sample/piece-c.webp
# Expected: each line ends with "Web/P image"
```

Each file must:
- exist
- have size > 100 bytes (i.e. not empty)
- have the WebP magic bytes (`file` reports "Web/P image" or similar)
  </action>
  <verify>
    <automated>test -d public/sample && test -f public/sample/piece-a.webp && test -f public/sample/piece-b.webp && test -f public/sample/piece-c.webp && test "$(wc -c < public/sample/piece-a.webp)" -gt 100 && test "$(wc -c < public/sample/piece-b.webp)" -gt 100 && test "$(wc -c < public/sample/piece-c.webp)" -gt 100 && file public/sample/piece-a.webp | grep -qi "webp\|Web/P\|RIFF" && ! test -f scripts/_gen-sample-images.mjs</automated>
  </verify>
  <acceptance_criteria>
    - Directory `public/sample/` exists
    - File `public/sample/piece-a.webp` exists with size > 100 bytes
    - File `public/sample/piece-b.webp` exists with size > 100 bytes
    - File `public/sample/piece-c.webp` exists with size > 100 bytes
    - `file public/sample/piece-a.webp` output contains "webp" or "Web/P" or "RIFF" (valid WebP magic bytes)
    - The throwaway generator script `scripts/_gen-sample-images.mjs` is DELETED (it's one-time scaffold; should not be committed): `test -f scripts/_gen-sample-images.mjs` exits 1
    - No flower vocabulary in filenames: `ls public/sample/ | grep -Ei "flower|petal|floral|bloom|blossom"` exits 1
  </acceptance_criteria>
  <done>3 placeholder WebPs render in the Phase 1 GalleryGrid shell when Plan 04 wires sample-data.ts. Phase 2 deletes these the moment real photos land in `src/content/gallery/<slug>/`.</done>
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
| T-03-01 | Information Disclosure | sample WebPs accidentally contain real product photos with watermark metadata or unintended visual content | mitigate | Generator script (Approach A) creates SVG-derived flat-color placeholders programmatically — the only inputs are the brand palette hex values. No external images. Visually obvious that they're samples (large "Sample A/B/C" text). |
| T-03-02 | Tampering | favicon generator script modified to ship a malicious .ico containing a polyglot or unexpected payload | accept | `icon-gen@5` is a widely-used npm package pinned in package.json from Plan 01. Lockfile prevents drift. Generated favicons are committed and reviewable. No code execution surface from a .ico file in modern browsers. |
| T-03-03 | Information Disclosure | path traversal in dev when serving public/ via astro dev | accept | Astro's dev server enforces the public/ boundary; static-asset paths cannot escape with `..` segments. Standard framework behavior; no custom serving logic in Phase 1. Phase 4 will introduce a Worker handler for /api/* but with its own sandbox. |
</threat_model>

<verification>
After both tasks complete:
1. `ls public/favicon.ico public/favicon-16.png public/favicon-32.png public/favicon.svg public/apple-touch-icon.png public/mark.svg public/favicon/README.md` — all 7 files exist
2. `ls public/sample/piece-a.webp public/sample/piece-b.webp public/sample/piece-c.webp` — all 3 sample WebPs exist
3. `shasum assets/logo/mark-favicon-180.png public/apple-touch-icon.png` shows identical hashes (D-19 reuse, no regen)
4. `shasum assets/logo/mark.svg public/mark.svg public/favicon.svg` shows the latter two are byte-identical to the source
5. `pnpm run favicons` is rerunnable and idempotent (re-running produces the same output set)
</verification>

<success_criteria>
- FND-08 unblocked — favicon set generated and committed without founder action
- D-19 honored — apple-touch-icon is a byte-identical copy of the existing 180px PNG
- D-20 honored — regen documented in `public/favicon/README.md`
- Header.jsx and Footer.jsx have a real `/mark.svg` to reference
- Plan 04 has 3 placeholder gallery photos to render in the shell
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundations-brand-system/01-03-SUMMARY.md` with:
- The 6 favicon files + 3 sample WebPs created (sizes for each)
- Confirmation that `public/apple-touch-icon.png` is unmodified from `assets/logo/mark-favicon-180.png` (shasum equality)
- Confirmation that `public/mark.svg` is unmodified from `assets/logo/mark.svg` (shasum equality)
- The 3 sample piece slugs (`sample-piece-a`, `sample-piece-b`, `sample-piece-c`) that Plan 04's `src/sample-data.ts` will reference
</output>
