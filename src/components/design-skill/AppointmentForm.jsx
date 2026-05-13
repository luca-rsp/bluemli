/* eslint-disable */
import React from 'react';
function AppointmentForm() {
  const [state, setState] = React.useState({ name: '', email: '', notes: '', sent: false });
  function update(k, v) { setState(s => ({ ...s, [k]: v })); }
  function submit(e) {
    e.preventDefault();
    setState(s => ({ ...s, sent: true }));
  }

  const inputStyle = {
    background: 'var(--cream-50)', borderRadius: 14, padding: '14px 16px',
    fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--indigo-700)',
    boxShadow: 'var(--shadow-xs)', border: 0, outline: 0, width: '100%',
    boxSizing: 'border-box',
  };
  const labelStyle = { fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, color: 'var(--ink-900)', display: 'block', marginBottom: 6, letterSpacing: 0 };

  if (state.sent) {
    return (
      <section id="say hi" style={{ textAlign: 'center', padding: '48px 32px 80px', maxWidth: 540, margin: '0 auto', position: 'relative' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 64, color: 'var(--coral-500)', margin: 0 }}>thank you!</h2>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--indigo-500)', marginTop: 8 }}>
          (I'll write back within a day or two — promise.)
        </div>
        <Mark.Heart size={36} color="var(--coral-500)" />
      </section>
    );
  }

  return (
    <section id="say hi" style={{ padding: '40px 32px 80px', maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
      <div className="eyebrow" style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--olive-500)', marginBottom: 10 }}>say hi</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 56, color: 'var(--coral-500)', margin: '0 0 10px', lineHeight: 1 }}>
        by appointment
      </h2>
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 20, color: 'var(--indigo-500)', marginBottom: 28 }}>
        (or just to chat about beads — I love that too)
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
        <div>
          <label style={labelStyle}>your name</label>
          <input style={inputStyle} value={state.name} onChange={e => update('name', e.target.value)} placeholder="first name is fine" />
        </div>
        <div>
          <label style={labelStyle}>email</label>
          <input style={inputStyle} value={state.email} onChange={e => update('email', e.target.value)} placeholder="you@somewhere.nice" type="email" />
        </div>
        <div>
          <label style={labelStyle}>what are you hoping for?</label>
          <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }} value={state.notes} onChange={e => update('notes', e.target.value)} placeholder="a particular color, a gift, just looking…" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <Button variant="primary" size="lg" type="submit">send</Button>
        </div>
      </form>
    </section>
  );
}
export default AppointmentForm;
