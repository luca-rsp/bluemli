---
phase: 03-page-composition-pop-ups
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - astro.config.mjs
  - src/styles/colors_and_type.css
  - src/layouts/BaseLayout.astro
  - src/components/design-skill/Hero.jsx
  - src/components/design-skill/About.jsx
  - src/components/design-skill/Footer.jsx
  - src/content/site/config.yaml
  - CLAUDE.md
autonomous: true
requirements: [PAG-05]
must_haves:
  truths:
    - "The site no longer downloads or references the Bagel Fat One WOFF2 — only one Caveat Brush WOFF2 is loaded (per D-24)."
    - "The 'Studio Bluemli' wordmark in the Header (top-left) and Footer renders in Caveat Brush (alias of --font-display-loaded), visually matching the Caveat Brush display headlines (per D-24)."
    - "Every user-facing instance of 'NoPa' in the 4 enumerated source files reads 'NOPA' after this plan; .planning/ and .claude/skills/ are untouched (per D-25)."
    - "Building the site (`npm run build`) succeeds with no missing-font preload errors and no Bagel Fat One @font-face emitted."
  artifacts:
    - path: "astro.config.mjs"
      provides: "Fonts API config without the Bagel Fat One entry"
      contains: "Caveat Brush"
    - path: "src/styles/colors_and_type.css"
      provides: "--font-wordmark cascade aliased to var(--font-display-loaded)"
      contains: "--font-wordmark"
    - path: "src/layouts/BaseLayout.astro"
      provides: "BaseLayout without the --font-wordmark-loaded preload tag"
      contains: "--font-display-loaded"
  key_links:
    - from: "src/styles/colors_and_type.css"
      to: "Astro Fonts API emitted @font-face"
      via: "var(--font-display-loaded) referenced inside --font-wordmark cascade"
      pattern: "var\\(--font-display-loaded\\)"
    - from: "src/components/design-skill/Header.jsx"
      to: "src/styles/colors_and_type.css"
      via: "var(--font-wordmark) inline style on wordmark span"
      pattern: "var\\(--font-wordmark\\)"
---

<objective>
Two small, contained brand-system tweaks that surface naturally during Phase 3 page composition and can ship before any new page-composition work begins:

1. **Wordmark font swap (D-24):** Replace Bagel Fat One with Caveat Brush for the "Studio Bluemli" wordmark in Header + Footer. The user said the existing wordmark "does not look good" and "out of style"; Caveat Brush is already loaded for the display headlines, so this is a CSS-alias-only change with zero new font downloads. Cost: ~25–35 KB WOFF2 + one HTTP/2 request saved.

2. **NoPa → NOPA casing fix (D-25):** Apply project-wide to user-facing site copy only, per the explicit D-25 enumeration. Do NOT use a blanket sed — the exclusion list (`.planning/`, `.claude/skills/`, code comments, `CLAUDE.md` planning prose, commit messages) is binding per Pitfall 7 in RESEARCH.md.

Purpose: Settle the contained, surface-level brand changes BEFORE any new page-composition work so that:
- Plan 02 (`<SEO />` + sitemap) inherits the corrected `og_title`/`og_description` casing from `site/config.yaml`.
- Plan 04 (`/about` rewrite) inherits the corrected `About.jsx` body copy as the baseline (the rewrite is additive on top of this NOPA-corrected text).
- Plan 03 (`/popups` + landing) sees the correct casing in `Hero.jsx` strings flowing into the prerendered landing HTML.

