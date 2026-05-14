---
phase: 02-content-schema-gallery
verified: 2026-05-13T17:30:00Z
status: passed
score: 5/5 success criteria verified
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 4/5
  gaps_closed:
    - "Site config (CNT-06) drives header/footer copy on the rendered preview"
  gaps_remaining: []
  regressions: []
  closure_commit: 1fc7b04
human_verification:
  - test: "Open the built gallery index `/gallery` in a browser via `pnpm run preview` (or open `dist/client/gallery/index.html` directly) and confirm all 6 seeded pieces render with photo + name + price + 'Available' badge as visually polished cards, with no broken images or layout breakage on mobile (≤ 640px)."
    expected: "Six cards in a responsive grid, all photos load (cluster-{blush,cobalt,coral,lavender,saffron,sage}/hero-400.webp), each card shows a quiet 'Available' status indicator and is clickable to /gallery/<slug>."
    why_human: "Visual layout polish, image quality, and the 'editorial / brand-clean' feel can only be confirmed by human eye; greps and astro check cannot prove the visual SC1 result."
  - test: "Open `/gallery/cluster-blush` in a browser and confirm the IG CTA button (`Ask about this pair on Instagram`) is visible, prominent, and the inline `mailto:hi@studiobluemli.com` fallback is below it. Confirm the page is single-column and photo-forward at 640px max width."
    expected: "Hero photo (800w) at native aspect ratio, then name + price + status badge + description + CTA button + mailto fallback, all centered, 640px max width."
    why_human: "SC1's 'IG CTA' visibility, and the D-13 'mailto fallback never replaces the IG CTA' check, require human visual inspection."
  - test: "Run the SC2 contract: change `status` in any gallery index.md to `availabilty: sold` (deliberate typo), then run `pnpm exec astro check` and confirm the build fails with a clear Zod error naming `availabilty`. Restore the file."
    expected: "Build fails with `Unrecognized key 'availabilty'` (or similar). Note: this is already covered by `scripts/test-content-contracts.sh` which I ran successfully (it passed all SC2 + SC3 mutations)."
    why_human: "Already verified programmatically via contract test, but human confirmation of the error message clarity satisfies SC2."
  - test: "Run the SC3 contract: change `status: available` to `status: sold` in any gallery index.md, run `pnpm run prebuild:images && pnpm exec astro build`, and visually confirm the sold piece's grid card shows a quiet 'Sold' label in lavender and the detail page CTA text flips to 'This pair sold — DM me about something similar'."
    expected: "Grid card renders 'Sold' (not hidden); detail page CTA text reads 'This pair sold — DM me about something similar'. Already verified by `scripts/test-content-contracts.sh` SC3 mutation."
    why_human: "Visual badge appearance and CTA copy flip are best confirmed by human reading the rendered HTML; the automated test passed."
  - test: "Simulate the founder workflow: create a new branch on GitHub.com, drag a photo into `src/content/gallery/cluster-test/`, add an `index.md` with valid frontmatter, open a PR, and wait for the Cloudflare preview deploy to ship. Confirm the new piece appears at `/gallery/cluster-test`."
    expected: "PR preview shows the new piece on /gallery and /gallery/cluster-test within ~5 minutes."
    why_human: "The end-to-end SC1 workflow (founder + GitHub web UI + Cloudflare preview) requires a real PR and a real preview deploy — can only be confirmed by a human dry-run that the founder workflow promised by the phase goal actually works."
  - test: "CNT-06 trust check: change `ig_handle` in `src/content/site/config.yaml` from `studiobluemli` to `studiobluemli_test`, run `pnpm run build`, then grep `dist/client/index.html` for `instagram.com/studiobluemli_test`. Confirm the rendered footer href has updated. Restore the YAML."
    expected: "Footer href in every built page reflects the edited handle. This is the live demonstration that the founder can change the IG handle by editing one YAML field — closing the CNT-06 promise."
    why_human: "This is the founder-trust demonstration. Re-verification confirmed the code is wired, but the user should run the live edit at least once to feel the contract."
