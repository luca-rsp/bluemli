/* eslint-disable */
import React from 'react';
function PopupStrip({ onAppointment }) {
  return (
    <section id="pop-ups" style={{
      margin: '40px 24px',
      padding: '56px 32px 56px',
      background: 'var(--cream-50)',
      borderRadius: 32,
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Color stripe (real brand swatches, not flowers) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 8,
        display: 'flex',
      }}>
        {['--coral-500','--pink-500','--mustard-500','--olive-500','--indigo-500','--lavender-500'].map((c, i) => (
          <div key={i} style={{ flex: 1, background: `var(${c})` }} />
        ))}
      </div>

      <div className="eyebrow" style={{
        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 800, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: 'var(--olive-500)', marginBottom: 10,
      }}>next pop-up</div>

      <h2 style={{ position: 'relative', display: 'inline-block', fontFamily: 'var(--font-display)', fontSize: 80, color: 'var(--pink-500)', margin: '0 0 4px', lineHeight: 1 }}>
        pop-up
        <Mark.Underline color="var(--pink-500)" />
      </h2>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--olive-500)', lineHeight: 1.2, marginTop: 14 }}>
        at <span style={{ color: 'var(--indigo-500)' }}>NOPA block party</span>
      </div>

      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 18, color: 'var(--indigo-700)', marginTop: 14 }}>
        Saturday, June 6 · 10–2 pm
      </div>

      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center', gap: 14 }}>
        <Button variant="primary" onClick={() => onAppointment && onAppointment()}>book by appointment</Button>
        <Button variant="ghost">add to calendar</Button>
      </div>
    </section>
  );
}
export default PopupStrip;
