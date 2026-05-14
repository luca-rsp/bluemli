---
phase: 03-page-composition-pop-ups
plan: 02
type: execute
wave: 2
depends_on: ["03-01"]
files_modified:
  - src/lib/site-url.ts
  - src/components/SEO.astro
  - src/pages/robots.txt.ts
  - scripts/generate-og-default.mjs
  - public/og-default.png
  - astro.config.mjs
  - src/pages/gallery/[slug].astro
  - src/pages/gallery.astro
  - package.json
  - package-lock.json
  - .planning/REQUIREMENTS.md
  - .planning/PROJECT.md
  - .planning/ROADMAP.md
autonomous: true
requirements: [PAG-02, PAG-07, PAG-08, PAG-06]
must_haves:
  truths:
    - "Every page that imports <SEO /> emits <meta name=description>, og:title, og:description, og:image (absolute URL), og:url, twitter:card=summary_large_image, and a <link rel=canonical> pointing to the apex (https://studiobluemli.com) — even on preview deploys."
    - "BaseLayout.astro continues to own <title>{title}</title> (Concern 4 reconciliation — least-blast-radius). <SEO /> does NOT emit <title>; every page passes its title to BaseLayout via the existing `title` prop."
    - "On a production build (main branch), GET /robots.txt returns `Allow: /` plus the sitemap reference; on a preview branch build, GET /robots.txt returns `Disallow: /`. Production detection uses both `process.env.WORKERS_CI_BRANCH` AND `import.meta.env.WORKERS_CI_BRANCH` AND `import.meta.env.PUBLIC_WORKERS_CI_BRANCH` for hardening (Concern 7)."
    - "After build, dist/client/sitemap-index.xml + dist/client/sitemap-0.xml exist; sitemap-0.xml's <loc> elements include all 5 routes + every /gallery/<slug> permalink, all canonical to apex."
    - "public/og-default.png is a real 1200x630 PNG (cream background + centered mark) that resolves at https://studiobluemli.com/og-default.png after deploy."
    - ".planning/REQUIREMENTS.md has CON-01..CON-11 listed under Out of Scope (not Active Requirements), and PAG-06's narrative reads 'renders visible Instagram DM link + mailto link' (per D-23)."
    - ".planning/PROJECT.md Active section + Out of Scope section reflect the no-form scope cut, the landing empty-state change (D-03), and the About imagery divergence (D-14). The ROADMAP Phase 3 SC narrative + key risks section reflect the same."
  artifacts:
    - path: "src/lib/site-url.ts"
      provides: "resolveCanonicalBase() (always apex), resolveAssetBase() (preview-aware), isProduction() build-time env-aware helpers"
      exports: ["resolveCanonicalBase", "resolveAssetBase", "isProduction"]
    - path: "src/components/SEO.astro"
      provides: "Per-page meta + canonical emitter; canonical/og:url ALWAYS apex; og:image MAY use preview host; falls back to site/config.yaml defaults and /og-default.png"
      contains: "twitter:card"
    - path: "src/pages/robots.txt.ts"
      provides: "Astro endpoint emitting env-aware robots.txt with prerender = true"
      exports: ["GET", "prerender"]
    - path: "scripts/generate-og-default.mjs"
      provides: "One-shot Node script that renders mark-coral.svg into public/og-default.png at 1200x630"
      contains: "1200"
    - path: "public/og-default.png"
      provides: "1200x630 logo-lockup PNG, committed and served by Cloudflare Static Assets"
      contains: "PNG image data"
    - path: "astro.config.mjs"
      provides: "Adds @astrojs/sitemap integration alongside react()"
      contains: "sitemap()"
  key_links:
    - from: "src/components/SEO.astro"
      to: "src/lib/site-url.ts"
      via: "import { resolveCanonicalBase, resolveAssetBase } and call with Astro.site"
      pattern: "resolveCanonicalBase\\(Astro\\.site\\)"
    - from: "src/pages/robots.txt.ts"
      to: "src/lib/site-url.ts"
      via: "import { isProduction } and branch the body string"
      pattern: "isProduction\\(\\)"
    - from: "src/pages/gallery/[slug].astro"
      to: "src/components/SEO.astro"
      via: "<SEO slot=\"head\" ogImage={...} pathname=... />"
      pattern: "import SEO from"
    - from: "src/layouts/BaseLayout.astro"
      to: "src/components/SEO.astro"
      via: "<slot name=\"head\" /> receives the <SEO /> emitter's <meta> tags; BaseLayout still emits <title>{title}</title> (Concern 4)"
      pattern: "slot name=\"head\""
---

<objective>
Wire the shared SEO infrastructure that every Phase 3 page (and the refactored Phase 2 gallery pages) will use to emit canonical-to-apex meta tags, plus the sitemap integration, plus the env-aware robots.txt endpoint, plus the default og:image fallback PNG, plus the doc updates that finalize the D-19/D-23 scope changes (REQUIREMENTS + PROJECT + ROADMAP narrative).

Purpose: This plan is the "infrastructure" layer of Phase 3. By the end of it, every page in the codebase can simply do `<SEO slot="head" pathname="/..." />` (with optional title/description/ogImage props) and get the full PAG-07 contract for free, including the absolute-URL og:image and the canonical-to-apex link tag. Plans 03 and 04 consume this directly with no further plumbing.

**REVIEWS-MODE FIXES (this plan addresses 6 Codex concerns):**

1. **Concern 1 (HIGH) — Canonical URL leak.** Original plan's `resolveSiteBase()` prioritized `CF_PAGES_URL` / `CF_WORKERS_URL`, contaminating canonical/og:url with preview hostnames. Split into `resolveCanonicalBase()` (ALWAYS apex per D-26 + SC5) and `resolveAssetBase()` (MAY use preview env vars for og:image only — though we keep og:image on apex too in v1 for simplicity; D-26 risk note covers this).

2. **Concern 4 (HIGH) — `<title>` regression mid-phase.** Original plan removed BaseLayout's `<title>` mid-phase before Wave 3 plans wired `<SEO />` into all routes. Resolution: **Option 1 (recommended)** — keep BaseLayout's `<title>{title}</title>`, have `<SEO />` OMIT `<title>`. This is the "least-blast-radius" choice per PATTERNS.md and matches every existing page's contract.

3. **Concern 6 (MEDIUM) — Doc inconsistencies.** Add PROJECT.md (Active + Out of Scope) and ROADMAP Phase 3 narrative updates here alongside the REQUIREMENTS.md edits. Default per reviews-mode guidance: keep all doc edits in this plan.

4. **Concern 7 (MEDIUM) — `robots.txt` brittleness.** Harden `isProduction()` with `process.env.WORKERS_CI_BRANCH ?? import.meta.env.WORKERS_CI_BRANCH ?? import.meta.env.PUBLIC_WORKERS_CI_BRANCH ?? process.env.PUBLIC_DEPLOY_ENV === 'production'` — covers Vite-only, Node-only, and PUBLIC_-prefixed env exposure paths.

5. **Concern 8 (MEDIUM) — Grep chains break on zero matches.** All "expect zero" verifications use `! grep -q PATTERN file` or `grep -c PATTERN file || true` to avoid shell-chain failure.

6. **Concern 9 (MEDIUM) — Astro frontmatter leading-space delimiter.** When the executor TRANSCRIBES Astro code from this plan into the actual source file, the `---` frontmatter delimiter lines MUST be at column 0. Inside this plan's markdown code blocks the `---` lines are shown with ONE leading space — this is a markdown-rendering safety device (it prevents the GSD frontmatter parser from latching onto the inner sample as if it were the file's real frontmatter). The executor MUST strip that leading space when writing the file.

7. **Concern 12 (LOW) — `files_modified` metadata gap.** `package-lock.json` added to `files_modified` (regenerated by `npm install` in Task 1).

Output (14 files touched, 5 new, 9 modified — adds PROJECT.md + ROADMAP.md vs original):
- `src/lib/site-url.ts` — `resolveCanonicalBase()`, `resolveAssetBase()`, `isProduction()` build-time helpers (the canonical/asset split is the Concern 1 fix).
- `src/components/SEO.astro` — the per-page meta emitter (Concern 4: does NOT emit `<title>`; BaseLayout still owns it).
- `src/pages/robots.txt.ts` — Astro endpoint with `prerender = true` returning the env-branched body (Concern 7: hardened `isProduction()`).
- `scripts/generate-og-default.mjs` — one-shot Node script that uses Sharp (already a devDep) to render the logo lockup PNG.
- `public/og-default.png` — the committed 1200x630 PNG output of that script.
- `astro.config.mjs` — adds `sitemap()` to the integrations array.
- `src/pages/gallery/[slug].astro` — refactors the inline env-aware base-URL block + `<meta slot="head">` into `<SEO />` + `resolveAssetBase()`.
- `src/pages/gallery.astro` — adds `<SEO slot="head" />`.
- `package.json` — adds `@astrojs/sitemap` + `temporal-polyfill` deps + a new `og:default` script.
- `package-lock.json` — regenerated by `npm install` (Concern 12).
- `.planning/REQUIREMENTS.md` — moves CON-01..CON-11 to Out of Scope (D-19) and rewrites PAG-06 narrative (D-23).
- `.planning/PROJECT.md` — Active section: Say Hi line rewritten (no form); Out of Scope: contact form added; landing empty-state and About imagery noted in narrative.
- `.planning/ROADMAP.md` — Phase 3 SC1 narrative reflects D-03 (landing omits section on zero upcoming); SC3 narrative reflects D-14 (gallery hero photos, not bench shots); key risks reflect D-14 + D-18.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/03-page-composition-pop-ups/03-CONTEXT.md
@.planning/phases/03-page-composition-pop-ups/03-RESEARCH.md
@.planning/phases/03-page-composition-pop-ups/03-PATTERNS.md
@.planning/phases/03-page-composition-pop-ups/03-UI-SPEC.md
@.planning/phases/03-page-composition-pop-ups/03-REVIEWS.md
@.planning/phases/03-page-composition-pop-ups/03-01-SUMMARY.md
@CLAUDE.md
@astro.config.mjs
@src/layouts/BaseLayout.astro
@src/pages/gallery/[slug].astro
@src/pages/gallery.astro
@src/content.config.ts
@src/content/site/config.yaml
@package.json

