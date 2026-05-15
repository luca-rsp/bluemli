#!/usr/bin/env bash
# scripts/check-og-images.sh — Phase 4 launch-checklist item 3 (D-04, LCH-08).
#
# Walks every URL in the production sitemap-0.xml, fetches each page, extracts
# the og:image content URL, and HEAD-checks each. Exits non-zero if any og:image
# URL returns anything other than 200. Plan 05 gates cutover-completeness on this.
#
# LCH-06 acceptance pivot (per RESEARCH.md §Pitfall 4): The Twitter Card Validator
# was deprecated by X in 2022 with no first-party replacement. Phase 4's LCH-06
# acceptance is "Facebook Sharing Debugger green + founder taps share-to-iMessage/
# IG-DM and the real unfurl renders." That second step is a founder phone check,
# not scripted. This script handles the first half (every og:image RESOLVES and
# is reachable as a 200) — the visual unfurl quality is human-checked.
#
# NOT set -e — collect ALL failures so one report fixes everything.
set -uo pipefail

SITE="https://studiobluemli.com"
# Sitemap entry-point (https://studiobluemli.com/sitemap-0.xml — hard-coded apex per T-04-23).
SITEMAP="$SITE/sitemap-0.xml"

# Extract URLs from sitemap (one per line).
URLS=$(curl -fsS "$SITEMAP" | grep -oE '<loc>[^<]+</loc>' | sed -E 's|</?loc>||g')

if [ -z "$URLS" ]; then
  echo "FAIL: $SITEMAP returned no <loc> entries — sitemap is empty or unreachable."
  exit 1
fi

URL_COUNT=$(echo "$URLS" | wc -l | tr -d ' ')
echo "Scanning $URL_COUNT URLs from $SITEMAP"
echo ""

FAIL=0
for URL in $URLS; do
  # Extract og:image from the page.
  OG=$(curl -fsS "$URL" | grep -oE '<meta property="og:image" content="[^"]+"' | head -1 | sed -E 's|.*content="([^"]+)".*|\1|')
  if [ -z "$OG" ]; then
    echo "FAIL: $URL has no og:image"
    FAIL=1
    continue
  fi
  STATUS=$(curl -fsS -o /dev/null -w '%{http_code}' -I "$OG")
  if [ "$STATUS" != "200" ]; then
    echo "FAIL: $URL -> og:image $OG -> HTTP $STATUS"
    FAIL=1
  else
    echo "OK: $URL -> $OG (200)"
  fi
done

echo ""
if [ "$FAIL" -eq 1 ]; then
  echo "FAILED: One or more og:image URLs did not return 200."
  exit 1
fi
echo "All og:image URLs return 200."