quality_concerns:  # Tracked from 02-REVIEW.md; not Phase 2 SC blockers, surfaced for triage
  - id: BL-01
    severity: blocker (review) / warning (verification)
    summary: "Dimensions manifest at public/gallery/_manifest.json leaks into deployed dist/client/gallery/_manifest.json — internal build telemetry on the public origin."
    status: open
    not_a_phase_blocker_because: "Not mapped to any Phase 2 SC; affects hygiene, not goal achievement."
  - id: WR-01
    severity: warning
    summary: "og:image base URL only strips trailing slash on the Astro.site branch; CF_PAGES_URL / CF_WORKERS_URL / PUBLIC_SITE_URL branches can emit `//` in unfurls."
    status: open
    not_a_phase_blocker_because: "Production Astro.site branch is verified-clean; defensive bug for env-var edge cases."
  - id: WR-02
    severity: warning
    summary: "GalleryGrid.jsx hardcodes width={400} height={500} while the manifest reports [400, 533] — small CLS bump per card."
    status: open
    not_a_phase_blocker_because: "aspect-ratio CSS papers over the visible difference; SC1 visual still verifies."
  - id: WR-03
    severity: warning
    summary: "Empty popups dir emits `[WARN] No files found matching '*.md'` on every build; trains contributors to ignore Astro warnings."
    status: open
    not_a_phase_blocker_because: "First popup ships Phase 3 (PAG-03); warning is informational, not a build failure."
  - id: IN-01
    severity: info
    summary: "All 6 seed pieces are status: available; the four non-default statuses (sold/one-of-one/reserved) are only exercised via the contract-test mutation, not the static seed corpus."
    status: open
    not_a_phase_blocker_because: "Contract test covers SC3 programmatically; visual confirmation of badge variants is on the human-verification checklist."
---

# Phase 2: Content Schema & Gallery — Verification Report (Re-verification)

**Phase Goal:** Founder can add a gallery piece via the GitHub web UI and see it on a preview deploy within ~5 minutes — including the gallery grid card, the per-piece detail page with availability badge, and the "Ask about this piece on Instagram" CTA.

**Verified:** 2026-05-13T17:30:00Z
**Status:** human_needed
**Re-verification:** Yes — re-verified after inline CNT-06 gap closure (commit `1fc7b04`)

## Re-verification Summary

The prior verification (2026-05-13T16:05:00Z) flagged one SC1 sub-failure: the `site` content collection (CNT-06) was defined and validated but never consumed — Footer.jsx hardcoded `studio_bluemli` (drifted handle) and `hi@studiobluemli.com`, while `gallery/[slug].astro` hardcoded `https://ig.me/m/studiobluemli` and the same email. The founder's promise that editing `src/content/site/config.yaml` would change the deployed site was silently broken.

The user chose an inline fix instead of a 02.1 gap-closure phase. Commit `1fc7b04` ("fix(02): wire getEntry('site') into Footer + detail page (CNT-06 gap closure)") shipped the wiring.

**Closure verified:**

| Check | Evidence |
|---|---|
| `Footer.jsx` accepts `igHandle` + `contactEmail` props instead of hardcoding | Lines 5, 23, 25 of Footer.jsx — props-based, no hardcoded strings. |
| All 6 pages that render Footer call `getEntry('site', 'default')` | Confirmed in `index.astro`, `gallery.astro`, `gallery/[slug].astro`, `popups.astro`, `about.astro`, `say-hi.astro`. |
| Detail page consumes `site.ig_dm_url` + `site.contact_email` | `gallery/[slug].astro` lines 92, 94 — both values flow from the YAML. |
| No remaining hardcoded `studio_bluemli` (underscore) anywhere in `src/` | `grep -rn` returns zero matches. |
| No remaining hardcoded `mailto:hi@` or `hi@studiobluemli.com` anywhere in `src/` | `grep -rn` returns one match — `config.yaml` itself (correct: the single source of truth). |
| Rendered HTML (`dist/client/`) shows canonical `studiobluemli` consistently | `grep -rn "studio_bluemli" dist/` returns zero matches; all 5 footer-bearing pages contain `instagram.com/studiobluemli`. |
| Rendered detail page shows all 3 site fields | `dist/client/gallery/cluster-blush/index.html` contains `instagram.com/studiobluemli` (footer), `ig.me/m/studiobluemli` (CTA href), and `mailto:hi@studiobluemli.com` (footer + mailto fallback). |
| `pnpm exec astro check` passes | `26 files: 0 errors, 0 warnings, 7 hints` — clean. |
| Build emits all 11 routes | 11 HTML files in `dist/client/` (index + about + say-hi + popups + gallery + 6 detail pages). |
| No regressions in previously-passing truths | SC2-SC5 still pass; contract test still passes; brand check still passes (per prior run). |