<interfaces>
<!-- These contracts are extracted from the codebase and RESEARCH.md so the executor does not need
     to explore. Use them directly. -->

Site collection schema (from src/content.config.ts):
```typescript
const site = defineCollection({
  loader: file('./src/content/site/config.yaml'),
  schema: z.object({
    tagline: z.string(),
    contact_email: z.string().email(),
    ig_handle: z.string(),
    ig_dm_url: z.string().url(),
    footer_text: z.string(),
    og_title: z.string(),
    og_description: z.string(),
  }).strict(),
});
```
The default site config entry is fetched with `getEntry('site', 'default')`; the `'default'` id maps to the `default:` top-level key in `src/content/site/config.yaml`.

Astro endpoint signature (from Astro docs, used in src/pages/robots.txt.ts):
```typescript
import type { APIRoute } from 'astro';
export const prerender = true;          // REQUIRED under output: 'server'
export const GET: APIRoute = () => new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
```

Cloudflare Workers Builds env vars (verified in 03-RESEARCH.md sources):
- `WORKERS_CI_BRANCH` set on Workers Builds CI runs; `'main'` for production deploys. May be exposed via `process.env` (Node) AND/OR `import.meta.env` (Vite) — Concern 7 hardening checks both.
- `CF_PAGES_URL` set on legacy Pages preview/production builds
- `CF_PAGES_BRANCH` legacy Pages branch; secondary check
- `PUBLIC_SITE_URL` explicit override (project-defined, set via wrangler.jsonc `vars` or `.dev.vars` locally)
- `PUBLIC_DEPLOY_ENV` optional explicit signal (planner-recommended fallback per Concern 7) — set in Cloudflare build command if WORKERS_CI_BRANCH is unreachable
- `Astro.site` set in astro.config.mjs to `https://studiobluemli.com` (apex)

@astrojs/sitemap integration shape (from docs.astro.build/en/guides/integrations-guide/sitemap/):
```javascript
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://studiobluemli.com',
  integrations: [react(), sitemap()],
});
```
The integration auto-includes prerendered routes (every Phase 1/2 page has `export const prerender = true`).

Existing env-aware og:image block to lift (from src/pages/gallery/[slug].astro lines 43-52, VERBATIM):
```typescript
const ogBase = import.meta.env.CF_PAGES_URL
            ?? import.meta.env.CF_WORKERS_URL
            ?? import.meta.env.PUBLIC_SITE_URL
            ?? Astro.site?.toString().replace(/\/$/, '');
const ogImageUrl = `${ogBase}/gallery/${slug}/hero-800.webp`;
```
This pattern moves into `src/lib/site-url.ts`'s `resolveAssetBase()` (preview-aware) — NOT `resolveCanonicalBase()` (always apex).

Existing BaseLayout slot pattern (from src/layouts/BaseLayout.astro line 43):
```astro
<slot name="head" />
```
This is the injection point. **Concern 4 reconciliation:** BaseLayout.astro's `<title>{title}</title>` line (currently line 17) STAYS. `<SEO />` does NOT emit a `<title>`. This is the safest mid-phase ordering.

