# Sketch Wrap-Up Summary

**Dates:**
- 2026-05-13 — Phase 2 wrap-up (sketches 001, 002)
- 2026-05-13 — Phase 3 wrap-up (sketches 003, 004, 005, 006)

**Sketches processed:** 6 (2 Phase 2 + 4 Phase 3)
**Design areas:** Gallery surfaces · Pop-ups across surfaces · Static narrative pages
**Skill output:** `./.claude/skills/sketch-findings-bluemli/`

## Included Sketches

| # | Name | Winner | Design Area |
|---|------|--------|-------------|
| 001 | gallery-detail-composition | A — centered narrow 640px plate, Caveat Brush 48px name, coral pill CTA | Gallery surfaces |
| 002 | gallery-grid-sold-treatment | A — status bottom-right; sold = lavender-500/700, one-of-one = olive-500/700 | Gallery surfaces |
| 003 | landing-popup-callout | C — tilted Caveat eyebrow (28px) + Nunito when-line with coral venue + muted time | Pop-ups across surfaces |
| 004 | popups-page-composition | A — PopupStrip top + 720px column with hairline-ruled ALSO COMING UP rows + muted text PAST list | Pop-ups across surfaces |
| 005 | about-photo-strip | B — three contained 1:1 squares in the 720px column with `--radius-sm` and small gap | Static narrative pages |
| 006 | say-hi-ig-link-page | A (refined, no eyebrow) — Hero-style Caveat Brush headline + single coral pill IG button + mailto text | Static narrative pages |

## Excluded Sketches

| # | Name | Reason |
|---|------|--------|
| — | — | None — all 6 sketches included |

## Design Direction

Editorial portfolio on cream paper. Two voices coexist by design: big editorial headlines on Hero / `/say-hi` / `PopupStrip` earn their volume; everything else stays one register quieter (Nunito caps eyebrows, Caveat for handwritten touches and signatures, Nunito 700–800 for emphasis). Per-piece headlines on the gallery detail page stay at 48px max. Sold pieces stay in the archive with muted lavender-500/700 text — never a red stamp, never an overlay. Pop-ups render at two scales: a quiet handwritten mini-callout on landing, the full editorial `PopupStrip` plus hairline-ruled lists on `/popups`. `/say-hi` is a one-screen no-form surface — Caveat Brush "say hi" + single coral pill IG button + mailto text. Tokens only, never hardcoded hex.

## Key Decisions

### Gallery surfaces (Phase 2 — sketches 001, 002)
- Detail page max content width **640px**, Caveat Brush name at **48px** (not 64/88), photo native aspect ratio with `--radius-sm` corners.
- Coral pill CTA tucked into the type stack; mailto fallback below.
- Grid card unchanged from Phase 1; per-status color treatment added: `available` muted-gray 400, `sold` lavender-500/700, `one-of-one` olive-500/700, `reserved` placeholder lavender-500/700.

### Pop-ups across surfaces (Phase 3 — sketches 003, 004)
- Landing mini-callout: `--font-hand` (Caveat NOT Caveat Brush) "next pop-up" eyebrow at 28px tilted **-1.5°**, Nunito 28px-bold when-line with venue in `--coral-500` (em-dash separator), Nunito 16px muted time line, optional "see all upcoming pop-ups →" link only when 2+ upcoming exist.
- Zero upcoming → the entire landing callout is omitted (D-03).
- `/popups` page: full `PopupStrip` JSX (D-09 — no "book by appointment" CTA) + centered 720px column with hairline-ruled ALSO COMING UP rows (Nunito 18px/700, format `<weekday>, <date> · <venue> · <time>`) + tight muted PAST text list (Nunito 14px/400, format `<weekday>, <date> · <venue>, <city>`).
- Empty `/popups` state: centered "POP-UPS" eyebrow + 2-line copy referencing `@studiobluemli` as a coral link. No hand-display headline.
- No photos in PAST archive (D-07).

### Static narrative pages (Phase 3 — sketches 005, 006)
- `/about`: existing text block kept, **photo strip added below the signature** — same 720px column, 3-column grid, `aspect-ratio: 1/1`, `--radius-sm` corners, small gap. Photos reuse gallery hero WebPs (D-14 — no dedicated craft shots). Graceful fallback to 1 or 2 photos via `auto-fit` when fewer pieces are published.
- `/about` signature reads `made with love from NOPA ♡` in `--font-hand`, heart in `--coral-500` (D-16).
- `/say-hi`: **no eyebrow**, Caveat Brush "say hi" headline at `clamp(56px, 9vw, 96px)`, Caveat "let's talk earrings" sub at 28px, single coral pill IG button linking `ig.me/m/studiobluemli`, `min-height: 540px` on the stage so the page doesn't sit awkwardly mid-viewport.
- Mailto fallback small Nunito text below the button, email itself coral underlined.
- No form, no Worker endpoint, no Turnstile in v1. `AppointmentForm.jsx` stays unused in the codebase (D-21).

## Anti-patterns (avoid)

- Hand-display name larger than 48px on per-piece pages.
- Left-aligned detail page on desktop.
- "Sold" eyebrow above a piece name (announces sold pieces; brand wants them quiet).
- Red stamps, overlays, watermarks, or photo desaturation on sold cards.
- Hiding sold pieces from the grid.
- Rendering the full `PopupStrip` on the landing page (competes with Hero).
- A cream-stripe band for the landing callout (reads as banner promo).
- A "book by appointment" CTA inside `PopupStrip` (Phase 1 default — removed by D-09).
- A loud headline on the `/popups` empty state.
- Photos on the `/popups` PAST archive (D-07 — `photos` schema field is intentionally not rendered in v1).
- A 2-column or 3-column tour-schedule layout for ALSO COMING UP (reads as events app, not editorial).
- A dedicated craft/process photo shoot in v1 for `/about` (D-14 — gallery hero WebPs are enough).
- A founder-face photo anywhere on the site (ROADMAP lock).
- Edge-to-edge full-bleed photo band on `/about` (reads as colophon, pulls focus from copy).
- A single hero photo on `/about` (feels like one piece is being championed).
- An eyebrow above the `/say-hi` headline (duplicates `say hi`).
- A 48px Caveat Brush headline on `/say-hi` (reads as tucked subhead; page needs Hero weight).
- Two equal-weight pill links (IG + email) on `/say-hi` (elevates email to parity; IG is the primary channel).
- A `<form>` on `/say-hi` in v1 (D-18 dropped the contact form entirely).
- Removing `AppointmentForm.jsx` from the codebase (D-21 keeps it for possible future re-introduction).
- Reverting `output: 'server'` or `run_worker_first: ["/api/*"]` in v1 (D-22 — preserves zero-friction reintroduction).
- Naive `new Date()` for upcoming/past split — always use a real TZ library (Pitfall #7).

## Open Questions (carry to planning)

- Em-dash vs `·` separator in landing mini-callout (recommend em-dash).
- ALSO COMING UP threshold: render only with 2+ upcoming (no empty section when exactly 1).
- Reserved-state visual treatment (placeholder lavender-500/700; may want its own color if used for "held during a pop-up").
- About photo-strip fallback when <3 pieces published (recommend `repeat(auto-fit, minmax(0, 1fr))` so 1 or 2 photos auto-size; no empty cream cells).
- Photo selection algorithm for `/about` — Claude picks at build time based on color balance, or planner specifies a deterministic rule.
- Sold-state detail page visual — Sketch 001-A built only `available`. Confirm during planning that swapping status color + CTA text per D-11 is sufficient.
