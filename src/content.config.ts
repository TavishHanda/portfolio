import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Each project is a Markdown file in src/content/projects.
// The frontmatter is checked against this schema at build time,
// so a typo in a field name fails the build instead of rendering blank.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),   // the big text in the pinned column
    meta: z.string(),         // small line under the title, e.g. "Team of five, 2025"
    tags: z.array(z.string()),
    order: z.number(),        // lower numbers show first
    featured: z.boolean(),    // true = big scrolling card, false = "More projects" list
    summary: z.string().optional(), // one line for the "More projects" list
    liveSummaryUrl: z.string().url().optional(), // an /api/summary endpoint to show live numbers from
    links: z
      .array(z.object({ label: z.string(), href: z.string().url() }))
      .default([]),
  }),
});

export const collections = { projects };