Existing logo asset (verified via ls assets/logo/):
- `assets/logo/mark.svg` generic mark
- `assets/logo/mark-coral.svg` coral-tinted variant (preferred for the og:image per RESEARCH.md Example 4)
- `assets/logo/mark-cream.svg`, `assets/logo/mark-indigo.svg` alternate tints
- `assets/logo/mark-1024.png`, `assets/logo/mark-512.png` pre-rasterized variants
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create src/lib/site-url.ts (canonical/asset split + hardened isProduction) and add the two new npm deps</name>
  <read_first>
    - src/pages/gallery/[slug].astro (lines 43-52: the inline env-aware base-URL block to lift)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md (Pattern 2 + Pitfall 2)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 1: canonical/asset URL split; Concern 7: isProduction hardening)
    - package.json (the existing scripts + dependencies block)
  </read_first>
  <behavior>
    - `src/lib/site-url.ts` exports THREE functions: `resolveCanonicalBase(astroSite?: URL): string`, `resolveAssetBase(astroSite?: URL): string`, and `isProduction(): boolean`. (Concern 1: the canonical/asset split.)
    - `resolveCanonicalBase` ALWAYS returns apex: `astroSite?.toString().replace(/\/$/, '') ?? 'https://studiobluemli.com'`. NEVER consults preview env vars. Used by canonical + og:url.
    - `resolveAssetBase` MAY consult preview env vars for absolute asset URLs (og:image): `CF_PAGES_URL ?? CF_WORKERS_URL ?? PUBLIC_SITE_URL ?? canonical`. (For v1 we still pin og:image to canonical because preview unfurls aren't a real use case, but the helper is in place if we change our mind later — D-26 risk note acknowledges this.)
    - `isProduction` returns `true` iff ANY of these env signals indicate `main` branch: `process.env.WORKERS_CI_BRANCH === 'main'` OR `import.meta.env.WORKERS_CI_BRANCH === 'main'` OR `import.meta.env.PUBLIC_WORKERS_CI_BRANCH === 'main'` OR `process.env.PUBLIC_DEPLOY_ENV === 'production'` OR `import.meta.env.PUBLIC_DEPLOY_ENV === 'production'` OR (legacy fallback) `process.env.CF_PAGES_BRANCH === 'main'` OR `import.meta.env.CF_PAGES_BRANCH === 'main'`. Returns `false` in local dev (no env signals = safer Disallow).
    - All env reads wrapped inside the function body (Pitfall 2 — never module-top-level capture).
    - `@astrojs/sitemap@^3.7.2` and `temporal-polyfill@^0.3.2` are added to dependencies (`temporal-polyfill` is consumed by Plan 03, but installed here to centralize package.json edits).
    - `package.json` gets a new `"og:default"` script that runs `node scripts/generate-og-default.mjs`.
    - `npm install` regenerates `package-lock.json` (Concern 12 metadata).
  </behavior>
  <action>
**Edit 1 — Create `src/lib/site-url.ts`:** Use the Write tool. The directory `src/lib/` does not yet exist; the file creation should auto-create it. File contents:

```typescript
// src/lib/site-url.ts — env-aware base URL resolvers (D-26) + production branch check (D-29).
// Build-time only — consumed by src/components/SEO.astro and src/pages/robots.txt.ts.
//
// REVIEWS-MODE Concern 1 fix: split into resolveCanonicalBase() (ALWAYS apex)
// and resolveAssetBase() (MAY use preview hosts). Original `resolveSiteBase()`
// leaked preview hostnames into canonical/og:url, contradicting D-26 + SC5.
//
// REVIEWS-MODE Concern 7 fix: isProduction() now checks process.env AND
// import.meta.env AND PUBLIC_-prefixed variants AND a PUBLIC_DEPLOY_ENV escape
// hatch — covers all known Vite/Astro/Cloudflare env-exposure paths.
//
// Pattern lifted from src/pages/gallery/[slug].astro (Phase 2 — REVIEWS.md HIGH-4),
// generalized into a shared helper. Never assign at module top-level (Pitfall 2 —
// Vite would inline the value at build); always wrap env reads in a function so
// the value resolves against the actual build's env.

const APEX = 'https://studiobluemli.com';

/**
 * Resolve the CANONICAL base URL — always apex.
 *
 * Used by:
 *   - <link rel="canonical">
 *   - <meta property="og:url">
 *
 * NEVER consults CF_PAGES_URL / CF_WORKERS_URL / PUBLIC_SITE_URL — those would
 * leak preview hostnames into canonical, contradicting D-26 (canonical to apex
 * even on preview deploys) and Phase 3 SC5.
 *
 * Returns a URL WITHOUT trailing slash.
 */
export function resolveCanonicalBase(astroSite?: URL): string {
  const fromAstroSite = astroSite?.toString();
  if (fromAstroSite) return fromAstroSite.replace(/\/$/, '');
  return APEX;
}

/**
 * Resolve the ASSET base URL — preview-aware, used for absolute asset URLs.
 *
 * Used by:
 *   - <meta property="og:image"> (when an explicit override is needed for
 *     preview-deploy unfurls; v1 ships with og:image on apex too, but the
 *     helper is here for future flexibility per D-26 risk note)
 *   - any other absolute-URL emission that benefits from working on previews
 *
 * Precedence:
 *   1. CF_PAGES_URL      (legacy — Cloudflare Pages preview/production)
 *   2. CF_WORKERS_URL    (anticipated — Cloudflare Workers Builds preview hostname)
 *   3. PUBLIC_SITE_URL   (explicit override for non-CF environments)
 *   4. resolveCanonicalBase(astroSite)  (apex fallback — same as canonical)
 *
 * Returns a URL WITHOUT trailing slash.
 */
export function resolveAssetBase(astroSite?: URL): string {
  const fromEnv =
    import.meta.env.CF_PAGES_URL ??
    import.meta.env.CF_WORKERS_URL ??
    import.meta.env.PUBLIC_SITE_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  return resolveCanonicalBase(astroSite);
}

/**
 * True only when the build is producing the production deployment (main branch).
 * Used by src/pages/robots.txt.ts to gate Allow vs Disallow.
 *
 * REVIEWS-MODE Concern 7 hardening: check ALL known env-exposure paths.
 * Workers Builds may expose env vars via process.env (Node) OR import.meta.env
 * (Vite); PUBLIC_-prefixed variants are exposed to client by Vite. The
 * PUBLIC_DEPLOY_ENV escape hatch lets the operator force production via the
 * build command (e.g., `PUBLIC_DEPLOY_ENV=production npm run build`).
 *
 * In local dev (no signals set) returns false → robots.txt defaults to
 * `Disallow: /`, which is the safer side of any ambiguity.
 */
export function isProduction(): boolean {
  // process.env (Node-side, available during SSG/build)
  const procBranch = typeof process !== 'undefined' && process.env
    ? (process.env.WORKERS_CI_BRANCH ?? process.env.CF_PAGES_BRANCH)
    : undefined;
  if (procBranch === 'main') return true;

  const procDeployEnv = typeof process !== 'undefined' && process.env
    ? process.env.PUBLIC_DEPLOY_ENV
    : undefined;
  if (procDeployEnv === 'production') return true;

  // import.meta.env (Vite-side, available during build inline)
  const viteBranch =
    import.meta.env.WORKERS_CI_BRANCH ??
    import.meta.env.PUBLIC_WORKERS_CI_BRANCH ??
    import.meta.env.CF_PAGES_BRANCH;
  if (viteBranch === 'main') return true;

  const viteDeployEnv = import.meta.env.PUBLIC_DEPLOY_ENV;
  if (viteDeployEnv === 'production') return true;

  return false;
}
```

**Edit 2 — Update `package.json`:** Add two dependencies and one new script.

In the `"dependencies"` block, add (alphabetical placement):
```json
    "@astrojs/sitemap": "^3.7.2",
    "temporal-polyfill": "^0.3.2",
```

In the `"scripts"` block, add this line after `"prebuild:images": ...`:
```json
    "og:default": "node scripts/generate-og-default.mjs",
```

Preserve all other entries exactly. After the edits, validate JSON: `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` must exit 0.

**Edit 3 — Run `npm install`** to fetch the two new packages and regenerate `package-lock.json` (Concern 12).
  </action>
  <verify>
    <automated>npm install --silent 2>&1 | tail -5 && test -f src/lib/site-url.ts && grep -c "export function resolveCanonicalBase" src/lib/site-url.ts && grep -c "export function resolveAssetBase" src/lib/site-url.ts && grep -c "export function isProduction" src/lib/site-url.ts && node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))" && grep -c '@astrojs/sitemap' package.json && grep -c 'temporal-polyfill' package.json && grep -c '"og:default"' package.json && test -d node_modules/@astrojs/sitemap && test -d node_modules/temporal-polyfill</automated>
  </verify>
  <acceptance_criteria>
    - `test -f src/lib/site-url.ts` exits 0
    - `grep -c "export function resolveCanonicalBase" src/lib/site-url.ts` returns 1
    - `grep -c "export function resolveAssetBase" src/lib/site-url.ts` returns 1
    - `grep -c "export function isProduction" src/lib/site-url.ts` returns 1
    - `! grep -q "import.meta.env.CF_PAGES_URL" src/lib/site-url.ts && true` is FALSE — at least one match exists, but ONLY inside `resolveAssetBase` (verified by line-position check: the matched line MUST be inside the function body of resolveAssetBase, NOT inside resolveCanonicalBase). Easier programmatic check: verify resolveCanonicalBase contains zero `CF_PAGES_URL` / `CF_WORKERS_URL` references via `awk '/^export function resolveCanonicalBase/,/^}/' src/lib/site-url.ts | grep -cE 'CF_PAGES_URL|CF_WORKERS_URL'` → returns 0.
    - `grep -c "process.env.WORKERS_CI_BRANCH" src/lib/site-url.ts` returns at least 1 (Concern 7 hardening)
    - `grep -c "import.meta.env.WORKERS_CI_BRANCH" src/lib/site-url.ts` returns at least 1
    - `grep -c "PUBLIC_DEPLOY_ENV" src/lib/site-url.ts` returns at least 2 (the recommended Concern 7 escape hatch — checked in both process.env and import.meta.env)
    - `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` exits 0
    - `grep -c '@astrojs/sitemap' package.json` returns at least 1
    - `grep -c 'temporal-polyfill' package.json` returns at least 1
    - `grep -c '"og:default"' package.json` returns 1
    - `test -d node_modules/@astrojs/sitemap` exits 0
    - `test -d node_modules/temporal-polyfill` exits 0
    - `test -f package-lock.json` exits 0 (regenerated by npm install)
  </acceptance_criteria>
  <done>
    `src/lib/site-url.ts` is created with all three helpers (canonical/asset/isProduction), with the canonical/asset split implementing Concern 1 fix and the hardened `isProduction` implementing Concern 7 fix; the two new deps are installed; the `og:default` script is wired; `package.json` valid JSON; `package-lock.json` regenerated.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create scripts/generate-og-default.mjs and run it once to produce public/og-default.png</name>
  <read_first>
    - scripts/prebuild-images.mjs (lines 22-25 for sharp import; lines 91-118 for resize+save)
    - scripts/generate-favicons.mjs (one-shot pattern)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md Example 4
    - assets/logo/ (verify which SVG files exist; mark-coral.svg is preferred)
  </read_first>
  <behavior>
    - `scripts/generate-og-default.mjs` reads `assets/logo/mark-coral.svg` (fallback to `assets/logo/mark.svg`), composites it on a 1200x630 cream-colored canvas, and writes the result to `public/og-default.png`.
    - The generated PNG is exactly 1200x630, PNG format, with cream background (`#F5DCC7`).
    - The script logs a one-line success message on completion.
    - Wired to `npm run og:default`.
    - Idempotent — re-running overwrites the existing PNG byte-for-byte.
  </behavior>
  <action>
**Edit 1 — Create `scripts/generate-og-default.mjs`:** Use the Write tool. File contents:

```javascript
// scripts/generate-og-default.mjs — Phase 3 PAG-07 / D-27 path 3.
// One-shot generator: produces a 1200x630 logo-lockup PNG with the coral mark
// centered on a cream-100 background. Output committed to public/og-default.png
// so Cloudflare Static Assets serves it for the shared <SEO /> fallback.
//
// Re-run via `npm run og:default` if mark-coral.svg ever changes.
// Workerd never executes this script; sharp runs in Node (Phase 2 prebuild
// pipeline already depends on sharp 0.34.5).
import sharp from 'sharp';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');

const W = 1200;
const H = 630;
const CREAM_100 = '#F5DCC7'; // --cream-100 from src/styles/colors_and_type.css

// Pick the coral mark if available, fall back to the generic mark.
async function pickMark() {
  const candidates = [
    'assets/logo/mark-coral.svg',
    'assets/logo/mark.svg',
  ];
  for (const rel of candidates) {
    const abs = resolve(ROOT, rel);
    try {
      await access(abs, constants.R_OK);
      return abs;
    } catch {
      // try next
    }
  }
  throw new Error(`No mark SVG found. Looked for: ${candidates.join(', ')}`);
}

const markPath = await pickMark();
const markSvg = await readFile(markPath);

// Rasterize the mark at ~32% of canvas width (~384 px).
const markPng = await sharp(markSvg, { density: 384 })
  .resize({ width: Math.round(W * 0.32) })
  .png()
  .toBuffer();

const out = await sharp({
  create: { width: W, height: H, channels: 3, background: CREAM_100 },
})
  .composite([{ input: markPng, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toBuffer();

const outDir = resolve(ROOT, 'public');
await mkdir(outDir, { recursive: true });
const outPath = resolve(outDir, 'og-default.png');
await writeFile(outPath, out);

console.log(`og:default -> public/og-default.png (1200x630, source: ${markPath.replace(ROOT + '/', '')})`);
```

**Edit 2 — Run the script:** `npm run og:default`. Expected: script exits 0, `public/og-default.png` exists, success log prints the source path.

**Edit 3 — Verify dimensions:** `file public/og-default.png` output should contain `PNG image data, 1200 x 630`.

