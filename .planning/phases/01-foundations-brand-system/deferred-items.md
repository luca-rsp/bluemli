# Phase 1 — Deferred items

Items discovered during plan execution that are out-of-scope for the current
plan but should be addressed (typically by Plan 05's CI gate scope decision).

## From Plan 01-04 execution (2026-05-12)

- **CI Rule 2 (flower vocabulary) hit in src/styles/colors_and_type.css:53.**
  Line: `/* Lavender — bottom-right pressed flower */`. The CSS is a verbatim
  copy of the design-skill source per Plan 02 REVIEW FIX M4 (colors_and_type.css
  is intentionally locked verbatim). This is pre-existing wording from the
  skill, NOT introduced by Plan 04. The cleanest fix is one of:
  1. Edit the design skill source (`.claude/skills/studio-bluemli-design/colors_and_type.css`)
     to change "pressed flower" → "pressed botanical" or similar, then re-sync.
  2. Have Plan 05's CI rule 2 grep allowlist `src/styles/colors_and_type.css`
     because it's a managed/synced file.
  3. Decide Rule 2 is over-broad — the word "flower" in a CSS comment naming
     a color hue is not the same as the prohibition on flower-based product
     copy (the prohibition's intent per studio-bluemli-design SKILL.md is
     marketing copy, not color-naming comments).
  Plan 05 should pick one. NOT Plan 04's job to fix.
