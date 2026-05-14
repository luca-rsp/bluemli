# Phase 2: Content Schema & Gallery — Pattern Map

**Mapped:** 2026-05-13
**Files analyzed:** 10 new/modified files
**Analogs found:** 10 / 10

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/content.config.ts` | config | transform (schema validation at build) | `astro.config.mjs` — Astro config with typed integration | role-match |
| `src/content/gallery/<slug>/index.md` (×6) | content | batch (glob-loaded by Astro) | `src/sample-data.ts` — shape blueprint to replace | shape-reference |
| `scripts/prebuild-images.mjs` | utility | file-I/O + batch transform | `scripts/write-assetsignore.mjs` — Node ESM script, explicit CI step, `node:fs/promises` | exact |
| `src/pages/gallery/[slug].astro` | page/route | request-response (prerendered, `getStaticPaths`) | `src/pages/gallery.astro` — prerendered Astro page, same layout shell + component slots | exact |
| `src/pages/gallery.astro` | page/route | request-response (prerendered) | `src/pages/gallery.astro` (self — rewire only) | self |
| `src/components/design-skill/GalleryGrid.jsx` | component | request-response (server-rendered JSX) | `src/components/design-skill/GalleryGrid.jsx` (self — extend only) | self |
| `.github/workflows/ci.yml` | config | CI pipeline | `.github/workflows/ci.yml` (self — add one step) | self |
| `package.json` | config | build | `package.json` (self — add devDeps + script) | self |
| `.gitignore` | config | — | `.gitignore` (self — add one line) | self |
| `scripts/check-brand-rules.sh` | utility | batch (grep) | `scripts/check-brand-rules.sh` (self — uncomment Rule 7) | self |
| `CONTENT_EDITING.md` | documentation | — | none (new file type for this repo) | no-analog |

---

## Pattern Assignments

### `src/content.config.ts` (config, build-time schema validation)

**Analog:** `astro.config.mjs` for the Astro config export shape; `src/sample-data.ts` for the field names that map over.

**Key API note:** Import `z` from `'astro/zod'` — NOT standalone `zod`. Schema for `gallery` is a function `({ image }) => z.object({...})` to use the `image()` helper. In Astro 6 Content Collections v2, use `entry.id` (not `entry.slug`) for routing — `id` for `cluster-blush/index.md` with `base: './src/content/gallery'` resolves to `'cluster-blush'`.

**Imports pattern** (copy verbatim):
```typescript
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
```

**Gallery collection schema** (D-16 singular hero, D-17 published_at, Pitfall #11 .strict()):
```typescript
const gallery = defineCollection({
  loader: glob({
    base: './src/content/gallery',
    pattern: '*/index.md',
  }),
  schema: ({ image }) =>
    z.object({
      name:         z.string(),
      hero:         image(),
      price:        z.number().int().positive(),
      status:       z.enum(['available', 'sold', 'one-of-one', 'reserved']),
      description:  z.string(),
      featured:     z.boolean().default(false),
      published_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }).strict(),
});
```

**Popups collection schema** (Phase 2 defines schema only; rendering is Phase 3):
```typescript
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
```

**Site collection schema** (single `file()` loader):
```typescript
const site = defineCollection({
  loader: file('./src/content/site/config.md'),
  schema: z.object({
    tagline:        z.string(),
    contact_email:  z.string().email(),
    ig_handle:      z.string(),
    ig_dm_url:      z.string().url(),
    footer_text:    z.string(),
    og_title:       z.string(),
    og_description: z.string(),
  }).strict(),
});

