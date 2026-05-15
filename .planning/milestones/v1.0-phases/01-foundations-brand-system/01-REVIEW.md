---
phase: 01-foundations-brand-system
reviewed: 2026-05-13T17:07:43Z
depth: standard
files_reviewed: 36
files_reviewed_list:
  - .github/workflows/ci.yml
  - .gitignore
  - .nvmrc
  - .prettierrc.mjs
  - SETUP.md
  - astro.config.mjs
  - lighthouserc.json
  - package.json
  - scripts/check-brand-rules.sh
  - scripts/check-lowercase-filenames.sh
  - scripts/check-no-hydration.sh
  - scripts/generate-favicons.mjs
  - scripts/sync-design-skill.mjs
  - scripts/write-assetsignore.mjs
  - src/components/design-skill/About.jsx
  - src/components/design-skill/AppointmentForm.jsx
  - src/components/design-skill/BeadCluster.jsx
  - src/components/design-skill/Button.jsx
  - src/components/design-skill/Footer.jsx
  - src/components/design-skill/GalleryGrid.jsx
  - src/components/design-skill/Header.jsx
  - src/components/design-skill/Hero.jsx
  - src/components/design-skill/Mark.jsx
  - src/components/design-skill/PopupStrip.jsx
  - src/components/design-skill/ProductSheet.jsx
  - src/env.d.ts
  - src/layouts/BaseLayout.astro
  - src/pages/about.astro
  - src/pages/gallery.astro
  - src/pages/index.astro
  - src/pages/popups.astro
  - src/pages/say-hi.astro
  - src/sample-data.ts
  - src/styles/colors_and_type.css
  - src/styles/components.css
  - tsconfig.json
  - wrangler.jsonc
findings:
  critical: 5
  warning: 9
  info: 6
  total: 20
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-05-13T17:07:43Z
**Depth:** standard
**Files Reviewed:** 36
**Status:** issues_found

## Summary

Phase 1 lays down the Astro + Cloudflare scaffold, synced design-skill components, and CI guardrails. The scoped reviewer brief asked for eyes on four things: SSR-safety of the React JSX, the `write-assetsignore.mjs` cleanup, the brand-grep scripts, and the contact-form shell.

Two of those areas surface real BLOCKERs:

