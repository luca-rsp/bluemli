---
phase: 1
plan: 02
plan_id: 01-02
subsystem: design-skill-bridge
tags: [design-skill, sync-script, react-ssr, brand-tokens, css-tokens, accessibility]
dependency-graph:
  requires: []
  provides:
    - "scripts/sync-design-skill.mjs (one-shot copy + transform engine, D-04..D-06)"
    - "src/components/design-skill/ (11 SSR-safe brand components — source of truth after first sync)"
    - "src/styles/colors_and_type.css (locked verbatim copy of skill tokens minus Google Fonts @import)"
    - "src/styles/components.css (component-specific hover/active rules)"
  affects:
    - "Plan 04 (BaseLayout + page shells) — will import these 11 components into 5 .astro pages and add the global :focus-visible rule that AppointmentForm relies on (FND-13)"
    - "Plan 05 (CI brand-check) — grep rules pass against src/components/design-skill/ and src/styles/"
tech-stack:
  added:
    - "node:fs + node:path (sync script runtime)"
    - "Intl.DateTimeFormat (PopupStrip date formatting)"
  patterns:
    - "Native <details>/<summary> CSS-only mobile hamburger (REVIEW FIX H2) — replaces the rejected checkbox-hack draft"
    - "display: contents on .nav-list/.nav-item to flatten <ul>/<li> into a flex parent without inline display rules on <nav>"
    - "React inline styles for static visuals + className for pseudo-class behavior (CSS-only hover/active in components.css)"
    - "ES module default exports for all design-skill components (Transform 1 of the sync script)"
    - "Real <form method=\"POST\" action=\"/api/contact\"> + named inputs (no useState) — Phase 4 wires the handler"
key-files:
  created:
    - path: "scripts/sync-design-skill.mjs"
      purpose: "one-shot transform engine — converts UMD-style skill JSX to ES-module SSR-safe React"
    - path: "src/styles/colors_and_type.css"
      purpose: "verbatim copy of design-skill tokens minus the Google Fonts @import (Astro Fonts API self-hosts)"
    - path: "src/styles/components.css"
      purpose: ".btn-primary hover/active rules — keeps colors_and_type.css locked (REVIEW FIX M4)"
    - path: "src/components/design-skill/Mark.jsx"
      purpose: "decorative SVG namespace (Underline, Sparkle, Heart, Dots, Rule)"
    - path: "src/components/design-skill/Button.jsx"
      purpose: "primary/secondary/ghost pill buttons; CSS-only hover/press"
    - path: "src/components/design-skill/BeadCluster.jsx"
      purpose: "deterministic decorative SVG bead cluster (seed-based)"
    - path: "src/components/design-skill/Header.jsx"
      purpose: "sticky cream header with logo + nav + native <details>/<summary> mobile hamburger"
    - path: "src/components/design-skill/Hero.jsx"
      purpose: "landing hero — eyebrow + headline (clamp) + tagline + two <a> CTAs + BeadCluster"
    - path: "src/components/design-skill/About.jsx"
      purpose: "founder story section (no props, no state)"
    - path: "src/components/design-skill/GalleryGrid.jsx"
      purpose: "responsive auto-fill gallery grid; accepts pieces[] prop"
    - path: "src/components/design-skill/PopupStrip.jsx"
      purpose: "next-popup strip; accepts popup data prop; formats date via Intl.DateTimeFormat"
    - path: "src/components/design-skill/AppointmentForm.jsx"
      purpose: "static contact form posting to /api/contact (Phase 4 wires the handler)"
    - path: "src/components/design-skill/Footer.jsx"
      purpose: "studio sign-off footer with hi@studiobluemli.com + role=contentinfo"
    - path: "src/components/design-skill/ProductSheet.jsx"
      purpose: "modal product detail sheet (used later by gallery click-thru)"
  modified: []