export const collections = { gallery, popups, site };
```

---

### `scripts/prebuild-images.mjs` (utility, file-I/O + batch transform)

**Analog:** `scripts/write-assetsignore.mjs` (lines 1–108)

**Import pattern** (copy from analog, lines 26–29):
```javascript
import { promises as fs } from 'node:fs';
import path from 'node:path';
```
Phase 2 script uses the more granular named imports for clarity:
```javascript
import { readdir, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';
import convert from 'heic-convert';
```

**Guard pattern** — confirm source directory exists before proceeding (copy analog lines 44–50):
```javascript
// Analog uses try/catch on fs.stat(DIST). For prebuild, readdir will throw
// naturally if GALLERY_SRC doesn't exist — add an explicit stat guard:
const GALLERY_SRC = './src/content/gallery';
const GALLERY_OUT = './public/gallery';
```

**Core batch-transform pattern** — `readdir` → iterate → `mkdir({ recursive: true })` → transform (copy analog's walk pattern, lines 67–100, adapted for image transform):
```javascript
const slugDirs = await readdir(GALLERY_SRC, { withFileTypes: true });

for (const dirent of slugDirs) {
  if (!dirent.isDirectory()) continue;
  const slug = dirent.name;

  // Find hero.* — HEIC/jpg/jpeg/png
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

  let sourceBuffer = await readFile(heroPath);

  // HEIC → JPEG buffer (pure JS — no system deps, D-04 resolution)
  if (extname(heroPath).toLowerCase() === '.heic') {
    const jpegBuffer = await convert({ buffer: sourceBuffer, format: 'JPEG', quality: 1 });
    sourceBuffer = Buffer.from(jpegBuffer);
  }

  // Generate 3 WebP widths (D-03: 400/800/1600, fit: 'inside', quality: 80)
  const WIDTHS = [400, 800, 1600];
  for (const w of WIDTHS) {
    const outPath = join(outDir, `hero-${w}.webp`);
    await sharp(sourceBuffer)
      .resize(w, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outPath);
    console.log(`[prebuild] ${slug}/hero-${w}.webp`);
  }
}

console.log('[prebuild] Done.');
```

**Exit/logging style** (copy from analog lines 47–50):
```javascript
// Analog: console.error + process.exit(1) for hard failures; console.log for progress.
// Prebuild script: console.warn for skipped slugs (not fatal), console.log for each written file.
```

---

### `src/pages/gallery/[slug].astro` (page/route, prerendered via getStaticPaths)

**Analog:** `src/pages/gallery.astro` (lines 1–21) — same file structure: frontmatter block, `export const prerender = true`, BaseLayout shell, named slots.

**File structure contract** — copy the top of `gallery.astro`:
```astro
---
export const prerender = true;

import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/design-skill/Header';
import Footer from '../../components/design-skill/Footer';
```

**getStaticPaths pattern** (Astro 6 v2 — `entry.id`, not `entry.slug`):
```astro
export async function getStaticPaths() {
  const pieces = await getCollection('gallery');
  return pieces.map((entry) => ({
    params: { slug: entry.id },
    props:  { entry },
  }));
}

const { entry } = Astro.props;
const { name, price, status, description } = entry.data;
const slug = entry.id;
```

**og:image construction** (inline on detail page — D-12; Phase 3 SEO.astro absorbs it):
```astro
const ogImageUrl = new URL(`/gallery/${slug}/hero-800.webp`, Astro.site).toString();
```

**BaseLayout usage — named slots** (copy from `gallery.astro` lines 17–21):

`BaseLayout.astro` (lines 73–79) exposes `slot="header"` and `slot="footer"` but does NOT have a `<slot name="head" />` inside `<head>`. **Phase 2 must add `<slot name="head" />` to `BaseLayout.astro`** immediately before the closing `</head>` tag (line 68). Without this, the `<meta slot="head" property="og:image">` on the detail page will silently drop into the body.

```astro
<!-- Add to BaseLayout.astro <head> block, after the last <Font /> tag (line 37): -->
<slot name="head" />
```

Then in `[slug].astro`:
```astro
<BaseLayout title={`${name} — Studio Bluemli`}>
  <meta slot="head" property="og:image" content={ogImageUrl} />
  <Header slot="header" active="/gallery" />
  <!-- ... detail plate ... -->
  <Footer slot="footer" />
</BaseLayout>
```

**CTA copy pattern** (D-11):
```astro
const ctaCopy = status === 'sold'
  ? 'This pair sold — DM me about something similar'
  : 'Ask about this pair on Instagram';

const statusLabel = {
  available:  'Available',
  sold:       'Sold',
  'one-of-one': 'One of one',
  reserved:   'Reserved',
}[status];
```

**Detail plate HTML structure** (from 02-RESEARCH.md Section 5, locked by UI-SPEC and sketch-findings):
```astro
<div class="detail-plate">
  <div class="back-row"><a href="/gallery" class="back-link">← Back to the gallery</a></div>

  <img class="product-photo"
    src={`/gallery/${slug}/hero-800.webp`}
    srcset={`/gallery/${slug}/hero-800.webp 800w, /gallery/${slug}/hero-1600.webp 1600w`}
    sizes="(max-width: 640px) 100vw, 640px"
    alt={name}
    width="800" height="1000"
    loading="eager"
    decoding="async" />

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

  <div class="back-bottom"><a href="/gallery" class="back-link">← Back to the gallery</a></div>
</div>
```

**Scoped CSS block** — copy verbatim from 02-RESEARCH.md Section 12 (`gallery-surfaces.md` patterns):
```css
/* Place in <style> block in [slug].astro */
.detail-plate {
  max-width: 640px; margin: 0 auto;
  padding: var(--space-4) var(--space-5) var(--space-9);
}
.detail-plate .product-photo {
  display: block; width: 100%; height: auto;
  border-radius: var(--radius-sm); margin-bottom: var(--space-6);
  background: var(--cream-200);
}
.detail-plate h1.name {
  font-family: var(--font-display); font-size: var(--fs-3xl);
  line-height: var(--lh-tight); color: var(--coral-500);
  text-align: center; margin: 0 0 var(--space-3);
}
.detail-plate .meta-row {
  display: flex; justify-content: center; align-items: baseline;
  gap: var(--space-4); font-family: var(--font-body);
  margin-bottom: var(--space-5);
}
.detail-plate .meta-row .price {
  font-size: var(--fs-lg); font-weight: 800; color: var(--indigo-700);
}
.status-badge {
  font-size: var(--fs-xxs); font-weight: 700; font-family: var(--font-body);
  text-transform: uppercase; letter-spacing: var(--ls-caps);
}
.status-badge.available  { color: var(--color-fg-muted); font-weight: 400; }
.status-badge.sold       { color: var(--lavender-500);   font-weight: 700; }
.status-badge.one-of-one { color: var(--color-accent-leaf); font-weight: 700; }
.status-badge.reserved   { color: var(--lavender-500);   font-weight: 700; }
.detail-plate .description {
  font-family: var(--font-body); font-size: var(--fs-md);
  line-height: var(--lh-loose); color: var(--color-fg);
  text-align: center; max-width: 520px; margin: 0 auto var(--space-6);
}
.detail-plate .cta-stack {
  display: flex; flex-direction: column; align-items: center;
  gap: var(--space-3); margin-bottom: var(--space-7);
}
.cta-button {
  display: inline-block; background: var(--coral-500);
  color: var(--color-fg-on-coral); text-decoration: none;
  padding: var(--space-3) var(--space-6); border-radius: var(--radius-pill);
  font-family: var(--font-body); font-weight: 800; font-size: var(--fs-sm);
}
.cta-button:hover { background: var(--coral-700); }
.cta-button:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 3px; }
.mailto-fallback {
  font-family: var(--font-body); font-size: var(--fs-xs);
  color: var(--color-fg-muted); line-height: var(--lh-normal);
}
.mailto-fallback a { color: var(--color-link); text-decoration: underline; }
.back-link {
  display: inline-block; font-family: var(--font-body); font-size: var(--fs-xs);
  font-weight: 700; text-transform: uppercase; letter-spacing: var(--ls-caps);
  color: var(--color-fg-muted); text-decoration: none; line-height: var(--lh-snug);
  margin-bottom: var(--space-5);
}
.back-link:hover { color: var(--coral-500); }
.back-link:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 4px; }
```

---

### `src/pages/gallery.astro` (page/route, rewire — self-analog)

**What changes:** Remove the `import { sampleGallery } from '../sample-data'` line and the `sampleGallery` prop. Replace with `getCollection` + sort + map.

**Existing pattern to preserve** (lines 9–14 of `gallery.astro`):
```astro
export const prerender = true;

