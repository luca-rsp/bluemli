# Phase 4: Analytics, Polish & Launch - Pattern Map

**Mapped:** 2026-05-14
**Files analyzed:** 9 (4 new, 4 modified, 1 verify-only)
**Analogs found:** 7 / 9

## File Classification

| New / Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------------|------|-----------|----------------|---------------|
| `src/layouts/BaseLayout.astro` (MOD) | layout | build-time static render w/ env-aware branching | `src/pages/robots.txt.ts` (env-aware emission via `isProduction()`) | role-different / data-flow-match |
| `src/components/design-skill/GalleryGrid.jsx` (MOD) | component (React, server-rendered as static HTML) | event attribution attribute on `<a>` | self (`src/components/design-skill/GalleryGrid.jsx` current `<a>` element) | exact (attribute-only edit) |
| `src/pages/gallery/[slug].astro` (MOD) | page | event attribution attribute on `<a>` CTA | self (current `.cta-button` + `mailto-fallback` anchors) | exact (attribute-only edit) |
| `src/pages/say-hi.astro` (MOD) | page | event attribution attribute on `<a>` | self (current `.ig-button` + `.mailto > a`) | exact (attribute-only edit) |
| `public/_headers` (NEW) | config (static CDN directive) | declarative per-path HTTP header rules | no existing analog in repo — Cloudflare docs are the only canonical reference | none — use RESEARCH.md verbatim |
| `SETUP-DNS.md` (NEW, repo root) | doc (founder-facing operational) | one-time walkthrough | `CONTENT_EDITING.md` (founder-facing, no-jargon, sentence-case) | role-exact |
| `scripts/check-og-images.sh` (NEW) | utility (Bash script) | one-shot HEAD-check loop over sitemap | `scripts/check-brand-rules.sh` (Bash, `set -uo pipefail`, exit codes) + `scripts/check-seo-output.mjs` (per-URL fetch loop, OK/FAIL printing) | role-match (Bash) + data-flow-match (Node script) |
| `.planning/phases/04-analytics-polish-launch/LAUNCH-REPORT.md` (NEW, exec-time) | doc (audit artifact) | append-only checklist results | no in-repo analog — Phase 3 VERIFICATION.md is the structural cousin | partial — borrow VERIFICATION.md sectioning |
| `astro.config.mjs` (VERIFY ONLY, no edit) | config | n/a | n/a — read-only verification of `site: 'https://studiobluemli.com'` on line 8 | n/a |

## Pattern Assignments

### `src/layouts/BaseLayout.astro` (MOD — Umami snippet)

**Role:** Layout; **Data flow:** Build-time env-aware rendering. New content: env-aware Umami `<script>` tag with `data-domains` computed from `isProduction()`.

**Analog 1 (env-aware pattern):** `src/pages/robots.txt.ts` — same `isProduction()` consumer for branching production vs preview output.

**Imports pattern** (`src/pages/robots.txt.ts` lines 15-17):
```ts
import type { APIRoute } from 'astro';
import { isProduction } from '../lib/site-url';
```

**Env-aware branching pattern** (`src/pages/robots.txt.ts` lines 20-23):
```ts
export const GET: APIRoute = () => {
  const body = isProduction()
    ? 'User-agent: *\nAllow: /\nSitemap: https://studiobluemli.com/sitemap-index.xml\n'
    : 'User-agent: *\nDisallow: /\n';
```

**Apply in BaseLayout.astro frontmatter** (after line 6 `import { Font } from 'astro:assets';`):
```astro
---
import { Font } from 'astro:assets';
import { isProduction } from '../lib/site-url';   // NEW

const UMAMI_ID = import.meta.env.PUBLIC_UMAMI_WEBSITE_ID;
const APEX = 'studiobluemli.com';
const isProd = isProduction();

// In preview, also tag the workers.dev hostname so D-02 verification appears in Umami Realtime.
const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};
const previewRaw = !isProd
  ? (procEnv.CF_WORKERS_URL ?? import.meta.env.PUBLIC_CF_WORKERS_URL ?? '')
  : '';
let previewHostname = '';
try { previewHostname = previewRaw ? new URL(previewRaw).hostname : ''; } catch { /* ignore */ }

const dataDomains = isProd
  ? APEX
  : [APEX, previewHostname].filter(Boolean).join(',');
---
```

