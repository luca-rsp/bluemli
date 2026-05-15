# Phase 3: Page Composition & Pop-ups — Pattern Map

**Mapped:** 2026-05-13
**Files analyzed:** 24 (7 new, 17 modified)
**Analogs found:** 21 / 24 (3 no-analog: `src/lib/popups.ts`, `src/pages/robots.txt.ts`, `src/scheduled.ts`)

## File Classification

| New/Modified File | Status | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|--------|------|-----------|----------------|---------------|
| `src/components/SEO.astro` | NEW | component (meta emitter) | build-time data → markup | `src/pages/gallery/[slug].astro` (head-slot og:image block, lines 43-52, 66-67) + `src/layouts/BaseLayout.astro` (existing meta tags, lines 14-43) | exact (Phase 2 inline pattern → reusable component) |
| `src/components/PopupCallout.astro` | NEW | component (scoped Astro section) | prop → markup | `src/pages/gallery/[slug].astro` (frontmatter + JSX + scoped `<style>`, lines 1-203) | role-match (Astro component, scoped styles) |
| `src/lib/popups.ts` | NEW | utility (pure function module) | collection entries → bucketed arrays | NONE in codebase — closest TZ logic is `PopupStrip.jsx` lines 9-20 (build-time `Intl.DateTimeFormat` with `timeZone`) | partial (TZ idiom only); follow RESEARCH.md §"Pattern 1" |
| `src/lib/site-url.ts` | NEW | utility (env resolver) | env vars → URL string | `src/pages/gallery/[slug].astro` lines 43-52 (env-aware ogBase resolution) | exact (lift inline → helper) |
| `src/pages/robots.txt.ts` | NEW | endpoint (Astro APIRoute) | env branch → text response | NONE in codebase — no existing Astro endpoints | none; follow RESEARCH.md §"Example 2" |
| `src/scheduled.ts` | NEW | worker entry (Cloudflare scheduled handler) | cron tick → outbound POST | NONE — Phase 3 introduces the Worker runtime | none; follow RESEARCH.md §"Example 3" |
| `scripts/generate-og-default.mjs` | NEW | build script (one-shot Node) | SVG → PNG file | `scripts/prebuild-images.mjs` (sharp resize pattern, lines 22-25, 91-118) + `scripts/generate-favicons.mjs` (one-shot output pattern, lines 16-47) | exact (same sharp-in-Node toolchain) |
| `src/pages/index.astro` | MOD | page | collection → markup | self (current state, lines 1-49) | self |
| `src/pages/popups.astro` | MOD | page | collection → markup | `src/pages/gallery.astro` (getCollection + sort + render, lines 1-44) | role-match (similar collection consumer) |
| `src/pages/about.astro` | MOD | page | YAML + collection → markup | `src/pages/gallery/[slug].astro` (same BaseLayout shape + scoped `<style>`) | role-match |
| `src/pages/say-hi.astro` | MOD | page | YAML → markup | `src/pages/gallery/[slug].astro` (CTA stack + mailto fallback, lines 91-96, 162-188) | role-match (no-form page with IG button + mailto) |
| `src/pages/gallery.astro` | MOD | page | wire `<SEO />` | self (lines 1-44) | self |
| `src/pages/gallery/[slug].astro` | MOD | page | replace inline meta with `<SEO />` | self (lines 43-52, 67) | self (refactor) |
| `src/components/design-skill/PopupStrip.jsx` | MOD (delete CTA) | component | partial delete | self (delete block at lines 63-72) | self |
| `src/components/design-skill/Hero.jsx` | MOD (NOPA strings) | component | string replace | self (lines 16, 35) | self |
| `src/components/design-skill/About.jsx` | MOD (copy + signature + NOPA) | component | rewrite | self (lines 1-33) | self |
| `src/components/design-skill/Footer.jsx` | MOD (NOPA string) | component | string replace | self (line 19) | self |
| `src/content/site/config.yaml` | MOD (NOPA strings) | config | string replace | self (lines 1-9) | self |
| `src/styles/colors_and_type.css` | MOD (wordmark cascade) | tokens | string replace | self (`--font-wordmark` declaration) | self |
| `src/layouts/BaseLayout.astro` | MOD (drop one `<Font>` tag) | layout | partial delete | self (line 30) | self |
| `astro.config.mjs` | MOD (drop font entry, add sitemap) | config | edit | self (lines 29-65) | self |
| `wrangler.jsonc` | MOD (add `triggers.crons` + repoint `main`) | config | edit | self (lines 1-17) | self |
| `CLAUDE.md` | MOD (drop Bagel Fat One refs) | docs | string replace | self | self |
| `REQUIREMENTS.md` | MOD (move CON to Out of Scope; rewrite PAG-06) | docs | edit | self | self |

