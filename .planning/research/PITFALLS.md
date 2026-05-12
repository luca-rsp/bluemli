# Pitfalls Research

**Domain:** Static portfolio site (Astro + Cloudflare Pages, markdown/YAML content, Worker-backed contact form) for a small craft jewelry studio
**Researched:** 2026-05-12
**Confidence:** HIGH (Astro/Cloudflare specifics verified against current docs; MailChannels EOL confirmed; brand non-negotiables read directly from the design skill)

---

## Critical Pitfalls

### Pitfall 1: Copying a MailChannels-from-Workers tutorial (the free tier ended August 31, 2024)

**What goes wrong:**
A developer follows a 2023 "send free email from Cloudflare Workers via MailChannels" tutorial, ships the contact form, and the founder never sees a message. Either the Worker returns 4xx from the MailChannels Email API, or the request silently authenticates but no email is delivered. By the time anyone notices, weeks of customer inquiries are lost — and there's no log of what was sent.

**Why it happens:**
MailChannels operated a no-account, no-DKIM, "just POST and it works" service for Cloudflare Workers traffic for years. That free tier was the canonical answer on every blog. It was deprecated June 30, 2024 and fully terminated August 31, 2024. The blog posts are still the top Google results. The replacement (the MailChannels Email API, which does have a free 100 email/day plan) requires an account, an API key, and DKIM setup — i.e. it's a different integration shape entirely.

**How to avoid:**
Use **Resend** as the email provider. Resend has a generous free tier (3,000/month, 100/day at time of writing), first-class Cloudflare Workers tutorial in the official Cloudflare docs, and a clean SDK. MailChannels' new paid product is fine too, but Resend is the lower-friction choice and has the better DX. Whichever provider is picked, the contact-form integration must be smoke-tested by sending a real message to the founder's inbox before launch — and that test re-run after every DNS change.

**Warning signs:**
- The phrase "MailChannels for free with Cloudflare Workers, no DKIM needed" appears in any roadmap doc or code comment
- The Worker code POSTs to `api.mailchannels.net/tx/v1/send` without an `Authorization` header
- No row in DNS for the email provider's DKIM selector
- Form submissions return 200 to the browser but no email arrives

**Phase to address:**
Phase that builds the contact form. Before writing a single line of Worker code, confirm the provider choice and verify their current free-tier terms on the provider's own pricing page.

---

### Pitfall 2: Skipping server-side Turnstile validation

**What goes wrong:**
The Turnstile widget is embedded on the contact form, the visitor passes the challenge, the form POSTs to the Worker — and the Worker happily forwards the message without ever calling `https://challenges.cloudflare.com/turnstile/v0/siteverify`. Spam bots learn the form-submit endpoint in days and the founder's inbox fills with garbage. Worse, the founder loses trust in the form and starts ignoring it.

**Why it happens:**
The Turnstile script visually completes the challenge on the client — it looks like the work is done. The `cf-turnstile-response` token *only* matters when the server validates it. The client-only setup will block zero real bots.

**How to avoid:**
The Worker that receives the form submission MUST, as its first action, POST `{ secret, response, remoteip }` to `https://challenges.cloudflare.com/turnstile/v0/siteverify` and reject the request if `success !== true`. The Turnstile secret key lives as a Cloudflare Pages/Worker **secret** binding (not a plain env var), never in the repo. Tokens are single-use and expire in 300 seconds — design the Worker to fail closed on duplicate/expired tokens (`timeout-or-duplicate` error code).

**Warning signs:**
- The Worker code does not import `fetch` to `challenges.cloudflare.com`
- The Turnstile secret is in `.env` or `wrangler.toml` instead of in Cloudflare's secrets UI
- The form submits successfully with an empty or fake `cf-turnstile-response` value in a manual `curl` test

**Phase to address:**
Same phase as the contact form. Write the Worker so that siteverify runs before any other logic — even before reading the rest of the request body.

---

### Pitfall 3: Missing SPF/DKIM/DMARC on `studiobluemli.com` (deliverability collapse)

**What goes wrong:**
The contact form sends mail from `noreply@studiobluemli.com` (or similar) via Resend, but the apex domain has no SPF record authorizing Resend, no DKIM CNAMEs for Resend's signing keys, and no DMARC policy. Gmail and Apple Mail mark every message as spam — or, worse, silently quarantine them. The founder thinks no one is contacting her. (Gmail and Yahoo also tightened bulk-sender rules in early 2024 — even low-volume senders now get penalized harder for missing auth.)

**Why it happens:**
Sending domain authentication is invisible until it breaks. Cloudflare DNS already manages the domain, so it feels "set up" — but no one added the Resend records. Resend's onboarding *does* show the records, but it's a manual copy-paste step that's easy to skip or get wrong (a stray trailing dot, wrong record type, wrong selector).

**How to avoid:**
Before sending the first real email, run through Resend's domain-verification flow end-to-end and verify in the Resend dashboard that the domain shows "Verified" with green checks on SPF, DKIM, and DMARC. Add records to Cloudflare DNS exactly as Resend specifies (the host names need to be the bare subdomain on Cloudflare's UI — not the full FQDN — or duplication occurs). Add a permissive DMARC at first (`p=none; rua=mailto:...`) so reports flow but legit mail isn't blocked, then tighten later. Send a real test from the Worker to a Gmail and an iCloud address and confirm both land in the inbox, not spam.

**Warning signs:**
- Resend dashboard shows the domain as "Pending" or any individual record as red
- A test email to Gmail lands in spam, or arrives with "via amazonses.com" or similar in the header
- `dig TXT studiobluemli.com` returns no SPF record, or returns multiple SPF records (also broken)
- DMARC reports never arrive (means the `rua` address is wrong)

**Phase to address:**
Same phase as the contact form, ideally **before** writing form code (DNS propagation takes minutes-to-hours, so kick it off early).

---

### Pitfall 4: Defaulting to white backgrounds instead of cream

**What goes wrong:**
A developer scaffolds a page with `<body>` and no background-color override; the browser default of `#FFFFFF` shows. Or worse, a contributor uses a generic component library (shadcn, MUI, Chakra) and inherits white surfaces, white modal panels, white card backgrounds. The result feels clinical — wrong for a hand-assembled, warm, paper-feeling brand. The brand non-negotiable from the design skill is **cream, never white** — and pages drift back to white in 100 small places (modal backdrops, form inputs, hover surfaces, lightbox chrome).

**Why it happens:**
White is the framework default for everything. Every Tailwind starter, every component library, every reset CSS assumes white. Cream has to be aggressively asserted via a root-level token and audited everywhere.

**How to avoid:**
Import `colors_and_type.css` from the design skill as the **first** stylesheet on every page. Set `body { background: var(--bluemli-cream); }` (or the equivalent cream token) globally. Do **not** install a component library that ships its own color system; build from the design skill's React components. Add a Playwright or simple visual-regression check that screenshots every page and inspects the body background-color computed style — any `rgb(255, 255, 255)` fails CI. Audit modals, dropdowns, popovers, and form inputs specifically — these are where white sneaks in.

**Warning signs:**
- `bg-white`, `background: white`, or `#fff` appearing in any committed CSS or JSX
- A generic UI library in `package.json` (radix-themes, shadcn-ui starter colors, MUI, Chakra, daisyUI)
- The form input fields look "punched out" against the cream page

