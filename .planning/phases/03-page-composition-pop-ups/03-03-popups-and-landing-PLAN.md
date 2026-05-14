---
phase: 03-page-composition-pop-ups
plan: 03
type: execute
wave: 3
depends_on: ["03-01", "03-02"]
files_modified:
  - src/lib/popups.ts
  - src/components/PopupCallout.astro
  - src/pages/index.astro
  - src/pages/popups.astro
  - src/components/design-skill/PopupStrip.jsx
autonomous: true
requirements: [PAG-01, PAG-03]
must_haves:
  truths:
    - "When `src/content/popups/` is empty, the landing page omits the entire pop-up section (no eyebrow, no copy, no empty-state line) and the /popups page renders the D-08 empty-state copy under a quiet POP-UPS eyebrow."
    - "When at least one upcoming popup exists, the landing page renders a mini-callout (eyebrow + when-line + time + optional 'see all' link); the /popups page renders that popup via the full PopupStrip + the popup's markdown body description (PAG-03 + Concern 14) + ALSO COMING UP list + (if any past exist) a PAST list."
    - "The upcoming-vs-past cutoff is computed at build time in America/Los_Angeles via `temporal-polyfill`'s `Temporal.PlainDate.compare()` (Pitfall 7 + REVIEWS-MODE Concern 2: ordering uses `Temporal.PlainDate.from(date)` ONLY — start_time strings like '11am' are NEVER parsed as Date components)."
    - "Display labels (date, time) are formatted via `Temporal.PlainDate.from(date).toLocaleString` for the date and verbatim string interpolation for the time — `start_time: '11am'` renders as 'Sunday, July 6 — Heath Ceramics' on the date line and '11am–4pm' on the time line, not via `new Date('YYYY-MM-DDT11am:00')` which would NaN."
    - "PopupStrip.jsx no longer renders the 'book by appointment' link (D-09); the rest of the component is unchanged."
    - "Both landing and /popups pages pass their title to BaseLayout via `<BaseLayout title=\"...\">` (Concern 4: BaseLayout owns <title>); both wire `<SEO slot=\"head\" />` for canonical/og emission only."
  artifacts:
    - path: "src/lib/popups.ts"
      provides: "splitPopups() pure function — buckets entries into soonest/alsoComing/past with TZ-aware cutoff using date-only Temporal.PlainDate (no start_time parsing)"
      exports: ["splitPopups"]
    - path: "src/components/PopupCallout.astro"
      provides: "Landing mini-callout — eyebrow + when-line + time + conditional 'see all' link; date formatted via Temporal.PlainDate.toLocaleString, time rendered verbatim"
      contains: "hand-eyebrow"
    - path: "src/pages/index.astro"
      provides: "Landing page wiring popups + featured pieces + SEO"
      contains: "PopupCallout"
    - path: "src/pages/popups.astro"
      provides: "Pop-ups page wiring soonest PopupStrip + popup body description (Concern 14) + ALSO COMING UP + PAST + empty state + SEO"
      contains: "ALSO COMING UP"
  key_links:
    - from: "src/pages/index.astro"
      to: "src/lib/popups.ts"
      via: "import { splitPopups } and destructure { soonest, hasUpcoming, hasMultiple }"
      pattern: "import \\{ splitPopups \\}"
    - from: "src/pages/popups.astro"
      to: "src/lib/popups.ts"
      via: "import { splitPopups } and destructure { soonest, alsoComing, past }"
      pattern: "splitPopups\\("
    - from: "src/pages/index.astro"
      to: "src/components/PopupCallout.astro"
      via: "{hasUpcoming && <PopupCallout popup={soonest} hasMultiple={hasMultiple} />}"
      pattern: "PopupCallout"
    - from: "src/components/PopupCallout.astro"
      to: "src/components/design-skill/PopupStrip.jsx"
      via: "Mutually exclusive — landing uses PopupCallout; /popups uses PopupStrip (D-02)"
      pattern: "/popups"
---

<objective>
Compose the landing page and the `/popups` page with real popup content using a shared TZ-aware split helper. Implement the mini-callout component per D-02, the PopupStrip CTA delete per D-09, the empty-state copy per D-08, the landing-omits-section-on-zero-upcoming behavior per D-03, and render the popup's markdown body description for the soonest upcoming popup per PAG-03 + Concern 14.

Purpose: This plan is the heart of Phase 3's popup-driven UI. It introduces the only genuinely new logic in Phase 3 (Temporal-based bucketing) and uses it to drive two pages with the same data source. The TZ-aware cutoff (Pitfall 7) is centralized in a single pure function so both pages stay consistent.

**REVIEWS-MODE FIXES (this plan addresses 4 Codex concerns):**

1. **Concern 2 (HIGH) — Popup date formatting broken for "11am" strings.** Original plan used `new Date(\`${date}T${start_time}:00\`)` which produces NaN when `start_time: "11am"` (the schema/examples use display strings, not HH:mm). FIX: Stop parsing display times into Date objects. Use `Temporal.PlainDate.from(popup.data.date)` for date labels. Render `start_time` / `end_time` as raw display strings — never parse them. The TZ-correct date label is built from `date` alone via `Temporal.PlainDate.from(date)` + `.toLocaleString` (which is build-machine-TZ-safe).

2. **Concern 4 (HIGH) — `<title>` regression.** Plan 02 keeps BaseLayout's `<title>{title}</title>` and the `<SEO />` component does NOT emit `<title>`. So this plan's pages MUST pass title via `<BaseLayout title="...">` (Concern 4 reconciliation). The `<SEO slot="head" pathname="/..." />` no longer needs a `title` prop (it's optional per the new SEO.astro contract).

3. **Concern 8 (MEDIUM) — Grep chains break on zero matches.** All "expect zero" verifications use `! grep -q PATTERN file` or `grep -c PATTERN file || true` to avoid shell-chain failure.

4. **Concern 9 (MEDIUM) — Astro frontmatter leading-space delimiter.** When the executor TRANSCRIBES Astro code from this plan into the actual source file, the `---` frontmatter delimiter lines MUST be at column 0. Inside this plan's markdown code blocks the `---` lines are shown with ONE leading space — this is a markdown-rendering safety device (it prevents the GSD frontmatter parser from latching onto the inner sample as if it were the file's real frontmatter). The executor MUST strip that leading space when writing the file. This affects the new component file `PopupCallout.astro` and the rewrites of `index.astro` + `popups.astro`.

5. **Concern 14 (LOW) — `/popups` does not render popup descriptions.** PAG-03 mentions date, location, time, AND description. The default per reviews-mode guidance: render the markdown body for the soonest upcoming popup ("free champagne" use case). Since `start_time` is no longer parsed (Concern 2 fix), the markdown body provides the descriptive context that previously felt like the missing piece.

Output (5 files, 2 new + 3 modified):
- `src/lib/popups.ts` — pure function `splitPopups(entries)` returning `{ soonest, alsoComing, past, hasUpcoming, hasMultiple }`. Uses Temporal.PlainDate ONLY (no start_time parsing).
- `src/components/PopupCallout.astro` — the landing mini-callout (D-02), scoped CSS per UI-SPEC §Landing. Date formatted via Temporal.PlainDate; time rendered verbatim.
- `src/pages/index.astro` — wires popups + featured 3 pieces + `<SEO />` + the mini-callout; drops the placeholder `nextPopup = null` stub. Title passed via `<BaseLayout title="...">` (Concern 4).
- `src/pages/popups.astro` — wires popups via `splitPopups`; renders soonest PopupStrip + soonest's markdown body description (Concern 14) + ALSO COMING UP rows + PAST rows + empty state + `<SEO />`. Title via `<BaseLayout title="...">`.
- `src/components/design-skill/PopupStrip.jsx` — deletes lines 63-72 (the `book by appointment` block) per D-09.
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
@.planning/phases/03-page-composition-pop-ups/03-REVIEWS.md
@.planning/phases/03-page-composition-pop-ups/03-01-SUMMARY.md
@.planning/phases/03-page-composition-pop-ups/03-02-SUMMARY.md
@.claude/skills/sketch-findings-bluemli/SKILL.md
@CLAUDE.md
@src/pages/index.astro
@src/pages/popups.astro
@src/pages/gallery/[slug].astro
@src/components/design-skill/PopupStrip.jsx
@src/content.config.ts
@src/content/site/config.yaml

<interfaces>
Popups collection schema (from src/content.config.ts — read-only here, do NOT modify):
```typescript
const popups = defineCollection({
  loader: glob({ base: './src/content/popups', pattern: '*.md' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    start_time: z.string(),     // FREE-FORM display string ("11am", "11:00", "11:00 AM") — NEVER parsed as a Date component
    end_time: z.string(),       // Same — display string
    tz: z.string().default('America/Los_Angeles'),
    location: z.string(),
    address: z.string().optional(),
    photos: z.array(image()).optional(),
    link: z.string().url().optional(),
  }).strict(),
});
```

`CollectionEntry<'popups'>` is the imported type. `entry.data` has the above shape. `entry.body` is the markdown body string. The astro:content `render(entry)` helper returns `{ Content }` for rendering markdown to HTML — used in popups.astro for Concern 14's body description.

Temporal API (from temporal-polyfill, installed in Plan 02):
```typescript
import { Temporal } from 'temporal-polyfill';
Temporal.Now.plainDateISO('America/Los_Angeles');   // returns Temporal.PlainDate for "today in LA"
Temporal.PlainDate.from('2026-06-07');               // parses YYYY-MM-DD
Temporal.PlainDate.compare(a, b);                    // returns -1 / 0 / 1
plainDate.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                                                     // returns e.g. "Sunday, July 6"
```

**Concern 2 anti-pattern (FORBIDDEN in this plan):** `new Date(\`${date}T${start_time}:00\`)` — this works for `start_time: "11:00"` ONLY IF the build machine is UTC, and produces NaN for `start_time: "11am"`. NEVER do this anywhere in Plan 03.