---

## Pattern Assignments

### `src/components/SEO.astro` (NEW — component, build-time meta emitter)

**Analog:** `src/pages/gallery/[slug].astro` (inline pattern lifted into a reusable component) + `src/layouts/BaseLayout.astro` (existing meta tags).

**Imports pattern** (from `gallery/[slug].astro` lines 11-12, 34):
```typescript
import { getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
// site defaults pattern
const site = (await getEntry('site', 'default'))!.data;
```
Replicate as: `import { getEntry } from 'astro:content';` + `import { resolveSiteBase } from '../lib/site-url';`.

**Env-aware base URL pattern to lift** (`gallery/[slug].astro` lines 43-52):
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
This entire block moves into `src/lib/site-url.ts` as `resolveSiteBase(astroSite)`; `SEO.astro` calls it once.

**Meta tags to emit** (mirrors RESEARCH.md §"Pattern 3" — adopted as-is):
```astro
---
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

**Slot wiring pattern** (`gallery/[slug].astro` line 67):
```astro
<BaseLayout title={`${name} — Studio Bluemli`}>
  <meta slot="head" property="og:image" content={ogImageUrl} />
```
Replace by:
```astro
<BaseLayout title={...}>
  <SEO slot="head" title={...} pathname="/gallery/<slug>" ogImage={ogImageUrl} />
```

**Note on `<title>` duplication:** `BaseLayout.astro` line 17 already emits `<title>{title}</title>`. Either (a) `SEO.astro` omits `<title>` and lets BaseLayout own it, or (b) `BaseLayout` drops its `<title>` when a `head` slot is present. Pick (a) — least blast radius. Planner picks one explicitly; document the choice.

---

### `src/components/PopupCallout.astro` (NEW — component, scoped styles)

**Analog:** `src/pages/gallery/[slug].astro` for the Astro component shape: frontmatter at top, JSX-like markup, scoped `<style>` block at bottom. Concrete CSS already prescribed in `03-UI-SPEC.md` §Landing.

**Frontmatter prop pattern** (`gallery/[slug].astro` lines 30-31):
```typescript
const { entry } = Astro.props;
const { name, price, status, description } = entry.data;
```
Replicate as:
```typescript
interface Props {
  popup:       CollectionEntry<'popups'>;
  hasMultiple: boolean;
}
const { popup, hasMultiple } = Astro.props;
```

**Build-time TZ format pattern** (lifted from `PopupStrip.jsx` lines 9-20 — already SSR-safe):
```typescript
const dateLabel = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
  timeZone: popup.data.tz,
}).format(eventDate);
```

**Scoped `<style>` pattern** (`gallery/[slug].astro` lines 106-203):
- Use a single `<style>` block (auto-scoped) — NOT `<style is:global>`.
- Tokens via `var(--space-*)`, `var(--coral-500)`, `var(--font-hand)`, `var(--font-body)`.
- Focus-visible pattern at lines 181, 202 of the analog:
```css
.cta-button:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 3px; }
.back-link:focus-visible  { outline: 2px solid var(--color-focus-ring); outline-offset: 4px; }
```
Exact CSS for `.popup-callout`, `.hand-eyebrow`, `.when`, `.time`, `.see-all` is given verbatim in `03-RESEARCH.md` §"Example 1" — executor copies it.

---

### `src/lib/popups.ts` (NEW — utility, pure function)

**Analog:** NONE in the codebase. Closest TZ idiom is `PopupStrip.jsx` lines 9-20 which uses build-time `Intl.DateTimeFormat({ timeZone })` — same SSR-safe principle.

**Pattern to follow:** verbatim from `03-RESEARCH.md` §"Pattern 1: TZ-aware popup split helper" (Temporal-based `splitPopups()` returning `{ soonest, alsoComing, past, hasUpcoming, hasMultiple }`).

**Type-import idiom to mirror** (`gallery/[slug].astro` does not import `CollectionEntry`, but `astro:content` exposes it — use the same module):
```typescript
import { Temporal } from 'temporal-polyfill';
import type { CollectionEntry } from 'astro:content';
type Popup = CollectionEntry<'popups'>;
```

**No-client-JS contract** (Phase 1 lock, restated in `03-CONTEXT.md` §Established Patterns): this module is consumed only by Astro page frontmatter, never imported into a `.jsx` component that might hydrate.

---

### `src/lib/site-url.ts` (NEW — utility, env resolver)

**Analog:** the inline block at `src/pages/gallery/[slug].astro` lines 43-52 (extracted exactly).

**Code to extract** (verbatim from analog, wrap in functions):
```typescript
export function resolveSiteBase(astroSite?: URL): string {
  const fromEnv =
    import.meta.env.CF_PAGES_URL ??
    import.meta.env.CF_WORKERS_URL ??
    import.meta.env.PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return (astroSite?.toString() ?? 'https://studiobluemli.com').replace(/\/$/, '');
}

