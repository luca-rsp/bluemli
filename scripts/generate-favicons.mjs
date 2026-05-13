// scripts/generate-favicons.mjs
// One-shot favicon generation (D-19, D-20). Runs via: pnpm run favicons
//
// Inputs:
//   assets/logo/mark.svg            — source SVG, drives favicon.ico + favicon-16/32.png + favicon.svg
//   assets/logo/mark-favicon-180.png — existing iOS touch icon (DO NOT regenerate per D-19; copied as-is)
//
// Outputs (committed into public/):
//   favicon.ico             multi-size 16/32/48 .ico
//   favicon-16.png          16x16 PNG
//   favicon-32.png          32x32 PNG
//   favicon.svg             copy of mark.svg
//   apple-touch-icon.png    copy of mark-favicon-180.png
//   mark.svg                copy of mark.svg (Header/Footer reference <img src="/mark.svg">)

import iconGen from 'icon-gen';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const SVG_IN  = 'assets/logo/mark.svg';
const TOUCH_IN = 'assets/logo/mark-favicon-180.png';
const OUT_DIR = 'public';

await fs.mkdir(OUT_DIR, { recursive: true });

await iconGen(SVG_IN, OUT_DIR, {
  report: true,
  favicon: {
    name: 'favicon',
    pngSizes: [16, 32],
    icoSizes: [16, 32, 48],
  },
});

// icon-gen emits favicon16.png and favicon32.png (no hyphen).
// Rename to match UI-SPEC <link> tag references (favicon-16.png / favicon-32.png).
await fs.rename(path.join(OUT_DIR, 'favicon16.png'), path.join(OUT_DIR, 'favicon-16.png'));
await fs.rename(path.join(OUT_DIR, 'favicon32.png'), path.join(OUT_DIR, 'favicon-32.png'));

// Copy the SVG mark in two places:
// - public/favicon.svg → <link rel="icon" type="image/svg+xml">
// - public/mark.svg    → Header.jsx <img src="/mark.svg">
await fs.copyFile(SVG_IN, path.join(OUT_DIR, 'favicon.svg'));
await fs.copyFile(SVG_IN, path.join(OUT_DIR, 'mark.svg'));

// Copy the pre-existing 180x180 PNG as the apple-touch-icon (D-19: no regeneration).
await fs.copyFile(TOUCH_IN, path.join(OUT_DIR, 'apple-touch-icon.png'));

console.log('Generated favicon set in public/:');
console.log('  favicon.ico, favicon-16.png, favicon-32.png');
console.log('  favicon.svg, mark.svg (copies of assets/logo/mark.svg)');
console.log('  apple-touch-icon.png (copy of assets/logo/mark-favicon-180.png, not regenerated per D-19)');
