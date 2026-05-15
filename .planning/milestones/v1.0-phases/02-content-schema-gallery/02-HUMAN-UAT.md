---
status: complete
phase: 02-content-schema-gallery
source: [02-VERIFICATION.md]
started: 2026-05-13T16:18:00Z
updated: 2026-05-13T19:55:00Z
---

## Current Test

[all signed off — item 5 deferred to a real PR run]

## Tests

### 1. Visual confirmation of `/gallery` index
expected: Six cards in a responsive grid, all photos load (cluster-{blush,cobalt,coral,lavender,saffron,sage}/hero-400.webp), each card shows a quiet 'Available' status indicator and is clickable to /gallery/<slug>. Mobile-friendly at ≤640px.
result: passed (user confirmed via `pnpm run dev` at http://localhost:4321/gallery)

### 2. Visual confirmation of `/gallery/cluster-blush`
expected: Hero photo (800w) at native aspect ratio, then name + price + status badge + description + CTA button ("Ask about this pair on Instagram") + mailto fallback, all centered, 640px max width. IG CTA is the primary call-to-action; mailto sits below it.
result: passed (user confirmed via dev server)

### 3. SC2 typo reject — error-message clarity
expected: Change `status` to `availabilty: sold` (deliberate typo) in any gallery `index.md`, run `pnpm exec astro check`. Build fails with `Unrecognized key 'availabilty'` (or similar founder-readable Zod error). Restore the file.
result: passed (accepted programmatic verification via `scripts/test-content-contracts.sh` SC2 mutation — `[SC2] PASS: astro check rejected the typo with a clear schema error.`)

### 4. SC3 sold-badge visual polish
expected: Change `status: available` to `status: sold` in any gallery `index.md`, rebuild, confirm lavender "Sold" badge + flipped CTA copy.
result: passed (accepted programmatic verification via `scripts/test-content-contracts.sh` SC3 mutation — `[SC3] PASS: sold piece renders, contains 'Sold' label and D-11 CTA copy.`)

### 5. End-to-end SC1 PR-preview dry-run
expected: On GitHub.com, create a new branch, drag a photo into `src/content/gallery/cluster-test/`, add `index.md` with valid frontmatter, open a PR, wait for the Cloudflare preview deploy. New piece appears at `/gallery` and `/gallery/cluster-test` within ~5 minutes.
result: deferred (user opted to mark phase complete now; the live founder-workflow validation will happen the first time a real piece is added)

### 6. CNT-06 trust check — edit YAML, see change
expected: Change `ig_handle` in `src/content/site/config.yaml` from `studiobluemli` to `studiobluemli_test`, run `pnpm run build`, grep `dist/client/index.html` for `instagram.com/studiobluemli_test`. Footer href reflects the edited handle. Restore the YAML.
result: passed (orchestrator demonstrated end-to-end: edit flipped footer href to `instagram.com/studiobluemli_test`; restore flipped it back to `instagram.com/studiobluemli`)

## Summary

total: 6
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0
deferred: 1

## Gaps
