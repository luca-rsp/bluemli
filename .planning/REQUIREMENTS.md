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
- [ ] **CNT-03**: Gallery schema captures: `name` (string), `photos` (array of typed `image()` refs), `price` (number, integer USD), `status` (enum: `available | sold | one-of-one | reserved`), `description` (string, 1-2 sentences), `featured` (boolean, for landing carousel), `order` or `published_at` (sort key)
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
- [ ] **PAG-06**: Say Hi page (`/say-hi`) renders the contact form (CON-* requirements below) plus visible Instagram and `mailto:` fallback links
- [ ] **PAG-07**: A shared `SEO.astro` component emits per-page `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card="summary_large_image"`, and a canonical `<link rel="canonical">` pointing to the apex URL
- [ ] **PAG-08**: `@astrojs/sitemap` is installed and generates `sitemap-index.xml`; a `robots.txt` references the sitemap
- [ ] **PAG-09**: All product images have alt text; alt text never uses the words `flower|petal|floral|bloom|blossom`

### Contact Form & Deliverability

- [ ] **CON-01**: A POST endpoint at `src/pages/api/contact.ts` with `export const prerender = false` accepts the contact-form submission; routed to the Worker via `run_worker_first: ["/api/*"]`
- [ ] **CON-02**: The endpoint's first action is server-side Turnstile siteverify (POST `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `{secret, response, remoteip}`); rejects with 400 if `success !== true`
- [ ] **CON-03**: A CSS-hidden honeypot field (`name="website"`) silently rejects submissions where the field is non-empty
- [ ] **CON-04**: A KV-backed per-IP rate limit (1 submission/min, 10/hour) returns 429 when exceeded; KV namespace bound in `wrangler.toml`
- [ ] **CON-05**: On valid submission, Resend sends the email with `from: "Studio Bluemli <hi@studiobluemli.com>"`, `to: hi@studiobluemli.com` (lands in the existing MS365 mailbox), `reply_to: <visitor's email>`, plain-text body containing the visitor's name + message + IP/UA in headers for debugging
- [ ] **CON-06**: The `studiobluemli.com` domain is verified in Resend with SPF, DKIM, and DMARC records configured alongside (not replacing) the existing MS365 DNS records — SPF combines includes (`include:spf.protection.outlook.com include:_spf.resend.com`), DKIM uses Resend's own selectors (won't collide), and DMARC alignment validates for both senders
- [ ] **CON-07**: Pre-launch deliverability smoke test: submit the form and verify the email lands in **both** Gmail and iCloud inboxes (not spam folders); test repeats from at least one preview-deploy URL
- [ ] **CON-08**: All secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET`, KV namespace ID) are set via `wrangler secret put`; never committed to `wrangler.toml`, `.env`, or any tracked file; `.dev.vars` is gitignored
- [ ] **CON-09**: Separate Resend API keys for preview deploys vs production (so spam tests on previews don't burn production quota)
- [ ] **CON-10**: The form uses progressive enhancement — a real `<form method="POST" action="/api/contact">` works without JavaScript; visible `mailto:hi@studiobluemli.com` and Instagram DM links serve as JS-disabled fallbacks
- [ ] **CON-11**: On submission, the page shows an inline confirmation (no redirect away); on error, shows an inline error message with the same fallback links

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

> **Filled in by `gsd-roadmapper` after roadmap creation.**
> Each requirement maps to exactly one phase; each phase's success criteria reference REQ-IDs.

| Requirement | Phase | Success Criterion |
|-------------|-------|-------------------|
| FND-01 …    | TBD   | TBD               |

---
*Last updated: 2026-05-12 after initialization*