import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/design-skill/Header';
import GalleryGrid from '../components/design-skill/GalleryGrid';
import Footer from '../components/design-skill/Footer';
```

**New frontmatter addition**:
```astro
import { getCollection } from 'astro:content';

const allPieces = await getCollection('gallery');

const pieces = allPieces
  .sort((a, b) => b.data.published_at.localeCompare(a.data.published_at))
  .map((entry) => ({
    slug:   entry.id,
    name:   entry.data.name,
    price:  entry.data.price,
    status: entry.data.status,
    photo:  `/gallery/${entry.id}/hero-400.webp`,
  }));
```

**Template stays identical** (line 17–21 of `gallery.astro`):
```astro
<BaseLayout title="Gallery — Studio Bluemli">
  <Header slot="header" active="/gallery" />
  <GalleryGrid pieces={pieces} />
  <Footer slot="footer" />
</BaseLayout>
```

---

### `src/components/design-skill/GalleryGrid.jsx` (component, extend — self-analog)

**What changes:** Three targeted edits to the existing component (lines 51–69):

1. Wrap `<article>` in `<a class="card" href={...}>` (full card is the link target per sketch-findings 002-A)
2. Add `className` for per-status color on the status `<span>`
3. Change `minmax(260px, 1fr)` → `minmax(240px, 1fr)` (sketch preference)
4. Add `loading="lazy"` on grid card images

**Existing card structure** (lines 51–69) — shows what to wrap and where to add className:
```jsx
// EXISTING (lines 51–68):
{pieces.map((piece) => (
  <article key={piece.slug} style={{ background: 'var(--color-surface-card)', borderRadius: 8, overflow: 'hidden' }}>
    <img src={piece.photo} alt={piece.name} width={400} height={500}
         style={{ width: '100%', height: 'auto', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }} />
    <div style={{ padding: '12px 16px 16px' }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: 'var(--color-fg-strong)' }}>{piece.name}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-fg-muted)' }}>
        <span>${piece.price}</span>
        <span>{piece.status === 'available' ? 'Available' : piece.status === 'sold' ? 'Sold' : piece.status === 'one-of-one' ? 'One of one' : 'Reserved'}</span>
      </div>
    </div>
  </article>
))}
```

**Target structure** after Phase 2 edit:
```jsx
{pieces.map((piece) => (
  <a key={piece.slug} href={`/gallery/${piece.slug}`} className="card"
     style={{ background: 'var(--color-surface-card)', borderRadius: 8, overflow: 'hidden', display: 'block', textDecoration: 'none', color: 'inherit' }}>
    <img src={piece.photo} alt={piece.name} width={400} height={500} loading="lazy" decoding="async"
         style={{ width: '100%', height: 'auto', aspectRatio: '4/5', objectFit: 'cover', display: 'block', background: 'var(--cream-200)' }} />
    <div style={{ padding: '12px 16px 16px' }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: 'var(--color-fg-strong)', marginBottom: 4 }}>{piece.name}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: 'var(--font-body)', fontSize: 14 }}>
        <span style={{ fontWeight: 700, color: 'var(--color-fg-strong)' }}>${piece.price}</span>
        <span className={`card-status ${piece.status}`}>
          {piece.status === 'available' ? 'Available' : piece.status === 'sold' ? 'Sold' : piece.status === 'one-of-one' ? 'One of one' : 'Reserved'}
        </span>
      </div>
    </div>
  </a>
))}
```

**CSS for `.card-status.*`** — add via `<style is:global>` in `gallery.astro` (keeps JSX free of CSS-in-JS for the color rules):
```css
.card-status.available  { color: var(--color-fg-muted); font-weight: 400; }
.card-status.sold       { color: var(--lavender-500);   font-weight: 700; }
.card-status.one-of-one { color: var(--color-accent-leaf); font-weight: 700; }
.card-status.reserved   { color: var(--lavender-500);   font-weight: 700; }
.card:focus-visible     { outline: 2px solid var(--color-focus-ring); outline-offset: 4px; }
```

Also update the grid column template (line 47):
```jsx
// Change:
gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
// To:
gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
```

---

### `.github/workflows/ci.yml` (config, add one step)

**Analog:** Existing `ci.yml` (lines 49–50) — the `Build` step pattern:
```yaml
- name: Build
  run: pnpm exec astro build
