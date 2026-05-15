---
phase: 02-content-schema-gallery
reviewed: 2026-05-13T15:55:00Z
depth: standard
files_reviewed: 22
files_reviewed_list:
  - .github/workflows/ci.yml
  - CONTENT_EDITING.md
  - package.json
  - playwright.config.mjs
  - scripts/check-brand-rules.sh
  - scripts/prebuild-images.mjs
  - scripts/test-content-contracts.sh
  - src/components/design-skill/GalleryGrid.jsx
  - src/content.config.ts
  - src/content/gallery/cluster-blush/index.md
  - src/content/gallery/cluster-cobalt/index.md
  - src/content/gallery/cluster-coral/index.md
  - src/content/gallery/cluster-lavender/index.md
  - src/content/gallery/cluster-saffron/index.md
  - src/content/gallery/cluster-sage/index.md
  - src/content/site/config.yaml
  - src/layouts/BaseLayout.astro
  - src/pages/gallery.astro
  - src/pages/gallery/[slug].astro
  - src/pages/index.astro
  - src/pages/popups.astro
  - tests/e2e/gallery.spec.ts
  - tsconfig.json
findings:
  blocker: 2
  warning: 9
  info: 5
  total: 16
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-05-13T15:55:00Z
**Depth:** standard
**Files Reviewed:** 22
**Status:** issues_found

## Summary

Phase 2 ships a Zod content-collection foundation, a prebuild image pipeline, and the `/gallery` + `/gallery/<slug>` routes. The architecture is sound (strict schemas, env-aware og:image, dimension manifest, status enum, contract tests). End-to-end I confirmed the built HTML emits og:image inside `<head>`, all six slugs render, and `astro check` passes with 0 errors / 0 warnings.

Adversarial pass surfaces two BLOCKERs and a cluster of WARNINGs that primarily affect robustness, security hygiene, and the founder's stated single-source-of-truth promise:

1. The image-dimensions manifest is shipped publicly as `dist/client/gallery/_manifest.json` — internal build state leaks into the deploy.
2. The `site` content collection is fully defined and validated but never consumed by any page; the founder edits `src/content/site/config.yaml`, but `hi@studiobluemli.com`, `https://ig.me/m/studiobluemli`, and `https://instagram.com/studio_bluemli` are still hardcoded in three files. Editing the YAML changes nothing user-visible — silent broken contract.

The og:image env-var precedence has a trailing-slash bug; the popups collection emits a noisy `[WARN] No files found` on every build; sort comparators run `localeCompare` on a regex-validated date string (correct but wasteful — `<`/`>` suffices and avoids locale surprises); the `GalleryGrid.jsx` hardcodes `height={500}` while the manifest records `[400, 533]`. Several less critical maintainability findings round out the list.

## Blocker Issues

### BL-01: Image-dimensions manifest leaks into public deploy

**File:** `scripts/prebuild-images.mjs:30, 122-123`
**Issue:** `MANIFEST_PATH = './public/gallery/_manifest.json'`. Anything under `public/` is copied verbatim into `dist/client/` by Astro's build (verified: `dist/client/gallery/_manifest.json` exists locally). Cloudflare Static Assets then serves it at `https://studiobluemli.com/gallery/_manifest.json`. This is internal build telemetry — it exposes:

- Every gallery slug (including any draft / not-yet-linked piece if the founder ever stages content),
- Exact image dimensions per width (useful for nothing externally).

There's no inventory or crawl-budget reason for this to be reachable, and any future addition (e.g., recording `source_file: hero.heic`, EXIF, byte counts) would silently leak harder. The file is also imported as a Vite asset in `[slug].astro`, so it gets bundled into the build output regardless — the public copy is gratuitous.

**Fix:** Move the manifest out of `public/`. Two equally good options:

```js
// scripts/prebuild-images.mjs
// Option A — write to src/ so Vite import in [slug].astro still resolves:
const MANIFEST_PATH = './src/generated/gallery-manifest.json';

// Then in [slug].astro:
import manifestJson from '../../generated/gallery-manifest.json';

// Option B — emit alongside the prebuild output but exclude from Cloudflare upload:
//   keep ./public/gallery/_manifest.json, but rename to ./public/gallery/.manifest.json
//   AND extend dist/.assetsignore in scripts/write-assetsignore.mjs to ignore it:
//     gallery/.manifest.json
//     gallery/_manifest.json
```

