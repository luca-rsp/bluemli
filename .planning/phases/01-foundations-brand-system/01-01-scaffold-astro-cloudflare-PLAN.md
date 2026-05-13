---
plan_id: 01-01
phase: 1
phase_slug: 01-foundations-brand-system
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: true
requirements: [FND-01, FND-02, FND-07]
files_modified:
  - package.json
  - pnpm-lock.yaml
  - .nvmrc
  - tsconfig.json
  - .gitignore
  - .prettierrc.mjs
  - astro.config.mjs
  - wrangler.jsonc
  - src/env.d.ts
  - .planning/PROJECT.md
tags: [astro, cloudflare-workers, scaffold, fonts-api]
must_haves:
  truths:
    - "pnpm install completes successfully and produces a lockfile committed to git"
    - "astro.config.mjs declares passthroughImageService, react integration, and the four Fonts API entries with display:'swap'"
    - "wrangler.jsonc declares assets.directory='./dist', assets.binding='ASSETS', assets.run_worker_first=['/api/*'], name='studio-bluemli'"
    - "astro.config.mjs `output:` mode is set so that `pnpm exec astro build` (run after Plan 04) emits `dist/_worker.js/index.js` — verified by build, with conditional switch from 'static' to 'server' if entrypoint missing"
    - ".planning/PROJECT.md no longer names 'Cloudflare Pages' as the target hosting in lines 30, 68, and Key Decisions cell (D-21)"
    - "pnpm exec astro check exits 0 (typecheck passes on the scaffold)"
    - "D-12: Cloudflare Worker name is 'studio-bluemli'; preview URL is studio-bluemli.<account>.workers.dev"
    - "D-13: No custom domain in Phase 1 — DNS cutover deferred to Phase 5 SC1; deploys live only on *.workers.dev"
    - "D-14: Caveat Brush (display) + Nunito (body) self-hosted via Astro Fonts API, not loaded from fonts.googleapis.com at runtime"
    - "D-15: font-display swap is set on every @font-face entry in astro.config.mjs"
    - "D-16: Wordmark is Bagel Fat One via Astro Fonts API; Caveat is loaded as --font-hand-loaded (D-16 — required because About.jsx references --font-hand for the signature close; REVIEW FIX M5)"
    - "D-17: Real-hand-font swap path is a one-file change in Astro Fonts config + drop file in public/fonts/; SWAP PATH comment exists in astro.config.mjs"
  artifacts:
    - path: "package.json"
      provides: "deps + scripts manifest"
      contains: "@astrojs/cloudflare"
    - path: "astro.config.mjs"
      provides: "build config with fonts and image service"
      contains: "passthroughImageService"
    - path: "wrangler.jsonc"
      provides: "Cloudflare Workers + Static Assets binding"
      contains: "run_worker_first"
    - path: ".nvmrc"
      provides: "Node version pin"
      contains: "22.12"
  key_links:
    - from: "astro.config.mjs"
      to: "wrangler.jsonc"
      via: "shared `dist/` build output (assets.directory: './dist')"
      pattern: "assets.*directory.*dist"
    - from: "astro.config.mjs"
      to: "BaseLayout.astro (Plan 04)"
      via: "Fonts API cssVariable suffix '-loaded' which BaseLayout consumes"
      pattern: "cssVariable.*loaded"
---

<objective>
Scaffold a fresh Astro 6.2 project pinned to the Phase 1 stack — `@astrojs/cloudflare@13.5`, `@astrojs/react@5.0.4`, React 19 — wire the `wrangler.jsonc` Cloudflare Workers + Static Assets binding, configure the Astro Fonts API for Bagel Fat One + Caveat Brush + Nunito with `display: 'swap'`, and correct `.planning/PROJECT.md`'s stale "Cloudflare Pages" wording per D-21.

Purpose: Establish the build/runtime/typecheck foundation that every subsequent Phase 1 plan depends on. The wrangler+astro config pair must be exactly right — Wave 1 sibling plans (02, 03) commit files; Wave 2 (Plan 04) builds against this config; Wave 3 (Plan 05) deploys it.

Output: A buildable, typecheck-passing Astro project at the repo root with locked dependency versions, a Worker config that reserves `/api/*` for Phase 4, and a corrected PROJECT.md.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundations-brand-system/01-CONTEXT.md
@.planning/phases/01-foundations-brand-system/01-RESEARCH.md
@.planning/phases/01-foundations-brand-system/01-PATTERNS.md
@.planning/phases/01-foundations-brand-system/01-UI-SPEC.md
@CLAUDE.md

