# Studio Bluemli Website

## What This Is

A small static marketing website for Studio Bluemli — a jewelry studio in NoPa, San Francisco that hand-assembles whimsical, bright, beaded-cluster earrings. The site is a portfolio + storefront-less brand presence at studiobluemli.com: visitors browse the gallery, see where the next pop-up is happening, learn the founder story, and reach out to inquire about pieces. No online checkout — sales happen at pop-ups and via direct conversation.

## Core Value

The product photography and brand voice come through cleanly on a cream-paper page, and the founder can add or remove gallery pieces and pop-up events without writing code or paying a CMS.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- [x] **Site builds as static assets and deploys to Cloudflare Workers with Static Assets on every push to `main`** _(Phase 1 — FND-04. Live at `studio-bluemli.<account>.workers.dev`; PR previews via Workers Builds non-production branches.)_
- [x] **Reuses the `studio-bluemli-design` skill's React components, color/type tokens, and product photography conventions; cream background, never white** _(Phase 1 — FND-06, FND-09, FND-10. 11 JSX components synced via `scripts/sync-design-skill.mjs`; brand-rule grep enforced in CI as required status check.)_
- [x] **Logo (`mark.svg`) renders in header and as favicon, with mark-color variants used contextually** _(Phase 1 — FND-08. Full favicon set generated from `mark.svg`; verified on desktop browser tab + iOS "Add to Home Screen".)_
- [x] **Mobile-first responsive layout — Lighthouse mobile ≥ 90 across all categories** _(Phase 1 — FND-12. CI gates on Performance 0.99 / Accessibility 0.95 / Best Practices 1.00 / SEO 0.91 across all 5 routes after Fontsource self-hosting closed the Korean-subset payload bug.)_
- [x] **Brand non-negotiables enforced as code** _(Phase 1 — FND-10, FND-11. CI grep blocks `bg-white`, `#FFF`, `flower`/`petal`/`floral`/`bloom`/`blossom`, `gradient`, `backdrop-filter`, `border: 1px`, and uppercase filenames under `src/pages/` before merge.)_
- [x] **`:focus-visible` accessibility rule applied to every interactive element** _(Phase 1 — FND-13. Global 2px coral outline at 2px offset in `BaseLayout.astro`.)_
- [x] **Gallery page listing all pieces with photo, name, price, availability status, and 1–2 sentence description** _(Phase 2 — CNT-07, CNT-08, CNT-09, CNT-10. `/gallery` index + per-piece `/gallery/<slug>` detail pages prerendered from a strict Zod content collection; per-piece `og:image` with env-aware base URL; six seeded pieces in `src/content/gallery/`.)_
- [x] **Gallery entries managed via markdown files in `/content/gallery/` — adding/removing a piece is a single file change** _(Phase 2 — CNT-01..CNT-06, CNT-11, CNT-12. Founder edits markdown + drops a HEIC; the CI prebuild step converts HEIC→WebP variants and emits a dimensions manifest before typecheck; `CONTENT_EDITING.md` documents the GitHub web UI flow in prose, zero CLI words.)_

### Active

<!-- Current scope. Building toward these. -->

- [ ] Landing page with hero, 3 featured gallery pieces, an OPTIONAL "next pop-up" mini-callout (omitted entirely when no future popup exists per Phase 3 D-03), and footer links _(Phase 1 shipped the demo-loaded shell; Phase 2 wired the featured-piece grid to real content; Phase 3 composes the remaining hero/pop-up/footer copy.)_
- [ ] Pop-ups page showing upcoming events prominently (date, location, time) and a smaller text-only archive of past events _(Phase 3 — PT-aware past/upcoming split with daily cron rebuild.)_
- [ ] About page (founder story, studio, process — content drafted by Claude in brand voice, founder edits via GitHub web UI later; closing photo strip reuses 1–3 existing gallery hero WebPs per Phase 3 D-14 — dedicated process/craft shots deferred to v1.x) _(Phase 3.)_
- [ ] Say Hi page with visible Instagram DM link + mailto fallback _(Phase 3 D-18: contact form dropped from v1; revisit as v1.x phase if IG channel stops scaling.)_
- [ ] Pop-up events managed via a YAML file (or per-event markdown) in `/content`, with past/upcoming split derived from date _(Phase 3.)_
- [ ] Live at apex `studiobluemli.com` (and `www.` redirects to apex) via the existing Cloudflare account _(Phase 4 — DNS cutover.)_
- [ ] Umami Cloud analytics installed (free tier, single script tag, no consent banner needed) _(Phase 4.)_

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- E-commerce / checkout — sales happen at pop-ups and via DM; carting infrastructure is a different product
- User accounts / login — nothing on the site is gated
- Blog / journal page — not in v1; can be added later if the founder wants a writing surface
- Newsletter signup — not asked for; can be added later
- A CMS admin UI — markdown/YAML in repo is the v1 workflow; the file structure deliberately stays CMS-compatible so a git-backed CMS (Decap, Sveltia, Pages CMS, TinaCMS) can be added later with zero data migration
- A database (D1/KV) for content — files in repo are simpler and cheaper at this scale
- "Under $100" or any price-ceiling marketing copy — internal positioning fact only, never on the site (brand non-negotiable from design skill)
- Pressed-flower decorative images sprinkled across components — brand non-negotiable
- Multi-language — English only for v1
- Multiple authors / contributor flow — founder is the only editor
- Contact form on `/say-hi` (`<form>` + `/api/contact` Worker + Turnstile + KV rate limit + Resend + SPF/DKIM/DMARC DNS coexistence with MS365) — dropped from v1 entirely per Phase 3 D-18/D-19. `/say-hi` ships as an IG-DM-link page + mailto fallback. Can return as a v1.x phase. `wrangler.jsonc`'s `run_worker_first: ["/api/*"]` and `astro.config.mjs`'s `output: 'server'` are preserved (D-22) so the rewiring cost is minimal.

