/* eslint-disable */
import React from 'react';
// Pill-shaped buttons. Primary coral, secondary cream, ghost w/ hand underline.
function Button({ variant = 'primary', size = 'md', children, onClick, type = 'button', ...rest }) {
  const sizes = {
    sm: { padding: '8px 14px', fontSize: 12 },
    md: { padding: '12px 22px', fontSize: 14 },
    lg: { padding: '14px 28px', fontSize: 16 },
  };
  const base = {
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    border: 0,
    borderRadius: 999,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'transform 140ms var(--ease-soft), box-shadow 220ms var(--ease-soft), background 140ms var(--ease-soft)',
    ...sizes[size],
  };
  const variants = {
    primary: { background: 'var(--coral-500)', color: 'var(--cream-50)', boxShadow: 'var(--shadow-sm)' },
    secondary: { background: 'var(--cream-50)', color: 'var(--indigo-500)', boxShadow: 'var(--shadow-sm)' },
  };
  const [press, setPress] = React.useState(false);
  if (variant === 'ghost') {
    return (
      <button type={type} onClick={onClick}
              style={{ ...base, background: 'transparent', color: 'var(--coral-500)', padding: '4px 2px', position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              {...rest}>
        <span style={{ position: 'relative', paddingBottom: 4 }}>
          {children}
          <Mark.Underline />
        </span>
      </button>
    );
  }
  return (
    <button type={type} onClick={onClick}
            onPointerDown={() => setPress(true)}
            onPointerUp={() => setPress(false)}
            onPointerLeave={() => setPress(false)}
            style={{ ...base, ...variants[variant], transform: press ? 'scale(0.97)' : 'none' }}
            onMouseEnter={e => { if (variant === 'primary') e.currentTarget.style.background = 'var(--coral-700)'; }}
            onMouseLeave={e => { if (variant === 'primary') e.currentTarget.style.background = 'var(--coral-500)'; }}
            {...rest}>{children}</button>
  );
}
export default Button;