<interfaces>
<!-- Pinned versions from RESEARCH.md "Standard Stack" table (lines 116-128) and CLAUDE.md technology stack table. Use these exactly — do NOT upgrade to "latest". -->

Required dependency versions:
- astro: ^6.2.0
- @astrojs/cloudflare: ^13.5.0
- @astrojs/react: ^5.0.4
- react: ^19.0.0
- react-dom: ^19.0.0
- typescript: ^5.6.0
- Node.js engine: >=22.12.0
- pnpm: ^10.0.0

Required dev dependency versions:
- @astrojs/check: ^0.9.0 (required by `astro check` — without this dev dep, `pnpm exec astro check` exits non-zero with "Cannot find @astrojs/check")
- @types/react: ^19.0.0
- @types/react-dom: ^19.0.0
- wrangler: ^4.0.0
- prettier: ^3.3.0
- prettier-plugin-astro: ^0.14.1
- icon-gen: ^5.0.0 (used by Plan 03, declared here so the lockfile resolves)

Required Astro config imports (from RESEARCH.md "astro.config.mjs (verified shape)" lines 886-942):
```js
import { defineConfig, passthroughImageService, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
```

Required wrangler.jsonc shape (from RESEARCH.md lines 852-870, exactly):
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
  "observability": {
    "enabled": true
  }
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold Astro project + install pinned dependencies</name>
  <files>package.json, pnpm-lock.yaml, .nvmrc, tsconfig.json, .gitignore, .prettierrc.mjs, src/env.d.ts</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-RESEARCH.md (RESEARCH.md §"Standard Stack" lines 116-165 and §"`package.json` (verified shape)" lines 1018-1054 — copy package.json contents and engines field verbatim)
    - /Users/lucacanonica/Documents/projects/bluemli/CLAUDE.md (Recommended Stack table — versions are canonical; cross-check against RESEARCH.md)
    - /Users/lucacanonica/Documents/projects/bluemli/.gitignore (if it exists already — confirm before writing; the repo currently has none in root per PATTERNS.md "No Analog Found" line 947)
  </read_first>
  <action>
**Step 1 — Verify environment.** Run `node --version` (must be >=22.12.0) and `pnpm --version` (must be >=10). If either is missing, halt and tell the user — do NOT attempt to install Node/pnpm in this task.

**Step 2 — Write `.nvmrc`** at repo root with exactly one line:
```
22.12
```

**Step 3 — Write `package.json`** at repo root using the RESEARCH.md §"`package.json` (verified shape)" verbatim (lines 1018-1054):
```json
{
  "name": "studio-bluemli",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "deploy": "astro build && wrangler deploy",
    "deploy:preview": "astro build && wrangler versions upload",
    "sync:design-skill": "node scripts/sync-design-skill.mjs",
    "favicons": "node scripts/generate-favicons.mjs",
    "ci:brand-check": "bash scripts/check-brand-rules.sh",
    "ci:lowercase-check": "bash scripts/check-lowercase-filenames.sh"
  },
  "dependencies": {
    "astro": "^6.2.0",
    "@astrojs/cloudflare": "^13.5.0",
    "@astrojs/react": "^5.0.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "icon-gen": "^5.0.0",
    "prettier": "^3.3.0",
    "prettier-plugin-astro": "^0.14.1",
    "typescript": "^5.6.0",
    "wrangler": "^4.0.0"
  }
}
```

**Step 4 — Write `tsconfig.json`** using Astro 6 strict preset (per PATTERNS.md line 947):
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

**Step 5 — Write `.gitignore`** (PATTERNS.md line 948 specifies Astro 6 default + `.wrangler/`, `.dev.vars`, `dist/`):
```
# Astro
.astro/
dist/

# Node
node_modules/

# Cloudflare Wrangler
.wrangler/
.dev.vars
.env
.env.local

# OS
.DS_Store
Thumbs.db

# Editors
.vscode/
.idea/

# Misc
*.log
```

**Step 6 — Write `.prettierrc.mjs`** with the Astro override (per PATTERNS.md line 949, sourced from `prettier-plugin-astro` README):
```js
export default {
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: { parser: 'astro' },
    },
  ],
};
```

