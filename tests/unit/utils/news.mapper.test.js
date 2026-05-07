import { mapExternalArticles } from '../../../src/mappers/news.mapper.js';

describe('Utility - News Mapper', () => {
  describe('mapExternalArticles', () => {
    it('should map external API articles to internal format', () => {
      // Arrange
      const rawArticles = [
        {
          url: 'https://example.com/article-1',
          title: 'Breaking Tech News',
          description: 'A description',
          source: { name: 'TechCrunch' },
          urlToImage: 'https://example.com/image.jpg',
          publishedAt: '2026-05-01T12:00:00Z',
          author: 'John Reporter',
          content: 'Full article content here...',
        }
      ];

      // Act
      const result = mapExternalArticles(rawArticles);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        articleId: 'https://example.com/article-1',
        title: 'Breaking Tech News',
        url: 'https://example.com/article-1',
        description: 'A description',
        source: 'TechCrunch',
        image: 'https://example.com/image.jpg',
        publishedAt: '2026-05-01T12:00:00Z',
        author: 'John Reporter',
        content: 'Full article content here...',
      });
    });

    it('should handle articles with missing optional fields', () => {
      // Arrange
      const rawArticles = [
        {
          url: 'https://example.com/article-2',
          title: 'Minimal Article',
          source: null,
        }
      ];

      // Act
      const result = mapExternalArticles(rawArticles);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].articleId).toBe('https://example.com/article-2');
      expect(result[0].source).toBeUndefined();
    });

    it('should return an empty array for empty input', () => {
      // Act
      const result = mapExternalArticles([]);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return an empty array for undefined input', () => {
      // Act
      const result = mapExternalArticles(undefined);

      // Assert
      expect(result).toEqual([]);
    });

    it('should map multiple articles', () => {
      // Arrange
      const rawArticles = Array.from({ length: 5 }, (_, i) => ({
        url: `https://example.com/article-${i}`,
        title: `Article ${i}`,
        source: { name: 'CNN' },
      }));

      // Act
      const result = mapExternalArticles(rawArticles);

      // Assert
      expect(result).toHaveLength(5);
      result.forEach((article, i) => {
        expect(article.articleId).toBe(`https://example.com/article-${i}`);
      });
    });
  });
});
