// src/sample-data.ts — Phase 1 placeholder content (D-02, D-03)
//
// IMPORTANT: Phase 2 deletes this file when real Content Collections come online.
// All names start with "Sample" and all prices are 0 so the sample-data leak CI rule (Rule 7,
// commented out in Phase 1 and uncommented in Phase 2) fires if any of this survives into
// src/content/.

export type GalleryPiece = {
  slug: string;
  name: string;
  price: number;
  status: 'available' | 'sold' | 'one-of-one' | 'reserved';
  photo: string;
};

export type Popup = {
  name: string;
  date: string;          // ISO date
  startTime: string;     // "HH:MM"
  endTime: string;       // "HH:MM"
  tz: 'America/Los_Angeles';
  location: string;
};

export const sampleGallery: GalleryPiece[] = [
  // REVIEW FIX M3: photo paths point at SVG placeholders (not WebPs).
  // Plan 03 ships public/sample/cluster-{coral,sage,lemon}.svg — no sharp dep needed.
  { slug: 'sample-cluster-coral', name: 'Sample Piece A', price: 0, status: 'available',  photo: '/sample/cluster-coral.svg' },
  { slug: 'sample-cluster-sage',  name: 'Sample Piece B', price: 0, status: 'sold',       photo: '/sample/cluster-sage.svg'  },
  { slug: 'sample-cluster-lemon', name: 'Sample Piece C', price: 0, status: 'one-of-one', photo: '/sample/cluster-lemon.svg' },
];

export const sampleNextPopup: Popup = {
  name: 'Sample Pop-up — NoPa Block Party',
  date: '2026-06-15',
  startTime: '10:00',
  endTime: '14:00',
  tz: 'America/Los_Angeles',
  location: 'NoPa Block Party',
};
