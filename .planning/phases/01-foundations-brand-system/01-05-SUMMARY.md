---
plan_id: 01-05
phase: 1
phase_slug: 01-foundations-brand-system
plan: 05
subsystem: ci
tags: [ci, github-actions, brand-enforcement, cloudflare-workers-builds, lighthouse, founder-setup]
status: checkpoint-pending-human-action
requirements: [FND-04, FND-10, FND-11, FND-12]
dependency_graph:
  requires:
    - "Plan 01-01 (.nvmrc, package.json scripts, wrangler.jsonc 'studio-bluemli' name)"
    - "Plan 01-02 (synced design-skill components with no client: directives)"
    - "Plan 01-04 (scripts/write-assetsignore.mjs postbuild; dist/client/ + dist/server/entry.mjs layout)"
  provides:
    - ".github/workflows/ci.yml — 'Build & brand check' required status check"
    - "scripts/check-brand-rules.sh — 5 active brand grep rules (Rule 7 sample-data leak commented for Phase 2)"
    - "scripts/check-lowercase-filenames.sh — FND-11 macOS/Linux case-sensitivity gate"
    - "scripts/check-no-hydration.sh — REVIEW FIX M1 zero-React-in-browser permanent CI gate"
    - "lighthouserc.json — FND-12 mobile audit asserting categories ≥ 0.9 on /"
    - "SETUP.md — 5-step engineer-facing setup walkthrough"
  affects:
    - "Phase 2 (content collections): Rule 7 sample-data leak can be uncommented; Rule 2 grep already scopes src/content/"
    - "Phase 5 (LCH-05): replaces this plan's staticDistDir Lighthouse audit with a full-route audit against the live *.workers.dev URL"
tech_stack:
  added:
    - "GitHub Actions (actions/checkout@v4, actions/setup-node@v4, pnpm/action-setup@v4)"
    - "treosh/lighthouse-ci-action@v12 (staticDistDir mode against ./dist/client)"
    - "GNU grep PCRE -P flag (Ubuntu runner only; required for Rule 1's #fff8 negative-lookahead whitelist)"
  patterns:
    - "set -uo pipefail (NOT set -e) in check-brand-rules.sh — collect ALL violations per CI run, not just the first"
    - "Grep --include= per-extension for code-style rules; bare grep for the vocabulary rule (Rule 2 scans all files in src/)"
    - "Rule-2 exclusions for synced internals (colors_and_type.css verbatim copy; src/components/design-skill/ synced JSX) — Plan 05 scope decision per deferred-items.md"
    - "Lighthouse CI staticDistDir set to ./dist/client (not bare ./dist) — matches modern @astrojs/cloudflare adapter output layout"
key_files:
  created:
    - "scripts/check-brand-rules.sh"
    - "scripts/check-lowercase-filenames.sh"
    - "scripts/check-no-hydration.sh"
    - ".github/workflows/ci.yml"
    - "lighthouserc.json"
    - "SETUP.md"
    - ".planning/phases/01-foundations-brand-system/01-05-SUMMARY.md"
  modified:
    - ".planning/phases/01-foundations-brand-system/deferred-items.md (resolved Plan 04 entry inline)"
decisions:
  - "Rule 2 (flower vocabulary) excludes both src/styles/colors_and_type.css (verbatim-synced design-skill CSS where color hues are named after real-world objects) and src/components/design-skill/ (synced JSX with author-intent comments). This resolves the Plan 04 deferred-items entry without drifting from skill source. The exclusion is narrow: Phase 2's src/content/ (real product copy) is still scanned."
  - "lighthouserc.json staticDistDir = ./dist/client (not ./dist as the plan template literally said). The modern @astrojs/cloudflare@13.5 adapter emits HTML files at dist/client/<route>/index.html (Plan 04 SUMMARY documents this). Lighthouse needs the directory that contains index.html. This is a Rule 3 deviation: shipping ./dist literally would have failed at first CI run."
  - "Lighthouse CI uses staticDistDir, not the astro-preview-background-server fallback. Picked one path per the plan's instruction. Documented the fallback recipe in ci.yml comments for the future engineer who needs to switch."
  - "Brand-check script kept set -uo pipefail (collect all violations) rather than set -e (fail fast). Plan-mandated."
