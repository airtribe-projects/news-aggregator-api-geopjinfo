import { z } from 'zod';

const registerRequestSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

const loginRequestSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export {
  registerRequestSchema,
  loginRequestSchema,
};
