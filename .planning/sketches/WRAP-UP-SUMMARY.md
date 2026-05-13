# Sketch Wrap-Up Summary

**Date:** 2026-05-13
**Sketches processed:** 2
**Design areas:** Gallery surfaces (grid + detail page)
**Skill output:** `./.claude/skills/sketch-findings-bluemli/`

## Included Sketches

| # | Name | Winner | Design Area |
|---|------|--------|-------------|
| 001 | gallery-detail-composition | A — centered narrow 640px plate, Caveat Brush 48px name, coral pill CTA | Gallery surfaces |
| 002 | gallery-grid-sold-treatment | A — status bottom-right; sold = lavender-500/700, one-of-one = olive-500/700 | Gallery surfaces |

## Excluded Sketches

| # | Name | Reason |
|---|------|--------|
| — | — | None — both sketches included |

## Design Direction

Editorial portfolio on cream paper. The detail page is a quiet 640px catalog plate: contained photo → Caveat Brush 48px piece name → centered price + status → 1–2 sentence description in Nunito → confident coral pill CTA → mailto fallback → back link. The gallery grid keeps the existing Phase 1 `GalleryGrid.jsx` shape and finally gives sold/one-of-one statuses the per-status color treatment they need: lavender-500/700-weight for sold, olive-500/700-weight for one-of-one, muted gray 400-weight for available (visually silent). Sold pieces stay in the archive; never red, never an overlay, never hidden.

## Key Decisions

- **Detail page max content width: 640px** (narrower than D-09's ~720px ceiling — tested and looked better)
- **Hand-display name register: 48px** (Caveat Brush). 64px feels magazine-spread; 88px feels poster. Bluemli reads at 48px.
- **Photo: native aspect ratio**, `--radius-sm` corners, contained in the 640px column, no drop shadow on the detail page.
- **Coral CTA: pill button** at Nunito 800, tucked into the type stack, not sticky and not over-large.
- **Mailto fallback** as small Nunito text directly under the CTA — every CTA has a non-IG alternate path (Pitfall 20).
- **Back link** repeats top and bottom of the detail-page plate.
- **Grid status colors** by enum: `available` = muted-gray 400, `sold` = lavender-500/700, `one-of-one` = olive-500/700, `reserved` = lavender-500/700 (placeholder).
- **Grid layout unchanged from Phase 1** — same 4:5 cards, same `repeat(auto-fill, minmax(240–260px, 1fr))` pattern. Phase 2 just adds the per-status color rules.
- **No new tokens.** Everything pulls from `src/styles/colors_and_type.css`.

## Anti-patterns (avoid)

- Hand-display name larger than 48px on per-piece pages.
- Left-aligned detail page on desktop (reads as magazine spread, not catalog plate).
- "Sold" eyebrow above the piece name (announces sold pieces; brand wants them quiet).
- Combining status into the price line (under-labels available pieces).
- Red stamps, overlays, watermarks, or desaturation on sold photos.
- Hiding sold pieces from the grid.
