---
plan_id: 01-02
phase: 1
phase_slug: 01-foundations-brand-system
plan: 02
type: execute
wave: 1
depends_on: []
autonomous: true
requirements: [FND-06, FND-09, FND-13]
files_modified:
  - scripts/sync-design-skill.mjs
  - src/styles/colors_and_type.css
  - src/styles/components.css
  - src/components/design-skill/Mark.jsx
  - src/components/design-skill/Button.jsx
  - src/components/design-skill/BeadCluster.jsx
  - src/components/design-skill/Header.jsx
  - src/components/design-skill/Hero.jsx
  - src/components/design-skill/About.jsx
  - src/components/design-skill/GalleryGrid.jsx
  - src/components/design-skill/PopupStrip.jsx
  - src/components/design-skill/AppointmentForm.jsx
  - src/components/design-skill/Footer.jsx
  - src/components/design-skill/ProductSheet.jsx
tags: [design-skill, sync-script, react-ssr, brand-tokens]
must_haves:
  truths:
    - "scripts/sync-design-skill.mjs runs to completion and copies 11 JSX files plus colors_and_type.css"
    - "Every component in src/components/design-skill/ exports default (no `window.X = X` UMD leftovers)"
    - "Every component imports React at the top (defensive for React 19 SSR)"
    - "src/styles/colors_and_type.css has NO `@import url(\"https://fonts.googleapis.com...\")` line (self-hosting via Fonts API only)"
    - "Header.jsx has NO `backdropFilter` or `WebkitBackdropFilter` (brand rule + CI Rule 4)"
    - "Header.jsx HeaderProps.active union accepts '/' | '/gallery' | '/popups' | '/about' | '/say-hi' (Plan 04 about.astro passes active=\"/about\")"
    - "Header.jsx ships a CSS-only mobile hamburger using <details><summary> (semantic, keyboard-accessible by default, native aria-expanded driven by the open attribute) with 44px min touch target and :focus-visible styling (UI-SPEC §Header chrome; REVIEW FIX H2)"
    - "Header.jsx <nav> element has NO inline `style={{ display: 'flex' }}` — all responsive display behavior is driven by CSS classes only (REVIEW FIX H2: the inline flex was overriding the mobile collapse rule)"
    - "src/styles/colors_and_type.css has the same byte size after Plan 02 runs as the source design-skill copy minus the @import-Google-Fonts line — i.e., NO component styles appended (REVIEW FIX M4)"
    - "src/styles/components.css is a NEW sibling stylesheet for any component-specific styles (like .btn-primary hover/active) that the design-skill copy did NOT already include — colors_and_type.css is locked and not extended (REVIEW FIX M4)"
    - "All `../../assets/logo/` paths are rewritten to `/` (Header, Hero, Footer use `/mark.svg`)"
    - "AppointmentForm.jsx has no `React.useState`, uses a real `<form method=\"POST\" action=\"/api/contact\">`, and has NO `outline: 'none'` (FND-13)"
    - "GalleryGrid.jsx accepts a `pieces` prop and contains no hardcoded `PRODUCTS = [...]` array"
    - "PopupStrip.jsx accepts a `popup: Popup` prop and renders popup.name, popup.location, popup.date (not the hardcoded NOPA copy)"
    - "About.jsx has no `useState` and no cross-skill imports (it never did — verified by read)"
    - "No `outline:\\s*['\"]?none` anywhere in src/components/design-skill/ (FND-13)"
    - "D-05: Sync script rewrites cross-skill JSX imports (../../assets/) to live under src/ and converts script-tag babel patterns to standard ES module imports; manual cleanup expected on first run"
  artifacts:
    - path: "scripts/sync-design-skill.mjs"
      provides: "one-shot copy + transform script (D-04..D-06)"
      contains: "transforms"
    - path: "src/styles/colors_and_type.css"
      provides: "global brand tokens (cream background, font cascades, palette) — COPIED VERBATIM from design skill minus the Google Fonts @import; NEVER EXTENDED in Phase 1 (REVIEW FIX M4)"
      contains: "--color-bg"
    - path: "src/styles/components.css"
      provides: "component-specific styles (e.g., .btn-primary hover/active) that live OUTSIDE the locked colors_and_type.css (REVIEW FIX M4)"
      contains: ".btn-primary"
    - path: "src/components/design-skill/Header.jsx"
      provides: "sticky cream header with logo lockup + nav + CSS-only mobile hamburger"
      contains: "export default Header"
    - path: "src/components/design-skill/Mark.jsx"
      provides: "decorative SVG namespace (Underline, Sparkle, Heart, Dots, Rule)"
      contains: "export default Mark"
    - path: "src/components/design-skill/PopupStrip.jsx"
      provides: "next-popup strip; accepts a popup data prop (not hardcoded copy)"
      contains: "popup"
  key_links:
    - from: "src/components/design-skill/Header.jsx"
      to: "/mark.svg"
      via: "<img src=\"/mark.svg\"> after Transform 3"
      pattern: "src=\"/mark.svg\""
    - from: "src/components/design-skill/*.jsx"
      to: "src/styles/colors_and_type.css"
      via: "CSS var references (--coral-500, --indigo-500, --font-wordmark, etc.)"
      pattern: "var\\(--color|var\\(--font|var\\(--space|var\\(--fs"
    - from: "src/components/design-skill/AppointmentForm.jsx"
      to: "/api/contact"
      via: "<form action=\"/api/contact\" method=\"POST\"> (Phase 4 wires the handler)"
      pattern: "action=\"/api/contact\""
    - from: "src/components/design-skill/PopupStrip.jsx"
      to: "src/sample-data.ts (Plan 04)"
      via: "popup prop typed as Popup from sample-data"
      pattern: "popup\\."
---

<objective>
Implement `scripts/sync-design-skill.mjs`, run it once to populate `src/components/design-skill/` with 11 transformed React JSX components and `src/styles/colors_and_type.css` with the brand tokens, then apply the post-sync manual edits that the mechanical script cannot do (strip `useState`, swap hash anchors for real routes, refactor `GalleryGrid` to take a `pieces` prop, refactor `PopupStrip` to take a `popup` prop, fix Footer email, convert Button hover handlers to CSS pseudo-classes, add CSS-only mobile hamburger to Header, remove `outline: 'none'` from AppointmentForm).

Purpose: After Phase 1, `src/components/design-skill/` is the source of truth for the brand chrome — divorced from `.claude/skills/studio-bluemli-design/`. The design skill remains a design reference, not a runtime dep (D-04). Wave 2 (Plan 04) imports these components into 5 page files.

Output: 12 component-related files (script + 11 components) + 1 CSS file in `src/styles/`, all transformed and SSR-safe (no `client:` directive ever needed), all brand-clean (CI grep rules will pass on `src/`).
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
@.claude/skills/studio-bluemli-design/ui_kits/website/Header.jsx
@.claude/skills/studio-bluemli-design/ui_kits/website/Hero.jsx
@.claude/skills/studio-bluemli-design/ui_kits/website/Footer.jsx
@.claude/skills/studio-bluemli-design/ui_kits/website/AppointmentForm.jsx
@.claude/skills/studio-bluemli-design/ui_kits/website/GalleryGrid.jsx
@.claude/skills/studio-bluemli-design/ui_kits/website/PopupStrip.jsx
@.claude/skills/studio-bluemli-design/ui_kits/website/About.jsx
@.claude/skills/studio-bluemli-design/ui_kits/website/Mark.jsx
@.claude/skills/studio-bluemli-design/colors_and_type.css

<interfaces>
<!-- Sync-script transform rules (RESEARCH.md §"Sync Script Transform Rules" lines 528-734). Five transforms must all be applied. The script handles Transforms 1, 2, 3, 4 mechanically; Transform 5 is the COPY_LIST allowlist. Component-specific post-sync edits are manual (Task 3 below). -->

Transform 1: `window.<Name> = <Name>;` → `export default <Name>;`
  Regex: `/window\.(\w+)\s*=\s*\1;?/g` replace with `export default $1;`

Transform 2: Add `import React from 'react';` after the `/* eslint-disable */` line
  Idempotent: only insert if `!src.includes("import React")`

Transform 3: `../../assets/logo/` → `/`
  Regex: `/\.\.\/\.\.\/assets\/logo\//g` replace with `/`
  Result: `<img src="../../assets/logo/mark.svg">` → `<img src="/mark.svg">`

Transform 4: Delete `backdropFilter`/`WebkitBackdropFilter` lines (Header.jsx only currently, but apply globally)
  Regex: `/^\s*(backdropFilter|WebkitBackdropFilter):\s*['"][^'"]*['"],?\s*$/gm` replace with `''`

