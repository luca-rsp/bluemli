---
phase: 03-page-composition-pop-ups
plan: 05
type: execute
wave: 3
depends_on: ["03-02"]
files_modified:
  - src/scheduled.ts
  - wrangler.jsonc
autonomous: false
requirements: [PAG-04]
user_setup:
  - service: cloudflare-workers-builds
    why: "Daily ~3 AM PT cron rebuild so expired popups roll off the upcoming list without founder action (PAG-04 + ROADMAP lock)."
    env_vars:
      - name: DEPLOY_HOOK_URL
        source: "Cloudflare dashboard > Workers & Pages > studio-bluemli > Settings > Builds > Deploy Hooks > New (name: daily-rebuild, branch: main); copy the URL."
    dashboard_config:
      - task: "Create the Workers Builds deploy hook 'daily-rebuild' targeting branch 'main'."
        location: "Cloudflare dashboard > Workers & Pages > studio-bluemli > Settings > Builds > Deploy Hooks."
      - task: "Run `wrangler secret put DEPLOY_HOOK_URL` locally and paste the URL when prompted."
        location: "Engineer's local terminal."
must_haves:
  truths:
    - "wrangler.jsonc has `triggers.crons: [\"0 10 * * *\"]` and `main` repointed to `src/scheduled.ts` (with `run_worker_first: [\"/api/*\"]` preserved unchanged per D-22)."
    - "The cron expression `0 10 * * *` fires at 10:00 UTC daily, which is 3 AM PDT (Mar–Nov, UTC-7) and 2 AM PST (Nov–Mar, UTC-8). Per Concern 3 reconciliation: founder said 'around 3 AM PT' and DST is active much of the year — `0 10` matches 3 AM during DST exactly. The 2 AM PST winter drift is accepted (one extra hour earlier, both well after midnight)."
    - "src/scheduled.ts re-exports the Astro adapter's `fetch` handler and adds a `scheduled` handler that POSTs to env.DEPLOY_HOOK_URL."
    - "The deploy hook URL is stored only as a Worker secret (`wrangler secret put DEPLOY_HOOK_URL`); it never appears in the repo, in wrangler.jsonc vars, or in build logs."
    - "`wrangler deploy --dry-run` succeeds and lists the cron trigger and the scheduled handler; this validates Assumption A1 from RESEARCH.md (re-pointing main to src/scheduled.ts works with the adapter). The Concern 5 spike step (Task 0) runs this dry-run BEFORE Wave 3 wave-locked work proceeds."
  artifacts:
    - path: "src/scheduled.ts"
      provides: "Worker entry that fronts the Astro adapter + adds a daily scheduled handler for the deploy-hook POST"
      contains: "scheduled"
    - path: "wrangler.jsonc"
      provides: "Wrangler config with main pointing to src/scheduled.ts and triggers.crons configured"
      contains: "triggers"
  key_links:
    - from: "wrangler.jsonc (triggers.crons)"
      to: "src/scheduled.ts (scheduled handler)"
      via: "Cloudflare Workers runtime invokes `default.scheduled` on cron tick"
      pattern: "scheduled"
    - from: "src/scheduled.ts"
      to: "@astrojs/cloudflare/entrypoints/server"
      via: "import handler from '@astrojs/cloudflare/entrypoints/server'; export default.fetch = handler.fetch"
      pattern: "@astrojs/cloudflare/entrypoints/server"
    - from: "src/scheduled.ts"
      to: "Workers Builds Deploy Hook"
      via: "fetch(env.DEPLOY_HOOK_URL, { method: 'POST' })"
      pattern: "DEPLOY_HOOK_URL"
---

<objective>
Wire the daily ~3 AM PT cron rebuild so expired pop-ups fall off the upcoming list without founder action (PAG-04, ROADMAP-locked, founder-confirmed). The mechanism: a Cloudflare Workers scheduled handler on the existing `studio-bluemli` Worker that POSTs to a Workers Builds deploy hook URL once per day. Free-tier compatible (1 cron of the 5 allowed; 1 build/day well under the 100/day cap).

Purpose: Plans 03 and 04 already ship the build-time TZ-aware bucketing; this plan is the runtime trigger that makes that bucketing self-refresh. Without it, a popup that ended yesterday would still appear in the "upcoming" section until the next founder commit. With it, the build re-runs every morning around 3 AM PT and the bucketing recomputes against a fresh LA-local "today".

This plan is NOT autonomous — Task 3 requires a human (engineer or founder) to (a) create the deploy hook in the Cloudflare dashboard, (b) copy its URL, and (c) run `wrangler secret put DEPLOY_HOOK_URL`. Both halves of step (a) and (c) cannot be automated by Claude: dashboard hook creation has no CLI, and `wrangler secret put` requires interactive input.

**REVIEWS-MODE FIXES (this plan addresses 3 Codex concerns):**

1. **Concern 3 (HIGH) — Cron UTC math inverted.** Original plan claimed `"0 11 * * *"` is 3 AM PDT / 4 AM PST. It's actually 4 AM PDT / 3 AM PST. FIX: switch to `"0 10 * * *"` (10:00 UTC) which is 3 AM PDT (Mar–Nov, UTC-7) and 2 AM PST (Nov–Mar, UTC-8). This matches founder's stated "around 3 AM PT" intent EXACTLY during the DST window (which is most of the year — DST runs Mar–Nov in the US). The PST winter drift is one hour earlier (2 AM PST instead of 3 AM PST), which is still well after midnight and acceptable per the founder's "around" qualifier. Comment + acceptance criteria + cron expression all aligned to `0 10 * * *`.

2. **Concern 5 (HIGH) — Plan 05 `src/scheduled.ts` integration risk.** Original plan repointed `wrangler.jsonc.main` away from the Astro adapter entrypoint to a custom `src/scheduled.ts` — unproven against `@astrojs/cloudflare@13`. FIX: NEW Task 0 (Spike) runs at the START of Plan 05 BEFORE the `wrangler.jsonc` edit. Steps: (1) create `src/scheduled.ts`, (2) `npm run build`, (3) `npx wrangler deploy --dry-run`. If the dry-run fails, Plan 05 STOPS — the executor surfaces the failure and the documented fallback kicks in: a separate cron-only Worker that posts to the deploy hook, leaving the main Astro Worker entrypoint untouched. Pass/fail criteria explicit in Task 0.

