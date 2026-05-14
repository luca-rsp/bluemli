---
phase: 03-page-composition-pop-ups
plan: 06
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/site-url.ts
  - src/components/SEO.astro
  - src/pages/robots.txt.ts
  - package.json
  - scripts/check-seo-output.mjs
autonomous: true
gap_closure: true
requirements: [PAG-07, PAG-08]
must_haves:
  truths:
    - "GAP-01 (BL-03 / SC4 / PAG-08) closed: `npm run deploy` ships `Allow: /` + `Sitemap: https://studiobluemli.com/sitemap-index.xml` in `dist/client/robots.txt`. Verified by running `PUBLIC_DEPLOY_ENV=production npm run build` (which the new deploy script does internally) and grepping the output."
    - "GAP-02 (BL-01 / SC5 / PAG-07) closed: the homepage canonical is `https://studiobluemli.com/` (WITH trailing slash). `dist/client/index.html` contains exactly one `<link rel=\"canonical\" href=\"https://studiobluemli.com/\">` line AND the og:url meta matches. Non-root canonicals (e.g., `/about`, `/gallery/cluster-coral/`) keep their existing apex+path shape — unchanged."
    - "GAP-03 (BL-02 / PAG-07) closed: when `CF_WORKERS_URL=https://preview.example.workers.dev` is set in `process.env` at build time, the per-piece gallery og:image (`dist/client/gallery/cluster-coral/index.html`) carries the preview hostname (`https://preview.example.workers.dev/gallery/cluster-coral/hero-800.webp`), while the canonical + og:url stay on apex. Without that env var (the default `npm run build` path) og:image stays on apex."
    - "A new `scripts/check-seo-output.mjs` script exists, is wired into a `ci:seo-check` npm script, and asserts all three behaviors after a production-flagged build. The script exits non-zero on any failure so it gates CI / pre-deploy."
    - "`src/lib/site-url.ts`'s `resolveAssetBase()` reads from `process.env.CF_PAGES_URL` and `process.env.CF_WORKERS_URL` (NOT `import.meta.env.CF_*`), matching the pattern `isProduction()` already uses correctly in the same file. The `PUBLIC_SITE_URL` override is read from BOTH `process.env.PUBLIC_SITE_URL` AND `import.meta.env.PUBLIC_SITE_URL` so explicit operator overrides work in either runtime."
    - "`package.json:deploy` script prefixes `astro build` with `PUBLIC_DEPLOY_ENV=production` in a cross-platform-safe form (POSIX `KEY=value cmd` inline assignment; if the founder ever uses Windows we revisit with `cross-env`, but POSIX inline is acceptable for the v1 macOS/Linux founder workflow per CLAUDE.md). The `deploy:preview` script is NOT prefixed — preview deploys keep emitting `Disallow: /`."
  artifacts:
    - path: "src/lib/site-url.ts"
      provides: "resolveAssetBase() that reads process.env.CF_PAGES_URL / process.env.CF_WORKERS_URL (closes BL-02 / GAP-03)"
      contains: "process.env.CF_PAGES_URL"
    - path: "src/components/SEO.astro"
      provides: "Root-path canonical keeps trailing slash (closes BL-01 / GAP-02)"
      contains: "pathname === '/' ? '/' : pathname"
    - path: "package.json"
      provides: "deploy script prefixed with PUBLIC_DEPLOY_ENV=production so isProduction() returns true at build time on the real deploy path (closes BL-03 / GAP-01)"
      contains: "PUBLIC_DEPLOY_ENV=production"
    - path: "scripts/check-seo-output.mjs"
      provides: "Production smoke test that asserts robots.txt has Sitemap line, homepage canonical has trailing slash, and per-piece og:image is preview-aware when CF_WORKERS_URL is set"
      contains: "Sitemap: https://studiobluemli.com/sitemap-index.xml"
  key_links:
    - from: "scripts/check-seo-output.mjs"
      to: "dist/client/robots.txt"
      via: "fs.readFileSync + string includes assert"
      pattern: "Sitemap: https://studiobluemli.com/sitemap-index.xml"
    - from: "scripts/check-seo-output.mjs"
      to: "dist/client/index.html"
      via: "fs.readFileSync + regex assert"
      pattern: "rel=\"canonical\" href=\"https://studiobluemli.com/\""
    - from: "src/components/SEO.astro"
      to: "src/lib/site-url.ts"
      via: "imports resolveCanonicalBase (already wired; only the concatenation logic in SEO.astro changes)"
      pattern: "resolveCanonicalBase"
    - from: "package.json:scripts.deploy"
      to: "src/pages/robots.txt.ts via isProduction()"
      via: "PUBLIC_DEPLOY_ENV=production env var inlined at build time by Vite + read by isProduction()"
      pattern: "PUBLIC_DEPLOY_ENV=production"
