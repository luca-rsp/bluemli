# Phase 4: Analytics, Polish & Launch - Context

**Gathered:** 2026-05-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire Umami Cloud analytics (privacy-first, cookieless, no consent banner) with 4 custom events, ship security + cache headers via a `_headers` file in `public/`, validate Lighthouse mobile ≥ 90 + OG previews on production, then do the DNS cutover (apex `studiobluemli.com` + `www → apex` 301 via Cloudflare Redirect Rules), and walk the "Looks Done But Isn't" launch checklist.

**Not in this phase:** content edits, gallery/popups schema changes, contact form (dropped from v1 entirely per Phase 3 D-18..D-23), per-popup detail routes, dedicated process/craft About photos.

**Requirements covered:** FND-03 (apex resolves, www→apex 301), LCH-01 (Umami script in BaseLayout with `data-website-id` + `data-domains`), LCH-02 (domain registered in Umami), LCH-03 (4 custom events — see D-01), LCH-04 (security + long-cache headers), LCH-05 (Lighthouse mobile ≥ 90 across all 4 categories on all 5 pages), LCH-06 (OG previews validated via Facebook Sharing Debugger + Twitter Card validator), LCH-07 (DNS cutover with HTTPS), LCH-08 (launch checklist walked — revised scope per D-04).

</domain>

<decisions>
## Implementation Decisions

### Umami Analytics

