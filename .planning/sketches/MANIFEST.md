# Sketch Manifest

## Design Direction

**Editorial portfolio on cream paper.** The detail page is a quiet, catalog-plate composition: contained photo (~720px max on desktop), hand-display name beneath, price + status on one line, 1–2 sentence description in Nunito, then a confident-but-tucked coral CTA button to DM on Instagram with a small `hi@studiobluemli.com` text-link fallback. Generous margins. The photograph carries the page; type stack is restrained. Sold pieces stay in the grid as quiet editorial entries (muted indigo, never a red stamp).

## Reference Points

- The locked detail-page contract from `.planning/phases/02-content-schema-gallery/02-CONTEXT.md` D-09 (composition), D-11 (sold-state copy + badge), D-13 (mailto fallback).
- Existing `src/components/design-skill/GalleryGrid.jsx` (the current 4:5 cream card with status text bottom-right).
- The cream/coral/indigo/olive palette and Caveat Brush + Nunito type pair from `src/styles/colors_and_type.css`.

## Sketches

| # | Name | Design Question | Winner | Tags |
|---|------|----------------|--------|------|
| 001 | gallery-detail-composition | What does the editorial detail page feel like — where do photo, name, and CTA sit? | A — centered narrow plate (640px) | detail, layout, type |
| 002 | gallery-grid-sold-treatment | How does "Sold" read in the grid so it feels editorial, not broken? | A — status bottom-right (sold = lavender-500, one-of-one = olive-500, 700-weight) | grid, badge, sold-state |
| 003 | landing-popup-callout | How quiet does the "NEXT POP-UP" callout need to be so it doesn't compete with the 88px Hero headline? | C — Caveat eyebrow (tilted, 28px) + Nunito when-line with coral venue + muted time | landing, popup, callout |
| 004 | popups-page-composition | How do PopupStrip + ALSO COMING UP + PAST + empty state co-exist on one editorial page? | A — centered 720px column, hairline-ruled also-coming-up rows, muted text PAST list, restrained empty-state | popups, layout, list, empty-state |
| 005 | about-photo-strip | What does the closing photo flourish look like under "made with love from NOPA ♡"? | B — 3 contained 1:1 squares inside the 720px column with `--radius-sm` and small gap | about, photos, closing-visual |

## Key Decisions

### Detail page `/gallery/<slug>` (from Sketch 001-A)
- Centered narrow plate, **640px max content width**.
- Photo at native aspect ratio, `--radius-sm` corners.
- Hand-display name (Caveat Brush) at **`--fs-3xl` (48px)**, coral-500, centered.
- Meta row centered: price (Nunito 800, `--fs-lg`, indigo-700) + status badge (eyebrow caps, olive-500 / lavender-500).
- Description Nunito body `--fs-md`, `--lh-loose`, centered, max 520px.
- CTA: coral-500 pill button, Nunito 800. Mailto fallback small text below.
- Back link top and bottom of plate.

### Gallery grid card (from Sketch 002-A)
- Phase 1 `GalleryGrid.jsx` layout retained: 4:5 photo + name + meta row (price left, status right).
- Status color by enum: `available` → muted (`--color-fg-muted`, 400-weight), `sold` → lavender-500 (700), `one-of-one` → olive-500 (700), `reserved` → tbd (likely lavender-500 too).
- Sold pieces stay in the grid — visible, quiet, never red.

## Open Questions

- **Reserved state** — CNT-04 enum has `available | sold | one-of-one | reserved`, but the seed content only uses three of them. Phase 2 planner should pick a treatment for `reserved` consistent with sold (likely lavender-500 too, copy "Reserved").
- **Detail page sold-state copy** — D-11 locks the CTA copy flip ("This pair sold — DM me about something similar"). Sketch 001-A demonstrated the *layout*; the planner should verify the sold variant of the same plate doesn't need any visual adjustment beyond status color + CTA text swap.
