# Studio Bluemli Website — v1 Requirements

> **Source:** Synthesized from `.planning/PROJECT.md`, `.planning/research/SUMMARY.md`, and founder Q&A on 2026-05-12.
> **Granularity:** Coarse (per `.planning/config.json`) — requirements grouped into 5 logical phases by dependency.

---

## v1 Requirements

### Foundation

- [ ] **FND-01**: Site builds as static assets from an Astro 6.2 project using `@astrojs/cloudflare@13.5` and `@astrojs/react@5.0.4`, with React 19 server-rendered only (no `client:` directives)
- [ ] **FND-02**: Site deploys to **Cloudflare Workers + Static Assets** (not Cloudflare Pages — adapter v13 dropped Pages support) via a single Worker that serves both static and the `/api/*` route via `wrangler.toml` `assets.run_worker_first: ["/api/*"]`
- [ ] **FND-03**: Production traffic resolves at apex `https://studiobluemli.com`; `www.studiobluemli.com` 301-redirects to apex via Cloudflare Redirect Rules
- [ ] **FND-04**: Every push to `main` triggers a production deploy via Cloudflare's git integration; every pull request gets a unique preview deploy URL
- [ ] **FND-05**: A shared `BaseLayout.astro` provides the `<head>`, header (logo lockup + nav), and footer (Instagram link, copyright) for all 5 pages
- [ ] **FND-06**: Brand color/type tokens from `studio-bluemli-design/colors_and_type.css` are imported once globally; `body` background is cream (never white)
- [ ] **FND-07**: Hand-display fonts and Nunito are self-hosted as WOFF2 with `font-display: swap` (Nunito via Astro Fonts API, hand-display fonts loaded from `public/fonts/`)
- [ ] **FND-08**: Favicon set wired up: `mark.svg` as primary icon, generated `favicon.ico` + 32/16 PNGs from the SVG mark, existing `mark-favicon-180.png` as `apple-touch-icon`
- [ ] **FND-09**: A `scripts/sync-design-skill.mjs` copies (not imports) the design skill's JSX components, CSS tokens, and any required assets from `.claude/skills/studio-bluemli-design/` into `src/components/design-skill/` and `src/styles/`
- [ ] **FND-10**: CI grep rules fail the build on brand-non-negotiable violations: `flower|petal|floral|bloom|blossom` in `src/` or `src/content/`; `bg-white|background:\s*white|#fff(?!8)` in CSS/Astro; `gradient`, `backdrop-filter`, and `border:\s*1px` patterns in production styles
- [ ] **FND-11**: All `src/pages/` route filenames are lowercase-only (CI grep enforces); routes never depend on case-sensitivity between macOS dev and Linux deploy
- [ ] **FND-12**: Layout is mobile-first responsive across all 5 pages; Lighthouse mobile score ≥ 90 on every page in CI
- [ ] **FND-13**: `:focus-visible` styles are present on every interactive element; a skip-to-content link precedes the header; `color-scheme: light` is declared

### Content & Gallery