**Note the read pattern:** mirrors `src/lib/site-url.ts` lines 73-80 (`resolveAssetBase()`) — read from BOTH `process.env` AND `import.meta.env.PUBLIC_*` because Vite's workerd prerender subprocess only sees PUBLIC-prefixed values.

**Snippet insertion point** (BaseLayout.astro current lines 36-42 region — AFTER the last `<Font />` tag, BEFORE `<slot name="head" />`):

Current shape (BaseLayout.astro lines 30-42):
```astro
<Font cssVariable="--font-display-loaded" preload />
<Font cssVariable="--font-body-loaded" preload />
<Font cssVariable="--font-hand-loaded" preload />

{/* Named slot for per-page <head> additions ... */}
<slot name="head" />
```

After edit:
```astro
<Font cssVariable="--font-display-loaded" preload />
<Font cssVariable="--font-body-loaded" preload />
<Font cssVariable="--font-hand-loaded" preload />

{/* Umami Cloud analytics (LCH-01, D-01, D-02). Cookieless, no consent banner.
    data-domains restricts collection to the apex (production) and the active
    workers.dev preview hostname (pre-cutover only — see Phase 4 D-02). */}
{UMAMI_ID && (
  <script
    async
    src="https://cloud.umami.is/script.js"
    data-website-id={UMAMI_ID}
    data-domains={dataDomains}
  />
)}

<slot name="head" />
```

**Conditional-emission pattern (safe-default):** Mirrors `src/pages/robots.txt.ts` — preview branch is the safer fallback (`Disallow: /` there; here, omit the script entirely when `UMAMI_ID` is undefined). Same "the absence-of-config side is the safe side" stance.

---

### `src/components/design-skill/GalleryGrid.jsx` (MOD — event #1)

**Role:** React component (server-rendered to static HTML); **Data flow:** attribute on `<a>` element.

**Analog:** Self — the `<a className="card" href={...}>` element already exists at line 45.

**Current shape** (lines 44-65):
```jsx
{pieces.map((piece) => (
  <a key={piece.slug} href={`/gallery/${piece.slug}`} className="card" style={{
    background: 'var(--color-surface-card)',
    ...
  }}>
    <img src={piece.photo} ... />
    ...
  </a>
))}
```

**Pattern to apply:** Add ONE attribute, no other changes.

**Edit at line 45:**
```jsx
<a key={piece.slug}
   href={`/gallery/${piece.slug}`}
   className="card"
   data-umami-event="gallery_card_click"
   style={{ ... }}>
```

**Slug name:** `gallery_card_click` (snake_case per RESEARCH.md §Code Examples table). No event-data — the slug click rate is the metric; per-piece breakdown is on the `/gallery/<slug>` IG inquire event.

---

### `src/pages/gallery/[slug].astro` (MOD — event #2)

**Role:** Page; **Data flow:** attribute on `<a>` element.

**Analog:** Self — the IG inquire `<a class="cta-button">` is at line 92.

**Current shape** (lines 91-96):
```astro
<div class="cta-stack">
  <a class="cta-button" href={site.ig_dm_url}>{ctaCopy}</a>
  <span class="mailto-fallback">
    or email <a href={`mailto:${site.contact_email}`}>{site.contact_email}</a>
  </span>
</div>
```

**Edit at line 92:**
```astro
<a class="cta-button"
   href={site.ig_dm_url}
   data-umami-event="inquire_ig_per_piece"
   data-umami-event-piece={slug}>
  {ctaCopy}
</a>
```

**Why `data-umami-event-piece={slug}`:** Per RESEARCH.md §Code Examples Umami event-data pattern — Umami stores any `data-umami-event-*` attribute as event metadata. This makes the dashboard show per-piece inquire counts (the analytic motive for separating per-piece from the generic gallery-card click — see D-01 rationale). `slug` is already in scope (line 34).

**Slug name:** `inquire_ig_per_piece`.

**No edit to the mailto fallback at line 94** — D-01 only specifies the IG inquire event for `/gallery/<slug>`; the per-piece mailto is not in the 4-event set.

---

### `src/pages/say-hi.astro` (MOD — events #3 + #4)

**Role:** Page; **Data flow:** attribute on `<a>` elements.

