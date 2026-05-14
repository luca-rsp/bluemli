# Phase 3: Page Composition & Pop-ups - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 3-Page Composition & Pop-ups
**Areas discussed:** Landing composition, Popups page layout, About page readiness, Say-hi shell scope

---

## Landing Composition

### Q1 — Next-popup callout treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Quieter mini-callout | New landing-only single-line callout (eyebrow + venue + date). Lets the Hero stay the visual anchor. | ✓ |
| Reuse PopupStrip as-is | Drop the same 80px Caveat Brush PopupStrip used on /popups onto landing. | |
| PopupStrip but smaller | Same component, scaled-down (32px vs 80px). | |

**User's choice:** Quieter mini-callout.
**Notes:** Locked into D-02. Component built as new section/component in `src/pages/index.astro` or a small reusable Astro file.

### Q2 — Featured piece count

| Option | Description | Selected |
|--------|-------------|----------|
| 6 (newest featured) | Matches Phase 2 D-15 plan-time intent; uses all 6 seeds. | |
| 3 (newest featured) | Tighter editorial register; matches current `.slice(0, 3)` placeholder. | ✓ |
| 4 (newest featured) | 2×2 mobile, 4-up desktop. | |

**User's choice:** 3 newest featured.
**Notes:** D-04. Overrides Phase 2 D-15's "6 most-recent featured" intent.

### Q3 — NOPA casing scope + Hero copy fit (combined)

**Sub-Q3a — NOPA scope:**
| Option | Description | Selected |
|--------|-------------|----------|
| All user-facing site copy now | Hero, About, Footer, site.yaml, new Phase 3 copy. Leave .planning/ and design-skill alone. | ✓ |
| Everything everywhere | All repo files including .planning, comments, design skill. | |
| Only new Phase 3 copy | Leave existing 'NoPa' instances alone. | |

**Sub-Q3b — Hero copy:**
| Option | Description | Selected |
|--------|-------------|----------|
| Keep Hero.jsx defaults (with NOPA) | Hero hardcoded; site.yaml feeds OG/footer only. | ✓ |
| Hero reads from site.yaml | Refactor Hero.jsx to accept H1+sub as props; add hero_h1/hero_sub schema fields. | |
| Rewrite Hero.jsx to match site.yaml voice | Edit Hero.jsx directly to align with site.yaml's "small-batch, hand-clustered" voice. | |

**User's choice:** All user-facing site copy / Keep Hero.jsx defaults with NOPA.
**Notes:** D-01, D-25. The "Hero copy" first ask returned with user notes only ("change NoPa to NOPA") and no option — re-posed with NOPA already applied to previews.

---

## Popups Page Layout

### Q4 — Upcoming events visual treatment

| Option | Description | Selected |
|--------|-------------|----------|
| One prominent + 'also coming up' list | Soonest event = full PopupStrip; others compact text list below. | ✓ |
| Equal-weight list of PopupStrips | Every upcoming as full PopupStrip stacked. | |
| Only-next prominent, everything else compact | One PopupStrip ever; further upcoming and past both compact lists. | |

**User's choice:** One prominent + 'also coming up' list.
**Notes:** D-06. First attempt was rejected by user with clarification "I only want the next popup listed on the landing page. if there are more popups coming, there should be a button 'see all future popups' or something like that. if there is no upcoming popup, there shouldnt be any mention of popups on the landing page" — that clarification actually redirected the landing decision (drove D-02, D-03, D-05) rather than the popups-page decision. Re-posed the question explicitly scoped to the dedicated /popups page.

### Q5 — Past archive density

| Option | Description | Selected |
|--------|-------------|----------|
| Text-only list | Compact date · venue · city lines. No photos. | ✓ |
| Text list + small thumbnail when present | 60–80px thumbnail to left of date when `photos` exists. | |
| Card grid with photo when present | Grid of cards with photo or text fallback. | |

**User's choice:** Text-only list.
**Notes:** D-07. `photos` field stays in the schema, unused in v1 rendering.

### Q6 — Empty-state copy when zero upcoming AND zero past

| Option | Description | Selected |
|--------|-------------|----------|
| One quiet line + IG link | Centered editorial line under quiet 'POP-UPS' eyebrow. | ✓ |
| Hand-display headline + line | Bigger treatment with 'between pop-ups' headline. | |
| Same as landing — hide content entirely | Render only header+footer with no in-between content. | |

**User's choice:** One quiet line + IG link.
**Notes:** D-08. Day-one shipping state, since `src/content/popups/` is empty.

---

## About Page Readiness

### Q7 — Process shot availability