Output: An updated `astro.config.mjs` (no Bagel Fat One entry), updated `colors_and_type.css` (new `--font-wordmark` cascade), updated `BaseLayout.astro` (no wordmark preload), 3 JSX components with NOPA casing fixes, the site config YAML with NOPA casing, and a CLAUDE.md without Bagel Fat One references.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-page-composition-pop-ups/03-CONTEXT.md
@.planning/phases/03-page-composition-pop-ups/03-RESEARCH.md
@.planning/phases/03-page-composition-pop-ups/03-PATTERNS.md
@.planning/phases/03-page-composition-pop-ups/03-UI-SPEC.md
@.claude/skills/studio-bluemli-design/SKILL.md
@astro.config.mjs
@src/styles/colors_and_type.css
@src/layouts/BaseLayout.astro
@src/components/design-skill/Hero.jsx
@src/components/design-skill/About.jsx
@src/components/design-skill/Footer.jsx
@src/content/site/config.yaml
@CLAUDE.md

<interfaces>
<!-- Astro Fonts API: `fontProviders.fontsource()` + `<Font cssVariable="--name" preload />` is the contract.
     Removing an entry from astro.config.mjs's `fonts: []` array drops both the @font-face emission and the
     WOFF2 download for that family. The `<Font cssVariable=... preload />` tag in BaseLayout MUST be removed
     in lockstep — otherwise it 404s on the preload (Pitfall 6 in RESEARCH.md). -->

From src/styles/colors_and_type.css (current state, before edits):
```css
--font-wordmark:    "Bagel Fat One", "Pacifico", "Lobster", system-ui, sans-serif;
--font-display:     "Caveat Brush", "Permanent Marker", "Marker Felt", cursive;
--font-hand:        "Caveat", "Patrick Hand", "Comic Sans MS", cursive;
```

From astro.config.mjs (current state, before edits — lines 29-65 in actual file):
```js
fonts: [
  { provider: fontProviders.fontsource(), name: 'Bagel Fat One', cssVariable: '--font-wordmark-loaded', weights: [400], display: 'swap' },
  { provider: fontProviders.fontsource(), name: 'Caveat Brush',  cssVariable: '--font-display-loaded',  weights: [400], display: 'swap' },
  { provider: fontProviders.fontsource(), name: 'Nunito',        cssVariable: '--font-body-loaded',     weights: [400, 700], display: 'swap' },
  { provider: fontProviders.fontsource(), name: 'Caveat',        cssVariable: '--font-hand-loaded',     weights: [400], display: 'swap' },
],
```

From src/layouts/BaseLayout.astro (current state, lines 30-37):
```astro
<Font cssVariable="--font-wordmark-loaded" preload />
<Font cssVariable="--font-display-loaded" preload />
<Font cssVariable="--font-body-loaded" preload />
<Font cssVariable="--font-hand-loaded" preload />
```

From src/components/design-skill/Hero.jsx (current state, lines 16 + 35):
- Line 16 eyebrow string: `Studio Bluemli · NoPa, San Francisco`
- Line 35 sub-tagline string: `Hand-assembled earrings, made in NoPa. Sold at markets, pop-ups, and by appointment.`

From src/components/design-skill/About.jsx (current state, line 23-24):
- Body paragraph contains exactly one occurrence: `out of a little studio in NoPa, San Francisco`

From src/components/design-skill/Footer.jsx (current state):
- Line 19 tagline string: `hand-assembled earrings · made in NoPa, San Francisco`
- Line 27 location span: `<span style={{ color: 'var(--olive-500)', fontWeight: 700 }}>NoPa, San Francisco</span>`

From src/content/site/config.yaml (current state, lines 1-9):
- Line 2 `tagline:` contains `NoPa, San Francisco`
- Line 6 `footer_text:` contains `NoPa, San Francisco`
- Line 8 `og_description:` contains `NoPa, San Francisco`
- (Line 7 `og_title:` does NOT currently contain `NoPa` — verified via grep)

