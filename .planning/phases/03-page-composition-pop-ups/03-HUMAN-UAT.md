---
status: partial
phase: 03-page-composition-pop-ups
source: [03-VERIFICATION.md]
started: 2026-05-14T16:00:00Z
updated: 2026-05-14T16:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Unfurl preview for the apex URL (`https://studiobluemli.com/`)
expected: Share the apex URL in iMessage, Slack, and IG DM after the production deploy. All three platforms render a card with title `Studio Bluemli — hand-clustered beaded earrings`, the og_description copy, and the `og-default.png` image. The URL pill matches `https://studiobluemli.com/` (with trailing slash).
result: [pending]

### 2. Per-piece unfurl for `https://studiobluemli.com/gallery/cluster-coral/`
expected: Share the per-piece URL in iMessage, Slack, and IG DM. Card shows the cluster-coral `hero-800.webp` photo as the unfurl image — not the default coral-on-cream mark. Per-piece og:image override on apex must render at the real URL.
result: [pending]

### 3. 320px viewport eyebrow overflow check (IN-02)
expected: On a phone at 320px viewport (or DevTools iPhone SE preset), the hero eyebrow `Studio Bluemli · NOPA, San Francisco` fits within the section padding — no horizontal scroll bar, no clipping. CLAUDE.md targets Lighthouse mobile ≥ 90 and phone-first responsive.
result: [pending]

### 4. Production `/robots.txt` + `/sitemap-index.xml` curl after deploy
expected: After `npm run deploy`, `curl https://studiobluemli.com/robots.txt` returns 200 OK with literal `Allow: /` + `Sitemap: https://studiobluemli.com/sitemap-index.xml` (no `Disallow: /`). `curl https://studiobluemli.com/sitemap-index.xml` returns 200 OK with a single `<sitemap><loc>https://studiobluemli.com/sitemap-0.xml</loc></sitemap>`; that sitemap-0.xml contains 11 `<loc>` entries (5 top-level + 6 gallery slugs) all on apex. This proves the `PUBLIC_DEPLOY_ENV=production` prefix actually propagates through the real Cloudflare Workers Builds run.
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
