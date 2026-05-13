// scripts/sync-design-skill.mjs
// One-shot copy + transform script (D-04..D-06).
// Run via: pnpm run sync:design-skill
//
// After this script runs once, src/components/design-skill/ is the source of truth
// and may diverge from .claude/skills/studio-bluemli-design/. Re-running is safe
// (idempotent React-import insert) but will OVERWRITE local edits — so re-run only
// when the founder explicitly updates the skill and wants to re-pull.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const SKILL = '.claude/skills/studio-bluemli-design/ui_kits/website';
const DEST  = 'src/components/design-skill';
const STYLES_SRC = '.claude/skills/studio-bluemli-design/colors_and_type.css';
const STYLES_DEST = 'src/styles/colors_and_type.css';

// Transform 5: explicit allowlist. App.jsx and index.html are click-thru wiring,
// not components — we don't need them.
const COPY_LIST = [
  'Mark.jsx', 'Button.jsx', 'BeadCluster.jsx', 'Header.jsx',
  'Hero.jsx', 'About.jsx', 'GalleryGrid.jsx', 'PopupStrip.jsx',
  'AppointmentForm.jsx', 'Footer.jsx', 'ProductSheet.jsx',
];

const transforms = [
  // Transform 1: UMD global registration → ES module default export
  [/window\.(\w+)\s*=\s*\1;?/g, 'export default $1;'],
  // Transform 3: asset path rewrite (../../assets/logo/* → /*)
  [/\.\.\/\.\.\/assets\/logo\//g, '/'],
  // Transform 4: remove backdrop-filter lines (brand rule + CI Rule 4)
  [/^\s*(backdropFilter|WebkitBackdropFilter):\s*['"][^'"]*['"],?\s*$/gm, ''],
];

await fs.mkdir(DEST, { recursive: true });

for (const file of COPY_LIST) {
  let src = await fs.readFile(path.join(SKILL, file), 'utf8');
  for (const [re, repl] of transforms) {
    src = src.replace(re, repl);
  }
  // Transform 2: defensive React import (idempotent)
  if (!src.includes("import React")) {
    src = src.replace(/^\/\* eslint-disable \*\/$/m, "/* eslint-disable */\nimport React from 'react';");
  }
  await fs.writeFile(path.join(DEST, file), src);
}

// Copy and strip the @import url(fonts.googleapis.com) line from colors_and_type.css
// (UI-SPEC § "Font Loading": fonts load only through Astro Fonts API)
let css = await fs.readFile(STYLES_SRC, 'utf8');
css = css.replace(/^@import url\("https:\/\/fonts\.googleapis\.com[^"]*"\);\s*$/m, '');
await fs.mkdir(path.dirname(STYLES_DEST), { recursive: true });
await fs.writeFile(STYLES_DEST, css);

console.log(`Synced ${COPY_LIST.length} components and colors_and_type.css.`);
console.log('Manual TODO: review each file for any remaining cross-skill refs.');
console.log('Manual TODO: post-sync edits in Plan 02 Task 3 are NOT done by this script.');
