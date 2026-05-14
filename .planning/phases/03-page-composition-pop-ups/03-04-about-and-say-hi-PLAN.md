---
phase: 03-page-composition-pop-ups
plan: 04
type: execute
wave: 3
depends_on: ["03-01", "03-02"]
files_modified:
  - src/pages/about.astro
  - src/components/design-skill/About.jsx
  - src/pages/say-hi.astro
autonomous: true
requirements: [PAG-05, PAG-06, PAG-09]
must_haves:
  truths:
    - "/about renders: ABOUT THE STUDIO eyebrow → Caveat Brush headline (coral) → 2–3 brand-voiced body paragraphs (no flower vocab, NOPA in caps, no emoji other than ♡) → 'made with love from NOPA ♡' signature (♡ in coral) → photo strip of 1–3 gallery pieces' hero-800.webp images."
    - "/about photo strip uses existing gallery hero-800.webp variants (no new prebuild step per D-14); each <img> has alt={piece.data.name} and loading='lazy'. Per Concern 13, the strip uses CSS aspect-ratio 1/1 (no width/height attributes) — documented deviation from UI-SPEC since the strip is below-fold and the LCP-sensitive surface is /gallery/[slug] (which sets explicit dimensions)."
    - "/about has NO founder face, NO existing-press section, NO empty placeholders. The about.astro source has zero matches for the regex `press|featured in|as seen in` (Concern 10: source comments rewritten to avoid those tokens)."
    - "/say-hi renders: Caveat Brush 'say hi' headline (clamp 56–96px, coral) → 'let's talk earrings' sub (Caveat 28px) → 'DM me on Instagram →' coral pill button → 'or email hi@studiobluemli.com' mailto fallback."
    - "/say-hi has NO <form> element, NO AppointmentForm import, NO submit button (D-18 / D-21). AppointmentForm.jsx file remains in src/components/design-skill/ untouched."
    - "Both pages drive <title> via <BaseLayout title='...'> (Concern 4: BaseLayout owns <title>); both wire <SEO slot='head' /> with canonical-to-apex + og:image fallback."
  artifacts:
    - path: "src/pages/about.astro"
      provides: "About page composition with text block, signature, photo strip"
      contains: "about-photo-strip"
    - path: "src/components/design-skill/About.jsx"
      provides: "Updated text block (D-13 copy rewrite + D-16 signature + still-includes Plan 01 NOPA fix)"
      contains: "made with love from NOPA"
    - path: "src/pages/say-hi.astro"
      provides: "IG-link + mailto page (no form)"
      contains: "DM me on Instagram"
  key_links:
    - from: "src/pages/about.astro"
      to: "src/components/design-skill/About.jsx"
      via: "imports About and renders <About /> for the text block; about.astro adds the photo strip inline"
      pattern: "import About from"
    - from: "src/pages/about.astro"
      to: "public/gallery/<slug>/hero-800.webp"
      via: "photo strip <img src> URLs reference Phase 2 prebuild output"
      pattern: "/gallery/.*hero-800.webp"
    - from: "src/pages/say-hi.astro"
      to: "src/content/site/config.yaml"
      via: "renders site.ig_dm_url + site.contact_email"
      pattern: "site.ig_dm_url"
---

<objective>
Compose the two remaining narrative pages: `/about` (founder portrait + photo strip) and `/say-hi` (IG-link + mailto, no form). Both honor the D-13..D-18 + D-21..D-23 decisions and the UI-SPEC §/about + §/say-hi layouts.

Purpose: This is the v1 scope cut surfacing — `/say-hi` shrinks from a contact-form page to a small IG-link page (D-18), and `/about` ships with a Claude-drafted brand-voiced placeholder portrait (D-13) that the founder edits later via the GitHub web UI. Both pages also wire `<SEO />` (PAG-07) per the Plan 02 contract.

**REVIEWS-MODE FIXES (this plan addresses 4 Codex concerns):**

1. **Concern 4 (HIGH) — `<title>` regression.** Plan 02 keeps BaseLayout's `<title>{title}</title>` and the `<SEO />` component does NOT emit `<title>`. So this plan's pages MUST pass title via `<BaseLayout title="...">` (which they already do per the original plan; verified in this rewrite).

2. **Concern 8 (MEDIUM) — Grep chains break on zero matches.** All "expect zero" verifications use `! grep -q PATTERN file` or `grep -c PATTERN file || true` to avoid shell-chain failure.

3. **Concern 9 (MEDIUM) — Astro frontmatter leading-space delimiter.** When the executor TRANSCRIBES Astro code from this plan into the actual source file, the `---` frontmatter delimiter lines MUST be at column 0. Inside this plan's markdown code blocks the `---` lines are shown with ONE leading space — this is a markdown-rendering safety device (it prevents the GSD frontmatter parser from latching onto the inner sample as if it were the file's real frontmatter). The executor MUST strip that leading space when writing the file.

4. **Concern 10 (MEDIUM) — about-page verification contradicts its own source comment.** Original plan included a source comment containing "no press section" (matched by the verification regex `press|featured in|as seen in`). Resolution: rewrite the source comment to avoid those literal tokens — use phrasing like "intentionally omits any 'as featured' placeholder" → reworded to "deliberately omits any retrospective-mention block" (so no token from the regex appears). **REVISION-MODE follow-up:** the explanatory comment INSIDE the about.astro template was itself rewritten to avoid naming the disallowed tokens, so the transcribed source file passes the grep gate cleanly.

