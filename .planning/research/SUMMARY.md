# Project Research Summary

**Project:** Studio Bluemli Website (studiobluemli.com)
**Domain:** Small static portfolio + brand-presence site for a one-person NoPa, SF jewelry studio. No e-commerce; sales happen at pop-ups and via Instagram DM. Five pages: landing / gallery / pop-ups / about / say-hi.
**Researched:** 2026-05-12
**Confidence:** HIGH — every stack version, deliverability fact, and architectural decision was verified against current (Mar–May 2026) official docs.

---

## TL;DR

- **Astro 6.2 + React 19 (SSR-only, no hydration)** on **Cloudflare Workers + Static Assets** — **not** Cloudflare Pages. The `@astrojs/cloudflare` v13 adapter required by Astro 6 has officially dropped Pages support, and Cloudflare's own messaging is "start with Workers." This is the single most important correction to `PROJECT.md`; the hosting wording needs to be updated at Phase 1 kickoff to "Cloudflare Workers with Static Assets."
- **Five prerendered pages + one Worker route (`/api/contact`)** in the *same* Worker via `wrangler.toml`'s `assets.run_worker_first: ["/api/*"]`. One deploy, one origin, no CORS, no separate Pages-Functions vs Worker split.
- **Content lives as markdown** under `src/content/gallery/<slug>/` (per-piece folder, co-located photos) and `src/content/popups/YYYY-MM-DD-<slug>.md`, validated by **strict** Zod schemas via Astro Content Collections v2. Per-slug folders kill the rename/orphan-image risk and align with the `image()` schema helper. CMS-compatible (Decap / Sveltia / Pages CMS) with zero migration when the founder wants a GUI.
- **Contact form** uses **Resend** (3k/mo, 100/day free; verified-domain SPF+DKIM+DMARC required) gated by server-side **Turnstile** siteverify, plus honeypot + KV-backed IP rate limit. MailChannels is OUT — free Cloudflare-Workers integration ended **2024-08-31**.
- **The brand is the constraint.** Cream backgrounds (never white), never call the earrings "flowers," product photography is the brand, hand-fonts for headlines, Nunito for UI, no UI gradients / frosted glass / 1-px borders, no emoji except ♡/♥ coral. Encode these as CI grep checks in Phase 1.

---

## Executive Summary

Studio Bluemli is a 5-page editorial portfolio site — closer in spirit to a fine-art-print maker's site than to an Etsy shop. The product photography on cream IS the brand; everything else (founder voice, gallery grid, pop-up calendar, contact form) hangs off that single editorial commitment. The right way to build it is the simplest possible Astro static build: every page prerenders, almost zero client JS ships, and a single Worker handles the only dynamic surface (the contact form). The brand non-negotiables are encoded as CI grep rules so they cannot regress.

The biggest correction to `PROJECT.md` is the hosting target. Cloudflare Pages was the original decision, but `@astrojs/cloudflare` v13 (which Astro 6 requires) explicitly no longer supports Pages, and Cloudflare itself has frozen Pages investment in favor of **Workers + Static Assets**. The functional shape stays nearly identical (git push → preview deploy → production deploy, secrets in dashboard, custom domain) but the deploy artifact is one Worker that serves both the static bundle (free, uncapped) and the `/api/contact` POST. This collapses the old "Pages + separate contact Worker" plan into one moving part, eliminates CORS, and is where Cloudflare is investing its roadmap. The architecture research's `functions/api/contact.ts` shape needs to be translated to the Worker-equivalent (`src/pages/api/contact.ts` with `export const prerender = false`).

The dominant risks are deliverability, brand drift, and content-workflow friction — *not* anything technical. Resend domain auth (SPF/DKIM/DMARC) must be green before the form ships or every submission silently lands in spam. White surfaces leak in via component-library defaults and have to be aggressively asserted from the cream token at the root. The founder is a non-engineer; the editing workflow has to be GitHub web UI (drag-drop image, edit frontmatter, preview deploy per PR) — never a command-line story. Get those three right and v1 ships in five coarse phases.

## Key Findings

### Recommended Stack

