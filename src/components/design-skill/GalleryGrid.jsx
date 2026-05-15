/* eslint-disable */
import React from 'react';

/**
 * @typedef {Object} GalleryGridPiece
 * @property {string} slug - Astro v2 entry.id (mapped in gallery.astro)
 * @property {string} name
 * @property {number} price
 * @property {string} status
 * @property {string} photo
 */

/**
 * GalleryGrid renders a responsive grid of gallery pieces.
 * Each item's `slug` is the Astro v2 entry.id value mapped by gallery.astro.
 *
 * @param {{ pieces?: GalleryGridPiece[] }} props
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 24,
      }}>
        {pieces.map((piece) => (
          <a key={piece.slug} href={`/gallery/${piece.slug}`} className="card" data-umami-event="gallery_card_click" style={{
            background: 'var(--color-surface-card)',
            borderRadius: 8,
            overflow: 'hidden',
            display: 'block',
            textDecoration: 'none',
            color: 'inherit',
          }}>
            <img src={piece.photo} alt={piece.name} width={400} height={500}
                 loading="lazy" decoding="async"
                 style={{ width: '100%', height: 'auto', aspectRatio: '4/5', objectFit: 'cover', display: 'block', background: 'var(--cream-200)' }} />
            <div style={{ padding: '12px 16px 16px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 700, color: 'var(--color-fg-strong)', marginBottom: 4 }}>{piece.name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: 'var(--font-body)', fontSize: 14 }}>
                <span style={{ fontWeight: 700, color: 'var(--color-fg-strong)' }}>${piece.price}</span>
                <span className={`card-status ${piece.status}`}>
                  {piece.status === 'available' ? 'Available' : piece.status === 'sold' ? 'Sold' : piece.status === 'one-of-one' ? 'One of one' : 'Reserved'}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default GalleryGrid;
