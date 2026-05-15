# Phase 2: Content Schema & Gallery — Research

**Researched:** 2026-05-13
**Domain:** Astro 6 Content Collections, Sharp + HEIC image pipeline, prerendered gallery routes
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Build-time variant generation, gitignored output. `prebuild` Node script (sharp + heif-convert) writes `public/gallery/<slug>/hero-{400,800,1600}.webp`. `public/gallery/` is gitignored.
- **D-02:** Hero-only for v1. Singular `hero: image()` field. Multi-photo deferred to v1.x.
- **D-03:** 3 responsive widths: 400 / 800 / 1600. WebP only. `fit: 'inside'` (no crop in prebuild).
- **D-04:** HEIC supported end-to-end. CI installs `libheif-dev` and prebuild detects `.heic` → converts before sharp runs.
- **D-05:** No staging folder. `src/content/gallery/<slug>/` is the canonical drop location.
- **D-06:** Ship with 6 real founder HEIC photos at: `src/content/gallery/cluster-{blush,cobalt,coral,lavender,saffron,sage}/hero.heic`.
- **D-07:** Brand-voiced realistic placeholder metadata (name/price/status/description per piece). All 6 ship `featured: true`, `status: available`, `published_at: 2026-05-13`, price $42–$58.
- **D-08:** No dry-run ceremony. SC1 is met by the founder's natural first real-metadata edit.
- **D-09:** Photo-forward single column for `/gallery/<slug>`. Layout top-to-bottom: back link → hero photo → name (h1) → price + status badge → description → IG CTA button → mailto fallback → back link bottom.
- **D-10:** Native aspect ratio on detail page; CSS `object-fit: cover; aspect-ratio: 4/5` on grid cards.
- **D-11:** Sold pieces keep IG CTA. Copy flips. Status badge: "Sold" in `--lavender-500`. Never hidden.
- **D-12:** Per-piece `og:image` uses 800w variant. Absolute URL to `https://studiobluemli.com/gallery/<slug>/hero-800.webp` (or preview hostname).
- **D-13:** Inline `mailto:hi@studiobluemli.com` fallback near the IG CTA on every detail page.
- **D-14:** Sort key `published_at` (ISO date string), required field, newest-first on `/gallery`.
- **D-15:** `featured: z.boolean().default(false)`. All 6 seed pieces ship `featured: true`.
- **D-16:** CNT-03 modification — `photos: array` → singular `hero: image()` (required).
- **D-17:** CNT-03 modification — sort key is `published_at`, not `order`.

### Claude's Discretion
- Exact sharp options for HEIC decode (heic-convert vs heif-convert CLI vs libvips built-in).
- Prebuild trigger mechanism (npm `prebuild` script vs Astro integration hook vs Vite plugin).
- WebP quality setting (default 75, may go to 80).
- Whether to emit LQIP/blurhash (default: no).
- Exact CSS for gallery grid (existing GalleryGrid.jsx `minmax(260px, 1fr)` vs 240px from sketch).
- Brand-voice placeholder descriptions per piece (executor writes).
- Sequencing of `src/sample-data.ts` deletion relative to Content Collections going live.
- `src/content.config.ts` vs `src/content/config.ts` — pin against current Astro 6 docs.
- CSS structure for detail page (scoped `<style>` in `[slug].astro` vs separate component).
- `og:image` emission strategy: inline on detail page vs minimal `<SEO />` component now vs `BaseLayout.astro` prop.

### Deferred Ideas (OUT OF SCOPE)
- Multi-photo per piece (carousel, detail thumbnails)
- Browser-side HEIC conversion
- Pre-commit hook running prebuild locally
- Cloudflare Images replacing the WebP pipeline
- Decap / Sveltia / TinaCMS CMS UI
- Per-piece OG image auto-generation (satori-style cards)
- LQIP / blurhash placeholders
- Hover transitions on gallery cards
- Lightbox / fullscreen image overlay
- Filter / search / category navigation
- `.ics` calendar export for popups
- Contact-form pre-fill from gallery
- Per-piece custom alt text as a schema field
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CNT-01 | `src/content.config.ts` defines `gallery`, `popups`, `site` collections with `.strict()` and `image()` helper | Section 1: exact API confirmed via Context7 |
| CNT-02 | Per-slug co-location `src/content/gallery/<slug>/index.md` + hero photo | Section 1: glob pattern confirmed |
| CNT-03 | Gallery schema with `hero: image()` (D-16), `price`, `status` enum, `description`, `featured`, `published_at` (D-17) | Section 1: full schema template |
| CNT-04 | Pop-up entries at `src/content/popups/YYYY-MM-DD-<slug>.md` | Section 1: glob pattern for this |
| CNT-05 | Pop-up schema (name, date, end_date, start_time, end_time, tz, location, address, description, link, photos) | Section 1: schema template |
| CNT-06 | `src/content/site/config.md` holds global site metadata | Section 1: file loader pattern |
| CNT-07 | `/gallery` grid: `getCollection('gallery')` sorted by `published_at` desc, renders GalleryGrid | Sections 1 + 5: getCollection + sort pattern |
| CNT-08 | `/gallery/<slug>` detail page: `getStaticPaths()` enumerates all slugs; photo + meta + CTA | Section 5: exact code template |
| CNT-09 | Per-piece `og:image` on each detail page (absolute URL to 800w variant) | Section 4: og:image strategy |
| CNT-10 | Sold pieces visible with quiet editorial badge; never hidden | Section 10: pitfall mitigation |
| CNT-11 | `passthroughImageService()` + pre-optimized WebPs from prebuild script | Sections 2 + 6 |
| CNT-12 | `CONTENT_EDITING.md` with screenshots, zero CLI steps, "never delete" section | Section 9 |
</phase_requirements>

---

## Summary

Phase 2 is fundamentally a data-pipeline phase: define strict schemas, run a Node script that turns iPhone HEICs into responsive WebPs, wire two prerendered Astro routes to real content collections, and document the founder's editing workflow. All the hard technical choices are locked by D-01 through D-17; what remains is precise API knowledge and sequencing.

The dominant technical challenge is the HEIC pipeline. Sharp's prebuilt binaries do NOT include HEIC support — they bundle a version of libvips compiled without libheif, regardless of what is installed on the system. The correct approach is `heic-convert@2.1.0`, a pure-JS package (no system deps) that decodes HEIC to a raw pixel buffer, which sharp then reads as a raw image. This requires zero system-library configuration: no `libheif-dev` apt step, no `SHARP_FORCE_GLOBAL_LIBVIPS`. The CI `apt-get install -y libheif-dev` step in the original plan is unnecessary and should be dropped.