**Analog:** Self — IG DM button at line 28; mailto at line 32.

**Current shape** (lines 28-34):
```astro
<a class="ig-button" href={site.ig_dm_url}>
  DM me on Instagram <span class="arrow" aria-hidden="true">&rarr;</span>
</a>
<p class="mailto">
  or email <a href={`mailto:${site.contact_email}`}>{site.contact_email}</a>
</p>
```

**Edit at line 28 (event #3):**
```astro
<a class="ig-button"
   href={site.ig_dm_url}
   data-umami-event="say_hi_ig_dm">
  DM me on Instagram <span class="arrow" aria-hidden="true">&rarr;</span>
</a>
```

**Edit at line 32 (event #4):**
```astro
<p class="mailto">
  or email <a href={`mailto:${site.contact_email}`}
              data-umami-event="say_hi_mailto">{site.contact_email}</a>
</p>
```

**Slug names:** `say_hi_ig_dm`, `say_hi_mailto`.

---

### `public/_headers` (NEW)

**Role:** Static CDN config; **Data flow:** declarative per-path header rules. **Analog:** None in repo. RESEARCH.md §Code Examples "`_headers` content (target shape)" is the canonical source.

**Cite the verbatim shape from RESEARCH.md lines 405-446** — covers `/_astro/*` immutable cache, per-image 7-day cache, and global HSTS + CSP + Permissions-Policy + Referrer-Policy + X-Content-Type-Options + HTML max-age=0.

**Convention to copy from existing config files** — `src/pages/robots.txt.ts` lines 1-8 use a 4-block comment header explaining: *what this file is*, *what it gates on*, *related decisions*, *known-fragile pitfalls*. Apply the same header to `_headers`:

```
# Cloudflare Workers Static Assets headers file — LCH-04 / D-08 / D-09 (Phase 4).
# Applies to every static response. Does NOT apply to Worker code (v1 ships no /api/*;
# run_worker_first: ["/api/*"] in wrangler.jsonc is reserved but unrouted).
# Reference: https://developers.cloudflare.com/workers/static-assets/headers/
#
# Order matters: specific paths first, /* last. CF applies each block's headers,
# allowing specific paths to override the global block where header names collide.
```

Then the body per RESEARCH.md.

**No analog for syntax-correctness verification** — recommend planner add a one-line CI assertion (`grep -q '^/\*$' public/_headers || exit 1`) following the same Bash-grep style as `scripts/check-brand-rules.sh`.

---

### `SETUP-DNS.md` (NEW, repo root)

**Role:** Founder-facing operational doc; **Data flow:** static markdown. **Analog:** `CONTENT_EDITING.md` (repo root, founder-facing, no jargon, sentence-case headings, numbered step-lists with the action verb up front).

**Tone/voice excerpts to copy from CONTENT_EDITING.md** (lines 1-3):
```markdown
# Content editing guide

How to add or update gallery pieces and pop-ups using GitHub's website. No code knowledge needed. Every change opens a pull request, which gives you a preview URL to check before merging.
```

**Headings register (CONTENT_EDITING.md lines 19-30):**
```markdown
## Adding a new gallery piece

1. Go to the repo on GitHub.com and open the `src/content/gallery/` folder.
2. Click **Add file → Create new file**.
3. In the filename box, type your slug followed by `/index.md` — for example **`cluster-cobalt/index.md`**.
```

Pattern: `## Verb-led sentence-case heading`. Numbered list with **bold UI element labels**. Inline code for paths and values. One-sentence rationale at the end of the section (parenthetical).

**Skeleton to write:** RESEARCH.md §Code Examples "`SETUP-DNS.md` skeleton (D-06)" lines 635-699 has the verbatim target shape — already in CONTENT_EDITING.md register. Use as-is, refine only word choice for brand-rule compliance (no flower vocabulary; the CI grep at `scripts/check-brand-rules.sh` line 53 enforces this).

**Brand-rule traps to avoid in this doc:**
- No "white" as a color word (`scripts/check-brand-rules.sh` line 22 — pattern `bg-white|background:\s*white` — string `white` outside a CSS context is fine, but a literal `background: white` example would FAIL CI).
- No `flower|petal|floral|bloom|blossom` (line 53). Even in section headings.
- Sentence-case headings (per RESEARCH.md §Project Constraints).

---

### `scripts/check-og-images.sh` (NEW)

**Role:** Utility script; **Data flow:** one-shot HEAD-check loop over sitemap URLs.

**Analog 1 (Bash structure):** `scripts/check-brand-rules.sh` — `#!/usr/bin/env bash`, `set -uo pipefail`, accumulating-failure pattern (`failed=0` then `failed=1` per rule; exit at end).

**Header / strict-mode pattern** (`scripts/check-brand-rules.sh` lines 1-12):
```bash
#!/usr/bin/env bash
# scripts/check-brand-rules.sh — FND-10 brand-non-negotiable enforcement.
#
# Runs as a required status check in .github/workflows/ci.yml. Blocks PR merge
# if any rule fires.
#
# NOT set -e — we want to collect ALL violations before exiting, so a contributor
# sees every needed fix in one CI run.
set -uo pipefail

failed=0
```

**Apply to `check-og-images.sh`:**
```bash
#!/usr/bin/env bash
# scripts/check-og-images.sh — D-04 launch-checklist item 3 (Phase 4).
#
# Walks every URL in the production sitemap-0.xml, extracts og:image, HEAD-checks
# each. Exits non-zero on any 4xx/5xx — gates the launch on every OG-image URL
# resolving cleanly on production.
#
# NOT set -e — collect ALL failures so one report fixes everything.
set -uo pipefail
```

**Analog 2 (per-URL OK/FAIL printing):** `scripts/check-seo-output.mjs` lines 29-35:
```js
let failures = 0;
function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failures += 1;
}
function ok(msg) {
  console.log(`OK: ${msg}`);
}
```

**Apply in Bash form:**
```bash
FAIL=0
for URL in $URLS; do
  # ... do work ...
  if [ "$STATUS" != "200" ]; then
    echo "FAIL: $URL → og:image $OG → HTTP $STATUS"
    FAIL=1
  else
    echo "OK: $URL → $OG (200)"
  fi
done
if [ "$FAIL" -eq 1 ]; then exit 1; fi
```

**Body to write:** RESEARCH.md §Code Examples "OG-image HEAD check" lines 562-594 has the verbatim target shape — uses the same `curl -fsS` + `grep -oE` extraction pattern Phase 3's smoke tests already use.

**Make-executable note:** `scripts/check-brand-rules.sh` ships with `chmod +x` already (per `ls -la` showing `-rwxr-xr-x`). Apply the same to `check-og-images.sh` after `git add`.

---

### `.planning/phases/04-analytics-polish-launch/LAUNCH-REPORT.md` (NEW, written during execution)

**Role:** Audit artifact; **Data flow:** append-only checklist results. **Analog:** None directly in repo — Phase 3 VERIFICATION.md is the structural cousin (per-requirement table with ✓/✗).

**Recommended sectioning** (planner picks final shape during execution):
- `## Launch Checklist Results` — items 1-11 from D-04 with ✓/✗ + one-line note each.
- `## Lighthouse Scores` — table of 6 routes × 4 categories from the `jq` one-liner in RESEARCH.md lines 542-551.
- `## OG-Image Audit` — output of `scripts/check-og-images.sh`.
- `## Founder Phone Checks` — items 9-11 (founder reports yes/no).
- `## Fix Loop` — any in-the-moment fixes applied before re-running.

**Voice:** Same as `.planning/phases/03-page-composition-pop-ups/03-VERIFICATION.md` — concise, factual, command + output, no hedge language.

---

### `astro.config.mjs` (VERIFY ONLY, no edit)

**Role:** Config; **Data flow:** n/a. Read line 8 to confirm `site: 'https://studiobluemli.com'`.

**Already verified during research** (RESEARCH.md D-07 confirmation: line 8 of `astro.config.mjs` reads `site: 'https://studiobluemli.com',`). **No edit required.** Plan should explicitly mark this as a verification step, not an edit step, to prevent accidental drift.

## Shared Patterns

### Env-aware Production Detection

**Source:** `src/lib/site-url.ts` lines 98-121 (`isProduction()`)
**Apply to:** `src/layouts/BaseLayout.astro` (Umami snippet `data-domains` branching) — single source of truth for "are we on production?".

```ts
export function isProduction(): boolean {
  const procBranch = typeof process !== 'undefined' && process.env
    ? (process.env.WORKERS_CI_BRANCH ?? process.env.CF_PAGES_BRANCH)
    : undefined;
  if (procBranch === 'main') return true;

  const procDeployEnv = typeof process !== 'undefined' && process.env
    ? process.env.PUBLIC_DEPLOY_ENV
    : undefined;
  if (procDeployEnv === 'production') return true;

  const viteBranch =
    import.meta.env.WORKERS_CI_BRANCH ??
    import.meta.env.PUBLIC_WORKERS_CI_BRANCH ??
    import.meta.env.CF_PAGES_BRANCH;
  if (viteBranch === 'main') return true;

  const viteDeployEnv = import.meta.env.PUBLIC_DEPLOY_ENV;
  if (viteDeployEnv === 'production') return true;

  return false;
}
```

**Critical rule (Pitfall 2 from `src/lib/site-url.ts` line 14):** Never assign at module top-level — Vite inlines the value at build. ALWAYS wrap env reads inside a function or per-render frontmatter. The BaseLayout Umami snippet reads in the `---` frontmatter (per-render), which satisfies this.

### Reading PUBLIC_-prefixed env vars in two contexts

**Source:** `src/lib/site-url.ts` lines 73-80 (`resolveAssetBase()`)
**Apply to:** Reading the workers.dev preview hostname inside BaseLayout (`CF_WORKERS_URL` / `PUBLIC_CF_WORKERS_URL`).

```ts
const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};
const fromEnv =
  procEnv.CF_PAGES_URL ??
  import.meta.env.PUBLIC_CF_PAGES_URL ??
  procEnv.CF_WORKERS_URL ??
  import.meta.env.PUBLIC_CF_WORKERS_URL ??
  procEnv.PUBLIC_SITE_URL ??
  import.meta.env.PUBLIC_SITE_URL;
```

**Why both:** Vite's workerd prerender subprocess only sees `PUBLIC_`-prefixed values; the Node-side build sees raw `CF_WORKERS_URL`. Reading both handles every Cloudflare-supplied path.

### Conditional emission with safe-default

**Source:** `src/pages/robots.txt.ts` lines 20-23 (env-aware branching where the "absent / preview" branch is the safer default).
**Apply to:** Umami `<script>` rendering — when `PUBLIC_UMAMI_WEBSITE_ID` is undefined (local dev / misconfig), emit NOTHING rather than an undefined-id script tag that 4xxs forever.

```astro
{UMAMI_ID && (
  <script async src="..." data-website-id={UMAMI_ID} data-domains={dataDomains} />
)}
```

Same shape as `isProduction() ? safe : disallow`: the absence-of-config side is the safe side.

### `data-umami-event` attribute (no JS needed)

**Source:** Umami docs (cited in RESEARCH.md §Pattern 3) — no in-repo analog (this is a new dependency).
**Apply to:** All 4 events. Single attribute; no `client:` directive on any component; preserves the Phase 1 "no client-side React" contract enforced by `scripts/check-no-hydration.sh`.

```jsx
<a href={url} data-umami-event="<slug>">…</a>
```

For per-piece tracking, add `data-umami-event-<key>={value}` siblings:
```astro
<a href={url}
   data-umami-event="inquire_ig_per_piece"
   data-umami-event-piece={slug}>…</a>
```

### Founder-facing doc voice

**Source:** `CONTENT_EDITING.md` (entire file is the register reference)
**Apply to:** `SETUP-DNS.md`.

Conventions:
- **Sentence-case headings** with verb-led phrasing (`## Adding a new gallery piece`, `## Going live with studiobluemli.com`).
- **Numbered steps** with the action verb first (`1. Go to ...`, `2. Click ...`).
- **Bold UI element labels** (`**Add file → Create new file**`, `**Settings**`).
- **Inline code for paths, filenames, exact values** (`` `cluster-cobalt/index.md` ``).
- **Plain prose between steps** when something needs explaining — no jargon, one or two sentences max.
- **Tables for reference cards** — `| Field | Example | Notes |`.
- **No emoji** (per Phase 1 voice rules; carried forward in CONTEXT.md "Carrying Forward").

### Script header convention (Bash)

**Source:** `scripts/check-brand-rules.sh` lines 1-12 — file-name comment line, one-line description, then "what gates on it / what blocks on failure", then `set -uo pipefail` with a rationale comment for why NOT `set -e`.
**Apply to:** `scripts/check-og-images.sh`.

### OK/FAIL accumulating-failure pattern

**Source:** `scripts/check-seo-output.mjs` lines 29-35 (Node) + `scripts/check-brand-rules.sh` lines 13, 31-32, 125-128 (Bash).
**Apply to:** `scripts/check-og-images.sh`. Print one line per check, accumulate `FAIL=1` on any failure, exit with that flag at end. Never `exit 1` mid-loop — collect everything.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `public/_headers` | static CDN config | declarative per-path HTTP headers | First headers file in the repo. Use RESEARCH.md §Code Examples "_headers content" verbatim shape; cite Cloudflare docs (`developers.cloudflare.com/workers/static-assets/headers/`). |
| `.planning/phases/04-analytics-polish-launch/LAUNCH-REPORT.md` | audit artifact | append-only checklist results | Phase-4-specific output written at execution time; structural cousin is Phase 3 VERIFICATION.md but the content is new. |

For both: RESEARCH.md is the planner's source of truth, not the codebase.

## Metadata

**Analog search scope:**
- `src/layouts/`
- `src/lib/`
- `src/pages/` (5 routes + robots.txt.ts + gallery/[slug].astro)
- `src/components/design-skill/` (GalleryGrid.jsx, Header.jsx)
- `scripts/` (11 files — Bash + Node)
- repo root (`CONTENT_EDITING.md`, `CLAUDE.md`, `astro.config.mjs`, `wrangler.jsonc`)
- `public/` (no existing `_headers` or similar)

**Files scanned:** 14 read in full or targeted.

**Pattern extraction date:** 2026-05-14

---

## PATTERN MAPPING COMPLETE

**Phase:** 04 - Analytics, Polish & Launch
**Files classified:** 9 (4 new, 4 modified, 1 verify-only)
**Analogs found:** 7 / 9

### Coverage
- Files with exact analog: 4 (the three event-attribute edits are self-analogs; `SETUP-DNS.md` borrows `CONTENT_EDITING.md` register)
- Files with role-match analog: 3 (`BaseLayout.astro` env-aware pattern from `robots.txt.ts`; `scripts/check-og-images.sh` from `check-brand-rules.sh` + `check-seo-output.mjs`; `LAUNCH-REPORT.md` from Phase 3 VERIFICATION.md)
- Files with no analog: 2 (`public/_headers` — first headers file in repo; planner uses RESEARCH.md verbatim. `LAUNCH-REPORT.md` content is new but structure mirrors Phase 3 VERIFICATION.md.)

### Key Patterns Identified
- **`isProduction()` from `src/lib/site-url.ts` is the single source of truth for env-aware branching** — Umami `data-domains` reuses it exactly (no second helper, no re-implementation). Same gate `robots.txt.ts` already uses.
- **Read PUBLIC_-prefixed env vars from BOTH `process.env` AND `import.meta.env`** — Vite's workerd prerender phase doesn't see `process.env` for non-PUBLIC vars; the `resolveAssetBase()` pattern at `src/lib/site-url.ts:73-80` is the canonical shape.
- **`data-umami-event` attributes on existing `<a>` elements — no JS, no `client:` directive, no new components.** Preserves the Phase 1 zero-client-React contract enforced by `scripts/check-no-hydration.sh`.
- **Founder-facing docs follow `CONTENT_EDITING.md` voice:** sentence-case verb-led headings, numbered steps with bold UI labels, inline code for values, plain prose, no jargon, no emoji. `SETUP-DNS.md` slots into this exact register.
- **Bash scripts under `scripts/` use `set -uo pipefail` (NOT `set -e`)** so all failures collect into one report; OK/FAIL line-per-check; final exit reflects accumulated state.

### File Created
`/Users/lucacanonica/Documents/projects/bluemli/.planning/phases/04-analytics-polish-launch/04-PATTERNS.md`

### Ready for Planning
Pattern mapping complete. Planner can now reference analog patterns + concrete code excerpts when writing PLAN.md actions for Phase 4.
