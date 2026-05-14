---
phase: 03-page-composition-pop-ups
reviewed: 2026-05-14T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/lib/site-url.ts
  - src/components/SEO.astro
  - src/components/design-skill/About.jsx
  - scripts/check-seo-output.mjs
  - package.json
findings:
  blocker: 0
  warning: 5
  total: 5
status: issues_found
---

# Phase 03: Code Review Report (Gap-Closure Wave)

**Reviewed:** 2026-05-14
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found (no blockers, five warnings)
**Diff base:** `cc54758` (the four-file gap-closure wave: plans 03-06 and 03-07)

## Summary

The four targeted gap fixes (GAP-01 through GAP-04) are implemented correctly and the smoke test (`scripts/check-seo-output.mjs`) actually verifies the intended outputs end-to-end (robots.txt body, homepage canonical with trailing slash, preview-aware per-piece og:image, apex-pinned canonical on preview builds). I cannot find a BLOCKER: each of the four claimed fixes lands the correct bytes in `dist/client/`, the heart glyph flips to outline `♡`, and the `deploy` script now sets the production signal so robots.txt no longer ships `Disallow: /` in production.

What's not great: the precedence chain in `resolveAssetBase()` is silently broken if any earlier env var is an empty string (a subtle but real `??` vs `||` trap), the `pathname` input to `SEO.astro` is still unvalidated even though that was the exact shape of the GAP-02 bug, the production `deploy` script bypasses `astro check`, and the smoke test is brittle in two ways (hard-coded slug, misleading cascade on second-build failure). These are five WARNINGs — fix before the next release wave, but they do not block the current gap-closure commits.

## Warnings

### WR-01: `resolveAssetBase()` precedence chain breaks on empty-string env vars

**File:** `src/lib/site-url.ts:74-80`
**Issue:** The precedence chain uses `??` (nullish coalescing), which only short-circuits on `null` / `undefined`. If any upstream variable is set to an empty string (`""`) — a legitimate state in some CI environments — that empty string wins over downstream values and the helper falls through to apex, losing the preview hostname entirely. Concretely:

```
procEnv.CF_PAGES_URL = ""                     // empty (set but blank)
import.meta.env.PUBLIC_CF_WORKERS_URL = "https://preview.example.workers.dev"
```

With `??`, `fromEnv` resolves to `""` (not the real preview URL), then `if (fromEnv)` is falsy, so the function returns apex. The PUBLIC_CF_WORKERS_URL is never consulted. This is the same class of bug as the original GAP-03 (env var "visible" but ignored), just one layer deeper.

In practice empty-string env vars are uncommon on Cloudflare's build runners, so this is unlikely to fire on the next deploy — but the smoke test in `scripts/check-seo-output.mjs` would not catch it either (it inherits a clean `process.env`).

**Fix:** Use `||` for the chain so falsy strings (empty string included) skip to the next slot:

```ts
const fromEnv =
  procEnv.CF_PAGES_URL ||
  import.meta.env.PUBLIC_CF_PAGES_URL ||
  procEnv.CF_WORKERS_URL ||
  import.meta.env.PUBLIC_CF_WORKERS_URL ||
  procEnv.PUBLIC_SITE_URL ||
  import.meta.env.PUBLIC_SITE_URL;
```

(Or normalize each value first: `procEnv.CF_PAGES_URL?.trim() || undefined`, then keep `??`.)

---

### WR-02: `SEO.astro` does not validate `pathname` — the exact bug shape that caused GAP-02

**File:** `src/components/SEO.astro:32, 41`
**Issue:** The `pathname` prop is destructured with a default of `"/"` and then concatenated as-is into the canonical URL with only a single guard for the root-slash case:

```astro
const { title, description, ogImage, pathname = '/' } = Astro.props;
const canonical = `${canonicalBase}${pathname === '/' ? '/' : pathname}`;
```

Two failure modes survive this guard:

1. **Empty string** — `pathname=""` falls to the `else` branch and yields `https://studiobluemli.com` (bare apex, no trailing slash). This is literally the GAP-02 / BL-01 bug that this commit set out to close, just routed through a different call site.
2. **Missing leading slash** — `pathname="about"` yields `https://studiobluemli.comabout` (no slash between origin and path), a broken canonical.

Today every internal caller passes a well-formed path with a leading slash (`"/"`, `"/about"`, `` `/gallery/${slug}` ``), so the bug is latent. But it survives precisely the kind of CMS-driven or refactor change that the gap-closure cycle is supposed to prevent.

**Fix:** Add a normalization step in `SEO.astro`:

```ts
const rawPath = pathname || '/';
const normalizedPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
const canonical = `${canonicalBase}${normalizedPath === '/' ? '/' : normalizedPath}`;
```

This eliminates both failure modes and keeps the existing trailing-slash-only-for-root contract.

---

### WR-03: `deploy` and `ci:seo-check` skip `astro check` — typecheck errors can ship

**File:** `package.json:12, 18`
**Issue:** The `build` script runs `astro check && astro build`, but the two production-relevant scripts skip the check step:

```json
"build":         "astro check && astro build",
"deploy":        "PUBLIC_DEPLOY_ENV=production astro build && wrangler deploy",
"ci:seo-check":  "PUBLIC_DEPLOY_ENV=production astro build && node scripts/check-seo-output.mjs",
```

