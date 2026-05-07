import newsService from '../services/news.service.js';
import preferencesService from '../services/preferences.service.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';
import { ERROR_CODES } from '../constants/constants.js';

// GET /news
const getNews = async (req, res) => {
  const userId = req.user.userId;
  const preferences = await preferencesService.getPreferences(userId);
  const articles = await newsService.getTopHeadlines(userId, preferences);
  sendSuccess(res, articles);
};

// POST /news/:id/read
const markAsRead = async (req, res) => {
  const userId = req.user.userId;
  const { title, url } = req.body;
  const articleId = req.body.articleId || req.params.id;

  if (!articleId || !title || !url) {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, { message: 'articleId, title, and url are required' });
  }

  const result = await newsService.markArticleAsRead(userId, { articleId, title, url });
  sendSuccess(res, result.article, result.isDuplicate ? 200 : 201, {}, result.isDuplicate ? 'Already marked as read' : 'Marked as read');
};

// POST /news/:id/favorite
const markAsFavorite = async (req, res) => {
  const userId = req.user.userId;
  const { title, url } = req.body;
  const articleId = req.body.articleId || req.params.id;

  if (!articleId || !title || !url) {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, { message: 'articleId, title, and url are required' });
  }

  const result = await newsService.addToFavorites(userId, { articleId, title, url });
  sendSuccess(res, result.article, result.isDuplicate ? 200 : 201, {}, result.isDuplicate ? 'Already marked as favorite' : 'Marked as favorite');
};

// GET /news/read
const getReadArticles = async (req, res) => {
  const userId = req.user.userId;
  const articles = await newsService.getReadArticles(userId);
  sendSuccess(res, articles);
};

// GET /news/favorites
const getFavoriteArticles = async (req, res) => {
  const userId = req.user.userId;
  const articles = await newsService.getFavoriteArticles(userId);
  sendSuccess(res, articles);
};

// GET /news/search/:keyword
const searchNews = async (req, res) => {
  const { keyword } = req.params;

  if (!keyword || keyword.trim().length === 0) {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, { message: 'Keyword is required for search' });
  }

  const userId = req.user.userId;
  const preferences = await preferencesService.getPreferences(userId);
  const articles = await newsService.searchNews(userId, keyword.trim(), preferences);
  sendSuccess(res, articles);
};

export default {
  getNews,
  markAsRead,
  markAsFavorite,
  getReadArticles,
  getFavoriteArticles,
  searchNews,
};
