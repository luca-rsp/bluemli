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
| 1 | sitemap-index.xml reachable + references all 5 routes + every /gallery/<slug> |   |   |
| 2 | robots.txt reachable with Allow + Sitemap reference |   |   |
| 3 | Every og:image URL returns 200 |   |   |
| 4 | No console errors on each of 6 pages (DevTools walk) |   |   |
| 5 | All 4 Umami custom events appear in Realtime within 5 min |   |   |
| 6 | Lighthouse mobile >= 90 across Perf/A11y/BP/SEO on all 6 routes |   |   |
| 7 | www->apex 301 returns 301 with correct Location |   |   |
| 8 | Apex HTTPS cert chain is valid |   |   |
| 9 | Founder phone: tap IG DM on /say-hi -> Instagram opens |   |   |
| 10 | Founder phone: tap mailto on /say-hi -> email client opens |   |   |
| 11 | Founder phone: studiobluemli.com over cellular feels fast (< ~2s) |   |   |

***

## Lighthouse Scores

(Populated after Task 4 — Lighthouse production audit. The "6 routes" = 5 page templates + 1 representative gallery slug, per ROADMAP SC3.)

| Route                  | Performance | Accessibility | Best Practices | SEO |
|------------------------|------------:|--------------:|---------------:|----:|
| /                      |             |               |                |     |
| /gallery               |             |               |                |     |
| /gallery/<sample-slug> |             |               |                |     |
| /popups                |             |               |                |     |
| /about                 |             |               |                |     |
| /say-hi                |             |               |                |     |

***

## OG-Image Audit

(Populated after Task 3a — `scripts/check-og-images.sh` output below.)

```
<output>
```

***

## OG Visual Validation (LCH-06)

- [ ] Facebook Sharing Debugger green for home (`https://studiobluemli.com/`)
- [ ] Facebook Sharing Debugger green for a representative gallery piece
- [ ] Facebook Sharing Debugger green for the popups page
- [ ] Founder phone: share the home URL in iMessage / IG DM — real unfurl renders correctly
- [ ] Founder phone: share a gallery piece URL in iMessage / IG DM — real unfurl renders correctly

(Twitter Card Validator deprecated 2022 per RESEARCH.md Pitfall 4 — replaced by Facebook Sharing Debugger + real-platform unfurl tests above.)

***

## Founder Phone Checks (D-05)

- [ ] #1 IG DM open
- [ ] #2 mailto open with correct address
- [ ] #3 cellular load feels fast

***

## Post-cutover House-keeping

- [ ] Umami Cloud → Settings → Websites — REMOVED the `*.workers.dev` preview entry; only `studiobluemli.com` remains.
- [ ] HSTS preload-list submission DEFERRED to v1.x (NOT submitted in Phase 4).
- [ ] `LAUNCH-REPORT.md` committed to the phase directory.

***

## Fix Loop

(Any in-the-moment fixes applied before re-running. Empty if nothing went sideways.)