The second notable finding is that pnpm 10 (which this project already uses in CI) requires `.npmrc enable-pre-post-scripts=true` for `prebuild`/`postbuild` hooks to fire automatically when `pnpm run build` is invoked. Without this setting, a plain `prebuild` npm script is silently skipped by pnpm 10. The preferred implementation is therefore a dedicated `scripts/prebuild-images.mjs` that is called as an explicit step in CI (and optionally via a renamed npm script like `prebuild:images`) rather than relying on the lifecycle hook — this matches how Phase 1 already sequences `write-assetsignore.mjs` as an explicit CI step rather than a `postbuild` hook.

**Primary recommendation:** Use `heic-convert@2.1.0` for HEIC decoding (pure JS, no system deps). Trigger the prebuild script as an explicit CI step called before `pnpm exec astro build`. Skip `libheif-dev`. Use `src/content.config.ts` (Astro 6 convention). Use `entry.id` (not `entry.slug`) for routing in Astro 6 Content Collections v2. Inline `og:image` on the detail page and plan for Phase 3's `SEO.astro` to absorb it.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Gallery schema definition | Build (Astro content layer) | — | Zod schemas + `image()` helper run at `astro build` time, not at request time |
| Image optimization (HEIC → WebP) | CI Runner (Node script) | — | Runs before `astro build`, writes to `public/`; never at request time (`workerd` can't run sharp) |
| Static asset serving (`/gallery/<slug>/hero-*.webp`) | Cloudflare Static Asset CDN | — | Files in `public/` are bundled into `dist/client/` and served as free, uncapped static assets |
| Gallery grid route (`/gallery`) | Build (prerendered) | — | `export const prerender = true`; HTML emitted at build time |
| Gallery detail route (`/gallery/<slug>`) | Build (prerendered via `getStaticPaths`) | — | All slugs enumerated at build time; static HTML per piece |
| `og:image` meta tag | Build (inline in `[slug].astro`) | — | Phase 2 inlines; Phase 3 `SEO.astro` refactors |
| Pop-up schema definition | Build (Astro content layer) | — | Schema validated at build; rendering is Phase 3 |
| Site config | Build (Astro content layer) | — | Single `file()` loader entry; consumed by layouts in Phase 3+ |
| CONTENT_EDITING.md | Documentation (repo root) | — | Static markdown for the founder; not part of the build |

---

## 1. Astro 6 Content Collections — Pinned API & Code Template

[VERIFIED: Context7 / docs.astro.build/en/guides/content-collections]

### File location

`src/content.config.ts` is the **current Astro 6 convention**. Astro 6 explicitly removed the legacy `src/content/config.ts` path and emits an error if it is found. Any file at `src/content/config.ts` must be renamed. [VERIFIED: Context7 — "Removed: legacy content collections... rename and move it to `src/content.config.ts`"]

### `glob()` loader pattern

```typescript
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod'; // use astro/zod, not standalone zod

const gallery = defineCollection({
  loader: glob({
    base: './src/content/gallery',
    pattern: '*/index.md',          // matches cluster-blush/index.md etc.
  }),
  schema: ({ image }) =>
    z.object({
      name:         z.string(),
      hero:         image(),         // D-16: singular, required
      price:        z.number().int().positive(),
      status:       z.enum(['available', 'sold', 'one-of-one', 'reserved']),
      description:  z.string(),
      featured:     z.boolean().default(false),
      published_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date
    }).strict(),                     // Pitfall #11: catches typos
});

const popups = defineCollection({
  loader: glob({
    base: './src/content/popups',
    pattern: '*.md',
  }),
  schema: ({ image }) =>
    z.object({
      name:        z.string(),
      date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      end_date:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      start_time:  z.string(),
      end_time:    z.string(),
      tz:          z.string().default('America/Los_Angeles'),
      location:    z.string(),
      address:     z.string().optional(),
      description: z.string().optional(),
      link:        z.string().url().optional(),
    }).strict(),
});

const site = defineCollection({
  loader: file('./src/content/site/config.md'),
  schema: z.object({
    tagline:       z.string(),
    contact_email: z.string().email(),
    ig_handle:     z.string(),
    ig_dm_url:     z.string().url(),
    footer_text:   z.string(),
    og_title:      z.string(),
    og_description: z.string(),
  }).strict(),
});

export const collections = { gallery, popups, site };
```

**Key API notes (all verified against Context7):**

- Import `z` from `'astro/zod'`, NOT from standalone `zod` package. Astro 6 bundles Zod 4; a separate install or `import from 'zod'` can create version mismatch.
- `schema: ({ image }) => z.object({...})` — the schema is a function that receives `{ image }` from Astro when using the `image()` helper. Without the function form, `image()` is undefined.
- `image()` validates at build time that the referenced file exists relative to the `index.md` file. If `hero.heic` is missing, the build fails with a clear error. [VERIFIED: Context7 / docs.astro.build/en/guides/images]
- `.strict()` on every `z.object()` — causes Zod to reject any key not in the schema, firing a build error on typos like `availabilty`. [VERIFIED: Pitfall #11 / PITFALLS.md]
- The glob `pattern: '*/index.md'` will match `cluster-blush/index.md` and use `cluster-blush` as the entry `id`.

### Entry `id` vs `slug` in Astro 6

In Astro 6 Content Collections v2, the `slug` property on collection entries is **gone**. Use `entry.id` instead. The `id` is derived from the file path relative to the collection base — for `cluster-blush/index.md` with `base: './src/content/gallery'`, `entry.id` = `'cluster-blush'` (the folder name, because the file is named `index.md`). [VERIFIED: Context7 — "Replace instances of `slug` with `id` in your code"]

### `getCollection` result shape

```typescript
const entries = await getCollection('gallery');
// each entry:
// {
//   id: 'cluster-blush',       // the slug for routing
//   data: {
//     name: 'Blush cluster',
//     hero: { src: '...', width: ..., height: ..., format: ... },
//     price: 48,
//     status: 'available',
//     description: '...',
//     featured: true,
//     published_at: '2026-05-13',
//   },
//   filePath: '...src/content/gallery/cluster-blush/index.md',
// }
```

The `data.hero` field when using `image()` resolves to an image metadata object — but note: because Phase 2 uses `passthroughImageService()` and serves pre-optimized WebPs from `public/gallery/<slug>/`, the `image()` helper is used here **only for build-time validation** (confirms `hero.heic` exists). The actual `<img src>` in the rendered HTML points to `/gallery/<slug>/hero-800.webp` (constructed by the detail page, not from `entry.data.hero.src`). This is intentional and correct — `entry.data.hero.src` would point into the content directory (not `public/`), which is not what Phase 2 serves.

---

## 2. Sharp + HEIC Pipeline — Picked Deps & Code Template

### HEIC dependency decision

**Recommendation: `heic-convert@2.1.0`** (pure JS, no system libs). [VERIFIED: npm registry]

| Option | System deps | Works on CI (no apt step) | Verdict |
|--------|-------------|--------------------------|---------|
| Sharp prebuilt + `apt-get install libheif-dev` + `SHARP_FORCE_GLOBAL_LIBVIPS` | `libheif-dev` apt package + rebuild sharp from source | No — requires compiling libvips from source; prebuilt binaries ignore global libvips unless special env var set AND npm installs from source | Reject |
| `heic-convert@2.1.0` (npm) | None — uses `heic-decode@^2.0.0` + `jpeg-js` + `pngjs` (all pure JS) | Yes — zero system deps | **Use this** |
| `heic-decode` + separate encoder | Same as heic-convert but manual pipeline | Yes | Unnecessary complexity |

[VERIFIED: `npm view heic-convert dependencies` returns `{ 'heic-decode': '^2.0.0', 'jpeg-js': '^0.4.4', pngjs: '^6.0.0' }` — all pure JS]

[CITED: github.com/catdad-experiments/heic-convert — "pure-javascript implementations of a jpeg and png encoder"]

**Critical implication:** The CI step `apt-get install -y libheif-dev` that was mentioned in D-04 and CONTEXT.md is NOT needed. Drop it. The `heic-convert` package is pure JS and installs cleanly on any Node 22+ environment.

### Sharp version

`sharp@0.34.5` (latest stable). [VERIFIED: npm registry]

### Prebuild script — complete implementation template

`scripts/prebuild-images.mjs`:

```javascript
// scripts/prebuild-images.mjs
// Converts src/content/gallery/*/hero.{heic,jpg,jpeg,png} to
// public/gallery/<slug>/hero-{400,800,1600}.webp for every gallery piece.
//
// Usage: node scripts/prebuild-images.mjs
// Runs before astro build in CI (explicit step) and locally via pnpm run prebuild:images.

import { readdir, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';
import convert from 'heic-convert';

const GALLERY_SRC = './src/content/gallery';
const GALLERY_OUT = './public/gallery';
const WIDTHS = [400, 800, 1600];
const WEBP_QUALITY = 80; // D-03 note: 80 chosen for jewelry photography (richer detail)

const slugDirs = await readdir(GALLERY_SRC, { withFileTypes: true });

for (const dirent of slugDirs) {
  if (!dirent.isDirectory()) continue;
  const slug = dirent.name;

  // Find hero.* — any extension (HEIC/jpg/jpeg/png)
  const heroExts = ['hero.heic', 'hero.jpg', 'hero.jpeg', 'hero.png'];
  let heroPath = null;
  for (const name of heroExts) {
    const candidate = join(GALLERY_SRC, slug, name);
    if (existsSync(candidate)) { heroPath = candidate; break; }
  }
  if (!heroPath) {
    console.warn(`[prebuild] WARNING: no hero.* found for ${slug}, skipping`);
    continue;
  }

  const outDir = join(GALLERY_OUT, slug);
  await mkdir(outDir, { recursive: true });

  // Read source file
  let sourceBuffer = await readFile(heroPath);

  // Convert HEIC → JPEG buffer (pure JS via heic-convert)
  if (extname(heroPath).toLowerCase() === '.heic') {
    const jpegBuffer = await convert({
      buffer: sourceBuffer,
      format: 'JPEG',
      quality: 1,       // max quality for the intermediate — sharp will compress to WebP
    });
    sourceBuffer = Buffer.from(jpegBuffer);
  }

  // Generate responsive WebP variants via sharp
  for (const w of WIDTHS) {
    const outPath = join(outDir, `hero-${w}.webp`);
    await sharp(sourceBuffer)
      .resize(w, null, { fit: 'inside', withoutEnlargement: true }) // D-03: aspect-preserving
      .webp({ quality: WEBP_QUALITY })
      .toFile(outPath);
    console.log(`[prebuild] ${slug}/hero-${w}.webp`);
  }
}

console.log('[prebuild] Done.');
```

**Performance note:** 6 pieces × 3 widths = 18 WebP files. Sharp is single-threaded but fast. On a 4-core ubuntu-latest runner, 18 transforms on ~3–6 MB source files completes in under 30 seconds. No parallelism needed for v1. [ASSUMED — based on typical sharp benchmark data; actual CI time unverified]

### Package additions to `package.json`

```json
{
  "devDependencies": {
    "sharp": "^0.34.5",
    "heic-convert": "^2.1.0"
  }
}
```

Both are `devDependencies` — the prebuild script only runs on CI and locally, never at runtime in `workerd`.

---

## 3. Prebuild Trigger — Explicit CI Step (Option A, modified)

### Options evaluated

| Option | Mechanism | Dev (astro dev) behavior | CI reproducibility | Verdict |
|--------|-----------|-------------------------|-------------------|---------|
| A: npm `prebuild` lifecycle hook | `"prebuild": "node scripts/prebuild-images.mjs"` | Fires on `pnpm run build` only if `.npmrc enable-pre-post-scripts=true` | **Requires .npmrc change** — pnpm 10 disables pre/post hooks by default | Risky — silent skip without the .npmrc |
| B: Astro integration hook (`astro:build:setup`) | Custom integration in `astro.config.mjs` | Fires during both `astro dev` (unnecessary) and `astro build` | No extra config needed | Overcomplex — fires during dev when WebPs don't need regenerating |
| C: Vite plugin | `config.plugins.push(...)` in astro.config.mjs | Same as B | Same | Overcomplex |
| **D: Explicit CI step + npm alias** | Dedicated `prebuild:images` script; CI calls it before `astro build` | Doesn't fire during `astro dev` (correct — CONTEXT.md says dev doesn't need optimized variants) | Fully explicit, zero ambiguity | **Use this** |

**Recommendation: Option D — explicit CI step.** [VERIFIED: pnpm.io/scripts — pnpm 10 only runs lifecycle scripts `preinstall/postinstall/prepare` by default; pre/post user-script hooks require `enable-pre-post-scripts=true` in `.npmrc`]

The project already uses this pattern: Phase 1's `write-assetsignore.mjs` is an explicit CI step, not a postbuild hook. Stay consistent.

### Implementation

`package.json` scripts addition:
```json
{
  "scripts": {
    "prebuild:images": "node scripts/prebuild-images.mjs"
  }
}
```

`.github/workflows/ci.yml` — add ONE new step before the existing `Build` step:
```yaml
- name: Generate responsive WebP variants (prebuild)
  run: pnpm run prebuild:images
```

### Local dev behavior

Developers who want optimized variants locally run `pnpm run prebuild:images` once before `pnpm dev`. The variants live in `public/gallery/` (gitignored) and persist across dev server restarts. During `astro dev`, plain `<img src="/gallery/<slug>/hero-800.webp">` tags work only if the variants exist — if they don't, the image shows the `--cream-200` fallback background (acceptable during local development). No dev-blocking behavior.

---

## 4. `og:image` Strategy — Inline on Detail Page

### Options evaluated

| Option | Complexity | Phase 3 rework | Verdict |
|--------|-----------|----------------|---------|
| (a) Inline `<meta property="og:image">` on `[slug].astro` | Minimal | Phase 3 `SEO.astro` absorbs it by passing `ogImage` prop to the shared component | **Use this** |
| (b) Ship minimal `<SEO />` component now | Medium | None | Over-engineering Phase 2; builds something Phase 3 will rewrite anyway |
| (c) `ogImage` prop on `BaseLayout.astro` | Medium | BaseLayout prop proliferation | BaseLayout shouldn't know about per-page OG images; that's SEO component's job |

**Recommendation: option (a)** — inline on `[slug].astro`. Phase 3's PAG-07 task absorbs it cleanly into the shared `SEO.astro` component. The rework is exactly one moved `<meta>` tag.

### Absolute URL construction

Astro 6's `Astro.site` holds the configured site URL. Inside `getStaticPaths()`, use `import.meta.env.SITE` (Astro 6 removed `Astro.site` access from `getStaticPaths`). On the page template itself, `Astro.site` works fine. [VERIFIED: Context7 — "Replace `Astro.site` with `import.meta.env.SITE` in `getStaticPaths()`"]

```astro
---
// In [slug].astro page template (outside getStaticPaths)
const ogImage = new URL(`/gallery/${entry.id}/hero-800.webp`, Astro.site).toString();
// Astro.site = 'https://studiobluemli.com' (from astro.config.mjs — already set)
// Result: 'https://studiobluemli.com/gallery/cluster-blush/hero-800.webp'
---
<meta property="og:image" content={ogImage} />
```

**Preview deploy behavior:** On PR preview deploys, `Astro.site` is still `https://studiobluemli.com` (hardcoded in `astro.config.mjs`). The 800w WebP is also served at the preview URL, but the `og:image` URL points at the apex domain (not the preview URL). For SC4 (og:image works on IG unfurls), this means the og:image 404s from the preview URL perspective — but the preview is not apex, so this is acceptable. The IG crawler will follow the apex URL, which won't exist until Phase 5. SC4 can be verified against the apex domain during Phase 5 OG validation. [ASSUMED — Cloudflare Workers preview behavior; acceptable tradeoff confirmed by D-12 context]

---

## 5. `getStaticPaths()` + `prerender` — Code Template

[VERIFIED: Context7 / docs.astro.build/en/reference/routing-reference]

```astro
---
// src/pages/gallery/[slug].astro
export const prerender = true; // required under output: 'server' (Plan 01 contract)

import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/design-skill/Header';
import Footer from '../../components/design-skill/Footer';

export async function getStaticPaths() {
  const pieces = await getCollection('gallery');
  return pieces.map((entry) => ({
    params: { slug: entry.id },   // entry.id = 'cluster-blush' (Astro 6 v2 API)
    props:  { entry },
  }));
}

const { entry } = Astro.props;
const { name, price, status, description } = entry.data;
const slug = entry.id;

// Construct URLs pointing to prebuild WebP variants in public/gallery/
const heroSrc    = `/gallery/${slug}/hero-800.webp`;
const ogImageUrl = new URL(`/gallery/${slug}/hero-800.webp`, Astro.site).toString();

// CTA copy per D-11
const ctaCopy = status === 'sold'
  ? 'This pair sold — DM me about something similar'
  : 'Ask about this pair on Instagram';

// Status label per UI-SPEC
const statusLabel = { available: 'Available', sold: 'Sold', 'one-of-one': 'One of one', reserved: 'Reserved' }[status];
---
<BaseLayout title={`${name} — Studio Bluemli`}>
  <meta slot="head" property="og:image" content={ogImageUrl} />
  <Header slot="header" active="/gallery" />

  <div class="detail-plate">
    <div class="back-row">
      <a href="/gallery" class="back-link">← Back to the gallery</a>
    </div>

    <img
      class="product-photo"
      src={heroSrc}
      alt={name}
      loading="eager"
      decoding="async"
    />

    <h1 class="name">{name}</h1>
    <div class="meta-row">
      <span class="price">${price}</span>
      <span class={`status-badge ${status}`}>{statusLabel}</span>
    </div>
    <p class="description">{description}</p>

    <div class="cta-stack">
      <a class="cta-button" href="https://ig.me/m/studiobluemli">{ctaCopy}</a>
      <span class="mailto-fallback">
        or email <a href="mailto:hi@studiobluemli.com">hi@studiobluemli.com</a>
      </span>
    </div>

    <div class="back-bottom">
      <a href="/gallery" class="back-link">← Back to the gallery</a>
    </div>
  </div>

  <Footer slot="footer" />
</BaseLayout>
```

**Notes:**
- `loading="eager"` on the hero — it is the LCP element (Pitfall #8, UI-SPEC performance contract).
- `slot="head"` for the `og:image` meta requires `BaseLayout.astro` to have a named `<slot name="head" />` inside its `<head>`. Verify this exists or add it in Phase 2.
- Dynamic file: `src/pages/gallery/[slug].astro` — square brackets, all lowercase.

### Gallery index page rewiring

`src/pages/gallery.astro` — swap `sampleGallery` import for Content Collections:

```astro
---
export const prerender = true;

import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/design-skill/Header';
import GalleryGrid from '../components/design-skill/GalleryGrid';
import Footer from '../components/design-skill/Footer';

const allPieces = await getCollection('gallery');

// Sort newest-first by published_at (D-14)
const pieces = allPieces
  .sort((a, b) => b.data.published_at.localeCompare(a.data.published_at))
  .map((entry) => ({
    slug:   entry.id,
    name:   entry.data.name,
    price:  entry.data.price,
    status: entry.data.status,
    photo:  `/gallery/${entry.id}/hero-400.webp`,  // 400w for grid thumbnails
  }));
---
<BaseLayout title="Gallery — Studio Bluemli">
  <Header slot="header" active="/gallery" />
  <GalleryGrid pieces={pieces} />
  <Footer slot="footer" />
</BaseLayout>
```

The `GalleryGrid.jsx` component's existing prop shape (`slug/name/price/status/photo`) matches exactly. The card `<a href>` should be updated in `GalleryGrid.jsx` to link to `/gallery/${piece.slug}` if not already present (the existing JSX uses `<article>` — Phase 2 must add the link wrapper per the UI-SPEC's `<a class="card">` pattern from sketch-findings).

---

## 6. `passthroughImageService()` + `public/` Bundling — Confirmed Semantics

[VERIFIED: Context7 / docs.astro.build/en/guides/images]

**Confirmed behavior:**
1. Astro `astro build` copies everything in `public/` into `dist/client/` verbatim. [VERIFIED: Context7 — "Files in this directory are served at the root during development and copied to the build output"]
2. With `passthroughImageService()`, `<Image>` and `<Picture>` components perform **zero transformation** — they just emit `<img>` tags with the provided `src`. Width/height prevention still works if you provide them explicitly; `alt` enforcement still applies.
3. For Phase 2, plain `<img>` tags are used directly (not `<Image>`), since the src path is a string `/gallery/<slug>/hero-800.webp` — there's nothing for `astro:assets` to transform even if you used `<Image>`. This is correct and intentional.
4. The Cloudflare Worker serves files from `dist/client/` as static assets (free, uncapped bandwidth per the Workers pricing page). Variants at `/gallery/<slug>/hero-400.webp`, `/gallery/<slug>/hero-800.webp`, and `/gallery/<slug>/hero-1600.webp` will be served correctly after the prebuild script runs and `astro build` copies them.

**The `<img>` + `srcset` question:** The UI-SPEC performance contract says "all product images include `width` + `height` attributes." For the grid card, `<img>` with `width=240 height=300` (4:5 ratio at 240px) and `loading="lazy"` is sufficient. Optional `srcset` for the detail page hero (`hero-800.webp 800w, hero-1600.webp 1600w`) can be added for Retina but is not required for SC1. Add it in the `[slug].astro` template for completeness at minimal cost.

---

## 7. `.gitignore` + Initial Folder State

### `.gitignore` entry

Add to `.gitignore`:
```
# Gallery prebuild WebP variants (regenerated each build — see scripts/prebuild-images.mjs)
public/gallery/
```

**Why `public/gallery/` and not a deeper pattern:** The entire `public/gallery/` subtree is build-generated. There is no hand-authored content to commit there. The pattern `public/gallery/` (the directory itself) correctly ignores all files recursively and is clean to explain in CONTENT_EDITING.md.

### Initial folder state

No `.gitkeep` needed. Astro does not require `public/gallery/` to exist before the build — `mkdir({ recursive: true })` in the prebuild script creates the directory structure. The `scripts/prebuild-images.mjs` script handles this for every slug it processes.

The `public/sample/` directory (Phase 1 placeholder SVGs) should remain uncommitted-to-removal until after the sample-data deletion is confirmed. Sequence: (1) create `src/content.config.ts`, (2) create 6 `index.md` files, (3) run prebuild to populate `public/gallery/`, (4) rewire pages, (5) delete `src/sample-data.ts` and uncomment Rule 7, (6) delete `public/sample/` folder (no longer needed).

---

## 8. Validation Architecture (Nyquist)

The project's `lighthouserc.json` and CI workflow (`ci.yml`) already form the test backbone. Phase 2 adds three new verification concerns on top of Phase 1's existing checks.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No unit test framework — existing checks are: `astro check` (TypeScript), `bash scripts/check-brand-rules.sh`, `scripts/check-no-hydration.sh`, Lighthouse CI |
| Quick run command | `pnpm exec astro check && pnpm exec astro build` |
| Full suite command | Full CI workflow (brand-check + lowercase + no-hydration + Lighthouse) |
| Phase gate | Full CI green on preview deploy before `/gsd-verify-work` |

### SC1–SC5 → Test Map

| SC | Behavior | Test Type | Automated Command | Already Exists? |
|----|----------|-----------|-------------------|-----------------|
| SC1 | New piece appears on `/gallery` and `/gallery/<slug>` after founder edits `index.md` via GitHub UI | Smoke — preview deploy check | Push a commit touching one `index.md`, wait for Cloudflare preview, curl `/gallery` and `/gallery/cluster-blush` for 200 + piece name | Manual (requires preview deploy) |
| SC2 | Typo'd frontmatter field fails build with clear Zod error | Build validation | `echo "availabilty: sold" >> src/content/gallery/cluster-blush/index.md && pnpm exec astro build 2>&1 \| grep -i zod` — expect non-zero exit | Wave 0: needs a `test-schema-strict.sh` script |
| SC3 | Sold piece renders with quiet "Sold" badge in `--lavender-500` — never hidden | Visual + grep | `grep -n "lavender" src/pages/gallery/[slug].astro` for CSS; Playwright smoke hit `/gallery/cluster-sage` after flipping status to sold and verify "Sold" text present | Wave 0: needs Playwright smoke |
| SC4 | Per-piece `og:image` emits absolute URL on detail page | Build + grep | `pnpm exec astro build && grep -r "og:image" dist/client/gallery/cluster-blush/index.html \| grep "studiobluemli.com"` | Wave 0: new check |
| SC5 | `CONTENT_EDITING.md` exists with zero CLI steps | Grep | `test -f CONTENT_EDITING.md && ! grep -E "\b(npm|git|cd|pnpm|node)\b" CONTENT_EDITING.md` | Wave 0: needs CONTENT_EDITING.md + the grep |

### Validation Architecture: Sampling Rate

- **Per task commit:** `pnpm exec astro check` (fast — 3–5 seconds)
- **Per wave merge:** `pnpm exec astro build` + brand-check + lowercase-check
- **Phase gate:** Full CI green (including Lighthouse ≥ 90) + SC2 typo test + SC4 og:image grep + SC5 CONTENT_EDITING.md check before `/gsd-verify-work`

### Wave 0 Gaps

These items must exist before implementation tasks begin:

- [ ] `scripts/test-schema-strict.sh` — deliberately typo a frontmatter field, run `astro build`, assert non-zero exit and Zod error in output (SC2)
- [ ] Playwright smoke test addition — hit `/gallery` and `/gallery/cluster-blush`, assert 200 + piece name + "Back to the gallery" link (SC1, SC3)
- [ ] `CONTENT_EDITING.md` (itself is a Wave 0 artifact — it must exist before SC5 can be verified) (SC5)

Note: Playwright is already in the stack plan (CLAUDE.md) but no `playwright.config.ts` or test files exist yet. Wave 0 creates the config + one smoke test file.

---

## 9. CONTENT_EDITING.md Outline

`CONTENT_EDITING.md` at repo root (CNT-12 / SC5). Must contain exactly zero `git`/`npm`/`cd`/`pnpm`/`node`/`terminal` instructions.

### Required sections

1. **Overview** — "How to add or update gallery pieces and pop-ups using GitHub's website. No code knowledge needed."
2. **Adding a new gallery piece** (step-by-step with screenshots)
   - Navigate to `src/content/gallery/` on GitHub
   - Click "Add file → Create new file"
   - Name it `your-piece-name/index.md` (the `/` creates a folder)
   - Paste the frontmatter template (name, price, status, description, featured, published_at)
   - Commit to a new branch → Open Pull Request → Wait ~3 minutes for preview deploy URL in the PR
   - Click the preview URL to verify the piece looks right
   - Click "Merge pull request"
3. **Uploading the photo** (step-by-step with screenshots)
   - Navigate to `src/content/gallery/your-piece-name/`
   - "Add file → Upload files"
   - Drag the HEIC/JPG/PNG from iPhone Photos — no resizing needed
   - Name it `hero.heic` (or `hero.jpg`) before uploading
   - Commit to the **same branch** as the `index.md` (or commit to main after merge — the piece will show a fallback background until the photo is present and the next build runs)
4. **Editing an existing piece** (click pencil icon on `index.md`, edit, commit to new branch, merge)
5. **Marking a piece as sold** — "Change `status: available` to `status: sold` in the piece's `index.md`. The piece stays in the gallery with a 'Sold' label."
6. **NEVER DELETE A PIECE** — "Deleting a folder removes the piece from the portfolio archive permanently. Instead, always flip the status to sold. If a piece was a one-of-a-kind, use `status: one-of-one`."
7. **Adding a pop-up event** (same GitHub UI flow, `src/content/popups/YYYY-MM-DD-event-name.md`)
8. **Frontmatter reference card** — table of every field with examples and allowed values
9. **Troubleshooting** — "The build failed" (check the PR's CI tab for the Zod error message; it names the exact field that has a typo)

---

## 10. Pitfalls Active in Phase 2 — Mitigation Notes

### Pitfall #6: Sold pieces removed instead of marked sold
**Status:** Addressed by D-11 (CTA text flips), CNT-10 (enum, not boolean hidden), and CONTENT_EDITING.md Section 6 ("NEVER DELETE A PIECE"). The `status` field is a required Zod enum — there is no "deleted" state; only `sold`.

### Pitfall #8: Unoptimized photos blow up LCP
**Status:** Addressed by D-01 (prebuild script outputs 400/800/1600w WebPs) and UI-SPEC image contract (`loading="eager"` on hero, `loading="lazy"` on grid cards). Verify in Lighthouse CI that LCP < 2.5s on the gallery detail page. The `--cream-200` background on `<img>` prevents a blank flash while the image streams.

### Pitfall #11: Zod schema not strict
**Status:** Addressed by `.strict()` on all three collection schemas. Verified by SC2 test (deliberate typo causes build failure). The `.strict()` call must be on the `z.object({})` returned from the schema function, not on the outer `defineCollection` wrapper.

### Pitfall #12: Image filename rename breaks references
**Status:** Addressed by `hero: image()` in the schema. If `hero.heic` is renamed (e.g., to `hero2.heic`), the build fails immediately because `image()` validates the referenced file at build time. The per-slug folder structure means the slug is the only routing dependency — renaming the _folder_ (slug rename) is the one thing the founder does via GitHub's "edit filename" path on `index.md`.

### Pitfall #23: Founder workflow requires CLI
**Status:** Addressed by CONTENT_EDITING.md (CNT-12, SC5). The prebuild script runs on CI, never locally. The founder's entire workflow is GitHub web UI: drag photo, edit frontmatter, open PR, click preview, merge. SC5 grep confirms zero CLI-instruction words appear in the doc.

---

## 11. Phase 1 Loose Ends — Disposition

### CR-03: `ProductSheet.jsx` unused (onClick handlers without client: directive)

**Disposition: Delete ProductSheet.jsx in Phase 2.**

D-09 explicitly picks "photo-forward single column" for the detail page — there is no modal. ProductSheet is not imported by any page or layout (confirmed by 01-VERIFICATION.md). Keeping it as dead code creates confusion and could cause problems if a future automated import tries to wire it. Delete it in Wave 1 of Phase 2 before building the detail page, and note in a code comment in `[slug].astro` that the modal variant is deferred to v1.x.

### CR-05: Rule 1 misses uppercase `#FFF` (3-digit)

**Disposition: Fix in Phase 2 Wave 1 as cleanup debt.**

The current regex in `scripts/check-brand-rules.sh` line 22:
```
#fff(?![0-9a-fA-F])|#[fF]{6}
```
The 3-digit branch is lowercase-only. Fix:
```
#[fF]{3}(?![0-9a-fA-F])|#[fF]{6}
```
This catches `#FFF`, `#fff`, `#Fff`, etc. while still whitelisting `#fff8` (the `(?![0-9a-fA-F])` negative lookahead). This is a one-line fix in `check-brand-rules.sh`. Since Phase 2 introduces `src/content/` — new content the grep scans — this is the right time to close the gap. Track as a Wave 1 prep task (not a blocker for schema definition).

---

## 12. Sketch Findings — Concrete Patterns to Reuse

All patterns below are from `.claude/skills/sketch-findings-bluemli/references/gallery-surfaces.md` (winner sketches: 001-A detail page, 002-A grid sold treatment).

The executor must load this file as `read_first` before implementing `src/pages/gallery/[slug].astro` and before modifying `src/components/design-skill/GalleryGrid.jsx`.

### Detail page: CSS patterns to copy verbatim

```css
/* From: .claude/skills/sketch-findings-bluemli/references/gallery-surfaces.md */
/* Place in a <style> scoped block in src/pages/gallery/[slug].astro */

.detail-plate {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--space-4) var(--space-5) var(--space-9);
}
.detail-plate .product-photo {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-6);
  background: var(--cream-200);
}
.detail-plate h1.name {
  font-family: var(--font-display);
  font-size: var(--fs-3xl);
  line-height: var(--lh-tight);
  color: var(--coral-500);
  text-align: center;
  margin: 0 0 var(--space-3);
}
.detail-plate .meta-row {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: var(--space-4);
  font-family: var(--font-body);
  margin-bottom: var(--space-5);
}
.detail-plate .meta-row .price {
  font-size: var(--fs-lg);
  font-weight: 800;
  color: var(--indigo-700);
}
/* Status badge — eyebrow caps */
.status-badge {
  font-size: var(--fs-xxs);
  font-weight: 700;
  font-family: var(--font-body);
  text-transform: uppercase;
  letter-spacing: var(--ls-caps);
}
.status-badge.available { color: var(--color-fg-muted); font-weight: 400; }
.status-badge.sold      { color: var(--lavender-500);   font-weight: 700; }
.status-badge.one-of-one{ color: var(--color-accent-leaf); font-weight: 700; }
.status-badge.reserved  { color: var(--lavender-500);   font-weight: 700; }

.detail-plate .description {
  font-family: var(--font-body);
  font-size: var(--fs-md);
  line-height: var(--lh-loose);
  color: var(--color-fg);
  text-align: center;
  max-width: 520px;
  margin: 0 auto var(--space-6);
}
.detail-plate .cta-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-7);
}
.cta-button {
  display: inline-block;
  background: var(--coral-500);
  color: var(--color-fg-on-coral);
  text-decoration: none;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-pill);
  font-family: var(--font-body);
  font-weight: 800;
  font-size: var(--fs-sm);
}
.cta-button:hover  { background: var(--coral-700); }
.cta-button:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 3px; }

.mailto-fallback {
  font-family: var(--font-body);
  font-size: var(--fs-xs);
  color: var(--color-fg-muted);
  line-height: var(--lh-normal);
}
.mailto-fallback a {
  color: var(--color-link);
  text-decoration: underline;
}
.back-link {
  display: inline-block;
  font-family: var(--font-body);
  font-size: var(--fs-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: var(--ls-caps);
  color: var(--color-fg-muted);
  text-decoration: none;
  line-height: var(--lh-snug);
  margin-bottom: var(--space-5);
}
.back-link:hover { color: var(--coral-500); }
.back-link:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 4px; }
```

**Rejected directions (do not reintroduce):** name > 48px, left-aligned desktop layout, photo drop-shadow, "Sold" as eyebrow above name.

### Grid card: updates to `GalleryGrid.jsx`

The existing `GalleryGrid.jsx` uses `<article>` without a link wrapper. Phase 2 must update the card structure to:
1. Wrap in `<a href={`/gallery/${piece.slug}`} class="card">` (full card is the link target)
2. Apply per-status color to the status span (CSS class based on status value)
3. Use `loading="lazy"` on grid card images (below the fold; the first-above-fold image is the hero, which is on the detail page)
4. Match the `minmax(240px, 1fr)` from the sketch (vs current 260px) — pick 240px per sketch-findings recommendation

```css
/* Updated grid CSS patterns from sketch-findings — Sketch 002-A */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-5);
}
.card {
  background: var(--color-surface-card);
  border-radius: var(--radius-sm);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  display: block;
}
.card:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 4px; }
.card-photo {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  background: var(--cream-200);
}
.card-body { padding: var(--space-3) var(--space-4) var(--space-4); }
.card-name {
  font-family: var(--font-body);
  font-size: var(--fs-sm);
  font-weight: 700;
  color: var(--color-fg-strong);
  margin: 0 0 var(--space-1);
}
.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--font-body);
  font-size: var(--fs-xs);
}
.card-price { color: var(--color-fg-strong); font-weight: 700; }
.card-status.available  { color: var(--color-fg-muted); font-weight: 400; }
.card-status.sold       { color: var(--lavender-500);   font-weight: 700; }
.card-status.one-of-one { color: var(--color-accent-leaf); font-weight: 700; }
.card-status.reserved   { color: var(--lavender-500);   font-weight: 700; }
```

**Note on GalleryGrid.jsx style approach:** The existing file uses inline `style={{}}` objects. Phase 2 should migrate the card structure to CSS classes (either scoped via `<style>` in `gallery.astro` referencing JSX class names, or by keeping the inline styles but adding the CSS class names for the status-color variants). The simplest approach: keep inline styles for layout, add `className` props for the status-color variants, and add a `<style is:global>` block in `gallery.astro` for `.card-status.*` rules. The `GalleryGrid.jsx` file is in `src/components/design-skill/` — it may be edited freely since it was copied from the skill in Phase 1.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HEIC decoding | A C-extension wrapper for libheif | `heic-convert@2.1.0` | Pure JS, no system deps, no CI config changes |
| Image resizing / WebP encoding | A custom image pipeline | `sharp@0.34.5` | Battle-tested, handles all edge cases (rotation from EXIF, color profiles, etc.) |
| Schema validation | Manual frontmatter parsing | `astro/zod` + `defineCollection` | Build-time error messages, TypeScript inference |
| Slug enumeration for detail pages | Custom file-system walk | `getCollection()` + `getStaticPaths()` | Astro handles the static-path generation correctly |

---

## Runtime State Inventory

Phase 2 is not a rename or migration phase — no runtime state is affected. The `src/sample-data.ts` deletion is a source-code change, not a data migration. No stored records, live service configs, OS-registered state, secrets, or build artifacts carry the "sample data" content beyond the source files themselves.

**Step 2.6: SKIPPED** — external dependencies for Phase 2 are: `sharp` (new devDep, installed via pnpm) and `heic-convert` (new devDep, installed via pnpm). Both are npm packages, no system service dependencies.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js ≥ 22.12 | sharp, heic-convert, astro build | ✓ | 22.12 (pinned in .nvmrc) | — |
| pnpm 10 | CI package manager | ✓ | 10 (ci.yml action) | — |
| ubuntu-latest (GitHub Actions) | CI runner | ✓ | ubuntu-24.04 | — |
| `sharp` npm package | prebuild-images.mjs | ✗ (not yet installed) | 0.34.5 | — (must add to devDeps) |
| `heic-convert` npm package | prebuild-images.mjs | ✗ (not yet installed) | 2.1.0 | — (must add to devDeps) |
| `libheif-dev` (apt) | NOT NEEDED | n/a | n/a | n/a — heic-convert is pure JS |

**Missing dependencies with no fallback:**
- `sharp@0.34.5` — add to `devDependencies` in Wave 1
- `heic-convert@2.1.0` — add to `devDependencies` in Wave 1

**Missing dependencies with fallback:** None.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `astro build` copies `public/gallery/` → `dist/client/gallery/` before the Cloudflare adapter packages the bundle, so prebuild variants are included in the deployed Worker assets | Section 6 | Images 404 in production; fix: verify `dist/client/gallery/` contains WebPs after `astro build` locally |
| A2 | On PR preview deploys, `Astro.site` resolves to `https://studiobluemli.com` (hardcoded), so `og:image` URLs point at the apex domain from preview deploys | Section 4 | og:image shows as broken image in PR preview; acceptable for Phase 2 SC4 which is validated post-Phase-5 |
| A3 | `heic-convert@2.1.0` correctly decodes standard iPhone HEIC (HEVC-compressed, 12-bit HDR or 8-bit SDR) to JPEG buffer. iPhone-generated HEIC with HDR metadata may produce slightly different color output than the original | Section 2 | Slight color shift in converted photos; acceptable — pre-optimized WebP is for web delivery, not archival |
| A4 | The prebuild script completes in under 60 seconds on a `ubuntu-latest` GitHub Actions runner for 6 source HEICs | Section 2 | CI timeout (set to 10 minutes); no real risk |
| A5 | The `glob({ pattern: '*/index.md' })` loader produces `entry.id = 'cluster-blush'` (folder name only, no `index.md` suffix) | Section 1 | Routing breaks (`/gallery/cluster-blush/index.md` instead of `/gallery/cluster-blush`); verify with `astro check` on first schema task |

---

## Open Questions (RESOLVED)

Both questions below were resolved during pattern mapping. RESOLVED markers and resolution links added inline.

1. **`BaseLayout.astro` `<slot name="head">` existence**
   - What we know: `BaseLayout.astro` emits the `<head>` block with favicon links and Font API tags.
   - What's unclear: Whether it has a named `<slot name="head" />` for per-page head additions.
   - Recommendation: Check `src/layouts/BaseLayout.astro` in the first task of Phase 2. If the slot is missing, add it as part of the Wave 1 prep task (one line).
   - **RESOLVED:** Plan 02-01 Task 3 adds the `<slot name="head" />` to `src/layouts/BaseLayout.astro` between the last `<Font />` preload and the global `<style>` tag.

2. **`GalleryGrid.jsx` migration: inline styles vs CSS classes for status colors**
   - What we know: Existing JSX uses inline `style={{}}` objects; the status color contract needs per-status CSS classes.
   - What's unclear: Whether to refactor the entire component to CSS classes or only add `className` for the status span.
   - Recommendation: Add `className={\`card-status ${piece.status}\`}` to the status `<span>` only; keep existing inline layout styles for the container, card, and photo. Scoped CSS in `gallery.astro` handles `.card-status.*` rules. Minimal diff.
   - **RESOLVED:** Plan 02-04 Task 1 adds `className={\`card-status ${piece.status}\`}` to the status `<span>` (no inline style mutation); Task 2 ships the matching `.card-status.available|.sold|.one-of-one|.reserved` rules in `gallery.astro`'s `<style is:global>` block using CSS attribute / class selectors.

---

## Sources

### Primary (HIGH confidence)
- [Context7 / docs.astro.build/en/guides/content-collections] — `glob()` loader API, `defineCollection`, `.strict()`, `image()` helper, entry `id` vs `slug`
- [Context7 / docs.astro.build/en/guides/upgrade-to/v6] — `src/content.config.ts` is the v6 convention; `slug` replaced by `id`; `Astro.site` replaced by `import.meta.env.SITE` in `getStaticPaths`
- [Context7 / docs.astro.build/en/guides/images] — `passthroughImageService()` semantics, `public/` bundling behavior, `image()` schema helper
- [Context7 / docs.astro.build/en/reference/routing-reference] — `getStaticPaths()` API, `params` + `props` shape, `prerender = true` requirement under `output: 'server'`
- [Context7 / docs.astro.build/en/reference/api-reference] — `Astro.site` + `new URL(path, Astro.site)` for canonical og:image URLs
- [npm view heic-convert dependencies] — `{ 'heic-decode': '^2.0.0', 'jpeg-js': '^0.4.4', pngjs: '^6.0.0' }` — VERIFIED pure JS
- [npm view sharp version] — `0.34.5` VERIFIED
- [npm view heic-convert version] — `2.1.0` VERIFIED
- [sharp.pixelplumbing.com/install] — prebuilt binaries do NOT include HEIC; requires custom libvips compile
- [pnpm.io/scripts] — pnpm 10 pre/post user-script hooks disabled by default; lifecycle scripts documented

### Secondary (MEDIUM confidence)
- [github.com/catdad-experiments/heic-convert] — pure-JS implementation confirmed; buffer-based API
- [github.com/lovell/sharp issues #3680, #4126, #4132] — community confirmation that installing libheif-dev system package does not enable HEIC in sharp prebuilt binaries
- [thedaviddias.com/notes/how-to-fix-post-pre-build-pnpm] — pnpm pre/post hook behavior; `enable-pre-post-scripts=true` in `.npmrc` required

### Tertiary (LOW confidence — training knowledge)
- Sharp WebP quality 80 vs 75 tradeoff for jewelry photography — [ASSUMED]
- Prebuild script CI runtime estimate (< 60s for 6 files) — [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack (Astro 6 API): HIGH — verified against Context7 + Astro docs
- HEIC pipeline (heic-convert, no system deps): HIGH — verified against npm registry + sharp install docs + GitHub issues
- pnpm pre/post hook behavior: HIGH — verified against pnpm.io/scripts
- Architecture patterns: HIGH — directly derived from locked decisions (D-01..D-17)
- Pitfalls: HIGH — cross-referenced with PITFALLS.md and CONTEXT.md mitigations
- Sketch findings application: HIGH — verbatim from validated gallery-surfaces.md

**Research date:** 2026-05-13
**Valid until:** 2026-08-13 (90 days — stable Astro 6 + sharp APIs; heic-convert is mature)

---

## RESEARCH COMPLETE
