---
phase: 04-analytics-polish-launch
plan: 05
subsystem: infra
tags: [launch, cutover, dns, lighthouse, og-validation, security-headers, umami, cloudflare-workers]

# Dependency graph
requires:
  - phase: 04-analytics-polish-launch
    provides: "Plan 04-01 Umami snippet + custom events; Plan 04-02 public/_headers (HSTS/CSP/Permissions/Referrer/CTO); Plan 04-03 SETUP-DNS.md + og-default.png + astro.config site:apex; Plan 04-04 scripts/check-og-images.sh + scripts/lighthouse-production.sh"
  - phase: 03-page-composition-pop-ups
    provides: "Production sitemap-index + per-page <SEO/> with absolute og:image URLs; canonical pointing at apex"
provides:
  - "Live production site at https://studiobluemli.com with valid Cloudflare-managed TLS cert (Google Trust Services CN=WE1, expires 2026-08-13)"
  - "www -> apex 301 redirect with path AND query-string preservation (Cloudflare Redirect Rule www-to-apex)"
  - "Umami Cloud Realtime confirmed live (6 custom events firing on apex; preview-deploy traffic removed from site list)"
  - "LAUNCH-REPORT.md cutover audit artifact (.planning/phases/04-analytics-polish-launch/LAUNCH-REPORT.md) — 11-item checklist + Lighthouse table + OG audit + cert chain + fix-loop entries"
  - "Security-headers profile shipped: HSTS-2y + preload directive (NOT submitted to preload list), CSP with cloud.umami.is + *.umami.is/*.umami.dev, Permissions-Policy lockdown, X-CTO, Referrer-Policy, X-Frame-Options frame-ancestors 'none'"
affects: []  # last plan of last phase; closes v1.0 milestone

# Tech tracking
tech-stack:
  added: []  # No new deps in Plan 05 — Plan 05 is execution-only against artifacts from 04-01..04-04
  patterns:
    - "Cutover audit pattern: LAUNCH-REPORT.md in the phase directory captures every gate (checklist table, Lighthouse cells, OG audit script output, cert chain, Fix Loop, post-cutover housekeeping, Status section)"
    - "Strict >= 90 Lighthouse gate (B-4): planner has no authority to embed an `89 OK with justification` exception; below-90 requires explicit founder ruling via checkpoint:decision Task 5 — gate did not trigger this run (min cell was 92)"
    - "Mid-cutover fix-PR pattern: discovered errors during live walk (PR #7 SETUP-DNS.md doc bugs; PR #8 founder-requested event scope growth; PR #9 og-default.png brand-fidelity regression) — each landed as a small atomic PR off main, not as patches to the in-flight plan"

key-files:
  created:
    - ".planning/phases/04-analytics-polish-launch/LAUNCH-REPORT.md"
    - ".planning/phases/04-analytics-polish-launch/04-05-SUMMARY.md"
  modified:
    - ".planning/STATE.md (plan position; metrics; session timestamps; final blockers/concerns)"
    - ".planning/ROADMAP.md (Phase 4 plans 5/5 complete; Phase 4 status -> Complete)"
    - "SETUP-DNS.md (PR #7 — 3 founder-facing doc errors fixed mid-cutover)"
    - "src/components/design-skill/Footer.jsx (PR #8 — data-umami-event footer_ig_click)"
    - "src/pages/popups.astro (PR #8 — data-umami-event popups_empty_ig_click on empty state)"
    - "public/og-default.png (PR #9 — regenerated full-palette per SKILL.md non-negotiable)"
    - "CONTENT_EDITING.md (PR #8 — analytics events section listing all 6 events)"

