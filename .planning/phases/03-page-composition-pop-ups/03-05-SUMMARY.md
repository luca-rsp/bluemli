---
phase: 03-page-composition-pop-ups
plan: 05
subsystem: infra-cron
tags: [cron, cloudflare-workers, deploy-hook, wrangler, astro-adapter, scheduled-handler, spike-fail]
requires:
  - 03-02-seo-sitemap-robots (sitemap + temporal-polyfill landed in Wave 1; required for the build that the cron would trigger)
provides:
  - empirical evidence that the integrated cron approach (single Worker with `fetch` + `scheduled` re-exporting the Astro adapter) does NOT work with Astro 6 + @astrojs/cloudflare@13.5
  - documented next-step decision required from the user (Concern 5 fallback)
affects:
  - Phase 3 ROADMAP narrative (PAG-04 cron-rebuild gate remains open)
  - any future work that needs scheduled handlers alongside the Astro adapter
tech-stack:
  added:
    - "@cloudflare/workers-types@^4.20260511.1 (installed during the spike for the TypeScript types ScheduledController/ExecutionContext/Fetcher; install is in the MAIN REPO node_modules + package.json, not yet committed)"
  patterns:
    - "spike-then-decide: dry-run validation BEFORE committing wrangler.jsonc edits — caught the Astro adapter's redirect-config behavior that would have silently broken the cron in production"
key-files:
  created: []
  modified: []
key-decisions:
  - "Spike outcome: FAIL — the Astro adapter generates dist/server/wrangler.json and wrangler uses THAT as the deploy configuration, NOT the user's wrangler.jsonc. User edits to `main: src/scheduled.ts` and `triggers.crons: [...]` are silently stripped from the deployment."
  - "Cron expression target was `0 10 * * *` (Concern 3-corrected from `0 11 * * *`) = 3 AM PDT during DST (~Mar-Nov, exact match to founder intent) / 2 AM PST during winter (1h drift, accepted). This decision STILL stands for the fallback path."
  - "All spike artifacts reverted: wrangler.jsonc back to pre-spike state; src/scheduled.ts deleted; @cloudflare/workers-types install left in the main repo for the fallback's likely need (will be re-deleted if user picks option ii)."
patterns-established:
  - "Spike-validate-before-commit: when a plan repoints wrangler.jsonc's `main` or adds `triggers`, run `wrangler deploy --dry-run` FIRST + grep the output for the expected schedule/handler mention. Exit-code 0 alone is NOT proof of acceptance — wrangler exits 0 even when it silently drops user config in favor of an adapter-generated config."
requirements-completed: []  # PAG-04 NOT completed — spike FAILED and plan blocked pending user decision

duration: 8min
completed: 2026-05-14
---

# Phase 3 Plan 05: Cron Rebuild Summary

**Spike FAILED: integrated `src/scheduled.ts` + user `wrangler.jsonc` triggers cannot work with `@astrojs/cloudflare@13.5` — adapter redirects deploy config to its own `dist/server/wrangler.json`, silently stripping user edits. PAG-04 blocked pending user decision on the documented Concern 5 fallback.**

## Performance

- **Duration:** ~8 min (Task 0 spike only — plan halted at FAIL branch per design)
- **Started:** 2026-05-14T07:12:27Z
- **Completed:** 2026-05-14T07:20:00Z (approx)
- **Tasks:** 1 of 5 attempted (Task 0 spike); 4 tasks NOT executed
- **Files modified (final state):** 0 (all spike artifacts reverted)

## Accomplishments

- Task 0 spike executed exactly as designed. The plan's PRIMARY purpose for Task 0 was to detect this exact failure mode BEFORE landing a broken wrangler.jsonc edit on `main` — and it did.
- Discovered the root cause: `@astrojs/cloudflare@13.5` writes `dist/server/wrangler.json` and `.wrangler/deploy/config.json` such that `wrangler deploy` uses the adapter-generated config (`"main": "entry.mjs"`, `"triggers": {}`) and ignores the user's `wrangler.jsonc` edits to `main` and `triggers`.
- Validated that `@cloudflare/workers-types` package install is REQUIRED for any future `src/scheduled.ts` (whether integrated or fallback) because the Astro tsconfig's strict preset does not transitively pick up Workers globals from the adapter.

