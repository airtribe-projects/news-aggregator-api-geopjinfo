import env from '../config/env.js';
import { HTTP_STATUS, ERROR_CODES } from '../constants/constants.js';

// In-memory store: ip → { count, resetAt }
const store = new Map();

// Purge entries whose window has already expired to prevent unbounded growth.
// Runs at most once per request, only when the store has grown large.
const PURGE_THRESHOLD = 10000;
const maybePurge = (now) => {
  if (store.size < PURGE_THRESHOLD) return;
  for (const [key, record] of store) {
    if (now > record.resetAt) store.delete(key);
  }
};

const rateLimitMiddleware = (req, res, next) => {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const maxRequests = env.RATE_LIMIT_MAX_REQUESTS;

  maybePurge(now);

  let record = store.get(key);
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
  }

  record.count += 1;
  store.set(key, record);

  if (record.count > maxRequests) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    res.set('Retry-After', String(retryAfterSec));
    return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: {
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        message: 'Too many requests, please try again later.',
        retryAfterSeconds: retryAfterSec,
      },
    });
  }

  next();
};

export default rateLimitMiddleware;
