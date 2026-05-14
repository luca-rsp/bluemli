// src/pages/robots.txt.ts — Phase 3 PAG-08 / D-29.
// Env-aware robots.txt:
//   - Production (main branch): Allow: / + sitemap reference.
//   - Preview / workers.dev / local dev: Disallow: /
//
// Astro emits this to dist/client/robots.txt because of `prerender = true`
// (Pitfall 4: without this flag, output:'server' makes /robots.txt hit the
// Worker on every request, defeating static-first goals).
//
// REVIEWS-MODE Concern 7: isProduction() in src/lib/site-url.ts now hardens
// against missing env-var exposure paths (process.env vs import.meta.env vs
// PUBLIC_-prefixed). Manual fallback: set PUBLIC_DEPLOY_ENV=production in the
// Cloudflare build command if WORKERS_CI_BRANCH ever becomes unreachable.

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