3. **Concern 8 (MEDIUM) — Grep chains break on zero matches.** All "expect zero" verifications use `! grep -q PATTERN file` or `grep -c PATTERN file || true` to avoid shell-chain failure.

Output (1 new file + 1 modified file + 1 spike checkpoint + 1 human-action checkpoint):
- **Task 0 (Concern 5 spike):** create `src/scheduled.ts` → `npm run build` → `npx wrangler deploy --dry-run`. If dry-run passes, proceed. If it fails, escalate per documented fallback.
- `src/scheduled.ts` — new Worker entrypoint that re-exports the Astro adapter's `fetch` and adds a `scheduled` handler.
- `wrangler.jsonc` — `main` repointed from `@astrojs/cloudflare/entrypoints/server` to `src/scheduled.ts`; new `triggers.crons` block added with `"0 10 * * *"` (Concern 3 fix); `run_worker_first: ["/api/*"]` preserved untouched (D-22).
- Checkpoint task: human creates the deploy hook in Cloudflare dashboard, copies the URL, runs `wrangler secret put`.
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
@.planning/phases/03-page-composition-pop-ups/03-REVIEWS.md
@.planning/phases/03-page-composition-pop-ups/03-02-SUMMARY.md
@CLAUDE.md
@wrangler.jsonc
@astro.config.mjs

<interfaces>
Cloudflare Workers scheduled handler signature (verified in workers/configuration/cron-triggers/ docs):
```typescript
interface ExportedHandler<Env> {
  fetch?(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
  scheduled?(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void>;
}
```

Workers Builds deploy hook contract (verified in workers/ci-cd/builds/deploy-hooks/ docs):
- URL shape: `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/<hook-id>` (legacy Pages format) or the new Workers Builds equivalent. The URL itself contains the hook-id; no Authorization header needed; rate-limited to 10 POST/min/Worker.
- POST with no body triggers a new build on the configured branch (we use `main`).
- Response: 200 on success, 4xx on invalid URL or branch.

Astro adapter entrypoint:
- Module path: `@astrojs/cloudflare/entrypoints/server`
- Default export shape: `{ fetch: (request, env, ctx) => Response, ... }`
- Verified file existence: `node_modules/@astrojs/cloudflare/dist/entrypoints/server.js` exists post-Plan 02 npm install.

Current wrangler.jsonc state (pre-edit):
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "studio-bluemli",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "compatibility_date": "2026-05-12",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "run_worker_first": ["/api/*"]
  },
  "observability": { "enabled": true }
}
```

**Concern 3 cron math reference table** (verified at planning time):

| Cron | UTC time | PDT (Mar–Nov, UTC-7) | PST (Nov–Mar, UTC-8) |
|------|----------|----------------------|----------------------|
| `0 10 * * *` | 10:00 UTC | **3 AM PDT** ← matches founder intent during DST (most of year) | **2 AM PST** ← winter drift (1h earlier than 3 AM, accepted) |
| `0 11 * * *` | 11:00 UTC | **4 AM PDT** ← later than founder intent during DST | **3 AM PST** ← matches founder intent during PST (winter only) |

**Decision (Concern 3):** Use `0 10 * * *` because (a) DST is active March through November — most of the year — and matches the founder's "3 AM PT" intent EXACTLY during DST, (b) the winter drift is 2 AM PST which is one hour earlier (still well after midnight, both fire long before any visitor traffic), (c) using two crons (`0 10` AND `0 11`) would burn 2× the free-tier build budget for marginal benefit. Founder accepts the ±1h winter drift.

**Concern 5 fallback plan** (separate cron-only Worker, used only if Task 0 dry-run fails):
- Create a new tiny Worker (e.g., `studio-bluemli-cron`) with its OWN `wrangler-cron.jsonc` config and a minimal `src/cron-only.ts` containing ONLY a `scheduled` handler (no `fetch`).
- `wrangler-cron.jsonc` `main` points at `src/cron-only.ts`; `triggers.crons: ["0 10 * * *"]`.
- The main `studio-bluemli` Worker's `wrangler.jsonc` stays exactly as-is (untouched main, no triggers added).
- The cron-only Worker is deployed separately via `npx wrangler deploy --config wrangler-cron.jsonc`.
- Founder still runs `wrangler secret put DEPLOY_HOOK_URL --config wrangler-cron.jsonc` for the secret.
- Cost: one extra Worker registration (within free-tier limits), no impact on the main Worker's behavior.
- Documentation: this fallback gets written into `OPS.md` (created in Task 3) so future engineers can find it.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 0 (SPIKE — Concern 5): Validate that re-pointing wrangler.jsonc.main to src/scheduled.ts works with the @astrojs/cloudflare adapter BEFORE the wave-locked wrangler.jsonc edit</name>
  <read_first>
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md §"Example 3" (the verbatim scheduled.ts code) + Pitfall 5 (the "never log DEPLOY_HOOK_URL" rule) + Assumption A1 (the adapter-entrypoint wrapping is acceptable per the docs but should be probed via `wrangler deploy --dry-run`)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 5: spike step before Wave 3 wave-locked work; documented fallback to separate cron-only Worker)
    - astro.config.mjs (confirms `adapter: cloudflare({})` is configured — required for the adapter entrypoint export to exist)
  </read_first>
  <behavior>
    - **PASS condition:** `npx wrangler deploy --dry-run` exits 0 AND the output mentions either the cron expression `0 10 * * *` OR the literal string "scheduled" OR the literal string "cron". This proves Assumption A1: the Astro adapter accepts being wrapped by a custom Worker entrypoint that re-exports `fetch` and adds `scheduled`.
    - **FAIL condition:** dry-run exits non-zero, OR the output contains "no scheduled handler", "adapter assets unreachable", "build manifest missing", or any other adapter-incompatibility message.
    - On PASS: proceed to Task 1 (this spike's `src/scheduled.ts` is also Task 1's target file — no duplication; Task 1 just confirms its existence + acceptance criteria).
    - On FAIL: STOP. Plan 05 does NOT proceed with the wrangler.jsonc edit. The executor escalates to the user via a checkpoint message containing (a) the dry-run output, (b) the documented fallback (separate cron-only Worker — see `<interfaces>` Concern 5 fallback plan above). The user decides whether to (i) implement the fallback (cron-only Worker), (ii) defer Plan 05 to a later phase, or (iii) accept and merge a known-broken cron path (NOT recommended).
  </behavior>
  <action>
**Spike Step 1 — Create `src/scheduled.ts` (the same file Task 1 owns; this spike pre-creates it for the dry-run validation):**

Use the Write tool. Create `src/scheduled.ts` with these contents:

```typescript
// src/scheduled.ts — Phase 3 PAG-04 / D-12.
// Worker entrypoint: re-exports the Astro adapter's `fetch` (for static + reserved /api/*)
// and adds a `scheduled` handler that POSTs to a Workers Builds deploy hook to
// trigger a fresh build every day at the configured cron time.
//
// Why this file: the Astro Cloudflare adapter emits a `fetch`-only entrypoint.
// Adding a `scheduled` handler requires our own entry that composes both
// (Option A in 03-RESEARCH.md §"Example 3").
//
// Pitfall 5 (RESEARCH.md): DEPLOY_HOOK_URL is a credential. Never log it. Store
// only via `wrangler secret put DEPLOY_HOOK_URL`. The Cloudflare docs phrase:
// "Store Deploy Hook URLs in environment variables or a secrets manager, never
// in source code or public configuration files."

