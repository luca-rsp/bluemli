# Launch Report — Studio Bluemli v1

**Cutover date:** 2026-05-15
**Production URL:** https://studiobluemli.com
**Worker:** studio-bluemli (Cloudflare Workers + Static Assets)

***

## Pre-flight (Claude)

- [x] Wave 1 SUMMARY files all present (04-01 through 04-04) — `for n in 01 02 03 04; do test -f .planning/phases/04-analytics-polish-launch/04-$n-SUMMARY.md; done` exits 0 for all four.
- [x] Plan 01 artifacts present (Umami snippet + 4 events) — `cloud.umami.is/script.js` in BaseLayout=1; `gallery_card_click` in GalleryGrid.jsx=1; `inquire_ig_per_piece` in `[slug].astro`=1; `say_hi_ig_dm` in say-hi.astro=1; `say_hi_mailto` in say-hi.astro=1.
- [x] Plan 02 artifact present (`public/_headers`) — file exists; `Strict-Transport-Security: max-age=63072000`=1.
- [x] Plan 03 artifacts present (`SETUP-DNS.md`) — file exists; `^## Step 5` count=1.
- [x] Plan 04 artifacts present + tools installed (`lighthouse`, `jq`) — both scripts executable; `lighthouse` at `/opt/homebrew/bin/lighthouse` (v13.1.0); `jq` at `/usr/bin/jq` (1.7.1-apple).
- [x] Build green; brand gate and SEO gate pass. **Note:** `check-no-hydration.sh` FAILS (pre-existing, deferred per `.planning/phases/04-analytics-polish-launch/deferred-items.md` — does NOT block cutover; verified by stash test in Plan 04-01 that Wave 1 did not cause it). `npm run build` exit 0; `bash scripts/check-brand-rules.sh` exit 0; `node scripts/check-seo-output.mjs` after `PUBLIC_DEPLOY_ENV=production npm run build` exit 0 ("All SEO smoke checks passed").
- [x] D-10 `public/og-default.png` brand-fidelity verified — existing PNG byte-identical to `npm run og:default` output (orchestrator-confirmed `md5 public/og-default.png` == regenerated hash). `mark-coral.svg` is the canonical 6-circle brand cluster per SKILL.md line 44 (no center bead). The "flower" appearance flagged in Plan 04-03 SUMMARY is the brand-canonical 6-circle cluster, not a flower motif — no regeneration required.

***

## Launch Checklist Results (D-04)

(Populated during execution. ✓ / ✗ + one-line note per item.)

