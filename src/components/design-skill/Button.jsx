/* eslint-disable */
import React from 'react';
import Mark from './Mark';

// Pill-shaped buttons. Primary coral, secondary cream, ghost w/ hand underline.
// Hover and press visuals live in src/styles/components.css under `.btn-primary`
// (CSS-only — JS hover handlers would never fire without a client: directive).
function Button({ variant = 'primary', size = 'md', children, type = 'button', ...rest }) {
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
  if (variant === 'ghost') {
    return (
      <button type={type}
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
    <button type={type}
            className={variant === 'primary' ? 'btn-primary' : undefined}
            style={{ ...base, ...variants[variant] }}
            {...rest}>{children}</button>
  );
}
export default Button;