**Edit 4 — gitignore check:** Verify `public/og-default.png` is NOT excluded by any rule. The Phase 2 gitignore covers `public/gallery/` and the favicon set; this file is at the top level of `public/` and should be tracked. Run `git check-ignore public/og-default.png` — expected: exit code 1 (not ignored). If exit code 0, add `!public/og-default.png` to `.gitignore`.
  </action>
  <verify>
    <automated>test -f scripts/generate-og-default.mjs && grep -c "import sharp" scripts/generate-og-default.mjs && grep -c "1200" scripts/generate-og-default.mjs && grep -c "F5DCC7" scripts/generate-og-default.mjs && npm run og:default 2>&1 | tail -3 && test -f public/og-default.png && file public/og-default.png | grep -E "1200 x 630|1200x630"</automated>
  </verify>
  <acceptance_criteria>
    - `test -f scripts/generate-og-default.mjs` exits 0
    - `grep -c "import sharp" scripts/generate-og-default.mjs` returns 1
    - `grep -c "F5DCC7" scripts/generate-og-default.mjs` returns 1
    - `grep -c "1200" scripts/generate-og-default.mjs` returns at least 1
    - `npm run og:default` exits 0 and prints a message ending in `public/og-default.png`
    - `test -f public/og-default.png` exits 0
    - `file public/og-default.png` matches `PNG image data, 1200 x 630`
    - `wc -c < public/og-default.png` reports a positive byte count
    - Re-running `npm run og:default` produces byte-identical output (verified by `md5 public/og-default.png` before/after)
    - `git check-ignore public/og-default.png` exits 1 (file is NOT ignored)
  </acceptance_criteria>
  <done>
    `scripts/generate-og-default.mjs` exists, is idempotent, and produces `public/og-default.png` at 1200x630 with cream background and centered coral mark. The file is tracked by git.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Create src/components/SEO.astro (Concern 4: does NOT emit <title>; BaseLayout still owns it)</name>
  <read_first>
    - src/layouts/BaseLayout.astro (line 17 = current `<title>` line — STAYS per Concern 4; line 43 = `<slot name="head" />`)
    - src/pages/gallery/[slug].astro (the inline pattern being replaced)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md Pattern 3
    - .planning/phases/03-page-composition-pop-ups/03-PATTERNS.md (the "pick (a)" decision)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 4: keep BaseLayout's <title>; <SEO /> omits <title>)
    - src/content/site/config.yaml (the og_title + og_description defaults)
  </read_first>
  <behavior>
    - `src/components/SEO.astro` emits 9 head elements (NOT 10 — `<title>` is omitted per Concern 4): `<meta name="description">`, `<link rel="canonical">`, `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`, `<meta property="og:url">`, `<meta property="og:type">`, `<meta name="twitter:card">`, `<meta name="twitter:image">`.
    - Props: `title` (optional, used ONLY for og:title; defaults to `site.og_title`), `description` (optional, falls back to `site.og_description`), `ogImage` (optional, falls back to `${canonicalBase}/og-default.png`), `pathname` (optional, default `/`).
    - The canonical URL + og:url are always built from `resolveCanonicalBase(Astro.site)` + pathname (Concern 1: ALWAYS apex).
    - The og:image is always emitted as an ABSOLUTE URL (Pitfall 14). For v1 we use `resolveCanonicalBase` (apex) — this is the safer default. The `resolveAssetBase` helper exists but is reserved for the gallery page's per-piece og:image override (where the executor passes the explicit absolute URL via the `ogImage` prop).
    - BaseLayout.astro is NOT touched in this plan — it continues to emit `<title>{title}</title>` (Concern 4).
  </behavior>
  <action>
**Edit 1 — Create `src/components/SEO.astro`:** Use the Write tool.

**CRITICAL Concern 9 transcription rule:** the `---` frontmatter delimiter lines in the code block below are shown with ONE leading space — that is a markdown-rendering safety device to prevent the GSD frontmatter parser from latching on. When you write the actual `.astro` file, STRIP that leading space so the `---` delimiters land at column 0. The Astro parser requires column-0 delimiters; with the leading space they will fail to parse.

File contents (copy the contents BETWEEN the triple-backtick markers; the ` ---` lines shown with one leading space — this is the GSD-parser-safety convention noted above — must be written to the file as `---` at column 0):

```astro
 ---
// src/components/SEO.astro — Phase 3 PAG-07 / D-26.
// Per-page SEO meta emitter. Consumed via `<SEO slot="head" ... />` from each
// .astro page. Outputs land in BaseLayout's <slot name="head" />.
//
// REVIEWS-MODE Concern 1 fix: canonical + og:url ALWAYS use resolveCanonicalBase()
// (apex). Never leak preview hostnames.
//
// REVIEWS-MODE Concern 4 fix: <title> is NOT emitted here. BaseLayout.astro
// continues to own <title>{title}</title> via its existing `title` prop. Each
// page passes its title to BaseLayout the same way it always has. SEO.astro
// only adds canonical, description, og/twitter meta. This is the
// least-blast-radius choice and matches the PATTERNS.md "pick (a)" decision.
//
// Defaults: og_title + og_description from src/content/site/config.yaml.
// Default og:image: /og-default.png on apex (D-27 path 3).

import { getEntry } from 'astro:content';
import { resolveCanonicalBase } from '../lib/site-url';

interface Props {
  /** Page title for og:title. Optional — falls back to site.og_title. */
  title?:       string;
  /** Plain-text description. Falls back to site.og_description. */
  description?: string;
  /** ABSOLUTE URL to the og:image. Falls back to ${canonicalBase}/og-default.png. */
  ogImage?:    string;
  /** Path of the current page. Defaults to "/". */
  pathname?:   string;
}

const { title, description, ogImage, pathname = '/' } = Astro.props;

const site = (await getEntry('site', 'default'))!.data;
const canonicalBase = resolveCanonicalBase(Astro.site);

const canonical    = `${canonicalBase}${pathname === '/' ? '' : pathname}`;
const ogImageAbs   = ogImage ?? `${canonicalBase}/og-default.png`;
const finalDesc    = description ?? site.og_description;
const finalOgTitle = title ?? site.og_title;
 ---
<meta name="description" content={finalDesc} />

<link rel="canonical" href={canonical} />

<meta property="og:title"       content={finalOgTitle} />
<meta property="og:description" content={finalDesc} />
<meta property="og:image"       content={ogImageAbs} />
<meta property="og:url"         content={canonical} />
<meta property="og:type"        content="website" />

<meta name="twitter:card"  content="summary_large_image" />
<meta name="twitter:image" content={ogImageAbs} />
```

**Edit 2 — `src/layouts/BaseLayout.astro` is NOT touched in this plan (Concern 4 reconciliation).** The file continues to emit `<title>{title}</title>` and the `interface Props { title: string; }` declaration. Every existing page caller continues to pass `title` to BaseLayout via the `<BaseLayout title="...">` opening tag. **Verify after this task: `grep -c '<title>{title}</title>' src/layouts/BaseLayout.astro` returns 1 (the line MUST still exist).**

**Anti-pattern checks:**
- The created `src/components/SEO.astro` MUST NOT emit a `<title>` tag (Concern 4). Verify: `grep -c '<title>' src/components/SEO.astro` returns 0.
- The frontmatter `---` delimiters MUST start at column 0 (Concern 9). Verify: `grep -nE '^[[:space:]]+---$' src/components/SEO.astro` returns no output (no indented `---` lines).
  </action>
  <verify>
    <automated>test -f src/components/SEO.astro && grep -c "twitter:card" src/components/SEO.astro && (grep -c "og:image" src/components/SEO.astro) && grep -cE 'rel="canonical"' src/components/SEO.astro && grep -c "resolveCanonicalBase" src/components/SEO.astro && grep -c '<title>{title}</title>' src/layouts/BaseLayout.astro && grep -c 'slot name="head"' src/layouts/BaseLayout.astro && (grep -c '<title>' src/components/SEO.astro || true) && (grep -nE '^[[:space:]]+---$' src/components/SEO.astro || true)</automated>
  </verify>
  <acceptance_criteria>
    - `test -f src/components/SEO.astro` exits 0
    - `grep -c "twitter:card" src/components/SEO.astro` returns 1
    - `grep -c '<meta property="og:image"' src/components/SEO.astro` returns 1
    - `grep -cE 'rel="canonical"' src/components/SEO.astro` returns 1
    - `grep -c "resolveCanonicalBase" src/components/SEO.astro` returns 1 (Concern 1: canonical uses canonical-base helper)
    - `! grep -q "resolveAssetBase" src/components/SEO.astro` exits 0 (Concern 1: SEO.astro does NOT use asset base for canonical/og:url; per-piece og:image overrides flow in via the `ogImage` prop)
    - `! grep -q '<title>' src/components/SEO.astro` exits 0 (Concern 4: SEO.astro does NOT emit `<title>`)
    - `grep -c '<title>{title}</title>' src/layouts/BaseLayout.astro` returns 1 (Concern 4: BaseLayout still owns `<title>`)
    - `grep -c 'slot name="head"' src/layouts/BaseLayout.astro` returns 1 (the slot stays — wiring point for SEO.astro)
    - `grep -nE '^[[:space:]]+---$' src/components/SEO.astro` returns no output (Concern 9: no indented frontmatter delimiters)
    - `grep -c '^---$' src/components/SEO.astro` returns 2 (exactly two column-0 `---` lines bracketing the frontmatter)
  </acceptance_criteria>
  <done>
    `src/components/SEO.astro` exists with the 9-head-element emission contract (no `<title>`, no preview-host leak in canonical); BaseLayout.astro still owns `<title>`; the `<slot name="head" />` remains untouched as the injection point. Frontmatter delimiters at column 0.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Add @astrojs/sitemap integration to astro.config.mjs, create src/pages/robots.txt.ts, and wire <SEO /> into gallery.astro + gallery/[slug].astro</name>
  <read_first>
    - astro.config.mjs (the existing `integrations: [react()]` array, currently at line 19)
    - src/pages/gallery.astro (entire file — adding `<SEO />`)
    - src/pages/gallery/[slug].astro (lines 43-52 = inline env-aware ogBase block to delete; line 67 = inline `<meta slot="head" property="og:image">` to replace with `<SEO />`)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md Example 2 (robots.txt) and Q5 (sitemap integration)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 1: gallery uses resolveAssetBase for per-piece og:image)
  </read_first>
  <behavior>
    - `astro.config.mjs` imports `@astrojs/sitemap` and adds `sitemap()` to the `integrations` array. No options needed.
    - `src/pages/robots.txt.ts` is a new Astro endpoint that declares `prerender = true` and branches its `GET` body on `isProduction()`.
    - `src/pages/gallery.astro` adds `<SEO slot="head" title="Gallery — Studio Bluemli" pathname="/gallery" />` immediately inside `<BaseLayout>`.
    - `src/pages/gallery/[slug].astro` removes the inline `ogBase`/`ogImageUrl` block (lines 43-52), imports `<SEO />` + `resolveAssetBase`, and replaces the `<meta slot="head">` (line 67) with `<SEO slot="head" title={...} description={description} ogImage={...} pathname={...} />`. Per-piece og:image MAY use the asset base (for preview-deploy unfurls).
    - Build succeeds; `dist/client/robots.txt` exists; `dist/client/sitemap-index.xml` + `dist/client/sitemap-0.xml` exist.
  </behavior>
  <action>
