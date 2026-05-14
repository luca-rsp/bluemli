/* eslint-disable */
import React from 'react';
import Mark from './Mark';

function PopupStrip({ popup }) {
  // popup: { name, date (ISO), startTime "HH:MM", endTime "HH:MM", tz, location }
  // The "next pop-up" eyebrow + the popup data render the same strip the design
  // skill demoed — but the values come from the prop (D-01: demo-loaded → real Phase 3 data).
  const dateLabel = (() => {
    if (!popup || !popup.date) return '';
    // REVIEWS-MODE Concern 2 fix: build the Date from `popup.date` ALONE (UTC
    // midnight of the YYYY-MM-DD string). Intl.DateTimeFormat with the popup's
    // timeZone resolves the displayed weekday correctly. popup.startTime is
    // a free-form display string ("11am") and is NEVER fed into a Date — it
    // would NaN. The time portion is rendered separately via timeLabel below.
    try {
      const d = new Date(popup.date);
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
        timeZone: popup.tz || 'America/Los_Angeles',
      }).format(d);
    } catch { return popup.date; }
  })();
  const timeLabel = popup && popup.startTime && popup.endTime
    ? `${popup.startTime}–${popup.endTime}`
    : '';

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
        at <span style={{ color: 'var(--indigo-500)' }}>{popup?.location || 'TBD'}</span>
      </div>

      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 18, color: 'var(--indigo-700)', marginTop: 14 }}>
        {dateLabel}{timeLabel ? ` · ${timeLabel}` : ''}
      </div>
    </section>
  );
}

export default PopupStrip;
