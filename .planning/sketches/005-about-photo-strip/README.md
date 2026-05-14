---
sketch: 005
name: about-photo-strip
question: "What does the closing photo flourish look like under 'made with love from NOPA ♡'?"
winner: "B"
tags: [about, photos, layout, closing-visual]
---

# Sketch 005: /about photo strip

## Design Question

D-15 extends `About.jsx` with **a row of 1–3 product-hero photos as a closing visual flourish** below the signature. D-14 reuses gallery hero WebPs (no founder face, no dedicated process shots). Where on the photo-count and containment spectrum does the strip feel right — full editorial band, contained square trio, or single hero image?

Anchored decisions:
- D-14 — no dedicated process/craft shots; reuse 1–3 existing gallery hero WebPs.
- D-15 — eyebrow → headline → paragraphs → signature → photo strip.
- D-16 — signature reads `made with love from NOPA ♡`.
- D-25 — NOPA in caps in body copy.

## How to View

```
open .planning/sketches/005-about-photo-strip/index.html
```

Each variant renders the full About page (eyebrow + Caveat Brush headline + 2 paragraphs + signature) above the photo strip so you can judge how the strip lands as a closing element.

## Variants

- **A: 3 edge-to-edge, full bleed** — three 4:5 photos no gap, no rounded corners, full viewport width. Reads as a closing band, like the colophon of an editorial spread.
- **B: 3 contained with gap** — three 1:1 squares inside the 720px text column, small gap, `--radius-sm` corners. Part of the page flow, more intimate.
- **C: single hero photo** — one 16:9 image inside the 720px column. Quietest; lowest D-14 risk (only needs one good photo).

## What to Look For

- Does the strip feel like **a closing image** or like the page is sprouting a second section?
- Edge-to-edge (A) is dramatic; contained (B/C) is restrained — which matches the editorial register from sketch-findings-bluemli?
- Number of photos: does 3 feel curated or like a quilt? Does 1 feel deliberate or like content is missing?
- The strip needs to work with the **existing** WebPs (no new photo shoot) — does it forgive when only 1 piece is published?