import handler from '@astrojs/cloudflare/entrypoints/server';

interface Env {
  ASSETS: Fetcher;
  // Set via `wrangler secret put DEPLOY_HOOK_URL`. Never committed.
  DEPLOY_HOOK_URL: string;
}

export default {
  // Delegate all HTTP traffic to the Astro adapter (static assets + reserved /api/*).
  fetch: handler.fetch,

  // Cron-triggered rebuild (PAG-04). Fires at the time configured in wrangler.jsonc
  // `triggers.crons`. ctx.waitUntil keeps the invocation alive until the POST
  // resolves. The deploy hook responds 200 on success; non-2xx is logged for
  // debugging but does NOT log the URL itself.
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      fetch(env.DEPLOY_HOOK_URL, { method: 'POST' })
        .then((r) => {
          if (!r.ok) {
            // Log status + statusText only — never the URL (Pitfall 5).
            console.error('Deploy hook returned non-OK:', r.status, r.statusText);
          }
        })
        .catch((err) => {
          // Log the error message only — never the URL.
          console.error('Deploy hook fetch failed:', err instanceof Error ? err.message : String(err));
        }),
    );
  },
};
```

**Spike Step 2 — Run `npm run build`:**

```bash
npm run build 2>&1 | tail -20
```

Expected: exit 0, no errors mentioning `src/scheduled.ts`, `@astrojs/cloudflare/entrypoints/server`, or "module not found". The build should produce the standard Astro adapter output in `dist/server/` plus the static assets in `dist/client/`.

**Spike Step 3 — TEMPORARILY edit `wrangler.jsonc` to repoint `main` to `src/scheduled.ts` for the dry-run, then revert:**

This is the critical validation step. We need wrangler to dry-run-deploy with the NEW main path to validate it works, but we don't want to commit the wrangler.jsonc edit until we know it works. So we make the edit, run the dry-run, and IMMEDIATELY revert if the spike fails.

(a) Read the current `wrangler.jsonc`:
```bash
cp wrangler.jsonc /tmp/wrangler.jsonc.spike-backup
```

(b) Use the Edit tool to change `"main": "@astrojs/cloudflare/entrypoints/server"` to `"main": "src/scheduled.ts"` in `wrangler.jsonc`. Also TEMPORARILY add a `"triggers": { "crons": ["0 10 * * *"] }` block at the end (before the closing `}`). This mirrors the final Task 2 state.

(c) Run the dry-run:
```bash
npx wrangler deploy --dry-run 2>&1 | tee /tmp/wrangler-dryrun.spike.log | tail -30
```

(d) Capture pass/fail:
```bash
DRY_RUN_EXIT=$?
echo "DRY_RUN_EXIT=$DRY_RUN_EXIT"
SCHEDULED_MENTION=$(grep -ciE "scheduled|0 10|cron" /tmp/wrangler-dryrun.spike.log || true)
echo "SCHEDULED_MENTION=$SCHEDULED_MENTION"
```

**Spike Step 4 — Decide PASS or FAIL:**

- **PASS:** `DRY_RUN_EXIT == 0` AND `SCHEDULED_MENTION >= 1`. The wrangler.jsonc temporary edit STAYS — Task 2 will refine it (add the JSONC comments, make the changes permanent). Task 1 will document src/scheduled.ts as already-created. Proceed to Task 1.

- **FAIL:** Either `DRY_RUN_EXIT != 0` OR `SCHEDULED_MENTION == 0`. Revert the wrangler.jsonc edit:
  ```bash
  cp /tmp/wrangler.jsonc.spike-backup wrangler.jsonc
  ```
  Also remove `src/scheduled.ts` (it's no longer needed in the main repo if we're going to a separate Worker):
  ```bash
  rm src/scheduled.ts
  ```
  Then surface the failure to the user via the checkpoint format below. Do NOT proceed to Task 2.

**Spike Step 5 (FAIL branch only) — Surface the fallback to the user:**

Print this message:

```
SPIKE FAILED — Task 0 (Concern 5) dry-run did not validate Assumption A1.

Dry-run output:
<paste tail of /tmp/wrangler-dryrun.spike.log>

Reverted: wrangler.jsonc back to original state; src/scheduled.ts removed.