**Edit 1 — `astro.config.mjs`:** Add the sitemap import and integration. Use the Edit tool.

At the top of the file, after the existing `import react from '@astrojs/react';` line, add:
```javascript
import sitemap from '@astrojs/sitemap';
```

In the `integrations: [react()],` line (currently around line 19), change to:
```javascript
  integrations: [react(), sitemap()],
```

Preserve all other config (`site`, `output: 'server'`, `adapter: cloudflare({})`, `image: { service: passthroughImageService() }`, the `fonts: [...]` array with 3 entries after Plan 01).

**Edit 2 — Create `src/pages/robots.txt.ts`:** Use the Write tool. File contents:

```typescript
// src/pages/robots.txt.ts — Phase 3 PAG-08 / D-29.
// Env-aware robots.txt:
//   - Production (main branch): Allow: / + sitemap reference.
//   - Preview / workers.dev / local dev: Disallow: /
//
// Astro emits this to dist/client/robots.txt because of `prerender = true`
// (Pitfall 4: without this flag, output:'server' makes /robots.txt hit the
// Worker on every request, defeating static-first goals).
//
// REVIEWS-MODE Concern 7: isProduction() in src/lib/site-url.ts now hardens
// against missing env-var exposure paths (process.env vs import.meta.env vs
// PUBLIC_-prefixed). Manual fallback: set PUBLIC_DEPLOY_ENV=production in the
// Cloudflare build command if WORKERS_CI_BRANCH ever becomes unreachable.

import type { APIRoute } from 'astro';
import { isProduction } from '../lib/site-url';

export const prerender = true;

export const GET: APIRoute = () => {
  const body = isProduction()
    ? 'User-agent: *\nAllow: /\nSitemap: https://studiobluemli.com/sitemap-index.xml\n'
    : 'User-agent: *\nDisallow: /\n';

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

**Edit 3 — `src/pages/gallery.astro`:** Use the Edit tool. Add the `<SEO />` import and tag.

In the frontmatter (after the existing `import Footer from '../components/design-skill/Footer';` line), ADD:
```typescript
import SEO from '../components/SEO.astro';
```

In the body, immediately INSIDE the `<BaseLayout title="Gallery — Studio Bluemli">` opening tag and BEFORE the existing `<Header slot="header" active="/gallery" />`, ADD:
```astro
  <SEO slot="head" title="Gallery — Studio Bluemli" pathname="/gallery" />
```

Do NOT touch any other line. The empty-state branch, the GalleryGrid call, the Footer, the `<style is:global>` block with card-status colors, AND the existing `<BaseLayout title="...">` (which still drives the `<title>` tag via BaseLayout per Concern 4) — all unchanged.

**Edit 4 — `src/pages/gallery/[slug].astro`:** Use the Edit tool. Three sub-edits:

(a) Add imports — after the existing `import manifestJson from '../../../public/gallery/_manifest.json';` line, ADD:
```typescript
import SEO from '../../components/SEO.astro';
import { resolveAssetBase } from '../../lib/site-url';
```

Note: this uses `resolveAssetBase` (NOT `resolveCanonicalBase`) because per-piece og:image is the one place where preview-deploy hostnames are useful for IG/iMessage unfurl testing. The canonical/og:url for the page itself still goes to apex via `<SEO />`.

(b) Replace the inline env-aware block — DELETE lines 43-52 currently reading:
```typescript
// REVIEWS.md HIGH-4: env-aware og:image base URL.
// Order of resolution:
//   1. CF_PAGES_URL / CF_WORKERS_URL  (Cloudflare-injected preview/deploy hostname)
//   2. PUBLIC_SITE_URL                (explicit override for non-CF environments)
//   3. Astro.site                     (apex configured in astro.config.mjs — production)
const ogBase = import.meta.env.CF_PAGES_URL
            ?? import.meta.env.CF_WORKERS_URL
            ?? import.meta.env.PUBLIC_SITE_URL
            ?? Astro.site?.toString().replace(/\/$/, '');
const ogImageUrl = `${ogBase}/gallery/${slug}/hero-800.webp`;
```

REPLACE with:
```typescript
// PAG-07: og:image base URL via resolveAssetBase (preview-aware — per-piece og:image
// MAY use preview hostnames for IG/iMessage unfurl testing). The page's canonical/og:url
// still goes to apex via <SEO /> + resolveCanonicalBase.
const ogImageUrl = `${resolveAssetBase(Astro.site)}/gallery/${slug}/hero-800.webp`;
```

(c) Replace the inline `<meta slot="head">` (line 67) with `<SEO />`:

Current line 67:
```astro
  <meta slot="head" property="og:image" content={ogImageUrl} />
```

Replace with:
```astro
  <SEO slot="head"
       title={`${name} — Studio Bluemli`}
       description={description}
       ogImage={ogImageUrl}
       pathname={`/gallery/${slug}`} />
```

Do NOT touch any of the page body, the `<style>` block, the `getStaticPaths()` function, or the manifest import. Status/CTA logic + the rest of the page is unchanged. The existing `<BaseLayout title="...">` continues to drive the `<title>` tag via BaseLayout (Concern 4).
  </action>
  <verify>
    <automated>grep -c "import sitemap from '@astrojs/sitemap'" astro.config.mjs && grep -c "sitemap()" astro.config.mjs && test -f src/pages/robots.txt.ts && grep -c "export const prerender = true" src/pages/robots.txt.ts && grep -c "isProduction()" src/pages/robots.txt.ts && grep -c "import SEO" src/pages/gallery.astro && grep -c '<SEO slot="head"' src/pages/gallery.astro && grep -c "import SEO" src/pages/gallery/\[slug\].astro && grep -c "resolveAssetBase" src/pages/gallery/\[slug\].astro && (grep -c '<meta slot="head" property="og:image"' src/pages/gallery/\[slug\].astro || true) && npm run build 2>&1 | tail -10 && test -f dist/client/robots.txt && test -f dist/client/sitemap-index.xml && test -f dist/client/sitemap-0.xml</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "import sitemap from '@astrojs/sitemap'" astro.config.mjs` returns 1
    - `grep -c "sitemap()" astro.config.mjs` returns 1
    - `test -f src/pages/robots.txt.ts` exits 0
    - `grep -c "export const prerender = true" src/pages/robots.txt.ts` returns 1
    - `grep -c "isProduction()" src/pages/robots.txt.ts` returns 1
    - `grep -c "import SEO" src/pages/gallery.astro` returns 1
    - `grep -c '<SEO slot="head"' src/pages/gallery.astro` returns 1
    - `grep -c "import SEO" src/pages/gallery/\[slug\].astro` returns 1
    - `grep -c "resolveAssetBase" src/pages/gallery/\[slug\].astro` returns 1 (Concern 1: per-piece og:image uses asset base, NOT canonical base)
    - `! grep -q '<meta slot="head" property="og:image"' src/pages/gallery/\[slug\].astro` exits 0 (the inline meta was replaced)
    - `npm run build` exits 0
    - `test -f dist/client/robots.txt` exits 0
    - `test -f dist/client/sitemap-index.xml` exits 0
    - `test -f dist/client/sitemap-0.xml` exits 0
    - `grep -c '<loc>https://studiobluemli.com/gallery/' dist/client/sitemap-0.xml` returns at least 1 (gallery slug entries present, ALL apex)
    - On local dev (no WORKERS_CI_BRANCH set), `dist/client/robots.txt` contains `Disallow: /` (the isProduction-false branch)
    - **Concern 1 verification — preview build does NOT leak preview host into canonical:** simulate by running `CF_PAGES_URL=https://preview.example.workers.dev npm run build 2>&1 | tail -5 && grep -rh 'rel="canonical"' dist/client/*.html dist/client/**/*.html 2>/dev/null | grep -c 'studiobluemli.com'` returns at least 1 (canonical points to apex on preview build); and `grep -rh 'rel="canonical"' dist/client/ 2>/dev/null | grep -c 'preview.example.workers.dev'` returns 0 (no preview host in canonical).
  </acceptance_criteria>
  <done>
    `@astrojs/sitemap` is integrated; `robots.txt.ts` is wired; the two gallery pages now consume `<SEO />`; per-piece og:image uses `resolveAssetBase` (preview-aware); page canonical/og:url uses apex via `<SEO />`'s internal `resolveCanonicalBase`. A production build produces `robots.txt`, `sitemap-index.xml`, `sitemap-0.xml`, and all 5 routes + gallery slugs are present in the sitemap with apex URLs.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 5: Update .planning/REQUIREMENTS.md, .planning/PROJECT.md, and .planning/ROADMAP.md (D-19, D-23, plus Concern 6 doc consistency)</name>
  <read_first>
    - .planning/REQUIREMENTS.md (the current structure: Foundation / Content & Gallery / Pages & Composition / Contact Form & Deliverability / Launch & Operations sections, then `Out of Scope (v1)`, then `Traceability`)
    - .planning/PROJECT.md (the Active section line 33 references "Say Hi page with a contact form"; the Out of Scope list does NOT yet mention the contact form; line 30 references the landing pop-up callout but does not reflect D-03 empty-state change)
    - .planning/ROADMAP.md (Phase 3 section starting around line 84; SC1 narrative line 89 references the empty-state line; SC3 line 91 references "process/craft shots"; key risks section line 108-113 references the lock and process shots)
    - .planning/phases/03-page-composition-pop-ups/03-CONTEXT.md (D-19, D-23 specifics; D-03, D-14 narrative impact)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 6: PROJECT + ROADMAP doc updates needed alongside REQUIREMENTS)
  </read_first>
  <behavior>
    - **REQUIREMENTS.md:** "Contact Form & Deliverability" section heading is REMOVED; all 11 CON-NN bullets removed; new entries added to Out of Scope; PAG-06 narrative rewritten per D-23; Traceability table CON-NN rows removed.
    - **PROJECT.md:** Active section line about Say Hi rewritten (no contact form); Out of Scope adds the contact-form bullet; Active section's landing line clarified to mention the empty-state divergence per D-03; the About line acknowledges D-14 (no dedicated process shots).
    - **ROADMAP.md Phase 3:** SC1 narrative reflects D-03 (landing omits section on zero upcoming); SC3 narrative reflects D-14 (gallery hero photos, not bench shots); the phase Goal narrative + key risks reflect the same divergences.
    - Phase 4 entry in ROADMAP is NOT touched by this plan (D-20: separate `/gsd-phase` operation owns Phase 4 removal).
  </behavior>
  <action>
