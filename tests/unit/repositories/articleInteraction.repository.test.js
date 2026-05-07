import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/datasources/db.datasource.js', () => ({
  create: jest.fn(),
  findOne: jest.fn(),
  findMany: jest.fn(),
}));

jest.unstable_mockModule('../../../src/models/ArticleInteraction.model.js', () => ({
  default: {}
}));

const dbDataSource = await import('../../../src/datasources/db.datasource.js');
const articleInteractionRepository = (await import('../../../src/repositories/articleInteraction.repository.js')).default;

describe('Repository - Article Interaction Repository', () => {
  const userId = 'user_123';
  const mockDate = new Date();
  const mockDoc = {
    _id: 'interaction_1',
    userId,
    articleId: 'article_1',
    title: 'Test Article',
    url: 'https://example.com',
    articleSnapshot: { title: 'Test Article', url: 'https://example.com' },
    type: 'read',
    interactedAt: mockDate,
    createdAt: mockDate,
    updatedAt: mockDate,
  };
  const expectedDTO = {
    id: 'interaction_1',
    userId,
    articleId: 'article_1',
    title: 'Test Article',
    url: 'https://example.com',
    articleSnapshot: { title: 'Test Article', url: 'https://example.com' },
    type: 'read',
    interactedAt: mockDate,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserIdAndArticleId', () => {
    it('should return mapped DTO if interaction exists', async () => {
      // Arrange
      dbDataSource.findOne.mockResolvedValue(mockDoc);

      // Act
      const result = await articleInteractionRepository.findByUserIdAndArticleId(userId, 'article_1', 'read');

      // Assert
      expect(dbDataSource.findOne).toHaveBeenCalledWith(
        expect.anything(),
        { userId, articleId: 'article_1', type: 'read' }
      );
      expect(result).toMatchObject(expectedDTO);
    });

    it('should return null if interaction does not exist', async () => {
      // Arrange
      dbDataSource.findOne.mockResolvedValue(null);

      // Act
      const result = await articleInteractionRepository.findByUserIdAndArticleId(userId, 'nonexistent', 'read');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findReadByUserId', () => {
    it('should return all read interactions for user', async () => {
      // Arrange
      dbDataSource.findMany.mockResolvedValue([mockDoc]);

      // Act
      const result = await articleInteractionRepository.findReadByUserId(userId);

      // Assert
      expect(dbDataSource.findMany).toHaveBeenCalledWith(
        expect.anything(),
        { userId, type: 'read' },
        expect.objectContaining({ sort: { interactedAt: -1 } })
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject(expectedDTO);
    });

    it('should return empty array when no reads exist', async () => {
      // Arrange
      dbDataSource.findMany.mockResolvedValue([]);

      // Act
      const result = await articleInteractionRepository.findReadByUserId(userId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findFavoritesByUserId', () => {
    it('should return all favorite interactions for user', async () => {
      // Arrange
      const favDoc = { ...mockDoc, type: 'favorite' };
      dbDataSource.findMany.mockResolvedValue([favDoc]);

      // Act
      const result = await articleInteractionRepository.findFavoritesByUserId(userId);

      // Assert
      expect(dbDataSource.findMany).toHaveBeenCalledWith(
        expect.anything(),
        { userId, type: 'favorite' },
        expect.objectContaining({ sort: { interactedAt: -1 } })
      );
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('favorite');
    });
  });

  describe('mapToDTO', () => {
    it('should correctly map an interaction document to DTO', () => {
      // Act
      const result = articleInteractionRepository.mapToDTO(mockDoc);

      // Assert
      expect(result).toMatchObject(expectedDTO);
    });

    it('should return null for null input', () => {
      // Act
      const result = articleInteractionRepository.mapToDTO(null);

      // Assert
      expect(result).toBeNull();
    });
  });
});
