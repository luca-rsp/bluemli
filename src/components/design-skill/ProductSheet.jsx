/* eslint-disable */
import React from 'react';
function ProductSheet({ product, onClose }) {
  if (!product) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(43, 32, 20, 0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'sheet-in 220ms var(--ease-soft)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--cream-100)',
        borderRadius: 28,
        maxWidth: 760, width: '100%',
        boxShadow: 'var(--shadow-lg)',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        overflow: 'hidden', position: 'relative',
      }}>
        <button onClick={onClose} aria-label="close" style={{
          position: 'absolute', top: 14, right: 14, zIndex: 2,
          width: 36, height: 36, borderRadius: 999, border: 0,
          background: 'var(--cream-50)', color: 'var(--indigo-700)',
          fontSize: 18, cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
        }}>×</button>

        <div style={{ background: 'var(--cream-200)' }}>
          <img src={product.img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>

        <div style={{ padding: '36px 32px 32px' }}>
          <div className="eyebrow" style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--olive-500)' }}>
            one of a kind
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 44, color: 'var(--coral-500)', margin: '8px 0 4px', lineHeight: 1 }}>
            {product.name}
          </h2>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 22, color: 'var(--indigo-700)' }}>
            ${product.price}
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.55, color: 'var(--indigo-500)', marginTop: 16 }}>
            Cluster of glass and seed beads on a sterling silver hoop, lightweight (under ¼ ounce per pair). About 2 inches long.
            Hand-assembled this week in the NoPa studio.
          </p>

          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="primary">request this pair</Button>
            <Button variant="ghost">see at the next pop-up</Button>
          </div>

          <div style={{
            marginTop: 22, padding: '12px 14px', background: 'var(--cream-50)',
            borderRadius: 14, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ink-600)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Mark.Heart size={14} color="var(--coral-500)" />
            <span>Pickup at the studio in NoPa, or grab at the next pop-up.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductSheet;