Option A is cleaner — `public/` should only hold genuinely public bytes. Either way, regenerate `.gitignore` so the new path is also ignored.

---

### BL-02: `site` content collection is defined and validated but never consumed — silent broken edit promise

**File:** `src/content.config.ts:60-73`, `src/content/site/config.yaml`, `src/pages/gallery/[slug].astro:90, 92`, `src/components/design-skill/Footer.jsx:23, 25`
**Issue:** The `site` collection schema enforces `contact_email`, `ig_dm_url`, `ig_handle`, `og_title`, `og_description`, `tagline`, `footer_text` — but `getCollection('site')` / `getEntry('site', …)` is called nowhere in `src/`. Meanwhile:

- The contact CTA on `/gallery/<slug>` hardcodes `href="https://ig.me/m/studiobluemli"` (line 90)
- The mailto fallback hardcodes `hi@studiobluemli.com` (line 92)
- `Footer.jsx` hardcodes `https://instagram.com/studio_bluemli` (line 23, note: also drifts to `studio_bluemli` with underscore vs `studiobluemli` slug in the YAML) and `hi@studiobluemli.com` (line 25)

This breaks Phase 2's stated value: "the founder can add or remove gallery pieces and pop-up events without writing code." If she opens `src/content/site/config.yaml` via the GitHub web UI and changes `contact_email: hi@studiobluemli.com` to `studio@studiobluemli.com`, the build will succeed, the YAML validates, but the deployed `/gallery/cluster-blush` page will still mail to the old address. Same for the IG link.

Worse, the Footer's `studio_bluemli` Instagram handle disagrees with the YAML's `ig_handle: studiobluemli` — they cannot both be correct, and the data file is *not* the source of truth.

This is functionally a quiet broken contract. The schema gives false reassurance.

**Fix:** Either consume the `site` collection in every page that references its fields, or delete the collection and the YAML file (and pivot the founder workflow to "edit a `.astro` partial"). The first option matches the planning intent:

```astro
---
// src/pages/gallery/[slug].astro
import { getEntry } from 'astro:content';
const site = await getEntry('site', 'default');
// ...
const ctaUrl = site.data.ig_dm_url;
const contactEmail = site.data.contact_email;
---
<a class="cta-button" href={ctaUrl}>{ctaCopy}</a>
<span class="mailto-fallback">
  or email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
</span>
```

And convert `Footer.jsx` into an Astro component (or accept `siteData` as a prop from each page) so it can pull the same values. Add at least one smoke assertion that the deployed CTA `href` matches `site.data.ig_dm_url` to keep the contract honest.

## Warnings

### WR-01: og:image base URL emits `//` when CF_PAGES_URL / PUBLIC_SITE_URL ends with a trailing slash

**File:** `src/pages/gallery/[slug].astro:46-50`
**Issue:** `Astro.site?.toString().replace(/\/$/, '')` strips the trailing slash only on the `Astro.site` branch. For the three other branches (`CF_PAGES_URL`, `CF_WORKERS_URL`, `PUBLIC_SITE_URL`), whatever the env var contains is template-literaled directly:

```js
const ogBase = import.meta.env.CF_PAGES_URL ?? ... ?? Astro.site?.toString().replace(/\/$/, '');
const ogImageUrl = `${ogBase}/gallery/${slug}/hero-800.webp`;
```

If a contributor (or Cloudflare itself in future) sets `CF_PAGES_URL=https://branch.preview.com/`, the result is `https://branch.preview.com//gallery/cluster-blush/hero-800.webp` — most crawlers normalize, but Facebook's og:image fetcher historically does not, and the e2e test regex (`/^https?:\/\/.+\/gallery\/...$/`) doesn't catch the double slash because `.+` greedy-matches across it.

**Fix:** Strip the trailing slash uniformly:

```js
const rawBase =
  import.meta.env.CF_PAGES_URL ??
  import.meta.env.CF_WORKERS_URL ??
  import.meta.env.PUBLIC_SITE_URL ??
  Astro.site?.toString();
const ogBase = (rawBase ?? '').replace(/\/+$/, '');
const ogImageUrl = `${ogBase}/gallery/${slug}/hero-800.webp`;
```

Tighten the test regex while you're there: `/^https?:\/\/[^/]+\/gallery\/cluster-blush\/hero-800\.webp$/` (single slash between host and path).

---

### WR-02: Hardcoded `width={400} height={500}` in `GalleryGrid.jsx` doesn't match actual output `[400, 533]`

**File:** `src/components/design-skill/GalleryGrid.jsx:53`
**Issue:** The grid card image has `width={400} height={500}` baked into the JSX, but the prebuild manifest reports actual output dimensions of `[400, 533]` for every seeded piece (4:5.33 — i.e., 3:4 source). The CSS rule `aspect-ratio: 4/5` + `object-fit: cover` papers over the visible difference, but the layout-reserved space (computed from `width`/`height` attrs) is wrong by ~33 px per card, which slightly bumps CLS — exactly the failure mode the manifest was introduced to prevent (REVIEWS.md MEDIUM-3).

Inconsistent with the detail-page approach, which threads manifest dimensions through to the `<img>` tag.

**Fix:** Thread the 400w dimensions into the grid item the same way `[slug].astro` does. In `src/pages/gallery.astro` and `src/pages/index.astro`:

```js
const pieces = allPieces
  .sort(...)
  .map((entry) => ({
    slug: entry.id,
    name: entry.data.name,
    price: entry.data.price,
    status: entry.data.status,
    photo: `/gallery/${entry.id}/hero-400.webp`,
    photoWidth:  manifest[entry.id]?.['hero-400']?.[0] ?? 400,
    photoHeight: manifest[entry.id]?.['hero-400']?.[1] ?? 500,
  }));
```

Then in `GalleryGrid.jsx`, read `piece.photoWidth` / `piece.photoHeight` instead of hardcoded constants.

---

### WR-03: Popups schema is wired but the directory is empty, producing a build-time `[WARN]` on every run

**File:** `src/content.config.ts:33-58`, `src/content/popups/.gitkeep`
**Issue:** `astro check` and `astro build` emit `[WARN] [glob-loader] No files found matching "*.md" in directory "src/content/popups"` on every invocation. The `.gitkeep` shows intent (Phase 3 will fill it), but in the meantime every CI run carries a stray warning. Worse, contributors learn to ignore Astro warnings — which is the wrong habit when the next warning might be a real schema regression.

**Fix:** Either ship one stub popups entry (a `.md` with `published: false`-style guard or a far-future date — but the schema has no `published` field, so this needs Phase 3 work), or guard the collection definition so it doesn't load until a file exists. The simplest patch is to seed `src/content/popups/.example.md` with a `.md` extension that the glob ignores via a leading dot:

```js
// content.config.ts — popups loader
loader: glob({
  base: './src/content/popups',
  pattern: ['*.md', '!_*.md', '!.*.md'], // skip dotfile/underscore drafts
}),
```

Combined with a seeded `src/content/popups/.example.md` (or `_template.md`) that documents the frontmatter — no warning, and the founder has an in-tree example. Document the dotfile convention in `CONTENT_EDITING.md`.

---

### WR-04: `localeCompare` on a regex-validated ISO date is unnecessary and locale-fragile

**File:** `src/pages/gallery.astro:19`, `src/pages/index.astro:30`
**Issue:** `b.data.published_at.localeCompare(a.data.published_at)`. The schema enforces `/^\d{4}-\d{2}-\d{2}$/`, so all values are fixed-width digit strings — `<`/`>` give the same order as `localeCompare` for the validated subset, are faster, and don't pull in locale-dependent collation rules. `localeCompare` without an explicit locale uses the host runtime's default; CI may differ from local. Almost certainly fine, but it's a "looks safe, actually undefined" pattern.

**Fix:**