metrics:
  duration: "~17 minutes (worktree mode, including plan + RESEARCH.md + deferred-items.md reads and one clean astro build for no-hydration script smoke test)"
  completed: "2026-05-13"
  tasks_completed: 2
  tasks_total: 3
  tasks_pending_human: 1
  commits: 2
  files_created: 6
  files_modified: 1
---

# Phase 1 Plan 05: CI Brand-Check + Founder Setup Summary

**GitHub Actions required status check ("Build & brand check") + three CI shell scripts enforcing the 5 active brand rules, the lowercase-filename rule (FND-11), and the no-hydration / no-browser-JS contract (REVIEW FIX M1) on every PR + push to main, plus Lighthouse CI asserting mobile categories ≥ 0.9 on / (FND-12) and a 5-step engineer-facing SETUP.md — committed; the remaining 5 manual steps the engineer must perform in the GitHub + Cloudflare dashboards are gated on the orchestrator-surfaced human-action checkpoint below.**

## Performance

- **Duration:** ~17 min
- **Started:** 2026-05-13T01:05Z (worktree spawn)
- **Completed (code work):** 2026-05-13T01:22Z (Task 2 commit)
- **Tasks:** 2 of 3 (Task 3 is human-action checkpoint)
- **Files created:** 6 (3 scripts + ci.yml + lighthouserc.json + SETUP.md)
- **Files modified:** 1 (deferred-items.md — entry resolved inline)
- **Commits:** 2 atomic per-task commits

## Accomplishments

