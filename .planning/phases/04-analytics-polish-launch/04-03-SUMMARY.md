---
phase: 04-analytics-polish-launch
plan: 03
subsystem: docs
tags: [docs, dns, cutover, founder-facing, cloudflare, operations]

requires:
  - phase: 01-foundations-brand-system
    provides: CONTENT_EDITING.md voice/register reference, brand-rules CI grep
  - phase: 03-page-composition-pop-ups
    provides: astro.config.mjs `site:` apex (D-26), public/og-default.png (D-27)
provides:
  - SETUP-DNS.md founder-facing one-time DNS cutover walkthrough (5 Cloudflare-dashboard steps)
  - CONTENT_EDITING.md cross-reference so the founder discovers the operations doc
  - Read-only verification of D-07 (astro.config.mjs apex site) and D-10 (og-default.png brand check)
  - D-10 FLAG raised for Plan 05: og-default.png contains flower iconography + center bead motif; regeneration required before cutover
affects:
  - 04-05 (DNS cutover execution) — founder will walk SETUP-DNS.md end-to-end
  - 04-05 (pre-cutover gate) — must regenerate og-default.png via scripts/generate-og-default.mjs before launch
  - 04-04 (launch checklist) — item 3 (every og:image returns 200) depends on og-default.png being brand-faithful

tech-stack:
  added: []
  patterns:
    - "Founder-facing operational doc at repo root, sentence-case verb-led headings, bold UI labels, no jargon, no emoji (matches CONTENT_EDITING.md register)"
    - "Read-only precondition verification — no edits to upstream-phase-owned files (astro.config.mjs, og-default.png) when checks pass; flag rather than auto-fix when out of scope"

key-files:
  created:
    - SETUP-DNS.md
    - .planning/phases/04-analytics-polish-launch/04-03-SUMMARY.md
  modified:
    - CONTENT_EDITING.md

key-decisions:
  - "Match CONTENT_EDITING.md voice exactly (sentence-case verb-led headings, bold UI labels, numbered steps, inline code for paths/values, no jargon, no emoji)"
  - "Defer HSTS preload-list submission per CONTEXT.md — doc explicitly tells founder NOT to submit to hstspreload.org (mitigates T-04-20)"
  - "Step 3 instructs Plaintext (not Secret) for PUBLIC_UMAMI_WEBSITE_ID (mitigates T-04-21 — Secret type would hide it from Vite/Astro at build, breaking the Umami snippet)"
  - "D-10 violation FLAGGED for Plan 05 regeneration (not auto-fixed) — out of scope for this plan; scripts/generate-og-default.mjs exists in the repo for Plan 05 to invoke"

patterns-established:
  - "Operations-doc cross-reference pattern: append `## Operations` section at end of CONTENT_EDITING.md with a 3-sentence pointer to the operational doc"
  - "Threat-mitigation phrasing in founder docs — name the right Cloudflare worker (`studio-bluemli`) verbatim in Step 1 to mitigate Tampering risk (T-04-18); explicit Plaintext vs Secret call-out (T-04-21)"

requirements-completed: [FND-03, LCH-07]

duration: ~5min
completed: 2026-05-15
---

# Phase 04 Plan 03: DNS doc + verify D-07, D-10 preconditions, register in CONTENT_EDITING.md Summary

**Founder-facing `SETUP-DNS.md` walkthrough of 5 Cloudflare-dashboard steps, cross-referenced in `CONTENT_EDITING.md`, D-07 apex site verified, D-10 og-default.png FLAGGED for Plan 05 regeneration (flower iconography + center bead motif).**

## Performance

- **Duration:** ~5 min (single-task plan, no scaffolding)
- **Started:** 2026-05-15T15:44:45Z (approx, wave start)
- **Completed:** 2026-05-15T15:48:36Z
- **Tasks:** 1
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments

- Created `SETUP-DNS.md` at the repo root with 5 numbered Cloudflare-dashboard steps (Custom Domain, Redirect Rule, Umami env var, wait, founder phone checks). 92 lines.
- Voice matches `CONTENT_EDITING.md`: sentence-case verb-led headings, bold UI labels, no jargon, no emoji, plain prose between steps.
- Doc explicitly defers HSTS preload-list submission (mitigates T-04-20 — preload registration is effectively a one-year commitment).
- Step 3 explicitly instructs `Plaintext (not Secret)` for `PUBLIC_UMAMI_WEBSITE_ID` (mitigates T-04-21 — Secret type would hide it from Vite at build, breaking the Umami snippet).
- Step 1 names the exact Cloudflare worker `studio-bluemli` as the navigation disambiguator (mitigates T-04-18 — wrong-worker mis-routing).
- Added `## Operations` cross-reference section to `CONTENT_EDITING.md` so the founder discovers `SETUP-DNS.md` without being told.
- Verified D-07 (read-only): `astro.config.mjs:8` is `site: 'https://studiobluemli.com'`. No edit.
- Visually inspected D-10 (read-only): `public/og-default.png` is 1200×630 cream-background PNG, but contains a flower-shape (6 rounded petals) with a center bead cutout. **D-10 FLAGGED for Plan 05.**

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify two read-only preconditions and write SETUP-DNS.md** — `17eebf9` (docs)

**Plan metadata commit:** TBD (after self-check) — covers `04-03-SUMMARY.md`.

## Files Created/Modified

- `SETUP-DNS.md` (created) — 92-line founder walkthrough at repo root: 5 numbered Cloudflare-dashboard steps + "What is not done here" (HSTS preload deferral note).
- `CONTENT_EDITING.md` (modified) — appended `## Operations` section with a 3-sentence pointer to `SETUP-DNS.md` (markdown link).
- `.planning/phases/04-analytics-polish-launch/04-03-SUMMARY.md` (created) — this file.

