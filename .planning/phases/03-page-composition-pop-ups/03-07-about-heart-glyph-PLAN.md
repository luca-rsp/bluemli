---
phase: 03-page-composition-pop-ups
plan: 07
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/design-skill/About.jsx
autonomous: true
gap_closure: true
requirements: [PAG-05]
must_haves:
  truths:
    - "GAP-04 (WR-06 / SC3 / PAG-05) closed: built `/about` page renders the OUTLINE heart `♡` (U+2661) in the signature, not the FILLED heart `♥` (U+2665). D-16 explicitly specifies the outline glyph; the verifier flagged the filled glyph as a visible brand-fidelity defect."
    - "The signature line text is preserved exactly: `made with love from NOPA ♡` (with the outline heart). The hand-font, coral color, and inline-flex layout in About.jsx remain unchanged — the ONLY change is the `filled` prop on Mark.Heart (or, alternatively, an inline `♡` glyph replacing `<Mark.Heart />` entirely)."
    - "`dist/client/about/index.html` contains at least one literal `♡` (U+2661 OUTLINE WHITE HEART) in the signature region, AND zero literal `♥` (U+2665 BLACK HEART SUIT) anywhere in the file."
    - "Plans 03-01..03-06 remain untouched (no cross-cutting edits)."
  artifacts:
    - path: "src/components/design-skill/About.jsx"
      provides: "About text block whose signature line renders outline heart per D-16"
      contains: "filled={false}"
  key_links:
    - from: "src/components/design-skill/About.jsx"
      to: "src/components/design-skill/Mark.jsx"
      via: "Mark.Heart imported and invoked with filled={false} (default is true → ♥; explicit false → ♡)"
      pattern: "Mark\\.Heart[^/]*filled=\\{false\\}"
---

<objective>
Close GAP-04 (WR-06): the About-page signature renders the FILLED heart `♥` (U+2665) instead of the OUTLINE heart `♡` (U+2661) that D-16 and the UI-SPEC §Copywriting Contract specifically call out. This is a visible brand-fidelity defect — D-16 reads `"made with love from NOPA ♡"` with the outline glyph chosen by the founder, and the current build emits the heavier filled glyph.

Purpose: One-line brand fidelity fix. The Mark.Heart component (`src/components/design-skill/Mark.jsx:17-19`) already supports both glyphs via its `filled` prop, but its default is `filled = true`. About.jsx invokes `<Mark.Heart color="var(--coral-500)" />` with no `filled` prop, so the default kicks in and emits `♥`. Pass `filled={false}` explicitly.

Choice of solo plan (separate from 03-06): different file, different verification surface, parallelizable. About.jsx is not touched by 03-06 (which works on SEO infrastructure). Wave 1 parallel with 03-06 = lowest wall-clock total. No inter-plan dependency.

Output (1 modified, 0 new):
- `src/components/design-skill/About.jsx` — line 50 (the Mark.Heart invocation) gets a `filled={false}` prop.
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
@.planning/phases/03-page-composition-pop-ups/03-VERIFICATION.md
@.planning/phases/03-page-composition-pop-ups/03-REVIEW.md
@.planning/phases/03-page-composition-pop-ups/03-04-SUMMARY.md
@.claude/skills/studio-bluemli-design/SKILL.md
@CLAUDE.md
@src/components/design-skill/About.jsx
@src/components/design-skill/Mark.jsx

<interfaces>
<!-- Current shape of the two files involved. About.jsx is the only one being edited. -->

From src/components/design-skill/Mark.jsx (lines 17-19 — already supports the outline glyph):
```jsx
Heart: ({ size = 16, color = "var(--coral-500)", filled = true }) => (
  <span style={{ color, fontSize: size, lineHeight: 1 }}>{filled ? '♥' : '♡'}</span>
),
```
Default is `filled = true` (produces ♥). Pass `filled={false}` explicitly to get ♡.

From src/components/design-skill/About.jsx (line 50 — the site of the bug):
```jsx
<div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--ink-600)', fontFamily: 'var(--font-hand)', fontSize: 22 }}>
  made with love from NOPA <Mark.Heart color="var(--coral-500)" />
</div>
```
The `<Mark.Heart />` invocation has no `filled` prop, so Mark.Heart's default (`true`) wins → renders `♥`.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Pass filled={false} to Mark.Heart in About.jsx signature</name>
  <files>src/components/design-skill/About.jsx</files>
  <read_first>
    - src/components/design-skill/About.jsx (the file being modified — read the full 56-line file)
    - src/components/design-skill/Mark.jsx (the consumed component — confirm `filled` prop semantics, lines 17-19)
    - .planning/phases/03-page-composition-pop-ups/03-VERIFICATION.md (WR-06 gap details + suggested fix)
    - .planning/phases/03-page-composition-pop-ups/03-CONTEXT.md (D-16 — the source-of-truth signature string `made with love from NOPA ♡`)
  </read_first>
  <action>
**Single edit: `src/components/design-skill/About.jsx` line 50 — add `filled={false}` to the Mark.Heart invocation.**

Find this line (current state — line 50):
```jsx
made with love from NOPA <Mark.Heart color="var(--coral-500)" />
```