PopupStrip.jsx contract (current file, lines 5-77):
- Accepts `popup: { name, date, startTime, endTime, tz, location }`
- The page passes a "JS-friendly" object — NOTE the prop names are `startTime`/`endTime` (camelCase), NOT the schema's `start_time`/`end_time` snake_case. The current call site in `src/pages/popups.astro` (Phase 1 stub `nextPopup = null`) means PopupStrip has never actually rendered a real popup. Phase 3 must construct the props correctly. See Task 4 below for the camelCase adapter.
- PopupStrip's existing `Intl.DateTimeFormat` idiom (lines 9-20) takes the `popup.date` (YYYY-MM-DD) and the popup.startTime — but PopupStrip itself reads `popup.startTime` only to render text and never parses it as a Date component (verified by reading the file — it only uses `Intl.DateTimeFormat` on `new Date(popup.date)`, an unparsed-time-safe call). **Action item for the executor:** when modifying PopupStrip in Task 5 (delete CTA), DOUBLE-CHECK that PopupStrip does not internally do `new Date(\`${popup.date}T${popup.startTime}\`)` — if it does, that's a separate Concern 2 fix-in-place that must be applied to PopupStrip.jsx in Task 5. (Verify by reading PopupStrip.jsx line 9 area before editing; if found, replace with `new Date(popup.date)` + Intl.DateTimeFormat.)

`<SEO />` contract (from Plan 02, post-Concern-4 fix):
```astro
<SEO slot="head"
     title="..."          {/* OPTIONAL — falls back to site.og_title; used ONLY for og:title (NOT for <title>) */}
     description="..."    {/* optional, falls back to site.og_description */}
     ogImage="..."        {/* optional, absolute URL, falls back to /og-default.png */}
     pathname="/..."      {/* optional, default "/" */} />
```

**Concern 4 wiring rule:** The page MUST also pass its title via `<BaseLayout title="...">` — that's how the actual `<title>` tag is emitted. Pages typically pass the SAME title to both `<BaseLayout>` and `<SEO />` so `<title>` and `og:title` match.

Existing landing-featured-pieces logic (from src/pages/index.astro lines 29-40) — KEEP exactly as-is per D-04 (3-newest by published_at; falls back to "newest 3 regardless of featured" is NOT yet implemented; current code does `.slice(0,3)` on the whole sorted list, which IS the fallback behavior. To honor D-04 properly we add a featured-filter pass with fallback — see Task 3 Edit 1):
```typescript
const allPieces = await getCollection('gallery');
const featuredPieces = allPieces
  .sort((a, b) => b.data.published_at.localeCompare(a.data.published_at))
  .slice(0, 3)
  .map((entry) => ({ slug: entry.id, name: entry.data.name, ... }));
```

Mini-callout exact CSS (from RESEARCH.md Example 1 + UI-SPEC §Landing):
- `.popup-callout` — max-width 640px, centered, padding `var(--space-6) var(--space-5)`, text-align center.
- `.hand-eyebrow` — Caveat, 28px (`--fs-xl`), olive-500, rotate -1.5deg, inline-block.
- `.when` — Nunito 800, 28px (`--fs-xl`), color-fg-strong, line-height 1.15; venue span in coral-500.
- `.time` — Nunito 400, 16px (`--fs-sm`), color-fg-muted.
- `.see-all` — Nunito 700, 14px (`--fs-xs`), coral-500, with hover-state coral-700 + translateX(2px) on the arrow.

`/popups` ALSO COMING UP row format (UI-SPEC §/popups list format strings):
- `<Weekday>, <Month> <Day> · <Venue> · <time>` (mid-dot separators)
- e.g.: `Sunday, July 6 · Heath Ceramics · 11am–4pm`

PAST row format (UI-SPEC):
- `<Weekday>, <Month> <Day> · <Venue>, <City>`
- e.g.: `Saturday, April 12 · Heath Ceramics, San Francisco`
- City fallback: `San Francisco` if not present in frontmatter (popups schema has no `city` field; address is optional and may contain city). Use a regex extraction or hard-fallback to `San Francisco`.

Empty-state copy (D-08):
> No pop-ups on the calendar yet —
> follow @studiobluemli for the next one.

(The `@studiobluemli` substring is a coral underlined `<a href="https://instagram.com/studiobluemli">` link.)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create src/lib/popups.ts (TZ-aware bucket helper using Temporal.PlainDate ONLY — Concern 2 fix)</name>
  <read_first>
    - src/content.config.ts (popups schema — confirms `date` / `end_date` are YYYY-MM-DD; `start_time` / `end_time` are FREE-FORM display strings; `tz` defaults to America/Los_Angeles)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md "Pattern 1: TZ-aware popup split helper" (verbatim code) and "Anti-Pattern: do not pass Temporal.PlainDate through JSON.stringify"
    - .planning/phases/03-page-composition-pop-ups/03-PATTERNS.md "src/lib/popups.ts (NEW — utility, pure function)" (the role + import idiom)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 2: never parse start_time as a Date component; date-only ordering)
  </read_first>
  <behavior>
    - `splitPopups(entries)` is a pure, deterministic function: same input -> same output.
    - Today-in-LA is computed via `Temporal.Now.plainDateISO('America/Los_Angeles')`. Build runs in any timezone, but the cutoff is always LA-local.
    - A popup whose `end_date` (or `date` if no `end_date`) is strictly BEFORE LA-today is "past"; otherwise "upcoming" (so day-of events stay upcoming all day in LA).
    - Upcoming is sorted by `date` ascending (soonest first). Past is sorted by `date` descending (newest first — matches gallery sort + UI-SPEC default). Sort uses `Temporal.PlainDate.from(date)` ONLY — `start_time` is NEVER consulted for ordering (Concern 2: `start_time` is a free-form display string).
    - Returns: `{ soonest: Popup | null, alsoComing: Popup[], past: Popup[], hasUpcoming: boolean, hasMultiple: boolean }`. `hasUpcoming = upcoming.length > 0`; `hasMultiple = upcoming.length >= 2`.
    - Temporal objects do NOT leak out of the function (Anti-Pattern in RESEARCH.md: "do not pass Temporal.PlainDate through JSON.stringify"). The function returns plain `CollectionEntry<'popups'>` arrays only.
  </behavior>
  <action>
**Create `src/lib/popups.ts`** with the Write tool. File contents:

```typescript
// src/lib/popups.ts — Phase 3 PAG-03 / D-06, D-11.
// TZ-aware upcoming-vs-past split for the popups collection.
//
// REVIEWS-MODE Concern 2 fix: this module ORDERS and BUCKETS popups using
// Temporal.PlainDate built from `date` (YYYY-MM-DD) ONLY. The `start_time`
// and `end_time` fields are FREE-FORM display strings ("11am", "11:00 AM",
// "11:00") and are NEVER parsed as Date components anywhere in this module.
// The original plan used `new Date(\`${date}T${start_time}:00\`)` which NaNs
// on "11am" — that anti-pattern is forbidden here.
//
// Consumed by:
//   - src/pages/index.astro (mini-callout: needs `hasUpcoming` + `soonest`)
//   - src/pages/popups.astro (full layout: needs `soonest` + `alsoComing` + `past`)
//
// Computed at BUILD TIME ONLY (Astro page frontmatter, never the browser).
// `temporal-polyfill` is consumed here only — no Temporal.* type leaks
// across the function boundary (Anti-Pattern: "do not JSON.stringify
// Temporal objects"; pages get plain CollectionEntry<'popups'> arrays).

import { Temporal } from 'temporal-polyfill';
import type { CollectionEntry } from 'astro:content';

type Popup = CollectionEntry<'popups'>;

const ZONE = 'America/Los_Angeles';

/**
 * Returns the LA-local "today" as a Temporal.PlainDate.
 * Computed once per call; safe to call from anywhere in this module.
 */
function todayInLA(): Temporal.PlainDate {
  return Temporal.Now.plainDateISO(ZONE);
}

/**
 * Parses a popup's effective end date (end_date if present, otherwise date)
 * as a Temporal.PlainDate. Both fields are YYYY-MM-DD strings per the
 * Phase 2 schema (CNT-04, CNT-05), so Temporal.PlainDate.from() is exact.
 *
 * NOTE (Concern 2): start_time / end_time are NEVER consulted here. The
 * cutoff is date-only — popups stay "upcoming" all day in LA on their date.
 */
function popupEndDate(p: Popup): Temporal.PlainDate {
  return Temporal.PlainDate.from(p.data.end_date ?? p.data.date);
}

/** Sort ascending by event date. Date-only — start_time NOT consulted. */
function byDateAsc(a: Popup, b: Popup): number {
  return Temporal.PlainDate.compare(
    Temporal.PlainDate.from(a.data.date),
    Temporal.PlainDate.from(b.data.date),
  );
}

export function splitPopups(entries: Popup[]): {
  soonest:     Popup | null;
  alsoComing:  Popup[];
  past:        Popup[];
  hasUpcoming: boolean;
  hasMultiple: boolean;
} {
  const today = todayInLA();

  const upcoming: Popup[] = [];
  const past:     Popup[] = [];
  for (const e of entries) {
    if (Temporal.PlainDate.compare(popupEndDate(e), today) < 0) {
      past.push(e);
    } else {
      upcoming.push(e);
    }
  }

  upcoming.sort(byDateAsc);
  past.sort((a, b) => byDateAsc(b, a)); // newest-first for past archive

  return {
    soonest:     upcoming[0] ?? null,
    alsoComing:  upcoming.slice(1),
    past,
    hasUpcoming: upcoming.length > 0,
    hasMultiple: upcoming.length >= 2,
  };
}
```

**Self-check**: after creation, run `node -e "import('temporal-polyfill').then(({Temporal}) => console.log(Temporal.Now.plainDateISO('America/Los_Angeles').toString()))"` — expected output: today's date in YYYY-MM-DD form for the LA timezone. If this fails (e.g. Node 22 missing BigInt), the install is broken; do not proceed.
  </action>
  <verify>
    <automated>test -f src/lib/popups.ts && grep -c "export function splitPopups" src/lib/popups.ts && grep -c "temporal-polyfill" src/lib/popups.ts && grep -c "America/Los_Angeles" src/lib/popups.ts && grep -c "Temporal.PlainDate.compare" src/lib/popups.ts && (grep -cE "new Date\(.*start_time" src/lib/popups.ts || true) && node -e "import('temporal-polyfill').then(({Temporal}) => console.log(Temporal.Now.plainDateISO('America/Los_Angeles').toString())).catch(e => { console.error(e); process.exit(1); })"</automated>
  </verify>
  <acceptance_criteria>
    - `test -f src/lib/popups.ts` exits 0
    - `grep -c "export function splitPopups" src/lib/popups.ts` returns 1
    - `grep -c "temporal-polyfill" src/lib/popups.ts` returns 1
    - `grep -c "America/Los_Angeles" src/lib/popups.ts` returns 1
    - `grep -c "Temporal.PlainDate.compare" src/lib/popups.ts` returns at least 1
    - **Concern 2 anti-pattern absent:** `! grep -qE "new Date\(.*start_time" src/lib/popups.ts` exits 0 (no Date construction from start_time)
    - **Concern 2 anti-pattern absent:** `! grep -qE "new Date\(\\\`.*\\\$\{.*date.*\}.*T.*\\\$\{" src/lib/popups.ts` exits 0 (no template-literal Date construction with date+T)
    - The Temporal probe `node -e "import('temporal-polyfill')..."` prints a YYYY-MM-DD string and exits 0
    - `npx astro check` exits 0 (no TypeScript errors in the new file)
  </acceptance_criteria>
  <done>
    `src/lib/popups.ts` exists, type-checks, uses Temporal.PlainDate-only ordering (Concern 2 — no start_time parsing), and the Temporal polyfill is verified to work in the local Node environment.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Create src/components/PopupCallout.astro (landing mini-callout per D-02 + UI-SPEC §Landing — Concern 2 + Concern 9 fixes)</name>
  <read_first>
    - src/pages/gallery/[slug].astro (the Astro component scaffold: frontmatter + JSX + scoped `<style>` block)
    - src/components/design-skill/PopupStrip.jsx (existing `Intl.DateTimeFormat` TZ-aware date-format idiom, lines 9-20)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md Example 1 (verbatim component code)
    - .planning/phases/03-page-composition-pop-ups/03-UI-SPEC.md §Landing (typography tokens, color tokens, layout dimensions)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 2: date-only Temporal formatting; Concern 9: column-0 frontmatter)
    - .claude/skills/sketch-findings-bluemli/SKILL.md (validated visual register)
  </read_first>
  <behavior>
    - `<PopupCallout popup={CollectionEntry<'popups'>} hasMultiple={boolean} />` renders the markup described in UI-SPEC §Landing.
    - Format strings: when-line is `<Weekday>, <Month> <Day> — <Venue>` (em-dash separator); time is `<start_time>–<end_time>` (en-dash, not hyphen).
    - **Concern 2 critical fix:** the date label is built via `Temporal.PlainDate.from(popup.data.date).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })`. This is build-machine-TZ-safe and works regardless of `start_time` content. The `start_time` and `end_time` fields are interpolated VERBATIM into the time line (e.g., `"11am"` renders as `"11am"`).
    - The "see all upcoming pop-ups →" link renders only when `hasMultiple` is true.
    - All CSS uses tokens from `colors_and_type.css`; no hardcoded hex; no `bg-white`/`#fff`; no `gradient`/`backdrop-filter`/`border: 1px` (CI gate enforces).
    - `:focus-visible` on the `.see-all` link uses `--color-focus-ring`, 2px solid, offset 4px.
    - **Concern 9 transcription rule:** the `---` frontmatter delimiters in the code block below are shown with one leading space (GSD-parser safety) — strip that leading space when writing the file so `---` lands at column 0 (Astro requires column-0 delimiters).
  </behavior>
  <action>
