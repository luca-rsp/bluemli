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
        made by hand
      </h2>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.55,
        color: 'var(--indigo-500)', maxWidth: 560, margin: '0 auto 22px',
        textWrap: 'pretty',
      }}>
        I make earrings out of a tiny studio in NOPA, San Francisco. It started
        as a way to keep my hands busy in the evenings (and to use up a growing
        pile of glass beads I couldn't stop buying), and it slowly turned into
        something I look forward to every day.
      </p>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.55,
        color: 'var(--indigo-500)', maxWidth: 560, margin: '0 auto 22px',
        textWrap: 'pretty',
      }}>
        Each pair is hand-assembled — sourced glass, seed beads, vintage
        findings, and the occasional charm I've been saving for the right
        cluster. Nothing is mass-produced. Once a pair is gone, it's gone.
      </p>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.55,
        color: 'var(--indigo-500)', maxWidth: 560, margin: '0 auto 28px',
        textWrap: 'pretty',
      }}>
        I sell at neighborhood pop-ups around the Bay (and now and then
        further afield) and through DMs on Instagram. If you see a pair you
        love or want to ask about something custom, say hi.
      </p>

      <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--ink-600)', fontFamily: 'var(--font-hand)', fontSize: 22 }}>
        made with love from NOPA <Mark.Heart color="var(--coral-500)" filled={false} />
      </div>
    </section>
  );
}
export default About;
