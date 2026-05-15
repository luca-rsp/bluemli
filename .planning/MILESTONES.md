# Milestones

## v1.0 Studio Bluemli v1.0 — Launch (Shipped: 2026-05-15)

**Phases completed:** 4 phases, 22 plans, 56 tasks

**Key accomplishments:**

- Chosen mode:
- One-liner:
- Task 1 automated verification (plan-supplied one-liner):
- Five prerendered routes (/, /gallery, /popups, /about, /say-hi) composing the design-skill React JSX into a single BaseLayout with Fonts API preload, favicon set, skip-link, and a site-wide FND-13 `:focus-visible` rule — all backed by `src/sample-data.ts` placeholders and shipping zero client-side JavaScript to the browser.
- GitHub Actions required status check ("Build & brand check") + three CI shell scripts enforcing the 5 active brand rules, the lowercase-filename rule (FND-11), and the no-hydration / no-browser-JS contract (REVIEW FIX M1) on every PR + push to main, plus Lighthouse CI asserting mobile categories ≥ 0.9 on / (FND-12) and a 5-step engineer-facing SETUP.md — committed; the remaining 5 manual steps the engineer must perform in the GitHub + Cloudflare dashboards are gated on the orchestrator-surfaced human-action checkpoint below.
- Three strict Zod content collections (gallery/popups/site) with 6 HEIC-hero seed pieces, probe-confirmed image() HEIC support (Outcome A), and BaseLayout named head slot for per-page og:image injection
- Input:
- One-liner:
- One-liner:
- Founder-facing GitHub web UI editing guide (CONTENT_EDITING.md) shipped at repo root; REQUIREMENTS.md CNT-03 synced to D-16/D-17 schema decisions; ROADMAP.md and CONTEXT.md confirmed already aligned
- Wordmark font swapped from Bagel Fat One to Caveat Brush via a CSS-variable cascade (zero new font downloads), and NoPa → NOPA casing flipped across 8 user-facing strings in 4 source files — Plan 2's SEO meta and Plan 4's About rewrite inherit the corrected baseline.
- Created (5):
- Composed the landing page mini-callout (D-02) and the full `/popups` page (D-06/D-07/D-08) on top of a shared TZ-aware `splitPopups()` helper that uses `Temporal.PlainDate` exclusively — start_time strings like "11am" are interpolated verbatim and never parsed as Date components (Concern 2 fix).
- `/about` ships with rewritten brand-voice copy + a 3-cell photo strip of featured gallery pieces; `/say-hi` collapses from a Phase-1 contact-form shell to an IG-DM-link + mailto fallback page (D-18 v1 scope cut), with AppointmentForm.jsx preserved untouched (D-21) so the rewiring cost stays at zero if the form returns in v1.x.
- Spike FAILED: integrated `src/scheduled.ts` + user `wrangler.jsonc` triggers cannot work with `@astrojs/cloudflare@13.5` — adapter redirects deploy config to its own `dist/server/wrangler.json`, silently stripping user edits. PAG-04 blocked pending user decision on the documented Concern 5 fallback.
- One-liner:
- Env-aware Umami Cloud snippet wired into BaseLayout + 4 data-umami-event slugs on the 4 D-01 anchors, zero new client-side JS.
- Founder-facing `SETUP-DNS.md` walkthrough of 5 Cloudflare-dashboard steps, cross-referenced in `CONTENT_EDITING.md`, D-07 apex site verified, D-10 og-default.png FLAGGED for Plan 05 regeneration (flower iconography + center bead motif).
- Two executable Bash scripts + two npm aliases that gate Plan 05's production cutover: og:image HEAD-check across every sitemap URL, and Lighthouse mobile audit (≥ 90 across all 4 categories) against the 6 production routes.
- Studio Bluemli v1 is live at https://studiobluemli.com — apex resolves over HTTPS (GTS-issued cert via Cloudflare custom-domain), www-to-apex 301 preserves path AND query, 6 Umami custom events fire on production with apex-only data-domains, Lighthouse mobile scores 92–100 across all 24 cells (6 routes × 4 categories), and OG unfurls render correctly in FB debugger + real iMessage/IG-DM tests on the founder's phone.

---