---

<objective>
Close GAP-01 (BL-03 — robots.txt Disallow in production), GAP-02 (BL-01 — homepage canonical missing trailing slash), and GAP-03 (BL-02 — per-piece og:image base never preview-aware) in a single coordinated plan. All three defects live in the SEO/build-pipeline infrastructure subsystem (`src/lib/site-url.ts` + `src/components/SEO.astro` + `src/pages/robots.txt.ts` + `package.json`) and share a single verification surface (the built `dist/client/` artifacts after a production-flagged build), so bundling them into one plan keeps the executor's context coherent and the new smoke-test script ergonomic.

Purpose: Phase 3's verification flagged 3 blockers in SEO infrastructure. BL-03 is the most damaging — the current `npm run deploy` ships `Disallow: /` and would fully deindex Studio Bluemli from search engines. BL-01 and BL-02 are silent but real: the homepage canonical splits Google's view of the apex (slash vs no-slash), and the `resolveAssetBase()` helper that exists *precisely* to keep og:image preview-aware is functionally inert because Vite drops non-`PUBLIC_*` env vars from `import.meta.env`.

Choice of single plan over two: all four touched files are already mutually coupled (SEO.astro imports site-url.ts; robots.txt.ts imports site-url.ts; the smoke test must run after a production-flagged build whose flag is set in package.json). Splitting would force the same `process.env` / `import.meta.env` distinction to be re-explained in two contexts, and the smoke test naturally covers all three at once. WR-06 (heart glyph) ships separately in 03-07 because it touches a wholly different file (`About.jsx`) with a wholly different verification surface (`dist/client/about/index.html` grep for `♡` / `♥`).

Output (4 modified, 1 new):
- `src/lib/site-url.ts` — `resolveAssetBase()` rewritten to read `process.env.CF_PAGES_URL` / `process.env.CF_WORKERS_URL` (closes GAP-03).
- `src/components/SEO.astro` — root-path canonical concatenation keeps the trailing slash (closes GAP-02).
- `src/pages/robots.txt.ts` — unchanged structurally; the fix is upstream (env var now set, so `isProduction()` returns true on the deploy path).
- `package.json` — `deploy` script prefixed with `PUBLIC_DEPLOY_ENV=production`; new `ci:seo-check` script runs the new smoke test.
- `scripts/check-seo-output.mjs` — NEW. Production smoke test asserting robots.txt + canonical + preview-aware og:image (closes GAP-01 + verifies GAP-02 + GAP-03 simultaneously).
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
@.planning/phases/03-page-composition-pop-ups/03-VERIFICATION.md
@.planning/phases/03-page-composition-pop-ups/03-REVIEW.md
@.planning/phases/03-page-composition-pop-ups/03-02-SUMMARY.md
@CLAUDE.md
@src/lib/site-url.ts
@src/components/SEO.astro
@src/pages/robots.txt.ts
@src/pages/gallery/[slug].astro
@package.json
@astro.config.mjs

<interfaces>
<!-- Key contracts the executor consumes. Already exists in site-url.ts; only resolveAssetBase() changes. -->

