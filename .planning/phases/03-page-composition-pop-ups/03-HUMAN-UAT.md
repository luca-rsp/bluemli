---
status: resolved
phase: 03-page-composition-pop-ups
source: [03-VERIFICATION.md]
started: 2026-05-14T16:00:00Z
updated: 2026-05-15T22:00:00Z
resolved_via: 04-LAUNCH-REPORT.md (3 of 4 items closed by Phase 4 cutover); IN-02 remaining as documented non-blocking carry-over WARNING per v1.0-MILESTONE-AUDIT.md
---

## Current Test

[all items addressed — see results below]

## Tests

### 1. Unfurl preview for the apex URL (`https://studiobluemli.com/`)
expected: Share the apex URL in iMessage, Slack, and IG DM after the production deploy. All three platforms render a card with title `Studio Bluemli — hand-clustered beaded earrings`, the og_description copy, and the `og-default.png` image. The URL pill matches `https://studiobluemli.com/` (with trailing slash).
result: passed (Phase 4 LCH-06, 2026-05-15 — founder confirmed FB Sharing Debugger + real iMessage/IG-DM unfurl all render correctly; og-default.png regenerated via PR #9 to use the full-palette mark)

### 2. Per-piece unfurl for `https://studiobluemli.com/gallery/cluster-coral/`
expected: Share the per-piece URL in iMessage, Slack, and IG DM. Card shows the cluster-coral `hero-800.webp` photo as the unfurl image — not the default coral-on-cream mark. Per-piece og:image override on apex must render at the real URL.
result: passed (Phase 4 LCH-06, 2026-05-15 — founder confirmed FB Sharing Debugger + iMessage unfurl render the coral hero photo correctly)

### 3. 320px viewport eyebrow overflow check (IN-02)
expected: On a phone at 320px viewport (or DevTools iPhone SE preset), the hero eyebrow `Studio Bluemli · NOPA, San Francisco` fits within the section padding — no horizontal scroll bar, no clipping. CLAUDE.md targets Lighthouse mobile ≥ 90 and phone-first responsive.
result: deferred — Lighthouse audited at 360×640 (lighthouserc.json `width: 360`) and passed every cell ≥ 90 on production. The 320px-specific check was never re-run during Phase 4. Logged as carry-over non-blocking WARNING in `.planning/v1.0-MILESTONE-AUDIT.md` tech-debt section. Revisit in v1.1 if Lighthouse adopts a 320px form factor or if a real user reports visible truncation.

### 4. Production `/robots.txt` + `/sitemap-index.xml` curl after deploy
expected: After `npm run deploy`, `curl https://studiobluemli.com/robots.txt` returns 200 OK with literal `Allow: /` + `Sitemap: https://studiobluemli.com/sitemap-index.xml` (no `Disallow: /`). `curl https://studiobluemli.com/sitemap-index.xml` returns 200 OK with a single `<sitemap><loc>https://studiobluemli.com/sitemap-0.xml</loc></sitemap>`; that sitemap-0.xml contains 11 `<loc>` entries (5 top-level + 6 gallery slugs) all on apex. This proves the `PUBLIC_DEPLOY_ENV=production` prefix actually propagates through the real Cloudflare Workers Builds run.
result: passed (Phase 4 LCH-08 items 1+2, 2026-05-15 — LAUNCH-REPORT.md captured the live curl output; sitemap-0.xml contains all 11 expected `<loc>` entries; robots.txt returns Allow + Sitemap reference)

## Summary

total: 4
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 0
deferred: 1 (IN-02 — non-blocking, see v1.0-MILESTONE-AUDIT.md)

## Gaps