- **D-01: Custom events to track = 4 total (LCH-03 stale "contact-form submit" replaced with 2 /say-hi events).** The contact form is dropped from v1 (Phase 3 D-18), so LCH-03's third event is moot. Phase 4 ships:
  1. **Gallery card click** (LCH-03 #1, unchanged) — fires on the `<a>` wrapping each piece card on `/gallery`.
  2. **Per-piece "Inquire on Instagram" click** (LCH-03 #2, unchanged) — fires on the IG CTA on `/gallery/<slug>`.
  3. **/say-hi IG DM click** (new) — fires on the IG DM button on `/say-hi`.
  4. **/say-hi mailto click** (new) — fires on the `mailto:hi@studiobluemli.com` fallback link on `/say-hi`.
  
  Rationale: per-piece IG inquire measures piece-specific signal; /say-hi events measure generic "reach out without a specific piece" intent and let the founder compare IG-vs-email funnel weight. Planner picks `data-umami-event` slug naming (short snake_case strings; founder doesn't care about the wire name).

- **D-02: Pre-cutover verification on workers.dev preview (Claude's call — recorded with rationale).** To defuse Pitfall #19 (Umami silently dropping events when the domain isn't registered), BaseLayout emits an env-aware Umami snippet during the run-up to cutover:
  - The script tag's `data-domains` attribute includes BOTH `studiobluemli.com` AND the active workers.dev preview hostname.
  - Umami's website list registers BOTH `studiobluemli.com` AND the workers.dev preview hostname temporarily.
  - Founder/Claude walks the 4 events on a preview deploy and confirms they appear in Umami Realtime within 5 minutes.
  - On cutover day (or immediately after), the snippet flips to apex-only (`data-domains="studiobluemli.com"`); Umami's website list drops the workers.dev entry.
  
  Implementation discretion: planner picks the env-detection pattern (e.g., `import.meta.env.PUBLIC_DEPLOY_ENV` / `WORKERS_CI_BRANCH` already used by `src/lib/site-url.ts`). Founder choice was "just make it work" — Claude took the boring-and-reliable path: no launch-day analytics gap.

- **D-03: Founder owns the Umami Cloud account; Claude scaffolds everything else.** Founder confirmed an account already exists at `cloud.umami.is`. Execution sequence:
  1. Claude scaffolds env-aware Umami snippet in `src/layouts/BaseLayout.astro`, 4 `data-umami-event` attributes on the right elements, and a one-line config knob for the website ID (env var or `site.yaml` entry — planner picks; recommend env var since the website ID is non-secret config, not content).
  2. Founder logs into Umami Cloud, creates the Studio Bluemli site entry, copies the website ID, pastes it into the configured location (Claude shows exactly where with file path + line).
  3. Founder adds workers.dev preview hostname to Umami's registered domains for pre-cutover verification (D-02).
  4. Verification pass on preview.
  5. Cutover (per D-06); switch Umami domain list to apex-only.
  
  Claude must NOT attempt to create the Umami account on the founder's behalf (her email, her credentials, her quota).

### Launch Checklist

- **D-04: LCH-08 checklist scope revised — drop contact-form items, add device-specific replacements.** Final checklist:
  1. `curl https://studiobluemli.com/sitemap-index.xml` returns 200 with valid XML referencing all 5 routes + every `/gallery/<slug>`.
  2. `curl https://studiobluemli.com/robots.txt` returns 200 with `Allow: /` + sitemap reference (production branch of the env-aware `robots.txt.ts` per Phase 3 D-29).
  3. Every `og:image` URL across all 5 pages returns 200 (Claude scripts this — iterate all pages + per-piece slugs).
  4. No console errors when opening each of the 5 pages in a fresh browser session (Claude walks devtools).
  5. All 4 Umami custom events fire in Realtime within 5 minutes of clicking them (Claude clicks each, watches Realtime).
  6. Lighthouse mobile (PageSpeed Insights or `lighthouse` CLI) returns ≥ 90 across Performance / Accessibility / Best Practices / SEO on all 5 routes against the production URL.
  7. `curl -I https://www.studiobluemli.com` returns `301` with `Location: https://studiobluemli.com/` (or the requested path).
  8. `curl -vI https://studiobluemli.com` shows a valid HTTPS cert chain.
  9. **Founder phone check #1:** Tap IG DM link on `/say-hi` — does the Instagram app open?
  10. **Founder phone check #2:** Tap mailto link on `/say-hi` — does the email client open with `hi@studiobluemli.com` pre-filled?
  11. **Founder phone check #3:** Open `studiobluemli.com` on phone over cellular — does it feel fast (under ~2 seconds to first paint)?
  
  Result format: a short text `LAUNCH-REPORT.md` in the phase directory (no screenshots required from founder); each item marked ✓/✗ with one-line note. Failures get an inline fix + redeploy + recheck loop before declaring launch complete.

- **D-05: Claude walks items 1–8; founder walks items 9–11 on her phone when pinged.** Removed earlier "screenshots back to you" framing — founder doesn't want to deal with screenshots. Claude reports textually; founder answers yes/no for the 3 device-specific items. Both passes are required (founder's 3 yes-answers gate launch).

### DNS Cutover (Claude's Discretion — planner-decided + founder-walkthrough)

- **D-06: DNS cutover gets a step-by-step `SETUP-DNS.md` addendum at the repo root.** Founder is a non-engineer; the DNS records sit on her Cloudflare account, so she must be in the dashboard. The doc walks:
  1. Cloudflare dashboard → Workers & Pages → `studio-bluemli` → Settings → Triggers → Add Custom Domain → `studiobluemli.com`.
  2. Cloudflare dashboard → Rules → Redirect Rules → Create → `Host = www.studiobluemli.com` → 301 to `https://studiobluemli.com${URI}`.
  3. Verify in Cloudflare DNS that the apex CNAME-flattening (or A/AAAA record auto-created by the Workers integration) is in place.
  4. Wait for cert provisioning (auto, ~minutes).
  5. Run launch checklist (D-04).
  
  Doc tone: short, no jargon, screenshots optional (planner picks whether to ship reference screenshots from a sample workflow or just text descriptions of UI element locations). Same prose register as `CONTENT_EDITING.md`.

- **D-07: `astro.config.mjs`'s `site:` must be `'https://studiobluemli.com'` before cutover (planner verifies during research).** This was set in Phase 3 D-26 for canonical/SEO purposes; Phase 4 just verifies it's still there and that no preview-related override exists.

### Security & Cache Headers (Claude's Discretion — planner-decided)

- **D-08: Headers via a `_headers` file in `public/`, NOT via Worker response injection or Cloudflare dashboard Transform Rules.** Cloudflare Workers Static Assets supports the `_headers` file syntax (same shape as Cloudflare Pages had). Rationale:
  - Declarative + version-controlled in the repo (matches Phase 1 D-04's "code is the source of truth" stance).
  - Worker-side injection only reaches `/api/*` (per `run_worker_first` config in `wrangler.jsonc`) — most static-asset responses bypass the Worker entirely.
  - Dashboard Transform Rules drift from the repo and are harder to audit.
  
  Planner confirms during research that Workers Static Assets respects `_headers` for the current adapter version (`@astrojs/cloudflare@13.5`) — fallback is Transform Rules if the syntax isn't honored.

- **D-09: Headers contract (planner refines exact values during research):**
  - **HSTS:** `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (2y, includeSubDomains so future subdomains inherit; preload-eligible).
  - **X-Content-Type-Options:** `nosniff`.
  - **Referrer-Policy:** `strict-origin-when-cross-origin`.
  - **Permissions-Policy:** disable all sensitive features the site doesn't need (camera, microphone, geolocation, payment, USB) — planner picks the exact directive list.
  - **CSP (Content Security Policy):** ship a MINIMAL CSP allowing `'self'` + Umami origin (`https://cloud.umami.is` for the script; check Umami docs for the events endpoint origin). Inline styles allowed (Astro emits scoped `<style>` blocks). No `'unsafe-eval'`. Planner refines during research.
  - **Cache-Control:**
    - HTML routes (`/`, `/gallery`, `/gallery/<slug>`, `/popups`, `/about`, `/say-hi`): `public, max-age=0, must-revalidate` (always fresh; Cloudflare's edge caches at its own layer).
    - Fingerprinted assets (`/_astro/*`, hashed font/CSS bundles): `public, max-age=31536000, immutable` (1y, immutable — they're content-hashed).
    - Non-fingerprinted images (`/gallery/<slug>/hero-*.webp`, favicons, `og-default.png`): planner picks (1d or 7d are both reasonable; tradeoff is freshness of replaced images vs CDN cache hits).

- **D-10: OG default image (`public/og-default.png`) already exists from Phase 3.** Phase 4 verifies it's brand-faithful (cream background, wordmark or logo lockup, no flower vocabulary in alt or filename) and that the file is 1200×630. If founder review flags it as a placeholder, Phase 4 ships a brand-cleaner replacement before launch. Planner notes: this is a 1-line discretion check, not a designed sub-task.

### Carrying Forward (locked from prior phases / requirements — recorded, not re-discussed)

- Umami Cloud (free, cookieless, no consent banner) — PROJECT.md constraint.
- `data-domains` attribute is the production restriction mechanism — LCH-01.
- `data-website-id` is a non-secret config value (it lives in client-side HTML; not a `wrangler secret`) — planner picks env var vs `site.yaml` field, both acceptable.
- Apex canonical (`studiobluemli.com`); `www.` 301-redirects to apex — FND-03, Phase 3 D-26 (canonical-to-apex on every `SEO.astro` emission), Pitfall #18.
- Cloudflare Workers + Static Assets is the deploy target — PROJECT.md, Phase 1.
- `astro.config.mjs` `site:` is `'https://studiobluemli.com'` — Phase 3 D-26.
- robots.txt is env-aware (`Disallow: /` on preview, `Allow: /` + sitemap reference on production) — Phase 3 D-29 already shipped.
- `dist/server/entry.mjs` empty entrypoint persists (Phase 3 D-22). Phase 4 must NOT delete it — preserves zero-friction reintroduction if the contact form returns as v1.x.
- Brand non-negotiables (cream, no white, no flower vocabulary in any new copy) — Phase 1 CI grep enforces.
- Voice rules for any new copy (SETUP-DNS.md, LAUNCH-REPORT.md) — sentence-case, friendly, no emoji.

### Claude's Discretion (planner picks during research/planning)

- Env var name for the Umami website ID (e.g., `PUBLIC_UMAMI_WEBSITE_ID`) and where it's read in the BaseLayout snippet (D-03).
- `data-umami-event` slug naming convention for the 4 events (D-01).
- Exact env-detection pattern for the workers.dev hostname (D-02) — reuse `src/lib/site-url.ts` helpers if they cover it.
- CSP exact directive list including Umami's events endpoint origin (D-09).
- Permissions-Policy exact directive list (D-09).
- Cache TTL for non-fingerprinted images (1d vs 7d) (D-09).
- Whether to include reference screenshots in `SETUP-DNS.md` (D-06) — planner picks based on whether the founder seems likely to need them.
- Whether to lift OG default image generation into a small script vs hand-curated PNG (D-10).
- Lighthouse measurement tool: `lighthouse` CLI in CI vs PageSpeed Insights API vs both (LCH-05).
- Whether to script the OG-image-URL HEAD checks (D-04 item 3) inline in a Bash one-liner or a tiny Node script.
- Whether `LAUNCH-REPORT.md` lives in the phase directory or at repo root (recommend phase dir — keeps the audit local to Phase 4).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning (always)
- `.planning/PROJECT.md` — Project overview, constraints (Umami Cloud free, cookieless; Cloudflare Workers + Static Assets; apex canonical), brand non-negotiables.
- `.planning/REQUIREMENTS.md` §FND-03 — apex resolves + www→apex 301.
- `.planning/REQUIREMENTS.md` §LCH-01..LCH-08 — the 8 launch requirements traced to Phase 4 (note D-01 supersedes LCH-03's "contact-form submit" event; D-04 supersedes LCH-08's "contact form sends" checklist item).
- `.planning/ROADMAP.md` §"Phase 4: Analytics, Polish & Launch" — goal, success criteria.
- `.planning/STATE.md` — current status, locked decisions.
- `CLAUDE.md` — tech stack (Umami Cloud confirmed; Cloudflare Workers + Static Assets pricing free tier), version compatibility, "What NOT to Use" (no Plausible, no GA, no cookie banner).

### Phase carry-over (read before planning Phase 4)
- `.planning/phases/01-foundations-brand-system/01-CONTEXT.md` — D-04 (design-skill copies may diverge), D-14..D-17 (Fonts API), D-18 (5-route inventory). FND-12 Lighthouse baseline (0.99/0.95/1.00/0.91 across all 5 routes) is the starting point for LCH-05.
- `.planning/phases/02-content-schema-gallery/02-CONTEXT.md` — D-12 (per-piece og:image env-aware base URL, lifted into `SEO.astro` by Phase 3 D-26 — Phase 4's OG-image HEAD check exercises this).
- `.planning/phases/03-page-composition-pop-ups/03-CONTEXT.md` — D-18..D-23 (contact form dropped from v1; LCH-03 #3 and LCH-08 contact-form items are stale and replaced here), D-22 (preserve `output: 'server'` + `run_worker_first: ["/api/*"]`), D-26 (`SEO.astro` emits apex canonical; `astro.config.mjs` `site:`), D-27 (default `og:image` strategy — Phase 4 verifies the already-shipped `public/og-default.png`), D-29 (env-aware `robots.txt.ts` already production-correct).
- `.planning/phases/03-page-composition-pop-ups/03-VERIFICATION.md` — Phase 3 verified state; all 5 routes live on preview with SEO/sitemap shipped.
- `.planning/phases/03-page-composition-pop-ups/03-REVIEWS.md` — REVIEW-MODE Concern 7 (env-var exposure hardening for `isProduction()` in `src/lib/site-url.ts`) — Phase 4's env-aware Umami snippet must use the same hardened helper.

### Pitfalls relevant to Phase 4
- `.planning/research/PITFALLS.md` #18 (WWW vs apex domain mismatch / no redirect) — addressed by D-06 (Cloudflare Redirect Rules) + canonical-to-apex (Phase 3 D-26).
- `.planning/research/PITFALLS.md` #19 (Umami "0 events" after cutover because domain isn't registered) — addressed by D-02 (pre-cutover verification on workers.dev preview) + D-03 (founder registers `studiobluemli.com` in Umami) + D-05 (item 5 in launch checklist confirms Realtime within 5 min of cutover).
- `.planning/research/PITFALLS.md` anti-feature list — no Plausible (paid), no GA (cookie banner), no cookie banner of any kind. Umami's cookieless model is the entire reason it was picked.

### Existing code to read before extending
- `src/layouts/BaseLayout.astro` — Umami `<script>` lands here (LCH-01). The `<slot name="head">` pattern is already wired; D-02's env-aware snippet goes in `<head>` just before/after the existing `<Font />` tags.
- `src/lib/site-url.ts` — `isProduction()` helper from Phase 3 D-29; D-02 reuses this to decide whether to include the workers.dev hostname in `data-domains`.
- `src/pages/robots.txt.ts` — already env-aware (Phase 3); Phase 4 leaves untouched, only references in the launch checklist (D-04 item 2).
- `src/pages/gallery.astro` — gallery card `<a>` elements get `data-umami-event="gallery-card-click"` (D-01 #1; planner picks the exact slug).
- `src/pages/gallery/[slug].astro` — per-piece IG inquire button gets `data-umami-event="ig-inquire-per-piece"` (D-01 #2; planner picks the exact slug).
- `src/pages/say-hi.astro` — IG DM link + mailto fallback get `data-umami-event="say-hi-ig-dm-click"` and `data-umami-event="say-hi-mailto-click"` (D-01 #3, #4; planner picks the exact slugs).
- `src/components/SEO.astro` — already emits canonical to apex (Phase 3 D-26); Phase 4 reads, doesn't modify (verifies in D-07).
- `public/` — `_headers` file is new in Phase 4 (D-08); sits alongside `og-default.png`, `mark.svg`, `favicon-*`.
- `astro.config.mjs` — verify `site: 'https://studiobluemli.com'` (D-07); no edits if already correct.
- `wrangler.jsonc` — leave `run_worker_first: ["/api/*"]` alone (D-22 carryover from Phase 3); no edits.
- `CONTENT_EDITING.md` — voice/register reference for the new `SETUP-DNS.md` doc (D-06).

### Brand & design
- `.claude/skills/studio-bluemli-design/SKILL.md` — brand non-negotiables (cream not white, no flower vocabulary, no center bead) for any new copy in `SETUP-DNS.md` or `LAUNCH-REPORT.md`.
- `.claude/skills/studio-bluemli-design/colors_and_type.css` — color tokens for verifying `og-default.png` is brand-faithful (D-10).

### External docs to consult during research/planning
- Cloudflare Workers Static Assets `_headers` file syntax + behavior — confirm parity with Cloudflare Pages' `_headers` semantics for the current adapter version (`@astrojs/cloudflare@13.5`); fallback to dashboard Transform Rules if not honored. (D-08, D-09)
- Cloudflare Redirect Rules UI flow for the `www → apex` 301 — current step-by-step for `SETUP-DNS.md`. (D-06)
- Cloudflare Custom Domains for Workers — adding `studiobluemli.com` as a custom domain to the `studio-bluemli` Worker; cert auto-provisioning. (D-06)
- Umami Cloud `data-domains` attribute + Realtime view + custom event API — confirm `data-umami-event` is still the current attribute and the Realtime latency is ~< 5 min. (D-01, D-02, D-03)
- Umami events endpoint origin — needed for CSP `connect-src` directive. (D-09)
- Lighthouse CI / PageSpeed Insights API — current recommended tool for production audits; mobile profile defaults. (LCH-05)
- Facebook Sharing Debugger + Twitter Card Validator — current URLs and rate limits for OG validation. (LCH-06)
- HSTS preload list submission flow (`hstspreload.org`) — informational only; Phase 4 ships HSTS with `preload` directive but doesn't necessarily submit to the preload list (founder discretion later).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`src/layouts/BaseLayout.astro`** — `<head>` slot pattern is already in place. Umami `<script>` integrates here without restructuring.
- **`src/lib/site-url.ts`** — `isProduction()` helper plus env-var exposure hardening (Phase 3 REVIEWS Concern 7). D-02's env-aware Umami snippet reuses this exactly — no second source of truth for "are we on production?".
- **`src/pages/robots.txt.ts`** — env-aware pattern as a template for any other env-aware code (Phase 4 doesn't add new endpoints, but the pattern informs how the Umami snippet branches).
- **`src/components/SEO.astro`** — emits canonical-to-apex on every page (Phase 3 D-26); Phase 4 verifies but doesn't extend.
- **`public/og-default.png`** — already exists. D-10 verifies brand fidelity (cream background, no flower vocabulary, 1200×630).
- **`CONTENT_EDITING.md`** — register/tone template for `SETUP-DNS.md` (D-06) and `LAUNCH-REPORT.md` (D-04).
- **CI Lighthouse baseline** (Phase 1 FND-12 / 01-VERIFICATION.md) — 0.99 / 0.95 / 1.00 / 0.91 across all 5 routes. Phase 4's LCH-05 audit on production should match or exceed; any regression triggers a fix loop before launch.

### Established Patterns
- **No client-side React** — Umami's `<script async>` is the ONLY new client-side JS this phase adds. No `client:` directive on any component. (Phase 1 contract.)
- **`prerender = true` on every page** — Phase 4 doesn't add new routes; the Umami snippet renders into static HTML at build time.
- **Env-aware production detection via `src/lib/site-url.ts`** — used by `robots.txt.ts` (Phase 3 D-29); reused by D-02's Umami snippet. Single source of truth.
- **Brand-rule CI grep** (Phase 1) — applies to all new code/copy in this phase. No flower vocabulary, no white backgrounds, no gradients/backdrop-filter/1px borders, lowercase-only filenames in `src/pages/`.
- **Markdown docs at repo root for founder-facing operational steps** — `CONTENT_EDITING.md` is the template. `SETUP-DNS.md` (D-06) follows the same convention.

### Integration Points
- `src/layouts/BaseLayout.astro` ← Phase 4 adds: env-aware Umami `<script>` snippet in `<head>` (D-01, D-02), reading the website ID from env/config (D-03).
- `src/pages/gallery.astro` ← Phase 4 adds: `data-umami-event` attribute on each piece card `<a>` (D-01 #1).
- `src/pages/gallery/[slug].astro` ← Phase 4 adds: `data-umami-event` attribute on the IG inquire CTA (D-01 #2).
- `src/pages/say-hi.astro` ← Phase 4 adds: `data-umami-event` attributes on the IG DM link and mailto link (D-01 #3, #4).
- `public/_headers` ← (new) ← static headers file consumed by Cloudflare Workers Static Assets (D-08, D-09).
- `SETUP-DNS.md` ← (new, repo root) ← founder-facing DNS cutover walkthrough (D-06).
- `.planning/phases/04-analytics-polish-launch/LAUNCH-REPORT.md` ← (new, phase dir, written during execution) ← textual launch checklist results (D-04).
- `astro.config.mjs` ← Phase 4 verifies `site: 'https://studiobluemli.com'` is set (D-07); no edit if already correct.
- `wrangler.jsonc` ← unchanged. Custom domain is added via Cloudflare dashboard, not `wrangler.jsonc`'s `routes` (per Workers Static Assets convention).
- `.env` / env vars ← Phase 4 adds: `PUBLIC_UMAMI_WEBSITE_ID` (or planner's chosen name) — set in Cloudflare Workers Builds env vars on production; founder pastes the value once after creating the Umami site entry.
- `src/content/site/config.yaml` ← optionally extended (D-03) with `umami_website_id` if planner picks `site.yaml` over env var — both acceptable; env var is recommended.

</code_context>

<specifics>
## Specific Ideas

- **"i just want it to work. can you make that happen? i dont want to deal with technical stuf"** — drove D-02 (Claude takes the technical-decision burden on technical-discretion items: chose pre-cutover verification path without further user input), D-04/D-05 (no screenshots from founder; Claude reports textually; founder gets 3 yes/no phone questions only), D-06 (SETUP-DNS.md addendum written in `CONTENT_EDITING.md` register — no jargon).
- **"cant you just tell me what to check?"** — drove D-05's specific 3-question phone flow (tap IG DM → does Instagram open? tap mailto → does email client open? open site on phone → does it feel fast?). No screenshots, no devtools, no curl from founder.
- **Founder already has an Umami Cloud account** — drove D-03 (no account-creation sub-task; just paste the website ID).
- **"I'll handle [security headers + DNS cutover] myself as planner discretion"** said by Claude after founder selected only 2 of 4 areas — drove D-08, D-09, D-10 (recorded as Claude's discretion with reasoning so planner can act without re-asking).
- **Phase 3's REVIEWS Concern 7** (env-var exposure hardening for `isProduction()`) — informs D-02 by mandating the env-aware Umami snippet reuses the hardened helper from `src/lib/site-url.ts`.

</specifics>

<deferred>
## Deferred Ideas

- **HSTS preload list submission** (`hstspreload.org`) — Phase 4 ships HSTS with `preload` directive but doesn't submit to the global preload list. Submission is a one-way operation (effectively impossible to unwind for ~1y) so it's deferred until the site has been on apex for 30+ days without issue. Add as v1.x.
- **OG default image regeneration via a small script (satori-style)** — Phase 4 verifies the existing hand-curated `public/og-default.png`; if it later needs to render dynamic content (per-page titles, etc.), a generator approach can replace it. v1.x.
- **Lighthouse CI as a GitHub Actions PR gate on production-equivalent URLs** — Phase 1 already runs Lighthouse on preview as a required status check; Phase 4 runs it manually on production as the final cutover check. Adding a recurring Lighthouse audit (e.g., weekly cron) against production is v1.x.
- **Per-page Umami funnel analysis dashboards** — Umami Cloud supports custom reports/funnels; Phase 4 just installs the 4 events. Building dashboards is a founder-discretion task once events are flowing.
- **CSP `report-uri` / `report-to` for violation telemetry** — useful for catching CSP misconfigurations in production but adds infra (a violation endpoint). Phase 4 ships CSP without violation reporting; v1.x if false-positives become a problem.
- **Subresource Integrity (SRI) for the Umami `<script>` tag** — Umami doesn't publish stable SRI hashes per release, and the script URL is versionless, so SRI would risk breaking analytics on every Umami update. Out of scope.
- **Cloudflare Web Analytics as a fallback/secondary** — Cloudflare offers free analytics that wouldn't replace Umami custom events but might offer complementary RUM data. v1.x consideration.
- **Customer-domain email setup (SPF/DKIM/DMARC for `hi@studiobluemli.com`)** — out of scope for Phase 4 (the contact form is dropped; `mailto:` doesn't need server-side email auth). The MX records are MS365's, separate concern.
- **Lighthouse Treemap / coverage analysis** — Phase 4 measures, doesn't optimize. If Lighthouse production scores regress below 90, planner adds a fix-loop sub-task during execution, but proactive treemap analysis is v1.x.

</deferred>

---

*Phase: 4-Analytics, Polish & Launch*
*Context gathered: 2026-05-14*
