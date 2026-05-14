---
phase: 03-page-composition-pop-ups
plan: 01
subsystem: ui
tags: [astro, fonts-api, fontsource, caveat-brush, brand-system, typography, copy]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: BaseLayout.astro + Astro Fonts API wiring + colors_and_type.css token file
  - phase: 02-content-schema-gallery
    provides: src/content/site/config.yaml site-wide copy + 3 design-skill JSX shells (Hero/About/Footer)
provides:
  - "Wordmark renders in Caveat Brush in Header + Footer (visually matches display headlines)"
  - "Zero Bagel Fat One WOFF2 download — saves ~25-35 KB + 1 HTTP/2 request"
  - "NOPA casing baseline across the 4 user-facing source files (Hero, About, Footer, site/config.yaml)"
  - "package-lock.json regenerated with @fontsource/bagel-fat-one fully removed"
affects: [03-02 SEO + sitemap, 03-03 popups + landing pop-up callout, 03-04 about rewrite]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Wordmark font reuse via CSS-variable cascade: --font-wordmark cascades to var(--font-display-loaded), avoiding a second WOFF2 download"
    - "Astro Fonts API entry removal + matching <Font cssVariable=...-loaded /> tag removal in lockstep (Pitfall 6 of 03-RESEARCH.md)"

key-files:
  created:
    - "package-lock.json (regenerated; previously not tracked)"
  modified:
    - "astro.config.mjs"
    - "src/styles/colors_and_type.css"
    - "src/layouts/BaseLayout.astro"
    - "src/components/design-skill/Hero.jsx"
    - "src/components/design-skill/About.jsx"
    - "src/components/design-skill/Footer.jsx"
    - "src/content/site/config.yaml"
    - "package.json"

key-decisions:
  - "Drop Bagel Fat One dep entirely (vs. comment-out) — cleaner node_modules and one fewer supply-chain package (D-24)"
  - "CLAUDE.md NoPa references preserved per D-25 + reviews-mode Concern 11 — CLAUDE.md is planning prose, not user-facing site copy"
  - "Wordmark cascade reads `var(--font-display-loaded), \"Caveat Brush\", cursive` — left-to-right family resolution; no duplicate @font-face emitted"

patterns-established:
  - "Pitfall 6 honored: removing a Fonts API entry MUST also remove the matching <Font cssVariable=...-loaded preload /> tag in BaseLayout.astro — otherwise the build emits a 404'ing preload."
  - "D-25 scope discipline: NoPa→NOPA is a user-facing-only fix; .planning/, .claude/skills/, code comments, and CLAUDE.md are explicitly excluded. Apply via surgical string-literal edits, never a blanket sed."

requirements-completed: [PAG-01]

# Metrics
duration: 5min
completed: 2026-05-14
---

# Phase 3 Plan 1: Brand-System Tweaks Summary

**Wordmark font swapped from Bagel Fat One to Caveat Brush via a CSS-variable cascade (zero new font downloads), and NoPa → NOPA casing flipped across 8 user-facing strings in 4 source files — Plan 2's SEO meta and Plan 4's About rewrite inherit the corrected baseline.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-14T06:49:27Z
- **Completed:** 2026-05-14T06:54:08Z
- **Tasks:** 4 / 4
- **Files modified:** 8 (+ 1 created: package-lock.json)

## Accomplishments

- Wordmark "Studio Bluemli" in Header and Footer now renders in Caveat Brush, matching the editorial display headlines.
- Eliminated the Bagel Fat One WOFF2 download entirely (~25–35 KB + 1 HTTP/2 request saved per page load).
- 8 surgical NoPa → NOPA edits across Hero.jsx, About.jsx, Footer.jsx, and site/config.yaml — flipping eyebrow, sub-tagline, body paragraph, footer tagline, location span, og_description, footer_text, and tagline strings.
- `@fontsource/bagel-fat-one` dependency removed from package.json and package-lock.json regenerated.
- Full CI gate green: `npm run build` exit 0, `ci:brand-check` exit 0, `ci:lowercase-check` exit 0, no Bagel CSS in `dist/`, no orphan `--font-wordmark-loaded` preload tag.

## Task Commits

Each task was committed atomically:

1. **Task 1: Wordmark font swap (D-24)** — `ffdf4d3` (feat)
   - `astro.config.mjs`: removed Bagel Fat One Fonts API entry (4 → 3 entries: Caveat Brush, Nunito, Caveat).
   - `src/layouts/BaseLayout.astro`: removed `<Font cssVariable="--font-wordmark-loaded" preload />`. `--font-display-loaded` preload tag preserved (Pitfall 6).
   - `src/styles/colors_and_type.css`: replaced `--font-wordmark` cascade with `var(--font-display-loaded), "Caveat Brush", cursive`.

2. **Task 2: NoPa → NOPA casing fix (D-25)** — `57a344c` (fix)
   - `Hero.jsx`: eyebrow + sub-tagline (2 strings).
   - `About.jsx`: body paragraph (1 string).
   - `Footer.jsx`: tagline + location span (2 strings).
   - `src/content/site/config.yaml`: tagline + footer_text + og_description (3 strings).

3. **Task 3: Drop @fontsource/bagel-fat-one + CLAUDE.md defensive check (D-24 follow-up)** — `66b36d4` (chore)
   - `package.json`: removed the `@fontsource/bagel-fat-one` dependency line.
   - `CLAUDE.md`: zero Bagel matches at planning time — no edit needed (no-op defensive check).

4. **Task 4: Install + build + CI gates** — `5fdf97d` (chore)
   - `package-lock.json`: regenerated by `npm install` (434 packages, 35s, no Bagel entries).
   - `npm run build` exit 0; `npm run ci:brand-check` exit 0; `npm run ci:lowercase-check` exit 0.

## Files Created/Modified

- `astro.config.mjs` — Fonts API entry for Bagel Fat One removed; 3 entries remain.
- `src/styles/colors_and_type.css` — `--font-wordmark` cascade now aliases `var(--font-display-loaded)`.
- `src/layouts/BaseLayout.astro` — `<Font cssVariable="--font-wordmark-loaded" preload />` removed; 3 preload tags remain.
- `src/components/design-skill/Hero.jsx` — Eyebrow (`Studio Bluemli · NOPA, San Francisco`) and sub-tagline updated.
- `src/components/design-skill/About.jsx` — Body paragraph updated (`out of a little studio in NOPA, San Francisco`).
- `src/components/design-skill/Footer.jsx` — Tagline (`hand-assembled earrings · made in NOPA, San Francisco`) and location span (`NOPA, San Francisco`) updated.
- `src/content/site/config.yaml` — `tagline`, `footer_text`, `og_description` flipped to NOPA. `og_title` intentionally not modified (had no NoPa to begin with — D-25 enumeration).
- `package.json` — `@fontsource/bagel-fat-one` dependency removed.
- `package-lock.json` — Regenerated (previously not tracked in repo); 7,992 lines.

## Grep-Count Snapshot

**Before (verified at planning time, confirmed at execution start):**

| File | `NoPa` count | `Bagel` count |
|---|---|---|
| `src/components/design-skill/Hero.jsx` | 2 | 0 |
| `src/components/design-skill/About.jsx` | 1 | 0 |
| `src/components/design-skill/Footer.jsx` | 2 | 0 |
| `src/content/site/config.yaml` | 3 | 0 |
| `astro.config.mjs` | 0 | 1 |
| `src/styles/colors_and_type.css` | 0 | 1 |
| `src/layouts/BaseLayout.astro` | 0 | 0 (but `--font-wordmark-loaded` preload tag present) |
| `package.json` | 0 | 1 |
| `CLAUDE.md` | 2 (planning prose — D-25 preserved) | 0 |

**After (verified post-execution):**

| File | `NoPa` count | `NOPA` count | `Bagel` count |
|---|---|---|---|
| `src/components/design-skill/Hero.jsx` | 0 | 2 | 0 |
| `src/components/design-skill/About.jsx` | 0 | 1 | 0 |
| `src/components/design-skill/Footer.jsx` | 0 | 2 | 0 |
| `src/content/site/config.yaml` | 0 | 3 | 0 |
| `astro.config.mjs` | 0 | — | 0 |
| `src/styles/colors_and_type.css` | 0 | — | 0 |
| `src/layouts/BaseLayout.astro` | 0 | — | 0 (preload tag removed) |
| `package.json` | 0 | — | 0 |
| `CLAUDE.md` | **2 (preserved)** | — | 0 |

