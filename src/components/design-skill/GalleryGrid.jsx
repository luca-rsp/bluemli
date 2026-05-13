/* eslint-disable */
import React from 'react';

/**
 * GalleryGrid renders a responsive grid of gallery pieces.
 *
 * The `pieces` prop is intentionally typed with a permissive shape (each item
 * has slug/name/price/status/photo) rather than imported from src/sample-data.ts —
 * Phase 2 replaces sample-data with the real `gallery` Content Collection and
 * the per-item shape there will be similar but not identical. This JSDoc
 * typedef exists so `astro check` does not infer the default `[]` as `never[]`
 * and reject callers like `<GalleryGrid pieces={sampleGallery} />`.
 *
 * @typedef {Object} GalleryGridPiece
 * @property {string} slug
 * @property {string} name
 * @property {number} price
 * @property {'available' | 'sold' | 'one-of-one' | 'reserved'} status
 * @property {string} photo
 *
 * @typedef {Object} GalleryGridProps
 * @property {Array<GalleryGridPiece>} [pieces]
 *
 * @param {GalleryGridProps} props
 */
function GalleryGrid({ pieces = [] }) {
  return (
    <section id="gallery" style={{
      padding: '40px 32px 80px',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="eyebrow" style={{
          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--olive-500)', marginBottom: 10,
        }}>the gallery</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 64, color: 'var(--coral-500)', margin: '0 0 6px', lineHeight: 1 }}>
          this week's pairs
        </h2>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 20, color: 'var(--indigo-500)' }}>
          (once they're gone, they're gone)
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 24,
      }}>
        {pieces.map((piece) => (
          <article key={piece.slug} style={{
            background: 'var(--color-surface-card)',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            <img src={piece.photo} alt={piece.name} width={400} height={500}
                 style={{ width: '100%', height: 'auto', aspectRatio: '4/5', objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '12px 16px 16px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: 'var(--color-fg-strong)' }}>{piece.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-fg-muted)' }}>
                <span>${piece.price}</span>
                <span>{piece.status === 'available' ? 'Available' : piece.status === 'sold' ? 'Sold' : piece.status === 'one-of-one' ? 'One of one' : 'Reserved'}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default GalleryGrid;