Transform 5 (COPY_LIST allowlist — implicit, just don't copy these):
  EXCLUDED: App.jsx, index.html, README.md
  INCLUDED (11 files): Mark.jsx, Button.jsx, BeadCluster.jsx, Header.jsx, Hero.jsx, About.jsx, GalleryGrid.jsx, PopupStrip.jsx, AppointmentForm.jsx, Footer.jsx, ProductSheet.jsx

CSS transform (one-line strip): Delete the `@import url("https://fonts.googleapis.com/...")` line from `colors_and_type.css`
  Regex: `/^@import url\("https:\/\/fonts\.googleapis\.com[^"]*"\);\s*$/m` replace with `''`

<!-- Verified PopupStrip source signature (read from .claude/skills/studio-bluemli-design/ui_kits/website/PopupStrip.jsx):
     function PopupStrip({ onAppointment }) — the synced version takes an onAppointment handler and
     has HARDCODED "NOPA block party / Saturday, June 6 · 10–2 pm" copy. Edit 5 (below) refactors
     it to accept a `popup: Popup` data prop instead, so Plan 04 can pass sampleNextPopup. -->

<!-- Verified About source signature: function About() — no props, no useState, no cross-skill
     imports. Mechanical transforms alone are sufficient for About.jsx. Edit 5 confirms this. -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write scripts/sync-design-skill.mjs (the transform engine)</name>
  <files>scripts/sync-design-skill.mjs</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-RESEARCH.md (§"Sync script shape" lines 685-734 — copy verbatim; §"Sync Script Transform Rules" lines 528-595 for the rationale behind each transform)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-PATTERNS.md (lines 676-727 — verified shape and constraints)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-CONTEXT.md (D-04..D-06: one-shot, source of truth in src/ after copy, manual cleanup expected on first run)
  </read_first>
  <action>
**Write `scripts/sync-design-skill.mjs`** at the path `scripts/sync-design-skill.mjs`. Use this exact content (copied from RESEARCH.md lines 685-732 and PATTERNS.md lines 681-720 — the two sources agree verbatim):

```js
// scripts/sync-design-skill.mjs
// One-shot copy + transform script (D-04..D-06).
// Run via: pnpm run sync:design-skill
//
// After this script runs once, src/components/design-skill/ is the source of truth
// and may diverge from .claude/skills/studio-bluemli-design/. Re-running is safe
// (idempotent React-import insert) but will OVERWRITE local edits — so re-run only
// when the founder explicitly updates the skill and wants to re-pull.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const SKILL = '.claude/skills/studio-bluemli-design/ui_kits/website';
const DEST  = 'src/components/design-skill';
const STYLES_SRC = '.claude/skills/studio-bluemli-design/colors_and_type.css';
const STYLES_DEST = 'src/styles/colors_and_type.css';

// Transform 5: explicit allowlist. App.jsx and index.html are click-thru wiring,
// not components — we don't need them.
const COPY_LIST = [
  'Mark.jsx', 'Button.jsx', 'BeadCluster.jsx', 'Header.jsx',
  'Hero.jsx', 'About.jsx', 'GalleryGrid.jsx', 'PopupStrip.jsx',
  'AppointmentForm.jsx', 'Footer.jsx', 'ProductSheet.jsx',
];

const transforms = [
  // Transform 1: UMD global registration → ES module default export
  [/window\.(\w+)\s*=\s*\1;?/g, 'export default $1;'],
  // Transform 3: asset path rewrite (../../assets/logo/* → /*)
  [/\.\.\/\.\.\/assets\/logo\//g, '/'],
  // Transform 4: remove backdrop-filter lines (brand rule + CI Rule 4)
  [/^\s*(backdropFilter|WebkitBackdropFilter):\s*['"][^'"]*['"],?\s*$/gm, ''],
];

await fs.mkdir(DEST, { recursive: true });

for (const file of COPY_LIST) {
  let src = await fs.readFile(path.join(SKILL, file), 'utf8');
  for (const [re, repl] of transforms) {
    src = src.replace(re, repl);
  }
  // Transform 2: defensive React import (idempotent)
  if (!src.includes("import React")) {
    src = src.replace(/^\/\* eslint-disable \*\/$/m, "/* eslint-disable */\nimport React from 'react';");
  }
  await fs.writeFile(path.join(DEST, file), src);
}

// Copy and strip the @import url(fonts.googleapis.com) line from colors_and_type.css
// (UI-SPEC § "Font Loading": fonts load only through Astro Fonts API)
let css = await fs.readFile(STYLES_SRC, 'utf8');
css = css.replace(/^@import url\("https:\/\/fonts\.googleapis\.com[^"]*"\);\s*$/m, '');
await fs.mkdir(path.dirname(STYLES_DEST), { recursive: true });
await fs.writeFile(STYLES_DEST, css);

console.log(`Synced ${COPY_LIST.length} components and colors_and_type.css.`);
console.log('Manual TODO: review each file for any remaining cross-skill refs.');
console.log('Manual TODO: post-sync edits in Plan 02 Task 3 are NOT done by this script.');
```

Critical constraints:
- COPY_LIST excludes `App.jsx` and `index.html` (Transform 5) — they're click-thru wiring, not used in Astro
- The React-import insert checks `if (!src.includes("import React"))` for idempotency
- Transforms run in this order: 1 (export), 3 (paths), 4 (backdrop), then 2 (React import). Order matters for transform 4 — must run before React import is inserted so the regex anchors at line start.
- Path constants are repo-relative; the script runs from repo root via `pnpm run sync:design-skill`
- Logs include the manual TODO so the next executor knows post-sync edits exist
  </action>
  <verify>
    <automated>test -f scripts/sync-design-skill.mjs && grep -q "COPY_LIST" scripts/sync-design-skill.mjs && grep -q "window\\\\\\.(\\\\w+)" scripts/sync-design-skill.mjs && grep -q "backdropFilter" scripts/sync-design-skill.mjs && grep -q "fonts.googleapis.com" scripts/sync-design-skill.mjs && grep -q "import React from 'react'" scripts/sync-design-skill.mjs && grep -q "App.jsx" scripts/sync-design-skill.mjs ; test $? -ne 0 || ! grep -E "'App\\.jsx'" scripts/sync-design-skill.mjs</automated>
  </verify>
  <acceptance_criteria>
    - File `scripts/sync-design-skill.mjs` exists
    - Contains the string `COPY_LIST` (Transform 5 allowlist defined)
    - Contains the regex pattern for Transform 1: `grep -q "window" scripts/sync-design-skill.mjs && grep -q "export default" scripts/sync-design-skill.mjs`
    - Contains the string `backdropFilter` (Transform 4 regex present)
    - Contains the string `fonts.googleapis.com` (CSS @import strip regex present)
    - Contains the string `import React from 'react'` (Transform 2 insert string present)
    - COPY_LIST does NOT include `App.jsx` — `grep -E "'App\.jsx'" scripts/sync-design-skill.mjs` exits 1
    - COPY_LIST includes all 11 component files — `grep -q "'Header.jsx'" scripts/sync-design-skill.mjs && grep -q "'Hero.jsx'" scripts/sync-design-skill.mjs && grep -q "'Footer.jsx'" scripts/sync-design-skill.mjs && grep -q "'AppointmentForm.jsx'" scripts/sync-design-skill.mjs && grep -q "'GalleryGrid.jsx'" scripts/sync-design-skill.mjs && grep -q "'Mark.jsx'" scripts/sync-design-skill.mjs && grep -q "'Button.jsx'" scripts/sync-design-skill.mjs && grep -q "'BeadCluster.jsx'" scripts/sync-design-skill.mjs && grep -q "'About.jsx'" scripts/sync-design-skill.mjs && grep -q "'PopupStrip.jsx'" scripts/sync-design-skill.mjs && grep -q "'ProductSheet.jsx'" scripts/sync-design-skill.mjs` all exit 0
  </acceptance_criteria>
  <done>The sync script is committed. Running `pnpm run sync:design-skill` (Task 2) will populate `src/components/design-skill/` and `src/styles/colors_and_type.css` deterministically.</done>
</task>

<task type="auto">
  <name>Task 2: Run sync script and verify mechanical transforms applied</name>
  <files>src/styles/colors_and_type.css, src/components/design-skill/Mark.jsx, src/components/design-skill/Button.jsx, src/components/design-skill/BeadCluster.jsx, src/components/design-skill/Header.jsx, src/components/design-skill/Hero.jsx, src/components/design-skill/About.jsx, src/components/design-skill/GalleryGrid.jsx, src/components/design-skill/PopupStrip.jsx, src/components/design-skill/AppointmentForm.jsx, src/components/design-skill/Footer.jsx, src/components/design-skill/ProductSheet.jsx</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/scripts/sync-design-skill.mjs (just written in Task 1 — confirm it exists and is runnable)
    - /Users/lucacanonica/Documents/projects/bluemli/.claude/skills/studio-bluemli-design/ui_kits/website/Header.jsx (verify the source has `window.Header = Header;`, `backdropFilter`, and `../../assets/logo/mark.svg` — the three things Transforms 1/4/3 will rewrite)
    - /Users/lucacanonica/Documents/projects/bluemli/.claude/skills/studio-bluemli-design/colors_and_type.css (verify the source has line 14 `@import url("https://fonts.googleapis.com/...")` that the CSS strip will remove)
  </read_first>
  <action>
**Step 1 — Run the sync script** from repo root:
```bash
pnpm run sync:design-skill
```
Expected output:
```
Synced 11 components and colors_and_type.css.
Manual TODO: review each file for any remaining cross-skill refs.
Manual TODO: post-sync edits in Plan 02 Task 3 are NOT done by this script.
```

If the script fails because `.claude/skills/studio-bluemli-design/ui_kits/website/` is missing files, stop and report — do NOT manually copy in this task.

**Step 2 — Verify mechanical transforms.** Run:
```bash
# Transform 1: every component now exports default
grep -L "export default" src/components/design-skill/*.jsx
# Expected output: empty (every file passes)

# No UMD leftovers
grep -rE "window\.\w+\s*=" src/components/design-skill/ || echo "PASS: no window.X = X leftovers"

# Transform 2: every component imports React
grep -L "import React" src/components/design-skill/*.jsx
# Expected: empty

# Transform 3: no ../../assets/ paths
grep -rE "\.\./\.\./assets/" src/components/design-skill/ && echo "FAIL" || echo "PASS"

# Transform 4: no backdrop-filter in Header (or any component)
grep -rE "(backdropFilter|backdrop-filter|WebkitBackdropFilter)" src/components/design-skill/ && echo "FAIL" || echo "PASS"

# CSS @import strip
grep -E "fonts\.googleapis\.com" src/styles/colors_and_type.css && echo "FAIL" || echo "PASS"

# colors_and_type.css still has its body tokens
grep -q "\-\-color-bg" src/styles/colors_and_type.css && echo "PASS: tokens present"
```

All checks must say PASS.

**Step 3 — Investigate any anomalies.** If a transform didn't apply correctly to a specific file (e.g., a typo in source means the regex didn't match), report which file and which transform — do NOT modify the script or the file in this task (post-sync edits happen in Task 3).
  </action>
  <verify>
    <automated>test -d src/components/design-skill && ls src/components/design-skill/*.jsx | wc -l | grep -E "^\s*11\s*$" && test -f src/styles/colors_and_type.css && ! grep -rE "window\.\w+\s*=" src/components/design-skill/ && ! grep -rE "\.\./\.\./assets/" src/components/design-skill/ && ! grep -rE "(backdropFilter|backdrop-filter|WebkitBackdropFilter)" src/components/design-skill/ && ! grep -E "fonts\.googleapis\.com" src/styles/colors_and_type.css && grep -q "^\-\-color-bg\|--color-bg:" src/styles/colors_and_type.css && grep -L "export default" src/components/design-skill/*.jsx | wc -l | grep -E "^\s*0\s*$" && grep -L "import React" src/components/design-skill/*.jsx | wc -l | grep -E "^\s*0\s*$"</automated>
  </verify>
  <acceptance_criteria>
    - Directory `src/components/design-skill/` exists and contains exactly 11 `.jsx` files: Mark.jsx, Button.jsx, BeadCluster.jsx, Header.jsx, Hero.jsx, About.jsx, GalleryGrid.jsx, PopupStrip.jsx, AppointmentForm.jsx, Footer.jsx, ProductSheet.jsx
    - File `src/styles/colors_and_type.css` exists
    - Every component file contains `export default` (Transform 1 applied): `grep -L "export default" src/components/design-skill/*.jsx` produces empty output
    - Every component file imports React (Transform 2 applied): `grep -L "import React" src/components/design-skill/*.jsx` produces empty output
    - No `window.<Name> = <Name>` UMD leftovers anywhere: `grep -rE "window\.\w+\s*=" src/components/design-skill/` exits 1
    - No `../../assets/` paths remain (Transform 3 applied): `grep -rE "\.\./\.\./assets/" src/components/design-skill/` exits 1
    - No `backdropFilter` or `backdrop-filter` (Transform 4 applied, brand rule + CI Rule 4): `grep -rE "(backdropFilter|backdrop-filter|WebkitBackdropFilter)" src/components/design-skill/` exits 1
    - The CSS `@import url("https://fonts.googleapis.com/...")` line is stripped: `grep -E "fonts\.googleapis\.com" src/styles/colors_and_type.css` exits 1
    - The CSS still contains the brand token `--color-bg`: `grep -q "color-bg" src/styles/colors_and_type.css` exits 0 (proves we copied the file content, not just emptied it)
    - The CSS still contains the cream value `#F5DCC7` somewhere: `grep -q "F5DCC7\|f5dcc7" src/styles/colors_and_type.css` exits 0
  </acceptance_criteria>
  <done>11 components are copied and mechanically transformed; the CSS token file is in place without the Google Fonts CDN @import. Task 3 will apply the component-specific edits the script cannot do.</done>
</task>

<task type="auto">
  <name>Task 3: Apply post-sync manual edits (component-specific rewrites)</name>
  <files>src/components/design-skill/Header.jsx, src/components/design-skill/Hero.jsx, src/components/design-skill/Footer.jsx, src/components/design-skill/AppointmentForm.jsx, src/components/design-skill/GalleryGrid.jsx, src/components/design-skill/Button.jsx, src/components/design-skill/PopupStrip.jsx, src/components/design-skill/About.jsx</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/src/components/design-skill/Header.jsx (the just-synced version with mechanical transforms applied)
    - /Users/lucacanonica/Documents/projects/bluemli/src/components/design-skill/Hero.jsx
    - /Users/lucacanonica/Documents/projects/bluemli/src/components/design-skill/Footer.jsx
    - /Users/lucacanonica/Documents/projects/bluemli/src/components/design-skill/AppointmentForm.jsx
    - /Users/lucacanonica/Documents/projects/bluemli/src/components/design-skill/GalleryGrid.jsx
    - /Users/lucacanonica/Documents/projects/bluemli/src/components/design-skill/Button.jsx
    - /Users/lucacanonica/Documents/projects/bluemli/src/components/design-skill/PopupStrip.jsx (verify prop signature — source uses `function PopupStrip({ onAppointment })` with HARDCODED "NOPA block party / Saturday, June 6 · 10–2 pm" copy; Edit 5 refactors to accept `popup: Popup`)
    - /Users/lucacanonica/Documents/projects/bluemli/src/components/design-skill/About.jsx (verify it has no state and no cross-skill imports — source is `function About()` with no props, only uses local `Mark.Heart` and CSS vars; mechanical transforms alone suffice)
    - /Users/lucacanonica/Documents/projects/bluemli/src/styles/colors_and_type.css (verify `--color-focus-ring` token exists — line ~100 in source defines it as `var(--coral-500)`; if missing after sync, add it)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-PATTERNS.md ("Decisions the Planner Needs to Make" lines 957-971 — pinned planner decisions are encoded below)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-RESEARCH.md (§"Worked example: Header.jsx → Header.tsx" lines 597-682 for the Header reference target)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-UI-SPEC.md (§"Header chrome" lines 207-219 — REQUIRES mobile hamburger button with aria-label="Open navigation menu" and aria-expanded at the 640px breakpoint; §"Footer chrome" lines 220-230; §"Copywriting Contract" lines 343-368; §"Accessibility Floor" — FND-13 :focus-visible on every interactive element)
  </read_first>
  <action>
The sync script handled mechanical transforms. These manual edits encode the planner decisions from PATTERNS.md "Decisions the Planner Needs to Make" (lines 957-971). Each edit is required because `client:` directives are forbidden — `useState`/`onClick`/`onMouseEnter` are dead in the browser and must be replaced with static patterns.

**Edit 1 — `src/components/design-skill/Header.jsx`** (PATTERNS.md decision #1, #2; UI-SPEC §Header chrome — CSS-only mobile hamburger REQUIRED in Phase 1):

Replace the synced Header.jsx with this exact content (REVIEW FIX H2 — Codex review caught two real bugs in the prior checkbox-hack version: an inline `style={{ display: 'flex' }}` on `<nav>` was overriding the mobile collapse rule, and `aria-expanded="false"` was static. The fix uses native `<details><summary>` — semantic, keyboard-accessible by default, with `aria-expanded` driven natively by the `open` attribute on `<details>` — no JS, no CSS hacks, no static ARIA):

```jsx
/* eslint-disable */
import React from 'react';
import Mark from './Mark';

