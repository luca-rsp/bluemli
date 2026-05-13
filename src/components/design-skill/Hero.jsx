/* eslint-disable */
import React from 'react';
function Hero({ onCTA }) {
  return (
    <section id="home" style={{
      minHeight: 560,
      padding: '80px 32px 56px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center',
    }}>
      <div className="eyebrow" style={{
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 800, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: 'var(--olive-500)', marginBottom: 16, whiteSpace: 'nowrap',
      }}>Studio Bluemli · NoPa, San Francisco</div>

      <img src="/mark.svg" alt="" width="72" height="72" style={{ marginBottom: 18 }} />

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 56,
        lineHeight: 1.6,
        color: 'var(--coral-500)',
        margin: '0 0 36px',
        maxWidth: 680,
      }}>
        bright, beaded,<br/>one of a kind
      </h1>

      <div style={{
        fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.5,
        color: 'var(--indigo-500)', maxWidth: 560, margin: '0 0 32px',
      }}>
        Hand-assembled earrings, made in NoPa. Sold at markets, pop-ups, and by appointment.
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="primary" size="lg" onClick={() => onCTA && onCTA('gallery')}>see the gallery</Button>
        <Button variant="secondary" size="lg" onClick={() => onCTA && onCTA('pop-ups')}>next pop-up</Button>
      </div>

      <div style={{ marginTop: 48 }}>
        <BeadCluster size={56} seed={3} count={9} />
      </div>
    </section>
  );
}
export default Hero;