| Option | Description | Selected |
|--------|-------------|----------|
| Already exist — will commit during Phase 3 | Founder has the photos ready. | |
| Need to shoot — ship without them initially | Ship About with no photos; add later. | |
| Need to shoot — block Phase 3 sign-off on them | Phase 3 doesn't ship until shots exist. | |
| Use existing product photography only | Reuse 1–3 gallery hero photos as About visuals. | ✓ |

**User's choice:** Use existing product photography only.
**Notes:** D-14. Softens the ROADMAP "process/craft shots (hands, beads, bench) — LOCKED" key risk. No founder face rule stays intact (gallery hero photos don't show the founder). Recorded as a divergence in CONTEXT.md.

### Q8 — Copy authorship

| Option | Description | Selected |
|--------|-------------|----------|
| Claude drafts brand-voiced placeholder; founder edits later | Ship with placeholder voice; founder edits via GitHub web UI on her timeline. | ✓ |
| Founder writes before Phase 3 starts | Blocks phase start. | |
| Founder writes during Phase 3 mid-execution | Back-and-forth turns. | |
| Ship with About.jsx default copy (with NOPA fix) | No expansion; keep current 2-sentence body. | |

**User's choice:** Claude drafts brand-voiced placeholder.
**Notes:** D-13. Brand voice per design-skill README ("warm, casual, sentence-case, NOPA in caps, no emoji except ♡").

### Q9 — About layout (photo placement)

| Option | Description | Selected |
|--------|-------------|----------|
| Photo row at top, copy below | 1–3 photos as opener; copy + signature beneath. | |
| Single hero photo, then copy | One full-plate-width photo at top; copy beneath. | |
| Copy first, photos below as a strip | Copy + signature first; 1–3 photo strip at the bottom as closing flourish. | ✓ |
| No photos — text only | Skip photo strip entirely. | |

**User's choice:** Copy first, photos below as a strip.
**Notes:** D-15.

### Q10 — Signature close

| Option | Description | Selected |
|--------|-------------|----------|
| Keep About.jsx default | "— the founder ♡" | |
| Use first name | "— [name] ♡" | |
| Custom hand-written phrase | Specific phrase. | ✓ |

**User's choice:** "made with love from NOPA ♡"
**Notes:** D-16. Custom phrase provided directly by user.

---

## Say-hi Shell Scope

### Q11 — Form scope (Phase 3 vs Phase 4)

| Option | Description | Selected |
|--------|-------------|----------|
| Form HTML + fallbacks only; Phase 4 adds anti-spam | Cleanest 3/4 boundary. | |
| Form + honeypot now, Turnstile in Phase 4 | Markup-only honeypot now. | |
| Form + honeypot + Turnstile placeholder | Phase 4 just wires server side. | |
| Empty page — form is Phase 4 entirely | Skip form for Phase 3. | |

**User's choice:** None — rejected with clarification "i think there should just be a link to dm on instagram for now".
**Notes:** Re-posed as a v1-scope decision (Q12) rather than a Phase 3/4 boundary decision.

### Q12 — Form fate (v1-scope decision)

| Option | Description | Selected |
|--------|-------------|----------|
| Drop from v1 entirely | No form anywhere in v1. /say-hi = IG link + mailto. CON-* → Out of Scope. Phase 4 effectively removed. | ✓ |
| Phase 3 ships only IG link; Phase 4 still adds form | Reframes Phase 3/4 boundary. | |
| Defer the decision — ship Phase 3 with IG-only, revisit Phase 4 later | Keeps optionality. | |

**User's choice:** Drop from v1 entirely.
**Notes:** D-18..D-23. Major v1 scope cut. Phase 4 (Contact Form & Deliverability) is effectively removed. Requires a separate `/gsd-phase` op after CONTEXT.md is committed to update `ROADMAP.md` (delete Phase 4, repoint Phase 5 dependency).

---

## Inline Brand-System Tweaks (raised mid-discussion)

### Q13 — PopupStrip CTA (raised after user spotted the "book by appointment" button)

**Sub-Q13a — Strip CTA on /popups:**
| Option | Description | Selected |
|--------|-------------|----------|
| Remove the CTA entirely | No button. Just the editorial detail. | ✓ |
| Map / address link | "get directions →" when `address` field present. | |
| DM on Instagram link | "DM @studiobluemli →" using `ig_dm_url`. | |
| Event website link (when present) | Links to popup's `link` field. | |

**Sub-Q13b — Landing mini-callout CTA:**
| Option | Description | Selected |
|--------|-------------|----------|
| Whole callout links to /popups | Single link wrapping the callout. | |
| No CTA — read-only blurb | Informational only. | ✓ |
| Same CTA as PopupStrip uses | Consistency. | |

**User's choice:** Remove CTA / No CTA.
**Notes:** D-09, D-05. User insight: "on the landing page it has a 'book by appointment' cta button within the 'next pop-up' section. that does not make sense at all." — pop-ups are public events, no booking flow, no need for the CTA.

### Q14 — Wordmark font (raised after user noted style mismatch)

**Sub-Q14a — Wordmark font:**
| Option | Description | Selected |
|--------|-------------|----------|
| Use Caveat Brush (same as display) | Alias to --font-display; drop Bagel Fat One Fonts API entry. | ✓ |
| Try Pacifico | Second cascade entry. Hand-script feel. | |
| Try Lobster | Third cascade entry. Heavier vintage feel. | |
| Caveat (regular, not Brush) | Lighter; already loaded for signature. | |

**Sub-Q14b — Phase fit:**
| Option | Description | Selected |
|--------|-------------|----------|
| Fold into Phase 3 | Small, contained edit alongside page composition. | ✓ |
| Separate small phase (3.1) before Phase 3 starts | Clean separation. | |
| Defer as brand-system tweak after Phase 3 | Phase 3 ships with Bagel Fat One unchanged. | |

**User's choice:** Use Caveat Brush / Fold into Phase 3.
**Notes:** D-24. Supersedes Phase 1 D-16's wordmark font pick. User insight: "I like the font 'bright, beaded, one of a kind' is written in. the font for 'Studio Bluemli' in the top left corner does not look good. it seems out of style for the rest of the site."

---

## Claude's Discretion

The following sub-decisions were explicitly left to the planner / Claude during execution:

- TZ library choice between `@js-temporal/polyfill` and `@date-fns/tz` (D-11).
- Cron rebuild mechanism: scheduled handler vs separate cron Worker vs GitHub Actions schedule (D-12).
- Default og:image fallback strategy (D-27 — four options enumerated; planner recommendation noted as option 3).
- robots.txt implementation: static-swap vs Astro endpoint vs Cloudflare override (D-29 — planner picks Astro endpoint as the recommended path).
- Landing mini-callout composition pattern: inline `<section>` in `index.astro` vs reusable Astro component file.
- Whether `AppointmentForm.jsx` is deleted or merely orphaned (D-21).
- The 1–3 specific gallery hero photos to use on /about (D-14).
- The drafted About-page portrait copy itself (D-13).
- Visual register of the "see all upcoming pop-ups →" link (button vs text link with arrow).
- Whether to delete or comment-out Bagel Fat One references in CLAUDE.md (D-24).

User did NOT discuss (out of scope for this discussion):
- Sitemap inclusion details (D-28 picked default behavior; planner confirms).
- Astro Content Collections file path: already locked to `src/content.config.ts` in Phase 2.
- Output mode `output: 'server'` (D-22 — kept as-is).

---

## Deferred Ideas

Captured for future phases / v1.x:

- Contact form (entire CON-* requirement set) — dropped from v1 (D-18); can return as a v1.x phase if IG-only contact stops scaling.
- Per-popup detail routes (`/popups/<slug>`) — v1.x.
- `.ics` calendar export — v1.x.
- Photos in /popups past archive — v1.x (schema field already exists).
- Dedicated process/craft shots for /about — v1.x (founder swaps via GitHub web UI when ready).
- Press / "as featured in" section — only if real press happens.
- `og_image` as a `site` collection schema field — v1.x if static fallback is picked.
- Multi-locale /popups for travelling pop-ups — out-of-scope while studio is in NOPA.
- Auto-generated brand-chrome OG cards (satori-style) — v1.x.
- Hover transitions / micro-interactions — out-of-scope per anti-features.
- Removing `output: 'server'` to revert to pure static — deferred (D-22).
- Decap / Sveltia / TinaCMS UI — file layout already CMS-compatible.

---

## Discussion Flow Notes

- 4 of 4 selected gray areas covered.
- Two unexpected gray areas raised mid-discussion by the user (PopupStrip CTA and wordmark font) — both folded into Phase 3 scope as D-09/D-05 and D-24.
- Major v1 scope cut (D-18) emerged when the say-hi shell question was clarified — required reposing the question at a higher level (v1 scope vs phase boundary).
- One brand-typography directive (NOPA casing, D-25) emerged from the Hero copy question and was applied project-wide to user-facing site copy.
- A separate `/gsd-phase` operation is required after CONTEXT.md is committed to remove Phase 4 from ROADMAP.md and repoint Phase 5's dependency to Phase 3 (D-20).