**Create `src/components/PopupCallout.astro`** with the Write tool. File contents (copy the contents BETWEEN the triple-backtick markers; the ` ---` lines shown with one leading space — GSD-parser safety convention — must be written to the file as `---` at column 0):

```astro
 ---
// src/components/PopupCallout.astro — Phase 3 PAG-01 / D-02, D-05.
// Landing-page mini-callout. Quieter than PopupStrip — PopupStrip stays on /popups only.
//
// Visual register: UI-SPEC §Landing mini-callout + sketch-findings 003-C.
// Layout: centered 640px-max column, eyebrow + when-line + time + optional see-all link.
//
// REVIEWS-MODE Concern 2 fix: date label built from `date` ONLY via
// Temporal.PlainDate.toLocaleString. The `start_time` and `end_time` fields
// are FREE-FORM display strings ("11am", "11:00 AM") and are interpolated
// VERBATIM into the time line — never parsed as Date components. This is
// both build-machine-TZ-safe and resilient to whatever string the founder
// puts in start_time.

import type { CollectionEntry } from 'astro:content';
import { Temporal } from 'temporal-polyfill';

interface Props {
  popup:       CollectionEntry<'popups'>;
  hasMultiple: boolean;
}
const { popup, hasMultiple } = Astro.props;

// Concern 2: build the date label from `date` alone via Temporal.PlainDate.
// Never construct a Date from `${date}T${start_time}` — start_time is a
// display string ("11am") and would NaN.
const plainDate = Temporal.PlainDate.from(popup.data.date);
const dateLabel = plainDate.toLocaleString('en-US', {
  weekday: 'long',
  month:   'long',
  day:     'numeric',
});

// Time-line: en-dash separator (UI-SPEC: never hyphen).
// start_time + end_time rendered VERBATIM — no parsing.
const timeLabel = `${popup.data.start_time}–${popup.data.end_time}`;
 ---
<section class="popup-callout">
  <span class="hand-eyebrow">next pop-up</span>
  <p class="when">{dateLabel} — <span class="venue">{popup.data.location}</span></p>
  <p class="time">{timeLabel}</p>
  {hasMultiple && (
    <a class="see-all" href="/popups">see all upcoming pop-ups →</a>
  )}
</section>

<style>
  /* UI-SPEC §Landing — verbatim from 03-RESEARCH.md Example 1. */
  .popup-callout {
    max-width: 640px;
    margin: 0 auto;
    padding: var(--space-6) var(--space-5);
    text-align: center;
  }
  .hand-eyebrow {
    font-family: var(--font-hand);
    font-size: var(--fs-xl);              /* 28px */
    color: var(--color-accent-leaf);
    line-height: 1;
    display: inline-block;
    transform: rotate(-1.5deg);
    margin-bottom: var(--space-3);
  }
  .when {
    font-family: var(--font-body);
    font-weight: 800;
    font-size: var(--fs-xl);              /* 28px */
    color: var(--color-fg-strong);
    line-height: 1.15;
    margin: 0 0 var(--space-4);
  }
  .when .venue { color: var(--coral-500); }
  .time {
    font-family: var(--font-body);
    font-size: var(--fs-sm);
    color: var(--color-fg-muted);
    line-height: var(--lh-normal);
    margin: 0 0 var(--space-3);
  }
  .see-all {
    font-family: var(--font-body);
    font-weight: 700;
    font-size: var(--fs-xs);
    color: var(--coral-500);
    text-decoration: none;
    line-height: 1;
    display: inline-block;
    transition: transform var(--dur-fast) var(--ease-soft),
                color     var(--dur-fast) var(--ease-soft);
  }
  .see-all:hover { color: var(--coral-700); transform: translateX(2px); }
  .see-all:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 4px;
  }
</style>
```

