---
phase: 04-analytics-polish-launch
verified: 2026-05-15T20:30:00Z
status: passed
score: 9/9 must-haves verified
overrides_applied: 0
re_verification:
  previous_status: none
  previous_score: n/a
  gaps_closed: []
  gaps_remaining: []
  regressions: []
---

# Phase 4: Analytics, Polish & Launch Verification Report

**Phase Goal:** "Phase 4 wires Umami, security/cache headers, runs Lighthouse + OG validation, performs the DNS cutover (apex + `www` 301), and walks the 'Looks Done But Isn't' checklist."

**Verified:** 2026-05-15T20:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

Studio Bluemli v1 is live at `https://studiobluemli.com`. All 9 phase requirements (FND-03, LCH-01..LCH-08) verified end-to-end against both the codebase and the live production hostname. The cutover audit artifact (LAUNCH-REPORT.md) captures all 11 D-04 checklist items as ✓.

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Apex `https://studiobluemli.com` resolves over HTTPS with valid cert | ✓ VERIFIED | Live `curl -I` returns 200 OK with full security header set; cert via Google Trust Services CN=WE1, expires 2026-08-13 (LAUNCH-REPORT item 8) |
| 2 | `www.studiobluemli.com/*` returns 301 to apex with path AND query preservation | ✓ VERIFIED | Live verification by orchestrator using `--resolve` through CF IP; also live re-verified: `/gallery` → 301 Location: https://studiobluemli.com/gallery; `/say-hi?utm=x` → 301 with query preserved |
| 3 | Umami `<script async>` rendered in production HTML with `data-website-id` and `data-domains="studiobluemli.com"` | ✓ VERIFIED | Live `curl` of `/` shows `<script async src="https://cloud.umami.is/script.js" data-website-id="dda5c749-8ea9-45e4-8f71-67f468bf741d" data-domains="studiobluemli.com">` — apex-only, no preview pollution |
| 4 | Umami custom events fire in Realtime (6 events per D-01 expansion via PR #8) | ✓ VERIFIED | Founder click-walk confirmed all 6 events: gallery_card_click, inquire_ig_per_piece, say_hi_ig_dm, say_hi_mailto, footer_ig_click, popups_empty_ig_click (orchestrator + LAUNCH-REPORT item 5) |
| 5 | Security headers ship via `_headers` (HSTS-2y+preload, CSP with Umami allowlist, Permissions-Policy lockdown, Referrer-Policy, X-CTO, frame-ancestors none) | ✓ VERIFIED | Live `curl -I` shows all 6 security headers present including `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` and full CSP with `https://*.umami.is https://*.umami.dev` wildcards |
| 6 | Lighthouse mobile ≥ 90 on all 24 cells (6 routes × 4 categories) | ✓ VERIFIED | LAUNCH-REPORT Lighthouse table: min 92 (Best Practices, every route), max 100 (SEO, every route); strict B-4 gate held cleanly, Task 5 was a no-op |
| 7 | OG previews validated (FB Sharing Debugger 3/3 + real iMessage/IG-DM unfurl 2/2 per LCH-06 pivot) | ✓ VERIFIED | All 5 LCH-06 sub-items ✓ in LAUNCH-REPORT (founder phone confirmed after PR #9 full-palette `og-default.png` regen + FB "Scrape Again") |
| 8 | "Looks Done But Isn't" launch checklist walked top-to-bottom (all 11 D-04 items) | ✓ VERIFIED | LAUNCH-REPORT.md table shows 11/11 items ✓; founder phone checks 3/3 YES; Fix Loop documents only client-cache-stale + Cache-Control duplicate-header (both cosmetic, latter logged for v1.x) |
| 9 | LAUNCH COMPLETE — production live, audit artifact committed | ✓ VERIFIED | LAUNCH-REPORT.md `## Status` section ends with "LAUNCH COMPLETE — 2026-05-15"; commit af29570 in git log; ROADMAP Phase 4 marked complete |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/layouts/BaseLayout.astro` | env-aware Umami `<script async>` snippet | ✓ VERIFIED | Line 7 imports `isProduction`; line 15 reads `PUBLIC_UMAMI_WEBSITE_ID`; lines 68-73 emit `<script async src="cloud.umami.is/script.js" data-website-id={UMAMI_ID} data-domains={dataDomains}>` conditionally. No `client:` directive. |
| `src/components/design-skill/GalleryGrid.jsx` | `data-umami-event="gallery_card_click"` | ✓ VERIFIED | Line 45: `<a ... className="card" data-umami-event="gallery_card_click" ...>` |
| `src/pages/gallery/[slug].astro` | `data-umami-event="inquire_ig_per_piece"` + `data-umami-event-piece={slug}` | ✓ VERIFIED | Lines 94-95: both attributes present on the IG CTA |
| `src/pages/say-hi.astro` | `data-umami-event="say_hi_ig_dm"` and `data-umami-event="say_hi_mailto"` | ✓ VERIFIED | Line 28 (IG DM); line 32 (mailto) |
| `src/components/design-skill/Footer.jsx` | `data-umami-event="footer_ig_click"` (PR #8 scope expansion) | ✓ VERIFIED | Line 23: footer IG link tagged |
| `src/pages/popups.astro` | `data-umami-event="popups_empty_ig_click"` (PR #8 scope expansion) | ✓ VERIFIED | Line 89: empty-state IG link tagged |
| `public/_headers` | HSTS + CSP + Permissions-Policy + Cache-Control tiers | ✓ VERIFIED | 46 lines; all 6 security headers + 3 Cache-Control tiers in correct order (most-specific first); CSP allows `cloud.umami.is` (script-src) + `*.umami.is`/`*.umami.dev` (connect-src) |
| `SETUP-DNS.md` | 5-step founder-facing DNS cutover walkthrough | ✓ VERIFIED | 125 lines; 5 numbered `## Step` headings; `PUBLIC_UMAMI_WEBSITE_ID` documented as Plaintext (not Secret); `hstspreload` deferred; 3 doc bugs corrected in PR #7 during cutover walk |
| `CONTENT_EDITING.md` | cross-reference to SETUP-DNS.md via `## Operations` section | ✓ VERIFIED | Line 195: `## Operations` heading; line 198 links to `[SETUP-DNS.md](SETUP-DNS.md)` |
| `scripts/check-og-images.sh` | executable, `set -uo pipefail`, hard-coded apex, LCH-06 pivot documented | ✓ VERIFIED | Executable mode 755; line 16 has `set -uo pipefail`; line 18 `SITE="https://studiobluemli.com"`; header comment cites Facebook Sharing Debugger + iMessage/IG-DM |
| `scripts/lighthouse-production.sh` | executable, mobile form-factor + simulated throttling | ✓ VERIFIED | Executable mode 755; lines 39-41: `--form-factor=mobile --throttling-method=simulate --only-categories=performance,accessibility,best-practices,seo` |
| `package.json` | `ci:og-check` and `ci:lighthouse-prod` npm scripts | ✓ VERIFIED | Lines 17, 19 in `scripts` block |
| `public/og-default.png` | 1200×630 full-palette brand mark (PR #9 regeneration) | ✓ VERIFIED | `file` reports `1200 x 630, 8-bit/color RGBA`; md5 = `69ef1e8dc0ed29ed44cc1b2b93684117` matches orchestrator-recorded live production hash |
| `astro.config.mjs` site=apex (D-07) | `site: 'https://studiobluemli.com'` | ✓ VERIFIED | Line 8 |
| `.planning/phases/04-analytics-polish-launch/LAUNCH-REPORT.md` | Cutover audit artifact, 11-item checklist + Lighthouse table + OG audit + Fix Loop + Status | ✓ VERIFIED | 192 lines; all 11 D-04 rows ✓; 6-row Lighthouse table populated 24/24 ≥ 90; OG-Image Audit (11 OK lines); 5 LCH-06 OG visual checks ✓; 3 phone checks ✓; ends with `LAUNCH COMPLETE — 2026-05-15` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `src/layouts/BaseLayout.astro` | `src/lib/site-url.ts` | `import { isProduction } from '../lib/site-url'` | ✓ WIRED | Line 7 import; line 17 invocation; `isProduction` export confirmed at site-url.ts:98 |
| `src/layouts/BaseLayout.astro` | `https://cloud.umami.is/script.js` | `<script async src=...>` | ✓ WIRED | Line 70; renders into live production HTML (verified live) |
| `public/_headers` | Cloudflare Workers Static Assets pipeline | Astro `public/` passthrough → `dist/client/_headers` | ✓ WIRED | Live HTTP response on `curl -I https://studiobluemli.com/` shows all `_headers`-declared headers applied |
| `public/_headers` CSP | Umami snippet + event POSTs | `script-src 'self' https://cloud.umami.is; connect-src 'self' https://cloud.umami.is https://*.umami.is https://*.umami.dev` | ✓ WIRED | Live response header (line 46 of `_headers`) reaches edge; all 6 Umami events arrive in Realtime within 5 min — no CSP block; widening to bare `https:` was NOT needed |
| Cloudflare Workers Builds env var `PUBLIC_UMAMI_WEBSITE_ID` | BaseLayout Umami snippet | Vite `import.meta.env.PUBLIC_UMAMI_WEBSITE_ID` at build time | ✓ WIRED | Live rendered HTML shows `data-website-id="dda5c749-8ea9-45e4-8f71-67f468bf741d"`; env var location bug in SETUP-DNS.md Step 3 caught + fixed in PR #7 |
| `https://www.studiobluemli.com/*` | `https://studiobluemli.com/*` | Cloudflare Redirect Rule (301) with path AND query preservation | ✓ WIRED | Live verification: `/gallery` 301 + path; `/say-hi?utm=x` 301 + path + query; `${2}` capture-group bug caught + fixed in PR #7 |
| `data-umami-event` clicks | Umami Cloud Realtime | POST to `*.umami.is` / `*.umami.dev` (CSP allowlisted) | ✓ WIRED | Founder click-walk confirmed all 6 events arrive in Realtime within 5 min |
| Apex host | Cloudflare Worker `studio-bluemli` | Custom Domain attachment | ✓ WIRED | TLSv1.3 cert via Google Trust Services CN=WE1, expires 2026-08-13 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `BaseLayout.astro` Umami snippet | `UMAMI_ID` | `import.meta.env.PUBLIC_UMAMI_WEBSITE_ID` (CF Workers Builds env var, set as Plaintext) | Yes — live HTML shows the resolved UUID | ✓ FLOWING |
| `BaseLayout.astro` Umami snippet | `dataDomains` | `isProduction()` ? apex : apex + previewHostname | Yes — production renders `data-domains="studiobluemli.com"` (apex-only) | ✓ FLOWING |
| Umami events | `data-umami-event` attribute on each tagged anchor | Static HTML attribute (no JS state) | Yes — Umami tracker reads and POSTs on click | ✓ FLOWING |
| LAUNCH-REPORT.md Lighthouse table | per-route category scores | `.lighthouse/2026-05-15/*.report.json` produced by `lighthouse-production.sh` | Yes — 24 numeric cells all ≥ 90 | ✓ FLOWING |
| LAUNCH-REPORT.md OG-Image Audit | 11 OK lines | `scripts/check-og-images.sh` stdout against production sitemap | Yes — pasted verbatim, "All og:image URLs return 200." | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Apex returns 200 OK with full security header set | `curl -sI https://studiobluemli.com/` | HTTP 200; HSTS + CSP + Permissions-Policy + Referrer-Policy + X-CTO all present | ✓ PASS |
| Umami snippet rendered in production HTML | `curl -s https://studiobluemli.com/ \| grep umami` | `<script async src="https://cloud.umami.is/script.js" data-website-id="dda5c749-..." data-domains="studiobluemli.com">` | ✓ PASS |
| www→apex 301 preserves path | `curl -sI https://www.studiobluemli.com/gallery` | `HTTP/1.1 301`; `Location: https://studiobluemli.com/gallery` | ✓ PASS |
| www→apex 301 preserves query | `curl -sI 'https://www.studiobluemli.com/say-hi?utm=x'` | `Location: https://studiobluemli.com/say-hi?utm=x` | ✓ PASS |
| og-default.png returns 200 | `curl -sI https://studiobluemli.com/og-default.png` | HTTP/1.1 200 OK; Content-Type: image/png | ✓ PASS |
| og-default.png matches expected md5 | `md5 public/og-default.png` | `69ef1e8dc0ed29ed44cc1b2b93684117` — matches orchestrator-recorded live hash | ✓ PASS |
| 6 data-umami-event attributes in source | `grep -r 'data-umami-event' src/` | 7 matches across GalleryGrid.jsx, Footer.jsx, say-hi.astro (×2), popups.astro, [slug].astro (×2 incl. `-piece`) | ✓ PASS |
| public/_headers has HSTS 2y + preload | `grep 'Strict-Transport-Security' public/_headers` | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` | ✓ PASS |
| public/_headers CSP allows Umami origin family | `grep 'connect-src' public/_headers` | `connect-src 'self' https://cloud.umami.is https://*.umami.is https://*.umami.dev` | ✓ PASS |
| npm aliases wired | `grep -E '"ci:og-check"\|"ci:lighthouse-prod"' package.json` | Both keys present (lines 17, 19) | ✓ PASS |
| astro.config.mjs site=apex (D-07) | `grep '^[[:space:]]*site:' astro.config.mjs` | `site: 'https://studiobluemli.com',` (line 8) | ✓ PASS |
| SETUP-DNS.md exists with 5 steps | `grep -c '^## Step' SETUP-DNS.md` | 5 | ✓ PASS |
| LAUNCH-REPORT.md ends with LAUNCH COMPLETE | `grep 'LAUNCH COMPLETE' LAUNCH-REPORT.md` | `**LAUNCH COMPLETE — 2026-05-15.**` (line 183) | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| FND-03 | 04-03, 04-05 | Production resolves at apex; www 301-redirects to apex via Cloudflare Redirect Rules | ✓ SATISFIED | Live: apex 200 + valid HTTPS cert (TLSv1.3 GTS-WE1); www→apex 301 with path AND query preservation (verified `/gallery` and `/say-hi?utm=x`). SETUP-DNS.md walked by founder (with PR #7 mid-walk corrections). |
| LCH-01 | 04-01 | Umami `<script>` loaded once in BaseLayout with `data-website-id` + `data-domains="studiobluemli.com"` | ✓ SATISFIED | BaseLayout.astro lines 7, 15, 17, 68-73 ship the env-aware snippet; live HTML shows `data-domains="studiobluemli.com"` (apex-only, no preview pollution). |
| LCH-02 | 04-01, 04-05 | Site registered in Umami Cloud's website list; domain configured to match `data-domains` | ✓ SATISFIED | Umami Realtime confirmed 6 custom events on apex (founder click-walk, 2026-05-15); founder removed `*.workers.dev` preview entry post-cutover per D-02. |
| LCH-03 | 04-01 | Key user interactions emit Umami custom events via `data-umami-event` attributes | ✓ SATISFIED (scope expanded via D-01 + PR #8) | 6 events live: `gallery_card_click`, `inquire_ig_per_piece` (+ per-piece slug metadata), `say_hi_ig_dm`, `say_hi_mailto`, `footer_ig_click`, `popups_empty_ig_click`. REQUIREMENTS.md row for LCH-03 still mentions "contact-form submit" — see Notable Observations below. |
| LCH-04 | 04-02 | `_headers` file sets security headers + long-cache for static assets | ✓ SATISFIED | `public/_headers` ships HSTS-2y+preload, CSP with Umami allowlist, X-CTO=nosniff, Referrer-Policy, Permissions-Policy lockdown, frame-ancestors none + tiered Cache-Control (immutable 1y / 7d static images / max-age=0 HTML). Live response headers verified. |
| LCH-05 | 04-04, 04-05 | Lighthouse mobile ≥ 90 across Performance/Accessibility/Best Practices/SEO on all pages | ✓ SATISFIED | All 24 cells ≥ 90 (min 92 Best Practices every route; max 100 SEO every route); reports persisted under `.lighthouse/2026-05-15/`. ROADMAP SC3 6-route count (5 templates + 1 representative gallery slug `/gallery/cluster-coral`) was the authoritative audit basis. |
| LCH-06 | 04-04, 04-05 | OG previews validated via FB Sharing Debugger + (pivoted from deprecated Twitter Card Validator) real iMessage/IG-DM unfurl | ✓ SATISFIED (acceptance pivoted) | 3 FB Sharing Debugger checks ✓ (home, /gallery/cluster-coral, /popups) after PR #9 + "Scrape Again"; 2 founder phone unfurl tests ✓. Twitter Card Validator deprecated 2022 per RESEARCH Pitfall 4 — pivot documented in scripts/check-og-images.sh header. See Notable Observations. |
| LCH-07 | 04-03, 04-05 | DNS cutover: apex + www both resolve correctly with 301 + HTTPS cert valid | ✓ SATISFIED | Valid TLSv1.3 cert via Cloudflare/GTS-WE1 expires 2026-08-13; www→apex 301 with path AND query preservation; founder added an extra HTTP→HTTPS rule (verified live by orchestrator). |
| LCH-08 | 04-04, 04-05 | "Looks Done But Isn't" launch checklist walked top-to-bottom | ✓ SATISFIED (D-04 11-item revised scope) | LAUNCH-REPORT.md 11/11 ✓; founder phone checks 3/3 YES; Fix Loop documents two non-blocking findings (stale 301 in founder browser cache, Cache-Control duplicate header). The original LCH-08 reference to "contact form sends" is obsolete (form was dropped in Phase 3 D-18); D-04 replaced it with the 11-item device-aware checklist. |

**Result:** All 9 phase requirement IDs SATISFIED.

### Anti-Patterns Found

The Phase 4 code review (04-REVIEW.md) found 0 critical / 5 warning / 7 info. None block the goal. Summary:

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `scripts/lighthouse-production.sh` | 22 | Hardcoded `/gallery/cluster-coral` slug — could 404 if piece is ever renamed | Info (WR-01) | Future maintenance risk; not a v1 blocker. |
| `scripts/check-og-images.sh` | 43 | `curl -fS` conflates page-fetch failure with og:image-missing | Info (WR-02) | Diagnostic clarity only; failures still get reported. |
| `scripts/check-og-images.sh` | 20 | Hardcoded `sitemap-0.xml` — won't traverse `sitemap-index.xml` chunks | Info (WR-03) | Site has 11 URLs (well below split threshold); safe for v1. |
| `public/_headers` | 42 | HSTS `preload` directive ships on day one while SETUP-DNS.md says preload submission is "intentionally skipped" | Warning (WR-04) | Internal inconsistency in framing only — header directive is independent of registry submission. No security regression. |
| `src/layouts/BaseLayout.astro` | 29 | `try/catch` silently swallows malformed `CF_WORKERS_URL` | Warning (WR-05) | Preview-deploy gap risk for future operators; doesn't affect production (where `isProduction()` is true). |
| `src/components/design-skill/Footer.jsx` | 10, 23 | Dead `borderTop: 'none'`; missing explicit `noopener` | Info (IN-01, IN-03) | Cosmetic. |
| `src/pages/popups.astro` | 69-76 | Hardcoded "San Francisco" city fallback | Info (IN-04) | Bounded to a future expansion case; founder is in NoPa. |
| `scripts/lighthouse-production.sh` | 35 | Awkward `rootgallery_cluster-coral` filename | Info (IN-05) | Cosmetic. |
| `scripts/check-og-images.sh` | 30 | `wc -l` URL-count fragile pattern | Info (IN-06) | Display only. |
| `SETUP-DNS.md` | 83-84 | Plaintext-not-Secret rationale terse | Info (IN-07) | Polish only. |
| Cache-Control on static assets (production response) | n/a | Duplicate directives: `public, max-age=0, must-revalidate, public, max-age=604800` | Info | Cosmetic per RFC 9111 §5.2 (more-permissive max-age wins); logged in LAUNCH-REPORT Fix Loop + deferred-items.md for v1.x cleanup. No bug-class impact; no Lighthouse Best Practices regression (all routes scored 92). |

### Human Verification Required

None. The founder has already walked all human-in-the-loop verification during Plan 04-05:

- **Founder phone check #1 (IG DM tap):** ✓ Confirmed 2026-05-15
- **Founder phone check #2 (mailto tap):** ✓ Confirmed 2026-05-15
- **Founder phone check #3 (cellular load feels fast):** ✓ Confirmed 2026-05-15
- **LCH-06 iMessage/IG-DM unfurl checks (2 URLs):** ✓ Confirmed 2026-05-15
- **DevTools console walk (6 pages):** ✓ Confirmed 2026-05-15 — no red errors
- **Umami Realtime click-walk (6 events):** ✓ Confirmed 2026-05-15

The cutover is complete and live; no further human gating is required for Phase 4 closure.

### Notable Observations

**1. REQUIREMENTS.md doc-drift on LCH-03 (informational; do not fail).**
REQUIREMENTS.md line 57 still reads "Key user interactions emit Umami custom events via `data-umami-event` attributes: gallery card click, 'inquire on Instagram' click, contact-form submit." The contact-form leg is obsolete (contact form cut in Phase 3 D-18; Phase 4 D-01 redefined the events for the no-form site, and PR #8 expanded that to 6 events). The traceability table line 140 also says "custom events fire for gallery card click, IG inquire click, contact-form submit." Phase 4 satisfied LCH-03 by the D-01 + PR #8 scope (the 6 events live on production). **Recommend a REQUIREMENTS.md edit in a v1.x doc-sync pass** to replace the "contact-form submit" event with the actual 6-event list and reference D-01/PR-#8. Not a verification failure — the underlying intent (analytics on key user interactions) is satisfied.

**2. REQUIREMENTS.md LCH-06 references deprecated Twitter Card Validator (informational; do not fail).**
REQUIREMENTS.md line 60 says LCH-06 is satisfied via "Facebook Sharing Debugger and Twitter Card validator." Twitter deprecated the Card Validator in 2022 (per RESEARCH.md Pitfall 4) — there is no first-party replacement. Plan 04-04 explicitly pivoted the acceptance to "Facebook Sharing Debugger + real iMessage/IG-DM unfurl on the founder's phone." All 5 pivoted sub-items ✓ in LAUNCH-REPORT. **Recommend a REQUIREMENTS.md edit in a v1.x doc-sync pass** to reflect the pivot. Not a verification failure.

**3. Pre-existing `check-no-hydration.sh` failure (deferred, per Plan 04-01 deferred-items.md).**
`bash scripts/check-no-hydration.sh` exits 1, flagging `dist/client/_astro/client.DIYMaoE_.js` (~194 KB) as evidence of an accidental React-runtime ship. Plan 04-01's executor verified by stash-test that the failure pre-existed Phase 4 (the bundle is emitted regardless of any 04-01 edit; no `client:` directives in `src/`). Documented in `.planning/phases/04-analytics-polish-launch/deferred-items.md` and re-acknowledged in LAUNCH-REPORT.md Pre-flight. **Recommended follow-up:** a triage plan to diagnose why `_astro/client.*.js` is being emitted at all (likely an `@astrojs/react` SSR scaffolding artifact). Not a Phase 4 goal regression — predates Phase 4 work.

**4. Cache-Control duplicate-header on static assets (v1.x follow-up).**
Live `curl -sI https://studiobluemli.com/og-default.png` returns `Cache-Control: public, max-age=0, must-revalidate, public, max-age=604800` (Astro/Workers framework default concatenated with `public/_headers` rule). Per RFC 9111 §5.2, browsers and CDNs honor the more permissive `max-age=604800` — behavior is correct; cosmetic only. Logged in LAUNCH-REPORT.md Fix Loop + deferred-items.md as a v1.x follow-up. **Lighthouse Best Practices** still scored 92 on every route — no audit regression.

**5. Scope expansion from 4 to 6 Umami events (PR #8) — captured in plan SUMMARYs.**
The original D-01 specified 4 events; the founder added 2 (`footer_ig_click`, `popups_empty_ig_click`) during the live cutover walk. Both are wired in source, fire live, and are recorded in CONTENT_EDITING.md's analytics-events section. LCH-03 is therefore over-satisfied, not under-satisfied.

**6. SETUP-DNS.md had 3 doc bugs caught at first founder use (PR #7).**
Three Cloudflare-dashboard navigation errors only surfaced when the founder walked SETUP-DNS.md in the live dashboard: Step 1 stale dashboard path, Step 2 wildcard capture `${1}` → `${2}` (with missing proxied www CNAME), Step 3 env-var was under "Build → Build variables and secrets" not "Variables and Secrets." All three fixed mid-cutover in PR #7. The `checkpoint:human-action` plan structure exactly caught what could only surface at real first use. Documented in Plan 04-05 SUMMARY's Deviations.

### Gaps Summary

**No gaps.** All 9 must-have truths verified against both the codebase and the live production hostname. The phase goal — "wire Umami, security/cache headers, run Lighthouse + OG validation, perform the DNS cutover, walk the 'Looks Done But Isn't' checklist" — is fully achieved.

The 4 informational items above (REQUIREMENTS.md doc-drift on LCH-03 + LCH-06, pre-existing `check-no-hydration.sh` failure, Cache-Control duplicate header) are all explicitly logged as v1.x follow-ups / pre-existing conditions and do not affect Phase 4 goal achievement. The code review's 5 warnings + 7 info items are also non-blocking.

---

*Verified: 2026-05-15T20:30:00Z*
*Verifier: Claude (gsd-verifier)*