```js
.sort((a, b) =>
  a.data.published_at < b.data.published_at ? 1 :
  a.data.published_at > b.data.published_at ? -1 : 0
)
```

Or extract a small `compareDesc` helper to share between `gallery.astro` and `index.astro` (and the eventual popups sort).

---

### WR-05: `manifest[slug]?.['hero-800'] ?? [800, 1000]` hides missing-prebuild bugs

**File:** `src/pages/gallery/[slug].astro:39`
**Issue:** If `scripts/prebuild-images.mjs` ever fails to enumerate a slug (path-mismatch, manifest write failure, race with `rm -rf`), the fallback `[800, 1000]` silently produces wrong dimensions instead of failing the build. The detail page would render with bogus CLS, no warning visible — exactly the failure mode that motivated adding the manifest in the first place.

**Fix:** Treat a missing manifest entry as a build error. Since gallery pages prerender at build time, a thrown error in `[slug].astro` will fail the build loudly:

```js
const dims = manifest[slug]?.['hero-800'];
if (!dims) {
  throw new Error(
    `Phase 2 contract: manifest missing dimensions for "${slug}". ` +
    `Did scripts/prebuild-images.mjs run? Inspect public/gallery/_manifest.json.`
  );
}
const [heroWidth, heroHeight] = dims;
```

---

### WR-06: Status label expression duplicates between `GalleryGrid.jsx` and `[slug].astro` with subtle drift

**File:** `src/components/design-skill/GalleryGrid.jsx:60-62`, `src/pages/gallery/[slug].astro:58-62`
**Issue:** Two non-exhaustive `?:` chains compute the human label per status. They agree today, but:

1. `[slug].astro` has a final `: status` fallback that emits the raw enum value if a future status slips in unmatched; `GalleryGrid.jsx` falls back to `'Reserved'` (incorrect for any non-listed value). Add a fifth status to the enum without touching `GalleryGrid.jsx` and you get false "Reserved" badges in the grid.
2. The `card-status` class names use the raw enum (`available`, `sold`, `one-of-one`, `reserved`) but the CSS contract in `gallery.astro` (lines 49-52) hardcodes those four. Adding a status to the Zod enum without updating both the JSX label map and the CSS will silently fall back to default styles with no warning.

**Fix:** Centralize the status → `{ label, className }` mapping in one TS module, import from both surfaces:

```ts
// src/lib/gallery-status.ts
export const STATUS_LABELS = {
  available: 'Available',
  sold: 'Sold',
  'one-of-one': 'One of one',
  reserved: 'Reserved',
} as const satisfies Record<string, string>;

export type GalleryStatus = keyof typeof STATUS_LABELS;
```

Pass already-resolved label strings into `GalleryGrid.jsx` so the React component is dumb. Then a missing `STATUS_LABELS` key produces a TypeScript error at compile time.

---

### WR-07: `scripts/prebuild-images.mjs` does `rm -rf public/gallery/` before any validation succeeds — partial run = empty deploy