function Header({ active = '/' }) {
  const links = [
    ['/',        'home'],
    ['/gallery', 'gallery'],
    ['/popups',  'pop-ups'],
    ['/say-hi',  'say hi'],
  ];
  // Mobile nav uses <details><summary>. Native semantics:
  //  - <summary> is keyboard-focusable, Enter/Space toggles, no JS
  //  - <details open> drives a native [open] attribute → aria-expanded is computed
  //    by the platform (do NOT add a static aria-expanded attribute)
  //  - CSS shows <summary> only on mobile; on desktop, the nav is inline and
  //    <summary> is hidden (so the disclosure widget is purely a mobile affordance)
  const styleBlock = `
    /* Reset the default <details>/<summary> chrome (the disclosure triangle). */
    .site-mobile-nav { position: relative; }
    .site-mobile-nav > summary {
      list-style: none;
      cursor: pointer;
    }
    .site-mobile-nav > summary::-webkit-details-marker { display: none; }
    .site-mobile-nav > summary::marker { content: ''; }

    /* Hamburger icon inside <summary>. 44px min touch target. */
    .nav-hamburger-button {
      width: 44px; height: 44px;
      display: inline-flex; align-items: center; justify-content: center;
      background: transparent;
      color: var(--indigo-500);
      border-radius: 4px;
    }
    .site-mobile-nav > summary:focus-visible .nav-hamburger-button,
    .site-mobile-nav > summary:focus-visible {
      outline: 2px solid var(--color-focus-ring, var(--indigo-500));
      outline-offset: 2px;
    }
    .nav-hamburger-icon, .nav-hamburger-icon::before, .nav-hamburger-icon::after {
      content: ''; display: block; width: 22px; height: 2px;
      background: currentColor; border-radius: 2px;
      transition: transform 0.18s ease;
    }
    .nav-hamburger-icon::before { transform: translateY(-7px); }
    .nav-hamburger-icon::after  { transform: translateY(5px); }
    .site-mobile-nav[open] .nav-hamburger-button { color: var(--coral-500); }

    /* Desktop (>= 641px): show inline nav, hide the <details> chrome. */
    .site-nav { display: flex; gap: 22px; }
    .site-mobile-nav { display: none; }

    /* Mobile (<= 640px): hide inline nav, show <details>/<summary>. */
    @media (max-width: 640px) {
      .site-nav { display: none; }
      .site-mobile-nav { display: block; }
      .site-mobile-nav[open] .site-nav-panel {
        display: flex;
        position: absolute;
        top: 100%; right: 0; left: 0;
        flex-direction: column; gap: 0;
        background: var(--color-bg, #F5DCC7);
        padding: 12px 32px 20px;
      }
      .site-nav-panel a { padding: 12px 0; min-height: 44px; display: flex; align-items: center; }
    }

    /* :focus-visible on nav links (both desktop inline and mobile panel) */
    .site-nav a:focus-visible, .site-nav-panel a:focus-visible {
      outline: 2px solid var(--color-focus-ring, var(--indigo-500));
      outline-offset: 2px;
      border-radius: 2px;
    }

    /* REVIEW FIX (checker BLOCKER 1): the <ul> and <li> are flattened
       into the parent flex container via display:contents on these CSS
       classes, NOT via an inline JSX display rule. This satisfies the grep
       gate that forbids inline display rules in Header.jsx. */
    .nav-list { display: contents; list-style: none; padding: 0; margin: 0; }
    .nav-item { display: contents; }
  `;

  const renderLinks = (panelClass) => (
    <ul className={`${panelClass} nav-list`}>
      {links.map(([href, label]) => (
        <li key={href} className="nav-item">
          <a href={href}
             style={{
               fontFamily: 'var(--font-body)',
               fontWeight: active === href ? 700 : 400,
               fontSize: 16,
               color: active === href ? 'var(--coral-500)' : 'var(--indigo-500)',
               textDecoration: 'none',
               position: 'relative',
               paddingBottom: 4,
             }}>
            {label}
            {active === href && <Mark.Underline />}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <header role="banner" style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(245, 220, 199, 0.92)',
      padding: '14px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <style dangerouslySetInnerHTML={{ __html: styleBlock }} />
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', lineHeight: 1 }}>
        <img src="/mark.svg" alt="" width={34} height={34} />
        <span style={{ fontFamily: 'var(--font-wordmark)', fontSize: 28, color: 'var(--coral-500)', letterSpacing: '-0.02em', lineHeight: 1 }}>Studio Bluemli</span>
      </a>

      {/* Desktop nav — inline. CSS hides this at <= 640px. NO inline display style. */}
      <nav id="primary-nav" className="site-nav" aria-label="Site navigation">
        {renderLinks('site-nav-list')}
      </nav>

      {/* Mobile nav — native <details>/<summary>. aria-expanded is computed
          automatically by the platform from the [open] attribute. Do NOT add
          a static aria-expanded here. */}
      <details className="site-mobile-nav">
        <summary aria-label="Open navigation menu" aria-controls="mobile-nav-panel">
          <span className="nav-hamburger-button" aria-hidden="true">
            <span className="nav-hamburger-icon" aria-hidden="true" />
          </span>
        </summary>
        <nav id="mobile-nav-panel" className="site-nav-panel" aria-label="Mobile site navigation">
          {renderLinks('site-nav-list-mobile')}
        </nav>
      </details>
    </header>
  );
}

// HeaderProps.active union — must accept ALL five route paths.
// /about is included even though it's not in the visible nav, because
// Plan 04 about.astro passes `active="/about"`. Missing this entry breaks
// `pnpm exec astro check` with a prop-type error.
/** @typedef {Object} HeaderProps
 *  @property {'/' | '/gallery' | '/popups' | '/about' | '/say-hi'} [active]
 */

export default Header;
```

**Acceptance verification — Header.jsx MUST NOT contain an inline `style={{ display:` on the `<nav>` element** (REVIEW FIX H2): the inline flex was the root cause of the mobile-nav-can't-collapse bug. After writing the file, run:

```bash
# The <nav> element specifically must have NO inline style attribute on its tag.
# This regex anchors on `<nav` so it enforces the H2 intent (no inline display
# clobbering the mobile collapse rule) without false-positives on benign inline
# styles on <header>, the logo <a>, sub-divs, etc.
! grep -nE '<nav[^>]*style=\{\{' src/components/design-skill/Header.jsx
```
The grep MUST exit 1 (no matches found).


Why each change vs synced version:
- Hash anchors `#home`/`#gallery`/`#pop-ups`/`#say hi` → real routes `/`/`/gallery`/`/popups`/`/say-hi` (PATTERNS.md line 403)
- `active='home'` default → `active='/'` (route-based per PATTERNS.md "planner decision: pass `active` from the page")
- HeaderProps.active union expanded to `'/' | '/gallery' | '/popups' | '/about' | '/say-hi'` (about.astro in Plan 04 passes `active="/about"` — without this entry `astro check` fails — see also: this is documented as the fix for checker BLOCKER #2)
- `role="banner"` on header and `aria-label="Site navigation"` on nav (UI-SPEC accessibility floor)
- Font weight 400/700 at 16px (UI-SPEC Typography In Use) — replaces original's 600/800 at 14px
- `onClick` and `onNav` removed — dead code without hydration; real `<a href>` navigates
- **NEW: Native `<details>/<summary>` mobile hamburger** (REVIEW FIX H2). The previous checkbox-hack version had two real bugs Codex caught: (1) the inline `style={{ display: 'flex' }}` on `<nav>` overrode the mobile `.site-nav { display: none }` rule so the nav couldn't collapse, and (2) the static `aria-expanded="false"` never updated. The `<details>/<summary>` approach is strictly better: `<summary>` is keyboard-focusable and Enter/Space togglable natively (no JS, no checkbox), and `aria-expanded` is automatically derived by the platform from the `[open]` attribute on `<details>` — so we never ship a stale ARIA value. The chevron arrow is suppressed via `summary::-webkit-details-marker { display: none }` + `summary::marker { content: '' }`. At `max-width: 640px` the inline `.site-nav` is hidden and the `<details>` widget is shown; on desktop the reverse. 44px min touch target and `:focus-visible` styling are preserved.

**Edit 2 — `src/components/design-skill/Hero.jsx`** (PATTERNS.md decision #3):

In the synced Hero.jsx, find every `<Button onClick={...}>...</Button>` and replace with a styled `<a href>`. Specifically:
- The primary CTA `<Button variant="primary" onClick={onCTA}>see the gallery</Button>` → `<a href="/gallery" className="hero-cta-primary">see the gallery</a>`
- The secondary CTA `<Button variant="secondary">next pop-up</Button>` → `<a href="/popups" className="hero-cta-secondary">next pop-up</a>`

Add scoped styles inside the component (inline `style={{...}}` blocks matching the original Button visual — coral fill, cream-50 text, 12px 24px padding, 8px border-radius for primary; transparent fill, coral-500 outline (use `box-shadow: inset 0 0 0 2px var(--coral-500)`, NOT `border: 1px`/`border: 2px` is fine since CI Rule 5 only catches 1px), coral-500 text for secondary). Use `var(--*)` tokens, not raw hex.

ALSO: Override `lineHeight: 1.6` on the h1 (PATTERNS.md line 510) to `lineHeight: 1.05` (UI-SPEC `--lh-tight`). Override `fontSize: 56` to a CSS clamp: `fontSize: 'clamp(48px, 8vw, 88px)'` (UI-SPEC mobile/desktop h1 hero clamp).

**Edit 3 — `src/components/design-skill/Footer.jsx`** (PATTERNS.md decision #8 — email; line 459):

In the synced Footer.jsx:
- Find: `<a href="mailto:hello@studiobluemli.com">hello@studiobluemli.com</a>`
- Replace with: `<a href="mailto:hi@studiobluemli.com">hi@studiobluemli.com</a>`
  (UI-SPEC §"Footer chrome" line 227 specifies `hi@studiobluemli.com`; the design skill's `hello@` is outdated. UI-SPEC is the latest contract per PATTERNS.md line 459.)
- Add `role="contentinfo"` to the `<footer>` element (UI-SPEC accessibility floor + §"Footer chrome")
- Change `fontSize: 11` on the copyright line to `fontSize: 14` (PATTERNS.md line 458 — design-system minimum 14px = `--fs-xs`)
- Confirm Mark.Dots is imported and rendering (it should be after sync; this is a sanity check)

**Edit 4 — `src/components/design-skill/AppointmentForm.jsx`** (PATTERNS.md decision #4; FND-13 :focus-visible):

The synced file still has `React.useState`. Replace the entire component body with this static form. **CRITICAL: `outline: 'none'` is REMOVED from `inputStyle` because FND-13 requires every interactive element to have visible focus. The global `:focus-visible` rule (added by Plan 04 Task 2 to BaseLayout's `<style is:global>` block) supplies the visible outline.** If for any reason a per-input `:focus-visible` override is needed, add it as a className-driven style — but DO NOT use `outline: 'none'`.

```jsx
/* eslint-disable */
import React from 'react';
import Button from './Button';

function AppointmentForm() {
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontFamily: 'var(--font-body)',
    fontSize: 16,
    color: 'var(--color-fg)',
    background: 'var(--cream-50)',
    border: 'none',
    borderBottom: '2px solid var(--color-border-soft)',
    // NOTE: NO `outline: 'none'` — FND-13 requires :focus-visible to show.
    // The global :focus-visible rule (Plan 04 Task 2, BaseLayout <style is:global>)
    // supplies the visible outline.
    borderRadius: 4,
  };
  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: 'var(--color-fg-muted)',
    marginBottom: 4,
  };

  return (
    <section id="say-hi" style={{ padding: '40px 32px 80px', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--olive-500)', marginBottom: 8 }}>say hi</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 48, lineHeight: 1.2, color: 'var(--coral-500)', margin: 0 }}>let's talk earrings</h2>
      </div>
      <form method="POST" action="/api/contact" style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
        <div>
          <label style={labelStyle} htmlFor="say-hi-name">your name</label>
          <input id="say-hi-name" name="name" style={inputStyle} placeholder="first name is fine" />
        </div>
        <div>
          <label style={labelStyle} htmlFor="say-hi-email">email</label>
          <input id="say-hi-email" name="email" type="email" style={inputStyle} placeholder="you@somewhere.nice" />
        </div>
        <div>
          <label style={labelStyle} htmlFor="say-hi-notes">what are you hoping for?</label>
          <textarea id="say-hi-notes" name="notes" rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="a particular color, a gift, just looking…" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <Button variant="primary" size="lg" type="submit">send</Button>
        </div>
      </form>
    </section>
  );
}

export default AppointmentForm;
```

Critical changes vs synced:
- DROP `useState`, `update`, `submit`, and the "thank you!" branch
- Form is `method="POST" action="/api/contact"` (Phase 4 wires the handler; Phase 1 submitting will 404, acceptable per RESEARCH.md Open Question 4)
- Every input has a `name="..."` attribute (future Phase 4 reads them)
- Fix the synced original's `<section id="say hi">` SPACE-IN-ID → `id="say-hi"` (PATTERNS.md line 604; matches the route)
- `border: 'none'` plus `borderBottom: '2px solid'` (NOT 1px — CI Rule 5)
- **NO `outline: 'none'` anywhere** (FND-13). This is enforced by the acceptance criterion `! grep -rE "outline:\\s*['\"]?none" src/components/design-skill/` below.

**Edit 5 — `src/components/design-skill/PopupStrip.jsx` and `src/components/design-skill/About.jsx`** (verify synced shapes match what Plan 04 consumes — checker BLOCKER #5):

**Step 5a — Read the just-synced PopupStrip.jsx** and confirm: the source uses `function PopupStrip({ onAppointment })` and has **hardcoded** "NOPA block party / Saturday, June 6 · 10–2 pm" copy. The mechanical sync transforms this to ES-module form but does NOT change the prop name or unhardcode the copy. Plan 04 passes `<PopupStrip popup={sampleNextPopup} />` — so we MUST refactor here.

Replace the synced PopupStrip.jsx body with this exact content (accepts a `popup` data prop matching the `Popup` type defined in Plan 04's `src/sample-data.ts`):

```jsx
/* eslint-disable */
import React from 'react';
import Mark from './Mark';

function PopupStrip({ popup }) {
  // popup: { name, date (ISO), startTime "HH:MM", endTime "HH:MM", tz, location }
  // The "next pop-up" eyebrow + the popup data render the same strip the design
  // skill demoed — but the values come from the prop (D-01: demo-loaded → real Phase 3 data).
  const dateLabel = (() => {
    if (!popup || !popup.date) return '';
    // Format the ISO date as "Saturday, June 6". Use Intl.DateTimeFormat with the
    // popup's timezone so the displayed weekday is correct regardless of build TZ.
    try {
      const d = new Date(popup.date + 'T' + (popup.startTime || '12:00') + ':00');
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
        timeZone: popup.tz || 'America/Los_Angeles',
      }).format(d);
    } catch { return popup.date; }
  })();
  const timeLabel = popup && popup.startTime && popup.endTime
    ? `${popup.startTime}–${popup.endTime}`
    : '';

  return (
    <section id="pop-ups" style={{
      margin: '40px 24px',
      padding: '56px 32px 56px',
      background: 'var(--cream-50)',
      borderRadius: 32,
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Color stripe (real brand swatches, not flowers) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 8,
        display: 'flex',
      }}>
        {['--coral-500','--pink-500','--mustard-500','--olive-500','--indigo-500','--lavender-500'].map((c, i) => (
          <div key={i} style={{ flex: 1, background: `var(${c})` }} />
        ))}
      </div>

      <div className="eyebrow" style={{
        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 800, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: 'var(--olive-500)', marginBottom: 10,
      }}>next pop-up</div>

      <h2 style={{ position: 'relative', display: 'inline-block', fontFamily: 'var(--font-display)', fontSize: 80, color: 'var(--pink-500)', margin: '0 0 4px', lineHeight: 1 }}>
        pop-up
        <Mark.Underline color="var(--pink-500)" />
      </h2>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--olive-500)', lineHeight: 1.2, marginTop: 14 }}>
        at <span style={{ color: 'var(--indigo-500)' }}>{popup?.location || 'TBD'}</span>
      </div>

      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 18, color: 'var(--indigo-700)', marginTop: 14 }}>
        {dateLabel}{timeLabel ? ` · ${timeLabel}` : ''}
      </div>

      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {/* Replaced the synced <Button onClick={onAppointment}> with a real <a> to /say-hi.
            No client: directive needed; SSR-safe. */}
        <a href="/say-hi" style={{
          display: 'inline-flex', alignItems: 'center', padding: '12px 24px',
          background: 'var(--coral-500)', color: 'var(--cream-50)',
          textDecoration: 'none', borderRadius: 8,
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16,
        }}>book by appointment</a>
      </div>
    </section>
  );
}

export default PopupStrip;
```

**Verified PopupStrip prop name: `popup`** (matches Plan 04 Task 3 `<PopupStrip popup={sampleNextPopup} />`).

**Step 5b — Read the just-synced About.jsx** and verify: the source is `function About()` with no props, no `useState`, only references `Mark.Heart` (locally imported via the synced ES-module form), CSS vars, and `--font-hand`. Caveat is now actively loaded via the Astro Fonts API (Plan 01) and preloaded in BaseLayout (Plan 04 Task 2) per REVIEW FIX M5. About.jsx's `--font-hand` reference will resolve to the loaded Caveat at runtime — D-16 is satisfied. **No edits needed beyond mechanical transforms.** Document this in the SUMMARY: "About.jsx required no post-sync edits — passed verification."

If, contrary to expectation, the synced About.jsx contains `useState` OR a cross-skill import OR a `client:`-requiring pattern, halt and refactor it now (do not defer). The expected post-sync About.jsx body is roughly:

```jsx
/* eslint-disable */
import React from 'react';
import Mark from './Mark';

function About() {
  return (
    <section style={{
      maxWidth: 720, margin: '0 auto', padding: '64px 32px 32px', textAlign: 'center',
    }}>
      <div className="eyebrow" style={{ /* ... existing ... */ }}>about the studio</div>
      <h2 style={{ /* ... existing ... */ }}>
        hand-assembled, one&nbsp;pair at&nbsp;a&nbsp;time
      </h2>
      <p style={{ /* ... existing ... */ }}>
        I make earrings out of a little studio in NoPa, San Francisco — sourced glass, seed beads, vintage findings.
        Every pair is one-of-a-kind, and once it's gone, it's gone.
      </p>
      <div style={{ /* ... existing ... */ }}>
        — the founder <Mark.Heart color="var(--coral-500)" />
      </div>
    </section>
  );
}

export default About;
```

**Edit 6 — `src/components/design-skill/GalleryGrid.jsx`** (PATTERNS.md decisions #5, #6):

After reading the synced GalleryGrid.jsx, refactor:
- DELETE any `const PRODUCTS = [...]` hardcoded array near the top (PATTERNS.md decision #6 — the referenced product images don't exist in this repo)
- DELETE any `React.useState('all')` filter state and the filter button row JSX (PATTERNS.md decision #5)
- The component must accept a `pieces` prop typed as an array of `{ slug, name, price, status, photo }` objects (matches the shape exported from `src/sample-data.ts` which Plan 04 will create)
- Inside the component body, iterate `pieces.map(piece => ...)` to render each card
- Each card shows: the photo `<img src={piece.photo} alt={piece.name} width="..." height="..." style={{...}}/>`, the name, the price `${piece.price}`, and a quiet availability badge (`Available` / `Sold` / `One of one` / `Reserved`) styled per UI-SPEC §"Availability badges render as quiet editorial labels" (no red "SOLD OUT" stamps)
- Keep the grid CSS layout from the synced version (2-col mobile, 3-col desktop) but replace any hardcoded card content with the `pieces` prop loop

Target component skeleton:
```jsx
/* eslint-disable */
import React from 'react';

function GalleryGrid({ pieces = [] }) {
  return (
    <section id="gallery" style={{
      padding: '40px 32px 80px',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 24,
      }}>
        {pieces.map((piece) => (
          <article key={piece.slug} style={{
            background: 'var(--color-surface-card)',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            <img src={piece.photo} alt={piece.name} width={400} height={500}
                 style={{ width: '100%', height: 'auto', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '12px 16px 16px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: 'var(--color-fg-strong)' }}>{piece.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-fg-muted)' }}>
                <span>${piece.price}</span>
                <span>{piece.status === 'available' ? 'Available' : piece.status === 'sold' ? 'Sold' : piece.status === 'one-of-one' ? 'One of one' : 'Reserved'}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default GalleryGrid;
```

You may keep additional decorative wrappers from the original synced file (e.g., section header) as long as the core constraints above hold.

**Edit 7 — `src/components/design-skill/Button.jsx` AND a NEW `src/styles/components.css`** (PATTERNS.md decision #7; REVIEW FIX M4):

CONTEXT and the design skill lock `colors_and_type.css` as "imported once, never extended" (D-04 / D-06; CLAUDE.md skill rules). Codex flagged that appending `.btn-primary` styles to that file violates the lock. **The fix: put component-specific styles in a NEW sibling stylesheet `src/styles/components.css`**, which Plan 04's BaseLayout will import AFTER `colors_and_type.css` so the tokens are in scope.

**Step 7a — In the synced `src/components/design-skill/Button.jsx`:**
- DELETE `onMouseEnter`, `onMouseLeave`, `onPointerDown`, `onPointerUp` handler props and any `useState` hover/press state (if present)
- Replace inline `style={{ background: hover ? coralHover : coral, transform: pressed ? 'scale(0.97)' : 'scale(1)' }}` with a static `style={{...}}` + a `className="btn-primary"` (for primary variant). The static `style` keeps token-driven properties (background, color, padding, font, border-radius) that don't change on hover.
- DO NOT use `border: 1px` — CI Rule 5 will catch it. Use `box-shadow: inset 0 0 0 2px var(--coral-500)` for outline-style variants.

**Step 7b — Create a NEW file `src/styles/components.css`** at the path `src/styles/components.css` with this exact content (REVIEW FIX M4 — colors_and_type.css MUST remain a verbatim copy of the design-skill source minus the Google Fonts @import; component-specific styles live HERE):

```css
/* src/styles/components.css
 * Component-specific styles for design-skill components that need CSS pseudo-classes
 * (:hover, :active, :focus-visible) which can't be expressed in React inline styles.
 *
 * REVIEW FIX M4: this file exists so colors_and_type.css stays a verbatim copy of the
 * design-skill source (minus the Google Fonts @import). DO NOT move styles from here
 * back into colors_and_type.css — that file is locked.
 *
 * Plan 04's BaseLayout.astro imports this file AFTER colors_and_type.css, so the
 * --coral-*, --indigo-*, --cream-* tokens are in scope here.
 */

.btn-primary {
  transition: background 0.15s ease, transform 0.08s ease;
}
.btn-primary:hover {
  background: var(--coral-700);
}
.btn-primary:active {
  transform: scale(0.97);
}
```

**Step 7c — colors_and_type.css MUST NOT be touched in this task.** The only change to that file in Plan 02 was the Google Fonts `@import` strip in Task 2 (mechanical sync). No `.btn-primary` (or any other component selector) gets appended.

**Step 7d — Acceptance verification: colors_and_type.css unchanged after Plan 02 completes** (REVIEW FIX M4). After the sync script runs, record the file's content hash. After Task 3 completes, verify the hash is unchanged (i.e., the only diff vs source is the Google Fonts @import line removal). Use this grep gate as the canonical check:

```bash
# colors_and_type.css MUST NOT contain any of these component selectors after Plan 02.
# If a future task appends component styles, this grep fails the build.
! grep -E "^\.btn-primary|^\.site-nav|^\.nav-hamburger|^\.hero-cta|^\.skip-link" src/styles/colors_and_type.css
```

Goal: Button still LOOKS the same in resting state in SSR HTML; hover/press are now interactive without JS via CSS pseudo-classes; `colors_and_type.css` is byte-equivalent to the source design-skill file minus the one stripped `@import`.

**Step — Final verification.** Run:
```bash
# Confirm AppointmentForm has the POST form and no useState
grep -q "method=\"POST\"" src/components/design-skill/AppointmentForm.jsx && grep -q "action=\"/api/contact\"" src/components/design-skill/AppointmentForm.jsx
! grep -q "React.useState\|useState" src/components/design-skill/AppointmentForm.jsx

# Confirm Header has the new route paths AND the CSS-only hamburger AND extended HeaderProps union
grep -q "href=\"/gallery\"\|'/gallery'" src/components/design-skill/Header.jsx
grep -q "role=\"banner\"" src/components/design-skill/Header.jsx
grep -q "aria-label=\"Open navigation menu\"" src/components/design-skill/Header.jsx
grep -q "aria-controls=\"mobile-nav-panel\"" src/components/design-skill/Header.jsx
grep -q "/about" src/components/design-skill/Header.jsx   # HeaderProps.active union includes /about
grep -q "nav-hamburger" src/components/design-skill/Header.jsx

# Confirm Footer email is hi@
grep -q "hi@studiobluemli.com" src/components/design-skill/Footer.jsx
! grep -q "hello@studiobluemli.com" src/components/design-skill/Footer.jsx

# Confirm GalleryGrid accepts pieces prop and has no PRODUCTS hardcoded
grep -q "pieces" src/components/design-skill/GalleryGrid.jsx
! grep -q "const PRODUCTS\s*=\s*\[" src/components/design-skill/GalleryGrid.jsx

# Confirm PopupStrip accepts `popup` prop (not onAppointment) and no hardcoded NOPA copy
grep -q "{ popup }" src/components/design-skill/PopupStrip.jsx
! grep -q "NOPA block party" src/components/design-skill/PopupStrip.jsx
! grep -q "Saturday, June 6" src/components/design-skill/PopupStrip.jsx
! grep -q "onAppointment" src/components/design-skill/PopupStrip.jsx

# Confirm About has no useState and no cross-skill imports
! grep -q "useState" src/components/design-skill/About.jsx
! grep -qE "from\s+['\"]\.\./\.\./" src/components/design-skill/About.jsx

# Confirm Button has no onMouseEnter/onPointerDown
! grep -E "onMouseEnter|onMouseLeave|onPointerDown|onPointerUp" src/components/design-skill/Button.jsx

# Confirm NO outline:none anywhere in design-skill components (FND-13)
! grep -rE "outline:\s*['\"]?none" src/components/design-skill/

# Confirm no 1px borders anywhere
! grep -rE "border(-top|-bottom|-left|-right)?:\s*1px" src/components/design-skill/

# REVIEW FIX H2: Header.jsx must NOT carry an inline style attribute on its <nav> element.
# The previous version had `<nav className="site-nav" style={{ display: 'flex', gap: 22 }}>` which
# overrode the mobile collapse rule .site-nav { display: none }. The regex anchors on <nav so it
# only flags inline styles on the <nav> tag itself (not benign inline styles elsewhere in the file).
! grep -nE '<nav[^>]*style=\{\{' src/components/design-skill/Header.jsx

# REVIEW FIX H2: Header.jsx must use <details>/<summary> for the mobile hamburger
# (semantic, native aria-expanded). Grep gates:
grep -q "<details" src/components/design-skill/Header.jsx
grep -q "<summary" src/components/design-skill/Header.jsx
# It must NOT contain a static aria-expanded attribute on the toggle.
! grep -E 'aria-expanded="(true|false)"' src/components/design-skill/Header.jsx

# REVIEW FIX M4: colors_and_type.css must NOT have been extended with component styles.
! grep -E '^\.btn-primary|^\.site-nav|^\.nav-hamburger|^\.hero-cta|^\.skip-link' src/styles/colors_and_type.css
# And the new components.css sibling exists with .btn-primary rules.
test -f src/styles/components.css && grep -q "\.btn-primary" src/styles/components.css

# Confirm brand rules pass on the synced + edited components
grep -rEnP "(bg-white|background:\s*white|#fff(?![0-9a-fA-F])|#[fF]{6})" --include="*.jsx" src/components/design-skill/ || echo "PASS: no white bg"
grep -rEni "\b(flower|petal|floral|bloom|blossom)\b" --include="*.jsx" src/components/design-skill/ || echo "PASS: no flower vocab"
grep -rEn "gradient" --include="*.jsx" src/components/design-skill/ || echo "PASS: no gradients"
grep -rEn "(backdrop-filter|backdropFilter|WebkitBackdropFilter)" --include="*.jsx" src/components/design-skill/ || echo "PASS: no backdrop-filter"
```
All PASS lines must print. Any grep that finds a violation must be fixed before the task is done.
  </action>
  <verify>
    <automated>grep -q "method=\"POST\"" src/components/design-skill/AppointmentForm.jsx && grep -q "action=\"/api/contact\"" src/components/design-skill/AppointmentForm.jsx && ! grep -q "useState" src/components/design-skill/AppointmentForm.jsx && grep -q "id=\"say-hi\"" src/components/design-skill/AppointmentForm.jsx && grep -q "role=\"banner\"" src/components/design-skill/Header.jsx && grep -q "aria-label=\"Site navigation\"" src/components/design-skill/Header.jsx && grep -q "aria-label=\"Open navigation menu\"" src/components/design-skill/Header.jsx && grep -q "aria-controls=\"mobile-nav-panel\"" src/components/design-skill/Header.jsx && grep -qE "/about" src/components/design-skill/Header.jsx && grep -qE "nav-hamburger" src/components/design-skill/Header.jsx && grep -qE "href=[\"']/gallery[\"']|'/gallery'" src/components/design-skill/Header.jsx && grep -qE "href=[\"']/popups[\"']|'/popups'" src/components/design-skill/Header.jsx && grep -qE "href=[\"']/say-hi[\"']|'/say-hi'" src/components/design-skill/Header.jsx && grep -q "hi@studiobluemli.com" src/components/design-skill/Footer.jsx && ! grep -q "hello@studiobluemli.com" src/components/design-skill/Footer.jsx && grep -q "role=\"contentinfo\"" src/components/design-skill/Footer.jsx && grep -q "pieces" src/components/design-skill/GalleryGrid.jsx && ! grep -qE "const PRODUCTS\s*=\s*\[" src/components/design-skill/GalleryGrid.jsx && grep -q "{ popup }" src/components/design-skill/PopupStrip.jsx && ! grep -q "NOPA block party" src/components/design-skill/PopupStrip.jsx && ! grep -q "onAppointment" src/components/design-skill/PopupStrip.jsx && ! grep -q "useState" src/components/design-skill/About.jsx && ! grep -E "onMouseEnter|onMouseLeave|onPointerDown|onPointerUp" src/components/design-skill/Button.jsx && ! grep -rE "outline:\s*['\"]?none" src/components/design-skill/ && ! grep -rE "border(-top|-bottom|-left|-right)?:\s*1px" src/components/design-skill/ && ! grep -rEni '\b(flower|petal|floral|bloom|blossom)\b' --include="*.jsx" src/components/design-skill/ && ! grep -rEn "gradient" --include="*.jsx" src/components/design-skill/ && ! grep -rEn "(backdrop-filter|backdropFilter|WebkitBackdropFilter)" --include="*.jsx" src/components/design-skill/</automated>
  </verify>
  <acceptance_criteria>
    - `src/components/design-skill/Header.jsx` contains `role="banner"`, `aria-label="Site navigation"`, and route paths `/gallery`, `/popups`, `/say-hi` (decision #1, #2)
    - `src/components/design-skill/Header.jsx` does NOT contain `#home`, `#gallery`, `#pop-ups`, `#say hi` hash anchors as primary nav targets (they were replaced)
    - **NEW (checker BLOCKER #1):** `src/components/design-skill/Header.jsx` contains `aria-label="Open navigation menu"` (the CSS-only mobile hamburger button)
    - **NEW (checker BLOCKER #1):** `src/components/design-skill/Header.jsx` contains `aria-controls="mobile-nav-panel"` (links the `<summary>` to the `<nav id="mobile-nav-panel">` it discloses; updated from the obsolete `primary-nav` ID per checker iteration 2 BLOCKER 2 fix)
    - **NEW (checker BLOCKER #1):** `src/components/design-skill/Header.jsx` contains the string `nav-hamburger` (the hamburger button class for the `<details>/<summary>` mobile disclosure widget — the obsolete `nav-toggle` checkbox-hack class was removed in the REVIEW FIX H2 rewrite per checker iteration 2 BLOCKER 2 fix)
    - **NEW (checker BLOCKER #1):** `src/components/design-skill/Header.jsx` contains a `:focus-visible` style on the hamburger and/or nav links
    - **NEW (checker BLOCKER #2):** `src/components/design-skill/Header.jsx` `HeaderProps.active` union (in the JSDoc typedef OR in TypeScript types if migrated) accepts `/about` — verified by `grep -q "/about" src/components/design-skill/Header.jsx`. The 5 valid values are `'/' | '/gallery' | '/popups' | '/about' | '/say-hi'`.
    - `src/components/design-skill/Hero.jsx` does NOT contain `<Button onClick=` for the two CTAs (decision #3 — CTAs are now `<a>`)
    - `src/components/design-skill/Footer.jsx` contains `hi@studiobluemli.com` and does NOT contain `hello@studiobluemli.com` (decision #8)
    - `src/components/design-skill/Footer.jsx` contains `role="contentinfo"`
    - `src/components/design-skill/AppointmentForm.jsx` contains `method="POST"` and `action="/api/contact"` (decision #4)
    - `src/components/design-skill/AppointmentForm.jsx` does NOT contain the string `useState` (state stripped)
    - `src/components/design-skill/AppointmentForm.jsx` contains `id="say-hi"` (not `id="say hi"` with space)
    - **NEW (checker BLOCKER #4):** `src/components/design-skill/AppointmentForm.jsx` does NOT contain `outline: 'none'` — the per-input style relies on the global `:focus-visible` rule from Plan 04 Task 2 BaseLayout
    - **NEW (checker BLOCKER #4):** No `outline:\\s*['\"]?none` anywhere in `src/components/design-skill/`: `! grep -rE "outline:\\s*['\"]?none" src/components/design-skill/` exits 0
    - `src/components/design-skill/GalleryGrid.jsx` contains the string `pieces` (prop in use, decision #5/#6)
    - `src/components/design-skill/GalleryGrid.jsx` does NOT contain `const PRODUCTS = [` (hardcoded array removed)
    - **NEW (checker BLOCKER #5):** `src/components/design-skill/PopupStrip.jsx` accepts a `popup` prop: `grep -q "{ popup }" src/components/design-skill/PopupStrip.jsx` exits 0
    - **NEW (checker BLOCKER #5):** `src/components/design-skill/PopupStrip.jsx` does NOT contain the hardcoded `NOPA block party` or `Saturday, June 6` copy (data flows from the prop)
    - **NEW (checker BLOCKER #5):** `src/components/design-skill/PopupStrip.jsx` does NOT contain `onAppointment` (the original handler-prop is replaced; a real `<a href="/say-hi">` is used instead)
    - **NEW (checker BLOCKER #5):** `src/components/design-skill/About.jsx` does NOT contain `useState` and has no cross-skill imports (verified by reading the synced file)
    - `src/components/design-skill/Button.jsx` does NOT contain `onMouseEnter`, `onMouseLeave`, `onPointerDown`, or `onPointerUp` (decision #7 — converted to CSS)
    - **NEW (REVIEW FIX H2):** `src/components/design-skill/Header.jsx` does NOT carry an inline `style={{` attribute on its `<nav>` element: `! grep -nE '<nav[^>]*style=\{\{' src/components/design-skill/Header.jsx` exits 0. (The previous version had an inline `display: 'flex'` on `<nav>` that overrode the mobile collapse rule — Codex caught this. The new `<details>/<summary>` version drives ALL responsive display behavior on `<nav>` from CSS classes only.)
    - **NEW (REVIEW FIX H2):** `src/components/design-skill/Header.jsx` contains the strings `<details` and `<summary`: `grep -q "<details" src/components/design-skill/Header.jsx && grep -q "<summary" src/components/design-skill/Header.jsx` exits 0
    - **NEW (REVIEW FIX H2):** `src/components/design-skill/Header.jsx` does NOT contain a static `aria-expanded="true"` or `aria-expanded="false"` attribute (the native `<details>` widget computes aria-expanded from the `open` attribute automatically): `! grep -E 'aria-expanded="(true|false)"' src/components/design-skill/Header.jsx` exits 0
    - **NEW (REVIEW FIX M4):** `src/styles/colors_and_type.css` does NOT contain any component selectors at the start of a line: `! grep -E '^\.btn-primary|^\.site-nav|^\.nav-hamburger|^\.hero-cta|^\.skip-link' src/styles/colors_and_type.css` exits 0
    - **NEW (REVIEW FIX M4):** `src/styles/components.css` exists and contains `.btn-primary`: `test -f src/styles/components.css && grep -q "\.btn-primary" src/styles/components.css` exits 0
    - No 1px borders anywhere in `src/components/design-skill/`: `grep -rE "border(-top|-bottom|-left|-right)?:\s*1px" src/components/design-skill/` exits 1
    - No flower vocabulary in components: `grep -rEni '\b(flower|petal|floral|bloom|blossom)\b' --include="*.jsx" src/components/design-skill/` exits 1
    - No gradients: `grep -rEn "gradient" --include="*.jsx" src/components/design-skill/` exits 1
    - No backdrop-filter anywhere: `grep -rEn "(backdrop-filter|backdropFilter|WebkitBackdropFilter)" --include="*.jsx" src/components/design-skill/` exits 1
    - All 11 components still export default after edits: `grep -L "export default" src/components/design-skill/*.jsx` produces empty output
  </acceptance_criteria>
  <done>The 11 design-skill components are SSR-safe (no useState, no `client:` directive needed), brand-clean (no white/flower/gradient/backdrop-filter/1px-border), accessibility-clean (no `outline: 'none'`, CSS-only hamburger present), and aligned with the UI-SPEC contract (role landmarks, hi@ email, route-based active state, mobile hamburger). PopupStrip accepts a `popup` data prop; About requires no post-sync edits beyond mechanical transforms. Plan 04 can now import them into the 5 page files without further modification.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| design skill → src/ | one-shot copy across a documentation/source boundary. The `.claude/skills/` directory is a tooling artifact, not a runtime dep. The sync script crosses this boundary by reading-and-rewriting files. |
| SSR React vs client React | server-rendered React 19 produces HTML; the components retain handler props (`useState`, `onClick`) that would be DEAD without `client:` directives. Misuse (adding `client:load` to one of these) ships React to the browser unexpectedly. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-02-01 | Tampering | Sync script accidentally overwrites local hand-edits if re-run | mitigate | Script is idempotent for the React-import insert but OVERWRITES component files on re-run. Document in script comments and SUMMARY: "re-run only when founder explicitly updates the skill and wants to re-pull." D-04 makes `src/` the source of truth after first sync. |
| T-02-02 | Information Disclosure | Synced JSX accidentally contains skill-author email/handle strings | accept | The design skill is the project's own asset; no external author. Verified the JSX contains only `@studio_bluemli` and `hi@studiobluemli.com` (or `hello@`, fixed in Task 3) — both are intentional public brand strings, not secrets. |
| T-02-03 | Tampering | `<form action="/api/contact">` in AppointmentForm.jsx routes to a path that has no handler in Phase 1 — a user submitting in Phase 1 gets a 404 | accept | Documented in UI-SPEC §"Demo-Loaded Page Shells" — Phase 4 ships the real handler. Phase 1 Say Hi shell explicitly shows "form shell (no POST endpoint until Phase 4)" so the founder is aware. No security risk; just a non-functional submit. |
| T-02-04 | Elevation of Privilege | A future contributor adds `client:load` to one of these components and ships React (~40KB gz) + form submit logic to the browser unexpectedly | mitigate | UI-SPEC §"Demo-Loaded Page Shells" line 337 documents "No `client:` directives on any component" as a hard rule. CI doesn't grep for this in Phase 1 (no rule defined) but a `grep -rE "client:(load|idle|visible|media|only)" src/pages/` check could be added to `check-brand-rules.sh` in a later phase if it becomes a problem. Phase 1 mitigates via documentation, not enforcement. |
</threat_model>

<verification>
After all three tasks complete:
1. `ls src/components/design-skill/*.jsx | wc -l` reports 11
2. `pnpm exec astro check` exits 0 (the synced JSX is syntactically valid; React 19 types resolve)
3. CI grep rules pass on `src/`: no `bg-white`, no `#fff`, no `flower|petal|floral|bloom|blossom`, no `gradient`, no `backdrop-filter`, no `border: 1px` anywhere in `src/components/design-skill/` or `src/styles/colors_and_type.css`
4. `! grep -rE "outline:\\s*['\"]?none" src/components/design-skill/` (FND-13 — no suppressed focus outlines)
5. The synced CSS contains `--color-bg` and the cream value `#F5DCC7`
6. The CSS does NOT contain `fonts.googleapis.com`
</verification>

<success_criteria>
- `scripts/sync-design-skill.mjs` is committed and idempotent
- 11 components in `src/components/design-skill/` all SSR-safe with `export default`, `import React`, no UMD globals, no `useState` on AppointmentForm, no `PRODUCTS` array on GalleryGrid, no hover handlers on Button
- Brand tokens in `src/styles/colors_and_type.css` with the Google Fonts `@import` stripped
- All brand-non-negotiable CI rules pass when grep'd against `src/components/design-skill/` and `src/styles/`
- Header uses real routes and `active` prop matches route paths; Header ships a CSS-only mobile hamburger with `aria-label="Open navigation menu"`, `aria-controls`, `:focus-visible` (UI-SPEC §Header chrome); HeaderProps.active union accepts `/about` (Plan 04 about.astro contract)
- Footer uses `hi@studiobluemli.com` and `role="contentinfo"`
- AppointmentForm posts to `/api/contact` (reserved for Phase 4) AND has no `outline: 'none'` anywhere (FND-13)
- PopupStrip accepts a `popup: Popup` data prop (matches Plan 04 Task 3 consumer); About verified to need no post-sync edits beyond mechanical transforms
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundations-brand-system/01-02-SUMMARY.md` with:
- List of 11 components copied and their post-sync edits applied (including: Header CSS-only hamburger pattern chosen, PopupStrip refactored to `popup` prop, About required no post-sync edits)
- Confirmation that `colors_and_type.css` `@import url(fonts.googleapis.com)` line is stripped
- The mobile hamburger mechanism chosen: **native `<details>/<summary>`** (REVIEW FIX H2). `<summary aria-controls="mobile-nav-panel">` wraps the `.nav-hamburger-button` icon and toggles a sibling `<nav id="mobile-nav-panel">`; the platform derives `aria-expanded` from the `[open]` attribute on `<details>` (do NOT add a static `aria-expanded`); `summary::-webkit-details-marker { display: none }` + `summary::marker { content: '' }` suppress the disclosure triangle; 44px min touch target preserved via `.nav-hamburger-button`; `:focus-visible` styling preserved. The earlier checkbox-hack draft was replaced because Codex caught two bugs (inline `display: flex` on `<nav>` overriding mobile collapse + a static `aria-expanded` that never updated).
- Verified PopupStrip prop name: `popup` (data prop, not the original `onAppointment` handler)
- Verified About has no post-sync edits required (no useState, no cross-skill imports, only `Mark.Heart` and CSS vars)
- The exact `pieces` prop shape that `GalleryGrid` expects (Plan 04 needs to match it in `src/sample-data.ts`)
- The form input `name=` attributes from AppointmentForm (`name`, `email`, `notes`) — Phase 4 needs these names
- Confirmation that no `outline: 'none'` survives anywhere in `src/components/design-skill/` (FND-13)
</output>