From src/lib/site-url.ts (current state — note the bug on lines 56-59):
```typescript
const APEX = 'https://studiobluemli.com';

export function resolveCanonicalBase(astroSite?: URL): string {
  const fromAstroSite = astroSite?.toString();
  if (fromAstroSite) return fromAstroSite.replace(/\/$/, '');
  return APEX;
}

export function resolveAssetBase(astroSite?: URL): string {
  // BUG (BL-02): Vite drops non-PUBLIC_-prefixed env vars from import.meta.env.
  // These three are always undefined → falls through to resolveCanonicalBase → apex.
  const fromEnv =
    import.meta.env.CF_PAGES_URL ??
    import.meta.env.CF_WORKERS_URL ??
    import.meta.env.PUBLIC_SITE_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  return resolveCanonicalBase(astroSite);
}

export function isProduction(): boolean {
  // CORRECT pattern (mirror this in resolveAssetBase): reads from process.env first.
  const procBranch = typeof process !== 'undefined' && process.env
    ? (process.env.WORKERS_CI_BRANCH ?? process.env.CF_PAGES_BRANCH)
    : undefined;
  if (procBranch === 'main') return true;
  // ... PUBLIC_DEPLOY_ENV checks follow
}
```

From src/components/SEO.astro (line 37 — the BL-01 site of bug):
```astro
const canonicalBase = resolveCanonicalBase(Astro.site);  // returns 'https://studiobluemli.com' (NO slash)
const canonical    = `${canonicalBase}${pathname === '/' ? '' : pathname}`;
// → root produces 'https://studiobluemli.com' (NO slash), non-root produces 'https://studiobluemli.com/about'.
// Fix: change the conditional so root yields '/' instead of ''.
```

From src/pages/robots.txt.ts (already correctly wired; no code change needed):
```typescript
export const GET: APIRoute = () => {
  const body = isProduction()
    ? 'User-agent: *\nAllow: /\nSitemap: https://studiobluemli.com/sitemap-index.xml\n'
    : 'User-agent: *\nDisallow: /\n';
  // Fix is upstream: ensure isProduction() returns true on the deploy path
  // by exporting PUBLIC_DEPLOY_ENV=production in the deploy npm script.
};
```

From src/pages/gallery/[slug].astro (Phase 2 consumer of resolveAssetBase — no code change needed,
just verify the helper's new behavior reaches it):
```astro
import { resolveAssetBase } from '../../lib/site-url';
const assetBase = resolveAssetBase(Astro.site);
const ogImage = `${assetBase}/gallery/${piece.id}/hero-800.webp`;
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix BL-02 (resolveAssetBase reads process.env) and BL-01 (root canonical keeps trailing slash)</name>
  <files>src/lib/site-url.ts, src/components/SEO.astro</files>
  <read_first>
    - src/lib/site-url.ts (the file being modified — read all 100 lines once to confirm current shape)
    - src/components/SEO.astro (the file being modified — only line 37 changes)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEW.md (BL-01 and BL-02 fix snippets, lines 60-117)
    - .planning/phases/03-page-composition-pop-ups/03-VERIFICATION.md (gap artifacts for BL-01 + BL-02)
  </read_first>
  <action>
**Edit 1: `src/lib/site-url.ts` — replace the body of `resolveAssetBase()` (lines 55-62 in the current file).**

Replace this block:
```typescript
export function resolveAssetBase(astroSite?: URL): string {
  const fromEnv =
    import.meta.env.CF_PAGES_URL ??
    import.meta.env.CF_WORKERS_URL ??
    import.meta.env.PUBLIC_SITE_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  return resolveCanonicalBase(astroSite);
}
```

With this block (mirrors the `isProduction()` `process.env` pattern; reads both Node and Vite sides for `PUBLIC_SITE_URL`):
```typescript
export function resolveAssetBase(astroSite?: URL): string {
  // BL-02 / GAP-03 fix: Vite only exposes `PUBLIC_`-prefixed env vars to
  // `import.meta.env`. CF_PAGES_URL and CF_WORKERS_URL live in `process.env`
  // during the Cloudflare build (same pattern isProduction() uses below).
  // PUBLIC_SITE_URL is read from both sides so an operator override works
  // regardless of which runtime surface they set it on.
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};
  const fromEnv =
    procEnv.CF_PAGES_URL ??
    procEnv.CF_WORKERS_URL ??
    procEnv.PUBLIC_SITE_URL ??
    import.meta.env.PUBLIC_SITE_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  return resolveCanonicalBase(astroSite);
}
```

Also update the docstring above `resolveAssetBase()` so the precedence comment reads:
```
 * Precedence:
 *   1. process.env.CF_PAGES_URL       (Cloudflare Pages preview/production)
 *   2. process.env.CF_WORKERS_URL     (Cloudflare Workers Builds preview hostname)
 *   3. process.env.PUBLIC_SITE_URL    (explicit operator override, Node side)
 *   4. import.meta.env.PUBLIC_SITE_URL (explicit operator override, Vite side)
 *   5. resolveCanonicalBase(astroSite) (apex fallback — same as canonical)
