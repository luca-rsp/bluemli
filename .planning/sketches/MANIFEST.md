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
| 006 | say-hi-ig-link-page | What's the visual register of a one-screen IG-link page with no form? | A — Hero-style: Caveat Brush headline (no eyebrow), Caveat sub-tagline, single coral pill IG button, mailto text below | say-hi, contact, ig-link |

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

### Landing pop-up mini-callout (from Sketch 003-C) — Phase 3 D-02/D-03/D-05
- Below Hero, above featured pieces. Centered, max 640px column.
- Eyebrow: **handwritten** "next pop-up" in `--font-hand` (Caveat) at `--fs-xl` (28px), color `--color-accent-leaf` (olive-500), rotated **-1.5°**. Not Caveat Brush — the looser sibling.
- When-line: Nunito `--fs-xl` (28px), 800-weight, format `<weekday>, <month> <day> — <venue>`, with venue in `--coral-500`. Em-dash separator (not "·") matches the handwritten eyebrow's looser feel.
- Time line: Nunito `--fs-sm` (16px), `--color-fg-muted`, format `<start>–<end>`.
- "see all upcoming pop-ups →" link beneath, **only when 2+ upcoming**. Nunito `--fs-xs` (14px), 700-weight, `--coral-500`. Hover slides arrow +2px.
- Zero upcoming → the entire section is omitted from the page (D-03).

### `/popups` page composition (from Sketch 004-A) — Phase 3 D-06/D-07/D-08/D-09
- **Soonest upcoming:** full `PopupStrip` JSX retained (with D-09 fix — no "book by appointment" CTA).
- **Centered 720px column** for the rest of the page (no full-bleed).
- **ALSO COMING UP** (only when 2+ upcoming): section eyebrow centered (`--fs-xxs` caps olive). Rows are Nunito `--fs-md` (18px), 700-weight, **separated by hairline `--color-border-soft` rule lines** (top + last-of-type bottom). Format: `<weekday>, <month> <day> · <venue> · <time>`. Time is Nunito 400-weight muted.
- **PAST pop-ups:** section eyebrow centered. Tight muted text list (Nunito `--fs-sm` 14px, `--color-fg-muted`, 400-weight), no rule lines, format: `<weekday>, <month> <day> · <venue>, <city>`. Venue color upgrades to `--color-fg` for scannability.
- **Empty state (zero upcoming + zero past):** centered "POP-UPS" eyebrow + 2-line `--fs-lg` (22px) `--lh-loose` copy with the IG handle as a coral underlined link. Header + footer render normally; no hand-display headline.
- Page renders no photos in PAST (D-07 reaffirmed).

### `/about` photo strip (from Sketch 005-B) — Phase 3 D-14/D-15/D-16/D-25
- Existing About text block stays as-is structurally; D-13 copy + D-16 signature + D-25 NOPA casing applied.
- **Below the signature:** photo strip in the **same 720px column** as the text (not full-bleed).
- 3 columns, `--space-4` (16px) gap, **`aspect-ratio: 1 / 1`** (square), `--radius-sm` (8px) corners.
- Source photos: existing gallery hero WebPs at `/gallery/<slug>/hero-800.webp` (D-14 — no new photography). Claude picks the 3 during execution for visual balance.
- Falls back gracefully when fewer than 3 pieces exist: render whatever is available (1 or 2 photos in the same grid) — the grid does not collapse to 1:1 with empty cells.
- Photos have meaningful alt text via the existing `image()` schema. Brand-rule grep applies (no `flower|petal|floral|bloom|blossom`).

### `/say-hi` IG-link page (from Sketch 006-A) — Phase 3 D-18
- Centered single column, max 720px, `min-height: 540px` so the stage doesn't sit awkwardly mid-viewport.
- **No eyebrow.** The page leads with the headline directly.
- Headline: Caveat Brush "say hi" at `clamp(56px, 9vw, 96px)`, `--coral-500`, line-height 1.
- Sub-tagline: Caveat "let's talk earrings" at `--fs-xl` (28px), `--color-fg-strong`.
- IG button: coral-500 **pill** (`--radius-pill`), Nunito 800, `--fs-md` (18px), padding `--space-3 --space-6`. Right-arrow `→` glyph with +3px hover slide. Links to `ig.me/m/studiobluemli`.
- Mailto fallback: small Nunito `--fs-sm` (16px) `--color-fg-muted` text beneath the button: `or email hi@studiobluemli.com` (the email itself coral and underlined).
- No `<form>`, no Turnstile, no Worker endpoint. `AppointmentForm.jsx` stays in `src/components/design-skill/` unused (D-21).

## Open Questions

- **Reserved state** — CNT-04 enum has `available | sold | one-of-one | reserved`, but the seed content only uses three of them. Phase 2 planner should pick a treatment for `reserved` consistent with sold (likely lavender-500 too, copy "Reserved").
- **Detail page sold-state copy** — D-11 locks the CTA copy flip ("This pair sold — DM me about something similar"). Sketch 001-A demonstrated the *layout*; the planner should verify the sold variant of the same plate doesn't need any visual adjustment beyond status color + CTA text swap.
- **Mini-callout em-dash vs dot** — Sketch 003-C uses an em-dash between date and venue (`Saturday, June 7 — Heath Ceramics`); D-02 originally specified `·`. Planner can keep em-dash (better with the handwritten eyebrow) or revert to `·` for consistency with PopupStrip's `Date · Time`. Em-dash recommended.
- **`/popups` ALSO COMING UP threshold** — Sketch 004-A shows the section only appears with 2+ upcoming (matching landing mini-callout). Confirm in planning: with exactly 1 upcoming, the page is PopupStrip + PAST list only, no empty ALSO COMING UP section.
- **About photo-strip with <3 pieces** — Sketch 005-B assumes 3 photos. When the gallery has only 1 or 2 published pieces, render that count in the same grid (1 column or 2 columns auto-sized). Lock the fallback rule in planning.
