# Studio Bluemli Website

## What This Is

A small static marketing website for Studio Bluemli — a jewelry studio in NoPa, San Francisco that hand-assembles whimsical, bright, beaded-cluster earrings. The site is a portfolio + storefront-less brand presence at studiobluemli.com: visitors browse the gallery, see where the next pop-up is happening, learn the founder story, and reach out to inquire about pieces. No online checkout — sales happen at pop-ups and via direct conversation.

## Core Value

The product photography and brand voice come through cleanly on a cream-paper page, and the founder can add or remove gallery pieces and pop-up events without writing code or paying a CMS.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Landing page with hero (logo, tagline, founder photo or product hero), 3–6 featured gallery pieces, a callout for the next pop-up, and footer links
- [ ] Gallery page listing all pieces, each with photo(s), name, price, availability status (available / sold / one-of-one), and a short 1–2 sentence description
- [ ] Pop-ups page showing upcoming events prominently (date, location, time) and a smaller archive of past events
- [ ] About page (founder story, studio, process — content TBD with founder)
- [ ] Say Hi page with a contact form that emails the founder, plus visible Instagram link
- [ ] Gallery entries managed via markdown files in `/content/gallery/` — adding/removing a piece is a single file change
- [ ] Pop-up events managed via a YAML file (or per-event markdown) in `/content`, with past/upcoming split derived from date
- [ ] Site builds as static assets and deploys to Cloudflare Pages on every push to `main`
- [ ] Live at apex `studiobluemli.com` (and `www.` redirects to apex) via the existing Cloudflare account
- [ ] Reuses the `studio-bluemli-design` skill's React components, color/type tokens, and product photography conventions; cream background, never white
- [ ] Logo (`mark.svg`) renders in header and as favicon, with mark-color variants used contextually
- [ ] Mobile-first responsive layout — most visitors arrive from Instagram on phones
- [ ] Umami Cloud analytics installed (free tier, single script tag, no consent banner needed)
- [ ] Contact form is spam-protected (Cloudflare Turnstile) and delivers reliably to the founder's inbox

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

## Context

- **Brand & design system already exist.** The `studio-bluemli-design` Claude skill at `.claude/skills/studio-bluemli-design/` ships colors/type tokens (`colors_and_type.css`), product photography, a React UI kit for the website (landing + gallery + appointment + footer), Instagram templates, and poster templates. The site must consume these — not reinvent them.
- **Logo files** live at `assets/logo/` with full-palette, coral, indigo, and cream variants plus PNG sizes and a 180px iOS touch icon.
- **Brand non-negotiables** (from the design skill): cream background never white; never describe the earrings as flowers ("Bluemli" is a Swiss-German nickname, not a visual motif — the product is beaded clusters); fixed petal order on the mark; no center bead; no emoji except ♡/♥ in coral; no UI gradients, no frosted glass, no 1-px borders; hand-fonts for headlines, Nunito for UI.
- **Voice:** warm, casual, founder-first, sentence-case, friendly parentheticals, no emoji.
- **Domain studiobluemli.com is registered and on the founder's Cloudflare account** — DNS and certificate management already in place.
- **The founder is the only content editor.** Workflow needs to be approachable for a non-engineer comfortable editing a single file at a time.
- **Most traffic comes from Instagram on mobile** — phone-first layout is the default, desktop is secondary.

## Constraints

- **Hosting**: Cloudflare Pages — site must build to static assets and deploy via Cloudflare's git integration. Cloudflare Workers used only for the contact form endpoint.
- **Stack**: Astro — picked so the existing React JSX components from the design skill can be reused as-is, while shipping near-zero client JS.
- **Content storage**: Markdown + YAML files in the repo. No database. Structure must remain compatible with a future git-backed CMS.
- **Budget**: Free tier wherever possible. Cloudflare Pages free, Umami Cloud free, Resend/Mailchannels free, Turnstile free, GitHub repo.
- **Brand fidelity**: Must follow `studio-bluemli-design/SKILL.md` rules — cream background, no white; specific palette; specific fonts (with documented substitutions); product photography is the brand.
- **Privacy**: Cookieless analytics (Umami) so no EU consent banner is needed.
- **Performance**: Static-first, image-optimized; phone-first; target Lighthouse mobile ≥ 90 across the board.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Astro on Cloudflare Pages | Static-first, can render the existing React JSX components from the design skill, near-zero client JS, deploys cleanly to CF Pages | — Pending |
| Markdown/YAML in repo for gallery + pop-ups (not a CMS, not a database) | Zero infra, free, founder edits a single file per change, and the structure stays compatible with adding a git-backed CMS later with zero data migration | — Pending |
| Contact form via Cloudflare Worker + Turnstile + email service (Resend or Mailchannels) | Keeps the site static while still letting visitors send a real message; spam protected; free-tier friendly | — Pending |
| Umami Cloud (hosted, free tier) for analytics | Privacy-first, no cookies, no consent banner, custom events possible if needed; can migrate to self-hosted later since Umami is OSS | — Pending |
| No e-commerce in v1 | Sales happen at pop-ups and via DM; checkout infrastructure is a separate product the founder hasn't asked for | — Pending |
| Reuse `studio-bluemli-design` skill components and tokens | The brand system already exists and is intentional; reinventing it risks drift | — Pending |

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
*Last updated: 2026-05-12 after initialization*