**Phase to address:**
Phase that wires up the design system (early — before any feature pages). Encode it as a CI check that runs on every preview deploy.

---

### Pitfall 5: Calling the earrings "flowers" anywhere in copy or alt text

**What goes wrong:**
A well-meaning writer (or AI assistant generating boilerplate copy) describes the product as "flower-shaped earrings" or "tiny floral clusters" in the hero, in product descriptions, in alt text, in `og:description`, in the sitemap. The brand non-negotiable from the design skill is explicit: **"Bluemli" is a Swiss-German nickname (etymology), not a visual motif. The product is beaded clusters.** Once "flower" leaks into the marketing surface it gets indexed by Google, screenshotted by visitors, and shapes how the brand is perceived — exactly the opposite of the positioning.

**Why it happens:**
The logo *is* a six-petal mark. The studio name translates to "little flower" in dialect. AI assistants and copywriters love the flower metaphor — it's the obvious word. Without a hard rule everyone reaches for it.

**How to avoid:**
Add a linting rule (a simple grep in CI) that fails the build if `/flower|petal|floral|bloom|blossom/i` appears in any committed `.md`, `.mdx`, `.astro`, `.jsx`, `.tsx`, or `.yaml` file under `content/` or `src/`. Allowlist specific phrases that are unavoidable (e.g. internal comments referencing the "6-petal mark"). Document the rule prominently in the README so the founder and any future contributor sees it. Surface it in the `studio-bluemli-design` skill output too.

**Warning signs:**
- Hero copy reads "flower-shaped" or "floral cluster"
- Product alt text says "flower earrings"
- `og:description` mentions petals or blooms
- Anyone uses the phrase "bouquet of beads"

**Phase to address:**
Phase that adds CI (early — first phase that touches GitHub Actions or any check). The lint rule should land before any content is written.

---

### Pitfall 6: Sold pieces removed from the site instead of marked sold

**What goes wrong:**
A piece sells at a pop-up. The founder, helpfully, deletes the markdown file from `content/gallery/` to "keep the site current." The portfolio shrinks over time — eventually the site looks empty and the founder's body of work isn't visible to new visitors, press, or wholesale buyers. Every sale erodes the gallery instead of growing the portfolio archive.

**Why it happens:**
The intuition is e-commerce: sold items get hidden so no one tries to buy them. But this isn't an e-commerce site — it's a portfolio. The same logic doesn't apply. The founder will think she's "tidying up" without realizing she's destroying the archive.

**How to avoid:**
Make the gallery schema require an `availability` field (Zod enum: `available | sold | one-of-one | reserved`) and **render sold pieces visibly with a "sold" badge** rather than hiding them. Document in the content README at `content/gallery/README.md`: "Never delete a piece. To mark sold, change `availability: available` to `availability: sold` and save." Provide a one-screen content guide the founder can refer to. Optionally sort sold pieces below available ones, but never hide them by default.

**Warning signs:**
- The git history of `content/gallery/` shows file deletions
- The schema doesn't include an availability state, or it's a free-text field instead of an enum
- The content README doesn't have a "marking sold" section

**Phase to address:**
Phase that designs the gallery content schema (early — affects every piece added thereafter). Document the workflow in the same phase.

---

### Pitfall 7: Pop-ups not falling off the upcoming list automatically (timezone bugs)

**What goes wrong:**
A pop-up scheduled for "2026-06-15" in San Francisco shows in the "Upcoming" section all day on June 15 in California — but visitors browsing from Europe see it slide into "Past" at 4 PM Pacific (midnight UTC) on June 15, when the event hasn't even started yet. Or the reverse: the page renders at build-time using UTC, so by 5 PM in California, the build-time cutoff fired but no rebuild has run, and a past event still shows as upcoming. The founder finds out when a customer shows up to a pop-up that ended yesterday.

**Why it happens:**
Static-site builds happen at a moment in time, in UTC, on a Cloudflare edge somewhere. The cutoff between "upcoming" and "past" is naturally compared at request time, but a static site doesn't have a request time — it has a build time. And `new Date()` in JavaScript silently uses the timezone of whatever machine ran the build.

**How to avoid:**
Store pop-up dates in YAML as `date: 2026-06-15` (just a date, no time) plus a separate `start_time: "18:00"` and `tz: "America/Los_Angeles"` field. At build time, compute the cutoff in the **studio's local timezone** (America/Los_Angeles) using a real timezone library (`@date-fns/tz` or `Temporal` via polyfill), not naive UTC math. Trigger a daily rebuild via a Cloudflare cron-trigger Worker that POSTs to the Pages build webhook at 3 AM Pacific so the "Past/Upcoming" split is always at most one day stale. Alternatively, do the past/upcoming split client-side with `Intl.DateTimeFormat` so it's always accurate to the visitor's clock — but accept that it requires JS to render that section.

**Warning signs:**
- The codebase has `new Date()` without an explicit timezone in any pop-up filtering logic
- No daily rebuild trigger exists
- A pop-up on the schedule for "today" disappears from the page in the early evening Pacific time

**Phase to address:**
Phase that ships the pop-ups page. Get the timezone strategy right the first time — retrofitting timezone fixes is painful.

---

### Pitfall 8: Unoptimized photos blowing up LCP on mobile

**What goes wrong:**
The founder uploads a 4032×3024 product photo from her iPhone (3–6 MB JPEG) straight into `public/images/`. The site references it as `<img src="/images/piece-01.jpg">`. On a mobile Instagram-traffic visitor's phone, the LCP image is 4 MB, the Lighthouse mobile score drops to 30, and the page feels broken — exactly the "product photography is the brand" promise inverted into "loading spinner is the brand."

**Why it happens:**
The Astro project ships with `public/` for static assets — which Astro **does not transform**. Anything in `public/` is served as-is. Images need to live in `src/assets/` (or wherever the Image/Picture component imports from) to flow through Astro's optimization pipeline. It's an easy mistake because `public/` is the obvious "this is where images go" folder.

**How to avoid:**
Establish a single convention: gallery photography lives in `src/content/gallery/images/` (or `src/assets/gallery/`), referenced from frontmatter via Astro's `image()` schema helper. Every render uses `<Image />` or `<Picture />` from `astro:assets` with explicit `widths`, `sizes`, and `formats={['avif', 'webp']}`. Width/height are set automatically by the component (kills CLS). The `public/` folder is reserved for `favicon.ico`, `mark-favicon-180.png`, `robots.txt`, and similar — never for content photography. Document this in the content README.

Because the Cloudflare adapter does not support Astro's built-in Sharp optimization at runtime in SSR mode, **build the site in static mode** (which runs Sharp at build time on the CI machine) — this is the right call for this project anyway.

**Warning signs:**
- Any file in `public/images/` larger than 100 KB
- Lighthouse mobile LCP > 2.5s on the gallery page
- Network tab shows `.jpg` responses larger than 200 KB on mobile viewport
- Build logs show no Sharp transformation output

**Phase to address:**
Phase that wires up the gallery + image pipeline (very early — sets the convention for every photo added thereafter).

---

## Moderate Pitfalls

### Pitfall 9: Over-hydrating React islands with `client:load`

