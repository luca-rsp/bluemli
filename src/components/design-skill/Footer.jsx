/* eslint-disable */
import React from 'react';
function Footer() {
  return (
    <footer style={{
      padding: '48px 32px 56px',
      textAlign: 'center',
      borderTop: 'none',
      position: 'relative',
    }}>
      <Mark.Dots count={9} />
      <div style={{ marginTop: 22, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <img src="/mark.svg" alt="Studio Bluemli" width="56" height="56" />
        <div style={{ fontFamily: 'var(--font-wordmark)', fontSize: 28, color: 'var(--coral-500)', lineHeight: 1, letterSpacing: '-0.02em' }}>Studio Bluemli</div>
      </div>
      <div style={{ marginTop: 6, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--indigo-500)' }}>
        hand-assembled earrings · made in NoPa, San Francisco
      </div>

      <div style={{ marginTop: 22, display: 'flex', justifyContent: 'center', gap: 22, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--indigo-500)' }}>
        <a href="https://instagram.com/studio_bluemli" target="_blank" rel="noreferrer" style={{ color: 'var(--coral-500)' }}>@studio_bluemli</a>
        <span style={{ color: 'var(--ink-400)' }}>·</span>
        <a href="mailto:hello@studiobluemli.com" style={{ color: 'var(--coral-500)' }}>hello@studiobluemli.com</a>
        <span style={{ color: 'var(--ink-400)' }}>·</span>
        <span style={{ color: 'var(--olive-500)', fontWeight: 700 }}>NoPa, San Francisco</span>
      </div>

      <div style={{ marginTop: 24, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--ink-600)', letterSpacing: '0.04em' }}>
        © 2026 Studio Bluemli · all pairs one of a kind
      </div>
    </footer>
  );
}
export default Footer;
