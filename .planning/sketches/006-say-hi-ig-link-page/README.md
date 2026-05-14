---
sketch: 006
name: say-hi-ig-link-page
question: "What's the visual register of a one-screen IG-link page with no form?"
winner: "A"
tags: [say-hi, contact, ig-link, no-form]
---

# Sketch 006: /say-hi IG-link page

## Design Question

D-18 drops the contact form from v1 entirely. `/say-hi` becomes a small page with an Instagram DM link and a mailto fallback — no form, no fields, no Worker endpoint. What visual register makes that page feel **intentional** rather than **empty**?

Anchored decisions:
- D-18 — surface: "SAY HI" + "let's talk earrings" + IG DM link + "or email hi@studiobluemli.com".
- D-21 — `AppointmentForm.jsx` stays in the codebase, unused.
- No `<form>`, no Turnstile, no Worker endpoint.

## How to View

```
open .planning/sketches/006-say-hi-ig-link-page/index.html
```

Each variant renders the full page (header + content + footer) so you can judge density and visual weight in context.

## Variants

- **A: Hero-style** ★ winner — Caveat Brush headline at clamp(56–96px) (Hero weight), Caveat sub-tagline 28px, single coral pill IG button, mailto small text below. **Refined:** dropped the "SAY HI" eyebrow because it duplicated the "say hi" headline.
- **B: ultra-minimal text** — Caveat Brush at 48px, two short sentences with inline links, no button. Lowest weight, highest risk of "is this page finished?".
- **C: two stacked button-links** — Caveat Brush 64px headline + eyebrow + two equal-weight pill links (coral fill + coral outline) treating IG and email as two equal doors.

## What to Look For

- **A** mirrors the landing Hero's visual scale — does that feel intentional, or like the page is overclaiming for a single CTA?
- **B** is the quietest — does it read as warm-and-confident or as **page not built yet**?
- **C** elevates email to equal-with-IG — true to how the founder thinks about it, or does it dilute the IG-first preference?
- Mobile: does the page feel like it earns the full viewport, or sit awkwardly in the middle of the screen?
- Is the **language** still founder-voice (sentence-case, warm, no exclamation marks)?
