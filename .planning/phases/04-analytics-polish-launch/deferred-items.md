# Deferred Items — Phase 04

Out-of-scope discoveries logged during execution but NOT addressed in this plan.
Per execute-plan.md SCOPE BOUNDARY: only fix issues directly caused by current task's changes.

## From 04-01 (Umami analytics wiring)

### Pre-existing `scripts/check-no-hydration.sh` failure

- **Found during:** Task 1 verification (after BaseLayout edits).
- **Symptom:** `bash scripts/check-no-hydration.sh` exits 1, reporting
  `dist/client/_astro/client.DIYMaoE_.js` exceeds 10240 bytes (actual: ~194 KB).
- **Cause:** Pre-existing. Verified by stashing the BaseLayout changes and
  re-running the script — same failure. No `client:` directives appear in `src/`
  (only references inside `.jsx` comments).
- **Likely origin:** Phase 1 / Phase 2 astro.config or a stray hydration trigger
  inside `@astrojs/react` SSR scaffolding. Out-of-scope for 04-01 (this plan adds
  only a `<script async>` tag and `data-umami-event` attributes — none of which
  pull React into the client bundle).
- **Scope note:** Plan 04-01's acceptance criteria reference this check but the
  check was failing **before** any edits were made. Skipping per SCOPE BOUNDARY.
  Recommend a follow-up plan in Phase 04 (or earlier-phase backfix) to diagnose
  why `_astro/client.*.js` is being emitted at all.