**Step 7 — Write `src/env.d.ts`** (Astro 6 default, per PATTERNS.md line 950):
```ts
/// <reference types="astro/client" />
```

**Step 8 — Install dependencies.** Run:
```bash
pnpm install
```
This MUST resolve and produce `pnpm-lock.yaml`. Commit the lockfile. If install fails with peer dep warnings, examine and resolve before proceeding — do not pass `--shamefully-hoist` or `--strict-peer-dependencies=false` to mask issues.

**Step 9 — Verify versions resolved correctly.** Run:
```bash
pnpm list astro @astrojs/cloudflare @astrojs/react react react-dom 2>&1 | grep -E "astro|react"
```
Confirm astro is 6.2.x, @astrojs/cloudflare is 13.5.x, @astrojs/react is 5.0.x, react and react-dom are 19.x.
  </action>
  <verify>
    <automated>node --version | grep -E "^v(22\.1[2-9]|22\.[2-9][0-9]|2[3-9])" && pnpm --version | grep -E "^(10|[1-9][0-9])" && test -f package.json && test -f pnpm-lock.yaml && test -f .nvmrc && test -f tsconfig.json && test -f .gitignore && test -f .prettierrc.mjs && test -f src/env.d.ts && grep -q '"astro": "\^6.2.0"' package.json && grep -q '"@astrojs/cloudflare": "\^13.5.0"' package.json && grep -q '"@astrojs/react": "\^5.0.4"' package.json && grep -q '"react": "\^19.0.0"' package.json && grep -q '"@astrojs/check"' package.json && grep -q '"node": ">=22.12.0"' package.json && grep -q "22.12" .nvmrc && grep -q "astro/tsconfigs/strict" tsconfig.json && grep -q ".wrangler/" .gitignore && grep -q "prettier-plugin-astro" .prettierrc.mjs && grep -q "astro/client" src/env.d.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `package.json` exists at repo root
    - File `pnpm-lock.yaml` exists at repo root (lockfile committed)
    - File `.nvmrc` exists and contains literal text `22.12`
    - File `tsconfig.json` exists and contains the string `astro/tsconfigs/strict`
    - File `.gitignore` exists and contains the strings `.wrangler/`, `.dev.vars`, `dist/`, `node_modules/`
    - File `.prettierrc.mjs` exists and contains the strings `prettier-plugin-astro` and `parser: 'astro'`
    - File `src/env.d.ts` exists and contains the string `astro/client`
    - `grep -q '"astro": "\^6.2.0"' package.json` exits 0
    - `grep -q '"@astrojs/cloudflare": "\^13.5.0"' package.json` exits 0
    - `grep -q '"@astrojs/react": "\^5.0.4"' package.json` exits 0
    - `grep -q '"react": "\^19.0.0"' package.json` exits 0
    - `grep -q '"react-dom": "\^19.0.0"' package.json` exits 0
    - `grep -q '"icon-gen": "\^5.0.0"' package.json` exits 0
    - `grep -q '"@astrojs/check"' package.json` exits 0 (REVIEW FIX H1: required by `astro check`; without this dep typecheck exits non-zero)
    - `grep -q '"wrangler": "\^4.0.0"' package.json` exits 0
    - `grep -q '"node": ">=22.12.0"' package.json` exits 0
    - `pnpm list astro 2>&1 | grep -E '6\.[2-9]\.'` exits 0 (resolves to 6.2.x or later 6.x)
    - Node version satisfies `>=22.12.0` (the `node --version` regex must match)
  </acceptance_criteria>
  <done>Astro project skeleton is installed with pinned dependency versions, lockfile committed, and a future `pnpm install --frozen-lockfile` (the CI invocation) will reproduce this environment deterministically.</done>
</task>

<task type="auto">
  <name>Task 2: Write astro.config.mjs and wrangler.jsonc with verified shapes</name>
  <files>astro.config.mjs, wrangler.jsonc</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-RESEARCH.md (§"`wrangler.jsonc` (verified shape)" lines 852-879 and §"`astro.config.mjs` (verified shape)" lines 886-948 — copy verbatim; both are pinned against current Cloudflare and Astro 6 docs. ALSO RESEARCH.md §"Confidence Notes" A8 lines 1370 — `output: 'static'` works with `@astrojs/cloudflare@13` per Astro docs, confidence LOW; this plan adds a build-time verification gate.)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-CONTEXT.md (D-12 worker name `studio-bluemli`; D-14..D-17 font choices and swap path comment; D-15 `display: 'swap'` mandatory)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-PATTERNS.md (lines 104-138 for astro.config.mjs critical constraints; lines 142-174 for wrangler.jsonc critical constraints)
    - /Users/lucacanonica/Documents/projects/bluemli/package.json (just written in Task 1 — confirm versions match imports)
  </read_first>
  <action>
