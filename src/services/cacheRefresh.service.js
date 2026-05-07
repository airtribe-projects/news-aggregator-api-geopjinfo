import newsRepository from '../repositories/news.repository.js';
import userRepository from '../repositories/user.repository.js';
import logger from '../utils/logger.js';
import env from '../config/env.js';

let intervalHandle = null;

/**
 * Proactively re-fetch and cache top headlines for every user in the database.
 * This keeps the in-memory cache warm so users never hit an empty cache on their
 * first request after a TTL expiry.
 */
const refreshAllUsersCache = async () => {
  logger.info('Background cache refresh: starting');
  try {
    const users = await userRepository.findAll();

    if (users.length === 0) {
      logger.info('Background cache refresh: no users found, skipping');
      return;
    }

    const results = await Promise.allSettled(
      users.map((user) =>
        newsRepository.getTopHeadlines(user.id, user.preferences || {})
      )
    );

    const failed = results.filter((r) => r.status === 'rejected').length;
    logger.info(
      { total: users.length, failed },
      'Background cache refresh: completed'
    );
  } catch (err) {
    logger.error({ err }, 'Background cache refresh: unexpected error');
  }
};

/**
 * Start the background refresh scheduler.
 * Safe to call multiple times — a second call is a no-op if already running.
 * Does nothing in test environments to keep tests deterministic.
 */
const start = () => {
  if (env.NODE_ENV === 'test') return;
  if (intervalHandle) return;

  const interval = env.CACHE_REFRESH_INTERVAL_MS;
  intervalHandle = setInterval(refreshAllUsersCache, interval);

  // Allow Node to exit even if the interval is still active
  if (intervalHandle.unref) intervalHandle.unref();

  logger.info({ intervalMs: interval }, 'Background cache refresh scheduled');
};

/**
 * Stop the background refresh scheduler.
 */
const stop = () => {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
};

export default { start, stop, refreshAllUsersCache };
