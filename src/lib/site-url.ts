// src/lib/site-url.ts — env-aware base URL resolvers (D-26) + production branch check (D-29).
// Build-time only — consumed by src/components/SEO.astro and src/pages/robots.txt.ts.
//
// REVIEWS-MODE Concern 1 fix: split into resolveCanonicalBase() (ALWAYS apex)
// and resolveAssetBase() (MAY use preview hosts). Original `resolveSiteBase()`
// leaked preview hostnames into canonical/og:url, contradicting D-26 + SC5.
//
// REVIEWS-MODE Concern 7 fix: isProduction() now checks process.env AND
// import.meta.env AND PUBLIC_-prefixed variants AND a PUBLIC_DEPLOY_ENV escape
// hatch — covers all known Vite/Astro/Cloudflare env-exposure paths.
//
// Pattern lifted from src/pages/gallery/[slug].astro (Phase 2 — REVIEWS.md HIGH-4),
// generalized into a shared helper. Never assign at module top-level (Pitfall 2 —
// Vite would inline the value at build); always wrap env reads in a function so
// the value resolves against the actual build's env.

const APEX = 'https://studiobluemli.com';

/**
 * Resolve the CANONICAL base URL — always apex.
 *
 * Used by:
 *   - <link rel="canonical">
 *   - <meta property="og:url">
 *
 * NEVER consults CF_PAGES_URL / CF_WORKERS_URL / PUBLIC_SITE_URL — those would
 * leak preview hostnames into canonical, contradicting D-26 (canonical to apex
 * even on preview deploys) and Phase 3 SC5.
 *
 * Returns a URL WITHOUT trailing slash.
 */
export function resolveCanonicalBase(astroSite?: URL): string {
  const fromAstroSite = astroSite?.toString();
  if (fromAstroSite) return fromAstroSite.replace(/\/$/, '');
  return APEX;
}

/**
 * Resolve the ASSET base URL — preview-aware, used for absolute asset URLs.
 *
 * Used by:
 *   - <meta property="og:image"> (when an explicit override is needed for
 *     preview-deploy unfurls; v1 ships with og:image on apex too, but the
 *     helper is here for future flexibility per D-26 risk note)
 *   - any other absolute-URL emission that benefits from working on previews
 *
 * Precedence:
 *   1. process.env.CF_PAGES_URL       (Cloudflare Pages preview/production)
 *   2. process.env.CF_WORKERS_URL     (Cloudflare Workers Builds preview hostname)
 *   3. process.env.PUBLIC_SITE_URL    (explicit operator override, Node side)
 *   4. import.meta.env.PUBLIC_SITE_URL (explicit operator override, Vite side)
 *   5. resolveCanonicalBase(astroSite) (apex fallback — same as canonical)
 *
 * BL-02 / GAP-03 fix: Vite only exposes `PUBLIC_`-prefixed env vars to
 * `import.meta.env`. CF_PAGES_URL and CF_WORKERS_URL live in `process.env`
 * during the Cloudflare build — same pattern isProduction() uses below.
 * PUBLIC_SITE_URL is read from both sides so an operator override works
 * regardless of which runtime surface they set it on.
 *
 * Returns a URL WITHOUT trailing slash.
 */
export function resolveAssetBase(astroSite?: URL): string {
  // BL-02 / GAP-03 fix: Vite only exposes `PUBLIC_`-prefixed env vars to
  // `import.meta.env`. CF_PAGES_URL and CF_WORKERS_URL live in `process.env`
  // during the Cloudflare build (same pattern isProduction() uses below).
  // PUBLIC_SITE_URL is read from both sides so an explicit operator override
  // works regardless of which runtime surface they set it on.
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};
  const fromEnv =
    procEnv.CF_PAGES_URL ??
    procEnv.CF_WORKERS_URL ??
    procEnv.PUBLIC_SITE_URL ??
    import.meta.env.PUBLIC_SITE_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');
  return resolveCanonicalBase(astroSite);
}

/**
 * True only when the build is producing the production deployment (main branch).
 * Used by src/pages/robots.txt.ts to gate Allow vs Disallow.
 *
 * REVIEWS-MODE Concern 7 hardening: check ALL known env-exposure paths.
 * Workers Builds may expose env vars via process.env (Node) OR import.meta.env
 * (Vite); PUBLIC_-prefixed variants are exposed to client by Vite. The
 * PUBLIC_DEPLOY_ENV escape hatch lets the operator force production via the
 * build command (e.g., `PUBLIC_DEPLOY_ENV=production npm run build`).
 *
 * In local dev (no signals set) returns false → robots.txt defaults to
 * `Disallow: /`, which is the safer side of any ambiguity.
 */
export function isProduction(): boolean {
  // process.env (Node-side, available during SSG/build)
  const procBranch = typeof process !== 'undefined' && process.env
    ? (process.env.WORKERS_CI_BRANCH ?? process.env.CF_PAGES_BRANCH)
    : undefined;
  if (procBranch === 'main') return true;

  const procDeployEnv = typeof process !== 'undefined' && process.env
    ? process.env.PUBLIC_DEPLOY_ENV
    : undefined;
  if (procDeployEnv === 'production') return true;

  // import.meta.env (Vite-side, available during build inline)
  const viteBranch =
    import.meta.env.WORKERS_CI_BRANCH ??
    import.meta.env.PUBLIC_WORKERS_CI_BRANCH ??
    import.meta.env.CF_PAGES_BRANCH;
  if (viteBranch === 'main') return true;

  const viteDeployEnv = import.meta.env.PUBLIC_DEPLOY_ENV;
  if (viteDeployEnv === 'production') return true;

  return false;
}
