# Phase 4: Analytics, Polish & Launch - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-14
**Phase:** 4-analytics-polish-launch
**Areas discussed:** Umami custom events, Launch checklist — final scope + owner

---

## Gray Area Selection

| Area | Selected for discussion |
|------|--------|
| Umami custom events | ✓ |
| Security headers — mechanism + CSP scope | (Claude's discretion) |
| DNS cutover — operational sequencing | (Claude's discretion) |
| Launch checklist — final scope + owner | ✓ |

**User's note:** "i understand that there are problems. i just want it to work. can you make that happen? i dont want to deal with technical stuf" — drove Claude to take security-headers + DNS-cutover off the discussion table and record them under Claude's Discretion with rationale (see CONTEXT.md D-08, D-09, D-10, D-06).

---

## Umami Custom Events

### Q1: Replacement for stale "contact-form submit" event

| Option | Description | Selected |
|--------|-------------|----------|
| /say-hi IG DM click + /say-hi mailto click | Two events instead of one — measure each contact channel separately. Per-piece IG inquire stays as-is. | ✓ |
| /say-hi IG DM click only | One event. Lighter implementation. Skips mailto (likely small minority). | |
| "See all upcoming pop-ups →" link on landing | Tracks content funnel from landing → /popups. Less about contact intent. | |
| Drop it — just gallery card + per-piece IG inquire | Two events total. Cleanest. | |

**User's choice:** /say-hi IG DM click + /say-hi mailto click (Recommended).
**Notes:** Founder wants to be able to compare IG-vs-email funnel weight on generic contact intent.

### Q2: Pitfall #19 verification approach

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-cutover verify on workers.dev preview | Env-aware snippet temporarily includes preview hostname; verify all 4 events on preview deploy; flip to apex-only on cutover. | (Claude's call) |
| Register both apex + www in Umami (literal Pitfall #19) | Defense in depth; skip pre-cutover verification; trust Realtime check on cutover day. | |
| Strict apex-only, post-cutover Realtime check | Simplest snippet; walk Realtime within 5 min of cutover; redeploy if events look wrong. | |

**User's choice:** Deferred to Claude with the words "i just want it to work. can you make that happen? i dont want to deal with technical stuf". Claude selected **option 1 (pre-cutover verify on workers.dev preview)** as the boring-and-reliable path — no launch-day analytics gap. Recorded as D-02.
**Notes:** Original AskUserQuestion was rejected with a "clarify" reply that turned out to be founder frustration with technical decision-making; reframed as Claude-takes-the-call.

### Q3: Umami Cloud account ownership

| Option | Description | Selected |
|--------|-------------|----------|
| Account exists — I'll send you the website ID when you're ready | Founder already signed up; one-line paste during execution. | ✓ |
| No account yet — walk me through it | Phase 4 includes SETUP-UMAMI.md addendum (5–10 min sign-up flow). | |
| You handle it for me | Not technically possible; account belongs to founder. | |

**User's choice:** Account exists.
**Notes:** Execution sequence locked in D-03 — Claude scaffolds everything else; founder pastes the website ID into one place.

---

## Launch Checklist — Final Scope + Owner

### Q1: Who walks the launch checklist?

| Option | Description | Selected |
|--------|-------------|----------|
| I walk it (with screenshots back to you) | Claude runs everything except IG/mailto/phone checks; pastes screenshots into a launch report. Founder does device-specific bits when prompted. | |
| You walk it on your phone | Phase 4 ships a one-page founder-friendly checklist; founder does it solo. | |
| Both passes — me first, then you | Claude runs full checklist; founder does second pass on phone. Safest, slightly more time. | |
| Claude walks 1–8; founder answers 3 phone yes/no questions (reframed) | No screenshots required from founder; Claude reports textually; founder gets specific tap-this-on-your-phone questions only. | ✓ |

**User's choice:** The reframed option, after the founder replied "what do you want to do? why do i need to upload screenshots? cant you just tell me what to check?". Recorded as D-04 (checklist contents) and D-05 (owner split). Founder owns items 9–11 (3 phone yes/no questions); Claude owns items 1–8 (sitemap, robots.txt, og:image HEAD checks, console errors, Umami Realtime, Lighthouse, www→apex 301, HTTPS cert).
**Notes:** Original framing rejected because of "upload screenshots" wording — founder wants minimum-friction. Adjusted to "Claude reports textually; founder gets 3 phone questions only".

---

## Claude's Discretion

- Pre-cutover verification approach for Umami (D-02) — Claude chose option 1 after founder deferred technical calls.
- Security headers mechanism (`_headers` file in `public/`) (D-08).
- Headers contract values — HSTS / X-Content-Type-Options / Referrer-Policy / Permissions-Policy / minimal CSP / Cache-Control buckets (D-09).
- OG default image verification (D-10) — Claude verifies brand fidelity of existing `public/og-default.png` during execution; if it's a placeholder, swaps to a brand-cleaner version.
- DNS cutover walkthrough (`SETUP-DNS.md`) (D-06).
- Env var name + read location for Umami website ID (D-03).
- `data-umami-event` slug naming (D-01).
- CSP exact directive list including Umami's events endpoint origin (D-09).
- Permissions-Policy exact directive list (D-09).
- Cache TTL for non-fingerprinted images (1d vs 7d) (D-09).
- Whether `SETUP-DNS.md` includes reference screenshots (D-06).
- Lighthouse measurement tool: CLI vs PageSpeed Insights API vs both (LCH-05).
- OG-image HEAD-check implementation: Bash one-liner vs Node script (D-04 item 3).

## Deferred Ideas

- HSTS preload list submission (`hstspreload.org`) — v1.x after 30+ days on apex.
- OG default image regeneration via satori-style script — v1.x.
- Recurring Lighthouse production audits (weekly cron) — v1.x.
- Per-page Umami funnel dashboards — founder discretion post-launch.
- CSP `report-uri` / `report-to` telemetry — v1.x if CSP misconfigurations surface.
- Subresource Integrity (SRI) for Umami `<script>` — out of scope (versionless URL, no stable hashes).
- Cloudflare Web Analytics as secondary RUM — v1.x consideration.
- SPF/DKIM/DMARC for `hi@studiobluemli.com` — out of scope (no contact form, `mailto:` doesn't need it).
- Lighthouse treemap / coverage analysis — v1.x if scores regress.