**Edit 1 — `.planning/REQUIREMENTS.md`:** Use the Edit tool.

(a) Find the section header `### Contact Form & Deliverability` (line 53 in current file) and DELETE the entire section: that heading line + the blank line after it + all 11 bullet lines (`- [ ] **CON-01**: ...` through `- [ ] **CON-11**: ...`, currently lines 55-65 in the file) + the trailing blank line. The result: nothing between `### Pages & Composition`'s last bullet (`- [ ] **PAG-09**: All product images have alt text...`) and the next section header `### Launch & Operations`.

(b) Find the PAG-06 bullet (line 48 in current file):
```markdown
- [ ] **PAG-06**: Say Hi page (`/say-hi`) renders the contact form (CON-* requirements below) plus visible Instagram and `mailto:` fallback links
```

Replace with (D-23 narrative):
```markdown
- [ ] **PAG-06**: Say Hi page (`/say-hi`) renders a visible Instagram DM link (`https://ig.me/m/studiobluemli`) plus a `mailto:hi@studiobluemli.com` fallback link. The v1 contact form is dropped (D-18, D-19); a `<form>` is NOT shipped on this page in v1.
```

(c) In the `## Out of Scope (v1)` section (currently starting around line 80 of the file), ADD a new bullet at the top of the list (immediately after the section header and intro line). Insert these two bullets:

```markdown
- **Contact form (`<form>` element + `/api/contact` Worker route + Turnstile + KV rate limit + Resend integration + SPF/DKIM/DMARC DNS coexistence with MS365)** — dropped from v1 entirely per Phase 3 D-18/D-19. `/say-hi` ships as an IG-DM-link page + mailto fallback. The 11 CON-NN requirements (CON-01..CON-11) that previously specified this surface are moved here. Can return as a v1.x phase if the IG-only contact channel ever stops scaling. `wrangler.jsonc`'s `run_worker_first: ["/api/*"]` reservation and `astro.config.mjs`'s `output: 'server'` are preserved (D-22) so the rewiring cost is minimal.
- **CON-01..CON-11 (formerly in §Contact Form & Deliverability)** — POST `/api/contact` endpoint, Turnstile siteverify, honeypot field, KV per-IP rate limit, Resend send-from-domain, MS365 DNS coexistence, deliverability smoke test, secrets via `wrangler secret put`, separate preview/production Resend keys, progressive enhancement, inline confirmation/error. All deferred along with the contact form per the above bullet.
```

(d) In the Traceability table at the bottom of the file (lines ~150-160 of the file), DELETE all 11 rows that have CON-NN in the first column. These are the lines that currently look like:
```markdown
| CON-01 | Phase 4: Contact Form & Deliverability | SC1 (real submission lands ...) |
```
through:
```markdown
| CON-11 | Phase 4: Contact Form & Deliverability | SC1 (inline confirmation ...) |
```

The remaining rows (FND-NN, CNT-NN, PAG-NN, LCH-NN) are unchanged.

**Edit 2 — `.planning/PROJECT.md`:** Use the Edit tool. Three updates (per Concern 6 + D-03 + D-14 + D-18):

(a) The Active section currently has these stale lines (match each line verbatim — do not rely on line numbers, the file may have shifted):
```markdown
- [ ] Landing page with hero (logo, tagline, founder photo or product hero), 3–6 featured gallery pieces, a callout for the next pop-up, and footer links _(Phase 1 shipped the demo-loaded shell; Phase 2 wired the featured-piece grid to real content; Phase 3 composes the remaining hero/pop-up/footer copy.)_
- [ ] Pop-ups page showing upcoming events prominently (date, location, time) and a smaller archive of past events _(Phase 3 — PT-aware past/upcoming split with daily cron rebuild.)_
- [ ] About page (founder story, studio, process — content TBD with founder) _(Phase 3.)_
- [ ] Say Hi page with a contact form that emails the founder, plus visible Instagram link _(Phase 1 shipped the shell; Phase 4 wires `/api/contact` with Turnstile + KV rate limit + Resend.)_
```

Replace those four lines with:
```markdown
- [ ] Landing page with hero, 3 featured gallery pieces, an OPTIONAL "next pop-up" mini-callout (omitted entirely when no future popup exists per Phase 3 D-03), and footer links _(Phase 1 shipped the demo-loaded shell; Phase 2 wired the featured-piece grid to real content; Phase 3 composes the remaining hero/pop-up/footer copy.)_
- [ ] Pop-ups page showing upcoming events prominently (date, location, time) and a smaller text-only archive of past events _(Phase 3 — PT-aware past/upcoming split with daily cron rebuild.)_
- [ ] About page (founder story, studio, process — content drafted by Claude in brand voice, founder edits via GitHub web UI later; closing photo strip reuses 1–3 existing gallery hero WebPs per Phase 3 D-14 — dedicated process/craft shots deferred to v1.x) _(Phase 3.)_
- [ ] Say Hi page with visible Instagram DM link + mailto fallback _(Phase 3 D-18: contact form dropped from v1; revisit as v1.x phase if IG channel stops scaling.)_
```

Also locate the existing bullet that begins `- [ ] Contact form is spam-protected (Cloudflare Turnstile)` (verbatim text match) and REMOVE it entirely (it conflicts with D-18; the form is no longer in v1).

(b) The Out of Scope section (lines 41-52). Append this new bullet at the END of the list (after the existing "Multiple authors / contributor flow — founder is the only editor" line):
```markdown
- Contact form on `/say-hi` (`<form>` + `/api/contact` Worker + Turnstile + KV rate limit + Resend + SPF/DKIM/DMARC DNS coexistence with MS365) — dropped from v1 entirely per Phase 3 D-18/D-19. `/say-hi` ships as an IG-DM-link page + mailto fallback. Can return as a v1.x phase. `wrangler.jsonc`'s `run_worker_first: ["/api/*"]` and `astro.config.mjs`'s `output: 'server'` are preserved (D-22) so the rewiring cost is minimal.
```

(c) Verify the result: Active section no longer claims the Say Hi contact form is in scope; Active landing line acknowledges the optional callout; Active about line acknowledges the gallery-photo strip; Out of Scope section explicitly lists the contact-form deferral.

**Edit 3 — `.planning/ROADMAP.md` Phase 3 section** (lines 84-113). Use the Edit tool. Three sub-edits, all confined to the Phase 3 section between `### Phase 3: Page Composition & Pop-ups` and `### Phase 4: Contact Form & Deliverability`. **Do NOT touch Phase 4 — that's a separate /gsd-phase operation per D-20.**