```

Leave `resolveCanonicalBase()` and `isProduction()` untouched.

**Edit 2: `src/components/SEO.astro` — change line 37 to preserve the trailing slash on root.**

Replace:
```astro
const canonical    = `${canonicalBase}${pathname === '/' ? '' : pathname}`;
```

With:
```astro
// BL-01 / GAP-02 fix: keep the trailing slash on root so canonical, og:url,
// sitemap-0.xml's <loc>, and the URL users actually visit all agree on
// `https://studiobluemli.com/` (NOT bare-apex). Google treats apex and
// apex/ as canonically distinct on the root path.
const canonical    = `${canonicalBase}${pathname === '/' ? '/' : pathname}`;
```

Note: `resolveCanonicalBase()` continues to return apex *without* trailing slash (lines 32-36 in site-url.ts). The slash is now appended in SEO.astro for the root case. Do NOT change `resolveCanonicalBase()`.

The `ogImageAbs` default (line 38) becomes `${canonicalBase}/og-default.png` — which is already correct because line 38 hardcodes the slash separator. No change needed on line 38.

Verify nothing else in SEO.astro depends on the `' '` vs `'/' ` difference (it doesn't — `og:url` reuses `canonical` so it gets the fix automatically).
  </action>
  <verify>
    <automated>
# Confirm site-url.ts change landed and reads process.env (not import.meta.env) for CF_* vars.
grep -c "procEnv.CF_PAGES_URL" src/lib/site-url.ts | grep -qx 1 && \
grep -c "procEnv.CF_WORKERS_URL" src/lib/site-url.ts | grep -qx 1 && \
test "$(grep -v '^[[:space:]]*//' src/lib/site-url.ts | grep -c 'import.meta.env.CF_PAGES_URL')" = "0" && \
test "$(grep -v '^[[:space:]]*//' src/lib/site-url.ts | grep -c 'import.meta.env.CF_WORKERS_URL')" = "0" && \
# Confirm SEO.astro change landed: root yields '/' not ''.
grep -c "pathname === '/' ? '/' : pathname" src/components/SEO.astro | grep -qx 1 && \
test "$(grep -c "pathname === '/' ? '' : pathname" src/components/SEO.astro)" = "0" && \
# Typecheck still passes (Astro 6 strict mode).
npx astro check 2>&1 | tail -5
    </automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "procEnv.CF_PAGES_URL" src/lib/site-url.ts` returns exactly `1`.
    - `grep -c "procEnv.CF_WORKERS_URL" src/lib/site-url.ts` returns exactly `1`.
    - With comment lines filtered out (`grep -v '^[[:space:]]*//'`), `import.meta.env.CF_PAGES_URL` appears `0` times in `src/lib/site-url.ts`.
    - With comment lines filtered out, `import.meta.env.CF_WORKERS_URL` appears `0` times in `src/lib/site-url.ts`.
    - `grep -c "pathname === '/' ? '/' : pathname" src/components/SEO.astro` returns exactly `1`.
    - `grep -c "pathname === '/' ? '' : pathname" src/components/SEO.astro` returns `0` (the old bug is gone, not just shadowed).
    - `npx astro check` exits 0 with zero errors and zero warnings related to these two files.
    - `resolveCanonicalBase` body is unchanged from the pre-task state (lines 32-36).
    - `isProduction` body is unchanged from the pre-task state (lines 77-100).
  </acceptance_criteria>
  <done>
    `src/lib/site-url.ts` reads CF_PAGES_URL and CF_WORKERS_URL from `process.env`, and falls back to `import.meta.env.PUBLIC_SITE_URL` only for explicit operator overrides. `src/components/SEO.astro` produces `https://studiobluemli.com/` (with slash) on the root path and unchanged paths elsewhere. Type-check passes.
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix BL-03 (production deploy signal) + add SEO smoke-test script + ci:seo-check npm script</name>
  <files>package.json, scripts/check-seo-output.mjs</files>
  <read_first>
    - package.json (the file being modified — read all 48 lines to understand the existing scripts block)
    - src/pages/robots.txt.ts (the consumer that flips on isProduction() — confirm no code change needed here)
    - src/lib/site-url.ts (isProduction() — confirm PUBLIC_DEPLOY_ENV=production is one of the truthy signals, line 87 + line 97)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEW.md (BL-03 fix options, lines 120-153)
    - .planning/phases/03-page-composition-pop-ups/03-VERIFICATION.md (gap missing-items for BL-03)
  </read_first>
  <action>
