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
    why: "Daily 3 AM PT cron rebuild so expired popups roll off the upcoming list without founder action (PAG-04 + ROADMAP lock)."
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
    - "wrangler.jsonc has `triggers.crons: [\"0 11 * * *\"]` and `main` repointed to `src/scheduled.ts` (with `run_worker_first: [\"/api/*\"]` preserved unchanged per D-22)."
    - "src/scheduled.ts re-exports the Astro adapter's `fetch` handler and adds a `scheduled` handler that POSTs to env.DEPLOY_HOOK_URL."
    - "The deploy hook URL is stored only as a Worker secret (`wrangler secret put DEPLOY_HOOK_URL`); it never appears in the repo, in wrangler.jsonc vars, or in build logs."
    - "`wrangler deploy --dry-run` succeeds and lists the cron trigger and the scheduled handler; this validates Assumption A1 from RESEARCH.md (re-pointing main to src/scheduled.ts works with the adapter)."
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
Wire the daily 3 AM PT cron rebuild so expired pop-ups fall off the upcoming list without founder action (PAG-04, ROADMAP-locked, founder-confirmed). The mechanism: a Cloudflare Workers scheduled handler on the existing `studio-bluemli` Worker that POSTs to a Workers Builds deploy hook URL once per day. Free-tier compatible (1 cron of the 5 allowed; 1 build/day well under the 100/day cap).

Purpose: Plans 03 and 04 already ship the build-time TZ-aware bucketing; this plan is the runtime trigger that makes that bucketing self-refresh. Without it, a popup that ended yesterday would still appear in the "upcoming" section until the next founder commit. With it, the build re-runs every morning at ~3 AM PT and the bucketing recomputes against a fresh LA-local "today".

This plan is NOT autonomous — Task 3 requires a human (engineer or founder) to (a) create the deploy hook in the Cloudflare dashboard, (b) copy its URL, and (c) run `wrangler secret put DEPLOY_HOOK_URL`. Both halves of step (a) and (c) cannot be automated by Claude: dashboard hook creation has no CLI, and `wrangler secret put` requires interactive input.

Output (1 new file + 1 modified file + 1 human-action checkpoint):
- `src/scheduled.ts` — new Worker entrypoint that re-exports the Astro adapter's `fetch` and adds a `scheduled` handler.
- `wrangler.jsonc` — `main` repointed from `@astrojs/cloudflare/entrypoints/server` to `src/scheduled.ts`; new `triggers.crons` block added; `run_worker_first: ["/api/*"]` preserved untouched (D-22).
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

