---
plan_id: 01-04
phase: 1
phase_slug: 01-foundations-brand-system
plan: 04
type: execute
wave: 2
depends_on: ["01-01", "01-02", "01-03"]
autonomous: true
requirements: [FND-05, FND-12, FND-13, FND-06, FND-07]
files_modified:
  - src/layouts/BaseLayout.astro
  - src/pages/index.astro
  - src/pages/gallery.astro
  - src/pages/popups.astro
  - src/pages/about.astro
  - src/pages/say-hi.astro
  - src/sample-data.ts
tags: [astro-layout, fonts-api, accessibility, sample-data, page-routes]
must_haves:
  truths:
    - "All 5 routes (/, /gallery, /popups, /about, /say-hi) exist as Astro pages with lowercase filenames (FND-11, D-11)"
    - "Every page wraps in BaseLayout.astro and shows the design-skill Header + Footer chrome"
    - "BaseLayout emits 5 favicon <link> tags pointing at the files Plan 03 produced"
    - "BaseLayout uses <Font cssVariable=\"--font-*-loaded\" preload /> from astro:assets for the three Fonts API entries (matches Plan 01 cssVariables)"
    - "BaseLayout <style is:global> declares a global :focus-visible rule (2px outline using --color-focus-ring or var(--indigo-500) fallback, NOT coral on cream) so every interactive element has visible focus per FND-13"
    - "Skip-to-content link is the first focusable <body> element, targets #main-content (FND-13)"
    - "<meta name=\"color-scheme\" content=\"light\"> is in <head> (FND-13)"
    - "body background is cream (--color-bg, never white) because colors_and_type.css is imported once via <style is:global>"
    - "src/sample-data.ts exports sampleGallery (3 pieces named \"Sample Piece A/B/C\", price 0) and sampleNextPopup (D-02, D-03)"
    - "pnpm exec astro check exits 0 and pnpm exec astro build produces a dist/ with one HTML file per route AND emits the @astrojs/cloudflare Worker entrypoint (dist/_worker.js/index.js)"
    - "No large React JS bundles shipped to dist (find dist -name '*.js' -size +5k filtered to non-Astro chunks must be empty — confirms 'no `client:` directive' contract)"
    - "D-01: All 5 pages render with the design-skill's actual React components (Hero, GalleryGrid, PopupStrip, About body, AppointmentForm) wired to fake/sample data — demo-loaded from day 1"
    - "D-18: All five routes exist after Phase 1 (/, /gallery, /popups, /about, /say-hi); filenames lowercase; each uses BaseLayout.astro"
  artifacts:
    - path: "src/layouts/BaseLayout.astro"
      provides: "shared <head>, header/footer slots, skip-link, font preload, global :focus-visible"
      contains: "<Font cssVariable"
      min_lines: 50
    - path: "src/pages/index.astro"
      provides: "/ — landing shell with Hero + PopupStrip + GalleryGrid"
      contains: "BaseLayout"
    - path: "src/pages/gallery.astro"
      provides: "/gallery — GalleryGrid with 3 sample pieces"
    - path: "src/pages/popups.astro"
      provides: "/popups — PopupStrip with 1 upcoming sample popup"
    - path: "src/pages/about.astro"
      provides: "/about — About component shell"
    - path: "src/pages/say-hi.astro"
      provides: "/say-hi — AppointmentForm shell"
    - path: "src/sample-data.ts"
      provides: "placeholder sampleGallery + sampleNextPopup; Phase 2 deletes"
      contains: "Sample Piece"
  key_links:
    - from: "src/layouts/BaseLayout.astro"
      to: "src/styles/colors_and_type.css"
      via: "<style is:global>@import '../styles/colors_and_type.css';</style>"
      pattern: "@import.*colors_and_type"
    - from: "src/layouts/BaseLayout.astro"
      to: "public/favicon.ico, favicon.svg, favicon-16.png, favicon-32.png, apple-touch-icon.png"
      via: "<link rel='icon|apple-touch-icon' href='/...'>"
      pattern: "rel=\"icon\"|rel=\"apple-touch-icon\""
    - from: "src/pages/*.astro"
      to: "src/components/design-skill/*.jsx"
      via: "import Component from '../components/design-skill/Component'"
      pattern: "from '\\.\\./components/design-skill/"
    - from: "src/pages/index.astro and gallery.astro and popups.astro"
      to: "src/sample-data.ts"
      via: "import { sampleGallery, sampleNextPopup } from '../sample-data'"
      pattern: "from '\\.\\./sample-data'"
---

<objective>
Build the shared `BaseLayout.astro` (head, header/footer slots, skip-link, Fonts API wiring, global `:focus-visible` rule) and the five page placeholders (`index.astro`, `gallery.astro`, `popups.astro`, `about.astro`, `say-hi.astro`) plus the single `src/sample-data.ts` placeholder content module. Every page composes design-skill components from Plan 02, references favicons from Plan 03, and uses Fonts API variables declared in Plan 01.

Purpose: This plan is the visible deliverable of Phase 1 — the founder clicks a preview URL after this plan ships and sees the cream-background, hand-font, design-skill-styled empty shell of all 5 pages (ROADMAP Phase 1 SC1). Without this plan, Wave 1 produces config and components but nothing renders.

Output: `dist/index.html`, `dist/gallery/index.html`, `dist/popups/index.html`, `dist/about/index.html`, `dist/say-hi/index.html` (or their flat equivalents) after `pnpm exec astro build`, AND `dist/_worker.js/index.js` (the Cloudflare adapter Worker entrypoint).
</objective>