Total `NoPa` occurrences to flip (verified via grep -c, before edits):
- Hero.jsx: 2
- About.jsx: 1
- Footer.jsx: 2
- site/config.yaml: 3
- CLAUDE.md: 2 (these are PROJECT prose lines — keep, see Task 4 below)
- .planning/: 0 already (good)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Wordmark font swap — drop Bagel Fat One from astro.config.mjs, BaseLayout.astro, and re-alias --font-wordmark in colors_and_type.css (D-24)</name>
  <read_first>
    - astro.config.mjs (current Fonts API config)
    - src/layouts/BaseLayout.astro (current Font preload tags)
    - src/styles/colors_and_type.css (current --font-wordmark cascade declaration around line 115)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md §Q6 (verbatim confirmation that the aliasing works) and §Pitfall 6 (why --font-display-loaded preload MUST stay)
  </read_first>
  <behavior>
    - The Header (top-left) and Footer wordmark "Studio Bluemli" renders in Caveat Brush after the change, identical visually to the Caveat Brush headlines on /about, /popups, /say-hi.
    - The network panel on the rendered site shows exactly ONE Caveat Brush WOFF2 download — no second download for the wordmark.
    - The build does NOT 404 on a `--font-wordmark-loaded` preload (the tag is removed).
    - No Bagel Fat One @font-face rule is emitted in any built CSS file under `dist/client/_astro/`.
  </behavior>
  <action>
**Edit 1 — `astro.config.mjs`:** Open the file, locate the `fonts: [...]` array (currently lines 29-65). Delete the first entry, which is the Bagel Fat One block (lines 30-36 in the current file):

```js
    {
      provider: fontProviders.fontsource(),
      name: 'Bagel Fat One',
      cssVariable: '--font-wordmark-loaded',
      weights: [400],
      display: 'swap',
    },
```

The remaining 3 entries (Caveat Brush, Nunito, Caveat) MUST be preserved exactly as they currently are. Do not edit them, do not reorder them. The final `fonts: []` array contains exactly 3 entries after this edit.

**Edit 2 — `src/layouts/BaseLayout.astro`:** Open the file, locate the `<Font ... preload />` tags (lines 30-37 in the current file). Delete ONLY this one line:

```astro
    <Font cssVariable="--font-wordmark-loaded" preload />
```

CRITICAL: Do NOT remove `<Font cssVariable="--font-display-loaded" preload />` — that line MUST stay (Pitfall 6: it triggers the `@font-face` emission that the new `--font-wordmark` cascade aliases to). The three remaining Font tags (`--font-display-loaded`, `--font-body-loaded`, `--font-hand-loaded`) MUST be preserved exactly.

**Edit 3 — `src/styles/colors_and_type.css`:** Open the file, locate the `--font-wordmark` declaration at line 115 (current text: `--font-wordmark:    "Bagel Fat One", "Pacifico", "Lobster", system-ui, sans-serif;`). Replace that single line with:

```css
  --font-wordmark:    var(--font-display-loaded), "Caveat Brush", cursive;
```

Preserve the indentation (the current file uses 2 spaces for property indentation inside `:root`). Do not touch any other line in colors_and_type.css. In particular, do NOT touch `--font-display` (line 116) or `--font-hand` (line 117) — those cascades are correct as-is.

**Why the cascade works (per RESEARCH.md Q6):** the Astro Fonts API emits an `@font-face` rule binding `font-family: 'Caveat Brush'` to the WOFF2 URL because of the `Caveat Brush` Fonts API entry; it also exposes `--font-display-loaded` as a CSS variable whose value is the family-name stack. Resolving `var(--font-wordmark)` therefore yields `var(--font-display-loaded), 'Caveat Brush', cursive` → `"Caveat Brush", system-ui, sans-serif, 'Caveat Brush', cursive` (left-to-right family lookup, first match wins). No second WOFF2 download.

