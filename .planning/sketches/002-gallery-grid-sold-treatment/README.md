---
sketch: 002
name: gallery-grid-sold-treatment
question: "How does 'Sold' read in the gallery grid so it feels editorial, not broken?"
winner: "A"
tags: [grid, badge, sold-state]
---

# Sketch 002: Gallery grid sold treatment

## Design Question

CNT-10 + D-11 lock the principle: sold pieces stay visible in the gallery (they're part of the portfolio archive), labeled in **muted indigo as a quiet editorial badge — never a red stamp**. But "where does the badge sit and what's it paired with" is still open. With a grid of mixed `available` / `sold` / `one-of-one`, we want the page to read as one editorial plate of work, not a thinned-out inventory display.

## How to View

```
open .planning/sketches/002-gallery-grid-sold-treatment/index.html
```

## Variants

All three show the same six pieces (`coral`, `cobalt`, `blush`, `lavender`, `saffron`, `sage`) — two sold, one one-of-one, three available — so you can see how the treatments balance across a real-world mix.

- **A: Status bottom-right of card** ★ — keeps the existing Phase 1 `GalleryGrid.jsx` pattern. Price left, status right on the meta line. Sold = lavender-500. One-of-one = olive-500. Available = warm-gray (no extra weight).

## Winner

**Variant A** — status bottom-right of card. The existing Phase 1 pattern reads correctly once the sold/one-of-one variants are styled with intent (lavender-500 / olive-500 with the same weight as the price). The grid stays a single editorial plate; the eye doesn't snag. B's eyebrow felt like it was *announcing* sold pieces (too loud for "quiet editorial archive"); C's combined caption made available pieces feel under-labeled.

### Key visual decisions captured
- **Card structure unchanged from Phase 1 `GalleryGrid.jsx`** — 4:5 photo, name, price ↔ status meta row.
- **Status pairing on the same meta line as price** — Nunito `--fs-xs` (14px), price left (700-weight, indigo-700), status right.
- **Sold status: lavender-500 (#9B85B5), 700-weight** — quiet, intentionally muted, never red.
- **One-of-one status: olive-500 (#6E7438), 700-weight** — sits in the "place / grounding" register.
- **Available status: warm gray (`--color-fg-muted`), 400-weight** — present so the rhythm of the meta row stays consistent, but visually silent.

### Implementation note for Phase 2 planning
The current `src/components/design-skill/GalleryGrid.jsx` already renders this exact layout (price left, status right). Phase 2's planner needs to extend the status text styling: today the JSX renders all status values in the same `--color-fg-muted` color. The planner should add per-status color (`color: var(--lavender-500)` for sold, `color: var(--olive-500)` for one-of-one, `font-weight: 700` for non-available) — either via inline styles in the JSX or via a scoped class.
- **B: Muted-indigo eyebrow above name** — a small all-caps eyebrow above the piece name, lavender-500 for sold, olive-500 for one-of-one, hidden (but space-reserved) for available. Reads like an editorial section label. Sold cards also dim the name to muted-gray.
- **C: Status + price combined caption** — single Nunito-600 caption line beneath the name: `$48` for available; `Sold · $52` for sold pieces; `One of one · $54` for unique. Cleanest, single-line, but status disappears for available pieces entirely.

## What to Look For

- **Grid coherence.** Scan the whole grid at once. Does the sold treatment make the grid feel quiet and editorial, or does the eye keep snagging on the sold cards (in a bad way)?
- **Status hierarchy.** A surfaces status as a right-side meta with equal weight to price. B promotes it above the name. C absorbs it into a caption line. Which feels right for "sold pieces stay visible as part of the portfolio"?
- **Available-state silence.** D-11 implies available pieces shouldn't *advertise* availability — it's the default. Does any variant make "Available" feel noisy?
- **One-of-one.** It's a CNT-04 enum value but rare. Does the treatment scale to it without feeling like a fourth thing to learn?
- **Mobile.** Use the toolbar to switch to `phone`. Cards stack single-column; the badge/caption real estate becomes more precious.
