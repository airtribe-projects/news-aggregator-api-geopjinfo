import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/services/news.service.js', () => ({
  default: {
    getTopHeadlines: jest.fn(),
    searchNews: jest.fn(),
    markArticleAsRead: jest.fn(),
    getReadArticles: jest.fn(),
    addToFavorites: jest.fn(),
    getFavoriteArticles: jest.fn(),
  }
}));

jest.unstable_mockModule('../../../src/services/preferences.service.js', () => ({
  default: {
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
  }
}));

jest.unstable_mockModule('../../../src/utils/response.js', () => ({
  sendSuccess: jest.fn()
}));

const newsController = (await import('../../../src/controllers/news.controller.js')).default;
const newsService = (await import('../../../src/services/news.service.js')).default;
const preferencesService = (await import('../../../src/services/preferences.service.js')).default;
const { sendSuccess } = await import('../../../src/utils/response.js');

describe('Controller - News Controller', () => {
  let req, res, next;
  const mockPreferences = { categories: ['technology'], languages: ['en'], country: 'us' };

  beforeEach(() => {
    req = {
      user: { userId: 'user_123' },
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
    preferencesService.getPreferences.mockResolvedValue(mockPreferences);
  });

  describe('getNews', () => {
    it('should return top headlines based on user preferences', async () => {
      // Arrange
      const mockArticles = [{ articleId: 'a1', title: 'Tech News', url: 'https://example.com' }];
      newsService.getTopHeadlines.mockResolvedValue(mockArticles);

      // Act
      await newsController.getNews(req, res, next);

      // Assert
      expect(preferencesService.getPreferences).toHaveBeenCalledWith('user_123');
      expect(newsService.getTopHeadlines).toHaveBeenCalledWith('user_123', mockPreferences);
      expect(sendSuccess).toHaveBeenCalledWith(res, mockArticles);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject with error if service fails', async () => {
      // Arrange
      const error = new Error('External API error');
      newsService.getTopHeadlines.mockRejectedValue(error);

      // Act & Assert
      await expect(newsController.getNews(req, res, next)).rejects.toThrow('External API error');
    });
  });

  describe('markAsRead', () => {
    it('should mark article as read and return 201 for new entry', async () => {
      // Arrange
      req.params = { id: 'article_1' };
      req.body = { articleId: 'article_1', title: 'Test Article', url: 'https://example.com' };
      const mockResult = { article: { id: 'interaction_1' }, isDuplicate: false };
      newsService.markArticleAsRead.mockResolvedValue(mockResult);

      // Act
      await newsController.markAsRead(req, res, next);

      // Assert
      expect(newsService.markArticleAsRead).toHaveBeenCalledWith('user_123', {
        articleId: 'article_1',
        title: 'Test Article',
        url: 'https://example.com'
      });
      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        mockResult.article,
        201,
        {},
        'Marked as read'
      );
    });

    it('should return 200 for duplicate read', async () => {
      // Arrange
      req.params = { id: 'article_1' };
      req.body = { articleId: 'article_1', title: 'Test Article', url: 'https://example.com' };
      const mockResult = { article: { id: 'interaction_1' }, isDuplicate: true };
      newsService.markArticleAsRead.mockResolvedValue(mockResult);

      // Act
      await newsController.markAsRead(req, res, next);

      // Assert
      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        mockResult.article,
        200,
        {},
        'Already marked as read'
      );
    });

    it('should reject with ValidationError if required fields are missing', async () => {
      // Arrange
      req.params = { id: 'article_1' };
      req.body = { articleId: 'article_1' }; // missing title and url

      // Act & Assert
      await expect(newsController.markAsRead(req, res, next)).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe('markAsFavorite', () => {
    it('should mark article as favorite and return 201 for new entry', async () => {
      // Arrange
      req.params = { id: 'article_2' };
      req.body = { articleId: 'article_2', title: 'Fav Article', url: 'https://example.com/fav' };
      const mockResult = { article: { id: 'fav_1' }, isDuplicate: false };
      newsService.addToFavorites.mockResolvedValue(mockResult);

      // Act
      await newsController.markAsFavorite(req, res, next);

      // Assert
      expect(newsService.addToFavorites).toHaveBeenCalledWith('user_123', {
        articleId: 'article_2',
        title: 'Fav Article',
        url: 'https://example.com/fav'
      });
      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        mockResult.article,
        201,
        {},
        'Marked as favorite'
      );
    });

    it('should return 200 for duplicate favorite', async () => {
      // Arrange
      req.params = { id: 'article_2' };
      req.body = { articleId: 'article_2', title: 'Fav Article', url: 'https://example.com/fav' };
      const mockResult = { article: { id: 'fav_1' }, isDuplicate: true };
      newsService.addToFavorites.mockResolvedValue(mockResult);

      // Act
      await newsController.markAsFavorite(req, res, next);

      // Assert
      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        mockResult.article,
        200,
        {},
        'Already marked as favorite'
      );
    });

    it('should reject with ValidationError if required fields are missing', async () => {
      // Arrange
      req.params = { id: 'article_2' };
      req.body = {}; // missing all required fields

      // Act & Assert
      await expect(newsController.markAsFavorite(req, res, next)).rejects.toMatchObject({ statusCode: 400 });
    });
  });

  describe('getReadArticles', () => {
    it('should return read articles for the user', async () => {
      // Arrange
      const mockArticles = [{ id: 'r1', title: 'Read Article' }];
      newsService.getReadArticles.mockResolvedValue(mockArticles);

      // Act
      await newsController.getReadArticles(req, res, next);

      // Assert
      expect(newsService.getReadArticles).toHaveBeenCalledWith('user_123');
      expect(sendSuccess).toHaveBeenCalledWith(res, mockArticles);
    });

    it('should reject with error if service fails', async () => {
      // Arrange
      const error = new Error('DB error');
      newsService.getReadArticles.mockRejectedValue(error);

      // Act & Assert
      await expect(newsController.getReadArticles(req, res, next)).rejects.toThrow('DB error');
    });
  });

  describe('getFavoriteArticles', () => {
    it('should return favorite articles for the user', async () => {
      // Arrange
      const mockArticles = [{ id: 'f1', title: 'Fav Article' }];
      newsService.getFavoriteArticles.mockResolvedValue(mockArticles);

      // Act
      await newsController.getFavoriteArticles(req, res, next);

      // Assert
      expect(newsService.getFavoriteArticles).toHaveBeenCalledWith('user_123');
      expect(sendSuccess).toHaveBeenCalledWith(res, mockArticles);
    });

    it('should reject with error if service fails', async () => {
      // Arrange
      const error = new Error('DB error');
      newsService.getFavoriteArticles.mockRejectedValue(error);

      // Act & Assert
      await expect(newsController.getFavoriteArticles(req, res, next)).rejects.toThrow('DB error');
    });
  });

  describe('searchNews', () => {
    it('should return search results for a given keyword', async () => {
      // Arrange
      req.params = { keyword: 'bitcoin' };
      const mockResults = [{ articleId: 'b1', title: 'Bitcoin rises' }];
      newsService.searchNews.mockResolvedValue(mockResults);

      // Act
      await newsController.searchNews(req, res, next);

      // Assert
      expect(preferencesService.getPreferences).toHaveBeenCalledWith('user_123');
      expect(newsService.searchNews).toHaveBeenCalledWith('user_123', 'bitcoin', mockPreferences);
      expect(sendSuccess).toHaveBeenCalledWith(res, mockResults);
    });

    it('should reject with ValidationError for blank keyword', async () => {
      // Arrange
      req.params = { keyword: '   ' };

      // Act & Assert
      await expect(newsController.searchNews(req, res, next)).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should reject with error if service fails', async () => {
      // Arrange
      req.params = { keyword: 'sports' };
      const error = new Error('Search failed');
      newsService.searchNews.mockRejectedValue(error);

      // Act & Assert
      await expect(newsController.searchNews(req, res, next)).rejects.toThrow('Search failed');
    });
  });
});
