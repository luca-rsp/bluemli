// scripts/prebuild-images.mjs
// Phase 2 (CNT-11, D-01..D-04): converts every src/content/gallery/<slug>/hero.*
// (HEIC, JPG, JPEG, PNG — case-insensitive per REVIEWS.md HIGH-5) into responsive
// WebP variants at public/gallery/<slug>/hero-{400,800,1600}.webp.
//
// Side-effects per slug:
//   1. Validate slug name against /^[a-z0-9-]+$/ (REVIEWS.md MEDIUM-7).
//   2. Find exactly one hero.* file (case-insensitive). Hard-fail on missing OR ambiguous.
//   3. Decode HEIC via pure-JS heic-convert if needed, then sharp-resize to 3 widths.
//   4. Record actual output dimensions for the manifest (REVIEWS.md MEDIUM-3).
//
// At script start: rm -rf public/gallery/ to clean stale variants (REVIEWS.md MEDIUM-2).
// At script end:   write public/gallery/_manifest.json for Plan 04 to import.
//
// Why pure-JS heic-convert (no libheif-dev apt step):
//   sharp's prebuilt binaries do NOT include HEIC support — they bundle a libvips
//   compiled WITHOUT libheif, regardless of what's on the system. See 02-RESEARCH.md §2.
//
// Why an explicit CI step (not an npm `prebuild` lifecycle hook):
//   pnpm 10 disables pre/post user-script hooks by default. See 02-RESEARCH.md §3.

import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import sharp from 'sharp';
import convert from 'heic-convert';

const GALLERY_SRC = './src/content/gallery';
const GALLERY_OUT = './public/gallery';
const MANIFEST_PATH = './public/gallery/_manifest.json';
const WIDTHS = [400, 800, 1600];      // D-03
const WEBP_QUALITY = 80;              // 02-RESEARCH.md §2
const SLUG_REGEX = /^[a-z0-9-]+$/;    // REVIEWS.md MEDIUM-7
const HERO_REGEX = /^hero\.(heic|jpg|jpeg|png)$/i;   // REVIEWS.md HIGH-5 + MEDIUM-3 case-insensitive

if (!existsSync(GALLERY_SRC)) {
  console.error(`FAIL: ${GALLERY_SRC} not found. Phase 2 expects per-slug folders here.`);
  process.exit(1);
}

// REVIEWS.md MEDIUM-2: clean stale variants (handles slug renames/removals during dev).
if (existsSync(GALLERY_OUT)) {
  await rm(GALLERY_OUT, { recursive: true });
}

const slugDirs = await readdir(GALLERY_SRC, { withFileTypes: true });

let processed = 0;
const manifest = {};   // { '<slug>': { 'hero-400': [w,h], 'hero-800': [w,h], 'hero-1600': [w,h] } }

for (const dirent of slugDirs) {
  if (!dirent.isDirectory()) continue;
  const slug = dirent.name;

  // Skip dotfiles (e.g., .gitkeep) and the manifest output dir if it accidentally lives here.
  if (slug.startsWith('.')) continue;

  // REVIEWS.md MEDIUM-7: validate slug name.
  if (!SLUG_REGEX.test(slug)) {
    console.error(`FAIL: slug "${slug}" violates /^[a-z0-9-]+$/ — folder name must be lowercase letters, digits, and hyphens only. Rename the folder and try again.`);
    process.exit(1);
  }

  // REVIEWS.md HIGH-5: case-insensitive hero discovery. Read the slug folder, find files
  // matching /^hero\.(heic|jpg|jpeg|png)$/i. Fail loudly on 0 OR >1 matches.
  const slugFiles = await readdir(join(GALLERY_SRC, slug));
  const heroCandidates = slugFiles.filter((f) => HERO_REGEX.test(f));

  // If no index.md exists in the folder, skip silently (could be a sibling support folder).
  const hasIndex = slugFiles.includes('index.md');
  if (!hasIndex && heroCandidates.length === 0) {
    console.log(`[prebuild] ${slug}/: no index.md and no hero.* — skipping (not a gallery piece).`);
    continue;
  }

  if (heroCandidates.length === 0) {
    console.error(`FAIL: ${slug}/ has index.md but no hero file matching /^hero\\.(heic|jpg|jpeg|png)$/i (case-insensitive). Capital letters work too — Hero.HEIC, hero.JPG, etc.`);
    process.exit(1);
  }
  if (heroCandidates.length > 1) {
    console.error(`FAIL: ${slug}/ has multiple hero files [${heroCandidates.join(', ')}]. Keep exactly one.`);
    process.exit(1);
  }

  const heroFile = heroCandidates[0];
  const heroPath = join(GALLERY_SRC, slug, heroFile);

  const outDir = join(GALLERY_OUT, slug);
  await mkdir(outDir, { recursive: true });

  let sourceBuffer = await readFile(heroPath);

  // HEIC → JPEG buffer via pure-JS heic-convert. CRITICAL: heic-convert returns
  // ArrayBuffer; must wrap with Buffer.from() before passing to sharp().
  if (extname(heroPath).toLowerCase() === '.heic') {
    const arrayBuffer = await convert({
      buffer: sourceBuffer,
      format: 'JPEG',
      quality: 1,
    });
    sourceBuffer = Buffer.from(arrayBuffer);
  }

  manifest[slug] = {};

  // Generate 3 WebP widths. fit: 'inside' preserves aspect ratio.
  // After each write, read actual output dimensions for the manifest (REVIEWS.md MEDIUM-3).
  for (const w of WIDTHS) {
    const outName = `hero-${w}.webp`;
    const outPath = join(outDir, outName);
    await sharp(sourceBuffer)
      .resize(w, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outPath);
    const meta = await sharp(outPath).metadata();
    manifest[slug][`hero-${w}`] = [meta.width, meta.height];
    console.log(`[prebuild] ${slug}/${outName} (${meta.width}×${meta.height})`);
  }
  processed++;
}

// REVIEWS.md MEDIUM-3: emit manifest for Plan 04 to import at build time.
await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`[prebuild] Done. ${processed} piece(s) processed. Manifest written to ${MANIFEST_PATH}.`);
