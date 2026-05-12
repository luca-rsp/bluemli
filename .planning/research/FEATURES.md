# Feature Research

**Domain:** Small one-person jewelry/craft studio marketing site (portfolio + brand presence, no e-commerce). Sales happen at pop-ups and via Instagram DM. Visitors arrive primarily from an Instagram bio link, on mobile, after seeing a piece on the feed.

**Researched:** 2026-05-12

**Confidence:** HIGH on table stakes (web baseline + accessibility + meta tags are well-documented and uncontroversial). MEDIUM-HIGH on differentiators (grounded in real comparable studios — Naomi Clement Ceramics, San José Made events page, Format jewelry portfolio roundup, Amano Studio, Page Sargisson, Kinn). MEDIUM on anti-features (informed by NN/g pop-up research and direct conflict with brand non-negotiables already documented in `studio-bluemli-design/SKILL.md`).

## Feature Landscape

### Table Stakes (Users Expect These)

Features visitors don't consciously notice when present, but immediately read as "this site feels cheap / broken / unfinished" when missing. Most arrive from an `@studiobluemli` bio link on mobile, so phone behavior is the default.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Mobile-first responsive layout | The dominant traffic source is an Instagram bio link tapped on a phone. A desktop-first site that reflows poorly on iOS Safari reads as amateur. | LOW | Already a PROJECT.md requirement. Single-column on mobile, generous tap targets (≥44px), no horizontal scroll. |
| Fast first paint (< 1.5s LCP on mobile) | Tapping a bio link and waiting 4+ seconds = bounce back to Instagram. Static-first + image optimization is now the floor, not a differentiator. | LOW | Astro static output + `<picture>` with width-descriptor `srcset` + AVIF/WebP. Cloudflare Pages CDN handles edge caching. Target Lighthouse mobile ≥ 90 (already in PROJECT.md constraints). |
| Clean top-level nav across 5 pages | A visitor must know where Gallery / Pop-ups / About / Say Hi live within one glance. Hamburger on mobile, inline on desktop is the standard. | LOW | 5 pages fit inline at desktop widths; mobile uses a small menu (button or short row). No mega-menu, no nested dropdowns. |
| Persistent Instagram link in obvious place | The brand's social-of-record. Visitors expect to find `@studiobluemli` in the header or footer, ideally both, with an external-link icon. | LOW | Header (top right) + footer. Use a small IG glyph, not a "Follow us" CTA card. |
| Working contact path with response-time expectation | Without a checkout, a contact path IS the conversion. A form that 404s, or copy with no warmth/no "I'll get back to you within X days", kills the only sales channel. | LOW | Form (3–4 fields) + visible IG link as the second route. Warm copy. Tested end-to-end before launch. |
| Spam protection on the form | An exposed form starts collecting Russian SEO spam within 48 hours of going live. Founder will stop trusting the inbox. | LOW | Cloudflare Turnstile (already in PROJECT.md decisions). Invisible until challenge needed. |
| Favicon (full set, including 180×180 iOS touch icon) | Missing favicons read as "deployed but never finished." iOS users who save to home screen need the 180px touch icon. | LOW | Already have `mark.svg` and PNG sizes in `assets/logo/`. Need `favicon.ico`, `favicon.svg` (with `mark.svg`), `apple-touch-icon.png` (180×180), and a web app manifest. |
| Open Graph + Twitter Card meta tags | When the founder pastes `studiobluemli.com` into a DM, Slack, or iMessage, a card with image + title + description should appear. Missing OG = a naked URL, which feels unprofessional and reduces click-through. | LOW | Per-page `og:title`, `og:description`, `og:image` (1200×630), `twitter:card="summary_large_image"`. Default OG image = a hero product shot on cream. Astro has first-party support via `<head>` slots. |
| `robots.txt` + `sitemap.xml` | Google needs them to index the site; LLM crawlers (GPTBot, ClaudeBot, Google-Extended) will read robots.txt to decide whether to ingest. | LOW | Astro has `@astrojs/sitemap` (one line of config). Allow all crawlers in robots.txt for v1; founder can decide LLM training policy later. |
| Alt text on every product photo | WCAG 1.1.1. Screen-reader users (and Google Image Search) need it. Decorative images (logo marks repeated for layout) get `alt=""`. | LOW | Each gallery entry's markdown should require an `alt` field. Founder writes it once per piece, e.g. "coral, indigo, and amber beaded-cluster earrings hanging on cream linen." |
| Visible "next pop-up" surface (when one exists) | The site replaces an IG profile — and on IG, the founder pins "next pop-up Sat 5/24" to her bio. Visitors expect that same answer here. | LOW–MEDIUM | A callout block on the landing page reading the next upcoming event from `/content/popups/`. Hides gracefully if there's no upcoming event ("no pop-ups on the calendar right now — DM me to be the first to know"). |
| Gallery with photo + name + price + availability | The product photography IS the brand (per brand non-negotiable #10). Visitors expect to see what's currently in the studio, with enough metadata to know if it's still available. | LOW | Single grid view. Each card: photo, name, price, availability badge. |
| Footer with copyright, location, IG, email | The "feels like a real site, not a Wix template I abandoned" floor. | LOW | "© Studio Bluemli, San Francisco" + IG + `hi@studiobluemli.com` (or whatever the address is). |
| HTTPS + apex redirect | `studiobluemli.com` and `www.studiobluemli.com` both resolve. One redirects to the other (apex preferred per PROJECT.md). | LOW | Handled by Cloudflare; one DNS record + one page rule. |
| Cookieless analytics (no consent banner) | A small studio site doesn't need GA4. A cookie banner is friction for zero benefit, and the brand voice rejects modal interruptions. | LOW | Umami Cloud is already chosen in PROJECT.md. |

### Differentiators (Competitive Advantage)

These are the small editorial touches that separate "a maker shipped a Wix template" from "the brand has a home." They map directly to brand non-negotiables in `studio-bluemli-design/SKILL.md` (cream background, product photography is the brand, hand-fonts for headlines, generous whitespace) and to the studio's actual sales mechanics (pop-ups, DMs, one-of-one pieces).

| Feature | Value Proposition | Complexity | Notes / Asset Dependencies |
|---------|-------------------|------------|----------------------------|
| Next-pop-up hero callout (landing + Pop-ups page) | Answers the question 80% of IG visitors arrived with: "where can I see these in person?" Treated as editorial copy ("come find me Saturday 5/24 at Outer Sunset Flea — booth 12"), not a card. | LOW | Depends on a current upcoming pop-up existing in `/content`. Needs a graceful empty state. |
| One-of-one / sold / available badges, tastefully done | Scarcity is real — these are hand-assembled pieces — and signaling it warmly ("just one of these") lifts perceived value without sounding like a Shopify scarcity widget. | LOW | Three states: `available`, `one_of_one`, `sold`. Render as small text labels in cream/coral, never as red "SOLD OUT" stamps. Sold pieces stay in the gallery (proof the studio has a history) but are visually de-emphasized. |
| Lookbook-style gallery presentation | Per brand rule #10 ("when in doubt, make the photo bigger"), the gallery should feel closer to a Nordic fashion brand's lookbook than to an Etsy grid. Generous whitespace on cream, large photos, minimal chrome. | MEDIUM | 2-column on mobile / 3-column on desktop is a safe default. Masonry gives editorial rhythm but is heavier; even-aspect grid is faster and reads cleaner with consistent product photography (which the studio already has). Recommend even-aspect grid v1, masonry as a v1.x experiment. |
| Quiet hover/transition motion | A 200ms cross-fade to a second product photo on hover (desktop) or a soft scale on tap (mobile) signals craft without crossing into theatrics. | LOW | Single CSS transition, no library. No parallax, no scroll-triggered animations (brand non-negotiable: no UI gradients, no frosted glass — same instinct applies to motion). Respect `prefers-reduced-motion`. |
| Lightbox / full-page detail view per piece | Lets a curious visitor see a piece large, read the 1–2 sentence description, see "inquire about this piece" — without the friction of a separate product page per item. Either an accessible lightbox modal (`role="dialog"`, focus trap, ESC closes, arrow keys navigate) or a dedicated `/gallery/<slug>` page works. | MEDIUM | Recommend per-piece pages (`/gallery/<slug>`) over a lightbox — they're shareable URLs, more accessible by default, and Astro generates them for free from markdown. Lightbox is fine as a v1.x enhancement. |
| Per-piece "inquire about this piece" CTA | The conversion. When a visitor sees a pair they want, the path is one tap → DM. Either deep-links to an Instagram DM with the piece name pre-filled, or routes to the contact form with the piece pre-selected. | LOW–MEDIUM | IG DM deep link (`https://ig.me/m/studiobluemli`) is the lower-friction option and matches how the founder already sells. Form alternative is `?piece=<slug>` query param. Recommend IG DM primary, form secondary. |
| Past pop-up archive (small, below the upcoming section) | Shows the studio has a real-world history. A visitor seeing "10 pop-ups since 2024" gets implicit social proof that this is a working brand, not a project. | LOW | Same `/content/popups/` source, just filtered by date. Render compact (name + date + location, no photos required). Asset dependency: only valuable once there are ≥ 3 past pop-ups; ship the layout with a graceful empty state. |
| Founder photo + handwritten-feel signature on About | One-person brands live or die on whether visitors feel a human is behind them. A photo of the founder in the studio + the hand-font name as a "signature" closing the About copy makes the brand legible in 4 seconds. | LOW | Asset dependency: needs one good founder photo. The hand-font "signature" reuses the headline hand-font from the design skill, no new asset. Brand non-negotiable: bio in **first person** ("I make these in NoPa..."), not third. |
| Process / studio-life imagery on About (1–3 photos) | Visitors who scrolled past the founder photo want to see the work being made — beads being sorted, an in-progress cluster on a workbench, the studio corner. Cements the "real human, real hands" feel. | LOW | Asset dependency: founder needs to shoot or already have 1–3 process shots. If unavailable v1, defer rather than fake. |
| Press / "as seen at" section on About (optional) | If the studio has been featured by SF Made, a local zine, or carried at a curated pop-up, listing those (text only — small text, no logo wall) builds quiet credibility. | LOW | Asset dependency: requires actual press. Do NOT ship a logo wall with two grey placeholder boxes — empty press sections read worse than no section. |
| Warm contact copy with response-time expectation | "I read every message — usually back within a day or two. If it's about a specific piece, mentioning the name helps." Sets expectations honestly (founder is one person) and feels human. | LOW | Voice already specified in `studio-bluemli-design/SKILL.md`: warm, casual, founder-first, sentence-case, friendly parentheticals, no emoji. |
| Reply-to set to founder on contact form | When the founder hits Reply in her inbox, it goes to the visitor's email — not to a no-reply Worker. Tiny detail; makes the contact loop feel like real correspondence. | LOW | One-line config in the Resend/Mailchannels send call: `reply_to: form.email`. |
| Per-page descriptive OG images | When the founder shares `/gallery/topaz-cluster` in a DM, the unfurl shows that specific pair, not a generic site card. Lifts click-through measurably. | MEDIUM | Astro can pre-generate per-piece OG images at build time using `@vercel/og` or `satori`. Alternative: hand-set a per-piece OG image (which is just the product photo with brand framing) and skip the generator for v1. Recommend manual for v1, generator as v1.x. |
| `prefers-color-scheme` respected (light only, intentionally) | The brand IS cream-on-coral/indigo. Don't auto-flip to dark mode and break the palette. Site declares itself light-only via `color-scheme: light` and that's correct. | LOW | One-line CSS + a `<meta name="color-scheme" content="light">`. |
| Skip-to-content link + visible focus styles | Accessibility floor that most small studio sites miss. Cheap to add, makes the site work for keyboard users and screen readers, and feels considerate. | LOW | Standard pattern; the design skill's tokens already include a focus-ring spec (verify in `colors_and_type.css`). |

### Anti-Features (Commonly Requested, Often Problematic)

Features the broader web/agency playbook will suggest, that conflict with either the brand non-negotiables already documented in `studio-bluemli-design/SKILL.md` or with the studio's actual sales reality (pop-ups + DMs, not a checkout funnel).

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Newsletter signup pop-up modal | "Capture the visitor before they leave" — standard e-commerce playbook. | NN/g and Google both penalize intrusive interstitials; bounce rate spikes. Brand voice is warm/founder-first and modals interrupting a first visit are the opposite of that. There's no newsletter yet anyway (out-of-scope per PROJECT.md). | If a newsletter is ever added: a single quiet line in the footer ("if you want a heads-up before the next pop-up, drop your email below"), no modal, no exit-intent. |
| Cookie consent banner | "Required by law." | Only required if the site uses tracking cookies. Umami Cloud is cookieless by design (PROJECT.md decision) so no banner is needed. Adding one anyway is friction for zero gain. | Sidestep entirely: keep analytics cookieless. Document the choice in a simple `/privacy` page if desired (one paragraph). |
| Hero video autoplay (with or without sound) | "Modern brand sites have hero videos." | Costs 4+ MB on first paint, kills LCP, drains mobile data, and conflicts with the brand's quiet/editorial voice. Autoplay-with-sound is the canonical "feels cheap on mobile" mistake. | A still hero photo (product or founder), or a 3-shot CSS slideshow with `prefers-reduced-motion: reduce` honored. |
| Live chat widget | "Convert visitors in real time." | The studio's chat IS Instagram DMs. A second chat surface fragments the conversation, requires the founder to monitor it, and adds a third-party script + cookies (defeating the cookieless setup). | The visible IG link IS the chat. The contact form IS the async fallback. |
| Aggressive "Buy Now / Add to Cart" CTAs | "Convert." | There is no cart (out-of-scope per PROJECT.md). A "Buy Now" button that opens a DM is a bait-and-switch — visitors expect a checkout and get confused. | "Inquire about this piece" → IG DM. Plain language matches plain mechanics. |
| Testimonial carousel / 5-star reviews block | "Social proof." | The studio doesn't have a curated review pipeline, and testimonials on a one-person craft site read as inauthentic. Worse: stock-photo testimonials are an instant trust-killer. | If social proof is wanted: real press mentions (when they exist), or a quiet "as carried at: SF Made, Outer Sunset Flea, Mission Made" line. Never fabricate. |
| Founder bio in third person | "Professional." | Reads as PR-agency-written and conflicts with brand voice (founder-first, warm, casual, sentence-case). The point of this site is that you talk to a person. | First person. "I make these in a sunny corner of NoPa. I started by..." |
| Logo wall of "as seen in" placeholders | "Looks legit." | An empty or sparsely-populated logo wall (1–2 logos with whitespace) looks WORSE than no press section. Stock logos are obvious. | Text-only press mentions, hyperlinked to the actual article, only when real press exists. If no press yet, omit the section entirely. |
| Parallax / scroll-jacking / heavy on-scroll motion | "Premium feel." | Conflicts with the design skill's stated rejection of UI gradients/frosted glass (same minimal/editorial instinct). Hostile to mobile, hostile to accessibility, hostile to LCP. | Quiet motion: a single hover transition on gallery cards (200ms), respect `prefers-reduced-motion`. Nothing scroll-driven. |
| "Featured in: NYT, Vogue, Forbes" pseudo-credibility logos when no such feature exists | "Establish authority." | Fraudulent. Easy to verify. Kills trust permanently. | Don't. List real press only. |
| Exit-intent popups | "Last chance to convert." | Same NN/g penalty as entry pop-ups; same brand voice mismatch. | None. The site doesn't have something to "convert" against. |
| Sticky / floating "Buy Now" CTA bar | "Always-visible CTA." | There is no Buy Now. A floating bar reading "INQUIRE" feels like a bot-built site. | The header IS the persistent nav; that's enough. |
| Pressed-flower decorative imagery sprinkled across pages | "Whimsy matches the brand name." | Explicit brand non-negotiable #4 in `studio-bluemli-design/SKILL.md`. "Bluemli" is etymology, not motif. | The bead-cluster mark and product photography ARE the visual brand. |
| Auto-redirect from `/` to a "currently we're at the pop-up!" splash | "Drive attention." | Splash screens cost a tap, fight Instagram's bio-link UX, and break shareability. The next-pop-up callout already does this job inline. | Inline callout on the landing page, removed via content edit when no event is scheduled. |
| Site-wide "Subscribe to our journal" CTA before a journal exists | "Build the list early." | Blog/journal is out-of-scope for v1 (PROJECT.md). Promising future content the founder hasn't committed to writing is overpromise. | Add a journal page only if/when the founder starts writing. |
| Multi-step contact form with subject categorization | "Route inquiries." | One human reads every message. Categories are pure friction. | One form: name, email, message. Maybe an optional "which piece?" select pre-populated when arriving from a gallery card. |
| Loading spinner / skeleton screens | "Looks polished." | A static site that takes long enough to need a spinner is a static site that's broken. Spinners are a smell, not a feature. | Static prerender + image CDN + small JS payload. No spinner needed. |

## Gallery UX patterns (portfolio-not-shop sites)

Specific patterns from comparable studios (Format jewelry roundup — Eugenia Chan, Alexandra Hopp, Remberto Ramírez Oramas; Page Sargisson; small-studio ceramicists):

- **Layout: even-aspect grid > masonry** when product photography is consistently shot (which Bluemli's is — same cream backdrop, same framing). Masonry shines when photos vary wildly; here it would feel busy. Recommend 2-col mobile / 3-col tablet / 3–4-col desktop. Generous gutters (cream breathing room).
- **Detail view: dedicated URL per piece** > lightbox. `/gallery/<slug>` is shareable in a DM ("hey have you seen this pair?"), works without JS, plays nicely with OG tags, and is what Astro generates naturally from `/content/gallery/<slug>.md`. Lightbox can be added later as an enhancement that intercepts the link.
- **Hover behavior: cross-fade to a second photo** is the editorial-feel default — it shows alternate angles without taking the visitor off-page. Tap on mobile = go to detail page. Don't use hover for revealing price/name; show those inline so nothing's hidden on mobile.
- **Card content (visible on grid): photo, name, price, availability label.** Don't hide price behind hover; visitors will see it on the IG post anyway, hiding it here adds friction.
- **"Inquire" CTA placement: on the detail page, not the grid card.** The grid is for browsing. The detail page is the conversion surface — that's where the IG DM deep-link sits.
- **Sort: newest first** with sold pieces de-emphasized (faded photo, "sold" label) but still visible. Sold pieces are portfolio proof, not dead weight.
- **No filter UI in v1.** With ~10–40 pieces, scrolling is faster than picking facets. Revisit if inventory grows past ~50.

## Pop-up event UX (upcoming vs past)

Pulled from San José Made's events page, Minneapolis Craft Market, Milwaukee Makers Market, and Terra Linda Ceramic Artists. Common pattern across small-maker sites:

- **Upcoming section sits on top, large.** Each event: date (formatted human-readable: "Saturday May 24"), location with neighborhood ("Outer Sunset Flea, SF"), time ("11am–4pm"), and 1–2 sentences ("come say hi and try things on"). A map link is nice-to-have, not required.
- **One "next pop-up" is also surfaced on the landing page** as a callout, pulled from the same data source. Don't re-edit two places.
- **Past section sits below, compact.** Three columns of `Date · Event · Location`, sorted reverse-chron, no photos required. Once the studio has ≥ 5 past pop-ups this becomes meaningful social proof.
- **Empty state for upcoming: a warm sentence.** "no pop-ups on the calendar right now — DM me on Instagram to be the first to know when the next one drops." Not an error, not a "coming soon" graphic.
- **No RSVP, no ticketing, no calendar embed.** Pop-ups at flea markets aren't RSVP'd. An `Add to calendar` `.ics` link is a small touch worth adding (LOW complexity, MEDIUM-HIGH value for the rare visitor who really wants to come).

## About page conventions (one-person studios)

Cross-referenced Amano Studio, Page Sargisson, Kinn, and Naomi Clement Ceramics — all founder-led, all with About pages that work. Patterns:

- **First-person narrative**, never third-person. "I started Bluemli in [year] because..." not "Bluemli was founded by..."
- **Founder photo prominent** — usually within the first viewport. Often in the studio, often working. Not a corporate headshot.
- **The "why" before the "what."** Why this founder makes this thing matters more than a CV. (Amano: "I studied Anthropology and dreamed of using design as a tool of economic development in Mexican artisan communities.")
- **A studio/process moment.** One photo or one paragraph that grounds the work in a real place — for Bluemli, the NoPa studio corner, the bead trays, a half-finished cluster on the bench.
- **Signature-style close.** A hand-font rendering of the founder's first name (or "with love, [name]") at the end of the About copy. Tiny detail; reads as a personal letter.
- **No CV, no client list, no awards.** Save that energy for the press section if real press exists.
- **Length: ~150–400 words.** Long enough to feel like the founder put thought in; short enough that mobile scrolling doesn't exhaust the visitor.

## Contact page conventions (craft makers)

From Jewel-Craft, Jewelry Made by Me, Amano, and Page Sargisson contact pages:

- **Three fields max for v1: name, email, message.** Optional fourth: "about a specific piece?" if landing from a gallery card.
- **Warm copy above the form.** Examples seen in the wild: "Let's talk!", "We're looking forward to hearing from you!", "I read every message." Pick a tone that matches Bluemli's voice: "drop me a note — I read every message myself, usually back within a day or two."
- **Response-time expectation, honestly stated.** "Usually back within a day or two" beats "we'll respond as soon as we can." Set the bar at what the founder can actually deliver.
- **Instagram link presented as the second route**, not as the primary. The form is the formal channel; IG is the casual one. Both visible, both warm.
- **Studio location prose, not a Google Maps embed.** "Made in NoPa, San Francisco" is enough. A pinned map is friction (and a third-party iframe) for zero benefit on a no-appointment-required brand.
- **No phone number.** Founder doesn't want sales calls. Email + IG covers every legitimate inquiry.
- **Confirmation: an inline "got it — talk soon" message after submit**, not a redirect to a thank-you page. Keeps the visitor on the site to browse more.
- **Spam protection (Turnstile) invisible until challenged.** No "I am not a robot" checkbox in the default path.

## Feature Dependencies

```
Gallery markdown schema (per-piece file)
    ├──requires──> Astro content collections setup
    ├──enables───> Per-piece detail page (/gallery/<slug>)
    │                  └──enables──> "Inquire about this piece" deep-link with piece context
    │                  └──enables──> Per-piece OG image (manual or generated)
    ├──enables───> Featured gallery on landing page (pulls 3–6 newest)
    └──enables───> Availability badges (available / one-of-one / sold)

Pop-up YAML schema (per-event entries with a date)
    ├──requires──> Astro content collections setup (same as gallery)
    ├──enables───> Pop-ups page (upcoming + past split derived from today's date)
    └──enables───> Next-pop-up callout on landing page (pulls earliest upcoming)
            └──enables──> Empty state ("no pop-ups on the calendar right now")

Contact form (Cloudflare Worker endpoint)
    ├──requires──> Email send provider (Resend or Mailchannels)
    ├──requires──> Turnstile site key + secret (anti-spam)
    └──enables───> Per-piece inquiry pre-fill (?piece=<slug>) — optional v1 feature

OG image strategy
    ├──requires──> A default site-level OG image (cream backdrop + product hero + wordmark)
    └──enables───> Per-page OG (about, pop-ups, gallery index, per-piece)
            └──upgrades to: build-time generator (v1.x) using satori or @vercel/og

Skip-to-content + focus styles + alt text discipline
    ├──conflicts with──> "Decorative pressed-flower images sprinkled around" (brand non-negotiable #4 — already off the table)
    └──reinforces──> Lighthouse mobile ≥ 90 target (PROJECT.md constraint)
```

### Dependency Notes

- **Per-piece detail page requires gallery content collection schema.** Define the schema (frontmatter shape) carefully on day one — adding required fields later means editing every existing piece markdown.
- **Featured-on-landing pulls from the same gallery source.** Don't fork into a separate "featured" list; instead, take the N newest (or use a boolean `featured: true` frontmatter flag).
- **Next-pop-up callout depends on date math.** Astro's build-time data + a "today" comparison computes upcoming vs past. If a pop-up is added or passes, a rebuild is required — fine for Cloudflare Pages auto-deploy on push, but worth flagging that the site doesn't self-update at midnight without a redeploy (acceptable: founder rebuilds when she edits content anyway).
- **OG images and favicon both depend on the logo asset variants** in `assets/logo/`. Those already exist; verify the sizes needed are present (180×180 touch icon, 1200×630 OG default).
- **Contact form per-piece pre-fill is a "nice-to-have" enhancement.** Ship the form first without it; add `?piece=<slug>` parsing in v1.x.

## MVP Definition

### Launch With (v1)

The minimum to feel done, not "minimum to feel broken."

- [ ] Landing page — hero (logo + tagline + founder photo or product hero), next-pop-up callout (with empty state), 3–6 featured gallery pieces, footer.
- [ ] Gallery index page — even-aspect grid, all pieces with photo + name + price + availability badge.
- [ ] Per-piece detail page (`/gallery/<slug>`) — large photo(s), name, price, 1–2 sentence description, availability, "inquire about this piece" → IG DM deep-link.
- [ ] Pop-ups page — upcoming section (large) + past archive (compact) + warm empty state for upcoming.
- [ ] About page — founder photo, first-person narrative, optional 1–3 process photos, hand-font signature close.
- [ ] Say Hi page — 3-field contact form (name, email, message), Turnstile, warm copy with response-time expectation, visible IG link as second route, inline confirmation on submit.
- [ ] Mobile-first responsive layout across all 5 pages.
- [ ] Favicon set (`favicon.ico`, `favicon.svg`, `apple-touch-icon.png` 180×180, web app manifest).
- [ ] Default OG image + per-page `og:title` / `og:description` / `og:image` / Twitter Card meta.
- [ ] `robots.txt` + `sitemap.xml` (via `@astrojs/sitemap`).
- [ ] Alt text on all product photos; `alt=""` on decorative marks.
- [ ] Skip-to-content link + visible focus styles + `color-scheme: light`.
- [ ] Umami Cloud analytics tag.
- [ ] Cloudflare Pages deploy from `main`; apex (`studiobluemli.com`) live; `www.` redirects to apex.
- [ ] Contact form Worker → email to founder, with `reply_to` set to the visitor's email.

### Add After Validation (v1.x)

Add when there's evidence the audience would use them.

- [ ] Per-piece OG image generator (build-time via satori or @vercel/og) — triggered when founder gets tired of hand-setting them, or when share unfurls become a noticed quality bar.
- [ ] Per-piece pre-fill on the contact form (`?piece=<slug>` from gallery detail page) — when IG DM volume suggests visitors want a more formal alternative.
- [ ] `Add to calendar` `.ics` link on each upcoming pop-up — when a visitor asks for it.
- [ ] Press / "as featured at" section on About — when there's real press to feature.
- [ ] Studio-life photo set on About — when the founder shoots 3–5 process images.
- [ ] Lightbox on gallery grid (intercepting the detail-page link) — only if visitor analytics show people bouncing back to the grid after each detail view.
- [ ] RSS or JSON feed for new pieces — if any aggregator/syndication need appears.

### Future Consideration (v2+)

Defer until the v1 site has been live long enough to know what's actually missing.

- [ ] Journal / writing surface — only if the founder wants one. Has its own content + voice work.
- [ ] Newsletter signup (footer-only, never modal) — only if there's something worth sending. Not until.
- [ ] Multi-photo carousel on detail pages — only if pieces start to have multiple photos worth showing. Single hero photo is fine until then.
- [ ] Light search / filter on gallery — only after inventory passes ~50 pieces.
- [ ] Git-backed CMS UI (Decap, Sveltia, Pages CMS, TinaCMS) — when markdown editing becomes friction for the founder. The PROJECT.md design already keeps this option open with zero migration cost.
- [ ] Actual checkout / e-commerce — explicitly out of scope, deliberately. Reconsider only if pop-ups and DMs hit a ceiling.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Mobile-first responsive layout | HIGH | LOW | P1 |
| Static-first fast first paint | HIGH | LOW | P1 |
| Persistent IG link header + footer | HIGH | LOW | P1 |
| Contact form + Turnstile + Worker | HIGH | MEDIUM | P1 |
| Favicon set (incl. 180×180) | MEDIUM | LOW | P1 |
| OG / Twitter meta on all pages | HIGH | LOW | P1 |
| `robots.txt` + `sitemap.xml` | MEDIUM | LOW | P1 |
| Alt text on all photos | HIGH (a11y/SEO) | LOW | P1 |
| Skip-to-content + focus styles | MEDIUM | LOW | P1 |
| Cookieless analytics (Umami) | MEDIUM | LOW | P1 |
| Next-pop-up callout on landing | HIGH | LOW | P1 |
| Gallery grid + per-piece detail page | HIGH | MEDIUM | P1 |
| Availability badges (avail / 1-of-1 / sold) | HIGH | LOW | P1 |
| "Inquire" → IG DM deep-link on detail | HIGH | LOW | P1 |
| Past pop-up archive (compact) | MEDIUM | LOW | P1 |
| Empty state for "no upcoming pop-ups" | MEDIUM | LOW | P1 |
| Founder photo + first-person About | HIGH | LOW (asset-dependent) | P1 |
| Warm contact copy + response-time line | MEDIUM | LOW | P1 |
| Quiet hover transition on gallery cards | LOW | LOW | P2 |
| Hand-font signature close on About | LOW | LOW | P2 |
| `prefers-reduced-motion` honored | MEDIUM (a11y) | LOW | P2 |
| Reply-to set to visitor on form submit | MEDIUM | LOW | P2 |
| Inline submit confirmation (no redirect) | MEDIUM | LOW | P2 |
| Process / studio-life photos on About | MEDIUM | LOW (asset-dependent) | P2 |
| Per-piece OG image (manual) | MEDIUM | LOW | P2 |
| Per-piece OG image (generated) | LOW | MEDIUM | P3 |
| Per-piece pre-fill on contact form | LOW | LOW | P3 |
| `Add to calendar` `.ics` per event | LOW | LOW | P3 |
| Lightbox on gallery grid | LOW | MEDIUM | P3 |
| Press / "as featured at" section | MEDIUM (when real) | LOW | P3 (gated on real press) |
| Filter / search on gallery | LOW | MEDIUM | P3 |
| Journal / writing surface | UNKNOWN | HIGH | P3 |
| Newsletter signup (footer only) | UNKNOWN | LOW | P3 |
| E-commerce / checkout | (out of scope) | HIGH | — |

**Priority key:**
- **P1**: Must have for v1 launch. Without these the site reads as broken or unfinished.
- **P2**: Should have, ship in v1 if time permits — these are the "editorial lift" touches that move the site from working to feeling like the brand.
- **P3**: Nice to have, defer until validation or until an actual need appears.

## Competitor / Comparable Studio Feature Analysis

| Feature | Naomi Clement Ceramics (ceramicist, one-person) | Amano Studio (jewelry, founder-led) | San José Made (collective, pop-up-focused) | Bluemli (recommended) |
|---------|------------------------------------------------|--------------------------------------|--------------------------------------------|-----------------------|
| Home page hero | Workshop CTA primary | Founder + product imagery | Featured event poster | Logo + tagline + next-pop-up callout + featured pieces |
| Gallery / shop layout | Shop page (e-commerce) | Shop page (e-commerce) | No portfolio per maker, just events | Portfolio grid, no checkout |
| Upcoming events surfacing | Absent (focuses on workshops) | Absent | Chronological list, full details per event | Hero callout + dedicated Pop-ups page |
| Past events archive | n/a | n/a | Not visible | Compact list below upcoming |
| About — voice | First-person, casual ("face-plants along the way") | Founder backstory + mission | Collective bio | First-person, warm, founder-first (per design skill voice rules) |
| Founder photo | Yes, conversational tone | Yes, in-studio | No (collective) | Yes (in-studio) |
| Press section | Absent | Absent on About | Absent | Optional, only when real press exists |
| Newsletter modal | None (uses inline footer signup) | Standard Shopify popup | None | None (no newsletter v1) |
| Cookie banner | None | Shopify-default | None | None (cookieless analytics) |
| Contact path | Form + IG link | Email + form | Form only | Form + IG link, IG also in header/footer |
| Per-piece detail page | Yes (Shopify product) | Yes (Shopify product) | n/a | Yes (`/gallery/<slug>`, static) |
| Per-piece "inquire" CTA | "Add to cart" (e-commerce) | "Add to cart" (e-commerce) | n/a | "Inquire about this piece" → IG DM |
| Availability state | "Sold out" Shopify default | "Sold out" Shopify default | n/a | available / one-of-one / sold (custom, editorial) |

The takeaway: Bluemli's closest siblings (Amano, Kinn, Page Sargisson, Naomi Clement) all have e-commerce, so they don't show the "no checkout, inquire via DM" pattern directly. The pattern Bluemli is adopting is closer to a fine-art-print / made-to-order studio site — and the cleanest expression of it is: keep the gallery as **portfolio**, treat each piece as **a single inquirable artifact**, and make Instagram (where sales already happen) a first-class second route on every conversion surface.

## Sources

Real comparable studios:
- [Naomi Clement Ceramics](https://naomiclement.com/) — first-person founder voice, conversational About, one-person studio site (analyzed via WebFetch)
- [San José Made events page](https://www.sanjosemade.com/pages/events) — chronological upcoming events with location, time, parking, accessibility info (analyzed via WebFetch)
- [Amano Studio About](https://amanostudio.com/pages/about-us) — first-person founder story (Seana, Sonoma, Oaxaca background)
- [Page Sargisson About](https://www.pagesargisson.com/pages/about-custom) — founder grew up in grandfather's woodworking studio narrative
- [Kinn Studio About](https://kinnstudio.com/pages/about-us) — founder's "why" (replacing stolen family heirlooms)
- [Format jewelry portfolio roundup](https://www.format.com/magazine/jewelry-design-roundup) — Eugenia Chan grid layout, Alexandra Hopp per-piece treatment, Remberto Ramírez Oramas in-studio About photo
- [Minneapolis Craft Market events page](https://www.mplscraftmarket.com/events) — upcoming-events listing pattern

Pattern / best-practices references:
- [Nielsen Norman Group — Popups: 10 Problematic Trends](https://www.nngroup.com/articles/popups/) — anti-pattern evidence for newsletter/exit-intent modals
- [Nielsen Norman Group — Overlay Overload](https://www.nngroup.com/articles/overlay-overload/) — competing popups menace
- [Smart Interface Design — Avoid Newsletter Pop-Ups](https://smart-interface-design-patterns.com/articles/harmful-newsletter-pop-ups/)
- [W3C WAI — Decorative Images](https://www.w3.org/WAI/tutorials/images/decorative/) — WCAG 1.1.1 `alt=""` for decorative images
- [W3C WAI — alt Decision Tree](https://www.w3.org/WAI/tutorials/images/decision-tree/)
- [Evil Martians — How to Favicon in 2026](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs) — the three-file modern favicon set
- [env.dev — Open Graph Protocol guide (2026)](https://env.dev/guides/opengraph) — OG / Twitter card setup baseline
- [CSS-Tricks — Essential Meta Tags for Social Media](https://css-tricks.com/essential-meta-tags-social-media/)
- [Halstead — Turn Your Artist Bio Into Your Jewelry Story](https://www.halsteadbead.com/articles/turn-artist-bio-into-jewelry-story)
- [Metalsmith Society — How to Write a Great About Page for Your Jewelry Website](https://metalsmithsociety.com/a/blog/how-to-write-a-great-about-page-for-your-jewelry-website)
- [Wolf Craft — How to Create a High Impact Press Page](https://wolf-craft.com/blog/how-to-create-a-press-page) — text-only press > logo wall when sparse
- [Cloudflare Turnstile + Contact Form 7 integration](https://contactform7.com/turnstile-integration/) — Turnstile invisible-challenge UX

Internal project context (read at the start of this research):
- `.planning/PROJECT.md` — 5-page scope, no-shop decision, brand non-negotiables, cookieless analytics decision
- `.claude/skills/studio-bluemli-design/SKILL.md` — brand voice, palette, fonts, "never describe as flowers," "cream not white," "no UI gradients/frosted glass/1px borders," "product photography is the brand"

---
*Feature research for: small one-person jewelry studio marketing site (portfolio + brand presence, no e-commerce)*
*Researched: 2026-05-12*
