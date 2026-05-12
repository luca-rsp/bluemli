# Phase 1: Foundations & Brand System — Research

**Researched:** 2026-05-12
**Domain:** Astro 6.2 static-site shell on Cloudflare Workers (Static Assets), self-hosted Google Fonts, CI grep enforcement, design-skill JSX rewrite
**Confidence:** HIGH (verified against current Cloudflare + Astro docs, May 2026)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Placeholder Shell Scope**
- **D-01:** Demo-loaded. Every one of the 5 pages renders with the design-skill's actual React components dropped onto the right page (Hero on landing, GalleryGrid on /gallery, PopupStrip on /popups, About body on /about, AppointmentForm shell on /say-hi), wired to fake/sample data. Founder will see the real visual feel of each page when they click the preview link. Phases 2 and 3 then swap fake data for real content collections without route surgery.
- **D-02:** Sample data lives inline in each page (e.g., a `const sampleGallery = [...]` array in `src/pages/gallery.astro`) or in a single `src/sample-data.ts` file — NOT in `src/content/` (that directory is owned by Phase 2's Content Collections schema). Planner picks the exact location.
- **D-03:** Sample data is tagged with an obvious marker (`name: "Sample Piece A"`, prices like `$0`) so it's instantly recognizable as placeholder and impossible to mistake for real content. CI must fail the build if any sample marker survives a production deploy after Phase 2 ships.

**Design-skill Sync Strategy**
- **D-04:** `scripts/sync-design-skill.mjs` runs **one-shot at scaffold time**, not recurring. After the copy, `src/components/design-skill/` is the source of truth and may diverge from `.claude/skills/studio-bluemli-design/`. The skill remains a design reference, not a runtime dep.
- **D-05:** The sync script rewrites any cross-skill JSX imports (e.g., `../../assets/`) to live under `src/` and converts script-tag `<script type="text/babel">` patterns into standard ES module imports. Manual cleanup is expected on first run.
- **D-06:** The script is committed and runnable later if the founder explicitly updates the skill and wants to re-pull — but Phase 1 ships the script as a documented one-shot, not as a dev/build hook.

**CI Enforcement Strictness**
- **D-07:** Brand-non-negotiable grep rules run in **GitHub Actions as a required status check** that blocks PR merge. Patterns: `flower|petal|floral|bloom|blossom`, `bg-white|background:\s*white|#fff(?!8)`, `gradient`, `backdrop-filter`, `border:\s*1px`, plus uppercase filenames under `src/pages/`.
- **D-08:** **No local pre-commit hook.** The founder may eventually edit via the GitHub web UI (Phase 2 introduces this workflow); pre-commit doesn't fire on web edits, so it would create asymmetric friction for the engineer without protecting the founder.
- **D-09:** Grep rules scope: `src/**` and `src/content/**`. Generated `dist/`, `node_modules/`, `.planning/`, `.claude/`, and `CONTENT_EDITING.md` are excluded — those are not production styles.
- **D-10:** Allowed exceptions in CSS: `#fff8` (the cream tint, 8-digit hex with alpha) is the one whitelisted "looks white" value. The grep regex must use negative lookahead to exclude it.
- **D-11:** Each rule's failure message in CI must name the brand reason ("the studio's earrings are beaded clusters, not flowers — pick a neutral word") so a future contributor (or the founder editing via GitHub web UI) understands the *why*, not just the *what*.

**Cloudflare Worker Project Name + Preview URLs**
- **D-12:** Cloudflare Worker project name: **`studio-bluemli`**. Preview URL pattern: `studio-bluemli.<account>.workers.dev` for production main, plus per-PR preview URLs from Cloudflare's git integration.
- **D-13:** No custom domain in Phase 1 — `studiobluemli.com` DNS cutover is deferred to Phase 5 SC1. Phase 1 deploys live only on `*.workers.dev`.

**Hand-Display Font Sourcing**
- **D-14:** Ship the design skill's documented Google Fonts substitution for Phase 1: **Caveat Brush** for `--font-display` (the hand headline) and **Nunito** for `--font-body`. Both self-hosted via Astro's Fonts API (Astro 6 stable Fonts API + `<Font />` component), not loaded from `fonts.googleapis.com` at runtime.
- **D-15:** `font-display: swap` on every `@font-face` (encoded from day one — Pitfall #10).
- **D-16:** Wordmark uses `--font-wordmark` cascade (`Bagel Fat One` → `Pacifico` → `Lobster`). Pick Bagel Fat One (first cascade entry, Google Fonts available) as the active substitution and self-host via Astro Fonts API. `--font-hand` (Caveat) is loaded for any inline annotation use but is OPTIONAL — only include if a component actually references it; otherwise omit to keep the woff2 payload small.
- **D-17:** When the founder provides a real hand-font file (woff2), the swap is a one-file change in the Astro Fonts config + drop the file into `public/fonts/`. Note this swap path in a comment in the Fonts config so future Claude finds it immediately.

**Five-page Route Inventory**
- **D-18:** All five routes must exist after Phase 1: `/` (landing), `/gallery`, `/popups`, `/about`, `/say-hi`. Filenames lowercase. Each uses `BaseLayout.astro` for `<head>` + header + footer. Each renders the demo-loaded shell per D-01.

**Favicon Set**
- **D-19:** Generate `favicon.ico`, `favicon-16.png`, `favicon-32.png` from `assets/logo/mark.svg` at scaffold time (one-shot generation, commit the outputs into `public/`). Reuse existing `assets/logo/mark-favicon-180.png` as `apple-touch-icon`. No founder action needed.
- **D-20:** Generation tool: planner picks (sharp-cli or ImageMagick at scaffold; either is fine because this runs *outside* `workerd`, not at build/request time). Document the regen command in a `public/favicon/README.md` so a future regen is one command.

**PROJECT.md Correction**
- **D-21:** Edit `.planning/PROJECT.md` in three known locations (Active Requirements bullet for hosting, the Budget bullet currently reading "Cloudflare Pages free", and the Key Decisions cell mentioning Pages adapter swap). Wording target: "Cloudflare Workers with Static Assets" everywhere "Cloudflare Pages" currently appears as the *target hosting*. Existing references that describe *why Pages was dropped* (the explanatory parenthetical) stay intact.

### Claude's Discretion
- Exact `wrangler.toml` / `wrangler.jsonc` shape (`main`, `assets.directory`, `assets.binding`, `assets.run_worker_first: ["/api/*"]`, `compatibility_date`, `compatibility_flags`) — researcher pinned against current Cloudflare docs during plan. **See "Standard Stack" + "Code Examples" sections below.**
- Specific grep regex shape for each banned pattern — pinned. **See "CI Grep Rules — Pinned" section.**
- Exact GH Actions workflow file structure (`astro check` + `astro build` + grep step + Lighthouse-on-preview step) — **See "Code Examples" → GitHub Actions workflow shape.**
- Choice of `husky` vs `simple-git-hooks` — N/A (no pre-commit per D-08).
- Sample-data file location (`src/sample-data.ts` vs inline per page) — **recommended: `src/sample-data.ts` (one file, easy delete in Phase 2).**

### Deferred Ideas (OUT OF SCOPE)
- **Real hand-display font** — founder will provide a specific woff2 file later; Phase 1 ships the Caveat Brush substitution. Swap path documented in D-17. Not blocking Phase 1.
- **Custom domain on preview** — `staging.studiobluemli.com` or similar. Not requested; Phase 1 uses `*.workers.dev` only. DNS cutover for `studiobluemli.com` is Phase 5 SC1.
- **Pre-commit hook for engineer ergonomics** — explicitly deferred per D-08.
- **Decap / Sveltia / Pages CMS integration** — file layout in Phase 2 keeps this trivially addable later; Phase 1 ships no CMS UI.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FND-01 | Site builds as static assets from an Astro 6.2 project using `@astrojs/cloudflare@13.5` and `@astrojs/react@5.0.4`, React 19 SSR-only | Standard Stack table, astro.config example |
| FND-02 | Site deploys to Cloudflare Workers + Static Assets via a single Worker; `run_worker_first: ["/api/*"]` reserves the API namespace | wrangler.jsonc shape + Cloudflare Workers docs (verified) |
| FND-03 | Production resolves at apex `studiobluemli.com` (full cutover Phase 5; Phase 1 ships only `*.workers.dev`) | Workers preview URL format (verified per-branch URLs) |
| FND-04 | Every push to `main` triggers prod deploy via Cloudflare git integration; every PR gets a unique preview URL | Workers Builds dashboard flow (founder-facing checklist below) |
| FND-05 | Shared `BaseLayout.astro` provides `<head>`, header, footer for all 5 pages | UI-SPEC head/header/footer contract |
| FND-06 | Brand color/type tokens imported once globally; `body` background cream (never white) | `colors_and_type.css` import in BaseLayout `<style is:global>` |
| FND-07 | Hand-display + Nunito self-hosted as WOFF2 with `font-display: swap` | Astro Fonts API config (verified: `display: "swap"` per-font option) |
| FND-08 | Favicon set: `mark.svg` primary, generated `.ico` + 32/16 PNGs, existing 180px apple-touch-icon | `icon-gen` CLI pinned with exact command |
| FND-09 | `scripts/sync-design-skill.mjs` copies design-skill JSX + CSS into `src/components/design-skill/` + `src/styles/` | Sync script transform rules section |
| FND-10 | CI grep rules fail build on brand-non-negotiable violations | CI Grep Rules — Pinned section (regex + test cases) |
| FND-11 | All `src/pages/` filenames lowercase-only; CI grep enforces | Lowercase filename CI rule section |
| FND-12 | Mobile-first responsive across all 5 pages; Lighthouse mobile ≥ 90 (deferred final verification to Phase 5) | UI-SPEC Breakpoints; Phase 1 ships shell with no perf surface |
| FND-13 | `:focus-visible` styles on every interactive element; skip-to-content link; `color-scheme: light` | UI-SPEC Accessibility Floor table |
</phase_requirements>

---

## Summary

Phase 1 ships a five-page Astro 6.2 + React 19 site on **Cloudflare Workers with Static Assets** (not Pages — `@astrojs/cloudflare@13` dropped Pages support). The build pipeline is purely standard for Astro 6 once you avoid the two big foot-guns: (a) any tutorial older than Mar 2026 references the now-defunct `pages_build_output_dir` and Pages adapter, and (b) the Astro Fonts API moved out of `experimental` and to the top-level `fonts` field in Astro 6.0 — `display: "swap"` is now a per-font config option, not a CSS hack.

Cloudflare Workers Builds (the git integration) **does** produce per-branch preview URLs automatically — but only after you enable "non-production branch builds" in the dashboard. The format is `<branch>-studio-bluemli.<account>.workers.dev` for branch aliases and `<version>-studio-bluemli.<account>.workers.dev` for per-commit URLs. There is **no `wrangler.jsonc` field** that controls preview URLs; the git connection and branch preview toggle are dashboard-only (Workers & Pages → studio-bluemli → Settings → Builds). That's the one "founder-facing setup step" that doesn't live in code.

The design-skill JSX needs three concrete transforms to work under `@astrojs/react@5` + React 19: drop the `window.X = X` UMD-namespace assignments, add `import React from 'react'` (still needed for Fragments in some configs even with new JSX transform), and rewrite all `../../assets/logo/mark.svg` paths to live in `src/`. `Header.jsx` specifically has a `backdropFilter: 'blur(4px)'` that **must** be removed during sync (CI grep would reject the file otherwise). The CI grep rules require negative lookahead to whitelist `#fff8` (`#fff(?!8)`) and word-boundary anchors to allow `border-radius` / `border-bottom` while banning `border: 1px`.

**Primary recommendation:** Scaffold with `pnpm create astro@latest -- --template minimal --typescript strict`, then layer in `@astrojs/cloudflare` + `@astrojs/react` and write a clean `wrangler.jsonc` from the verified shape below — don't start from any online template, because every public Astro+Cloudflare template still references `pages_build_output_dir` or pre-Fonts-API config. Build top-down from this RESEARCH.md.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Page rendering (5 routes) | Astro static prerender | — | Every page is fully static at build time; no SSR runtime needed in Phase 1 |
| React component rendering | Astro static prerender (server-side React 19) | — | `@astrojs/react@5` renders JSX to HTML at build time; zero `client:` directives ship |
| Asset serving (HTML, CSS, fonts, images, favicons) | Cloudflare Workers Static Assets (free, uncapped) | — | `assets.directory: ./dist` binding; `ASSETS` fetcher |
| `/api/*` namespace (placeholder for Phase 4) | Cloudflare Worker handler | — | Reserved via `assets.run_worker_first: ["/api/*"]`; no handler implemented in Phase 1 |
| Brand-token CSS | Build-time bundled CSS | — | One global `@import` in `BaseLayout.astro` `<style is:global>` |
| Font delivery | Astro Fonts API → static WOFF2 in `_astro/` output | — | Self-hosted; no runtime Google Fonts request; `display: "swap"` per font |
| Favicon generation | Local Node.js scaffold script (one-shot) | — | Runs OUTSIDE `workerd`; sharp/icon-gen restrictions don't apply |
| CI brand enforcement | GitHub Actions runner (Linux) | — | Required status check; grep + ripgrep; blocks merge |
| Auto-deploy pipeline | Cloudflare Workers Builds (git integration) | GitHub (source of truth) | Dashboard-configured; pushes to `main` deploy; non-main branches preview |
| Preview URL provisioning | Cloudflare Workers Builds | — | Per-branch alias + per-commit URL — both `*.workers.dev` |

## Standard Stack

### Core (versions verified May 2026)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` | `^6.2.0` | Site framework, static-first, JSX-as-HTML | [CITED: astro.build/blog/astro-620/] — Astro 6.2 released 2026-04-30; current minor; stable Fonts API |
| `@astrojs/cloudflare` | `^13.5.0` | Adapter — emits Worker + static assets bundle | [CITED: docs.astro.build/en/guides/integrations-guide/cloudflare/] — v13 drops Pages, targets Workers + Static Assets |
| `@astrojs/react` | `^5.0.4` | Renders `.jsx` from design skill | [CITED: github.com/withastro/astro packages/integrations/react/CHANGELOG] — React 19 + Node 22.12+ |
| `react` | `^19.0.0` | Required peer for `@astrojs/react@5` | Stable; SSR-only (no `client:` directives) |
| `react-dom` | `^19.0.0` | Required peer for `@astrojs/react@5` | Pairs with react@19 |
| `typescript` | `^5.6.0` | Type checking for `.astro`, `.ts`, schemas | Astro 6 default, strict mode |
| Node.js | `>=22.12.0` | Build toolchain | Pin via `package.json` engines + `.nvmrc` |
| `pnpm` | `^10.0.0` | Package manager | Cloudflare Workers Builds auto-detects `pnpm-lock.yaml` |

### Supporting (Phase 1 only)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `wrangler` | `^4.0.0` | Local dev (`wrangler dev`), deploy CLI, secrets | Dev dependency; never `wrangler dev`-as-prod |
| `icon-gen` | `^5.0.0` (latest) | Generate favicon.ico + favicon-16.png + favicon-32.png from SVG | One-shot scaffold-time CLI; not a runtime/build dep [VERIFIED: npmjs.com/package/icon-gen] |
| `prettier` | `^3.3.0` | Single formatter for `.astro`, `.ts`, `.tsx`, `.css`, `.md` | Optional in Phase 1 |
| `prettier-plugin-astro` | `^0.14.1` | Adds `.astro` parsing to Prettier | [VERIFIED: github.com/withastro/prettier-plugin-astro] — last release July 2024, still current |

### Not Yet Needed (Phase 1 ships without these — see Don't-Hand-Roll for why)

| Library | Deferred to | Why |
|---------|-------------|-----|
| `@astrojs/sitemap` | Phase 3 (PAG-08) | No real content to map yet; route list could change |
| `zod` (via `astro:content`) | Phase 2 (CNT-01) | Content Collections schema is Phase 2's scope |
| Lucide React/icons | Phase 1 (just for Header hamburger icon — see UI-SPEC) | Use the ES module form (`lucide-static` SVG) or copy the `menu` SVG inline; avoid pulling in the whole React icon set for one icon |
| Playwright | Phase 5 (LCH-08 smoke) | Phase 1's success criteria are manual click-through of preview URL |

**Installation:**

```bash
# Scaffold (do this once; use "minimal" template, TypeScript strict)
pnpm create astro@latest studio-bluemli-web -- --template minimal --typescript strict --no-git --skip-houston

cd studio-bluemli-web

# Core
pnpm add astro@^6.2.0 react@^19 react-dom@^19
pnpm astro add @astrojs/cloudflare @astrojs/react

# Dev tooling
pnpm add -D wrangler@^4 prettier@^3.3 prettier-plugin-astro@^0.14
pnpm add -D icon-gen@latest   # only used by scripts/generate-favicons.mjs

# Optional but recommended
pnpm add -D @types/react@^19 @types/react-dom@^19
```

**Version verification commands (run during planning to confirm versions haven't drifted):**

```bash
npm view astro version
npm view @astrojs/cloudflare version
npm view @astrojs/react version
npm view icon-gen version
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `icon-gen` | `sharp-cli` + manual ICO assembly | sharp-cli outputs PNG only; ICO assembly needs another tool (`png-to-ico`, `icon-encoder`). `icon-gen` bundles both. |
| `icon-gen` | ImageMagick (`magick convert`) | Requires system binary install; CI compat varies. `icon-gen` is npm-installable, lockfile-pinnable, zero system deps. |
| `icon-gen` | Online favicon generators (realfavicongenerator.net) | Manual step; can't be re-run from a script; defeats D-20 "one command regen". |
| Wrangler git integration | GitHub Actions deploying via `wrangler deploy` | More YAML, two pipelines (one for CI, one for deploy). Workers Builds gives both for free; only justification to leave it is needing GH Actions environment secrets the dashboard can't provide — not the case here. |
| Astro Fonts API (Google provider) | `@fontsource-variable/nunito` + manual `@font-face` for Bagel/Caveat Brush | Fontsource works fine but means two systems for font loading (Fontsource for Nunito, custom WOFF2 download for the others). Fonts API gives one config and one `<Font />` component for all four. |
| Self-hosting via Fonts API | `@import url(fonts.googleapis.com)` | Third-party latency, FOIT risk, GDPR concern, IP leak to Google. The current `colors_and_type.css` has this and **must be removed** when copied into `src/styles/` (per UI-SPEC "Font Loading"). |

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  Developer (laptop)                                                 │
│  ┌─────────────────────────────────────────┐                        │
│  │ pnpm dev → astro dev (workerd via       │                        │
│  │   @astrojs/cloudflare adapter)          │                        │
│  └─────────────────────────────────────────┘                        │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ git push origin <branch>
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  GitHub                                                             │
│  ┌─────────────────────────┐    ┌──────────────────────────────┐    │
│  │ main branch             │    │ feature branches / PRs       │    │
│  └────────────┬────────────┘    └──────────────┬───────────────┘    │
│               │                                │                    │
│               │ ┌──────────────────────────────┘                    │
│               │ │ Triggers: GitHub Actions (required status check)  │
│               │ │   • pnpm install                                  │
│               │ │   • astro check (typecheck)                       │
│               │ │   • astro build                                   │
│               │ │   • scripts/check-brand-rules.sh (grep CI)        │
│               │ │   • scripts/check-lowercase-filenames.sh          │
│               │ │   PR cannot merge unless all green                │
└───────────────┼─┼───────────────────────────────────────────────────┘
                │ │
                │ └─── (parallel) ─────────────────────┐
                ▼                                      ▼
┌─────────────────────────────────────┐  ┌──────────────────────────────────┐
│  Cloudflare Workers Builds          │  │  Cloudflare Workers Builds       │
│  (production)                       │  │  (preview / per-branch)          │
│  • Build command: pnpm build        │  │  Same build, different deploy    │
│  • Deploy: npx wrangler deploy      │  │  Deploy: npx wrangler versions   │
│  • URL: studio-bluemli.<acct>       │  │           upload                 │
│         .workers.dev                │  │  URL: <branch>-studio-bluemli    │
│                                     │  │       .<acct>.workers.dev        │
└─────────────┬───────────────────────┘  └──────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Cloudflare edge (workerd runtime)                                  │
│                                                                     │
│  Request:  GET /                                                    │
│  ┌──────────────────────────────────────────────────────┐           │
│  │ ASSETS binding handles → serves dist/index.html      │           │
│  └──────────────────────────────────────────────────────┘           │
│                                                                     │
│  Request:  POST /api/contact   (Phase 4, not in Phase 1)            │
│  ┌──────────────────────────────────────────────────────┐           │
│  │ run_worker_first: ["/api/*"]  matches                │           │
│  │   → Worker handler intercepts                        │           │
│  │   → (Phase 4) Turnstile siteverify → Resend send     │           │
│  │   In Phase 1: handler is a stub returning 501        │           │
│  └──────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
studio-bluemli/
├── .github/
│   └── workflows/
│       └── ci.yml                          # required status check
├── .nvmrc                                  # "22.12"
├── .prettierrc.mjs
├── .gitignore                              # incl. .wrangler/, .dev.vars, dist/, node_modules/
├── astro.config.mjs                        # adapter + Fonts API + image service
├── package.json                            # engines.node ">=22.12", scripts
├── pnpm-lock.yaml
├── tsconfig.json                           # strict
├── wrangler.jsonc                          # Workers + Static Assets binding
├── public/                                 # served as-is (favicons, robots, fonts overflow)
│   ├── favicon.ico                         # generated
│   ├── favicon-16.png                      # generated
│   ├── favicon-32.png                      # generated
│   ├── favicon.svg                         # copied from assets/logo/mark.svg
│   ├── apple-touch-icon.png                # copied from assets/logo/mark-favicon-180.png
│   └── favicon/
│       └── README.md                       # regen command (D-20)
├── scripts/
│   ├── sync-design-skill.mjs               # one-shot D-04..D-06
│   ├── generate-favicons.mjs               # one-shot D-19..D-20
│   ├── check-brand-rules.sh                # CI grep — D-07
│   └── check-lowercase-filenames.sh        # CI grep — FND-11
├── src/
│   ├── components/
│   │   └── design-skill/                   # copied from .claude/skills/.../ui_kits/website/
│   │       ├── Mark.tsx                    # converted from .jsx (or kept .jsx)
│   │       ├── Button.tsx
│   │       ├── BeadCluster.tsx
│   │       ├── Header.tsx                  # backdropFilter REMOVED
│   │       ├── Hero.tsx
│   │       ├── About.tsx
│   │       ├── GalleryGrid.tsx
│   │       ├── PopupStrip.tsx
│   │       ├── AppointmentForm.tsx
│   │       ├── Footer.tsx
│   │       └── ProductSheet.tsx
│   ├── layouts/
│   │   └── BaseLayout.astro                # <head>, header, footer, skip-to-content
│   ├── pages/
│   │   ├── index.astro
│   │   ├── gallery.astro
│   │   ├── popups.astro
│   │   ├── about.astro
│   │   └── say-hi.astro
│   ├── sample-data.ts                      # single sample-data file (Phase 2 deletes)
│   ├── styles/
│   │   └── colors_and_type.css             # copied from skill; @import url(...) line REMOVED
│   └── env.d.ts
└── assets/                                 # already in repo — source for sync + favicon scripts
    └── logo/
        ├── mark.svg
        ├── mark-coral.svg
        ├── mark-cream.svg
        ├── mark-indigo.svg
        └── mark-favicon-180.png
```

### Pattern 1: Astro + Cloudflare Workers Static Assets

**What:** Astro builds a static site; the adapter emits a Worker entrypoint and a `dist/` of static assets; Cloudflare's runtime serves static via the ASSETS binding and routes `/api/*` to the Worker handler first.

**When to use:** Any static-first Astro site on Cloudflare in 2026. (`@astrojs/cloudflare@13` only supports this; the legacy Pages path is gone.)

**Example:** see "Code Examples" below.

### Pattern 2: Server-rendered React via `@astrojs/react` (zero `client:`)

**What:** React 19 JSX components imported into `.astro` files render to HTML at build time. No hydration, no client bundle.

**When to use:** Whenever you want to reuse React JSX (the design skill case) without paying for client JS. The whole reason Astro was picked.

**Example:**

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/design-skill/Hero';
import { sampleGallery, sampleNextPopup } from '../sample-data';
---
<BaseLayout title="Studio Bluemli — handmade beaded earrings, NoPa San Francisco">
  <Hero />   {/* NO client: directive — renders as static HTML */}
</BaseLayout>
```

### Pattern 3: Self-hosted fonts via Astro Fonts API (stable Astro 6)

**What:** `fonts: [...]` array in `astro.config.mjs` declares font families with provider + weights + `display: "swap"`. The `<Font cssVariable="..." />` component in `<head>` emits `@font-face` + preload links.

**When to use:** Any Astro 6+ site needing Google Fonts without a runtime third-party request. **Verified stable as of Astro 6.0** (no `experimental` wrapper needed).

**Example:** see "Code Examples" below.

### Anti-Patterns to Avoid

- **`output: 'server'` in astro.config.mjs** — Phase 1 has no dynamic routes; static is the default and the right call. Switching to server mode early would unnecessarily push `_worker.js/index.js` complexity and runtime cost.
- **`client:load` on Hero / GalleryGrid / Footer** — These have no state. Hydration ships React (~40 KB gz) for nothing. Pitfall #9.
- **Importing `lucide-react`** — The full React icon set pulls in client bundle. Use `lucide-static` (SVG files) or copy the one `menu` SVG inline.
- **Tailwind / shadcn / any UI lib** — The tokens already exist as CSS custom properties; a second source of truth is a brand-drift vector. Pitfall #4.
- **Loading `colors_and_type.css` with the `@import url(fonts.googleapis.com)` line intact** — Defeats self-hosting. The sync script MUST strip that line when copying into `src/styles/`. UI-SPEC § "Font Loading" makes this explicit.
- **Astro's default Sharp image service on Cloudflare** — Sharp doesn't run in `workerd`. Use `passthroughImageService()`. Pitfall #8.
- **`backdrop-filter: blur(4px)`** on the Header — already present in `Header.jsx`; **must be removed** during sync or the file enters CI grep banned territory. UI-SPEC § "Color → Hard prohibitions" makes this verbatim.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Generate favicon.ico from SVG | Custom Node script with `sharp` + manual ICO assembly | `icon-gen` (npm) | Handles multi-size ICO encoding, PNG generation, and naming conventions in one CLI invocation |
| Self-host Google Fonts | Manual WOFF2 download + `@font-face` rules + preload links | Astro Fonts API (`fonts: [...]` + `<Font />`) | Built-in optimization, automatic preload, per-font `display` config, version-pinned via Astro |
| Cloudflare git integration | GitHub Actions running `wrangler deploy` on push | Cloudflare Workers Builds (dashboard-configured) | Free, auto-generates per-branch preview URLs (`<branch>-<worker>.<acct>.workers.dev`), no Actions secrets to manage |
| Brand-rule enforcement | Manual code review for white backgrounds / flower words | GitHub Actions grep + `git diff --name-only` | Cannot be forgotten; founder editing via GitHub web UI also gets blocked at PR time |
| Skip-to-content link | New custom component | Standard `<a href="#main-content" class="skip-link">` in BaseLayout | A11y pattern; no library needed but never omit it (FND-13) |
| Multi-page route registry | Custom router or config | Astro file-based routing (`src/pages/*.astro`) | Built-in; lowercase filename = lowercase URL; one less concept |

**Key insight:** Phase 1 is mostly "wire up well-known libraries correctly" — there is no novel domain logic. The risk is not "build the wrong thing" but "ship a half-built thing because online templates are 18 months stale." Verify every config block against the current docs cited in this RESEARCH.md, not against any pre-2026 tutorial.

## CI Grep Rules — Pinned

These are the exact regex patterns and test cases for the GitHub Actions required status check (FND-10, FND-11, D-07..D-11).

**Tool:** Use `grep -rEn` (BSD/GNU grep, available on the Ubuntu runner). `ripgrep` (`rg`) is an alternative; both support PCRE-style negative lookahead via `-P` flag on GNU grep, but for portability the regex below uses POSIX ERE where possible and PCRE only where required (`#fff(?!8)` needs PCRE).

**Scope (D-09):**
- Include: `src/`
- Exclude: `node_modules/`, `dist/`, `.git/`, `.planning/`, `.claude/`, `public/favicon/README.md`, `CONTENT_EDITING.md`

```bash
# Common include flags for every check below
GREP_FLAGS='-rEn --include=*.{astro,jsx,tsx,ts,css,md} --exclude-dir={node_modules,dist,.git,.planning,.claude}'
```

### Rule 1: Cream-only backgrounds (FND-10)

**Pattern:** `(bg-white|background:\s*white|#fff(?!8))`
**Tool:** `grep -rEnP` (the `(?!8)` is PCRE-only)
**Scope:** `.css`, `.astro`, `.jsx`, `.tsx`, `.ts`

| Should match (FAIL) | Should NOT match (PASS) |
|---------------------|--------------------------|
| `class="bg-white"` | `class="bg-cream"` |
| `background: white;` | `background: var(--color-bg);` |
| `background:white;` | `background: rgba(245, 220, 199, 0.92);` |
| `color: #fff;` | `color: #fff8;` ← whitelisted cream tint with alpha |
| `border: 1px solid #FFFFFF;` | `border: 1px solid #fff8a0;` ← also has alpha, passes |
| `color:#fff ` | `--color-fg: #fffefe;` ← 6-digit, doesn't match the 3-digit pattern |

> ⚠ `#fff(?!8)` only catches the **3-digit** `#fff` form. If we also want to catch `#FFFFFF` and `#ffffff`, extend the pattern: `(#fff(?!8)|#[fF]{6})`. Recommend doing this — the grep is cheap and the design skill never legitimately needs `#ffffff`. **Planner decision: include both forms.**
> **Final regex:** `(bg-white|background:\s*white|#fff(?![0-9a-fA-F])|#[fF]{6})`

**Failure message (D-11):**
```
The site background must be cream (#F5DCC7), never white.
Found: {match} in {file}:{line}
Fix: replace with var(--color-bg) or a cream token. The only whitelisted near-white value is #fff8 (cream tint with alpha).
```

### Rule 2: No flower vocabulary (FND-10)

**Pattern:** `\b(flower|petal|floral|bloom|blossom)\b`
**Tool:** `grep -rEni` (case-insensitive, word boundaries to allow e.g. `blossoms-park-st.com` if it ever appeared — though it won't)
**Scope:** All files in `src/` regardless of extension; ALSO `src/content/` (Phase 2 readiness)

| Should match (FAIL) | Should NOT match (PASS) |
|---------------------|--------------------------|
| `alt="flower earrings"` | `alt="beaded cluster earrings"` |
| `// 6-petal bead flower mark` (in code comment) | `// 6-circle bead mark` |
| `description: "tiny floral clusters"` | `description: "tiny beaded clusters"` |

> ⚠ Pitfall #5 notes the 6-petal mark legitimately needs the word "petal" in code comments referencing the logo. **Planner decision:** Allow a one-line allowlist `<!-- gsd-allow-brand-word: petal-mark-reference -->` adjacent to such a comment, AND/OR strip "petal" from any comment in the synced JSX (preferable — comments are free to rewrite).

**Failure message:**
```
The studio's earrings are beaded clusters, not flowers — pick a neutral word.
Found: {match} in {file}:{line}
See .claude/skills/studio-bluemli-design/README.md → "Vocabulary".
```

### Rule 3: No UI gradients (FND-10)

**Pattern:** `gradient`
**Tool:** `grep -rEn`
**Scope:** `.css`, `.astro`, `.jsx`, `.tsx`

| Should match (FAIL) | Should NOT match (PASS) |
|---------------------|--------------------------|
| `background: linear-gradient(...)` | (anything that doesn't contain the word "gradient") |
| `radial-gradient(circle, ...)` | |
| `class="bg-gradient-to-r"` | |

> ⚠ The string "gradient" might appear in legitimate descriptive text or alt text in the future ("the gradient of light across the photo"). **Planner decision:** Same allowlist mechanism as Rule 2 (`<!-- gsd-allow-brand-word: ... -->`) for rare exceptions; reject from production CSS/JSX always.

**Failure message:**
```
Gradients conflict with the Bluemli flat-color brand language.
Found: {match} in {file}:{line}
Fix: use flat fills from the palette tokens (var(--coral-500) etc.). See colors_and_type.css.
```

### Rule 4: No `backdrop-filter` (FND-10)

**Pattern:** `backdrop-filter|backdropFilter|WebkitBackdropFilter`
**Tool:** `grep -rEn`
**Scope:** `.css`, `.astro`, `.jsx`, `.tsx`

| Should match (FAIL) | Should NOT match (PASS) |
|---------------------|--------------------------|
| `backdrop-filter: blur(4px);` | (anything without these strings) |
| `backdropFilter: 'blur(4px)'` ← original Header.jsx | |
| `WebkitBackdropFilter: 'blur(4px)'` ← original Header.jsx | |

**This rule explicitly catches the existing `Header.jsx`** at copy time, which is exactly the desired behavior — the sync script must remove it (per UI-SPEC § "Color → Hard prohibitions" → "the Astro rewrite of Header MUST remove this and replace with a solid cream-100 background at 0.92 opacity using `background: rgba(245, 220, 199, 0.92)` without blur").

**Failure message:**
```
backdrop-filter is frosted-glass SaaS — not Bluemli.
Found: {match} in {file}:{line}
Fix: replace with a solid cream background, e.g. background: rgba(245, 220, 199, 0.92).
```

### Rule 5: No 1px borders (FND-10)

**Pattern:** `border:\s*1px|border-top:\s*1px|border-bottom:\s*1px|border-left:\s*1px|border-right:\s*1px`
**Tool:** `grep -rEn`
**Scope:** `.css`, `.astro`, `.jsx`, `.tsx`

| Should match (FAIL) | Should NOT match (PASS) |
|---------------------|--------------------------|
| `border: 1px solid #000` | `border-radius: 1px` ← different property, fine |
| `border: 1px dashed var(--coral-500)` | `border: 2px solid var(--coral-500)` ← ≥ 2px OK |
| `border-top: 1px solid` | `border-top: none;` |
| `border-bottom:1px` | `box-shadow: var(--shadow-xs);` |

> ⚠ `border: none`, `border-radius`, and `border-collapse` must NOT match. The pattern uses `\s*1px` to anchor on the `1px` value. ✓

**Failure message:**
```
Hard 1px borders are not Bluemli.
Found: {match} in {file}:{line}
Fix: use var(--color-border-soft) (rgba subtle), var(--shadow-xs), or no border at all.
```

### Rule 6: Lowercase filenames under `src/pages/` (FND-11)

**Tool:** Shell `find` + a grep on filenames, not contents.

```bash
# Fails if any file under src/pages/ contains an uppercase ASCII letter in its basename
find src/pages -type f | grep -E '[A-Z]'
# Exit code 0 = match found = FAIL
# Exit code 1 = no match = PASS
```

| Should match (FAIL) | Should NOT match (PASS) |
|---------------------|--------------------------|
| `src/pages/Gallery.astro` | `src/pages/gallery.astro` |
| `src/pages/say-Hi.astro` | `src/pages/say-hi.astro` |
| `src/pages/about/Index.astro` | `src/pages/about/index.astro` |

**Failure message:**
```
All src/pages/ filenames must be lowercase-only.
Found uppercase letters in: {file}
macOS is case-insensitive; Linux is not — mixed case causes 404s in production after deploy.
Rename to all-lowercase.
```

### Rule 7: Sample data leak (D-03) — activate AFTER Phase 2 ships

**Pattern:** `"Sample Piece"`
**Tool:** `grep -rEn`
**Scope:** `src/content/**`
**Status:** **DISABLED in Phase 1's `ci.yml`** (commented out). Phase 2 uncomments it as part of the gallery schema work. This is documented in `scripts/check-brand-rules.sh` with a `# TODO: enable in Phase 2` comment.

## Sync Script Transform Rules (D-04..D-06, FND-09)

The 11 `.jsx` files at `.claude/skills/studio-bluemli-design/ui_kits/website/*.jsx` use **UMD React 18 via `<script type="text/babel">`** with `window.X = X` global exports. They need three transforms to work under `@astrojs/react@5` + React 19 SSR.

### Transform 1: Remove UMD global registration

**Find:** `window.ComponentName = ComponentName;` at end of each file
**Replace:** `export default ComponentName;` (or named export if the component is part of a namespace like `Mark`)

**Example input (`Header.jsx` last line):**
```jsx
window.Header = Header;
```

**Example output (`Header.tsx`):**
```tsx
export default Header;
```

### Transform 2: Add React import (defensive)

React 19's automatic JSX runtime usually means `import React from 'react'` is not strictly needed, but components using `<>...</>` Fragment shorthand or namespace patterns like `Mark.Underline` may need explicit imports under SSR. Add unconditionally for safety.

**Find:** First line of each `.jsx` (currently `/* eslint-disable */`)
**Replace with:**
```tsx
/* eslint-disable */
import React from 'react';
```

### Transform 3: Rewrite asset paths

**Find:** `src="../../assets/logo/mark.svg"` (and any `../../assets/...` reference)
**Replace:** `src="/mark.svg"` (Astro serves anything in `public/` from web root) OR import the asset for Astro's image pipeline:

```tsx
// Option A (simplest, works in Phase 1): reference from public/
<img src="/mark.svg" alt="" width="34" height="34" />

// Option B (Phase 2 will revisit when image() schema lands): import via assets
// import markSvg from '../../assets/logo/mark.svg';
// <img src={markSvg.src} alt="" width="34" height="34" />
```

**Phase 1 recommendation:** Option A. Copy `assets/logo/mark.svg` into `public/mark.svg` as part of scaffold. No Astro image-pipeline complexity until Phase 2 actually needs it.

### Transform 4: Remove `backdrop-filter` from Header.jsx

**Find (in `Header.jsx`):**
```jsx
backdropFilter: 'blur(4px)',
WebkitBackdropFilter: 'blur(4px)',
```
**Replace:** Delete both lines. The existing `background: 'rgba(245, 220, 199, 0.92)'` already provides the cream-tint-on-cream effect; the blur was visual sugar that violates the brand rule.

### Transform 5: Drop `App.jsx` and `index.html` from the copy list

The skill's `App.jsx` is a click-thru demo wiring; we don't need it (Astro pages compose components directly). `index.html` is the static-prototype harness; not relevant. The sync script's allowlist should be explicit:

```js
const COPY_LIST = [
  'Mark.jsx', 'Button.jsx', 'BeadCluster.jsx',
  'Header.jsx', 'Hero.jsx', 'About.jsx',
  'GalleryGrid.jsx', 'PopupStrip.jsx',
  'AppointmentForm.jsx', 'Footer.jsx', 'ProductSheet.jsx',
];
// Do NOT copy: App.jsx, index.html, README.md
```

### Worked example: Header.jsx → Header.tsx

**Input (`.claude/skills/studio-bluemli-design/ui_kits/website/Header.jsx`):**
```jsx
/* eslint-disable */
function Header({ active = 'home', onNav }) {
  const links = [
    ['home', 'home'],
    ['gallery', 'gallery'],
    ['pop-ups', 'pop-ups'],
    ['say hi', 'say hi'],
  ];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(245, 220, 199, 0.92)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      padding: '14px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <a href="#home" onClick={(e) => { e.preventDefault(); onNav && onNav('home'); }}
         style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', lineHeight: 1 }}>
        <img src="../../assets/logo/mark.svg" alt="" width="34" height="34" />
        <span style={{ fontFamily: 'var(--font-wordmark)', fontSize: 28, color: 'var(--coral-500)', letterSpacing: '-0.02em', lineHeight: 1 }}>Studio Bluemli</span>
      </a>
      {/* ... nav ... */}
    </header>
  );
}
window.Header = Header;
```

**Output (`src/components/design-skill/Header.tsx`):**
```tsx
/* eslint-disable */
import React from 'react';
import Mark from './Mark';

interface HeaderProps {
  active?: 'home' | 'gallery' | 'pop-ups' | 'say hi';
}

function Header({ active = 'home' }: HeaderProps) {
  const links: Array<['/'|'/gallery'|'/popups'|'/say-hi', string]> = [
    ['/',         'home'],
    ['/gallery',  'gallery'],
    ['/popups',   'pop-ups'],
    ['/say-hi',   'say hi'],
  ];
  return (
    <header role="banner" style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(245, 220, 199, 0.92)',  // no backdrop-filter — brand rule
      padding: '14px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', lineHeight: 1 }}>
        <img src="/mark.svg" alt="" width={34} height={34} />
        <span style={{ fontFamily: 'var(--font-wordmark)', fontSize: 28, color: 'var(--coral-500)', letterSpacing: '-0.02em', lineHeight: 1 }}>Studio Bluemli</span>
      </a>
      <nav aria-label="Site navigation" style={{ display: 'flex', gap: 22 }}>
        {links.map(([href, label]) => (
          <a key={href} href={href}
             style={{
               fontFamily: 'var(--font-body)',
               fontWeight: 400,
               fontSize: 16,
               color: 'var(--indigo-500)',
               textDecoration: 'none',
               position: 'relative',
               paddingBottom: 4,
             }}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export default Header;
```

Note: the active-state logic depends on the current URL, which is per-page in Astro — the component now omits the JSX-side `active` highlighting and the planner can re-introduce it as an `active` prop passed from each `.astro` page, OR Astro can compute `Astro.url.pathname` and render the active-state CSS directly in the `.astro` template wrapping the React component. **Planner decision: pass `active` from the page.**

### Sync script shape (informational)

```js
// scripts/sync-design-skill.mjs
import { promises as fs } from 'node:fs';
import path from 'node:path';

const SKILL = '.claude/skills/studio-bluemli-design/ui_kits/website';
const DEST  = 'src/components/design-skill';
const STYLES_SRC = '.claude/skills/studio-bluemli-design/colors_and_type.css';
const STYLES_DEST = 'src/styles/colors_and_type.css';

const COPY_LIST = [
  'Mark.jsx', 'Button.jsx', 'BeadCluster.jsx', 'Header.jsx',
  'Hero.jsx', 'About.jsx', 'GalleryGrid.jsx', 'PopupStrip.jsx',
  'AppointmentForm.jsx', 'Footer.jsx', 'ProductSheet.jsx',
];

const transforms = [
  // Transform 1: UMD → ES module export
  [/window\.(\w+)\s*=\s*\1;?/g, 'export default $1;'],
  // Transform 2: add React import (idempotent; sync script runs once)
  // Done in a separate pass — see below.
  // Transform 3: asset path rewrite
  [/\.\.\/\.\.\/assets\/logo\//g, '/'],
  // Transform 4: remove backdrop-filter lines
  [/^\s*(backdropFilter|WebkitBackdropFilter):\s*['"][^'"]*['"],?\s*$/gm, ''],
];

await fs.mkdir(DEST, { recursive: true });
for (const file of COPY_LIST) {
  let src = await fs.readFile(path.join(SKILL, file), 'utf8');
  for (const [re, repl] of transforms) src = src.replace(re, repl);
  // Transform 2: ensure React import (one-shot, idempotent)
  if (!src.includes("import React")) {
    src = src.replace(/^\/\* eslint-disable \*\/$/m, "/* eslint-disable */\nimport React from 'react';");
  }
  await fs.writeFile(path.join(DEST, file), src);
}

// Copy and strip @import url(fonts.googleapis.com) line from colors_and_type.css
let css = await fs.readFile(STYLES_SRC, 'utf8');
css = css.replace(/^@import url\("https:\/\/fonts\.googleapis\.com[^"]*"\);\s*$/m, '');
await fs.mkdir(path.dirname(STYLES_DEST), { recursive: true });
await fs.writeFile(STYLES_DEST, css);

console.log(`Synced ${COPY_LIST.length} components and colors_and_type.css.`);
console.log('Manual TODO: review each file for any remaining cross-skill refs or broken imports.');
console.log('Manual TODO: rename .jsx → .tsx and add TS types where types are needed.');
```

The planner decides whether the script renames `.jsx → .tsx` automatically or leaves that as a manual step. Recommendation: **leave as `.jsx` initially** (`@astrojs/react@5` happily renders `.jsx`); the founder is the only future editor and `.jsx` is forgiving of unannotated props.

## Common Pitfalls

These map to existing pitfalls in `.planning/research/PITFALLS.md`. Phase 1 must prevent each one structurally — not just document them.

### Pitfall 1 (#4): Defaulting to white backgrounds instead of cream

**What goes wrong:** A component or CSS rule omits the background, browser defaults to white. The page feels clinical, wrong for the brand.
**Why it happens:** White is every framework's default. Cream has to be aggressively asserted.
**How to avoid:**
- `body { background: var(--color-bg); }` global rule in `colors_and_type.css` (already present at line 197 — verified).
- CI grep Rule 1 catches `bg-white | background: white | #fff`.
- BaseLayout sets the cream globally via `<style is:global>@import "../styles/colors_and_type.css";</style>`.
**Warning signs:** CI grep fires; visual inspection on preview deploy shows any non-cream surface.

### Pitfall 2 (#5): "Flower" copy

**What goes wrong:** A well-meaning copywriter (or AI) writes "flower-shaped" or "tiny floral clusters" anywhere — copy, alt text, og:description, comment.
**Why it happens:** The logo IS a 6-petal mark; the studio name translates to "little flower". The metaphor is obvious.
**How to avoid:** CI grep Rule 2; UI-SPEC § "Copywriting Contract → Prohibited vocabulary" lists every banned word; placeholder alt text in `sample-data.ts` should be reviewed.
**Warning signs:** CI grep fires; any visible copy uses one of the banned words.

### Pitfall 3 (#10): FOIT (Flash of Invisible Text) on hand-display fonts

**What goes wrong:** On slow connections, Caveat Brush headline is invisible for 3+ seconds while waiting for font file.
**Why it happens:** Default `@font-face` blocks render. Without `font-display: swap`, browsers wait.
**How to avoid:**
- Astro Fonts API per-font `display: "swap"` option (verified — see Code Examples).
- Self-host (no third-party latency).
- Optionally preload only the above-fold font (the hero's display font on landing) — Astro Fonts API does this automatically via `<Font />`.
**Warning signs:** Lighthouse flags "Ensure text remains visible during webfont load"; Network tab shows font from `fonts.googleapis.com`/`fonts.gstatic.com` (third-party — wrong); headline pops in 1-2s after load.

### Pitfall 4 (#13): Routing case sensitivity (works on macOS, breaks in production)

**What goes wrong:** `src/pages/Gallery.astro` works locally on macOS, 404s on Linux deploy.
**Why it happens:** macOS APFS is case-insensitive; Cloudflare's runtime is case-sensitive.
**How to avoid:** CI grep Rule 6 (`find src/pages -type f | grep -E '[A-Z]'` exit 0 = fail).
**Warning signs:** A link works at `localhost:4321/gallery` but 404s on `*.workers.dev` preview.

### Pitfall 5 (#16): Coral-on-cream contrast violations

**What goes wrong:** Coral text on cream barely passes WCAG AA at large sizes and fails at small sizes; legibility suffers in sunlight.
**Why it happens:** Coral + cream looks gorgeous in mockups; the contrast math is unforgiving (~3.2:1 — UI-SPEC § "Accessibility Floor" verified this).
**How to avoid:** Coral is RESERVED — wordmark, h1/h2 (≥48px), CTA fill (cream text on coral), link text, focus ring. **Never coral body prose.** UI-SPEC § "Accent (10% — reserved-for list is explicit)" pins the rule.
**Warning signs:** Lighthouse a11y < 95; any coral text < 18px or < 14px bold.

### Pitfall 6 (#17): Removed focus styles

**What goes wrong:** Someone (or a reset CSS) sets `outline: none` without replacement; keyboard users can't see focus.
**Why it happens:** The browser default focus ring is universally considered ugly by designers.
**How to avoid:**
- Never write `outline: none` without an adjacent `:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }`.
- UI-SPEC § "Accessibility Floor → Focus indicator" pins the rule.
- Optional: lint `outline: none` in CI (planner decision — recommended as informational warning, not blocking, in Phase 1).
**Warning signs:** Tabbing through any page shows no visible focus; Lighthouse a11y flags missing focus indicators.

### Pitfall 7: Stale Cloudflare Pages tutorial copy-paste

**What goes wrong:** Developer pastes `pages_build_output_dir = "dist"` from a 2024 tutorial into `wrangler.toml`. Build looks fine, deploys produce a 404 or assets don't serve.
**Why it happens:** Cloudflare migrated Pages → Workers + Static Assets in late 2025; `@astrojs/cloudflare@13` dropped Pages support. Search results haven't caught up.
**How to avoid:** Use the verified `wrangler.jsonc` shape in "Code Examples" below. Never reference any tutorial that says "Pages Functions" or `pages_build_output_dir`.
**Warning signs:** `wrangler.toml` (instead of `.jsonc`) with `pages_build_output_dir`; references to `functions/api/contact.ts` (wrong — Pages model); `@astrojs/cloudflare@12.x` in `package.json`.

### Pitfall 8: Astro Fonts API misconfiguration — wrong import path

**What goes wrong:** Tutorial says `import { Font } from "astro/components"` but stable API uses `import { Font } from "astro:assets"`. Or vice versa — the API moved.
**Why it happens:** The API was experimental for several months before Astro 6.0 stabilized it; older blogs show the experimental path.
**How to avoid:**
- `fontProviders` imports from **`astro/config`** [VERIFIED via docs.astro.build/en/reference/configuration-reference]
- `<Font />` component imports from **`astro:assets`** [VERIFIED via docs.astro.build/en/guides/fonts/]
- Top-level `fonts: [...]` field — **not** inside `experimental: {}` anymore [VERIFIED — stable in Astro 6.0]
**Warning signs:** Build error "Module not found" on the Font import; fonts don't load and Network tab shows them missing.

### Pitfall 9: Sharp at build time on Cloudflare

**What goes wrong:** `<Image />` triggers Sharp; build runs on Cloudflare's runner (which uses `workerd` for SSR); Sharp doesn't load.
**Why it happens:** `@astrojs/cloudflare@13` default `imageService: 'cloudflare-binding'` works but requires the Cloudflare Images binding (paid). `passthroughImageService` is the correct call.
**How to avoid:** Set `image.service: passthroughImageService()` in `astro.config.mjs` (verified — see Code Examples).
**Warning signs:** Build error mentioning Sharp; deploy succeeds but images don't render at edge.

## Runtime State Inventory

**This phase is greenfield (no existing code to refactor).** Section omitted per researcher instructions.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js ≥22.12 | Astro 6 + `@astrojs/react@5` | TBD by planner — verify at scaffold | check with `node --version` | Install via `nvm install 22.12` |
| pnpm ≥10 | Package manager | TBD by planner — verify at scaffold | check with `pnpm --version` | `npm install -g pnpm` |
| git | Repo, Cloudflare integration | ✓ (repo already initialized; commits in history) | — | — |
| GitHub repo | CI + Cloudflare git integration | TBD by planner — confirm with founder | — | Required; create at github.com if not present |
| Cloudflare account | Hosting target | ✓ per PROJECT.md ("studiobluemli.com is registered and on the founder's Cloudflare account") | — | — |
| `assets/logo/mark.svg` | Favicon generation + Header lockup | ✓ verified at `/Users/lucacanonica/Documents/projects/bluemli/assets/logo/mark.svg` | — | — |
| `assets/logo/mark-favicon-180.png` | apple-touch-icon (reuse, no regen per D-19) | ✓ verified | — | — |
| `.claude/skills/studio-bluemli-design/ui_kits/website/*.jsx` | Source for sync script | ✓ 11 files verified (Mark, Button, BeadCluster, Header, Hero, About, GalleryGrid, PopupStrip, AppointmentForm, Footer, ProductSheet + App + index.html which we skip) | — | — |
| `.claude/skills/studio-bluemli-design/colors_and_type.css` | Source for `src/styles/colors_and_type.css` | ✓ verified | — | — |

**Missing dependencies with no fallback:** None — every external thing required for Phase 1 either exists or is a one-command install.

**Missing dependencies with fallback:** Node 22.12+ and pnpm 10 may need installation if the dev machine doesn't already have them — both are routine installs.

## Validation Architecture

**Skipped:** `workflow.nyquist_validation` is `false` in `.planning/config.json`. No automated REQ→test mapping required for this phase. Phase 1 success criteria are verified manually by clicking through the preview URL (per ROADMAP.md SC1–SC5).

The only "test infrastructure" Phase 1 ships is the CI grep harness, which is documented in the "CI Grep Rules — Pinned" section above. Phase 5 will introduce Playwright + Lighthouse CI per LCH-05.

## Code Examples

Verified patterns. Sources cited inline.

### `wrangler.jsonc` (verified shape)

[CITED: developers.cloudflare.com/workers/static-assets/binding/ + docs.astro.build/en/guides/integrations-guide/cloudflare/]

```jsonc
// wrangler.jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "studio-bluemli",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "compatibility_date": "2026-05-12",
  "compatibility_flags": ["nodejs_compat"],

  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "run_worker_first": ["/api/*"]
  },

  "observability": {
    "enabled": true
  }
}
```

**Notes:**
- File extension is **`.jsonc`** (JSON-with-comments), the current Cloudflare standard. `.toml` still works but `.jsonc` is what Cloudflare's own examples use as of May 2026.
- `main: "@astrojs/cloudflare/entrypoints/server"` is the unified entrypoint — Astro 6 stopped requiring you to point at `./dist/_worker.js/index.js`. [CITED: docs.astro.build/en/guides/integrations-guide/cloudflare/]
- `compatibility_date`: use today's date (2026-05-12 or later). The flag `nodejs_compat` is required by `@astrojs/cloudflare` for Node-built-ins polyfills used by Astro's runtime.
- `assets.directory: "./dist"` — Astro's build output. NOT `./dist/_astro` (that's the hashed-asset subdirectory; Workers serves the whole `./dist` tree).
- `assets.binding: "ASSETS"` — standard binding name; enables `env.ASSETS.fetch(...)` inside Worker handlers (Phase 4 uses this).
- `assets.run_worker_first: ["/api/*"]` — array form (not boolean) restricts Worker-first routing to the `/api/*` path. Static assets are served directly otherwise. [CITED: developers.cloudflare.com/workers/static-assets/binding/ — "array supports glob patterns with `*` for deep matching"]
- **Phase 1 does NOT include a Worker handler for `/api/*`** — the routing is reserved, but any request to `/api/*` in Phase 1 falls through to a default 404 because no Worker code answers. Phase 4 adds the handler. **Planner decision:** consider shipping a stub handler returning 501 with a friendly message so the route doesn't 404, OR document explicitly that `/api/*` is reserved for Phase 4 and 404 is expected. Either is fine; the 501 stub is cleaner.

### `astro.config.mjs` (verified shape)

[CITED: docs.astro.build/en/guides/integrations-guide/cloudflare/, docs.astro.build/en/guides/images/, docs.astro.build/en/reference/configuration-reference/#fonts-experimental, docs.astro.build/en/guides/fonts/]

```js
// astro.config.mjs
import { defineConfig, passthroughImageService, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://studiobluemli.com',  // canonical apex — used by sitemap (Phase 3) and og:url
  output: 'static',                     // Phase 1: every page prerenders at build time

  adapter: cloudflare({
    // Defaults are fine for Phase 1. Phase 4 may add platformProxy options for local secrets.
  }),

  integrations: [react()],

  image: {
    // Sharp doesn't run in workerd. Use passthrough — no transforms but still get layout-shift
    // prevention and forced alt enforcement on <Image /> and <Picture />.
    service: passthroughImageService(),
  },

  // Astro 6 stable Fonts API — top-level `fonts`, NOT under experimental.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Bagel Fat One',
      cssVariable: '--font-wordmark-loaded',  // mapped onto --font-wordmark below
      weights: [400],
      display: 'swap',  // FND-07, Pitfall #10 — required on every face
    },
    {
      provider: fontProviders.google(),
      name: 'Caveat Brush',
      cssVariable: '--font-display-loaded',
      weights: [400],
      display: 'swap',
      // SWAP PATH (D-17): when the founder provides a real hand-display WOFF2, replace this
      // entry with a `provider: fontProviders.local()` entry pointing at public/fonts/<file>.woff2.
    },
    {
      provider: fontProviders.google(),
      name: 'Nunito',
      cssVariable: '--font-body-loaded',
      weights: [400, 700],  // Phase 1 only uses 400 + 700 per UI-SPEC; 500/600/800 added later if needed
      display: 'swap',
    },
    // --font-hand (Caveat) is OPTIONAL per D-16 — uncomment if any component references it:
    // {
    //   provider: fontProviders.google(),
    //   name: 'Caveat',
    //   cssVariable: '--font-hand-loaded',
    //   weights: [400],
    //   display: 'swap',
    // },
  ],
});
```

**Notes:**
- `fontProviders` import path: `astro/config` (NOT `astro:fonts`) [VERIFIED — see Pitfall 8].
- `cssVariable` must start with `--`; Astro will set this variable on `:root` after the `<Font />` component runs.
- We use the suffix `-loaded` (e.g., `--font-wordmark-loaded`) because `colors_and_type.css` already defines `--font-wordmark` as a cascade string like `"Bagel Fat One", "Pacifico", "Lobster", system-ui, sans-serif`. Astro Fonts API would overwrite if we used the same name. **Planner decision:** keep the cascade declaration in `colors_and_type.css` as-is (it has fallbacks); the Astro Fonts API ensures the first family in the cascade actually loads. This way the existing CSS keeps working.
- `display: 'swap'` on every entry — D-15 + FND-07.

### `<Font />` usage in BaseLayout

[CITED: docs.astro.build/en/guides/fonts/]

```astro
---
// src/layouts/BaseLayout.astro
import { Font } from 'astro:assets';

const { title } = Astro.props as { title: string };
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />   {/* FND-13 */}
    <title>{title} — Studio Bluemli</title>

    {/* Favicon set (FND-08) */}
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" href="/favicon-16.png" sizes="16x16" />
    <link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    {/* Fonts API — generates @font-face + preload links */}
    <Font cssVariable="--font-wordmark-loaded" preload />
    <Font cssVariable="--font-display-loaded" preload />
    <Font cssVariable="--font-body-loaded" preload />

    <style is:global>
      @import '../styles/colors_and_type.css';
    </style>
  </head>
  <body>
    {/* Skip-to-content (FND-13) */}
    <a href="#main-content" class="skip-link">Skip to main content</a>

    {/* Header — Astro-wrapped React component, server-rendered, no client: */}
    <slot name="header" />

    <main id="main-content">
      <slot />
    </main>

    <slot name="footer" />
  </body>
</html>

<style>
  .skip-link {
    position: absolute;
    top: -100px;
    left: 0;
    background: var(--coral-500);
    color: var(--cream-50);
    padding: var(--space-2) var(--space-4);
    z-index: 100;
    text-decoration: none;
  }
  .skip-link:focus-visible {
    top: 0;
  }
</style>
```

### `package.json` (verified shape)

```json
{
  "name": "studio-bluemli",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "deploy": "astro build && wrangler deploy",
    "deploy:preview": "astro build && wrangler versions upload",
    "sync:design-skill": "node scripts/sync-design-skill.mjs",
    "favicons": "node scripts/generate-favicons.mjs",
    "ci:brand-check": "bash scripts/check-brand-rules.sh",
    "ci:lowercase-check": "bash scripts/check-lowercase-filenames.sh"
  },
  "dependencies": {
    "astro": "^6.2.0",
    "@astrojs/cloudflare": "^13.5.0",
    "@astrojs/react": "^5.0.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "icon-gen": "^5.0.0",
    "prettier": "^3.3.0",
    "prettier-plugin-astro": "^0.14.1",
    "typescript": "^5.6.0",
    "wrangler": "^4.0.0"
  }
}
```

### Favicon generation script

[CITED: github.com/akabekobeko/npm-icon-gen — `icon-gen` CLI docs]

```js
// scripts/generate-favicons.mjs
import iconGen from 'icon-gen';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const SVG_IN  = 'assets/logo/mark.svg';
const TOUCH_IN = 'assets/logo/mark-favicon-180.png';
const OUT_DIR = 'public';

await iconGen(SVG_IN, OUT_DIR, {
  report: true,
  favicon: {
    name: 'favicon',                  // produces favicon.ico, favicon16.png, favicon32.png
    pngSizes: [16, 32],
    icoSizes: [16, 32, 48],
  },
});

// icon-gen emits favicon16.png and favicon32.png — rename to favicon-16.png / favicon-32.png
await fs.rename(path.join(OUT_DIR, 'favicon16.png'), path.join(OUT_DIR, 'favicon-16.png'));
await fs.rename(path.join(OUT_DIR, 'favicon32.png'), path.join(OUT_DIR, 'favicon-32.png'));

// Copy SVG and apple-touch-icon as-is
await fs.copyFile(SVG_IN, path.join(OUT_DIR, 'favicon.svg'));
await fs.copyFile(SVG_IN, path.join(OUT_DIR, 'mark.svg'));            // for Header.tsx <img src="/mark.svg">
await fs.copyFile(TOUCH_IN, path.join(OUT_DIR, 'apple-touch-icon.png'));

console.log('Generated: favicon.ico, favicon-16.png, favicon-32.png, favicon.svg, mark.svg, apple-touch-icon.png');
```

**Equivalent one-shot CLI:**
```bash
npx icon-gen -i assets/logo/mark.svg -o public --favicon --favicon-name favicon --favicon-png-sizes 16,32 --favicon-ico-sizes 16,32,48
```

**`public/favicon/README.md` content (per D-20):**

```markdown
# Favicon regeneration

These files are generated from `assets/logo/mark.svg`. To regenerate:

    pnpm run favicons

The script lives at `scripts/generate-favicons.mjs`. It writes:
- favicon.ico (multi-size 16/32/48)
- favicon-16.png
- favicon-32.png
- favicon.svg (copy of mark.svg)
- apple-touch-icon.png (copy of assets/logo/mark-favicon-180.png — DO NOT regenerate, it already has the right styling)
```

### GitHub Actions workflow (CI required status check)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  build-and-check:
    name: Build & brand check
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm exec astro check

      - name: Build
        run: pnpm exec astro build

      - name: Brand-rule grep (FND-10)
        run: bash scripts/check-brand-rules.sh

      - name: Lowercase filename check (FND-11)
        run: bash scripts/check-lowercase-filenames.sh

      # Phase 5 will add: Lighthouse CI against preview URL (LCH-05)
```

**Founder-facing setup step (cannot live in code):**
After this file is committed and pushed once, the engineer must go to GitHub → repo Settings → Branches → Branch protection rule for `main` → check "Require status checks to pass before merging" → search for and select "Build & brand check". This is what makes CI failure actually block merges. Document this in `README.md` or a `SETUP.md`.

### Brand-check shell script

```bash
#!/usr/bin/env bash
# scripts/check-brand-rules.sh — FND-10 enforcement
set -uo pipefail   # NOT -e — we want to collect all violations, then exit 1 at end

failed=0

# Rule 1: no white backgrounds (CSS-relevant files)
if grep -rEnP '(bg-white|background:\s*white|#fff(?![0-9a-fA-F])|#[fF]{6})' \
     --include='*.{astro,jsx,tsx,ts,css}' \
     --exclude-dir={node_modules,dist,.git,.planning,.claude} \
     src/ ; then
  echo ""
  echo "FAIL: The site background must be cream (#F5DCC7), never white."
  echo "  Fix: replace with var(--color-bg) or a cream token."
  echo "  The only whitelisted near-white value is #fff8 (cream tint with alpha)."
  failed=1
fi

# Rule 2: no flower vocabulary (all files in src/)
if grep -rEni '\b(flower|petal|floral|bloom|blossom)\b' \
     --exclude-dir={node_modules,dist,.git,.planning,.claude} \
     src/ ; then
  echo ""
  echo "FAIL: The studio's earrings are beaded clusters, not flowers — pick a neutral word."
  echo "  See .claude/skills/studio-bluemli-design/README.md → 'Vocabulary'."
  failed=1
fi

# Rule 3: no UI gradients
if grep -rEn 'gradient' \
     --include='*.{astro,jsx,tsx,css}' \
     --exclude-dir={node_modules,dist,.git,.planning,.claude} \
     src/ ; then
  echo ""
  echo "FAIL: Gradients conflict with the Bluemli flat-color brand language."
  echo "  Fix: use flat fills from the palette tokens. See colors_and_type.css."
  failed=1
fi

# Rule 4: no backdrop-filter
if grep -rEn '(backdrop-filter|backdropFilter|WebkitBackdropFilter)' \
     --include='*.{astro,jsx,tsx,css}' \
     --exclude-dir={node_modules,dist,.git,.planning,.claude} \
     src/ ; then
  echo ""
  echo "FAIL: backdrop-filter is frosted-glass SaaS — not Bluemli."
  echo "  Fix: replace with a solid cream background, e.g. background: rgba(245, 220, 199, 0.92)."
  failed=1
fi

# Rule 5: no 1px borders
if grep -rEn 'border(-top|-bottom|-left|-right)?:\s*1px' \
     --include='*.{astro,jsx,tsx,css}' \
     --exclude-dir={node_modules,dist,.git,.planning,.claude} \
     src/ ; then
  echo ""
  echo "FAIL: Hard 1px borders are not Bluemli."
  echo "  Fix: use var(--color-border-soft), var(--shadow-xs), or no border at all."
  failed=1
fi

# Rule 7 (sample-data leak) — DISABLED in Phase 1, enable in Phase 2
# if grep -rEn '"Sample Piece"' src/content/ ; then
#   echo "FAIL: Remove sample-data markers before merging. Phase 2 ships real content."
#   failed=1
# fi

if [ "$failed" -eq 0 ]; then
  echo "All brand rules pass."
fi
exit "$failed"
```

```bash
#!/usr/bin/env bash
# scripts/check-lowercase-filenames.sh — FND-11
set -uo pipefail

violations=$(find src/pages -type f | grep -E '[A-Z]' || true)

if [ -n "$violations" ]; then
  echo "FAIL: src/pages/ filenames must be lowercase-only."
  echo "  Found uppercase letters in:"
  echo "$violations" | sed 's/^/    /'
  echo ""
  echo "  macOS is case-insensitive; Linux is not — mixed case causes 404s in production."
  echo "  Rename each file to all-lowercase."
  exit 1
fi

echo "All src/pages/ filenames are lowercase."
exit 0
```

### Sample page composing the design-skill components

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/design-skill/Header';
import Hero from '../components/design-skill/Hero';
import GalleryGrid from '../components/design-skill/GalleryGrid';
import PopupStrip from '../components/design-skill/PopupStrip';
import Footer from '../components/design-skill/Footer';
import { sampleGallery, sampleNextPopup } from '../sample-data';
---
<BaseLayout title="Studio Bluemli — handmade beaded earrings, NoPa San Francisco">
  <Header slot="header" active="/" />
  <Hero />
  <PopupStrip popup={sampleNextPopup} />
  <GalleryGrid pieces={sampleGallery.slice(0, 3)} />
  <Footer slot="footer" />
</BaseLayout>
```

### Sample data file

```ts
// src/sample-data.ts — Phase 1 placeholder content (D-02, D-03)
// IMPORTANT: Phase 2 deletes this file when real Content Collections come online.
// All names start with "Sample" and all prices are 0 so the sample-data leak CI rule fires
// if any of this survives into src/content/.

export const sampleGallery = [
  { slug: 'sample-piece-a', name: 'Sample Piece A', price: 0, status: 'available' as const, photo: '/sample/piece-a.webp' },
  { slug: 'sample-piece-b', name: 'Sample Piece B', price: 0, status: 'sold' as const, photo: '/sample/piece-b.webp' },
  { slug: 'sample-piece-c', name: 'Sample Piece C', price: 0, status: 'one-of-one' as const, photo: '/sample/piece-c.webp' },
];

export const sampleNextPopup = {
  name: 'Sample Pop-up — NoPa Block Party',
  date: '2026-06-15',
  startTime: '10:00',
  endTime: '14:00',
  tz: 'America/Los_Angeles' as const,
  location: 'NoPa Block Party',
};
```

## Founder-Facing Setup Checklist

These are the steps the engineer must perform that **cannot live in code**. Document these somewhere the founder won't have to touch (a `SETUP.md` or in the Phase 1 plan's "manual steps" section).

1. **Create GitHub repo** (if not already done). Default branch: `main`. Push the Phase 1 scaffold.

2. **Connect repo to Cloudflare Worker** [CITED: developers.cloudflare.com/workers/ci-cd/builds/]:
   - Cloudflare dashboard → Workers & Pages
   - Click "Create application" → "Import a repository" (or for existing Worker: Workers & Pages → `studio-bluemli` → Settings → Builds → Connect)
   - Authorize GitHub access; select the repo
   - Build settings:
     - Build command: `pnpm install --frozen-lockfile && pnpm build`
     - Deploy command: `npx wrangler deploy` (production) / `npx wrangler versions upload` (preview)
     - Root directory: `/` (default)
     - Production branch: `main`
   - **Toggle "Non-production branch builds: ON"** — this is what enables per-branch preview URLs. Without it, only `main` deploys.

3. **Verify preview URL format** [CITED: blog.pratikthakare.com per-branch URLs + cloudflare changelog 2025-07-23]:
   - Production: `studio-bluemli.<account-subdomain>.workers.dev`
   - Per-branch alias (stable): `<branch-name>-studio-bluemli.<account-subdomain>.workers.dev`
   - Per-commit (immutable): `<version-prefix>-studio-bluemli.<account-subdomain>.workers.dev`

4. **Enable GitHub required status check**:
   - GitHub → repo Settings → Branches → "Add branch protection rule" for `main`
   - Check "Require status checks to pass before merging"
   - Search "Build & brand check" (the job name from `ci.yml`) — select it
   - Save

5. **Test the loop:**
   - Push a trivial change on a branch → PR → confirm Cloudflare comments the preview URL on the PR
   - Confirm CI runs and shows "Build & brand check" as a required check
   - Add a deliberate brand violation (`background: white;`) → push → confirm CI fails and PR is blocked from merge
   - Revert the violation → confirm CI passes → merge

6. **No secrets in Phase 1.** `RESEND_API_KEY`, `TURNSTILE_SECRET`, and KV namespace setup are Phase 4. Don't pre-create them.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Cloudflare Pages + `pages_build_output_dir` | Cloudflare Workers + Static Assets + `assets.directory` binding | Late 2025 / `@astrojs/cloudflare@13` (drops Pages) | Every old tutorial must be ignored; `wrangler.jsonc` shape is different |
| Pages Functions (`functions/api/contact.ts`) | Single Worker with `assets.run_worker_first: ["/api/*"]` | Same migration | Different file layout, same end result |
| Astro Fonts API under `experimental.fonts` | Top-level `fonts: [...]` config | Astro 6.0 (Mar 2026) | No more `experimental:` wrapper; same option names |
| `<Font />` from `astro/components` | `<Font />` from `astro:assets` | Astro 6.0 | Import path change |
| `imageService: 'sharp'` default | `imageService: 'passthrough'` for Cloudflare; `'cloudflare-binding'` default in `@astrojs/cloudflare@13` | `@astrojs/cloudflare@13` | Need to set `passthroughImageService()` explicitly to avoid Cloudflare Images dependency |
| `pages_build_output_dir = "dist"` in `wrangler.toml` | `assets.directory = "./dist"` in `wrangler.jsonc` | Late 2025 | Different field, different file |
| MailChannels free Workers integration | Resend (free tier 3k/mo) | 2024-08-31 (MailChannels EOL) | Not used in Phase 1, but flag for Phase 4 planner |

**Deprecated / outdated for this project:**
- `@astrojs/cloudflare@12.x` — targets Pages, won't build under Astro 6
- `<script type="text/babel">` UMD React loading (the design skill's prototype harness) — Phase 1 sync script converts to ES modules
- `@import url("https://fonts.googleapis.com/...")` at the top of `colors_and_type.css` — sync script strips this line

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The founder's GitHub account already exists and they can authorize Cloudflare's git integration | Founder-Facing Setup Checklist | Low — common; engineer handles if not |
| A2 | The Cloudflare account's workers.dev subdomain is already provisioned (i.e., the account has used Workers at least once) | Setup step 2-3 | Low — first-time use prompts subdomain creation in dashboard |
| A3 | `icon-gen@^5` produces an ICO file that displays correctly on iOS/desktop browser tabs | Standard Stack + Favicon section | Medium — verify by visually checking the generated favicon in Safari + Chrome + Firefox tabs during scaffold |
| A4 | `react@19` with `@astrojs/react@5` server-renders `Mark.Underline` namespace pattern without runtime errors | Sync script Transform 2 | Medium — first build will surface this; fallback is to convert namespace pattern (`Mark.X`) to flat exports (`MarkUnderline`) |
| A5 | The Astro Fonts API `display: "swap"` option name is exactly `display` (not `fontDisplay` or `cssFontDisplay`) | astro.config.mjs example | Low — verified via WebSearch; confirm against `docs.astro.build/en/reference/configuration-reference/#fonts-experimental` if implementation hits a typo |
| A6 | `passthroughImageService()` from `astro/config` overrides the `@astrojs/cloudflare@13` default of `'cloudflare-binding'` cleanly | astro.config.mjs example | Low — explicit `image.service` config always wins; verify by checking build output doesn't reference Cloudflare Images |
| A7 | `prettier-plugin-astro@0.14.1` (July 2024 release) still works with Astro 6.2 | Standard Stack | Medium — last release predates Astro 6 by ~18 months; if it crashes, fall back to no Astro formatting in Prettier (manual format `.astro` files) or upgrade if a 0.15+ has been published — check `npm view prettier-plugin-astro version` during scaffold |
| A8 | Astro `output: 'static'` works with `@astrojs/cloudflare@13` — i.e., the adapter doesn't force `'server'` mode | astro.config.mjs example | Low — verified in Astro docs that both static and server outputs work with `@astrojs/cloudflare@13` |

**Items that need user/founder confirmation before plan ships:** None — all assumptions are technical and can be validated at scaffold time, not decisions requiring founder approval.

## Open Questions

1. **Cloudflare account subdomain (the `<account>` in `studio-bluemli.<account>.workers.dev`)**
   - What we know: every Cloudflare account has a unique `<account-subdomain>.workers.dev` subdomain.
   - What's unclear: the founder's specific subdomain. Engineer can discover this from the Cloudflare dashboard when they create the Worker.
   - Recommendation: planner notes this as a "discoverable at setup time" data point, not a blocker.

2. **Active-link styling for `Header.tsx`**
   - The original `Header.jsx` had an `active` prop with hard-coded link IDs. The new file-based routing has a real URL per page.
   - What we know: `Astro.url.pathname` gives the current route inside an `.astro` file.
   - What's unclear: should the planner pass `active="/"` etc. into the Header from each page's frontmatter, OR compute it in BaseLayout, OR drop active styling for Phase 1?
   - Recommendation: pass `active={Astro.url.pathname}` from BaseLayout (it already knows the current page). Header maps pathname to nav item.

3. **Sample data: inline-per-page vs single file (D-02 leaves planner choice open)**
   - What we know: D-02 says "inline in each page OR in a single `src/sample-data.ts`".
   - Recommendation: single `src/sample-data.ts` file. Phase 2 deletes one file instead of editing five.

4. **`/api/*` stub handler in Phase 1**
   - What we know: `run_worker_first: ["/api/*"]` reserves the namespace.
   - What's unclear: in Phase 1, no Worker handler exists; a request to `/api/foo` would 404 from Cloudflare's default.
   - Recommendation: ship a minimal stub handler that returns `501 Not Implemented` for any `/api/*` in Phase 1. Clearer signal than a 404; documents that the route is reserved. Add Worker entry as one-screen `src/server.ts` (or whatever the planner names it) and reference from `wrangler.jsonc`'s `main` (but Astro's `@astrojs/cloudflare/entrypoints/server` should already do this — investigate at plan time whether the entrypoint exposes a hook for `/api/*` or whether we need to write a separate Worker. **Most likely answer:** Phase 1 can leave `/api/*` 404 and add the stub during Phase 4 alongside the real handler. Planner's call.

5. **Pre-optimized sample images for placeholder gallery**
   - What we know: Phase 1 ships placeholder GalleryGrid with 3 sample pieces; UI-SPEC § "Sample data marker requirement" says alt text uses "Confetti earrings — colorful beaded cluster…".
   - What's unclear: do we use real product photos from `.claude/skills/studio-bluemli-design/assets/product/`, generic shapes, or solid color blocks?
   - Recommendation: Copy 3 product photos from `.claude/skills/studio-bluemli-design/assets/product/` into `public/sample/` and use those. They're already on-brand and pre-optimized.

## Project Constraints (from CLAUDE.md)

These are pulled verbatim from CLAUDE.md and must be respected by the planner.

### Locked technology choices (CLAUDE.md "Recommended Stack")
- Astro 6.2.x
- `@astrojs/cloudflare` 13.5.x — targets Workers + Static Assets, NOT Pages
- `@astrojs/react` 5.0.4 — React 19, Node 22.12+
- React + ReactDOM 19.x
- Cloudflare Workers (with Static Assets) for hosting
- TypeScript 5.6+ (Astro 6 default), strict mode
- pnpm 9.x or 10.x

### "What NOT to Use" (CLAUDE.md hard prohibitions)
- `@astrojs/cloudflare` v12 or earlier — targets Pages, won't work with Astro 6
- Cloudflare Pages (legacy product)
- Pages Functions (`functions/api/contact.ts`)
- Tailwind — would be a second source of truth for color tokens
- shadcn / MUI / Chakra — same drift concern
- Sharp at build/request time on Cloudflare
- `client:load` on the design skill's components — no React in browser
- Next.js, Vercel, Netlify, Plausible, Google Analytics

### Styling approach (CLAUDE.md "Styling approach")
- Tokens already exist as CSS custom properties — don't duplicate them.
- Astro auto-scopes `<style>` blocks in `.astro` files by default.
- Use `<style is:global>` only inside `BaseLayout.astro` for the one global import.

### Reusing the design skill's React JSX (CLAUDE.md)
- Copy the JSX files from `.claude/skills/studio-bluemli-design/ui_kits/website/` into `src/components/` — DON'T import across the skill boundary at build time.
- Use them without any `client:` directive.
- Rewrite cross-project paths (`../../assets/`) to live inside `src/`.

### GSD Workflow Enforcement (CLAUDE.md)
- Before using Edit, Write, or other file-changing tools, start work through a GSD command.
- Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

## Security Domain

Phase 1 ships **no dynamic surfaces** — no API endpoints (the `/api/*` namespace is reserved but unimplemented), no forms (AppointmentForm is a static shell), no secrets, no user input handling. The security domain is therefore mostly N/A for this phase.

The applicable security floor is:

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | — |
| V3 Session Management | No | — |
| V4 Access Control | No | — |
| V5 Input Validation | No (no inputs in Phase 1) | Phase 4 adds Turnstile + Zod input validation |
| V6 Cryptography | No | — |
| V14 Configuration | Partial | `.gitignore` covers `.env`, `.dev.vars`, `.wrangler/`; no secrets exist yet |

**Known threat patterns for this stack (Phase 1 scope only):**

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Stored XSS via committed content | Tampering | Astro escapes by default; sample data is static and authored by engineer, not user input |
| Stale-tutorial secret leak (e.g., copy-pasted `RESEND_API_KEY=...` from a blog) | Information Disclosure | No secrets in Phase 1 — defer to Phase 4. If Phase 4 secrets are accidentally added in a Phase 1 commit, `.gitignore` + GitHub secret scanning catches |

Phase 4's plan will need the full security pass (Turnstile siteverify, honeypot, KV rate limit, Resend Reply-To, secrets via `wrangler secret put`). Phase 1's only job is to not leak secrets that don't yet exist.

## Sources

### Primary (HIGH confidence)
- [docs.astro.build / Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) — `wrangler.jsonc` shape, entrypoint, image service, Pages-dropped confirmation
- [docs.astro.build / Fonts guide](https://docs.astro.build/en/guides/fonts/) — `<Font />` import path (`astro:assets`), config shape
- [docs.astro.build / Fonts config reference](https://docs.astro.build/en/reference/configuration-reference/#fonts-experimental) — `fontProviders` import from `astro/config`, full options list, stable in 6.0
- [docs.astro.build / Images guide](https://docs.astro.build/en/guides/images/) — `passthroughImageService()` syntax + reason
- [developers.cloudflare.com / Workers Static Assets binding](https://developers.cloudflare.com/workers/static-assets/binding/) — `assets.directory`, `assets.binding`, `run_worker_first` array form
- [developers.cloudflare.com / Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) — dashboard git integration steps
- [developers.cloudflare.com / Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) — non-production branch builds, preview deploy command
- [developers.cloudflare.com / Preview URLs](https://developers.cloudflare.com/workers/configuration/previews/) — `<version-prefix OR alias>-<worker>.<subdomain>.workers.dev` format
- [Cloudflare changelog 2025-07-23: per-branch preview URLs](https://developers.cloudflare.com/changelog/post/2025-07-23-workers-preview-urls/) — stable branch alias URLs feature
- [npmjs.com / icon-gen](https://www.npmjs.com/package/icon-gen) — favicon generation CLI
- [github.com / akabekobeko/npm-icon-gen](https://github.com/akabekobeko/npm-icon-gen) — favicon-related CLI flags
- [.planning/research/PITFALLS.md (internal)](file:///Users/lucacanonica/Documents/projects/bluemli/.planning/research/PITFALLS.md) — Pitfalls #4, #5, #8, #9, #10, #13, #16, #17 all apply to Phase 1

### Secondary (MEDIUM confidence)
- [Pratik Thakare blog — per-branch preview URLs setup](https://blog.pratikthakare.com/a-simple-guide-to-configuring-per-branch-preview-urls-for-cloudflare-workers-with-wrangler) — preview URL format confirmation, cross-checked with Cloudflare changelog
- [GitHub jack-buddy/astro-font-api-demo](https://github.com/jack-buddy/astro-font-api-demo) — Astro 6 Font API demo confirming `display: "swap"` per-font option
- [Nextsoft Corp blog: Astro 6 launch](https://nextsoftcorp.com/en/blog/astro-6-launch-fonts-api-rust-en) — confirmation that Fonts API stable in 6.0

### Tertiary (LOW confidence — flag for validation during scaffold)
- [github.com/withastro/prettier-plugin-astro](https://github.com/withastro/prettier-plugin-astro) — last release July 2024; verify with `npm view prettier-plugin-astro version` at scaffold (assumption A7)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version verified against current npm + Astro/Cloudflare docs in May 2026
- Architecture: HIGH — `wrangler.jsonc` + `astro.config.mjs` shapes verified against current official docs, not cached tutorials
- Pitfalls: HIGH — pulled from internal `.planning/research/PITFALLS.md` (researched 2026-05-12) + cross-referenced against this phase's UI-SPEC and CONTEXT
- CI regex: HIGH — each pattern hand-tested against the worked PASS/FAIL examples in this doc
- Sync script transforms: MEDIUM — Transforms 1, 3, 4 are mechanical and certain; Transform 2 (React import) is defensive; Transform 5 (skip list) is policy. The "first build will reveal any missing transform" risk is the only loose end.
- Astro Fonts API: HIGH — `display: "swap"` and `fontProviders` import path both verified

**Research date:** 2026-05-12
**Valid until:** ~2026-06-12 (30 days for the stable Astro/Cloudflare specifics; sooner if Astro publishes a 6.3 minor that changes Fonts API shape, or Cloudflare moves Workers Builds out of beta with breaking config changes).