**Gaps closed:** 1 (CNT-06 site-config consumption).
**Gaps remaining:** 0.
**Regressions:** 0.

## Goal Achievement (Updated)

### Observable Truths (vs. ROADMAP Success Criteria)

| #   | Truth (Success Criterion)                                                                                                                                        | Status     | Evidence                                                                                                                                                                                                                                                                              |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | SC1: Founder can drag a photo into `src/content/gallery/<slug>/`, fill frontmatter, open PR, see piece on preview's `/gallery` index and `/gallery/<slug>` detail | VERIFIED   | All 6 seeded pieces present; build prerenders index + 6 detail pages; gallery index HTML contains 6 `<img>` cards; detail page renders hero + name + price + status + description + IG CTA + mailto fallback. **CNT-06 site-config consumption gap CLOSED:** site values now flow from `config.yaml` through every rendered page. End-to-end PR-preview demo still requires human dry-run (see human_verification #5). |
| 2   | SC2: Typo in frontmatter (`availabilty: sold`) fails the build with a clear Zod error                                                                            | VERIFIED   | `.strict()` on all 3 collections; `scripts/test-content-contracts.sh` SC2 mutation passes (no re-run needed — closure commit only edited pages, not schema).                                                                                                                            |
| 3   | SC3: A sold piece renders with quiet editorial 'Sold' badge in the gallery grid (not hidden), remains in portfolio archive                                       | VERIFIED   | Contract test SC3 mutation flipped `cluster-blush` to `status: sold`, rebuilt, asserted `Sold` label + D-11 CTA copy. CSS at `gallery.astro:50-53` sets per-status colors.                                                                                                              |
| 4   | SC4: Each `/gallery/<slug>` page emits `<meta property="og:image" content="<absolute URL>">` inside `<head>`                                                       | VERIFIED   | `dist/client/gallery/cluster-blush/index.html` `<head>` contains `<meta property="og:image" content="https://studiobluemli.com/gallery/cluster-blush/hero-800.webp">`. Closure commit did not regress the `<meta slot="head">` plumbing.                                                |
| 5   | SC5: `CONTENT_EDITING.md` exists at repo root, GitHub UI flow in prose, "never delete, flip availability" section, zero `git`/`npm`/`cd` words                  | VERIFIED   | Unchanged from prior verification: 170 lines; all greps pass.                                                                                                                                                                                                                          |

**Score:** 5/5 truths verified.

### Required Artifacts — Delta Since Prior Verification

Only artifacts touched by closure commit `1fc7b04` are re-checked. All other artifacts retain prior VERIFIED status.

