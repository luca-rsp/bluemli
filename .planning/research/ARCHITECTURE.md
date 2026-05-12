# Architecture Research

**Domain:** Static marketing/portfolio site (Astro on Cloudflare Pages) with file-backed content, a single serverless contact endpoint, and a separately maintained brand/design system
**Researched:** 2026-05-12
**Confidence:** HIGH (Astro structure, Cloudflare Pages Functions routing, content collections — verified via Context7 and official docs); MEDIUM (design-skill integration pattern — recommendation is opinionated, alternatives noted)

## Standard Architecture

### System Overview

Two-runtime split: a build-time content compiler (Astro) that turns markdown + JSX + photos into static HTML/CSS/optimized images, and a single runtime endpoint (Cloudflare Pages Function) that handles the contact form. The design skill is a sibling artifact, not a dependency — it is the canonical source the site copies from at scaffold time.

```
┌─────────────────────────────────────────────────────────────────────┐
│                       AUTHOR / FOUNDER                              │
│   (edits markdown frontmatter + drops product photos via git)       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ git push to main
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 BUILD TIME — Cloudflare Pages CI                    │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ src/pages  │  │ src/content/ │  │ src/assets/  │  │ src/       │ │
│  │ (.astro)   │  │ gallery/     │  │ product/     │  │ components │ │
│  │            │  │ popups/      │  │ logo/        │  │ (Astro+JSX)│ │
│  └─────┬──────┘  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘ │
│        │                │                  │                │        │
│        └────────┬───────┴──────────────────┴────────────────┘        │
│                 ▼                                                    │
│        ┌──────────────────┐    ┌─────────────────────────────────┐  │
│        │ astro:content    │ ←─ │ src/content.config.ts (Zod)     │  │
│        │ collection API   │    │ defines gallery, popups schemas │  │
│        └─────────┬────────┘    └─────────────────────────────────┘  │
│                  ▼                                                   │
│        ┌──────────────────────────────────────────────────────┐     │
│        │  astro build  →  dist/  (static HTML + hashed CSS    │     │
│        │                          + optimized .webp images)   │     │
│        └─────────────┬────────────────────────────────────────┘     │
│                      │                                              │
│                      ▼                                              │
│            ┌─────────────────────┐                                  │
│            │ functions/api/      │  (TypeScript, untouched by       │
│            │   contact.ts        │   astro build, deployed as       │
│            └─────────────────────┘   Pages Function)                │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  RUNTIME — Cloudflare Edge                          │
│  ┌──────────────────────────────┐    ┌───────────────────────────┐  │
│  │  Static assets (dist/)       │    │  /api/contact (Function)  │  │
│  │  served from CF Pages CDN    │    │  validates Turnstile +    │  │
│  │  → studiobluemli.com         │    │  calls Resend, returns    │  │
│  │                              │    │  JSON, same-origin (POST) │  │
│  └─────────┬────────────────────┘    └────────┬──────────────────┘  │
│            │                                  │                     │
│            ▼                                  ▼                     │
│  ┌──────────────────────────────┐    ┌───────────────────────────┐  │
│  │  Umami Cloud (analytics)     │    │  Resend / Mailchannels     │  │
│  │  one <script> in <head>      │    │  → founder's inbox         │  │
│  └──────────────────────────────┘    └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

           SIBLING (not imported at build time):
           ┌──────────────────────────────────────────┐
           │ .claude/skills/studio-bluemli-design/    │
           │   • SKILL.md, README.md (brand rules)    │
           │   • colors_and_type.css (tokens)         │
           │   • ui_kits/website/*.jsx (source-of-    │
           │     truth React components)              │
           │   • assets/product/*.jpg (canonical      │
           │     product photography)                 │
           └──────────────────────────────────────────┘
           Synced into src/ via a one-time copy script
           (see "Design-Skill Integration", below).
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `src/pages/` | Route-level Astro pages — the 5 URLs (`/`, `/gallery`, `/popups`, `/about`, `/say-hi`) | `.astro` files that import layouts + components and query `astro:content` collections |
| `src/layouts/` | Shared page chrome (`<html>`, head metadata, Umami script, header, footer) | One `BaseLayout.astro` everyone extends |
| `src/components/` | Brand UI — the JSX/Astro components ported from the design skill | `.jsx` (interactive) + `.astro` (static wrappers); rendered server-side, near-zero client JS |
| `src/content/` | Founder-edited content: gallery pieces, pop-up events, site config | Per-item markdown files with YAML frontmatter |
| `src/content.config.ts` | Zod schemas + glob loaders that turn `src/content/` into typed collections | One file at `src/` root, registered via `defineCollection` |
| `src/assets/` | Build-time-processed images (product photos, founder photo) | Imported via `astro:assets` `image()` helper; emits hashed `.webp` |
| `src/styles/` | Global CSS — the design skill's `colors_and_type.css` plus a thin `global.css` | Loaded once from `BaseLayout.astro` |
| `public/` | Files served as-is, never processed | `mark.svg`, favicons, `robots.txt`, `_headers`, `_redirects` |
| `functions/api/contact.ts` | Single Pages Function for form submissions | `onRequestPost` handler, validates Turnstile, calls Resend, returns JSON |
| `.claude/skills/studio-bluemli-design/` | Canonical brand source — copied from, never imported from | Reference artifact; site code never reaches across this boundary at build time |

## Recommended Project Structure

```
studiobluemli/
├── .claude/
│   └── skills/
│       └── studio-bluemli-design/      # canonical brand source (read-only at runtime)
│           ├── SKILL.md
│           ├── README.md
│           ├── colors_and_type.css     # → copied to src/styles/tokens.css
│           ├── ui_kits/
│           │   └── website/            # → JSX components copied into src/components/
│           └── assets/
│               └── product/            # → photos copied to src/assets/product/
│
├── .planning/                          # GSD planning + research, not deployed
│
├── public/                             # served verbatim by CF Pages
│   ├── assets/
│   │   └── logo/                       # mark.svg + variants + favicon-180.png
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   ├── robots.txt
│   ├── _headers                        # CF Pages security/cache headers
│   └── _redirects                      # www → apex, any legacy URLs
│
├── src/
│   ├── pages/                          # one .astro per URL
│   │   ├── index.astro                 # /
│   │   ├── gallery.astro               # /gallery
│   │   ├── popups.astro                # /popups
│   │   ├── about.astro                 # /about
│   │   └── say-hi.astro                # /say-hi
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro            # <head>, Umami, header, footer
│   │
│   ├── components/                     # copied + lightly adapted from design skill
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── GalleryGrid.astro           # consumes astro:content gallery collection
│   │   ├── GalleryCard.astro
│   │   ├── PopupCard.astro
│   │   ├── PopupList.astro             # upcoming/past split
│   │   ├── FeaturedCarousel.astro      # landing hero, featured pieces
│   │   ├── ContactForm.jsx             # interactive island (the only real JS)
│   │   └── design-skill/               # near-verbatim JSX copies from ui_kits/website
│   │       ├── LandingHero.jsx
│   │       └── ...
│   │
│   ├── content/
│   │   ├── gallery/                    # one .md per piece — CMS-compatible folder
│   │   │   ├── marigold-cluster.md
│   │   │   ├── coral-drops.md
│   │   │   └── ...
│   │   ├── popups/                     # one .md per event — CMS-compatible folder
│   │   │   ├── 2026-06-15-renegade-craft.md
│   │   │   └── ...
│   │   └── site/                       # singleton-style "file collection"
│   │       └── config.md               # tagline, IG handle, contact email, footer
│   │
│   ├── content.config.ts               # defineCollection + Zod schemas
│   │
│   ├── assets/                         # processed by astro:assets
│   │   ├── product/                    # founder's product photos (canonical home)
│   │   │   ├── marigold-cluster-01.jpg
│   │   │   └── ...
│   │   └── founder/
│   │       └── portrait.jpg
│   │
│   ├── lib/                            # small TypeScript helpers, no UI
│   │   ├── popups.ts                   # upcoming/past split, sort by date
│   │   └── validation.ts               # contact form Zod schema (shared with Function)
│   │
│   └── styles/
│       ├── tokens.css                  # copy of design skill's colors_and_type.css
│       └── global.css                  # body, headings, link defaults
│
├── functions/                          # Cloudflare Pages Functions (file-based routes)
│   └── api/
│       └── contact.ts                  # POST /api/contact
│
├── scripts/
│   └── sync-design-skill.mjs           # one-shot: copy skill → src/ (see pattern below)
│
├── astro.config.mjs                    # @astrojs/react integration, image config
├── tsconfig.json                       # path aliases: @components, @content, @lib
├── wrangler.toml                       # pages_build_output_dir = "dist", node_compat
├── package.json                        # scripts: dev, build, preview, pages-dev
├── .nvmrc                              # Node 20+ pinned for CF Pages
└── README.md
```

### Structure Rationale

- **`src/pages/` is intentionally flat.** Five pages, five files. No nested routing needed for v1. Resist the temptation to introduce `[slug].astro` dynamic routes until the founder asks for individual gallery-piece detail pages — the gallery is a grid, not a series of post URLs.

- **`src/components/design-skill/` is a quarantine.** Components imported wholesale from the design skill live here, untouched. Wrappers in `src/components/` adapt them (data props, content-collection plumbing). Distinguishing "verbatim brand component" from "site-specific glue" makes future skill updates a clean re-copy rather than a merge conflict.

- **`src/content/` is the founder's editable surface.** All four CMS tools considered (Decap, Sveltia, Pages CMS, TinaCMS) expect a folder-per-collection layout with one markdown file per entry. This is the same layout Astro's content collections expect with the `glob` loader. The structure works for both human-editing-via-VSCode and a future CMS without migration.

- **`src/content/site/config.md` is a deliberate single-file "collection".** Astro content collections technically support a `file()` loader for singletons, but using a one-entry folder collection means future CMS adoption is uniform — every CMS handles "folder collection with maxEntries: 1" cleanly.

- **`src/assets/product/` is the canonical home for product photos, not `public/`.** Two reasons: (1) `astro:assets` only optimizes images that are imported (i.e., live under `src/`); files in `public/` are copied verbatim, unhashed, and never converted to WebP — that's wasted bandwidth on a phone-first photography-heavy site; (2) the `image()` helper in content-collection Zod schemas references images relative to the markdown file, which means photos and markdown live happily together under `src/`.

- **`public/assets/logo/` is the right home for the logo, not `src/`.** The logo is an SVG, already tiny, and is referenced by absolute path from `<head>` favicon links and dozens of components. `public/` gives stable URLs (`/assets/logo/mark.svg`) that won't churn on every build. SVGs don't benefit from `astro:assets` optimization the way raster photos do.

- **`functions/` is a sibling of `src/`, not nested inside it.** Cloudflare Pages Functions use a file-based router rooted at the project's `/functions` directory; nesting under `src/` would require config workarounds. Keeping it at the top level matches the convention every CF Pages tutorial assumes and is what `wrangler pages dev` expects.

- **`scripts/sync-design-skill.mjs` makes the boundary explicit.** Running it copies the skill's JSX + CSS + product photos into the right `src/` subfolders. Re-running it after a skill update is a one-line refresh, with `git diff` showing exactly what changed.

## Architectural Patterns

### Pattern 1: Copy-not-import for the design skill

**What:** Treat `.claude/skills/studio-bluemli-design/` as a vendored source folder. A `scripts/sync-design-skill.mjs` copies its JSX, CSS, and product photos into `src/components/design-skill/`, `src/styles/tokens.css`, and `src/assets/product/`. The site never imports across the `.claude/skills/` boundary at build time.

**When to use:** When a brand or design system is co-located with the site for convenience but is conceptually portable (it could move to its own repo tomorrow). When the system is small enough that vendoring is cheaper than packaging.

**Trade-offs:**
- (+) Astro's Vite-based bundler doesn't have to traverse outside `src/` — eliminates a class of alias/symlink bugs documented in Astro's GitHub issues
- (+) Cloudflare Pages CI clones only the repo; the skill content is already inside the repo, so no extra setup
- (+) Founder-friendly: `git diff` after a sync shows exactly what brand changes are landing
- (+) The skill stays a clean reference artifact — it remains usable for one-off Instagram posts, posters, etc., without site-specific drift
- (−) Duplication of files in the repo (mitigated: skill is small, sync is one command)
- (−) Drift risk if someone edits `src/components/design-skill/*` directly instead of the skill → policy: those files are write-protected by convention, edits happen in the skill and re-sync

**Why not import via alias?** Two reasons. First, Astro has documented bugs with aliases pointing to symlinked or parent-of-`src` directories (Astro issues #2817, #3835, #5821). Second, the skill is meant to remain a portable, standalone artifact — if it ever moves to its own repo or npm package, the site shouldn't have to be restructured. Copy-not-import keeps both options open.

**Example sync script (sketch):**

```javascript
// scripts/sync-design-skill.mjs
import { cp, mkdir } from "node:fs/promises";

const SKILL = ".claude/skills/studio-bluemli-design";

await mkdir("src/components/design-skill", { recursive: true });
await mkdir("src/assets/product", { recursive: true });
await mkdir("src/styles", { recursive: true });

await cp(`${SKILL}/ui_kits/website`, "src/components/design-skill", { recursive: true });
await cp(`${SKILL}/assets/product`, "src/assets/product", { recursive: true });
await cp(`${SKILL}/colors_and_type.css`, "src/styles/tokens.css");

console.log("Synced studio-bluemli-design → src/");
```

### Pattern 2: Content collections as typed read-only data

**What:** All gallery pieces and pop-up events live as markdown files under `src/content/`. A single `src/content.config.ts` defines Zod schemas and `glob` loaders. Pages query the collections via `getCollection('gallery')` and render with Astro components. Frontmatter is structured data; markdown body is prose.

**When to use:** Always, for v1. Avoid the temptation to roll your own `import.meta.glob('./content/*.md')` — content collections give you Zod validation at build time (build fails if a piece is missing a required field), typed query results in the editor, and a stable contract for any future CMS.

**Trade-offs:**
- (+) Build-time validation: a malformed `marigold-cluster.md` fails the deploy with a precise error, never ships
- (+) Editor autocomplete on `entry.data.price`, `entry.data.status`, etc.
- (+) `image()` helper validates and processes referenced photos as part of schema validation — broken photo paths fail the build
- (+) Folder layout is the CMS-compatible "shape" Decap/Sveltia/Pages CMS expect
- (−) Slightly more upfront wiring than reading markdown ad hoc

**Example schemas (`src/content.config.ts`):**

```typescript
import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

const gallery = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/gallery" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      photos: z.array(image()).min(1),          // first photo = card thumbnail
      price: z.number().int().positive(),        // dollars; never a string
      status: z.enum(["available", "sold", "one-of-one", "made-to-order"]),
      description: z.string().max(280),          // one or two sentences, frontmatter
      featured: z.boolean().default(false),      // surface on landing carousel
      order: z.number().int().default(0),        // tiebreaker for sort
      published_at: z.coerce.date(),             // newest-first default sort
    }),
});

const popups = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/popups" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      date: z.coerce.date(),                     // start date
      end_date: z.coerce.date().optional(),      // omit for single-day events
      venue: z.string(),                         // "Renegade Craft Fair"
      neighborhood: z.string(),                  // "Fort Mason"
      address: z.string().optional(),            // full street address
      time: z.string(),                          // "11am–6pm" — keep as string, locale-friendly
      description: z.string().max(400).optional(),
      link: z.string().url().optional(),         // event page, RSVP, etc.
      photos: z.array(image()).optional(),
    }),
});

// singleton-style file collection for site config
const site = defineCollection({
  loader: glob({ pattern: "config.md", base: "./src/content/site" }),
  schema: z.object({
    tagline: z.string(),
    contact_email: z.string().email(),
    instagram_handle: z.string().regex(/^@/),
    footer_text: z.string(),
  }),
});

export const collections = { gallery, popups, site };
```

**Past/upcoming pop-up split, derived at build time:**

```typescript
// src/lib/popups.ts
import { getCollection, type CollectionEntry } from "astro:content";

export async function getPopups() {
  const all = await getCollection("popups");
  const today = new Date();
  today.setHours(0, 0, 0, 0); // midnight, so day-of events stay "upcoming"

  const endOf = (e: CollectionEntry<"popups">) => e.data.end_date ?? e.data.date;

  const upcoming = all
    .filter((e) => endOf(e) >= today)
    .sort((a, b) => +a.data.date - +b.data.date); // soonest first

  const past = all
    .filter((e) => endOf(e) < today)
    .sort((a, b) => +b.data.date - +a.data.date); // most recent first

  return { upcoming, past };
}
```

The split happens at **build time**, not runtime — every deploy re-evaluates. This means a pop-up that just ended will appear in "past" on the next push, or the next scheduled rebuild. (For v1, that's fine — the founder can trigger a redeploy from the CF dashboard, or we can schedule a daily rebuild via CF Pages' Deploy Hooks if needed in a later phase. Flag for PITFALLS.)

### Pattern 3: Single colocated Function for the only dynamic surface

**What:** The contact form is the only dynamic thing on the site. Putting it in `/functions/api/contact.ts` (Cloudflare Pages Functions, file-based routing) is dramatically simpler than provisioning a separate Worker: same repo, same deploy, same domain, no CORS, secrets managed in the CF Pages dashboard.

**When to use:** Anytime you have one to ~five small endpoints alongside a static site, and the site is deployed to Cloudflare Pages. If endpoints multiply, or you need bindings to multiple Workers products, graduate to a dedicated Worker.

**Trade-offs:**
- (+) Zero cross-origin concerns — `/api/contact` is same-origin as the form, no preflight
- (+) Same `pnpm build` + `git push` deploys both — one CI pipeline, one environment
- (+) Secrets (`TURNSTILE_SECRET`, `RESEND_API_KEY`) configured once in CF Pages dashboard, available as `context.env.X`
- (+) Local development: `wrangler pages dev dist` after a build, or hybrid with `astro dev` for iteration speed
- (−) Less portable than a standalone Worker — if you ever leave CF Pages, the endpoint moves too
- (−) Slight friction during local dev: `astro dev` doesn't run Functions; needs `wrangler pages dev` for the form

**Example handler (`functions/api/contact.ts`):**

```typescript
import { z } from "zod";

interface Env {
  TURNSTILE_SECRET: string;
  RESEND_API_KEY: string;
  CONTACT_TO: string;          // founder's inbox
  CONTACT_FROM: string;        // "hi@studiobluemli.com" or Resend default
}

const BodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(1).max(2000),
  turnstileToken: z.string().min(1),
});

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // 1. Parse + validate input
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return Response.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  // 2. Verify Turnstile token server-side (never trust client)
  const verify = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: body.turnstileToken }),
  });
  const verdict = (await verify.json()) as { success: boolean };
  if (!verdict.success) {
    return Response.json({ ok: false, error: "Verification failed" }, { status: 400 });
  }

  // 3. Send email via Resend
  const email = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: env.CONTACT_TO,
      reply_to: body.email,
      subject: `studiobluemli.com — message from ${body.name}`,
      text: body.message,
    }),
  });

  if (!email.ok) {
    return Response.json({ ok: false, error: "Email delivery failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
};
```

## Data Flow

### Build-time flow (the common case — every git push)

```
git push to main
    ↓
Cloudflare Pages CI clones repo, installs deps (pnpm install)
    ↓
pnpm build  →  astro build
    ↓                ↓
    │                ├── content.config.ts loaded
    │                ├── glob src/content/gallery/*.md → Zod-validated entries
    │                ├── glob src/content/popups/*.md  → Zod-validated entries
    │                ├── image() helper imports + optimizes src/assets/product/*.jpg
    │                │   → emits hashed .webp under dist/_astro/
    │                ├── React JSX components SSR-rendered to HTML
    │                ├── pages/*.astro compiled to static HTML
    │                └── Tailwind/CSS (if used) bundled + minified
    ↓
dist/  (static HTML + CSS + optimized images)
    ↓
CF Pages packages dist/ + functions/ for edge deploy
    ↓
studiobluemli.com serves dist/ from edge cache
/api/contact routes to functions/api/contact.ts Worker
```

### Runtime flow (only the contact form)

```
visitor on /say-hi
    ↓ (form submit, fetch POST /api/contact, JSON body)
CF edge routes /api/contact → functions/api/contact.ts
    ↓
1. Zod validates request body                   → 400 on bad input
    ↓
2. fetch Turnstile siteverify with token + secret → 400 if not human
    ↓
3. fetch Resend API with founder's "from" + "to" → 502 if Resend fails
    ↓
returns JSON { ok: true } or { ok: false, error }
    ↓
client-side React component shows success or error state
    ↓
(no page navigation; the rest of the site stays static)
```

### State management

Effectively none in the traditional sense. The site has no global state; every page is independently rendered at build time. The only stateful thing is the contact form's local React component state (`name`, `email`, `message`, `submitting`, `result`) — and that's strictly per-mount, per-visitor.

### Key data flows

1. **Founder adds a gallery piece** *(end-to-end, no engineer required)*

   ```
   Founder takes/edits product photo
       ↓
   Drops marigold-cluster-01.jpg into src/assets/product/
       ↓
   Creates src/content/gallery/marigold-cluster.md with frontmatter:
   ---
   name: "Marigold Cluster"
   photos: ["../../assets/product/marigold-cluster-01.jpg"]
   price: 65
   status: "available"
   description: "Bright marigold and amber beads, lightweight on the ear (about 8 grams each)."
   featured: true
   published_at: 2026-05-12
   ---
       ↓
   git commit + push to main
       ↓
   CF Pages CI builds (~30s); Zod validates frontmatter; image() optimizes the photo
       ↓
   Live on studiobluemli.com/gallery in under a minute
   ```

2. **Founder adds a pop-up event** *(per-file markdown, not a single YAML)*

   ```
   Creates src/content/popups/2026-06-15-renegade-craft.md:
   ---
   name: "Renegade Craft Fair"
   date: 2026-06-15
   end_date: 2026-06-16
   venue: "Fort Mason Center"
   neighborhood: "Marina"
   address: "2 Marina Blvd, San Francisco, CA"
   time: "11am–6pm both days"
   link: "https://renegadecraft.com/sf"
   ---
   
   Come say hi! I'll have new pieces from the summer drop, plus a few one-of-ones.
       ↓
   git push; build derives "upcoming" vs "past" from date (build time, today vs event date)
       ↓
   Live; the event shows under "Upcoming"; on 2026-06-17 the next deploy moves it to "Past"
   ```

   **Why per-file markdown, not single YAML?** Three reasons. (1) Every git-backed CMS we considered treats this as a "folder collection" — adding one is `New File`, not "edit a giant YAML and hope you didn't break indentation". (2) `git blame` and `git log` show provenance per event, useful when the archive grows. (3) Astro's `image()` Zod helper only validates images referenced by frontmatter when the entry is a file — a single YAML loses that.

3. **Founder updates site config** (tagline, IG handle, email)

   ```
   Edits src/content/site/config.md frontmatter; push; rebuild.
   The new tagline appears in the landing hero; the new IG handle in the footer.
   ```

4. **Visitor submits contact form** — see Runtime flow above.

## Build Order Implications

The dependency graph between components implies a clean build order. **Don't try to build the contact form before the site shell exists**, and don't wire content collections until you have a layout to render them in.

```
Phase 1 (foundation, ~1–2 sessions):
  ├── Astro scaffold + @astrojs/react + TypeScript
  ├── Cloudflare Pages connected to repo, dummy "Hello" deploy succeeds
  ├── BaseLayout.astro with header/footer using Bagel Fat One + Nunito
  ├── tokens.css imported from copy of skill's colors_and_type.css
  └── public/assets/logo/* in place, favicon working
       ↓
Phase 2 (design-skill integration, ~1 session):
  ├── scripts/sync-design-skill.mjs written and run
  ├── src/components/design-skill/*.jsx renders inside Astro pages
  ├── Static placeholders for the 5 pages (visual proof-of-brand)
  └── Mobile-first responsive checks
       ↓
Phase 3 (content collections, ~2 sessions):
  ├── src/content.config.ts with gallery + popups + site schemas
  ├── 2–3 real gallery entries (founder-provided)
  ├── 1–2 real pop-up entries
  ├── /gallery and /popups pages query getCollection() and render
  └── Landing page surfaces "featured: true" gallery pieces + next pop-up
       ↓
Phase 4 (contact form, ~1 session):
  ├── functions/api/contact.ts handler
  ├── ContactForm.jsx island on /say-hi
  ├── Turnstile site key in <head>, secret in CF Pages env vars
  ├── Resend API key in CF Pages env vars, From-domain verified
  └── End-to-end test: form → real email lands in founder's inbox
       ↓
Phase 5 (polish, ~1 session):
  ├── Umami Cloud script in BaseLayout <head>
  ├── _headers (CSP-light, cache rules) + _redirects (www → apex)
  ├── About page final copy from founder
  ├── Lighthouse mobile ≥ 90 pass
  └── Domain cutover: studiobluemli.com → CF Pages
```

**Critical sequencing facts:**
- Pages Functions (`functions/api/contact.ts`) **only deploy when there's a successful Pages build**. Don't try to test the Function before the site builds cleanly — they ship together.
- Content collections **fail the entire build** if any single markdown file has invalid frontmatter (Zod throws). That's a feature, not a bug — it means broken content can never go live. But it means Phase 3 needs at least one real, well-formed entry per collection before merging.
- The design-skill sync (`scripts/sync-design-skill.mjs`) needs to run **before** `astro build` if components have changed. For CI safety, wire it into `prebuild`: `"prebuild": "node scripts/sync-design-skill.mjs"` in `package.json`. Or commit the synced files and only run the script manually when the skill changes — the latter is simpler and gives `git diff` review on every sync.

## Local development flow

Three modes, picked by what you're iterating on:

| You're working on | Run | Notes |
|---|---|---|
| Pages, components, content, styling | `pnpm dev` (= `astro dev`) | Hot reload, instant. Contact form will fail (no `/api/contact`) — that's expected. Stub it client-side or skip until you need it. |
| Contact form / Pages Functions | `pnpm build && pnpm wrangler pages dev dist` | Wrangler serves `dist/` + runs Functions locally. Slower iteration (rebuild per change), but the only way to test the real Function. Pass secrets via `--binding=TURNSTILE_SECRET=...`. |
| End-to-end before pushing | Open a PR | CF Pages creates a preview deployment per PR (free), with its own URL. Best place to do final-eyeball + share with the founder for review. |

Wire the package.json scripts so this is muscle memory, not a lookup:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "pages-dev": "astro build && wrangler pages dev dist",
    "sync-skill": "node scripts/sync-design-skill.mjs"
  }
}
```

## Future-CMS compatibility

The proposed structure is verified compatible with at least three git-backed CMS tools — confirmed against their respective docs:

| CMS | Compatibility | Required additions |
|-----|---------------|--------------------|
| **Decap CMS** (formerly Netlify CMS) | YES — Decap's `folder` collection type maps 1:1 to `src/content/gallery/` and `src/content/popups/`. Astro's official Decap integration guide shows exactly this pattern. | Add `public/admin/index.html` (the Decap SPA) and `public/admin/config.yml` (collection schema mirroring Zod). No data migration. |
| **Sveltia CMS** | YES — Sveltia is a drop-in replacement for Decap, uses the same `config.yml` format, same `folder` collections. | Same as Decap; literally swap the script tag in `admin/index.html`. |
| **Pages CMS** (pagescms.org) | YES — Pages CMS uses `.pages.yml` at repo root, supports `folder` collections with custom field schemas, works generator-agnostic (explicit Astro support in their docs). | Add `.pages.yml` at repo root mirroring the Zod schemas. No data migration. |
| **TinaCMS** | Yes-with-caveats — Tina expects content in folder collections too, but uses GraphQL + a slightly different schema language (`tina/config.ts`) and the cloud version requires TinaCloud auth. Migration is straightforward (folder layout matches) but field definitions need re-expression in Tina's schema. | Add `tina/config.ts`; install `tinacms` + `@tinacms/cli`. Self-hosted is free, cloud is paid above a tier. |

**The key compatibility properties of the proposed layout:**
1. **One folder per collection.** `src/content/gallery/`, `src/content/popups/` — every CMS expects this.
2. **One markdown file per entry.** Not a single YAML mega-file. Every CMS treats files as entries.
3. **Frontmatter for structured fields, body for prose.** Standard convention every CMS handles.
4. **Image paths relative to the markdown file.** All four CMS tools above resolve image references this way; matches Astro's `image()` helper.
5. **No CMS-specific fields in frontmatter.** Nothing in the Zod schemas is Decap-or-Tina-specific.

When the founder eventually wants a CMS (and Decap/Sveltia is the obvious recommendation — free, hosted-on-CF-Pages, no signup), it's a config-file addition, not a content migration.

## Scaling Considerations

| Scale | Architecture adjustments |
|-------|--------------------------|
| 0–100 visitors/day (year 1 likely) | No changes. Static site on CF Pages free tier handles this with room to spare. Build time stays under 30s. |
| 100–10k visitors/day (viral Instagram moment, press feature) | No changes needed for traffic — CF's edge cache absorbs it. Watch for contact-form abuse → add a honeypot field in addition to Turnstile. |
| Gallery grows past ~50 pieces | Image optimization at build time starts adding seconds. Consider opt-in `format: "avif"` for newer photos; lazy-load the gallery grid (Astro does this by default with `loading="lazy"`). |
| Pop-ups archive grows past ~100 events | Past-events list gets long. Add year-grouping or pagination on `/popups`. Still build-time, no infra change. |
| Founder wants a CMS | Add Decap or Sveltia (`public/admin/`). No data migration. |
| Founder wants e-commerce | Out of scope per PROJECT.md, but the path is Shopify Lite or Stripe Payment Links embedded on gallery cards. The static-site shell remains, the per-piece markdown gains a `stripe_payment_link` field. |

### Scaling priorities

1. **First bottleneck — build time as the gallery grows.** Astro's image optimization is per-image and runs every build. At 100+ photos, builds slow to ~1 minute. Fix: enable Astro's image cache (`cacheDir` honored by default in CF Pages CI as of 2025), or batch-pre-optimize uploads.

2. **Second bottleneck — contact-form abuse.** Free Resend tier is 100 emails/day. A botnet getting past Turnstile (rare but happens) could exhaust it. Fix: rate-limit per IP in the Function using Cloudflare KV (free tier covers this easily), or fall back to silently dropping after N/hour.

3. **Third (theoretical) — analytics overage.** Umami Cloud free tier is 10k events/month. If the site ever crosses that, self-host Umami on a $5/mo VPS or move to Plausible's $9/mo tier.

## Anti-Patterns

### Anti-Pattern 1: Importing components directly from `.claude/skills/studio-bluemli-design/`

**What people do:** Add a TypeScript path alias `"@skill/*": ["../.claude/skills/studio-bluemli-design/*"]` and `import { LandingHero } from "@skill/ui_kits/website/LandingHero.jsx"`.

**Why it's wrong:**
- Reaches outside `src/`, which triggers documented Astro/Vite alias edge cases (file watcher misses, build failures when `dist/` is configured oddly — see Astro issues #2817, #3835, #5821).
- Conflates a "design reference artifact" with "production code dependency". The skill is meant to be usable for posters, Instagram posts, and other one-off artifacts — those uses shouldn't carry website-specific assumptions back into the skill.
- Couples the site's build graph to the precise internal structure of the skill folder. If the skill ever moves to its own repo or is reorganized, the site breaks.

**Do this instead:** Copy via `scripts/sync-design-skill.mjs`. Track copies in git so `git diff` is the review surface. Treat the skill as a vendored source you re-sync deliberately.

### Anti-Pattern 2: Putting product photos in `public/`

**What people do:** Drop all product JPGs into `public/assets/product/` and reference them as `<img src="/assets/product/marigold-01.jpg">` from components and markdown.

**Why it's wrong:**
- Files in `public/` are copied verbatim — no WebP conversion, no responsive `srcset`, no hashing, no lazy-load defaults. On a phone-first photography-heavy site, that's the single biggest performance regression you can ship.
- Markdown image references can't be Zod-validated. A typo in a photo path goes live as a broken image instead of failing the build.

**Do this instead:** `src/assets/product/` for product photography. Reference from frontmatter using paths relative to the markdown file. Use `astro:assets` `<Image />` in components. Reserve `public/` for the logo SVG, favicons, `robots.txt`, `_headers`, and `_redirects` — files that genuinely need stable, unprocessed URLs.

### Anti-Pattern 3: Stuffing all pop-ups into a single `popups.yml`

**What people do:** One YAML file with an array of every event the studio has ever done.

**Why it's wrong:**
- Single-file editing scales poorly: indentation mistakes break every event at once, `git blame` becomes useless, no git-backed CMS handles this layout natively.
- Loses per-entry image validation (frontmatter `image()` only works per-file in Astro collections).
- Forces an awkward decision later: when the founder wants a CMS, the single file has to be split into one-per-entry first. That's a migration; doing it now is just naming files.

**Do this instead:** One markdown file per event under `src/content/popups/`, named `YYYY-MM-DD-slug.md`. The leading date makes the directory naturally sortable when browsing in VSCode, and the format matches what every CMS expects.

### Anti-Pattern 4: Running the contact endpoint as a separate Worker

**What people do:** Provision `studiobluemli-contact-worker.workers.dev`, deploy as a standalone Worker, configure CORS on the form to call it cross-origin.

**Why it's wrong:**
- Two deploy pipelines, two repos (or one repo with two `wrangler` configs), two sets of secrets to manage, one extra DNS entry.
- CORS preflights add latency and a configuration surface that can fail silently.
- Local dev requires `wrangler dev` for the Worker and `astro dev` for the site simultaneously, with manually wired URLs.

**Do this instead:** Pages Functions in `/functions/api/contact.ts`. Same repo, same deploy, same domain, no CORS. Graduate to a standalone Worker only when you genuinely have multiple endpoints or need Worker-specific bindings.

### Anti-Pattern 5: Deriving past/upcoming pop-up split at runtime via JavaScript

**What people do:** Render the entire pop-ups list to the static page, then use client-side JS to filter `if (event.date >= Date.now())` and hide past ones.

**Why it's wrong:**
- Ships every pop-up (past and future) in the HTML payload — slower load, more bytes.
- Defeats the purpose of static generation (the split is known at build time).
- Fails for users with JS disabled.

**Do this instead:** Derive the split in the `.astro` page (build time), using the `src/lib/popups.ts` helper above. Render only "upcoming" prominently and "past" beneath in a collapsed/smaller section. Schedule a daily rebuild via CF Pages Deploy Hooks if the freshness matters (flagged in PITFALLS).

## Integration Points

### External Services

| Service | Integration pattern | Notes |
|---------|---------------------|-------|
| **Cloudflare Pages** | Git connection — CF watches `main`, runs `pnpm build`, deploys `dist/` + `functions/`. | Set Node version via `.nvmrc` or `NODE_VERSION` env var. PRs get preview deploys automatically. |
| **Cloudflare Turnstile** | Server-side token verification in `functions/api/contact.ts` via `siteverify` endpoint. Client renders the widget with the public site key. | Secret key in CF Pages env vars; never in client bundle. |
| **Resend (or Mailchannels)** | REST API call from the Pages Function. Free tier: Resend 100/day, MailChannels was free-via-CF-Workers but changed terms in 2024 — verify current terms before committing. | `From` address must be on a verified domain; for studiobluemli.com, verify the domain in Resend's dashboard. |
| **Umami Cloud** | One `<script defer>` in `BaseLayout.astro <head>`. No cookies, no consent banner. Custom events via `umami.track()` if needed later. | Free tier: 10k events/month, 3 websites. |
| **Cloudflare DNS** | Already in place. Add a CNAME (or use CF Pages' built-in domain wiring) to point apex to the CF Pages project. `www` → apex via `_redirects`. | The domain is already on the founder's CF account, so this is one form submission, not a registrar transfer. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `.claude/skills/studio-bluemli-design/` ↔ `src/` | One-way copy via `scripts/sync-design-skill.mjs`. Never a runtime import. | The skill is the upstream; the site is downstream. Edits flow skill → src, never the reverse. |
| `src/content/` ↔ `src/pages/` | `getCollection('gallery')` / `getCollection('popups')` at build time, fully typed via Zod-inferred types. | Pages never read markdown files directly with `fs` — always through `astro:content`. |
| `src/assets/` ↔ markdown frontmatter | Relative paths from `.md` to image, validated by Zod `image()` helper at build time. | Broken paths fail the build, never ship as broken `<img>` tags. |
| `src/pages/say-hi.astro` (ContactForm island) ↔ `functions/api/contact.ts` | Same-origin `fetch('/api/contact', { method: 'POST' })`. Shared validation schema in `src/lib/validation.ts` (imported on both sides). | Sharing the Zod schema across client and server is the single biggest payoff of keeping both in one repo. |
| `functions/api/contact.ts` ↔ Turnstile / Resend | Plain `fetch()` to public HTTPS endpoints. Secrets from `context.env`. | No SDKs needed; the public REST APIs are simple enough. |
| Founder ↔ entire system | `git push` (eventually a CMS UI). No other auth surface in v1. | This is the whole point — the system has exactly one mutating actor and one mutation path. |

## Sources

- [Astro: Content collections — `defineCollection`, glob loader, Zod schemas](https://docs.astro.build/en/guides/content-collections/) — HIGH confidence (Context7, current docs)
- [Astro: `astro:content` reference module — schema validation, `image()` helper](https://docs.astro.build/en/reference/modules/astro-content) — HIGH (Context7)
- [Astro: Images guide — `src/assets/` vs `public/`, `<Image />` optimization](https://docs.astro.build/en/guides/images/) — HIGH (Context7)
- [Astro: React integration — `tsconfig.json` JSX config, import aliases](https://docs.astro.build/en/guides/integrations-guide/react/) — HIGH (Context7)
- [Astro: TypeScript guide — path aliases via `tsconfig.json`](https://docs.astro.build/en/guides/typescript/) — HIGH (Context7)
- [Astro: Project structure conventions](https://docs.astro.build/en/basics/project-structure/) — HIGH (Context7)
- [Cloudflare Pages: Functions routing — file-based directory mapping](https://developers.cloudflare.com/pages/functions/routing/) — HIGH (Context7)
- [Cloudflare Pages: Functions bindings — environment variables, `context.env`, local dev](https://developers.cloudflare.com/pages/functions/bindings/) — HIGH (Context7)
- [Cloudflare Pages: Deploy an Astro site — build command, output directory](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) — HIGH (official CF docs)
- [Cloudflare Pages: `wrangler.toml` configuration, `pages_build_output_dir`](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) — HIGH (official CF docs)
- [Decap CMS + Astro integration guide](https://docs.astro.build/en/guides/cms/decap-cms/) — HIGH (Astro official)
- [Decap CMS: Configuration options — folder collections, fields, widgets](https://decapcms.org/docs/configuration-options/) — HIGH (Decap official)
- [Sveltia CMS — Decap-compatible config format](https://github.com/sveltia/sveltia-cms) — MEDIUM (project README, verified against Decap docs)
- [Pages CMS — folder collections, Astro support](https://pagescms.org/docs/configuration/) — MEDIUM (project docs)
- [TinaCMS — git-backed content, schema in `tina/config.ts`](https://tina.io/) — MEDIUM (official site, less direct overlap with Astro content collections)
- [Astro GitHub issues on import aliases + symlinks (#2817, #3835, #5821)](https://github.com/withastro/astro/issues/2817) — MEDIUM (anti-pattern evidence)

---
*Architecture research for: Astro static site on Cloudflare Pages with file-backed content and one Pages Function*
*Researched: 2026-05-12*
