import axios from 'axios';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import { ERROR_CODES, DEFAULT_LANGUAGE, DEFAULT_COUNTRY, NEWS_API_ERROR_CODES } from '../constants/constants.js';

const baseUrl = env.NEWS_API_BASE_URL;
const apiKey = env.NEWS_API_KEY;
const topHeadlinesUrl = `${baseUrl}/top-headlines`;
const everythingUrl = `${baseUrl}/everything`;

const RATE_LIMIT_CODES = new Set([
  NEWS_API_ERROR_CODES.RATE_LIMITED,
  NEWS_API_ERROR_CODES.API_KEY_EXHAUSTED,
]);

const throwNewsApiError = (data, context) => {
  const code = data?.code;
  if (RATE_LIMIT_CODES.has(code)) {
    throw new ApiError(ERROR_CODES.RATE_LIMIT_EXCEEDED, {
      message: `NewsAPI rate limit reached: ${data.message || code}`,
    });
  }
  throw new ApiError(ERROR_CODES.EXTERNAL_API_ERROR, { message: context });
};

const fetchTopHeadlines = async (options = {}) => {
  const {
    category = null,
    country = DEFAULT_COUNTRY,
    language = DEFAULT_LANGUAGE,
    pageSize = env.NEWS_API_PAGE_SIZE,
  } = options;

  if (!apiKey) {
    logger.warn('NEWS_API_KEY is not configured');
    return [];
  }

  try {
    const params = {
      apiKey,
      language,
      pageSize,
    };

    if (country) {
      params.country = country;
    }

    if (category) {
      params.category = category;
    }

    const response = await axios.get(topHeadlinesUrl, { params, timeout: env.NEWS_API_TIMEOUT_MS });

    if (response.data.status !== 'ok') {
      throwNewsApiError(response.data, 'Failed to fetch news headlines');
    }

    return response.data.articles || [];
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // axios throws for 4xx/5xx — check if NewsAPI sent a rate-limit body
    if (err.response?.data) {
      throwNewsApiError(err.response.data, 'Failed to fetch news headlines');
    }
    logger.error({ err }, 'Failed to fetch top headlines from News API');
    throw new ApiError(ERROR_CODES.EXTERNAL_API_ERROR, { message: 'Failed to fetch news headlines' });
  }
};

const searchArticles = async (options = {}) => {
  const {
    q = '',
    language = 'en',
    pageSize = env.NEWS_API_PAGE_SIZE,
  } = options;

  if (!apiKey) {
    logger.warn('NEWS_API_KEY is not configured');
    return [];
  }

  if (!q) {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, { message: 'Search query is required' });
  }

  try {
    const params = {
      q,
      apiKey,
      language,
      pageSize,
    };

    const response = await axios.get(everythingUrl, { params, timeout: env.NEWS_API_TIMEOUT_MS });

    if (response.data.status !== 'ok') {
      throwNewsApiError(response.data, 'Failed to search articles');
    }

    return response.data.articles || [];
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.response?.data) {
      throwNewsApiError(err.response.data, 'Failed to search articles');
    }
    logger.error({ err }, 'Failed to search articles from News API');
    throw new ApiError(ERROR_CODES.EXTERNAL_API_ERROR, { message: 'Failed to search articles' });
  }
};

export default {
  fetchTopHeadlines,
  searchArticles,
};