DOCUMENTED FALLBACK (per REVIEWS-MODE Concern 5):
Implement a SEPARATE cron-only Worker. The main studio-bluemli Worker stays
untouched (preserves D-22, preserves the Astro adapter). The new Worker (e.g.,
studio-bluemli-cron) has its own wrangler-cron.jsonc with triggers.crons and
a minimal src/cron-only.ts that contains ONLY a scheduled handler (no fetch).
The DEPLOY_HOOK_URL secret is set on the cron-only Worker.

DECISION REQUIRED FROM YOU:
  (i)   Implement the cron-only Worker fallback now (Task 1+ rewritten for the fallback shape)
  (ii)  Defer Plan 05 to a later phase (Phase 3 ships without the cron rebuild;
        manual rebuild via push-to-main is the workaround until Plan 05 lands)
  (iii) Force-merge the original integrated approach despite the spike failure
        (NOT RECOMMENDED — daily cron will be silently broken on production)

Type your choice (i, ii, or iii) and we'll proceed.
```

Wait for user response. Do NOT proceed without an explicit answer.
  </action>
  <verify>
    <automated>test -f src/scheduled.ts && npm run build 2>&1 | tail -10 && npx wrangler deploy --dry-run 2>&1 | tee /tmp/wrangler-dryrun.spike.log | tail -10 && grep -ciE "scheduled|0 10|cron" /tmp/wrangler-dryrun.spike.log</automated>
  </verify>
  <acceptance_criteria>
    - `test -f src/scheduled.ts` exits 0
    - `npm run build` exits 0 with no module-not-found errors mentioning the new src/scheduled.ts
    - `npx wrangler deploy --dry-run` exits 0 (PASS branch — the spike validated Assumption A1)
    - `grep -ciE "scheduled|0 10|cron" /tmp/wrangler-dryrun.spike.log` returns at least 1 (the dry-run output acknowledges the cron trigger or scheduled handler)
    - On FAIL branch: wrangler.jsonc reverted to its pre-spike state (verified via `diff /tmp/wrangler.jsonc.spike-backup wrangler.jsonc` returning no output); src/scheduled.ts deleted; user prompted with the documented fallback message and waiting for their response. The plan stops here on FAIL.
  </acceptance_criteria>
  <done>
    PASS branch: spike validated; src/scheduled.ts is created and the temporary wrangler.jsonc edit is in place (Task 2 refines it). FAIL branch: clean revert, user prompted, plan stops.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 1: Create src/scheduled.ts (CONFIRM existence post-spike — Worker entry re-exporting Astro adapter fetch + scheduled handler)</name>
  <read_first>
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md Example 3 (the verbatim scheduled.ts code) + Pitfall 5 (the "never log DEPLOY_HOOK_URL" rule)
    - src/scheduled.ts (created in Task 0; this task verifies its acceptance criteria are met)
  </read_first>
  <behavior>
    - `src/scheduled.ts` already exists from Task 0 (the spike). This task is the formal acceptance check.
    - The file imports the Astro adapter's default export and re-exports its `fetch` method.
    - The `scheduled` method POSTs to `env.DEPLOY_HOOK_URL` with no body and no auth header.
    - The POST is wrapped in `ctx.waitUntil(...)`.
    - Errors logged via `console.error` WITHOUT including the URL itself (Pitfall 5).
    - The `Env` interface declares `ASSETS: Fetcher` and `DEPLOY_HOOK_URL: string`.
  </behavior>
  <action>
**This task is a verification gate over the file created in Task 0.** Do NOT re-create the file (avoid clobbering the spike artifact). If `src/scheduled.ts` does not exist (Task 0 was on the FAIL branch and the file was deleted), this task should not run — the plan stopped at Task 0.

Verify the existing `src/scheduled.ts` matches the contract via the acceptance criteria below. If any criterion fails (e.g., the file was edited externally between Task 0 and Task 1), re-write it to the Task 0 contents.

**Anti-pattern checks (apply during verification):**
- The file MUST NOT contain the deploy hook URL or any partial URL pattern (no `pages/webhooks` literal, no hard-coded URL fragments).
- The file MUST NOT log `env.DEPLOY_HOOK_URL` or interpolate it into any string passed to `console.*`.
- The file MUST NOT export `default { ... }` without both `fetch` and `scheduled` — both are required for the adapter integration to be valid.
  </action>
  <verify>
    <automated>test -f src/scheduled.ts && grep -c "import handler from '@astrojs/cloudflare/entrypoints/server'" src/scheduled.ts && grep -c "DEPLOY_HOOK_URL" src/scheduled.ts && grep -c "fetch: handler.fetch" src/scheduled.ts && grep -c "async scheduled" src/scheduled.ts && grep -c "ctx.waitUntil" src/scheduled.ts && (grep -cE "console\.(log|error|warn|info).*DEPLOY_HOOK_URL" src/scheduled.ts || true) && (grep -cE "pages/webhooks|deploy_hooks|cloudflare\.com" src/scheduled.ts || true) && npx astro check 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `test -f src/scheduled.ts` exits 0
    - `grep -c "import handler from '@astrojs/cloudflare/entrypoints/server'" src/scheduled.ts` returns 1
    - `grep -c "DEPLOY_HOOK_URL" src/scheduled.ts` returns at least 2 (Env interface + handler)
    - `grep -c "fetch: handler.fetch" src/scheduled.ts` returns 1
    - `grep -c "async scheduled" src/scheduled.ts` returns 1
    - `grep -c "ctx.waitUntil" src/scheduled.ts` returns 1
    - **Pitfall 5:** `! grep -qE "console\.(log|error|warn|info)[^)]*DEPLOY_HOOK_URL" src/scheduled.ts` exits 0 (URL never logged)
    - **No URL leak:** `! grep -qE "pages/webhooks|deploy_hooks|cloudflare\.com" src/scheduled.ts` exits 0 (no URL fragment hardcoded)
    - `npx astro check` exits 0
  </acceptance_criteria>
  <done>
    `src/scheduled.ts` exists, type-checks against the Astro adapter's entrypoint, declares the Env interface, and never logs the deploy hook URL. Spike validated, file ready for production.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Finalize wrangler.jsonc — confirm main repointed to src/scheduled.ts + cron set to "0 10 * * *" (Concern 3) + JSONC comments + preserve D-22</name>
  <read_first>
    - wrangler.jsonc (current state — partially edited by Task 0 spike: `main` is `src/scheduled.ts` and `triggers.crons` is `["0 10 * * *"]`; this task adds the JSONC comments and confirms the final shape)
    - .planning/phases/03-page-composition-pop-ups/03-CONTEXT.md (D-22: leave `run_worker_first: ["/api/*"]` alone)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md §Example 3 (target wrangler.jsonc shape) + Pitfall 1 (the DST drift comment to add)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 3: cron is `0 10 * * *` — 3 AM PDT, 2 AM PST; founder accepts winter drift)
  </read_first>
  <behavior>
    - `"main"` is `"src/scheduled.ts"` (set by Task 0 spike; this task confirms it stays).
    - `"triggers"` block has `"crons": ["0 10 * * *"]` (Concern 3 fix — was originally `"0 11 * * *"` in the pre-spike plan).
    - JSONC comments near the `triggers` block explain the DST behavior CORRECTLY (Concern 3): `0 10` UTC = 3 AM PDT during DST (most of year, exact match) and 2 AM PST during winter (one hour earlier than 3 AM, accepted drift).
    - `assets.run_worker_first: ["/api/*"]` is preserved verbatim (D-22 cross-check).
    - All other config (name, compatibility_date, compatibility_flags, assets.directory, assets.binding, observability) is preserved exactly.
  </behavior>
  <action>
**Edit `wrangler.jsonc`:** Use the Edit tool. The full target state (replace the entire file). Note the Concern 3-corrected cron expression and DST comment:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "studio-bluemli",
  // Phase 3 (PAG-04): main now points at src/scheduled.ts so the Worker has both
  // a `fetch` handler (delegated to the Astro adapter for static + /api/*) and a
  // `scheduled` handler (the daily deploy-hook POST). Validated via Task 0 spike
  // (REVIEWS-MODE Concern 5).
  "main": "src/scheduled.ts",
  "compatibility_date": "2026-05-12",
  "compatibility_flags": ["nodejs_compat"],

  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    // D-22: preserved untouched. Reserved for future v1.x contact-form revival
    // (the contact form was dropped from v1 per D-18). No live /api/* route ships
    // in Phase 3.
    "run_worker_first": ["/api/*"]
  },

  // Phase 3 PAG-04 / D-12: daily ~3 AM PT cron rebuild via Workers Builds deploy hook.
  // REVIEWS-MODE Concern 3 fix: cron expressions are UTC.
  // "0 10 * * *" = 10:00 UTC daily, which is:
  //   - 3 AM PDT (Mar–Nov, UTC-7) ← matches founder's "around 3 AM PT" intent EXACTLY
  //                                  during DST (which is most of the year in the US)
  //   - 2 AM PST (Nov–Mar, UTC-8) ← winter drift: one hour earlier than the founder's
  //                                  "around 3 AM" intent, accepted per the "around"
  //                                  qualifier. Both fire well after midnight, long
  //                                  before any visitor traffic, so the practical
  //                                  difference is zero.
  // Using two crons to bracket the seasons (e.g., "0 10" + "0 11") would burn 2× the
  // free-tier build budget for negligible gain — single-cron is the documented choice.
  // Free-tier accounting: 5 cron triggers/account allowed, we use 1.
  "triggers": {
    "crons": ["0 10 * * *"]
  },

  "observability": {
    "enabled": true
  }
}
```