- [ ] **CNT-01**: Astro Content Collections v2 defines three collections via `src/content.config.ts`: `gallery`, `popups`, `site` — all schemas use `.strict()` and the `image()` helper for typed image references
- [ ] **CNT-02**: Each gallery piece lives in its own folder at `src/content/gallery/<slug>/index.md` with hero photo(s) co-located in the same folder (no shared photo directory — kills rename/orphan-image risk)
- [ ] **CNT-03**: Gallery schema captures: `name` (string), `hero` (single typed `image()` ref — v1 ships single hero photo per piece; multi-photo carousel deferred to v1.x per Phase 2 D-02/D-16), `price` (number, integer USD), `status` (enum: `available | sold | one-of-one | reserved`), `description` (string, 1-2 sentences), `featured` (boolean, default `false`, for landing carousel), `published_at` (ISO date string `YYYY-MM-DD`, required sort key — newest first per Phase 2 D-14/D-17)
- [ ] **CNT-04**: Each pop-up event lives at `src/content/popups/YYYY-MM-DD-<slug>.md` (date-prefixed for sortability)
- [ ] **CNT-05**: Pop-up schema captures: `name`, `date` (ISO string), `end_date` (optional ISO), `start_time` + `end_time` (strings), `tz` (string, defaults to `America/Los_Angeles`), `location` (venue name + neighborhood/city), `address` (optional, for map links), `description` (markdown body), `link` (optional URL), `photos` (optional `image()` refs)
- [ ] **CNT-06**: A single site-config file at `src/content/site/config.md` holds tagline, contact email, IG handle (`studiobluemli`), IG DM deep-link target, footer text, and default OG metadata
- [ ] **CNT-07**: `/gallery` index page renders all pieces in a responsive grid (2-col mobile, 3-col desktop); cards show photo + name + price + availability badge
- [ ] **CNT-08**: Each gallery piece has its own detail page at `/gallery/<slug>` showing photo(s), name, price, availability, the 1-2 sentence description, and a primary "Ask about this piece on Instagram" CTA that opens `https://ig.me/m/studiobluemli`
- [ ] **CNT-09**: Each per-piece detail page emits a per-piece `og:image` (the piece's hero photo) for beautiful link previews on IG/Twitter shares
- [ ] **CNT-10**: Availability badges render as quiet editorial labels (no red "SOLD OUT" stamps): `Available` / `One of one` / `Sold` / `Reserved` — sold pieces remain visible as portfolio history (never delete an entry to "remove" it)
- [ ] **CNT-11**: All product photography is pre-optimized (WebP, responsive widths) at commit time; runtime image service is `passthroughImageService()` since Sharp doesn't run in `workerd`
- [ ] **CNT-12**: A `CONTENT_EDITING.md` at the repo root walks the founder through adding a gallery piece and a pop-up via the GitHub web UI (drag-drop photo, edit frontmatter, open PR, preview deploy, merge) — no `git`, `npm`, or terminal steps anywhere in the workflow

### Pages & Composition

- [ ] **PAG-01**: Landing page (`/`) renders a hero (logo, tagline, founder voice line), a "next pop-up" callout pulling from the same `popups` collection (with a graceful empty state: "no pop-ups on the calendar right now — DM me on Instagram"), 3-6 featured gallery pieces (`featured: true`), and a footer
- [ ] **PAG-02**: Gallery page (`/gallery`) renders the grid from CNT-07
- [ ] **PAG-03**: Pop-ups page (`/popups`) renders upcoming events prominently (date, location, time, description) and a compact past-event archive below; the upcoming/past split is computed at build time in `America/Los_Angeles`
- [ ] **PAG-04**: A Cloudflare cron trigger rebuilds the site daily at ~3:00 AM Pacific so past pop-ups fall off the upcoming list without founder action
- [ ] **PAG-05**: About page (`/about`) renders a first-person written portrait of the founder (no founder photo by founder decision); 1–3 process/craft shots (hands, beads, bench — work in progress, no founder face); generous whitespace; hand-font headline; signature close
- [ ] **PAG-06**: Say Hi page (`/say-hi`) renders a visible Instagram DM link (`https://ig.me/m/studiobluemli`) plus a `mailto:hi@studiobluemli.com` fallback link. The v1 contact form is dropped (D-18, D-19); a `<form>` is NOT shipped on this page in v1.
- [ ] **PAG-07**: A shared `SEO.astro` component emits per-page `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card="summary_large_image"`, and a canonical `<link rel="canonical">` pointing to the apex URL
- [ ] **PAG-08**: `@astrojs/sitemap` is installed and generates `sitemap-index.xml`; a `robots.txt` references the sitemap
- [ ] **PAG-09**: All product images have alt text; alt text never uses the words `flower|petal|floral|bloom|blossom`

### Launch & Operations

- [ ] **LCH-01**: Umami Cloud `<script>` is loaded once in `BaseLayout`'s `<head>` with `data-website-id` and `data-domains="studiobluemli.com"` so preview-deploy traffic doesn't pollute production analytics
- [ ] **LCH-02**: The site is registered in Umami Cloud's website list (so events aren't silently dropped); domain configured to match `data-domains`
- [ ] **LCH-03**: Key user interactions emit Umami custom events via `data-umami-event` attributes: gallery card click, "inquire on Instagram" click, contact-form submit
- [ ] **LCH-04**: A `_headers` file sets security headers (HSTS, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy) and long-cache headers for static assets
- [ ] **LCH-05**: Lighthouse mobile audit ≥ 90 across Performance, Accessibility, Best Practices, SEO on all 5 pages
- [ ] **LCH-06**: OG preview is validated for the landing page, a representative gallery piece, and a pop-up via the Facebook Sharing Debugger and Twitter Card validator
- [ ] **LCH-07**: DNS cutover: studiobluemli.com points at the Cloudflare Worker via the existing Cloudflare account; HTTPS certificate is issued and valid; apex + www both resolve correctly with the 301 in place
- [ ] **LCH-08**: A short "Looks Done But Isn't" launch checklist is walked: contact form sends, sitemap is reachable, robots.txt is reachable, og:image URLs return 200, no console errors on any page, Umami events appearing in dashboard, all 5 pages load < 2s on a throttled mobile connection

