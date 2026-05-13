# Roadmap: Studio Bluemli Website

## Overview

Ship the five-page editorial portfolio at studiobluemli.com in five coarse, dependency-driven phases. Phase 1 stands up the Astro 6.2 + React 19 + Cloudflare Workers (Static Assets) shell, copies in the design-skill components, encodes brand non-negotiables as CI grep rules, and corrects PROJECT.md's "Cloudflare Pages" constraint to "Cloudflare Workers with Static Assets." Phase 2 defines the strict Zod content schemas (gallery + popups + site) with per-slug image co-location and ships the gallery grid + per-piece detail pages. Phase 3 composes the remaining four pages — landing, popups (with build-time PT-aware past/upcoming split and a daily cron rebuild), about (written portrait + process shots, no founder face), say-hi shell — plus shared SEO + sitemap. Phase 4 ships the only dynamic surface: a `/api/contact` Worker route gated by server-side Turnstile, honeypot, KV rate limit, and Resend (`hi@studiobluemli.com`), with SPF/DKIM/DMARC carefully co-existing with the founder's MS365 records. Phase 5 wires Umami, security/cache headers, runs Lighthouse + OG validation, performs the DNS cutover (apex + `www` 301), and walks the "Looks Done But Isn't" checklist.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundations & Brand System** - Astro 6 on Workers + Static Assets, design-skill components copied in, brand non-negotiables enforced via CI _(complete 2026-05-13)_
- [ ] **Phase 2: Content Schema & Gallery** - Strict Zod collections with per-slug image co-location; gallery grid + per-piece detail pages live on preview
- [ ] **Phase 3: Page Composition & Pop-ups** - Landing, popups (timezone-correct split + daily cron), about, say-hi shell, shared SEO, sitemap
- [ ] **Phase 4: Contact Form & Deliverability** - `/api/contact` Worker with Turnstile + honeypot + KV rate limit + Resend; SPF/DKIM/DMARC co-existing with MS365
- [ ] **Phase 5: Analytics, Polish & Launch** - Umami events, security headers, Lighthouse/OG validation, DNS cutover to studiobluemli.com

## Phase Details

### Phase 1: Foundations & Brand System
**Goal**: Founder can preview a cream-background, hand-font, design-skill-styled empty shell of all five pages at a `*.workers.dev` URL, with brand non-negotiables enforced by CI so they cannot regress.
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-04, FND-05, FND-06, FND-07, FND-08, FND-09, FND-10, FND-11, FND-12, FND-13
**Success Criteria** (what must be TRUE):
  1. Founder can open a `*.workers.dev` preview URL and confirm cream background, hand-display headline font, Nunito body, and the design-skill header + footer chrome on a placeholder page.
  2. Every push to `main` produces a production deploy and every PR produces a unique preview URL (founder can click both from GitHub).
  3. A pull request that introduces `bg-white`, `#fff`, `flower`/`petal`/`floral`/`bloom`/`blossom`, `gradient`, `backdrop-filter`, `border: 1px`, or an uppercase filename under `src/pages/` fails CI before it can be merged.
  4. Favicon (mark.svg + generated .ico/16/32 + existing 180×180 apple-touch-icon) renders correctly in a desktop browser tab and an iOS "add to home screen" preview.
  5. PROJECT.md's Constraints section reads "Cloudflare Workers with Static Assets" (the legacy "Cloudflare Pages" wording is gone).
**Plans**: 5 plans
Plans:
**Wave 1**
- [x] 01-01-scaffold-astro-cloudflare-PLAN.md — Scaffold Astro 6.2 + Cloudflare adapter, wrangler.jsonc, Fonts API config, PROJECT.md correction (FND-01, FND-02, FND-07)
- [x] 01-02-sync-design-skill-PLAN.md — Sync 11 design-skill JSX components + brand-token CSS into src/ with mechanical transforms + manual SSR-safe edits (FND-06, FND-09)
- [x] 01-03-favicon-and-public-assets-PLAN.md — Generate favicon set from mark.svg, copy apple-touch-icon as-is, ship 3 placeholder gallery WebPs (FND-08)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 01-04-baselayout-pages-sample-data-PLAN.md — BaseLayout.astro + 5 page placeholders + sample-data.ts; demo-loaded shell renders (FND-05, FND-12, FND-13)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 01-05-ci-brand-check-and-setup-PLAN.md — GitHub Actions required status check + brand grep scripts + Lighthouse CI on preview URL + SETUP.md for Cloudflare connect (FND-04, FND-10, FND-11, FND-12)
**UI hint**: yes

