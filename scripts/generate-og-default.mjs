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

// Pick the full-palette mark (SKILL.md non-negotiable: "Default to mark.svg
// — full palette") and fall back to the monochrome coral only if it's missing.
async function pickMark() {
  const candidates = [
    'assets/logo/mark.svg',
    'assets/logo/mark-coral.svg',
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
