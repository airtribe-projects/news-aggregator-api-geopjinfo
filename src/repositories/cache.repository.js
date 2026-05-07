import * as cacheDatasource from '../datasources/cache.datasource.js';
import { NEWS_CACHE_KEY_PREFIX, NEWS_STALE_CACHE_KEY_PREFIX } from '../constants/constants.js';

const PREFS_KEY_PREFIX = 'prefs:';
const PREFS_TTL_SECONDS = 60; // preferences change rarely; 60s is safe

/**
 * Retrieve cached news articles by key.
 * @param {string} key
 * @returns {*} Cached value or undefined on miss
 */
const getNews = (key) => cacheDatasource.get(key);

/**
 * Store news articles in cache.
 * @param {string} key
 * @param {*}  data
 * @param {number} [ttl] Optional TTL override in seconds
 */
const setNews = (key, data, ttl) => cacheDatasource.set(key, data, ttl);

/**
 * Evict a cached news entry by key.
 * @param {string} key
 */
const deleteNews = (key) => cacheDatasource.del(key);

/**
 * Retrieve cached preferences for a user.
 * @param {string} userId
 */
const getPreferences = (userId) => cacheDatasource.get(`${PREFS_KEY_PREFIX}${userId}`);

/**
 * Store preferences for a user.
 * @param {string} userId
 * @param {*} data
 */
const setPreferences = (userId, data) =>
  cacheDatasource.set(`${PREFS_KEY_PREFIX}${userId}`, data, PREFS_TTL_SECONDS);

/**
 * Evict cached preferences for a user (call after update).
 * @param {string} userId
 */
const deletePreferences = (userId) => cacheDatasource.del(`${PREFS_KEY_PREFIX}${userId}`);

/**
 * Evict all news cache entries (live + stale) for a specific user.
 * Call this after the user updates their preferences so the next request
 * re-fetches articles that match the new preferences.
 * @param {string} userId
 */
const deleteNewsByUser = (userId) => {
  cacheDatasource.delByPrefix(`${NEWS_CACHE_KEY_PREFIX}${userId}:`);
  cacheDatasource.delByPrefix(`${NEWS_STALE_CACHE_KEY_PREFIX}${userId}:`);
};

export default {
  getNews,
  setNews,
  deleteNews,
  deleteNewsByUser,
  getPreferences,
  setPreferences,
  deletePreferences,
};