| Artifact                                          | Expected                                                | Status      | Details                                                                                            |
| ------------------------------------------------- | ------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `src/components/design-skill/Footer.jsx`          | Accepts `igHandle` + `contactEmail` props (no hardcoded strings) | VERIFIED    | Signature: `function Footer({ igHandle, contactEmail })`. Lines 23, 25 use template literals. **No remaining hardcoded `studio_bluemli` or `hi@studiobluemli.com`.** |
| `src/pages/index.astro`                           | Reads `site` collection, passes to Footer                | VERIFIED    | Line 27 calls `getEntry('site', 'default')`; line 47 passes `igHandle` + `contactEmail` to Footer. |
| `src/pages/gallery.astro`                         | Reads `site` collection, passes to Footer                | VERIFIED    | Line 15 calls `getEntry`; line 43 passes props.                                                    |
| `src/pages/gallery/[slug].astro`                  | Reads `site` collection; CTA + mailto + Footer use site values | VERIFIED    | Line 34 reads site; line 92 (`href={site.ig_dm_url}`); line 94 (`mailto:${site.contact_email}`); line 103 passes props to Footer. **All three previously-hardcoded values now flow from YAML.** |
| `src/pages/popups.astro`                          | Reads `site` collection, passes to Footer                | VERIFIED    | Line 15 + 23.                                                                                       |
| `src/pages/about.astro`                           | Reads `site` collection, passes to Footer                | VERIFIED    | Line 16 + 21.                                                                                       |
| `src/pages/say-hi.astro`                          | Reads `site` collection, passes to Footer                | VERIFIED    | Line 17 + 22.                                                                                       |
| `dist/client/*.html`                              | Footer + detail page render canonical site values        | VERIFIED    | All 11 routes built; `instagram.com/studiobluemli` (no underscore) present in 5 footer-bearing index files; `cluster-blush` detail HTML contains IG CTA, mailto fallback, and footer IG link all reading the YAML's canonical values. |

### Key Link Verification — Delta Since Prior Verification

| From                                                    | To                                                       | Via                                                                    | Status        | Details                                                                                                                                                       |
| ------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/index.astro`                                 | `src/content.config.ts` site collection                  | `await getEntry('site', 'default')`                                    | **WIRED**     | Was NOT_WIRED — closure commit added the consumer. |
| `src/pages/gallery.astro`                               | `src/content.config.ts` site collection                  | `await getEntry('site', 'default')`                                    | **WIRED**     | Was NOT_WIRED — closure commit added the consumer. |
| `src/pages/gallery/[slug].astro`                        | `src/content.config.ts` site collection                  | `await getEntry('site', 'default')`                                    | **WIRED**     | Was NOT_WIRED — closure commit added the consumer. Critical: detail-page IG CTA (`href={site.ig_dm_url}`) and mailto (`href={\`mailto:${site.contact_email}\`}`) now read from collection. |
| `src/pages/popups.astro`                                | `src/content.config.ts` site collection                  | `await getEntry('site', 'default')`                                    | **WIRED**     | Closure commit. |
| `src/pages/about.astro`                                 | `src/content.config.ts` site collection                  | `await getEntry('site', 'default')`                                    | **WIRED**     | Closure commit. |
| `src/pages/say-hi.astro`                                | `src/content.config.ts` site collection                  | `await getEntry('site', 'default')`                                    | **WIRED**     | Closure commit. |
| `src/components/design-skill/Footer.jsx`                | site config values (ig_handle, contact_email)            | Props (`igHandle`, `contactEmail`) threaded from each Astro caller     | **WIRED**     | Was NOT_WIRED (hardcoded). Now consumes props. |
| `src/pages/gallery/[slug].astro` IG CTA                 | `site.data.ig_dm_url`                                    | `<a class="cta-button" href={site.ig_dm_url}>`                         | **WIRED**     | Was NOT_WIRED (hardcoded). |
| `src/pages/gallery/[slug].astro` mailto fallback        | `site.data.contact_email`                                | `<a href={\`mailto:${site.contact_email}\`}>{site.contact_email}</a>`   | **WIRED**     | Was NOT_WIRED (hardcoded). |

All previously-WIRED links (gallery → collection, manifest → detail page, prebuild → CI, slot routing for og:image) were not touched by the closure commit and remain WIRED.

### Data-Flow Trace (Level 4) — Delta Since Prior Verification

