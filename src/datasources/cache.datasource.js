import NodeCache from 'node-cache';
import env from '../config/env.js';
import { CACHE_CHECK_PERIOD_SECONDS } from '../constants/constants.js';

const cache = new NodeCache({
  stdTTL: env.CACHE_TTL_SECONDS,
  checkperiod: env.NODE_ENV === 'test' ? 0 : CACHE_CHECK_PERIOD_SECONDS,
});

const get = (key) => cache.get(key);
const set = (key, value, ttl) => cache.set(key, value, ttl);
const del = (key) => cache.del(key);
const flush = () => cache.flushAll();

/**
 * Delete all keys that start with the given prefix.
 * @param {string} prefix
 */
const delByPrefix = (prefix) => {
  const toDelete = cache.keys().filter((k) => k.startsWith(prefix));
  if (toDelete.length) cache.del(toDelete);
};

export {
  get,
  set,
  del,
  flush,
  delByPrefix,
};