export function isProduction(): boolean {
  const branch = import.meta.env.WORKERS_CI_BRANCH;
  if (branch) return branch === 'main';
  const pagesBranch = import.meta.env.CF_PAGES_BRANCH;
  if (pagesBranch) return pagesBranch === 'main';
  return false;
}
```

**Pitfall to honor** (RESEARCH.md Pitfall 2): always wrap env reads in functions, never assign at module top-level.

---

### `src/pages/robots.txt.ts` (NEW — endpoint)

**Analog:** NONE in the codebase. Follow `03-RESEARCH.md` §"Example 2" verbatim:
```typescript
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

**Critical `prerender = true`** (Pitfall 4 in RESEARCH.md): under `output: 'server'`, endpoints default to SSR. The flag forces emission to `dist/client/robots.txt` so the Worker is never invoked for `/robots.txt`.

---

### `src/scheduled.ts` (NEW — worker entry)

**Analog:** NONE. Follow `03-RESEARCH.md` §"Example 3" verbatim:
```typescript
import handler from '@astrojs/cloudflare/entrypoints/server';

interface Env {
  ASSETS: Fetcher;
  DEPLOY_HOOK_URL: string;
}

export default {
  fetch: handler.fetch,
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      fetch(env.DEPLOY_HOOK_URL, { method: 'POST' })
        .then(r => { if (!r.ok) console.error('Deploy hook failed:', r.status, r.statusText); })
        .catch(err => console.error('Deploy hook error:', err)),
    );
  },
};
```

**Secret-handling rule** (Pitfall 5): `DEPLOY_HOOK_URL` is set via `wrangler secret put`, never logged, never in `wrangler.jsonc`.

---

### `scripts/generate-og-default.mjs` (NEW — build script)

**Analog 1:** `scripts/prebuild-images.mjs` (sharp-in-Node toolchain, lines 22-25, 91-118).

**Sharp import + resize pattern** (`prebuild-images.mjs` lines 22-25):
```javascript
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';
```

**Sharp resize + write pattern** (`prebuild-images.mjs` lines 108-117):
```javascript
await sharp(sourceBuffer)
  .resize(w, null, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: WEBP_QUALITY })
  .toFile(outPath);
```
Replicate for og-default as `.png().toFile('public/og-default.png')` at 1200×630.

