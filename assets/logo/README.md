# Studio Bluemli — Logo files

## What's here

| File | Format | Size | Use |
|---|---|---|---|
| `mark.svg` | SVG | scalable | **Primary.** Full palette. Use everywhere by default — IG avatar, website header, poster, hangtag. |
| `mark-coral.svg` | SVG | scalable | Monochrome coral. Foil-stamp print, single-color signage, ink on cream paper. |
| `mark-indigo.svg` | SVG | scalable | Monochrome indigo. Dark-on-light alternate. |
| `mark-cream.svg` | SVG | scalable | Cream petals. Reversed treatment for IG dark mode / full-bleed coral surfaces. |
| `mark-1024.png` | PNG | 1024×1024 | High-res raster for print, social uploads, slide decks. |
| `mark-512.png`  | PNG | 512×512  | Mid-size raster. Most common social-export size. |
| `mark-favicon-180.png` | PNG | 180×180 | Favicon, iOS home-screen icon. |

## In code

**HTML / website**

```html
<img src="/assets/logo/mark.svg" alt="Studio Bluemli" width="40" height="40">
```

**Favicon**

```html
<link rel="icon" type="image/svg+xml" href="/assets/logo/mark.svg">
<link rel="apple-touch-icon" href="/assets/logo/mark-favicon-180.png">
```

**Lockup with the wordmark**

```html
<a href="/" class="logo-lockup">
  <img src="/assets/logo/mark.svg" alt="" width="40" height="40">
  <span class="wordmark">Studio Bluemli</span>
</a>

<style>
  .logo-lockup { display: inline-flex; align-items: center; gap: 12px; text-decoration: none; }
  .wordmark {
    font-family: "Bagel Fat One", system-ui, sans-serif;
    font-size: 28px;
    color: #D6553B;       /* --coral-500 */
    letter-spacing: -0.02em;
    line-height: 1;
  }
</style>
```

## Rules (short version — full version in the root README)

- **Clearspace**: one petal-width of breathing room around the mark.
- **Minimum size**: 16px. Below that, use `mark-coral.svg`.
- **Petal order is fixed**. Don't reorder. Don't rotate. Don't skew.
- **Don't add a center bead.** The open center is the mark.
- **Don't place on busy photography.** Use cream paper or a solid brand color.