> **EXECUTOR NOTE (frontmatter-parser workaround):** Each embedded `.astro` code sample in this plan has its `---` frontmatter delimiter shown with a leading space (` ---`). This is a markdown-parser workaround only — when writing the actual `.astro` file, REMOVE the leading space so the `---` is at column 0 (Astro requires bare `---` to delimit its component frontmatter).

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundations-brand-system/01-CONTEXT.md
@.planning/phases/01-foundations-brand-system/01-RESEARCH.md
@.planning/phases/01-foundations-brand-system/01-PATTERNS.md
@.planning/phases/01-foundations-brand-system/01-UI-SPEC.md
@.planning/phases/01-foundations-brand-system/01-01-SUMMARY.md
@.planning/phases/01-foundations-brand-system/01-02-SUMMARY.md
@.planning/phases/01-foundations-brand-system/01-03-SUMMARY.md
@astro.config.mjs
@wrangler.jsonc
@src/styles/colors_and_type.css
@src/components/design-skill/Header.jsx
@src/components/design-skill/Hero.jsx
@src/components/design-skill/Footer.jsx
@src/components/design-skill/GalleryGrid.jsx
@src/components/design-skill/PopupStrip.jsx
@src/components/design-skill/About.jsx
@src/components/design-skill/AppointmentForm.jsx

<interfaces>
<!-- From Plan 01 (astro.config.mjs Fonts API): three cssVariables to consume in BaseLayout: -->
<!-- --font-wordmark-loaded, --font-display-loaded, --font-body-loaded -->

<!-- From Plan 02 (component default exports, post-revision shapes — see 01-02-SUMMARY.md): -->
<!-- import Header from '../components/design-skill/Header' — accepts: active?: '/' | '/gallery' | '/popups' | '/about' | '/say-hi' (union includes /about per Plan 02 Task 3 Edit 1) -->
<!-- import Hero from '../components/design-skill/Hero' — accepts: no required props -->
<!-- import GalleryGrid from '../components/design-skill/GalleryGrid' — accepts: pieces: GalleryPiece[] -->
<!-- import PopupStrip from '../components/design-skill/PopupStrip' — accepts: popup: Popup (Plan 02 Task 3 Edit 5 refactored from the original `onAppointment` handler to a `popup` data prop) -->
<!-- import About from '../components/design-skill/About' — accepts: no props in Phase 1 placeholder (verified by Plan 02 Task 3 Edit 5 — no useState, no cross-skill imports) -->
<!-- import AppointmentForm from '../components/design-skill/AppointmentForm' — accepts: no props (static shell; NO `outline: 'none'` per FND-13) -->
<!-- import Footer from '../components/design-skill/Footer' — accepts: no required props -->

<!-- From Plan 03 (public/ files): -->
<!-- /favicon.ico, /favicon.svg, /favicon-16.png, /favicon-32.png, /apple-touch-icon.png -->
<!-- /mark.svg (referenced by Header.jsx) -->
<!-- /sample/piece-a.webp, /sample/piece-b.webp, /sample/piece-c.webp -->

<!-- From src/styles/colors_and_type.css (synced from design skill in Plan 02 Task 2):
     `--color-focus-ring: var(--coral-500)` is defined at ~line 100. The global :focus-visible
     rule in BaseLayout uses this token. The fallback is var(--indigo-500) (a brand-acceptable
     blue, NOT coral on cream — coral fails contrast on cream for thin outlines, but coral via
     2px outline at 2px offset is acceptable per the design-skill default; the global rule
     uses indigo-500 as a safer body-text-color outline). If a future audit prefers a different
     focus color, change the token in colors_and_type.css — the rule below picks it up. -->

<!-- Sample-data shape (D-02, D-03 — all names start with "Sample", all prices are 0): -->
type GalleryPiece = {
  slug: string;
  name: string;            // "Sample Piece A", "Sample Piece B", "Sample Piece C"
  price: number;           // 0 (D-03 marker)
  status: 'available' | 'sold' | 'one-of-one' | 'reserved';
  photo: string;           // "/sample/piece-a.webp" etc.
};

type Popup = {
  name: string;            // starts with "Sample"
  date: string;            // ISO date "2026-06-15"
  startTime: string;       // "10:00"
  endTime: string;         // "14:00"
  tz: 'America/Los_Angeles';
  location: string;
};
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write src/sample-data.ts</name>
  <files>src/sample-data.ts</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-RESEARCH.md (§"Sample data file" lines 1285-1303 — verified shape, copy verbatim)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-PATTERNS.md (lines 642-672 — D-02/D-03 constraints)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-UI-SPEC.md (§"Demo-Loaded Page Shells" lines 323-338 — sample marker requirement; §"Copywriting Contract" lines 362-363 — `Sample Piece A`, price `$0`)
    - /Users/lucacanonica/Documents/projects/bluemli/src/components/design-skill/GalleryGrid.jsx (just-edited by Plan 02 — confirm the `pieces` prop shape matches what we export)
  </read_first>
  <action>
**Write `src/sample-data.ts`** at the path `src/sample-data.ts` with this exact content (per RESEARCH.md lines 1285-1303 verbatim):

```ts
// src/sample-data.ts — Phase 1 placeholder content (D-02, D-03)
//
// IMPORTANT: Phase 2 deletes this file when real Content Collections come online.
// All names start with "Sample" and all prices are 0 so the sample-data leak CI rule (Rule 7,
// commented out in Phase 1 and uncommented in Phase 2) fires if any of this survives into
// src/content/.

export type GalleryPiece = {
  slug: string;
  name: string;
  price: number;
  status: 'available' | 'sold' | 'one-of-one' | 'reserved';
  photo: string;
};

export type Popup = {
  name: string;
  date: string;          // ISO date
  startTime: string;     // "HH:MM"
  endTime: string;       // "HH:MM"
  tz: 'America/Los_Angeles';
  location: string;
};

export const sampleGallery: GalleryPiece[] = [
  { slug: 'sample-piece-a', name: 'Sample Piece A', price: 0, status: 'available',  photo: '/sample/piece-a.webp' },
  { slug: 'sample-piece-b', name: 'Sample Piece B', price: 0, status: 'sold',       photo: '/sample/piece-b.webp' },
  { slug: 'sample-piece-c', name: 'Sample Piece C', price: 0, status: 'one-of-one', photo: '/sample/piece-c.webp' },
];

export const sampleNextPopup: Popup = {
  name: 'Sample Pop-up — NoPa Block Party',
  date: '2026-06-15',
  startTime: '10:00',
  endTime: '14:00',
  tz: 'America/Los_Angeles',
  location: 'NoPa Block Party',
};
```