Net: **8 NoPa → NOPA flips** across user-facing source files; **5 Bagel-touching files cleaned** (4 source files + the implicit dist/ CSS); **0 changes** to the D-25 exclusion set.

## Plan Inheritance

Subsequent Phase 3 plans inherit a clean baseline:

- **Plan 02 (`<SEO />` + sitemap):** Will pull `og_title`, `og_description`, `tagline` from `site/config.yaml`. The og_description and tagline already read "NOPA" — Plan 2's `<SEO />` component composes these without a second pass.
- **Plan 03 (`/popups` + landing pop-up mini-callout):** Hero.jsx's eyebrow and sub-tagline strings (the landing page hero) already say NOPA; the landing-page prerender in Plan 3 inherits that copy.
- **Plan 04 (`/about` rewrite):** About.jsx's body paragraph (the placeholder shipped in Phase 1) already says NOPA; the additive rewrite in Plan 4 builds on top of NOPA-corrected text rather than re-fixing it.

## Decisions Made

None new during execution. The plan locked all decisions at planning time:

- **D-24** locked the wordmark swap path (CSS-variable alias, no duplicate Fonts API entry).
- **D-25** locked the NoPa→NOPA scope (4 user-facing files; CLAUDE.md/.planning/.claude/skills/code-comments excluded).
- **Reviews Concern 11** clarified CLAUDE.md is excluded entirely (not just for NoPa but also as a Bagel-defensive-only check — which turned out to be a no-op since CLAUDE.md had 0 Bagel matches at planning time).

## Deviations from Plan

None — plan executed exactly as written. All 4 tasks completed with the exact edits, the exact verification commands, and the exact acceptance criteria specified in the PLAN. No Rule 1, 2, or 3 auto-fixes were necessary.

## Issues Encountered

**1. Missing gallery manifest (pre-existing, not caused by this plan)**

The initial Task 1 verification build surfaced an `astro check` error: `Cannot find module '../../../public/gallery/_manifest.json'`. I confirmed this was pre-existing on the baseline commit (the manifest is gitignored under `public/gallery/`, regenerated by `npm run prebuild:images`). I ran `npm run prebuild:images` once to materialize the manifest, then proceeded — no plan changes needed. Subsequent Task 1 + Task 4 builds were both green.

**2. macOS BSD grep warning in `ci:brand-check` script (pre-existing, cosmetic)**

The Phase 1 `scripts/check-brand-rules.sh` calls `grep -P` somewhere, which prints a one-line BSD-grep usage warning on macOS but does not affect the script's exit code or its final "All brand rules pass." verdict. Out of scope for this plan; logged for awareness only.

## User Setup Required

None — no external service configuration required.

## Pitfall + Reviews Compliance Notes

- **Pitfall 6 (RESEARCH.md):** `<Font cssVariable="--font-display-loaded" preload />` in BaseLayout.astro was preserved — it is the tag that triggers the `@font-face` emission that the new `--font-wordmark` cascade aliases through.
- **Pitfall 7 (RESEARCH.md):** No blanket sed. All 8 NoPa→NOPA edits were surgical string-literal replacements using exact-context anchors.
- **Reviews Concern 11:** CLAUDE.md NoPa references (2 occurrences in planning prose at lines 5 and 177) were preserved. CLAUDE.md is a Claude-only documentation file, not user-facing site copy.

## Next Phase Readiness

Wave 1 of Phase 3 (this plan, executed in isolation) is complete and ready for merge. Wave 2 plans (02 — SEO + sitemap; 03 — popups + landing; 04 — about rewrite; 05 — final composition glue) can now read the NOPA-corrected baseline copy + the simplified Fonts API config without any re-fix passes.

## Self-Check: PASSED

- All 8 modified files (+ 1 created) exist on disk.
- All 4 task commits (`ffdf4d3`, `57a344c`, `66b36d4`, `5fdf97d`) exist in `git log`.
- SUMMARY.md exists at the expected path.

---
*Phase: 03-page-composition-pop-ups*
*Completed: 2026-05-14*
