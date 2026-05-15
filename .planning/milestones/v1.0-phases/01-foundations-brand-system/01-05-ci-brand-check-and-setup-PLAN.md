---
plan_id: 01-05
phase: 1
phase_slug: 01-foundations-brand-system
plan: 05
type: execute
wave: 3
depends_on: ["01-01", "01-02", "01-04"]
autonomous: false
requirements: [FND-04, FND-10, FND-11, FND-12]
files_modified:
  - .github/workflows/ci.yml
  - lighthouserc.json
  - scripts/check-brand-rules.sh
  - scripts/check-lowercase-filenames.sh
  - scripts/check-no-hydration.sh
  - SETUP.md
tags: [ci, github-actions, brand-enforcement, cloudflare-workers-builds, founder-setup]
user_setup:
  - service: github
    why: "Required status check + branch protection"
    dashboard_config:
      - task: "Add 'Build & brand check' as a required status check on main"
        location: "GitHub → repo Settings → Branches → Branch protection rule for main"
  - service: cloudflare-workers
    why: "Auto-deploy + per-branch preview URLs (FND-04)"
    dashboard_config:
      - task: "Create Worker, connect repo, enable non-production branch builds"
        location: "Cloudflare dashboard → Workers & Pages → studio-bluemli → Settings → Builds"
must_haves:
  truths:
    - ".github/workflows/ci.yml exists and runs on PR + push to main"
    - "CI job is named exactly 'Build & brand check' so the founder/engineer can register it in GitHub branch protection"
    - "scripts/check-brand-rules.sh enforces all 5 active brand grep rules (Rule 7 sample-data leak is COMMENTED for Phase 1 with a TODO marker)"
    - "scripts/check-no-hydration.sh enforces the 'no `client:` directives + no large browser JS bundle' contract every CI run (REVIEW FIX M1)"
    - "CI runs Lighthouse CI (mobile preset) against the *.workers.dev preview URL after deploy and asserts Performance/Accessibility/Best Practices/SEO each ≥ 90 on the landing route `/` (orchestrator decision FND-12 — replaces deferred Phase 5 work)"
    - "scripts/check-lowercase-filenames.sh fails when any src/pages/ filename contains an uppercase letter (FND-11)"
    - "A deliberate violation (`bg-white` added to a temp file in src/) makes CI fail; reverting makes it pass"
    - "SETUP.md walks the engineer through the 5 founder-facing setup steps that cannot live in code"
    - "D-07: Brand-non-negotiable grep rules run in GitHub Actions as a required status check that blocks PR merge"
    - "D-08: No local pre-commit hook — founder may edit via GitHub web UI; pre-commit would not fire on web edits and would create asymmetric friction"
    - "D-09: Grep rules scope src/** and src/content/**; excludes dist/, node_modules/, .planning/, .claude/, CONTENT_EDITING.md"
    - "D-10: #fff8 (cream tint, 8-digit hex with alpha) is the one whitelisted 'looks white' value; regex uses negative lookahead"
  artifacts:
    - path: ".github/workflows/ci.yml"
      provides: "GitHub Actions required status check (astro check + astro build + brand grep + lowercase check)"
      contains: "Build & brand check"
    - path: "scripts/check-brand-rules.sh"
      provides: "5 active brand-rule checks + 1 deferred (sample-data leak)"
      contains: "backdrop-filter"
    - path: "scripts/check-lowercase-filenames.sh"
      provides: "fail-on-uppercase check for src/pages/"
    - path: "scripts/check-no-hydration.sh"
      provides: "fails CI if any client: directive appears in src/ OR if dist/ ships a browser JS bundle larger than the size budget (REVIEW FIX M1)"
    - path: "SETUP.md"
      provides: "founder-facing setup steps for Cloudflare git connect + GitHub status check + verification loop"
  key_links:
    - from: ".github/workflows/ci.yml"
      to: "scripts/check-brand-rules.sh, scripts/check-lowercase-filenames.sh"
      via: "bash scripts/check-*.sh steps"
      pattern: "bash scripts/check-"
    - from: "SETUP.md step 4"
      to: ".github/workflows/ci.yml job name"
      via: "branch protection rule registers 'Build & brand check' as required"
      pattern: "Build & brand check"
---

<objective>
Wire the GitHub Actions CI workflow that runs `astro check` + `astro build` + the brand-rule grep + the lowercase-filename check on every PR and push to `main`. Write the two shell scripts the workflow invokes (`scripts/check-brand-rules.sh`, `scripts/check-lowercase-filenames.sh`) with the exact pinned regex patterns from RESEARCH.md. Then write a `SETUP.md` that walks the engineer through the 5 founder-facing setup steps Claude cannot do via CLI (Cloudflare git integration, GitHub branch protection, etc.).

Purpose: Ship FND-10 (CI grep enforcement), FND-11 (lowercase filenames), FND-12 (Lighthouse mobile ≥ 90 on `/` in CI — orchestrator decision moves this from Phase 5 to Phase 1), and the no-hydration/no-browser-JS CI gate (REVIEW FIX M1). Also document the dashboard-only steps that complete FND-04 (push-to-main production deploy + per-PR preview URLs). FND-03 (apex + www → apex 301) was removed from Phase 1 per orchestrator decision and is now Phase 5 work. After this plan, every Phase 1 success criterion is either met automatically (1, 3, 4, 5) or has a documented manual verification path (2).

Output: GitHub Actions ready to run; the founder/engineer can complete the Cloudflare connect + GitHub branch protection steps from SETUP.md and verify the loop (deliberate violation → CI fails → revert → CI passes).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundations-brand-system/01-CONTEXT.md
@.planning/phases/01-foundations-brand-system/01-RESEARCH.md
@.planning/phases/01-foundations-brand-system/01-PATTERNS.md
@.planning/phases/01-foundations-brand-system/01-UI-SPEC.md
@.planning/phases/01-foundations-brand-system/01-01-SUMMARY.md
@.planning/phases/01-foundations-brand-system/01-04-SUMMARY.md
@package.json
@wrangler.jsonc