Stack research (see [STACK.md](./STACK.md)) confirms Astro 6.2 as the only mainstream framework that renders the design skill's React JSX server-side as static HTML by default with no hydration. Everything else flows from that decision: `@astrojs/react@5.0.4` for JSX rendering, `@astrojs/cloudflare@13.5` for Workers + Static Assets, vanilla CSS + scoped Astro styles (the design skill already ships tokens; Tailwind would be a second source of truth), Astro Fonts API for Nunito + self-hosted hand-display fonts.

**Core technologies (pinned):**

| Package | Version | Why |
|---------|---------|-----|
| `astro` | `^6.2.0` (released 2026-04-30) | Static-first, JSX SSR, stable Fonts API |
| `@astrojs/cloudflare` | `^13.5.0` | Required for Astro 6. **Targets Workers + Static Assets only — Pages support dropped.** |
| `@astrojs/react` | `^5.0.4` | Renders the design skill's `.jsx`; requires Node 22.12+, React 19 |
| `react` / `react-dom` | `^19` | Peer of `@astrojs/react@5`. Never hydrated. |
| `resend` | latest | Outbound email. Free: 3k/mo, 100/day. Workers-friendly. |
| `wrangler` | `^4` | Local dev, deploy, secret management |
| `zod` | `^4` (bundled by Astro 6) | Strict frontmatter schemas via `astro:content` |
| Node | `22.12+` | Required by `@astrojs/react@5` |

**Supporting:** `astro/loaders` `glob()`/`file()` (built-in); `passthroughImageService()` because Sharp doesn't run in `workerd` (pre-optimize WebPs at commit time, NOT at runtime); Umami Cloud `<script>` with `data-website-id` + `data-domains`; Cloudflare Turnstile (free, unlimited).

**Hard "do not use":**
- Cloudflare Pages (legacy product — adapter rejects it, Cloudflare deprioritized it)
- Pages Functions (`functions/api/contact.ts` style) — replaced by `run_worker_first: ["/api/*"]`
- **MailChannels** — free Workers tier ended 2024-08-31; any older tutorial silently fails
- **Cloudflare Email Service** (`send_email` binding) — can only deliver to addresses verified inside CF Email Routing; useless for emailing the founder's Gmail
- Sharp at build time (rejected by the adapter)
- Tailwind / shadcn / MUI / Chakra — second source of truth for color tokens; white leaks
- Next.js (wrong shape; React-everywhere model fights us)
- A database (D1/KV) for content (files-in-repo is the explicit PROJECT.md decision)
- Plausible / Google Analytics (cost or cookie banner)
- `client:load` directive on the JSX components — server-render only

### Expected Features

Feature research (see [FEATURES.md](./FEATURES.md)) confirms the product is a portfolio-not-shop in the lineage of Naomi Clement, Amano, Page Sargisson, Kinn.

**Must have — table stakes (P1):**
- Mobile-first responsive across 5 pages
- Static-first fast first paint (Lighthouse mobile ≥ 90)
- Persistent IG link in header AND footer
- Contact form with Turnstile + working delivery + visible IG/mailto fallback
- Favicon set (incl. 180×180 iOS touch icon — already present in `assets/logo/`)
- Per-page OG + Twitter card meta
- `robots.txt` + `sitemap.xml` (via `@astrojs/sitemap`)
- Alt text on every product photo (no "flower" language)
- Skip-to-content link + `:focus-visible` styles + `color-scheme: light`
- Umami Cloud (cookieless)
- Next-pop-up callout on landing (with graceful empty state)
- Gallery grid + per-piece detail page (`/gallery/<slug>`)
- Availability badges: `available` / `one-of-one` / `sold` (enum, not free text)
- Past pop-up archive (compact, below upcoming)
- Founder photo + first-person About + hand-font signature close

**Should have — editorial lift (P2):**
- Per-piece "inquire" → IG DM deep-link (`https://ig.me/m/studiobluemli`) — primary
- Quiet 200ms cross-fade hover on gallery cards; `prefers-reduced-motion` honored
- Reply-to set to visitor on form submit
- Inline submit confirmation (no redirect away)
- Process / studio-life photos on About (asset-dependent — defer if not shot)
- Per-piece OG image (manual, one product photo per slug)

