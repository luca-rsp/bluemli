/* eslint-disable */
import React from 'react';
import Mark from './Mark';
function About() {
  return (
    <section style={{
      maxWidth: 720, margin: '0 auto', padding: '64px 32px 32px', textAlign: 'center',
    }}>
      <div className="eyebrow" style={{
        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--olive-500)', marginBottom: 14,
      }}>about the studio</div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 56, color: 'var(--coral-500)', margin: '0 0 22px', lineHeight: 1.05 }}>
        hand-assembled, one&nbsp;pair at&nbsp;a&nbsp;time
      </h2>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.55,
        color: 'var(--indigo-500)', maxWidth: 560, margin: '0 auto 28px',
        textWrap: 'pretty',
      }}>
        I make earrings out of a little studio in NOPA, San Francisco — sourced glass, seed beads, vintage findings.
        Every pair is one-of-a-kind, and once it's gone, it's gone.
      </p>

      <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--ink-600)', fontFamily: 'var(--font-hand)', fontSize: 18 }}>
        — the founder <Mark.Heart color="var(--coral-500)" />
      </div>
    </section>
  );
}
export default About;