**What goes wrong:**
A developer copies React components from the design skill, drops them into `.astro` files, and reaches for `client:load` on each one because "that's what makes them interactive." Most of these components are presentational (gallery cards, hero, footer) and don't need any client JS at all. The page ships ~100 KB of React + hydration code for nothing. Lighthouse drops 10–15 points and mobile interaction feels laggy on Instagram-traffic phones.

**Why it happens:**
`client:load` is the most-documented directive and the one that "just works." Developers reach for it by default. Astro's strength — server-rendered components with zero JS by default — gets squandered.

**How to avoid:**
Render React components **without any client directive** by default. They render to HTML at build time, zero JS shipped. Add `client:visible` only when a component genuinely needs interactivity (the contact form, a lightbox open/close, an image carousel). Never `client:load` unless interactivity is needed instantly above the fold. Add a CI check or lint rule that flags any `client:load` and requires a comment justifying it.

**Warning signs:**
- More than 2 instances of `client:load` in the entire codebase
- The built JS bundle for any page exceeds 50 KB gzipped
- Lighthouse "Reduce unused JavaScript" flags React chunks

**Phase to address:**
Phase that wires up the design-system components into Astro pages.

---

### Pitfall 10: Hand-display fonts blocking text render (FOIT)

**What goes wrong:**
The site uses Bagel Fat One (or a similar hand-display font) for headlines. On a slow mobile connection, the browser hides headline text for 3+ seconds while waiting for the font file to download. The hero loads with invisible text, the visitor scrolls or bounces.

**Why it happens:**
Default `@font-face` behavior is FOIT (Flash of Invisible Text). Without `font-display: swap`, browsers wait up to 3 seconds for the custom font before falling back to system fonts. Google Fonts now emits `font-display: swap` by default — but only if the URL includes `&display=swap`, and only for fonts loaded via Google's hosted service. Self-hosted `@font-face` rules need it added explicitly.

**How to avoid:**
Self-host the hand-display fonts as WOFF2 in `public/fonts/`. Write `@font-face` rules with `font-display: swap` explicitly. Preload the headline font with `<link rel="preload" as="font" type="font/woff2" crossorigin>` only if it's used above the fold. Pick fallback fonts in the stack that match the visual weight reasonably (`font-family: 'Bagel Fat One', 'Arial Black', system-ui`) so the swap isn't jarring. The `colors_and_type.css` from the design skill should already encode this — verify it does and import it correctly.

**Warning signs:**
- Lighthouse flags "Ensure text remains visible during webfont load"
- Network tab shows font files loading from `fonts.googleapis.com` or `fonts.gstatic.com` (third-party latency)
- Headlines visibly pop in 1–2 seconds after page load on a throttled connection
- No `font-display` declaration in the stylesheet

**Phase to address:**
Phase that wires up the design system (same phase as the cream-background work).

---

### Pitfall 11: Content Collections schema not catching frontmatter typos

**What goes wrong:**
The founder edits a gallery entry on GitHub web UI and types `availabilty: sold` (missing letter). The build doesn't fail because Zod schemas are not strict by default — extra fields are silently ignored, and the actual `availability` field falls back to its default (or is undefined). The piece displays as "available" on production despite being sold. A customer DMs about a piece that doesn't exist anymore.

**Why it happens:**
Zod's default behavior is to **allow unknown keys** unless you use `.strict()` on the object schema. Missing-required-field errors do surface — but typos in optional or defaulted fields don't.

**How to avoid:**
Define the gallery and pop-up schemas with `z.object({...}).strict()` so any unknown key triggers a build failure with a clear error message. Use enums (`z.enum(['available', 'sold', 'one-of-one', 'reserved'])`) rather than strings for state fields so misspellings of values are also caught. Require all critical fields (name, price, availability) — make only truly optional fields `.optional()`. Run the build locally or via a PR preview before merging any content change.

**Warning signs:**
- `.strict()` does not appear in `src/content.config.ts` (or `src/content/config.ts`)
- Any field in the schema uses `z.string()` for a value that has a small fixed set of options
- A content change merges to main and shows wrong data on the live site

**Phase to address:**
Phase that defines the content schema. Use `.strict()` from day one.

---

### Pitfall 12: Image filename references that break silently when renamed

**What goes wrong:**
The founder renames `piece-01.jpg` to `coral-cluster.jpg` in `public/images/` (or via GitHub web UI) but doesn't update the markdown reference in `content/gallery/coral-cluster.md`. The build succeeds because no schema validates that referenced image files exist. The page loads with a broken-image icon where the hero photo should be.

**Why it happens:**
String references to image paths aren't typed. Astro's `image()` schema helper *does* validate referenced images at build time — but only if you opt into it by importing images via frontmatter instead of plain string paths.

**How to avoid:**
Store images **co-located** with content (`src/content/gallery/images/<slug>/hero.jpg`) and reference them in frontmatter using Astro's `image()` schema helper: `image: image()`. This validates at build time that the file exists and produces a typed reference. Rename a file and the build fails immediately with a clear error. Document the convention in the content README — every piece has its own folder, every folder has a `hero.jpg` (or `hero.png`).

**Warning signs:**
- Image paths in frontmatter are bare strings like `"/images/piece-01.jpg"` rather than `image()`-typed
- A piece's page renders with a broken-image icon in production
- The build succeeds despite a missing image

**Phase to address:**
Same phase as the content schema (Pitfall 11).

---

### Pitfall 13: Routing case sensitivity (works on macOS, breaks in production)

**What goes wrong:**
A developer creates `src/pages/Gallery.astro` (capitalized G) and links to it as `/gallery`. On macOS (case-insensitive filesystem) this works locally. On Cloudflare Pages (case-sensitive Linux runtime) the link 404s. The site looks broken on every laptop except the developer's own.

**Why it happens:**
macOS HFS+/APFS defaults to case-insensitive. Linux is case-sensitive. The Cloudflare Pages build runs on Linux. The mismatch is silent until deployed.

**How to avoid:**
Enforce all-lowercase route filenames (`src/pages/gallery.astro`, `src/pages/popups.astro`). Pin a CI check that fails the build if any file under `src/pages/` or `src/content/` contains uppercase characters. Always click through the preview deploy URL — not just localhost — before merging.

**Warning signs:**
- Any file under `src/pages/` has an uppercase letter
- A link works locally but 404s on the preview deploy
- The build succeeds but the runtime route doesn't resolve

**Phase to address:**
Phase that adds CI (early). The check is one line of shell.

---

### Pitfall 14: Per-page `og:image` and `og:title` missing (Instagram link previews look broken)

**What goes wrong:**
The founder shares the gallery URL in an Instagram bio link or DM. The unfurled preview shows a generic logo or no image at all, with the home page title. The link feels broken or low-quality. Conversion from Instagram (the primary traffic source) drops.

**Why it happens:**
Astro doesn't generate Open Graph tags automatically. Without a `<MetaTags />` component on every layout, only the default `<title>` is set. The Instagram crawler doesn't fetch the page body — it only reads `<head>` meta tags.

**How to avoid:**
Create a shared `<SEO />` component in the layout that emits `<title>`, `<meta name="description">`, `<meta property="og:title">`, `<meta property="og:image">` (absolute URL), `<meta property="og:url">`, `<meta property="og:type">`, `<meta property="twitter:card" content="summary_large_image">`, and `<meta property="twitter:image">`. Every page passes title, description, and image. For gallery pieces, the og:image is the piece's hero photo (full URL). For the home and pop-ups pages, default to the brand mark on cream or a curated product photo. Test with Facebook's Sharing Debugger and Twitter's Card Validator before launch.

