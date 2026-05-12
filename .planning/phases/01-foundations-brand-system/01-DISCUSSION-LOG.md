# Phase 1: Foundations & Brand System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-12
**Phase:** 1-Foundations & Brand System
**Areas discussed:** Placeholder shell scope (the rest were delegated to Claude after the founder flagged the original question set as too technical)

---

## Initial gray-area presentation

Claude opened with four gray areas (placeholder shell scope, design-skill sync strategy, CI enforcement strictness, hand-display font sourcing). The founder pushed back with:

> "sounds really technical. do you need my input?"

Reframe: Claude pulled three of the four into "I'll handle it" with stated defaults, and asked only the one decision the founder will actually feel in the preview link — what the placeholder pages show.

---

## Placeholder shell scope

| Option | Description | Selected |
|--------|-------------|----------|
| Demo-loaded with real chrome | Header + footer on every page, plus the design skill's actual components dropped onto the right page (Hero on landing, GalleryGrid with 6 dummy pieces, PopupStrip with 2 fake pop-ups, etc.). Founder sees the real visual feel of every page with placeholder data. Phases 2–3 swap fake data for real content. | ✓ |
| Hybrid: composed but quiet | Header + footer + each page's headline and one paragraph of lifted skill copy. No gallery cards, no pop-up cards, no form — just the brand voice and chrome. Leaves more visual surprise for Phases 2–3. | |
| Bare chrome only | Header + footer + page name as the heading. Nothing else. Fastest to ship, but the preview will look pretty empty — verifies cream-bg + fonts + nav work. | |

**User's choice:** Demo-loaded with real chrome.
**Notes:** Founder wants the preview link to feel like a real site, not a wireframe. Trade-off accepted: Phase 1 will carry throwaway sample data that Phase 2 deletes once real content collections come online. Sample data must be obviously tagged as placeholder so it can't be mistaken for real content.

---

## Claude's Discretion

Areas the founder explicitly delegated when they flagged the first batch of options as too technical:

- **Design-skill sync strategy** → one-shot copy at scaffold; evolve in `src/` thereafter. Skill is a kit, not a runtime dep.
- **CI enforcement strictness** → GitHub Actions required check that blocks PR merge. No local pre-commit hook (founder will eventually edit via the GitHub web UI; pre-commit doesn't help there).
- **Cloudflare Worker project name** → `studio-bluemli`. Preview lands on `studio-bluemli.<account>.workers.dev`.
- **Hand-display font sourcing** → ship Caveat Brush + Nunito via Astro Fonts API (Google Fonts substitutions per design skill README). Swap to a founder-provided woff2 later as a one-file change.

Additional technical decisions deferred to research/planning:

- Exact `wrangler.toml` shape (verified against current Cloudflare docs by researcher).
- Specific grep regex shapes for each banned brand pattern.
- Exact GitHub Actions workflow file structure (`astro check` + `astro build` + grep step + Lighthouse).
- Choice of favicon generation tool (sharp-cli vs ImageMagick — either runs outside `workerd`).
- Sample-data file location (`src/sample-data.ts` vs inline per page).

## Deferred Ideas

- Real hand-display woff2 from founder — swap path documented; not blocking Phase 1.
- `staging.studiobluemli.com` custom domain on preview — not requested; Phase 1 uses `*.workers.dev` only.
- Local pre-commit hook for future engineer contributors — explicit pass for Phase 1.
- CMS UI (Decap / Sveltia / Pages CMS / Tina) — Phase 2 file layout keeps this trivially addable later.
