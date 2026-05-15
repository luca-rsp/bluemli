---
phase: 04-analytics-polish-launch
plan: 02
subsystem: infra
tags: [security-headers, csp, hsts, cache-control, cloudflare, workers-static-assets]

requires:
  - phase: 03-page-composition-pop-ups
    provides: "5-route static surface (/, /gallery, /gallery/<slug>, /popups, /about, /say-hi) that the global /* block protects; preserved output:'server' + run_worker_first:['/api/*'] for v1.x reintroduction (D-22)"
  - phase: 01-foundations-brand-system
    provides: "scripts/check-brand-rules.sh CI gate that public/_headers (under public/, not src/) does not regress"
provides:
  - "public/_headers — declarative per-path HTTP header rules for the production deploy"
  - "HSTS 2y + includeSubDomains + preload directive on every static HTML response"
  - "Minimal-but-functional CSP allowlist (Umami family wildcards: *.umami.is, *.umami.dev)"
  - "Cache-Control tiering: /_astro/* immutable 1y; static images 7d; HTML max-age=0 must-revalidate"
  - "Documented Worker-response caveat for future engineers adding /api/* routes"
affects: [04-03, 04-04, 04-05, future-contact-form-reintroduction]

tech-stack:
  added: []
  patterns:
    - "Cloudflare Workers Static Assets _headers file as the single source of truth for HTTP response headers on static responses (D-08)"
    - "CSP wildcards (*.umami.is, *.umami.dev) to absorb upstream origin drift (Pitfall 1)"
    - "Header comment block adapted from scripts/check-brand-rules.sh — file purpose, gating, related decisions, known-fragile pitfalls"

key-files:
  created:
    - "public/_headers"
  modified: []

key-decisions:
  - "Headers ship via public/_headers (declarative, version-controlled, single source) — not via Worker response injection or Cloudflare dashboard Transform Rules (D-08 honored)"
  - "CSP connect-src uses wildcard *.umami.is + *.umami.dev to defuse Umami's historic events-endpoint origin drift (RESEARCH.md Pitfall 1, T-04-12)"
  - "HSTS preload directive is present; submission to hstspreload.org is intentionally deferred (CONTEXT.md Deferred Ideas — one-way operation, defer until 30+ days on apex)"
  - "Static images keyed at 7d cache (founder PR-preview-then-merge loop tolerable) per RESEARCH.md A6"

patterns-established:
  - "_headers file at public/_headers — Astro passthrough copies to dist/client/_headers (Cloudflare Workers Static Assets root) at build time"
  - "Order: most-specific path block first, /* global block last (Cloudflare reads all blocks; specific paths override broad ones on the same header)"
  - "Wildcards in CSP connect-src absorb endpoint origin drift for third-party telemetry vendors"

requirements-completed: [LCH-04]

duration: 9min
completed: 2026-05-15
---

# Phase 04 Plan 02: Security & Cache-Control Headers Summary

