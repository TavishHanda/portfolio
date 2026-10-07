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
    meta: z.string(),         // small line under the title, e.g. "2026 · Live"
    tags: z.array(z.string()),
    shot: z.string(),         // label shown on the image placeholder
    order: z.number(),        // lower numbers show first
    links: z
      .array(z.object({ label: z.string(), href: z.string().url() }))
      .default([]),
  }),
});

export const collections = { projects };
