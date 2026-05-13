// astro.config.mjs
import { defineConfig, passthroughImageService, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://studiobluemli.com',
  // output: 'server' — switched from 'static' during Task 2 Step 3 build
  // verification. With Astro 6.3 + @astrojs/cloudflare@13.5, the adapter does
  // not emit the legacy `dist/_worker.js/index.js` entrypoint under
  // output:'static'; it emits `dist/server/entry.mjs` only when output:'server'.
  // Setting 'server' here guarantees the unified entrypoint exists; Astro will
  // still prerender static pages automatically (any page with no dynamic logic
  // or `getStaticPaths` is prerendered by default). See RESEARCH.md A8 fallback.
  output: 'server',

  adapter: cloudflare({}),

  integrations: [react()],

  image: {
    // Sharp doesn't run in workerd (Pitfall #9). Use passthrough — no transforms
    // but still get layout-shift prevention and forced alt enforcement.
    service: passthroughImageService(),
  },

  // Astro 6 stable Fonts API — top-level `fonts`, NOT under experimental.
  // `display: 'swap'` is required on every face (FND-07, Pitfall #10, D-15).
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Bagel Fat One',
      cssVariable: '--font-wordmark-loaded',
      weights: [400],
      display: 'swap',
    },
    {
      provider: fontProviders.google(),
      name: 'Caveat Brush',
      cssVariable: '--font-display-loaded',
      weights: [400],
      display: 'swap',
      // SWAP PATH (D-17): when the founder provides a real hand-display WOFF2,
      // replace this entry with `provider: fontProviders.local()` pointing at
      // public/fonts/<file>.woff2. This is the only file that needs to change.
    },
    {
      provider: fontProviders.google(),
      name: 'Nunito',
      cssVariable: '--font-body-loaded',
      weights: [400, 700],
      display: 'swap',
    },
    // --font-hand (Caveat) — REQUIRED per D-16 (the lock is binary: load it or remove all
    // --font-hand references). About.jsx references --font-hand for the signature close, so
    // we load it here. Plan 04's BaseLayout.astro consumes this via <Font cssVariable="--font-hand-loaded" preload />.
    // REVIEW FIX M5 (Codex review): no "fallback acceptable" middle path.
    {
      provider: fontProviders.google(),
      name: 'Caveat',
      cssVariable: '--font-hand-loaded',
      weights: [400],
      display: 'swap',
    },
  ],
});
