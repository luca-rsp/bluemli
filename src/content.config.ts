// src/content.config.ts
// Phase 2 (CNT-01..CNT-06): three strict Zod content collections with per-slug
// image co-location for the gallery (CNT-02, D-02). Schema deviations from
// CNT-03 are recorded as D-16 (singular hero, replacing photos: array) and
// D-17 (published_at sort key, replacing the "order or" alternative).
// Popups schema realigned with CNT-05 per D-18 (REVIEWS.md MEDIUM-6):
// description lives in markdown body (not frontmatter); photos: optional image() array.
//
// Task 0 probe OUTCOME A: image() validates HEIC at build time — hero: image() is used.
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const gallery = defineCollection({
  loader: glob({
    base: './src/content/gallery',
    pattern: '*/index.md', // matches cluster-blush/index.md → entry.id = 'cluster-blush'
  }),
  schema: ({ image }) =>
    z
      .object({
        name: z.string(),
        hero: image(), // D-16 / D-02: singular, required; Outcome A — image() supports HEIC
        price: z.number().int().positive(),
        status: z.enum(['available', 'sold', 'one-of-one', 'reserved']), // CNT-10 enum
        description: z.string(),
        featured: z.boolean().default(false), // D-15
        published_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // D-14 / D-17
      })
      .strict(), // Pitfall #11: any unknown key fails the build
});

const popups = defineCollection({
  loader: glob({
    base: './src/content/popups',
    pattern: '*.md', // CNT-04: src/content/popups/YYYY-MM-DD-<slug>.md
  }),
  // D-18 (REVIEWS.md MEDIUM-6): description is markdown body (no schema field needed);
  // photos is optional image() array. Aligns with CNT-05.
  schema: ({ image }) =>
    z
      .object({
        name: z.string(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        end_date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        start_time: z.string(),
        end_time: z.string(),
        tz: z.string().default('America/Los_Angeles'),
        location: z.string(),
        address: z.string().optional(),
        photos: z.array(image()).optional(),
        link: z.string().url().optional(),
      })
      .strict(),
});

const site = defineCollection({
  loader: file('./src/content/site/config.yaml'),
  schema: z
    .object({
      tagline: z.string(),
      contact_email: z.string().email(),
      ig_handle: z.string(),
      ig_dm_url: z.string().url(),
      footer_text: z.string(),
      og_title: z.string(),
      og_description: z.string(),
    })
    .strict(),
});

export const collections = { gallery, popups, site };
