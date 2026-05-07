import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/repositories/news.repository.js', () => ({
  default: {
    getTopHeadlines: jest.fn(),
    searchNews: jest.fn(),
  }
}));

jest.unstable_mockModule('../../../src/repositories/articleInteraction.repository.js', () => ({
  default: {
    findByUserIdAndArticleId: jest.fn(),
    markAsRead: jest.fn(),
    markAsFavorite: jest.fn(),
    findReadByUserId: jest.fn(),
    findFavoritesByUserId: jest.fn(),
  }
}));

jest.unstable_mockModule('../../../src/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

const newsService = (await import('../../../src/services/news.service.js')).default;
const newsRepository = (await import('../../../src/repositories/news.repository.js')).default;
const articleInteractionRepository = (await import('../../../src/repositories/articleInteraction.repository.js')).default;

describe('Service - News Service', () => {
  const userId = 'user_123';
  const mockPreferences = { categories: ['technology'], languages: ['en'], country: 'us', keywords: [], sources: [] };
  const mockArticle = {
    id: 'interaction_1',
    userId,
    articleId: 'article_1',
    title: 'Test Article',
    url: 'https://example.com',
    type: 'read'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopHeadlines', () => {
    it('should return headlines from news repository', async () => {
      // Arrange
      const mockHeadlines = [{ articleId: 'a1', title: 'Breaking News' }];
      newsRepository.getTopHeadlines.mockResolvedValue(mockHeadlines);

      // Act
      const result = await newsService.getTopHeadlines(userId, mockPreferences);

      // Assert
      expect(newsRepository.getTopHeadlines).toHaveBeenCalledWith(userId, mockPreferences);
      expect(result).toEqual(mockHeadlines);
    });

    it('should use default preferences when none provided', async () => {
      // Arrange
      const mockHeadlines = [{ articleId: 'a1', title: 'Breaking News' }];
      newsRepository.getTopHeadlines.mockResolvedValue(mockHeadlines);

      // Act
      const result = await newsService.getTopHeadlines(userId, {});

      // Assert
      expect(newsRepository.getTopHeadlines).toHaveBeenCalledWith(userId, expect.objectContaining({
        languages: expect.any(Array),
        country: expect.any(String)
      }));
      expect(result).toEqual(mockHeadlines);
    });

    it('should rethrow error from repository', async () => {
      // Arrange
      const error = new Error('External API error');
      newsRepository.getTopHeadlines.mockRejectedValue(error);

      // Act & Assert
      await expect(newsService.getTopHeadlines(userId, mockPreferences)).rejects.toThrow('External API error');
    });
  });

  describe('searchNews', () => {
    it('should return search results from repository', async () => {
      // Arrange
      const mockResults = [{ articleId: 'a2', title: 'Bitcoin News' }];
      newsRepository.searchNews.mockResolvedValue(mockResults);

      // Act
      const result = await newsService.searchNews(userId, 'bitcoin', mockPreferences);

      // Assert
      expect(newsRepository.searchNews).toHaveBeenCalledWith(userId, 'bitcoin', mockPreferences);
      expect(result).toEqual(mockResults);
    });

    it('should rethrow error from repository', async () => {
      // Arrange
      const error = new Error('Search failed');
      newsRepository.searchNews.mockRejectedValue(error);

      // Act & Assert
      await expect(newsService.searchNews(userId, 'query', mockPreferences)).rejects.toThrow();
    });
  });

  describe('markArticleAsRead', () => {
    it('should mark article as read when not already read', async () => {
      // Arrange
      const articleData = { articleId: 'article_1', title: 'Test Article', url: 'https://example.com' };
      articleInteractionRepository.findByUserIdAndArticleId.mockResolvedValue(null);
      articleInteractionRepository.markAsRead.mockResolvedValue(mockArticle);

      // Act
      const result = await newsService.markArticleAsRead(userId, articleData);

      // Assert
      expect(articleInteractionRepository.findByUserIdAndArticleId).toHaveBeenCalledWith(userId, 'article_1', 'read');
      expect(articleInteractionRepository.markAsRead).toHaveBeenCalledWith(userId, articleData);
      expect(result).toEqual({ article: mockArticle, isDuplicate: false });
    });

    it('should return isDuplicate: true if already read', async () => {
      // Arrange
      const articleData = { articleId: 'article_1', title: 'Test Article', url: 'https://example.com' };
      articleInteractionRepository.findByUserIdAndArticleId.mockResolvedValue(mockArticle);

      // Act
      const result = await newsService.markArticleAsRead(userId, articleData);

      // Assert
      expect(articleInteractionRepository.markAsRead).not.toHaveBeenCalled();
      expect(result).toEqual({ article: mockArticle, isDuplicate: true });
    });

    it('should throw ApiError on repository error', async () => {
      // Arrange
      const articleData = { articleId: 'article_1', title: 'Test Article', url: 'https://example.com' };
      articleInteractionRepository.findByUserIdAndArticleId.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(newsService.markArticleAsRead(userId, articleData)).rejects.toMatchObject({
        statusCode: 500
      });
    });
  });

  describe('getReadArticles', () => {
    it('should return all read articles for user', async () => {
      // Arrange
      const mockArticles = [mockArticle];
      articleInteractionRepository.findReadByUserId.mockResolvedValue(mockArticles);

      // Act
      const result = await newsService.getReadArticles(userId);

      // Assert
      expect(articleInteractionRepository.findReadByUserId).toHaveBeenCalledWith(userId, {});
      expect(result).toEqual(mockArticles);
    });

    it('should throw ApiError on repository error', async () => {
      // Arrange
      articleInteractionRepository.findReadByUserId.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(newsService.getReadArticles(userId)).rejects.toMatchObject({ statusCode: 500 });
    });
  });

  describe('addToFavorites', () => {
    it('should add article to favorites when not already favorited', async () => {
      // Arrange
      const articleData = { articleId: 'article_2', title: 'Fav Article', url: 'https://example.com/fav' };
      const mockFav = { ...mockArticle, articleId: 'article_2', type: 'favorite' };
      articleInteractionRepository.findByUserIdAndArticleId.mockResolvedValue(null);
      articleInteractionRepository.markAsFavorite.mockResolvedValue(mockFav);

      // Act
      const result = await newsService.addToFavorites(userId, articleData);

      // Assert
      expect(articleInteractionRepository.findByUserIdAndArticleId).toHaveBeenCalledWith(userId, 'article_2', 'favorite');
      expect(articleInteractionRepository.markAsFavorite).toHaveBeenCalledWith(userId, articleData);
      expect(result).toEqual({ article: mockFav, isDuplicate: false });
    });

    it('should return isDuplicate: true if already favorited', async () => {
      // Arrange
      const articleData = { articleId: 'article_2', title: 'Fav Article', url: 'https://example.com/fav' };
      const mockFav = { ...mockArticle, articleId: 'article_2', type: 'favorite' };
      articleInteractionRepository.findByUserIdAndArticleId.mockResolvedValue(mockFav);

      // Act
      const result = await newsService.addToFavorites(userId, articleData);

      // Assert
      expect(articleInteractionRepository.markAsFavorite).not.toHaveBeenCalled();
      expect(result).toEqual({ article: mockFav, isDuplicate: true });
    });

    it('should throw ApiError on repository error', async () => {
      // Arrange
      const articleData = { articleId: 'article_2', title: 'Fav Article', url: 'https://example.com/fav' };
      articleInteractionRepository.findByUserIdAndArticleId.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(newsService.addToFavorites(userId, articleData)).rejects.toMatchObject({
        statusCode: 500
      });
    });
  });

  describe('getFavoriteArticles', () => {
    it('should return all favorite articles for user', async () => {
      // Arrange
      const mockFavArticles = [{ ...mockArticle, type: 'favorite' }];
      articleInteractionRepository.findFavoritesByUserId.mockResolvedValue(mockFavArticles);

      // Act
      const result = await newsService.getFavoriteArticles(userId);

      // Assert
      expect(articleInteractionRepository.findFavoritesByUserId).toHaveBeenCalledWith(userId, {});
      expect(result).toEqual(mockFavArticles);
    });

    it('should throw ApiError on repository error', async () => {
      // Arrange
      articleInteractionRepository.findFavoritesByUserId.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(newsService.getFavoriteArticles(userId)).rejects.toMatchObject({ statusCode: 500 });
    });
  });
});