## Context

- **Brand & design system already exist.** The `studio-bluemli-design` Claude skill at `.claude/skills/studio-bluemli-design/` ships colors/type tokens (`colors_and_type.css`), product photography, a React UI kit for the website (landing + gallery + appointment + footer), Instagram templates, and poster templates. The site must consume these — not reinvent them.
- **Logo files** live at `assets/logo/` with full-palette, coral, indigo, and cream variants plus PNG sizes and a 180px iOS touch icon.
- **Brand non-negotiables** (from the design skill): cream background never white; never describe the earrings as flowers ("Bluemli" is a Swiss-German nickname, not a visual motif — the product is beaded clusters); fixed petal order on the mark; no center bead; no emoji except ♡/♥ in coral; no UI gradients, no frosted glass, no 1-px borders; hand-fonts for headlines, Nunito for UI.
- **Voice:** warm, casual, founder-first, sentence-case, friendly parentheticals, no emoji.
- **Domain studiobluemli.com is registered and on the founder's Cloudflare account** — DNS and certificate management already in place.
- **The founder is the only content editor.** Workflow needs to be approachable for a non-engineer comfortable editing a single file at a time.
- **Most traffic comes from Instagram on mobile** — phone-first layout is the default, desktop is secondary.

## Constraints

- **Hosting**: Cloudflare Workers with Static Assets — a single Worker serves the static bundle; `wrangler.jsonc`'s `assets.run_worker_first: ["/api/*"]` and `astro.config.mjs`'s `output: 'server'` are preserved per Phase 3 D-22 so a future `/api/*` endpoint can be added without re-architecting. (Initial plan was Cloudflare Pages; corrected because `@astrojs/cloudflare@13` — required by Astro 6 — dropped Pages support, and Cloudflare froze Pages investment in favor of Workers.)
- **Stack**: Astro — picked so the existing React JSX components from the design skill can be reused as-is, while shipping near-zero client JS.
- **Content storage**: Markdown + YAML files in the repo. No database. Structure must remain compatible with a future git-backed CMS.
- **Budget**: Free tier wherever possible. Cloudflare Workers free, Umami Cloud free, Resend/Mailchannels free, Turnstile free, GitHub repo.
- **Brand fidelity**: Must follow `studio-bluemli-design/SKILL.md` rules — cream background, no white; specific palette; specific fonts (with documented substitutions); product photography is the brand.
- **Privacy**: Cookieless analytics (Umami) so no EU consent banner is needed.
- **Performance**: Static-first, image-optimized; phone-first; target Lighthouse mobile ≥ 90 across the board.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Astro 6.2 on Cloudflare Workers + Static Assets | Static-first, renders the design skill's React JSX server-side, near-zero client JS. Pages was originally chosen but `@astrojs/cloudflare@13` (Astro 6) dropped Pages support — Workers with Static Assets is the active CF target. One Worker serves both static and `/api/contact`. | ✓ Validated in Phase 1 (Astro 6.3.1 + adapter 13.5 + Workers Builds shipping live preview; zero browser JS in `dist/client`) |
| Markdown/YAML in repo for gallery + pop-ups (not a CMS, not a database) | Zero infra, free, founder edits a single file per change, and the structure stays compatible with adding a git-backed CMS later with zero data migration | — Phase 2/3 |
| Contact form via Cloudflare Worker + Turnstile + email service (Resend or Mailchannels) | Keeps the site static while still letting visitors send a real message; spam protected; free-tier friendly | ✗ Dropped from v1 per Phase 3 D-18/D-19 — `/say-hi` ships as IG-DM-link + mailto only |
| Umami Cloud (hosted, free tier) for analytics | Privacy-first, no cookies, no consent banner, custom events possible if needed; can migrate to self-hosted later since Umami is OSS | — Phase 4 |
| No e-commerce in v1 | Sales happen at pop-ups and via DM; checkout infrastructure is a separate product the founder hasn't asked for | ✓ Validated (no checkout infra in any phase plan) |
| Reuse `studio-bluemli-design` skill components and tokens | The brand system already exists and is intentional; reinventing it risks drift | ✓ Validated in Phase 1 (11 components synced, brand-rule grep in CI as required status check) |
| Self-host fonts via Fontsource instead of `fontProviders.google()` | Astro's Google provider preserves Google's per-Unicode-range `@font-face` CSS, which for Korean-primary fonts like Bagel Fat One inflates the inline `<style>` block enough to fail Lighthouse mobile Performance. Fontsource ships pre-subsetted Latin WOFF2s. | ✓ Validated in Phase 1 (Performance 0.76→0.99 across all 5 routes; 95→14 `@font-face` declarations) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-14 — Phase 2 (Content Schema & Gallery) complete. `/gallery` index + per-piece detail pages live with six seeded pieces; HEIC→WebP prebuild pipeline + Zod-strict schema + `CONTENT_EDITING.md` shipped. End-to-end founder PR-preview dry-run deferred to first real piece. Up next: Phase 3 (page composition & pop-ups).*