decisions:
  - "Mobile hamburger uses native <details>/<summary> (not a checkbox hack) — semantic, keyboard-accessible by default, aria-expanded driven natively by the [open] attribute"
  - "All cross-component references use ES module imports (./Mark, ./Button, ./BeadCluster) — Rule 1/2 auto-fix applied beyond the plan's listed edits"
  - "GalleryGrid's PRODUCTS hardcoded array and FILTERS filter UI removed wholesale; component now data-driven via pieces[] prop"
  - "Button hover/press visuals migrated from inline JS handlers (onMouseEnter, onPointerDown) to .btn-primary CSS pseudo-classes in src/styles/components.css (REVIEW FIX M4 — colors_and_type.css stays locked)"
  - "AppointmentForm drops React.useState and the sent-branch; ships as a real POST form to /api/contact (Phase 4 wires the handler; Phase 1 submitting will 404, acceptable per RESEARCH.md Open Question 4)"
  - "PopupStrip refactored from onAppointment handler to popup data prop; data-driven via Plan 04's sample-data.ts"
  - "About.jsx required no structural post-sync edits — just the missing `import Mark from './Mark'` (Rule 1 auto-fix; would otherwise throw ReferenceError at SSR)"
metrics:
  duration: "~6 minutes (380s)"
  completed: "2026-05-13T00:43:31Z"
  tasks-completed: 3
  files-created: 13
  files-modified: 0
  commits: 3
---

# Phase 1 Plan 02: Sync Design Skill into src/ Summary

**One-liner:** Implemented one-shot sync script (D-04..D-06) and applied post-sync edits so 11 design-skill JSX components and the brand-token CSS now live in `src/` as the source of truth — SSR-safe, brand-clean, accessibility-clean, and decoupled from `.claude/skills/`.

## What was built

### Task 1 — `scripts/sync-design-skill.mjs` (commit `8f57be7`)
A 58-line one-shot ES module script that copies the design-skill UI kit into `src/`:
- **COPY_LIST allowlist (Transform 5):** 11 components — Mark, Button, BeadCluster, Header, Hero, About, GalleryGrid, PopupStrip, AppointmentForm, Footer, ProductSheet. Explicitly excludes `App.jsx` and `index.html` (click-thru wiring).
- **Transform 1:** `window.<Name> = <Name>;` → `export default <Name>;` (regex `/window\.(\w+)\s*=\s*\1;?/g`).
- **Transform 2 (idempotent):** Inserts `import React from 'react';` after `/* eslint-disable */` only if not already present.
- **Transform 3:** `../../assets/logo/` → `/` (logo paths only — product image paths are intentionally untouched because Task 3 Edit 6 deletes the entire `PRODUCTS` array).
- **Transform 4:** Strips `backdropFilter` and `WebkitBackdropFilter` style lines (brand non-negotiable from `studio-bluemli-design/SKILL.md`).
- **CSS strip:** Removes the `@import url("https://fonts.googleapis.com/...")` line from `colors_and_type.css` (Astro Fonts API will self-host).
- Logs include the manual-TODO reminder so the next executor knows Task 3 post-sync edits are pending.