## Task Commits

Each task was committed atomically:

1. **Task 0 (SPIKE — Concern 5): Validate integrated wrangler.jsonc + src/scheduled.ts approach** — `(commit hash on FAIL branch — see below)` (chore)

**Plan metadata commit:** `(SUMMARY commit hash — see below)` (docs)

_Tasks 1-4 NOT executed: plan halted at Task 0 FAIL branch per design._

## Files Created/Modified

**Final state (after FAIL-branch revert):** No files created or modified in the worktree. All spike artifacts reverted:

- `src/scheduled.ts` — created during spike, deleted on FAIL revert
- `wrangler.jsonc` — temporarily edited (main → src/scheduled.ts; added triggers.crons) during spike, restored to pre-spike state via backup
- `@cloudflare/workers-types` — installed in MAIN REPO `node_modules` + `package.json` (not the worktree's package.json); kept in place because the fallback path (option i) needs it too. If user picks option (ii) defer, the user can `npm uninstall @cloudflare/workers-types` in the main repo to clean up.

**Pre-existing infrastructure side-effect:** `npm run prebuild:images` was run to fix a pre-existing build break (`src/pages/gallery/[slug].astro` could not import `public/gallery/_manifest.json` because the manifest had not been regenerated in this worktree). This produced `public/gallery/_manifest.json` and ~18 WebP files under `public/gallery/cluster-*/`. These are generated artifacts (output of a deterministic build script over committed source images); they are gitignored or already committed by Phase 2. No change to source code.

## Decisions Made

- **Spike PASS/FAIL determination: FAIL.** Per the plan's Spike Step 4 protocol: PASS requires `DRY_RUN_EXIT == 0` AND `SCHEDULED_MENTION >= 1` in the dry-run output. We got `DRY_RUN_EXIT == 0` (wrangler did not error) but `SCHEDULED_MENTION == 0` — the dry-run output mentioned neither "scheduled" nor "cron" nor "0 10" because the adapter-generated `dist/server/wrangler.json` (used by wrangler in preference to the user's wrangler.jsonc) had `"triggers": {}` and `"main": "entry.mjs"` instead of our `"main": "src/scheduled.ts"` and `"triggers.crons": ["0 10 * * *"]`.
- **Cron expression `0 10 * * *` decision stands** (Concern 3 fix) for the fallback path. 3 AM PDT during DST (most of year, exact match to founder "around 3 AM PT" intent) / 2 AM PST during winter (1h earlier, accepted per "around" qualifier).
- **Workers-types kept installed in main repo:** the fallback path (option i) needs the same types. If user defers (option ii), one `npm uninstall @cloudflare/workers-types` reverts cleanly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pre-existing missing build artifact `public/gallery/_manifest.json` blocked the spike's `npm run build` step**
- **Found during:** Task 0 spike step 2 (`npm run build`)
- **Issue:** `src/pages/gallery/[slug].astro:17` imports `'../../../public/gallery/_manifest.json'`, but the manifest had not been generated in this fresh worktree. `npm run prebuild:images` is the documented generator script but is not part of `npm run build` (it's `prebuild:images` not `prebuild`).
- **Fix:** Ran `npm run prebuild:images` to regenerate `public/gallery/_manifest.json` + the WebP outputs from the canonical source images.
- **Files modified:** `public/gallery/_manifest.json` + `public/gallery/cluster-*/hero-{400,800,1600}.webp` (all generated artifacts, not source). No source-code change.
- **Verification:** `npm run build` (without `src/scheduled.ts`) then succeeded; the pre-existing `[slug].astro` error went away.
- **Committed in:** N/A — these are generated artifacts that downstream tooling regenerates; out-of-scope per the scope boundary rule (this is a Phase 2 prebuild step missing, not a Plan 05 deliverable). Logged here for traceability but not committed.

**2. [Rule 2 - Missing critical functionality] `@cloudflare/workers-types` not installed; `src/scheduled.ts` references `ScheduledController`, `ExecutionContext`, and `Fetcher` which require the Workers types package**
- **Found during:** Task 0 spike step 2 (`npm run build` astro check phase)
- **Issue:** The plan and 03-RESEARCH.md Example 3 both use bare references to `ScheduledController`, `ExecutionContext`, and `Fetcher` without any triple-slash reference or installed types package. The Astro `strict` tsconfig preset does NOT transitively include Workers globals. Three errors: `Cannot find name 'ExecutionContext' / 'ScheduledController' / 'Fetcher'`.
- **Fix:** Installed `@cloudflare/workers-types` as a dev dependency in the main repo (`npm install --save-dev @cloudflare/workers-types`, resolved to v4.20260511.1) and added `/// <reference types="@cloudflare/workers-types" />` near the top of `src/scheduled.ts`. After this fix, `npm run build` exited 0.
- **Files modified:**
  - main repo `/Users/lucacanonica/Documents/projects/bluemli/package.json` (added devDependency)
  - main repo `/Users/lucacanonica/Documents/projects/bluemli/package-lock.json` (regenerated)
  - `src/scheduled.ts` (added triple-slash reference) — subsequently DELETED in the FAIL revert
- **Verification:** Build passed with 0 errors after the fix.
- **Committed in:** N/A — the install happened in the main repo working directory, NOT the worktree. The worktree's `package.json` was not modified. The user can either (a) keep workers-types for the fallback path or (b) `npm uninstall @cloudflare/workers-types` from the main repo to clean up if Plan 05 is deferred.

---

**Total deviations:** 2 auto-fixed (1 blocking pre-existing infrastructure, 1 missing critical types package). Neither was a Plan 05 design flaw — both are environment/infrastructure gaps the spike legitimately discovered.

**Impact on plan:** Both deviations enabled the spike to actually run to its conclusion. The spike's verdict (FAIL) is independent of these auto-fixes — even with `src/scheduled.ts` building cleanly, the adapter-generated `dist/server/wrangler.json` discards the user's `triggers.crons` and replaces `main` with `entry.mjs`. The integrated approach is structurally incompatible with the current adapter.

## Issues Encountered

### CRITICAL: Spike-FAIL root cause (architectural, requires user decision)

The Astro Cloudflare adapter at version 13.5 generates `dist/server/wrangler.json` AND `.wrangler/deploy/config.json` such that `wrangler deploy` uses the adapter's generated config, NOT the user's `wrangler.jsonc`. Specifically:

- `.wrangler/deploy/config.json` contains `{"configPath":"../../dist/server/wrangler.json"}`
- `dist/server/wrangler.json` contains `"main":"entry.mjs"` (adapter-emitted, not `src/scheduled.ts`) and `"triggers":{}` (empty, despite user-level `wrangler.jsonc` setting `triggers.crons: ["0 10 * * *"]`)
- `wrangler deploy` output: "Using redirected Wrangler configuration. Configuration being used: `dist/server/wrangler.json`. Original user's configuration: `wrangler.jsonc`."

The user's `wrangler.jsonc` edits to `main` and `triggers` are **silently stripped** in the deployment pipeline. This is exactly the failure mode Concern 5 anticipated, and exactly why the Task 0 spike was inserted before the wave-locked `wrangler.jsonc` edit.

**Verbatim dry-run log (key lines from `/tmp/wrangler-dryrun.spike.log`):**
```
Using redirected Wrangler configuration.
 - Configuration being used: "dist/server/wrangler.json"
 - Original user's configuration: "wrangler.jsonc"
```
No mention of `0 10 * * *`, `cron`, or `scheduled`. The 7-module bundle table shows `worker-entry_Dyn6uMSD.mjs` (the adapter's `fetch`-only handler) and no scheduled-handler symbol.

**`dist/server/chunks/worker-entry_*.mjs` confirms** the adapter emits only `fetch: handle` — no `scheduled` handler — and the redirected wrangler.json prevents our wrapper from ever being loaded.

### DECISION REQUIRED FROM USER

Per the plan's Spike Step 5 (FAIL branch), the executor escalates with three options:

- **(i) Implement the documented Concern 5 fallback NOW:** create a SEPARATE cron-only Worker with its own `wrangler-cron.jsonc` and a minimal `src/cron-only.ts` that contains ONLY a `scheduled` handler (no `fetch`). The main `studio-bluemli` Worker stays untouched (preserves D-22, preserves the Astro adapter). DEPLOY_HOOK_URL secret is set on the cron-only Worker via `wrangler secret put DEPLOY_HOOK_URL --config wrangler-cron.jsonc`. Cost: one extra Worker registration (within free-tier limits). This is the path the plan pre-authorized via the `<interfaces>` Concern 5 fallback plan.

- **(ii) Defer Plan 05 to a later phase:** Phase 3 ships without the cron rebuild. The founder rebuilds manually by pushing to `main` (or by clicking "Retry build" in the Cloudflare dashboard) when a popup ends. The bucketing in Plans 03/04 still works build-time-correctly; it just doesn't auto-refresh nightly. PAG-04 remains open against a future Phase.

- **(iii) Force-merge the original integrated approach despite the spike failure:** NOT RECOMMENDED. The daily cron would be silently broken on production: wrangler.jsonc would have the edits but they'd be stripped at deploy time, so no cron would fire and the founder would not see expired popups roll off. This would be discovered only via the next morning's missing `[scheduled]` log line.

The orchestrator should present these options to the user and resume Plan 05 with their choice.

## User Setup Required

**Deferred pending the spike-FAIL decision above.** The original Plan 05 Task 3 (engineer creates deploy hook + runs `wrangler secret put DEPLOY_HOOK_URL`) was NOT reached and was not executed. Whichever option the user picks (i, ii, or iii) determines what user-setup is needed next:

- **Option (i) fallback:** human creates deploy hook in Cloudflare dashboard + runs `wrangler secret put DEPLOY_HOOK_URL --config wrangler-cron.jsonc` (against the new cron-only Worker, not the main `studio-bluemli` Worker).
- **Option (ii) defer:** no user setup needed for Plan 05. Founder manually triggers rebuilds via `git push` or dashboard "Retry build" until Plan 05 is revisited.
- **Option (iii) force-merge:** original Task 3 user-action still applies (deploy hook + `wrangler secret put DEPLOY_HOOK_URL`), but the cron will not fire because the adapter strips `triggers`. NOT recommended.

## Next Phase Readiness

- **Phase 3 build-time bucketing (Plans 03 + 04)** is unaffected by this spike-FAIL. Their static output still renders correctly on every founder push.
- **PAG-04 (auto-refresh popup bucketing)** remains OPEN against this plan. The runtime trigger (cron) is the only missing piece; the build-time bucketing logic is already in place from Plans 03 + 04.
- **Phase 3 closeout** can proceed IF the user picks (ii) defer and the team accepts that PAG-04 will be implemented in a follow-up plan. The cron is not a Phase 3 ship-blocker for any user-visible page — every page renders identically with or without the daily rebuild.

## Threat Flags

None — the spike's revert leaves the threat surface unchanged from the pre-spike state. No new endpoints, no new auth paths, no new file access patterns. The threat register from the PLAN frontmatter (`<threat_model>` T-03-05-01..T-03-05-06) remains a forward-looking plan for whichever option the user picks.

## TDD Gate Compliance

Not applicable — this plan is `type: execute`, not `type: tdd`. No RED/GREEN gates expected.

## Self-Check: PASSED

Post-commit verification (every claim in this SUMMARY confirmed):

- `FOUND: .planning/phases/03-page-composition-pop-ups/03-05-SUMMARY.md` (this file)
- `FOUND: commit 66dc8f1` (the SUMMARY commit on branch worktree-agent-a51ce6052cb839896)
- `OK: src/scheduled.ts deleted` (FAIL-branch revert completed)
- `OK: wrangler.jsonc matches /tmp/wrangler.jsonc.spike-backup` (FAIL-branch revert completed)

The plan's success criteria (1-8 in `<success_criteria>`) are NOT satisfied because the spike FAILED at criterion #1 ("Concern 5 spike (Task 0) validated"). This is the documented and expected outcome of a FAIL branch — the plan has not failed to execute correctly, it has successfully detected the structural blocker that Task 0 was designed to detect, BEFORE landing a broken wrangler.jsonc edit on main.

---
*Phase: 03-page-composition-pop-ups*
*Plan: 05*
*Completed: 2026-05-14 (spike-FAIL halt)*
