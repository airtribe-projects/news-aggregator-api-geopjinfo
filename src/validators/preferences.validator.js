import { z } from 'zod';
import { CATEGORIES, LANGUAGES, COUNTRIES } from '../constants/constants.js';

const updatePreferencesRequestSchema = z.object({
  body: z
    .object({
      categories: z.array(z.enum(CATEGORIES)).optional(),
      languages: z.array(z.enum(LANGUAGES)).optional(),
      country: z.enum(COUNTRIES).optional(),
      keywords: z.array(z.string().trim().min(1)).optional(),
      sources: z.array(z.string().trim().min(1)).optional(),
    })
    .refine((value) => Object.keys(value).some((key) => value[key] !== undefined), {
      message: 'At least one preference field must be provided',
    }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

const getPreferencesRequestSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export {
  getPreferencesRequestSchema,
  updatePreferencesRequestSchema,
};