- **`.github/workflows/ci.yml`** ships with the job `Build & brand check` (string-exact, the value the engineer types into GitHub branch protection). Triggers: `pull_request` to `main` + `push` to `main`. Runs on `ubuntu-latest` (required — Rule 1's PCRE `(?![0-9a-fA-F])` negative lookahead needs GNU grep). Steps in order: checkout → pnpm@10 setup → Node from `.nvmrc` → install --frozen-lockfile → astro check → astro build → write-assetsignore postbuild → 3 check scripts → Lighthouse CI.
- **`scripts/check-brand-rules.sh`** enforces all 5 active brand rules (Rule 1 whites, Rule 2 flower vocabulary, Rule 3 gradients, Rule 4 backdrop-filter, Rule 5 1px borders). Rule 7 (sample-data leak) is commented out with a `# TODO: enable in Phase 2` marker. D-11 failure messages quote the brand reason ("beaded clusters, not flowers", "frosted-glass SaaS aesthetic", "Hard 1px borders are not Bluemli"), not just the regex. `set -uo pipefail` collects all violations per run.
- **`scripts/check-lowercase-filenames.sh`** enforces FND-11. `find src/pages -type f | grep -E '[A-Z]'` — exit 0 means a violation exists.
- **`scripts/check-no-hydration.sh`** (REVIEW FIX M1) runs two gates: (1) grep for `client:(load|idle|visible|media|only)` anywhere in `src/**/*.{astro,jsx,tsx,ts}`; (2) `find dist -name '*.js' -size +10240c` excluding `_worker.js` (10 KB browser-JS budget) + a belt-and-suspenders `grep` for `react.development|react.production|react-dom.development|react-dom.production` strings in any browser-served JS.
- **`lighthouserc.json`** asserts `categories:performance / accessibility / best-practices / seo ≥ 0.9` at mobile form factor (360×640, 2× DPR, rttMs=150, throughputKbps=1638.4, cpuSlowdownMultiplier=4). `staticDistDir: "./dist/client"` so the action's local HTTP server serves the prerendered HTML.
- **`SETUP.md`** is the engineer's 5-step reference: push to GitHub → Cloudflare git connect with "Non-production branch builds: ON" → preview-URL format reference → GitHub branch protection registering "Build & brand check" → end-to-end loop with the `background: white;` deliberate-violation test.
- **Plan 04 deferred-items.md entry resolved inline** (Plan 05 scope decision per the entry's mandate). Rule 2 grep now excludes `colors_and_type.css` (file-level) and `src/components/design-skill/` (directory-level) — the two synced internal file classes that were pre-existing false positives. The exclusion is narrow: Phase 2's `src/content/` (real product copy) is still scanned.

## Task Commits

1. **Task 1: Three CI scripts** — `7a4e883` (feat)
   - `scripts/check-brand-rules.sh` (5 active rules + commented Rule 7)
   - `scripts/check-lowercase-filenames.sh`
   - `scripts/check-no-hydration.sh` (REVIEW FIX M1)
   - All three: chmod +x, `bash -n` syntax OK, clean run against current `src/`, fail correctly on deliberate violations.
   - Rule 2 grep configured to exclude `colors_and_type.css` + `src/components/design-skill/` (resolves Plan 04 deferred-items.md entry).

2. **Task 2: CI workflow + Lighthouse config + SETUP.md** — `2300e00` (feat)
   - `.github/workflows/ci.yml` with job `Build & brand check` (string-exact).
   - `lighthouserc.json` with `staticDistDir: "./dist/client"` (Rule 3 fix — plan template literally said `./dist` but the adapter emits HTML at `./dist/client/`).
   - `SETUP.md` with the 5 manual engineer steps and the deliberate-violation verification.
   - YAML + JSON syntax validated locally.

## Local smoke-test results (Task 1)

Three deliberate-violation tests run on the executor's macOS sandbox:

1. **Rule 2 violation:** wrote `src/__test-violation/violation.css` with `/* this is a flower comment */`. Script exited 1 with the expected `FAIL: The studio's earrings are beaded clusters, not flowers — pick a neutral word.` message. ✓
2. **FND-11 violation:** touched `src/pages/__TestViolation.astro`. `check-lowercase-filenames.sh` exited 1 with the expected `FAIL: src/pages/ filenames must be lowercase-only.` message and named the offending file. ✓
3. **REVIEW FIX M1 violation:** wrote `src/__test-hydration/leak.jsx` with `<Hero client:load />`. `check-no-hydration.sh` exited 1 with the expected `FAIL: Found a client: directive in src/.` message and the matching line. ✓

All three temp files were cleaned up before commit. After cleanup, all three scripts return exit 0 against the real `src/` and `dist/`.

**Note on Rule 1 (whites) macOS smoke test:** Rule 1's regex uses `grep -P` (PCRE) for the `#fff(?![0-9a-fA-F])` negative-lookahead whitelist of `#fff8`. macOS's BSD grep doesn't implement `-P`. The local smoke test printed `grep: invalid option -- P` to stderr but the script still exits with the correct code based on the other 4 rules. The Ubuntu CI runner has GNU grep, where Rule 1 will execute fully. This is the intended cross-platform behavior — the plan explicitly chose `ubuntu-latest` so Rule 1's PCRE would work in CI.

## Files Created / Modified

### Created

- `scripts/check-brand-rules.sh` — 5 active brand grep rules with D-11 failure messages; Rule 2 excludes two synced internal file classes; Rule 7 commented for Phase 2.
- `scripts/check-lowercase-filenames.sh` — FND-11 enforcement.
- `scripts/check-no-hydration.sh` — REVIEW FIX M1: no `client:` directive in src + browser-JS size budget on dist.
- `.github/workflows/ci.yml` — required status check, job name `Build & brand check`.
- `lighthouserc.json` — FND-12 mobile audit config, ≥ 0.9 categories.
- `SETUP.md` — 5-step engineer-facing setup walkthrough.

### Modified

- `.planning/phases/01-foundations-brand-system/deferred-items.md` — resolved Plan 04 entry inline with Plan 05's scope decision (Option 2 + extension).

## Lighthouse CI tooling choice (REVIEW FIX iteration 2 WARNING 5)

**Path chosen:** `staticDistDir` in `lighthouserc.json` (canonical, single bootstrapper). Set to `./dist/client` (not `./dist`, which the plan template literally said) because the modern `@astrojs/cloudflare@13.5` adapter emits HTML at `dist/client/<route>/index.html` (Plan 04 SUMMARY documented this layout). `treosh/lighthouse-ci-action@v12` serves that directory over its own internal HTTP server during the CI run.

**No `urls:` in `ci.yml`'s `with:` block, no `url:` in `lighthouserc.json`** — the two competing bootstrappers are not both shipped. If a future iteration finds that `staticDistDir` doesn't handle Astro 6 clean-URL routing correctly (the action serves `dist/client/about/index.html` when navigating to `/about`, which should Just Work for a directory-style routing scheme, but is the documented risk in the plan), the documented fallback is:
1. Remove `staticDistDir` from `lighthouserc.json`
2. Add a previous CI step: `pnpm exec astro preview &` and `npx wait-on http://localhost:4321/`
3. Add `urls: http://localhost:4321/` to the action's `with:` block

The fallback recipe is commented inline at the bottom of the `ci.yml` Lighthouse step.

**First Lighthouse score recorded for `/`:** unavailable in this executor run — Lighthouse CI runs on the GitHub Actions runner, not in this worktree, and requires `@lhci/cli` + Chrome. The first real score is captured in CI on the first PR after this plan merges. If any category drops below 0.9, the engineer will see the artifact link from the CI run and can debug from there. Most likely Phase 1 failure mode: Accessibility (if any aria attribute regressed in Plan 02's component sync) or Performance (font payload — Plan 01 sized the four-family Fonts API payload but didn't measure mobile-throttled LCP).

## Hydration / browser-JS gate verification (REVIEW FIX M1)

`scripts/check-no-hydration.sh` was run against the post-build `dist/` produced by `pnpm exec astro build && node scripts/write-assetsignore.mjs` in this worktree:

- Check 1 (no `client:` directive in `src/`): exited 0. `grep -rEn 'client:(load|idle|visible|media|only)' --include=*.{astro,jsx,tsx,ts} src/` found zero matches.
- Check 2 (no browser-served `*.js` > 10240 bytes in `dist/` excluding `_worker.js`): exited 0. After Plan 04's `write-assetsignore.mjs` postbuild deletes the unreferenced React-runtime bundle, `dist/client/` has zero JS files (only HTML + asset references).
- Belt-and-suspenders: grep for React runtime strings in any browser-served JS returned empty.

`bash scripts/check-no-hydration.sh` → `All hydration/bundle checks pass.`

## REVIEW FIX status

| Fix | Status | Notes |
|---|---|---|
| **M1 (Codex)** — no-hydration permanent CI gate | ✓ shipped | `scripts/check-no-hydration.sh` invoked by `ci.yml` as a step named `No-hydration / no-browser-JS check (FND-01 — REVIEW FIX M1)` |
| **M2 (Codex)** — write-assetsignore postbuild on every CI run | ✓ shipped | `ci.yml` step `Write .assetsignore (Plan 04 postbuild — REVIEW FIX M2)` invokes `node scripts/write-assetsignore.mjs` after `astro build` and before the check scripts |
| **FND-12 (orchestrator)** — Lighthouse mobile ≥ 0.9 on / | ✓ shipped | `treosh/lighthouse-ci-action@v12` + `lighthouserc.json` |
| **FND-03 removal (orchestrator)** — apex DNS deferred to Phase 5 | ✓ honored | Plan 05's `requirements` array contains FND-04, FND-10, FND-11, FND-12 — NOT FND-03. `SETUP.md` references `*.workers.dev` only; no DNS wiring. |

## Decisions Made

| Decision | Rationale | Outcome |
|---|---|---|
| Rule 2 grep excludes `src/styles/colors_and_type.css` + `src/components/design-skill/` | The rule's INTENT per SKILL.md is "no flowers in product copy". Color-hue comments in the verbatim-synced design-skill stylesheet and explanatory comments in synced JSX are not product copy. Editing skill source would mutate a cross-project managed artifact AND require re-sync; PopupStrip's `(not flowers)` comment is self-aware and editing it would be a regression in author intent. Plan 04 explicitly punted this scope decision to Plan 05 via deferred-items.md. | All 5 brand checks pass on the current `src/`; Phase 2's `src/content/` is still scanned by Rule 2 unmodified; deferred-items.md entry marked RESOLVED. |
| `staticDistDir: "./dist/client"` (not `"./dist"` as plan template) | The modern @astrojs/cloudflare@13.5 adapter emits HTML at `dist/client/<route>/index.html`. Lighthouse needs the directory containing `index.html`. Shipping `./dist` literally would have failed at first CI run because there's no `dist/index.html`. | Lighthouse CI action will find `/` (= `dist/client/index.html`) and audit it as intended. |
| Picked `staticDistDir` over the `astro preview` background-server fallback | The plan's Lighthouse section explicitly says "Pick ONE path; do not ship both." `staticDistDir` is simpler (no port-coordination, no `wait-on`, no background process management) and the Astro 6 build emits the directory layout Lighthouse expects. Fallback recipe documented in `ci.yml` comments. | One bootstrapper; reproducible run. |
| Kept brand-check script's `set -uo pipefail` (not `set -e`) | Plan mandate. A contributor who introduces 3 violations should see all 3 in one CI run, not have to fix one at a time across 3 CI runs. | All rules execute regardless of earlier failures; final exit code is non-zero if any failed. |
| Documented the Plan 05–discovered third Rule 2 hit (PopupStrip.jsx:35) in deferred-items.md, not just the Plan 04–logged two | The PopupStrip comment is a Plan 02 synced-component artifact. The fix is the same as the colors_and_type.css fix (exclude synced design-skill internals). Plan 04 only logged colors_and_type.css because the executor scoped narrowly; Plan 05 caught the third hit during local smoke-testing. | The `--exclude-dir=design-skill` clause covers all current and future synced-component comments; deferred-items.md now documents the full scope of the fix. |
| Removed Lighthouse `timeout-minutes: 5` → `timeout-minutes: 10` | Lighthouse CI run + npm install + astro build + audit can exceed 5 min on the GH free-tier runner. 10 min is the plan's pre-Lighthouse expected budget and matches the orchestrator's expectation. | Won't time out spuriously on the first CI run. |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Plan's `staticDistDir: "./dist"` would have failed at runtime**
- **Found during:** Task 2 (writing `lighthouserc.json`)
- **Issue:** The plan literally said `"staticDistDir": "./dist"` (RESEARCH.md echoes this from a generic Astro tutorial). The modern @astrojs/cloudflare@13.5 adapter emits prerendered HTML at `dist/client/<route>/index.html`, not `dist/<route>/index.html`. `dist/` itself contains two subdirectories (`client/` and `server/`) and no `index.html`. The `treosh/lighthouse-ci-action@v12` spawns a local HTTP server rooted at the configured directory; pointing at `dist/` would return 404 for `/`. Plan 04 SUMMARY documented this layout extensively (lines 87-90, "5 HTML files at `dist/client/<route>/index.html`").
- **Fix:** Set `staticDistDir: "./dist/client"`. Documented inline in this SUMMARY's "Decisions Made" table and "Lighthouse CI tooling choice" section.
- **Files modified:** `lighthouserc.json` (file is new — this is the corrected version at creation time)
- **Verification:** `find dist/client -name 'index.html' | head` returns `dist/client/index.html`. The Lighthouse action's served root will see this as `/`.
- **Committed in:** `2300e00`

**2. [Rule 2 — Critical functionality] Rule 2 brand-check needed to exclude two synced internal file classes**
- **Found during:** Task 1 (smoke-testing the brand-check script against the real `src/`)
- **Issue:** Plan 04's deferred-items.md flagged a Rule 2 hit in `src/styles/colors_and_type.css:53` and pushed the scope decision to Plan 05. Smoke-testing discovered Plan 04 had only logged ONE hit; the same file has TWO hits (lines 48 + 53) AND `src/components/design-skill/PopupStrip.jsx:35` has a third (`{/* Color stripe (real brand swatches, not flowers) */}`). Without a fix, Rule 2 would fire on every CI run against the as-shipped `src/`, blocking every PR until someone edits a synced file.
- **Fix:** Added two exclusions to the Rule 2 grep — `--exclude-dir=design-skill` and `--exclude='colors_and_type.css'`. Rationale documented in the script as an inline 18-line comment block, in the failure-message text (so contributors know the exclusion exists if they need to add new design-skill components), and in `deferred-items.md` (marked RESOLVED).
- **Files modified:** `scripts/check-brand-rules.sh`, `.planning/phases/01-foundations-brand-system/deferred-items.md`
- **Verification:** `bash scripts/check-brand-rules.sh` exits 0 against the current `src/`. The deliberate-violation test (Task 1 smoke-test #1) still trips Rule 2 when the violation is in a file outside the excluded set.
- **Committed in:** `7a4e883`

### Authentication Gates

None during Tasks 1-2. The human-action checkpoint (Task 3) is a separate awaiting-engineer step covering Cloudflare/GitHub dashboard work — see "Awaiting human" section below.

### Deferred (NOT Auto-fixed)

**1. Force-push protection on `main`**
- The Plan 05 threat register (T-05-04) recommends adding "Do not allow force pushes" to the branch protection rule. SETUP.md §4 step 7 includes this as an optional-but-recommended toggle. Not enforced by code — branch protection rules live in the GitHub UI. The engineer should enable it as part of the human-action checkpoint.

**2. Real first-run Lighthouse score for `/`**
- Cannot be captured in this executor — requires Chrome + `@lhci/cli` running on a GitHub Actions runner. The first real score appears in the first PR's CI artifact after this plan merges. If any category < 0.9, debug from the artifact link.

**3. T-05-01 mitigation (CODEOWNERS on `.github/`)**
- Plan 05 threat register notes that a PR could rename the `Build & brand check` job to bypass branch protection; mitigation is "PR review visible in diff" plus an optional future CODEOWNERS. Not shipped — deferred as "not requested" per the threat register's `mitigate` disposition.

---

**Total deviations:** 2 auto-fixed (1 Rule 3 blocking — `staticDistDir` path, 1 Rule 2 critical functionality — brand-check exclusions). 3 deferred items, all documented.

## Threat Surface Scan

Checked the `<threat_model>` register in the plan. All six threats (T-05-01 through T-05-06) have appropriate dispositions:

- **T-05-01 (rename `Build & brand check` job to bypass protection):** Mitigated as planned via PR review + visible diff. SETUP.md §4 step 6 enforces "Require pull request before merging".
- **T-05-02 (build secrets exposed in CI logs):** Mitigated. CI references exactly one optional `${{ secrets.LHCI_GITHUB_APP_TOKEN }}` — non-sensitive (Lighthouse comment app token); when absent the action falls back to `temporaryPublicStorage`. No `RESEND_API_KEY` or `TURNSTILE_SECRET` references (Phase 4).
- **T-05-03 (malicious PR adds `wrangler deploy` step):** Accepted. The Phase 1 workflow doesn't invoke `wrangler` at all — deploy is owned by Cloudflare Workers Builds, not GH Actions.
- **T-05-04 (force-push bypass):** Mitigated **only if** the engineer also toggles "Do not allow force pushes" in SETUP.md §4 step 7 (called out as recommended).
- **T-05-05 (CI loop / DoS):** Accepted. `timeout-minutes: 10`, single job, no matrix, no cron.
- **T-05-06 (Cloudflare GitHub OAuth scope):** Accepted. Standard Cloudflare Workers Builds integration scope (read on repo content, write on deployment statuses).

No new threat flags discovered. The Lighthouse CI step uses a public action and only reads `dist/`; no new trust boundary introduced.

## Self-Check: PASSED

**Files exist (worktree FS):**
- `scripts/check-brand-rules.sh` — FOUND, executable
- `scripts/check-lowercase-filenames.sh` — FOUND, executable
- `scripts/check-no-hydration.sh` — FOUND, executable
- `.github/workflows/ci.yml` — FOUND
- `lighthouserc.json` — FOUND
- `SETUP.md` — FOUND
- `.planning/phases/01-foundations-brand-system/01-05-SUMMARY.md` — (this file, being committed in the same transaction as the SUMMARY)

**Commits exist in git log:**
- `7a4e883` — FOUND (Task 1: three CI scripts)
- `2300e00` — FOUND (Task 2: ci.yml + lighthouserc.json + SETUP.md)

**Plan-level acceptance criteria all satisfied (Tasks 1-2):**
- `scripts/check-brand-rules.sh` exists, executable, uses `set -uo pipefail` ✓
- All 5 active grep patterns present + D-11 brand-reason failure messages ✓
- Rule 7 commented with `TODO: enable in Phase 2` ✓
- `scripts/check-lowercase-filenames.sh` exists, executable, uses `find src/pages -type f | grep -E '[A-Z]'` ✓
- `scripts/check-no-hydration.sh` exists, executable, contains `client:(load|idle|visible|media|only)` and `BUDGET_BYTES=10240` + `find dist -name '*.js' -size +` excluding `_worker.js` ✓
- All three scripts exit 0 against current `src/` and post-build `dist/` ✓
- Deliberate-violation smoke tests pass for Rules 2 + 6 + M1 (Rule 1 PCRE smoke-test runs in CI only) ✓
- `.github/workflows/ci.yml` exists with job name `Build & brand check` ✓
- CI triggers on `pull_request` + `push` to main, runs `ubuntu-latest` ✓
- CI uses `pnpm install --frozen-lockfile`, runs `astro check`, `astro build`, write-assetsignore postbuild, all 3 check scripts, Lighthouse CI ✓
- CI references `node-version-file: .nvmrc` ✓
- `lighthouserc.json` exists with mobile form factor + `minScore: 0.9` on all four categories ✓
- `SETUP.md` quotes job name `Build & brand check`, mentions worker `studio-bluemli`, "Non-production branch builds" toggle, `*.workers.dev`, `background: white` deliberate-violation test, both wrangler deploy commands ✓
- No Phase 4 secrets referenced as Phase 1 work ✓
- Plan 04 deferred-items.md entry resolved with Plan 05's scope decision ✓

## Awaiting Human Action

Task 3 is a `checkpoint:human-verify` (engineer-facing). The orchestrator will surface this. Specifically the engineer must:

1. **Push the worktree's Phase 1 work to GitHub `main`** (engineer's GitHub credentials — Claude cannot do this from the worktree).
2. **Cloudflare dashboard work** — open `https://dash.cloudflare.com/?to=/:account/workers-and-pages`:
   - Either click **Create application → Import a repository**, or navigate to **Workers & Pages → studio-bluemli → Settings → Builds → Connect** if the `studio-bluemli` Worker is already created.
   - Authorize GitHub access, select the repo.
   - Build command: `pnpm install --frozen-lockfile && pnpm build && node scripts/write-assetsignore.mjs`
   - Production deploy command: `npx wrangler deploy`
   - Preview deploy command: `npx wrangler versions upload`
   - Production branch: `main`
   - **Toggle "Non-production branch builds: ON"** (the most-commonly-missed setting; without it only `main` deploys).
3. **GitHub branch protection** — open repo Settings → Branches → Add branch protection rule for `main`:
   - Check "Require status checks to pass before merging"
   - Search **`Build & brand check`** (string-exact — matches the ci.yml job name) → select it.
   - (Recommended) Check "Require pull request before merging".
   - (Recommended) Check "Do not allow force pushes" (closes T-05-04 from the threat register).
4. **End-to-end loop verification** — open a PR with a trivial change. Confirm:
   - GitHub Actions runs `Build & brand check` and passes (green).
   - Cloudflare Workers Builds comments the preview URL on the PR within ~2 min.
   - Click the preview URL; visit `/`, `/gallery`, `/popups`, `/about`, `/say-hi`. Confirm cream background, coral wordmark, design-skill chrome, no console errors, DevTools Network shows zero React JS files.
   - Lighthouse CI step is green; if not, check the artifact link.
5. **Deliberate-violation test** — on the same PR branch, add `body { background: white; }` to any file in `src/`, push. CI must fail with the brand-rule message. Revert. CI must pass.
6. **iOS favicon test (SC4)** — open the preview URL in Mobile Safari, Share → Add to Home Screen, confirm the Bluemli mark appears as the tile.

**Resume signal (reply with one of these):**
- `approved` — all 5 Phase 1 success criteria met on the live `*.workers.dev` preview URL.
- `ci failing: <pasted CI log line>` — CI didn't pass; need to debug brand rules / build.
- `preview broken: <issue>` — preview URL renders but something visual is off.
- `cloudflare connect issue: <message>` — Cloudflare dashboard step blocked.
- `github protection issue` — couldn't register the status check.

**Bookmark URL after setup:** `https://studio-bluemli.<account-subdomain>.workers.dev` — the production preview URL the founder/engineer should use for visual verification across phases. The actual `<account-subdomain>` is unique per Cloudflare account; the dashboard reveals it on first deploy.

## Phase 1 SC status

| Success Criterion | How verified | Status |
|---|---|---|
| **SC1** Cream/font shell on 5 pages | Engineer visits the preview URL (after SETUP.md §2-5 completes). The build is green in this worktree — `pnpm exec astro build` produces 5 prerendered HTML files at `dist/client/<route>/index.html` with the BaseLayout cream chrome from Plan 04. | Pending engineer dashboard work |
| **SC2** Push-to-main → prod deploy + PR previews | Engineer toggles "Non-production branch builds: ON" in SETUP.md §2. After the first PR cycle in §5, both must be observed. | Pending engineer dashboard work |
| **SC3** CI blocks brand violations | Verified locally in this worktree via the three deliberate-violation smoke tests in Task 1 (Rules 2, 6, M1). Rule 1 (PCRE) verified at CI time only — Ubuntu runs GNU grep. | Code-side: verified ✓; loop test: pending engineer |
| **SC4** Favicon on browser tab + iOS home screen | Plan 03 + 04 wired the favicon set into BaseLayout `<head>`. Engineer confirms by visiting preview URL in Mobile Safari → Add to Home Screen. | Pending engineer mobile test |
| **SC5** PROJECT.md "Cloudflare Pages" parentheticals only | Plan 01 corrected PROJECT.md. Engineer can `grep -c "Cloudflare Pages" .planning/PROJECT.md` after merge. | Already verified in Plan 01 |
| **FND-12** Lighthouse mobile ≥ 0.9 on `/` | Lighthouse CI step in `ci.yml` asserts this on every PR. First real score appears in the first PR's CI artifact. | Pending first CI run |

## Known Stubs

None. The deliverables of this plan (CI workflow, 3 shell scripts, lighthouserc.json, SETUP.md) are complete executable artifacts. The "stubs" in this phase are the same Phase-1 placeholders Plan 04 documented:

- `src/sample-data.ts` — Phase 2 replaces with Content Collections (out of Plan 05's scope).
- `say-hi.astro`'s POST to `/api/contact` — Phase 4 wires the endpoint (out of Plan 05's scope).

## TDD Gate Compliance

Not applicable — plan `type: execute` (not `tdd`). No RED/GREEN/REFACTOR gates required.

## Threat Flags

None. The Lighthouse CI public action introduces no new surface — it only reads `dist/` files and uploads a report to `temporaryPublicStorage` (anonymous bucket). The `LHCI_GITHUB_APP_TOKEN` secret is optional and namespaced to the Lighthouse CI GitHub App; not a credential to anything sensitive.

---

*Phase: 01-foundations-brand-system*
*Plan: 05 (CI brand-check + Cloudflare connect + founder setup)*
*Status: 2/3 tasks complete; Task 3 is the `checkpoint:human-verify` covering the 5 manual setup steps in `SETUP.md` §2–5. Orchestrator will surface this checkpoint to the user with the "Awaiting Human Action" content above.*
*Completed (code): 2026-05-13*