**Defer — v1.x or v2+:** per-piece OG generator (satori), `?piece=<slug>` pre-fill, `.ics` calendar, press section (gated on real press), lightbox, journal, newsletter, filter/search, CMS UI, e-commerce.

**Anti-features — actively reject:** newsletter pop-up modal, exit-intent, cookie consent banner (cookieless analytics chosen), hero video autoplay, live chat widget, parallax/scroll-jacking, "Buy Now" CTAs (no cart), testimonial carousel, empty/placeholder logo wall, fake "Featured in: NYT" claims, pressed-flower decorative imagery, multi-step contact form, loading spinner.

### Architecture Approach

Architecture research (see [ARCHITECTURE.md](./ARCHITECTURE.md)) lays out the correct shape with **one correction**: it was written assuming Cloudflare Pages + `functions/api/contact.ts`. The Workers + Static Assets equivalent is one Worker entry point (Astro emits this automatically) that serves the static bundle AND a `src/pages/api/contact.ts` server endpoint via `wrangler.toml`'s `assets.run_worker_first: ["/api/*"]`. The conceptual architecture (build-time static compilation, one dynamic endpoint, design skill as a sibling copied-not-imported) stands unchanged.

**Major components:**

1. **`src/pages/`** — five flat `.astro` files plus `gallery/[slug].astro` for per-piece detail pages and `api/contact.ts` (the one server endpoint, `export const prerender = false`).
2. **`src/layouts/BaseLayout.astro`** — shared `<head>` (meta, OG, Umami script, fonts), header, footer; imports `tokens.css` and `global.css`.
3. **`src/components/`** — design-skill JSX copied via `scripts/sync-design-skill.mjs`, wrapped by site-specific `.astro` components. **No `client:` directive — all server-rendered.**
4. **`src/content/`** — founder's editable surface. **Per-slug folder pattern:** `src/content/gallery/<slug>/index.md` + `hero.jpg` co-located. Pop-ups: one MD per event `popups/YYYY-MM-DD-<slug>.md`. Site singleton at `site/config.md`.
5. **`src/content.config.ts`** — strict Zod schemas (`.strict()`) using `image()` helper for typed image references. Enums for `status: 'available' | 'sold' | 'one-of-one' | 'reserved'`.
6. **Single Worker entry** — Astro's Cloudflare adapter emits `dist/_worker.js`. `wrangler.toml` binds `dist/` and routes `/api/*` to the Worker first. Secrets via `wrangler secret put`.
7. **`public/`** — favicon, `mark.svg`, `apple-touch-icon.png` (180×180), `robots.txt`, fonts. NEVER product photography.

**Recommended final directory tree:**

```
studiobluemli/
├── .claude/skills/studio-bluemli-design/   # canonical brand source (copy-from, never import)
├── .planning/                              # GSD planning artifacts (not deployed)
├── public/
│   ├── logo/                               # mark.svg + variants
│   ├── fonts/                              # self-hosted hand-display WOFF2
│   ├── favicon.svg, apple-touch-icon.png
│   ├── robots.txt
│   └── og-default.jpg                      # 1200x630 site-level OG image
├── src/
│   ├── pages/
│   │   ├── index.astro, gallery.astro, popups.astro, about.astro, say-hi.astro
│   │   ├── gallery/[slug].astro            # per-piece detail page
│   │   └── api/contact.ts                  # the one dynamic endpoint (prerender = false)
│   ├── layouts/BaseLayout.astro
│   ├── components/
│   │   ├── Header.astro, Footer.astro, SEO.astro
│   │   ├── GalleryGrid.astro, GalleryCard.astro, PopupCard.astro, PopupList.astro
│   │   ├── ContactForm.astro
│   │   └── design-skill/                   # near-verbatim JSX copies (write-protected by convention)
│   ├── content/
│   │   ├── gallery/<slug>/index.md + photos co-located
│   │   ├── popups/YYYY-MM-DD-<slug>.md
│   │   └── site/config.md
│   ├── content.config.ts                   # strict Zod schemas
│   ├── lib/popups.ts, validation.ts        # timezone math + shared form schema
│   └── styles/tokens.css, global.css
├── scripts/sync-design-skill.mjs           # one-shot skill → src/ copy
├── astro.config.mjs                        # adapter: cloudflare({ imageService: "passthrough" })
├── wrangler.toml                           # assets binding + run_worker_first: ["/api/*"]
├── .nvmrc                                  # 22.12+
└── package.json
```

