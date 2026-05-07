import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/repositories/cache.repository.js', () => ({
  default: {
    getNews: jest.fn(),
    setNews: jest.fn(),
    deleteNews: jest.fn(),
  }
}));

jest.unstable_mockModule('../../../src/datasources/externalNews.datasource.js', () => ({
  default: {
    fetchTopHeadlines: jest.fn(),
    searchNews: jest.fn(),
  }
}));

jest.unstable_mockModule('../../../src/mappers/news.mapper.js', () => ({
  mapExternalArticles: jest.fn((articles) => articles.map(a => ({ ...a, mapped: true })))
}));

const newsRepository = (await import('../../../src/repositories/news.repository.js')).default;
const cacheRepository = (await import('../../../src/repositories/cache.repository.js')).default;
const externalNewsDatasource = (await import('../../../src/datasources/externalNews.datasource.js')).default;
const { mapExternalArticles } = await import('../../../src/mappers/news.mapper.js');

describe('Repository - News Repository', () => {
  const userId = 'user_123';
  const mockPreferences = { categories: ['technology'], languages: ['en'], country: 'us', keywords: [], sources: [] };
  const rawArticles = [{ url: 'https://example.com', title: 'Test', source: { name: 'CNN' } }];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildNewsKey', () => {
    it('should build a deterministic cache key for the same inputs', () => {
      // Act
      const key1 = newsRepository.buildNewsKey(userId, mockPreferences);
      const key2 = newsRepository.buildNewsKey(userId, mockPreferences);

      // Assert
      expect(key1).toBe(key2);
      expect(key1).toContain(userId);
    });

    it('should produce different keys for different search keywords', () => {
      // Act
      const keyNoSearch = newsRepository.buildNewsKey(userId, mockPreferences);
      const keyWithSearch = newsRepository.buildNewsKey(userId, mockPreferences, 'bitcoin');

      // Assert
      expect(keyNoSearch).not.toBe(keyWithSearch);
    });
  });

  describe('getTopHeadlines', () => {
    it('should return cached articles if cache hit', async () => {
      // Arrange
      const cachedArticles = [{ articleId: 'cached_1', title: 'Cached News' }];
      cacheRepository.getNews.mockReturnValue(cachedArticles);

      // Act
      const result = await newsRepository.getTopHeadlines(userId, mockPreferences);

      // Assert
      expect(cacheRepository.getNews).toHaveBeenCalled();
      expect(externalNewsDatasource.fetchTopHeadlines).not.toHaveBeenCalled();
      expect(result).toEqual(cachedArticles);
    });

    it('should fetch from external API and cache on miss', async () => {
      // Arrange
      cacheRepository.getNews.mockReturnValue(null);
      externalNewsDatasource.fetchTopHeadlines.mockResolvedValue(rawArticles);

      // Act
      const result = await newsRepository.getTopHeadlines(userId, mockPreferences);

      // Assert
      expect(externalNewsDatasource.fetchTopHeadlines).toHaveBeenCalledWith(mockPreferences);
      expect(mapExternalArticles).toHaveBeenCalledWith(rawArticles);
      expect(cacheRepository.setNews).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('searchNews', () => {
    it('should return cached results if cache hit', async () => {
      // Arrange
      const cachedResults = [{ articleId: 'cached_2', title: 'Cached Search' }];
      cacheRepository.getNews.mockReturnValue(cachedResults);

      // Act
      const result = await newsRepository.searchNews(userId, 'bitcoin', mockPreferences);

      // Assert
      expect(externalNewsDatasource.searchNews).not.toHaveBeenCalled();
      expect(result).toEqual(cachedResults);
    });

    it('should fetch from external API and cache on miss', async () => {
      // Arrange
      cacheRepository.getNews.mockReturnValue(null);
      externalNewsDatasource.searchNews.mockResolvedValue(rawArticles);

      // Act
      const result = await newsRepository.searchNews(userId, 'bitcoin', mockPreferences);

      // Assert
      expect(externalNewsDatasource.searchNews).toHaveBeenCalledWith('bitcoin', mockPreferences);
      expect(cacheRepository.setNews).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });
});
