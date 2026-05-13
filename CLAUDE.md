<!-- GSD:project-start source:PROJECT.md -->
## Project

**Studio Bluemli Website**

A small static marketing website for Studio Bluemli — a jewelry studio in NoPa, San Francisco that hand-assembles whimsical, bright, beaded-cluster earrings. The site is a portfolio + storefront-less brand presence at studiobluemli.com: visitors browse the gallery, see where the next pop-up is happening, learn the founder story, and reach out to inquire about pieces. No online checkout — sales happen at pop-ups and via direct conversation.

**Core Value:** The product photography and brand voice come through cleanly on a cream-paper page, and the founder can add or remove gallery pieces and pop-up events without writing code or paying a CMS.

### Constraints

- **Hosting**: Cloudflare Workers with Static Assets — a single Worker serves both the static bundle and the `/api/contact` endpoint via `wrangler.toml`'s `assets.run_worker_first: ["/api/*"]`. (Initial plan was Cloudflare Pages; corrected because `@astrojs/cloudflare@13` — required by Astro 6 — dropped Pages support, and Cloudflare froze Pages investment in favor of Workers.)
- **Stack**: Astro — picked so the existing React JSX components from the design skill can be reused as-is, while shipping near-zero client JS.
- **Content storage**: Markdown + YAML files in the repo. No database. Structure must remain compatible with a future git-backed CMS.
- **Budget**: Free tier wherever possible. Cloudflare Pages free, Umami Cloud free, Resend/Mailchannels free, Turnstile free, GitHub repo.
- **Brand fidelity**: Must follow `studio-bluemli-design/SKILL.md` rules — cream background, no white; specific palette; specific fonts (with documented substitutions); product photography is the brand.
- **Privacy**: Cookieless analytics (Umami) so no EU consent banner is needed.
- **Performance**: Static-first, image-optimized; phone-first; target Lighthouse mobile ≥ 90 across the board.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## TL;DR
## CRITICAL FINDING: Cloudflare Pages vs Workers
## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Astro** | `6.2.x` (released 2026-04-30) | Site framework — static-first, ships zero client JS by default, can render React JSX components as static HTML | The design skill ships React `.jsx`. Astro is the only mainstream framework that renders foreign JSX server-side as static HTML by default with no hydration unless you opt in. Astro 6 added a stable Fonts API and a redesigned dev server that uses the production runtime locally. |
| **`@astrojs/cloudflare`** | `13.5.x` | Adapter — emits a Worker + assets bundle | Required for Astro 6. Targets Workers + Static Assets (Pages is no longer supported by this adapter — see above). |
| **`@astrojs/react`** | `5.0.4` | Lets Astro render `.jsx` components from the design skill | Supports React 19, requires Node 22.12+, compatible with Astro 6 / Vite 7. The design skill's components are JSX; this is non-optional. |
| **React + ReactDOM** | `19.x` | Required peer for `@astrojs/react@5` | Latest stable. Even though we never hydrate (no `client:` directive), the JSX still needs React for server rendering. |
| **Cloudflare Workers (with Static Assets)** | n/a | Hosting + edge runtime for the contact form | Free tier: 100k requests/day, **static-asset requests are free and uncapped**, 10ms CPU per request. The contact form will be one POST request per submission — trivially within free tier. |
| **Cloudflare Turnstile** | n/a (managed) | Spam protection on the contact form | Free, unlimited. CAPTCHA-style but no puzzles. Has a documented `siteverify` endpoint at `https://challenges.cloudflare.com/turnstile/v0/siteverify`. |
| **Resend** | `resend` npm package, latest | Outbound email for the contact form | Free tier: 3,000 emails/month, 100/day, 1 verified domain. Works from a Worker with a single `Resend(env.RESEND_API_KEY).emails.send(...)` call. The only Worker-friendly option that can send to an arbitrary inbox (e.g. the founder's Gmail) — see "What NOT to Use" for why Cloudflare Email Service and MailChannels don't work here. |
| **Umami Cloud** | hosted (`cloud.umami.is`) | Privacy-friendly analytics | Free tier suffices for this traffic. Single `<script>` tag in BaseLayout. Cookieless → no consent banner needed (matches the project's privacy constraint). |
| **TypeScript** | `5.6+` (Astro 6 default) | Type safety in `.astro` and Content Collection schemas | Comes with Astro. Use `strict` mode. |
| **Node.js** | `22.12+` | Build toolchain | Required by `@astrojs/react@5` and Astro 6. Pin via `package.json` `engines` and `.nvmrc`. |
| **pnpm** | `9.x` or `10.x` | Package manager | Faster, stricter, dramatically smaller `node_modules` than npm/yarn. Cloudflare's build environment supports it via `pnpm-lock.yaml` detection. (If founder will ever run `npm install` locally, use plain npm instead — pnpm's strictness can surprise non-engineers.) |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | `4.x` (Astro 6 bundles it) | Schema validation for Content Collections | Required for the `gallery` and `popups` collection schemas. Astro 6 upgraded to Zod 4. Use `astro:content`'s re-exported `z`. |
| `astro/loaders` (`glob`, `file`) | built-in | Content Collection loaders | `glob()` for per-piece markdown (`/src/content/gallery/*.md`); `file()` if pop-ups end up as a single `popups.yaml`. Both ship with Astro — no extra install. |
| `mimetext` | latest | Build RFC822 emails inside the Worker | Only if you choose the Cloudflare Email Service path (which I am recommending *against* — see below). Skip for Resend. |
| `@fontsource-variable/nunito` | latest | Variable Nunito for UI text | Fallback if Astro's Fonts API gives you trouble. Otherwise prefer the built-in Fonts API. |
| `astro:assets` `<Image />` / `<Picture />` | built-in | Image components | Use with `passthroughImageService()` because Sharp doesn't run inside `workerd`. You still get layout-shift prevention and forced `alt`. Pre-optimize photos to WebP at commit time (e.g. via a one-time `squoosh-cli` or `sharp-cli` run, not at request/build time). |
| `astro/components` `<Font />` | built-in | Renders `@font-face` + preload from the Fonts API config | Drop in BaseLayout `<head>`. |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| **Wrangler** | `4.x` | Local dev for Worker, deploy CLI, env-var/secret management. Install as dev dep. |
| **Prettier** | `3.x` + **`prettier-plugin-astro@0.14.x`** | Single formatter for `.astro`, `.ts`, `.tsx`, `.css`, `.md`. Configure the plugin in `.prettierrc.mjs`; the Astro plugin needs an explicit `parser: "astro"` override for `*.astro` files. |
| **ESLint** | optional — `9.x` flat config + `eslint-plugin-astro` | Skip unless someone other than the founder will commit code. For a 5-page site, Prettier + TypeScript's own type-checking is enough. |
| **Playwright** | `1.x` latest | One smoke test: build the site, start `astro preview`, hit each of the 5 routes, assert 200 + key headings, and submit the contact form against a `MOCK_TURNSTILE=1` flag. Skip Vitest — there's no business logic to unit-test. |
| **Astro's `astro check`** | built-in | Type-checks `.astro` files. Run in CI before `astro build`. |
## Installation
# Scaffold (do this once; use "Empty" template, TypeScript strict)
# Core
# Dev tooling
# Fonts (only if not using the Astro Fonts API for Nunito)
### Astro config (target shape)
### `wrangler.jsonc` (target shape)
## Content collections (target shape)
## Contact form (target shape)
## Umami (target shape)
## Styling approach
- Tokens already exist as CSS custom properties — duplicating them as Tailwind theme keys is wasted work and a brand-drift risk (rule #9: "never invent new colors").
- Astro auto-scopes `<style>` blocks in `.astro` files by default — no BEM, no naming collisions, no extra tooling.
- Use `<style is:global>` only inside `BaseLayout.astro` for the one global import.
## Reusing the design skill's React JSX
- Copy the JSX files from `.claude/skills/studio-bluemli-design/ui_kits/website/` into `src/components/` (don't import across the skill boundary at build time — the skill is a documentation/tooling artifact, not a runtime dep).
- Use them **without any `client:` directive**. They render to HTML at build, the page ships zero JS. This is the whole reason Astro is the framework.
- If a component imports from cross-project paths (e.g. `../../assets/`), rewrite imports to live inside `src/`.
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Cloudflare Workers + Static Assets | Cloudflare Pages (legacy path) | Only if you must use a feature that Pages still has and Workers doesn't (none that apply here). Pages is supported but no longer receives new features. |
| Astro 6 | Next.js / Eleventy / Hugo | Next is overkill (React-everywhere, framework lock-in, harder static export). Eleventy/Hugo can't render React JSX from the design skill without rewriting it. |
| Content Collections (files in repo) | Decap CMS / Sveltia CMS / TinaCMS | Add later if/when the founder asks. The file structure already chosen is CMS-compatible — zero data migration. v1 ships without it. |
| Resend | Postmark / SendGrid / Brevo | Resend's free tier (3k/month, 100/day) covers this case for years. Postmark has zero free tier ($15/mo minimum). SendGrid free is 100/day but their domain auth and DX are worse. Brevo (formerly Sendinblue) is fine but heavier setup. |
| Resend | Cloudflare Email Service (`send_email` binding) | Cloudflare's outbound email **can only send to addresses verified inside Cloudflare Email Routing** — not arbitrary inboxes. Useless for a "email the founder's Gmail" contact form. If we ever moved the founder onto a Cloudflare-verified address, revisit. |
| Resend | MailChannels (the old `api.mailchannels.net` Worker integration) | **No longer free.** MailChannels ended the free Cloudflare Workers integration on **2024-08-31** and moved to a paid Email API. Verified via MailChannels' own End-of-Life notice and Cloudflare Community thread. |
| Sharp image service | Cloudflare Images | If you want on-demand resize/format conversion. Costs $5/month for 100k images delivered. Overkill for ~30 hand-curated product photos that can be pre-optimized once. |
| Astro Fonts API (Google + local) | Fontsource | Fontsource works fine via Vite. Use it if the Astro Fonts API surfaces a bug or doesn't support a hand-font format you have. Otherwise the built-in API generates smaller, better-preloaded CSS. |
| Vanilla CSS + scoped Astro `<style>` | Tailwind v4 | Only if you're starting *without* a token file. We're not — `colors_and_type.css` exists. |
| Playwright smoke test | Vitest unit tests | If the site grows substantive client logic (forms, filters, state). Not the case in v1. |
| pnpm | npm | If the founder will ever run installs themselves, switch to npm — pnpm's "this isn't in your dependencies" errors are unfriendly to non-engineers. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@astrojs/cloudflare` v12 or earlier | Targets Pages, won't work with Astro 6 | `@astrojs/cloudflare` v13.5+ |
| Cloudflare Pages (the legacy product) | Adapter has dropped it; Cloudflare is moving investment to Workers | Workers + Static Assets |
| Pages Functions (`functions/api/contact.ts`) | Tied to the legacy Pages model | Single Worker with `run_worker_first: ["/api/*"]` |
| MailChannels free Workers integration | Ended 2024-08-31. Posts using it will silently fail or hit a paywall. | Resend (free tier) |
| Cloudflare Email Service (`send_email` binding) for the contact form | Can only deliver to addresses *verified inside Cloudflare Email Routing*. Cannot email the founder's Gmail. | Resend |
| Sharp image transformation at build time | `workerd` doesn't run Sharp; the adapter rejects it | `passthroughImageService()` + commit pre-optimized WebPs |
| Next.js | Wrong shape for a 5-page static site with zero client interactivity; React-everywhere model fights us | Astro |
| A database (D1, KV) for gallery/pop-ups | Cost, latency, and migration risk for zero benefit on ~30 items the founder edits manually | Markdown/YAML in repo (per `PROJECT.md` decision) |
| Vercel / Netlify | Project decision: Cloudflare account already owns the domain | Cloudflare Workers + Static Assets |
| Plausible / Google Analytics | Plausible costs money; GA needs consent banner | Umami Cloud (free, cookieless) |
| Tailwind | Tokens already exist; second source of truth is brand-drift risk | Vanilla CSS + scoped Astro styles |
| `client:load` on the design skill's components | We don't need React in the browser; sending it would tank Lighthouse on mobile | No directive at all (server-rendered) |
## Stack Patterns by Variant
- Upgrade Resend to the $20/mo Pro tier (50k/mo) or move to Postmark.
- No code change — `resend.emails.send` is identical across tiers.
- Add Sveltia CMS (or Decap) on top of the existing `/src/content/` structure. Both are git-backed, free, and read the same markdown/YAML files. Zero data migration because we chose the file layout deliberately.
- Move from pre-optimized WebPs to Cloudflare Images ($5/mo). Swap `passthroughImageService()` for the Cloudflare Images service. Keep the rest of the stack.
- Add a third Content Collection (`journal`) with the same `glob()` pattern. No new infrastructure.
## Version Compatibility
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `astro@6.2.x` | `@astrojs/cloudflare@13.5.x` | Adapter v13 requires Astro 6. |
| `astro@6.2.x` | `@astrojs/react@5.0.4` | React 5.0 requires Node 22.12+ and Vite 7 (both come with Astro 6). |
| `@astrojs/react@5.0.4` | `react@19`, `react-dom@19` | Stable since `@astrojs/react@4.1.0`. |
| `astro@6.2.x` | `zod@4` | Astro 6 bundles Zod 4. Don't pin Zod 3 — schemas may break. |
| `@astrojs/cloudflare@13.5.x` | `wrangler@4` | Wrangler 4 is the current major. |
| `astro@6.2.x` Fonts API | n/a | Stable as of Astro 6.0 (March 2026). Use `astro/components` `<Font />`. |
## Confidence Notes per Recommendation
| Area | Confidence | Source basis |
|------|------------|--------------|
| Astro 6.2 is current | **HIGH** | Astro blog posts for 6.0 (Mar 2026) and 6.2 (Apr 30 2026) |
| `@astrojs/cloudflare` 13 drops Pages | **HIGH** | Adapter's official integration page states it explicitly |
| Pages deprioritized in favor of Workers + Static Assets | **HIGH** | Cloudflare's own announcement post and migration guide |
| `@astrojs/react@5.0.4` + React 19 + Node 22.12 | **HIGH** | Integration changelog and Astro 6 release notes |
| Sharp doesn't run in `workerd` → use passthrough | **HIGH** | Astro images guide explicitly calls this out for Cloudflare |
| MailChannels free tier ended 2024-08-31 | **HIGH** | MailChannels EOL notice + Cloudflare Community thread |
| Cloudflare Email Service can only send to verified destinations | **HIGH** | Cloudflare's email-routing/send-email-workers docs |
| Resend free tier: 3k/mo, 100/day, 1 domain | **HIGH** | resend.com/pricing |
| Turnstile siteverify URL + payload | **HIGH** | Cloudflare Turnstile docs |
| Workers free: 100k req/day, 10ms CPU, static assets free | **HIGH** | Cloudflare workers/platform/pricing docs |
| Umami `data-*` attributes (`data-website-id`, `data-domains`, etc.) | **HIGH** | docs.umami.is configuration + track-events pages |
| Astro Content Collections v2 `glob()`/`file()` API shape | **HIGH** | Astro content-collections guide |
| `run_worker_first` routing for `/api/*` | **HIGH** | Cloudflare workers/static-assets/binding docs |
| `prettier-plugin-astro@0.14.1` is current | **MEDIUM** | Last release was July 2024 — plugin is mature but not actively versioned. If a newer one exists for Astro 6, upgrade. |
## Sources
- Astro integrations / Cloudflare adapter — https://docs.astro.build/en/guides/integrations-guide/cloudflare/ (HIGH — explicitly states Pages no longer supported)
- Astro 6.0 release blog — https://astro.build/blog/astro-6/ (HIGH — released 2026-03-10, confirms Fonts API stable)
- Astro 6.2 release blog — https://astro.build/blog/astro-620/ (HIGH — released 2026-04-30, current minor)
- Astro Content Collections — https://docs.astro.build/en/guides/content-collections/ (HIGH — current `glob()`/`file()` loader API)
- Astro framework components — https://docs.astro.build/en/guides/framework-components/ (HIGH — confirms no-client-directive renders as static HTML)
- Astro images guide — https://docs.astro.build/en/guides/images/ (HIGH — `passthroughImageService()` for Cloudflare confirmed)
- Astro styling guide — https://docs.astro.build/en/guides/styling/ (HIGH — auto-scoped styles, BaseLayout import pattern)
- `@astrojs/react` changelog — https://github.com/withastro/astro/blob/main/packages/integrations/react/CHANGELOG.md (HIGH — v5.0.4, React 19, Node 22.12)
- Cloudflare full-stack announcement — https://blog.cloudflare.com/full-stack-development-on-cloudflare-workers/ (HIGH — "start with Workers" guidance)
- Cloudflare Pages-to-Workers migration — https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/ (HIGH)
- Cloudflare Workers static-assets binding — https://developers.cloudflare.com/workers/static-assets/binding/ (HIGH — `run_worker_first` semantics)
- Cloudflare Workers pricing — https://developers.cloudflare.com/workers/platform/pricing/ (HIGH — 100k req/day, free static assets, 10ms CPU)
- Cloudflare Turnstile siteverify — https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ (HIGH — endpoint, payload, response shape)
- Cloudflare Email Service Workers — https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/ (HIGH — confirms verified-destinations-only limitation)
- Resend pricing — https://resend.com/pricing (HIGH — 3k/mo, 100/day, 1 domain on free)
- Resend Cloudflare Workers guide — https://resend.com/docs/send-with-cloudflare-workers (HIGH — current API)
- MailChannels End-of-Life notice — https://blog.mailchannels.com/important-update-mailchannels-email-sending-api-for-cloudflare-workers-to-be-terminated/ (HIGH — confirms free tier ended 2024-08-31)
- Umami collect-data + track-events + tracker-configuration — https://docs.umami.is/docs/collect-data, /docs/track-events, /docs/tracker-configuration (HIGH — current attributes and `umami.track()` API)
- Fontsource install — https://fontsource.org/docs/getting-started/install (HIGH — variable-font pattern)
- prettier-plugin-astro — https://github.com/withastro/prettier-plugin-astro (MEDIUM — v0.14.1 July 2024)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| studio-bluemli-design | Use this skill to generate well-branded interfaces and assets for Studio Bluemli — a small jewelry studio in NoPa, San Francisco that makes whimsical, bright, colorful hand-assembled beaded-cluster earrings. This skill produces production-ready or throwaway designs across the website (landing + gallery), Instagram (feed posts, stories, profile), and pop-up posters. It contains essential design guidelines, colors, type, fonts, product photography, and React UI kit components for prototyping. | `.claude/skills/studio-bluemli-design/SKILL.md` |
| sketch-findings-bluemli | Validated design decisions, CSS patterns, and HTML structures from sketch experiments. Auto-load when implementing the gallery surfaces (Phase 2 `/gallery` + `/gallery/<slug>`) or any future per-piece page template. Covers the editorial-plate detail-page layout and the per-status color treatment for the grid. | `.claude/skills/sketch-findings-bluemli/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
