/* eslint-disable */
import React from 'react';
import Button from './Button';

function AppointmentForm() {
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontFamily: 'var(--font-body)',
    fontSize: 16,
    color: 'var(--color-fg)',
    background: 'var(--cream-50)',
    border: 'none',
    borderBottom: '2px solid var(--color-border-soft)',
    // NOTE: FND-13 requires :focus-visible to show. Do not suppress the outline
    // here — the global :focus-visible rule (Plan 04 Task 2, BaseLayout
    // <style is:global>) supplies the visible outline.
    borderRadius: 4,
  };
  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: 'var(--color-fg-muted)',
    marginBottom: 4,
  };

  return (
    <section id="say-hi" style={{ padding: '40px 32px 80px', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--olive-500)', marginBottom: 8 }}>say hi</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 48, lineHeight: 1.2, color: 'var(--coral-500)', margin: 0 }}>let's talk earrings</h2>
      </div>
      <form method="POST" action="/api/contact" style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
        <div>
          <label style={labelStyle} htmlFor="say-hi-name">your name</label>
          <input id="say-hi-name" name="name" style={inputStyle} placeholder="first name is fine" />
        </div>
        <div>
          <label style={labelStyle} htmlFor="say-hi-email">email</label>
          <input id="say-hi-email" name="email" type="email" style={inputStyle} placeholder="you@somewhere.nice" />
        </div>
        <div>
          <label style={labelStyle} htmlFor="say-hi-notes">what are you hoping for?</label>
          <textarea id="say-hi-notes" name="notes" rows={4} style={{ ...inputStyle, resize: 'vertical' }} placeholder="a particular color, a gift, just looking…" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <Button variant="primary" size="lg" type="submit">send</Button>
        </div>
      </form>
    </section>
  );
}

export default AppointmentForm;