Critical constraints:
- Every name MUST start with "Sample" (D-03 marker — CI Rule 7 in Phase 2 will fire on `"Sample Piece"` strings if they leak)
- Every price MUST be `0` (D-03 marker)
- Photo paths reference the WebPs Plan 03 created at `public/sample/piece-{a,b,c}.webp`
- The `status` enum matches what GalleryGrid.jsx (Plan 02 Task 3) consumes
- TypeScript types (`GalleryPiece`, `Popup`) are exported so pages can type-narrow if needed
- NO `flower|petal|floral|bloom|blossom` vocabulary anywhere (CI Rule 2 will fail)
- Description fields are absent — the Phase 1 GalleryGrid shell doesn't need them; Phase 2's real schema will add them
  </action>
  <verify>
    <automated>test -f src/sample-data.ts && grep -q "Sample Piece A" src/sample-data.ts && grep -q "Sample Piece B" src/sample-data.ts && grep -q "Sample Piece C" src/sample-data.ts && grep -c "price: 0" src/sample-data.ts | grep -E "^[3-9]$|^[1-9][0-9]+$" && grep -q "/sample/piece-a.webp" src/sample-data.ts && grep -q "/sample/piece-b.webp" src/sample-data.ts && grep -q "/sample/piece-c.webp" src/sample-data.ts && grep -q "America/Los_Angeles" src/sample-data.ts && grep -q "export const sampleGallery" src/sample-data.ts && grep -q "export const sampleNextPopup" src/sample-data.ts && grep -q "export type GalleryPiece" src/sample-data.ts && ! grep -iEn '\b(flower|petal|floral|bloom|blossom)\b' src/sample-data.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `src/sample-data.ts` exists
    - Contains exactly the strings `Sample Piece A`, `Sample Piece B`, `Sample Piece C`
    - Every gallery price is `0`: `grep -c "price: 0" src/sample-data.ts` returns ≥ 3
    - Photo paths reference all three WebPs from Plan 03: `/sample/piece-a.webp`, `/sample/piece-b.webp`, `/sample/piece-c.webp`
    - Contains `tz: 'America/Los_Angeles'` (or equivalent — confirms timezone-aware popup; Phase 3 popup logic will rely on this)
    - Exports `sampleGallery` and `sampleNextPopup` constants
    - Exports `GalleryPiece` and `Popup` type aliases
    - No flower vocabulary: `grep -iE '\b(flower|petal|floral|bloom|blossom)\b' src/sample-data.ts` exits 1
    - All four status enum values are referenced or available: at minimum `available`, `sold`, `one-of-one` appear in the seeded array; `reserved` is in the type union (verifiable by reading the type definition)
  </acceptance_criteria>
  <done>Sample data module exports the placeholder content with obvious D-03 markers. Pages can import it and feed components without breaking React props typing.</done>
</task>

<task type="auto">
  <name>Task 2: Write src/layouts/BaseLayout.astro (with global :focus-visible rule)</name>
  <files>src/layouts/BaseLayout.astro</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-RESEARCH.md (§"`<Font />` usage in BaseLayout" lines 956-1014 — verified shape, copy structure verbatim)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-PATTERNS.md (lines 177-254 — BaseLayout pattern + critical constraints)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-UI-SPEC.md (§"BaseLayout Shell" lines 176-238 — head pattern, skip-link copy "Skip to main content", page container max-width: 1200px, padding var(--space-6) mobile / var(--space-9) desktop; §"Accessibility Floor" lines 304-318 — FND-13 :focus-visible on EVERY interactive element)
    - /Users/lucacanonica/Documents/projects/bluemli/astro.config.mjs (just written in Plan 01 — confirm the three cssVariables are `--font-wordmark-loaded`, `--font-display-loaded`, `--font-body-loaded`)
    - /Users/lucacanonica/Documents/projects/bluemli/src/styles/colors_and_type.css (must exist from Plan 02 sync — confirm `--color-focus-ring` token exists; if not, add it as `--color-focus-ring: var(--indigo-500);` before this task)
  </read_first>
  <action>