**Edit 1: `package.json` — prefix the `deploy` script with `PUBLIC_DEPLOY_ENV=production` and add a new `ci:seo-check` script.**

In the `scripts` block (current `package.json` lines 8-21), make these two changes:

1. Replace the existing `deploy` line:
   ```json
   "deploy": "astro build && wrangler deploy",
   ```
   With (POSIX inline env-var assignment — works on macOS and Linux which are the founder's only supported dev environments per CLAUDE.md; Windows is explicitly not a target):
   ```json
   "deploy": "PUBLIC_DEPLOY_ENV=production astro build && wrangler deploy",
   ```
   Rationale: `isProduction()` in `src/lib/site-url.ts` lines 87 and 97 already check `PUBLIC_DEPLOY_ENV === 'production'` in both `process.env` and `import.meta.env`. Vite inlines `PUBLIC_*`-prefixed vars from the build-command env into `import.meta.env` automatically, so the env-var prefix flips the robots.txt body from `Disallow: /` to `Allow: / + Sitemap` on the actual deploy path. Do NOT prefix `deploy:preview` (line 13) — preview deploys should keep emitting `Disallow: /` to stay out of search indexes.

2. Add a new `ci:seo-check` script entry directly after the existing `ci:lowercase-check` line (line 17):
   ```json
   "ci:seo-check": "PUBLIC_DEPLOY_ENV=production astro build && node scripts/check-seo-output.mjs",
   ```
   This script builds with the production signal then runs the new smoke-test asserter (created in Edit 2). It is the gate the verifier required — without it the same regression can re-land.

Preserve all other scripts exactly. Do not reformat untouched lines.

**Edit 2: Create `scripts/check-seo-output.mjs` — production SEO smoke test.**

This is a NEW file. It reads three built artifacts and asserts the three GAP fixes hold simultaneously. Exits 0 on success, exits 1 with a clear message on any failure.

```javascript
#!/usr/bin/env node
// scripts/check-seo-output.mjs — Phase 3 gap-closure smoke test.
//
// Runs AFTER `astro build` (which must be invoked with PUBLIC_DEPLOY_ENV=production
// to flip robots.txt into production mode). Asserts:
//   GAP-01 / BL-03: dist/client/robots.txt contains Allow + Sitemap line (not Disallow).
//   GAP-02 / BL-01: dist/client/index.html canonical has the trailing slash.
//   GAP-03 / BL-02: when CF_WORKERS_URL is set in this script's process.env BEFORE
//                   `astro build`, dist/client/gallery/<slug>/index.html's og:image
//                   carries the preview hostname (canonical stays on apex).
//
// The GAP-03 check is a *second* build pass: this script runs a separate
// preview-hostname build via `node:child_process` with CF_WORKERS_URL set,
// then re-reads the gallery slug HTML.

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const DIST = 'dist/client';
const APEX = 'https://studiobluemli.com';
const PREVIEW = 'https://preview.example.workers.dev';
const ROBOTS = `${DIST}/robots.txt`;
const INDEX_HTML = `${DIST}/index.html`;
const PIECE_SLUG = 'cluster-coral'; // any committed gallery slug — see src/content/gallery/

let failures = 0;
function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failures += 1;
}
function ok(msg) {
  console.log(`OK: ${msg}`);
}

// ---------- GAP-01 / BL-03 ----------
if (!existsSync(ROBOTS)) {
  fail(`${ROBOTS} not found. Did you run \`PUBLIC_DEPLOY_ENV=production astro build\` first?`);
} else {
  const robots = readFileSync(ROBOTS, 'utf8');
  const sitemapLine = `Sitemap: ${APEX}/sitemap-index.xml`;
  if (!robots.includes(sitemapLine)) {
    fail(`robots.txt missing "${sitemapLine}". Got:\n${robots}`);
  } else if (robots.includes('Disallow: /')) {
    fail(`robots.txt still contains "Disallow: /". Body:\n${robots}`);
  } else if (!robots.includes('Allow: /')) {
    fail(`robots.txt missing "Allow: /". Body:\n${robots}`);
  } else {
    ok('GAP-01 / BL-03 — robots.txt has Allow + Sitemap (no Disallow).');
  }
}