**Analog 2:** `scripts/generate-favicons.mjs` (lines 1-52) for the one-shot output pattern:
- Constants at top (input paths, output dir).
- `await fs.mkdir(OUT_DIR, { recursive: true })` before writing.
- `console.log` at end summarizing what was generated.
- Output committed to `public/` (not gitignored — same as `mark.svg`, `favicon.svg`, `apple-touch-icon.png`).

**Concrete code:** verbatim from `03-RESEARCH.md` §"Example 4".

---

### `src/pages/index.astro` (MOD — page)

**Analog:** itself, current state (lines 1-49).

**Existing patterns to preserve unchanged:**
- `export const prerender = true;` (line 14)
- `getCollection('gallery')` + `.sort(...localeCompare(published_at)).slice(0,3)` (lines 29-40)
- `BaseLayout` + `Header slot="header"` + `Footer slot="footer"` shape (lines 42-47)

**Edits to apply:**
- Add `import { splitPopups } from '../lib/popups';`
- Replace line 25 `const nextPopup = null;` with:
  ```typescript
  const allPopups = await getCollection('popups');
  const { soonest, hasUpcoming, hasMultiple } = splitPopups(allPopups);
  ```
- Add `import PopupCallout from '../components/PopupCallout.astro';`
- Add `import SEO from '../components/SEO.astro';`
- Replace line 45 `{nextPopup && <PopupStrip popup={nextPopup} />}` with:
  ```astro
  {hasUpcoming && <PopupCallout popup={soonest} hasMultiple={hasMultiple} />}
  ```
- Remove the `import PopupStrip` line (no longer used on landing).
- Add `<SEO slot="head" title={site.og_title} pathname="/" />` immediately after `<BaseLayout>` opening tag.
- Apply D-25 NOPA fix to the `<BaseLayout title="...NoPa...">` string on line 42.

---

### `src/pages/popups.astro` (MOD — page)

**Analog:** `src/pages/gallery.astro` lines 1-44 (similar shape: getCollection → sort → render with empty-state branch).

**Empty-state branch pattern** (`gallery.astro` lines 31-42):
```astro
{pieces.length === 0 ? (
  <p style={{...}}>
    New pieces coming soon — follow along on Instagram.
  </p>
) : (
  <GalleryGrid pieces={pieces} />
)}
```
Replicate for popups using `D-08` copy (under quiet "Pop-ups" eyebrow, two-line body with coral underlined `@studiobluemli` link). Use scoped `<style>` (not inline) — see UI-SPEC §/popups.

**Sort/destructure pattern:** use `splitPopups()` helper:
```typescript
const all = await getCollection('popups');
const { soonest, alsoComing, past } = splitPopups(all);
```