| Artifact                                          | Data Variable / Source                                                 | Produces Real Data                                                                                                | Status      |
| ------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------- |
| `src/components/design-skill/Footer.jsx`          | `igHandle`, `contactEmail` props ← Astro caller's `getEntry('site', 'default').data` | YES — Built HTML for all 5 footer-bearing pages contains the canonical YAML values: `instagram.com/studiobluemli` + `mailto:hi@studiobluemli.com`. | **FLOWING**  |
| `src/pages/gallery/[slug].astro` IG CTA          | `site.data.ig_dm_url` (e.g., `https://ig.me/m/studiobluemli`)         | YES — `cluster-blush/index.html` contains `<a class="cta-button" href="https://ig.me/m/studiobluemli">`.          | **FLOWING**  |
| `src/pages/gallery/[slug].astro` mailto fallback | `site.data.contact_email`                                              | YES — `cluster-blush/index.html` contains `mailto:hi@studiobluemli.com`.                                          | **FLOWING**  |

All three previously-DISCONNECTED data flows are now FLOWING.

### Behavioral Spot-Checks — Re-run

| Behavior                                                    | Command                                                                         | Result                                                  | Status |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------- | ------ |
| Astro check passes with 0 errors                            | `pnpm exec astro check 2>&1 \| tail -5`                                          | `26 files: 0 errors, 0 warnings, 7 hints`               | PASS   |
| No remaining hardcoded `studio_bluemli` (underscore drift)  | `grep -rn "studio_bluemli" src/`                                                | 0 matches                                                | PASS   |
| No remaining hardcoded `hi@studiobluemli.com` outside YAML  | `grep -rn "hi@studiobluemli" src/`                                              | 1 match (config.yaml — the source of truth)             | PASS   |
| `getEntry('site', 'default')` is called in every Footer-bearing page | `grep -rn "getEntry.*site" src/pages/`                                | 6 matches (all 6 pages render Footer)                   | PASS   |
| Built HTML renders canonical `studiobluemli` consistently   | `grep -rn "studio_bluemli" dist/`                                               | 0 matches                                                | PASS   |
| Detail page renders all 3 site fields                       | `grep -c "instagram.com/studiobluemli\\|ig.me/m/studiobluemli\\|mailto:hi@studiobluemli.com" dist/client/gallery/cluster-blush/index.html` | 1, 1, 1                                                  | PASS   |
| All 5 non-detail pages render footer IG link from YAML      | `grep -c "instagram.com/studiobluemli" dist/client/{index,about,say-hi,popups,gallery}/index.html` | 1 per file (5 files)                                     | PASS   |

All seven spot-checks pass.

### Requirements Coverage — Delta

| Requirement | Source Plan              | Description                                                                            | Status      | Evidence                                                                                                              |
| ----------- | ------------------------ | -------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------- |
| CNT-06      | 02-01-PLAN.md            | Site config file with tagline/contact_email/IG handle/IG DM URL/footer_text/OG defaults | **SATISFIED** (was PARTIAL) | Schema validated + 6 consumers calling `getEntry('site', 'default')`. Data flows from `config.yaml` through every footer + the gallery-detail CTA + mailto fallback. Was the sole gap from prior verification. |

CNT-06 is the only requirement whose status changed. CNT-01 through CNT-05 and CNT-07 through CNT-12 remain SATISFIED (no relevant code touched by closure commit). PAG-09 (alt text) remains SATISFIED.

### Anti-Patterns — Delta

Closure commit `1fc7b04` removed the following anti-patterns flagged in the prior verification:

| File                                                     | Prior Anti-Pattern                                                                                          | Status     |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------- |
| `src/components/design-skill/Footer.jsx:23`              | `href="https://instagram.com/studio_bluemli"` (drifted hardcode)                                            | **REMOVED** — now `href={\`https://instagram.com/${igHandle}\`}` |
| `src/components/design-skill/Footer.jsx:25`              | `href="mailto:hi@studiobluemli.com"` (hardcoded)                                                            | **REMOVED** — now `href={\`mailto:${contactEmail}\`}` |
| `src/pages/gallery/[slug].astro:90,92`                   | Hardcoded IG DM URL + mailto                                                                                 | **REMOVED** — both now read from `site.data.*` |

The following anti-patterns remain (carried over from prior review, not Phase 2 SC blockers):

