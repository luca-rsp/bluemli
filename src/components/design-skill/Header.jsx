/* eslint-disable */
import React from 'react';
function Header({ active = 'home', onNav }) {
  const links = [
    ['home', 'home'],
    ['gallery', 'gallery'],
    ['pop-ups', 'pop-ups'],
    ['say hi', 'say hi'],
  ];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(245, 220, 199, 0.92)',


      padding: '14px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <a href="#home" onClick={(e) => { e.preventDefault(); onNav && onNav('home'); }}
         style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', lineHeight: 1 }}>
        <img src="/mark.svg" alt="" width="34" height="34" />
        <span style={{ fontFamily: 'var(--font-wordmark)', fontSize: 28, color: 'var(--coral-500)', letterSpacing: '-0.02em', lineHeight: 1 }}>Studio Bluemli</span>
      </a>
      <nav style={{ display: 'flex', gap: 22 }}>
        {links.map(([id, label]) => (
          <a key={id} href={`#${id}`}
             onClick={(e) => { e.preventDefault(); onNav && onNav(id); }}
             style={{
               fontFamily: 'var(--font-body)',
               fontWeight: active === id ? 800 : 600,
               fontSize: 14,
               color: active === id ? 'var(--coral-500)' : 'var(--indigo-500)',
               textDecoration: 'none',
               position: 'relative',
               paddingBottom: 4,
             }}>
            {label}
            {active === id && <Mark.Underline />}
          </a>
        ))}
      </nav>
    </header>
  );
}
export default Header;