Replace with (Mark.Heart now explicitly renders the outline glyph ♡ per Mark.jsx:17-19):
```jsx
made with love from NOPA <Mark.Heart color="var(--coral-500)" filled={false} />
```

Do NOT change:
- The surrounding `<div>` styles (inline-flex, gap, font-hand, fontSize: 22, color: ink-600) — preserved exactly.
- The text node `"made with love from NOPA "` — preserved exactly (trailing space included; it's the gap between the word `NOPA` and the heart glyph).
- The `Mark` import on line 3 — already in place, no change.
- Any other line in the file.

Rationale for choosing the `filled={false}` path over the alternative inline-glyph replacement (`<span style={{color:'var(--coral-500)'}}>♡</span>`):
- Preserves the abstraction: every other use site of the heart glyph in this codebase routes through `Mark.Heart` (the same pattern used in Footer.jsx if a heart ever appears there). Bypassing the abstraction for one site creates inconsistency.
- Smaller diff — one prop added, vs. removing an import-and-component-usage pair and inlining a span.
- D-16 (the design decision) says "uses --font-hand (Caveat), matching About.jsx's existing signature treatment" — the existing treatment IS `<Mark.Heart />`, and the outline-glyph correction is purely a prop fix.

The verifier explicitly listed both options as acceptable. We pick `filled={false}` for the reasons above.
  </action>
  <verify>
    <automated>
# Confirm About.jsx now passes filled={false} to Mark.Heart.
grep -c 'Mark\.Heart color="var(--coral-500)" filled={false}' src/components/design-skill/About.jsx | grep -qx 1 && \
# Confirm the OLD invocation (without filled prop) is gone.
test "$(grep -c 'Mark\.Heart color="var(--coral-500)" />' src/components/design-skill/About.jsx)" = "0" && \
# Build the site and inspect the rendered /about HTML.
npm run build 2>&1 | tail -5 && \
test -f dist/client/about/index.html && \
# Outline heart present (at least once, in the signature region).
test "$(grep -c '♡' dist/client/about/index.html)" -ge 1 && \
# Filled heart fully absent.
test "$(grep -c '♥' dist/client/about/index.html)" = "0"
    </automated>
  </verify>
  <acceptance_criteria>
    - `grep -c 'Mark\.Heart color="var(--coral-500)" filled={false}' src/components/design-skill/About.jsx` returns exactly `1`.
    - `grep -c 'Mark\.Heart color="var(--coral-500)" />' src/components/design-skill/About.jsx` returns `0` (the prop-less invocation is gone, not duplicated).
    - `npm run build` exits 0 (Astro check + build both pass).
    - `dist/client/about/index.html` exists after the build.
    - `grep -c '♡' dist/client/about/index.html` returns `≥ 1` (the U+2661 outline white heart is present in the rendered signature).
    - `grep -c '♥' dist/client/about/index.html` returns exactly `0` (no U+2665 black heart suit anywhere in the built about page).
    - The signature surrounding text is intact: `grep -c 'made with love from NOPA' dist/client/about/index.html` returns `≥ 1`.
    - Files 03-01-PLAN.md through 03-06-PLAN.md and 03-01-SUMMARY.md through 03-05-SUMMARY.md are unchanged (no cross-cutting edits to prior plans).
  </acceptance_criteria>
  <done>
    `src/components/design-skill/About.jsx` line 50 passes `filled={false}` to Mark.Heart. After `npm run build`, `dist/client/about/index.html` contains `♡` (≥1 occurrence) and zero `♥`. D-16 brand fidelity restored.
  </done>
</task>

</tasks>

<verification>
End-to-end gate tying back to VERIFICATION.md's WR-06 missing-items:

```bash
# Single command flow: edit lands, build runs, glyphs are correct.
npm run build && \
echo "Outline ♡ occurrences:" && grep -c '♡' dist/client/about/index.html && \
echo "Filled  ♥ occurrences:" && grep -c '♥' dist/client/about/index.html
```

Expected output:
```
Outline ♡ occurrences:
1
Filled  ♥ occurrences:
0
```

The exact count of `♡` is 1 in v1 (the signature is the only heart on the page), but the acceptance criterion allows ≥1 so a future second heart elsewhere on the page does not break this gate. The `♥` count MUST be exactly 0.
</verification>

<success_criteria>
- GAP-04 closed: `dist/client/about/index.html` renders the OUTLINE heart `♡` in the signature (not the filled `♥`), matching D-16.
- One line changed in one file (`src/components/design-skill/About.jsx:50`).
- Plans 03-01..03-06 untouched.
- `npm run build` continues to pass (no regression introduced).
</success_criteria>

<output>
After completion, create `.planning/phases/03-page-composition-pop-ups/03-07-SUMMARY.md` summarizing:
- Gap closed: GAP-04 / WR-06 (signature outline heart)
- File changed: `src/components/design-skill/About.jsx:50` — added `filled={false}` to Mark.Heart
- Verification command + output (the two grep counts: ≥1 outline ♡, 0 filled ♥)
- Chosen path (prop-based fix via Mark.Heart, NOT inline-span replacement) and why (preserves Mark abstraction, smaller diff, design-skill consistency)
</output>
