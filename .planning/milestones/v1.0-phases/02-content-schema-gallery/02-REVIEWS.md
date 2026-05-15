---
phase: 2
reviewers: [codex]
reviewed_at: 2026-05-13T21:08:56Z
plans_reviewed: [02-01-PLAN.md, 02-02-PLAN.md, 02-03-PLAN.md, 02-04-PLAN.md, 02-05-PLAN.md]
codex_model: gpt-5.5
---

# Cross-AI Plan Review — Phase 2

## Codex Review

## Summary

The phase is well thought through and mostly coherent: the plans connect schema, seed content, image generation, gallery rendering, cleanup, and founder docs to the five success criteria. The main risks are not conceptual, but execution traps: `image()` with HEIC may not work, `astro check` is scheduled before required content files exist, preview `og:image` may not actually unfurl, GitHub web upload/rename assumptions may be wrong, and the Playwright/CI expansion may conflict with the stated “clean and no unnecessary CI cost” constraint.

## Strengths

- Clear wave sequencing: schema/assets/cleanup first, rendering second, docs/spec sync last.
- Strong use of `.strict()` Zod schemas and enum lifecycle states.
- Good decision to keep raw photos co-located with each piece and generated WebPs gitignored.
- Good correction away from `libheif-dev` toward a pure-JS HEIC decoder.
- Good cleanup of Phase 1 sample data and brand-rule enforcement.
- Founder workflow is treated as a product requirement, not an afterthought.
- Security posture is reasonable for gallery descriptions because values render as escaped text, not raw HTML.

## Concerns

### HIGH

- **`hero: image()` may not support `.heic`.**
  This is the biggest risk. Astro’s `image()` helper may validate supported image formats and parse metadata, not merely check existence. If HEIC is unsupported, Plan 01 blocks the whole phase. Verify this before execution. If it fails, use `hero: z.string()` plus custom existence/extension validation in the prebuild script.

- **Plan 01 Task 1 runs `astro check` before `src/content/site/config.md` exists.**
  The `file('./src/content/site/config.md')` loader may fail immediately. Either create site config in Task 1, move the check to after Task 3, or split schema creation so the file loader is added after the file exists.

- **Missing or non-existent `src/content/popups/` may break the glob loader.**
  The plan assumes Astro tolerates a missing collection base. Verify. If not, create the directory with a tracked placeholder or adjust the loader strategy.

- **Preview `og:image` likely does not satisfy SC4.**
  The plan emits `https://studiobluemli.com/gallery/<slug>/hero-800.webp` even on preview deploys. Until apex cutover, that can 404, so iMessage/IG preview validation may fail. If SC4 is meant to work on PR previews, use an environment-specific site URL in builds.

- **Founder GitHub upload rename workflow is likely brittle.**
  GitHub’s upload UI generally preserves file names; renaming a binary upload to `hero.heic` inside the web UI may not be as simple as described. Supporting exactly one image file per folder, case-insensitive extensions, or a `hero` frontmatter path that can point at `IMG_1234.HEIC` would make the workflow more founder-proof.

### MEDIUM

- **Plan 02 omits `pnpm-lock.yaml` from `files_modified`.**
  Adding `sharp`, `heic-convert`, and possibly Playwright will update the lockfile. The plan should list it explicitly.

- **The prebuild script should clean stale output.**
  CI fresh clones are fine, but local previews can keep old variants after slugs are renamed or removed. Consider deleting `public/gallery/` at script start before regenerating.

- **The prebuild script only checks lowercase `hero.heic`, `hero.jpg`, etc.**
  iPhone files and founder uploads may use uppercase `.HEIC`. Support case-insensitive matching.

- **Hardcoded detail image dimensions risk CLS.**
  `width="800" height="1000"` assumes 4:5, but the pipeline preserves native aspect ratio. If source photos vary, the HTML dimensions are wrong. Better: have the prebuild script emit a small manifest with actual output dimensions, or read dimensions at build time.

- **Plan 04’s Playwright addition may be scope/cost creep.**
  Installing Playwright browsers and OS deps in every CI run is relatively expensive. Given the budget/CI-minutes constraint, consider keeping Playwright smoke local/manual for Phase 2 and relying on build-output greps in CI.

- **SC3 is not fully automated.**
  All seed pieces are `available`, and the Playwright test only asserts that `cluster-sage` is not sold. That does not prove sold pieces remain visible with a quiet badge. Add a build-time fixture, a temporary mutation test, or seed exactly one sold piece if acceptable.

- **Popups schema diverges from CNT-05.**
  CNT-05 mentions `photos` optional image refs and markdown body. The schema omits `photos` and treats `description` as frontmatter. If intentional, record the deviation like D-16/D-17.