---

## Out of Scope (v1)

- **Contact form (`<form>` element + `/api/contact` Worker route + Turnstile + KV rate limit + Resend integration + SPF/DKIM/DMARC DNS coexistence with MS365)** — dropped from v1 entirely per Phase 3 D-18/D-19. `/say-hi` ships as an IG-DM-link page + mailto fallback. The 11 CON-NN requirements (CON-01..CON-11) that previously specified this surface are moved here. Can return as a v1.x phase if the IG-only contact channel ever stops scaling. `wrangler.jsonc`'s `run_worker_first: ["/api/*"]` reservation and `astro.config.mjs`'s `output: 'server'` are preserved (D-22) so the rewiring cost is minimal.
- **CON-01..CON-11 (formerly in §Contact Form & Deliverability)** — POST `/api/contact` endpoint, Turnstile siteverify, honeypot field, KV per-IP rate limit, Resend send-from-domain, MS365 DNS coexistence, deliverability smoke test, secrets via `wrangler secret put`, separate preview/production Resend keys, progressive enhancement, inline confirmation/error. All deferred along with the contact form per the above bullet.
- **E-commerce / checkout / cart / payments** — sales happen at pop-ups and via Instagram DM. Adding commerce infrastructure is a different product; revisit only if pop-ups + DM stops scaling.
- **User accounts / login** — nothing on the site is gated.
- **CMS admin UI (Decap, Sveltia, Pages CMS, TinaCMS)** — markdown-in-repo is the v1 workflow. The file structure is *deliberately* CMS-compatible so this can be added later with zero data migration if the founder gets tired of GitHub web UI editing.
- **Database (D1 / KV) for content** — files-in-repo is simpler and cheaper. KV is used *only* for the contact-form rate limit.
- **Newsletter signup / email list** — not requested; no marketing/email-list strategy in place yet.
- **Blog / journal page** — not in v1; can be added later if the founder wants a writing surface.
- **Multi-language** — English only.
- **Founder photo** — explicit founder decision; About page uses written portrait + process shots only.
- **Press / "as featured in" section** — gated on real press existing; if no real mentions, never show an empty placeholder.
- **Lightbox / fullscreen image overlay** — the per-piece detail page is shareable, accessible, and OG-friendly; lightbox is a v1.x enhancement at best.
- **Filter / search / category navigation** — gallery is curated and small; revisit at ~50+ pieces.
- **Per-piece OG image auto-generation (satori-style)** — v1 uses each piece's hero photo as its `og:image` (already in CNT-09). Generator-based OG cards can come later.
- **Contact-form pre-fill from gallery (`?piece=<slug>`)** — primary inquire CTA is IG DM; pre-fill is a v1.x lift if the form becomes primary.
- **`.ics` calendar export for pop-ups** — defer to v1.x.
- **Quiet hover transitions on gallery cards** — not selected; defer to v1.x polish.
- **Client-side past/upcoming filter** — using build-time + daily cron instead.
- **Custom admin / editor UI** — see CMS note above.
- **"Under $100" price-ceiling marketing copy** — internal positioning fact only, never on the site (brand non-negotiable from design skill).
- **Pressed-flower decorative imagery** — brand non-negotiable; reference only, never on the site.
- **Newsletter pop-up modals, exit-intent overlays, cookie banners, hero video autoplay, live chat, parallax, "Buy Now" CTAs, testimonial carousels, fake "Featured in" claims, multi-step contact forms, loading spinners** — explicit anti-features per research; conflict with voice or visual non-negotiables.
- **Hydrated React islands (`client:load`, `client:idle`, etc.) by default** — every JSX component renders server-side as static HTML. The only client-side JS shipped is the form's progressive-enhancement validation and the Turnstile widget.
- **Tailwind / shadcn / MUI / Chakra or any other UI library** — would be a second source of truth for color tokens and a leak vector for white backgrounds.
- **Sharp at build time** — rejected by `@astrojs/cloudflare@13` adapter (`workerd` doesn't support it); pre-optimize images at commit.
- **MailChannels** — free Cloudflare-Workers tier ended 2024-08-31; using Resend exclusively.

---

## Traceability

> Each requirement maps to exactly one phase; each phase's success criteria reference REQ-IDs.
> See `.planning/ROADMAP.md` for phase goals and success criteria.

| Requirement | Phase | Success Criterion |
|-------------|-------|-------------------|
| FND-01 | Phase 1: Foundations & Brand System | SC1 (cream/font shell renders on preview), SC2 (push-to-deploy + PR previews) |
| FND-02 | Phase 1: Foundations & Brand System | SC1 (preview at *.workers.dev), SC2 (push-to-deploy + PR previews), SC5 (PROJECT.md updated to Workers wording) |
| FND-03 | Phase 5: Analytics, Polish & Launch | SC1 (apex `https://studiobluemli.com` resolves; `www.` 301-redirects to apex) |
| FND-04 | Phase 1: Foundations & Brand System | SC2 (push to main = production deploy; PR = unique preview URL) |
| FND-05 | Phase 1: Foundations & Brand System | SC1 (header + footer chrome render on the placeholder page) |
| FND-06 | Phase 1: Foundations & Brand System | SC1 (cream background), SC3 (CI fails on bg-white/#fff) |
| FND-07 | Phase 1: Foundations & Brand System | SC1 (hand-display headline + Nunito body render with no FOIT on preview) |
| FND-08 | Phase 1: Foundations & Brand System | SC4 (favicon set works in desktop + iOS preview) |
| FND-09 | Phase 1: Foundations & Brand System | SC1 (design-skill components render on the placeholder shell) |
| FND-10 | Phase 1: Foundations & Brand System | SC3 (CI fails on bg-white, #fff, flower/petal/floral/bloom/blossom, gradient, backdrop-filter, border:1px) |
| FND-11 | Phase 1: Foundations & Brand System | SC3 (CI fails on uppercase filenames under src/pages/) |
| FND-12 | Phase 1: Foundations & Brand System | SC1 (mobile-first shell on preview) — Lighthouse ≥ 90 finalized in Phase 5 SC3 |
| FND-13 | Phase 1: Foundations & Brand System | SC1 (focus-visible + skip-to-content + color-scheme: light on the shell) |
| CNT-01 | Phase 2: Content Schema & Gallery | SC2 (typo'd frontmatter fails the build via Zod .strict()) |
| CNT-02 | Phase 2: Content Schema & Gallery | SC1 (founder adds piece by dropping a photo into a per-slug folder via GitHub web UI) |
| CNT-03 | Phase 2: Content Schema & Gallery | SC2 (Zod schema catches typos), SC3 (sold piece renders with quiet badge) |
| CNT-04 | Phase 2: Content Schema & Gallery | SC1 (founder adds a pop-up by creating YYYY-MM-DD-<slug>.md via GitHub web UI) |
| CNT-05 | Phase 2: Content Schema & Gallery | SC1 (pop-up frontmatter validates) — timezone-correct rendering in Phase 3 SC2 |
| CNT-06 | Phase 2: Content Schema & Gallery | SC1 (site config drives header/footer copy on the rendered preview) |
| CNT-07 | Phase 2: Content Schema & Gallery | SC1 (new piece appears on /gallery index grid) |
| CNT-08 | Phase 2: Content Schema & Gallery | SC1 (new piece appears on /gallery/<slug> detail page with IG DM CTA) |
| CNT-09 | Phase 2: Content Schema & Gallery | SC4 (per-piece og:image emits the piece's hero photo for IG/iMessage unfurls) |
| CNT-10 | Phase 2: Content Schema & Gallery | SC3 (sold piece renders with quiet editorial badge, never hidden) |
| CNT-11 | Phase 2: Content Schema & Gallery | SC1 (gallery loads on preview using passthroughImageService + pre-optimized WebPs) |
| CNT-12 | Phase 2: Content Schema & Gallery | SC5 (CONTENT_EDITING.md exists with screenshots, zero CLI steps, "never delete, flip availability" section) |
| PAG-01 | Phase 3: Page Composition & Pop-ups | SC1 (landing renders hero + next-popup callout + featured pieces + footer, with empty-state line when no future popup) |
| PAG-02 | Phase 3: Page Composition & Pop-ups | SC1 (gallery from Phase 2 wires into the live nav and is reachable from the production routes) |
| PAG-03 | Phase 3: Page Composition & Pop-ups | SC2 (timezone-correct upcoming/past split in America/Los_Angeles) |
| PAG-04 | Phase 3: Page Composition & Pop-ups | SC2 (daily 3 AM PT cron rebuild moves expired popups to Past without founder action) |
| PAG-05 | Phase 3: Page Composition & Pop-ups | SC3 (About renders written portrait + hand-font headline + signature close + 1–3 process/craft shots, no founder face, no empty press placeholders) |
| PAG-06 | Phase 3: Page Composition & Pop-ups | SC1 (say-hi page renders form shell + IG + mailto fallbacks) — form delivery proven in Phase 4 |
| PAG-07 | Phase 3: Page Composition & Pop-ups | SC4 (iMessage/Slack/IG unfurls show correct title/description/og:image), SC5 (canonical points to apex) |
| PAG-08 | Phase 3: Page Composition & Pop-ups | SC4 (sitemap-index.xml + robots.txt return valid content with sitemap reference) |
| PAG-09 | Phase 3: Page Composition & Pop-ups | SC3 (alt text on every product image, never uses flower/petal/floral/bloom/blossom — also enforced by Phase 1 SC3 CI) |
| LCH-01 | Phase 5: Analytics, Polish & Launch | SC2 (Umami script in BaseLayout with data-website-id + data-domains restricting to studiobluemli.com) |
| LCH-02 | Phase 5: Analytics, Polish & Launch | SC2 (domain registered in Umami; Realtime view shows visit within 5 minutes of cutover) |
| LCH-03 | Phase 5: Analytics, Polish & Launch | SC2 (custom events fire for gallery card click, IG inquire click, contact-form submit) |
| LCH-04 | Phase 5: Analytics, Polish & Launch | SC1 (production HTTPS with valid cert + security headers in place at cutover) |
| LCH-05 | Phase 5: Analytics, Polish & Launch | SC3 (Lighthouse mobile ≥ 90 across Performance/Accessibility/Best Practices/SEO on all 5 pages) |
| LCH-06 | Phase 5: Analytics, Polish & Launch | SC4 (Facebook Sharing Debugger + Twitter Card validator return valid previews for home, gallery piece, popup) |
| LCH-07 | Phase 5: Analytics, Polish & Launch | SC1 (apex resolves with valid HTTPS, www 301s to apex) |
| LCH-08 | Phase 5: Analytics, Polish & Launch | SC5 ("Looks Done But Isn't" checklist walked top-to-bottom) |

---
*Last updated: 2026-05-12 — Traceability filled in by gsd-roadmapper*