**Warning signs:**
- The `<head>` of a rendered page does not contain `og:image`
- Posting the URL in iMessage or Slack does not show a preview card
- The Facebook Sharing Debugger reports missing meta tags

**Phase to address:**
Phase that builds the layout/template scaffolding (early). Add it to the base layout so it's not forgotten on individual pages.

---

### Pitfall 15: Storing secrets in `wrangler.toml` or `.env` committed to git

**What goes wrong:**
The Resend API key and Turnstile secret key get committed to `wrangler.toml` (or `.env`) in the repo. GitHub Secret Scanning catches it days later and the key is rotated under duress — but if it wasn't caught, anyone with read access to the repo could send spam from the studio's domain or burn through the Resend quota.

**Why it happens:**
Cloudflare's docs use "environment variables" and "secrets" almost interchangeably in places. The distinction: env vars are plain text and visible in the dashboard; secrets are encrypted and write-only after creation. Developers default to env vars because they're easier to see.

**How to avoid:**
Set both `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY` as **secrets** (not plain env vars) in the Cloudflare Pages project settings (Settings → Variables and Secrets → Add → Type: Secret). Never put them in `wrangler.toml`. Add `.env`, `.dev.vars`, and `.wrangler/` to `.gitignore`. For local development use `.dev.vars` (gitignored) and `wrangler pages dev`. Set secrets separately for **production** and **preview** environments in the Cloudflare dashboard — one key per environment is fine, but preview environments should NOT use the production Resend key (use a separate Resend project so spam tests don't burn production quota).

**Warning signs:**
- `RESEND_API_KEY=...` appears anywhere in a committed file (search with `git log -p --all -S 'RESEND_API_KEY'`)
- `wrangler.toml` contains a `[vars]` section with anything sensitive
- The Cloudflare dashboard shows the keys as "Plain text" instead of "Secret"

**Phase to address:**
Phase that sets up the Worker/Pages Function and the deploy pipeline.

---

### Pitfall 16: Color contrast violations on cream-with-coral text

**What goes wrong:**
The design skill's palette includes coral and cream. A designer pairs light coral text on cream background somewhere (a caption, a subtle label, a placeholder) and the contrast ratio drops below WCAG AA 4.5:1 for body text. Visitors with low vision, on outdoor screens, or with screen filters can't read it. Lighthouse Accessibility score drops.

**Why it happens:**
Cream + warm pastels look gorgeous in design comps on a calibrated MacBook screen. The contrast math is unforgiving — coral against cream barely passes for large text and fails for small text in most combinations.

**How to avoke:**
Run every text+background combination through a contrast checker (e.g. WebAIM Contrast Checker) at design-system setup time. For body text on cream, default to a dark indigo or near-black; reserve coral for accents, headlines (which can use AA Large at 3:1), or decorative glyphs. The `colors_and_type.css` from the design skill should specify which pairs are valid — verify and respect them. Add Lighthouse a11y to the CI preview check. Never use color alone to convey state ("sold" badge needs a label, not just a color shift).

**Warning signs:**
- Any text uses a coral or pastel color on cream and is smaller than 18 px
- Lighthouse Accessibility score < 95
- Any axe-core violation flagged on the preview deploy

**Phase to address:**
Phase that wires up the design system; verify on every page-build phase thereafter.

---

### Pitfall 17: Removed focus styles without replacement

**What goes wrong:**
Someone (or a CSS reset) sets `outline: none` on `:focus` to remove the "ugly" blue ring on buttons and form inputs. Keyboard users can no longer tell where focus is. The Say Hi form becomes unusable with a screen reader or keyboard. WCAG 2.4.7 violation.

**Why it happens:**
The browser default focus ring is universally considered ugly by designers. It gets removed early, often before the replacement is added.

**How to avoid:**
Never write `outline: none` without an immediately adjacent `:focus-visible { outline: 2px solid var(--bluemli-indigo); outline-offset: 2px; }` (or similar visible indicator using a brand color). Use `:focus-visible` (not `:focus`) so the ring only appears for keyboard users, not on every mouse click. Test the contact form, navigation, and any interactive component with Tab-only navigation before shipping.

**Warning signs:**
- `outline: none` or `outline: 0` appears in committed CSS without a paired focus indicator
- Tabbing through the page shows no visible focus
- Lighthouse a11y flags missing focus indicators

**Phase to address:**
Phase that wires up the design system.

---

### Pitfall 18: WWW vs apex domain mismatch / no redirect

**What goes wrong:**
Cloudflare Pages serves the site at both `studiobluemli.com` and `www.studiobluemli.com`. Both work. Search engines index both. Social cards link to one, the founder shares the other. SEO juice splits. Visitors see slightly different URLs in the address bar depending on entry point. Canonical confusion.

**Why it happens:**
Cloudflare Pages doesn't auto-pick a canonical hostname. If both are pointed at the Pages project, both serve identical content (a soft duplicate-content issue). Visitors landing on the wrong one stay there.

**How to avoid:**
Pick the apex (`studiobluemli.com`) as canonical. In Cloudflare DNS, create a redirect rule (Rules → Redirect Rules) that 301s any request with `Host = www.studiobluemli.com` to `https://studiobluemli.com$1`. In the site, set `<link rel="canonical" href="https://studiobluemli.com/...">` on every page using the apex form. In `astro.config.mjs`, set `site: 'https://studiobluemli.com'` so the sitemap and feed URLs are canonical too.

**Warning signs:**
- Both `studiobluemli.com` and `www.studiobluemli.com` return 200 with identical content
- The `og:url` on a page is `www.` but the user is on apex (or vice versa)
- `astro.config.mjs` doesn't set `site`

**Phase to address:**
Phase that does the DNS cutover (one of the last phases — verify before announcing the site).

---

### Pitfall 19: Umami not tracking events because domain isn't registered

**What goes wrong:**
The Umami Cloud script tag is added to the site. The script loads. No events appear in the Umami dashboard for days. The founder thinks analytics are broken. Reality: the domain wasn't added to the Umami website list, so Umami rejects events from that origin silently.

**Why it happens:**
Umami Cloud requires the domain be registered in its website list (paired with the website ID in the script tag). Events from un-registered domains return 200 OK from `/api/send` but are dropped server-side. The script never logs an error in the browser console.

**How to avoid:**
When generating the Umami snippet, add **both** `studiobluemli.com` and `www.studiobluemli.com` (and the Cloudflare Pages preview wildcard if you want preview analytics — though usually you don't) to the Umami website settings. Verify in the Umami dashboard "Realtime" view that events show up *immediately* after deploying. Use the `data-domains` attribute on the script tag to also restrict where the script will report from (defense in depth — prevents preview-deploy traffic from polluting production stats).

Confirm the snippet is the **cookieless** form (Umami Cloud is cookieless by default — but if anyone migrates to self-hosted, double-check the install).

**Warning signs:**
- Umami dashboard shows 0 events on launch day despite real traffic
- The script tag is loaded (visible in DevTools) but `/api/send` returns no events in the dashboard
- The `data-domains` attribute is missing or wrong

**Phase to address:**
Phase that wires up analytics (after the production domain is live, so the right domain can be registered).

---

### Pitfall 20: Inline form error with no fallback mailto for JS-disabled visitors

**What goes wrong:**
The contact form is a React island that submits to the Worker. If JS fails to load (slow network, content blocker, NoScript), the form is dead. The visitor sees a form they can't submit. There's no fallback. They bounce.

**Why it happens:**
Modern dev defaults assume JS works. It usually does — but mobile networks drop packets, some users block scripts, some screen readers struggle with React state changes.

**How to avoid:**
The Say Hi page should **always** show the founder's email address (or a `mailto:` link) in plain text near the form — not buried in a footer — as the failsafe. Also include the Instagram handle. If the visitor can't or won't use the form, they have two other unambiguous paths. The form itself should also degrade: render as a real HTML `<form action="..." method="POST">` so it at least posts (even without React) to the Worker, which can render a simple HTML thank-you response. Use progressive enhancement, not JS-only.

**Warning signs:**
- The contact form area is empty when JS is disabled in DevTools
- No `mailto:` or visible email anywhere on the Say Hi page
- The form's `<form>` element has no `action` attribute

**Phase to address:**
Phase that builds the contact form.

---

### Pitfall 21: Missing "Reply-To" header — replies go to the wrong address

**What goes wrong:**
The Worker sends mail from `noreply@studiobluemli.com` to the founder's inbox. The founder hits "Reply" in Gmail. The reply goes to `noreply@studiobluemli.com` — which isn't a real inbox. The visitor never hears back. The founder thinks she replied; the visitor thinks she ghosted them.

**Why it happens:**
The "From" address has to be a domain you control (for SPF/DKIM). The visitor's email goes in the body, not in the From header. Replying to the system-sent email reaches the system, not the visitor.

**How to avoid:**
In the Worker, when calling Resend (or any provider), set the `reply_to` field to the visitor's email address (parsed from the form, validated). The "From" stays `Studio Bluemli <hello@studiobluemli.com>` or similar, but reply-to is dynamic per message. Include the visitor's email visibly in the email body too, as a belt-and-suspenders measure.

**Warning signs:**
- The Worker code does not set a `reply_to` field on the outgoing message
- A test email's Reply-To header (visible in Gmail's "show original") is the From address
- Hitting Reply in Gmail addresses to the no-reply address

**Phase to address:**
Phase that builds the contact form.

---

### Pitfall 22: No honeypot + no rate limiting on the contact form

**What goes wrong:**
Turnstile catches most bots, but determined spammers solve Turnstile (or buy CAPTCHA-solver services). They hammer the form. The Worker calls Resend on every request. Resend quota burns through. The free tier hits the daily cap by mid-afternoon and legitimate inquiries from real visitors silently fail.

**Why it happens:**
Turnstile is good but not perfect. Anti-spam is layered, not single-control.

**How to avoid:**
Add a **honeypot field** — a hidden input named something innocuous like `website` or `url` that real users won't fill (CSS-hidden, `tabindex="-1"`, `aria-hidden="true"`). If the Worker sees it filled, drop the request without calling Resend. Add **IP-based rate limiting** via Cloudflare KV: store `ip -> last_submit_timestamp`, allow at most 1 submission per 60 seconds, 10 per hour. Reject excess silently (don't tell the bot it's being blocked). For belt-and-suspenders, also limit by Turnstile token to one use (the API already does this, but be explicit).

**Warning signs:**
- The form has no hidden honeypot input
- The Worker code has no rate-limit check (no KV reads/writes for throttling)
- The Resend dashboard shows a sudden spike in usage with no corresponding rise in real inquiries

**Phase to address:**
Phase that builds the contact form (same time as Turnstile).

---

### Pitfall 23: Founder editing workflow requires the command line

**What goes wrong:**
The roadmap assumes the founder will run `git pull`, `npm run dev`, edit files in VS Code, `git commit`, `git push`. The founder is not a developer. She tries once, hits a merge conflict or an `npm install` error, gives up, and stops adding gallery pieces. The "founder is the only editor" core requirement breaks.

**Why it happens:**
Developers design workflows for themselves. The founder is not the target user of `git rebase`.

**How to avoid:**
The primary editing workflow is **GitHub web UI**: navigate to the file on github.com, click the pencil, edit, commit directly to a new branch (or to main). For images, drag-and-drop upload via the GitHub UI's "Add file → Upload files" works. Branch commits trigger a Cloudflare Pages preview deploy automatically — the founder gets a preview URL in the GitHub PR within 2 minutes. After visual approval, click "Merge". Document this in `CONTENT_EDITING.md` at the repo root with screenshots. Optionally provide one-click "Add a new gallery piece" buttons via GitHub Issue Forms or saved-search bookmarks.

Optionally (later milestone) install a git-backed CMS (Decap, Sveltia, Pages CMS) that gives the founder a GUI on top of the same files. The file structure has been designed to be CMS-compatible from day one (per PROJECT.md decisions) so this is a drop-in addition.

**Warning signs:**
- Any documented workflow step starts with `npm`, `git`, or `cd`
- The founder asks "wait, how do I add a piece again?" more than once
- Gallery hasn't been updated in 30 days despite new work being made

**Phase to address:**
Phase that documents the content-editing workflow (after the gallery schema and preview deploys are working).

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Putting images in `public/` instead of `src/content/.../images/` | One-line image reference, no schema setup | No optimization, no responsive variants, broken-image risk on rename, 5x larger pages | Never for product photography; OK for `favicon.ico` and one-off chrome |
| Hardcoding the next pop-up date in a hero component | Founder doesn't have to learn YAML | Stale data, manual updates, hardcoded copy never matches the events page | Never — pop-up data has to live in one place |
| Skipping the gallery `availability` enum, using a free-text "status" | Faster MVP, no schema design | Typos go uncaught, sold pieces show as available, founder confusion | Never — this is the single most-edited field |
| Using a UI component library (shadcn, MUI, Chakra) | Faster scaffolding | White surfaces leak everywhere, brand drift, 1-px borders sneak in, dependency bloat | Never — design skill components are the canonical source |
| Skipping `@astrojs/sitemap` | One less integration to install | Worse Google indexing, manual maintenance | Never — it's literally one line of config |
| Inlining the Turnstile secret in the Worker code "just for the demo" | Faster local testing | Key leaks to git, has to be rotated, footgun for whoever forks later | Never — use `.dev.vars` from day one |
| Loading Google Fonts via `<link>` from `fonts.googleapis.com` | No font-hosting setup | Third-party latency, FOUT, GDPR concerns in EU, IP leak to Google | OK in earliest local prototyping; never in production |
| Single Resend project for prod + preview | Easier to set up | Spam tests in preview deploys burn production quota and pollute domain reputation | Acceptable only if you commit to never POSTing from preview deploys |
| Building the contact form as a fully client-rendered React component with no `<form action>` fallback | Cleaner React state management | Breaks for JS-disabled visitors, screen reader issues, no email delivery if Worker URL changes | Acceptable only with the visible mailto fallback (Pitfall 20) |
| Hardcoding "America/Los_Angeles" timezone string in lots of places | Quick fix for the pop-up cutoff bug | When the founder travels or runs a New York pop-up, the logic doesn't generalize | Acceptable for v1 (studio is in NoPa); revisit if a pop-up runs out of state |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| MailChannels | Following any pre-September-2024 tutorial that says "free, no DKIM, just POST" | Use Resend (or MailChannels' new paid Email API with account + DKIM); confirm provider's current free-tier terms on their pricing page before integrating |
| Cloudflare Turnstile | Validating the token client-side only | Server-side POST to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `{secret, response, remoteip}`; reject if `success !== true`; treat `timeout-or-duplicate` as a hard fail |
| Resend | Sending mail without DKIM verified on the sending domain | Run the full domain-verification flow first; check Resend dashboard for green checks on SPF/DKIM/DMARC; test deliverability to Gmail and iCloud inboxes before launch |
| Cloudflare Pages (Functions vs Workers) | Confusing the two; trying to deploy a standalone Worker route on the Pages project | Use **Pages Functions** (file-based routing under `functions/`) for the form endpoint — same Pages project, same deploy, secrets bound via the Pages dashboard. Don't create a separate Workers project unless you need features Pages doesn't support |
| Astro on Cloudflare Pages | Picking the SSR Cloudflare adapter when the site is fully static | Build in **static mode** (no adapter, or the `static` output) so all pages prerender at build time and image optimization runs via Sharp. Pages Functions handle the only dynamic endpoint (the contact form) — no full SSR adapter needed |
| Umami Cloud | Adding the script but not registering the domain in Umami's website list | Add the domain in Umami Cloud settings; verify in Realtime view that events arrive; set `data-domains` on the script to restrict reporting to production |
| Cloudflare Pages DNS | Pointing the domain at Pages before the site is ready to be canonical | Use a preview subdomain (e.g. `preview.studiobluemli.com` or just the `*.pages.dev` URL) until the build passes a launch checklist; cut DNS on launch day; have the redirect rule (www → apex) staged and ready |
| Astro Content Collections | Schema without `.strict()`, allowing typo'd frontmatter fields to be silently ignored | Use `z.object({...}).strict()` for both gallery and pop-up schemas; use `z.enum(...)` for state fields; use `image()` for image references |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Raw `<img>` tags with no width/height | Cumulative Layout Shift > 0.1, content jumping as images load | Use Astro's `<Image />` / `<Picture />` from `astro:assets`; width/height set automatically; or set explicit attributes on raw `<img>` | Always — even at 1 visitor/day, CLS is visible |
| Serving original-resolution photos to mobile | LCP > 3s on phones, slow Instagram-traffic experience | Generate AVIF + WebP variants at build time; use `srcset` with multiple widths; lazy-load below-the-fold images | At first page view from a mobile network on a 4 MB photo |
| Mounting React components with `client:load` everywhere | Bundle bloat, main-thread blocking, lower Lighthouse scores | No directive by default; `client:visible` for below-fold interactive components; `client:load` only above-fold and only when truly needed | When the page has more than 2–3 islands or the bundle hits 50 KB |
| Loading fonts from `fonts.googleapis.com` | Third-party latency, FOIT, render delay | Self-host as WOFF2, `font-display: swap`, preload critical fonts | On slow connections or when Google's CDN has a hiccup |
| Including the entire design-system React kit when only 3 components are used | Larger bundle, slower builds | Import only the components needed per page; verify with bundle analyzer | At 50+ components in the design system; not a near-term concern |
| Failing to set Cloudflare cache headers / using default cache | Stale content after deploys, or repeated origin fetches | Cloudflare Pages handles this by default for static assets (immutable hashed filenames are cached aggressively, HTML revalidates); verify in the Cache headers after deploy | Edge cases when manually overriding Pages defaults |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing Resend API key or Turnstile secret in committed files (`wrangler.toml`, `.env`, code) | Key abuse — spam from your domain, quota burn, domain reputation damage | Use Cloudflare Pages **secrets** (encrypted, write-only). Add `.env`, `.dev.vars`, `.wrangler/` to `.gitignore`. Audit with `git log -p --all -S 'sk_'` for accidental commits |
| Exposing the Turnstile **secret** key in client-side code | Anyone can call siteverify and pre-validate fake tokens, bypassing protection | Only the **site key** (public) goes in client HTML. The **secret key** stays in the Worker secret binding. Verify by inspecting the deployed page source — secret should not appear |
| Reflecting unescaped user input in the email body | HTML/email injection — attackers craft messages that look like they're from the founder | Send the contact form email as plain text only, not HTML; or if HTML, escape the visitor's input. Don't put visitor input in `From` or `Subject` headers |
| Returning detailed error messages from the Worker | Leaks implementation details to attackers | Worker returns generic `{ok: false}` JSON with a 4xx status; logs detailed error server-side via `console.error` (viewable in Cloudflare logs) |
| No rate limiting | Single bad actor exhausts the free Resend quota for the day | KV-backed IP throttle (1/min, 10/hour); honeypot field; Turnstile (token replay protection is automatic via the `timeout-or-duplicate` error) |
| Allowing arbitrarily large request bodies | DoS via memory exhaustion in the Worker | Check `request.headers.get('content-length')` and reject anything > a few KB; the contact form needs maybe 2 KB total |
| Loose CORS policy on the Worker endpoint | Other sites can submit through your form, burning quota | Restrict `Access-Control-Allow-Origin` to `https://studiobluemli.com` only (and the preview deploy hostname if needed for testing); reject other origins |
| Founder's email-provider account password recovery tied only to one device | Single point of failure for the whole pipeline | Set up account recovery via 2FA codes stored in a password manager; ensure backup codes are saved; document the credentials location |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Lightbox / image overlay without focus trap or Escape-to-close | Keyboard and screen reader users get trapped behind the modal | Use a tested library or component that handles `inert` on background, focus trap inside modal, Escape closes, returns focus to the trigger; test with Tab + Esc only |
| Contact-form success/error state announced only visually | Screen reader users don't know if their message sent | Use `aria-live="polite"` regions for non-critical status; `aria-live="assertive"` for errors; the message text should change content visibly and announce |
| "Sold" piece styled the same as available, distinguished only by color | Colorblind visitors can't tell what's available | Add a text label "sold" in the badge, not just color; use a different visual treatment (overlay, strikethrough on the price) |
| Forms with no visible label, only placeholder text | Placeholder disappears when user types, accessibility violation | Always use real `<label>` elements; placeholders are supplementary only |
| Pop-up dates shown as "06/14" with no year or weekday | Visitors don't know if that's coming up or past | Show full localized dates: "Saturday, June 14, 2026 · 12–6 PM"; use `<time datetime="...">` for semantic richness |
| Hero photo not visible on mobile until scrolled (because the hero is portrait and the viewport is short) | The brand-defining image is below the fold | Test on a 375×667 viewport (iPhone SE); ensure at least one product photo is in the first 100vh; consider landscape crops for mobile |
| Instagram link styled as just "Instagram" with no icon | Mobile users skim and miss it | Use a clear text-plus-icon link, prominent in header and footer; "@studiobluemli on Instagram" |
| Removing visited-link styling everywhere | Visitors can't tell what pages they've already seen | Keep a subtle visited-link color shift (per brand palette) at least in nav and gallery links |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Contact form:** Often missing server-side Turnstile validation — verify by submitting with an invalid/forged `cf-turnstile-response` and confirming the Worker rejects it
- [ ] **Contact form:** Often missing `reply_to` header — verify by sending a test and checking the original-message headers in Gmail
- [ ] **Contact form:** Often missing rate-limit + honeypot — verify by submitting the form 5 times in 10 seconds and confirming the 4th+ get rejected
- [ ] **Contact form:** Often missing JS-disabled fallback — verify by disabling JS in DevTools and confirming a `mailto:` is visible
- [ ] **Email deliverability:** Often missing DKIM verification — verify Resend dashboard shows green checks AND test message lands in Gmail inbox (not spam)
- [ ] **DNS:** Often missing apex/www redirect — verify `curl -I https://www.studiobluemli.com/` returns 301 to apex
- [ ] **Gallery schema:** Often missing `.strict()` — verify by adding a typo'd field to a markdown file and confirming the build fails
- [ ] **Gallery:** Often missing "sold" visual state — verify by setting `availability: sold` on a piece and confirming it renders with a clear badge, not just disappears
- [ ] **Pop-ups:** Often missing timezone-correct date filtering — verify by manipulating system clock around the cutoff time and confirming events transition past at the right wall-clock moment
- [ ] **Images:** Often missing AVIF/WebP variants — verify Network tab on a gallery page serves `.avif` to Chrome and `.webp` to Safari
- [ ] **Images:** Often missing alt text — verify with axe-core or Lighthouse; every product photo needs descriptive alt that doesn't say "flower"
- [ ] **Images:** Often missing width/height — verify CLS score in Lighthouse is < 0.1
- [ ] **SEO:** Often missing `og:image` per page — verify with Facebook Sharing Debugger on the home page, a gallery piece, and a pop-up
- [ ] **SEO:** Often missing `sitemap.xml` — verify `https://studiobluemli.com/sitemap-index.xml` returns valid XML with all pages
- [ ] **SEO:** Often missing `robots.txt` — verify it exists and references the sitemap
- [ ] **SEO:** Often missing canonical tag — verify `<link rel="canonical">` on every page uses the apex domain
- [ ] **Favicon:** Often missing the 180px Apple touch icon (already in `assets/`) — verify `<link rel="apple-touch-icon" href="/mark-favicon-180.png">` is present
- [ ] **Analytics:** Often missing domain registration in Umami — verify Realtime view shows your test visit within 5 seconds
- [ ] **Brand:** Often missing audit for white backgrounds — grep for `bg-white`, `#fff`, `#ffffff`, `background: white`; should return zero hits in production CSS
- [ ] **Brand:** Often missing audit for "flower" copy — grep for `flower|petal|floral|bloom` in `content/` and `src/`; verify no production-visible matches
- [ ] **Brand:** Often missing audit for forbidden elements — grep for `gradient`, `backdrop-filter: blur`, `border: 1px`; should return zero hits in production CSS
- [ ] **Accessibility:** Often missing focus indicators after `outline: none` — verify by Tab-navigating every page and confirming a visible ring on every interactive element
- [ ] **Accessibility:** Often missing contrast verification — run Lighthouse a11y; score should be 95+; manually verify coral-on-cream is never used for body text
- [ ] **Accessibility:** Often missing landmark roles — verify the page has one `<header>`, `<main>`, `<footer>`, and `<nav>` per the HTML5 outline
- [ ] **Build determinism:** Often missing lowercase-route check — verify all files under `src/pages/` and `src/content/` are lowercase
- [ ] **Secrets:** Often missing audit for committed secrets — run `git log -p --all` searching for `sk_`, `RESEND`, `TURNSTILE_SECRET`; nothing should match
- [ ] **Cloudflare:** Often missing secret/env split — verify production and preview Pages environments have their own secret values
- [ ] **Preview deploys:** Often missing — verify pushing to a non-main branch triggers a unique preview URL accessible from the GitHub PR
- [ ] **Content workflow:** Often missing documentation — verify `CONTENT_EDITING.md` exists at repo root with screenshots of the GitHub web UI flow

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| MailChannels-based form code shipped, mail not delivering | LOW | Sign up for Resend, verify domain, swap the API call in the Worker, redeploy, re-test |
| Resend API key committed to git | MEDIUM | Rotate the key in Resend dashboard immediately; force-push to remove from history only if the repo is private and recent (otherwise accept the leak and rely on rotation); update the secret binding in Cloudflare Pages; audit Resend logs for any unauthorized use |
| SPF/DKIM/DMARC missing or wrong; emails landing in spam | LOW | Add DNS records per Resend's verification page; wait for propagation (usually < 1 hour on Cloudflare DNS); re-verify in Resend dashboard; test against Gmail and iCloud |
| White background leaked into production via a third-party component | LOW–MEDIUM | Either replace the component with a design-skill equivalent, or override the background via a parent CSS rule with `var(--bluemli-cream)`; add the audit to CI to catch regressions |
| "Flower" copy in production hero or alt text | LOW | Find with grep; replace with the correct language ("bead clusters", "tiny beaded earrings", etc.); add the grep to CI; brief the founder on the rule |
| Sold piece accidentally deleted from `content/gallery/` | LOW (if recent) to HIGH (if photos also lost) | Revert the commit on GitHub; if photos were also deleted, restore from the founder's local source-photo archive (which should exist separately from the repo); change `availability` to `sold` rather than deleting next time |
| Pop-up shown as upcoming after it ended | LOW | Manual: edit the YAML to flip past/upcoming. Systemic fix: implement the timezone-correct cutoff and daily rebuild trigger (Pitfall 7) |
| Lighthouse mobile score < 70 on gallery | MEDIUM | Audit image sizes — likely raw photos in `public/`. Move to `src/content/gallery/images/`, reference via `image()` schema, render with `<Picture>`, set widths and formats; rebuild |
| Form submissions returning 500 from the Worker | LOW–MEDIUM | Check Cloudflare Pages → Functions → Logs; common causes: missing secret binding, malformed Turnstile siteverify call, Resend API key invalid or rate-limited. Fix the specific error |
| Spam flood through the contact form | MEDIUM | Add the honeypot field if missing; tighten KV-based rate limiting; rotate the Resend API key if it was abused; consider stricter Turnstile mode (Managed → Non-interactive → Invisible has different tradeoffs) |
| Founder finds the GitHub web UI workflow confusing | MEDIUM | Schedule a 30-minute screen-share walkthrough; update `CONTENT_EDITING.md` with the founder's specific confusion points captured. Longer-term: install a git-backed CMS (Decap, Sveltia, Pages CMS) — the file structure is already CMS-compatible per PROJECT.md |
| WWW and apex both serving content | LOW | Add the redirect rule in Cloudflare → Rules → Redirect Rules; redeploy; verify with `curl -I` |