DST cliff caveat (RESEARCH.md Pitfall 1):
- Cron expression `0 11 * * *` fires at 11:00 UTC every day = 3 AM PDT (summer, UTC-7) and 4 AM PST (winter, UTC-8).
- Founder accepts the ±1h drift (RESEARCH.md recommendation: single-cron path, not two crons — saves 50% of free-tier build budget).
- Add a comment in wrangler.jsonc explaining the drift.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create src/scheduled.ts (Worker entry re-exporting Astro adapter fetch + adding scheduled handler)</name>
  <read_first>
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md Example 3 (the verbatim scheduled.ts code) + Pitfall 5 (the "never log DEPLOY_HOOK_URL" rule) + Assumption A1 (the adapter-entrypoint wrapping is acceptable per the docs but should be probed via `wrangler deploy --dry-run`)
    - astro.config.mjs (confirms `adapter: cloudflare({})` is configured — required for the adapter entrypoint export to exist)
  </read_first>
  <behavior>
    - `src/scheduled.ts` imports the Astro adapter's default export and re-exports its `fetch` method.
    - The `scheduled` method POSTs to `env.DEPLOY_HOOK_URL` with no body and no auth header (Workers Builds deploy hooks don't require auth — the URL itself is the credential per Pitfall 5).
    - The POST is wrapped in `ctx.waitUntil(...)` so the Worker keeps the scheduled invocation alive until the fetch resolves.
    - Errors are logged via `console.error` WITHOUT including the URL itself (Pitfall 5: never log the URL).
    - The `Env` interface declares `ASSETS: Fetcher` (required by the Astro adapter) and `DEPLOY_HOOK_URL: string` (the new Worker secret).
  </behavior>
  <action>
**Create `src/scheduled.ts`** with the Write tool. File contents:

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

**Anti-pattern checks:**
- The file MUST NOT contain the deploy hook URL or any partial URL pattern (no `pages/webhooks` literal, no hard-coded URL fragments).
- The file MUST NOT log `env.DEPLOY_HOOK_URL` or interpolate it into any string passed to `console.*`.
- The file MUST NOT export `default { ... }` without both `fetch` and `scheduled` — both are required for the adapter integration to be valid.
  </action>
  <verify>
    <automated>test -f src/scheduled.ts && grep -c "import handler from '@astrojs/cloudflare/entrypoints/server'" src/scheduled.ts && grep -c "DEPLOY_HOOK_URL" src/scheduled.ts && grep -c "fetch: handler.fetch" src/scheduled.ts && grep -c "async scheduled" src/scheduled.ts && grep -c "ctx.waitUntil" src/scheduled.ts && grep -cE "console\.(log|error|warn|info).*DEPLOY_HOOK_URL" src/scheduled.ts && grep -cE "pages/webhooks|deploy_hooks|cloudflare\.com" src/scheduled.ts && npx astro check 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `test -f src/scheduled.ts` exits 0
    - `grep -c "import handler from '@astrojs/cloudflare/entrypoints/server'" src/scheduled.ts` returns 1
    - `grep -c "DEPLOY_HOOK_URL" src/scheduled.ts` returns at least 2 (Env interface + handler)
    - `grep -c "fetch: handler.fetch" src/scheduled.ts` returns 1
    - `grep -c "async scheduled" src/scheduled.ts` returns 1
    - `grep -c "ctx.waitUntil" src/scheduled.ts` returns 1
    - `grep -cE "console\.(log|error|warn|info)[^)]*DEPLOY_HOOK_URL" src/scheduled.ts` returns 0 (URL never logged)
    - `grep -cE "pages/webhooks|deploy_hooks|cloudflare\.com" src/scheduled.ts` returns 0 (no URL fragment hardcoded)
    - `npx astro check` exits 0
  </acceptance_criteria>
  <done>
    `src/scheduled.ts` exists, type-checks against the Astro adapter's entrypoint, declares the Env interface, and never logs the deploy hook URL.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Update wrangler.jsonc — repoint main to src/scheduled.ts + add triggers.crons + preserve D-22</name>
  <read_first>
    - wrangler.jsonc (current state — 17 lines)
    - .planning/phases/03-page-composition-pop-ups/03-CONTEXT.md (D-22: leave `run_worker_first: ["/api/*"]` alone)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md §Example 3 (target wrangler.jsonc shape) + Pitfall 1 (the DST drift comment to add)
  </read_first>
  <behavior>
    - `"main"` is changed from `"@astrojs/cloudflare/entrypoints/server"` to `"src/scheduled.ts"`.
    - A new top-level `"triggers"` block is added with `"crons": ["0 11 * * *"]` (3 AM PDT / 4 AM PST per Pitfall 1).
    - A JSONC comment near the `triggers` block explains the DST drift (founder accepts it; documented per RESEARCH.md recommendation).
    - `assets.run_worker_first: ["/api/*"]` is preserved verbatim (D-22 cross-check).
    - All other config (name, compatibility_date, compatibility_flags, assets.directory, assets.binding, observability) is preserved exactly.
  </behavior>
  <action>
**Edit `wrangler.jsonc`:** Use the Edit tool. The full target state (replace the entire file):

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "studio-bluemli",
  // Phase 3 (PAG-04): main now points at src/scheduled.ts so the Worker has both
  // a `fetch` handler (delegated to the Astro adapter for static + /api/*) and a
  // `scheduled` handler (the daily deploy-hook POST).
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

  // Phase 3 PAG-04 / D-12: daily 3 AM PT cron rebuild via Workers Builds deploy hook.
  // Cron expressions are UTC. "0 11 * * *" = 11:00 UTC daily, which is:
  //   - 3 AM PDT (Mar–Nov, UTC-7)
  //   - 4 AM PST (Nov–Mar, UTC-8)
  // The ±1 hour DST drift is accepted (RESEARCH.md Pitfall 1) — both fire well
  // after midnight, which is the only semantic requirement. Using two crons to
  // bracket the window would burn 2× the free-tier build budget for no real
  // gain. Free-tier accounting: 5 cron triggers/account allowed, we use 1.
  "triggers": {
    "crons": ["0 11 * * *"]
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
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  JSON.parse(stripped);
  console.log('JSONC parses OK');
"
```

Expected: prints "JSONC parses OK".

**D-22 cross-check:** After the edit, `grep -c '"run_worker_first"' wrangler.jsonc` returns 1, and the value array is still exactly `["/api/*"]`. Do NOT remove this line in any task in this plan or anywhere else in Phase 3.
  </action>
  <verify>
    <automated>grep -c '"main": "src/scheduled.ts"' wrangler.jsonc && grep -c '"triggers"' wrangler.jsonc && grep -c '"crons": \["0 11 \* \* \*"\]' wrangler.jsonc && grep -c '"run_worker_first": \["/api/\*"\]' wrangler.jsonc && grep -c '@astrojs/cloudflare/entrypoints/server' wrangler.jsonc && node -e "const fs=require('fs');const t=fs.readFileSync('wrangler.jsonc','utf8');JSON.parse(t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*\$/gm,''));console.log('OK');"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c '"main": "src/scheduled.ts"' wrangler.jsonc` returns 1
    - `grep -c '@astrojs/cloudflare/entrypoints/server' wrangler.jsonc` returns 0 (the old main path is gone)
    - `grep -c '"triggers"' wrangler.jsonc` returns 1
    - `grep -cE '"crons":\s*\["0 11 \* \* \*"\]' wrangler.jsonc` returns 1
    - `grep -c '"run_worker_first":' wrangler.jsonc` returns 1 (D-22: preserved)
    - `grep -cE '"run_worker_first":\s*\["/api/\*"\]' wrangler.jsonc` returns 1 (D-22: exact value preserved)
    - The JSONC stripping + `JSON.parse` validation prints `OK` (file is valid JSONC)
    - No deploy hook URL appears anywhere in wrangler.jsonc: `grep -cE "DEPLOY_HOOK|deploy_hook|webhook" wrangler.jsonc` returns 0
  </acceptance_criteria>
  <done>
    wrangler.jsonc has `main` repointed to `src/scheduled.ts`, the `triggers.crons` block added with the documented DST-drift comment, and `run_worker_first: ["/api/*"]` preserved.
  </done>
</task>

<task type="checkpoint:human-action" gate="blocking">
  <name>Task 3 (CHECKPOINT): Engineer creates the deploy hook in Cloudflare dashboard + runs `wrangler secret put DEPLOY_HOOK_URL`</name>
  <action>
    HUMAN ACTION REQUIRED — Claude cannot automate this. The deploy hook URL must be created in the Cloudflare dashboard (no CLI exists for hook creation) and stored as a Worker secret via interactive `wrangler secret put` (no non-interactive secret-set API for one-shot values). See `<how-to-verify>` below for the full step-by-step the engineer follows.
  </action>
  <verify>
    <automated>npx wrangler secret list 2>&1 | grep -c "DEPLOY_HOOK_URL"</automated>
  </verify>
  <done>
    Engineer reports "approved" after: (a) the deploy hook exists in the Cloudflare dashboard, (b) `wrangler secret put DEPLOY_HOOK_URL` succeeded, (c) `wrangler secret list` shows the secret, (d) `npx wrangler deploy --dry-run` exits 0 with the cron schedule acknowledged.
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

    **Step 4 — Dry-run validation of the cron trigger (this validates RESEARCH.md Assumption A1 — that re-pointing `main` to `src/scheduled.ts` works with the Astro adapter):**
    ```bash
    npm run build                       # ensures dist/ exists
    npx wrangler deploy --dry-run 2>&1 | tail -30
    # Expected: no "no scheduled handler" error. The output should mention either
    # "cron trigger" or the "0 11 * * *" expression, or show the worker with the
    # bindings + scheduled handler enumerated.
    ```

    If `wrangler deploy --dry-run` errors with "no scheduled handler" or similar adapter-incompatibility message, fall back to RESEARCH.md Assumption A1's fallback plan: create a separate cron-only Worker (separate `wrangler.jsonc`) that shares the deploy-hook secret. Surface this to the user — do NOT silently proceed.

    **Step 5 — Document the secret setup in OPS.md (engineer-facing, optional but recommended per RESEARCH.md Q5 §"Open Questions"):**
    Create `OPS.md` at repo root with one paragraph documenting the deploy-hook setup so a future engineer (or the founder, if she ever takes over engineering) can reproduce it. This is a discretionary improvement; not required to mark the task done.

    **Resume signal:** Type "approved" once the secret is set and the dry-run validates. Or describe any issues encountered (e.g., "wrangler deploy --dry-run failed with: ...") so the executor can apply the Assumption A1 fallback.
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
    - No secret leaks: `grep -rE "DEPLOY_HOOK_URL" wrangler.jsonc src/ scripts/ .planning/phases/03-page-composition-pop-ups/*-SUMMARY.md` returns only the source-of-truth references (src/scheduled.ts; any plan SUMMARY that names the env-var contract; never an actual URL).
  </behavior>
  <action>
1. `npm run build` — full production build. Expected exit 0.

2. `npx wrangler deploy --dry-run 2>&1 | tail -30` — expected: no "no scheduled handler" error, the output mentions the cron schedule and the worker bindings. If this step fails AFTER the engineer reports "approved" from Task 3, the cron handler integration is broken — investigate (likely cause: typo in src/scheduled.ts default export shape; re-read RESEARCH.md Example 3 verbatim).

3. `wrangler secret list 2>&1` — if Cloudflare auth is configured, expect a line for `DEPLOY_HOOK_URL`. If auth isn't configured on the runner (e.g., the executor runs in a fresh environment), this command may fail — that's acceptable; the actual secret-set verification happened in Task 3 by the engineer.

4. `npm run ci:brand-check` and `npm run ci:lowercase-check` — both must exit 0 (no new files under `src/pages/` so the lowercase check is a no-op; brand check shouldn't trigger on src/scheduled.ts since it has no CSS).

5. Secret-leak grep (paranoia check):
   ```bash
   # Search the entire tracked repo for any sign of an actual deploy-hook URL.
   # A real URL would look like https://api.cloudflare.com/.../deploy_hooks/<uuid>.
   grep -rE "deploy_hooks/[a-f0-9-]{8,}|pages/webhooks" . 2>/dev/null | grep -v 'node_modules\|\.git'
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
    <automated>npm run build 2>&1 | tail -10 && npx wrangler deploy --dry-run 2>&1 | tail -10 && npm run ci:brand-check && npm run ci:lowercase-check && grep -rE "deploy_hooks/[a-f0-9-]{8,}" --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null ; echo "LEAK_EXIT=$?" && test -f dist/client/index.html && test -f dist/client/popups/index.html && test -f dist/client/about/index.html && test -f dist/client/say-hi/index.html && test -f dist/client/robots.txt && test -f dist/client/sitemap-index.xml</automated>
  </verify>
  <acceptance_criteria>
    - `npm run build` exits 0
    - `npx wrangler deploy --dry-run` exits 0 and the output mentions "cron" or "0 11 * * *" (case-insensitive)
    - `npm run ci:brand-check` exits 0
    - `npm run ci:lowercase-check` exits 0
    - `grep -rE "deploy_hooks/[a-f0-9-]{8,}" --exclude-dir=node_modules --exclude-dir=.git .` returns no matches (no actual URL leaked into any tracked file)
    - `grep -rE "DEPLOY_HOOK_URL" wrangler.jsonc` returns 0 (the secret var name appears only in src/scheduled.ts and SUMMARY files — never in wrangler.jsonc)
    - All Plans 02/03/04 build outputs still exist (regression sanity)
  </acceptance_criteria>
  <done>
    Cron pipeline validates end-to-end via `wrangler deploy --dry-run`. No deploy-hook URL is committed anywhere. Phase 1 CI gates pass. Plans 02/03/04 outputs are unaffected by the entrypoint repointing.
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
| T-03-05-02 | Denial of Service | Cron triggers excessive builds | mitigate | Cron fires once daily (`0 11 * * *`). Workers Builds rate-limits deploy hooks to 10 builds/min/Worker (CF-enforced, not our problem to mitigate). Daily cap on free tier is 100 builds, we use 1 from cron + N from founder PRs. |
| T-03-05-03 | Tampering | wrangler.jsonc accidentally removes run_worker_first | mitigate | D-22 cross-check in Task 2 acceptance criteria explicitly verifies `run_worker_first: ["/api/*"]` is preserved with exact value. PR review (Phase 1 FND-04) provides a second pair of eyes. |
| T-03-05-04 | Spoofing | A leaked URL allows unauthorized builds | accept (low risk) | If the URL leaks, an attacker can only trigger builds of the `main` branch — not modify code, not gain access. Worst case: free-tier build quota exhaustion until the URL is rotated (re-create in dashboard + re-run `wrangler secret put`). Low value to attackers; no actual breach. |
| T-03-05-05 | Malicious Code (V10) | @astrojs/cloudflare adapter package | mitigate | Already a Phase 1 dep; not new in Plan 05. Re-export pattern from `@astrojs/cloudflare/entrypoints/server` is the documented adapter contract. |
</threat_model>

<verification>
End-to-end verification after all 4 tasks complete:

```bash
# 1) New file exists with the right shape:
test -f src/scheduled.ts
grep -c "import handler from '@astrojs/cloudflare/entrypoints/server'" src/scheduled.ts   # expect 1
grep -c "async scheduled" src/scheduled.ts                                                # expect 1
grep -c "ctx.waitUntil" src/scheduled.ts                                                  # expect 1
grep -cE "console\.(log|error)[^)]*DEPLOY_HOOK_URL" src/scheduled.ts                      # expect 0

# 2) wrangler.jsonc updated correctly:
grep -c '"main": "src/scheduled.ts"' wrangler.jsonc                                       # expect 1
grep -c '@astrojs/cloudflare/entrypoints/server' wrangler.jsonc                           # expect 0
grep -cE '"crons":\s*\["0 11 \* \* \*"\]' wrangler.jsonc                                  # expect 1
grep -c '"run_worker_first":' wrangler.jsonc                                              # expect 1 (D-22)

# 3) No URL leakage anywhere:
grep -rE "deploy_hooks/[a-f0-9-]{8,}" --exclude-dir=node_modules --exclude-dir=.git .     # expect: no matches

# 4) Build + dry-run + CI:
npm run build
npx wrangler deploy --dry-run 2>&1 | tail -20    # expect mentions of cron / 0 11 * * *
npm run ci:brand-check
npm run ci:lowercase-check

# 5) Plans 02/03/04 regression:
test -f dist/client/index.html && test -f dist/client/popups/index.html && test -f dist/client/about/index.html && test -f dist/client/say-hi/index.html && test -f dist/client/robots.txt && test -f dist/client/sitemap-index.xml
```

Manual verification (post-deploy, founder-style — NOT a blocking gate in this plan):
- After `wrangler deploy`, visit the Cloudflare dashboard > Workers & Pages > studio-bluemli > Triggers — confirm the cron trigger `0 11 * * *` appears.
- The next morning after deploy, check `wrangler tail --format=pretty` around 11:00 UTC (3 AM PDT or 4 AM PST depending on season). Expected: a `[scheduled]` log line with the invocation timestamp; no error logs unless the deploy hook URL is wrong.
- Verify the build kicks off: Cloudflare dashboard > Workers & Pages > studio-bluemli > Deployments shows a new deployment dated within the cron's firing window.
</verification>

<success_criteria>
Plan 05 is complete when:
1. `src/scheduled.ts` exists, type-checks, and never logs the deploy hook URL.
2. `wrangler.jsonc` has `main: src/scheduled.ts`, `triggers.crons: ["0 11 * * *"]`, and `run_worker_first: ["/api/*"]` preserved untouched.
3. The engineer (via Task 3 checkpoint) has created the deploy hook in the Cloudflare dashboard and run `wrangler secret put DEPLOY_HOOK_URL`.
4. `npx wrangler deploy --dry-run` exits 0 and mentions the cron schedule (validates RESEARCH.md Assumption A1).
5. `npm run build` + `npm run ci:brand-check` + `npm run ci:lowercase-check` all exit 0.
6. No deploy-hook URL appears anywhere in the tracked repo (`grep -rE "deploy_hooks/[a-f0-9-]{8,}"` produces no matches outside `node_modules` and `.git`).
7. Regression sanity: Plans 02/03/04 outputs (index, popups, about, say-hi, robots.txt, sitemap-index.xml) all still exist in `dist/client/`.
</success_criteria>

<output>
After completion, create `.planning/phases/03-page-composition-pop-ups/03-05-SUMMARY.md` documenting:
- The 1 new file (`src/scheduled.ts`) + 1 modified file (`wrangler.jsonc`).
- The exact cron expression used (`0 11 * * *`) and the accepted DST drift.
- A note that the deploy hook URL is stored only as a Worker secret (`wrangler secret put DEPLOY_HOOK_URL`) — never in git.
- The `wrangler deploy --dry-run` output confirming the scheduled handler integration works (validates RESEARCH.md Assumption A1).
- The engineer-action log: who set the secret, when, and the timestamp of the first cron-triggered build (if observable).
- A one-line note that D-22 (`run_worker_first: ["/api/*"]`) was preserved untouched.
- Optionally: confirmation that `OPS.md` was created at repo root documenting the deploy-hook setup for future engineers.
</output>
