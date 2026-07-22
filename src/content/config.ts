import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional().default(''),
    tags: z
      .string()
      .transform((s) => s.split(',').map((t) => t.trim()).filter(Boolean)),
    image: z.string().optional().default(''),
    summary: z.string().optional().default(''),
    featured: z.boolean().optional().default(false),
    order: z.number().optional().default(0),
  }),
});

export const collections = { works };
