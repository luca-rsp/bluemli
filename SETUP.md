# Setup — Studio Bluemli Website

These are the manual steps that cannot live in code. Run them ONCE after the Phase 1 scaffold ships.
None of them require the founder — engineer-only.

## 1. Push the Phase 1 scaffold to GitHub

If the repo isn't on GitHub yet:
1. Create a new private (or public) repo on GitHub. Default branch: `main`.
2. From the local repo root:
   ```
   git remote add origin git@github.com:<user>/<repo>.git
   git push -u origin main
   ```

Otherwise, just push the Phase 1 work to `main`.

## 2. Connect the repo to a Cloudflare Worker

(Required for FND-04: push-to-main production deploy + per-PR preview URLs.)

1. Open the Cloudflare dashboard → **Workers & Pages**.
2. Either click **Create application → Import a repository**, or (if you already created the Worker)
   navigate to **Workers & Pages → studio-bluemli → Settings → Builds → Connect**.
3. Authorize GitHub access and select this repo.
4. Build settings:
   - **Build command:** `pnpm install --frozen-lockfile && pnpm build && node scripts/write-assetsignore.mjs`
   - **Deploy command (production):** `npx wrangler deploy`
   - **Deploy command (preview):** `npx wrangler versions upload`
   - **Root directory:** `/` (default)
   - **Production branch:** `main`
5. **Toggle "Non-production branch builds: ON"** — this is what enables per-branch preview URLs.
   Without it, only `main` deploys.

Source: https://developers.cloudflare.com/workers/ci-cd/builds/

## 3. Note the preview URL format

After step 2 fires once:

- **Production:** `studio-bluemli.<account-subdomain>.workers.dev`
  (The `<account-subdomain>` is unique to your Cloudflare account; the dashboard tells you.)
- **Per-branch (stable alias):** `<branch-name>-studio-bluemli.<account-subdomain>.workers.dev`
- **Per-commit (immutable):** `<version-prefix>-studio-bluemli.<account-subdomain>.workers.dev`

Phase 1 ships on `*.workers.dev` only. The apex `studiobluemli.com` resolves to this Worker in Phase 5 (FND-03, which is mapped to Phase 5 per the updated REQUIREMENTS.md).

## 4. Enable the GitHub required status check

(Required for FND-10 / FND-11: CI blocks PR merge on brand violations.)

1. Open the GitHub repo → **Settings → Branches**.
2. Click **Add branch protection rule** (or edit the existing rule for `main`).
3. Branch name pattern: `main`.
4. Check **Require status checks to pass before merging**.
5. In the status-checks search box, type **`Build & brand check`** — this is the job name
   from `.github/workflows/ci.yml` and MUST match exactly. Click it to add as required.
6. (Optional but recommended) Check **Require pull request before merging** so changes
   to `main` always go through a PR (and therefore CI).
7. (Optional but recommended) Check **Do not allow force pushes** — closes the
   T-05-04 repudiation gap noted in the Plan 05 threat register.
8. Save.

## 5. Verify the loop end-to-end

1. Create a branch and push a trivial change. Open a PR.
2. **CI:** GitHub Actions should run `Build & brand check`. It must pass (green check).
3. **Cloudflare preview:** Within ~2 minutes, Cloudflare Workers Builds should comment
   the preview URL on the PR. Click it.
4. **Visual smoke test on the preview URL:**
   - The header lockup shows the coral wordmark "Studio Bluemli" and the mark.
   - The page background is cream (`#F5DCC7`), not white.
   - Each route (`/`, `/gallery`, `/popups`, `/about`, `/say-hi`) loads with the design-skill chrome.
   - The hand-display headline on `/` reads "bright, beaded, one of a kind".
   - The favicon shows in the browser tab.
5. **Deliberate violation test:** On the same branch, add `background: white;` to any file in `src/`,
   push the change. CI must fail with the brand-rule failure message. Revert. CI must pass.
6. Merge to `main`. Confirm the production `*.workers.dev` URL updates.

## 6. No secrets in Phase 1

`RESEND_API_KEY`, `TURNSTILE_SECRET`, and the KV namespace ID are Phase 4 — do not pre-create
them. `wrangler secret list` should be empty after Phase 1.

The CI workflow references `${{ secrets.LHCI_GITHUB_APP_TOKEN }}` on the Lighthouse CI step.
This secret is **optional** — when absent, `treosh/lighthouse-ci-action` falls back to
`temporaryPublicStorage: true` (uploads reports to a public anonymous bucket so the action
link works). Adding the token later enables the official Lighthouse CI GitHub App's
in-PR commenting; not required for Phase 1.

---

## Phase 1 Success Criteria Quick Check

After all steps above:

- [ ] **SC1** (cream/font shell): the preview URL renders all 5 pages with cream bg + Caveat Brush headline + design-skill chrome.
- [ ] **SC2** (push-to-deploy + PR previews): merging to `main` deploys to production; PRs get preview URLs.
- [ ] **SC3** (CI blocks brand violations): the deliberate-violation test in step 5 fails, the revert passes.
- [ ] **SC4** (favicon): visit the preview URL on desktop and add to home-screen on iOS; both show the mark.
- [ ] **SC5** (PROJECT.md corrected): `grep -c "Cloudflare Pages" .planning/PROJECT.md` shows only the explanatory parenthetical(s), not the target-hosting bullets.
- [ ] **FND-12 (Lighthouse, mobile, ≥ 90 on `/`)**: CI's `Lighthouse CI` step is green on the latest run. If it fails, click through to the artifact and inspect which category dropped below 0.9 — most common Phase 1 failure is Accessibility (missing focus-visible) or Performance (font payload above 100KB).