```

**New step to insert** — immediately BEFORE the existing `Build` step (line 49):
```yaml
- name: Generate responsive WebP variants (prebuild)
  run: pnpm run prebuild:images
```

The full updated step sequence becomes:
```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile

- name: Typecheck
  run: pnpm exec astro check

- name: Generate responsive WebP variants (prebuild)
  run: pnpm run prebuild:images

- name: Build
  run: pnpm exec astro build

- name: Write .assetsignore (Plan 04 postbuild — REVIEW FIX M2)
  run: node scripts/write-assetsignore.mjs
  # ... remaining steps unchanged
```

**Note:** No `apt-get install libheif-dev` step needed — `heic-convert@2.1.0` is pure JS (RESEARCH.md Section 2 confirmed).

---

### `package.json` (config, add devDeps + script)

**Analog:** Existing `package.json` structure (lines 8–18) — `scripts` object + `devDependencies` object.

**Scripts addition** (insert alongside existing `ci:brand-check` pattern, lines 16–17):
```json
"prebuild:images": "node scripts/prebuild-images.mjs"
```

**devDependencies addition** (insert alongside existing devDeps, lines 30–38):
```json
"heic-convert": "^2.1.0",
"sharp": "^0.34.5"
```

Both are `devDependencies` — the prebuild script only runs on CI and locally, never in `workerd`.

---

### `.gitignore` (config, add one line)

**Analog:** Existing `.gitignore` `dist/` pattern (line 2) — same "build artifact, never committed" semantics.

**Addition** — append after the `# Astro` block:
```
# Gallery prebuild WebP variants (regenerated each build — see scripts/prebuild-images.mjs)
public/gallery/
```

