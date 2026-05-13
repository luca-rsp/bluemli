---
sketch: 001
name: gallery-detail-composition
question: "What does the editorial detail page composition feel like — where do photo, name, and CTA sit?"
winner: "A"
tags: [detail, layout, type]
---

# Sketch 001: Gallery detail composition

## Design Question

The per-piece detail page at `/gallery/<slug>` is the only new UI surface in Phase 2. The contract is locked (D-09: single column, photo → name → price/status → description → IG CTA → mailto fallback → back link) but the *feel* is open. This sketch asks: how big does the photo want to be, how does the type stack sit beneath it, and how does the coral CTA land without breaking the editorial quiet?

## How to View

```
open .planning/sketches/001-gallery-detail-composition/index.html
```

## Variants

- **A: Centered narrow plate** ★ — 640px max, everything centered (back link, photo, name, meta, description, CTA). Most quiet, most catalog-plate-like. Photo at native aspect ratio, contained.

## Winner

**Variant A** — centered narrow plate. The 640px contained column gave the photo room to breathe without making it shout, kept the hand-display name in a reasonable register (Caveat Brush at 48px feels like Bluemli; 88px in C felt like a poster, not a catalog plate), and let the coral CTA sit confidently without dominating. This becomes the template for `/gallery/<slug>` and every future per-piece page.

### Key visual decisions captured
- **Max content width: 640px** for the detail-page plate (narrower than D-09's ~720px ceiling — tested and looked better).
- **Photo at native aspect ratio**, contained within the 640px column, with `--radius-sm` (8px) corners.
- **Hand-display name (Caveat Brush) at `--fs-3xl` (48px)**, coral-500, centered.
- **Meta row** (price + status badge) centered, Nunito `--fs-lg` (22px), price 800-weight indigo-700, status as small olive eyebrow caps.
- **Description**: Nunito body, `--fs-md` (18px), `--lh-loose`, centered, max ~520px width.
- **CTA**: coral-500 pill button, full Nunito 800-weight, centered. Mailto fallback as small Nunito text below.
- **Back link repeats** top + bottom (above photo and after CTA).
- **B: Left-aligned plate** — 720px content rail aligned to the left of a 960px page. Hand-display name larger (64px). Reads like a printed catalog page or a magazine spread, where the spine is on the left. Price + status use a `·` divider.
- **C: Photo-dominant, tight stack** — 720px page, photo with a soft drop shadow to anchor it as the hero, then a *very* large hand-display name (88px), a Caveat-handwritten "(one of one)" aside, tighter centered meta and description, CTA larger and more emphatic. Photo and type both get bigger and the plate gets shorter overall.

## What to Look For

- **Photo↔name relationship.** Does the name sit comfortably beneath the photo, or does it need more breathing room (A has the most, C the least)?
- **Hand-display weight.** Caveat Brush at 48px (A), 64px (B), and 88px (C) reads very differently. Which one feels like Bluemli and not like a children's book or a tattoo shop?
- **CTA presence.** Coral button at three different sizes against three different type stacks. Does the "confident but tucked" CTA feel land in any of them, or does it shout / vanish?
- **Sold state read-through.** Click the status text to imagine it as `Sold` in muted indigo — does the plate still feel like a piece-with-a-life, or does it read as broken inventory?
- **Mobile.** Use the toolbar (bottom-right) to switch to `phone`. The locked contract says photo is full-viewport-width on mobile — variant B's content rail collapses to full width too, but the left-alignment vs centered tension may matter less.