- **Slug validation is missing.**
  Founder-created folders with spaces, uppercase letters, punctuation, or duplicate-ish names can produce bad URLs or broken generated paths. Add a prebuild/schema check for `^[a-z0-9-]+$`.

### LOW

- **Plan 03 relies on `grep -P`, which may not work on macOS default grep.**
  CI is likely Ubuntu, but Luca’s local machine is macOS. Existing script may already have this issue; worth noting.

- **CONTENT_EDITING.md plan violates its own banned-word rule.**
  It says “no flowers in the name,” which includes banned word `flowers`. It also uses example `cluster-rose`, which is semantically flower-coded even if not caught by the regex. Use `cluster-coral` or `cluster-cobalt`.

- **Troubleshooting wording is confusing.**
  The doc says fix `availabilty` to “availability,” but the actual schema uses `status`. Say: “remove the typo and use `status: sold`.”

- **Empty gallery state is specified but not implemented.**
  Not critical with six seeds, but the UI spec calls it out.

## Suggestions

- Verify `image()` + HEIC immediately with one seeded `hero.heic`. If unsupported, change gallery schema to:
  - `hero: z.string().regex(/^\.\/hero\.(heic|jpg|jpeg|png)$/i)`
  - Prebuild script validates existence and dimensions.
- Move Plan 01 verification to the end of Plan 01, after `config.md` and seed files exist.
- Add `pnpm-lock.yaml` to Plans 02 and 04 if dependencies are added.
- Make `scripts/prebuild-images.mjs`:
  - remove `public/gallery/` before generating,
  - support uppercase extensions,
  - fail loudly if an `index.md` exists without a usable hero,
  - optionally emit dimensions manifest.
- Rework `og:image` base URL:
  - production: `https://studiobluemli.com`
  - preview: Cloudflare preview URL if available,
  - fallback: configured `site`.
- Keep Playwright out of CI unless there is already Playwright infrastructure. Use static `dist/client` assertions for Phase 2 CI.
- Add a slug validator, either in a script or in `astro check` support code.
- Fix CONTENT_EDITING examples to avoid `flower` vocabulary and “rose.”
- Add a real sold-state verification path before calling SC3 complete.

## Risk Assessment

**Overall risk: MEDIUM-HIGH.**

The architecture is sound, but there are several high-impact compatibility and workflow assumptions that need proof before execution: HEIC with Astro `image()`, missing loader files/directories during `astro check`, preview OG URL behavior, and GitHub web upload rename mechanics. If those are resolved, the phase drops to **MEDIUM/LOW** because the remaining work is mostly straightforward Astro wiring and documentation cleanup.

---

## Consensus Summary

Only one reviewer (Codex / gpt-5.5) was invoked, so there is no cross-reviewer consensus to synthesize. The single-reviewer call-out:

### Top Concerns to Address Before Execution (HIGH severity)

1. **Validate `image()` + HEIC compatibility** with a one-file smoke test before Plan 01 lands — if it rejects HEIC, swap to a `z.string()` path validator and let the prebuild pipeline own existence/format checks.
2. **Reorder Plan 01 verification** so `astro check` does not run before `src/content/site/config.md` and the `popups/` directory exist (or pre-create both in Task 1).
3. **Make `og:image` URL environment-aware** — preview deploys hitting `studiobluemli.com` will 404 until apex cutover (Phase 5), which directly threatens SC4 validation on PRs.
4. **De-brittle the founder GitHub upload step** — assume the founder cannot reliably rename a binary upload inside the GitHub web UI, and either accept the original filename via a `hero:` frontmatter path or constrain to "one image per folder."

### Lower-Severity Themes Worth Folding In

- Lockfile hygiene (`pnpm-lock.yaml` listed in `files_modified` for Plans 02/04).
- Prebuild script robustness: case-insensitive extensions, stale-output cleanup, real per-image dimensions to avoid CLS, slug regex validation.
- SC3 (sold-piece visibility) needs a real fixture or mutation test — current seeds are all `available`.
- Popups schema vs CNT-05: missing `photos` and treating `description` as frontmatter is a deviation worth documenting (D-style decision row) or correcting.
- CONTENT_EDITING.md: example slug `cluster-rose` and the phrase "no flowers in the name" both flirt with brand-banned vocabulary; swap to `cluster-coral` or `cluster-cobalt` and rewrite the troubleshooting line to reference `status` not `availability`.
- Playwright in CI is a budget/scope risk — keep smoke local for Phase 2 and lean on `dist/client` greps in CI.

### Divergent Views

Not applicable — single reviewer.