**Key risks / pitfalls:**
- Pages → Workers swap during scaffold — most online Astro 6 + Cloudflare templates still reference `pages_build_output_dir`; verify `wrangler.toml` shape (`assets.directory`, `assets.binding`, `assets.run_worker_first: ["/api/*"]`, `main = "./dist/_worker.js/index.js"`) against current Cloudflare docs during planning.
- Design-skill JSX may import across the `.claude/skills/` boundary in ways the sync script needs to rewrite; expect manual cleanup on first run.
- FOIT on the hand-display font if `font-display: swap` is forgotten (Pitfall #10) — encode in the `@font-face` rule from day one.
- Coral-on-cream contrast (Pitfall #16) — never use coral for body text; verify with Lighthouse a11y on the first preview.
- Removed focus styles (Pitfall #17) — every `outline: none` must be paired with a `:focus-visible` indicator.
- Lowercase filename CI rule (Pitfall #13) — macOS dev vs Linux deploy case-sensitivity bug is silent until production.
- Favicon generation — only the 180×180 PNG exists; the .ico + 16/32 PNGs must be generated from `assets/logo/mark.svg` during this phase (no founder action needed).

### Phase 2: Content Schema & Gallery
**Goal**: Founder can add a gallery piece via the GitHub web UI and see it on a preview deploy within ~5 minutes — including the gallery grid card, the per-piece detail page with availability badge, and the "Ask about this piece on Instagram" CTA.
**Depends on**: Phase 1
**Requirements**: CNT-01, CNT-02, CNT-03, CNT-04, CNT-05, CNT-06, CNT-07, CNT-08, CNT-09, CNT-10, CNT-11, CNT-12
**Success Criteria** (what must be TRUE):
  1. Founder can drag a photo into a new `src/content/gallery/<slug>/` folder via the GitHub web UI, fill in frontmatter (name, price, status, description), open a PR, and see the new piece on the preview deploy's `/gallery` index and `/gallery/<slug>` detail page.
  2. A typo in a gallery frontmatter field (e.g., `availabilty: sold`) fails the build with a clear Zod error message, before the bad data ever ships.
  3. A sold piece, marked `status: sold`, renders in the gallery grid with a quiet editorial "Sold" badge (not hidden) and remains in the portfolio archive.
  4. The per-piece detail page emits a per-piece `og:image` (the piece's hero photo, absolute URL) so an Instagram or iMessage link unfurls correctly.
  5. `CONTENT_EDITING.md` exists at the repo root with screenshots of the GitHub web UI flow and a clearly labeled "never delete, flip availability" section; zero `git`/`npm`/`cd` instructions appear in any content-editing step.
**Plans**: TBD

**Key risks / pitfalls:**
- Schema design is one-shot: every `.strict()` enum, every required field, and the per-slug image co-location pattern must be baked in now (Pitfalls #6, #11, #12) — migrating later means rewriting every existing file.
- `passthroughImageService()` is required because Sharp doesn't run in `workerd` (Pitfall #8) — photos must be pre-optimized as WebP at commit time; lock the exact pre-optimization tool (squoosh-cli vs sharp-cli) and document it in `CONTENT_EDITING.md`.
- Founder workflow risk (Pitfall #23) — the GitHub web UI flow must be documented with screenshots and the founder should dry-run adding a piece before this phase is signed off.

### Phase 3: Page Composition & Pop-ups
**Goal**: All five pages render their real content on preview — landing (hero + next-pop-up callout + featured pieces), gallery (from Phase 2), popups (timezone-correct upcoming + past archive, auto-refreshing daily), about (written portrait + process shots), say-hi (form shell + IG + mailto fallbacks) — with per-page SEO meta and a published sitemap.
**Depends on**: Phase 2
**Requirements**: PAG-01, PAG-02, PAG-03, PAG-04, PAG-05, PAG-06, PAG-07, PAG-08, PAG-09
**Success Criteria** (what must be TRUE):
  1. Landing page shows the hero, the next-upcoming pop-up callout (or the empty-state line "no pop-ups on the calendar right now — DM me on Instagram" when no future pop-up exists), 3–6 featured gallery pieces, and the footer — all populated from content collections.
  2. A pop-up dated for "today" in Pacific time appears in the Upcoming section all day on its date in San Francisco (does not flip to Past at UTC midnight); after its end date, the next deploy (or the daily 3 AM PT cron rebuild) moves it to the Past archive automatically.
  3. The About page renders a first-person written portrait with hand-font headline and signature close, plus 1–3 process/craft shots (hands, beads, bench — no founder face), with no empty "press" or "as featured in" placeholders.
  4. Sharing the home, a gallery piece, and a pop-up URL in iMessage/Slack/IG DM each produce a correct unfurl preview (title, description, og:image), and `https://studiobluemli.com/sitemap-index.xml` + `/robots.txt` return valid content with the sitemap reference.
  5. Every page's `<link rel="canonical">` points to the apex `studiobluemli.com` (not `www.`, not a preview hostname).
**Plans**: TBD
**UI hint**: yes

**Key risks / pitfalls:**
- Timezone math is subtle (Pitfall #7) — store `date` + `start_time` + `tz: "America/Los_Angeles"`; compute cutoff in studio timezone using a real TZ library (`Temporal` polyfill or `@date-fns/tz`), never naive `new Date()` UTC math.
- Daily auto-rebuild via Cloudflare cron — LOCKED (founder confirmed). Plan must wire the cron trigger to a build webhook so the upcoming/past split refreshes without founder action.
- Process/craft shots availability — LOCKED ("process / craft shots" decided for About); confirm during plan-phase whether the founder has already shot these or needs to shoot them before the phase can sign off.
- Missing per-page `og:image` (Pitfall #14) — verify the shared `SEO.astro` component on every page during planning; emit absolute URLs (not relative) for og/twitter image meta.
- Empty placeholders — if the founder has no real press, the About page ships without a press section; never show "as featured in" as an empty slot (Pitfall: anti-feature from FEATURES.md).

### Phase 4: Contact Form & Deliverability
**Goal**: A visitor can fill the Say Hi form on the live preview and the message reliably lands in `hi@studiobluemli.com` (MS365 inbox) — surviving Turnstile + honeypot + KV rate limit — and the founder can hit Reply in Outlook/Gmail to reach the visitor.
**Depends on**: Phase 3
**Requirements**: CON-01, CON-02, CON-03, CON-04, CON-05, CON-06, CON-07, CON-08, CON-09, CON-10, CON-11
**Success Criteria** (what must be TRUE):
  1. A real submission from a preview deploy lands in `hi@studiobluemli.com` in the **inbox** (not spam) within seconds, with `From: "Studio Bluemli <hi@studiobluemli.com>"` and a `Reply-To` set to the visitor's email — hitting Reply in Outlook addresses the visitor, not the no-reply.
  2. A `curl` POST to `/api/contact` with a missing/forged Turnstile token returns 400 before any email is sent; a filled honeypot field is silently dropped (no email); the 11th submission from the same IP within an hour returns 429.
  3. Resend's domain dashboard for `studiobluemli.com` shows green checks on SPF, DKIM, and DMARC, and **the existing MS365 outbound mail still works** (founder can send + receive on the MS365 mailbox without disruption).
  4. With JavaScript disabled in DevTools, the Say Hi page still shows a working `<form method="POST" action="/api/contact">`, plus visible `mailto:hi@studiobluemli.com` and `https://ig.me/m/studiobluemli` fallbacks above or beside the form.
  5. `wrangler secret list` shows `RESEND_API_KEY`, `TURNSTILE_SECRET`, and the KV namespace ID; `git log -p --all -S 'RESEND_API_KEY'` returns zero matches; preview deploys use a separate Resend API key from production.
**Plans**: TBD

**Key risks / pitfalls (this is the riskiest phase):**
- **MS365 DNS coexistence** (PLANNING CONCERN): Resend SPF/DKIM/DMARC records must be added *alongside* existing MS365 records, not replace them. The SPF record must combine includes (`v=spf1 include:spf.protection.outlook.com include:_spf.resend.com -all`); DKIM uses Resend's own selectors (won't collide with MS365's); DMARC alignment must validate for both senders. **One wrong edit can break the founder's MS365 outbound mail** — pre-stage every record change, take a screenshot of the current DNS zone before edits, and verify MS365 send+receive after each change.
- Skipping server-side Turnstile siteverify (Pitfall #2) — the Worker's first action, before reading the rest of the body, must POST to `challenges.cloudflare.com/turnstile/v0/siteverify` and reject if `success !== true`.
- MailChannels copy-paste trap (Pitfall #1) — Mailchannels' free Cloudflare-Workers tier ended 2024-08-31; reject any tutorial/snippet that references `api.mailchannels.net/tx/v1/send` without an `Authorization` header.
- SPF/DKIM/DMARC propagation (Pitfall #3) — kick off DNS records *first* (propagation takes minutes-to-hours) while Worker code is written in parallel.
- DKIM CNAME format on Cloudflare — Cloudflare's UI sometimes wants the bare subdomain, not the FQDN; an extra trailing dot or wrong record type silently fails.
- Secrets management (Pitfall #15) — `wrangler secret put` only; `.dev.vars` for local; never `wrangler.toml`/`.env`; gitignore `.env`, `.dev.vars`, `.wrangler/`.
- Separate Resend keys for preview vs production (CON-09) — so spam tests on previews don't burn production quota or pollute domain reputation.
- LOCKED for this phase (no founder questions needed): `From: hi@studiobluemli.com`, `to: hi@studiobluemli.com` (MS365-hosted), display name "Studio Bluemli".

### Phase 5: Analytics, Polish & Launch
**Goal**: `https://studiobluemli.com` resolves to the production Worker, `www.` 301-redirects to apex, Umami records every visit and event from the production domain, all 5 pages score Lighthouse mobile ≥ 90, and the founder has walked the "Looks Done But Isn't" launch checklist end-to-end.
**Depends on**: Phase 4
**Requirements**: FND-03, LCH-01, LCH-02, LCH-03, LCH-04, LCH-05, LCH-06, LCH-07, LCH-08
**Success Criteria** (what must be TRUE):
  1. Visiting `https://studiobluemli.com` shows the live production site over HTTPS with a valid certificate, and `https://www.studiobluemli.com/anything` returns a 301 to `https://studiobluemli.com/anything`.
  2. Within 5 minutes of cutover, the Umami Cloud dashboard's Realtime view shows the founder's own visit plus custom events (gallery-card click, "inquire on Instagram" click, contact-form submit) — events from preview deploys do **not** appear (`data-domains` is enforced).
  3. Lighthouse mobile audit on the production URL scores ≥ 90 on Performance, Accessibility, Best Practices, and SEO for all 5 pages (landing, gallery, gallery detail sample, popups, about, say-hi).
  4. The Facebook Sharing Debugger and Twitter Card validator return valid previews (image, title, description) for the home, a representative gallery piece, and a pop-up URL.
  5. The "Looks Done But Isn't" checklist (LCH-08) is walked top-to-bottom: contact form sends a real message into the inbox; sitemap + robots.txt return 200; every `og:image` URL returns 200; no console errors on any page; all 5 pages load < 2s on a throttled mobile connection.
**Plans**: TBD

**Key risks / pitfalls:**
- DNS cutover is one-way-ish — sequence it last in the phase, after final About copy is locked and Umami's domain registration is verified (Pitfall #19).
- Umami "0 events" after cutover almost always means the production domain wasn't added to Umami's website list (Pitfall #19) — register `studiobluemli.com` (not the `*.workers.dev` preview) in Umami settings before cutover.
- WWW vs apex split (Pitfall #18) — pick apex as canonical; verify the Cloudflare Redirect Rule fires *before* announcing.
- `_headers` for security (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) and long-cache for static assets must ship with the cutover, not after — HSTS in particular is sticky once issued.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundations & Brand System | 5/5 | Complete | 2026-05-13 |
| 2. Content Schema & Gallery | 0/TBD | Not started | - |
| 3. Page Composition & Pop-ups | 0/TBD | Not started | - |
| 4. Contact Form & Deliverability | 0/TBD | Not started | - |
| 5. Analytics, Polish & Launch | 0/TBD | Not started | - |
