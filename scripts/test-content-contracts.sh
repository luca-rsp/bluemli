#!/usr/bin/env bash
# scripts/test-content-contracts.sh — SC2 + SC3 contract verification (Phase 2).
# REVIEWS.md MEDIUM-5: extended from the original test-schema-strict.sh to also
# cover SC3 (sold-piece visibility + CTA copy flip) via mutation testing.
#
# Usage: bash scripts/test-content-contracts.sh
# Exit codes: 0 = both SC2 and SC3 satisfied; 1 = at least one FAIL.
#
# Note: script resolves the astro binary from node_modules/.bin/astro (local or
# parent dir) to handle both plain-clone and git-worktree environments.

set -uo pipefail

# Resolve astro binary — look locally, then walk up to find it in a parent's node_modules.
_resolve_astro() {
  local dir="$PWD"
  while [ "$dir" != "/" ]; do
    if [ -x "$dir/node_modules/.bin/astro" ]; then
      echo "$dir/node_modules/.bin/astro"
      return 0
    fi
    dir="$(dirname "$dir")"
  done
  # Fallback: rely on PATH
  echo "astro"
}
ASTRO="$(_resolve_astro)"

TARGET="src/content/gallery/cluster-blush/index.md"
BACKUP="$(mktemp)"
LOG="$(mktemp)"

cleanup() {
  if [ -f "$BACKUP" ]; then
    cp "$BACKUP" "$TARGET"
    rm -f "$BACKUP" "$LOG"
  fi
}
trap cleanup EXIT INT TERM

if [ ! -f "$TARGET" ]; then
  echo "FAIL: $TARGET not found — Plan 01 Task 2 seed file missing."
  exit 1
fi

cp "$TARGET" "$BACKUP"

# ============================================================================
# SC2: typo'd frontmatter field must fail astro check.
# ============================================================================
echo "[SC2] Mutating cluster-blush to inject typo'd field 'availabilty: sold'..."
awk 'NR==1{print; print "availabilty: sold"; next} {print}' "$BACKUP" > "$TARGET"

if "$ASTRO" check > "$LOG" 2>&1; then
  echo "[SC2] FAIL: astro check exited 0 with typo'd frontmatter — .strict() not enforced."
  cat "$LOG"
  exit 1
fi
if grep -qE "availabilty|Unrecognized|strict" "$LOG"; then
  echo "[SC2] PASS: astro check rejected the typo with a clear schema error."
else
  echo "[SC2] WARN: astro check failed but didn't name the offending field — output:"
  cat "$LOG"
  echo "[SC2] PASS (build did fail, which is the core SC2 requirement)."
fi

# Restore for SC3.
cp "$BACKUP" "$TARGET"

# ============================================================================
# SC3: sold piece renders quiet Sold badge + D-11 CTA copy flip (REVIEWS.md MEDIUM-5).
# ============================================================================
echo "[SC3] Mutating cluster-blush to status: sold and rebuilding..."
sed 's/^status: available$/status: sold/' "$BACKUP" > "$TARGET"

# Confirm the mutation took.
if ! grep -q "^status: sold$" "$TARGET"; then
  echo "[SC3] FAIL: failed to mutate status to sold."
  exit 1
fi

# Rebuild against the sold mutation.
if ! "$ASTRO" build > "$LOG" 2>&1; then
  echo "[SC3] FAIL: astro build failed with status: sold — sold pieces should still build."
  cat "$LOG"
  exit 1
fi

# Assert the HTML still exists (sold piece NOT hidden).
HTML="dist/client/gallery/cluster-blush/index.html"
if [ ! -f "$HTML" ]; then
  echo "[SC3] FAIL: $HTML missing — sold piece should render, not be hidden."
  exit 1
fi

# Assert the body contains the literal 'Sold' label.
if ! grep -q "Sold" "$HTML"; then
  echo "[SC3] FAIL: $HTML does not contain 'Sold' label."
  exit 1
fi

# Assert the body contains the D-11 CTA copy variant.
if ! grep -q "This pair sold" "$HTML"; then
  echo "[SC3] FAIL: $HTML does not contain D-11 CTA variant 'This pair sold'."
  exit 1
fi

echo "[SC3] PASS: sold piece renders, contains 'Sold' label and D-11 CTA copy."

# Restore happens via trap.
cleanup
trap - EXIT INT TERM

# Verify post-restore clean state.
if "$ASTRO" check > /dev/null 2>&1; then
  echo "[Done] Restored file passes astro check — clean state. SC2 + SC3 both verified."
  exit 0
else
  echo "FAIL: post-restore astro check failed — something else is broken (NOT the contract tests)."
  exit 1
fi
