import cacheRepository from './cache.repository.js';
import externalNewsDatasource from '../datasources/externalNews.datasource.js';
import { mapExternalArticles } from '../mappers/news.mapper.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { NEWS_CACHE_KEY_PREFIX, NEWS_STALE_CACHE_KEY_PREFIX, DEFAULT_LANGUAGE, DEFAULT_COUNTRY, ERROR_CODES } from '../constants/constants.js';

const buildNewsKey = (userId, preferences, searchKeyword = null) => {
  const prefStr = JSON.stringify({
    categories: preferences.categories || [],
    languages: preferences.languages || [DEFAULT_LANGUAGE],
    country: preferences.country || DEFAULT_COUNTRY,
    keyword: searchKeyword,
  });
  return `${NEWS_CACHE_KEY_PREFIX}${userId}:${Buffer.from(prefStr).toString('base64')}`;
};

const buildStaleKey = (key) => key.replace(NEWS_CACHE_KEY_PREFIX, NEWS_STALE_CACHE_KEY_PREFIX);

const getTopHeadlines = async (userId, preferences) => {
  const cacheKey = buildNewsKey(userId, preferences);
  const cached = cacheRepository.getNews(cacheKey);
  if (cached) return cached;

  try {
    const rawArticles = await externalNewsDatasource.fetchTopHeadlines(preferences);
    const mapped = mapExternalArticles(rawArticles);
    cacheRepository.setNews(cacheKey, mapped);
    // keep a long-lived stale copy (24 h) as fallback for rate-limit scenarios
    cacheRepository.setNews(buildStaleKey(cacheKey), mapped, 86400);
    return mapped;
  } catch (err) {
    if (err instanceof ApiError && err.code === ERROR_CODES.RATE_LIMIT_EXCEEDED) {
      const stale = cacheRepository.getNews(buildStaleKey(cacheKey));
      if (stale) {
        logger.warn({ userId }, 'NewsAPI rate limit hit — serving stale cached headlines');
        return stale;
      }
    }
    throw err;
  }
};

const searchNews = async (userId, query, preferences) => {
  const cacheKey = buildNewsKey(userId, preferences, query);
  const cached = cacheRepository.getNews(cacheKey);
  if (cached) return cached;

  try {
    const rawArticles = await externalNewsDatasource.searchNews(query, preferences);
    const mapped = mapExternalArticles(rawArticles);
    cacheRepository.setNews(cacheKey, mapped);
    cacheRepository.setNews(buildStaleKey(cacheKey), mapped, 86400);
    return mapped;
  } catch (err) {
    if (err instanceof ApiError && err.code === ERROR_CODES.RATE_LIMIT_EXCEEDED) {
      const stale = cacheRepository.getNews(buildStaleKey(cacheKey));
      if (stale) {
        logger.warn({ userId, query }, 'NewsAPI rate limit hit — serving stale cached search results');
        return stale;
      }
    }
    throw err;
  }
};

export default {
  buildNewsKey,
  getTopHeadlines,
  searchNews,
};
