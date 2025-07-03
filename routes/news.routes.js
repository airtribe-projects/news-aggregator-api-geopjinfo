const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
const authenticateToken = require('../middlewares/auth.middleware');

// Protected routes
router.get('/', authenticateToken, newsController.getNews);
router.get('/read', authenticateToken, newsController.getReadArticles);
router.get('/favorites', authenticateToken, newsController.getFavoriteArticles);
router.get('/search/:keyword', authenticateToken, newsController.searchNews);

router.post('/:id/read', authenticateToken, newsController.markAsRead);
router.post('/:id/favorite', authenticateToken, newsController.markAsFavorite);

module.exports = router;