// ---------- GAP-02 / BL-01 ----------
if (!existsSync(INDEX_HTML)) {
  fail(`${INDEX_HTML} not found.`);
} else {
  const html = readFileSync(INDEX_HTML, 'utf8');
  const expected = `<link rel="canonical" href="${APEX}/">`;
  if (!html.includes(expected)) {
    fail(`Homepage canonical missing trailing slash. Expected exact string: ${expected}`);
  } else if (html.match(/<link rel="canonical" href="https:\/\/studiobluemli\.com"(?!\/)/)) {
    fail('Homepage canonical still emitted without trailing slash somewhere in the HTML.');
  } else {
    ok('GAP-02 / BL-01 — homepage canonical has trailing slash.');
  }
}

// ---------- GAP-03 / BL-02 ----------
// Run a *second* build with CF_WORKERS_URL set in process.env; then re-inspect the slug HTML.
console.log(`\nRebuilding with CF_WORKERS_URL=${PREVIEW} for GAP-03 preview-aware og:image check...`);
try {
  execSync('astro build', {
    env: { ...process.env, CF_WORKERS_URL: PREVIEW, PUBLIC_DEPLOY_ENV: 'production' },
    stdio: 'inherit',
  });
} catch (e) {
  fail(`Second build (CF_WORKERS_URL set) failed: ${e.message}`);
}