5. **Concern 13 (LOW) — Photo strip image dimensions.** UI-SPEC asks for explicit width/height attributes on the photo strip `<img>` tags; the original plan relied on CSS `aspect-ratio: 1 / 1`. This is documented as an INTENTIONAL deviation: the strip is below-fold, the cells are responsive (auto-fit grid), and modern browsers honor `aspect-ratio` for CLS prevention. Adding fixed width/height would conflict with the responsive grid. The LCP-sensitive surface is `/gallery/[slug]` (which uses Astro's Image component with explicit dimensions); `/about`'s photo strip is decorative.

Output (3 files modified, 0 new):
- `src/pages/about.astro` — extended with photo strip below the About component, scoped CSS, `<SEO />` wired. Source comments rewritten to avoid the disallowed-mention tokens enumerated by this page's grep gate (Concern 10).
- `src/components/design-skill/About.jsx` — body copy rewritten per D-13 voice rules; signature swapped to "made with love from NOPA ♡" (D-16); existing Plan 01 NOPA fix preserved.
- `src/pages/say-hi.astro` — `AppointmentForm` import dropped (file remains per D-21); replaced with a centered IG button + mailto fallback per UI-SPEC §/say-hi; `<SEO />` wired.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-page-composition-pop-ups/03-CONTEXT.md
@.planning/phases/03-page-composition-pop-ups/03-RESEARCH.md
@.planning/phases/03-page-composition-pop-ups/03-PATTERNS.md
@.planning/phases/03-page-composition-pop-ups/03-UI-SPEC.md
@.planning/phases/03-page-composition-pop-ups/03-REVIEWS.md
@.planning/phases/03-page-composition-pop-ups/03-01-SUMMARY.md
@.planning/phases/03-page-composition-pop-ups/03-02-SUMMARY.md
@.claude/skills/studio-bluemli-design/SKILL.md
@.claude/skills/studio-bluemli-design/README.md
@.claude/skills/sketch-findings-bluemli/SKILL.md
@CLAUDE.md
@src/pages/about.astro
@src/pages/say-hi.astro
@src/pages/gallery/[slug].astro
@src/components/design-skill/About.jsx
@src/content/site/config.yaml
@src/content.config.ts

<interfaces>
About.jsx current shape (POST Plan 01 NOPA fix — body paragraph already says "NOPA, San Francisco"):
```jsx
function About() {
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '64px 32px 32px', textAlign: 'center' }}>
      <div className="eyebrow" style={{...}}>about the studio</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 56, color: 'var(--coral-500)', ... }}>
        hand-assembled, one&nbsp;pair at&nbsp;a&nbsp;time
      </h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.55, color: 'var(--indigo-500)', maxWidth: 560, margin: '0 auto 28px', textWrap: 'pretty' }}>
        I make earrings out of a little studio in NOPA, San Francisco — sourced glass, seed beads, vintage findings.
        Every pair is one-of-a-kind, and once it's gone, it's gone.
      </p>
      <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--ink-600)', fontFamily: 'var(--font-hand)', fontSize: 18 }}>
        — the founder <Mark.Heart color="var(--coral-500)" />
      </div>
    </section>
  );
}
```
Edits this plan makes to About.jsx:
1. The body `<p>` paragraph is rewritten per D-13 voice rules (sentence-case, friendly parentheticals, NOPA in caps, no emoji other than ♡, no flower vocab). 2-3 paragraphs covering: origin story, the earring-making process, NOPA studio.
2. The signature line `— the founder <Mark.Heart />` is changed to `made with love from NOPA <Mark.Heart />` (D-16).
3. The h2 headline inner text changes from `hand-assembled, one pair at a time` (6 words — out of spec) to `made by hand` (3 words — UI-SPEC §Copywriting Contract → /about explicit example). All h2 styling (font-family: var(--font-display), font-size: 56, color: var(--coral-500)) is preserved exactly; only the text node changes.
4. The eyebrow is PRESERVED (`about the studio` — already 1-4 words lowercase per the eyebrow contract).

Mark.Heart contract (from src/components/design-skill/Mark.jsx — referenced by About.jsx):
- It's an SVG glyph component accepting `color` prop. Renders the ♡ shape. Existing usage in About.jsx is `<Mark.Heart color="var(--coral-500)" />` — preserved.

About photo strip layout (UI-SPEC §/about):
- `.about-photo-strip` — max-width 720px, centered, padding `0 var(--space-5) var(--space-8)`, margin-top `var(--space-8)`.
- CSS grid: `grid-template-columns: repeat(3, 1fr)` (or `repeat(auto-fit, minmax(0, 1fr))` for fewer-than-3 fallback per UI-SPEC), gap `var(--space-4)`.
- Each cell: `aspect-ratio: 1 / 1`, `border-radius: var(--radius-sm)`, `background-color: var(--cream-200)`, `object-fit: cover`.

**Concern 13 deviation note:** UI-SPEC also asks for explicit width/height attributes on the `<img>` tags. We deviate: the strip cells are responsive (auto-fit grid), so fixed width/height would conflict; modern browsers handle CLS prevention via `aspect-ratio: 1 / 1` on the CSS rule. The strip is also below-fold (after the entire About text block), so it is not the LCP candidate — that's `/gallery/[slug]`, which uses Astro's `<Image />` with explicit dimensions. Documented deviation; UI-SPEC stays as-is for the gallery surface.

Available gallery slugs (verified at planning time via `ls src/content/gallery/`): `cluster-blush`, `cluster-cobalt`, `cluster-coral`, `cluster-lavender`, `cluster-saffron`, `cluster-sage`. Plan picks 3 for visual color balance during execution.

`/say-hi` layout (UI-SPEC §/say-hi):
- `.say-hi-stage` — max-width 720px, min-height 540px, centered, flex column, center-aligned.
- Vertical order: h1 (Caveat Brush, clamp(56px,9vw,96px), coral) → p.sub (Caveat 28px, color-fg-strong) → a.ig-button (coral pill, Nunito 800 18px) → p.mailto (Nunito 400 16px, muted, with email in coral underlined).
- No eyebrow (UI-SPEC explicitly: headline leads directly).
- IG button: `background: var(--coral-500)`, `border-radius: var(--radius-pill)`, `padding: var(--space-3) var(--space-6)`. Hover `--coral-700`; arrow `→` slides +3px on hover.

`<SEO />` props for these pages (post-Concern-4 fix from Plan 02):
- /about: `<SEO slot="head" title="About — Studio Bluemli" pathname="/about" />` (title is OPTIONAL — used for og:title; the actual `<title>` tag is owned by `<BaseLayout title="...">`)
- /say-hi: `<SEO slot="head" title="Say Hi — Studio Bluemli" pathname="/say-hi" />`
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Rewrite About.jsx body copy (D-13) and signature (D-16)</name>
  <read_first>
    - src/components/design-skill/About.jsx (current state — already has NOPA from Plan 01 Task 2 Edit 2)
    - .planning/phases/03-page-composition-pop-ups/03-CONTEXT.md (D-13: Claude drafts placeholder; D-16: exact signature phrase; D-17: no press)
    - .planning/phases/03-page-composition-pop-ups/03-UI-SPEC.md §Copywriting Contract §/about copy (D-13 voice spec: eyebrow lowercase in markup with CSS uppercase, 1–4 word headline, 2–3 paragraphs with parentheticals/NOPA-caps/no-emoji/no-flower-vocab)
    - .claude/skills/studio-bluemli-design/README.md (voice rules: warm, casual, founder-first, sentence-case, friendly parentheticals, no emoji, ♡/♥ only)
    - .claude/skills/studio-bluemli-design/SKILL.md (brand non-negotiable: no flower vocabulary anywhere in copy)
  </read_first>
  <behavior>
    - About.jsx renders the same DOM structure: a `<section>` with eyebrow + h2 headline + body paragraphs + signature row.
    - Body paragraphs (2-3 of them) cover: (a) origin/setup story, (b) the earring-making process, (c) NOPA studio context. Tone is first-person, warm, sentence-case, with at least one friendly parenthetical aside. NOPA appears in caps. No emoji other than ♡. No words flower / petal / floral / bloom / blossom.
    - The headline is rewritten from the current 6-word "hand-assembled, one pair at a time" to a 1–4 word brand-voiced phrase per UI-SPEC §Copywriting Contract → /about. The locked target is `made by hand` (UI-SPEC explicitly lists this as the example). The Caveat Brush 56px coral styling is preserved exactly; only the h2 inner text changes.
    - The eyebrow stays "about the studio".
    - The signature row changes from `— the founder <Mark.Heart />` to `made with love from NOPA <Mark.Heart />` (D-16). The `<Mark.Heart color="var(--coral-500)" />` is preserved adjacent to the text.
    - All style objects are preserved exactly.
  </behavior>
  <action>
**Edit `src/components/design-skill/About.jsx`:** Use the Edit tool. Three edits.

**Edit (a) — Replace the body `<p>` paragraph (currently lines 18-25) with a longer Claude-drafted portrait.** The existing `<p>` has these exact style attributes that MUST be preserved on the first paragraph of the replacement; subsequent paragraphs reuse the same `<p style={...}>` shape. The full replacement target (you may slightly polish the prose, but the constraints below are binding):

```jsx
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.55,
        color: 'var(--indigo-500)', maxWidth: 560, margin: '0 auto 22px',
        textWrap: 'pretty',
      }}>
        I make earrings out of a tiny studio in NOPA, San Francisco. It started
        as a way to keep my hands busy in the evenings (and to use up a growing
        pile of glass beads I couldn't stop buying), and it slowly turned into
        something I look forward to every day.
      </p>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.55,
        color: 'var(--indigo-500)', maxWidth: 560, margin: '0 auto 22px',
        textWrap: 'pretty',
      }}>
        Each pair is hand-assembled — sourced glass, seed beads, vintage
        findings, and the occasional charm I've been saving for the right
        cluster. Nothing is mass-produced. Once a pair is gone, it's gone.
      </p>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.55,
        color: 'var(--indigo-500)', maxWidth: 560, margin: '0 auto 28px',
        textWrap: 'pretty',
      }}>
        I sell at neighborhood pop-ups around the Bay (and now and then
        further afield) and through DMs on Instagram. If you see a pair you
        love or want to ask about something custom, say hi.
      </p>
```

Required content properties of the rewrite (verifiable via grep):
- The literal string `NOPA` appears at least once in the body copy (D-25).
- The literal word `Instagram` appears at least once (anchoring the say-hi pathway).
- No occurrence of any banned word: `flower`, `petal`, `floral`, `bloom`, `blossom` (case-insensitive).
- No emoji other than `♡` (and `♡` only appears in the signature, not the body).
- At least one friendly parenthetical aside (a parenthesized clause matching `\([^)]+\)`).
- All copy in sentence-case (no all-caps SHOUTING except the proper noun `NOPA`).

**Edit (b) — Replace the signature line (currently lines 27-29):**

Current code:
```jsx
      <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--ink-600)', fontFamily: 'var(--font-hand)', fontSize: 18 }}>
        — the founder <Mark.Heart color="var(--coral-500)" />
      </div>
```

Replace with:
```jsx
      <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--ink-600)', fontFamily: 'var(--font-hand)', fontSize: 22 }}>
        made with love from NOPA <Mark.Heart color="var(--coral-500)" />
      </div>
```

(The font-size bumps from 18 to 22 to match UI-SPEC §/about typography table's `--fs-lg` 22px for the signature row. The `<Mark.Heart>` glyph + coral color are preserved.)

**Edit (c) — Rewrite the h2 headline inner text (currently lines 89-92).** The current h2 reads:

```jsx
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 56, color: 'var(--coral-500)', /* ...rest of style preserved... */ }}>
        hand-assembled, one&nbsp;pair at&nbsp;a&nbsp;time
      </h2>
```

Change the inner text from `hand-assembled, one&nbsp;pair at&nbsp;a&nbsp;time` to:

```
made by hand
```

The h2's style object MUST be preserved byte-for-byte (font-family, fontSize: 56, color: var(--coral-500), and any other style props that are currently there — line-height, margin, letter-spacing, etc.). Only the text content between `<h2 ...>` and `</h2>` is replaced. No `&nbsp;` entities remain.

**Why this changes:** UI-SPEC §Copywriting Contract → /about locks the headline contract as "Caveat Brush headline: 1-4 words, brand-voiced, coral. Example: `made by hand`." The current 6-word headline is out of spec. The plan-checker (W2) flagged this; the rewrite is part of the D-13 copy pass.

**Preserve unchanged:** the `/* eslint-disable */`, the React + Mark imports, the function signature, the outer `<section>` style block, the eyebrow `<div>`, the h2 STYLE OBJECT (only the text node changes), and the default export.

**Concern 10 anti-pattern check (no `press|featured in|as seen in` tokens introduced):** Do NOT add any "as featured in" or "press" or "as seen in" markup OR comments. UI-SPEC §/about photo strip handling lives in `about.astro` (Task 2), not About.jsx. About.jsx must score 0 for `grep -ciE "press|featured in|as seen in" src/components/design-skill/About.jsx`.
  </action>
  <verify>
    <automated>grep -c "made with love from NOPA" src/components/design-skill/About.jsx && (grep -c "— the founder" src/components/design-skill/About.jsx || true) && grep -c "NOPA" src/components/design-skill/About.jsx && (grep -ciE "flower|petal|floral|bloom|blossom" src/components/design-skill/About.jsx || true) && (grep -ciE "press|featured in|as seen in" src/components/design-skill/About.jsx || true) && grep -cE '\([^)]+\)' src/components/design-skill/About.jsx && grep -c "made by hand" src/components/design-skill/About.jsx && (grep -c "hand-assembled, one" src/components/design-skill/About.jsx || true) && npx astro check 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "made with love from NOPA" src/components/design-skill/About.jsx` returns 1 (D-16)
    - `! grep -q "— the founder" src/components/design-skill/About.jsx` exits 0 (old signature replaced)
    - `grep -c "NOPA" src/components/design-skill/About.jsx` returns at least 2 (signature + body mention; D-25 preserved)
    - `! grep -ciqE "flower|petal|floral|bloom|blossom" src/components/design-skill/About.jsx` exits 0 (CI brand grep also enforces this)
    - **Concern 10:** `! grep -ciqE "press|featured in|as seen in" src/components/design-skill/About.jsx` exits 0 (D-17 no press; no comment or content matching these tokens)
    - `grep -cE '\([^)]+\)' src/components/design-skill/About.jsx` returns at least 1 (a parenthetical aside per voice rules)
    - `grep -c "Mark.Heart" src/components/design-skill/About.jsx` returns 1 (heart glyph preserved)
    - `grep -c "Instagram" src/components/design-skill/About.jsx` returns at least 1 (anchoring the say-hi pathway)
    - `npx astro check` exits 0
    - `grep -c "made by hand" src/components/design-skill/About.jsx` returns 1 (W2: UI-SPEC-locked 1-4 word headline)
    - `! grep -q "hand-assembled, one" src/components/design-skill/About.jsx` exits 0 (W2: old 6-word headline gone from the h2 — note that the body paragraph still contains the word `hand-assembled` in descriptive prose, which is correct — that's "Each pair is hand-assembled —", not "hand-assembled, one")
  </acceptance_criteria>
  <done>
    About.jsx body is rewritten per D-13 voice rules, h2 headline is W2-compliant ("made by hand", 3 words), signature is D-16'd, and no brand-rule or D-17 press-token violations introduced.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Extend src/pages/about.astro with the photo strip + SEO wiring (D-14, D-15) — Concern 4 + 9 + 10 + 13 fixes</name>
  <read_first>
    - src/pages/about.astro (current state — Phase 1 placeholder that renders the design-skill About.jsx)
    - src/pages/gallery/[slug].astro (the alt-text + image-attribute pattern at lines 75-82)
    - src/pages/gallery.astro (the `getCollection('gallery')` + sort pattern)
    - .planning/phases/03-page-composition-pop-ups/03-UI-SPEC.md §/about photo strip + Performance/Image Contract
    - .planning/phases/03-page-composition-pop-ups/03-CONTEXT.md (D-14, D-15)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 4: BaseLayout drives <title>; Concern 9: column-0 frontmatter; Concern 10: comments avoid the disallowed-mention tokens enumerated by this page's grep gate; Concern 13: photo dimensions deviation documented)
    - Run `ls src/content/gallery/` during execution to see which slug folders exist (Phase 2 ships 6 seed pieces; verified at planning: cluster-blush, cluster-cobalt, cluster-coral, cluster-lavender, cluster-saffron, cluster-sage)
  </read_first>
  <behavior>
    - `about.astro` renders, in vertical order: Header → `<About />` (the rewritten text block from Task 1) → photo strip (1-3 cells from the gallery collection) → Footer.
    - The photo strip uses the existing `/gallery/<slug>/hero-800.webp` pre-built variants (D-14: no new prebuild step). Each `<img>` uses `loading="lazy"` (UI-SPEC: photos are below the fold) and `alt={piece.data.name}` (Phase 2 alt-text contract).
    - **Concern 13 deviation:** the `<img>` tags do NOT have `width`/`height` attributes; CLS prevention is handled by CSS `aspect-ratio: 1 / 1` on the `.strip-cell` rule. This is an intentional deviation from UI-SPEC's request for explicit dimensions because (a) the cells are responsive (auto-fit grid) so fixed dims conflict, (b) modern browsers honor `aspect-ratio` for CLS prevention, and (c) the strip is below-fold (decorative, not LCP). The LCP-sensitive surface is `/gallery/[slug]`, which sets explicit dimensions via Astro's `<Image />` component.
    - Slug selection: pick up to 3 published pieces from `getCollection('gallery')`. Prefer pieces with `featured: true`; fall back to newest-by-`published_at` if fewer than 3 featured. Different slugs each — no duplicates.
    - If fewer than 3 gallery pieces exist (which would be a misconfiguration since Phase 2 shipped 6 seed pieces, but defensive): render what exists; use CSS `grid-template-columns: repeat(auto-fit, minmax(0, 1fr))` per UI-SPEC fewer-than-3 fallback so no empty cream cells appear.
    - The `<SEO />` component is wired with `<SEO slot="head" title="About — Studio Bluemli" pathname="/about" />`.
    - `<BaseLayout title="About — Studio Bluemli">` drives `<title>` (Concern 4: BaseLayout owns <title>).
    - `prerender = true` preserved.
    - **Concern 9:** column-0 frontmatter delimiters.
    - **Concern 10:** zero source-file matches for `press|featured in|as seen in` (regex from the verification gate).
  </behavior>
  <action>
**Edit `src/pages/about.astro`:** Use the Write tool to replace the entire file. **Concern 9 transcription rule:** the ` ---` lines in the code block below are shown with one leading space (markdown-rendering safety convention to keep the GSD frontmatter parser away from the sample) — strip the leading space when writing the file so `---` lands at column 0. The Astro parser requires column-0 delimiters.

```astro
 ---
// src/pages/about.astro — Phase 3 PAG-05.
// D-13 body copy + D-16 signature live in About.jsx (synced design-skill component).
// D-15 photo strip below the signature; D-14 reuses gallery hero-800 WebPs (no new prebuild).
// D-17 no retrospective-mention block; D-26 wires <SEO /> with canonical-to-apex.
//
// REVIEWS-MODE Concern 4 fix: <BaseLayout title="..."> drives the <title> tag.
// <SEO slot="head" /> only adds canonical/og/twitter (per Plan 02 reconciliation).
//
// REVIEWS-MODE Concern 10 fix: source comments deliberately avoid the
// disallowed-mention tokens enumerated by this page's grep gate (see the
// verify command in this file's plan task). The intent (D-17) is documented
// above as "no retrospective-mention block".
//
// REVIEWS-MODE Concern 13 fix (documented deviation): the photo strip <img>
// tags do NOT carry width/height attributes; CLS prevention uses CSS
// aspect-ratio: 1 / 1 on the .strip-cell rule. The strip is below-fold and
// not the LCP candidate (/gallery/[slug] is, and uses Astro's <Image /> with
// explicit dimensions). UI-SPEC's width/height ask is honored on the gallery
// surface, not here.

export const prerender = true;

import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import SEO from '../components/SEO.astro';
import Header from '../components/design-skill/Header';
import About from '../components/design-skill/About';
import Footer from '../components/design-skill/Footer';

const site = (await getEntry('site', 'default'))!.data;

// PAG-05 / D-14: photo strip reuses /gallery/<slug>/hero-800.webp.
// Pick up to 3 pieces, prefer featured: true, sorted newest-first by published_at.
const allPieces = await getCollection('gallery');
const featuredOnly = allPieces.filter((p) => p.data.featured === true);
const stripSource = featuredOnly.length >= 3 ? featuredOnly : allPieces;
const stripPieces = stripSource
  .slice()
  .sort((a, b) => b.data.published_at.localeCompare(a.data.published_at))
  .slice(0, 3)
  .map((p) => ({ slug: p.id, name: p.data.name }));
 ---
<BaseLayout title="About — Studio Bluemli">
  <SEO slot="head" title="About — Studio Bluemli" pathname="/about" />
  <Header slot="header" active="/about" />

  <About />

  {stripPieces.length > 0 && (
    <section class="about-photo-strip" aria-label="From the studio">
      {stripPieces.map((p) => (
        <img class="strip-cell"
             src={`/gallery/${p.slug}/hero-800.webp`}
             alt={p.name}
             loading="lazy"
             decoding="async" />
      ))}
    </section>
  )}

  <Footer slot="footer" igHandle={site.ig_handle} contactEmail={site.contact_email} />
</BaseLayout>

<style>
  .about-photo-strip {
    max-width: 720px;
    margin: var(--space-8) auto 0;
    padding: 0 var(--space-5) var(--space-8);
    display: grid;
    /* UI-SPEC fewer-than-3 fallback — auto-fit fills available columns without empty cells. */
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: var(--space-4);
  }
  .strip-cell {
    width: 100%;
    /* Concern 13 documented deviation: aspect-ratio drives the cell shape and
       CLS prevention. No <img> width/height attributes (responsive grid). */
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: var(--radius-sm);
    background-color: var(--cream-200);
    display: block;
  }
</style>
```

**Notes:**
- `width: 100%` on `.strip-cell` keeps the cell flexible inside the auto-fit grid. The `aspect-ratio: 1 / 1` enforces the square shape regardless of source image aspect ratio (Phase 2 `hero-800.webp` is portrait/4:5 — the `object-fit: cover` crops correctly to the square).
- No `width`/`height` attributes are set on the `<img>` (Concern 13 documented deviation).
- The alt text comes from `piece.data.name` (Phase 2 pattern); CI grep enforces no flower vocabulary on alt text.
- The `aria-label="From the studio"` on the wrapping `<section>` provides screen-reader context for a strip whose visual purpose isn't conveyed by any heading.
- No JSX styling; all CSS is in the scoped `<style>` block (Astro auto-scopes class names per file).

**Concern 10 verification:** the new file's source comments deliberately use neutral phrasing (e.g. "no retrospective-mention block", "disallowed-mention tokens enumerated by this page's grep gate") instead of naming the actual regex tokens. Verify after writing: `! grep -ciqE "press|featured in|as seen in" src/pages/about.astro` exits 0.

**Concern 9 verification:** the file's `---` delimiters at the very top must be at column 0 (no leading whitespace). Verify: `! grep -nE "^[[:space:]]+---$" src/pages/about.astro` exits 0.
  </action>
  <verify>
    <automated>grep -c "import SEO" src/pages/about.astro && grep -c "import About from" src/pages/about.astro && grep -c "about-photo-strip" src/pages/about.astro && grep -c "hero-800.webp" src/pages/about.astro && grep -c "alt={p.name}" src/pages/about.astro && grep -c 'loading="lazy"' src/pages/about.astro && grep -c '<SEO slot="head"' src/pages/about.astro && grep -c '<BaseLayout title="About' src/pages/about.astro && (grep -ciE "press|featured in|as seen in" src/pages/about.astro || true) && (grep -cE "flower|petal|floral|bloom|blossom" src/pages/about.astro || true) && (grep -cE "border(-top|-bottom|-left|-right)?:\s*1px" src/pages/about.astro || true) && (grep -nE "^[[:space:]]+---$" src/pages/about.astro || true) && npx astro check 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "import SEO" src/pages/about.astro` returns 1
    - `grep -c "import About from" src/pages/about.astro` returns 1
    - `grep -c "about-photo-strip" src/pages/about.astro` returns at least 2 (one in the `<section class>` and one in the `.about-photo-strip` selector)
    - `grep -c "hero-800.webp" src/pages/about.astro` returns 1 (the photo strip src template literal)
    - `grep -c 'alt={p.name}' src/pages/about.astro` returns 1
    - `grep -c 'loading="lazy"' src/pages/about.astro` returns 1
    - `grep -c '<SEO slot="head"' src/pages/about.astro` returns 1
    - **Concern 4:** `grep -c '<BaseLayout title="About' src/pages/about.astro` returns 1 (BaseLayout drives <title>)
    - **Concern 10:** `! grep -ciqE "press|featured in|as seen in" src/pages/about.astro` exits 0 (D-17 + Concern 10: source-file regex returns 0 — no comment, no content matches the disallowed-pattern tokens)
    - **Brand grep:** `! grep -cqE "flower|petal|floral|bloom|blossom" src/pages/about.astro` exits 0 (CI brand grep)
    - **Brand grep:** `! grep -cqE "border(-top|-bottom|-left|-right)?:\s*1px" src/pages/about.astro` exits 0
    - **Concern 9:** `grep -nE "^[[:space:]]+---$" src/pages/about.astro` returns no output (no indented frontmatter delimiters)
    - **Concern 9:** `grep -c "^---$" src/pages/about.astro` returns 2
    - `npx astro check` exits 0
    - After `npm run build`, `grep -c "about-photo-strip" dist/client/about/index.html` returns at least 1 (the section renders if at least 1 gallery piece exists; Phase 2 shipped 6, so this should be guaranteed)
  </acceptance_criteria>
  <done>
    `/about` page renders the rewritten About text block plus a photo strip of up to 3 gallery pieces, drives `<title>` via BaseLayout (Concern 4), wires `<SEO />`, source comments avoid the disallowed-mention regex tokens (Concern 10), photo strip dimensions deviation documented (Concern 13), column-0 frontmatter (Concern 9), passes brand-rule grep.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Rewrite src/pages/say-hi.astro as an IG-link + mailto page (no form) per D-18 — Concern 4 + 9</name>
  <read_first>
    - src/pages/say-hi.astro (current state — Phase 1 placeholder importing AppointmentForm)
    - src/pages/gallery/[slug].astro (lines 91-96 + 162-188 — the CTA stack + mailto fallback pattern, the coral pill button CSS analog)
    - .planning/phases/03-page-composition-pop-ups/03-UI-SPEC.md §/say-hi (complete layout contract)
    - .planning/phases/03-page-composition-pop-ups/03-CONTEXT.md (D-18, D-21, D-22, D-23)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 4: BaseLayout drives <title>; Concern 9: column-0 frontmatter)
    - src/content/site/config.yaml (the `ig_dm_url` and `contact_email` defaults this page consumes)
  </read_first>
  <behavior>
    - `/say-hi` renders: Header → `.say-hi-stage` section containing `<h1>` Caveat Brush "say hi" → `<p class="sub">` Caveat 28px "let's talk earrings" → `<a class="ig-button">` coral pill with arrow → `<p class="mailto">` muted with email link → Footer.
    - NO `<form>` element anywhere in the page.
    - NO `import AppointmentForm` (D-21: file stays in `src/components/design-skill/`, only the import is removed).
    - The IG button `href` is `{site.ig_dm_url}` (resolves to `https://ig.me/m/studiobluemli` from the YAML).
    - The mailto link `href` is `{`mailto:${site.contact_email}`}` (resolves to `mailto:hi@studiobluemli.com`).
    - `<BaseLayout title="Say Hi — Studio Bluemli">` drives `<title>` (Concern 4); `<SEO slot="head" title="Say Hi — Studio Bluemli" pathname="/say-hi" />` is wired.
    - `prerender = true` preserved.
    - All CSS is scoped per UI-SPEC §/say-hi and Pattern G (token-only).
    - Hover: IG button background flips to `--coral-700`; arrow slides +3px via `transform: translateX(3px)`. Mailto link gains `:focus-visible` outline.
    - **Concern 9:** column-0 frontmatter delimiters.
  </behavior>
  <action>
**Edit `src/pages/say-hi.astro`:** Use the Write tool to replace the entire file. **Concern 9 transcription rule:** the ` ---` lines in the code block below are shown with one leading space (markdown-rendering safety convention) — strip the leading space when writing the file so `---` lands at column 0.

```astro
 ---
// src/pages/say-hi.astro — Phase 3 PAG-06 / D-18, D-21, D-22, D-23.
// v1 scope cut: contact form dropped entirely. /say-hi is an IG-DM-link page
// with a mailto fallback. AppointmentForm.jsx stays in src/components/design-skill/
// (D-21) but is no longer imported here. wrangler.jsonc's run_worker_first:["/api/*"]
// and astro.config.mjs's output:'server' are preserved untouched (D-22).
//
// REVIEWS-MODE Concern 4 fix: <BaseLayout title="..."> drives the <title> tag;
// <SEO slot="head" /> only adds canonical/og/twitter (per Plan 02 reconciliation).

export const prerender = true;

import { getEntry } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import SEO from '../components/SEO.astro';
import Header from '../components/design-skill/Header';
import Footer from '../components/design-skill/Footer';

const site = (await getEntry('site', 'default'))!.data;
 ---
<BaseLayout title="Say Hi — Studio Bluemli">
  <SEO slot="head" title="Say Hi — Studio Bluemli" pathname="/say-hi" />
  <Header slot="header" active="/say-hi" />

  <section class="say-hi-stage" aria-label="Say hi">
    <h1 class="say-hi">say hi</h1>
    <p class="sub">let's talk earrings</p>
    <a class="ig-button" href={site.ig_dm_url}>
      DM me on Instagram <span class="arrow" aria-hidden="true">&rarr;</span>
    </a>
    <p class="mailto">
      or email <a href={`mailto:${site.contact_email}`}>{site.contact_email}</a>
    </p>
  </section>

  <Footer slot="footer" igHandle={site.ig_handle} contactEmail={site.contact_email} />
</BaseLayout>

<style>
  /* UI-SPEC §/say-hi — centered narrow column, no eyebrow (headline leads directly). */
  .say-hi-stage {
    max-width: 720px;
    min-height: 540px;
    margin: 0 auto;
    padding: var(--space-9) var(--space-5) var(--space-7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .say-hi {
    font-family: var(--font-display);
    /* clamp(56px, 9vw, 96px) per UI-SPEC */
    font-size: clamp(56px, 9vw, 96px);
    color: var(--coral-500);
    line-height: 1;
    margin: 0 0 var(--space-3);
  }

  .sub {
    font-family: var(--font-hand);
    font-size: var(--fs-xl);              /* 28px */
    color: var(--color-fg-strong);
    line-height: 1;
    margin: 0 0 var(--space-7);
  }

  .ig-button {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--coral-500);
    color: var(--color-fg-on-coral);
    text-decoration: none;
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-pill);
    font-family: var(--font-body);
    font-weight: 800;
    font-size: var(--fs-md);              /* 18px */
    line-height: 1;
    transition: background var(--dur-fast) var(--ease-soft);
  }
  .ig-button:hover { background: var(--coral-700); }
  .ig-button:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 3px;
  }
  .ig-button .arrow {
    display: inline-block;
    transition: transform var(--dur-fast) var(--ease-soft);
  }
  .ig-button:hover .arrow { transform: translateX(3px); }

  .mailto {
    font-family: var(--font-body);
    font-size: var(--fs-sm);
    color: var(--color-fg-muted);
    line-height: var(--lh-normal);
    margin: var(--space-5) 0 0;
  }
  .mailto a {
    color: var(--coral-500);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .mailto a:hover { color: var(--coral-700); }
  .mailto a:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 4px;
  }
</style>
```

**D-21 verification:** `src/components/design-skill/AppointmentForm.jsx` file is NOT touched in this task. After the edit, `ls src/components/design-skill/AppointmentForm.jsx` must still succeed (the file exists, unused). The import is removed from `say-hi.astro` only. The file's presence in the codebase is intentional — see Plan 02's `output: 'server'` + `run_worker_first` preservation (D-22) for the same "leave the rewiring cost at zero if the form returns" rationale.

**D-22 verification:** wrangler.jsonc is NOT touched in this task (Plan 05 owns its edits, and only adds `triggers.crons` + repoints `main`). `run_worker_first: ["/api/*"]` remains untouched.

**Brand-rule anti-pattern check:** no `<form>` tag, no `<input>` tag, no `<button type="submit">`, no `border: 1px`, no flower vocab.

**Concern 9 verification:** column-0 frontmatter. Verify: `! grep -nE "^[[:space:]]+---$" src/pages/say-hi.astro` exits 0.
  </action>
  <verify>
    <automated>test -f src/components/design-skill/AppointmentForm.jsx && (grep -c "import AppointmentForm" src/pages/say-hi.astro || true) && (grep -c "<form" src/pages/say-hi.astro || true) && (grep -c "<input" src/pages/say-hi.astro || true) && grep -c '<SEO slot="head"' src/pages/say-hi.astro && grep -c "DM me on Instagram" src/pages/say-hi.astro && grep -c "site.ig_dm_url" src/pages/say-hi.astro && grep -c "site.contact_email" src/pages/say-hi.astro && grep -c "say-hi-stage" src/pages/say-hi.astro && grep -c '<BaseLayout title="Say Hi' src/pages/say-hi.astro && (grep -cE "client:|background:\s*white|gradient|backdrop-filter|flower|petal|floral|bloom|blossom" src/pages/say-hi.astro || true) && (grep -cE "border(-top|-bottom|-left|-right)?:\s*1px" src/pages/say-hi.astro || true) && (grep -nE "^[[:space:]]+---$" src/pages/say-hi.astro || true) && npx astro check 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `test -f src/components/design-skill/AppointmentForm.jsx` exits 0 (D-21: file preserved)
    - `! grep -q "import AppointmentForm" src/pages/say-hi.astro` exits 0 (D-18: import dropped)
    - `! grep -q "<form" src/pages/say-hi.astro` exits 0 (D-18: no form element)
    - `! grep -q "<input" src/pages/say-hi.astro` exits 0
    - `grep -c '<SEO slot="head"' src/pages/say-hi.astro` returns 1
    - `grep -c "DM me on Instagram" src/pages/say-hi.astro` returns 1
    - `grep -c "site.ig_dm_url" src/pages/say-hi.astro` returns 1
    - `grep -c "site.contact_email" src/pages/say-hi.astro` returns at least 1
    - `grep -c "say-hi-stage" src/pages/say-hi.astro` returns at least 2 (class attribute + selector)
    - **Concern 4:** `grep -c '<BaseLayout title="Say Hi' src/pages/say-hi.astro` returns 1 (BaseLayout drives <title>)
    - **Brand grep:** `! grep -cqE "client:|background:\s*white|gradient|backdrop-filter|flower|petal|floral|bloom|blossom" src/pages/say-hi.astro` exits 0
    - **Brand grep:** `! grep -cqE "border(-top|-bottom|-left|-right)?:\s*1px" src/pages/say-hi.astro` exits 0
    - **Concern 9:** `grep -nE "^[[:space:]]+---$" src/pages/say-hi.astro` returns no output (no indented frontmatter delimiters)
    - **Concern 9:** `grep -c "^---$" src/pages/say-hi.astro` returns 2
    - `npx astro check` exits 0
    - After `npm run build`, `grep -c "DM me on Instagram" dist/client/say-hi/index.html` returns 1
    - After build, `! grep -q "<form" dist/client/say-hi/index.html` exits 0 (no form in built output)
  </acceptance_criteria>
  <done>
    `/say-hi` is a form-free IG-link page with mailto fallback per D-18. AppointmentForm.jsx file remains untouched per D-21. wrangler.jsonc unchanged per D-22. BaseLayout drives `<title>` (Concern 4). Column-0 frontmatter (Concern 9).
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Integrated build + brand-grep + lowercase + SEO smoke check on /about and /say-hi</name>
  <read_first>
    - scripts/check-brand-rules.sh (Phase 1 CI gate behavior)
    - dist/client/about/index.html (verify after build)
    - dist/client/say-hi/index.html (verify after build)
  </read_first>
  <behavior>
    - `npm run build` produces clean output: `dist/client/about/index.html` and `dist/client/say-hi/index.html` both exist and contain the expected markup.
    - Both built HTML files contain a `<title>` (from BaseLayout per Concern 4), `<link rel="canonical">` to apex, `og:image` absolute URL, twitter:card meta — courtesy of `<SEO />`.
    - Phase 1 CI brand-rule and lowercase-filename gates both pass.
    - The /about HTML contains "made with love from NOPA" (D-16 signature).
    - The /say-hi HTML contains the coral IG button + mailto fallback; contains no `<form>` or `<input>` element.
  </behavior>
  <action>
Run the integrated build verification sequence:

1. `npm run build` — full production build. Expected exit 0.

2. Verify `/about` output:
   - `test -f dist/client/about/index.html` exits 0
   - `grep -c "made with love from NOPA" dist/client/about/index.html` returns 1 (D-16)
   - `grep -c "<title>About — Studio Bluemli</title>" dist/client/about/index.html` returns 1
   - `grep -c 'rel="canonical" href="https://studiobluemli.com/about"' dist/client/about/index.html` returns 1
   - `grep -c 'property="og:image"' dist/client/about/index.html` returns 1
   - `grep -c "about-photo-strip" dist/client/about/index.html` returns at least 1 (the photo strip renders since Phase 2 shipped 6 seed gallery pieces)
   - `! grep -ciqE "press|featured in|as seen in" dist/client/about/index.html` exits 0 (Concern 10 verified in built output)

3. Verify `/say-hi` output:
   - `test -f dist/client/say-hi/index.html` exits 0
   - `grep -c "DM me on Instagram" dist/client/say-hi/index.html` returns 1
   - `grep -c "hi@studiobluemli.com" dist/client/say-hi/index.html` returns at least 1 (the mailto link visible in the page)
   - `grep -c "<title>Say Hi — Studio Bluemli</title>" dist/client/say-hi/index.html` returns 1
   - `! grep -q '<form' dist/client/say-hi/index.html` exits 0
   - `! grep -q '<input' dist/client/say-hi/index.html` exits 0

4. CI gates:
   - `npm run ci:brand-check` exits 0
   - `npm run ci:lowercase-check` exits 0

5. Cross-check that Plan 03's pages still build correctly (regression sanity):
   - `test -f dist/client/index.html`
   - `test -f dist/client/popups/index.html`
   - These should be unaffected by Plan 04's edits.

If any step fails, do not commit — investigate. Typical failure modes:
- Plan 02 `<SEO />` not yet merged → `<SEO />` import fails; ensure Plan 02 was completed and `src/components/SEO.astro` exists.
- Plan 01 NOPA not applied → About.jsx body paragraph contains `NoPa` rather than `NOPA`; re-apply Plan 01 Task 2 Edit 2.
- `getEntry('site','default')` fails → confirm `src/content/site/config.yaml` is well-formed and the Phase 2 content collections are intact.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -10 && test -f dist/client/about/index.html && test -f dist/client/say-hi/index.html && grep -c "made with love from NOPA" dist/client/about/index.html && grep -c "DM me on Instagram" dist/client/say-hi/index.html && (grep -c "<form" dist/client/say-hi/index.html || true) && grep -c 'rel="canonical" href="https://studiobluemli.com/about"' dist/client/about/index.html && grep -c 'rel="canonical" href="https://studiobluemli.com/say-hi"' dist/client/say-hi/index.html && (grep -ciE "press|featured in|as seen in" dist/client/about/index.html || true) && npm run ci:brand-check && npm run ci:lowercase-check</automated>
  </verify>
  <acceptance_criteria>
    - `npm run build` exits 0
    - `test -f dist/client/about/index.html` exits 0
    - `test -f dist/client/say-hi/index.html` exits 0
    - `grep -c "made with love from NOPA" dist/client/about/index.html` returns 1
    - `grep -c "DM me on Instagram" dist/client/say-hi/index.html` returns 1
    - `! grep -q "<form" dist/client/say-hi/index.html` exits 0
    - `! grep -q "<input" dist/client/say-hi/index.html` exits 0
    - `grep -c 'rel="canonical" href="https://studiobluemli.com/about"' dist/client/about/index.html` returns 1
    - `grep -c 'rel="canonical" href="https://studiobluemli.com/say-hi"' dist/client/say-hi/index.html` returns 1
    - `grep -c 'property="og:image"' dist/client/about/index.html` returns 1
    - `grep -c 'property="og:image"' dist/client/say-hi/index.html` returns 1
    - **Concern 4 verification:** `grep -c "<title>About — Studio Bluemli</title>" dist/client/about/index.html` returns 1
    - **Concern 4 verification:** `grep -c "<title>Say Hi — Studio Bluemli</title>" dist/client/say-hi/index.html` returns 1
    - **Concern 10 verification:** `! grep -ciqE "press|featured in|as seen in" dist/client/about/index.html` exits 0 (built /about HTML has no press/featured-in/as-seen-in tokens)
    - `npm run ci:brand-check` exits 0
    - `npm run ci:lowercase-check` exits 0
  </acceptance_criteria>
  <done>
    Both pages build cleanly, emit the full SEO contract, BaseLayout drives `<title>` (Concern 4), pass Phase 1 CI gates, contain the D-13/D-16/D-18 user-facing copy, and the /about output passes the Concern 10 disallowed-mention regex. Plan 03's pages still build alongside.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| (none — pure static composition) | Both pages are static prerendered HTML. No runtime input handling, no form submission (D-18). The only outbound link surfaces are well-known constants from `site/config.yaml` (Instagram + mailto). |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-04-01 | Information Disclosure | About page body copy | accept | All content is public-by-design and Claude-drafted per D-13; the founder edits later via GitHub web UI. No PII (no founder name, no founder photo per D-14 / ROADMAP lock). |
| T-03-04-02 | Tampering | mailto + IG link hrefs | mitigate | hrefs are sourced from `site/config.yaml` (Zod-validated string + url() at build time per Phase 2 schema). A malicious PR that swaps the IG URL or email fails Zod validation if malformed; a PR with a "valid but wrong" URL would still require human PR review (Phase 1 FND-04 required-status-check). |
| T-03-04-03 | Spoofing | IG button click destination | accept | The button navigates to `ig.me/m/studiobluemli` (set in YAML). Instagram's DM-deep-link is trusted; users see the destination in the link's hover-state and address bar before navigating. Standard Web threat model — no Phase 3 mitigation needed beyond using HTTPS (Cloudflare-managed). |
| T-03-04-04 | Cross-Site Scripting | About body paragraph + Mark.Heart SVG | accept | Astro escapes JSX text content by default; Mark.Heart is a known-trusted SVG component from the design-skill (Phase 1 vetted). Body paragraphs are author-controlled (founder + Claude); no user input flows in. |
</threat_model>

<verification>
End-to-end verification after all 4 tasks complete:

```bash
# 1) About content checks:
grep -c "made with love from NOPA" src/components/design-skill/About.jsx   # expect 1
! grep -q "— the founder" src/components/design-skill/About.jsx            # expect exit 0
! grep -ciqE "flower|petal|floral|bloom|blossom" src/components/design-skill/About.jsx   # expect exit 0
! grep -ciqE "press|featured in|as seen in" src/components/design-skill/About.jsx        # Concern 10
grep -c "about-photo-strip" src/pages/about.astro                          # expect at least 2

# 2) Say Hi content checks:
test -f src/components/design-skill/AppointmentForm.jsx                    # expect exit 0 (file preserved)
! grep -q "import AppointmentForm" src/pages/say-hi.astro                  # expect exit 0
! grep -q "<form" src/pages/say-hi.astro                                   # expect exit 0
grep -c "DM me on Instagram" src/pages/say-hi.astro                        # expect 1
grep -c "site.ig_dm_url" src/pages/say-hi.astro                            # expect 1

# 3) SEO wiring + Concern 4:
grep -c '<SEO slot="head"' src/pages/about.astro                           # expect 1
grep -c '<SEO slot="head"' src/pages/say-hi.astro                          # expect 1
grep -c '<BaseLayout title="About' src/pages/about.astro                   # expect 1 (BaseLayout drives title)
grep -c '<BaseLayout title="Say Hi' src/pages/say-hi.astro                 # expect 1

# 4) Concern 9 — column-0 frontmatter:
! grep -nE "^[[:space:]]+---$" src/pages/about.astro src/pages/say-hi.astro  # expect exit 0

# 5) Concern 10 — about.astro source has no banned tokens (the grep itself
#    must reference the regex by name; that is the verification command,
#    not a comment that will be transcribed into the source file):
! grep -ciqE "press|featured in|as seen in" src/pages/about.astro          # expect exit 0

# 6) Build + CI gates:
npx astro check
npm run build
npm run ci:brand-check
npm run ci:lowercase-check

# 7) Built-output checks:
grep -c "made with love from NOPA" dist/client/about/index.html            # expect 1
grep -c "DM me on Instagram" dist/client/say-hi/index.html                 # expect 1
! grep -q "<form" dist/client/say-hi/index.html                            # expect exit 0
grep -c 'rel="canonical" href="https://studiobluemli.com/about"' dist/client/about/index.html    # expect 1
grep -c 'rel="canonical" href="https://studiobluemli.com/say-hi"' dist/client/say-hi/index.html  # expect 1
grep -c "<title>About — Studio Bluemli</title>" dist/client/about/index.html         # Concern 4
grep -c "<title>Say Hi — Studio Bluemli</title>" dist/client/say-hi/index.html       # Concern 4

# 8) D-22 cross-check (wrangler.jsonc unchanged by this plan):
grep -c '"run_worker_first"' wrangler.jsonc                                # expect 1
```

Visual sanity (founder-style, optional):
- `npm run dev`, open `/about` — confirm Caveat Brush headline in coral, body paragraphs with friendly tone, "made with love from NOPA ♡" signature, photo strip of 3 gallery pieces below.
- Open `/say-hi` — confirm Caveat Brush "say hi" headline, "let's talk earrings" sub, coral pill button "DM me on Instagram →", "or email hi@studiobluemli.com" mailto fallback.
</verification>

<success_criteria>
Plan 04 is complete when:
1. `src/components/design-skill/About.jsx` body is rewritten per D-13 voice rules; signature is "made with love from NOPA ♡" (D-16); Plan 01 NOPA fix preserved; no press/featured-in/as-seen-in tokens (Concern 10).
2. `src/pages/about.astro` renders About + photo strip (1-3 gallery hero-800.webp images, alt-text from `piece.data.name`); `<SEO />` wired; `<BaseLayout title="About — Studio Bluemli">` drives `<title>` (Concern 4); column-0 frontmatter (Concern 9); zero `press|featured in|as seen in` matches in the source file (Concern 10 — note the verification grep itself names the regex; the rule is that no transcribed comment in about.astro contains those tokens); photo dimensions deviation documented (Concern 13).
3. `src/pages/say-hi.astro` is form-free, drops the `AppointmentForm` import, renders coral pill IG button + mailto fallback; `<SEO />` wired; `<BaseLayout title="Say Hi — Studio Bluemli">` drives `<title>` (Concern 4); column-0 frontmatter (Concern 9).
4. `src/components/design-skill/AppointmentForm.jsx` is preserved untouched (D-21).
5. `wrangler.jsonc` is preserved untouched (D-22 cross-check; actual wrangler.jsonc edits live in Plan 05).
6. `npm run build` + `npm run ci:brand-check` + `npm run ci:lowercase-check` all exit 0.
7. Built HTML for `/about` and `/say-hi` both contain `<title>` (from BaseLayout), canonical-to-apex link, og:image, and no flower vocabulary; built /about has zero `press|featured in|as seen in` matches (Concern 10 in built output).
</success_criteria>

<output>
After completion, create `.planning/phases/03-page-composition-pop-ups/03-04-SUMMARY.md` documenting:
- The 3 modified files (no new files in this plan).
- The verified D-13 body rewrite (counts: at least 1 parenthetical aside, ≥1 NOPA mention, 0 flower words, 0 emoji beyond ♡, 0 press/featured-in/as-seen-in tokens per Concern 10).
- The verified D-16 signature swap.
- The verified D-18 form drop and D-21 AppointmentForm.jsx preservation.
- The verified Concern 4 wiring: `<BaseLayout title=...>` owns the `<title>` tag on both pages.
- The verified Concern 10 fix: about.astro source comments rewritten to avoid naming the disallowed-mention regex tokens; built HTML also passes the same regex.
- The documented Concern 13 deviation: photo strip uses CSS `aspect-ratio: 1 / 1` (no `<img>` width/height); LCP-sensitive surface is `/gallery/[slug]` (uses Astro `<Image />`).
- A snapshot of the 3 gallery slugs picked for the /about photo strip during build.
- Confirmation that wrangler.jsonc and AppointmentForm.jsx were both NOT touched (D-21, D-22 cross-checks).
</output>
</output>