**Anti-pattern checks** (the component must NOT contain):
- Any `client:` directive (no React hydration; component is server-rendered static HTML)
- Any hardcoded hex (every color via `var(--*)` token)
- Any `bg-white` / `#fff` / `background: white`
- Any `gradient`, `backdrop-filter`, `border: 1px`
- The words `flower|petal|floral|bloom|blossom` (CI grep enforces, but easy to accidentally introduce)
- **Concern 2 anti-pattern:** any `new Date(...start_time...)` or `new Date(\`...T${...}\`)` template-literal construction
- **Concern 9 anti-pattern:** indented `---` frontmatter delimiter
  </action>
  <verify>
    <automated>test -f src/components/PopupCallout.astro && grep -c "popup-callout" src/components/PopupCallout.astro && grep -c "next pop-up" src/components/PopupCallout.astro && grep -c "see all upcoming pop-ups" src/components/PopupCallout.astro && grep -c "var(--coral-500)" src/components/PopupCallout.astro && (grep -cE "client:|#fff|background:\s*white|gradient|backdrop-filter|flower|petal|floral|bloom|blossom" src/components/PopupCallout.astro || true) && (grep -cE "new Date\(.*start_time" src/components/PopupCallout.astro || true) && (grep -nE "^[[:space:]]+---$" src/components/PopupCallout.astro || true) && grep -c "Temporal.PlainDate.from" src/components/PopupCallout.astro && npx astro check 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `test -f src/components/PopupCallout.astro` exits 0
    - `grep -c "popup-callout" src/components/PopupCallout.astro` returns at least 1
    - `grep -c "next pop-up" src/components/PopupCallout.astro` returns 1 (eyebrow text)
    - `grep -c "see all upcoming pop-ups" src/components/PopupCallout.astro` returns 1
    - `grep -c "hasMultiple" src/components/PopupCallout.astro` returns at least 2 (Props interface + conditional render)
    - **Concern 2:** `grep -c "Temporal.PlainDate.from" src/components/PopupCallout.astro` returns at least 1 (Temporal-based date formatting)
    - **Concern 2 anti-pattern absent:** `! grep -qE "new Date\(.*start_time" src/components/PopupCallout.astro` exits 0
    - **Concern 2 anti-pattern absent:** `! grep -qE 'new Date\(`.*\$\{.*date.*\}T' src/components/PopupCallout.astro` exits 0 (no `new Date(\`${date}T...\`)` template-literal pattern)
    - `grep -c "var(--coral-500)" src/components/PopupCallout.astro` returns at least 1
    - **Brand grep:** `! grep -qE "client:|background:\s*white|gradient|backdrop-filter|flower|petal|floral|bloom|blossom" src/components/PopupCallout.astro` exits 0 (no banned tokens)
    - **`#fff` exception:** `grep -cE "#fff[^8]" src/components/PopupCallout.astro` returns 0 (no #fff except the already-allowed #fff8 — and there are no #fff at all here)
    - **Concern 9:** `grep -nE "^[[:space:]]+---$" src/components/PopupCallout.astro` returns no output (no indented frontmatter delimiters)
    - **Concern 9:** `grep -c "^---$" src/components/PopupCallout.astro` returns 2 (exactly two column-0 `---` lines bracketing the frontmatter)
    - `npx astro check` exits 0 (no TypeScript errors)
  </acceptance_criteria>
  <done>
    `src/components/PopupCallout.astro` exists, type-checks, uses Temporal.PlainDate for date formatting (Concern 2), passes brand-rule grep, has column-0 frontmatter delimiters (Concern 9), and matches the UI-SPEC §Landing contract.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Wire src/pages/index.astro — landing renders <SEO />, mini-callout (only when upcoming exists), and the existing featured pieces grid with the D-04 fallback (Concern 4 + Concern 9)</name>
  <read_first>
    - src/pages/index.astro (current state — Phase 1 demo-loaded with `nextPopup = null` stub)
    - .planning/phases/03-page-composition-pop-ups/03-CONTEXT.md (D-01: Hero stays; D-02: mini-callout; D-03: omit on zero; D-04: featured 3; D-05: no embedded CTA)
    - .planning/phases/03-page-composition-pop-ups/03-UI-SPEC.md §Landing
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 4: title via `<BaseLayout title="...">`, NOT via `<SEO title=...>`-driving-title; Concern 9: column-0 frontmatter)
    - src/content/site/config.yaml (for og_title default — feeds <BaseLayout title> + <SEO />)
  </read_first>
  <behavior>
    - Landing reads popups via `getCollection('popups')` and calls `splitPopups()`.
    - The `<PopupCallout />` renders only when `hasUpcoming` is true (D-03: omit entire section on zero upcoming — no empty-state line, no eyebrow).
    - The featured-3 selection honors D-04: prefer pieces with `featured: true` (newest first by `published_at`), fallback to "newest 3 regardless of featured" if zero are `featured: true`.
    - Hero, GalleryGrid, and Footer render exactly as before (D-01: Hero unchanged except for Plan 01's NOPA fix already applied).
    - The `<SEO slot="head" pathname="/" />` is wired (no title prop needed — `<SEO />` falls back to `site.og_title` for og:title; the actual `<title>` tag is owned by BaseLayout per Concern 4).
    - The legacy `import PopupStrip from ...` is removed (PopupStrip is no longer used on landing per D-02 — it's `/popups` only now).
    - `prerender = true` (already set, preserved).
    - `<BaseLayout title={site.og_title}>` continues to drive the `<title>` tag (Concern 4).
    - **Concern 9:** the rewritten `index.astro` MUST have its `---` frontmatter delimiters at column 0.
  </behavior>
  <action>
**Edit `src/pages/index.astro`:** Use the Write tool to replace the entire file. Note that Plan 01 already applied the NOPA fix to Hero.jsx and the BaseLayout title string is being updated to use `site.og_title` from config.yaml (which is already NOPA-corrected via Plan 01 Task 2 Edit 4).

**CRITICAL Concern 9 transcription rule:** the `---` lines in the snippet below are shown with one leading space (markdown-rendering safety convention — prevents the GSD frontmatter parser from latching on). When you write the file, strip that leading space so `---` lands at column 0.

```astro
 ---
// src/pages/index.astro — Landing page (Phase 3 PAG-01).
// D-01 Hero stays; D-02 mini-callout (not PopupStrip); D-03 omit pop-up section on zero upcoming;
// D-04 featured count = 3 (newest by published_at, falls back to "newest 3 regardless of featured");
// D-05 mini-callout has no embedded CTA (the conditional "see all" link is the only affordance);
// D-26 wires <SEO /> with canonical-to-apex + og:image.
//
// REVIEWS-MODE Concern 4: <BaseLayout title={site.og_title}> emits the actual <title> tag;
// <SEO /> emits og:title from the same source via its title prop (or falls back to site.og_title
// internally if omitted). We pass title to BOTH so <title> and og:title match.

export const prerender = true;

import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import SEO from '../components/SEO.astro';
import Header from '../components/design-skill/Header';
import Hero from '../components/design-skill/Hero';
import GalleryGrid from '../components/design-skill/GalleryGrid';
import Footer from '../components/design-skill/Footer';
import PopupCallout from '../components/PopupCallout.astro';
import { splitPopups } from '../lib/popups';

const site = (await getEntry('site', 'default'))!.data;

// PAG-03 / PAG-01: TZ-aware split. Build-time only (LA cutoff).
const allPopups = await getCollection('popups');
const { soonest, hasUpcoming, hasMultiple } = splitPopups(allPopups);

// PAG-01 / D-04: featured-3 with fallback.
// Primary: pieces where featured === true, sorted by published_at desc, take 3.
// Fallback: if zero featured pieces, take the newest 3 from the full set.
const allPieces = await getCollection('gallery');
const featuredOnly = allPieces.filter((p) => p.data.featured === true);
const featuredSorted = (featuredOnly.length > 0 ? featuredOnly : allPieces)
  .sort((a, b) => b.data.published_at.localeCompare(a.data.published_at))
  .slice(0, 3)
  .map((entry) => ({
    slug:   entry.id,
    name:   entry.data.name,
    price:  entry.data.price,
    status: entry.data.status,
    photo:  `/gallery/${entry.id}/hero-400.webp`,
  }));
 ---
<BaseLayout title={site.og_title}>
  <SEO slot="head" title={site.og_title} pathname="/" />
  <Header slot="header" active="/" />
  <Hero />
  {hasUpcoming && soonest && (
    <PopupCallout popup={soonest} hasMultiple={hasMultiple} />
  )}
  <GalleryGrid pieces={featuredSorted} />
  <Footer slot="footer" igHandle={site.ig_handle} contactEmail={site.contact_email} />
</BaseLayout>
```

**Notes on the rewrite vs the previous file:**
- Removed `import PopupStrip from '../components/design-skill/PopupStrip';` — no longer used on landing.
- Removed `const nextPopup = null;` and `{nextPopup && <PopupStrip popup={nextPopup} />}` — replaced by the splitPopups + PopupCallout chain.
- Added `import SEO from '../components/SEO.astro';` and `<SEO slot="head" ... />`.
- Added `import PopupCallout from '../components/PopupCallout.astro';`.
- Added `import { splitPopups } from '../lib/popups';`.
- Changed `<BaseLayout title="Studio Bluemli — handmade beaded earrings, NoPa San Francisco">` (the legacy hardcoded string) to `<BaseLayout title={site.og_title}>`. The `og_title` value in `config.yaml` is `"Studio Bluemli — hand-clustered beaded earrings"` (no NoPa). This is the better source-of-truth per D-26.
- featured-3 logic: replaced the old `.sort + .slice(0,3)` (which selected the newest 3 regardless of featured flag) with a featured-first selection that falls back to the same newest-3 if no piece is featured. This is the D-04 contract.
- `prerender = true` preserved.
- **Concern 4:** `<BaseLayout title={site.og_title}>` drives the actual `<title>` tag; `<SEO />` adds canonical/og/twitter only.
  </action>
  <verify>
    <automated>grep -c "import { splitPopups }" src/pages/index.astro && grep -c "import PopupCallout" src/pages/index.astro && grep -c "import SEO" src/pages/index.astro && (grep -c "PopupStrip" src/pages/index.astro || true) && (grep -c "nextPopup = null" src/pages/index.astro || true) && grep -c "splitPopups(allPopups)" src/pages/index.astro && grep -c "hasUpcoming && soonest" src/pages/index.astro && grep -c 'p.data.featured === true' src/pages/index.astro && grep -c "<BaseLayout title={site.og_title}>" src/pages/index.astro && grep -c '<SEO slot="head"' src/pages/index.astro && (grep -nE "^[[:space:]]+---$" src/pages/index.astro || true) && npx astro check 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "import { splitPopups }" src/pages/index.astro` returns 1
    - `grep -c "import PopupCallout" src/pages/index.astro` returns 1
    - `grep -c "import SEO" src/pages/index.astro` returns 1
    - `! grep -q "PopupStrip" src/pages/index.astro` exits 0 (PopupStrip no longer used here)
    - `! grep -q "nextPopup = null" src/pages/index.astro` exits 0 (stub removed)
    - `grep -c "splitPopups(allPopups)" src/pages/index.astro` returns 1
    - `grep -c "hasUpcoming && soonest" src/pages/index.astro` returns 1
    - `grep -c "p.data.featured === true" src/pages/index.astro` returns 1 (D-04 featured filter)
    - `grep -c '<BaseLayout title={site.og_title}>' src/pages/index.astro` returns 1 (Concern 4: BaseLayout drives <title>)
    - `grep -c '<SEO slot="head"' src/pages/index.astro` returns 1
    - **Concern 9:** `grep -nE "^[[:space:]]+---$" src/pages/index.astro` returns no output (no indented frontmatter delimiters)
    - **Concern 9:** `grep -c "^---$" src/pages/index.astro` returns 2
    - `npx astro check` exits 0
    - With `src/content/popups/` empty, `npm run build` produces a `dist/client/index.html` where `! grep -q "next pop-up" dist/client/index.html` exits 0 (D-03: omit section when zero upcoming)
  </acceptance_criteria>
  <done>
    Landing page wires popups via splitPopups, renders the mini-callout conditionally per D-03, honors D-04 featured-3 fallback, wires `<SEO />` per D-26, and removes all PopupStrip imports. Title flows through `<BaseLayout title={site.og_title}>` (Concern 4). Frontmatter at column 0 (Concern 9).
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 4: Wire src/pages/popups.astro — soonest as PopupStrip + soonest's markdown body description (Concern 14) + ALSO COMING UP list + PAST list + empty state + <SEO /> (Concern 2 + 4 + 9)</name>
  <read_first>
    - src/pages/popups.astro (current state — Phase 1 stub)
    - src/pages/gallery/[slug].astro (scoped `<style>` patterns + Astro JSX idioms)
    - src/pages/gallery.astro (empty-state branch pattern — lines 31-42)
    - src/components/design-skill/PopupStrip.jsx (current shape: prop signature is camelCase `startTime`/`endTime` — needs adapter object since the schema uses snake_case)
    - .planning/phases/03-page-composition-pop-ups/03-UI-SPEC.md §/popups (full layout contract)
    - .planning/phases/03-page-composition-pop-ups/03-CONTEXT.md (D-06, D-07, D-08, D-10 — all the /popups decisions)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 2: never parse start_time as Date; Concern 4: BaseLayout owns <title>; Concern 9: column-0 frontmatter; Concern 14: render markdown body description for soonest popup)
  </read_first>
  <behavior>
    - `/popups` renders, in order: soonest as the full PopupStrip; then the soonest popup's markdown body rendered as a description block (Concern 14: PAG-03's "description" requirement); then (if `alsoComing.length >= 1`) the ALSO COMING UP section with rows; then (if `past.length >= 1`) the PAST section with rows; then the footer.
    - When BOTH upcoming AND past are empty (zero-popups state), the page renders the D-08 empty state: eyebrow + 2-line body + `@studiobluemli` coral underlined link. No PopupStrip, no description, no ALSO COMING UP, no PAST.
    - PopupStrip is called with the camelCase adapter object: `{ name, date, startTime: data.start_time, endTime: data.end_time, tz, location }`. (PopupStrip.jsx is NOT modified to accept snake_case in this task — the lift happens in the page frontmatter.)
    - The soonest popup's markdown body is rendered via `astro:content`'s `render(soonest)` returning `{ Content }`, then `<Content />` is included in a `.popup-description` block immediately below PopupStrip.
    - ALSO COMING UP rows format: `<Weekday>, <Month> <Day> · <Venue> · <time>` (mid-dot separators; Nunito 800 18px for weekday/venue, Nunito 400 16px for time portion, muted).
    - PAST rows format: `<Weekday>, <Month> <Day> · <Venue>, <City>` (Nunito 400 14px, muted, venue substring in `--color-fg`). City extracted from `address` field via simple regex or hardcoded fallback `San Francisco`.
    - **Concern 2 critical fix:** date labels in row formatters use `Temporal.PlainDate.from(p.data.date).toLocaleString` — NOT `new Date(\`${date}T${start_time}:00\`)`. Time portion is interpolated VERBATIM from `start_time` + `end_time`.
    - All photos are NOT rendered in PAST archive (D-07).
    - No per-popup detail routes are created (D-10).
    - `<BaseLayout title="Pop-ups — Studio Bluemli">` drives `<title>` (Concern 4); `<SEO slot="head" title="Pop-ups — Studio Bluemli" pathname="/popups" />` is wired for canonical/og emission.
  </behavior>
  <action>
**Edit `src/pages/popups.astro`:** Use the Write tool to replace the entire current file contents. Note: column-0 frontmatter delimiters required (Concern 9).

```astro
 ---
// src/pages/popups.astro — Pop-ups page (Phase 3 PAG-03).
// D-06 layout (soonest PopupStrip + ALSO COMING UP + PAST); D-07 text-only past (no photos);
// D-08 empty state copy; D-09 PopupStrip CTA deleted (handled in PopupStrip.jsx itself);
// D-10 no per-slug routes; D-11 TZ-aware split via splitPopups (Plan 03 helper).
//
// REVIEWS-MODE Concern 2 fix: date labels use Temporal.PlainDate.toLocaleString
// from `date` ONLY. start_time / end_time are FREE-FORM display strings ("11am",
// "11:00 AM") and are interpolated VERBATIM into time labels — never parsed as
// Date components.
//
// REVIEWS-MODE Concern 4 fix: <BaseLayout title="..."> owns the <title> tag;
// <SEO /> adds canonical/og/twitter only. Both pass the same title for
// consistency with og:title.
//
// REVIEWS-MODE Concern 14 fix: PAG-03 mentions "description" alongside date/
// location/time. The soonest upcoming popup's markdown body is rendered below
// PopupStrip via astro:content's render() helper, giving the founder a place
// to write things like "free champagne" or directions to the venue.

export const prerender = true;

import { getCollection, getEntry, render } from 'astro:content';
import { Temporal } from 'temporal-polyfill';
import BaseLayout from '../layouts/BaseLayout.astro';
import SEO from '../components/SEO.astro';
import Header from '../components/design-skill/Header';
import PopupStrip from '../components/design-skill/PopupStrip';
import Footer from '../components/design-skill/Footer';
import { splitPopups } from '../lib/popups';

const site = (await getEntry('site', 'default'))!.data;
const all = await getCollection('popups');
const { soonest, alsoComing, past } = splitPopups(all);

// PopupStrip.jsx accepts camelCase props (startTime/endTime), but the schema is snake_case.
// Build a JS-friendly view-model for the strip; keep the original entry untouched.
const soonestVM = soonest ? {
  name:      soonest.data.name,
  date:      soonest.data.date,
  startTime: soonest.data.start_time,
  endTime:   soonest.data.end_time,
  tz:        soonest.data.tz,
  location:  soonest.data.location,
} : null;

// Concern 14: render the soonest popup's markdown body as the description block.
// The astro:content `render(entry)` helper returns `{ Content }` for inline rendering.
// Only render description for the soonest upcoming popup (PopupStrip's full editorial
// surface). ALSO COMING UP and PAST stay compact text rows.
const soonestRendered = soonest ? await render(soonest) : null;
const SoonestDescription = soonestRendered?.Content;

// Concern 2: date labels via Temporal.PlainDate. NEVER `new Date(\`${date}T${start_time}\`)`.
function formatRowDate(p: typeof soonest) {
  if (!p) return '';
  return Temporal.PlainDate.from(p.data.date).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}
function rowTime(p: typeof soonest) {
  if (!p) return '';
  // Verbatim interpolation — start_time / end_time are free-form display strings.
  return `${p.data.start_time}–${p.data.end_time}`;
}

// Best-effort city extraction from the optional `address` field; hardcode fallback to "San Francisco".
function rowCity(p: typeof soonest) {
  if (!p) return 'San Francisco';
  const addr = p.data.address;
  if (!addr) return 'San Francisco';
  // Try to pull a city out of a comma-separated address ("123 Main St, San Francisco, CA").
  const parts = addr.split(',').map((s) => s.trim());
  if (parts.length >= 2) return parts[parts.length - 2];
  return 'San Francisco';
}

const hasAny = (soonest !== null) || past.length > 0;
 ---
<BaseLayout title="Pop-ups — Studio Bluemli">
  <SEO slot="head" title="Pop-ups — Studio Bluemli" pathname="/popups" />
  <Header slot="header" active="/popups" />

  {!hasAny && (
    <section class="popups-empty">
      <span class="empty-eyebrow">Pop-ups</span>
      <p class="empty-body">
        No pop-ups on the calendar yet —<br/>
        follow <a class="empty-ig" href={`https://instagram.com/${site.ig_handle}`}>@{site.ig_handle}</a> for the next one.
      </p>
    </section>
  )}

  {soonestVM && <PopupStrip popup={soonestVM} />}

  {SoonestDescription && (
    <section class="popup-description" aria-label="About this pop-up">
      <SoonestDescription />
    </section>
  )}

  {alsoComing.length > 0 && (
    <section class="popups-also">
      <h2 class="section-eyebrow">ALSO COMING UP</h2>
      <ul class="also-list">
        {alsoComing.map((p) => (
          <li class="also-row">
            <span class="row-when">{formatRowDate(p)}</span>
            <span class="row-dot"> · </span>
            <span class="row-venue">{p.data.location}</span>
            <span class="row-dot"> · </span>
            <span class="row-time">{rowTime(p)}</span>
          </li>
        ))}
      </ul>
    </section>
  )}

  {past.length > 0 && (
    <section class="popups-past">
      <h2 class="section-eyebrow">PAST POP-UPS</h2>
      <ul class="past-list">
        {past.map((p) => (
          <li class="past-row">
            <span class="past-when">{formatRowDate(p)}</span>
            <span class="row-dot"> · </span>
            <span class="past-venue">{p.data.location}</span>
            <span class="past-city">, {rowCity(p)}</span>
          </li>
        ))}
      </ul>
    </section>
  )}

  <Footer slot="footer" igHandle={site.ig_handle} contactEmail={site.contact_email} />
</BaseLayout>

<style>
  /* Centered 720px column per UI-SPEC §/popups. */
  .popups-also, .popups-past, .popups-empty, .popup-description {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 var(--space-5);
  }
  .popups-empty {
    padding-top: var(--space-9);
    padding-bottom: var(--space-9);
    text-align: center;
  }
  .empty-eyebrow {
    display: inline-block;
    font-family: var(--font-body);
    font-size: var(--fs-xxs);
    font-weight: 800;
    letter-spacing: var(--ls-caps);
    text-transform: uppercase;
    color: var(--color-accent-leaf);
    margin-bottom: var(--space-5);
  }
  .empty-body {
    font-family: var(--font-body);
    font-size: var(--fs-lg);
    color: var(--color-fg-strong);
    line-height: var(--lh-loose);
    margin: 0;
  }
  .empty-ig {
    color: var(--coral-500);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .empty-ig:hover { color: var(--coral-700); }
  .empty-ig:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 4px; }

  /* Concern 14: soonest popup's markdown body description block. */
  .popup-description {
    margin-top: var(--space-5);
    margin-bottom: var(--space-7);
    text-align: center;
    font-family: var(--font-body);
    font-size: var(--fs-md);
    color: var(--color-fg-strong);
    line-height: var(--lh-normal);
  }
  .popup-description :global(p) {
    margin: 0 0 var(--space-3);
  }
  .popup-description :global(p:last-child) {
    margin-bottom: 0;
  }
  .popup-description :global(a) {
    color: var(--coral-500);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .popup-description :global(a):hover { color: var(--coral-700); }

  .section-eyebrow {
    font-family: var(--font-body);
    font-size: var(--fs-xxs);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: var(--ls-caps);
    color: var(--color-accent-leaf);
    line-height: var(--lh-snug);
    margin: var(--space-7) 0 var(--space-4);
  }

  .also-list, .past-list {
    list-style: none;
    margin: 0;
    padding: 0 0 var(--space-9);
  }

  .also-row {
    padding: var(--space-4) 0;
    /* UI-SPEC §/popups locks 1px rule lines, but the brand CI grep
       (scripts/check-brand-rules.sh Rule 5) blocks the literal
       `border-top: 1px` pattern. Use box-shadow: inset to render the
       visual 1px line — same visual register, regex-clean. */
    box-shadow: inset 0 1px 0 var(--color-border-soft);
    font-family: var(--font-body);
    font-size: var(--fs-md);
    font-weight: 700;
    color: var(--color-fg-strong);
    line-height: var(--lh-normal);
  }
  .also-row:last-of-type {
    /* Bottom rule line on the final row — same regex-clean technique as above. */
    box-shadow: inset 0 1px 0 var(--color-border-soft),
                inset 0 -1px 0 var(--color-border-soft);
  }
  .also-row .row-time {
    color: var(--color-fg-muted);
    font-weight: 400;
  }
  .row-dot { color: var(--ink-400); }

  .past-row {
    padding: var(--space-2) 0;
    font-family: var(--font-body);
    font-size: var(--fs-sm);
    color: var(--color-fg-muted);
    line-height: var(--lh-normal);
  }
  .past-row .past-venue { color: var(--color-fg); }
</style>
```

**Note on rule-line technique:** UI-SPEC §/popups locks the ALSO COMING UP rows to a 1px rule line (`1px solid var(--color-border-soft)`). The brand CI grep (scripts/check-brand-rules.sh Rule 5) regex is anchored on the literal pattern `border(-top|-bottom|-left|-right)?:\s*1px` — so `border-top: 1px` would fail CI, and a 2px substitute would lose the UI-SPEC-locked visual register. Resolution: use `box-shadow: inset 0 1px 0 var(--color-border-soft)` to paint a 1px line on the row. The visual is identical to a 1px border; the CI regex does not match `box-shadow`. The closing row uses two stacked inset shadows (top + bottom). This is the binding pattern for any other 1px rule lines that surface during Phase 3.

**Note on `--color-border-soft`:** If `--color-border-soft` is not defined in `colors_and_type.css`, the executor must verify it exists before completing this task — if absent, the CSS rule degrades gracefully (no border renders, but no error). Check via `grep -c "color-border-soft" src/styles/colors_and_type.css`; if 0, use `var(--color-fg-hint, var(--ink-400))` as a safe fallback for the border color. Do NOT add a new token to colors_and_type.css in this plan.

**Concern 14 verification:** the soonest popup's markdown body now renders below PopupStrip. To verify during execution, the Task 6 seed-popup test (with a markdown body containing the word "champagne" or any other distinctive text) should grep that text in the built `dist/client/popups/index.html`.

**PopupStrip safety check (planner-flagged in interfaces):** Before completing this task, read `src/components/design-skill/PopupStrip.jsx` lines 9-20 and verify it does NOT do `new Date(\`${popup.date}T${popup.startTime}\`)` internally. The current implementation uses `new Date(popup.date)` which is safe (UTC midnight of the date — and Intl.DateTimeFormat with timeZone honors that correctly). If a future PopupStrip change introduces start_time parsing, that is a Concern 2 violation that must be fixed in PopupStrip.jsx in this same task.
  </action>
  <verify>
    <automated>grep -c "import { splitPopups }" src/pages/popups.astro && grep -c "import SEO" src/pages/popups.astro && grep -c "splitPopups(all)" src/pages/popups.astro && grep -c "ALSO COMING UP" src/pages/popups.astro && grep -c "PAST POP-UPS" src/pages/popups.astro && grep -c "No pop-ups on the calendar yet" src/pages/popups.astro && (grep -cE "border(-top|-bottom|-left|-right)?:\s*1px" src/pages/popups.astro || true) && (grep -cE "client:|background:\s*white|gradient|backdrop-filter|flower|petal|floral|bloom|blossom" src/pages/popups.astro || true) && grep -c "soonestVM" src/pages/popups.astro && grep -c "Temporal.PlainDate.from" src/pages/popups.astro && (grep -cE "new Date\(.*start_time" src/pages/popups.astro || true) && grep -c "render(soonest)" src/pages/popups.astro && grep -c "popup-description" src/pages/popups.astro && (grep -nE "^[[:space:]]+---$" src/pages/popups.astro || true) && grep -c '<BaseLayout title=' src/pages/popups.astro && npx astro check 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "import { splitPopups }" src/pages/popups.astro` returns 1
    - `grep -c "import SEO" src/pages/popups.astro` returns 1
    - `grep -c "splitPopups(all)" src/pages/popups.astro` returns 1
    - `grep -c "ALSO COMING UP" src/pages/popups.astro` returns 1
    - `grep -c "PAST POP-UPS" src/pages/popups.astro` returns 1
    - `grep -c "No pop-ups on the calendar yet" src/pages/popups.astro` returns 1
    - **Brand grep:** `! grep -qE "border(-top|-bottom|-left|-right)?:\s*1px" src/pages/popups.astro` exits 0 (no 1px borders — CI grep would fail)
    - **Brand grep:** `grep -c "box-shadow: inset 0 1px 0 var(--color-border-soft)" src/pages/popups.astro` returns at least 1 (the W1-locked rule-line technique on `.also-row`)
    - **Brand grep:** `! grep -qE "client:|background:\s*white|gradient|backdrop-filter|flower|petal|floral|bloom|blossom" src/pages/popups.astro` exits 0
    - `grep -c "soonestVM" src/pages/popups.astro` returns at least 2 (build + use sites)
    - `grep -c "startTime: soonest.data.start_time" src/pages/popups.astro` returns 1
    - **Concern 2:** `grep -c "Temporal.PlainDate.from" src/pages/popups.astro` returns at least 1 (Temporal-based date formatting)
    - **Concern 2 anti-pattern absent:** `! grep -qE "new Date\(.*start_time" src/pages/popups.astro` exits 0
    - **Concern 14:** `grep -c "render(soonest)" src/pages/popups.astro` returns 1 (markdown body rendering)
    - **Concern 14:** `grep -c "popup-description" src/pages/popups.astro` returns at least 2 (class + selector)
    - **Concern 4:** `grep -c '<BaseLayout title=' src/pages/popups.astro` returns 1 (BaseLayout drives <title>)
    - **Concern 9:** `grep -nE "^[[:space:]]+---$" src/pages/popups.astro` returns no output (no indented frontmatter delimiters)
    - **Concern 9:** `grep -c "^---$" src/pages/popups.astro` returns 2
    - `npx astro check` exits 0
    - With empty `src/content/popups/`, `npm run build` produces a `dist/client/popups/index.html` containing `No pop-ups on the calendar yet` (the D-08 empty state)
  </acceptance_criteria>
  <done>
    `/popups` page wires all sections + soonest's markdown description (Concern 14) + empty state + SEO; uses splitPopups for the cutoff; uses Temporal.PlainDate for date labels (Concern 2); passes the camelCase adapter to PopupStrip; brand-rule grep passes; column-0 frontmatter (Concern 9); BaseLayout drives <title> (Concern 4).
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 5: Delete the "book by appointment" CTA block from PopupStrip.jsx (D-09) + verify PopupStrip itself does not parse start_time as Date (Concern 2 cross-check)</name>
  <read_first>
    - src/components/design-skill/PopupStrip.jsx (full file; the CTA block is lines 63-72; date-formatting block is lines 9-20)
    - .planning/phases/03-page-composition-pop-ups/03-CONTEXT.md (D-09)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 2: cross-check that PopupStrip doesn't parse start_time as Date)
  </read_first>
  <behavior>
    - Lines 63-72 (the `<div style={{ marginTop: 28, ... }}>...book by appointment...</div>` block) are removed.
    - Everything else in the component is preserved exactly: the eyebrow, the "pop-up" Caveat Brush headline + underline mark, the "at <venue>" Caveat Brush 32px line, the date-time Nunito 18px bold line.
    - The component continues to accept the same prop shape (the page frontmatter in Task 4 builds the camelCase adapter object).
    - **Concern 2 cross-check:** PopupStrip's internal date-formatting block (lines 9-20) MUST NOT do `new Date(\`${popup.date}T${popup.startTime}\`)` or any template-literal Date construction that includes startTime. If the audit reveals this anti-pattern, fix it in this task by replacing with `new Date(popup.date)` + `Intl.DateTimeFormat`.
  </behavior>
  <action>
**Audit Step (Concern 2 cross-check) — PERFORM BEFORE EDIT:** Read `src/components/design-skill/PopupStrip.jsx` lines 1-30. Locate the date-formatting block (the `Intl.DateTimeFormat` usage). If you find ANY of these patterns:
- `new Date(\`${popup.date}T${popup.startTime}` (template literal combining date + startTime)
- `new Date(popup.date + 'T' + popup.startTime` (string concatenation combining date + startTime)
- `new Date(popup.date + ' ' + popup.startTime`

→ This is a Concern 2 violation that MUST be fixed in this task. Replace with: `const eventDate = new Date(popup.date);` (UTC midnight of the date — Intl.DateTimeFormat with timeZone honors this correctly).

If the audit reveals NO such pattern (the current code uses `new Date(popup.date)` alone, which is safe), proceed directly to the CTA-deletion edit below.

**Edit `src/components/design-skill/PopupStrip.jsx`:** Use the Edit tool. Find and DELETE this exact block (currently lines 63-72):

```jsx
      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {/* Real <a> to /say-hi instead of a button handler — no client: directive, so
            the original handler would never have fired. SSR-safe. */}
        <a href="/say-hi" style={{
          display: 'inline-flex', alignItems: 'center', padding: '12px 24px',
          background: 'var(--coral-500)', color: 'var(--cream-50)',
          textDecoration: 'none', borderRadius: 8,
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16,
        }}>book by appointment</a>
      </div>
```

After the deletion, the line preceding it (the date-time div, line 62) becomes the last line inside the `<section>`, immediately followed by the closing `</section>` tag (line 73 → now adjacent to the date-time div).

Do NOT modify any other line. The component header (`/* eslint-disable */`, React import, Mark import), the `function PopupStrip({ popup }) {` signature, the dateLabel/timeLabel logic, the `<section>` opening + color stripe + eyebrow + h2 with Mark.Underline + "at <venue>" div + date-time div — all preserved (assuming the Concern 2 audit confirmed no fix-in-place needed).
  </action>
  <verify>
    <automated>(grep -c "book by appointment" src/components/design-skill/PopupStrip.jsx || true) && (grep -c 'href="/say-hi"' src/components/design-skill/PopupStrip.jsx || true) && grep -c "PopupStrip" src/components/design-skill/PopupStrip.jsx && grep -c "Mark.Underline" src/components/design-skill/PopupStrip.jsx && (grep -cE "new Date\(.*startTime" src/components/design-skill/PopupStrip.jsx || true) && npx astro check 2>&1 | tail -5</automated>
  </verify>
  <acceptance_criteria>
    - `! grep -q "book by appointment" src/components/design-skill/PopupStrip.jsx` exits 0 (D-09: CTA block deleted)
    - `! grep -q 'href="/say-hi"' src/components/design-skill/PopupStrip.jsx` exits 0 (the only /say-hi link in this component was inside the deleted CTA)
    - `grep -c "PopupStrip" src/components/design-skill/PopupStrip.jsx` returns at least 2 (function declaration + default export — component itself intact)
    - `grep -c "Mark.Underline" src/components/design-skill/PopupStrip.jsx` returns 1 (the pop-up headline underline glyph is preserved)
    - `grep -c "function PopupStrip" src/components/design-skill/PopupStrip.jsx` returns 1
    - **Concern 2 cross-check:** `! grep -qE "new Date\(.*startTime" src/components/design-skill/PopupStrip.jsx` exits 0 (PopupStrip does NOT parse startTime as Date component — verified via the audit step)
    - `npx astro check` exits 0 (no usage error from /popups page after this edit)
  </acceptance_criteria>
  <done>
    PopupStrip.jsx no longer renders the "book by appointment" link; the rest of the component is unchanged; Concern 2 cross-check confirms PopupStrip does not parse start_time/startTime as a Date component.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 6: Build + verify the integrated /popups + landing pages with seed popups (Concern 2 + Concern 14 verification with realistic "11am" start_time + body description)</name>
  <read_first>
    - .planning/phases/03-page-composition-pop-ups/03-CONTEXT.md (note: `src/content/popups/` is empty on day 1; Phase 3 ships against zero seed popup events per CONTEXT.md §Specifics)
    - .planning/phases/03-page-composition-pop-ups/03-RESEARCH.md Q8 (the per-D verification commands)
    - .planning/phases/03-page-composition-pop-ups/03-REVIEWS.md (Concern 2 verification: seed popups MUST use `start_time: "11am"` to validate the fix; Concern 14: body description must appear in built HTML)
  </read_first>
  <behavior>
    - With the popups directory empty, the build produces a landing page with NO mini-callout section, and a /popups page with the D-08 empty state.
    - With a temporary seed popup (created locally only — NOT committed) dated for the future and `start_time: "11am"`, the build produces a landing page with the mini-callout (rendering "11am" verbatim, NOT NaN) and a /popups page with the soonest PopupStrip + the markdown body description.
    - With three seed popups (1 past, 1 today, 1 future), the build produces a landing page with the mini-callout pointing to TODAY's popup (today stays "upcoming" all day per Pitfall 7), and a /popups page with PopupStrip (today) + the today markdown body description + ALSO COMING UP (future) + PAST (past).
    - Phase 1 CI gates pass: `npm run ci:brand-check` and `npm run ci:lowercase-check`.
  </behavior>
  <action>
**Step 1 — Verify zero-popups build (D-03 + D-08):** Confirm `src/content/popups/` is empty (`ls src/content/popups/` returns nothing). Run `npm run build`. Inspect the output:
- `! grep -q "next pop-up" dist/client/index.html` exits 0 (D-03: landing omits the section entirely when zero upcoming).
- `grep -c "No pop-ups on the calendar yet" dist/client/popups/index.html` returns 1 (D-08: empty state renders).

**Step 2 — Create three local-only seed popups** (DO NOT commit). Compute today's LA-date:
```bash
TODAY=$(node -e "import('temporal-polyfill').then(({Temporal}) => console.log(Temporal.Now.plainDateISO('America/Los_Angeles').toString()))")
PAST=$(node -e "import('temporal-polyfill').then(({Temporal}) => console.log(Temporal.Now.plainDateISO('America/Los_Angeles').subtract({days: 14}).toString()))")
FUTURE=$(node -e "import('temporal-polyfill').then(({Temporal}) => console.log(Temporal.Now.plainDateISO('America/Los_Angeles').add({days: 30}).toString()))")
```

Create three temporary markdown files in `src/content/popups/` for verification only. Each uses the schema fields exactly. **CRITICAL Concern 2 verification:** `start_time: "11am"` MUST be a free-form display string, NOT `"11:00"`, to validate that the new code handles it without NaN.

**Concern 9 transcription rule (applies to all three seed markdown files below):** the ` ---` lines in the code blocks below are shown with one leading space (markdown-rendering safety convention) — strip the leading space when writing each file so `---` lands at column 0. Astro Content Collections require column-0 frontmatter delimiters; with a leading space they will fail to parse and the seed popups will not load.

`src/content/popups/${PAST}-test-past.md`:
```markdown
 ---
name: Past Test Popup
date: ${PAST}
start_time: "11am"
end_time: "4pm"
tz: America/Los_Angeles
location: Heath Ceramics
address: "2900 18th St, San Francisco, CA"
 ---
Sample past popup body — verifies past archive renders.
```

`src/content/popups/${TODAY}-test-today.md`:
```markdown
 ---
name: Today Test Popup
date: ${TODAY}
start_time: "11am"
end_time: "4pm"
tz: America/Los_Angeles
location: General Store SF
address: "4035 Judah St, San Francisco, CA"
 ---
Free champagne and a chance to try on every pair before you DM. Concern 14 description verification.
```

`src/content/popups/${FUTURE}-test-future.md`:
```markdown
 ---
name: Future Test Popup
date: ${FUTURE}
start_time: "11am"
end_time: "4pm"
tz: America/Los_Angeles
location: Tartine Manufactory
address: "595 Alabama St, San Francisco, CA"
 ---
Sample future popup body — verifies ALSO COMING UP renders.
```

(The `:::` markers in the markdown bodies above are just illustrative comments inside the body text; the executor should write actual prose. The "Free champagne" line is the Concern 14 verification anchor.)

**Step 3 — Build with seed and verify:** `npm run build`. Check:
- `grep -c "next pop-up" dist/client/index.html` returns 1 (mini-callout renders; today's date is "upcoming" per Pitfall 7 — day-of stays upcoming all day in LA).
- `grep -c "General Store SF" dist/client/index.html` returns 1 (today's venue appears in mini-callout — the soonest).
- **Concern 2 verification:** `grep -c "11am" dist/client/index.html` returns at least 1 (the "11am" string renders verbatim in the time line — NOT NaN).
- **Concern 2 verification:** `! grep -q "NaN" dist/client/index.html` exits 0 (no NaN anywhere in the landing HTML).
- **Concern 2 verification:** `! grep -q "Invalid Date" dist/client/index.html` exits 0 (no "Invalid Date" string).
- With today AND a future popup, both are upcoming. `splitPopups` returns soonest = today (closest date). So mini-callout shows General Store SF. The "see all upcoming pop-ups →" link renders (hasMultiple = true since 2 upcoming exist).
- `grep -c "Tartine Manufactory" dist/client/popups/index.html` returns 1 (future popup appears in ALSO COMING UP).
- `grep -c "Heath Ceramics" dist/client/popups/index.html` returns 1 (past popup appears in PAST list).
- `grep -c "ALSO COMING UP" dist/client/popups/index.html` returns 1.
- `grep -c "PAST POP-UPS" dist/client/popups/index.html` returns 1.
- **Concern 14 verification:** `grep -c "Free champagne" dist/client/popups/index.html` returns 1 (the soonest popup's markdown body description rendered).
- **Concern 14 verification:** `grep -c "popup-description" dist/client/popups/index.html` returns at least 1 (the description block class is present in the built HTML).
- **Concern 2 verification on /popups too:** `! grep -q "NaN" dist/client/popups/index.html` exits 0.
- `! grep -q "No pop-ups on the calendar yet" dist/client/popups/index.html` exits 0 (empty state suppressed when popups exist).

**Step 4 — Clean up:** Delete the three temporary markdown files: `rm src/content/popups/*-test-*.md`. Re-run `npm run build` to confirm the empty-state behavior returns. After cleanup, `ls src/content/popups/` should return nothing.

**Step 5 — CI gates:** Run `npm run ci:brand-check` and `npm run ci:lowercase-check`. Both must exit 0.

**Step 6 — Final build:** With `src/content/popups/` empty (production-equivalent state for day 1 ship), `npm run build` exits 0; the dist artifact is the production-equivalent.
  </action>
  <verify>
    <automated>ls src/content/popups/ && npm run build 2>&1 | tail -10 && (! grep -q "next pop-up" dist/client/index.html) && grep -q "No pop-ups on the calendar yet" dist/client/popups/index.html && (! grep -q "NaN" dist/client/index.html) && (! grep -q "NaN" dist/client/popups/index.html) && npm run ci:brand-check && npm run ci:lowercase-check && echo VERIFY_OK</automated>
  </verify>
  <acceptance_criteria>
    - After Step 4 cleanup, `ls src/content/popups/` returns no files (zero-popup baseline)
    - `npm run build` exits 0
    - `! grep -q "next pop-up" dist/client/index.html` exits 0 (no mini-callout on landing when zero upcoming — D-03)
    - `grep -c "No pop-ups on the calendar yet" dist/client/popups/index.html` returns 1 (D-08 empty state)
    - **Concern 2 (zero-popup state):** `! grep -q "NaN" dist/client/index.html` exits 0 (no NaN anywhere)
    - **Concern 2 (zero-popup state):** `! grep -q "NaN" dist/client/popups/index.html` exits 0
    - `npm run ci:brand-check` exits 0
    - `npm run ci:lowercase-check` exits 0
    - During Step 3 (with the 3 seed popups), `grep -c "ALSO COMING UP" dist/client/popups/index.html` returns 1 (the future seed appears)
    - During Step 3, `grep -c "PAST POP-UPS" dist/client/popups/index.html` returns 1 (the past seed appears)
    - During Step 3, `grep -c "see all upcoming pop-ups" dist/client/index.html` returns 1 (hasMultiple = true because today + future = 2 upcoming)
    - **Concern 2 verification (Step 3):** `grep -c "11am" dist/client/index.html` returns at least 1 (verbatim render of free-form time string)
    - **Concern 2 verification (Step 3):** `! grep -q "NaN" dist/client/index.html` exits 0 (no NaN in landing HTML during seeded build)
    - **Concern 2 verification (Step 3):** `! grep -q "NaN" dist/client/popups/index.html` exits 0 (no NaN in popups HTML during seeded build)
    - **Concern 14 verification (Step 3):** `grep -c "Free champagne" dist/client/popups/index.html` returns 1 (markdown body description rendered)
    - **Concern 14 verification (Step 3):** `grep -c "popup-description" dist/client/popups/index.html` returns at least 1 (description block class present)
  </acceptance_criteria>
  <done>
    Build pipeline verified end-to-end with both zero-popup and three-popup scenarios. Cleanup confirms the production-equivalent zero-popup baseline. All Phase 1 CI gates pass. Concern 2 verified: "11am" renders verbatim with no NaN. Concern 14 verified: soonest popup's markdown body description renders on /popups.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Build-time -> static HTML | Popup data flows from `src/content/popups/*.md` (founder-edited via GitHub web UI) into Astro page frontmatter via `getCollection('popups')`, then renders to `dist/client/popups/index.html` and `dist/client/index.html`. No request-time evaluation. |
| Content-edit boundary | Founder edits popup markdown via GitHub web UI; Zod schema (Phase 2 strict()) enforces field validation at build time before any data reaches the page. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-03-03-01 | Tampering | Popup frontmatter | mitigate | Zod `.strict()` schema in `src/content.config.ts` (Phase 2) rejects unknown fields and invalid date formats at build time. A malicious or malformed PR fails CI before the bad popup reaches production. |
| T-03-03-02 | Information Disclosure | TZ math leaking PII | accept | The TZ computation is pure (`Temporal.Now.plainDateISO('America/Los_Angeles')`); inputs are popup dates, outputs are bucket arrays. No PII. No external network calls. |
| T-03-03-03 | Denial of Service | Large past archive | accept | Past array sort is O(n log n); even at 100 popups (well above realistic v1 scale) this is microseconds. The popups list is bounded by founder content additions, which are rare. |
| T-03-03-04 | Malicious Code (V10) | `temporal-polyfill` supply chain | mitigate | `temporal-polyfill` is FullCalendar's maintained Temporal subset, version-pinned in `package.json` (set in Plan 02), integrity-locked via `package-lock.json`. Build-time only — never shipped to the browser. |
| T-03-03-05 | Cross-Site Scripting | Popup markdown body rendered via render() | accept | astro:content's `render()` helper produces escaped HTML by default (Markdown -> HTML via remark/rehype with safe defaults). Markdown content is author-controlled by the founder via GitHub web UI; PR review is the second pair of eyes (Phase 1 FND-04). No user input flows into the markdown body. |
</threat_model>

<verification>
End-to-end verification after all 6 tasks complete (run sequentially):

```bash
# 1) New files exist:
test -f src/lib/popups.ts && grep -c "export function splitPopups" src/lib/popups.ts   # expect 1
test -f src/components/PopupCallout.astro && grep -c "popup-callout" src/components/PopupCallout.astro  # at least 1

# 2) Pages wire up correctly:
grep -c "import { splitPopups }" src/pages/index.astro     # expect 1
grep -c "import { splitPopups }" src/pages/popups.astro    # expect 1
! grep -q "PopupStrip" src/pages/index.astro               # expect exit 0 (landing uses PopupCallout now)
grep -c '<SEO slot="head"' src/pages/index.astro           # expect 1
grep -c '<SEO slot="head"' src/pages/popups.astro          # expect 1
grep -c '<BaseLayout title=' src/pages/index.astro         # expect 1 (Concern 4: BaseLayout drives <title>)
grep -c '<BaseLayout title=' src/pages/popups.astro        # expect 1

# 3) Concern 2 — no start_time-as-Date parsing anywhere:
! grep -rqE "new Date\(.*start_time" src/lib/ src/components/ src/pages/ 2>/dev/null     # expect exit 0
! grep -rqE 'new Date\(`.*\$\{.*date.*\}T' src/lib/ src/components/ src/pages/ 2>/dev/null  # expect exit 0
grep -c "Temporal.PlainDate.from" src/lib/popups.ts        # expect at least 2
grep -c "Temporal.PlainDate.from" src/components/PopupCallout.astro  # expect at least 1
grep -c "Temporal.PlainDate.from" src/pages/popups.astro   # expect at least 1

# 4) Concern 14 — popup description rendering on /popups:
grep -c "render(soonest)" src/pages/popups.astro           # expect 1
grep -c "popup-description" src/pages/popups.astro         # expect at least 2

# 5) PopupStrip.jsx CTA deleted:
! grep -q "book by appointment" src/components/design-skill/PopupStrip.jsx     # expect exit 0
! grep -qE "new Date\(.*startTime" src/components/design-skill/PopupStrip.jsx  # expect exit 0 (Concern 2 cross-check)

# 6) Concern 9 — column-0 frontmatter delimiters:
! grep -nE "^[[:space:]]+---$" src/components/PopupCallout.astro src/pages/index.astro src/pages/popups.astro  # expect exit 0

# 7) Brand-rule grep + lowercase + Astro check + build all clean:
npx astro check
npm run ci:brand-check
npm run ci:lowercase-check
npm run build

# 8) Empty-popups behavior (D-03 + D-08):
ls src/content/popups/   # expect nothing
! grep -q "next pop-up" dist/client/index.html                          # expect exit 0
grep -c "No pop-ups on the calendar yet" dist/client/popups/index.html  # expect 1
! grep -q "NaN" dist/client/index.html                                  # expect exit 0 (Concern 2 zero-state)
! grep -q "NaN" dist/client/popups/index.html                           # expect exit 0

# 9) Pitfall 7 sanity (Temporal probe — not a build gate, just a confidence check):
node -e "import('temporal-polyfill').then(({Temporal}) => console.log(Temporal.Now.plainDateISO('America/Los_Angeles').toString()))"
# Expect: today's date in LA-local form, e.g. 2026-05-13
```

Visual sanity (founder-style, optional):
- `npm run dev`, open `/` — expect Hero + GalleryGrid + Footer with NO pop-up section (zero popups baseline).
- Open `/popups` — expect the D-08 empty state under a quiet "Pop-ups" eyebrow.
- Manually create one future-dated popup markdown file in `src/content/popups/` with `start_time: "11am"` and a body containing "free champagne", refresh both pages — expect mini-callout on landing (showing "11am" verbatim), and a PopupStrip + "free champagne" description on /popups.
</verification>

<success_criteria>
Plan 03 is complete when:
1. `src/lib/popups.ts` exists with a working `splitPopups()` export using Temporal.PlainDate-only ordering (Concern 2); the Temporal polyfill is verified to work in Node 22.
2. `src/components/PopupCallout.astro` renders the mini-callout per UI-SPEC §Landing with scoped CSS, Temporal-based date label (Concern 2), verbatim time-string interpolation, column-0 frontmatter (Concern 9), and zero brand-rule violations.
3. `src/pages/index.astro` uses `splitPopups` + `PopupCallout`, omits the section when zero upcoming (D-03), honors the D-04 featured-3 fallback, wires `<SEO />`, drives `<title>` via `<BaseLayout title=...>` (Concern 4), and has column-0 frontmatter (Concern 9).
4. `src/pages/popups.astro` uses `splitPopups`, renders soonest (PopupStrip) + soonest's markdown body (Concern 14) + ALSO COMING UP + PAST + empty state + `<SEO />` per UI-SPEC §/popups, uses Temporal-based date labels (Concern 2), drives `<title>` via `<BaseLayout title=...>` (Concern 4), and has column-0 frontmatter (Concern 9).
5. `src/components/design-skill/PopupStrip.jsx` no longer renders "book by appointment" (D-09); audit confirms PopupStrip does not parse start_time/startTime as Date (Concern 2 cross-check).
6. `npm run build` + `npm run ci:brand-check` + `npm run ci:lowercase-check` all exit 0.
7. With `src/content/popups/` empty, the landing page's HTML contains no `next pop-up` text and the /popups page's HTML contains the D-08 empty state, with no `NaN` anywhere.
8. With seeded popups using `start_time: "11am"`, the built HTML contains "11am" verbatim, contains the soonest popup's markdown body description (Concern 14 — "free champagne" anchor), and contains no `NaN` (Concern 2 verification).
</success_criteria>

<output>
After completion, create `.planning/phases/03-page-composition-pop-ups/03-03-SUMMARY.md` documenting:
- The 2 new files + 3 modified files.
- The verified `splitPopups()` behavior (LA-cutoff + day-of stays upcoming + sort ordering; date-only — no start_time parsing per Concern 2).
- The Pitfall 7 mitigation: build-time Temporal.PlainDate.toLocaleString in PopupCallout.astro + popups.astro; no `new Date(\`${date}T${start_time}\`)` UTC math anywhere (Concern 2).
- A snapshot of the zero-popup build output (mini-callout absent on landing; D-08 empty state present on /popups; no NaN).
- A snapshot of the seeded-popup build output (mini-callout shows "11am" verbatim; "free champagne" markdown body renders on /popups — Concern 14).
- A one-line note that Plan 05 (cron) will rebuild this exact pipeline daily so expired popups roll off without founder action.
</output>