**Single declarative `public/_headers` file ships HSTS (2y, preload-eligible), minimal CSP with Umami-family wildcards, Permissions-Policy disabling all powerful APIs, and tiered Cache-Control (immutable 1y for /_astro/*, 7d for stable images, max-age=0 for HTML) — covering 100% of v1 traffic since no /api/* routes exist yet.**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-05-15T15:39:11Z
- **Completed:** 2026-05-15T15:48:18Z
- **Tasks:** 1 / 1
- **Files modified:** 1 (created)

## Accomplishments

- `public/_headers` exists with the exact RESEARCH.md §Code Examples target shape (lines 405-446), with the documentation header expanded per PATTERNS.md §`public/_headers` and adapted from `scripts/check-brand-rules.sh` lines 1-12.
- Build pipeline confirmed: `npm run build` copies `public/_headers` → `dist/client/_headers` byte-identically (2450 bytes, 46 lines, `diff` returns 0).
- All 14 acceptance-criteria grep checks pass (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP connect-src wildcard, immutable, 7d ×8, max-age=0, frame-ancestors none, base-uri self, form-action self, `/_astro/*` block, `/*` block).
- Brand-rule CI (`bash scripts/check-brand-rules.sh`) exits 0 — no regression from the new file.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create public/_headers with the Phase 4 security + cache contract** — `eae4263` (feat)

## Files Created/Modified

- `public/_headers` (CREATED, 2450 bytes, 46 lines) — Cloudflare Workers Static Assets header rules; documented Worker-response caveat in the header comment; verbatim CSP/HSTS/Cache-Control body from RESEARCH.md §Code Examples lines 405-446.

## Build Output Verification

| Check | Result |
|-------|--------|
| `test -f public/_headers` | exit 0 |
| `wc -l public/_headers` | 46 lines |
| `wc -c public/_headers` | 2450 bytes |
| `npm run build` | exit 0 |
| `find dist -name '_headers'` | `dist/client/_headers` |
| `wc -c dist/client/_headers` | 2450 bytes |
| `diff public/_headers dist/client/_headers` | exit 0 (byte-identical) |
| `bash scripts/check-brand-rules.sh` | exit 0 |

**Note on build-output path:** The plan's `<verify>` automation referenced `dist/_headers`, but `@astrojs/cloudflare@13.5` emits static assets into `dist/client/` (the Workers Static Assets root). The byte-identical copy at `dist/client/_headers` is the correct location — Cloudflare Workers Static Assets serves files from `dist/client` at the URL root, so the header rules are applied as intended. This is consistent with the post-Phase-3 build layout (the existing `dist/client/robots.txt` is the same passthrough pattern). No remediation needed; documented here so future engineers don't get confused if they grep for `dist/_headers`.

## Decisions Made

- **CSP `connect-src` wildcards are INTENTIONAL** — `https://*.umami.is` and `https://*.umami.dev` are present per RESEARCH.md Pitfall 1 and threat T-04-12. Umami's events endpoint origin has drifted three times in the last two years; wildcards defuse the risk of a silent CSP block. Tightening to a single specific origin requires empirical verification at Plan 05 launch-checklist item 5 (click each event, watch DevTools Network for the actual POST origin). If launch-day reveals a single stable origin, a v1.x plan can tighten.
- **HSTS preload-list submission (hstspreload.org) is intentionally NOT done in Phase 4.** The `preload` directive is in the header so the response is preload-list eligible, but the actual submission is deferred to v1.x per CONTEXT.md Deferred Ideas — submission is a one-way operation (effectively impossible to unwind for ~1y), so it waits until the site has been on apex for 30+ days without issue.
- **Header order honored:** `/_astro/*` first, per-image stable-filename blocks next, global `/*` last. Cloudflare reads every block; specific paths override broad ones on matching header names. This is documented inside the file's comment header.

## Deviations from Plan

None — plan executed exactly as written. The file body is verbatim from RESEARCH.md §Code Examples lines 405-446; the documentation comment header is verbatim from the PLAN.md `<action>` block (which itself adapts PATTERNS.md §`public/_headers` and `scripts/check-brand-rules.sh` lines 1-12). Zero creative deviation, zero value changes, zero reordering.

## Issues Encountered

None. Single-task plan, single-file create, single build pass.

## User Setup Required

None — `public/_headers` is purely build-input; Astro's default `public/` passthrough is the entire delivery mechanism. No env vars, no wrangler changes, no dashboard touches.

## Threat Mitigations Verified Present

| Threat ID | Mitigation | Verified in `public/_headers` |
|-----------|-----------|-------------------------------|
| T-04-06 (protocol downgrade) | HSTS 2y + includeSubDomains + preload | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` |
| T-04-07 (clickjacking) | CSP frame-ancestors none | `frame-ancestors 'none'` |
| T-04-08 (MIME sniffing) | X-Content-Type-Options nosniff | `X-Content-Type-Options: nosniff` |
| T-04-09 (referrer leakage) | Referrer-Policy | `Referrer-Policy: strict-origin-when-cross-origin` |
| T-04-10 (powerful APIs) | Permissions-Policy | 10 empty allowlists (accelerometer through browsing-topics) |
| T-04-11 (XSS via inline/eval) | CSP script-src 'self' + cloud.umami.is, no unsafe-eval, no unsafe-inline for scripts | `script-src 'self' https://cloud.umami.is` |
| T-04-12 (Umami origin drift) | connect-src wildcards | `connect-src 'self' https://cloud.umami.is https://*.umami.is https://*.umami.dev` |
| T-04-13 (base injection) | base-uri 'self' | `base-uri 'self'` |
| T-04-14 (form hijacking) | form-action 'self' | `form-action 'self'` |
| T-04-15 (Worker bypass) | ACCEPTED — v1 ships no /api/*; comment header documents caveat | Comment lines 1-5 |
| T-04-16 (FLoC / Topics) | Permissions-Policy directives | `interest-cohort=(), browsing-topics=()` |
| T-04-17 (cache poisoning on fingerprinted assets) | immutable cache | `/_astro/*` block → `Cache-Control: public, max-age=31536000, immutable` |

All 12 threat-register dispositions verified present in the shipped file.

## Next Phase Readiness

- Plan 04-03 (analytics scaffolding) can proceed — the `_headers` CSP `script-src` already allowlists `https://cloud.umami.is` for the upcoming Umami `<script>` tag in `BaseLayout.astro`, and `connect-src` allowlists the `*.umami.is`/`*.umami.dev` family for the 4 custom-event POSTs.
- Plan 04-05 (launch checklist) item 5 (Umami Realtime within 5 min of click) is the empirical CSP verification — if any event POST is blocked, widen `connect-src` to `https:` and document the tighten as a v1.x follow-up.
- No blockers; build is green; brand-rule CI is green.

## Self-Check: PASSED

- `public/_headers` — FOUND (2450 bytes)
- `dist/client/_headers` — FOUND (2450 bytes, byte-identical to source)
- Commit `eae4263` — FOUND in `git log`
- All 14 grep acceptance criteria — PASSED
- `bash scripts/check-brand-rules.sh` — EXIT 0

---
*Phase: 04-analytics-polish-launch*
*Completed: 2026-05-15*