(a) The Phase 3 Goal line (line 85) currently reads:
```markdown
**Goal**: All five pages render their real content on preview — landing (hero + next-pop-up callout + featured pieces), gallery (from Phase 2), popups (timezone-correct upcoming + past archive, auto-refreshing daily), about (written portrait + process shots), say-hi (form shell + IG + mailto fallbacks) — with per-page SEO meta and a published sitemap.
```

Replace with:
```markdown
**Goal**: All five pages render their real content on preview — landing (hero + OPTIONAL mini-callout for the next pop-up, omitted on zero upcoming per D-03 + 3 featured pieces + footer), gallery (from Phase 2), popups (timezone-correct upcoming + past archive, auto-refreshing daily), about (written portrait + closing photo strip reusing gallery hero WebPs per D-14), say-hi (Instagram DM link + mailto fallback, no form per D-18) — with per-page SEO meta and a published sitemap.
```

(b) SC1 (line 89) currently reads:
```markdown
  1. Landing page shows the hero, the next-upcoming pop-up callout (or the empty-state line "no pop-ups on the calendar right now — DM me on Instagram" when no future pop-up exists), 3–6 featured gallery pieces, and the footer — all populated from content collections.
```

Replace with:
```markdown
  1. Landing page shows the hero, a mini-callout for the next-upcoming pop-up (per D-02; OMITTED entirely when no future pop-up exists per D-03 — no eyebrow, no copy, no empty-state line), 3 featured gallery pieces (per D-04), and the footer — all populated from content collections.
```

(c) SC3 (line 91) currently reads:
```markdown
  3. The About page renders a first-person written portrait with hand-font headline and signature close, plus 1–3 process/craft shots (hands, beads, bench — no founder face), with no empty "press" or "as featured in" placeholders.
```

Replace with:
```markdown
  3. The About page renders a first-person written portrait with hand-font headline and the "made with love from NOPA ♡" signature close (D-16), plus a closing photo strip of 1–3 gallery hero WebPs (per D-14 — dedicated process/craft shots deferred to v1.x; the no-founder-face rule stays intact since gallery photos don't show the founder), with no empty "press" or "as featured in" placeholders.
```

(d) The "Key risks / pitfalls" section (lines 108-113) currently includes:
```markdown
- Process/craft shots availability — LOCKED ("process / craft shots" decided for About); confirm during plan-phase whether the founder has already shot these or needs to shoot them before the phase can sign off.
```

Replace with:
```markdown
- Process/craft shots availability — SOFTENED in Phase 3 planning (D-14): the founder doesn't currently have dedicated bench/hands/beads photos; the About page reuses 1–3 existing gallery hero WebPs as the closing visual flourish. Real bench shots can be swapped in later via a small follow-up commit by the founder via the GitHub web UI when the photos exist. The no-founder-face lock is preserved.
```

Also, after the existing "Empty placeholders — if the founder has no real press..." bullet (currently the last bullet in the Phase 3 risks list), ADD a new bullet:
```markdown
- Contact form scope cut (Phase 3 D-18) — `/say-hi` ships in v1 as an IG-DM-link page + mailto fallback only. The Phase 4 (Contact Form & Deliverability) entry in this ROADMAP is removed via a separate `/gsd-phase` operation after Phase 3 completes (per D-20); Phase 5's `Depends on` is updated by that same operation. Phase 3 plans do not edit the Phase 4 ROADMAP entry directly.
```

**Verify the result:** the Phase 3 SC1, SC3, Goal, and key risks reflect D-03/D-14/D-16/D-18; Phase 4 entry is byte-unchanged.

**Cross-cutting verification (all three docs):**
- `! grep -q "Say Hi page with a contact form" .planning/PROJECT.md` exits 0 (the stale Active line is gone)
- `grep -c "next-upcoming pop-up" .planning/ROADMAP.md` returns at least 1 (the SC1 rewrite landed)
- `grep -c "v1 contact form is dropped" .planning/REQUIREMENTS.md` returns 1 (the PAG-06 narrative)
- ROADMAP Phase 4 section is unchanged: `awk '/^### Phase 4:/,/^### Phase 5:/' .planning/ROADMAP.md` produces the same content as before this plan (no edits to Phase 4 — D-20 separate op).

(e) **Do NOT** touch Phase 4 in ROADMAP — Phase 4 removal is a separate `/gsd-phase` operation per D-20. Phase 3 plans must not edit ROADMAP.md's Phase 4 section.

(f) **Do NOT** add a "Last updated" timestamp change or touch the introductory note at the top of REQUIREMENTS.md. The structure stays; only the enumerated edits above happen.

Verify the file is still well-formed Markdown:
- The four level-3 headings under the `## v1 Requirements` block are now: Foundation, Content & Gallery, Pages & Composition, Launch & Operations (in that order, with Contact Form & Deliverability REMOVED).
- The PAG-06 bullet contains the phrase "v1 contact form is dropped".
- The Out of Scope section contains "Contact form (`<form>`" near the top.
  </action>
  <verify>
    <automated>(grep -c "^### Contact Form" .planning/REQUIREMENTS.md || true) && (grep -cE "^- \[ \] \*\*CON-" .planning/REQUIREMENTS.md || true) && grep -c "v1 contact form is dropped" .planning/REQUIREMENTS.md && grep -c "Contact form (\`<form>\`" .planning/REQUIREMENTS.md && (grep -cE "^\| CON-[0-9]+" .planning/REQUIREMENTS.md || true) && (grep -c "Say Hi page with a contact form" .planning/PROJECT.md || true) && grep -c "Contact form on \`/say-hi\`" .planning/PROJECT.md && grep -c "next-upcoming pop-up" .planning/ROADMAP.md && grep -c "made with love from NOPA" .planning/ROADMAP.md</automated>
  </verify>
  <acceptance_criteria>
    - `! grep -q "^### Contact Form" .planning/REQUIREMENTS.md` exits 0 (heading removed)
    - `! grep -qE "^- \[ \] \*\*CON-" .planning/REQUIREMENTS.md` exits 0 (no active CON bullets)
    - `grep -c "v1 contact form is dropped" .planning/REQUIREMENTS.md` returns 1 (the new PAG-06 narrative)
    - `grep -c '<form>' .planning/REQUIREMENTS.md` returns at least 1 (the Out of Scope explanation references it)
    - `! grep -qE "^\| CON-[0-9]+" .planning/REQUIREMENTS.md` exits 0 (no CON rows in the traceability table)
    - `grep -cE "^\| PAG-0[0-9]" .planning/REQUIREMENTS.md` returns 9 (PAG-01..PAG-09 traceability rows preserved)
    - `grep -cE "^- \[ \] \*\*PAG-06\*\*" .planning/REQUIREMENTS.md` returns 1 (PAG-06 bullet exists, with the new narrative)
    - **Concern 6 — PROJECT.md edits:**
      - `! grep -q "Say Hi page with a contact form" .planning/PROJECT.md` exits 0 (stale Active line gone)
      - `grep -c "Contact form on \`/say-hi\`" .planning/PROJECT.md` returns 1 (Out of Scope addition)
      - `grep -c "Phase 3 D-18" .planning/PROJECT.md` returns at least 1 (D-18 referenced in narrative)
      - `grep -c "OPTIONAL .next pop-up. mini-callout" .planning/PROJECT.md` returns at least 1 (D-03 narrative reflected in landing line — note `.` matches any char including hyphen)
    - **Concern 6 — ROADMAP Phase 3 narrative:**
      - `grep -c "next-upcoming pop-up" .planning/ROADMAP.md` returns at least 1 (SC1 rewrite landed)
      - `grep -c "made with love from NOPA" .planning/ROADMAP.md` returns at least 1 (SC3 D-16 reference)
      - `grep -c "D-14" .planning/ROADMAP.md` returns at least 1 (D-14 referenced in About narrative)
      - `grep -c "D-18" .planning/ROADMAP.md` returns at least 1 (D-18 referenced in scope-cut risk note)
    - **Phase 4 ROADMAP section unchanged:** `git diff .planning/ROADMAP.md | grep -cE '^\+.*Phase 4:|^\-.*Phase 4:'` returns 0 (no diff lines touching the Phase 4 heading region — D-20 owns Phase 4 removal)
    - ROADMAP.md is changed by THIS task ONLY in the Phase 3 narrative — `git diff .planning/ROADMAP.md` shows changes only between `### Phase 3:` and `### Phase 4:` line markers
  </acceptance_criteria>
  <done>
    REQUIREMENTS.md has the Contact Form section removed, CON-* bullets and traceability rows gone, PAG-06 narrative rewritten per D-23, and the Out of Scope section explicitly documents the v1 contact-form deferral. PROJECT.md Active + Out of Scope updated for the no-form scope cut + landing empty-state + About imagery divergence (Concern 6). ROADMAP Phase 3 narrative updated for D-03 + D-14 + D-16 + D-18; Phase 4 entry untouched (D-20 separate op).
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Build-time -> Static asset | The og:image PNG and the robots.txt body are generated at build time and served as untrusted static text/image by Cloudflare Static Assets. No request-time code path; no user input crosses any boundary in Phase 3 Plan 02. |
| Build env (CI vars) -> source | `WORKERS_CI_BRANCH`, `CF_PAGES_URL` and friends are read from the build environment in `src/lib/site-url.ts`. These vars are set by Cloudflare's build infrastructure and not by external request input. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-02-01 | Spoofing | `src/components/SEO.astro` canonical URL | mitigate | **REVIEWS-MODE Concern 1 fix:** canonical URL is built ONLY from `resolveCanonicalBase(Astro.site)` which never consults preview env vars. Even if `CF_PAGES_URL` were spoofed by a malicious build, canonical still resolves to apex. The hardcoded `APEX = 'https://studiobluemli.com'` constant is the absolute fallback. |
| T-03-02-02 | Information Disclosure | `src/pages/robots.txt.ts` on preview | mitigate | **REVIEWS-MODE Concern 7 hardening:** `isProduction()` now checks `process.env`, `import.meta.env`, `PUBLIC_`-prefixed variants, and a `PUBLIC_DEPLOY_ENV` escape hatch — eliminates the brittleness where Vite might not expose `WORKERS_CI_BRANCH`. Preview deploys emit `Disallow: /` (default-safe-side behavior). |
| T-03-02-03 | Information Disclosure | Sitemap leakage | accept | Sitemap is canonical to apex (Astro.site is hardcoded `https://studiobluemli.com`). On preview builds the sitemap still references apex URLs, which is intentional per D-26. Combined with T-03-02-02's `Disallow: /` on previews, indexing is closed off; the sitemap itself is public-by-design. |
| T-03-02-04 | Tampering | `public/og-default.png` | accept | The PNG is committed to git; tampering requires write access to the repo, which is the same trust boundary as the source code itself. Re-generation via `npm run og:default` is idempotent and reproducible from source SVGs. |
| T-03-02-05 | Malicious Code (V10) | `@astrojs/sitemap`, `temporal-polyfill` | mitigate | `@astrojs/sitemap` is an official Astro-org integration (publisher: withastro). `temporal-polyfill` is FullCalendar's maintained Temporal subset (publisher: fullcalendar). Both have integrity hashes locked in `package-lock.json` after the npm install in Task 1. |
</threat_model>

