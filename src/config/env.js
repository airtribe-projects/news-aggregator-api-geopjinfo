import 'dotenv/config.js';
import { z } from 'zod';

const rawEnv = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  NEWS_API_KEY: process.env.NEWS_API_KEY,
  NEWS_API_BASE_URL: process.env.NEWS_API_BASE_URL,
  NEWS_API_PAGE_SIZE: process.env.NEWS_API_PAGE_SIZE,
  NEWS_API_TIMEOUT_MS: process.env.NEWS_API_TIMEOUT_MS,
  CACHE_TTL_SECONDS: process.env.CACHE_TTL_SECONDS,
  CACHE_REFRESH_INTERVAL_MS: process.env.CACHE_REFRESH_INTERVAL_MS,
  LOG_LEVEL: process.env.LOG_LEVEL,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('1h'),
  NEWS_API_KEY: z.string().default(''),
  NEWS_API_BASE_URL: z.string().url().default('https://newsapi.org/v2'),
  NEWS_API_PAGE_SIZE: z.coerce.number().int().positive().default(20),
  NEWS_API_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(900),
  CACHE_REFRESH_INTERVAL_MS: z.coerce.number().int().positive().default(900000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

const parsed = envSchema.safeParse(rawEnv);
if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`);
  throw new Error(`Invalid environment configuration:\n${issues.join('\n')}`);
}

const env = parsed.data;

if (env.NODE_ENV !== 'test') {
  const missingRequired = [];
  if (!env.MONGODB_URI) missingRequired.push('MONGODB_URI');
  if (!env.JWT_SECRET) missingRequired.push('JWT_SECRET');
  if (missingRequired.length > 0) {
    throw new Error(`Missing required environment variables: ${missingRequired.join(', ')}`);
  }
}

if (!env.MONGODB_URI) {
  env.MONGODB_URI = 'mongodb://localhost:27017/news_aggregator';
}
if (!env.JWT_SECRET) {
  env.JWT_SECRET = 'news-aggregator-test-secret';
}

export default env;
