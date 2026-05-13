# Phase 1 — Deferred items

Items discovered during plan execution that are out-of-scope for the current
plan but should be addressed (typically by Plan 05's CI gate scope decision).

## From Plan 01-04 execution (2026-05-12)

- **[RESOLVED in Plan 01-05]** CI Rule 2 (flower vocabulary) hit in
  `src/styles/colors_and_type.css` (lines 48 + 53; Plan 04 only logged line 53,
  but there are two pre-existing color-naming comments — "small flowers, sparkles"
  and "bottom-right pressed flower"). A third hit was also discovered in
  `src/components/design-skill/PopupStrip.jsx:35` (`{/* Color stripe (real brand
   swatches, not flowers) */}`).

  **Resolution (Plan 05 scope decision):** chose option 2 with an extension —
  the Rule 2 grep in `scripts/check-brand-rules.sh` excludes both:
  - `colors_and_type.css` (via `--exclude='colors_and_type.css'`)
  - `src/components/design-skill/` (via `--exclude-dir=design-skill`)

  Rationale: Rule 2's INTENT per studio-bluemli-design SKILL.md → "Vocabulary"
  is keeping the word "flower" out of **product copy** (alt text, descriptions,
  page text). Color-hue comments in a verbatim-synced design-skill stylesheet,
  and explanatory comments inside synced JSX, are not product copy. Editing
  either source would drift from the skill (Plan 02 REVIEW FIX M4 locks
  `colors_and_type.css` as a verbatim copy). Phase 2's `src/content/` (real
  product copy) is still scanned by Rule 2 unchanged — the exclusion is
  narrowly scoped to the two synced internal file classes.

  Option 1 (edit skill source + re-sync) was considered and rejected: it
  would mutate a managed cross-project artifact for a CI cosmetic, and the
  PopupStrip comment is *self-aware* ("not flowers") so editing it would
  be a regression in author intent.

  Option 3 (declare Rule 2 over-broad) was considered and rejected: the
  rule's value for real product copy is genuine; the exclusion is the
  minimum change to keep both invariants.

  No further action required. Both Plan 04 hits and the Plan 05–discovered
  PopupStrip hit are now correctly suppressed by the grep configuration.