<verification>
End-to-end verification after all 5 tasks complete:

```bash
# 1) New files exist with correct exports:
test -f src/lib/site-url.ts && grep -c "export function" src/lib/site-url.ts  # expect 3 (resolveCanonicalBase, resolveAssetBase, isProduction)
test -f src/components/SEO.astro && grep -c '<meta property="og:image"' src/components/SEO.astro  # expect 1
! grep -q '<title>' src/components/SEO.astro                                                     # Concern 4: no <title> in SEO.astro
test -f src/pages/robots.txt.ts && grep -c "isProduction" src/pages/robots.txt.ts                # expect at least 1
test -f scripts/generate-og-default.mjs
test -f public/og-default.png && file public/og-default.png | grep -qE "1200 x 630|1200x630"

# 2) Existing files updated (Concern 4: BaseLayout.astro UNCHANGED for <title>):
grep -c "<title>{title}</title>" src/layouts/BaseLayout.astro                                    # expect 1 (still owns title)
grep -c "import sitemap" astro.config.mjs                                                        # expect 1
grep -c "sitemap()" astro.config.mjs                                                             # expect 1
grep -c "import SEO" src/pages/gallery.astro                                                     # expect 1
grep -c "import SEO" src/pages/gallery/\[slug\].astro                                            # expect 1
grep -c "resolveAssetBase" src/pages/gallery/\[slug\].astro                                      # expect 1 (Concern 1: per-piece og:image)

# 3) REQUIREMENTS.md edited per D-19 + D-23:
! grep -qE "^### Contact Form" .planning/REQUIREMENTS.md           # expect exit 0
! grep -qE "^- \[ \] \*\*CON-" .planning/REQUIREMENTS.md           # expect exit 0
! grep -qE "^\| CON-[0-9]+" .planning/REQUIREMENTS.md              # expect exit 0
grep -c "v1 contact form is dropped" .planning/REQUIREMENTS.md     # expect 1

# 4) PROJECT.md edited per Concern 6:
! grep -q "Say Hi page with a contact form" .planning/PROJECT.md   # expect exit 0
grep -c "Contact form on \`/say-hi\`" .planning/PROJECT.md         # expect 1

# 5) ROADMAP.md Phase 3 narrative edited per Concern 6 + D-03 + D-14:
grep -c "next-upcoming pop-up" .planning/ROADMAP.md                # expect at least 1
grep -c "D-14" .planning/ROADMAP.md                                # expect at least 1

# 6) Production build green; sitemap + robots present in output:
npm run build
test -f dist/client/robots.txt
test -f dist/client/sitemap-index.xml
test -f dist/client/sitemap-0.xml
grep -c "<loc>" dist/client/sitemap-0.xml   # expect at least 5 (5 routes + N gallery slugs)

# 7) Local-dev robots.txt defaults to Disallow:
cat dist/client/robots.txt   # expect: User-agent: *\nDisallow: /\n  (because no WORKERS_CI_BRANCH set locally)

# 8) Concern 1 — canonical does NOT leak preview host:
CF_PAGES_URL=https://preview.example.workers.dev npm run build 2>&1 | tail -5
grep -rh 'rel="canonical"' dist/client/ 2>/dev/null | grep -c 'studiobluemli.com'  # expect at least 1
grep -rh 'rel="canonical"' dist/client/ 2>/dev/null | grep -c 'preview.example'    # expect 0

# 9) Phase 1 CI gates still pass:
npm run ci:brand-check
npm run ci:lowercase-check
```

Visual sanity (founder-style, optional):
- `npm run dev`, open `/gallery/<any-slug>` source view, confirm `<title>` (from BaseLayout), `<meta name="description">`, `<link rel="canonical" href="https://studiobluemli.com/gallery/<slug>">`, og:image absolute URL, twitter:card=summary_large_image all present.
- Open `/robots.txt` in dev — expect `User-agent: *\nDisallow: /` (local-dev branch).
</verification>

<success_criteria>
Plan 02 is complete when:
1. `src/lib/site-url.ts`, `src/components/SEO.astro`, `src/pages/robots.txt.ts`, `scripts/generate-og-default.mjs`, and `public/og-default.png` all exist.
2. `src/lib/site-url.ts` exports THREE functions: `resolveCanonicalBase` (always apex), `resolveAssetBase` (preview-aware), `isProduction` (hardened — process.env + import.meta.env + PUBLIC_-prefixed + PUBLIC_DEPLOY_ENV).
3. `src/components/SEO.astro` does NOT emit `<title>` (Concern 4); BaseLayout.astro still emits `<title>{title}</title>`.
4. `@astrojs/sitemap` is in `package.json` deps and `sitemap()` is in `astro.config.mjs`'s `integrations` array.
5. `temporal-polyfill` is in `package.json` deps (consumed by Plan 03; installed here to centralize package.json edits).
6. `src/pages/gallery.astro` and `src/pages/gallery/[slug].astro` both consume `<SEO />`; the inline env-aware ogBase block in the latter is gone; per-piece og:image uses `resolveAssetBase`.
7. `.planning/REQUIREMENTS.md` has the Contact Form section removed, CON-* moved to Out of Scope, and PAG-06 narrative rewritten per D-23. The traceability table has the 11 CON-NN rows removed.
8. `.planning/PROJECT.md` Active section + Out of Scope reflect the no-form scope cut (D-18), landing empty-state (D-03), and About imagery divergence (D-14).
9. `.planning/ROADMAP.md` Phase 3 SC1 + SC3 + Goal + key risks updated per D-03 + D-14 + D-16 + D-18; Phase 4 entry byte-unchanged (D-20 separate op).
10. `npm run build` produces `dist/client/robots.txt`, `dist/client/sitemap-index.xml`, `dist/client/sitemap-0.xml`. Sitemap-0.xml's `<loc>` entries include all 5 routes + every gallery slug, all on apex.
11. **Concern 1 verification:** preview-host build (with `CF_PAGES_URL` set) produces canonical/og:url pointing to apex, NOT to the preview host.
12. `npm run ci:brand-check` and `npm run ci:lowercase-check` both pass.
13. `package-lock.json` regenerated by `npm install` (Concern 12).
</success_criteria>

<output>
After completion, create `.planning/phases/03-page-composition-pop-ups/03-02-SUMMARY.md` documenting:
- The 5 new files + 8 modified files (the +3 vs original being PROJECT.md, ROADMAP.md, package-lock.json — all reviews-mode additions).
- The verified emission contract for `<SEO />` (9 head elements; 4 props; `<title>` NOT emitted — owned by BaseLayout per Concern 4).
- The verified `resolveCanonicalBase` / `resolveAssetBase` split per Concern 1.
- The verified `isProduction()` hardened against missing env-var paths per Concern 7.
- The local-dev `dist/client/robots.txt` snapshot (showing `Disallow: /` is the default when no env signals are set).
- The preview-build canonical-URL snapshot (showing `studiobluemli.com` even with `CF_PAGES_URL` set — Concern 1 verification).
- The sitemap-0.xml `<loc>` count from the local build.
- A one-line note that Plan 03 will consume `temporal-polyfill` (installed here, ready to use) and `<SEO />`; Plan 04 will consume `<SEO />`; Plan 05 has no dep on this plan beyond a clean baseline build.
- Confirmation that `.planning/ROADMAP.md` Phase 4 section was NOT touched (Phase 4 removal is the user's `/gsd-phase` operation per D-20).
- Confirmation that PROJECT.md + ROADMAP Phase 3 narrative now match the locked Phase 3 decisions (Concern 6).
</output>
