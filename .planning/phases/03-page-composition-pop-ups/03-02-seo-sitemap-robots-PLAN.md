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
  - src/layouts/BaseLayout.astro
  - src/pages/gallery/[slug].astro
  - src/pages/gallery.astro
  - package.json
  - .planning/REQUIREMENTS.md
autonomous: true
requirements: [PAG-02, PAG-07, PAG-08, PAG-06]
must_haves:
  truths:
    - "Every page that imports <SEO /> emits a <title>, <meta name=description>, og:title, og:description, og:image (absolute URL), og:url, twitter:card=summary_large_image, and a <link rel=canonical> pointing to the apex."
    - "On a production build (main branch), GET /robots.txt returns `Allow: /` plus the sitemap reference; on a preview branch build, GET /robots.txt returns `Disallow: /`."
    - "After build, dist/client/sitemap-index.xml + dist/client/sitemap-0.xml exist; sitemap-0.xml's <loc> elements include all 5 routes + every /gallery/<slug> permalink, all canonical to apex."
    - "public/og-default.png is a real 1200x630 PNG (cream background + centered mark) that resolves at https://studiobluemli.com/og-default.png after deploy."
    - ".planning/REQUIREMENTS.md has CON-01..CON-11 listed under Out of Scope (not Active Requirements), and PAG-06's narrative reads 'renders visible Instagram DM link + mailto link' (per D-23)."
  artifacts:
    - path: "src/lib/site-url.ts"
      provides: "resolveSiteBase() + isProduction() build-time env-aware helpers"
      exports: ["resolveSiteBase", "isProduction"]
    - path: "src/components/SEO.astro"
      provides: "Per-page meta + canonical emitter; falls back to site/config.yaml defaults and /og-default.png"
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
      via: "import { resolveSiteBase } and call with Astro.site"
      pattern: "resolveSiteBase\\(Astro\\.site\\)"
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
      via: "<slot name=\"head\" /> receives the <SEO /> emitter's <meta> tags"
      pattern: "slot name=\"head\""
---

<objective>
Wire the shared SEO infrastructure that every Phase 3 page (and the refactored Phase 2 gallery pages) will use to emit canonical-to-apex meta tags, plus the sitemap integration, plus the env-aware robots.txt endpoint, plus the default og:image fallback PNG, plus the REQUIREMENTS.md edits that finalize the D-19/D-23 scope changes.

Purpose: This plan is the "infrastructure" layer of Phase 3. By the end of it, every page in the codebase can simply do `<SEO slot="head" title="..." pathname="/..." />` and get the full PAG-07 contract for free, including the absolute-URL og:image and the canonical-to-apex link tag. Plans 03 and 04 consume this directly with no further plumbing.