`npm run deploy` and `npm run ci:seo-check` both bypass `astro check`. This means a TS error introduced after the last `npm run build` can deploy successfully and reach production. Given that `src/lib/site-url.ts` and `src/components/SEO.astro` are typed, losing this gate on the deploy path is a real regression risk for this exact subsystem.

**Fix:** Prepend `astro check` to both:

```json
"deploy":        "astro check && PUBLIC_DEPLOY_ENV=production astro build && wrangler deploy",
"ci:seo-check":  "astro check && PUBLIC_DEPLOY_ENV=production astro build && node scripts/check-seo-output.mjs",
```

(Or factor a `build:prod` script and reuse it from both.)

---

### WR-04: Smoke test hard-codes `cluster-coral` — breaks on gallery edits

**File:** `scripts/check-seo-output.mjs:26, 87`
**Issue:** `PIECE_SLUG = 'cluster-coral'` is hard-coded. If the founder removes or renames that piece — which the project explicitly supports as a non-engineer workflow per `CLAUDE.md` ("the founder can add or remove gallery pieces... without writing code") — the next `npm run ci:seo-check` fails with:

```
FAIL: dist/client/gallery/cluster-coral/index.html not found — adjust PIECE_SLUG in this script to a real committed slug.
```

The CI gate then blocks a perfectly correct content change, and the only path forward is editing this script. That's exactly the kind of "tooling crosses the founder/engineering boundary" issue the file-CMS pattern is supposed to prevent.

**Fix:** Read the first gallery slug from the content directory at script startup:

```js
import { readdirSync } from 'node:fs';

const galleryDir = 'src/content/gallery';
const PIECE_SLUG = readdirSync(galleryDir)
  .filter(f => f.endsWith('.md'))
  .map(f => f.replace(/\.md$/, ''))
  .sort()[0];
if (!PIECE_SLUG) {
  console.error('FAIL: No gallery entries found in src/content/gallery/');
  process.exit(1);
}
```

This keeps the gate intact across any add/remove of gallery pieces.

---

### WR-05: Second-build failure cascades into misleading downstream FAILs

**File:** `scripts/check-seo-output.mjs:75-116`
**Issue:** When the second `execSync('npm exec -- astro build', ...)` call fails, the script records one `fail(...)` and then *continues* to read `dist/client/gallery/cluster-coral/index.html` — which still contains the previous (apex) build's HTML. The og:image check then fires a second FAIL:

```
FAIL: Second build (PUBLIC_CF_WORKERS_URL set) failed: ...
FAIL: og:image is not preview-aware. Got "https://studiobluemli.com/...", expected "https://preview.example.workers.dev/...".
```

The second FAIL is noise — the real failure is the build itself. Worse, an operator reading the log might "fix" the og:image FAIL (which doesn't need fixing) and ignore the build failure (which does).

**Fix:** Short-circuit on second-build failure:

```js
try {
  execSync('npm exec -- astro build', { /* ... */ });
} catch (e) {
  fail(`Second build (PUBLIC_CF_WORKERS_URL set) failed: ${e.message}`);
  console.error(`\n${failures} failure(s). See above.`);
  process.exit(1);
}
```

Also worth removing the `shell: true` option on the same `execSync` call — no shell features are used by the command, so passing the command as a string with `shell: true` only widens the injection surface for any future change that interpolates a variable into the command string. Either pass the command as an argv array or drop `shell: true` and pass it as a single string; the call still works.

---

## Notes that are explicitly NOT findings

- **`getEntry('site', 'default'))!.data` non-null assertion in `SEO.astro:34`** — pre-existing pattern outside this diff's scope; would only matter if `src/content/site/config.yaml` were deleted, in which case the build correctly crashes loudly.
- **`/* eslint-disable */` at the top of `About.jsx`** — pre-existing in the design-skill JSX imports; not introduced by the heart-glyph fix.
- **`resolveAssetBase()` consults `PUBLIC_SITE_URL` but `resolveCanonicalBase()` does not** — documented design (per the file header comments and D-26: canonical is always apex, asset base may be preview). An operator setting `PUBLIC_SITE_URL` expecting a global override would be surprised, but the file header explicitly calls this out. Not a defect.
- **About.jsx GAP-04 fix is correct** — verified `Mark.Heart` renders `♡` (U+2661) when `filled={false}` against `src/components/design-skill/Mark.jsx:17-19`; summary's reported glyph counts (♡=1, ♥=0 in `dist/client/about/index.html`) are consistent with the change.
- **GAP-01 / robots.txt fix is correct** — `PUBLIC_DEPLOY_ENV=production` is consumed by `isProduction()` via `import.meta.env.PUBLIC_DEPLOY_ENV` (Vite-inlined), which `robots.txt.ts:21` gates on. `deploy:preview` correctly stays unprefixed so preview deploys keep `Disallow: /`.
- **GAP-03 deviation from plan (PUBLIC_-prefixed env vars vs raw `CF_*`)** — this is the right call. The plan's premise (CF_WORKERS_URL is visible in `process.env` during prerender) is wrong for the `@astrojs/cloudflare@13.5` workerd subprocess; the PUBLIC_-prefix workaround the executor found is correct and now matches the `isProduction()` pattern in the same file.

---

_Reviewed: 2026-05-14_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
