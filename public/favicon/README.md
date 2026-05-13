# Favicon regeneration

These files are generated from `assets/logo/mark.svg`. To regenerate:

    pnpm run favicons

The script lives at `scripts/generate-favicons.mjs`. It writes:
- favicon.ico (multi-size 16/32/48)
- favicon-16.png
- favicon-32.png
- favicon.svg (copy of mark.svg)
- mark.svg (copy of mark.svg — used by Header.jsx `<img src="/mark.svg">`)
- apple-touch-icon.png (copy of assets/logo/mark-favicon-180.png — DO NOT regenerate, it already has the right styling)
