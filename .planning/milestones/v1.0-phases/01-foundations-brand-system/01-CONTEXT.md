# Phase 1: Foundations & Brand System - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up the static-site shell — Astro 6.2 + React 19 + Cloudflare Workers (Static Assets) — with all five page placeholders rendering at a `*.workers.dev` URL, design-skill chrome and components on every page, brand non-negotiables enforced by CI grep rules, push-to-`main` triggering production deploys and PRs producing unique preview URLs, the favicon set generated and wired, and PROJECT.md's stale "Cloudflare Pages" wording corrected to "Cloudflare Workers with Static Assets."

**Not in this phase:** real content (Phase 2), per-page composition with real data (Phase 3), `/api/contact` endpoint (Phase 4), Umami + security headers + final DNS cutover to `studiobluemli.com` (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Placeholder Shell Scope
- **D-01:** Demo-loaded. Every one of the 5 pages renders with the design-skill's actual React components dropped onto the right page (Hero on landing, GalleryGrid on /gallery, PopupStrip on /popups, About body on /about, AppointmentForm shell on /say-hi), wired to fake/sample data. Founder will see the real visual feel of each page when they click the preview link. Phases 2 and 3 then swap fake data for real content collections without route surgery.
- **D-02:** Sample data lives inline in each page (e.g., a `const sampleGallery = [...]` array in `src/pages/gallery.astro`) or in a single `src/sample-data.ts` file — NOT in `src/content/` (that directory is owned by Phase 2's Content Collections schema). Planner picks the exact location.
- **D-03:** Sample data is tagged with an obvious marker (`name: "Sample Piece A"`, prices like `$0`) so it's instantly recognizable as placeholder and impossible to mistake for real content. CI must fail the build if any sample marker survives a production deploy after Phase 2 ships.

### Design-skill Sync Strategy
- **D-04:** `scripts/sync-design-skill.mjs` runs **one-shot at scaffold time**, not recurring. After the copy, `src/components/design-skill/` is the source of truth and may diverge from `.claude/skills/studio-bluemli-design/`. The skill remains a design reference, not a runtime dep.
- **D-05:** The sync script rewrites any cross-skill JSX imports (e.g., `../../assets/`) to live under `src/` and converts script-tag `<script type="text/babel">` patterns into standard ES module imports. Manual cleanup is expected on first run.
- **D-06:** The script is committed and runnable later if the founder explicitly updates the skill and wants to re-pull — but Phase 1 ships the script as a documented one-shot, not as a dev/build hook.

### CI Enforcement Strictness
- **D-07:** Brand-non-negotiable grep rules run in **GitHub Actions as a required status check** that blocks PR merge. Patterns: `flower|petal|floral|bloom|blossom`, `bg-white|background:\s*white|#fff(?!8)`, `gradient`, `backdrop-filter`, `border:\s*1px`, plus uppercase filenames under `src/pages/`.
- **D-08:** **No local pre-commit hook.** The founder may eventually edit via the GitHub web UI (Phase 2 introduces this workflow); pre-commit doesn't fire on web edits, so it would create asymmetric friction for the engineer without protecting the founder.
- **D-09:** Grep rules scope: `src/**` and `src/content/**`. Generated `dist/`, `node_modules/`, `.planning/`, `.claude/`, and `CONTENT_EDITING.md` are excluded — those are not production styles.
- **D-10:** Allowed exceptions in CSS: `#fff8` (the cream tint, 8-digit hex with alpha) is the one whitelisted "looks white" value. The grep regex must use negative lookahead to exclude it.
- **D-11:** Each rule's failure message in CI must name the brand reason ("the studio's earrings are beaded clusters, not flowers — pick a neutral word") so a future contributor (or the founder editing via GitHub web UI) understands the *why*, not just the *what*.

### Cloudflare Worker Project Name + Preview URLs
- **D-12:** Cloudflare Worker project name: **`studio-bluemli`**. Preview URL pattern: `studio-bluemli.<account>.workers.dev` for production main, plus per-PR preview URLs from Cloudflare's git integration.
- **D-13:** No custom domain in Phase 1 — `studiobluemli.com` DNS cutover is deferred to Phase 5 SC1. Phase 1 deploys live only on `*.workers.dev`.

### Hand-Display Font Sourcing
- **D-14:** Ship the design skill's documented Google Fonts substitution for Phase 1: **Caveat Brush** for `--font-display` (the hand headline) and **Nunito** for `--font-body`. Both self-hosted via Astro's Fonts API (Astro 6 stable Fonts API + `<Font />` component), not loaded from `fonts.googleapis.com` at runtime.
- **D-15:** `font-display: swap` on every `@font-face` (encoded from day one — Pitfall #10).
- **D-16:** Wordmark uses `--font-wordmark` cascade (`Bagel Fat One` → `Pacifico` → `Lobster`). Pick Bagel Fat One (first cascade entry, Google Fonts available) as the active substitution and self-host via Astro Fonts API. `--font-hand` (Caveat) is loaded for any inline annotation use but is OPTIONAL — only include if a component actually references it; otherwise omit to keep the woff2 payload small.
- **D-17:** When the founder provides a real hand-font file (woff2), the swap is a one-file change in the Astro Fonts config + drop the file into `public/fonts/`. Note this swap path in a comment in the Fonts config so future Claude finds it immediately.

### Five-page Route Inventory
- **D-18:** All five routes must exist after Phase 1: `/` (landing), `/gallery`, `/popups`, `/about`, `/say-hi`. Filenames lowercase. Each uses `BaseLayout.astro` for `<head>` + header + footer. Each renders the demo-loaded shell per D-01.

### Favicon Set
- **D-19:** Generate `favicon.ico`, `favicon-16.png`, `favicon-32.png` from `assets/logo/mark.svg` at scaffold time (one-shot generation, commit the outputs into `public/`). Reuse existing `assets/logo/mark-favicon-180.png` as `apple-touch-icon`. No founder action needed.
- **D-20:** Generation tool: planner picks (sharp-cli or ImageMagick at scaffold; either is fine because this runs *outside* `workerd`, not at build/request time). Document the regen command in a `public/favicon/README.md` so a future regen is one command.

### PROJECT.md Correction
- **D-21:** Edit `.planning/PROJECT.md` in three known locations (Active Requirements bullet for hosting, the Budget bullet currently reading "Cloudflare Pages free", and the Key Decisions cell mentioning Pages adapter swap). Wording target: "Cloudflare Workers with Static Assets" everywhere "Cloudflare Pages" currently appears as the *target hosting*. Existing references that describe *why Pages was dropped* (the explanatory parenthetical) stay intact.

### Claude's Discretion
- Exact `wrangler.toml` shape (`main`, `assets.directory`, `assets.binding`, `assets.run_worker_first: ["/api/*"]`, `compatibility_date`, `compatibility_flags`) — researcher pins against current Cloudflare docs during plan.
- Specific grep regex shape for each banned pattern — planner pins.
- Exact GH Actions workflow file structure (`astro check` + `astro build` + grep step + Lighthouse-on-preview step) — planner decides.
- Choice of `husky` vs `simple-git-hooks` — N/A (no pre-commit per D-08).
- Sample-data file location (`src/sample-data.ts` vs inline per page) — planner picks.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning (always)
- `.planning/PROJECT.md` — Project overview, constraints, key decisions, brand non-negotiables
- `.planning/REQUIREMENTS.md` §FND-01..FND-13 — the 13 foundation requirements traced to Phase 1
- `.planning/ROADMAP.md` §"Phase 1: Foundations & Brand System" — goal, success criteria, key risks/pitfalls
- `.planning/STATE.md` — Locked decisions from prior research (stack pinned, per-slug gallery folders, Resend over MailChannels)
- `CLAUDE.md` — Project conventions, technology stack table, version compatibility matrix, "What NOT to Use"

### Brand & design (Phase 1 enforces these)
- `.claude/skills/studio-bluemli-design/SKILL.md` — Skill entry point, brand fundamentals
- `.claude/skills/studio-bluemli-design/README.md` — Visual foundations, palette, typography rules, font substitutions, file index
- `.claude/skills/studio-bluemli-design/colors_and_type.css` — The color + font tokens. MUST be imported once globally; never duplicated, never extended with new colors or fonts.
- `.claude/skills/studio-bluemli-design/ui_kits/website/` — JSX components to copy into `src/components/design-skill/` (Mark, Button, BeadCluster, Header, Hero, About, GalleryGrid, PopupStrip, AppointmentForm, Footer, ProductSheet)
- `.claude/skills/studio-bluemli-design/ui_kits/website/index.html` — Reference shell showing how the JSX kit composes; use as a layout reference, not a runtime template
- `.claude/skills/studio-bluemli-design/PITFALLS.md` — Pitfalls #8 (Sharp in workerd), #10 (font-display FOIT), #13 (lowercase filenames), #16 (coral contrast), #17 (focus styles) all bear on Phase 1

### Assets (already in repo)
- `assets/logo/mark.svg` — Source SVG for favicon generation and header lockup
- `assets/logo/mark-favicon-180.png` — Existing apple-touch-icon (reuse, do not regenerate)
- `assets/logo/mark-coral.svg`, `mark-cream.svg`, `mark-indigo.svg` — Color variants for contextual use

### External docs to consult during research/planning
- Astro 6 Cloudflare adapter integration page — for `wrangler.toml` shape and current `passthroughImageService()` API
- Cloudflare Workers Static Assets binding docs — for `run_worker_first` semantics
- Astro Fonts API + `<Font />` component docs (stable as of Astro 6.0)
- Cloudflare Pages-to-Workers migration guide — Phase 1 confirms Workers, not Pages

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (this is a greenfield phase — only the design skill and assets exist)
- **Design-skill JSX kit** (`.claude/skills/studio-bluemli-design/ui_kits/website/*.jsx`) — 11 components ready to copy. Currently authored to run via `<script type="text/babel">` against React 18 UMD CDN; the sync script must rewrite to ES module exports usable by `@astrojs/react@5` + React 19.
- **Brand tokens** (`colors_and_type.css`) — Cream palette, hand-font cascade, Nunito stack. Import once globally in `BaseLayout.astro`.
- **Logo SVGs** (`assets/logo/`) — Header lockup uses `mark.svg` + the wordmark cascade; favicon set generated from the same.

### Established Patterns
- **Brand non-negotiables are LAW** — cream-only background, no white, no flower vocabulary, no gradients/backdrop-filter/1px borders. CI enforces (D-07). Planner must never relax these "for ergonomics."
- **No client-side React** — every JSX component renders server-side as static HTML. Adding any `client:load` / `client:idle` / etc. is a regression — would tank mobile Lighthouse.
- **Cloudflare Workers, not Pages** — `@astrojs/cloudflare@13.5` dropped Pages support; any tutorial referencing `pages_build_output_dir` is wrong for this project.
- **`passthroughImageService()`** — Sharp doesn't run in `workerd`. Images are pre-optimized at commit time (Phase 2 codifies the tool). Phase 1's placeholder images: use the existing logo PNGs + any placeholder photos from `.claude/skills/studio-bluemli-design/uploads/` if needed.

### Integration Points
- `src/components/design-skill/` ← `scripts/sync-design-skill.mjs` ← `.claude/skills/studio-bluemli-design/ui_kits/website/`
- `src/styles/colors_and_type.css` ← (copied via sync) ← `.claude/skills/studio-bluemli-design/colors_and_type.css`
- `BaseLayout.astro` imports `colors_and_type.css` once (in `<style is:global>`), wires `<Font />` from Astro Fonts API, renders Header + `<slot />` + Footer
- `wrangler.toml` `assets.run_worker_first: ["/api/*"]` reserves the `/api/*` namespace for Phase 4's contact endpoint — Phase 1 does NOT add a Worker handler, just the routing config
- GitHub repo ↔ Cloudflare Workers git integration — connects in Phase 1 to enable push-to-main production + PR previews

</code_context>

<specifics>
## Specific Ideas

- "Demo-loaded with real chrome" was the founder's pick — preview must look like a real site, not a wireframe. Visual surprise is OK; broken-looking placeholders are not.
- "I'll handle the technical stuff myself" — the founder explicitly delegated sync strategy, CI mechanics, worker naming, and font sourcing to Claude. Don't re-ask these.
- Sample data is throwaway. Phase 2 deletes it the moment real content collections come online.
- The `mark-favicon-180.png` already exists; don't regenerate it. The other favicon sizes do need generation.

</specifics>

<deferred>
## Deferred Ideas

- **Real hand-display font** — founder will provide a specific woff2 file later; Phase 1 ships the Caveat Brush substitution. Swap path documented in D-17. Not blocking Phase 1.
- **Custom domain on preview** — `staging.studiobluemli.com` or similar. Not requested; Phase 1 uses `*.workers.dev` only. DNS cutover for `studiobluemli.com` is Phase 5 SC1.
- **Pre-commit hook for engineer ergonomics** — explicitly deferred per D-08. If a non-founder contributor joins later and wants local enforcement, this can be added without touching Phase 1's CI design.
- **Decap / Sveltia / Pages CMS integration** — file layout in Phase 2 keeps this trivially addable later; Phase 1 ships no CMS UI.

</deferred>

---

*Phase: 1-Foundations & Brand System*
*Context gathered: 2026-05-12*
