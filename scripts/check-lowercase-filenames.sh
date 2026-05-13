#!/usr/bin/env bash
# scripts/check-lowercase-filenames.sh — FND-11
#
# macOS APFS is case-insensitive; Linux (Cloudflare runtime) is not.
# A page at src/pages/Gallery.astro works on the developer's Mac and 404s
# in production. This script catches the mismatch at PR time.
set -uo pipefail

violations=$(find src/pages -type f | grep -E '[A-Z]' || true)

if [ -n "$violations" ]; then
  echo "FAIL: src/pages/ filenames must be lowercase-only."
  echo "  Found uppercase letters in:"
  echo "$violations" | sed 's/^/    /'
  echo ""
  echo "  macOS is case-insensitive; Linux is not — mixed case causes 404s in production."
  echo "  Rename each file to all-lowercase."
  exit 1
fi

echo "All src/pages/ filenames are lowercase."
exit 0