1. The root `wrangler.jsonc` deploy contract is **inconsistent with the actual `astro build` output layout**. With Astro 6.3 + `@astrojs/cloudflare@13.5` in `output: 'server'` mode, HTML lands under `dist/client/...` (e.g. `dist/client/gallery/index.html`) and the Worker entrypoint at `dist/server/entry.mjs`. The root config sets `assets.directory: "./dist"` and `main: "@astrojs/cloudflare/entrypoints/server"`. As written, a `wrangler deploy` from the project root (which is what both `package.json`'s `deploy` script and `SETUP.md` step 2 prescribe) cannot serve the prerendered routes at the expected URLs — the static-assets binding would look for `./dist/gallery/index.html`, which does not exist. The adapter-generated `dist/server/wrangler.json` is the correct config; the root one needs to either invoke that via `--config` or be aligned to `./dist/client`. Plan 04 SUMMARY line 375 acknowledges the split but the deploy commands never adopt it.
2. `scripts/check-no-hydration.sh` Check 2 only excludes paths matching `/_worker.js`. With the modern adapter, the Worker's own JS lives under `dist/server/` (multiple chunks, `entry.mjs`, renderers, React server runtime). Every server-only chunk over 10 KB will be flagged as a "browser-served" bundle, and the React-runtime grep will hit the SSR renderer. CI will fail on every clean build the moment a server chunk crosses the budget — the gate is calibrated against the legacy `_worker.js`-only layout.

Other notable defects: the brand-rule white-check pattern misses uppercase `#FFF`; `ProductSheet.jsx` renders with live `onClick` handlers but no `client:` directive (modal traps focus with no way to close); `PopupStrip.jsx`'s date parsing depends on the build host's local timezone and can shift the displayed weekday/day off by one in CI's UTC environment; and `AppointmentForm.jsx` ships without any Turnstile mount points or HTML5 validation attributes, so Phase 4 will need to edit this file (the brief implied "shape should already be correct").

The remaining findings are quality issues: dead code, missing animation keyframes, single-run Lighthouse audits, BSD-grep portability, fragile sync transforms.

## Critical Issues

### CR-01: Production deploy will 404 every prerendered route — `wrangler.jsonc` `assets.directory` mismatch

**File:** `wrangler.jsonc:9` (also `package.json:12`, `SETUP.md:28`)
**Severity:** BLOCKER
**Issue:**
`wrangler.jsonc` declares:
```jsonc
"main": "@astrojs/cloudflare/entrypoints/server",
"assets": {
  "directory": "./dist",
  "binding": "ASSETS",
  "run_worker_first": ["/api/*"]
}
```
But `pnpm exec astro build` (Plan 01-04 SUMMARY § "Build output" line 87) produces:
- HTML pages at `dist/client/<route>/index.html` — `dist/client/index.html`, `dist/client/gallery/index.html`, `dist/client/popups/index.html`, `dist/client/about/index.html`, `dist/client/say-hi/index.html`
- Worker entrypoint at `dist/server/entry.mjs`
- Adapter-generated correct config at `dist/server/wrangler.json` with `"main": "entry.mjs"` and `"assets": { "directory": "../client" }`

`package.json` `"deploy": "astro build && wrangler deploy"` and `SETUP.md` step 2 `npx wrangler deploy` both invoke wrangler from the repo root, which picks up the root `wrangler.jsonc`. With `assets.directory: "./dist"`, the Static Assets binding will upload everything under `dist/` (including `dist/server/`, leaking server-side code as public assets) and serve `/gallery` from `dist/gallery/index.html` — a path that does not exist. Every prerendered route 404s except `/api/contact` (Phase 4).

Plan 04 SUMMARY line 375 explicitly notes: "`dist/server/wrangler.json` is the adapter-generated config Plan 05's `wrangler deploy --config dist/server/wrangler.json` should target. The top-level `wrangler.jsonc` is for local `wrangler dev`." But neither the npm script nor the SETUP.md guidance honors that — the engineer following SETUP.md will produce a broken deploy.

**Fix:** Three options, pick one:

Option A — point the root config at the right directory (still allows root-level `wrangler deploy`):
```jsonc
{
  "name": "studio-bluemli",
  "main": "./dist/server/entry.mjs",
  "compatibility_date": "2026-05-12",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": "./dist/client",
    "binding": "ASSETS",
    "run_worker_first": ["/api/*"]
  },
  "observability": { "enabled": true }
}
```

Option B — defer to the adapter-generated config (cleaner, but requires invoking from `dist/server` or via `--config`):
```jsonc
// package.json
"deploy": "astro build && node scripts/write-assetsignore.mjs && wrangler deploy --config dist/server/wrangler.json"
```
Update SETUP.md step 2 "Deploy command (production)" to match. Delete the root `wrangler.jsonc` or stamp it `# local-dev-only` and add `wrangler dev --config wrangler.jsonc` to the dev script.

Option C — keep root config for `wrangler dev` only and add an explicit deploy guard:
```jsonc
// In wrangler.jsonc, document it's dev-only and ensure SETUP.md / package.json
// deploy paths all use --config dist/server/wrangler.json
```

Whichever path is chosen, FND-04 ("push-to-main production deploy") will not work until this is reconciled. The Cloudflare Workers Builds dashboard build command (SETUP.md step 2) also needs the same correction.

---

### CR-02: `check-no-hydration.sh` Check 2 will false-positive on every server-side chunk — CI breaks on a clean build

**File:** `scripts/check-no-hydration.sh:43-71`
**Severity:** BLOCKER
**Issue:**
The size-budget check walks `find dist -name '*.js' -size +10240c` and filters only paths matching `/_worker.js`:
```bash
LARGE=$(find dist -name '*.js' -size +"${BUDGET_BYTES}c" 2>/dev/null \
        | grep -v '/_worker.js' \
        || true)
```
With the modern adapter, the Worker is **not** at `dist/_worker.js` — it's at `dist/server/entry.mjs`, with associated chunks under `dist/server/` and `dist/server/chunks/`. Plan 01-04 SUMMARY line 87 confirms the layout. The React server renderer, Astro's runtime chunks, and the SSR entry will each exceed 10 KB and will all be falsely flagged as "browser-served bundles." The second grep (React-runtime presence) compounds the problem: `react.production` *will* appear in the server SSR chunk because that's where React renders the JSX.

The script claims to enforce "no browser JS over 10 KB." As written, it enforces "no JS over 10 KB anywhere under dist/ except `/_worker.js/`" — which the current adapter never produces.

Worse, the script is gated as a required CI step (`ci.yml:60-61`), so this turns the entire build red on the first run that gets past the existing dist-isn't-there warning. The fact that CI has been green in some prior runs suggests `dist/server/` is being skipped only because the React-server-renderer chunk happens to currently be < 10 KB — that buffer is one Astro patch release away from breaking.

**Fix:** Restrict the scan to `dist/client/_astro/` (the only directory that legitimately hosts browser-served JS) and remove the dist-wide React grep:
```bash
# ---- Check 2: size budget on dist/client/_astro/ browser JS ----
BUDGET_BYTES=10240
CLIENT_ASTRO="dist/client/_astro"
if [ -d "$CLIENT_ASTRO" ]; then
  LARGE=$(find "$CLIENT_ASTRO" -name '*.js' -size +"${BUDGET_BYTES}c" 2>/dev/null || true)
  if [ -n "$LARGE" ]; then
    echo ""
    echo "FAIL: Found browser-served JS bundle(s) > ${BUDGET_BYTES} bytes in $CLIENT_ASTRO:"
    echo "$LARGE" | sed 's/^/    /'
    failed=1
  fi

  if grep -rlE 'react\.development|react\.production|react-dom\.development|react-dom\.production' \
       "$CLIENT_ASTRO" --include='*.js' 2>/dev/null | head -5 | grep -q '.' ; then
    echo ""
    echo "FAIL: Browser-served JS in $CLIENT_ASTRO contains the React runtime."
    failed=1
  fi
fi
```
This pairs naturally with `scripts/write-assetsignore.mjs`'s cleanup pass over the same directory and is what the script's intent description actually means.

---

### CR-03: `ProductSheet.jsx` modal has no `client:` directive but uses live `onClick` — modal cannot be closed once opened

**File:** `src/components/design-skill/ProductSheet.jsx:8,14,22`
**Severity:** BLOCKER (latent — only fires once any page renders this component)
**Issue:**
`ProductSheet` is in the sync-script COPY_LIST (`scripts/sync-design-skill.mjs:23`) but no Phase 1 page imports it. The JSX still ships through `astro check` and the Phase 1 build, and it contains three live event handlers:
```jsx
<div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, ... }}>
  <div onClick={e => e.stopPropagation()} style={{ ... }}>
    <button onClick={onClose} aria-label="close" style={{ ... }}>×</button>
```
The Plan 02 SUMMARY rationale is "the design-skill components were refactored to drop useState/onClick so they don't need hydration." `ProductSheet` was not refactored — it still depends entirely on client-side React, but without `client:` directive its handlers never bind. Rendered server-side, the modal:
- Opens (server renders the overlay)
- Has no working `×` button
- The backdrop tap that should close it does nothing
- The user is trapped (modal also has `position: fixed; inset: 0; zIndex: 100`)

Today this is dead code, but it's reachable: Phase 2 may wire gallery click → modal, at which point this regresses to a hard accessibility/UX failure. The `check-no-hydration.sh` invariant currently does NOT flag `onClick` in synced JSX (it only forbids `client:` directives), so the contract "no React in browser" silently coexists with "components that need React in the browser."

**Fix:** Either refactor `ProductSheet` to a non-interactive shell now (mirror what was done for `Hero`, `PopupStrip`, `AppointmentForm`), or remove it from `COPY_LIST` and `src/components/design-skill/` until Phase 2 can address it properly. Suggested SSR-safe alternative (CSS-only via `<details>` or anchor navigation):
```jsx
function ProductSheet({ product }) {
  if (!product) return null;
  return (
    <a href="/gallery" style={{ ... }}>
      {/* render product card; clicking the backdrop = navigating back to gallery */}
    </a>
  );
}
```
Additionally extend `check-no-hydration.sh` to grep for `onClick=|onChange=|onSubmit=|onInput=|onKeyDown=` in `src/components/**/*.jsx` and fail if any found without an accompanying `// hydrated` allowlist comment. The current invariant is necessary but not sufficient — handlers without hydration are silent bugs, not loud ones.

---

### CR-04: `PopupStrip.jsx` date parsing relies on host-local TZ and will show the wrong day in CI (UTC) or any non-LA build

**File:** `src/components/design-skill/PopupStrip.jsx:13-20`
**Severity:** BLOCKER (correctness on rendered date label)
**Issue:**
```js
const d = new Date(popup.date + 'T' + (popup.startTime || '12:00') + ':00');
return new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
  timeZone: popup.tz || 'America/Los_Angeles',
}).format(d);
```
The string `"2026-06-15T10:00:00"` has no timezone designator. Per ECMAScript ([Date.parse spec](https://tc39.es/ecma262/#sec-date-parse), §21.4.1.18), date-only forms (`YYYY-MM-DD`) are parsed as UTC, but date-time-without-offset forms (`YYYY-MM-DDTHH:MM:SS`) are parsed as **local time** in the host process. In Cloudflare Workers Builds (and GitHub Actions Linux runners), the host is UTC. A pop-up configured for `2026-06-15` `10:00` local-LA time will be parsed as `2026-06-15T10:00:00 UTC` at prerender time, then formatted as `America/Los_Angeles` — which converts back by subtracting 7h to `2026-06-15T03:00:00 PDT`. That's still the same calendar day, but only because 10am UTC is past 7am PDT.

Test a value closer to midnight: `popup.date = '2026-06-15'`, `popup.startTime = '04:00'`. Parsed as `2026-06-15T04:00:00 UTC`. Formatted with `timeZone: America/Los_Angeles`: shifts back 7h → `2026-06-14T21:00:00 PDT`. The displayed date label reads **"Sunday, June 14"** — but the founder intends Monday, June 15. Same defect, opposite direction, for any LA host: `startTime` near 23:00 PDT formatted for LA gets shifted forward into the next day. The intent ("display this date for this TZ") is exactly the opposite of what this code does.

Sample data currently uses `startTime: '10:00'` and `'14:00'`, which happen to survive the round-trip with the current UTC offset. The bug is dormant against sample data and live for any morning or evening pop-up.

**Fix:** Either construct the Date from year/month/day numerically (no parsing dependency), or always append the offset/`Z` and ensure the formatter has the right context. Simplest robust fix:
```js
// Treat popup.date + popup.startTime as wall-clock time in popup.tz,
// and format the same wall-clock components — no Date() involved.
const [year, month, day] = popup.date.split('-').map(Number);
const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)); // noon UTC anchor avoids DST edge
return new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
  timeZone: 'UTC',  // we already anchored UTC; do NOT re-shift to popup.tz
}).format(d);
```
Or, since the design intent is "founder types a calendar date, display that calendar date":
```js
// Parse the YYYY-MM-DD as UTC midnight and format in UTC. The popup.tz
// is documentary for the time-of-day label, not the date label.
const [year, month, day] = popup.date.split('-').map(Number);
const d = new Date(Date.UTC(year, month - 1, day));
return new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
  timeZone: 'UTC',
}).format(d);
```

Phase 3's content-collection schema for `popups` should enforce `date` as `YYYY-MM-DD` only and pass `startTime`/`endTime` separately (already the shape today), so this fix forward-compats cleanly.

---

### CR-05: Brand-rule white check misses uppercase `#FFF` — silent false negative

**File:** `scripts/check-brand-rules.sh:22`
**Severity:** BLOCKER (defeats stated goal of FND-10)
**Issue:**
The pattern is:
```
grep -rnP '(bg-white|background:\s*white|#fff(?![0-9a-fA-F])|#[fF]{6})'
```
The `#fff(?![0-9a-fA-F])` alternative is case-sensitive (no `i` flag, lowercase character class). `#FFF` (the conventional CSS-author preference for hex) slips through unchallenged. The "verify the loop end-to-end" step in `SETUP.md:97` lists `background: white;` as the deliberate-violation test — exactly the kind of test that proves only the `background:\s*white` branch works. Test with `color: #FFF` and the check passes a real brand violation. The whitelist for `#fff8` (cream-tint alpha) is appropriately case-restrictive, but the broad white-hex check should mirror `#[fF]{6}` for the 3-digit case.

Demonstration:
```
$ echo '#FFF text' | grep -P '#fff(?![0-9a-fA-F])|#[fF]{6}'
$ echo $?
1   # NOT MATCHED — bug
$ echo '#FFFFFF text' | grep -P '#fff(?![0-9a-fA-F])|#[fF]{6}'
#FFFFFF text
$ echo $?
0   # matched correctly
```

**Fix:**
```bash
if grep -rnP '(bg-white|background:\s*white|#[fF]{3}(?![0-9a-fA-F])|#[fF]{6})' \
     --include='*.astro' --include='*.jsx' --include='*.tsx' --include='*.ts' --include='*.css' \
     ...
```
Also add a deliberate-violation entry to SETUP.md's step 5 verification: "Add `color: #FFF;` to any .css file and confirm CI fails." Strengthens the contract test.

## Warnings

### WR-01: `AppointmentForm.jsx` has no Turnstile mount points or HTML5 validation — Phase 4 must edit this file

**File:** `src/components/design-skill/AppointmentForm.jsx:34-50`
**Severity:** WARNING
**Issue:**
The reviewer brief says "the contact form shell at say-hi.astro... shape should already be correct." It's not. The form is missing:
- The Turnstile widget container (`<div class="cf-turnstile" data-sitekey="..."></div>`)
- The Turnstile script tag (`<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>` — would live in BaseLayout or here)
- A hidden `cf-turnstile-response` input name (Turnstile auto-injects it inside the widget, but if the widget isn't mounted, no token, no validation)
- `required` on `name`, `email`, `notes`
- `maxlength` and `minlength` attributes
- `autocomplete="name"` / `autocomplete="email"`
- A `novalidate` audit pass against ARIA labelling (the `<label>` references are correct, but no `aria-describedby` for error states)

Phase 4 will need to come back to this JSX file *and* the BaseLayout (for the Turnstile script tag, unless deferred to say-hi page). The "Phase 1 shell is correct" framing in the brief is wrong — Phase 4 should plan an edit, not just a Worker add. Worth flagging in the Phase 1 → Phase 4 transition notes.
**Fix:**
```jsx
<form method="POST" action="/api/contact" style={{ ... }}>
  <div>
    <label style={labelStyle} htmlFor="say-hi-name">your name</label>
    <input id="say-hi-name" name="name" required maxLength={120}
           autoComplete="name" style={inputStyle} placeholder="first name is fine" />
  </div>
  <div>
    <label style={labelStyle} htmlFor="say-hi-email">email</label>
    <input id="say-hi-email" name="email" type="email" required maxLength={254}
           autoComplete="email" style={inputStyle} placeholder="you@somewhere.nice" />
  </div>
  <div>
    <label style={labelStyle} htmlFor="say-hi-notes">what are you hoping for?</label>
    <textarea id="say-hi-notes" name="notes" rows={4} required minLength={5} maxLength={2000}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="a particular color, a gift, just looking…" />
  </div>
  {/* Phase 4 adds:
      <div className="cf-turnstile" data-sitekey={PUBLIC_TURNSTILE_SITEKEY}></div>
      and the script tag in BaseLayout. */}
  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
    <Button variant="primary" size="lg" type="submit">send</Button>
  </div>
</form>
```

---

### WR-02: `ProductSheet.jsx` references `sheet-in` animation that is not defined anywhere

**File:** `src/components/design-skill/ProductSheet.jsx:12`
**Severity:** WARNING
**Issue:**
```jsx
animation: 'sheet-in 220ms var(--ease-soft)',
```
There is no `@keyframes sheet-in { ... }` in `colors_and_type.css`, `components.css`, or any page-scoped `<style>`. The CSS rule resolves to no-op (modern browsers tolerate the missing keyframe). Combined with CR-03, the ProductSheet is dead-and-broken code. Either delete the file from `src/components/design-skill/` and from `COPY_LIST` until Phase 2, or add the missing keyframe:
**Fix:**
```css
/* in components.css */
@keyframes sheet-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

### WR-03: `lighthouserc.json` `numberOfRuns: 1` is too flaky for a 0.9 hard threshold

**File:** `lighthouserc.json:5`
**Severity:** WARNING
**Issue:**
A single Lighthouse run can swing categorical scores by ±0.02–0.05 depending on CI runner load, network blip on Fontsource, or cold V8. The asserted threshold is exactly 0.9 with `error` severity. Even the comments in `ci.yml:69-70` celebrate "dropping perf below the threshold to 0.99 on all routes" — but a 0.99 single-run number can still hit 0.89 next run. The result is a brittle required check that will produce false-failure PRs.

Numbers from Plan 05 SUMMARY (if available) suggest the local-machine median was 0.99, but CI median is the relevant number, and you don't have CI data with `numberOfRuns: 1` — you have one sample per build.

Also: the config audits **only the landing route `/`** (`lighthouserc.json` doesn't enumerate `url`, so LHCI walks `staticDistDir` and audits index files). The CI step's name claims "≥ 90 on all routes" — that's true if LHCI defaults to all `*.html` it finds, but worth asserting explicitly so the contract is verifiable.
**Fix:**
```jsonc
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist/client",
      "numberOfRuns": 3,
      "url": [
        "/",
        "/gallery",
        "/popups",
        "/about",
        "/say-hi"
      ],
      "settings": { ... }
    },
    "assert": {
      "assertions": {
        "categories:performance":   ["error", { "minScore": 0.9, "aggregationMethod": "median-run" }],
        "categories:accessibility": ["error", { "minScore": 0.9, "aggregationMethod": "median-run" }],
        "categories:best-practices":["error", { "minScore": 0.9, "aggregationMethod": "median-run" }],
        "categories:seo":           ["error", { "minScore": 0.9, "aggregationMethod": "median-run" }]
      }
    }
  }
}
```

---

### WR-04: `check-brand-rules.sh` uses `grep -P` which is not portable to macOS BSD grep

**File:** `scripts/check-brand-rules.sh:22`
**Severity:** WARNING
**Issue:**
GNU grep (Ubuntu CI) supports `-P` (PCRE). macOS `/usr/bin/grep` (BSD) does not — `grep: invalid option -- P` is the failure mode. A developer running `pnpm run ci:brand-check` locally on a stock macOS will see a misleading error and may assume the check is broken rather than that grep is wrong. The other rules use `-E` (extended) which is portable.

The Rule 1 pattern needs the negative lookahead for the `#fff8` whitelist, which BRE/ERE doesn't support. Two acceptable workarounds:
1. Replace the lookahead with two separate checks — first whitelist `#fff8`, then check for plain white hex.
2. Detect the runtime grep and skip Rule 1 with a clear warning if `-P` is unavailable.

**Fix:** Approach 1 (most portable):
```bash
# Rule 1a: 6-digit white hex (any case)
if grep -rEn '(bg-white|background:\s*white|#[fF]{6})' \
     --include='*.astro' --include='*.jsx' --include='*.tsx' --include='*.ts' --include='*.css' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/ ; then
  echo ""
  echo "FAIL: The site background must be cream (#F5DCC7), never white. [Rule 1a]"
  failed=1
fi

# Rule 1b: 3-digit white hex EXCLUDING the cream-tint #fff8 whitelist.
# Two-pass: find all #fff hits, then filter out #fff8.
matches="$(grep -rEn '#[fF]{3}[^0-9a-fA-F]' \
     --include='*.astro' --include='*.jsx' --include='*.tsx' --include='*.ts' --include='*.css' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/ | grep -vE '#[fF]{3}[8]' || true)"
if [ -n "$matches" ]; then
  echo "$matches"
  echo ""
  echo "FAIL: The site background must be cream. #fff (3-digit white) is forbidden. [Rule 1b]"
  echo "  Whitelisted: #fff8 (cream tint with alpha)."
  failed=1
fi
```

---

### WR-05: `BeadCluster.jsx` SSR/hydration mismatch risk if ever hydrated

**File:** `src/components/design-skill/BeadCluster.jsx:11-20`
**Severity:** WARNING
**Issue:**
The seeded RNG inside `makeBeads` is **stateful across calls** because `let n = seed * 9301 + 49297` is captured per call but the `rng()` closure mutates `n`. Since `React.useMemo` is invoked once per render with `[seed, count]`, the same render is consistent — but if the component were ever hydrated client-side (against the explicit Phase 1 contract), the client RNG state would be re-seeded from the same `seed * 9301 + 49297` and produce the same sequence, so it currently happens to match. This is correct today.

However, the comment claims "fixed-seed pseudo-random arrangement so it renders consistently" — and a future maintainer changing the RNG implementation could easily introduce a server/client divergence (e.g., switching to `Math.random()` in a code review). The phase brief asked to verify SSR-safety; this component is currently SSR-safe but the invariant is fragile.

Additionally: the seed is multiplied by 9301 before adding 49297 (linear congruential generator), but the inner `rng()` immediately overwrites `n` to `(n * 9301 + 49297) % 233280`. The first beam's `cx = 10 + rng() * 80` discards the initial seed — so `seed * 9301 + 49297` is functionally equivalent to just `seed`. Cosmetic, not a bug.
**Fix:** Either annotate the component as SSR-only with a runtime warning:
```js
if (typeof window !== 'undefined') {
  console.warn('BeadCluster: hydration is unsupported; output is server-rendered only');
}
```
Or, simpler: replace the random-on-build with a static asset (precomputed SVG snapshot in `public/`), eliminating the entire SSR-safety question.

---

### WR-06: `Footer.jsx` `borderTop: 'none'` is dead style, and `<a>` defaults conflict with global `text-decoration: underline`

**File:** `src/components/design-skill/Footer.jsx:11, 23-25`
**Severity:** WARNING
**Issue:**
1. `borderTop: 'none'` does nothing (no border to override). Probably a remnant of a sketched-and-removed top rule. Harmless but adds noise.
2. The inline `<a>` styles on the IG link and email link set `color` but not `textDecoration`. The global `a` rule in `colors_and_type.css:299-303` sets `text-decoration: underline; text-decoration-thickness: 1.5px;`. The links will render underlined coral text — which may or may not be the intended brand treatment. The header nav links explicitly set `textDecoration: 'none'`; the footer doesn't. Consistency check needed.

**Fix:**
```jsx
<a href="https://instagram.com/studio_bluemli" target="_blank" rel="noreferrer"
   style={{ color: 'var(--coral-500)', textDecoration: 'none' }}>@studio_bluemli</a>
```
(Or confirm the underline IS intended and add a `text-underline-offset` adjustment.)

---

### WR-07: `Mark.Underline` has no `aria-hidden` — screen readers may announce decorative SVG

**File:** `src/components/design-skill/Mark.jsx:5-10`
**Severity:** WARNING
**Issue:**
`Mark.Sparkle` has `aria-hidden="true"`. `Mark.Underline` does not, despite being equally decorative. It's rendered inside `<a>` and `<h2>` elements (Header active link, Button ghost variant, PopupStrip), and JAWS/VoiceOver may announce "graphic" or pause unexpectedly. The `<path>` has no fill or alt text, but the `<svg>` itself can still be focusable on legacy AT.
**Fix:**
```jsx
Underline: ({ color = "var(--coral-500)", thickness = 2.5 }) => (
  <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true" role="presentation"
       style={{ ... }}>
```

---

### WR-08: `sync-design-skill.mjs` Transform 2 is fragile and will silently misbehave on a file without `/* eslint-disable */`

**File:** `scripts/sync-design-skill.mjs:42-45`
**Severity:** WARNING
**Issue:**
```js
if (!src.includes("import React")) {
  src = src.replace(/^\/\* eslint-disable \*\/$/m, "/* eslint-disable */\nimport React from 'react';");
}
```
This relies on the first line of every synced file being exactly `/* eslint-disable */`. If a future skill update drops or reformats that comment (e.g., `/* eslint-disable react/no-something */`), `import React from 'react'` is never inserted, the file lacks a React import, and `astro check` errors out. The script reports "Synced N components" with no signal that the transform missed.
**Fix:** Always insert the import at the top of the file, idempotently:
```js
if (!src.includes("import React")) {
  // Insert after any leading shebang/comment block; simplest = prepend.
  src = `import React from 'react';\n${src}`;
}
```
Or, if you specifically want it under `/* eslint-disable */`:
```js
if (!src.includes("import React")) {
  if (/^\/\* eslint-disable[^*]*\*\//m.test(src)) {
    src = src.replace(/^(\/\* eslint-disable[^*]*\*\/\s*)/, `$1import React from 'react';\n`);
  } else {
    console.warn(`WARN: ${file} has no eslint-disable header; React import prepended at top.`);
    src = `import React from 'react';\n${src}`;
  }
}
```

---

### WR-09: `generate-favicons.mjs` has no error handling; partial run leaves `public/` in inconsistent state

**File:** `scripts/generate-favicons.mjs:26-47`
**Severity:** WARNING
**Issue:**
If `icon-gen`'s output filenames change in a future major version (currently `favicon16.png` / `favicon32.png`), `fs.rename` throws ENOENT and the script aborts after `iconGen` has already written some files but before the `apple-touch-icon.png` copy. The committed `public/` ends up with the new files mixed with stale renamed ones. Combined with the fact that the favicon CI step doesn't re-run this script (favicons are committed), a partial run produces a "looks fine on dev's machine, broken in prod" failure mode.
**Fix:**
```js
try {
  await iconGen(SVG_IN, OUT_DIR, { /* ... */ });
  // Defensive: check what icon-gen actually emitted before renaming.
  const candidates = ['favicon16.png', 'favicon32.png'];
  for (const f of candidates) {
    const p = path.join(OUT_DIR, f);
    if (await fs.stat(p).then(() => true, () => false)) {
      const renamed = f.replace(/(\d+)\.png/, '-$1.png');
      await fs.rename(p, path.join(OUT_DIR, renamed));
    }
  }
  await fs.copyFile(SVG_IN, path.join(OUT_DIR, 'favicon.svg'));
  await fs.copyFile(SVG_IN, path.join(OUT_DIR, 'mark.svg'));
  await fs.copyFile(TOUCH_IN, path.join(OUT_DIR, 'apple-touch-icon.png'));
} catch (err) {
  console.error('Favicon generation failed; check icon-gen API compatibility.');
  console.error(err);
  process.exit(1);
}
```

## Info

### IN-01: `Mark.Sparkle` and `Mark.Rule` are dead code

**File:** `src/components/design-skill/Mark.jsx:11-16, 30-32`
**Issue:**
Neither `Mark.Sparkle` nor `Mark.Rule` is referenced anywhere in `src/` (verified by `grep -rn`). They're imported transitively as part of the `Mark` namespace object but every consumer reaches for `Mark.Heart`, `Mark.Underline`, or `Mark.Dots`.
**Fix:** Either leave as-is (intentional library surface for future Phase 2/3) and add a comment, or trim:
```jsx
// If you re-add Sparkle/Rule later, they live in the design-skill source —
// re-sync with scripts/sync-design-skill.mjs.
```

---

### IN-02: `Hero.jsx` `.hero-cta-primary` / `.hero-cta-secondary` classes have no hover/active CSS rules

**File:** `src/components/design-skill/Hero.jsx:41,49`
**Issue:**
The two hero CTAs carry classes that suggest a separate CSS hook for hover/active states (mirroring `.btn-primary` in `components.css`), but no rules are defined for them. The CTAs will not respond to hover except via browser default `<a>` cursor change. `:focus-visible` is covered by the global rule, so accessibility is fine.
**Fix:** Add to `components.css`:
```css
.hero-cta-primary:hover { background: var(--coral-700); }
.hero-cta-primary:active { transform: scale(0.97); }
.hero-cta-secondary:hover { background: var(--coral-500); color: var(--cream-50); }
```

---

### IN-03: `BaseLayout.astro` skip-link uses `top: -100px` then `top: 0` on `:focus-visible` — fine, but no transition

**File:** `src/layouts/BaseLayout.astro:81-98`
**Issue:**
The skip-link animation is instant ("teleport" up from offscreen). Common a11y pattern is a 100ms transition for users who briefly tab past it and want to find their way back. Not a defect, just a polish gap.
**Fix:**
```css
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  transition: top 150ms ease-out;
  /* ... */
}
.skip-link:focus-visible { top: 0; }
```

---

### IN-04: `package.json` lacks `lint` / `format` scripts

**File:** `package.json:8-18`
**Issue:**
Prettier is installed but no `pnpm run format` or `pnpm run format:check` script exists. CI doesn't enforce prettier formatting, so a non-prettier-ed PR can merge. Combined with the project's "founder is editor" workflow, formatting drift is likely.
**Fix:**
```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```
And optionally add `pnpm run format:check` to the CI job.

---

### IN-05: `tsconfig.json` doesn't explicitly enable `noUncheckedIndexedAccess` or `exactOptionalPropertyTypes`

**File:** `tsconfig.json:2`
**Issue:**
`astro/tsconfigs/strict` enables most strictness, but `noUncheckedIndexedAccess` (which would have caught `pieces[i]` undefined-paths in GalleryGrid) and `exactOptionalPropertyTypes` are not on by default in Astro's preset. For a small site this is fine, but for Phase 2's content-collection schemas these flags pay off.
**Fix:** Optional — consider adding when Content Collections come online:
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "noUncheckedIndexedAccess": true
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

---

### IN-06: `wrangler.jsonc` `observability.enabled: true` is on by default in production — consider whether this is desired for free tier

**File:** `wrangler.jsonc:14-16`
**Issue:**
Workers observability sends head sampling and Logpush data. On the free tier it's allowed but counts against limits. For a 5-page brochure site with `/api/contact` getting maybe 1 request/day, the data volume is trivial; just confirm the founder knows it's on.
**Fix:** No code change needed — just confirm `observability.enabled: true` is the intended posture. The default for new Workers since 2025 is `enabled: true`, so it's fine to leave.

---

_Reviewed: 2026-05-13T17:07:43Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