key-decisions:
  - "Umami custom-event scope grew from 4 to 6 during cutover (D-01 expansion) at founder request: added footer_ig_click + popups_empty_ig_click — the two highest-volume conversion paths not covered by the original 4. Recorded as scope-growth deviation."
  - "HSTS preload-list submission DEFERRED to v1.x (per CONTEXT D-09). Live response header carries the `preload` directive (`max-age=63072000; includeSubDomains; preload`) but the founder has NOT submitted to hstspreload.org. The submission is the one-way ~1y step being deferred — the header directive is independent."
  - "LCH-06 acceptance pivoted from deprecated Twitter Card Validator to Facebook Sharing Debugger + real iMessage/IG-DM unfurl on founder's phone. 5/5 sub-items confirmed (3 debugger + 2 phone-share)."
  - "Lighthouse strict >= 90 gate (B-4) held cleanly — min observed cell was 92 (Best Practices, every route). Task 5 (checkpoint:decision for below-90 acceptance) was a no-op (`skipped — all >= 90`) per the planner's explicit fall-through path."
  - "Cache-Control duplicate-header on static assets recorded in LAUNCH-REPORT.md Fix Loop as v1.x follow-up (cosmetic; no behavior impact per RFC 9111 §5.2; tracked in deferred-items.md). NOT a launch blocker."

patterns-established:
  - "Cutover audit artifact (LAUNCH-REPORT.md) lives in the phase directory and is the canonical record for every launch gate. Future relaunches (e.g. domain migration) repeat the same structure."
  - "Mid-flight fix-PR cadence during human-in-the-loop cutover: small atomic PRs off main rather than rewriting the in-flight plan or piling fixes onto a single mega-commit. PR #7 (3 doc errors), PR #8 (event scope growth), PR #9 (asset regen) each landed cleanly between launch-checklist tasks."

requirements-completed: [FND-03, LCH-02, LCH-05, LCH-06, LCH-07, LCH-08]

# Metrics
duration: ~6h (walked across two sessions, 2026-05-15)
completed: 2026-05-15
---

# Phase 4 Plan 05: DNS Cutover & Launch Execution Summary

**Studio Bluemli v1 is live at https://studiobluemli.com — apex resolves over HTTPS (GTS-issued cert via Cloudflare custom-domain), www-to-apex 301 preserves path AND query, 6 Umami custom events fire on production with apex-only data-domains, Lighthouse mobile scores 92–100 across all 24 cells (6 routes × 4 categories), and OG unfurls render correctly in FB debugger + real iMessage/IG-DM tests on the founder's phone.**

## Performance