**Anti-pattern to avoid:** Do NOT add a second `name: 'Caveat Brush'` entry to `astro.config.mjs`'s `fonts: []` array. That would emit duplicate `@font-face` rules and is visible in network audits.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -40 && grep -c "Bagel" astro.config.mjs src/styles/colors_and_type.css src/layouts/BaseLayout.astro && grep -c "font-wordmark-loaded" src/layouts/BaseLayout.astro && grep "var(--font-display-loaded)" src/styles/colors_and_type.css</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "Bagel" astro.config.mjs` → 0
    - `grep -c "Bagel" src/styles/colors_and_type.css` → 0
    - `grep -c "Bagel" src/layouts/BaseLayout.astro` → 0
    - `grep -c 'font-wordmark-loaded' src/layouts/BaseLayout.astro` → 0
    - `grep -c 'font-display-loaded' src/layouts/BaseLayout.astro` → 1 (the `<Font cssVariable="--font-display-loaded" preload />` line MUST remain)
    - `grep "var(--font-display-loaded)" src/styles/colors_and_type.css` returns exactly one match on the `--font-wordmark` line
    - `npm run build` exits with code 0 (no missing-font errors, no 404 on preload)
    - After build, `find dist/client/_astro -name "*.css" -exec grep -l "Bagel" {} \;` returns no results (no Bagel @font-face emitted in production CSS)
  </acceptance_criteria>
  <done>
    `astro.config.mjs` has 3 Fonts API entries (Caveat Brush, Nunito, Caveat), no Bagel Fat One; `colors_and_type.css` `--font-wordmark` cascade reads `var(--font-display-loaded), "Caveat Brush", cursive`; `BaseLayout.astro` has 3 `<Font>` preload tags (display, body, hand), wordmark preload removed; production build succeeds and emits no Bagel Fat One CSS.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: NOPA casing fix on the 4 user-facing source files (D-25)</name>
  <read_first>
    - src/components/design-skill/Hero.jsx (lines 16 + 35 — the only two NoPa strings)
    - src/components/design-skill/About.jsx (line 23-24 — the only NoPa string in the body paragraph)
    - src/components/design-skill/Footer.jsx (lines 19 + 27 — the only two NoPa strings)
    - src/content/site/config.yaml (lines 2, 6, 8 — the three NoPa strings; line 7 og_title does NOT have NoPa, leave it alone)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md §Pitfall 7 (the "do not use blanket sed" warning)
  </read_first>
  <behavior>
    - Each enumerated user-facing string flips `NoPa` → `NOPA`. Counts: 2 in Hero.jsx, 1 in About.jsx, 2 in Footer.jsx, 3 in site/config.yaml.
    - `.planning/` documents, `.claude/skills/studio-bluemli-design/`, and `CLAUDE.md` planning prose are NOT touched.
    - Code comments inside src/ files are NOT touched (currently none of the 4 target files have NoPa inside a code comment — all 8 NoPa occurrences are inside JSX string literals or YAML string values).
  </behavior>
  <action>
**Edit 1 — `src/components/design-skill/Hero.jsx`:** Two string-literal replacements:
- Line 16: change the eyebrow string from `Studio Bluemli · NoPa, San Francisco` to `Studio Bluemli · NOPA, San Francisco`.
- Line 35: change the sub-tagline string from `Hand-assembled earrings, made in NoPa. Sold at markets, pop-ups, and by appointment.` to `Hand-assembled earrings, made in NOPA. Sold at markets, pop-ups, and by appointment.`.

Do not touch any code comment, any style object, any other string in this file.

**Edit 2 — `src/components/design-skill/About.jsx`:** One string-literal replacement in the body paragraph (lines 22-25, the `<p>` element):
- Change `out of a little studio in NoPa, San Francisco` to `out of a little studio in NOPA, San Francisco`.

The paragraph after this edit reads exactly: `I make earrings out of a little studio in NOPA, San Francisco — sourced glass, seed beads, vintage findings. Every pair is one-of-a-kind, and once it's gone, it's gone.`. The signature, eyebrow, headline, and all CSS in this file are unchanged by this task (the full About.jsx rewrite happens in Plan 04).