Output (12 files touched, 5 new, 7 modified):
- `src/lib/site-url.ts` — `resolveSiteBase()` + `isProduction()` build-time helpers (lifted from gallery/[slug].astro's existing env-aware pattern).
- `src/components/SEO.astro` — the per-page meta emitter (the Pattern 3 spec from RESEARCH.md, verbatim).
- `src/pages/robots.txt.ts` — Astro endpoint with `prerender = true` returning the env-branched body.
- `scripts/generate-og-default.mjs` — one-shot Node script that uses Sharp (already a devDep) to render the logo lockup PNG.
- `public/og-default.png` — the committed 1200x630 PNG output of that script.
- `astro.config.mjs` — adds `sitemap()` to the integrations array (per D-28: all 5 routes + every `/gallery/<slug>` permalink, default config — no special filters).
- `src/layouts/BaseLayout.astro` — drops its own `<title>` emission so the `<SEO />` component (the new `<title>` owner) does not duplicate it.
- `src/pages/gallery/[slug].astro` — refactors the inline env-aware base-URL block + `<meta slot="head">` into `<SEO />` + `resolveSiteBase()`.
- `src/pages/gallery.astro` — adds `<SEO slot="head" />`.
- `package.json` — adds `@astrojs/sitemap` + `temporal-polyfill` deps + a new `og:default` script.
- `.planning/REQUIREMENTS.md` — moves CON-01..CON-11 to Out of Scope (D-19) and rewrites PAG-06 narrative (D-23).
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
- `WORKERS_CI_BRANCH` set on Workers Builds CI runs; `'main'` for production deploys
- `CF_PAGES_URL` set on legacy Pages preview/production builds
- `CF_PAGES_BRANCH` legacy Pages branch; secondary check
- `PUBLIC_SITE_URL` explicit override (project-defined, set via wrangler.jsonc `vars` or `.dev.vars` locally)
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
This entire pattern moves into `src/lib/site-url.ts`'s `resolveSiteBase()`.

Existing BaseLayout slot pattern (from src/layouts/BaseLayout.astro line 43):
```astro
<slot name="head" />
```
This is the injection point.

Existing logo asset (verified via ls assets/logo/):
- `assets/logo/mark.svg` generic mark
- `assets/logo/mark-coral.svg` coral-tinted variant (preferred for the og:image per RESEARCH.md Example 4)
- `assets/logo/mark-cream.svg`, `assets/logo/mark-indigo.svg` alternate tints
- `assets/logo/mark-1024.png`, `assets/logo/mark-512.png` pre-rasterized variants
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create src/lib/site-url.ts and add the two new npm deps</name>
  <read_first>
    - src/pages/gallery/[slug].astro (lines 43-52: the inline env-aware base-URL block to lift)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md (Pattern 2 + Pitfall 2)
    - package.json (the existing scripts + dependencies block)
  </read_first>
  <behavior>
    - `src/lib/site-url.ts` exports two functions: `resolveSiteBase(astroSite?: URL): string` and `isProduction(): boolean`.
    - `resolveSiteBase` returns a URL string WITHOUT trailing slash; precedence: `CF_PAGES_URL` -> `CF_WORKERS_URL` -> `PUBLIC_SITE_URL` -> `astroSite.toString()` -> `'https://studiobluemli.com'`.
    - `isProduction` returns `true` iff `WORKERS_CI_BRANCH === 'main'` OR (fallback) `CF_PAGES_BRANCH === 'main'`. Returns `false` in local dev.
    - Both functions wrap env reads inside the function body (Pitfall 2 — never module-top-level capture).
    - `@astrojs/sitemap@^3.7.2` and `temporal-polyfill@^0.3.2` are added to dependencies (`temporal-polyfill` is consumed by Plan 03, but installed here to centralize package.json edits).
    - `package.json` gets a new `"og:default"` script that runs `node scripts/generate-og-default.mjs`.
  </behavior>
  <action>
**Edit 1 — Create `src/lib/site-url.ts`:** Use the Write tool. The directory `src/lib/` does not yet exist; the file creation should auto-create it. File contents:

```typescript
// src/lib/site-url.ts — env-aware base URL resolver (D-26) + production branch check (D-29).
// Build-time only — consumed by src/components/SEO.astro and src/pages/robots.txt.ts.
//
// Pattern lifted from src/pages/gallery/[slug].astro (Phase 2 — REVIEWS.md HIGH-4),
// generalized into a shared helper so both /robots.txt and the SEO component
// can read it. Never assign at module top-level (Pitfall 2 — Vite would inline
// the value at build); always wrap env reads in a function so the value is
// resolved against the actual build's env.

/**
 * Resolve the deployment's base URL with the precedence:
 *   1. CF_PAGES_URL      (legacy — Cloudflare Pages preview/production)
 *   2. CF_WORKERS_URL    (anticipated — Cloudflare Workers Builds preview hostname; see Caveat)
 *   3. PUBLIC_SITE_URL   (explicit override for non-CF environments)
 *   4. astroSite         (apex configured in astro.config.mjs — production fallback)
 *   5. 'https://studiobluemli.com'  (final hardcoded fallback for safety)
 *
 * Returns a URL WITHOUT trailing slash so callers can safely append `/path`.
 */
export function resolveSiteBase(astroSite?: URL): string {
  const fromEnv =
    import.meta.env.CF_PAGES_URL ??
    import.meta.env.CF_WORKERS_URL ??
    import.meta.env.PUBLIC_SITE_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  const fromAstroSite = astroSite?.toString();
  if (fromAstroSite) return fromAstroSite.replace(/\/$/, '');
  return 'https://studiobluemli.com';
}

/**
 * True only when the build is producing the production deployment (main branch).
 * Used by src/pages/robots.txt.ts to gate Allow vs Disallow.
 *
 * In local dev (no CI env vars set) returns false → robots.txt defaults to
 * `Disallow: /`, which is the safer side of any ambiguity.
 */
export function isProduction(): boolean {
  const branch = import.meta.env.WORKERS_CI_BRANCH;
  if (typeof branch === 'string' && branch.length > 0) return branch === 'main';
  const pagesBranch = import.meta.env.CF_PAGES_BRANCH;
  if (typeof pagesBranch === 'string' && pagesBranch.length > 0) return pagesBranch === 'main';
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

**Edit 3 — Run `npm install`** to fetch the two new packages.
  </action>
  <verify>
    <automated>npm install --silent 2>&1 | tail -5 && test -f src/lib/site-url.ts && grep -c "export function resolveSiteBase" src/lib/site-url.ts && grep -c "export function isProduction" src/lib/site-url.ts && node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))" && grep -c '@astrojs/sitemap' package.json && grep -c 'temporal-polyfill' package.json && grep -c '"og:default"' package.json && test -d node_modules/@astrojs/sitemap && test -d node_modules/temporal-polyfill</automated>
  </verify>
  <acceptance_criteria>
    - `test -f src/lib/site-url.ts` exits 0
    - `grep -c "export function resolveSiteBase" src/lib/site-url.ts` returns 1
    - `grep -c "export function isProduction" src/lib/site-url.ts` returns 1
    - `grep -c "import.meta.env.CF_PAGES_URL" src/lib/site-url.ts` returns 1
    - `grep -c "import.meta.env.WORKERS_CI_BRANCH" src/lib/site-url.ts` returns 1
    - `node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"` exits 0
    - `grep -c '@astrojs/sitemap' package.json` returns at least 1
    - `grep -c 'temporal-polyfill' package.json` returns at least 1
    - `grep -c '"og:default"' package.json` returns 1
    - `test -d node_modules/@astrojs/sitemap` exits 0
    - `test -d node_modules/temporal-polyfill` exits 0
  </acceptance_criteria>
  <done>
    `src/lib/site-url.ts` is created with both helpers; the two new deps are installed; the `og:default` script is wired; package.json remains valid JSON.
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
  <name>Task 3: Create src/components/SEO.astro and drop BaseLayout's <title> emission</name>
  <read_first>
    - src/layouts/BaseLayout.astro (line 17 = current `<title>` line; line 43 = `<slot name="head" />`)
    - src/pages/gallery/[slug].astro (the inline pattern being replaced)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md Pattern 3
    - .planning/phases/03-page-composition-pop-ups/03-PATTERNS.md (the "pick (a)" decision)
    - src/content/site/config.yaml (the og_title + og_description defaults)
  </read_first>
  <behavior>
    - `src/components/SEO.astro` emits 10 head elements: `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:image">`, `<meta property="og:url">`, `<meta property="og:type">`, `<meta name="twitter:card">`, `<meta name="twitter:image">`.
    - Props: `title` (required), `description` (optional, falls back to `site.og_description`), `ogImage` (optional, falls back to `${base}/og-default.png`), `pathname` (optional, default `/`).
    - The canonical URL is always built from `resolveSiteBase(Astro.site)` + pathname.
    - The og:image is always emitted as an ABSOLUTE URL (Pitfall 14).
    - BaseLayout.astro no longer emits `<title>`; SEO.astro owns it. BaseLayout's `title` prop interface stays unchanged so existing callers still compile.
  </behavior>
  <action>
**Edit 1 — Create `src/components/SEO.astro`:** Use the Write tool. File contents:

```astro
 ---
// src/components/SEO.astro — Phase 3 PAG-07 / D-26.
// Per-page SEO meta emitter. Consumed via `<SEO slot="head" ... />` from each
// .astro page. Outputs land in BaseLayout's <slot name="head" />.
//
// Defaults: og_title + og_description from src/content/site/config.yaml.
// Canonical: always apex via resolveSiteBase(Astro.site) (D-26).
// Default og:image: /og-default.png (D-27 path 3).
//
// IMPORTANT: <title> is emitted here (NOT in BaseLayout.astro — BaseLayout's
// own <title> tag is removed in this plan to avoid duplication).
// All callers must pass `title`.

import { getEntry } from 'astro:content';
import { resolveSiteBase } from '../lib/site-url';

interface Props {
  /** Page-specific <title>. Required. */
  title:       string;
  /** Plain-text description. Falls back to site.og_description. */
  description?: string;
  /** ABSOLUTE URL to the og:image. Falls back to ${base}/og-default.png. */
  ogImage?:    string;
  /** Path of the current page. Defaults to "/". */
  pathname?:   string;
}

const { title, description, ogImage, pathname = '/' } = Astro.props;

const site = (await getEntry('site', 'default'))!.data;
const base = resolveSiteBase(Astro.site);

const canonical    = `${base}${pathname === '/' ? '' : pathname}`;
const ogImageAbs   = ogImage ?? `${base}/og-default.png`;
const finalDesc    = description ?? site.og_description;
 ---
<title>{title}</title>
<meta name="description" content={finalDesc} />

<link rel="canonical" href={canonical} />

<meta property="og:title"       content={title} />
<meta property="og:description" content={finalDesc} />
<meta property="og:image"       content={ogImageAbs} />
<meta property="og:url"         content={canonical} />
<meta property="og:type"        content="website" />

<meta name="twitter:card"  content="summary_large_image" />
<meta name="twitter:image" content={ogImageAbs} />
```

**Edit 2 — Drop BaseLayout.astro's `<title>` emission:** Use the Edit tool on `src/layouts/BaseLayout.astro`. Find line 17 (`<title>{title}</title>`) and DELETE it. Add a one-line comment in its place so future readers understand the absence:

Replace this block (lines 16-18 area):
```astro
    <meta name="color-scheme" content="light" />
    <title>{title}</title>

    {/* Favicon set (FND-08) — files generated/copied by scripts/generate-favicons.mjs (Plan 03) */}
```

With this:
```astro
    <meta name="color-scheme" content="light" />
    {/* <title> is emitted by <SEO slot="head" /> on each page (D-26 / Phase 3 Plan 02). */}

    {/* Favicon set (FND-08) — files generated/copied by scripts/generate-favicons.mjs (Plan 03) */}
```

KEEP the `interface Props { title: string; }` declaration and the `const { title } = Astro.props;` line — every existing caller passes `title` and removing the prop would require touching all of them. The prop is now logically unused but remains in the signature for backwards compat (PATTERNS.md "pick (a)" decision).

**No other edits to BaseLayout.astro.** The favicon block, the three `<Font>` preload tags (after Plan 01), the `<slot name="head" />` line, the global `<style is:global>` block, the `:focus-visible` rule, the skip-link — all unchanged.
  </action>
  <verify>
    <automated>test -f src/components/SEO.astro && grep -c "twitter:card" src/components/SEO.astro && grep -c "og:image" src/components/SEO.astro && grep -cE 'rel="canonical"' src/components/SEO.astro && grep -c "resolveSiteBase" src/components/SEO.astro && grep -c '<title>{title}</title>' src/layouts/BaseLayout.astro && grep -c 'slot name="head"' src/layouts/BaseLayout.astro</automated>
  </verify>
  <acceptance_criteria>
    - `test -f src/components/SEO.astro` exits 0
    - `grep -c "twitter:card" src/components/SEO.astro` returns 1
    - `grep -c "og:image" src/components/SEO.astro` returns at least 2 (the og:image meta tag + the canonical og:image variable comment)
    - `grep -cE 'rel="canonical"' src/components/SEO.astro` returns 1
    - `grep -c "resolveSiteBase" src/components/SEO.astro` returns 1
    - `grep -c '<title>{title}</title>' src/layouts/BaseLayout.astro` returns 0 (the line was removed)
    - `grep -c 'slot name="head"' src/layouts/BaseLayout.astro` returns 1 (the slot stays)
    - `grep -c "<title>{title}</title>" src/components/SEO.astro` returns 1 (the new owner)
  </acceptance_criteria>
  <done>
    `src/components/SEO.astro` exists with the 10-head-element emission contract; BaseLayout.astro no longer emits its own `<title>`; the `<slot name="head" />` remains untouched as the injection point.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Add @astrojs/sitemap integration to astro.config.mjs, create src/pages/robots.txt.ts, and wire <SEO /> into gallery.astro + gallery/[slug].astro</name>
  <read_first>
    - astro.config.mjs (the existing `integrations: [react()]` array, currently at line 19)
    - src/pages/gallery.astro (entire file — adding `<SEO />`)
    - src/pages/gallery/[slug].astro (lines 43-52 = inline env-aware ogBase block to delete; line 67 = inline `<meta slot="head" property="og:image">` to replace with `<SEO />`)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md Example 2 (robots.txt) and Q5 (sitemap integration)
  </read_first>
  <behavior>
    - `astro.config.mjs` imports `@astrojs/sitemap` and adds `sitemap()` to the `integrations` array. No options needed.
    - `src/pages/robots.txt.ts` is a new Astro endpoint that declares `prerender = true` and branches its `GET` body on `isProduction()`.
    - `src/pages/gallery.astro` adds `<SEO slot="head" title="Gallery — Studio Bluemli" pathname="/gallery" />` immediately inside `<BaseLayout>`.
    - `src/pages/gallery/[slug].astro` removes the inline `ogBase`/`ogImageUrl` block (lines 43-52), imports `<SEO />` + `resolveSiteBase`, and replaces the `<meta slot="head">` (line 67) with `<SEO slot="head" title={...} description={description} ogImage={...} pathname={...} />`.
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

Do NOT touch any other line. The empty-state branch, the GalleryGrid call, the Footer, the `<style is:global>` block with card-status colors — all unchanged.

**Edit 4 — `src/pages/gallery/[slug].astro`:** Use the Edit tool. Three sub-edits:

(a) Add imports — after the existing `import manifestJson from '../../../public/gallery/_manifest.json';` line, ADD:
```typescript
import SEO from '../../components/SEO.astro';
import { resolveSiteBase } from '../../lib/site-url';
```

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
// PAG-07: og:image base URL now resolved via the shared helper (Phase 3 Plan 02).
const ogImageUrl = `${resolveSiteBase(Astro.site)}/gallery/${slug}/hero-800.webp`;
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

Do NOT touch any of the page body, the `<style>` block, the `getStaticPaths()` function, or the manifest import. Status/CTA logic + the rest of the page is unchanged.
  </action>
  <verify>
    <automated>grep -c "import sitemap from '@astrojs/sitemap'" astro.config.mjs && grep -c "sitemap()" astro.config.mjs && test -f src/pages/robots.txt.ts && grep -c "export const prerender = true" src/pages/robots.txt.ts && grep -c "isProduction()" src/pages/robots.txt.ts && grep -c "import SEO" src/pages/gallery.astro && grep -c '<SEO slot="head"' src/pages/gallery.astro && grep -c "import SEO" src/pages/gallery/\[slug\].astro && grep -c "resolveSiteBase" src/pages/gallery/\[slug\].astro && grep -c "<meta slot=\"head\" property=\"og:image\"" src/pages/gallery/\[slug\].astro && npm run build 2>&1 | tail -10 && test -f dist/client/robots.txt && test -f dist/client/sitemap-index.xml && test -f dist/client/sitemap-0.xml</automated>
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
    - `grep -c "resolveSiteBase" src/pages/gallery/\[slug\].astro` returns 1
    - `grep -c '<meta slot="head" property="og:image"' src/pages/gallery/\[slug\].astro` returns 0 (the inline meta was replaced)
    - `npm run build` exits 0
    - `test -f dist/client/robots.txt` exits 0
    - `test -f dist/client/sitemap-index.xml` exits 0
    - `test -f dist/client/sitemap-0.xml` exits 0
    - `grep -c '<loc>https://studiobluemli.com/gallery/' dist/client/sitemap-0.xml` returns at least 1 (gallery slug entries present)
    - On local dev (no WORKERS_CI_BRANCH set), `dist/client/robots.txt` contains `Disallow: /` (the isProduction-false branch)
  </acceptance_criteria>
  <done>
    `@astrojs/sitemap` is integrated; `robots.txt.ts` is wired; the two gallery pages now consume `<SEO />`; a production build produces `robots.txt`, `sitemap-index.xml`, `sitemap-0.xml`, and all 5 routes + gallery slugs are present in the sitemap.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 5: Update .planning/REQUIREMENTS.md per D-19 (CON-* to Out of Scope) and D-23 (PAG-06 narrative)</name>
  <read_first>
    - .planning/REQUIREMENTS.md (the current structure: Foundation / Content & Gallery / Pages & Composition / Contact Form & Deliverability / Launch & Operations sections, then `Out of Scope (v1)`, then `Traceability`)
    - .planning/phases/03-page-composition-pop-ups/03-CONTEXT.md (D-19, D-23 specifics)
  </read_first>
  <behavior>
    - The "Contact Form & Deliverability" section heading is REMOVED from REQUIREMENTS.md.
    - All 11 CON-NN requirement lines (CON-01..CON-11) are removed from the active-requirements section.
    - A new entry is added to the existing `## Out of Scope (v1)` list explaining the v1 scope cut for the contact form, with a bullet referencing D-18 + D-19.
    - The PAG-06 line is rewritten from "Say Hi page (`/say-hi`) renders the contact form (CON-* requirements below) plus visible Instagram and `mailto:` fallback links" to the new D-23 text.
    - The Traceability table at the bottom has all 11 CON-NN rows REMOVED (or moved into a separate "Out of Scope (no phase)" subsection — the cleaner approach is removal).
    - Phase 5's requirements line (`FND-03, LCH-01..LCH-08`) remains untouched.
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

(e) **Do NOT** touch ROADMAP.md in this plan — Phase 4 removal is a separate `/gsd-phase` operation per D-20. Phase 3 plans must not edit ROADMAP.md's Phase 4 section.

(f) **Do NOT** add a "Last updated" timestamp change or touch the introductory note at the top of REQUIREMENTS.md. The structure stays; only the enumerated edits above happen.

Verify the file is still well-formed Markdown:
- The five level-3 headings under the `## v1 Requirements` block are now: Foundation, Content & Gallery, Pages & Composition, Launch & Operations (in that order, with Contact Form & Deliverability REMOVED).
- The PAG-06 bullet contains the phrase "v1 contact form is dropped".
- The Out of Scope section contains "Contact form (`<form>`" near the top.
- `grep -c "^- \[ \] \*\*CON-" .planning/REQUIREMENTS.md` returns 0 (no active CON requirements remain).
  </action>
  <verify>
    <automated>grep -c "^### Contact Form" .planning/REQUIREMENTS.md && grep -cE "^- \[ \] \*\*CON-" .planning/REQUIREMENTS.md && grep -c "v1 contact form is dropped" .planning/REQUIREMENTS.md && grep -c "Contact form (\`<form>\`" .planning/REQUIREMENTS.md && grep -cE "^\| CON-[0-9]+" .planning/REQUIREMENTS.md</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "^### Contact Form" .planning/REQUIREMENTS.md` returns 0 (heading removed)
    - `grep -cE "^- \[ \] \*\*CON-" .planning/REQUIREMENTS.md` returns 0 (no active CON bullets)
    - `grep -c "v1 contact form is dropped" .planning/REQUIREMENTS.md` returns 1 (the new PAG-06 narrative)
    - `grep -c '<form>' .planning/REQUIREMENTS.md` returns at least 1 (the Out of Scope explanation references it)
    - `grep -cE "^\| CON-[0-9]+" .planning/REQUIREMENTS.md` returns 0 (no CON rows in the traceability table)
    - `grep -cE "^\| PAG-0[0-9]" .planning/REQUIREMENTS.md` returns 9 (PAG-01..PAG-09 traceability rows preserved)
    - `grep -cE "^- \[ \] \*\*PAG-06\*\*" .planning/REQUIREMENTS.md` returns 1 (PAG-06 bullet exists, with the new narrative)
    - ROADMAP.md is unchanged in this task: `git diff --stat .planning/ROADMAP.md` shows no diff (Phase 4 removal is a separate `/gsd-phase` operation)
  </acceptance_criteria>
  <done>
    REQUIREMENTS.md has the Contact Form section removed, CON-* bullets and traceability rows gone, PAG-06 narrative rewritten per D-23, and the Out of Scope section explicitly documents the v1 contact-form deferral.
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
| T-03-02-01 | Spoofing | `src/components/SEO.astro` canonical URL | mitigate | Canonical URL is always built from `resolveSiteBase(Astro.site)` + a hardcoded fallback of `https://studiobluemli.com`. Even if `CF_PAGES_URL` were spoofed by a malicious build, the fallback ensures the canonical never resolves to an unrelated host. The function returns a string, not a parsed URL, but the fallback guarantees a known-good domain. |
| T-03-02-02 | Information Disclosure | `src/pages/robots.txt.ts` on preview | mitigate | Preview deploys emit `Disallow: /` (verified via `isProduction()` returning false when `WORKERS_CI_BRANCH !== 'main'`). This prevents search engines from indexing preview hostnames and surfacing pre-launch copy. |
| T-03-02-03 | Information Disclosure | Sitemap leakage | accept | Sitemap is canonical to apex (Astro.site is hardcoded `https://studiobluemli.com`). On preview builds the sitemap still references apex URLs, which is intentional per D-26. Combined with T-03-02-02's `Disallow: /` on previews, indexing is closed off; the sitemap itself is public-by-design. |
| T-03-02-04 | Tampering | `public/og-default.png` | accept | The PNG is committed to git; tampering requires write access to the repo, which is the same trust boundary as the source code itself. Re-generation via `npm run og:default` is idempotent and reproducible from source SVGs. |
| T-03-02-05 | Malicious Code (V10) | `@astrojs/sitemap`, `temporal-polyfill` | mitigate | `@astrojs/sitemap` is an official Astro-org integration (publisher: withastro). `temporal-polyfill` is FullCalendar's maintained Temporal subset (publisher: fullcalendar). Both have integrity hashes locked in `package-lock.json` after the npm install in Task 1. |
</threat_model>

<verification>
End-to-end verification after all 5 tasks complete:

```bash
# 1) New files exist with correct exports:
test -f src/lib/site-url.ts && grep -c "export function" src/lib/site-url.ts  # expect 2 (resolveSiteBase, isProduction)
test -f src/components/SEO.astro && grep -c '<meta property="og:image"' src/components/SEO.astro  # expect 1
test -f src/pages/robots.txt.ts && grep -c "isProduction" src/pages/robots.txt.ts                # expect at least 1
test -f scripts/generate-og-default.mjs
test -f public/og-default.png && file public/og-default.png | grep -qE "1200 x 630|1200x630"

# 2) Existing files updated:
grep -c "<title>{title}</title>" src/layouts/BaseLayout.astro                                    # expect 0
grep -c "import sitemap" astro.config.mjs                                                        # expect 1
grep -c "sitemap()" astro.config.mjs                                                             # expect 1
grep -c "import SEO" src/pages/gallery.astro                                                     # expect 1
grep -c "import SEO" src/pages/gallery/\[slug\].astro                                            # expect 1
grep -c "resolveSiteBase" src/pages/gallery/\[slug\].astro                                       # expect 1

# 3) REQUIREMENTS.md edited per D-19 + D-23:
grep -cE "^### Contact Form" .planning/REQUIREMENTS.md           # expect 0
grep -cE "^- \[ \] \*\*CON-" .planning/REQUIREMENTS.md           # expect 0
grep -cE "^\| CON-[0-9]+" .planning/REQUIREMENTS.md              # expect 0
grep -c "v1 contact form is dropped" .planning/REQUIREMENTS.md   # expect 1

# 4) Production build green; sitemap + robots present in output:
npm run build
test -f dist/client/robots.txt
test -f dist/client/sitemap-index.xml
test -f dist/client/sitemap-0.xml
grep -c "<loc>" dist/client/sitemap-0.xml   # expect at least 5 (5 routes + N gallery slugs)

# 5) Local-dev robots.txt defaults to Disallow:
cat dist/client/robots.txt   # expect: User-agent: *\nDisallow: /\n  (because no WORKERS_CI_BRANCH set locally)

# 6) Phase 1 CI gates still pass:
npm run ci:brand-check
npm run ci:lowercase-check

# 7) Sample page-source check (run via `npm run preview` and curl):
# (Run separately in execution; not part of automated verification, since `astro preview` needs a port and is brittle in CI.)
# curl -s http://localhost:4321/ | grep -c '<meta property="og:image"'   # expect 1
# curl -s http://localhost:4321/ | grep -c '<link rel="canonical"'      # expect 1
```

Visual sanity (founder-style, optional):
- `npm run dev`, open `/gallery/<any-slug>` source view, confirm `<title>`, `<meta name="description">`, `<link rel="canonical" href="https://studiobluemli.com/gallery/<slug>">`, og:image absolute URL, twitter:card=summary_large_image all present.
- Open `/robots.txt` in dev — expect `User-agent: *\nDisallow: /` (local-dev branch).
</verification>

<success_criteria>
Plan 02 is complete when:
1. `src/lib/site-url.ts`, `src/components/SEO.astro`, `src/pages/robots.txt.ts`, `scripts/generate-og-default.mjs`, and `public/og-default.png` all exist.
2. `@astrojs/sitemap` is in `package.json` deps and `sitemap()` is in `astro.config.mjs`'s `integrations` array.
3. `temporal-polyfill` is in `package.json` deps (consumed by Plan 03; installed here to centralize package.json edits).
4. `src/pages/gallery.astro` and `src/pages/gallery/[slug].astro` both consume `<SEO />`; the inline env-aware ogBase block in the latter is gone.
5. BaseLayout.astro no longer emits `<title>`; the slot `<slot name="head" />` still exists.
6. `.planning/REQUIREMENTS.md` has the Contact Form section removed, CON-* moved to Out of Scope, and PAG-06 narrative rewritten per D-23. The traceability table has the 11 CON-NN rows removed.
7. `npm run build` produces `dist/client/robots.txt`, `dist/client/sitemap-index.xml`, `dist/client/sitemap-0.xml`. Sitemap-0.xml's `<loc>` entries include all 5 routes + every gallery slug, all on apex.
8. `npm run ci:brand-check` and `npm run ci:lowercase-check` both pass.
</success_criteria>

<output>
After completion, create `.planning/phases/03-page-composition-pop-ups/03-02-SUMMARY.md` documenting:
- The 5 new files + 6 modified files.
- The verified emission contract for `<SEO />` (10 head elements; 4 props; canonical-to-apex behavior).
- The local-dev `dist/client/robots.txt` snapshot (showing `Disallow: /` is the default when `WORKERS_CI_BRANCH` is unset).
- The sitemap-0.xml `<loc>` count from the local build.
- A one-line note that Plan 03 will consume `temporal-polyfill` (installed here, ready to use) and `<SEO />`; Plan 04 will consume `<SEO />`; Plan 05 has no dep on this plan beyond a clean baseline build.
- Confirmation that `.planning/ROADMAP.md` was NOT touched (Phase 4 removal is the user's `/gsd-phase` operation per D-20).
</output>