**Key corrections vs ARCHITECTURE.md:**
- Replace `functions/api/contact.ts` with `src/pages/api/contact.ts` (`export const prerender = false`)
- Replace "Pages Functions" with "single Worker + `run_worker_first: ["/api/*"]`"
- `wrangler.toml` shape: `assets.directory = "./dist"`, `assets.binding = "ASSETS"`, `assets.run_worker_first = ["/api/*"]`, `main = "./dist/_worker.js/index.js"`
- Secrets via `wrangler secret put RESEND_API_KEY` / `TURNSTILE_SECRET`, NOT `wrangler.toml [vars]`
- Co-locate gallery images per-slug (`src/content/gallery/<slug>/`) instead of a shared `src/assets/product/` — kills rename/orphan risk (resolves cross-doc conflict; PITFALLS pattern wins)

### Critical Pitfalls (Top 10 by leverage)

Pitfalls research (see [PITFALLS.md](./PITFALLS.md)) enumerates 23; the highest-leverage ones:

| # | Pitfall | Prevention |
|---|---------|------------|
| 1 | **MailChannels-from-Workers tutorial copy-paste** (free tier ended 2024-08-31, silent fail) | Use **Resend** only; smoke-test delivery to founder inbox before launch. |
| 2 | **Missing SPF / DKIM / DMARC on `studiobluemli.com`** → mail in spam | Run Resend's domain verification end-to-end *before* writing form code; confirm green checks; test to Gmail AND iCloud. |
| 3 | **Skipping server-side Turnstile siteverify** → bots flood inbox | Worker's first action: POST to `challenges.cloudflare.com/turnstile/v0/siteverify` with `{secret, response, remoteip}`; reject if `success !== true`. |
| 4 | **White backgrounds leak from defaults** (brand non-negotiable: cream, never white) | Import `tokens.css` first; `body { background: var(--bluemli-cream); }`; CI grep blocks `bg-white\|#fff\|background: white`; do NOT install shadcn/MUI/Chakra. |
| 5 | **"Flower" / "petal" / "floral" copy** (brand non-negotiable: etymology, not motif) | CI grep on `/flower\|petal\|floral\|bloom\|blossom/i` across `content/`+`src/` — fail build on hit. |
| 6 | **Sold pieces deleted instead of marked sold** | Schema enum; render sold visibly with badge; document "never delete, flip availability" in `CONTENT_EDITING.md`. |
| 7 | **Pop-up timezone bugs** (UTC vs America/Los_Angeles) | Store `date` + `start_time` + `tz: "America/Los_Angeles"`; compute cutoff in studio timezone; daily cron rebuild at 3 AM PT. |
| 8 | **Raw iPhone photos in `public/` → 4MB LCP** | Co-locate per-slug `src/content/gallery/<slug>/hero.jpg`; reference via `image()` helper; pre-optimize WebP at commit. |
| 9 | **Secrets in `wrangler.toml` / `.env`** | `wrangler secret put` only; `.dev.vars` for local; gitignore `.env`, `.dev.vars`, `.wrangler/`; separate Resend keys per env. |
| 10 | **Founder workflow requires CLI** | Document GitHub web UI flow with screenshots in `CONTENT_EDITING.md`; PRs trigger preview deploys; never document `npm`/`git`/`cd` for content tasks. |

**Honorable mentions (cover in their phase):** Zod schemas not `.strict()`; `client:load` everywhere; FOIT on hand-display fonts; missing per-page `og:image`; WWW vs apex split; no JS-disabled `mailto:` fallback; missing `reply_to` header; coral-on-cream contrast; Umami domain unregistered.

## Implications for Roadmap

Granularity per `.planning/config.json`: **coarse** → 5 phases. Dependency graph (design system → content → pages → form → launch) is naturally 5. Each phase is one coherent vertical slice the founder can preview.

### Phase 1: Foundations & Brand System

**Rationale:** Nothing else can render correctly without cream backgrounds, hand-fonts, and design-skill components in place. Encoding brand non-negotiables as CI rules here (Pitfalls #4, #5) means they cannot regress. Hosting correction (Pages → Workers + Static Assets) happens on day one to avoid carrying the wrong assumption.

**Delivers:** Scaffolded Astro 6.2 + React 19 + `@astrojs/cloudflare@13.5`; `wrangler.toml` with `assets` + `run_worker_first: ["/api/*"]`; first dummy deploy to Workers; `BaseLayout.astro` with header/footer, `tokens.css`, self-hosted hand-display WOFF2 with `font-display: swap`; favicon set wired (180×180 already in `assets/logo/`); `scripts/sync-design-skill.mjs`; design-skill JSX copied into `src/components/design-skill/`; CI grep rules for forbidden words/styles; lowercase-only filenames check; `astro.config.mjs` sets `site: 'https://studiobluemli.com'`, `imageService: 'passthrough'`. **Update `PROJECT.md`'s Hosting constraint to "Cloudflare Workers with Static Assets."**

**Addresses features:** mobile-first responsive shell, favicon set, `color-scheme: light`, skip-to-content + `:focus-visible`, `apple-touch-icon`.
**Avoids pitfalls:** #4, #5, #10 (FOIT), #13 (casing), #16 (contrast), #17.
**Key risks:** Pages → Workers swap during scaffold; design-skill JSX components possibly importing across `.claude/skills/` boundary in ways that need rewiring at copy.

### Phase 2: Content Schema & Gallery

**Rationale:** Content collections are the foundation every other page depends on. Schemas drive workflows — defining them later means migrating every existing file. The "co-locate images per-slug" pattern resolves the architecture-vs-pitfalls conflict and must be baked in now.

**Delivers:** `src/content.config.ts` with `gallery`, `popups`, `site` — all `.strict()`, all using `image()` helper, `availability` as enum. Per-slug folder layout: `src/content/gallery/<slug>/index.md` + `hero.jpg` co-located. 2–3 real gallery entries. 1–2 real pop-up entries. Gallery index (2-col mobile / 3-col desktop). Per-piece detail page (`/gallery/[slug].astro`) with availability badge and "inquire about this piece" IG DM deep-link. `CONTENT_EDITING.md` with GitHub web UI screenshots and "never delete, flip availability" section.

**Uses stack:** Astro Content Collections v2, Zod 4, `astro:assets` with `passthroughImageService()`.
**Addresses features:** gallery grid + per-piece detail page, availability badges, "inquire" IG DM, alt-text, founder workflow.
**Avoids pitfalls:** #6, #8, #11 (strict schemas), #12 (co-location), #23 (founder workflow).
**Key risks:** schema design is one-shot; image co-location must be enforced via schema.

### Phase 3: Page Composition & Pop-ups

**Rationale:** With content typed and the design system in place, the five pages compose cleanly. Pop-ups need careful timezone math (Pitfall #7) — the most error-prone bit of logic on the site. Landing-page composition is where all prior phases prove out.

**Delivers:** `index.astro` (hero + next-pop-up callout + `featured: true` gallery + footer); `popups.astro` (upcoming large, past compact, both built-time-filtered in studio timezone); `about.astro` (founder photo, first-person, optional process photos, hand-font signature close); shared `SEO.astro` emitting per-page `<title>`, `og:*`, `twitter:card`; `@astrojs/sitemap` installed; `robots.txt`; canonical links pointing to apex. `src/lib/popups.ts` with timezone-correct cutoff. Empty states ("no pop-ups on the calendar right now — DM me on Instagram"). Quiet hover transitions.

**Uses stack:** Astro `getCollection()`, build-time filtering, `@astrojs/sitemap`.
**Addresses features:** next-pop-up callout + empty state, past archive, first-person About + signature, per-page OG, sitemap + robots.txt.
**Avoids pitfalls:** #7, no `client:` needed, missing `og:image`.
**Key risks:** timezone logic is subtle (open question: cron-trigger rebuild?); founder portrait availability (open question).

### Phase 4: Contact Form & Deliverability

**Rationale:** Riskiest phase — deliverability depends on DNS propagation and a working domain auth chain. Kick off DNS records *first* (propagation takes minutes-to-hours) while Worker code is written. Server-side Turnstile + Resend + honeypot + KV rate-limit must land together.

**Delivers:** `src/pages/api/contact.ts` with `export const prerender = false`; server-side Turnstile siteverify as first action; Resend `emails.send` with `from: hello@studiobluemli.com`, `to: <founder>`, `reply_to: <visitor>`, plain-text body; honeypot field (CSS-hidden `name="website"`); KV-backed IP rate limit (1/min, 10/hour); `say-hi.astro` form with progressive enhancement (real `<form method="POST" action="/api/contact">` works without JS), visible `mailto:` AND IG link as fallbacks; inline confirmation. Resend domain verified (SPF, DKIM, DMARC green); end-to-end test to Gmail AND iCloud (must NOT land in spam); secrets via `wrangler secret put`.

**Uses stack:** Resend npm, Cloudflare KV namespace binding (free tier), Cloudflare Turnstile.
**Addresses features:** working contact path with response-time expectation, IG second route, reply-to correct, inline confirmation.
**Avoids pitfalls:** #1, #2, #3, #9 (secrets), #20 (mailto fallback), #21 (reply-to), #22 (rate limit).
**Key risks:** DKIM CNAMEs sometimes need bare subdomain (not FQDN) on Cloudflare — easy to get wrong; preview deploys should use a separate Resend key so spam tests don't burn production quota.

### Phase 5: Analytics, Polish & Launch

**Rationale:** Everything observable from outside (analytics events, DNS cutover, OG validation, Lighthouse) lands together. This phase converts "works on preview" into "works at studiobluemli.com" — the DNS step can't be undone quietly, so the launch checklist matters.

**Delivers:** Umami Cloud script in `BaseLayout` `<head>` with `data-website-id` and `data-domains="studiobluemli.com"`; domain registered in Umami's website list; `data-umami-event` attributes on gallery cards; `_headers` (security + cache) and `_redirects` (www → apex via Cloudflare Rules → Redirect Rules — 301 to apex); Lighthouse mobile audit ≥ 90 on all 5 pages; Facebook Sharing Debugger test on home + gallery piece + pop-up; final founder About copy locked in; DNS cutover; "Looks Done But Isn't" checklist walked.

**Addresses features:** cookieless analytics with no consent banner, HTTPS + apex redirect, Lighthouse mobile ≥ 90, OG preview validation.
**Avoids pitfalls:** WWW vs apex split; Umami domain unregistered; entire "Looks Done But Isn't" checklist.
**Key risks:** founder may want DNS cutover delayed for About copy — sequence cutover last; if Umami events don't appear within 5 minutes of cutover, the domain-registration step was missed.

### Phase Ordering Rationale

- **Dependency-driven.** Each phase's outputs are the next phase's inputs.
- **Risk-front-loaded.** Phases 1 (hosting correction + brand CI rules) and 4 (deliverability) are riskiest. Phase 1 informs every wrangler.toml / `prerender` decision downstream; Phase 4 (after content+pages, before launch) gives DNS propagation buffer.
- **Coarse-friendly.** Each phase is one vertical slice with a shareable preview deploy.

### Research Flags

**Likely need `/gsd-research-phase` during planning:**
- **Phase 1:** Worker + Static Assets `wrangler.toml` shape for Astro 6 is new enough that online templates still reference Pages — verify against current docs at planning.
- **Phase 4:** Resend domain verification + Cloudflare DNS UI subtleties (bare subdomain vs FQDN on TXT/CNAME) is the single thing most likely to cost half a day. Short pre-flight checklist as part of phase planning.
- **Phase 3 (lighter):** Timezone math — Temporal API polyfill vs `@date-fns/tz`; decide cron-trigger rebuild.

**Standard patterns, skip research:**
- **Phase 2** — Astro Content Collections v2 is well-documented; all key choices already baked into SUMMARY.
- **Phase 5** — DNS cutover and Umami install are mechanical.

## Open Questions for the Founder

Roadmapper should flag these so they aren't guessed.

1. **Founder photo** — good in-studio portrait already shot, or to be shot? (Phase 3.)
2. **Process / studio-life photos** — have 1–3 already? If not, defer rather than fake. (Phase 3.)
3. **Press / "as carried at" mentions** — any real ones? If none, ship About without a press section (NEVER show empty placeholders). (Phase 3.)
4. **Primary contact CTA** — IG DM deep-link (recommended) or contact form? (Phase 2.)
5. **Cron-trigger daily rebuild** for pop-up freshness — yes (cleanest) or no (founder rebuilds manually)? (Phase 3.)
6. **Favicon completeness** — does `assets/logo/` already contain `favicon.ico` and `favicon.svg` in addition to the 180×180 PNG? (Phase 1.)
7. **`From` address for outbound mail** — `hello@studiobluemli.com`? `hi@`? Other? (Phase 4.)
8. **Founder inbox destination** — where should contact-form mail land? (Phase 4; `RESEND_TO` secret.)
9. **Sender display name** — "Studio Bluemli", "Studio Bluemli (no-reply)", or founder's first name? (Phase 4.)
10. **GitHub web UI walkthrough** — schedule a 30-min screen-share with founder? (Phase 2 or 5.)

## Decisions Locked

Consolidated across STACK, FEATURES, ARCHITECTURE, PITFALLS. ⚠ marks supersedes PROJECT.md.

| Decision | Locked Choice | Source(s) | PROJECT.md status |
|----------|----------------|-----------|-------------------|
| Hosting target | **Cloudflare Workers + Static Assets** (one Worker serves static + `/api/*`) | STACK §Critical Finding; ARCHITECTURE (translated) | ⚠ Supersedes "Cloudflare Pages" — update at Phase 1 kickoff |
| Framework | **Astro 6.2** | STACK | matches |
| JSX integration | **`@astrojs/react@5.0.4` + React 19, server-rendered (no `client:`)** | STACK | refines |
| Cloudflare adapter | **`@astrojs/cloudflare@13.5` with `imageService: 'passthrough'`** | STACK | refines |
| Routing for `/api/*` | **`wrangler.toml` `assets.run_worker_first: ["/api/*"]`** | STACK | refines |
| Email provider | **Resend** (3k/mo, 100/day free; SPF+DKIM+DMARC required) | STACK; PITFALLS #1 | ⚠ Refines "Resend or Mailchannels" — Mailchannels free tier ended 2024-08-31 |
| Spam protection | **Cloudflare Turnstile, server-side verified + honeypot + KV rate limit** | STACK; PITFALLS #3 | refines |
| Image strategy | **Pre-optimize WebP at commit; `passthroughImageService()` (Sharp doesn't run in `workerd`)** | STACK; PITFALLS #8 | refines |
| Gallery content layout | **Per-slug folders** `src/content/gallery/<slug>/index.md` + co-located `hero.jpg` | PITFALLS; ARCHITECTURE (revised) | ⚠ Supersedes ARCHITECTURE's `src/assets/product/` — resolves cross-doc conflict |
| Pop-ups content layout | **One markdown per event** `src/content/popups/YYYY-MM-DD-<slug>.md` | ARCHITECTURE | refines (PROJECT.md mentioned YAML) |
| Schema validation | **Zod 4 `.strict()` + `image()` helper + `z.enum()` for state** | PITFALLS | new |
| Availability states | **`available \| sold \| one-of-one \| reserved`** (enum) | FEATURES; PITFALLS #6 | refines |
| Sold pieces | **Visible with "sold" badge, never deleted** | PITFALLS #6 | new |
| Past/upcoming split | **Build-time, computed in `America/Los_Angeles`**, optional daily cron rebuild | PITFALLS #7 | new |
| Styling | **Vanilla CSS + scoped Astro `<style>`; copy of `colors_and_type.css` as tokens** (no Tailwind, no UI lib) | STACK; PITFALLS #4 | refines |
| Fonts | **Astro Fonts API for Nunito; self-hosted hand-display WOFF2 + `font-display: swap`** | STACK; PITFALLS | refines |
| Analytics | **Umami Cloud, cookieless, domain registered in Umami settings** | STACK; PITFALLS | matches |
| Per-piece "inquire" CTA | **IG DM deep-link `https://ig.me/m/studiobluemli` (primary)** | FEATURES | new |
| Founder editing workflow | **GitHub web UI** + `CONTENT_EDITING.md` with screenshots | PITFALLS #10 | new |
| Design-skill integration | **Copy via `scripts/sync-design-skill.mjs`** into `src/components/design-skill/` (never import across `.claude/skills/` boundary) | ARCHITECTURE | new |
| Secrets management | **`wrangler secret put` only; `.dev.vars` for local; never in `wrangler.toml`/`.env`** | PITFALLS #9 | new |
| Canonical domain | **Apex `studiobluemli.com`; `www.` 301 → apex via Cloudflare Rules** | PITFALLS | matches |
| Brand CI rules | **Grep checks for `flower\|petal\|floral\|bloom` and `bg-white\|#fff\|#ffffff` fail the build** | PITFALLS #4, #5 | new |
| Case sensitivity | **All-lowercase route filenames enforced via CI** | PITFALLS | new |
| Package manager | **pnpm** (with note: if founder runs `install`, switch to npm) | STACK | new |

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Every version and platform fact verified against official docs (Astro blog 6.0+6.2, `@astrojs/cloudflare` integration page, Cloudflare migration guide, Resend pricing, Turnstile, Umami). The Pages → Workers finding verified against two independent official sources. |
| Features | **HIGH** | Table stakes uncontroversial. Differentiators grounded in comparable studios (Naomi Clement, Amano, Page Sargisson, Kinn, San José Made). Anti-features backed by NN/g pop-up research. |
| Architecture | **HIGH** (after Pages → Workers correction applied) | Astro structure, content collections, Zod via Context7. Per-slug image co-location resolves cross-doc conflict cleanly. |
| Pitfalls | **HIGH** | MailChannels EOL confirmed at source. DNS auth from Resend docs. Brand non-negotiables read from PROJECT.md. Turnstile + Worker security from Cloudflare docs. |

**Overall confidence: HIGH.**

### Gaps to Address During Planning/Execution

- **Founder asset availability** (founder photo, process photos, real press) — Open Questions #1–#3.
- **Daily-rebuild decision for pop-up freshness** — open question.
- **`prettier-plugin-astro` v0.14.x might be behind Astro 6** — STACK notes MEDIUM confidence; verify and upgrade if newer exists at Phase 1.
- **Image pre-optimization tool choice** (squoosh-cli vs sharp-cli at commit) — lock the exact tool in Phase 2 and document in `CONTENT_EDITING.md`.
- **Founder inbox + From address** (Open Questions #7, #8, #9) — blocks Phase 4 Resend domain verification.

## Sources

### Primary (HIGH confidence)
- Astro 6.0 / 6.2 release notes — https://astro.build/blog/astro-6/ ; https://astro.build/blog/astro-620/
- `@astrojs/cloudflare` — https://docs.astro.build/en/guides/integrations-guide/cloudflare/ (Pages no longer supported)
- Cloudflare Workers static-assets binding — https://developers.cloudflare.com/workers/static-assets/binding/
- Cloudflare Pages → Workers migration — https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/
- Cloudflare full-stack announcement — https://blog.cloudflare.com/full-stack-development-on-cloudflare-workers/
- Astro Content Collections — https://docs.astro.build/en/guides/content-collections/
- Astro Images — https://docs.astro.build/en/guides/images/
- Cloudflare Turnstile siteverify — https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Resend pricing + Workers tutorial — https://resend.com/pricing ; https://resend.com/docs/send-with-cloudflare-workers
- MailChannels EOL notice — https://blog.mailchannels.com/important-update-mailchannels-email-sending-api-for-cloudflare-workers-to-be-terminated/
- Umami tracker configuration — https://docs.umami.is/docs/tracker-configuration

### Secondary (MEDIUM confidence)
- Comparable studios (Naomi Clement, Amano, Page Sargisson, Kinn, San José Made, Minneapolis Craft Market) — see FEATURES.md
- NN/g pop-up research — https://www.nngroup.com/articles/popups/
- Decap / Sveltia / Pages CMS / TinaCMS integration docs — see ARCHITECTURE.md
- `prettier-plugin-astro` (mature but slow-moving — verify at Phase 1)

### Internal (HIGH for project context)
- `.planning/PROJECT.md` — scope, decisions, brand non-negotiables, founder context
- `.planning/research/STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md` — full research detail

---
*Research completed: 2026-05-12*
*Ready for roadmap: yes (coarse granularity, 5 phases)*