| ID | Source | Severity | Notes |
|---|---|---|---|
| BL-01 | REVIEW.md | Warning | Manifest at `public/gallery/_manifest.json` still leaks into deployed origin. Tracked in `quality_concerns:` frontmatter. |
| WR-01 | REVIEW.md | Warning | og:image base URL trailing-slash fragility on CF_PAGES_URL / CF_WORKERS_URL / PUBLIC_SITE_URL branches. |
| WR-02 | REVIEW.md | Warning | `GalleryGrid.jsx` `width={400} height={500}` mismatch with manifest's `[400, 533]`. |
| WR-03 | REVIEW.md | Warning | Empty popups dir emits `[WARN]` on every build. |
| IN-01 | REVIEW.md | Info | All 6 seeds at `status: available`; non-default statuses only via contract test. |
| WR-04, WR-05, WR-06, WR-07, WR-08, WR-09, IN-02 through IN-05 | REVIEW.md | Info/Warning | Various; see `02-REVIEW.md`. None affect Phase 2 SCs. |

### Human Verification Required (5 prior + 1 new)

See YAML frontmatter `human_verification:` section. The five prior items remain pending:

1. Visual confirmation of `/gallery` rendering (6 cards, mobile responsive).
2. Visual confirmation of `/gallery/cluster-blush` (IG CTA prominent, mailto fallback below).
3. SC2 typo reject (covered programmatically — confirm error-message clarity).
4. SC3 sold-badge visual (covered programmatically — confirm visual polish).
5. End-to-end SC1 PR-preview dry-run.

**New (post-closure):**

6. **CNT-06 trust check** — edit one value in `src/content/site/config.yaml`, rebuild, grep `dist/client/index.html` for the new value, restore the YAML. This is the live demonstration of the founder workflow that motivates CNT-06; the programmatic re-verification confirms the wiring exists, but a live edit-and-rebuild is the gold-standard trust signal.

### Open Quality Concerns (Not Phase 2 Blockers)

Tracked in `quality_concerns:` frontmatter for triage:

- **BL-01** (REVIEW.md blocker / verification warning) — `public/gallery/_manifest.json` exposure. Suggest closing as part of Phase 3 alongside the popups manifest pattern, or via a focused chore.
- **WR-01** — og:image base URL trailing-slash defensive bug. Trivial fix; suggest folding into Phase 3 (preview deploy / unfurl) or a chore commit.
- **WR-02** — GalleryGrid hardcoded `height={500}` vs manifest `[400, 533]`. Suggest folding into Phase 3 grid polish or a chore commit.
- **WR-03** — popups `[WARN]` chatter. Will self-resolve when Phase 3 PAG-03 seeds the first popup. Could pre-empt with a `.example.md` dotfile pattern (per REVIEW WR-03 fix).
- **IN-01** — all 6 seeds `status: available`. Suggest flipping 1–2 seed pieces to `sold` / `one-of-one` during Phase 3 founder-workflow review or as part of the SC3 visual human-verification step.

None of the above prevent Phase 2's goal from being achieved. They are real quality concerns and should be triaged before launch.

### Goal Achievement Statement

The Phase 2 goal — "Founder can add a gallery piece via the GitHub web UI and see it on a preview deploy within ~5 minutes — including the gallery grid card, the per-piece detail page with availability badge, and the 'Ask about this piece on Instagram' CTA" — is now structurally achieved in the codebase:

- The schema-validated content collection routes work end-to-end (SC1).
- The Zod strict schema catches typos (SC2).
- Sold pieces render with the editorial badge (SC3).
- og:image meta is emitted with absolute URLs (SC4).
- The founder-facing markdown guide exists (SC5).
- The site-config single source of truth (CNT-06) is now wired through every page.

The remaining six items requiring human confirmation are visual / end-to-end / live-edit verifications that cannot be done from static code analysis. Status is therefore `human_needed` rather than `passed`.

---

_Re-verified: 2026-05-13T17:30:00Z_
_Verifier: Claude (gsd-verifier)_
_Closure commit: 1fc7b04 "fix(02): wire getEntry('site') into Footer + detail page (CNT-06 gap closure)"_
