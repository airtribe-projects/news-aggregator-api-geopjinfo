const cache = require('../services/cache.service');
const { fetchNews } = require('../services/news-api.service');
const User = require('../models/user.model');
const ReadArticle = require('../models/read-articles.model');
const FavoriteArticle = require('../models/favorite-articles.model');
const CustomError = require('../utils/custom-error');

// GET /news
const getNews = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) throw new CustomError('User not found', 404);

    const cacheKey = `news:${userId}`;
    let articles = cache.get(cacheKey);

    if (!articles) {
      articles = await fetchNews(user.preferences || {});
      cache.set(cacheKey, articles);
    }

    res.json({ success: true, news:articles });
  } catch (err) {
    next(err);
  }
};

// POST /news/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, url } = req.body;

    const read = await ReadArticle.create({
      userId: req.user.userId,
      articleId: id,
      title,
      url,
    });

    res.status(201).json({ success: true, message: 'Marked as read', read });
  } catch (err) {
    next(err);
  }
};

// POST /news/:id/favorite
const markAsFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, url } = req.body;

    const fav = await FavoriteArticle.create({
      userId: req.user.userId,
      articleId: id,
      title,
      url,
    });

    res.status(201).json({ success: true, message: 'Marked as favorite', fav });
  } catch (err) {
    next(err);
  }
};

// GET /news/read
const getReadArticles = async (req, res, next) => {
  try {
    const articles = await ReadArticle.find({ userId: req.user.userId }).sort({ readAt: -1 });

    res.json({ success: true, articles });
  } catch (err) {
    next(err);
  }
};

// GET /news/favorites
const getFavoriteArticles = async (req, res, next) => {
  try {
    const articles = await FavoriteArticle.find({ userId: req.user.userId }).sort({ favoritedAt: -1 });

    res.json({ success: true, articles });
  } catch (err) {
    next(err);
  }
};

// GET /news/search/:keyword
const searchNews = async (req, res, next) => {
  try {
    const { keyword } = req.params;

    if (!keyword) {
      throw new CustomError('Keyword is required for search', 400);
    }

    const user = await User.findById(req.user.userId);
    const articles = await fetchNews({
      categories: user.preferences
    });

    const matched = articles.filter(a =>
      a.title?.toLowerCase().includes(keyword.toLowerCase()) ||
      a.description?.toLowerCase().includes(keyword.toLowerCase())
    );

    res.json({ success: true, results: matched });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNews,
  markAsRead,
  markAsFavorite,
  getReadArticles,
  getFavoriteArticles,
  searchNews,
};
