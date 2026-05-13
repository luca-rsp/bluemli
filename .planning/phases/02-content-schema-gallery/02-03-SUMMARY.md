---
phase: 02
plan: 03
subsystem: brand-ci
tags:
  - phase-1-cleanup
  - brand-check-fix
  - dead-code-removal
dependency_graph:
  requires:
    - "Phase 1 brand check (scripts/check-brand-rules.sh from plan 01-05)"
    - "Phase 1 ProductSheet.jsx in src/components/design-skill/ (plan 01-02)"
  provides:
    - "CR-03 closed: ProductSheet.jsx removed from src/"
    - "CR-05 closed: Rule 1 regex now case-insensitive for 3-digit hex"
    - "LOW-1 addressed: macOS BSD grep guard on self-tests"
  affects:
    - "scripts/check-brand-rules.sh (consumed by CI job in .github/workflows/ci.yml)"
    - "Phase 2 content (src/content/ now protected by tighter Rule 1 regex)"
    - "Phase 4 executor: ProductSheet.jsx not available as a modal pattern — use photo-forward single column per D-09"
tech_stack:
  added: []
  patterns:
    - "PCRE character class [fF]{3} for case-insensitive 3-digit hex matching"
    - "BSD grep -P compatibility guard: check support before running PCRE self-tests"
key_files:
  created: []
  modified:
    - scripts/check-brand-rules.sh
  deleted:
    - src/components/design-skill/ProductSheet.jsx
decisions:
  - "D-09 confirmed: photo-forward single column for /gallery/<slug> — ProductSheet modal pattern has no role"
  - "LOW-1: self-tests on grep -P are macOS-tolerant; CI Ubuntu is the authoritative validator"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-13"
  tasks_completed: 2
  tasks_total: 2
  files_created: 0
  files_modified: 1
  files_deleted: 1
---

# Phase 2 Plan 3: Phase 1 Cleanup (CR-03 + CR-05) Summary

**One-liner:** Deleted unused ProductSheet.jsx modal (D-09 picks photo-forward single column) and tightened Rule 1 hex regex from `#fff` to `#[fF]{3}` so uppercase `#FFF` is now caught by CI.

## What Was Done

Two independent Phase 1 quality-debt items from `01-VERIFICATION.md` were closed before Phase 2's content surfaces come online.

### CR-03: Delete ProductSheet.jsx

`src/components/design-skill/ProductSheet.jsx` was confirmed unused — zero imports in any page or layout. Phase 2 Context Decision D-09 locked the detail page composition as "photo-forward single column" (not a modal), making this component permanently orphaned. Deleting it prevents future executors from mistakenly wiring it as a modal pattern while browsing the design-skill components.

The design-skill source-of-truth copy at `.claude/skills/studio-bluemli-design/ui_kits/website/ProductSheet.jsx` was **not** touched — it's preserved for any future v1.x modal reference.

Verification: `astro check` passed 0 errors / 0 warnings across 23 files after deletion.

### CR-05: Fix Rule 1 Regex for Uppercase #FFF

**Before:**
```
(bg-white|background:\s*white|#fff(?![0-9a-fA-F])|#[fF]{6})
```

**After:**
```
(bg-white|background:\s*white|#[fF]{3}(?![0-9a-fA-F])|#[fF]{6})
```

The single change: `#fff` → `#[fF]{3}`. This is a PCRE character class that matches all 8 case combinations of 3 hex `f` digits (`#FFF`, `#fff`, `#Fff`, `#fFf`, etc.).

The negative lookahead `(?![0-9a-fA-F])` was preserved unchanged, which continues to whitelist `#fff8` (D-10 cream tint with alpha), `#FFF8`, and any 4+-character hex value starting with three `f`s.

The 6-digit branch `#[fF]{6}` was not touched — it was already case-insensitive.

### LOW-1: macOS BSD Grep Guard

Per `02-REVIEWS.md` LOW-1, all `grep -P` self-tests in the verification steps are wrapped with:

```bash
if ! echo test | grep -P "test" >/dev/null 2>&1; then
  echo "[CR-05 self-test] SKIP — grep -P not supported (BSD grep on macOS); CI Ubuntu will validate."
  exit 0
fi
```

The script itself uses `grep -rnP` for Rule 1 — this is intentional (Ubuntu CI only). On macOS local runs, Rule 1 emits a BSD grep error to stderr but exits 0 with "All brand rules pass." — same behavior as Phase 1. Ubuntu CI with GNU grep remains the authoritative validator.

## Self-Tests (Run on This Machine — GNU grep available)

| Test | Input | Expected | Result |
|------|-------|----------|--------|
| `#FFF` caught | `color: #FFF;` | match | PASS |
| `#fff` caught | `color: #fff;` | match | PASS |
| `#fff8` whitelisted | `color: #fff8;` | no match | PASS |
| `#FFF8` whitelisted | `color: #FFF8;` | no match | PASS |

## Verification

| Check | Command | Result |
|-------|---------|--------|
| ProductSheet deleted | `test ! -f src/components/design-skill/ProductSheet.jsx` | PASS |
| No imports remain | `grep -rln "import.*ProductSheet" src/ \| wc -l` → 0 | PASS |
| 10 sibling components intact | loop `test -f src/components/design-skill/$f.jsx` for all 10 | PASS |
| New regex present | `grep -F "#[fF]{3}(?![0-9a-fA-F])" scripts/check-brand-rules.sh` | PASS |
| Old regex absent | `grep -F "#fff(?![0-9a-fA-F])" scripts/check-brand-rules.sh` → exit 1 | PASS |
| Rule 7 commented | `grep -n "Sample Piece" scripts/check-brand-rules.sh` → lines 112, 116 (commented) | PASS |
| Line count unchanged | `wc -l scripts/check-brand-rules.sh` → 129 | PASS |
| Brand check passes | `bash scripts/check-brand-rules.sh` → "All brand rules pass." exit 0 | PASS |
| Astro check passes | `astro check` → 23 files, 0 errors, 0 warnings | PASS |

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1: Delete ProductSheet.jsx | `f74cf59` | `chore(02-03): delete dead-code ProductSheet.jsx (CR-03)` |
| Task 2: Fix Rule 1 regex | `8072aa3` | `fix(02-03): tighten Rule 1 regex to catch uppercase #FFF (CR-05)` |

## Deviations from Plan

None — plan executed exactly as written.

## Reminder Note: Rule 7

`scripts/check-brand-rules.sh` Rule 7 (the sample-data leak grep) remains **commented out**. Uncommenting it is Plan 04's responsibility — Rule 7 depends on `src/sample-data.ts` being deleted first, which is Plan 04's Task 1.

## Known Stubs

None. This plan only deletes a file and edits a single regex character class.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes were introduced. The deletion of `ProductSheet.jsx` closes threat T-02-08 (modal modal pattern re-wiring confusion). The regex tightening closes T-02-07 (uppercase hex bypass of brand-non-negotiable). No new threat surface identified.

## Self-Check: PASSED

- `src/components/design-skill/ProductSheet.jsx` does not exist: CONFIRMED
- `scripts/check-brand-rules.sh` contains `#[fF]{3}(?![0-9a-fA-F])`: CONFIRMED
- `f74cf59` commit exists: CONFIRMED
- `8072aa3` commit exists: CONFIRMED