### Task 2 — Run sync and verify mechanical transforms (commit `3740588`)
The script ran cleanly via `node scripts/sync-design-skill.mjs` (Plan 01's `pnpm run sync:design-skill` wiring is not yet present — wave-1 parallel plan, so I invoked node directly):
```
Synced 11 components and colors_and_type.css.
Manual TODO: review each file for any remaining cross-skill refs.
Manual TODO: post-sync edits in Plan 02 Task 3 are NOT done by this script.
```

All five mechanical transforms verified:
- 11 JSX files in `src/components/design-skill/`
- Every component has `export default`
- Every component has `import React from 'react'`
- Zero `window.X = X` UMD leftovers
- Zero `backdropFilter` / `WebkitBackdropFilter` anywhere
- `src/styles/colors_and_type.css` has no `fonts.googleapis.com` line; still contains `--color-bg` and `#F5DCC7`

### Task 3 — Post-sync manual edits (commit `36c8860`)

| Component | Edit summary |
| --- | --- |
| `Header.jsx` | Rewritten with native `<details>/<summary>` CSS-only mobile hamburger (REVIEW FIX H2). Route paths `/`, `/gallery`, `/popups`, `/say-hi`; `HeaderProps.active` JSDoc union accepts `/about` (Plan 04 about.astro contract). `role="banner"`, `aria-label="Site navigation"`, hamburger has `aria-label="Open navigation menu"` + `aria-controls="mobile-nav-panel"`. No inline `style` on `<nav>`. `:focus-visible` rules for keyboard nav. 44px min touch target on hamburger button. `nav-list`/`nav-item` use `display: contents` so `<ul>/<li>` flatten into the flex parent without inline display rules. `Mark` import added. |
| `Hero.jsx` | `<Button onClick>` CTAs replaced with `<a href="/gallery">` and `<a href="/popups">` (with `hero-cta-primary`/`hero-cta-secondary` classes). `lineHeight: 1.6` → `1.05` (UI-SPEC `--lh-tight`). `fontSize: 56` → `fontSize: 'clamp(48px, 8vw, 88px)'`. Removed `onCTA` handler prop (dead without `client:`). Secondary CTA uses `box-shadow: inset 0 0 0 2px var(--coral-500)` (not 1px border, CI Rule 5). `BeadCluster` import added. |
| `Footer.jsx` | `mailto:hello@studiobluemli.com` → `mailto:hi@studiobluemli.com` (UI-SPEC §"Footer chrome"). `role="contentinfo"` added. Copyright `fontSize: 11` → `fontSize: 14` (`--fs-xs` minimum). `Mark` import added. |
| `AppointmentForm.jsx` | Stripped `React.useState`, the `sent` branch, and `onSubmit={submit}`. Form is now `<form method="POST" action="/api/contact">` with named inputs `name`, `email`, `notes` (Phase 4 reads them). Section id is `id="say-hi"` (no space, matches route). **No `outline: 'none'` anywhere** — FND-13 requires `:focus-visible` to show. `border: none` + `borderBottom: '2px solid var(--color-border-soft)'` (CI Rule 5). `Button` import added. |
| `GalleryGrid.jsx` | Dropped the hardcoded `PRODUCTS` array, the `FILTERS` array, the `ProductCard` inner component, and the duplicate `export default PRODUCTS` syntax error (Transform 1 produced two defaults — fixed by the rewrite). Component now accepts a `pieces` prop. Uses `gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'`. Each card renders `piece.photo`, `piece.name`, `${piece.price}`, and a quiet availability label (`Available` / `Sold` / `One of one` / `Reserved`). |
| `Button.jsx` | Dropped `onMouseEnter`/`onMouseLeave`/`onPointerDown`/`onPointerUp` handlers and the `press` `useState`. Primary variant gets `className="btn-primary"`; hover/press rules live in `src/styles/components.css`. Ghost variant uses `<Mark.Underline />`. `Mark` import added. |
| `PopupStrip.jsx` | Refactored from `function PopupStrip({ onAppointment })` to `function PopupStrip({ popup })`. Removed hardcoded "NOPA block party / Saturday, June 6 · 10–2 pm" copy. Date formatting uses `Intl.DateTimeFormat` with `popup.tz` (defaults to `America/Los_Angeles`). The `book by appointment` button is a real `<a href="/say-hi">`. `Mark` import added. |
| `About.jsx` | Only needed `import Mark from './Mark'` (the synced file references `<Mark.Heart>` but had no import — would have thrown `ReferenceError: Mark is not defined` at SSR). No structural changes. |
| `ProductSheet.jsx` | Same Rule 1 fix as About — added `import Button from './Button'` and `import Mark from './Mark'`. No structural changes. |
| `BeadCluster.jsx` | No edits (synced cleanly; no cross-component refs). |
| `Mark.jsx` | No edits (synced cleanly; no cross-component refs). |
| `src/styles/components.css` | **NEW.** Houses `.btn-primary`, `.btn-primary:hover { background: var(--coral-700) }`, `.btn-primary:active { transform: scale(0.97) }`. Plan 04's `BaseLayout.astro` will import this AFTER `colors_and_type.css` so the tokens are in scope. M4 keeps `colors_and_type.css` as a verbatim copy of the skill source minus the Google Fonts `@import`. |
| `src/styles/colors_and_type.css` | Verbatim copy of `.claude/skills/studio-bluemli-design/colors_and_type.css` MINUS line 14 (the Google Fonts `@import`). Locked — no component selectors appended. |

## Mobile hamburger mechanism chosen

**Native `<details>/<summary>`** (REVIEW FIX H2). The structure:
```jsx
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
```
- `<summary>` is keyboard-focusable, Enter/Space toggles natively, no JS.
- `<details open>` drives the `[open]` attribute → the platform computes `aria-expanded` automatically (do NOT add a static `aria-expanded`).
- `summary::-webkit-details-marker { display: none }` + `summary::marker { content: '' }` suppress the disclosure triangle.
- `@media (max-width: 640px)` hides the inline `.site-nav` and shows the `<details>` widget; on desktop the reverse.
- 44px min touch target preserved via `.nav-hamburger-button`.
- `:focus-visible` styling on `<summary>` and on nav links.

The earlier checkbox-hack draft was rejected because Codex caught two real bugs (inline `display: flex` on `<nav>` overrode the mobile collapse rule, and the static `aria-expanded="false"` never updated). The `<details>/<summary>` approach is strictly better.

## Verified PopupStrip prop name

`popup` (data prop, not the original `onAppointment` handler). Matches Plan 04 Task 3 consumer: `<PopupStrip popup={sampleNextPopup} />`.

Shape (matches `Popup` type Plan 04 will define in `src/sample-data.ts`):
```ts
{
  name: string,
  date: string,         // ISO date, e.g. "2026-06-06"
  startTime: string,    // "HH:MM", e.g. "10:00"
  endTime: string,      // "HH:MM", e.g. "14:00"
  tz: string,           // IANA, e.g. "America/Los_Angeles"
  location: string,
}
```

## Verified About has no post-sync edits required (beyond Rule 1 import)

The synced `About.jsx` has no `useState`, no cross-skill imports — only references `Mark.Heart` and CSS vars. The plan said "no edits needed beyond mechanical transforms," but the mechanical transforms did NOT add the `Mark` import, which is required for SSR to not throw. Adding `import Mark from './Mark';` is the only structural change.

## `pieces` prop shape that `GalleryGrid` expects

Plan 04 must produce items in `src/sample-data.ts` with this shape:
```ts
type Piece = {
  slug: string,        // unique key
  name: string,
  price: number,       // USD, rendered as $N
  status: 'available' | 'sold' | 'one-of-one' | 'reserved',
  photo: string,       // URL to optimized WebP under /
};
```
Availability labels rendered: `available` → `Available`, `sold` → `Sold`, `one-of-one` → `One of one`, anything else → `Reserved`.

## AppointmentForm input `name=` attributes

Phase 4's contact handler reads these names from the POST body:
- `name` (text — "your name")
- `email` (email — "email")
- `notes` (textarea — "what are you hoping for?")

## Confirmation: NO `outline: 'none'` survives anywhere in `src/components/design-skill/`

```bash
grep -rE "outline:\s*['\"]?none" src/components/design-skill/
# exit 1, no output — confirmed
```

FND-13 satisfied. The global `:focus-visible` rule (Plan 04 Task 2 will add it to BaseLayout's `<style is:global>` block) supplies the visible outline for all interactive elements.

## Confirmation: `colors_and_type.css` `@import url(fonts.googleapis.com)` line is stripped

```bash
grep -q "fonts.googleapis.com" src/styles/colors_and_type.css
# exit 1, no output — confirmed
```

The CSS still contains every brand token (`--color-bg`, `--coral-500`, `#F5DCC7`, etc.) — verified by grep. Astro Fonts API (Plan 01) will self-host the four font families.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] GalleryGrid had two `export default` statements after sync**
- **Found during:** Task 2 verification (count of `export default` per file)
- **Issue:** The source `GalleryGrid.jsx` had both `window.GalleryGrid = GalleryGrid;` and `window.PRODUCTS = PRODUCTS;`. Transform 1 converted both, producing `export default GalleryGrid;` and `export default PRODUCTS;` on consecutive lines — a syntax error (JavaScript modules allow only one default export).
- **Fix:** Task 3 Edit 6 already deletes the `PRODUCTS` array wholesale (the component now takes a `pieces` prop), which incidentally removes the duplicate `export default` too. No script change needed since this is the only synced file with multiple `window.X = X` lines (verified by `grep -c` across all 11 files).
- **Files modified:** `src/components/design-skill/GalleryGrid.jsx`
- **Commit:** `36c8860`

**2. [Rule 1 - Bug] About, Footer, Hero, Button, ProductSheet referenced cross-component symbols without ES module imports**
- **Found during:** Task 3 pre-edit inspection of synced files
- **Issue:** The source skill JSX is loaded via `<script type="text/babel">` and relies on `window.Mark`, `window.Button`, `window.BeadCluster` globals. The sync script's Transform 1 converts the export side (`window.X = X` → `export default X`), but does NOT add the imports on the consumer side. Without imports, `<Mark.Dots>` / `<Button>` / `<BeadCluster>` reference undeclared identifiers and SSR throws `ReferenceError`.
- **Fix:** Added the missing imports to each file:
  - `About.jsx`: `import Mark from './Mark';`
  - `Footer.jsx`: `import Mark from './Mark';` (also touched by Edit 3)
  - `Hero.jsx`: `import BeadCluster from './BeadCluster';` (also rewritten by Edit 2)
  - `Button.jsx`: `import Mark from './Mark';` (also touched by Edit 7)
  - `ProductSheet.jsx`: `import Button from './Button';` and `import Mark from './Mark';`
  - `AppointmentForm.jsx` and `PopupStrip.jsx` and `Header.jsx` already get their imports via Edits 1/4/5 which fully replace component bodies.
- **Why not in plan:** The plan's must_have truth says "Every component imports React" but doesn't enumerate cross-component imports. Without these additions, the components are broken at SSR — a correctness requirement (Rule 1/2).
- **Files modified:** 5 components above
- **Commit:** `36c8860`

**3. [Rule 3 - Blocking] Comment strings tripped the plan's grep gates**
- **Found during:** First pass of Task 3 verify
- **Issue:** The plan's automated verify regex like `! grep -q "Saturday, June 6" PopupStrip.jsx` doesn't distinguish comments from code. The first draft of PopupStrip's comment said "Format the ISO date as 'Saturday, June 6'..." which tripped the grep even though there was no hardcoded copy in the rendered output. Same for `onAppointment` (in a "Replaced the synced <Button onClick={onAppointment}>" comment), `onMouseEnter` (in a Button.jsx comment), and `outline: 'none'` (in an AppointmentForm comment).
- **Fix:** Rewrote the four comments to convey the same meaning without using the forbidden keywords.
- **Files modified:** `PopupStrip.jsx`, `Button.jsx`, `AppointmentForm.jsx`
- **Commit:** `36c8860`

### Observations (not deviations)

**Task 2 verify regex `! grep -rE "\.\./\.\./assets/"` would have flagged the synced state**
- The plan's Task 2 verify expects ALL `../../assets/` paths to be gone after sync. But Transform 3 by design only rewrites `../../assets/logo/` (where the rest of the skill assets — product photos — live at `../../assets/product/*` and have no `/product/` counterpart in the repo). At Task 2 commit time, the synced `GalleryGrid.jsx` still contained 6 `../../assets/product/` references inside the `PRODUCTS` hardcoded array. The Task 2 action text says "do NOT modify the file in this task (post-sync edits happen in Task 3)" — so I committed the Task 2 state with the offending refs, knowing Task 3 Edit 6 deletes the entire array. After Task 3, `! grep -rE "\.\./\.\./assets/" src/components/design-skill/` passes cleanly.

## Authentication gates

None encountered.

## Known Stubs

None — `placeholder="..."` matches in `AppointmentForm.jsx` are intentional HTML input placeholder text, not unwired data. The `popup?.location || 'TBD'` fallback in `PopupStrip.jsx` is a graceful degradation for missing data and is documented in D-01 (demo-loaded → real Phase 3 data); Plan 04 supplies the prop.

## TDD Gate Compliance

Not applicable — plan `type: execute` (not `tdd`). No RED/GREEN/REFACTOR gates required.

## Verification — final consolidated check

All success criteria from the plan pass:

| Criterion | Result |
| --- | --- |
| `ls src/components/design-skill/*.jsx \| wc -l` reports 11 | PASS (11) |
| All 11 components have `export default` | PASS |
| All 11 components have `import React` | PASS |
| No `window.X = X` UMD leftovers | PASS |
| No `../../assets/` paths | PASS |
| No `backdropFilter` / `WebkitBackdropFilter` | PASS |
| No `outline: 'none'` (FND-13) | PASS |
| No 1px borders | PASS |
| No flower vocab (`flower\|petal\|floral\|bloom\|blossom`) | PASS |
| No gradients | PASS |
| No white bg (`bg-white`, `#fff`, `#FFFFFF`) | PASS |
| CSS contains `--color-bg` and `#F5DCC7` | PASS |
| CSS does NOT contain `fonts.googleapis.com` | PASS |
| Header has `role="banner"`, `aria-label="Site navigation"`, route paths, `<details>/<summary>`, no inline `<nav style>`, no static `aria-expanded`, `/about` in active union | PASS |
| Footer has `hi@studiobluemli.com`, no `hello@`, `role="contentinfo"` | PASS |
| GalleryGrid accepts `pieces` prop, no `PRODUCTS` array | PASS |
| PopupStrip accepts `{ popup }` prop, no NOPA/June-6 copy, no `onAppointment` | PASS |
| AppointmentForm has `method="POST"`, `action="/api/contact"`, `id="say-hi"`, no `useState` | PASS |
| Button has no `onMouseEnter`/`onPointerDown` handlers | PASS |
| `colors_and_type.css` has no component selectors (REVIEW FIX M4) | PASS |
| `src/styles/components.css` exists with `.btn-primary` | PASS |
| All 11 JSX files parse cleanly via `@babel/parser` (deep syntax check) | PASS |

(`pnpm exec astro check` is not runnable here because Plan 01 wires the toolchain in parallel — wave 1. The orchestrator's post-merge verifier will run it.)

## Self-Check: PASSED

Verified the following before returning:

- `scripts/sync-design-skill.mjs` exists in working tree
- `src/components/design-skill/{Mark,Button,BeadCluster,Header,Hero,About,GalleryGrid,PopupStrip,AppointmentForm,Footer,ProductSheet}.jsx` (11 files) exist in working tree
- `src/styles/colors_and_type.css` exists in working tree
- `src/styles/components.css` exists in working tree
- Commit `8f57be7` exists in git log
- Commit `3740588` exists in git log
- Commit `36c8860` exists in git log
- All 11 JSX files parse cleanly via `@babel/parser` (no syntax errors)
- All cross-component imports (`./Mark`, `./Button`, `./BeadCluster`) resolve to files that exist in `src/components/design-skill/`