**Step 1 — Write `astro.config.mjs`** at repo root. Use this exact content (copied from RESEARCH.md lines 886-942 — verified against Astro 6.2 + Cloudflare adapter 13.5 docs, May 2026):

```js
// astro.config.mjs
import { defineConfig, passthroughImageService, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://studiobluemli.com',
  // output: 'static' per RESEARCH.md A8 — every Phase 1 page prerenders.
  // The @astrojs/cloudflare@13 adapter STILL emits a Worker entrypoint
  // (dist/_worker.js/index.js) so wrangler.jsonc's `main` and `run_worker_first`
  // remain operational. If post-build verification (Step 3 below) shows the
  // entrypoint is missing, switch to `output: 'server'` per Cloudflare adapter
  // guidance — see RESEARCH.md Open Question / A8 fallback.
  output: 'static',

  adapter: cloudflare({}),

  integrations: [react()],

  image: {
    // Sharp doesn't run in workerd (Pitfall #9). Use passthrough — no transforms
    // but still get layout-shift prevention and forced alt enforcement.
    service: passthroughImageService(),
  },

  // Astro 6 stable Fonts API — top-level `fonts`, NOT under experimental.
  // `display: 'swap'` is required on every face (FND-07, Pitfall #10, D-15).
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Bagel Fat One',
      cssVariable: '--font-wordmark-loaded',
      weights: [400],
      display: 'swap',
    },
    {
      provider: fontProviders.google(),
      name: 'Caveat Brush',
      cssVariable: '--font-display-loaded',
      weights: [400],
      display: 'swap',
      // SWAP PATH (D-17): when the founder provides a real hand-display WOFF2,
      // replace this entry with `provider: fontProviders.local()` pointing at
      // public/fonts/<file>.woff2. This is the only file that needs to change.
    },
    {
      provider: fontProviders.google(),
      name: 'Nunito',
      cssVariable: '--font-body-loaded',
      weights: [400, 700],
      display: 'swap',
    },
    // --font-hand (Caveat) — REQUIRED per D-16 (the lock is binary: load it or remove all
    // --font-hand references). About.jsx references --font-hand for the signature close, so
    // we load it here. Plan 04's BaseLayout.astro consumes this via <Font cssVariable="--font-hand-loaded" preload />.
    // REVIEW FIX M5 (Codex review): no "fallback acceptable" middle path.
    {
      provider: fontProviders.google(),
      name: 'Caveat',
      cssVariable: '--font-hand-loaded',
      weights: [400],
      display: 'swap',
    },
  ],
});
```

Critical constraints:
- `fontProviders` import path: `astro/config` (NOT `astro:fonts`) — Pitfall #8
- `cssVariable` suffix `-loaded` is intentional (does not collide with `colors_and_type.css` cascade vars — see PATTERNS.md line 136)
- Top-level `fonts: [...]` field, NOT inside `experimental: {}` (stable in Astro 6.0)
- SWAP PATH comment for Caveat Brush is mandatory per D-17
- `output: 'static'` per D-01/RESEARCH.md A8 — Phase 1 has no dynamic routes. **BUT** the @astrojs/cloudflare@13 adapter must still emit `dist/_worker.js/index.js` so that wrangler's `main` and `run_worker_first` work. Step 3 below verifies this; if missing, switch to `output: 'server'` and rebuild (the adapter handles per-page prerendering automatically when no `getStaticPaths`/dynamic logic is present).