<interfaces>
<!-- CI workflow contract (RESEARCH.md "GitHub Actions workflow" lines 1115-1158; UPDATED for review-replan): -->
<!-- - Job name: "Build & brand check" (exact — engineer registers this string in branch protection) -->
<!-- - Triggers: pull_request on main, push on main -->
<!-- - Steps order: checkout → pnpm setup → Node setup (reads .nvmrc) → install --frozen-lockfile → astro check → astro build → write-assetsignore (Plan 04's postbuild) → brand-check.sh → lowercase-check.sh → no-hydration-check.sh → Cloudflare deploy preview → Lighthouse CI on preview URL -->
<!-- - Runner: ubuntu-latest (GNU grep available — required for PCRE -P flag in Rule 1) -->
<!-- - REVIEW FIX M1: no-hydration-check enforces 'no client: directives + no large browser JS' as a permanent CI gate, not just a one-time local check -->
<!-- - Orchestrator decision FND-12: Lighthouse CI runs against the *.workers.dev preview URL captured from the Cloudflare deploy step. Mobile-only audit. Block on Performance / Accessibility / Best Practices / SEO ≥ 90 for the landing route `/`. Tooling: treosh/lighthouse-ci-action (preferred) or `lhci autorun` against `astro preview` as fallback -->
<!-- - Orchestrator decision FND-03 removed: FND-03 (apex studiobluemli.com + www → apex redirect) is now Phase 5 work; this plan does NOT claim FND-03 in `requirements` and SETUP.md no longer wires DNS or 301 redirects -->

<!-- Pinned grep patterns (RESEARCH.md "CI Grep Rules — Pinned" lines 371-526): -->
<!-- Rule 1 (whites): (bg-white|background:\s*white|#fff(?![0-9a-fA-F])|#[fF]{6}) — PCRE — grep -rEnP -->
<!-- Rule 2 (flowers): \b(flower|petal|floral|bloom|blossom)\b — case-insensitive — grep -rEni -->
<!-- Rule 3 (gradients): gradient — grep -rEn -->
<!-- Rule 4 (backdrop-filter): (backdrop-filter|backdropFilter|WebkitBackdropFilter) — grep -rEn -->
<!-- Rule 5 (1px borders): border(-top|-bottom|-left|-right)?:\s*1px — grep -rEn -->
<!-- Rule 6 (lowercase filenames): find src/pages -type f | grep -E '[A-Z]' — exit 0 = FAIL -->
<!-- Rule 7 (sample-data leak): "Sample Piece" in src/content/ — DISABLED in Phase 1 (commented out) — Phase 2 uncomments -->

<!-- Scope flags (D-09): -->
<!--   Include: src/ -->
<!--   Exclude: node_modules, dist, .git, .planning, .claude -->
<!--   File types: *.{astro,jsx,tsx,ts,css} for code-style rules; all files for vocabulary rule -->

<!-- Failure-message style (D-11): each rule must name the BRAND REASON, not just the pattern. -->
<!-- Example: "The studio's earrings are beaded clusters, not flowers — pick a neutral word." -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write the three CI scripts (brand-rules + lowercase-filenames + no-hydration)</name>
  <files>scripts/check-brand-rules.sh, scripts/check-lowercase-filenames.sh, scripts/check-no-hydration.sh</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-RESEARCH.md (§"Brand-check shell script" lines 1166-1237 — copy verbatim; §"check-lowercase-filenames.sh" lines 1240-1257)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-PATTERNS.md (lines 783-831 — verified shape + critical constraints)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-CONTEXT.md (D-07..D-11 — all CI enforcement constraints; D-10 #fff8 whitelist; D-11 failure messages must name brand reason)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-UI-SPEC.md (§"CI Brand Enforcement Rules" lines 372-388 — failure messages)
    - Confirm src/ exists from Plans 02 + 04 — these scripts grep against real files: `ls src/components/design-skill src/pages src/styles`
  </read_first>
  <action>
**Step 1 — Write `scripts/check-brand-rules.sh`** at the path `scripts/check-brand-rules.sh`. Use this exact content (RESEARCH.md lines 1166-1237, with D-11 failure-message style):

```bash
#!/usr/bin/env bash
# scripts/check-brand-rules.sh — FND-10 brand-non-negotiable enforcement.
#
# Runs as a required status check in .github/workflows/ci.yml. Blocks PR merge
# if any rule fires. D-07: required status check. D-11: every failure message
# names the brand REASON, not just the pattern.
#
# NOT set -e — we want to collect ALL violations before exiting, so a contributor
# sees every needed fix in one CI run.
set -uo pipefail

failed=0

# Rule 1: cream-only backgrounds (FND-10) — D-10: whitelist #fff8
# Pattern catches:
#   bg-white, background: white, #fff (3-digit, not followed by hex), #FFFFFF (6-digit)
# Whitelists:
#   #fff8 (cream tint with alpha — the only allowed near-white)
# Uses -P for PCRE negative lookahead.
if grep -rEnP '(bg-white|background:\s*white|#fff(?![0-9a-fA-F])|#[fF]{6})' \
     --include='*.astro' --include='*.jsx' --include='*.tsx' --include='*.ts' --include='*.css' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/ ; then
  echo ""
  echo "FAIL: The site background must be cream (#F5DCC7), never white."
  echo "  Fix: replace with var(--color-bg) or a cream token from colors_and_type.css."
  echo "  The only whitelisted near-white value is #fff8 (cream tint with alpha)."
  failed=1
fi

# Rule 2: no flower vocabulary (FND-10)
# Pattern: word-boundary anchored, case-insensitive. Scope: all files under src/
# AND src/content/ (Phase 2 readiness — even though src/content/ doesn't exist yet
# in Phase 1, the grep tolerates missing dirs).
if grep -rEni '\b(flower|petal|floral|bloom|blossom)\b' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/ ; then
  echo ""
  echo "FAIL: The studio's earrings are beaded clusters, not flowers — pick a neutral word."
  echo "  This applies to copy, alt text, comments, file names — anywhere in src/."
  echo "  See .claude/skills/studio-bluemli-design/README.md → 'Vocabulary'."
  failed=1
fi

# Rule 3: no UI gradients (FND-10)
if grep -rEn 'gradient' \
     --include='*.astro' --include='*.jsx' --include='*.tsx' --include='*.css' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/ ; then
  echo ""
  echo "FAIL: Gradients conflict with the Bluemli flat-color brand language."
  echo "  Fix: use flat fills from the palette tokens (var(--coral-500) etc.)."
  echo "  See src/styles/colors_and_type.css for available tokens."
  failed=1
fi

# Rule 4: no backdrop-filter (FND-10) — catches both CSS and JSX inline-style forms.
# Pitfall: the original design-skill Header.jsx uses backdropFilter: 'blur(4px)'; the
# sync-script Transform 4 removes it (Plan 02). This CI rule is the safety net.
if grep -rEn '(backdrop-filter|backdropFilter|WebkitBackdropFilter)' \
     --include='*.astro' --include='*.jsx' --include='*.tsx' --include='*.css' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/ ; then
  echo ""
  echo "FAIL: backdrop-filter is frosted-glass SaaS aesthetic — not Bluemli."
  echo "  Fix: replace with a solid cream background, e.g."
  echo "       background: rgba(245, 220, 199, 0.92);"
  failed=1
fi

# Rule 5: no 1px borders (FND-10)
# Pattern anchors on the `1px` value so border-radius / border-collapse / border: none
# DO NOT match. border-top/bottom/left/right: 1px also caught.
if grep -rEn 'border(-top|-bottom|-left|-right)?:\s*1px' \
     --include='*.astro' --include='*.jsx' --include='*.tsx' --include='*.css' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/ ; then
  echo ""
  echo "FAIL: Hard 1px borders are not Bluemli."
  echo "  Fix: use var(--color-border-soft) (rgba subtle), var(--shadow-xs), or no border."
  echo "  If you need an outline, use box-shadow: inset 0 0 0 2px var(--color);"
  failed=1
fi

# Rule 7: sample-data leak (D-03) — DISABLED in Phase 1. Phase 2 uncomments.
# Once Phase 2 ships real Content Collections, any "Sample Piece" string surviving
# in src/content/ is a leak from the deleted src/sample-data.ts.
# TODO: enable in Phase 2 plan by uncommenting the if-block below.
#
# if grep -rEn '"Sample Piece"' \
#      --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
#      --exclude-dir=.planning --exclude-dir=.claude \
#      src/content/ 2>/dev/null ; then
#   echo ""
#   echo "FAIL: Remove sample-data markers before merging — Phase 2 ships real content."
#   echo "  Sample-data lives only in src/sample-data.ts during Phase 1; Phase 2 deletes that file."
#   failed=1
# fi

if [ "$failed" -eq 0 ]; then
  echo "All brand rules pass."
fi
exit "$failed"
```

**Step 2 — Make the script executable.**
```bash
chmod +x scripts/check-brand-rules.sh
```

**Step 3 — Write `scripts/check-lowercase-filenames.sh`** (RESEARCH.md lines 1240-1257 verbatim):

```bash
#!/usr/bin/env bash
# scripts/check-lowercase-filenames.sh — FND-11
#
# macOS APFS is case-insensitive; Linux (Cloudflare runtime) is not.
# A page at src/pages/Gallery.astro works on the developer's Mac and 404s
# in production. This script catches the mismatch at PR time.
set -uo pipefail

violations=$(find src/pages -type f | grep -E '[A-Z]' || true)

if [ -n "$violations" ]; then
  echo "FAIL: src/pages/ filenames must be lowercase-only."
  echo "  Found uppercase letters in:"
  echo "$violations" | sed 's/^/    /'
  echo ""
  echo "  macOS is case-insensitive; Linux is not — mixed case causes 404s in production."
  echo "  Rename each file to all-lowercase."
  exit 1
fi

echo "All src/pages/ filenames are lowercase."
exit 0
```

**Step 4 — Make the second script executable.**
```bash
chmod +x scripts/check-lowercase-filenames.sh
```

**Step 4b — Write `scripts/check-no-hydration.sh`** (REVIEW FIX M1 — Codex review). This is a NEW Phase 1 CI gate. Two checks, both run on every PR/push:

1. **Source-level grep**: fail if any `client:(load|idle|visible|media|only)` directive appears anywhere under `src/`. The "no `client:` directive" invariant was previously verified only once locally in Plan 04 Task 3 — now it's permanent CI.
2. **Build-output size budget**: fail if the post-build `dist/` ships browser-served JS bundles larger than the threshold. Excludes `_worker.js` (the SSR Worker entrypoint, not browser code).

Write the file at `scripts/check-no-hydration.sh`:

```bash
#!/usr/bin/env bash
# scripts/check-no-hydration.sh — REVIEW FIX M1 (Codex review)
#
# Enforces the "Astro renders React server-side only" contract in CI:
#   (1) No client:load|idle|visible|media|only directives anywhere in src/
#   (2) No large browser-served JS bundles in dist/ (the post-build output)
#
# Without this gate, a future PR could add `client:load` to one of the
# design-skill components and silently ship React (~40KB gz) to every browser
# — tanking mobile Lighthouse and violating the FND-01 "React server-rendered
# only" requirement. Codex flagged this as a missing invariant.
#
# This script runs AFTER `astro build` so dist/ exists.
set -uo pipefail

failed=0

# ---- Check 1: no client: directives in src/ ----
# Skip comments in *.md files via --include filter; we only care about code.
if grep -rEn 'client:(load|idle|visible|media|only)' \
     --include='*.astro' --include='*.jsx' --include='*.tsx' --include='*.ts' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/ ; then
  echo ""
  echo "FAIL: Found a client: directive in src/."
  echo "  Phase 1 requires zero React in the browser — every JSX component must"
  echo "  render server-side as static HTML. The design-skill components were"
  echo "  refactored (Plan 02) to drop useState/onClick so they DON'T need hydration."
  echo "  If you really need client interactivity, surface it via plain HTML/CSS"
  echo "  patterns (e.g., <details>/<summary> for disclosure, <form> for submission)"
  echo "  before reaching for a client: directive."
  failed=1
fi

# ---- Check 2: size budget on dist/ browser JS ----
# Astro 6 + @astrojs/cloudflare emits dist/_worker.js (SSR entry; NOT browser JS)
# plus, optionally, a tiny micro-runtime if any directive shipped. The
# zero-hydration contract means no large browser bundles should exist.
#
# Budget: any single browser-served .js file > 10240 bytes (10 KB) is a fail.
# Excludes _worker.js (and anything inside the _worker.js directory).
BUDGET_BYTES=10240
if [ -d dist ]; then
  LARGE=$(find dist -name '*.js' -size +"${BUDGET_BYTES}c" 2>/dev/null \
          | grep -v '/_worker.js' \
          || true)
  if [ -n "$LARGE" ]; then
    echo ""
    echo "FAIL: Found browser-served JS bundle(s) > ${BUDGET_BYTES} bytes in dist/:"
    echo "$LARGE" | sed 's/^/    /'
    echo "  The 'no client: directive' contract should yield zero (or near-zero)"
    echo "  browser JS. A bundle this size strongly suggests React (or another"
    echo "  framework runtime) accidentally shipped via a client: directive or"
    echo "  a hydration misconfiguration."
    echo "  Re-run check 1 above; if no client: directives are present, inspect"
    echo "  the build for unexpected hydration via 'astro check --verbose'."
    failed=1
  fi

  # Belt-and-suspenders: even if a small bundle exists, it must not include
  # the React production/development runtime.
  if grep -rlE 'react\.development|react\.production|react-dom\.development|react-dom\.production' \
       dist/ --include='*.js' 2>/dev/null \
       | grep -v '/_worker.js' \
       | head -5 | grep -q '.' ; then
    echo ""
    echo "FAIL: Browser-served JS in dist/ contains the React runtime."
    echo "  This violates the 'no client: directive' contract — React must not ship to the browser."
    failed=1
  fi
else
  echo "WARN: dist/ does not exist — has 'astro build' run? (skipping browser-JS check)"
  # Not a failure in isolation — CI runs astro build BEFORE this script, so by
  # the time this runs in the real pipeline, dist/ exists. In local dev or unit
  # tests, dist/ may be absent.
fi

if [ "$failed" -eq 0 ]; then
  echo "All hydration/bundle checks pass."
fi
exit "$failed"
```

Make it executable:
```bash
chmod +x scripts/check-no-hydration.sh
```

**Step 5 — Smoke-test all three scripts locally** against the real `src/` from Plans 02 + 04 (after `astro build` has produced `dist/`):
```bash
# 1) Brand-rule scan
bash scripts/check-brand-rules.sh
# Expected: "All brand rules pass." — exit 0

# 2) Lowercase filename scan
bash scripts/check-lowercase-filenames.sh
# Expected: "All src/pages/ filenames are lowercase." — exit 0

# 3) No-hydration / no-browser-JS scan
pnpm exec astro build   # ensure dist/ exists
node scripts/write-assetsignore.mjs  # Plan 04 postbuild (so dist/.assetsignore is in place)
bash scripts/check-no-hydration.sh
# Expected: "All hydration/bundle checks pass." — exit 0
```

**Step 6 — Smoke-test deliberate violations** to prove each script catches them:
```bash
# Brand-rule violation
echo 'div { background: white; }' > src/__test-violation.css
bash scripts/check-brand-rules.sh
# Expected: prints "FAIL: The site background must be cream..." — exit 1

# Uppercase filename violation
touch src/pages/__TestViolation.astro
bash scripts/check-lowercase-filenames.sh
# Expected: prints "FAIL: src/pages/ filenames must be lowercase-only..." — exit 1

# REVIEW FIX M1: client: directive violation
# Inject a fake client:load directive into a temp .jsx file under src/.
# (Using .jsx avoids embedding bare YAML-style triple-dashes that collide
# with the gsd-sdk plan-parser frontmatter regex when this plan is parsed.)
mkdir -p src/__test-hydration
printf 'import Hero from "../components/design-skill/Hero";\nexport default function Test() { return <Hero client:load />; }\n' > src/__test-hydration/leak.jsx
bash scripts/check-no-hydration.sh
# Expected: prints "FAIL: Found a client: directive in src/." — exit 1

# Clean up
rm -rf src/__test-violation.css src/pages/__TestViolation.astro src/__test-hydration/

# Re-run all three — should all pass again
bash scripts/check-brand-rules.sh && bash scripts/check-lowercase-filenames.sh && bash scripts/check-no-hydration.sh
# All three exit 0
```

This smoke-test sequence proves the scripts work both ways (pass on clean code, fail on violations). If a violation does NOT trigger the failure, inspect the grep flags and regex — the most common bug is forgetting `-P` for PCRE lookahead in Rule 1.
  </action>
  <verify>
    <automated>test -x scripts/check-brand-rules.sh && test -x scripts/check-lowercase-filenames.sh && test -x scripts/check-no-hydration.sh && grep -q "set -uo pipefail" scripts/check-brand-rules.sh && grep -q "client:(load|idle|visible|media|only)" scripts/check-no-hydration.sh && grep -q "BUDGET_BYTES" scripts/check-no-hydration.sh && grep -q "bg-white" scripts/check-brand-rules.sh && grep -q "background:\\\\s\\*white" scripts/check-brand-rules.sh && grep -q "fff(?\\!" scripts/check-brand-rules.sh && grep -q "flower" scripts/check-brand-rules.sh && grep -q "petal" scripts/check-brand-rules.sh && grep -q "gradient" scripts/check-brand-rules.sh && grep -q "backdrop-filter" scripts/check-brand-rules.sh && grep -q "border" scripts/check-brand-rules.sh && grep -q "1px" scripts/check-brand-rules.sh && grep -q "beaded clusters, not flowers" scripts/check-brand-rules.sh && grep -q "cream" scripts/check-brand-rules.sh && grep -q "TODO: enable in Phase 2" scripts/check-brand-rules.sh && grep -q "find src/pages" scripts/check-lowercase-filenames.sh && grep -q "macOS is case-insensitive" scripts/check-lowercase-filenames.sh && bash scripts/check-brand-rules.sh && bash scripts/check-lowercase-filenames.sh</automated>
  </verify>
  <acceptance_criteria>
    - File `scripts/check-brand-rules.sh` exists and is executable: `test -x scripts/check-brand-rules.sh` exits 0
    - File `scripts/check-lowercase-filenames.sh` exists and is executable
    - **NEW (REVIEW FIX M1):** File `scripts/check-no-hydration.sh` exists and is executable: `test -x scripts/check-no-hydration.sh` exits 0
    - **NEW (REVIEW FIX M1):** `scripts/check-no-hydration.sh` contains the grep pattern `client:(load|idle|visible|media|only)` (Check 1: source-level no-client-directive scan)
    - **NEW (REVIEW FIX M1):** `scripts/check-no-hydration.sh` contains a `BUDGET_BYTES=10240` (or similar named threshold) AND a `find dist -name '*.js' -size +` pattern excluding `_worker.js` (Check 2: build-output size budget)
    - **NEW (REVIEW FIX M1):** Running `bash scripts/check-no-hydration.sh` against a clean post-build state exits 0 with output "All hydration/bundle checks pass."
    - **NEW (REVIEW FIX M1):** Deliberate-violation smoke test: writing a temp page with `<Hero client:load />` and running the script exits 1 with the documented FAIL message
    - `scripts/check-brand-rules.sh` uses `set -uo pipefail` (NOT `set -e` — collects all violations)
    - Contains all 5 active grep patterns:
      - `bg-white` and `background:\s*white` (Rule 1)
      - `fff(?` (Rule 1 PCRE negative-lookahead anchor)
      - `flower`, `petal`, `floral`, `bloom`, `blossom` (Rule 2 — all five words must appear in the rule)
      - `gradient` (Rule 3)
      - `backdrop-filter` (Rule 4)
      - `border` and `1px` (Rule 5)
    - Contains D-11 brand-reason failure messages: `grep -q "beaded clusters, not flowers" scripts/check-brand-rules.sh` exits 0 (Rule 2 message names the brand reason); `grep -q "frosted-glass" scripts/check-brand-rules.sh` exits 0 (Rule 4 message); `grep -q "Hard 1px borders are not Bluemli" scripts/check-brand-rules.sh` exits 0
    - Rule 7 is documented as deferred: `grep -q "TODO: enable in Phase 2" scripts/check-brand-rules.sh` exits 0
    - `scripts/check-lowercase-filenames.sh` uses `find src/pages -type f` and `grep -E '[A-Z]'`
    - Running `bash scripts/check-brand-rules.sh` against the current `src/` (from Plans 02 + 04) exits 0 with output "All brand rules pass."
    - Running `bash scripts/check-lowercase-filenames.sh` exits 0 with output "All src/pages/ filenames are lowercase."
    - Smoke-test verification (from action step 6): adding `bg-white` to any temp file in `src/` makes the brand-check script exit non-zero; adding any uppercase file in `src/pages/` makes the lowercase-check script exit non-zero. (The acceptance criterion above implicitly captures this because if the scripts didn't trip on violations they'd be useless — verify with the action's deliberate-violation step.)
  </acceptance_criteria>
  <done>Both scripts run cleanly against the real `src/` and trip on injected violations. They're ready to be invoked by GitHub Actions in Task 2.</done>
</task>

<task type="auto">
  <name>Task 2: Write .github/workflows/ci.yml + SETUP.md</name>
  <files>.github/workflows/ci.yml, SETUP.md, lighthouserc.json</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-RESEARCH.md (§"GitHub Actions workflow" lines 1115-1158 — copy verbatim; §"Founder-Facing Setup Checklist" lines 1306-1341 — the 5 manual steps SETUP.md must document)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-PATTERNS.md (lines 833-845 — ci.yml critical constraints)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-CONTEXT.md (D-07 required status check; D-12 worker name; D-13 *.workers.dev only in Phase 1)
    - /Users/lucacanonica/Documents/projects/bluemli/.nvmrc (just written in Plan 01 — confirms Node version pin path; CI uses `node-version-file: .nvmrc`)
    - /Users/lucacanonica/Documents/projects/bluemli/package.json (confirms the engines + scripts available)
    - /Users/lucacanonica/Documents/projects/bluemli/wrangler.jsonc (confirms `name: "studio-bluemli"` — referenced in SETUP.md step 2 for the dashboard wording)
  </read_first>
  <action>
**Step 1 — Create the `.github/workflows/` directory.**
```bash
mkdir -p .github/workflows
```

**Step 2 — Write `.github/workflows/ci.yml`** at the path `.github/workflows/ci.yml`. Use this exact content (RESEARCH.md lines 1115-1158 verbatim — the structure has been verified):

```yaml
# .github/workflows/ci.yml
# Required status check for Phase 1 foundations (FND-04, FND-10, FND-11, FND-12).
#
# After this file is merged once, the engineer adds "Build & brand check"
# as a required status check in GitHub branch protection. See SETUP.md.
#
# REVIEW FIX M1: includes scripts/check-no-hydration.sh (no client: directives
# + browser JS size budget) — enforced on every PR, not just one local check.
#
# Orchestrator decision FND-12: Lighthouse CI runs against the *.workers.dev
# preview URL after deploy. Mobile-only audit. Asserts Performance / Accessibility
# / Best Practices / SEO ≥ 90 on the landing route `/`. Tooling:
# treosh/lighthouse-ci-action (preferred) against the deployed preview URL
# (`${{ steps.deploy.outputs.deployment-url }}` if using cloudflare/wrangler-action),
# OR `lhci autorun` against `astro preview` if preview-URL plumbing is too complex
# in the engineer's GitHub setup (acceptable fallback per orchestrator).

name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  build-and-check:
    name: Build & brand check
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm exec astro check

      - name: Build
        run: pnpm exec astro build

      - name: Write .assetsignore (Plan 04 postbuild — REVIEW FIX M2)
        run: node scripts/write-assetsignore.mjs

      - name: Brand-rule grep (FND-10)
        run: bash scripts/check-brand-rules.sh

      - name: Lowercase filename check (FND-11)
        run: bash scripts/check-lowercase-filenames.sh

      - name: No-hydration / no-browser-JS check (FND-01 — REVIEW FIX M1)
        run: bash scripts/check-no-hydration.sh

      # Lighthouse CI (FND-12 — orchestrator decision, replaces deferred Phase 5 step).
      # Runs against `astro preview` to avoid coupling CI to Cloudflare deploy timing.
      # (If the engineer later prefers running against the live *.workers.dev preview
      # URL, swap `astro preview` for the deployment URL via `cloudflare/wrangler-action`
      # output — see lighthouserc.json `url` field.)
      - name: Lighthouse CI (mobile, ≥ 90 on /) — FND-12
        uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: ./lighthouserc.json
          uploadArtifacts: true
          temporaryPublicStorage: true
        env:
          # REVIEW FIX (checker iteration 2 WARNING 5): no explicit `urls:` here.
          # lighthouserc.json declares `staticDistDir: "./dist"`, and the action
          # serves dist/ over a local HTTP server it spawns. The Lighthouse run
          # is driven entirely by `staticDistDir` + the assertions in
          # lighthouserc.json — no `astro preview` background step, no urls list.
          # If a future iteration needs to audit the live *.workers.dev preview
          # URL instead, swap to: drop staticDistDir from lighthouserc.json and
          # set `urls:` here to the deployment URL (e.g., via cloudflare/wrangler-action
          # output). Pick one path; do not ship both.
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

**Companion file — `lighthouserc.json`** at the repo root (REVIEW FIX FND-12). Asserts mobile audit on `/` for the four categories:

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "numberOfRuns": 1,
      "settings": {
        "formFactor": "mobile",
        "screenEmulation": {
          "mobile": true,
          "width": 360,
          "height": 640,
          "deviceScaleFactor": 2,
          "disabled": false
        },
        "throttling": {
          "rttMs": 150,
          "throughputKbps": 1638.4,
          "cpuSlowdownMultiplier": 4
        }
      }
    },
    "assert": {
      "assertions": {
        "categories:performance":   ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices":["error", { "minScore": 0.9 }],
        "categories:seo":           ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```

**Note on Lighthouse server bootstrapping** (REVIEW FIX checker iteration 2 WARNING 5): the canonical bootstrapping strategy is `staticDistDir: "./dist"` in `lighthouserc.json` — `treosh/lighthouse-ci-action@v12` serves `./dist` over a local HTTP server it spawns internally, audits `/` (the index), and reports back. The ci.yml step ABOVE does NOT pass an explicit `urls:` argument, and `lighthouserc.json` does NOT declare a `url:` field — those are the two competing bootstrappers, and shipping both is ambiguous and was failing at runtime. Pick ONE path.

If `staticDistDir` does not work for Astro 6's clean-URL routing in the actual CI run, the FALLBACK is (executor decision, document in SUMMARY):
1. Remove `"staticDistDir": "./dist"` from `lighthouserc.json`
2. Add a previous CI step: `pnpm exec astro preview &` + `npx wait-on http://localhost:4321/`
3. Add back to the workflow step's `with:` block: `urls: http://localhost:4321/`

Do NOT ship both `staticDistDir` AND `urls:` simultaneously — pick one, commit it, document it in the plan SUMMARY.

Critical constraints (PATTERNS.md lines 839-844):
- Job name `Build & brand check` MUST match exactly — this is the string the engineer enters into GitHub branch protection
- Triggers BOTH `pull_request` (pre-merge enforcement) AND `push` to `main` (post-merge sanity check on the just-merged code)
- `ubuntu-latest` — GNU grep with `-P` flag available for Rule 1 PCRE
- `--frozen-lockfile` ensures CI reproduces the locked dep tree from Plan 01
- Steps run in order: checkout → pnpm setup → Node (reads `.nvmrc`) → install → typecheck → build → brand-check → lowercase-check
- The Phase 5 marker comment must be present so the future planner knows where to insert the Lighthouse step

**Step 3 — Write `SETUP.md`** at the repo root. Content (based on RESEARCH.md "Founder-Facing Setup Checklist" lines 1306-1341, expanded with explicit verification steps):

```markdown
# Setup — Studio Bluemli Website

These are the manual steps that cannot live in code. Run them ONCE after the Phase 1 scaffold ships.
None of them require the founder — engineer-only.

## 1. Push the Phase 1 scaffold to GitHub

If the repo isn't on GitHub yet:
1. Create a new private (or public) repo on GitHub. Default branch: `main`.
2. From the local repo root:
   ```
   git remote add origin git@github.com:<user>/<repo>.git
   git push -u origin main
   ```

Otherwise, just push the Phase 1 work to `main`.

## 2. Connect the repo to a Cloudflare Worker

(Required for FND-04: push-to-main production deploy + per-PR preview URLs.)

1. Open the Cloudflare dashboard → **Workers & Pages**.
2. Either click **Create application → Import a repository**, or (if you already created the Worker)
   navigate to **Workers & Pages → studio-bluemli → Settings → Builds → Connect**.
3. Authorize GitHub access and select this repo.
4. Build settings:
   - **Build command:** `pnpm install --frozen-lockfile && pnpm build`
   - **Deploy command (production):** `npx wrangler deploy`
   - **Deploy command (preview):** `npx wrangler versions upload`
   - **Root directory:** `/` (default)
   - **Production branch:** `main`
5. **Toggle "Non-production branch builds: ON"** — this is what enables per-branch preview URLs.
   Without it, only `main` deploys.

Source: https://developers.cloudflare.com/workers/ci-cd/builds/

## 3. Note the preview URL format

After step 2 fires once:

- **Production:** `studio-bluemli.<account-subdomain>.workers.dev`
  (The `<account-subdomain>` is unique to your Cloudflare account; the dashboard tells you.)
- **Per-branch (stable alias):** `<branch-name>-studio-bluemli.<account-subdomain>.workers.dev`
- **Per-commit (immutable):** `<version-prefix>-studio-bluemli.<account-subdomain>.workers.dev`

Phase 1 ships on `*.workers.dev` only. The apex `studiobluemli.com` resolves to this Worker in Phase 5 (FND-03, which is mapped to Phase 5 per the updated REQUIREMENTS.md).

## 4. Enable the GitHub required status check

(Required for FND-10 / FND-11: CI blocks PR merge on brand violations.)

1. Open the GitHub repo → **Settings → Branches**.
2. Click **Add branch protection rule** (or edit the existing rule for `main`).
3. Branch name pattern: `main`.
4. Check **Require status checks to pass before merging**.
5. In the status-checks search box, type **`Build & brand check`** — this is the job name
   from `.github/workflows/ci.yml` and MUST match exactly. Click it to add as required.
6. (Optional but recommended) Check **Require pull request before merging** so changes
   to `main` always go through a PR (and therefore CI).
7. Save.

## 5. Verify the loop end-to-end

1. Create a branch and push a trivial change. Open a PR.
2. **CI:** GitHub Actions should run `Build & brand check`. It must pass (green check).
3. **Cloudflare preview:** Within ~2 minutes, Cloudflare Workers Builds should comment
   the preview URL on the PR. Click it.
4. **Visual smoke test on the preview URL:**
   - The header lockup shows the coral wordmark "Studio Bluemli" and the mark.
   - The page background is cream (`#F5DCC7`), not white.
   - Each route (`/`, `/gallery`, `/popups`, `/about`, `/say-hi`) loads with the design-skill chrome.
   - The hand-display headline on `/` reads "bright, beaded, one of a kind".
   - The favicon shows in the browser tab.
5. **Deliberate violation test:** On the same branch, add `background: white;` to any file in `src/`,
   push the change. CI must fail with the brand-rule failure message. Revert. CI must pass.
6. Merge to `main`. Confirm the production `*.workers.dev` URL updates.

## 6. No secrets in Phase 1

`RESEND_API_KEY`, `TURNSTILE_SECRET`, and the KV namespace ID are Phase 4 — do not pre-create
them. `wrangler secret list` should be empty after Phase 1.

---

## Phase 1 Success Criteria Quick Check

After all steps above:

- [ ] **SC1** (cream/font shell): the preview URL renders all 5 pages with cream bg + Caveat Brush headline + design-skill chrome.
- [ ] **SC2** (push-to-deploy + PR previews): merging to `main` deploys to production; PRs get preview URLs.
- [ ] **SC3** (CI blocks brand violations): the deliberate-violation test in step 5 fails, the revert passes.
- [ ] **SC4** (favicon): visit the preview URL on desktop and add to home-screen on iOS; both show the mark.
- [ ] **SC5** (PROJECT.md corrected): `grep -c "Cloudflare Pages" .planning/PROJECT.md` shows only the explanatory parenthetical(s), not the target-hosting bullets.
- [ ] **FND-12 (Lighthouse, mobile, ≥ 90 on `/`)**: CI's `Lighthouse CI` step is green on the latest run. If it fails, click through to the artifact and inspect which category dropped below 0.9 — most common Phase 1 failure is Accessibility (missing focus-visible) or Performance (font payload above 100KB).
```

Critical content requirements for SETUP.md:
- Lists ALL FIVE steps the engineer must perform (no skips)
- The exact job name `Build & brand check` is quoted at least twice (steps 4 and 5) so it's easy to find
- The Cloudflare build commands are CLI-exact (engineer can copy-paste)
- The "non-production branch builds: ON" toggle is called out (this is the most common miss per RESEARCH.md)
- The deliberate-violation test is the proof FND-10 works
- No founder action is required — this is engineer-only setup
  </action>
  <verify>
    <automated>test -d .github/workflows && test -f .github/workflows/ci.yml && test -f SETUP.md && grep -q "name: Build & brand check" .github/workflows/ci.yml && grep -q "pull_request:" .github/workflows/ci.yml && grep -q "push:" .github/workflows/ci.yml && grep -q "ubuntu-latest" .github/workflows/ci.yml && grep -q "pnpm/action-setup" .github/workflows/ci.yml && grep -q "node-version-file: .nvmrc" .github/workflows/ci.yml && grep -q "pnpm install --frozen-lockfile" .github/workflows/ci.yml && grep -q "astro check" .github/workflows/ci.yml && grep -q "astro build" .github/workflows/ci.yml && grep -q "scripts/check-brand-rules.sh" .github/workflows/ci.yml && grep -q "scripts/check-lowercase-filenames.sh" .github/workflows/ci.yml && grep -q "scripts/check-no-hydration.sh" .github/workflows/ci.yml && grep -q "write-assetsignore.mjs" .github/workflows/ci.yml && grep -qE "lighthouse-ci-action|lhci" .github/workflows/ci.yml && test -f lighthouserc.json && grep -q "minScore" lighthouserc.json && grep -q "studio-bluemli" SETUP.md && grep -q "Build & brand check" SETUP.md && grep -q "Non-production branch builds" SETUP.md && grep -q "workers.dev" SETUP.md && grep -q "background: white" SETUP.md && grep -q "wrangler.*deploy" SETUP.md</automated>
  </verify>
  <acceptance_criteria>
    - File `.github/workflows/ci.yml` exists
    - File `SETUP.md` exists at the repo root
    - CI workflow job name is exactly `Build & brand check`: `grep -q "name: Build & brand check" .github/workflows/ci.yml` exits 0
    - CI triggers on both `pull_request` and `push` to main
    - CI runs on `ubuntu-latest` (needed for GNU grep `-P` PCRE flag)
    - CI uses `pnpm install --frozen-lockfile` (reproduces locked deps from Plan 01)
    - CI runs `astro check` AND `astro build` AND the THREE check shell scripts (brand-rules, lowercase-filenames, no-hydration — REVIEW FIX M1)
    - **NEW (REVIEW FIX M1):** CI invokes `scripts/check-no-hydration.sh` as a step named "No-hydration / no-browser-JS check" — `grep -q "check-no-hydration.sh" .github/workflows/ci.yml` exits 0
    - **NEW (Orchestrator decision FND-12):** CI invokes a Lighthouse step using `treosh/lighthouse-ci-action` (or an `lhci autorun` fallback) — `grep -q "lighthouse-ci-action\|lhci" .github/workflows/ci.yml` exits 0
    - **NEW (Orchestrator decision FND-12):** A `lighthouserc.json` file exists at the repo root with mobile-form-factor settings and minScore 0.9 assertions on performance/accessibility/best-practices/seo — `test -f lighthouserc.json && grep -q '"minScore": 0.9' lighthouserc.json` exits 0
    - CI also invokes the Plan 04 postbuild script: `grep -q "write-assetsignore.mjs" .github/workflows/ci.yml` exits 0 (REVIEW FIX M2)
    - CI references `.nvmrc` via `node-version-file: .nvmrc`
    - CI has an FND-12 reference for Lighthouse: `grep -q "FND-12" .github/workflows/ci.yml` exits 0 (orchestrator decision: Lighthouse moved from Phase 5 to Phase 1; the Phase 5 LCH-05 step extends/replaces this with a full-route audit at production cutover)
    - SETUP.md documents the worker name `studio-bluemli` (matches D-12 / wrangler.jsonc)
    - SETUP.md quotes the CI job name `Build & brand check` (engineer types this into branch protection)
    - SETUP.md calls out "Non-production branch builds" toggle (most-commonly-missed setup step)
    - SETUP.md mentions `*.workers.dev` (D-13: no custom domain in Phase 1)
    - SETUP.md includes the deliberate-violation test (`background: white;` in src/) proving FND-10
    - SETUP.md references the two wrangler deploy commands (`wrangler deploy` for prod, `wrangler versions upload` for preview)
    - No secrets are mentioned as Phase 1 work (Phase 4 owns secrets)
  </acceptance_criteria>
  <done>CI workflow is committed and ready to run on the next push/PR; SETUP.md is the engineer's one-page reference for completing the founder-facing setup.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Engineer-facing checkpoint — complete Cloudflare + GitHub setup and verify Phase 1 SCs</name>
  <files>SETUP.md (the engineer's reference); GitHub Settings → Branches; Cloudflare dashboard → Workers & Pages → studio-bluemli</files>
  <action>This is a checkpoint task — see &lt;what-built&gt;, &lt;how-to-verify&gt;, and &lt;resume-signal&gt; below. The engineer pauses execution here to perform the 5 manual setup steps documented in SETUP.md (Cloudflare git connect, GitHub branch protection, end-to-end loop verification). Resume only after typing the documented resume-signal phrase.</action>
  <verify><automated>echo "manual checkpoint — see how-to-verify"</automated></verify>
  <done>The engineer has reported back via the documented resume-signal phrase confirming all 5 Phase 1 success criteria (SC1-SC5 from ROADMAP) are met on the live `*.workers.dev` preview URL.</done>
  <what-built>
    Plan 05 has shipped:
    - `.github/workflows/ci.yml` runs `astro check` + `astro build` + both brand-check shell scripts on every PR and push to main
    - `scripts/check-brand-rules.sh` enforces 5 of 6 active brand rules (Rule 7 sample-data leak deferred to Phase 2)
    - `scripts/check-lowercase-filenames.sh` enforces FND-11
    - `SETUP.md` walks the engineer through the 5 manual setup steps
    - Plans 01-04 (Wave 1 + Wave 2) shipped the full scaffold, components, favicons, BaseLayout, 5 page routes, and sample data

    What the engineer needs to do MANUALLY (cannot be automated by Claude — needs the engineer's GitHub + Cloudflare credentials):
    1. Push everything to GitHub `main` (if not already)
    2. In Cloudflare dashboard: create the `studio-bluemli` Worker, connect the GitHub repo, set build/deploy commands, toggle non-production branch builds ON
    3. In GitHub Settings → Branches: add branch protection rule for `main`, register `Build & brand check` as required status check
    4. Verify the loop: open a PR, confirm CI runs, click the Cloudflare preview URL, smoke-test the 5 pages visually
    5. Deliberate-violation test: push a `background: white;` line to a temp file in `src/`, confirm CI fails, revert
  </what-built>
  <how-to-verify>
    Step through SETUP.md sections 2, 3, 4, 5 in order. Treat each numbered step as a checkpoint:

    **A. Cloudflare connect (SETUP.md §2):**
    - Worker named `studio-bluemli` exists in the Cloudflare dashboard
    - Git integration shows the repo connected with build command `pnpm install --frozen-lockfile && pnpm build`
    - "Non-production branch builds" toggle is ON
    - First production deploy URL is `studio-bluemli.<account>.workers.dev` and resolves

    **B. GitHub branch protection (SETUP.md §4):**
    - `main` has branch protection
    - `Build & brand check` appears in required status checks
    - "Require pull request before merging" is on (recommended)

    **C. End-to-end loop (SETUP.md §5):**
    - Open a PR on a feature branch
    - Within ~2 min, GitHub shows the `Build & brand check` workflow running and green
    - Within ~2 min, Cloudflare comments the preview URL on the PR
    - Click the preview URL — visit /, /gallery, /popups, /about, /say-hi in turn
    - Confirm:
      - Cream background everywhere (NOT white)
      - Coral "Studio Bluemli" wordmark in header (Bagel Fat One via Fonts API)
      - Caveat Brush hand-display headline on / (`bright, beaded, one of a kind`)
      - Nunito body text everywhere else
      - Header sticky at top with the four nav links (home, gallery, pop-ups, say hi)
      - Footer shows `hi@studiobluemli.com` (not `hello@`)
      - Favicon visible in browser tab
      - No `client:` directives shipped — DevTools Network tab shows ZERO React JS files
      - No console errors

    **D. Deliberate-violation test (SETUP.md §5 step 5):**
    - On the same PR branch, add a file `src/_violation.css` with content `body { background: white; }`
    - Push
    - CI must fail with the message "The site background must be cream (#F5DCC7), never white."
    - Delete the file, push again
    - CI must pass

    **E. iOS favicon test (FND-08, SC4):**
    - Open the preview URL in Safari on an iPhone (or iOS Simulator)
    - Share → "Add to Home Screen"
    - Confirm the home-screen tile shows the Bluemli mark (from `mark-favicon-180.png`)

    **F. Phase 1 SC matrix (ROADMAP.md):**
    - SC1: ✓ if the preview URL renders all 5 pages with the cream/font/chrome shell
    - SC2: ✓ if push-to-main deploys to prod AND PRs get preview URLs
    - SC3: ✓ if the deliberate-violation test failed and the revert passed
    - SC4: ✓ if the favicon renders in browser tab AND iOS add-to-home shows the mark
    - SC5: ✓ if `grep "Cloudflare Pages" .planning/PROJECT.md` shows only explanatory parentheticals (not target-hosting bullets) — already verified in Plan 01
  </how-to-verify>
  <resume-signal>
    Type one of:
    - "approved" — all 5 success criteria met; Phase 1 is done
    - "ci failing: <pasted CI log line>" — CI didn't pass; need to debug brand rules or build
    - "preview broken: <issue>" — preview URL renders but something visual is off
    - "cloudflare connect issue: <message>" — Cloudflare dashboard step blocked
    - "github protection issue" — couldn't register the status check
  </resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| GitHub Actions runner → repo | The workflow runs untrusted (third-party PR) code in the build step. Astro build executes user-controlled .astro/.jsx files. |
| Cloudflare dashboard → repo | The git integration grants Cloudflare read access to the repo (to clone for build) and write access to deploys. |
| GitHub branch protection → workflow | The "required status check" relies on the workflow job name string matching exactly — a renamed job silently breaks the gate. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-05-01 | Tampering | A PR could rename the `Build & brand check` job in `.github/workflows/ci.yml` to bypass branch protection | mitigate | Phase 1's branch protection rule requires PR review (SETUP.md §4 recommends "Require pull request before merging"). A workflow rename is visible in the PR diff. For higher assurance, Phase 1+ could add a CODEOWNERS file requiring engineer review on `.github/`; deferred — not requested. |
| T-05-02 | Information Disclosure | GitHub Actions exposes a build secret in the logs (none should exist in Phase 1) | mitigate | Phase 1 CI doesn't reference any secrets — no `${{ secrets.* }}` in `ci.yml`. SETUP.md §6 explicitly says "No secrets in Phase 1". Phase 4 will add secrets via `wrangler secret put` (NOT GH Actions secrets), keeping them off CI entirely. |
| T-05-03 | Elevation of Privilege | A malicious PR adds a workflow file that runs `wrangler deploy` from PR context, escalating preview → production | accept | Cloudflare Workers Builds (not GH Actions) handles deploy. The GH Actions workflow in Phase 1 only runs `astro check`/`astro build`/grep — no `wrangler` invocation. The Cloudflare dashboard restricts deploy permissions to its own pipeline, not arbitrary GH Actions code. |
| T-05-04 | Repudiation | A force-push to main bypasses CI history | mitigate | SETUP.md §4 recommends "Require pull request before merging" (which disallows direct pushes to main). Force-push protection is not explicitly toggled — recommend adding "Do not allow force pushes" to the branch protection rule as an enhancement. Documented as out-of-scope follow-up. |
| T-05-05 | Denial of Service | A PR triggers infinite CI loops via workflow misuse | accept | Phase 1 CI is bounded by `timeout-minutes: 5` on the single job. No matrix, no fan-out, no cron triggers. Resource cost capped. |
| T-05-06 | Information Disclosure | The Cloudflare dashboard's GitHub OAuth grants broader scopes than needed | accept | Standard Cloudflare Workers Builds integration; widely used. Cloudflare's GitHub App requests read on repo content and write on deployment statuses — minimal necessary. If unacceptable for the founder, a self-hosted Actions-based deploy would replace it, deferred. |
</threat_model>

<verification>
After all three tasks complete:
1. `.github/workflows/ci.yml` exists with job name `Build & brand check`
2. `scripts/check-brand-rules.sh` and `scripts/check-lowercase-filenames.sh` are executable and pass against the current `src/`
3. A deliberate `background: white;` violation makes the brand check exit non-zero
4. A deliberate uppercase filename in `src/pages/` makes the lowercase check exit non-zero
5. `SETUP.md` documents the 5 manual setup steps
6. After the engineer completes SETUP.md sections 2-5, Phase 1 SC1-SC5 are all verifiable on the preview URL
</verification>

<success_criteria>
- FND-10 enforced: 5 brand grep rules fail the CI build on violation
- FND-11 enforced: lowercase filename check fails the CI build on any uppercase letter in `src/pages/`
- FND-04 enabled: every push to main produces a Cloudflare production deploy; every PR produces a preview URL (after the engineer completes SETUP.md §2)
- FND-12 enforced in CI (orchestrator decision): Lighthouse mobile audit asserts Performance/Accessibility/Best Practices/SEO ≥ 90 on the landing route `/` every CI run
- REVIEW FIX M1: `scripts/check-no-hydration.sh` enforces "no `client:` directive + no large browser JS bundle" as a permanent CI gate
- (FND-03 is no longer claimed by this plan — orchestrator removed it from Phase 1 and re-mapped to Phase 5)
- SETUP.md gives the engineer everything needed to complete the dashboard-only steps
- Phase 1 Success Criteria 1-5 are all achievable after the engineer walks SETUP.md
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundations-brand-system/01-05-SUMMARY.md` with:
- Confirmation of `.github/workflows/ci.yml` job name `Build & brand check`
- The exact deliberate-violation test result (CI fail message + revert pass)
- The Cloudflare preview URL the founder/engineer should bookmark (`studio-bluemli.<account>.workers.dev` once setup is done)
- A list of any deferred items the engineer should note for Phase 2+ (e.g., "Force-push protection not enabled — recommend adding")
- Phase 1 SC status: which were verified automatically, which required the engineer to walk SETUP.md
- Lighthouse CI tooling choice (REVIEW FIX iteration 2 WARNING 5): canonical path is `staticDistDir: "./dist"` in lighthouserc.json + no explicit `urls:` in ci.yml. If the executor had to fall back to the `astro preview` background-server path because `staticDistDir` failed for Astro 6 clean-URL routing, document the fallback decision and the first Lighthouse score recorded for `/`.
- Confirmation that `scripts/check-no-hydration.sh` passes against the post-build `dist/` (REVIEW FIX M1)
- REVIEW FIX status: FND-03 removed from this plan's `requirements`; FND-12 added; M1 (no-hydration gate) wired into CI
</output>