## Pitfall-to-Phase Mapping

This mapping assumes a roadmap roughly organized as: (1) foundations & design system, (2) content schema & gallery, (3) pages & layouts, (4) contact form, (5) analytics & SEO, (6) DNS cutover & launch. Adjust phase numbers as the roadmap solidifies.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. MailChannels tutorial copy-paste | Phase 4 (contact form) | Worker uses Resend (or current MailChannels paid API); end-to-end test delivers real mail to founder inbox |
| 2. Skipping Turnstile server-side validation | Phase 4 (contact form) | curl with fake token returns 4xx; form rejects empty/invalid tokens |
| 3. Missing SPF/DKIM/DMARC | Phase 4 (contact form), kicked off early | Resend dashboard green checks; Gmail inbox delivery test passes |
| 4. White backgrounds | Phase 1 (design system) | CI grep returns no `bg-white`/`#fff`/`background: white`; visual-regression snapshot of all pages |
| 5. "Flower" copy | Phase 1 (CI scaffolding) | CI grep returns no `/flower|petal|floral|bloom/i` in content/src; documented in README |
| 6. Sold pieces deleted not marked | Phase 2 (gallery schema) | Schema includes `availability` enum; content README documents the workflow |
| 7. Pop-up timezone bugs | Phase 2 (pop-up schema) or Phase 3 (pop-up page) | Test with manipulated system clock; cron-trigger daily rebuild verified |
| 8. Unoptimized photos blowing up LCP | Phase 2 (image pipeline) | Lighthouse mobile LCP < 2.5s; Network tab serves AVIF/WebP < 200 KB |
| 9. Over-hydration with `client:load` | Phase 3 (component integration) | CI rule limits `client:load` instances; bundle analyzer shows < 50 KB JS per page |
| 10. FOIT from web fonts | Phase 1 (design system) | Self-hosted WOFF2 with `font-display: swap`; Lighthouse "ensure text visible during webfont load" passes |
| 11. Zod schema not strict | Phase 2 (content schema) | `.strict()` on all schemas; deliberate typo test fails the build |
| 12. Image filename rename breaks references | Phase 2 (content schema) | All images referenced via `image()` helper; rename test fails the build |
| 13. Case-sensitivity routing | Phase 1 (CI scaffolding) | CI rule enforces lowercase filenames under `src/pages/` and `src/content/` |
| 14. Missing `og:image` per page | Phase 3 (layout/SEO) | Facebook Sharing Debugger renders preview for home, a gallery piece, and a pop-up |
| 15. Secrets in committed files | Phase 4 (contact form) | git history audit shows no secret values; Cloudflare Pages secrets bound as Secret type, not Plain text |
| 16. Color contrast | Phase 1 (design system) | Lighthouse a11y ≥ 95; manual coral-on-cream audit |
| 17. Removed focus styles | Phase 1 (design system) | Tab-navigate every page; visible ring on every interactive element |
| 18. WWW vs apex mismatch | Phase 6 (DNS cutover) | `curl -I https://www.studiobluemli.com/` returns 301 to apex |
| 19. Umami domain unregistered | Phase 5 (analytics) | Realtime view in Umami dashboard shows test visit within seconds |
| 20. No JS-disabled fallback | Phase 4 (contact form) | Disable JS in DevTools; verify visible mailto and form-action fallback |
| 21. Missing Reply-To header | Phase 4 (contact form) | Test message in Gmail shows visitor's email in Reply-To header |
| 22. No honeypot / no rate limiting | Phase 4 (contact form) | Submit 5+ times in 10 seconds; 4th+ rejected; honeypot field present and CSS-hidden |
| 23. Founder workflow requires CLI | Phase 2 (content) or Phase 6 (pre-launch docs) | `CONTENT_EDITING.md` documents the GitHub web UI flow with screenshots; founder dry-run successfully adds a piece end-to-end |

