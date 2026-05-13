#!/usr/bin/env bash
# scripts/check-brand-rules.sh — FND-10 brand-non-negotiable enforcement.
#
# Runs as a required status check in .github/workflows/ci.yml. Blocks PR merge
# if any rule fires. D-07: required status check. D-11: every failure message
# names the brand REASON, not just the pattern.
#
# NOT set -e — we want to collect ALL violations before exiting, so a contributor
# sees every needed fix in one CI run.
set -uo pipefail

failed=0

# Rule 1: cream-only backgrounds (FND-10) — D-10: whitelist #fff8
# Pattern catches:
#   bg-white, background: white, #fff (3-digit, not followed by hex), #FFFFFF (6-digit)
# Whitelists:
#   #fff8 (cream tint with alpha — the only allowed near-white)
# Uses -P for PCRE negative lookahead. Note: -P is mutually exclusive with -E
# in both BSD and GNU grep ("conflicting matchers specified"); use -P only. The
# alternation operator | is supported natively in PCRE.
if grep -rnP '(bg-white|background:\s*white|#[fF]{3}(?![0-9a-fA-F])|#[fF]{6})' \
     --include='*.astro' --include='*.jsx' --include='*.tsx' --include='*.ts' --include='*.css' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/ ; then
  echo ""
  echo "FAIL: The site background must be cream (#F5DCC7), never white."
  echo "  Fix: replace with var(--color-bg) or a cream token from colors_and_type.css."
  echo "  The only whitelisted near-white value is #fff8 (cream tint with alpha)."
  failed=1
fi

# Rule 2: no flower vocabulary (FND-10) — product copy intent.
# Pattern: word-boundary anchored, case-insensitive. Scope: src/ AND src/content/.
#
# Plan 05 scope decision (resolves deferred-items.md entry from Plan 04):
# Rule 2's INTENT per studio-bluemli-design SKILL.md is "earrings are beaded clusters,
# not flowers — keep the word 'flower' out of product copy". Two file classes are
# legitimate false positives of a string-level grep and are excluded:
#   1. src/styles/colors_and_type.css — verbatim-synced design-skill source; comments
#      name color HUES after the real-world objects the hue evokes (mustard, lavender,
#      "small flowers, sparkles", "bottom-right pressed flower"). These are not
#      product copy. Plan 02 REVIEW FIX M4 locks this file as a verbatim copy of
#      the skill source — editing it here would drift from the skill source. The
#      design-skill source itself is the only place to change those comments
#      (re-sync after) if we ever want them gone.
#   2. src/components/design-skill/ — synced React components. Their copy lives in
#      props passed by pages, not in component internals. Comments like
#      "(real brand swatches, not flowers)" are author intent, not user-visible.
# When Phase 2 introduces src/content/ (real product copy), Rule 2 still scans it
# unmodified — the exclusions above apply only to the two file classes named.
if grep -rEni '\b(flower|petal|floral|bloom|blossom)\b' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     --exclude-dir=design-skill \
     --exclude='colors_and_type.css' \
     src/ ; then
  echo ""
  echo "FAIL: The studio's earrings are beaded clusters, not flowers — pick a neutral word."
  echo "  This applies to copy, alt text, comments, file names — anywhere in src/."
  echo "  See .claude/skills/studio-bluemli-design/README.md → 'Vocabulary'."
  echo "  (Synced design-skill internals and color-naming comments in colors_and_type.css"
  echo "   are intentionally excluded — see comment in scripts/check-brand-rules.sh.)"
  failed=1
fi

# Rule 3: no UI gradients (FND-10)
if grep -rEn 'gradient' \
     --include='*.astro' --include='*.jsx' --include='*.tsx' --include='*.css' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/ ; then
  echo ""
  echo "FAIL: Gradients conflict with the Bluemli flat-color brand language."
  echo "  Fix: use flat fills from the palette tokens (var(--coral-500) etc.)."
  echo "  See src/styles/colors_and_type.css for available tokens."
  failed=1
fi

# Rule 4: no backdrop-filter (FND-10) — catches both CSS and JSX inline-style forms.
# Pitfall: the original design-skill Header.jsx uses backdropFilter: 'blur(4px)'; the
# sync-script Transform 4 removes it (Plan 02). This CI rule is the safety net.
if grep -rEn '(backdrop-filter|backdropFilter|WebkitBackdropFilter)' \
     --include='*.astro' --include='*.jsx' --include='*.tsx' --include='*.css' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/ ; then
  echo ""
  echo "FAIL: backdrop-filter is frosted-glass SaaS aesthetic — not Bluemli."
  echo "  Fix: replace with a solid cream background, e.g."
  echo "       background: rgba(245, 220, 199, 0.92);"
  failed=1
fi

# Rule 5: no 1px borders (FND-10)
# Pattern anchors on the `1px` value so border-radius / border-collapse / border: none
# DO NOT match. border-top/bottom/left/right: 1px also caught.
if grep -rEn 'border(-top|-bottom|-left|-right)?:\s*1px' \
     --include='*.astro' --include='*.jsx' --include='*.tsx' --include='*.css' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/ ; then
  echo ""
  echo "FAIL: Hard 1px borders are not Bluemli."
  echo "  Fix: use var(--color-border-soft) (rgba subtle), var(--shadow-xs), or no border."
  echo "  If you need an outline, use box-shadow: inset 0 0 0 2px var(--color);"
  failed=1
fi

# Rule 7: sample-data leak (Phase 2, D-03). Plan 04 deleted src/sample-data.ts;
# any "Sample Piece" string OR `price: 0` line surviving in src/content/ is a
# leak/regression.
if grep -rEn '("Sample Piece"|^price: 0$)' \
     --include='*.md' \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=.planning --exclude-dir=.claude \
     src/content/ 2>/dev/null ; then
  echo ""
  echo "FAIL: Remove sample-data markers before merging — Phase 2 ships real content."
  echo "  'Sample Piece' names and price: 0 are Phase 1 test markers; real pieces have real names and prices."
  failed=1
fi

if [ "$failed" -eq 0 ]; then
  echo "All brand rules pass."
fi
exit "$failed"
