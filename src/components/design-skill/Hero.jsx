/* eslint-disable */
import React from 'react';
import BeadCluster from './BeadCluster';

function Hero() {
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
        fontSize: 'clamp(48px, 8vw, 88px)',
        lineHeight: 1.05,
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
        {/* CTAs are real <a> links, not <Button onClick>. No client: directive,
            so onClick handlers wouldn't fire anyway — a plain anchor navigates. */}
        <a href="/gallery" className="hero-cta-primary" style={{
          display: 'inline-flex', alignItems: 'center',
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16,
          padding: '14px 28px',
          background: 'var(--coral-500)', color: 'var(--cream-50)',
          textDecoration: 'none', borderRadius: 999,
          boxShadow: 'var(--shadow-sm)',
        }}>see the gallery</a>
        <a href="/popups" className="hero-cta-secondary" style={{
          display: 'inline-flex', alignItems: 'center',
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16,
          padding: '14px 28px',
          background: 'transparent', color: 'var(--coral-500)',
          textDecoration: 'none', borderRadius: 999,
          boxShadow: 'inset 0 0 0 2px var(--coral-500)',
        }}>next pop-up</a>
      </div>

      <div style={{ marginTop: 48 }}>
        <BeadCluster size={56} seed={3} count={9} />
      </div>
    </section>
  );
}
export default Hero;
