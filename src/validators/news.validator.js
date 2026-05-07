import { z } from 'zod';

const newsRequestSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

const searchNewsRequestSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({
    keyword: z.string().trim().min(1, 'Keyword is required for search'),
  }),
});

const articleTrackingRequestSchema = z.object({
  body: z.object({
    articleId: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1, 'Title is required'),
    url: z.string().trim().url('URL must be valid'),
  }),
  query: z.object({}).passthrough(),
  params: z.object({
    id: z.string().trim().min(1, 'Article ID param is required'),
  }),
});

export {
  newsRequestSchema,
  searchNewsRequestSchema,
  articleTrackingRequestSchema,
};