---

### `scripts/check-brand-rules.sh` (utility, uncomment Rule 7)

**Analog:** Self — Rule 7 block is already present as a commented-out template (lines 111–124).

**What changes:** Uncomment the Rule 7 `if` block (lines 116–124) and update the grep pattern to match the real `price: 0` marker as well as `"Sample Piece"`:

**Current (commented):**
```bash
# if grep -rEn '"Sample Piece"' \
#      --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
#      --exclude-dir=.planning --exclude-dir=.claude \
#      src/content/ 2>/dev/null ; then
#   echo ""
#   echo "FAIL: Remove sample-data markers before merging — Phase 2 ships real content."
#   echo "  Sample-data lives only in src/sample-data.ts during Phase 1; Phase 2 deletes that file."
#   failed=1
# fi
```

**Target (uncommented, pattern extended to also catch `price: 0`)**:
```bash
if grep -rEn '("Sample Piece"|^price: 0$)' \
     --include='*.md' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/content/ 2>/dev/null ; then
  echo ""
  echo "FAIL: Remove sample-data markers before merging — Phase 2 ships real content."
  echo "  'Sample Piece' names and price: 0 are Phase 1 test markers; real pieces have real names and prices."
  failed=1
fi
```

**Also fix CR-05** (Rule 1 regex misses uppercase `#FFF` — existing line 22):
```bash
# Change:
'(bg-white|background:\s*white|#fff(?![0-9a-fA-F])|#[fF]{6})'
# To:
'(bg-white|background:\s*white|#[fF]{3}(?![0-9a-fA-F])|#[fF]{6})'
```

---

### `src/content/gallery/<slug>/index.md` (content, ×6 new files)

**Analog:** `src/sample-data.ts` (lines 25–31) — same field names (`slug`, `name`, `price`, `status`) that map to the new schema.

**Frontmatter template** (apply for all 6 slugs; executor writes brand-voiced descriptions):
```markdown
---
name: Coral cluster
hero: ./hero.heic
price: 48
status: available
description: bright coral and cream glass beads, hand-clustered into a pair that wears every day
featured: true
published_at: 2026-05-13
---
```

**Brand rules for description field** (checked by CI Rule 2 + Rule 7 — RESEARCH.md Section 10):
- No `flower|petal|floral|bloom|blossom` anywhere (CI Rule 2 scans `src/content/` unexcluded)
- No price ceiling claims ("under $100")
- Sentence case, no emoji, no exclamation marks
- Vocabulary allowed: bead, cluster, glass, shimmer, sparkle, pair, sway + palette color names

