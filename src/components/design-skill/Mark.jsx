/* eslint-disable */
import React from 'react';
// Decorative marks — sparkle, heart, hand-drawn underline, dot row, olive rule.
const Mark = {
  Underline: ({ color = "var(--coral-500)", thickness = 2.5 }) => (
    <svg viewBox="0 0 200 14" preserveAspectRatio="none"
         style={{ position: 'absolute', left: 0, right: 0, bottom: -6, width: '100%', height: 14, pointerEvents: 'none' }}>
      <path d="M2 7 Q 50 13, 100 6 T 198 7" stroke={color} strokeWidth={thickness} fill="none" strokeLinecap="round" />
    </svg>
  ),
  Sparkle: ({ size = 18, color = "var(--coral-500)" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  Heart: ({ size = 16, color = "var(--coral-500)", filled = true }) => (
    <span style={{ color, fontSize: size, lineHeight: 1 }}>{filled ? '♥' : '♡'}</span>
  ),
  Dots: ({ count = 7 }) => (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: i % 3 === 1 ? 'var(--olive-500)' : 'var(--coral-500)'
        }} />
      ))}
    </div>
  ),
  Rule: ({ width = 70, color = 'var(--olive-500)' }) => (
    <div style={{ width, height: 1.5, background: color, margin: '0 auto', borderRadius: 1 }} />
  ),
};

export default Mark;