**Section-rendering pattern** (mirror `gallery/[slug].astro`'s scoped-style approach, lines 106-203):
- `<PopupStrip />` (with CTA already deleted per D-09) for `soonest`.
- ALSO COMING UP `<section>` rendered only when `alsoComing.length >= 1`.
- PAST `<section>` rendered only when `past.length >= 1`.
- All CSS in a single `<style>` block at bottom; tokens via `var(--*)`; format strings per UI-SPEC §/popups.

**SEO + BaseLayout wiring:** same as index.astro.

---

### `src/pages/about.astro` (MOD — page)

**Analog:** `src/pages/gallery/[slug].astro` for the "page with image strip + scoped CSS" shape.

**Photo strip image reuse pattern** (`gallery/[slug].astro` lines 37-38):
```typescript
const heroSrc = `/gallery/${slug}/hero-800.webp`;
```
Adapt for about: pick 3 piece slugs, render `/gallery/<slug>/hero-800.webp` URLs into a 3-column CSS grid (specs in UI-SPEC §/about). Use existing `passthroughImageService()` — no new prebuild step (D-14).

**Alt-text contract pattern** (`gallery/[slug].astro` line 80):
```astro
alt={name}
```
Replicate as `alt={piece.data.name}` on each photo-strip `<img>`. CI grep enforces no flower vocab.

**Image attributes pattern** (`gallery/[slug].astro` lines 75-82, with the lazy variant for below-the-fold):
```astro
<img class="product-photo"
     src={heroSrc} srcset={heroSrcset}
     sizes="(max-width: 640px) 100vw, 640px"
     alt={name}
     width={heroWidth} height={heroHeight}
     loading="eager" decoding="async" />
```
For about-strip use `loading="lazy"` instead of `"eager"` (per UI-SPEC §Performance).

**Body copy + signature rewrite:** Either edit `About.jsx` directly (lines 18-29) or inline as `<section>` in `about.astro`. Planner picks; the safer choice per `03-CONTEXT.md` Claude's Discretion is inline `<section>` so the photo strip co-locates with the text block (D-15).

**SEO + BaseLayout wiring:** same as index.astro.

---

### `src/pages/say-hi.astro` (MOD — page)

**Analog:** `src/pages/gallery/[slug].astro` (lines 91-96 + 162-188) for the CTA stack + mailto fallback pattern.

**CTA stack pattern** (`gallery/[slug].astro` lines 91-96):
```astro
<div class="cta-stack">
  <a class="cta-button" href={site.ig_dm_url}>{ctaCopy}</a>
  <span class="mailto-fallback">
    or email <a href={`mailto:${site.contact_email}`}>{site.contact_email}</a>
  </span>
</div>
```
Replicate verbatim for `/say-hi`, replacing `ctaCopy` with `"DM me on Instagram →"`.

**Coral pill button CSS** (`gallery/[slug].astro` lines 169-181):
```css
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
.cta-button:hover { background: var(--coral-700); }
.cta-button:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 3px; }
```
Replicate exactly. UI-SPEC adds the `transform: translateX(+3px)` arrow-slide hover on `/say-hi`.

**Edits to apply:**
- Drop `import AppointmentForm from '../components/design-skill/AppointmentForm';` (line 14).
- Drop `<AppointmentForm />` (line 21).
- Render `<section class="say-hi-stage">` with `h1.say-hi`, `p.sub`, `a.ig-button`, `p.mailto` per UI-SPEC §/say-hi.
- Add `<SEO slot="head" title="Say Hi — Studio Bluemli" pathname="/say-hi" />`.
- Keep `prerender = true` (line 9).

**D-21 — keep `AppointmentForm.jsx`** in `src/components/design-skill/`; only the import is removed.

---

### `src/pages/gallery.astro` (MOD — wire `<SEO />`)

**Analog:** self (lines 1-44).

**Edit:** add `import SEO from '../components/SEO.astro';` and `<SEO slot="head" title="Gallery — Studio Bluemli" pathname="/gallery" />` immediately inside `<BaseLayout>`. No other changes.

---

### `src/pages/gallery/[slug].astro` (MOD — refactor inline meta to `<SEO />`)

**Analog:** self (lines 43-52, 67).

**Edits:**
- Delete the inline `ogBase` / `ogImageUrl` calculation (lines 43-52) — moves to `src/lib/site-url.ts`.
- Replace line 67 `<meta slot="head" property="og:image" content={ogImageUrl} />` with:
  ```astro
  <SEO slot="head"
       title={`${name} — Studio Bluemli`}
       description={description}
       ogImage={`${resolveSiteBase(Astro.site)}/gallery/${slug}/hero-800.webp`}
       pathname={`/gallery/${slug}`} />
  ```
- Add `import SEO from '../../components/SEO.astro';` and `import { resolveSiteBase } from '../../lib/site-url';`.

---

### `src/components/design-skill/PopupStrip.jsx` (MOD — delete CTA block)

**Analog:** self (lines 63-72).

**Edit:** delete the entire `<div style={{ marginTop: 28, ... }}>...book by appointment...</div>` block (lines 63-72). No replacement. Rest of component (eyebrow + headline + venue + date-time) stays exactly as-is.

---

### `src/components/design-skill/Hero.jsx` (MOD — NOPA strings)

**Analog:** self (lines 16, 35).

**Edits — exactly 2 string-literal replacements:**
- Line 16: `Studio Bluemli · NoPa, San Francisco` → `Studio Bluemli · NOPA, San Francisco`
- Line 35: `Hand-assembled earrings, made in NoPa.` → `Hand-assembled earrings, made in NOPA.`

Do not touch code comments. Do not touch any other string.

---

### `src/components/design-skill/About.jsx` (MOD — copy rewrite + signature + NOPA)

**Analog:** self (lines 1-33).

**Edits:**
- Line 23-24 body copy: rewrite per D-13 (Claude-drafted brand-voiced placeholder; NOPA in caps; no emoji; no flower vocab; sentence-case; friendly parentheticals).
- Line 28: replace `— the founder` with `made with love from NOPA` (D-16). Keep `<Mark.Heart color="var(--coral-500)" />` adjacent.
- D-15 photo-strip extension: either add a sibling `<div class="about-photo-strip">` inside the same React component (renders 1-3 `<img>` cells with `var(--space-4)` gap, `aspect-ratio: 1/1`) OR inline the strip in `about.astro` and let `About.jsx` own only the text block. Planner picks; the inline-in-`.astro` path is cleaner (scoped CSS + no JSX inline styles).

---

### `src/components/design-skill/Footer.jsx` (MOD — NOPA strings)

**Analog:** self (lines 19, 27).

**Edits — exactly 2 string replacements:**
- Line 19: `hand-assembled earrings · made in NoPa, San Francisco` → `...NOPA, San Francisco`
- Line 27: `<span ...>NoPa, San Francisco</span>` → `NOPA, San Francisco`

---

### `src/content/site/config.yaml` (MOD — NOPA strings)

**Analog:** self (lines 1-9).

**Edits — 4 string replacements** (D-25 enumerated set):
- `tagline:` line 2 — `NoPa` → `NOPA`
- `footer_text:` line 6 — `NoPa` → `NOPA`
- `og_title:` line 7 — no `NoPa` currently; leave unless D-25 specifies (it does not list og_title here, but CONTEXT.md D-25 lists og_title — verify against actual content)
- `og_description:` line 8 — `NoPa` → `NOPA`

---

### `src/styles/colors_and_type.css` (MOD — wordmark cascade)

**Analog:** self (single declaration of `--font-wordmark`).

**Edit (D-24):** change the `--font-wordmark` cascade from `'Bagel Fat One', 'Pacifico', 'Lobster', cursive` to `var(--font-display-loaded), 'Caveat Brush', cursive`. No other token edits.

---

### `src/layouts/BaseLayout.astro` (MOD — drop one `<Font>` tag)

**Analog:** self (line 30).

**Edit (D-24):** delete `<Font cssVariable="--font-wordmark-loaded" preload />` (line 30). Keep `<Font cssVariable="--font-display-loaded" preload />` (line 31) — required by Pitfall 6.

**`<slot name="head" />`** at line 43 is unchanged and remains the injection point for `<SEO />`.

---

### `astro.config.mjs` (MOD — drop font entry, add sitemap)

**Analog:** self (lines 29-65).

**Edits:**
- D-24: delete the `Bagel Fat One` entry (lines 30-36).
- Add `import sitemap from '@astrojs/sitemap';` at top.
- Add `sitemap()` to the `integrations: [react(), sitemap()]` array.

---

### `wrangler.jsonc` (MOD — add `triggers.crons` + repoint `main`)

**Analog:** self (lines 1-17).

**Edits per RESEARCH.md §Example 3:**
- Repoint `"main"` from `@astrojs/cloudflare/entrypoints/server` to `src/scheduled.ts`.
- Add `"triggers": { "crons": ["0 11 * * *"] }` block with the Pitfall 1 single-cron comment about ±1h DST drift.
- Leave `assets.run_worker_first: ["/api/*"]` untouched (D-22).

---

## Shared Patterns

### Pattern A — Per-page `prerender = true` (Phase 1 lock)

**Source:** every existing `src/pages/*.astro` file declares this at the top of frontmatter (e.g., `index.astro` line 14, `gallery.astro` line 7, `gallery/[slug].astro` line 9).

**Apply to:** every new and edited Phase 3 page, including `src/pages/robots.txt.ts`.

```typescript
export const prerender = true;
```

Rationale (from `index.astro` lines 11-13 comment): required under `output: 'server'` to emit static `.html` (or `.txt`) to `dist/client/`. Without it, every page request hits the Worker.

---

### Pattern B — `BaseLayout` slot composition

**Source:** every existing page uses the same composition shape.

**Reference excerpt** (`src/pages/gallery/[slug].astro` lines 66-104, condensed):
```astro
<BaseLayout title={...}>
  <SEO slot="head" ... />              {/* per-page meta — Phase 3 NEW */}
  <Header slot="header" active="/..." />
  <!-- page body -->
  <Footer slot="footer" igHandle={site.ig_handle} contactEmail={site.contact_email} />
</BaseLayout>
```

**Apply to:** every Phase 3 page (`index.astro`, `popups.astro`, `about.astro`, `say-hi.astro`, `gallery.astro`, `gallery/[slug].astro`).

**`active` prop values:** `'/'`, `'/gallery'`, `'/popups'`, `'/about'`, `'/say-hi'` (the canonical 5-route set, per `about.astro` line 5 comment about HeaderProps union).

---

### Pattern C — `site` collection access

**Source:** every page reads site defaults the same way.

**Excerpt** (`src/pages/gallery.astro` line 15):
```typescript
import { getEntry } from 'astro:content';
const site = (await getEntry('site', 'default'))!.data;
```

**Apply to:** every Phase 3 page that needs `ig_handle`, `contact_email`, `ig_dm_url`, `og_title`, `og_description`, `footer_text`. The `!` non-null assertion is the established idiom — the entry is guaranteed by the strict Zod schema in `src/content.config.ts`.

---

### Pattern D — Scoped `<style>` for new Astro components, `<style is:global>` only for React-component reach

**Source:** `gallery/[slug].astro` (uses scoped `<style>` — lines 106-203 — because all markup is local Astro JSX) vs `gallery.astro` (uses `<style is:global>` — lines 46-60 — because rules target `.card-status` classes inside the React `GalleryGrid.jsx`).

**Apply to:**
- `SEO.astro` — no styles (it emits `<meta>` only).
- `PopupCallout.astro` — scoped `<style>`.
- `popups.astro` — scoped `<style>` for ALSO COMING UP + PAST sections (markup is local).
- `about.astro` — scoped `<style>` for photo strip (markup is local).
- `say-hi.astro` — scoped `<style>` for `.say-hi-stage` + button (markup is local).
- `gallery.astro` — keep existing `<style is:global>` for `.card-status.*` rules (no change).

**Rationale** (from `gallery.astro` lines 47-49 comment): "is:global because GalleryGrid.jsx is a React component — Astro's auto-scoped `<style>` hashes don't reach JSX className strings."

---

### Pattern E — Focus-visible contract (FND-13)

**Source:** `BaseLayout.astro` lines 68-72 (global rule applies to every interactive element).

```css
:focus-visible {
  outline: 2px solid var(--color-focus-ring, var(--indigo-500));
  outline-offset: 2px;
  border-radius: 2px;
}
```

**Per-component override pattern** (`gallery/[slug].astro` lines 181, 202):
```css
.cta-button:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 3px; }
.back-link:focus-visible  { outline: 2px solid var(--color-focus-ring); outline-offset: 4px; }
```

**Apply to:** every interactive element added in Phase 3 (`.see-all`, `.ig-button`, `.mailto`, `@studiobluemli` empty-state link, `.also-row` if linkified later). Never `outline: none` without a paired `:focus-visible` style (Pitfall #17, Phase 1).

---

### Pattern F — No client React directives

**Source:** every `<Hero />`, `<PopupStrip />`, `<About />`, `<Footer />`, `<Header />`, `<GalleryGrid />`, `<AppointmentForm />` is imported without any `client:*` directive in `index.astro`, `gallery.astro`, etc.

**Apply to:** every JSX component used by Phase 3 pages. Server-rendered as static HTML; zero client JS shipped. `PopupStrip.jsx`'s `Intl.DateTimeFormat` runs at build time, not in the browser (verified in lines 9-20 of the analog).

---

### Pattern G — Token-only CSS (no hardcoded hex / px outside tokens)

**Source:** `gallery/[slug].astro` `<style>` block — every value is `var(--space-*)`, `var(--coral-*)`, `var(--fs-*)`, `var(--radius-*)`, `var(--font-*)`, `var(--lh-*)`, `var(--ls-*)`.

**Apply to:** every new Phase 3 `<style>` block. CI grep enforces no `#fff`, no `bg-white`, no `gradient`, no `backdrop-filter`, no `border: 1px` (Phase 1 lock; `03-CONTEXT.md` Established Patterns; UI-SPEC §Color).

---

### Pattern H — Build-time data flow, never request-time

**Source:** every page consumes data via `getCollection()` / `getEntry()` in frontmatter (build-time). No `fetch()` calls in `.astro` files. `PopupStrip.jsx`'s `Intl.DateTimeFormat` runs during SSR.

**Apply to:**
- `src/lib/popups.ts` — Temporal calls run at build time (page frontmatter imports it).
- `src/components/SEO.astro` — `resolveSiteBase()` reads env at build.
- `src/pages/robots.txt.ts` — `isProduction()` resolves at build (`prerender = true`).

**Sole runtime exception:** `src/scheduled.ts`'s `scheduled()` handler runs in `workerd` daily — but only POSTs to a deploy hook URL, no business logic.

---

## No Analog Found

Files with no close existing match. Planner uses `03-RESEARCH.md` patterns directly:

| File | Role | Data Flow | Reason | Reference |
|------|------|-----------|--------|-----------|
| `src/lib/popups.ts` | utility | build-time bucket | No existing TZ-aware helper module; `PopupStrip.jsx` has the right idiom but inside a JSX component. | RESEARCH.md §"Pattern 1" |
| `src/pages/robots.txt.ts` | endpoint | env branch → text | No existing Astro endpoint files; this is the first one. | RESEARCH.md §"Example 2" |
| `src/scheduled.ts` | worker entry | cron tick → POST | No existing Worker runtime code; `output: 'server'` was reserved but unused. | RESEARCH.md §"Example 3" |

---

## Metadata

**Analog search scope:** `src/pages/`, `src/components/`, `src/layouts/`, `src/styles/`, `src/content/`, `scripts/`, `astro.config.mjs`, `wrangler.jsonc`, `src/content.config.ts`.

**Files scanned:** 24 (full read on `gallery/[slug].astro`, `gallery.astro`, `index.astro`, `popups.astro`, `about.astro`, `say-hi.astro`, `BaseLayout.astro`, `PopupStrip.jsx`, `About.jsx`, `Hero.jsx`, `Footer.jsx`, `Header.jsx`, `astro.config.mjs`, `wrangler.jsonc`, `prebuild-images.mjs`, `generate-favicons.mjs`, `colors_and_type.css` (head), `content.config.ts`, `config.yaml`).

**Pattern extraction date:** 2026-05-13.

**Key insight:** Phase 3 is overwhelmingly an extension phase — every architectural pattern except (a) the Temporal TZ helper, (b) the env-branching endpoint, and (c) the Cloudflare scheduled handler already exists in the Phase 1/2 codebase. The three NEW patterns are all single-file and bounded; the remaining 21 files just replicate established idioms (`getCollection` → sort → render, scoped Astro `<style>`, `<slot name="head">` meta injection, token-only CSS, no client React, build-time data flow).
