---
phase: 1
reviewers: [codex]
reviewed_at: 2026-05-12T23:29:04Z
plans_reviewed:
  - 01-01-scaffold-astro-cloudflare-PLAN.md
  - 01-02-sync-design-skill-PLAN.md
  - 01-03-favicon-and-public-assets-PLAN.md
  - 01-04-baselayout-pages-sample-data-PLAN.md
  - 01-05-ci-brand-check-and-setup-PLAN.md
---

# Cross-AI Plan Review — Phase 1: Foundations & Brand System

## Codex Review

## Summary

The plan set is unusually thorough and mostly coherent: it traces Phase 1 from Astro/Workers scaffold through design-skill sync, favicon generation, demo-loaded pages, CI enforcement, and manual Cloudflare/GitHub setup. It is strong on brand-rule enforcement and on avoiding stale Cloudflare Pages patterns. The main issues are not intent but execution reliability: several plans contain implementation details that are likely to break build/a11y, some Phase 1 requirements are contradicted or deferred, and CI does not enforce all regressions the plans say are non-negotiable.

## Strengths

- Strong decomposition: 01-01 → 01-02/03 → 01-04 → 01-05 has a mostly valid dependency chain.
- Good Cloudflare direction: `wrangler.jsonc` uses Workers Static Assets and `run_worker_first: ["/api/*"]`, which matches current Cloudflare docs for selective Worker routing.
- Good avoidance of legacy Pages model: Astro's Cloudflare adapter docs confirm Pages support is removed in v13 and Workers is the right target.
- Brand enforcement is treated as build infrastructure, not reviewer memory.
- Good one-shot sync decision: copying the design skill into `src/` avoids runtime coupling to `.claude/skills/`.
- Good explicit verification culture: build output, Worker entrypoint, no large browser JS, favicon hashes, and deliberate CI violation tests are all valuable.

## Concerns

- **HIGH — `astro check` will likely fail because `@astrojs/check` is missing.**
  `01-01-scaffold-astro-cloudflare-PLAN.md` uses `astro check` in scripts, local verification, and CI, but `package.json` does not include `@astrojs/check`. Add it to devDependencies or change the typecheck command.

- **HIGH — Header mobile nav implementation is broken.**
  In `01-02-sync-design-skill-PLAN.md`, Task 3 Edit 1 sets `<nav className="site-nav" style={{ display: 'flex', gap: 22 }}>`. That inline `display: flex` overrides the mobile CSS rule `.site-nav { display: none; }`, so the nav will not collapse on mobile. Also, the `<label role="button" tabIndex={0}>` pattern will not reliably toggle via keyboard, and `aria-expanded="false"` never changes. This misses FND-13 and the UI-SPEC hamburger requirement.

- **HIGH — FND-12 is claimed but not achieved.**
  FND-12 says Lighthouse mobile score ≥ 90 "in CI." `01-05` explicitly defers Lighthouse to Phase 5. Either remove FND-12 from Phase 1 requirements or add a lightweight Lighthouse CI step now.

- **HIGH — FND-03 is incorrectly attached to Phase 1.**
  FND-03 requires apex `studiobluemli.com` and `www` redirect. Context D-13 says no custom domain in Phase 1. `01-05` calls this "partially satisfied," which is requirements debt. Remove FND-03 from Plan 05 or rewrite FND-03 as Phase 5-only.

- **MEDIUM — CI does not enforce the "no `client:` directives / no React browser JS" contract.**
  `01-04` verifies this once locally, but `01-05` CI does not grep for `client:` or check emitted browser JS size. A later PR could add `client:load` and still pass CI.

- **MEDIUM — `.assetsignore` is missing for `dist/_worker.js`.**
  Cloudflare docs warn that when assets directory is `dist`, server-side Worker output such as `_worker.js` should be excluded from static asset upload with `.assetsignore`. None of the plans add or verify this. At minimum, verify `_worker.js` is not publicly served.

- **MEDIUM — Plan 03's sample WebP generation relies on unpinned `sharp`.**
  `01-03` says `sharp` is "already an indirect dep via icon-gen," but pnpm does not guarantee transitive imports are available. The fallback `pnpm add -D sharp` mutates `package.json`/lockfile outside the plan's declared files. Prefer SVG placeholders, explicit `sharp` dependency in Plan 01, or use an already installed asset pipeline.

- **MEDIUM — Plan 02 may violate the locked token-file rule.**
  Task 3 Edit 7 says to append `.btn-primary` CSS to `src/styles/colors_and_type.css` if missing. Upstream says that file is copied from the design skill, imported once, and not extended. Put component-specific button styles in `Button.jsx` or a separate component CSS file.

- **MEDIUM — `--font-hand` is referenced but not loaded.**
  Plan 01 omits Caveat unless a component references `--font-hand`; Plan 02 notes About does reference it but decides fallback is acceptable. That contradicts D-16. Either load Caveat or remove the `--font-hand` usage from About in Phase 1.

- **LOW — JSX prop "types" are overstated.**
  `HeaderProps.active` is a JSDoc comment in `.jsx`, so `astro check` will not reliably enforce the route union. Do not claim `/about` "typechecks" unless Header is moved to `.tsx` or checked with `checkJs`.

