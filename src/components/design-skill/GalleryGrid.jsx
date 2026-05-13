/* eslint-disable */
import React from 'react';
const PRODUCTS = [
  { id: 1, img: '../../assets/product/earrings-01-orange.jpg', name: 'Sunset Cluster',   price: 48, tags: ['new', 'under-50'] },
  { id: 2, img: '../../assets/product/earrings-02-pink.jpg',   name: 'Blue Saturn',      price: 64, tags: ['one-of-a-kind'] },
  { id: 3, img: '../../assets/product/earrings-03-red.jpg',    name: 'Pearl Pop',        price: 78, tags: ['new'] },
  { id: 4, img: '../../assets/product/earrings-04-sage.jpg',   name: 'Confetti #04',     price: 42, tags: ['under-50'] },
  { id: 5, img: '../../assets/product/earrings-05-teal.jpg',   name: 'Citrus Drop',      price: 52, tags: ['one-of-a-kind'] },
  { id: 6, img: '../../assets/product/earrings-06-lavender.jpg', name: 'Smiley Cluster',  price: 68, tags: ['new', 'one-of-a-kind'] },
];

const FILTERS = [
  { id: 'all', label: 'everything' },
  { id: 'new', label: 'new' },
  { id: 'under-50', label: 'under $50' },
  { id: 'one-of-a-kind', label: 'one of a kind' },
];

function ProductCard({ p, onOpen }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={() => onOpen && onOpen(p)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--cream-50)',
        border: 0, padding: 0, textAlign: 'left', cursor: 'pointer',
        borderRadius: 22, overflow: 'hidden', boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition: 'transform 220ms var(--ease-soft), box-shadow 220ms var(--ease-soft)',
        fontFamily: 'var(--font-body)',
      }}>
      <div style={{ aspectRatio: '4 / 5', background: 'var(--cream-200)', overflow: 'hidden' }}>
        <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ padding: '14px 18px 18px' }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--indigo-700)' }}>{p.name}</div>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--ink-600)' }}>
          <span style={{ fontWeight: 800, color: 'var(--coral-500)' }}>${p.price}</span>
          <span style={{ color: 'var(--ink-400)' }}>·</span>
          <span>one pair</span>
          {p.tags.includes('new') && <span style={{
            marginLeft: 'auto', background: 'var(--mustard-500)', color: 'var(--ink-900)',
            fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 999,
          }}>new</span>}
        </div>
      </div>
    </button>
  );
}

function GalleryGrid({ onOpen }) {
  const [filter, setFilter] = React.useState('all');
  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.tags.includes(filter));
  return (
    <section id="gallery" style={{ padding: '32px 32px 64px' }}>
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

      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const active = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13,
                padding: '8px 16px', borderRadius: 999, border: 0, cursor: 'pointer',
                background: active ? 'var(--coral-500)' : 'var(--cream-50)',
                color: active ? 'var(--cream-50)' : 'var(--indigo-500)',
                boxShadow: active ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
                transition: 'all 140ms var(--ease-soft)',
              }}>{f.label}</button>
          );
        })}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
        maxWidth: 1080, margin: '0 auto',
      }}>
        {filtered.map(p => <ProductCard key={p.id} p={p} onOpen={onOpen} />)}
      </div>
    </section>
  );
}

export default GalleryGrid;
export default PRODUCTS;