**Write `src/layouts/BaseLayout.astro`** at the path `src/layouts/BaseLayout.astro`. Use this exact content (based on RESEARCH.md lines 956-1014 with UI-SPEC §"BaseLayout Shell" deltas, PLUS the global `:focus-visible` rule per checker BLOCKER #4):

```astro
 ---
// src/layouts/BaseLayout.astro
// Shared <head>, header/footer slots, skip-to-content link, Fonts API preload,
// global :focus-visible rule (FND-13). FND-05, FND-06, FND-07, FND-13.
import { Font } from 'astro:assets';

interface Props {
  title: string;
}
const { title } = Astro.props;
 ---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>{title}</title>

    {/* Favicon set (FND-08) — files generated/copied by scripts/generate-favicons.mjs (Plan 03) */}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" href="/favicon-16.png" sizes="16x16" />
    <link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    {/* Astro Fonts API — generates @font-face + <link rel="preload"> for each font.
        cssVariable suffix `-loaded` matches astro.config.mjs declarations (Plan 01).
        The design-skill CSS keeps --font-wordmark/--font-display/--font-body as cascade strings
        so loaded fonts compose with system-ui fallbacks. */}
    <Font cssVariable="--font-wordmark-loaded" preload />
    <Font cssVariable="--font-display-loaded" preload />
    <Font cssVariable="--font-body-loaded" preload />

    {/* Global brand tokens — the ONLY place colors_and_type.css is imported.
        Also defines the global :focus-visible rule (FND-13) — applies to EVERY
        interactive element by default. Per-component overrides may exist, but
        none may suppress with `outline: none` (Plan 02 Task 3 Edit 4 strips it). */}
    <style is:global>
      @import '../styles/colors_and_type.css';

      /* FND-13: every interactive element MUST show a visible focus ring on keyboard
         focus. We use a 2px outline (NOT 1px — CI Rule 5) at 2px offset.
         --color-focus-ring is defined in colors_and_type.css (currently maps to
         --coral-500); fallback is --indigo-500 (body text color, brand-safe on
         cream, never coral-on-cream which fails contrast for thin lines).
         This rule applies to <a>, <button>, <input>, <textarea>, <select>,
         <summary>, [tabindex], <label> (when role="button"), and any element with
         :focus-visible. */
      :focus-visible {
        outline: 2px solid var(--color-focus-ring, var(--indigo-500));
        outline-offset: 2px;
        border-radius: 2px;
      }
    </style>
  </head>
  <body>
    {/* FND-13: skip-to-content is the first focusable element in <body>. */}
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <slot name="header" />

    <main id="main-content">
      <slot />
    </main>

    <slot name="footer" />

    <style>
      .skip-link {
        position: absolute;
        top: -100px;
        left: 0;
        background: var(--coral-500);
        color: var(--cream-50);
        padding: var(--space-2) var(--space-4);
        z-index: 100;
        text-decoration: none;
        font-family: var(--font-body);
      }
      /* The skip-link gets its own (more prominent) focus treatment because it
         IS the focus target on Tab from URL bar. The global :focus-visible
         rule above also applies — outline + outline-offset compose with this. */
      .skip-link:focus-visible {
        top: 0;
      }
      #main-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--space-6);
      }
      @media (min-width: 768px) {
        #main-content {
          padding: 0 var(--space-9);
        }
      }
    </style>
  </body>
</html>
```

Critical constraints (PATTERNS.md lines 249-254):
- `<Font />` imports from `astro:assets` (NOT `astro/components` — Pitfall #8)
- The `<style is:global>@import '../styles/colors_and_type.css';</style>` block is the ONLY place the brand CSS is imported. Pages MUST NOT re-import it. Any other component-level `@import` would cause double-load.
- **NEW (checker BLOCKER #4):** The global `<style is:global>` block contains the `:focus-visible` rule using `var(--color-focus-ring, var(--indigo-500))` as the outline color. This is the SINGLE point where FND-13 is enforced site-wide. Every interactive element inherits this focus treatment by default. The `--color-focus-ring` token is defined in `src/styles/colors_and_type.css` (synced from design skill at ~line 100). If it is somehow missing after sync, ADD it before this task: `--color-focus-ring: var(--indigo-500);` (NOT coral on cream — coral fails thin-line contrast).
- `slot name="header"` and `slot name="footer"` — pages pass `<Header slot="header" />` / `<Footer slot="footer" />` (per RESEARCH.md sample page pattern, line 1274)
- The skip-link is BEFORE `<slot name="header" />` so it's the first focusable element
- `<main id="main-content">` is the skip-link target
- Mobile padding `var(--space-6)` (32px); desktop `var(--space-9)` (96px) via media query at 768px (UI-SPEC §"Breakpoints" line 247: desktop = 768px+)
- No `border: 1px` anywhere (CI Rule 5)
- **No `outline: none` anywhere** — `:focus-visible` always has visible outline (FND-13). The acceptance criterion below grep-fails the build if `outline:\\s*['\"]?none` appears.
- `<meta name="color-scheme" content="light">` is present (FND-13)
- `<html lang="en">` (English-only per REQUIREMENTS Out of Scope)
- `title` prop is passed through; pages set `<BaseLayout title="...">`. UI-SPEC Copywriting Contract: titles follow `{Page Name} — Studio Bluemli` (e.g. `Gallery — Studio Bluemli`); home uses the full `Studio Bluemli — handmade beaded earrings, NoPa San Francisco`.
  </action>
  <verify>
    <automated>test -f src/layouts/BaseLayout.astro && grep -q "from 'astro:assets'" src/layouts/BaseLayout.astro && grep -q "Font cssVariable=\"--font-wordmark-loaded\"" src/layouts/BaseLayout.astro && grep -q "Font cssVariable=\"--font-display-loaded\"" src/layouts/BaseLayout.astro && grep -q "Font cssVariable=\"--font-body-loaded\"" src/layouts/BaseLayout.astro && grep -q "rel=\"icon\".*\"/favicon.ico\"" src/layouts/BaseLayout.astro && grep -q "rel=\"icon\".*\"/favicon-16.png\"" src/layouts/BaseLayout.astro && grep -q "rel=\"icon\".*\"/favicon-32.png\"" src/layouts/BaseLayout.astro && grep -q "rel=\"icon\".*type=\"image/svg+xml\"" src/layouts/BaseLayout.astro && grep -q "rel=\"apple-touch-icon\"" src/layouts/BaseLayout.astro && grep -q "color-scheme.*light" src/layouts/BaseLayout.astro && grep -q "Skip to main content" src/layouts/BaseLayout.astro && grep -q "#main-content" src/layouts/BaseLayout.astro && grep -q "is:global" src/layouts/BaseLayout.astro && grep -q "colors_and_type.css" src/layouts/BaseLayout.astro && grep -q ":focus-visible" src/layouts/BaseLayout.astro && grep -q "color-focus-ring" src/layouts/BaseLayout.astro && grep -q "slot name=\"header\"" src/layouts/BaseLayout.astro && grep -q "slot name=\"footer\"" src/layouts/BaseLayout.astro && grep -q "max-width: 1200px" src/layouts/BaseLayout.astro && grep -q "html lang=\"en\"" src/layouts/BaseLayout.astro && ! grep -qE "border:\s*1px" src/layouts/BaseLayout.astro && ! grep -qE "outline:\s*['\"]?none" src/layouts/BaseLayout.astro</automated>
  </verify>
  <acceptance_criteria>
    - File `src/layouts/BaseLayout.astro` exists
    - Imports `Font` from `astro:assets` (NOT `astro/components` — Pitfall #8): `grep -q "from 'astro:assets'" src/layouts/BaseLayout.astro` exits 0
    - All three Fonts API cssVariables emitted with `preload`: `--font-wordmark-loaded`, `--font-display-loaded`, `--font-body-loaded`
    - All 5 favicon `<link>` tags present (FND-08): `/favicon.svg`, `/favicon.ico`, `/favicon-16.png`, `/favicon-32.png`, `/apple-touch-icon.png`
    - `<meta name="color-scheme" content="light">` present (FND-13)
    - Skip-to-content link with copy `Skip to main content` present (FND-13)
    - `<main id="main-content">` present (skip-link target)
    - Global CSS import via `<style is:global>@import '../styles/colors_and_type.css';</style>` (FND-06)
    - **NEW (checker BLOCKER #4):** Global `:focus-visible` rule present inside the `<style is:global>` block: `grep -q ":focus-visible" src/layouts/BaseLayout.astro` exits 0
    - **NEW (checker BLOCKER #4):** The `:focus-visible` rule references `--color-focus-ring` (defined in colors_and_type.css with var(--indigo-500) fallback): `grep -q "color-focus-ring" src/layouts/BaseLayout.astro` exits 0
    - **NEW (checker BLOCKER #4):** No `outline: none` (or its quoted-string CSS-in-JS variants) anywhere in the file: `! grep -qE "outline:\\s*['\"]?none" src/layouts/BaseLayout.astro` exits 0
    - Named slots `header` and `footer` present so pages can pass `<Header slot="header">` and `<Footer slot="footer">`
    - `max-width: 1200px` on the main container (UI-SPEC §"Page container")
    - `<html lang="en">` declared
    - No 1px borders: `! grep -qE "border:\s*1px" src/layouts/BaseLayout.astro` exits 0
    - No `backdrop-filter` (CI Rule 4): `! grep -qE "backdrop-filter|backdropFilter" src/layouts/BaseLayout.astro` exits 0
    - No `bg-white|background:\s*white|#fff(?!8)` in this file (CI Rule 1): `! grep -qE "bg-white|background:\s*white|#fff[^8]" src/layouts/BaseLayout.astro` exits 0
  </acceptance_criteria>
  <done>BaseLayout.astro is the canonical shell. Pages wrap in it, slot `<Header>` and `<Footer>`, and inherit cream background + favicon set + Fonts API preload + skip-link + main landmark + a SITE-WIDE :focus-visible rule (FND-13).</done>
</task>

<task type="auto">
  <name>Task 3: Write the 5 Astro page placeholders + build verification (no warning-masking, no JS bundles, Worker entrypoint verified)</name>
  <files>src/pages/index.astro, src/pages/gallery.astro, src/pages/popups.astro, src/pages/about.astro, src/pages/say-hi.astro</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/src/layouts/BaseLayout.astro (just written in Task 2 — confirm the Props interface and slot names)
    - /Users/lucacanonica/Documents/projects/bluemli/src/sample-data.ts (just written in Task 1 — confirm the exports)
    - /Users/lucacanonica/Documents/projects/bluemli/src/components/design-skill/Header.jsx (confirm the `active` prop type union includes `/about` per Plan 02 Task 3 Edit 1)
    - /Users/lucacanonica/Documents/projects/bluemli/src/components/design-skill/GalleryGrid.jsx (confirm the `pieces` prop type)
    - /Users/lucacanonica/Documents/projects/bluemli/src/components/design-skill/PopupStrip.jsx (confirm the popup prop name is `popup` — refactored by Plan 02 Task 3 Edit 5 from the original `onAppointment` handler)
    - /Users/lucacanonica/Documents/projects/bluemli/src/components/design-skill/About.jsx (verified by Plan 02 Task 3 Edit 5 — no useState, no props required)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-RESEARCH.md (§"Sample page composing the design-skill components" lines 1263-1280)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-UI-SPEC.md (§"Demo-Loaded Page Shells" lines 326-338 — which component appears on which page; §"Copywriting Contract" lines 343-368 — page title patterns)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-CONTEXT.md (D-18: All five routes must exist; filenames lowercase; D-01: each page renders the design-skill component)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-01-SUMMARY.md (confirm which `output:` mode Plan 01 chose — if Plan 01 deferred entrypoint verification, this task confirms `dist/_worker.js/index.js` exists after the full build)
  </read_first>
  <action>
**All five filenames MUST be lowercase** (FND-11, D-18, CI Rule 6). Write each file with the contents below.

**File 1 — `src/pages/index.astro`** (route `/`):

```astro
 ---
// src/pages/index.astro — Landing page shell (D-18, FND-05).
// Phase 1 demo-loaded: Hero + PopupStrip + GalleryGrid (3 cards).
// Phase 2 swaps sample-data for real Content Collections.
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/design-skill/Header';
import Hero from '../components/design-skill/Hero';
import PopupStrip from '../components/design-skill/PopupStrip';
import GalleryGrid from '../components/design-skill/GalleryGrid';
import Footer from '../components/design-skill/Footer';
import { sampleGallery, sampleNextPopup } from '../sample-data';
 ---
<BaseLayout title="Studio Bluemli — handmade beaded earrings, NoPa San Francisco">
  <Header slot="header" active="/" />
  <Hero />
  <PopupStrip popup={sampleNextPopup} />
  <GalleryGrid pieces={sampleGallery.slice(0, 3)} />
  <Footer slot="footer" />
</BaseLayout>
```

**File 2 — `src/pages/gallery.astro`** (route `/gallery`):

```astro
 ---
// src/pages/gallery.astro — Gallery shell (D-18).
// Phase 1: GalleryGrid renders 3 sample pieces from sample-data.
// Phase 2: GalleryGrid renders the real `gallery` content collection.
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/design-skill/Header';
import GalleryGrid from '../components/design-skill/GalleryGrid';
import Footer from '../components/design-skill/Footer';
import { sampleGallery } from '../sample-data';
 ---
<BaseLayout title="Gallery — Studio Bluemli">
  <Header slot="header" active="/gallery" />
  <GalleryGrid pieces={sampleGallery} />
  <Footer slot="footer" />
</BaseLayout>
```

**File 3 — `src/pages/popups.astro`** (route `/popups`):

```astro
 ---
// src/pages/popups.astro — Pop-ups shell (D-18).
// Phase 1: PopupStrip renders one upcoming sample.
// Phase 3: timezone-correct past/upcoming split from popups collection.
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/design-skill/Header';
import PopupStrip from '../components/design-skill/PopupStrip';
import Footer from '../components/design-skill/Footer';
import { sampleNextPopup } from '../sample-data';
 ---
<BaseLayout title="Pop-ups — Studio Bluemli">
  <Header slot="header" active="/popups" />
  <PopupStrip popup={sampleNextPopup} />
  <Footer slot="footer" />
</BaseLayout>
```

**File 4 — `src/pages/about.astro`** (route `/about`):

```astro
 ---
// src/pages/about.astro — About shell (D-18).
// Phase 1: design-skill About component renders with placeholder copy.
// Phase 3: About renders the real first-person founder portrait + process shots.
// Note: HeaderProps.active union INCLUDES '/about' (Plan 02 Task 3 Edit 1 — checker BLOCKER #2 fix).
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/design-skill/Header';
import About from '../components/design-skill/About';
import Footer from '../components/design-skill/Footer';
 ---
<BaseLayout title="About — Studio Bluemli">
  <Header slot="header" active="/about" />
  <About />
  <Footer slot="footer" />
</BaseLayout>
```

**File 5 — `src/pages/say-hi.astro`** (route `/say-hi`):

```astro
 ---
// src/pages/say-hi.astro — Say Hi shell (D-18).
// Phase 1: AppointmentForm is a static shell — <form action="/api/contact"> 404s in Phase 1.
// Phase 4: /api/contact Worker handler accepts the POST (Turnstile + Resend).
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/design-skill/Header';
import AppointmentForm from '../components/design-skill/AppointmentForm';
import Footer from '../components/design-skill/Footer';
 ---
<BaseLayout title="Say Hi — Studio Bluemli">
  <Header slot="header" active="/say-hi" />
  <AppointmentForm />
  <Footer slot="footer" />
</BaseLayout>
```

Critical constraints (uniform across all 5):
- All filenames lowercase (FND-11, CI Rule 6)
- Page `<title>` follows `{Page Name} — Studio Bluemli` (UI-SPEC Copywriting Contract). Home is the exception — uses the full marketing title.
- NO `client:` directives anywhere — every React component server-renders to HTML
- `Header slot="header"` + `Footer slot="footer"` — match BaseLayout's named slots
- `active` prop matches the route path (Plan 02 Task 3 Header expects route paths, not nav labels). About passes `active="/about"` — the HeaderProps.active union now includes `/about` per Plan 02 revision.
- No CSS gradients, no `#fff`, no flower vocabulary, no 1px borders (CI rules)

**Step — Verify the build (NEW formulation per checker WARNING #9 — no `tail -5` masking).**

Run typecheck first:
```bash
pnpm exec astro check
```
Must exit 0 (typecheck passes — Astro will warn if a prop type mismatches what the component expects, including the Header `active="/about"` case which Plan 02 Task 3 Edit 1 already fixed).

Then run the build with full log capture and explicit warning/error scanning:

```bash
pnpm exec astro build 2>&1 | tee /tmp/astro-build.log
BUILD_RC=${PIPESTATUS[0]}
echo "Build return code: $BUILD_RC"
test "$BUILD_RC" -eq 0   # Build must succeed
```

Then scan the log for non-benign warnings/errors (deprecation warnings about Browserslist and similar third-party noise are tolerated; everything else is a failure):

```bash
# Exit non-zero if any unmasked "warn"/"error" lines appear, ignoring known-benign noise.
! grep -iE "(^|\s)(warn|error)" /tmp/astro-build.log | grep -vE "Browserslist|deprecation|^\s*$"
```

Then verify HTML output exists for all 5 routes:

```bash
find dist -name "*.html" | sort
# Expected: at least 5 HTML files corresponding to /, /gallery, /popups, /about, /say-hi.
test "$(find dist -name '*.html' | wc -l)" -ge 5
```

**Step — Verify the Cloudflare Worker entrypoint exists (NEW — checker WARNING #7 follow-through from Plan 01).** Plan 01 Task 2 may have deferred the entrypoint check (the build there had no pages). With pages now present, the build must emit the Worker entrypoint:

```bash
# The @astrojs/cloudflare adapter emits the worker at dist/_worker.js/index.js
# (or dist/_worker.js as a single file depending on bundling).
if [ -f dist/_worker.js/index.js ] || [ -f dist/_worker.js ]; then
  echo "PASS: Cloudflare Worker entrypoint emitted."
else
  echo "FAIL: dist/_worker.js[/index.js] missing — wrangler.jsonc's main + run_worker_first will not resolve."
  echo "ACTION REQUIRED: Edit astro.config.mjs and change `output: 'static'` to `output: 'server'`, then rerun build."
  echo "Astro will still prerender every page; output: 'server' just guarantees the adapter emits the Worker entrypoint."
  ls -la dist/_worker.js* 2>&1 || true
  exit 1
fi
```

**Step — Verify NO React JS bundles ship to dist/ (NEW — checker WARNING #6).** The "no `client:` directive" contract means no React runtime should be served to browsers. Any JS file > 5KB in `dist/` is a strong signal that React snuck in via a `client:` directive or a misconfigured hydration:

```bash
# Find JS files > 5KB. Exclude the _worker.js entrypoint (which is the SSR
# adapter, not browser JS) and Astro's own micro-runtime chunks (which are
# typically < 5KB anyway).
LARGE_BROWSER_JS=$(find dist -name "*.js" -size +5k 2>/dev/null \
  | grep -v "_worker.js" \
  | head -10)
if [ -n "$LARGE_BROWSER_JS" ]; then
  echo "FAIL: Found large JS bundles in dist/ — React (or other framework JS) may have shipped:"
  echo "$LARGE_BROWSER_JS"
  echo "Check for accidental `client:load` / `client:idle` / `client:visible` / `client:media` / `client:only` directives in src/pages/ or src/components/."
  exit 1
else
  echo "PASS: No large browser JS bundles in dist/. Zero-JS contract honored."
fi

# Belt-and-suspenders: literal grep for 'react' inside any dist JS bundle.
# (Astro may inline tiny react references in chunk names; we care about actual bundled React runtime.)
if grep -rli "react.development\|react-dom.development\|react.production\|react-dom.production" dist/ --include="*.js" 2>/dev/null \
   | grep -v "_worker.js" \
   | head -5; then
  echo "FAIL: React runtime detected in browser-served dist/ JS bundles."
  exit 1
fi
echo "PASS: No React runtime in browser-served dist/ bundles."

# Also: NO `client:` directives anywhere in src/pages/ or src/components/design-skill/
! grep -rE 'client:(load|idle|visible|media|only)' src/pages/ src/components/design-skill/
```

**Step — Confirm CI grep rules would pass.** Run (manually for now; Plan 05 wires this into CI):
```bash
# Brand rules on the new files
grep -rEnP '(bg-white|background:\s*white|#fff(?![0-9a-fA-F])|#[fF]{6})' --include='*.{astro,jsx,tsx,ts,css}' src/ || echo "PASS: no white"
grep -rEni '\b(flower|petal|floral|bloom|blossom)\b' --include='*.{astro,jsx,tsx,ts,css}' src/ || echo "PASS: no flowers"
grep -rEn 'gradient' --include='*.{astro,jsx,tsx,css}' src/ || echo "PASS: no gradients"
grep -rEn '(backdrop-filter|backdropFilter|WebkitBackdropFilter)' --include='*.{astro,jsx,tsx,css}' src/ || echo "PASS: no backdrop"
grep -rEn 'border(-top|-bottom|-left|-right)?:\s*1px' --include='*.{astro,jsx,tsx,css}' src/ || echo "PASS: no 1px borders"
grep -rEn "outline:\\s*['\"]?none" --include='*.{astro,jsx,tsx,css}' src/ || echo "PASS: no outline:none (FND-13)"
find src/pages -type f | grep -E '[A-Z]' || echo "PASS: lowercase filenames"
```
Every PASS line must print.
  </action>
  <verify>
    <automated>test -f src/pages/index.astro && test -f src/pages/gallery.astro && test -f src/pages/popups.astro && test -f src/pages/about.astro && test -f src/pages/say-hi.astro && ! find src/pages -type f | grep -qE '[A-Z]' && grep -q "BaseLayout title=\"Studio Bluemli" src/pages/index.astro && grep -q "Hero" src/pages/index.astro && grep -q "PopupStrip" src/pages/index.astro && grep -q "GalleryGrid" src/pages/index.astro && grep -q "BaseLayout title=\"Gallery" src/pages/gallery.astro && grep -q "active=\"/gallery\"" src/pages/gallery.astro && grep -q "BaseLayout title=\"Pop-ups" src/pages/popups.astro && grep -q "active=\"/popups\"" src/pages/popups.astro && grep -q "BaseLayout title=\"About" src/pages/about.astro && grep -q "active=\"/about\"" src/pages/about.astro && grep -q "BaseLayout title=\"Say Hi" src/pages/say-hi.astro && grep -q "active=\"/say-hi\"" src/pages/say-hi.astro && grep -q "AppointmentForm" src/pages/say-hi.astro && ! grep -rqE 'client:(load|idle|visible|media|only)' src/pages/ && ! grep -rqEni '\b(flower|petal|floral|bloom|blossom)\b' --include='*.astro' src/pages/ && ! grep -rqEn 'gradient' --include='*.astro' src/pages/ && pnpm exec astro check && pnpm exec astro build 2>&1 | tee /tmp/astro-build.log && test ${PIPESTATUS[0]} -eq 0 && ! grep -iE "(^|\s)(warn|error)" /tmp/astro-build.log | grep -vE "Browserslist|deprecation|^\s*$" | head -1 | grep -q "." && test "$(find dist -name '*.html' | wc -l)" -ge 5 && { test -f dist/_worker.js/index.js || test -f dist/_worker.js; } && test -z "$(find dist -name '*.js' -size +5k 2>/dev/null | grep -v '_worker.js')"</automated>
  </verify>
  <acceptance_criteria>
    - All 5 page files exist with lowercase names: `src/pages/index.astro`, `src/pages/gallery.astro`, `src/pages/popups.astro`, `src/pages/about.astro`, `src/pages/say-hi.astro`
    - `find src/pages -type f | grep -E '[A-Z]'` exits 1 (no uppercase letters in any page filename — FND-11 / CI Rule 6)
    - `src/pages/index.astro` contains the full marketing title `Studio Bluemli — handmade beaded earrings, NoPa San Francisco`
    - `src/pages/index.astro` imports and renders `Hero`, `PopupStrip`, `GalleryGrid` (the demo-loaded composition per D-01)
    - `src/pages/gallery.astro` contains `BaseLayout title="Gallery — Studio Bluemli"` and `active="/gallery"`
    - `src/pages/popups.astro` contains `BaseLayout title="Pop-ups — Studio Bluemli"` and `active="/popups"` (with hyphen — UI-SPEC nav copy)
    - `src/pages/about.astro` contains `BaseLayout title="About — Studio Bluemli"` and `active="/about"` (typechecks because HeaderProps.active union now includes `/about` per Plan 02 Task 3 Edit 1 — checker BLOCKER #2 fix)
    - `src/pages/say-hi.astro` contains `BaseLayout title="Say Hi — Studio Bluemli"` and `active="/say-hi"` and renders `AppointmentForm`
    - NO `client:` directives anywhere in any page or design-skill component: `! grep -rE 'client:(load|idle|visible|media|only)' src/pages/ src/components/design-skill/` exits 0
    - No flower vocabulary in pages: `grep -rEni '\b(flower|petal|floral|bloom|blossom)\b' --include='*.astro' src/pages/` exits 1
    - **NEW (checker BLOCKER #4):** No `outline: none` anywhere in src: `grep -rEn "outline:\\s*['\"]?none" --include='*.{astro,jsx,tsx,css}' src/` exits 1
    - `pnpm exec astro check` exits 0
    - **NEW (checker WARNING #9):** `pnpm exec astro build` exits 0 AND the captured log contains NO unmasked `warn` or `error` lines outside the Browserslist/deprecation allowlist
    - **NEW (checker WARNING #9):** Verification command `! grep -iE "(^|\s)(warn|error)" /tmp/astro-build.log | grep -vE "Browserslist|deprecation"` exits 0
    - `dist/` directory exists after build and contains ≥ 5 HTML files (one per route): `find dist -name "*.html" | wc -l` returns ≥ 5
    - **NEW (checker WARNING #7):** Cloudflare Worker entrypoint exists at `dist/_worker.js/index.js` OR `dist/_worker.js`: `test -f dist/_worker.js/index.js || test -f dist/_worker.js` exits 0. If missing, Plan 01 `astro.config.mjs` `output:` mode must be switched from `'static'` to `'server'` and the build re-run.
    - **NEW (checker WARNING #6):** No browser-served JS bundle in `dist/` exceeds 5KB (excluding `_worker.js`): `find dist -name '*.js' -size +5k | grep -v '_worker.js' | wc -l` returns `0`. This confirms the "no `client:` directive → zero React in the browser" contract.
    - **NEW (checker WARNING #6):** No React production/development runtime in browser-served JS bundles: `grep -rli "react.development\|react.production" dist/ --include='*.js' | grep -v '_worker.js'` produces empty output.
    - All CI brand rules pass on the full `src/` tree (every grep noted in the action's final block prints PASS or returns no matches)
  </acceptance_criteria>
  <done>All 5 routes render. `pnpm exec astro build` produces a deployable `dist/` with the @astrojs/cloudflare Worker entrypoint AND zero browser-served React. No build warnings/errors slip through (no `tail -5` masking). Plan 05 can now wire CI + the Cloudflare git integration knowing the build pipeline is green AND the worker entrypoint is in place for `wrangler deploy`.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| build output (dist/) → Cloudflare edge | Astro emits dist/ at build time; Cloudflare Static Assets serves it via the ASSETS binding. dist/ contents become public web content. |
| SSR React → HTML | React 19 server-renders the design-skill JSX into HTML at build time. Component state is frozen at build (no client hydration). |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-04-01 | Information Disclosure | Sample-data leaks into production after Phase 2 ships real Content Collections | mitigate | Every sample name starts with "Sample" (D-03). CI Rule 7 (`"Sample Piece"` in `src/content/`) is commented in Phase 1's `check-brand-rules.sh` and uncommented in Phase 2 — designed to fire if `src/sample-data.ts` content survives into the real content directory. |
| T-04-02 | Tampering | Stored XSS via `Astro.props.title` if a page passes attacker-controlled data | accept | Phase 1 page titles are static literals (compiled into the build). Astro escapes interpolations by default. No user input crosses this boundary in Phase 1. |
| T-04-03 | Denial of Service | Mis-sized fonts (Caveat Brush ~150KB) ship every page → slow LCP on mobile | accept | Astro Fonts API uses `<link rel="preload">` for above-fold fonts; `font-display: swap` (Plan 01) prevents FOIT (Pitfall #10). Phase 5 LCH-05 runs Lighthouse to verify mobile ≥ 90 — that's the gate. Phase 1 trades font payload for visual brand correctness. |
| T-04-04 | Information Disclosure | `assets/logo/` files accidentally leak via direct fetch in dev — but only `public/` is web-served, not `assets/` | accept | Astro's dev server only serves `public/` and `src/pages/`. The `assets/logo/` directory is a build-time-only input; not in the asset root. Verified by RESEARCH.md "Project Structure" line 303. |
| T-04-05 | Elevation of Privilege | A future contributor adds `client:load` to one of these components and ships React (~40KB gz) + form submit logic to the browser unexpectedly | mitigate | Task 3 acceptance criterion (checker WARNING #6) FAILS the build if any browser-served JS file > 5KB exists in `dist/` excluding `_worker.js`. This catches accidental hydration before it reaches production. |
</threat_model>

<verification>
After all three tasks complete:
1. `pnpm exec astro check` exits 0
2. `pnpm exec astro build` exits 0 with NO non-benign warning/error lines in the log
3. `find dist -name "*.html"` returns at least 5 HTML files
4. `dist/_worker.js/index.js` (or `dist/_worker.js`) exists (Cloudflare Worker entrypoint emitted)
5. `find dist -name "*.js" -size +5k | grep -v '_worker.js'` returns empty (no React shipped to browser)
6. `grep -rE 'client:(load|idle|visible|media|only)' dist/` exits 1 (no client directives leaked)
7. Cat any built HTML file (e.g., `cat dist/index.html | head -50`) and confirm: presence of cream-300 hex `#F5DCC7` referenced via CSS variable somewhere in the bundled CSS, presence of the `mark.svg` reference, presence of `Studio Bluemli` text
8. All Phase 1 CI grep rules pass on `src/` (run each rule manually; Plan 05 will codify in CI), INCLUDING `! grep -rE "outline:\\s*['\"]?none" src/` (FND-13)
</verification>

<success_criteria>
- All 5 routes are buildable Astro pages with lowercase filenames
- BaseLayout emits favicon set + Fonts API preload + skip-link + cream background + `color-scheme: light` + a SITE-WIDE `:focus-visible` rule (FND-13)
- Every page uses Header + Footer + the one designated body component (Hero/GalleryGrid/PopupStrip/About/AppointmentForm)
- `src/sample-data.ts` exports placeholder content with D-03 markers
- `pnpm exec astro build` produces `dist/` ready for Cloudflare Workers Static Assets to serve, with the Worker entrypoint emitted AND zero browser-served React bundles
- Build verification is honest: no `tail -5` masking — full log is captured and scanned for warning/error lines
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundations-brand-system/01-04-SUMMARY.md` with:
- The 7 files written (BaseLayout + 5 pages + sample-data)
- Confirmation `pnpm exec astro build` produces `dist/` with the 5 HTML files
- **NEW (checker WARNING #7):** Confirmation `dist/_worker.js/index.js` (or `dist/_worker.js`) exists, AND the chosen `output:` mode (`'static'` or `'server'`). If a switch from `'static'` to `'server'` was required at this step, document the reason so Plan 01 SUMMARY can be retroactively annotated.
- **NEW (checker WARNING #6):** Confirmation that no browser-served JS bundle in `dist/` exceeds 5KB (excluding `_worker.js`). List the JS files emitted by the build, with their sizes.
- The exact route → file mapping (`/` → `index.astro`, etc.) so Plan 05 can list them in the founder-facing setup checklist for the click-through verification step
- Any prop-shape adjustments made vs the synced components in Plan 02 (e.g., if PopupStrip's prop required further tweaking, note here so Phase 3 knows)
- The exact `pnpm exec astro build` warnings (font subsetting messages, etc.) for reference — verbatim from `/tmp/astro-build.log`
</output>
