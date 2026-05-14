// src/lib/popups.ts — Phase 3 PAG-03 / D-06, D-11.
// TZ-aware upcoming-vs-past split for the popups collection.
//
// REVIEWS-MODE Concern 2 fix: this module ORDERS and BUCKETS popups using
// Temporal.PlainDate built from `date` (YYYY-MM-DD) ONLY. The `start_time`
// and `end_time` fields are FREE-FORM display strings ("11am", "11:00 AM",
// "11:00") and are NEVER parsed as Date components anywhere in this module.
// The original plan composed a Date from `${date}T${startTime}:00` which NaNs
// on "11am" — that anti-pattern is forbidden here.
//
// Consumed by:
//   - src/pages/index.astro (mini-callout: needs `hasUpcoming` + `soonest`)
//   - src/pages/popups.astro (full layout: needs `soonest` + `alsoComing` + `past`)
//
// Computed at BUILD TIME ONLY (Astro page frontmatter, never the browser).
// `temporal-polyfill` is consumed here only — no Temporal.* type leaks
// across the function boundary (Anti-Pattern: "do not JSON.stringify
// Temporal objects"; pages get plain CollectionEntry<'popups'> arrays).

import { Temporal } from 'temporal-polyfill';
import type { CollectionEntry } from 'astro:content';

type Popup = CollectionEntry<'popups'>;

const ZONE = 'America/Los_Angeles';

/**
 * Returns the LA-local "today" as a Temporal.PlainDate.
 * Computed once per call; safe to call from anywhere in this module.
 */
function todayInLA(): Temporal.PlainDate {
  return Temporal.Now.plainDateISO(ZONE);
}

/**
 * Parses a popup's effective end date (end_date if present, otherwise date)
 * as a Temporal.PlainDate. Both fields are YYYY-MM-DD strings per the
 * Phase 2 schema (CNT-04, CNT-05), so Temporal.PlainDate.from() is exact.
 *
 * NOTE (Concern 2): start_time / end_time are NEVER consulted here. The
 * cutoff is date-only — popups stay "upcoming" all day in LA on their date.
 */
function popupEndDate(p: Popup): Temporal.PlainDate {
  return Temporal.PlainDate.from(p.data.end_date ?? p.data.date);
}

/** Sort ascending by event date. Date-only — start_time NOT consulted. */
function byDateAsc(a: Popup, b: Popup): number {
  return Temporal.PlainDate.compare(
    Temporal.PlainDate.from(a.data.date),
    Temporal.PlainDate.from(b.data.date),
  );
}

export function splitPopups(entries: Popup[]): {
  soonest:     Popup | null;
  alsoComing:  Popup[];
  past:        Popup[];
  hasUpcoming: boolean;
  hasMultiple: boolean;
} {
  const today = todayInLA();

  const upcoming: Popup[] = [];
  const past:     Popup[] = [];
  for (const e of entries) {
    if (Temporal.PlainDate.compare(popupEndDate(e), today) < 0) {
      past.push(e);
    } else {
      upcoming.push(e);
    }
  }

  upcoming.sort(byDateAsc);
  past.sort((a, b) => byDateAsc(b, a)); // newest-first for past archive

  return {
    soonest:     upcoming[0] ?? null,
    alsoComing:  upcoming.slice(1),
    past,
    hasUpcoming: upcoming.length > 0,
    hasMultiple: upcoming.length >= 2,
  };
}
