#!/usr/bin/env bash
# scripts/lighthouse-production.sh — Phase 4 launch-checklist item 6 (LCH-05).
#
# Runs Lighthouse mobile audit (simulated throttling) against the 6 production
# routes. Each category (Performance, Accessibility, Best Practices, SEO) must
# score >= 90 to satisfy LCH-05. HTML + JSON reports persist under
# .lighthouse/<date>/ for inclusion in LAUNCH-REPORT.md.
#
# Requires: `lighthouse` CLI v13+ on PATH. Phase 4 RESEARCH verified 13.1.0 at
# /opt/homebrew/bin/lighthouse on the dev machine. If missing, install via
# `npm i -g lighthouse@13` or `brew install lighthouse`.
#
# NOT set -e — keep going across all 6 routes so the founder sees the full picture
# in one report (some routes may pass while others regress; partial info is more
# useful than a single-route failure halting the loop).
set -uo pipefail

DATE=$(date +%Y-%m-%d)
OUT=".lighthouse/$DATE"
mkdir -p "$OUT"

ROUTES=(/ /gallery /gallery/cluster-coral /popups /about /say-hi)

if ! command -v lighthouse >/dev/null 2>&1; then
  echo "FAIL: lighthouse CLI not found on PATH. Install with: npm i -g lighthouse@13"
  exit 1
fi

echo "Lighthouse version: $(lighthouse --version)"
echo "Reports: $OUT"
echo ""

FAIL=0
for ROUTE in "${ROUTES[@]}"; do
  SAFE=$(echo "$ROUTE" | tr '/' '_' | sed 's/^_/root/')
  URL="https://studiobluemli.com$ROUTE"
  echo "Auditing $URL"
  lighthouse "$URL" \
    --form-factor=mobile \
    --throttling-method=simulate \
    --only-categories=performance,accessibility,best-practices,seo \
    --output=html --output=json \
    --output-path="$OUT/$SAFE" \
    --chrome-flags="--headless=new --no-sandbox" \
    --quiet || { echo "FAIL: lighthouse run errored for $URL"; FAIL=1; continue; }

  # Extract category scores from the JSON.
  JSON="$OUT/$SAFE.report.json"
  if [ ! -f "$JSON" ]; then
    echo "FAIL: report JSON missing at $JSON"
    FAIL=1
    continue
  fi
  PERF=$(jq -r '.categories.performance.score * 100 | floor' "$JSON")
  A11Y=$(jq -r '.categories.accessibility.score * 100 | floor' "$JSON")
  BP=$(jq -r '.categories["best-practices"].score * 100 | floor' "$JSON")
  SEO=$(jq -r '.categories.seo.score * 100 | floor' "$JSON")
  echo "  perf=$PERF  a11y=$A11Y  bp=$BP  seo=$SEO"
  for SCORE in "$PERF" "$A11Y" "$BP" "$SEO"; do
    if [ "$SCORE" -lt 90 ]; then
      echo "  FAIL: $URL category score $SCORE < 90"
      FAIL=1
    fi
  done
done

echo ""
if [ "$FAIL" -eq 1 ]; then
  echo "FAILED: One or more routes scored below 90 in at least one category."
  echo "Reports under $OUT for triage."
  exit 1
fi
echo "All 6 routes scored >= 90 across Performance, Accessibility, Best Practices, SEO."