- **LOW — Build-log warning scan may be brittle.**
  The `grep -iE "(warn|error)"` scan in `01-04` can false-fail on harmless output. Keep it, but make the allowlist explicit and record actual observed log patterns after first run.

## Suggestions

- **01-01 Task 1:** Add `@astrojs/check` to `devDependencies`; keep `typescript` as-is.
- **01-02 Task 3 Edit 1:** Replace the checkbox/label hamburger with `<details><summary>` or make mobile nav always visible for Phase 1. Do not ship static `aria-expanded`.
- **01-02 Task 3 Edit 1:** Remove inline `display: 'flex'` from `<nav>` and move all nav display behavior into CSS classes.
- **01-02 Task 3 Edit 7:** Do not append component styles to `colors_and_type.css`; use component-scoped CSS or inline styles.
- **01-03 Task 2:** Avoid `sharp` unless it is explicitly added to `package.json`. Simpler: create three SVG placeholders in `public/sample/` and update `sample-data.ts` to reference `.svg`.
- **01-04 Task 3:** Move the "no `client:` directives" grep and "no large browser JS" check into `scripts/check-brand-rules.sh` or a separate CI script in `01-05`.
- **01-04 / 01-05:** Add a verification that `_worker.js` is not served as a static asset, or add a generated `dist/.assetsignore` strategy before deploy.
- **01-05 frontmatter:** Remove FND-03 from `requirements` or mark it explicitly deferred to Phase 5.
- **Phase requirements:** Either remove FND-12 from Phase 1 or add Lighthouse CI now. The current plan cannot honestly claim it.

## Risk Assessment

**Overall risk: MEDIUM.**
The architecture is directionally sound, and the Cloudflare/Astro assumptions mostly align with current official docs: Workers Static Assets supports `assets.directory`, `binding`, and route-pattern `run_worker_first`, Astro v6 uses `@astrojs/cloudflare/entrypoints/server`, and the Fonts API uses `fontProviders` plus `<Font />` from `astro:assets`. The risk is in plan-level implementation bugs and traceability mismatches: missing `@astrojs/check`, broken mobile nav/a11y, deferred-but-claimed FND-03/FND-12, and CI gaps around no-client-JS. Fix those before execution and the plan set becomes low-risk.

Sources checked:
- Astro Cloudflare adapter docs: https://docs.astro.build/en/guides/integrations-guide/cloudflare/
- Cloudflare Workers Static Assets docs: https://developers.cloudflare.com/workers/static-assets/binding/
- Astro Fonts docs: https://docs.astro.build/en/guides/fonts/ and https://docs.astro.build/en/reference/configuration-reference/#fonts

---

## Consensus Summary

Only one reviewer (Codex) was invoked, so "consensus" reflects Codex's standalone view rather than agreement across multiple AIs. Re-run with additional reviewers (`--gemini`, `--claude`, etc.) for true cross-AI consensus.

### Agreed Strengths

- Sound 5-plan dependency chain (scaffold → sync + favicon → pages → CI/setup).
- Workers + Static Assets target with `run_worker_first: ["/api/*"]` matches current Cloudflare guidance; legacy Pages references avoided.
- Brand non-negotiables encoded as build infrastructure (CI grep) rather than reviewer discipline.
- One-shot design-skill sync into `src/` cleanly decouples runtime from `.claude/skills/`.

### Agreed Concerns (highest priority — act before execution)

1. **HIGH — `astro check` will fail without `@astrojs/check` in devDependencies** (01-01).
2. **HIGH — Mobile Header nav is broken**: inline `display: flex` clobbers the mobile collapse rule, and the checkbox/label hamburger lacks reliable keyboard toggle + has a static `aria-expanded` (01-02 Task 3 Edit 1). Misses FND-13 + UI-SPEC.
3. **HIGH — Requirements traceability debt**: Phase 1 claims FND-12 (Lighthouse ≥ 90 in CI) but defers Lighthouse to Phase 5; Phase 1 also lists FND-03 (apex + www redirect) but D-13 explicitly defers domain cutover to Phase 5. Either move these to Phase 5 or wire them in now.
4. **MEDIUM — CI doesn't enforce the "no `client:` directives / no shipped React JS" invariant** — a later PR could regress without failing the gate.
5. **MEDIUM — `dist/_worker.js` may leak as a static asset** without `.assetsignore`.
6. **MEDIUM — `sharp` for placeholder WebP generation is unpinned** (01-03) — switch to SVG placeholders or pin the dep in 01-01.
7. **MEDIUM — `colors_and_type.css` is being extended in 01-02 Task 3 Edit 7**, contradicting the "import once, never extend" lock.
8. **MEDIUM — `--font-hand` (Caveat) is referenced by About but not loaded** — contradicts D-16.

### Divergent Views

N/A — only one reviewer invoked.

### Recommended Next Step

Re-plan with Codex feedback incorporated:

```
/gsd-plan-phase 1 --reviews
```

The HIGH-severity concerns (4 items) should be resolved before execution begins. The MEDIUM concerns are worth folding into the same replan pass.