**Edit 3 — `src/components/design-skill/Footer.jsx`:** Two string-literal replacements:
- Line 19: change `hand-assembled earrings · made in NoPa, San Francisco` to `hand-assembled earrings · made in NOPA, San Francisco`.
- Line 27: change the span content from `NoPa, San Francisco` to `NOPA, San Francisco`.

Do not touch the `igHandle`/`contactEmail` props, the `<Mark.Dots />` line, or any style object.

**Edit 4 — `src/content/site/config.yaml`:** Three string-literal replacements (D-25 enumerated set). The file currently is:

```yaml
default:
  tagline: "small-batch, hand-clustered earrings from a tiny studio in NoPa, San Francisco"
  contact_email: hi@studiobluemli.com
  ig_handle: studiobluemli
  ig_dm_url: https://ig.me/m/studiobluemli
  footer_text: "studio bluemli — hand-clustered in NoPa, San Francisco"
  og_title: "Studio Bluemli — hand-clustered beaded earrings"
  og_description: "small-batch beaded-cluster earrings from a NoPa, San Francisco studio. browse the gallery, see where the next pop-up is, say hi."
```

Replace each `NoPa` with `NOPA` in the three lines that contain it (`tagline`, `footer_text`, `og_description`). Do NOT add NOPA to `og_title` — it does not currently contain `NoPa` and D-25 does not require adding it. The final file should be byte-identical to the above EXCEPT for the three `NoPa` → `NOPA` replacements.

**Exclusion enforcement** — do NOT edit any of the following during this task:
- Any file under `.planning/` (audit trail; D-25 explicit exclusion)
- Any file under `.claude/skills/studio-bluemli-design/` (canonical brand reference; D-25 + Phase 1 D-04 lock)
- Code comments anywhere in `src/` (D-25 explicit exclusion — none of the 4 target files have NoPa in comments anyway, confirmed by manual inspection)
- `CLAUDE.md` planning prose (handled separately in Task 4, and per D-25 the planning prose itself stays)
- Commit messages (will be handled at commit time; the commit message text is owned by the executor and uses NOPA naturally)