## Precondition Verification

### D-07 confirmed: astro.config.mjs apex site

`grep -nE "^[[:space:]]*site:" astro.config.mjs` output:

```
8:  site: 'https://studiobluemli.com',
```

D-07 confirmed: `astro.config.mjs:8 site='https://studiobluemli.com'`. No edit required (Phase 3 D-26 owns this file).

### D-10 visual check: og-default.png

`file public/og-default.png` output:

```
public/og-default.png: PNG image data, 1200 x 630, 8-bit/color RGBA, non-interlaced
```

Dimensions: **1200×630 PNG, RGBA** — correct.

**D-10 visual check: cream background = yes, flower iconography = yes, logo lockup/wordmark = absent**

What I saw on visual inspection of the PNG:
- Background: warm cream (matches brand `--color-bg`).
- Center artwork: a coral/red **6-rounded-petal flower silhouette** with a small hexagonal center cutout that reads as a center-bead motif.
- No wordmark, no studio name, no logo lockup.

**D-10 FLAG: og-default.png contains flower iconography (6-petal silhouette) and a center-bead motif — both violate brand non-negotiables in `.claude/skills/studio-bluemli-design/SKILL.md` ("earrings are beaded clusters, not flowers"; "no center bead motif"). Regeneration required in Plan 05 before cutover via `scripts/generate-og-default.mjs`.**

Out of scope for this plan: this is a Plan 05 cutover-gate item, not a Plan 03 deliverable. Brand-rule CI grep (`scripts/check-brand-rules.sh`) does not scan binary PNGs, so this slipped past Phase 3 verification — Plan 05 must explicitly visually re-inspect after regeneration.

## Decisions Made

- **Tone match priority over completeness.** The doc is the only deliverable the founder will execute alone; voice register matters more than exhaustive coverage. Followed CONTENT_EDITING.md sentence-case verb-led pattern verbatim.
- **Threat-mitigation phrasing baked in inline.** Worker name (`studio-bluemli`), `Plaintext` not Secret, and "do NOT submit to hstspreload.org" are written as plain-language instructions — no separate "security notes" sidebar.
- **D-10 flagged, not auto-fixed.** Regenerating `og-default.png` is out of scope per the plan's `<action>` Sub-step B; recorded as a precise regeneration request for Plan 05 with the exact symptom (flower + center bead).

## Deviations from Plan

None — plan executed exactly as written. The canonical text from RESEARCH.md §Code Examples lines 635-699 was used verbatim (per plan instructions); no phrasing changes.

## Issues Encountered

- **D-10 precondition fails brand SKILL.** Found during Sub-step B visual check. Flagged for Plan 05 regeneration per the plan's explicit scope decision (do NOT regenerate here). No action required from executor.

## User Setup Required

None for this plan. The founder will execute `SETUP-DNS.md` end-to-end during Plan 05 (Wave 2 DNS cutover), with Claude observing.

## Final Verification Output

All acceptance criteria from the plan's `<acceptance_criteria>` block satisfied:

| Check | Expected | Actual |
|---|---|---|
| `test -f SETUP-DNS.md` | exit 0 | EXISTS |
| `wc -l SETUP-DNS.md` | 70–130 | 92 |
| `grep -c '^## Step' SETUP-DNS.md` | 5 | 5 |
| `grep -c 'PUBLIC_UMAMI_WEBSITE_ID' SETUP-DNS.md` | 1 | 1 |
| `grep -c 'studio-bluemli' SETUP-DNS.md` | ≥3 | 3 |
| `grep -c 'Plaintext' SETUP-DNS.md` | 1 | 1 |
| `grep -cE 'flower\|petal\|floral\|bloom\|blossom' SETUP-DNS.md CONTENT_EDITING.md` | 0 | 0+0 |
| `grep -c 'SETUP-DNS\.md' CONTENT_EDITING.md` | ≥1 | 1 |
| `grep -c '^## Operations' CONTENT_EDITING.md` | 1 | 1 |
| `bash scripts/check-brand-rules.sh` | exit 0 | exit 0 ("All brand rules pass.") |
| `file public/og-default.png` reports 1200x630 | yes | `1200 x 630, 8-bit/color RGBA` |
| D-10 attestation line present in SUMMARY | yes | yes (see Precondition Verification above) |
| `grep -nE "^[[:space:]]*site:" astro.config.mjs` | apex | `8:  site: 'https://studiobluemli.com',` |
| emoji-grep `SETUP-DNS.md` | 0 | 0 |

## Next Phase Readiness

- `SETUP-DNS.md` is founder-ready; Plan 05 can hand it off without translation.
- **Plan 05 must regenerate `public/og-default.png`** via `scripts/generate-og-default.mjs` and visually re-verify (cream background, no flower iconography, no center bead, logo lockup or wordmark present) BEFORE walking the launch checklist's item 3 (every og:image URL returns 200) and item 6 (Lighthouse SEO ≥ 90).
- D-07 is locked — no further action needed in Phase 4.

## Self-Check: PASSED

Verified after writing this file:

- `SETUP-DNS.md` exists at repo root.
- `CONTENT_EDITING.md` exists and contains the `## Operations` section linking to `SETUP-DNS.md`.
- `.planning/phases/04-analytics-polish-launch/04-03-SUMMARY.md` exists.
- Commit `17eebf9` exists in git log (`docs(04-03): add founder-facing SETUP-DNS.md DNS cutover walkthrough`).
- D-10 attestation line present in this SUMMARY (`grep -c 'D-10 visual check: cream background' returns 1`).

---
*Phase: 04-analytics-polish-launch*
*Completed: 2026-05-15*
