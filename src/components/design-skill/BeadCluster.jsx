/* eslint-disable */
import React from 'react';
// A small cluster of colored circles — a literal nod to a beaded earring, used SPARINGLY.
// Default palette draws from the brand's product palette.
const BEAD_PALETTE = [
  'var(--coral-500)','var(--pink-500)','var(--mustard-500)','var(--olive-500)',
  'var(--indigo-500)','var(--lavender-500)','var(--coral-300)','var(--pink-200)',
];

// A fixed-seed pseudo-random arrangement so it renders consistently.
function makeBeads(seed = 1, count = 7) {
  let n = seed * 9301 + 49297;
  const rng = () => { n = (n * 9301 + 49297) % 233280; return n / 233280; };
  return Array.from({ length: count }).map(() => ({
    cx: 10 + rng() * 80,
    cy: 10 + rng() * 80,
    r: 4 + rng() * 7,
    fill: BEAD_PALETTE[Math.floor(rng() * BEAD_PALETTE.length)],
  }));
}

function BeadCluster({ size = 72, seed = 1, count = 7 }) {
  const beads = React.useMemo(() => makeBeads(seed, count), [seed, count]);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      {beads.map((b, i) => <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={b.fill} />)}
    </svg>
  );
}

export default BeadCluster;