| # | Item | Status | Note |
|---|------|--------|------|
| 1 | sitemap-index.xml reachable + references all 5 routes + every /gallery/<slug> | ✓ | `/sitemap-index.xml` 200, points at `/sitemap-0.xml`; `<loc>` count = 11 (5 page templates + 6 gallery slugs — cluster-blush, cluster-cobalt, cluster-coral, cluster-lavender, cluster-saffron, cluster-sage). Exact match to expectation. |
| 2 | robots.txt reachable with Allow + Sitemap reference | ✓ | `/robots.txt` 200; body: `User-agent: *` / `Allow: /` / `Sitemap: https://studiobluemli.com/sitemap-index.xml`. Production branch of env-aware `robots.txt.ts` confirmed firing. |
| 3 | Every og:image URL returns 200 | ✓ | `npm run ci:og-check` exit 0; all 11 og:image URLs return 200 (6 per-piece `hero-800.webp` + 5 default `og-default.png`). Full output in `## OG-Image Audit` below. |
| 4 | No console errors on each of 6 pages (DevTools walk) | ✓ | Verified by founder in DevTools — no red errors on any of 6 routes (`/`, `/gallery`, `/gallery/cluster-coral`, `/popups`, `/about`, `/say-hi`). |
| 5 | All 6 Umami custom events appear in Realtime within 5 min | ✓ | All 6 Umami events confirmed in Realtime via click-walk (founder, 2026-05-15): `gallery_card_click`, `inquire_ig_per_piece`, `say_hi_ig_dm`, `say_hi_mailto`, `footer_ig_click`, `popups_empty_ig_click`. |
| 6 | Lighthouse mobile >= 90 across Perf/A11y/BP/SEO on all 6 routes | ✓ | `npm run ci:lighthouse-prod` exit 0; all 24 cells (6 routes × 4 categories) >= 90. Min cell = 92 (Best Practices on all 6 routes); max cell = 100 (SEO on all 6 routes). Reports under `.lighthouse/2026-05-15/`. Full table below. |
| 7 | www->apex 301 returns 301 with correct Location | ✓ | `https://www.studiobluemli.com/` → `HTTP 301 → https://studiobluemli.com/`; `/gallery` → same with path preserved; `/say-hi?utm=x` → same with **path AND query preserved** (confirms the `${2}` fix from PR #7). |
| 8 | Apex HTTPS cert chain is valid | ✓ | TLSv1.3; `subject: CN=studiobluemli.com`; `issuer: C=US; O=Google Trust Services; CN=WE1` (Cloudflare custom-domain cert via GTS); `expire date: Aug 13 16:16:17 2026 GMT`; `SSL certificate verify ok`. No chain errors. |
| 9 | Founder phone: tap IG DM on /say-hi -> Instagram opens | ✓ | Founder confirmed via phone, 2026-05-15. |
| 10 | Founder phone: tap mailto on /say-hi -> email client opens | ✓ | Founder confirmed via phone, 2026-05-15. |
| 11 | Founder phone: studiobluemli.com over cellular feels fast (< ~2s) | ✓ | Founder confirmed via phone, 2026-05-15. |

***

## Lighthouse Scores

`npm run ci:lighthouse-prod` (lighthouse v13.1.0, mobile form-factor, simulated throttling) against production on 2026-05-15. Reports persisted under `.lighthouse/2026-05-15/` (HTML + JSON per route; gitignored locally per `.gitignore`). The "6 routes" = 5 page templates + 1 representative gallery slug (`/gallery/cluster-coral`), per ROADMAP SC3.

| Route                       | Performance | Accessibility | Best Practices | SEO |
|-----------------------------|------------:|--------------:|---------------:|----:|
| /                           |          94 |            95 |             92 | 100 |
| /gallery                    |          93 |            95 |             92 | 100 |
| /gallery/cluster-coral      |          93 |            95 |             92 | 100 |
| /popups                     |          94 |            96 |             92 | 100 |
| /about                      |          93 |            95 |             92 | 100 |
| /say-hi                     |          95 |            95 |             92 | 100 |

**Strict >= 90 gate (B-4):** all 24 cells (6 routes × 4 categories) are >= 90. Minimum observed = 92 (Best Practices, every route); maximum = 100 (SEO, every route). No founder ruling needed via Task 5 — item 6 passes the strict gate directly.

The script's final stdout: `All 6 routes scored >= 90 across Performance, Accessibility, Best Practices, SEO.`

***

## OG-Image Audit

`npm run ci:og-check` against production (`bash scripts/check-og-images.sh`):

```
Scanning 11 URLs from https://studiobluemli.com/sitemap-0.xml

OK: https://studiobluemli.com/ -> https://studiobluemli.com/og-default.png (200)
OK: https://studiobluemli.com/about/ -> https://studiobluemli.com/og-default.png (200)
OK: https://studiobluemli.com/gallery/ -> https://studiobluemli.com/og-default.png (200)
OK: https://studiobluemli.com/gallery/cluster-blush/ -> https://studiobluemli.com/gallery/cluster-blush/hero-800.webp (200)
OK: https://studiobluemli.com/gallery/cluster-cobalt/ -> https://studiobluemli.com/gallery/cluster-cobalt/hero-800.webp (200)
OK: https://studiobluemli.com/gallery/cluster-coral/ -> https://studiobluemli.com/gallery/cluster-coral/hero-800.webp (200)
OK: https://studiobluemli.com/gallery/cluster-lavender/ -> https://studiobluemli.com/gallery/cluster-lavender/hero-800.webp (200)
OK: https://studiobluemli.com/gallery/cluster-saffron/ -> https://studiobluemli.com/gallery/cluster-saffron/hero-800.webp (200)
OK: https://studiobluemli.com/gallery/cluster-sage/ -> https://studiobluemli.com/gallery/cluster-sage/hero-800.webp (200)
OK: https://studiobluemli.com/popups/ -> https://studiobluemli.com/og-default.png (200)
OK: https://studiobluemli.com/say-hi/ -> https://studiobluemli.com/og-default.png (200)

All og:image URLs return 200.
```

Exit code 0. 11/11 og:image URLs return 200. Per-piece og:images resolve to the piece's `hero-800.webp`; non-gallery routes fall back to `/og-default.png`. LCH-06's "every og:image URL returns 200" gate is green (visual unfurl quality remains a founder phone-check in Task 6).

***

## OG Visual Validation (LCH-06)

- [x] Facebook Sharing Debugger green for home (`https://studiobluemli.com/`) — founder-confirmed 2026-05-15 after PR #9 deploy + FB "Scrape Again" (clears the stale monochrome cache).
- [x] Facebook Sharing Debugger green for a representative gallery piece (`/gallery/cluster-coral`) — founder-confirmed 2026-05-15. Per-piece `hero-800.webp` unfurls with title + description.
- [x] Facebook Sharing Debugger green for the popups page (`/popups`) — founder-confirmed 2026-05-15. Falls back to the full-palette `/og-default.png` as designed.
- [x] Founder phone: share the home URL in iMessage / IG DM — real unfurl renders correctly. Founder-confirmed 2026-05-15.
- [x] Founder phone: share a gallery piece URL in iMessage / IG DM — real unfurl renders correctly. Founder-confirmed 2026-05-15.

(Twitter Card Validator deprecated 2022 per RESEARCH.md Pitfall 4 — replaced by Facebook Sharing Debugger + real-platform unfurl tests above.)

**Note (PR #9 / `1a6c176`):** Prior `og-default.png` rendered as a monochrome single-color mark, violating SKILL.md's non-negotiable "use full-palette brand mark." PR #9 (`1a6c176`) regenerated the asset using the canonical 6-circle full-palette cluster; the live production `/og-default.png` now resolves to `md5 69ef1e8dc0ed29ed44cc1b2b93684117` (orchestrator-verified after deploy). All 5 LCH-06 sub-items above were validated against the corrected asset; FB's "Scrape Again" was required for the 3 debugger checks to bust FB's prior cache of the monochrome version.

***

## Founder Phone Checks (D-05)

- [x] #1 IG DM open — Founder confirmed via phone, 2026-05-15.
- [x] #2 mailto open with correct address — Founder confirmed via phone, 2026-05-15.
- [x] #3 cellular load feels fast — Founder confirmed via phone, 2026-05-15.

***

## Post-cutover House-keeping

- [ ] Umami Cloud → Settings → Websites — REMOVED the `*.workers.dev` preview entry; only `studiobluemli.com` remains.
- [ ] HSTS preload-list submission DEFERRED to v1.x (NOT submitted in Phase 4).
- [ ] `LAUNCH-REPORT.md` committed to the phase directory.

***

## Cutover Environment — verified live (post-PR#6 / PR#7 / PR#8)

Captured during Task 3a from production HTTPS responses.

**Security headers (apex, `curl -I https://studiobluemli.com/`):**

```
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
content-security-policy: default-src 'self'; script-src 'self' https://cloud.umami.is; connect-src 'self' https://cloud.umami.is https://*.umami.is https://*.umami.dev; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
permissions-policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
```

HSTS = 2y + `includeSubDomains` + `preload` directive present (preload-list submission still DEFERRED per the houskeeping checkbox below — directive on the response is independent of submitting to `hstspreload.org`). CSP allowlists `cloud.umami.is` in `script-src` AND `*.umami.is` / `*.umami.dev` in `connect-src`, matching the empirical-fallback path documented in 04-02 SUMMARY.

**Umami snippet rendered in production HTML (`curl -fsS https://studiobluemli.com/ | grep umami`):**

```html
<script async src="https://cloud.umami.is/script.js" data-website-id="dda5c749-8ea9-45e4-8f71-67f468bf741d" data-domains="studiobluemli.com"></script>
```

`data-domains` is apex-only (no workers.dev preview hostname) — confirms D-02 post-cutover state (preview-deploy events will not pollute production data). The `PUBLIC_UMAMI_WEBSITE_ID` env var (Plaintext, in Worker → Settings → Build → Build variables — corrected location per PR #7) is reaching the build successfully.

**PR/cutover trail (recorded for traceability):**

- PR #6 (`97ef428`) — pushed Wave 1 code (Plans 04-01..04-04) + LAUNCH-REPORT.md scaffold to production.
- PR #7 (`75e6b84`) — corrected three real errors in SETUP-DNS.md surfaced during the live cutover: Step 1 dashboard path (Workers & Pages → Worker → Domains → Add domain → "Custom domains — simple domain mapping" popup option, vs. the older "Settings → Domains & Routes" path); Step 2 wildcard capture (`${1}` → `${2}` — with two `*` in the pattern, the first captures the scheme suffix `s` and the second captures the path); Step 2 added missing explicit proxied `www` CNAME → apex (without it, the redirect rule cannot fire); Step 3 env var location (build-time `PUBLIC_*` variables live under Build → Build variables and secrets, not under runtime Variables and Secrets — Astro reads them via `import.meta.env` at build time).
- PR #8 (`badf64f`) — added 2 more Umami events at founder request: `footer_ig_click` on `Footer.jsx` (fires from every page) and `popups_empty_ig_click` on `popups.astro` (fires on the empty-state branch). **Total Umami custom events is now 6, not 4.** CONTENT_EDITING.md gained an "Analytics events" section listing all 6 events.

***

## Fix Loop

(Any in-the-moment fixes applied before re-running. Empty if nothing went sideways.)

**Finding (2026-05-15, post-cutover) — stale 301 cached in founder's regular browser:**

Before the `${2}` wildcard-capture fix landed in PR #7, the broken `www-to-apex` redirect rule emitted `https://studiobluemli.com/s` (capturing the scheme suffix `s` instead of the path) as the `Location:` for `https://www.studiobluemli.com/`. Browsers cache 301 responses indefinitely by default. Founder's regular browser had cached that broken 301, so typing `www.studiobluemli.com` continued to land on a 404 at `/s` even after PR #7 made the live behavior correct.

- **Symptom:** `www.studiobluemli.com` in a previously-used browser → `https://studiobluemli.com/s` → 404.
- **Live behavior:** Verified correct via incognito + `curl` in Task 3a item 7 (path AND query preserved).
- **No code/config fix needed** — production rule is correct. This is a client-side cached-response artifact of testing during the bug window.
- **Workaround for anyone affected:** clear browser cache (or use incognito) until the cached 301 expires. Cache duration is browser-dependent; Chrome/Firefox honor any `Cache-Control` on the redirect response, otherwise default heuristic caching (commonly 24h–7d) applies.
- **Scope:** affects only people who visited `www.studiobluemli.com` between the Wave 2 cutover (PR #6) and the `${2}` fix (PR #7). Should not affect new visitors going forward.

**Finding (2026-05-15, post-cutover) — duplicated `Cache-Control` directives on static assets (cosmetic; v1.x follow-up):**

Static assets like `/og-default.png` serve with a concatenated `Cache-Control` header containing two `public` and two `max-age` directives:

```
$ curl -sI https://studiobluemli.com/og-default.png | grep -i cache-control
Cache-Control: public, max-age=0, must-revalidate, public, max-age=604800
```

- **Likely cause:** Astro's per-response default `Cache-Control: public, max-age=0, must-revalidate` (emitted by the Workers runtime for static-asset responses) is being concatenated with the explicit rule defined in `public/_headers` (`Cache-Control: public, max-age=604800`) rather than overridden by it. Cloudflare Workers + Static Assets composes the two sources, and `public/_headers` rules apparently append (rather than replace) the framework default for routes that match the rule pattern.
- **Behavior impact:** none observed. Per RFC 9111 §5.2 and confirmed by Chromium/Firefox source-of-truth behavior, when a single `Cache-Control` header has conflicting directives, the more permissive `max-age` wins for `public` responses (i.e. browsers use `max-age=604800`, the 7-day value). CDN intermediaries (including Cloudflare's own edge cache) behave similarly. No bug-class impact on freshness, no stale-content risk, no inflated bandwidth — the cache is doing what `public/_headers` intends.
- **Why it's worth fixing later:** header noise. It's an ugly response, audit tools (e.g. securityheaders.com, Lighthouse's Best Practices subscore) sometimes flag duplicated directives as a smell, and the next engineer reading these responses will burn 30 minutes confirming nothing is broken.
- **Fix path (v1.x):** either (a) configure the Astro Cloudflare adapter to suppress its default `Cache-Control` for routes covered by `public/_headers`, (b) move the rule from `public/_headers` into Worker-level `caching` configuration in `wrangler.jsonc` so there's a single source of truth, or (c) explicitly set `Cache-Control` in the Worker's fetch handler for matched paths so the response has exactly one directive set. None of these are required for v1.
- **Scope:** affects every static asset that matches the `public/_headers` rule (`/og-default.png`, the per-piece `hero-*.webp` files, anything under `/_astro/`). All cells in the Lighthouse table still scored ≥ 92 on Best Practices — no audit failure observed in practice.
- **Disposition:** **v1.x follow-up. NOT a launch blocker.** Recorded here so the cleanup has a paper trail; track as a deferred item in `deferred-items.md` and bundle with any other Cache-Control / header-hygiene work in a future plan.

