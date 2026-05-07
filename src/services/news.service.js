import ApiError from '../utils/ApiError.js';
import newsRepository from '../repositories/news.repository.js';
import articleInteractionRepository from '../repositories/articleInteraction.repository.js';
import logger from '../utils/logger.js';
import { defaultPreferences } from '../models/User.model.js';
import { ERROR_CODES, INTERACTION_TYPES } from '../constants/constants.js';

const resolvePreferences = (preferences) =>
  preferences && Object.keys(preferences).length > 0 ? preferences : { ...defaultPreferences };

const getTopHeadlines = async (userId, preferences) => {
  try {
    return await newsRepository.getTopHeadlines(userId, resolvePreferences(preferences));
  } catch (err) {
    logger.error({ err }, 'Error fetching top headlines');
    throw err;
  }
};

const searchNews = async (userId, query, preferences) => {
  try {
    return await newsRepository.searchNews(userId, query, resolvePreferences(preferences));
  } catch (err) {
    logger.error({ err }, 'Error searching news');
    throw err;
  }
};

const markArticleAsRead = async (userId, articleData) => {
  try {
    const existing = await articleInteractionRepository.findByUserIdAndArticleId(
      userId,
      articleData.articleId,
      INTERACTION_TYPES.READ
    );
    if (existing) {
      return { article: existing, isDuplicate: true };
    }

    const read = await articleInteractionRepository.markAsRead(userId, articleData);
    return { article: read, isDuplicate: false };
  } catch (err) {
    logger.error({ err }, 'Error marking article as read');
    throw new ApiError(ERROR_CODES.INTERNAL_ERROR, { message: 'Failed to mark article as read' });
  }
};

const getReadArticles = async (userId, options = {}) => {
  try {
    const articles = await articleInteractionRepository.findReadByUserId(userId, options);
    return articles;
  } catch (err) {
    logger.error({ err }, 'Error fetching read articles');
    throw new ApiError(ERROR_CODES.INTERNAL_ERROR, { message: 'Failed to fetch read articles' });
  }
};

const addToFavorites = async (userId, articleData) => {
  try {
    const existing = await articleInteractionRepository.findByUserIdAndArticleId(
      userId,
      articleData.articleId,
      INTERACTION_TYPES.FAVORITE
    );
    if (existing) {
      return { article: existing, isDuplicate: true };
    }

    const favorite = await articleInteractionRepository.markAsFavorite(userId, articleData);
    return { article: favorite, isDuplicate: false };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error({ err }, 'Error adding to favorites');
    throw new ApiError(ERROR_CODES.INTERNAL_ERROR, { message: 'Failed to add to favorites' });
  }
};

const getFavoriteArticles = async (userId, options = {}) => {
  try {
    const articles = await articleInteractionRepository.findFavoritesByUserId(userId, options);
    return articles;
  } catch (err) {
    logger.error({ err }, 'Error fetching favorite articles');
    throw new ApiError(ERROR_CODES.INTERNAL_ERROR, { message: 'Failed to fetch favorite articles' });
  }
};

export default {
  getTopHeadlines,
  searchNews,
  markArticleAsRead,
  getReadArticles,
  addToFavorites,
  getFavoriteArticles,
};
