---
sketch: 003
name: landing-popup-callout
question: "How quiet does the 'NEXT POP-UP' callout need to be so it doesn't compete with the 88px Hero headline?"
winner: "C"
tags: [landing, popup, callout, mini-section]
---

# Sketch 003: Landing pop-up mini-callout

## Design Question

The landing page renders the next pop-up as a quieter mini-callout, **not** the full `PopupStrip` (which lives on `/popups`). What is the right visual register so it reads as "useful info, glance and move on" rather than competing with the Hero or pretending to be the page's main event?

Anchored decisions (Phase 3):
- D-02 — mini-callout has eyebrow + single-line `<weekday>, <month> <day> · <venue>` + time line.
- D-03 — when zero upcoming pop-ups exist, the entire section is omitted.
- D-05 — no embedded CTA in the callout; only a "see all upcoming pop-ups →" link **when 2+ upcoming** exist.

## How to View

```
open .planning/sketches/003-landing-popup-callout/index.html
```

Each variant renders a faux-Hero above the callout so you can see the size contrast. Each variant also shows two scenarios stacked: **1 upcoming** (no "see all" link) and **3 upcoming** (with "see all" link).

## Variants

- **A: editorial caption-block** — Pure type, centered. Nunito caps eyebrow + Nunito 22px-bold when-line + Nunito 16px muted time. No band, no border, no photo. Quietest of the three.
- **B: cream-stripe band** — Full-bleed `--cream-200` band (one tone darker than the page background) with eyebrow + when + time inline on one row. Reads as a distinct section without a hard border.
- **C: Caveat eyebrow, no chrome** — Handwritten "next pop-up" eyebrow in `--font-hand` (Caveat at 28px, ~1.5° tilt) over the same when/time lines, venue colored coral. Adds personality without volume.

## What to Look For

- Does the eyebrow read as a *helpful label* or a *competing headline* against the Hero above?
- The when-line should be **scannable in <1 second** — it's the whole point of being on the landing page.
- The "see all upcoming pop-ups →" affordance needs to feel like it belongs to the callout but not pull more attention than the callout itself.
- Test in both scenarios — variants behave differently when the "see all" link is present.
- Edge: does the callout still make sense if the venue name is long ("San Francisco Center for Independent Living Holiday Market") or wraps onto two lines?