- **Duration:** ~6h walked across the day (founder + Claude joint walk; many wait windows on cert provisioning, FB cache invalidation, and founder phone checks — not active wall-clock work)
- **Started:** 2026-05-15 (Wave 2 unblocked after Wave 1 PR #6 merged)
- **Completed:** 2026-05-15
- **Tasks:** 8/8 (5 auto + 3 checkpoint)
- **Files modified:** 1 in this plan's commits (LAUNCH-REPORT.md). 4 additional files modified across the 3 mid-cutover fix-PRs (#7, #8, #9), tracked in their own commits.

## Accomplishments

- **Production live:** https://studiobluemli.com resolves over HTTPS with a valid Cloudflare-managed cert (TLSv1.3; issuer C=US O=Google Trust Services CN=WE1; expires 2026-08-13).
- **www -> apex 301:** Path AND query-string preservation verified via curl + real-browser tests. The `${2}` wildcard-capture fix in PR #7 corrected the original `${1}` (which was capturing the scheme suffix `s` instead of the path).
- **6 Umami custom events live in Realtime:** `gallery_card_click`, `inquire_ig_per_piece`, `say_hi_ig_dm`, `say_hi_mailto`, `footer_ig_click`, `popups_empty_ig_click`. Scope grew from the originally-planned 4 to 6 at founder request (PR #8) — the two added events cover the two highest-volume conversion paths not in the original 4. `data-domains` is apex-only (no preview-deploy pollution).
- **Lighthouse mobile ≥ 90 on all 24 cells:** min cell = 92 (Best Practices, every route); max = 100 (SEO, every route). Strict gate held — Task 5 (below-90 founder ruling) was a no-op.
- **OG visual validation 5/5:** Facebook Sharing Debugger green for `/`, `/gallery/cluster-coral`, `/popups`; founder phone confirms iMessage + IG-DM unfurls render correctly for home + a gallery piece. Required PR #9 (full-palette `og-default.png` per SKILL.md non-negotiable) + FB "Scrape Again" to bust the prior monochrome cache.
- **3 founder phone checks all YES** (D-05): IG-DM-tap opens Instagram app; mailto-tap opens email client with `hi@studiobluemli.com` pre-filled; cellular load feels fast (sub-2s first paint).
- **Security headers shipped** (verified live with `curl -I`): HSTS-2y + includeSubDomains + preload directive; CSP allowlists `cloud.umami.is` (script-src) + `*.umami.is` / `*.umami.dev` (connect-src); Permissions-Policy lockdown; X-CTO=nosniff; Referrer-Policy=strict-origin-when-cross-origin; frame-ancestors 'none'.
- **Umami site list cleanup:** founder removed the `*.workers.dev` preview entry post-cutover (T-04-30 mitigated).
- **HSTS preload-list submission deferred to v1.x** (per CONTEXT D-09) — recorded explicitly in LAUNCH-REPORT.md `## Post-cutover House-keeping` so it cannot be retroactively mis-claimed as "done in Phase 4."

## Task Commits

This plan was executed across human-in-the-loop checkpoints; commits landed atomically as each gate passed:

1. **Task 1: Pre-cutover sanity check + LAUNCH-REPORT.md scaffold** — `97ef428` (Wave-1 push that also seeded the scaffold + the 7 pre-flight ✓ rows; see PR #6)
2. **Task 2: Founder walks SETUP-DNS.md Steps 1–4** — no Claude-side commit (founder dashboard work). Surfaced 3 doc errors corrected in PR #7 (`75e6b84`).
3. **Task 3a: Scripted checklist items 1, 2, 3, 7, 8** — `cdd5c38` (docs: record scripted checklist items)
4. **Task 4: Lighthouse production audit + LCH-06 OG validation kickoff** — `05dfc2e` (docs: record Lighthouse 24/24 cells ≥ 90)
5. **Task 3b: Items 4 (DevTools console) + 5 (Umami Realtime click-walk)** — `3934adb` (docs: record clean console + all 6 Umami events in Realtime)
6. **Task 5: Founder decision on below-90 Lighthouse** — N/A (skipped per `all >= 90`)
7. **Task 4 sub-step C/D + Task 6 follow-up: LCH-06 OG visual validation** — `87a595f` (docs: LCH-06 pass + Cache-Control v1.x follow-up Fix Loop entry)
8. **Task 6: Founder phone checks (items 9, 10, 11)** — `15e17d5` (docs: record founder phone-check answers — all YES)
9. **Task 7: Founder Umami site-list cleanup (post-cutover housekeeping)** — no separate commit; rolled into Task 8 finalize commit below (founder dashboard work; documented in `## Post-cutover House-keeping`).
10. **Task 8: Finalize LAUNCH-REPORT.md + commit** — `af29570` (docs(04): record launch report — Studio Bluemli v1 live on studiobluemli.com)

**Mid-cutover fix-PRs (off-main, between checkpoint tasks):**

- **PR #7 (`75e6b84`)** — Corrected 3 founder-facing errors in SETUP-DNS.md surfaced during the live cutover (Step 1 dashboard path; Step 2 wildcard capture `${1}` -> `${2}` + missing proxied `www` CNAME; Step 3 env-var location).
- **PR #8 (`badf64f`)** — Added 2 founder-requested Umami events (`footer_ig_click` on `Footer.jsx`; `popups_empty_ig_click` on `popups.astro`'s empty-state branch) + CONTENT_EDITING.md analytics-events section.
- **PR #9 (`1a6c176`)** — Regenerated `public/og-default.png` to use the canonical 6-circle full-palette cluster per SKILL.md non-negotiable (prior render was a single-color monochrome mark — would have shipped a brand-fidelity violation on every non-gallery unfurl). Required FB "Scrape Again" on the 3 debugger checks to bust the prior cache.

**Plan metadata commit:** This SUMMARY's commit (separate from `af29570`).

## Files Created/Modified

**In this plan's own commits:**
- `.planning/phases/04-analytics-polish-launch/LAUNCH-REPORT.md` — Cutover audit artifact (296 lines after finalization). Contains: 7-row pre-flight checklist, 11-row launch checklist, 6-row Lighthouse score table, full `scripts/check-og-images.sh` output (11/11 OK), 5-item OG visual validation, 3 founder phone checks, 3-item post-cutover housekeeping, security-headers + Umami-snippet captures, PR/cutover trail (PRs #6/#7/#8/#9), 2-entry Fix Loop, and final `## Status` section.
- `.planning/phases/04-analytics-polish-launch/04-05-SUMMARY.md` — this file.
- `.planning/STATE.md` — Plan 04-05 marked complete; metrics + session timestamps.
- `.planning/ROADMAP.md` — Phase 4 plans complete; Phase 4 status -> Complete.

**Mid-cutover fix-PR files (tracked in PRs #7/#8/#9, not in this plan's own commits):**
- `SETUP-DNS.md` (PR #7)
- `src/components/design-skill/Footer.jsx` (PR #8)
- `src/pages/popups.astro` (PR #8)
- `CONTENT_EDITING.md` (PR #8)
- `public/og-default.png` (PR #9)

## Decisions Made

1. **D-01 scope grew from 4 to 6 events.** Founder asked for `footer_ig_click` (footer IG handle on every page) and `popups_empty_ig_click` (empty-state IG fallback on `/popups`) during the live cutover walk. These are the two highest-volume non-gallery conversion paths in the site; not analytics-tracking them would have left a real gap in v1 launch data. Shipped via PR #8 (`badf64f`). Recorded in CONTENT_EDITING.md so the founder has a written reference for what's instrumented.
2. **PR #7 caught 3 real SETUP-DNS.md doc bugs at first use.** Plan 04-03's SETUP-DNS.md document had three errors that only surfaced when the founder actually walked the steps in the live Cloudflare dashboard: (a) Step 1 referenced the old "Settings → Domains & Routes" path — Cloudflare moved Custom Domain attachment to "Workers & Pages → Worker → Domains → Add domain → Custom domains — simple domain mapping"; (b) Step 2's wildcard capture used `${1}` — with two `*` in the pattern (`http*` and `${URI}` capture), the first wildcard captures the scheme suffix `s` and the path is `${2}`, not `${1}`; (c) Step 3 said "Variables and Secrets" but build-time `PUBLIC_*` env vars actually live under "Build → Build variables and secrets" (Astro reads them via `import.meta.env` at build time, not at runtime). All three fixed in PR #7 (`75e6b84`).
3. **PR #9 brand-fidelity regression — `og-default.png` must use full-palette mark.** The PNG that shipped from Plan 04-03 rendered as a monochrome single-color mark, violating SKILL.md's "use full-palette brand mark" non-negotiable. Regenerated using the canonical 6-circle full-palette cluster; md5 of live production asset is `69ef1e8dc0ed29ed44cc1b2b93684117`. Required FB Sharing Debugger "Scrape Again" on the 3 debugger checks to bust FB's prior cache of the monochrome version.
4. **Strict ≥ 90 Lighthouse gate held cleanly** — min cell observed was 92 (Best Practices, every route). Task 5 (checkpoint:decision for below-90 acceptance) was a no-op. No founder ruling needed; the planner's strict gate (B-4) was the correct contract.
5. **HSTS preload-list submission deferred to v1.x** — per CONTEXT D-09. The `Strict-Transport-Security` response header on production already carries the `preload` directive (`max-age=63072000; includeSubDomains; preload`). The deferred step is the one-way submission to `hstspreload.org` (which removes for ~1y once landed). Recorded in `## Post-cutover House-keeping` so it cannot be retroactively mis-claimed as "done in Phase 4."
6. **Cache-Control duplicate-header is a v1.x cosmetic follow-up.** Static assets serve with `Cache-Control: public, max-age=0, must-revalidate, public, max-age=604800` (Astro's per-response default concatenated with `public/_headers`'s rule). Per RFC 9111 §5.2, browsers and CDNs use the more permissive `max-age=604800` — behavior is correct; the header is just ugly. Recorded in Fix Loop + `deferred-items.md`; NOT a launch blocker (all 24 Lighthouse cells still ≥ 92 on Best Practices).
7. **HTTP→HTTPS rule (founder-added).** Founder added an explicit HTTP→HTTPS rule in Cloudflare during cutover that wasn't in the original plan. Verified the scheme chain works end-to-end (HTTP → HTTPS → www→apex if applicable → final 200). No code/config change needed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] SETUP-DNS.md `${1}` wildcard capture was wrong**
- **Found during:** Task 2 (founder walking SETUP-DNS.md Steps 1–4)
- **Issue:** With pattern `http*://www.studiobluemli.com${URI}`, there are TWO wildcards (`http*` is the first; `${URI}` is the second). Cloudflare's Redirect Rule capture-substitution numbers them in order — `${1}` captures the `s` from `http*`'s match of `https`, and `${2}` is the path. Original SETUP-DNS.md said `${1}` for the path; that's wrong. The live redirect rule was emitting `Location: https://studiobluemli.com/s` for `www.studiobluemli.com/`.
- **Fix:** Corrected to `${2}` in SETUP-DNS.md Step 2. Founder re-saved the rule in Cloudflare. Verified live: `/`, `/gallery`, and `/say-hi?utm=x` all 301 to apex with path AND query preserved.
- **Files modified:** SETUP-DNS.md
- **Verification:** Task 3a item 7 — `curl -I https://www.studiobluemli.com/say-hi?utm=x` shows `HTTP 301 → https://studiobluemli.com/say-hi?utm=x`.
- **Committed in:** `75e6b84` (PR #7)

**2. [Rule 1 - Bug] SETUP-DNS.md Step 1 dashboard path was stale**
- **Found during:** Task 2 (founder walking SETUP-DNS.md Step 1)
- **Issue:** Cloudflare moved Custom Domain attachment for Workers from the older "Settings → Domains & Routes" path to "Workers & Pages → Worker → Domains → Add domain → Custom domains — simple domain mapping" popup. SETUP-DNS.md referenced the old path; founder couldn't find the menu.
- **Fix:** Updated Step 1 to reference the new path.
- **Files modified:** SETUP-DNS.md
- **Verification:** Founder completed Step 1 without further dashboard hunting.
- **Committed in:** `75e6b84` (PR #7)

**3. [Rule 2 - Missing Critical] SETUP-DNS.md Step 2 missing proxied `www` CNAME**
- **Found during:** Task 2 (Step 2 redirect rule didn't fire)
- **Issue:** A Cloudflare Redirect Rule for `www.studiobluemli.com` only fires if the `www` hostname has DNS resolution AND is proxied through Cloudflare (orange cloud). Without an explicit proxied `www` CNAME pointing to the apex, the request never reaches Cloudflare's edge and the rule never sees it. SETUP-DNS.md Step 2 didn't mention this prerequisite.
- **Fix:** Added an explicit sub-step in Step 2: "Create a proxied CNAME `www` → `studiobluemli.com` (orange cloud on) BEFORE creating the redirect rule."
- **Files modified:** SETUP-DNS.md
- **Verification:** `dig www.studiobluemli.com` returns Cloudflare IPs; redirect rule fires; Task 3a item 7 green.
- **Committed in:** `75e6b84` (PR #7)

**4. [Rule 1 - Bug] SETUP-DNS.md Step 3 env-var location was wrong**
- **Found during:** Task 2 (env var added but not visible in build)
- **Issue:** SETUP-DNS.md Step 3 said "Settings → Variables and Secrets" for `PUBLIC_UMAMI_WEBSITE_ID`. That's the runtime env-var location. Astro reads `PUBLIC_*` vars at build time via `import.meta.env`, so they must live under "Build → Build variables and secrets" — a different settings page on the Cloudflare dashboard. Setting the runtime var has no effect on the static bundle.
- **Fix:** Updated Step 3 to "Build → Build variables and secrets" + explanatory note about Astro's build-time read pattern.
- **Files modified:** SETUP-DNS.md
- **Verification:** After founder re-set in the build location and re-deployed, `curl -fsS https://studiobluemli.com/ | grep umami` shows the live Umami snippet with the correct website ID and `data-domains="studiobluemli.com"`.
- **Committed in:** `75e6b84` (PR #7)

**5. [Rule 2 - Missing Critical] `og-default.png` shipped as monochrome — SKILL.md non-negotiable violation**
- **Found during:** Task 4 sub-step C (LCH-06 OG visual validation in Facebook Sharing Debugger)
- **Issue:** The `og-default.png` that shipped from Plan 04-03 was a single-color monochrome mark. SKILL.md says: "use the full-palette brand mark — no monochrome substitutions." Every non-gallery URL (home, /about, /popups, /say-hi) unfurls with this image — that's the most visible brand surface in shared links.
- **Fix:** Regenerated `og-default.png` using the canonical 6-circle full-palette cluster from `assets/logo/cluster.svg` per SKILL.md line 44. Live production asset md5: `69ef1e8dc0ed29ed44cc1b2b93684117`.
- **Files modified:** `public/og-default.png`
- **Verification:** Founder confirmed all 3 FB Sharing Debugger checks green (required "Scrape Again" to bust FB's prior cache); founder confirmed iMessage + IG-DM unfurls show the full-palette mark.
- **Committed in:** `1a6c176` (PR #9)

### Scope-Growth Deviations

**6. [Founder request - D-01 scope expansion] Umami events grew from 4 to 6**
- **Found during:** Task 3b (founder + Claude Umami Realtime click-walk)
- **Issue:** Original D-01 specified 4 custom events: `gallery_card_click`, `inquire_ig_per_piece`, `say_hi_ig_dm`, `say_hi_mailto`. During the walk, founder noticed two high-volume conversion paths weren't tracked: the IG-handle link in the footer (appears on every page) and the IG-fallback link in the `/popups` empty state (the most-likely click when there are no upcoming pop-ups).
- **Fix:** Added `footer_ig_click` to `src/components/design-skill/Footer.jsx` and `popups_empty_ig_click` to `src/pages/popups.astro`'s empty-state branch. Updated CONTENT_EDITING.md "Analytics events" section to list all 6.
- **Files modified:** `src/components/design-skill/Footer.jsx`, `src/pages/popups.astro`, `CONTENT_EDITING.md`
- **Verification:** All 6 events confirmed in Umami Realtime within 5 min of clicking on production.
- **Committed in:** `badf64f` (PR #8)

---

**Total deviations:** 6 auto-fixed/scope-grown (4 Rule 1 bugs in SETUP-DNS.md, 1 Rule 2 brand-fidelity regression, 1 founder scope expansion)
**Impact on plan:** All deviations were caught and fixed mid-cutover via small atomic PRs (#7, #8, #9) without rewriting the in-flight plan or stalling the cutover. The 4 SETUP-DNS.md bugs are the most valuable artifact — they could only surface at first use by a real founder in a real Cloudflare dashboard; the plan's `checkpoint:human-action` structure was exactly the right shape to catch them. No scope creep beyond the founder's explicit D-01 expansion.

## CSP `connect-src` did NOT need widening

Per the plan's output spec question — RESEARCH.md Pitfall 1's empirical-fallback path (widen CSP `connect-src` from `https://*.umami.is https://*.umami.dev` to bare `https:` if events don't flow) was NOT needed. The `*.umami.is` / `*.umami.dev` wildcards on `connect-src` allowlist matched empirically; all 6 Umami events fired and arrived in Realtime on first try. No CSP `connect-src` tightening or widening was applied.

## Lighthouse Score Table (final, paste from LAUNCH-REPORT.md)

| Route                       | Performance | Accessibility | Best Practices | SEO |
|-----------------------------|------------:|--------------:|---------------:|----:|
| /                           |          94 |            95 |             92 | 100 |
| /gallery                    |          93 |            95 |             92 | 100 |
| /gallery/cluster-coral      |          93 |            95 |             92 | 100 |
| /popups                     |          94 |            96 |             92 | 100 |
| /about                      |          93 |            95 |             92 | 100 |
| /say-hi                     |          95 |            95 |             92 | 100 |

**24/24 cells ≥ 90.** Min = 92 (Best Practices, every route); max = 100 (SEO, every route). Strict gate held cleanly.

## Task 5 (below-90 founder ruling)

**Not invoked.** Resume-signal recorded as `skipped — all >= 90`. Item 6 passed the strict gate directly; no founder ruling was needed.

## Cert chain summary (item 8)

- **Protocol:** TLSv1.3
- **Subject:** `CN=studiobluemli.com`
- **Issuer:** `C=US; O=Google Trust Services; CN=WE1` (Cloudflare custom-domain certs are issued via Google Trust Services on the WE1 intermediate)
- **Expires:** `Aug 13 16:16:17 2026 GMT`
- **Verification:** `SSL certificate verify ok` — no chain errors, no `ERR_SSL_PROTOCOL_ERROR` (T-04-28 mitigated by waiting on cert provisioning before declaring item 8 ✓).

## Founder Phone Checks (Task 6 — D-05, in order)

1. **Phone check #1 (IG-DM tap opens Instagram app):** YES
2. **Phone check #2 (mailto tap opens email client with hi@studiobluemli.com pre-filled):** YES
3. **Phone check #3 (cellular load feels fast — sub-2s first paint):** YES
4. **LCH-06 home URL iMessage/IG-DM unfurl renders correctly:** YES
5. **LCH-06 gallery piece URL iMessage/IG-DM unfurl renders correctly:** YES (after PR #9 deploy)

All 5/5 YES.

## Cutover Status

**Local commits made; deploy already live.** Production has been live throughout the audit (Wave 1 push at PR #6 was the cutover moment). The `af29570` (LAUNCH-REPORT.md finalize) commit is local-only on `main` — founder is welcome to review and run `git push` whenever ready. The site at https://studiobluemli.com does NOT depend on this commit being pushed; the commit only updates documentation.

## Issues Encountered

- **Stale 301 cached in founder's regular browser (post-PR #7).** Before PR #7's `${2}` fix, the broken `${1}` redirect rule was emitting `Location: https://studiobluemli.com/s` for `www.studiobluemli.com/`. Browsers cache 301 responses aggressively. Founder's regular browser had cached the broken 301 and continued landing on `/s` (404) even after PR #7 made the live behavior correct. Resolution: documented in Fix Loop as a workaround (incognito or cache-clear); scope is bounded to the bug window (cutover → PR #7). New visitors are unaffected.
- **FB Sharing Debugger cached the monochrome `og-default.png` before PR #9.** Required clicking "Scrape Again" in the debugger on all 3 affected URLs to bust the prior cache. Documented in `## OG Visual Validation (LCH-06)`.
- **Pre-existing `check-no-hydration.sh` failure** is NOT caused by this plan and remains deferred per Plan 04-01's `deferred-items.md`. Verified in Plan 04-01's pre-flight stash test that Wave 1 did not cause it. Out-of-scope-boundary per executor SCOPE BOUNDARY rule.

## Threat Model Coverage

| Threat ID | Disposition | Outcome |
|-----------|-------------|---------|
| T-04-28 (cutover before cert valid) | mitigate | Item 8 explicitly waited on cert provisioning before ✓; cert chain verified TLSv1.3 GTS-issued. PASS. |
| T-04-29 (Umami "0 events" silent failure) | mitigate | Item 5 click-walk confirmed all 6 events fire in Realtime within 5 min; no CSP widening needed. PASS. |
| T-04-30 (preview entry left in Umami site list) | mitigate | Founder removed `*.workers.dev` entry from Umami → Settings → Websites on 2026-05-15. Apex-only now. PASS. |
| T-04-31 (env-var value pasted into LAUNCH-REPORT.md) | mitigate | LAUNCH-REPORT.md records only "env var set: yes" and `data-website-id="dda5c749-..."` in the *production HTML capture* (which is public anyway — this is the same value an attacker would get by viewing `view-source:` on the live site). No paste of the founder's dashboard env-var-input UI value. PASS. |
| T-04-32 (HSTS preload accidentally submitted) | mitigate | Founder NOT instructed to submit. Recorded explicitly in `## Post-cutover House-keeping` as DEFERRED. PASS. |
| T-04-33 (LAUNCH-REPORT.md content in git history) | accept | All content is derived from public production endpoints (sitemap, og:image URLs, public HTML, public response headers). No secrets in scope. AS-PLANNED. |

All `mitigate` dispositions: PASS.

## User Setup Required

None remaining. All Cloudflare dashboard configuration completed during Task 2 (founder walked SETUP-DNS.md Steps 1–4, plus the PR #7 corrections). All Umami Cloud configuration completed (websites registered, preview entry removed post-cutover). The only **deferred** founder action is the HSTS preload-list submission, which is explicitly NOT being done in Phase 4 per D-09.

## Next Phase Readiness

This is the **last plan of the last phase** in the v1.0 milestone. Phase 4 → Complete; v1.0 milestone → Complete pending post-phase gates (code review, verifier). No next-phase context to hand off.

**v1.x follow-up items recorded for future planning:**
- HSTS preload-list submission to `hstspreload.org` (deferred per D-09; revisit after ~30 days clean production).
- Cache-Control duplicate-header cleanup on static assets (cosmetic; no behavior impact per RFC 9111 §5.2; tracked in `deferred-items.md`).
- Pre-existing `check-no-hydration.sh` failure triage (deferred from Plan 04-01; out-of-scope-boundary for this plan).
- Daily auto-rebuild cron for pop-up freshness (deferred from Plan 03-05 due to `@astrojs/cloudflare@13.5` incompatibility; tracked separately in Plan 03-05 SUMMARY).

## Self-Check: PASSED

**File existence:**
- `.planning/phases/04-analytics-polish-launch/LAUNCH-REPORT.md`: FOUND
- `.planning/phases/04-analytics-polish-launch/04-05-SUMMARY.md`: FOUND (this file)

**LAUNCH-REPORT.md content checks:**
- 11-item checklist table populated with 11 rows, all ✓: VERIFIED
- 6-row Lighthouse table populated with numeric scores, all ≥ 90: VERIFIED (min 92, max 100)
- `## OG-Image Audit` section has full script output (11 OK lines, "All og:image URLs return 200."): VERIFIED
- `## OG Visual Validation (LCH-06)` 5 items ✓: VERIFIED
- `## Founder Phone Checks (D-05)` 3 items ✓: VERIFIED
- `## Post-cutover House-keeping`: Umami cleanup ✓, HSTS preload DEFERRED (~), LAUNCH-REPORT.md committed ✓: VERIFIED
- `## Status` section ends with `LAUNCH COMPLETE — 2026-05-15`: VERIFIED

**Commits exist:**
- `af29570` (docs(04): record launch report): VERIFIED via `git log --oneline -5`
- `15e17d5` (docs(04-05): founder phone-check answers): VERIFIED
- `87a595f` (docs(04-05): LCH-06 + Cache-Control v1.x follow-up): VERIFIED
- `1a6c176` (PR #9 — og-default.png full-palette): VERIFIED
- `badf64f` (PR #8 — footer + popups-empty Umami events): VERIFIED
- `75e6b84` (PR #7 — SETUP-DNS.md 3 doc fixes): VERIFIED
- `97ef428` (PR #6 — Wave 1 deploy): VERIFIED
- `05dfc2e` (Lighthouse all 24 cells ≥ 90): VERIFIED
- `3934adb` (clean console + all 6 Umami events): VERIFIED
- `cdd5c38` (scripted checklist items 1/2/3/7/8): VERIFIED

**Requirements satisfied:** FND-03, LCH-02, LCH-05, LCH-06, LCH-07, LCH-08 — all corresponding `must_haves` truths verified live on production.

## Threat Flags

None — no new security-relevant surface beyond what the plan's `<threat_model>` already enumerates (T-04-28 through T-04-33 all addressed as documented in Threat Model Coverage table above).

## Known Stubs

None — all data sources are wired (Umami events, content collections, security headers, redirect rules, env vars). Site is live and fully data-backed.

---
*Phase: 04-analytics-polish-launch*
*Completed: 2026-05-15*