**Price range** (D-07): $42–$58, integer, spread across 6 pieces. Never `price: 0`.

---

## Shared Patterns

### prerender = true (required under output: 'server')

**Source:** `src/pages/gallery.astro` line 9
**Apply to:** `src/pages/gallery/[slug].astro` (new), any future pages
```astro
export const prerender = true;
```

### Named slot usage (header / footer)

**Source:** `src/pages/gallery.astro` lines 17–21 + `src/layouts/BaseLayout.astro` lines 73–79
**Apply to:** `src/pages/gallery/[slug].astro`
```astro
<Header slot="header" active="/gallery" />
<!-- main content goes in the default slot (<main>) -->
<Footer slot="footer" />
```

### `slot="head"` for per-page head additions

**Source:** Add to `src/layouts/BaseLayout.astro` — currently MISSING (BaseLayout has no `<slot name="head" />`).
**Apply to:** `src/pages/gallery/[slug].astro` (og:image meta tag)

Add to `BaseLayout.astro` immediately before `</head>` (after line 37, before the `</head>` on line implied between the style block and body):
```astro
<slot name="head" />
```

### Node ESM script structure

**Source:** `scripts/write-assetsignore.mjs` lines 26–50
**Apply to:** `scripts/prebuild-images.mjs`
- Top-of-file banner comment explaining purpose and usage
- `node:fs/promises` named imports (not the CommonJS `fs` module)
- `console.log` for progress, `console.warn` for skippable issues, `console.error` + `process.exit(1)` for hard failures

### CI step ordering

**Source:** `.github/workflows/ci.yml` lines 43–56
**Apply to:** Phase 2 new prebuild step
- Steps run sequentially in declaration order
- New step slots between `Install dependencies` and `Typecheck`/`Build`
- `run: pnpm run <script>` pattern (not `pnpm exec` — `run` invokes `package.json` scripts)

---

## Critical Implementation Notes

### BaseLayout `<slot name="head" />` is missing

The open question from RESEARCH.md Section 11 is now confirmed by reading `BaseLayout.astro` (lines 12–68): there is NO `<slot name="head" />` in the `<head>` block. The file goes straight from the font `<Font />` tags and `<style is:global>` block to `</head>`. Phase 2 must add this slot as its first edit, before the detail page can emit `og:image`. This is a one-line change in `BaseLayout.astro`.

### `entry.id` not `entry.slug`

Astro 6 Content Collections v2 removed the `slug` property. All routing code uses `entry.id`. The `id` for `cluster-blush/index.md` (with `base: './src/content/gallery'`) is `'cluster-blush'`. Any code copied from older Astro 5 examples that uses `entry.slug` will produce a TypeScript error at `astro check`.

### `src/sample-data.ts` deletion sequencing

Per RESEARCH.md Section 7: delete `src/sample-data.ts` AFTER `src/content.config.ts` and the 6 `index.md` files are in place and `astro build` passes. Rule 7 in `check-brand-rules.sh` can only be uncommented after `src/sample-data.ts` is deleted (the file itself contains `"Sample Piece"` strings that would fire the grep against `src/`).

### `public/sample/` cleanup

The Phase 1 placeholder SVGs in `public/sample/` (used by `sampleGallery`) become dead assets after `gallery.astro` is rewired. Delete the `public/sample/` directory as part of the same task that deletes `src/sample-data.ts`.

### `heic-convert` buffer API

`heic-convert` returns an `ArrayBuffer` (not a Node `Buffer`). The prebuild script must wrap it: `Buffer.from(jpegBuffer)` before passing to `sharp()`. Missing this wraps silently in some Node versions but fails in others.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `CONTENT_EDITING.md` | documentation | — | No existing founder-facing docs in this repo; no pattern to copy. Must be written from scratch following the outline in RESEARCH.md Section 9. Must contain zero `git`/`npm`/`cd`/`pnpm`/`node`/`terminal` instructions (SC5 grep). |

---

## Metadata

**Analog search scope:** `src/pages/`, `src/layouts/`, `src/components/design-skill/`, `scripts/`, `.github/workflows/`, `package.json`, `.gitignore`
**Files read:** 10 source files
**Pattern extraction date:** 2026-05-13
