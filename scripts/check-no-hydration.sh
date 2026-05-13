#!/usr/bin/env bash
# scripts/check-no-hydration.sh — REVIEW FIX M1 (Codex review)
#
# Enforces the "Astro renders React server-side only" contract in CI:
#   (1) No client:load|idle|visible|media|only directives anywhere in src/
#   (2) No large browser-served JS bundles in dist/ (the post-build output)
#
# Without this gate, a future PR could add `client:load` to one of the
# design-skill components and silently ship React (~40KB gz) to every browser
# — tanking mobile Lighthouse and violating the FND-01 "React server-rendered
# only" requirement. Codex flagged this as a missing invariant.
#
# This script runs AFTER `astro build` so dist/ exists.
set -uo pipefail

failed=0

# ---- Check 1: no client: directives in src/ ----
# Skip comments in *.md files via --include filter; we only care about code.
if grep -rEn 'client:(load|idle|visible|media|only)' \
     --include='*.astro' --include='*.jsx' --include='*.tsx' --include='*.ts' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/ ; then
  echo ""
  echo "FAIL: Found a client: directive in src/."
  echo "  Phase 1 requires zero React in the browser — every JSX component must"
  echo "  render server-side as static HTML. The design-skill components were"
  echo "  refactored (Plan 02) to drop useState/onClick so they DON'T need hydration."
  echo "  If you really need client interactivity, surface it via plain HTML/CSS"
  echo "  patterns (e.g., <details>/<summary> for disclosure, <form> for submission)"
  echo "  before reaching for a client: directive."
  failed=1
fi

# ---- Check 2: size budget on dist/ browser JS ----
# Astro 6 + @astrojs/cloudflare emits dist/_worker.js (SSR entry; NOT browser JS)
# plus, optionally, a tiny micro-runtime if any directive shipped. The
# zero-hydration contract means no large browser bundles should exist.
#
# Budget: any single browser-served .js file > 10240 bytes (10 KB) is a fail.
# Excludes _worker.js (and anything inside the _worker.js directory).
BUDGET_BYTES=10240
if [ -d dist ]; then
  LARGE=$(find dist -name '*.js' -size +"${BUDGET_BYTES}c" 2>/dev/null \
          | grep -v '/_worker.js' \
          || true)
  if [ -n "$LARGE" ]; then
    echo ""
    echo "FAIL: Found browser-served JS bundle(s) > ${BUDGET_BYTES} bytes in dist/:"
    echo "$LARGE" | sed 's/^/    /'
    echo "  The 'no client: directive' contract should yield zero (or near-zero)"
    echo "  browser JS. A bundle this size strongly suggests React (or another"
    echo "  framework runtime) accidentally shipped via a client: directive or"
    echo "  a hydration misconfiguration."
    echo "  Re-run check 1 above; if no client: directives are present, inspect"
    echo "  the build for unexpected hydration via 'astro check --verbose'."
    failed=1
  fi

  # Belt-and-suspenders: even if a small bundle exists, it must not include
  # the React production/development runtime.
  if grep -rlE 'react\.development|react\.production|react-dom\.development|react-dom\.production' \
       dist/ --include='*.js' 2>/dev/null \
       | grep -v '/_worker.js' \
       | head -5 | grep -q '.' ; then
    echo ""
    echo "FAIL: Browser-served JS in dist/ contains the React runtime."
    echo "  This violates the 'no client: directive' contract — React must not ship to the browser."
    failed=1
  fi
else
  echo "WARN: dist/ does not exist — has 'astro build' run? (skipping browser-JS check)"
  # Not a failure in isolation — CI runs astro build BEFORE this script, so by
  # the time this runs in the real pipeline, dist/ exists. In local dev or unit
  # tests, dist/ may be absent.
fi

if [ "$failed" -eq 0 ]; then
  echo "All hydration/bundle checks pass."
fi
exit "$failed"
