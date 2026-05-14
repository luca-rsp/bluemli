---
sketch: 004
name: popups-page-composition
question: "How do the three pop-up states (full prominent + ALSO COMING UP + PAST + empty) co-exist on one editorial page?"
winner: "A"
tags: [popups, layout, list, empty-state]
---

# Sketch 004: /popups page composition

## Design Question

The `/popups` page renders the **full PopupStrip** for the soonest upcoming, an **ALSO COMING UP** compact list for additional upcoming events, and a **PAST** text-only archive at the bottom (D-06, D-07). Plus the empty state when there's nothing in either list (D-08). What layout makes those three (or four, counting empty) states feel like one coherent editorial page rather than three disjoint sections?

Anchored decisions (Phase 3):
- D-06 — full PopupStrip for soonest + "ALSO COMING UP" compact list (one line each: `<weekday> <date> · <venue> · <time>`) + "PAST" text list (`<weekday> <date> · <venue>, <city>`).
- D-07 — past archive is text-only; the optional `photos` schema field is NOT rendered in v1.
- D-08 — empty-state copy: centered "POP-UPS" eyebrow + "No pop-ups on the calendar yet — follow @studiobluemli for the next one."
- D-09 — `PopupStrip` no longer has the "book by appointment" CTA. Both variants reflect this.

## How to View

```
open .planning/sketches/004-popups-page-composition/index.html
```

Each variant shows three scenarios stacked:
1. **1 upcoming + 4 past** — typical day-after-pop-up state.
2. **1 upcoming + 3 also coming up + 6 past** — busy season.
3. **Empty (zero upcoming + zero past)** — day-one shipping state (the content folder is empty).

## Variants

- **A: indented compact lists** — Centered narrow column (~720px). ALSO COMING UP rows are 18px bold Nunito separated by hairline rule lines; PAST is a tight muted text list with no rules. Generous breathing room; one quiet editorial archive.
- **B: table-rows + 2-column past** — Full-width layout. ALSO COMING UP becomes a 3-column row (date / venue / time-right-aligned) — scans like a tour schedule. PAST collapses to two dense columns so a year-deep archive doesn't dominate. Mobile gracefully collapses both to single columns.

## What to Look For

- Does the **transition from PopupStrip (loud) to ALSO COMING UP (quiet)** feel intentional, or does the page drop off a cliff?
- ALSO COMING UP is the "I want to plan ahead" affordance — can a visitor scan dates in <2 seconds?
- PAST is archive — does it sit comfortably as a tail, or does it draw too much attention?
- Empty state: does it read as **a deliberate quiet state** or as a missing page?
- How does the busy scenario (3 upcoming + 6 past) feel — still editorial, or starting to look like a calendar app?
- Phone-first check: scroll through on a narrow viewport mentally; both should still read cleanly.