**File:** `scripts/prebuild-images.mjs:42-44`
**Issue:** The first thing the script does is `rm public/gallery/ -r`. If anything later in the script throws (e.g., a corrupt HEIC, a slug-validation failure on piece #5 of 6), the previously-good output is gone and the build proceeds with no/partial WebP variants. The `process.exit(1)` halts the build, but on Cloudflare's build-and-cache infrastructure (or on a dev's machine running tasks in parallel), an interrupted prebuild leaves the tree empty until the next clean run.

**Fix:** Write to a temp dir, atomically swap on success:

```js
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const tmpOut = await mkdtemp(join(tmpdir(), 'bluemli-gallery-'));
// ... write all variants and manifest into tmpOut ...
// At end, atomic swap:
if (existsSync(GALLERY_OUT)) await rm(GALLERY_OUT, { recursive: true });
await rename(tmpOut, GALLERY_OUT);
```

Lower-effort alternative: wrap the loop in `try { ... } catch (err) { console.error(...); process.exit(1); }` and only `rm` at the end of a successful run.

---

### WR-08: `scripts/test-content-contracts.sh` mutates a tracked file in-place — interrupted run leaves committed state dirty

**File:** `scripts/test-content-contracts.sh:46, 52, 74`
**Issue:** The script `cp "$TARGET" "$BACKUP"` and then writes mutated content back to the real `src/content/gallery/cluster-blush/index.md` (a tracked file). Cleanup is a bash `trap` — robust for SIGINT/SIGTERM but not for SIGKILL, OOM, power loss, or accidental shell crash during the `awk` step (which runs before `cleanup` is registered, technically — `trap cleanup EXIT INT TERM` is on line 39, *before* the backup is made on line 46; race window is tiny but exists). If interrupted, the developer's working tree shows a typo'd or sold mutation in a tracked file, with no obvious indication of how it got there.

Also: there's no check that the script is run from a clean working tree. Running it while real edits to `cluster-blush/index.md` are unstaged silently overwrites them on the restore step.

**Fix:** Use a tracked-file-safe pattern:

```sh
# At start, refuse if working tree has unstaged changes to the target.
if ! git diff --quiet "$TARGET"; then
  echo "FAIL: $TARGET has unstaged changes — commit or stash before running contract tests."
  exit 1
fi

# Use git's own restore semantics as the safety net, not a tmp backup:
trap 'git checkout HEAD -- "$TARGET" 2>/dev/null || true' EXIT INT TERM
```

Smaller fix: at end-of-run, even after `cleanup`, verify `git diff --quiet "$TARGET"` and fail loudly if a diff remains.

---

### WR-09: Brand-rule grep treats `set -e` absence as a feature but the script has no aggregate FAIL summary

**File:** `scripts/check-brand-rules.sh:10, 125-128`
**Issue:** The "collect all violations" design is correct, but every rule's failure block prints multi-line text immediately. With 5 rules failing simultaneously, a contributor sees a 25-line wall of output and may not realize the script even ran to completion. The "All brand rules pass" message at the end is the only positive signal, but no "X rules failed" counter on the negative path.

Compound issue: rule numbering jumps from "Rule 5" directly to "Rule 7" (no Rule 6 in the file), implying a deleted rule or a typo — confusing for future maintainers.

**Fix:**

1. Track per-rule failure count and print a summary line:

   ```sh
   if [ "$failed" -gt 0 ]; then
     echo ""
     echo "FAIL: $failed brand rule(s) violated. Fix each block above before re-running CI."
   fi
   ```

2. Either renumber Rule 7 → Rule 6, or add a comment explaining the gap (e.g., `# Rule 6 was removed in Plan 04 — see ...`).

## Info

### IN-01: Six gallery markdown files are byte-for-byte identical except for `name`, `price`, `description`

**Files:** `src/content/gallery/cluster-{blush,cobalt,coral,lavender,saffron,sage}/index.md`
**Issue:** All six have `hero: ./hero.heic`, `status: available`, `featured: true`, `published_at: "2026-05-13"`. The descriptions follow the same template ("X glass beads, hand-clustered into a pair that..."). This is intentional Phase 2 seed content per D-07, but the duplication makes status-spread testing harder — every piece displays `Available` in the grid. There is no piece in any of the four non-available states (`sold`, `one-of-one`, `reserved`), so the per-status CSS rules and label fallbacks at lines 49-52 of `gallery.astro` cannot be visually verified outside the `test-content-contracts.sh` mutation test.

**Fix:** Flip two pieces to non-default statuses in the seed (e.g., `cluster-blush: sold`, `cluster-saffron: one-of-one`). The CI `Phase 2 smoke` step already checks that `cluster-sage` (available) doesn't show "Sold"; the inverse — that a `sold` piece *does* show "Sold" — is currently only covered by the contract test, not by the dist greps. Founder can flip them back to `available` as real inventory arrives.

---

### IN-02: `CONTENT_EDITING.md` documents `availabilty` typo error but the schema would surface a different message

**File:** `CONTENT_EDITING.md:159`
**Issue:** "`Unrecognized key 'availabilty'`" is the expected Zod 4 message under `.strict()`. Verified by `astro check` against the contract-test mutation (script's `[SC2]` step asserts it). But the docs say "the actual field is `status` — change it to `status: sold`" without making it visually clear that this maps the typo'd-key advice to a different field name entirely. A founder who literally typo'd `availability` to `availabilty` will be confused by the "change to status" advice.

**Fix:** Either tighten the example to a typo that matches what a real founder edit would produce (e.g., `name` vs `Name`, `published_at` vs `publishedAt`), or rewrite the explanation:

```md
- `Unrecognized key 'availabilty'` — that field doesn't exist in our schema. The schema is strict; only the seven listed field names work. (Common cause: trying to invent a field. The field that tracks whether a piece is sold is `status`, not `availabilty`.)
```

---

### IN-03: Zod `.email()` / `.url()` deprecation warnings — Zod 4 prefers `.format()` API

**File:** `src/content.config.ts:55, 65, 67`
**Issue:** `astro check` emits 3 deprecation hints:

```
warning ts(6385): '(params?: string | ...): ZodString' is deprecated.
  link: z.string().url().optional(),
  contact_email: z.string().email(),
  ig_dm_url: z.string().url(),
```

These are advisory in Zod 4, but every PR's CI logs will carry them, and a future Zod 5 will drop them entirely. Cost to fix is trivial.

**Fix:** Use the new format-string API per the Zod 4 migration guide:

```js
contact_email: z.email(),       // top-level z.email()
ig_dm_url:     z.url(),
link:          z.url().optional(),
```

(Verify the exact API surface in the version Astro 6 bundles before substituting — if the bundled Zod doesn't yet expose `z.email()` as a top-level, fall back to `z.string().regex(EMAIL_RE)`.)

---

### IN-04: `scripts/prebuild-images.mjs` lacks the `process` global type and emits four warnings on `astro check`

**File:** `scripts/prebuild-images.mjs:38, 61, 78, 82`
**Issue:** `Could not find name 'process'.` The script is a Node ESM module, but `tsconfig.json` includes `**/*` — which sweeps up `scripts/*.mjs` — without bringing in `@types/node`. The CI runs `astro check` before build; these warnings don't block, but they pollute the log.

**Fix:** Three options, pick one:

```jsonc
// Option A — tsconfig.json: scope astro check to src/ only
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "src/**/*"],
  "exclude": ["dist", "node_modules", "tests", "scripts"]
}

// Option B — add @types/node to devDependencies, then "types": ["node"] in tsconfig

// Option C — Add a tiny ambient block at the top of prebuild-images.mjs:
//   /** @typedef {{ exit: (code: number) => never }} Process */
//   /** @type {Process} */ // eslint-disable-line no-unused-vars
//   const _ = process;
```

Option A is the cleanest — `scripts/*.mjs` isn't shipped with the site and doesn't need TS-aware checking.

---

### IN-05: `Astro.site?.toString()` returns the URL with a trailing slash; subsequent `.replace(/\/$/, '')` works but the type cast around `manifestJson` is sloppy

**File:** `src/pages/gallery/[slug].astro:20`
**Issue:**

```ts
const manifest = manifestJson as unknown as Record<string, { 'hero-400': number[]; 'hero-800': number[]; 'hero-1600': number[] }>;
```

Double-cast `as unknown as` defeats TypeScript's structural check entirely. The manifest's actual shape is well-known and the same file is loaded by Astro at build time; nothing dynamic about it. A `satisfies` constraint at the import site or a generated type file would catch a shape regression (e.g., if `prebuild-images.mjs` ever started emitting `[w, h, byteSize]` instead of `[w, h]`).

**Fix:**

```ts
// src/types/gallery-manifest.ts
export type GalleryManifest = Record<string, {
  'hero-400':  readonly [number, number];
  'hero-800':  readonly [number, number];
  'hero-1600': readonly [number, number];
}>;

// [slug].astro:
import type { GalleryManifest } from '../../types/gallery-manifest';
import manifestJson from '../../../public/gallery/_manifest.json';
const manifest = manifestJson as GalleryManifest;
```

After BL-01's fix moves the manifest out of `public/`, the import path tightens up too.

---

_Reviewed: 2026-05-13T15:55:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