Validate the result with the SDK frontmatter helper or by parsing the JSONC manually. JSONC (JSON-with-comments) is parsed by wrangler natively; `node -e "JSON.parse(...)"` will FAIL on this file because of the comments — DON'T use that as the validation. Instead, use:

```bash
# Strip line and block comments before parsing.
node -e "
  const fs = require('fs');
  const text = fs.readFileSync('wrangler.jsonc', 'utf8');
  // Strip // line comments and /* block comments */ (basic stripper — JSONC is permissive).
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*\$/gm, '');
  JSON.parse(stripped);
  console.log('JSONC parses OK');
"
```

Expected: prints "JSONC parses OK".

**D-22 cross-check:** After the edit, `grep -c '"run_worker_first"' wrangler.jsonc` returns 1, and the value array is still exactly `["/api/*"]`. Do NOT remove this line in any task in this plan or anywhere else in Phase 3.

**Concern 3 cross-check:** After the edit, `grep -cE '"crons":\s*\["0 10 \* \* \*"\]' wrangler.jsonc` returns 1 (the corrected cron expression). The OLD `"0 11 * * *"` MUST NOT appear: `! grep -q '"0 11 \* \* \*"' wrangler.jsonc` exits 0.
  </action>
  <verify>
    <automated>grep -c '"main": "src/scheduled.ts"' wrangler.jsonc && grep -c '"triggers"' wrangler.jsonc && grep -cE '"crons":\s*\["0 10 \* \* \*"\]' wrangler.jsonc && (grep -cE '"crons":\s*\["0 11 \* \* \*"\]' wrangler.jsonc || true) && grep -cE '"run_worker_first":\s*\["/api/\*"\]' wrangler.jsonc && (grep -c '@astrojs/cloudflare/entrypoints/server' wrangler.jsonc || true) && node -e "const fs=require('fs');const t=fs.readFileSync('wrangler.jsonc','utf8');JSON.parse(t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*\$/gm,''));console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c '"main": "src/scheduled.ts"' wrangler.jsonc` returns 1
    - `! grep -q '@astrojs/cloudflare/entrypoints/server' wrangler.jsonc` exits 0 (the old main path is gone)
    - `grep -c '"triggers"' wrangler.jsonc` returns 1
    - **Concern 3:** `grep -cE '"crons":\s*\["0 10 \* \* \*"\]' wrangler.jsonc` returns 1 (the corrected cron expression)
    - **Concern 3:** `! grep -q '"0 11 \* \* \*"' wrangler.jsonc` exits 0 (the wrong cron from the pre-spike plan is NOT in the file)
    - **D-22:** `grep -c '"run_worker_first":' wrangler.jsonc` returns 1 (preserved)
    - **D-22:** `grep -cE '"run_worker_first":\s*\["/api/\*"\]' wrangler.jsonc` returns 1 (exact value preserved)
    - The JSONC stripping + `JSON.parse` validation prints `OK` (file is valid JSONC)
    - **No URL leak:** `! grep -qE "DEPLOY_HOOK|deploy_hook|webhook" wrangler.jsonc` exits 0
    - **Comment correctness (Concern 3):** `grep -c "3 AM PDT" wrangler.jsonc` returns at least 1 AND `grep -c "2 AM PST" wrangler.jsonc` returns at least 1 (the comment correctly identifies the seasonal mapping)
  </acceptance_criteria>
  <done>
    wrangler.jsonc has `main: src/scheduled.ts`, `triggers.crons: ["0 10 * * *"]` (Concern 3 corrected), the JSONC comment correctly explains the DST mapping (3 AM PDT / 2 AM PST), and `run_worker_first: ["/api/*"]` preserved.
  </done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 3 (CHECKPOINT): Engineer creates the deploy hook in Cloudflare dashboard + runs `wrangler secret put DEPLOY_HOOK_URL`</name>
  <action>
    HUMAN ACTION REQUIRED — Claude cannot automate this. The deploy hook URL must be created in the Cloudflare dashboard (no CLI exists for hook creation) and stored as a Worker secret via interactive `wrangler secret put` (no non-interactive secret-set API for one-shot values). See `<how-to-verify>` below for the full step-by-step the engineer follows.
  </action>
  <verify>
    <automated>test -f src/scheduled.ts && grep -c '"main": "src/scheduled.ts"' wrangler.jsonc && grep -c "DEPLOY_HOOK_URL" src/scheduled.ts && echo VERIFY_OK</automated>
  </verify>
  <done>
    Engineer reports "approved" after: (a) the deploy hook exists in the Cloudflare dashboard, (b) `wrangler secret put DEPLOY_HOOK_URL` succeeded, (c) `wrangler secret list` shows the secret (engineer-side confirmation; the automated probe deliberately does NOT call `wrangler secret list` because that command requires Cloudflare auth and would brittle the verify in fresh CI/local environments), (d) `npx wrangler deploy --dry-run` exits 0 with the cron schedule acknowledged. The automated `<verify>` only confirms the local artifacts (src/scheduled.ts exists; wrangler.jsonc points main to it; DEPLOY_HOOK_URL is referenced in src/scheduled.ts). The engineer's "approved" resume signal is the binding gate.
  </done>
  <what-built>
    src/scheduled.ts and wrangler.jsonc are updated to consume a `DEPLOY_HOOK_URL` secret at runtime. Without that secret set, the deploy hook POST will hit `undefined` and log an error daily until the secret is configured.
  </what-built>
  <how-to-verify>
    The engineer/founder MUST do the following one-time setup (Claude cannot automate this — dashboard hook creation has no CLI, and `wrangler secret put` requires interactive paste).

    **Step 1 — Create the Workers Builds deploy hook in the Cloudflare dashboard:**
    1. Open the Cloudflare dashboard: https://dash.cloudflare.com
    2. Navigate: Workers & Pages > studio-bluemli > Settings > Builds > Deploy Hooks
    3. Click "New" (or "Add deploy hook" — the UI label varies)
    4. Name the hook: `daily-rebuild`
    5. Branch: `main`
    6. Submit. The dashboard returns a URL of the form `https://api.cloudflare.com/.../deploy_hooks/<hook-id>` — copy it.

    **Step 2 — Store the URL as a Worker secret (interactive):**
    ```bash
    wrangler secret put DEPLOY_HOOK_URL
    # When prompted, paste the URL from Step 1. The terminal echoes "Success!"
    ```

    **Step 3 — Verify the secret is registered:**
    ```bash
    wrangler secret list
    # Expected output includes a line for DEPLOY_HOOK_URL (the value is never shown — that's correct).
    ```

    **Step 4 — Final dry-run validation (post-secret) of the cron trigger:**
    ```bash
    npm run build                       # ensures dist/ exists
    npx wrangler deploy --dry-run 2>&1 | tail -30
    # Expected: no "no scheduled handler" error. The output should mention either
    # "cron trigger" or the "0 10 * * *" expression, or show the worker with the
    # bindings + scheduled handler enumerated.
    ```

    NOTE: Task 0 already validated the dry-run BEFORE this human-action step (Concern 5 spike). Task 3's dry-run is a post-secret confirmation; if it fails here AFTER Task 0 succeeded, it means something changed between the spike and the secret-set step — investigate manually before approving.

    **Step 5 — Document the secret setup in OPS.md (engineer-facing, recommended per RESEARCH.md Q5 §"Open Questions" + Concern 5 fallback documentation):**
    Create `OPS.md` at repo root with:
    - One paragraph documenting the deploy-hook setup (steps 1-4 above).
    - One paragraph documenting the Concern 5 fallback (separate cron-only Worker) — should the integrated approach ever break in a future Astro adapter version, the fallback path is: create `wrangler-cron.jsonc` + `src/cron-only.ts` (scheduled-only handler) + redeploy as `studio-bluemli-cron` Worker. Founder runs `wrangler secret put DEPLOY_HOOK_URL --config wrangler-cron.jsonc` for the secret. The main `studio-bluemli` Worker reverts to `main: "@astrojs/cloudflare/entrypoints/server"` and drops the `triggers` block.

    This OPS.md addition is recommended but not strictly required to mark the task done; the binding gate is steps 1-4.

    **Resume signal:** Type "approved" once the secret is set and the dry-run validates. Or describe any issues encountered (e.g., "wrangler deploy --dry-run failed with: ...") so the executor can apply the Concern 5 fallback.
  </how-to-verify>
  <resume-signal>Type "approved" to continue, or paste any error output from `wrangler deploy --dry-run` if the adapter integration failed.</resume-signal>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Final build + CI grep + smoke test (post-secret) for the integrated cron pipeline</name>
  <read_first>
    - src/scheduled.ts (verify it didn't get edited during the human-action checkpoint)
    - wrangler.jsonc (verify same)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md Q2 (the verification commands for D-12)
  </read_first>
  <behavior>
    - `npm run build` exits 0; `dist/server/entry.mjs` (or equivalent adapter output) exists.
    - `npx wrangler deploy --dry-run` exits 0 with the cron trigger acknowledged in the output.
    - `wrangler secret list` (if available without network — typically requires CF auth) shows `DEPLOY_HOOK_URL`. This is a confidence check, not strictly a build gate.
    - Phase 1 CI grep gates pass.
    - No secret leaks: `grep -rE "deploy_hooks/[a-f0-9-]{8,}" --exclude-dir=node_modules --exclude-dir=.git .` returns no matches.
  </behavior>
  <action>
1. `npm run build` — full production build. Expected exit 0.

2. `npx wrangler deploy --dry-run 2>&1 | tail -30` — expected: no "no scheduled handler" error, the output mentions the cron schedule (`0 10 * * *`) and the worker bindings. If this step fails AFTER the engineer reports "approved" from Task 3 AND Task 0's spike succeeded, the secret-set step likely altered something — investigate (most likely: the secret was set on the wrong Worker name; verify `wrangler.jsonc.name === "studio-bluemli"` matches the Worker chosen in the dashboard).

3. `wrangler secret list 2>&1` — if Cloudflare auth is configured, expect a line for `DEPLOY_HOOK_URL`. If auth isn't configured on the runner (e.g., the executor runs in a fresh environment), this command may fail — that's acceptable; the actual secret-set verification happened in Task 3 by the engineer.

4. `npm run ci:brand-check` and `npm run ci:lowercase-check` — both must exit 0 (no new files under `src/pages/` so the lowercase check is a no-op; brand check shouldn't trigger on src/scheduled.ts since it has no CSS).

5. Secret-leak grep (paranoia check):
   ```bash
   # Search the entire tracked repo for any sign of an actual deploy-hook URL.
   # A real URL would look like https://api.cloudflare.com/.../deploy_hooks/<uuid>.
   grep -rE "deploy_hooks/[a-f0-9-]{8,}|pages/webhooks" . 2>/dev/null | grep -v 'node_modules\|\.git' || true
   # Expected: no matches.
   ```

6. Final regression sanity — Plans 03/04's pages still build:
   - `test -f dist/client/index.html`
   - `test -f dist/client/popups/index.html`
   - `test -f dist/client/about/index.html`
   - `test -f dist/client/say-hi/index.html`
   - `test -f dist/client/robots.txt`
   - `test -f dist/client/sitemap-index.xml`
   These confirm the cron-Worker entrypoint change didn't break Plans 02/03/04's static output.

7. End-of-plan summary write-up.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -10 && npx wrangler deploy --dry-run 2>&1 | tail -10 && npm run ci:brand-check && npm run ci:lowercase-check && (grep -rE "deploy_hooks/[a-f0-9-]{8,}" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null || true) && test -f dist/client/index.html && test -f dist/client/popups/index.html && test -f dist/client/about/index.html && test -f dist/client/say-hi/index.html && test -f dist/client/robots.txt && test -f dist/client/sitemap-index.xml</automated>
  </verify>
  <acceptance_criteria>
    - `npm run build` exits 0
    - `npx wrangler deploy --dry-run` exits 0 and the output mentions "cron" or "0 10 * * *" (case-insensitive)
    - `npm run ci:brand-check` exits 0
    - `npm run ci:lowercase-check` exits 0
    - **No URL leak:** `! grep -rEq "deploy_hooks/[a-f0-9-]{8,}" --exclude-dir=node_modules --exclude-dir=.git .` exits 0 (no actual URL leaked into any tracked file)
    - **No URL leak:** `! grep -q "DEPLOY_HOOK_URL" wrangler.jsonc` exits 0 (the secret var name appears only in src/scheduled.ts and SUMMARY files — never in wrangler.jsonc)
    - All Plans 02/03/04 build outputs still exist (regression sanity)
  </acceptance_criteria>
  <done>
    Cron pipeline validates end-to-end via `wrangler deploy --dry-run`. No deploy-hook URL is committed anywhere. Phase 1 CI gates pass. Plans 02/03/04 outputs are unaffected by the entrypoint repointing. Cron expression is `0 10 * * *` per Concern 3.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Cloudflare internal (cron) -> Worker scheduled handler | The scheduled handler is invoked only by Cloudflare's internal cron infrastructure. Not network-reachable from the public internet. |
| Worker scheduled handler -> Workers Builds Deploy Hook URL | A single outbound POST per day. The URL is the credential (no Authorization header); leaking the URL = letting anyone trigger builds. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-05-01 | Information Disclosure | DEPLOY_HOOK_URL leak via build logs or repo | mitigate | Stored only as Worker secret via `wrangler secret put`. Never in `wrangler.jsonc`, never in source, never `console.log`'d. src/scheduled.ts has explicit anti-log behavior (Task 1 acceptance criteria enforce this). Task 4 grep confirms no URL ever lands in the tracked repo. |
| T-03-05-02 | Denial of Service | Cron triggers excessive builds | mitigate | Cron fires once daily (`0 10 * * *` — Concern 3 corrected). Workers Builds rate-limits deploy hooks to 10 builds/min/Worker (CF-enforced, not our problem to mitigate). Daily cap on free tier is 100 builds, we use 1 from cron + N from founder PRs. |
| T-03-05-03 | Tampering | wrangler.jsonc accidentally removes run_worker_first | mitigate | D-22 cross-check in Task 2 acceptance criteria explicitly verifies `run_worker_first: ["/api/*"]` is preserved with exact value. PR review (Phase 1 FND-04) provides a second pair of eyes. |
| T-03-05-04 | Spoofing | A leaked URL allows unauthorized builds | accept (low risk) | If the URL leaks, an attacker can only trigger builds of the `main` branch — not modify code, not gain access. Worst case: free-tier build quota exhaustion until the URL is rotated (re-create in dashboard + re-run `wrangler secret put`). Low value to attackers; no actual breach. |
| T-03-05-05 | Malicious Code (V10) | @astrojs/cloudflare adapter package | mitigate | Already a Phase 1 dep; not new in Plan 05. Re-export pattern from `@astrojs/cloudflare/entrypoints/server` is the documented adapter contract. Validated via Task 0 (Concern 5) spike `wrangler deploy --dry-run` BEFORE merging the wrangler.jsonc edit. |
| T-03-05-06 | Availability (Concern 5) | Custom scheduled.ts wrapper breaks adapter | mitigate | Task 0 (Concern 5 spike) runs `wrangler deploy --dry-run` BEFORE the wrangler.jsonc edit lands. If the dry-run fails, the documented fallback (separate cron-only Worker) preserves the main Astro Worker untouched. The fallback is documented in OPS.md by the engineer in Task 3 step 5. |
</threat_model>

<verification>
End-to-end verification after all 5 tasks (including Task 0 spike) complete:

```bash
# 1) New file exists with the right shape:
test -f src/scheduled.ts
grep -c "import handler from '@astrojs/cloudflare/entrypoints/server'" src/scheduled.ts   # expect 1
grep -c "async scheduled" src/scheduled.ts                                                # expect 1
grep -c "ctx.waitUntil" src/scheduled.ts                                                  # expect 1
! grep -qE "console\.(log|error)[^)]*DEPLOY_HOOK_URL" src/scheduled.ts                    # expect exit 0

# 2) wrangler.jsonc updated correctly with Concern 3 fix:
grep -c '"main": "src/scheduled.ts"' wrangler.jsonc                                       # expect 1
! grep -q '@astrojs/cloudflare/entrypoints/server' wrangler.jsonc                         # expect exit 0
grep -cE '"crons":\s*\["0 10 \* \* \*"\]' wrangler.jsonc                                  # expect 1 (Concern 3: 0 10 not 0 11)
! grep -q '"0 11 \* \* \*"' wrangler.jsonc                                                # expect exit 0
grep -c '"run_worker_first":' wrangler.jsonc                                              # expect 1 (D-22)
grep -c "3 AM PDT" wrangler.jsonc                                                         # expect at least 1 (correct DST mapping)

# 3) No URL leakage anywhere:
! grep -rEq "deploy_hooks/[a-f0-9-]{8,}" --exclude-dir=node_modules --exclude-dir=.git .  # expect exit 0

# 4) Build + dry-run + CI:
npm run build
npx wrangler deploy --dry-run 2>&1 | tail -20    # expect mentions of cron / 0 10 * * *
npm run ci:brand-check
npm run ci:lowercase-check

# 5) Plans 02/03/04 regression:
test -f dist/client/index.html && test -f dist/client/popups/index.html && test -f dist/client/about/index.html && test -f dist/client/say-hi/index.html && test -f dist/client/robots.txt && test -f dist/client/sitemap-index.xml
```

Manual verification (post-deploy, founder-style — NOT a blocking gate in this plan):
- After `wrangler deploy`, visit the Cloudflare dashboard > Workers & Pages > studio-bluemli > Triggers — confirm the cron trigger `0 10 * * *` appears.
- The next morning after deploy, check `wrangler tail --format=pretty` around 10:00 UTC (3 AM PDT during DST or 2 AM PST during winter). Expected: a `[scheduled]` log line with the invocation timestamp; no error logs unless the deploy hook URL is wrong.
- Verify the build kicks off: Cloudflare dashboard > Workers & Pages > studio-bluemli > Deployments shows a new deployment dated within the cron's firing window.
</verification>

<success_criteria>
Plan 05 is complete when:
1. **Concern 5 spike (Task 0)** validated: `npx wrangler deploy --dry-run` exits 0 with the cron schedule acknowledged BEFORE the wrangler.jsonc edit lands. (FAIL branch documented; user-decision required if hit.)
2. `src/scheduled.ts` exists, type-checks, and never logs the deploy hook URL.
3. `wrangler.jsonc` has `main: src/scheduled.ts`, `triggers.crons: ["0 10 * * *"]` (Concern 3 corrected — was `"0 11 * * *"` in the pre-spike plan), and `run_worker_first: ["/api/*"]` preserved untouched. JSONC comment correctly identifies 3 AM PDT / 2 AM PST mapping.
4. The engineer (via Task 3 checkpoint) has created the deploy hook in the Cloudflare dashboard and run `wrangler secret put DEPLOY_HOOK_URL`.
5. `npx wrangler deploy --dry-run` exits 0 and mentions the cron schedule (Task 4 — post-secret confirmation).
6. `npm run build` + `npm run ci:brand-check` + `npm run ci:lowercase-check` all exit 0.
7. No deploy-hook URL appears anywhere in the tracked repo (`grep -rE "deploy_hooks/[a-f0-9-]{8,}"` produces no matches outside `node_modules` and `.git`).
8. Regression sanity: Plans 02/03/04 outputs (index, popups, about, say-hi, robots.txt, sitemap-index.xml) all still exist in `dist/client/`.
</success_criteria>

<output>
After completion, create `.planning/phases/03-page-composition-pop-ups/03-05-SUMMARY.md` documenting:
- The 1 new file (`src/scheduled.ts`) + 1 modified file (`wrangler.jsonc`).
- The Task 0 (Concern 5) spike outcome: PASS (dry-run validated Assumption A1) or the fallback path taken if FAIL.
- The exact cron expression used (`0 10 * * *`) and the corrected DST mapping (3 AM PDT during DST / 2 AM PST during winter — Concern 3 fix from the originally inverted comment).
- A note that the deploy hook URL is stored only as a Worker secret (`wrangler secret put DEPLOY_HOOK_URL`) — never in git.
- The `wrangler deploy --dry-run` output confirming the scheduled handler integration works.
- The engineer-action log: who set the secret, when, and the timestamp of the first cron-triggered build (if observable).
- A one-line note that D-22 (`run_worker_first: ["/api/*"]`) was preserved untouched.
- Optionally: confirmation that `OPS.md` was created at repo root documenting both the deploy-hook setup AND the Concern 5 fallback (separate cron-only Worker) for future engineers.
</output>