Pitfall 7 from RESEARCH.md: do NOT run `sed -i 's/NoPa/NOPA/g' src/**` or `grep -r NoPa | xargs sed ...`. The 8 edits above are exhaustive for D-25's scope.
  </action>
  <verify>
    <automated>grep -c 'NoPa' src/components/design-skill/Hero.jsx src/components/design-skill/About.jsx src/components/design-skill/Footer.jsx src/content/site/config.yaml && grep -c 'NOPA' src/components/design-skill/Hero.jsx src/components/design-skill/About.jsx src/components/design-skill/Footer.jsx src/content/site/config.yaml && grep -rc 'NoPa' .planning/ .claude/skills/studio-bluemli-design/</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c 'NoPa' src/components/design-skill/Hero.jsx` → 0
    - `grep -c 'NoPa' src/components/design-skill/About.jsx` → 0
    - `grep -c 'NoPa' src/components/design-skill/Footer.jsx` → 0
    - `grep -c 'NoPa' src/content/site/config.yaml` → 0
    - `grep -c 'NOPA' src/components/design-skill/Hero.jsx` → ≥2 (the eyebrow and sub-tagline strings)
    - `grep -c 'NOPA' src/components/design-skill/About.jsx` → ≥1 (the body paragraph)
    - `grep -c 'NOPA' src/components/design-skill/Footer.jsx` → ≥2 (the two location strings)
    - `grep -c 'NOPA' src/content/site/config.yaml` → ≥3 (tagline, footer_text, og_description)
    - `grep -rc 'NoPa' .planning/` returns 0 changed files (the audit trail is unchanged from before this task)
    - `grep -rc 'NoPa' .claude/skills/studio-bluemli-design/` returns 0 changed files
    - `npm run build` (run at end of plan via Task 3) exits with code 0 and does not surface flower/petal/floral/bloom/blossom (Phase 1 CI grep) — the casing fix introduces none of these
  </acceptance_criteria>
  <done>
    All 8 NoPa occurrences in the 4 enumerated source files are flipped to NOPA. `.planning/` and `.claude/skills/` are untouched. Phase 1 CI brand-check grep still passes on these files.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Drop Bagel Fat One references from CLAUDE.md (D-24 follow-up + cleanliness)</name>
  <read_first>
    - CLAUDE.md (the project instructions file at repo root — look at the technology-stack section, the "Supporting Libraries" + "What NOT to Use" tables, and any Confidence Notes / Sources rows that mention `Bagel Fat One`)
    - .planning/phases/03-page-composition-pop-ups/03-CONTEXT.md §D-24 (the planner's-discretion note: "delete or comment-out — Claude picks; deletion is preferable for cleanliness")
  </read_first>
  <behavior>
    - CLAUDE.md no longer references Bagel Fat One as part of the wordmark stack.
    - The factual statements about Astro Fonts API + `@fontsource-variable/nunito` fallback are preserved (those are general stack guidance, unrelated to the wordmark swap).
    - The `package.json` `@fontsource/bagel-fat-one` dependency entry is also dropped (it is no longer consumed after Task 1 removes the Fonts API entry; leaving it inflates `node_modules` and node-module-typing churn).
  </behavior>
  <action>
**Edit 1 — `CLAUDE.md`:** Open the file and search for `Bagel Fat One` (case-sensitive). Each match should be evaluated:

1. If the match is inside a row of the "Supporting Libraries" table or any prose that lists Bagel Fat One as the wordmark font choice → delete the row or rewrite the sentence to remove the Bagel-Fat-One-specific reference. The wordmark is now Caveat Brush; if the prose says "wordmark uses Bagel Fat One", change it to "wordmark uses Caveat Brush (aliased via `--font-wordmark` to the already-loaded `--font-display-loaded` face)".
2. If the match is inside a "Confidence Notes" or "Sources" row referencing `@fontsource/bagel-fat-one` package version research, simply delete that row — it is no longer relevant to the project.
3. Do NOT touch general Astro Fonts API guidance, the `@fontsource-variable/nunito` fallback note, or any other font-related row that doesn't name Bagel Fat One.

After the edits, `grep -c "Bagel" CLAUDE.md` MUST return 0.

**Edit 2 — `package.json`:** Open the file. In the `"dependencies"` block, delete the line `"@fontsource/bagel-fat-one": "^5.2.7",` (currently line 24 in the file). Preserve the trailing comma rules of JSON: the line above (`"@astrojs/react": "^5.0.4",`) keeps its trailing comma; the line below (`"@fontsource/caveat": "^5.2.8",`) keeps its trailing comma. No other dependency entries change in this task.

Do NOT run `npm install` as part of this task — the lockfile reconciliation happens automatically on the next `npm run build` invocation (Task 4 below). If a `package-lock.json` exists, it will be regenerated; do not pre-emptively delete it.
  </action>
  <verify>
    <automated>grep -c "Bagel" CLAUDE.md && grep -c '@fontsource/bagel-fat-one' package.json</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "Bagel" CLAUDE.md` → 0
    - `grep -c '@fontsource/bagel-fat-one' package.json` → 0
    - JSON validity preserved: `node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"` exits 0
    - `grep -c '@fontsource/caveat-brush' package.json` → 1 (Caveat Brush dep retained, this is the wordmark's new family)
    - `grep -c '@fontsource/caveat' package.json` → 2 (one match each for caveat and caveat-brush — sanity check that we did not accidentally remove the Caveat dep)
  </acceptance_criteria>
  <done>
    CLAUDE.md no longer mentions Bagel Fat One; `package.json` no longer lists the Bagel Fat One Fontsource dependency. No other CLAUDE.md or package.json content changed.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Final build + CI brand-grep gate</name>
  <read_first>
    - scripts/check-brand-rules.sh (Phase 1 CI brand-rule gate — verifies no bg-white, no #fff except #fff8, no gradient, no backdrop-filter, no border:1px, no flower vocab)
    - package.json `scripts.ci:brand-check` entry to confirm the gate name
  </read_first>
  <behavior>
    - `npm run build` succeeds end-to-end with the wordmark and casing changes in place.
    - `npm run ci:brand-check` exits 0 — the casing fix and the wordmark-cascade change introduce no brand-rule violations.
    - The Phase 1 lowercase-filenames gate (`npm run ci:lowercase-check`) also exits 0 — this plan adds no files under `src/pages/`.
    - No Bagel Fat One artifact appears in any built CSS file in `dist/client/_astro/`.
  </behavior>
  <action>
Run the install + build + brand-check sequence in order. Treat any non-zero exit as a blocking failure and stop.

1. `npm install` — regenerates `package-lock.json` after the Bagel Fat One dep was removed. Expected: clean exit, no peer-dep warnings about missing Bagel Fat One.

2. `npm run build` — runs `astro check && astro build`. Expected: `astro check` passes type-checking (no missing-font CSS-variable reference), `astro build` produces a `dist/` tree with no Bagel Fat One CSS.

3. `npm run ci:brand-check` — runs `scripts/check-brand-rules.sh`. Expected: exit code 0. This validates the casing fix did not accidentally introduce `flower|petal|floral|bloom|blossom` or `bg-white|#fff` (other than the `#fff8` exception), `gradient`, `backdrop-filter`, or `border: 1px`.

4. `npm run ci:lowercase-check` — runs `scripts/check-lowercase-filenames.sh`. Expected: exit code 0. This plan touches no files under `src/pages/`, so this is a no-op confidence check.

5. Confirm no Bagel Fat One CSS leaked: `find dist/client/_astro -name '*.css' -exec grep -l 'Bagel' {} \;` MUST return no output.

6. Confirm no `--font-wordmark-loaded` reference in the built HTML: `grep -rc 'font-wordmark-loaded' dist/client/` should return 0 (or report only the absence of the string across all .html and .css output files).

If any step fails, do not proceed to a commit — investigate the root cause (most likely a stale `node_modules/.cache` or an Astro Fonts API entry left dangling — re-read Task 1 Edit 2 carefully).
  </action>
  <verify>
    <automated>npm install --silent && npm run build 2>&1 | tail -30 && npm run ci:brand-check && npm run ci:lowercase-check && find dist/client/_astro -name '*.css' -exec grep -l 'Bagel' {} \; ; echo "GREP_BAGEL_EXIT=$?"</automated>
  </verify>
  <acceptance_criteria>
    - `npm install` exits 0
    - `npm run build` exits 0 with no errors mentioning `--font-wordmark-loaded`, `Bagel Fat One`, or `Font` preload 404s
    - `npm run ci:brand-check` exits 0
    - `npm run ci:lowercase-check` exits 0
    - `find dist/client/_astro -name '*.css' -exec grep -l 'Bagel' {} \;` produces no output (no .css file contains `Bagel`)
    - `grep -rc 'font-wordmark-loaded' dist/client/ | grep -v ':0$'` produces no output (no built file references the removed CSS variable)
    - `grep -rc 'NoPa' src/components/design-skill/ src/content/site/` produces no non-zero match
  </acceptance_criteria>
  <done>
    Full build pipeline green. The site builds without Bagel Fat One, with the new wordmark cascade live, with all NOPA casing applied, with all Phase 1 brand-rule + lowercase-filename CI gates still passing.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| (none in this plan) | Phase 3 Plan 01 has no public attack surface: only build-time text edits to source files; no new endpoints, no new dependencies fetched from npm beyond the existing lockfile. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-01-01 | Information Disclosure | astro.config.mjs / colors_and_type.css | accept | Both files are public source code (open-source-style brand-system tweaks). No secrets, no PII, no credentials. Disclosure is the desired state — these files ship in the repo. |
| T-03-01-02 | Tampering | NoPa casing change in user-facing copy | accept | The casing change is a typographic correction with no semantic shift; tampering risk is the same as for any source-code commit and is mitigated by the existing GitHub branch-protection + required-status-check workflow (Phase 1 FND-04). |
| T-03-01-03 | Malicious Code (V10 supply chain) | package.json dep change | mitigate | Removing the `@fontsource/bagel-fat-one` dep reduces supply-chain surface area by one package. No new deps are added in this plan. `npm install` will refresh the lockfile; the existing `package-lock.json` integrity hashes for the surviving deps are unchanged. |
</threat_model>

<verification>
End-to-end verification for the plan (run after all 4 tasks complete):

```bash
# 1) All 4 source files free of NoPa:
grep -c 'NoPa' src/components/design-skill/Hero.jsx src/components/design-skill/About.jsx src/components/design-skill/Footer.jsx src/content/site/config.yaml CLAUDE.md
# Expect: every line ends with :0

# 2) All NOPA targets present:
grep -c 'NOPA' src/components/design-skill/Hero.jsx
# Expect: ≥ 2
grep -c 'NOPA' src/content/site/config.yaml
# Expect: ≥ 3

# 3) No Bagel Fat One anywhere in source or built output:
grep -rc 'Bagel' astro.config.mjs src/styles/colors_and_type.css src/layouts/BaseLayout.astro CLAUDE.md package.json
# Expect: every line ends with :0

# 4) Wordmark cascade points to display-loaded:
grep 'var(--font-display-loaded)' src/styles/colors_and_type.css
# Expect: one line matching the --font-wordmark cascade

# 5) BaseLayout has 3 Font preload tags (display, body, hand) — wordmark dropped:
grep -c '<Font cssVariable' src/layouts/BaseLayout.astro
# Expect: 3

# 6) Build succeeds and CI gates pass:
npm install --silent && npm run build && npm run ci:brand-check && npm run ci:lowercase-check
# Expect: all four commands exit 0
```

Visual sanity (founder-style, optional; not part of automated gate):
- `npm run dev`, open `/` in a browser, confirm the "Studio Bluemli" wordmark in the Header (top-left) now matches the Caveat Brush headline style.
- DevTools → Network → filter `font` → confirm one Caveat Brush WOFF2, zero Bagel Fat One requests.
</verification>

<success_criteria>
Plan 01 is complete when:
1. `grep -c 'NoPa'` returns 0 on every one of the 4 enumerated source files plus CLAUDE.md.
2. `grep -c 'Bagel'` returns 0 on `astro.config.mjs`, `src/styles/colors_and_type.css`, `src/layouts/BaseLayout.astro`, `CLAUDE.md`, and `package.json`.
3. `npm run build` exits 0 with no missing-preload errors and no Bagel Fat One @font-face in `dist/client/_astro/`.
4. `npm run ci:brand-check` and `npm run ci:lowercase-check` both exit 0.
5. `src/styles/colors_and_type.css` `--font-wordmark` declaration reads `var(--font-display-loaded), "Caveat Brush", cursive`.
</success_criteria>

<output>
After completion, create `.planning/phases/03-page-composition-pop-ups/03-01-SUMMARY.md` documenting:
- The 4 user-facing files NOPA'd + the 5 wordmark-related files edited.
- A grep-count snapshot before/after (the 8 NoPa flips + the 0 Bagel matches).
- Confirmation that Plan 02's `<SEO />` and Plan 04's About rewrite will inherit the NOPA-corrected copy.
- A one-line note that Pitfall 6 from RESEARCH.md was honored (the `--font-display-loaded` preload tag stayed in BaseLayout.astro).
</output>