const piecePath = `${DIST}/gallery/${PIECE_SLUG}/index.html`;
if (!existsSync(piecePath)) {
  fail(`${piecePath} not found — adjust PIECE_SLUG in this script to a real committed slug.`);
} else {
  const pieceHtml = readFileSync(piecePath, 'utf8');
  const expectedOgImage = `${PREVIEW}/gallery/${PIECE_SLUG}/hero-800.webp`;
  const ogImageMatch = pieceHtml.match(/<meta property="og:image"\s+content="([^"]+)"/);
  if (!ogImageMatch) {
    fail(`No og:image meta tag found in ${piecePath}.`);
  } else if (ogImageMatch[1] !== expectedOgImage) {
    fail(`og:image is not preview-aware. Got "${ogImageMatch[1]}", expected "${expectedOgImage}".`);
  } else {
    ok(`GAP-03 / BL-02 — per-piece og:image uses preview hostname: ${ogImageMatch[1]}`);
  }
  // Canonical must STAY on apex (canonical-to-apex contract per D-26 + SC5).
  const expectedCanonical = `<link rel="canonical" href="${APEX}/gallery/${PIECE_SLUG}/">`;
  if (!pieceHtml.includes(expectedCanonical)) {
    fail(`Canonical leaked off apex on preview-hostname build. Expected: ${expectedCanonical}`);
  } else {
    ok(`GAP-03 / BL-02 — per-piece canonical stays on apex (no leak): ${APEX}/gallery/${PIECE_SLUG}/`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} failure(s). See above.`);
  process.exit(1);
}
console.log('\nAll SEO smoke checks passed.');
```

Make the script executable-by-node (the shebang is informational; npm scripts invoke it via `node`). No `chmod` needed.

**Note on the second build:** `astro build` is idempotent over `dist/client/`. The two builds overwrite each other — that's intentional. The script's order is:
  1. Caller runs `PUBLIC_DEPLOY_ENV=production astro build` (the `ci:seo-check` npm script does this).
  2. Script reads `robots.txt` + `index.html` from the first build.
  3. Script triggers a *second* `astro build` with `CF_WORKERS_URL` also set, then reads the gallery slug HTML.

This sequencing means the first build's `dist/client/index.html` is *replaced* by the second build before the script ends — that's fine because `index.html`'s canonical is purely a function of `Astro.site` (always apex per `resolveCanonicalBase`), so the second build's canonical is identical to the first build's. The check on `index.html` is done before the second build runs.
  </action>
  <verify>
    <automated>
# Confirm package.json edits landed.
node -e "const p=require('./package.json'); if(!p.scripts.deploy.startsWith('PUBLIC_DEPLOY_ENV=production ')) process.exit(1); if(!p.scripts['ci:seo-check']) process.exit(2); if(p.scripts['deploy:preview'].includes('PUBLIC_DEPLOY_ENV=production')) process.exit(3);" && \
# Confirm script file exists and has the expected exit-code contract.
test -f scripts/check-seo-output.mjs && \
grep -c 'GAP-01' scripts/check-seo-output.mjs | grep -qx 1 && \
grep -c 'GAP-02' scripts/check-seo-output.mjs | grep -qx 1 && \
grep -c 'GAP-03' scripts/check-seo-output.mjs | grep -qx 1 && \
# Run the smoke test end-to-end. This builds twice (production, then preview-hostname),
# and exits 0 only if all three gaps are closed.
npm run ci:seo-check
    </automated>
  </verify>
  <acceptance_criteria>
    - `package.json:scripts.deploy` literally starts with the string `PUBLIC_DEPLOY_ENV=production ` (with trailing space, before `astro build`).
    - `package.json:scripts['ci:seo-check']` exists and equals `PUBLIC_DEPLOY_ENV=production astro build && node scripts/check-seo-output.mjs`.
    - `package.json:scripts['deploy:preview']` does NOT contain `PUBLIC_DEPLOY_ENV=production` (preview deploys keep emitting Disallow).
    - `scripts/check-seo-output.mjs` exists and references all three gap IDs (`GAP-01`, `GAP-02`, `GAP-03`).
    - `npm run ci:seo-check` exits 0, prints `All SEO smoke checks passed.`, and shows three `OK:` lines (one per gap, plus one extra `OK:` for the canonical-stays-on-apex sub-check inside GAP-03).
    - `dist/client/robots.txt` after `PUBLIC_DEPLOY_ENV=production npm run build`: `grep -c 'Sitemap: https://studiobluemli.com/sitemap-index.xml' dist/client/robots.txt` returns 1; `grep -c 'Disallow: /' dist/client/robots.txt` returns 0; `grep -c 'Allow: /' dist/client/robots.txt` returns 1.
    - `dist/client/index.html`: `grep -c 'rel="canonical" href="https://studiobluemli.com/"' dist/client/index.html` returns 1; `grep -c 'rel="canonical" href="https://studiobluemli.com"[^/]' dist/client/index.html` returns 0 (no bare-apex canonical anywhere in homepage HTML).
    - After the second build inside ci:seo-check (CF_WORKERS_URL set): `grep -c 'og:image"[[:space:]]*content="https://preview.example.workers.dev/gallery/cluster-coral/hero-800.webp"' dist/client/gallery/cluster-coral/index.html` returns 1.
    - In the same preview-hostname build, `grep -c 'rel="canonical" href="https://studiobluemli.com/gallery/cluster-coral/"' dist/client/gallery/cluster-coral/index.html` returns 1 (canonical stayed on apex — no preview leak).
  </acceptance_criteria>
  <done>
    `npm run ci:seo-check` exits 0 and prints the four `OK:` lines (GAP-01, GAP-02, GAP-03 og:image, GAP-03 canonical-stays-on-apex). `npm run deploy` would now ship `Allow: / + Sitemap` to apex. `package.json` reflects both new script entries.
  </done>
</task>

</tasks>

<verification>
After both tasks complete, run the end-to-end gate that ties to the verifier's missing-items in VERIFICATION.md:

```bash
# Single command: rebuild from clean and assert all three gaps close.
rm -rf dist && npm run ci:seo-check
```

Expected output (in order, no failures):
```
OK: GAP-01 / BL-03 — robots.txt has Allow + Sitemap (no Disallow).
OK: GAP-02 / BL-01 — homepage canonical has trailing slash.
Rebuilding with CF_WORKERS_URL=https://preview.example.workers.dev for GAP-03 preview-aware og:image check...
OK: GAP-03 / BL-02 — per-piece og:image uses preview hostname: https://preview.example.workers.dev/gallery/cluster-coral/hero-800.webp
OK: GAP-03 / BL-02 — per-piece canonical stays on apex (no leak): https://studiobluemli.com/gallery/cluster-coral/
All SEO smoke checks passed.
```

Also confirm the deploy script change doesn't break the preview path:
```bash
# `deploy:preview` must still emit Disallow (preview deploys stay deindexed).
PUBLIC_DEPLOY_ENV= astro build && grep -c 'Disallow: /' dist/client/robots.txt
# Expected: 1 (Disallow remains when the prod signal is absent).
```
</verification>

<success_criteria>
- GAP-01 closed: `dist/client/robots.txt` after `PUBLIC_DEPLOY_ENV=production npm run build` (which is what `npm run deploy` now invokes) contains `Allow: /\nSitemap: https://studiobluemli.com/sitemap-index.xml`. Verified by the `Sitemap:` grep returning 1.
- GAP-02 closed: `dist/client/index.html` contains exactly one `<link rel="canonical" href="https://studiobluemli.com/">` (trailing slash present). Bare-apex canonical no longer appears anywhere.
- GAP-03 closed: with `CF_WORKERS_URL=https://preview.example.workers.dev` in `process.env`, the per-piece gallery og:image carries the preview hostname, AND the canonical for the same page stays on apex (the resolveCanonicalBase vs resolveAssetBase split actually has different outputs now).
- `npm run ci:seo-check` is the durable gate — it would have caught all three regressions if it had existed before Phase 3 closure. Running it locally gates against the same regression re-landing.
- All four prior plan SUMMARYs (03-01..03-05) remain on disk untouched.
</success_criteria>

<output>
After completion, create `.planning/phases/03-page-composition-pop-ups/03-06-SUMMARY.md` summarizing:
- Which gaps closed (GAP-01, GAP-02, GAP-03)
- Files changed (5: site-url.ts, SEO.astro, package.json, NEW scripts/check-seo-output.mjs; robots.txt.ts unchanged code but newly reachable Allow branch)
- Verification command + its expected output (the four `OK:` lines)
- Any deviations from this plan (none expected; if `cluster-coral` is renamed before this plan executes, the executor should pick another committed gallery slug and note it in the SUMMARY)
</output>