**Step 2 — Write `wrangler.jsonc`** at repo root. Use this exact content (copied from RESEARCH.md lines 852-870 verbatim):

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

  "observability": {
    "enabled": true
  }
}
```

Critical constraints:
- `.jsonc` extension (NOT `.toml`) — current Cloudflare standard, supports comments
- `name: "studio-bluemli"` is locked by D-12 — becomes `studio-bluemli.<account>.workers.dev`
- `main: "@astrojs/cloudflare/entrypoints/server"` — unified entrypoint; do NOT use `./dist/_worker.js/index.js` (legacy pattern, Pitfall #7)
- `compatibility_date: "2026-05-12"` — today; do not back-date below this
- `assets.run_worker_first: ["/api/*"]` — ARRAY form (not boolean); reserves the namespace for Phase 4. Phase 1 ships no Worker handler — `/api/*` requests will 404 from Cloudflare's default, which is acceptable for Phase 1 (per RESEARCH.md "Open Question 4" — researcher noted optional 501 stub but said bare 404 is fine).
- DO NOT include `pages_build_output_dir` (legacy Pages key — Pitfall #7)

**Step 3 — Verify config parses, typechecks, AND that a build emits the Worker entrypoint.**

First, type-check:
```bash
pnpm exec astro check
```
This must exit 0. If it fails with a "Cannot find module 'astro:assets'" or similar error, examine the error — it usually means an import path is wrong in this config. Fix and re-run.

**Output-mode verification (NEW — checker WARNING #7 mitigation).** Run a build to confirm the adapter emits a Worker entrypoint. Note: at this stage Plans 02 and 04 have not run, so `astro build` may fail with "no pages" — that's acceptable AS LONG AS the failure is "no pages" and not an adapter error. If the build succeeds (e.g., a minimal pages dir already exists), check for the entrypoint file:

```bash
pnpm exec astro build 2>&1 | tee /tmp/astro-build-task2.log
BUILD_RC=$?
echo "Build return code: $BUILD_RC"
# Acceptable failures at this stage: "no pages directory" or "No pages found".
# Anything else (adapter error, config crash) is a real failure.
if [ $BUILD_RC -eq 0 ] || grep -qE "no pages|No pages found|page(s)? directory" /tmp/astro-build-task2.log; then
  echo "Build status acceptable for Task 2 (full build verified in Plan 04 Task 3)."
else
  echo "FAIL: astro build crashed for a non-'no pages' reason. Inspect /tmp/astro-build-task2.log."
  exit 1
fi

# IF build succeeded, verify the Worker entrypoint exists.
if [ $BUILD_RC -eq 0 ]; then
  if [ -f dist/_worker.js/index.js ] || [ -f dist/_worker.js ]; then
    echo "PASS: Worker entrypoint emitted at dist/_worker.js (output:'static' compatible with @astrojs/cloudflare@13)."
  else
    echo "FAIL: dist/ was created but no Worker entrypoint found."
    echo "ACTION REQUIRED: Edit astro.config.mjs and change output: 'static' → output: 'server'."
    echo "Astro's adapter will still prerender static pages; output: 'server' just guarantees the Worker entrypoint."
    echo "After the edit, re-run this Step 3."
    exit 1
  fi
fi
```

**If the build succeeded but the entrypoint is missing,** make the one-line change to `astro.config.mjs`:
```diff
- output: 'static',
+ output: 'server',  // Switched from 'static' — adapter requires this to emit the Worker entrypoint.
```
Then rerun `pnpm exec astro build` and confirm `dist/_worker.js/index.js` exists. Document the decision in the Plan 01 SUMMARY ("Output mode: <static|server> — chosen because <build verification result>").

**If the build failed with "no pages" / "No pages found",** that's acceptable at this stage — the full verification runs in Plan 04 Task 3 when pages exist. The acceptance criterion below only requires the entrypoint check WHEN the build succeeds.
  </action>
  <verify>
    <automated>test -f astro.config.mjs && test -f wrangler.jsonc && grep -q "passthroughImageService" astro.config.mjs && grep -q "fontProviders.google" astro.config.mjs && grep -q "'Bagel Fat One'" astro.config.mjs && grep -q "'Caveat Brush'" astro.config.mjs && grep -q "'Nunito'" astro.config.mjs && grep -c "display: 'swap'" astro.config.mjs | grep -E "^[4-9]$|^[1-9][0-9]+$" && grep -q "SWAP PATH" astro.config.mjs && grep -qE "output: '(static|server)'" astro.config.mjs && grep -q '"name": "studio-bluemli"' wrangler.jsonc && grep -q '"main": "@astrojs/cloudflare/entrypoints/server"' wrangler.jsonc && grep -q '"run_worker_first": \["/api/\*"\]' wrangler.jsonc && grep -q '"binding": "ASSETS"' wrangler.jsonc && grep -q '"directory": "./dist"' wrangler.jsonc && ! grep -q "pages_build_output_dir" wrangler.jsonc && pnpm exec astro check</automated>
  </verify>
  <acceptance_criteria>
    - File `astro.config.mjs` exists at repo root
    - File `wrangler.jsonc` exists at repo root (NOT `wrangler.toml`)
    - `grep -q "passthroughImageService" astro.config.mjs` exits 0 (Pitfall #9 mitigation present)
    - `grep -q "fontProviders.google" astro.config.mjs` exits 0
    - `grep -q "'Bagel Fat One'" astro.config.mjs` exits 0 (wordmark — D-16)
    - `grep -q "'Caveat Brush'" astro.config.mjs` exits 0 (display — D-14)
    - `grep -q "'Nunito'" astro.config.mjs` exits 0 (body — D-14)
    - `grep -c "display: 'swap'" astro.config.mjs` returns ≥ 4 (one per active font: Bagel Fat One + Caveat Brush + Nunito + Caveat — D-15; Caveat added per REVIEW FIX M5)
    - `grep -q "'Caveat'" astro.config.mjs` exits 0 (Caveat loaded as --font-hand-loaded per D-16 / REVIEW FIX M5)
    - `grep -q "\-\-font-hand-loaded" astro.config.mjs` exits 0 (the cssVariable that BaseLayout will preload)
    - `grep -q "SWAP PATH" astro.config.mjs` exits 0 (D-17 swap-path comment present)
    - `grep -qE "output: '(static|server)'" astro.config.mjs` exits 0 (default is 'static' per RESEARCH.md A8; allowed to be 'server' if Step 3 build verification mandated the switch — the plan's SUMMARY MUST record which mode was chosen and WHY)
    - `grep -q '"name": "studio-bluemli"' wrangler.jsonc` exits 0 (D-12)
    - `grep -q '"main": "@astrojs/cloudflare/entrypoints/server"' wrangler.jsonc` exits 0
    - `grep -q '"run_worker_first": \["/api/\*"\]' wrangler.jsonc` exits 0 (FND-02; reserved for Phase 4)
    - `grep -q '"binding": "ASSETS"' wrangler.jsonc` exits 0
    - `grep -q '"directory": "./dist"' wrangler.jsonc` exits 0
    - `grep -q '"compatibility_date"' wrangler.jsonc` exits 0
    - `grep -q "nodejs_compat" wrangler.jsonc` exits 0
    - `! grep -q "pages_build_output_dir" wrangler.jsonc` exits 0 (Pitfall #7 — no legacy Pages key)
    - `pnpm exec astro check` exits 0 (typecheck passes on the config files; missing pages OK at this stage)
    - **NEW (checker WARNING #7):** Step 3 output-mode verification recorded in SUMMARY: which `output:` mode was chosen and the reason (either "static: build succeeded and dist/_worker.js/index.js emitted" OR "server: switched after dist/_worker.js missing" OR "static: deferred verification to Plan 04 Task 3 — build correctly failed with 'no pages' at this stage")
  </acceptance_criteria>
  <done>`astro.config.mjs` and `wrangler.jsonc` are committed with the verified shapes; `pnpm exec astro check` passes; the Fonts API config is ready for BaseLayout (Plan 04) to consume via `<Font cssVariable="--font-*-loaded" preload />`. The `output:` mode is verified to produce a Worker entrypoint compatible with `run_worker_first` — either confirmed at Task 2 build time, or formally deferred to Plan 04 Task 3 with a re-verification gate there.</done>
</task>

<task type="auto">
  <name>Task 3: Correct PROJECT.md "Cloudflare Pages" wording per D-21</name>
  <files>.planning/PROJECT.md</files>
  <read_first>
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/PROJECT.md (READ THIS FIRST — confirm current state of lines 30, 65, 68, 77 before editing; D-21 requires three specific edits and ONE explanatory parenthetical to STAY INTACT)
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-CONTEXT.md (D-21: "Existing references that describe *why Pages was dropped* (the explanatory parenthetical) stay intact.")
    - /Users/lucacanonica/Documents/projects/bluemli/.planning/phases/01-foundations-brand-system/01-PATTERNS.md (lines 848-859 — the three verified edit locations)
  </read_first>
  <action>
**Step 1 — Locate the three edit targets.** Run:
```bash
grep -n "Cloudflare Pages\|Cloudflare Workers" .planning/PROJECT.md
```
Confirm three Pages-as-target-hosting mentions exist:
- Line ~30 in "Active Requirements": `Site builds as static assets and deploys to Cloudflare Pages on every push to main`
- Line ~68 in "Constraints → Budget": `Cloudflare Pages free`
- Line ~77 in "Key Decisions" cell (the Astro 6.2 decision row, may include the Pages adapter swap explanation)

And confirm one mention MUST STAY:
- Line ~65 (or nearby): "Initial plan was Cloudflare Pages; corrected because `@astrojs/cloudflare@13` — required by Astro 6 — dropped Pages support, and Cloudflare froze Pages investment in favor of Workers." — this is the explanatory parenthetical that D-21 says to preserve.

**Step 2 — Apply the three edits using Edit tool (NOT sed/awk).**

Edit 1 (the Active Requirements bullet for hosting):
- Find: `- [ ] Site builds as static assets and deploys to Cloudflare Pages on every push to `main``
- Replace with: `- [ ] Site builds as static assets and deploys to Cloudflare Workers with Static Assets on every push to `main``

Edit 2 (the Budget bullet):
- Find: `Cloudflare Pages free, Umami Cloud free`
- Replace with: `Cloudflare Workers free, Umami Cloud free`

Edit 3 (the Key Decisions cell — check the exact line first; the cell heading already says "Workers" but the body may still reference the Pages swap):
- After reading the file, find the Key Decisions cell that says `Astro 6.2 on Cloudflare Workers + Static Assets` and check whether the cell body still refers to Pages as the target. If the body's parenthetical (e.g., "Pages was originally chosen but `@astrojs/cloudflare@13` (Astro 6) dropped Pages support — Workers with Static Assets is the active CF target.") is the explanatory rationale, LEAVE IT INTACT (per D-21). If there is a separate bullet/cell still naming Pages as the target hosting, rewrite it to Workers.

**Specifically: per D-21 and PATTERNS.md line 858, "Existing references that describe *why Pages was dropped* (the explanatory parenthetical) stay intact."** Use judgment: if a phrase explains the migration history ("was originally...", "dropped Pages support", "Initial plan was..."), keep it. If a phrase names Pages as the current/active target hosting, rewrite to Workers with Static Assets.

**Step 3 — Verify the edits.** Run:
```bash
grep -n "Cloudflare Pages" .planning/PROJECT.md
```
The remaining matches MUST only be the explanatory parenthetical(s) describing the Pages→Workers migration history. The bullets/cells naming Pages as the deploy target must be gone.
  </action>
  <verify>
    <automated>grep -q "Cloudflare Workers with Static Assets" .planning/PROJECT.md && ! grep -q "deploys to Cloudflare Pages" .planning/PROJECT.md && ! grep -q "Cloudflare Pages free" .planning/PROJECT.md && grep -q "@astrojs/cloudflare@13" .planning/PROJECT.md</automated>
  </verify>
  <acceptance_criteria>
    - `grep -q "Cloudflare Workers with Static Assets" .planning/PROJECT.md` exits 0 (the corrected wording is present)
    - `grep -q "deploys to Cloudflare Pages" .planning/PROJECT.md` exits 1 (the "deploys to Pages" bullet is gone)
    - `grep -q "Cloudflare Pages free" .planning/PROJECT.md` exits 1 (the Budget bullet is corrected)
    - `grep -q "@astrojs/cloudflare@13" .planning/PROJECT.md` exits 0 (the explanatory parenthetical about why Pages was dropped is INTACT — verifies we did not delete the migration history)
    - The file `.planning/PROJECT.md` still contains at least one mention of "Cloudflare Workers" (the new target hosting wording)
  </acceptance_criteria>
  <done>D-21 is fully satisfied — PROJECT.md names Cloudflare Workers with Static Assets as the target hosting in all three locations, while preserving the explanatory parenthetical that documents the Pages→Workers migration. ROADMAP Phase 1 SC5 is unblocked.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| dependency supply chain | npm registry → pnpm install pulls @astrojs/cloudflare, @astrojs/react, react, icon-gen, wrangler, prettier-plugin-astro. Untrusted package authors cross this boundary. |
| Cloudflare runtime config (wrangler.jsonc) | reserves `/api/*` namespace at the Worker edge. Misconfiguration could expose unintended routes or fail to route the future Phase 4 /api/contact endpoint. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-01-01 | Tampering | npm supply chain (compromised package version) | mitigate | Pin exact major.minor versions in package.json (`^6.2.0`, `^13.5.0`, etc.); commit `pnpm-lock.yaml`; CI uses `pnpm install --frozen-lockfile` (Plan 05) to prevent silent dep drift. |
| T-01-02 | Information Disclosure | secrets accidentally added to package.json or wrangler.jsonc | mitigate | `.gitignore` (Task 1) explicitly excludes `.env`, `.dev.vars`, `.wrangler/`. Phase 1 ships NO secrets (Phase 4 introduces them via `wrangler secret put`). Reviewer/CI must reject any commit adding `process.env.*_KEY` patterns to tracked files — this is enforced informally in Phase 1 and codified in Phase 4. |
| T-01-03 | Elevation of Privilege | `assets.run_worker_first: ["/api/*"]` reserves a route that has no auth/rate-limit boundary yet | accept | Phase 1 ships no Worker handler, so /api/* returns Cloudflare's default 404. No surface to attack. Phase 4 plan MUST add Turnstile + KV rate limit before the handler ships; documented as the explicit prerequisite for any /api/* code. |
| T-01-04 | Denial of Service | wrangler.jsonc misconfiguration (wrong `assets.directory`) could send all traffic to a non-existent handler | mitigate | `assets.directory: "./dist"` matches Astro's build output exactly (verified in RESEARCH.md against current docs). `pnpm exec astro check` (CI) catches config syntax errors; first preview-deploy click-through catches routing errors before merge to main. |
</threat_model>

<verification>
After all three tasks complete:
1. `pnpm exec astro check` exits 0 (typecheck passes — the config is syntactically valid even though no pages exist yet)
2. `cat package.json | grep -E '"astro": "\^6\.2'` returns a match
3. `cat wrangler.jsonc | grep -E '"run_worker_first": \["/api/\*"\]'` returns a match
4. `grep -c "Cloudflare Pages" .planning/PROJECT.md` returns a number ≤ 2 (only the explanatory parentheticals remain; the three target-hosting mentions are gone)
5. `node --version` reports `>=v22.12.0`
6. The Plan 01 SUMMARY records the chosen `output:` mode and the build-time verification outcome (checker WARNING #7)
</verification>

<success_criteria>
- Astro 6.2 + @astrojs/cloudflare@13.5 + @astrojs/react@5.0.4 + React 19 installed and locked
- wrangler.jsonc reserves `/api/*` for Phase 4 via `run_worker_first` array
- astro.config.mjs declares Bagel Fat One + Caveat Brush + Nunito via Fonts API with `display: 'swap'` and a SWAP PATH comment for D-17
- passthroughImageService configured (Pitfall #9 mitigation present)
- `output:` mode (default 'static' per RESEARCH.md A8) verified to emit `dist/_worker.js/index.js` so wrangler's `main` + `run_worker_first` work; if the verification fails, the mode is switched to 'server' and re-verified (checker WARNING #7)
- PROJECT.md no longer names Pages as the target hosting (D-21 / ROADMAP SC5 satisfied)
- `pnpm install --frozen-lockfile` would reproduce this environment in CI deterministically
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundations-brand-system/01-01-SUMMARY.md` with:
- The exact pnpm-resolved versions of astro, @astrojs/cloudflare, @astrojs/react, react, wrangler (from `pnpm list`)
- The verified `wrangler.jsonc` `name` value (`studio-bluemli`) — Plan 05 needs this for the founder-facing Cloudflare connect step
- The four Fonts API `cssVariable` values (`--font-wordmark-loaded`, `--font-display-loaded`, `--font-body-loaded`, `--font-hand-loaded`) — Plan 04 needs these for BaseLayout `<Font cssVariable="..." preload />` tags. REVIEW FIX M5: `--font-hand-loaded` is now an active font load (was commented-out)
- **NEW (checker WARNING #7):** The chosen `output:` mode and the build-verification outcome. One of:
  - "output: 'static' — Task 2 build succeeded; `dist/_worker.js/index.js` emitted by @astrojs/cloudflare@13."
  - "output: 'server' — switched from 'static' after Task 2 build did not emit Worker entrypoint."
  - "output: 'static' — Task 2 build correctly failed with 'no pages' before Plans 02/04 ran; entrypoint verification deferred to Plan 04 Task 3."
- Confirmation that PROJECT.md edit is committed and that the migration-history parenthetical is preserved
</output>