## Sources

Verified during research (2026-05-12):

- [MailChannels End of Life Notice — Cloudflare Workers (MailChannels Support)](https://support.mailchannels.com/hc/en-us/articles/26814255454093-End-of-Life-Notice-Cloudflare-Workers) — confirms August 31, 2024 termination of the free Cloudflare Workers tier
- [Important Update: MailChannels' Email Sending API for Cloudflare Workers to be Terminated (MailChannels Blog)](https://blog.mailchannels.com/important-update-mailchannels-email-sending-api-for-cloudflare-workers-to-be-terminated/) — migration path to paid Email API
- [Send Emails With Resend (Cloudflare Workers docs)](https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/) — current official tutorial; replaces the deprecated MailChannels guide
- [Cloudflare — Resend Knowledge Base](https://resend.com/docs/knowledge-base/cloudflare) — Resend + Cloudflare DNS setup for SPF/DKIM/DMARC
- [Validate the token — Cloudflare Turnstile docs](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) — server-side siteverify protocol, token expiry, single-use rules
- [Token validation — Cloudflare Turnstile docs](https://developers.cloudflare.com/turnstile/turnstile-analytics/token-validation/) — `timeout-or-duplicate` error code
- [Images — Astro Docs](https://docs.astro.build/en/guides/images/) — `<Image>` / `<Picture>` components, `image()` schema helper, formats, CLS prevention
- [astrojs/cloudflare adapter — Astro Docs](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) — Sharp limitations in SSR mode on Cloudflare
- [Content Collections — Astro Docs](https://docs.astro.build/en/guides/content-collections/) — Zod schema validation, error messages
- [Template directives reference — Astro Docs](https://docs.astro.build/en/reference/directives-reference/) — `client:load` / `client:visible` / `client:idle` / `client:only` semantics
- [Astro's Client Directives: When and Where to Use Each (dev.to)](https://dev.to/lovestaco/astros-client-directives-when-and-where-to-use-each-165g) — common over-hydration patterns
- [Preview deployments — Cloudflare Pages docs](https://developers.cloudflare.com/pages/configuration/preview-deployments/) — branch preview URLs, per-PR unique URLs
- [Branch deployment controls — Cloudflare Pages docs](https://developers.cloudflare.com/pages/configuration/branch-build-controls/) — preview vs production branch config
- [Bindings — Cloudflare Pages docs](https://developers.cloudflare.com/pages/functions/bindings/) — Secrets vs env vars distinction
- [Environment variables and secrets — Cloudflare Workers docs](https://developers.cloudflare.com/workers/development-testing/environment-variables/) — local dev with `.dev.vars`
- [Tracker configuration — Umami docs](https://docs.umami.is/docs/tracker-configuration) — `data-domains`, `data-host-url`, cookieless behavior
- [Umami FAQ](https://docs.umami.is/docs/faq) — domain registration requirement
- [Optimizing Web Fonts: FOIT vs FOUT vs Font Display Strategies (Talent500)](https://talent500.com/blog/optimizing-fonts-foit-fout-font-display-strategies/) — render-blocking font behavior
- [Bagel Fat One self-host (Google Web Fonts Helper)](https://gwfh.mranftl.com/fonts/bagel-fat-one?subsets=latin) — WOFF2 hand-display font self-hosting

Project-internal sources:

- `/Users/lucacanonica/Documents/projects/bluemli/.planning/PROJECT.md` — scope, constraints, decisions, brand non-negotiables
- `/Users/lucacanonica/Documents/projects/bluemli/.claude/skills/studio-bluemli-design/SKILL.md` — brand non-negotiables (cream not white; never "flower"; petal order on the mark; no center bead; no emoji except ♡/♥ coral; three accents max; no gradients/frosted glass/1-px borders; hand-fonts for headlines; product photography is the brand)

---
*Pitfalls research for: Studio Bluemli static portfolio site (Astro + Cloudflare Pages + markdown content + Worker contact form)*
*Researched: 2026-05-12*
