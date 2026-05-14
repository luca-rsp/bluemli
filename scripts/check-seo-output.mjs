#!/usr/bin/env node
// scripts/check-seo-output.mjs — Phase 3 gap-closure smoke test.
//
// Runs AFTER `astro build` (which must be invoked with PUBLIC_DEPLOY_ENV=production
// to flip robots.txt into production mode). Asserts:
//   GAP-01 / BL-03: dist/client/robots.txt contains Allow + Sitemap line (not Disallow).
//   GAP-02 / BL-01: dist/client/index.html canonical has the trailing slash.
//   GAP-03 / BL-02: when PUBLIC_CF_WORKERS_URL is set at build time, dist/client/gallery/
//                   <slug>/index.html's og:image carries the preview hostname (canonical
//                   stays on apex). PUBLIC_ prefix is required so Vite inlines the value
//                   into import.meta.env.PUBLIC_CF_WORKERS_URL, which is what
//                   resolveAssetBase() reads during the workerd prerender phase.
//
// The GAP-03 check is a *second* build pass: this script runs a separate
// preview-hostname build via `node:child_process` with PUBLIC_CF_WORKERS_URL set,
// then re-reads the gallery slug HTML.

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const DIST = 'dist/client';
const APEX = 'https://studiobluemli.com';
const PREVIEW = 'https://preview.example.workers.dev';
const ROBOTS = `${DIST}/robots.txt`;
const INDEX_HTML = `${DIST}/index.html`;
const PIECE_SLUG = 'cluster-coral'; // any committed gallery slug — see src/content/gallery/

let failures = 0;
function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failures += 1;
}
function ok(msg) {
  console.log(`OK: ${msg}`);
}

// ---------- GAP-01 / BL-03 ----------
if (!existsSync(ROBOTS)) {
  fail(`${ROBOTS} not found. Did you run \`PUBLIC_DEPLOY_ENV=production astro build\` first?`);
} else {
  const robots = readFileSync(ROBOTS, 'utf8');
  const sitemapLine = `Sitemap: ${APEX}/sitemap-index.xml`;
  if (!robots.includes(sitemapLine)) {
    fail(`robots.txt missing "${sitemapLine}". Got:\n${robots}`);
  } else if (robots.includes('Disallow: /')) {
    fail(`robots.txt still contains "Disallow: /". Body:\n${robots}`);
  } else if (!robots.includes('Allow: /')) {
    fail(`robots.txt missing "Allow: /". Body:\n${robots}`);
  } else {
    ok('GAP-01 / BL-03 — robots.txt has Allow + Sitemap (no Disallow).');
  }
}

// ---------- GAP-02 / BL-01 ----------
if (!existsSync(INDEX_HTML)) {
  fail(`${INDEX_HTML} not found.`);
} else {
  const html = readFileSync(INDEX_HTML, 'utf8');
  const expected = `<link rel="canonical" href="${APEX}/">`;
  if (!html.includes(expected)) {
    fail(`Homepage canonical missing trailing slash. Expected exact string: ${expected}`);
  } else if (html.match(/<link rel="canonical" href="https:\/\/studiobluemli\.com"(?!\/)/)) {
    fail('Homepage canonical still emitted without trailing slash somewhere in the HTML.');
  } else {
    ok('GAP-02 / BL-01 — homepage canonical has trailing slash.');
  }
}

// ---------- GAP-03 / BL-02 ----------
// Run a *second* build with PUBLIC_CF_WORKERS_URL set so Vite inlines it into
// import.meta.env.PUBLIC_CF_WORKERS_URL — the mechanism resolveAssetBase() uses
// during the workerd prerender phase where process.env is isolated from the Node
// build environment.
console.log(`\nRebuilding with PUBLIC_CF_WORKERS_URL=${PREVIEW} for GAP-03 preview-aware og:image check...`);
try {
  // Use `npm exec astro build` so the locally-installed astro binary is found
  // regardless of whether this script runs from the main repo or a worktree.
  execSync('npm exec -- astro build', {
    env: { ...process.env, PUBLIC_CF_WORKERS_URL: PREVIEW, PUBLIC_DEPLOY_ENV: 'production' },
    stdio: 'inherit',
    shell: true,
  });
} catch (e) {
  fail(`Second build (PUBLIC_CF_WORKERS_URL set) failed: ${e.message}`);
}

const piecePath = `${DIST}/gallery/${PIECE_SLUG}/index.html`;
if (!existsSync(piecePath)) {
  fail(`${piecePath} not found — adjust PIECE_SLUG in this script to a real committed slug.`);
} else {
  const pieceHtml = readFileSync(piecePath, 'utf8');
  const expectedOgImage = `${PREVIEW}/gallery/${PIECE_SLUG}/hero-800.webp`;
  const ogImageMatch = pieceHtml.match(/<meta property="og:image"\s+content="([^"]+)"/);
  if (!ogImageMatch) {
    fail(`No og:image meta tag found in ${piecePath}.`);
  } else if (ogImageMatch[1] !== expectedOgImage) {
    fail(`og:image is not preview-aware. Got "${ogImageMatch[1]}", expected "${expectedOgImage}".`);
  } else {
    ok(`GAP-03 / BL-02 — per-piece og:image uses preview hostname: ${ogImageMatch[1]}`);
  }
  // Canonical must STAY on apex (canonical-to-apex contract per D-26 + SC5).
  // Non-root pages don't get a trailing slash (only root `/` gets `https://studiobluemli.com/`).
  // Check both with-slash and without-slash forms — either is acceptable as long as the
  // canonical uses apex, not the preview hostname.
  const canonicalWithSlash    = `<link rel="canonical" href="${APEX}/gallery/${PIECE_SLUG}/">`;
  const canonicalWithoutSlash = `<link rel="canonical" href="${APEX}/gallery/${PIECE_SLUG}">`;
  const hasApexCanonical = pieceHtml.includes(canonicalWithSlash) || pieceHtml.includes(canonicalWithoutSlash);
  const hasPreviewCanonical = pieceHtml.includes(`<link rel="canonical" href="${PREVIEW}`);
  if (hasPreviewCanonical) {
    fail(`Canonical leaked off apex on preview-hostname build — found preview hostname in canonical.`);
  } else if (!hasApexCanonical) {
    fail(`Canonical not found on apex on preview-hostname build. Expected one of:\n  ${canonicalWithSlash}\n  ${canonicalWithoutSlash}`);
  } else {
    ok(`GAP-03 / BL-02 — per-piece canonical stays on apex (no leak): ${APEX}/gallery/${PIECE_SLUG}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} failure(s). See above.`);
  process.exit(1);
}
console.log('\nAll SEO smoke checks passed.');
