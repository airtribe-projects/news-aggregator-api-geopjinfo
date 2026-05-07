import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/repositories/preferences.repository.js', () => ({
  default: {
    findByUserId: jest.fn(),
    createDefault: jest.fn(),
    updateByUserId: jest.fn(),
  }
}));

// Mock the cache so it never returns a hit — keeps getPreferences tests deterministic
jest.unstable_mockModule('../../../src/repositories/cache.repository.js', () => ({
  default: {
    getPreferences: jest.fn().mockReturnValue(null),
    setPreferences: jest.fn(),
    deletePreferences: jest.fn(),
    getNews: jest.fn().mockReturnValue(null),
    setNews: jest.fn(),
    deleteNews: jest.fn(),
    deleteNewsByUser: jest.fn(),
  }
}));

const preferencesService = (await import('../../../src/services/preferences.service.js')).default;
const preferencesRepository = (await import('../../../src/repositories/preferences.repository.js')).default;

describe('Service - Preferences Service', () => {
  const userId = 'user_123';
  const mockPreferences = {
    categories: ['technology'],
    languages: ['en'],
    country: 'us',
    keywords: [],
    sources: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPreferences', () => {
    it('should return preferences if they exist for user', async () => {
      // Arrange
      preferencesRepository.findByUserId.mockResolvedValue(mockPreferences);

      // Act
      const result = await preferencesService.getPreferences(userId);

      // Assert
      expect(preferencesRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockPreferences);
    });

    it('should create default preferences if user has none', async () => {
      // Arrange
      const mockUser = { preferences: { categories: [], languages: ['en'], country: 'us', keywords: [], sources: [] } };
      preferencesRepository.findByUserId.mockResolvedValue(null);
      preferencesRepository.createDefault.mockResolvedValue(mockUser);

      // Act
      const result = await preferencesService.getPreferences(userId);

      // Assert
      expect(preferencesRepository.createDefault).toHaveBeenCalledWith(userId);
      expect(result).toBeDefined();
    });

    it('should throw 404 if user is not found when creating defaults', async () => {
      // Arrange
      preferencesRepository.findByUserId.mockResolvedValue(null);
      preferencesRepository.createDefault.mockResolvedValue(null);

      // Act & Assert
      await expect(preferencesService.getPreferences(userId)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('updatePreferences', () => {
    it('should update and return updated preferences', async () => {
      // Arrange
      const updateData = { categories: ['sports'], languages: ['en'], country: 'gb', keywords: [], sources: [] };
      preferencesRepository.updateByUserId.mockResolvedValue(updateData);

      // Act
      const result = await preferencesService.updatePreferences(userId, updateData);

      // Assert
      expect(preferencesRepository.updateByUserId).toHaveBeenCalledWith(userId, expect.objectContaining({
        categories: ['sports'],
        country: 'gb'
      }));
      expect(result).toEqual(updateData);
    });

    it('should throw 400 for invalid categories', async () => {
      // Arrange
      const updateData = { categories: ['invalid_category'] };

      // Act & Assert
      await expect(preferencesService.updatePreferences(userId, updateData)).rejects.toMatchObject({
        statusCode: 400
      });
    });

    it('should throw 400 for invalid languages', async () => {
      // Arrange
      const updateData = { languages: ['xx'] }; // invalid language code

      // Act & Assert
      await expect(preferencesService.updatePreferences(userId, updateData)).rejects.toMatchObject({
        statusCode: 400
      });
    });

    it('should throw 400 for invalid country', async () => {
      // Arrange
      const updateData = { country: 'zz' }; // invalid country code

      // Act & Assert
      await expect(preferencesService.updatePreferences(userId, updateData)).rejects.toMatchObject({
        statusCode: 400
      });
    });

    it('should throw 404 if user is not found during update', async () => {
      // Arrange
      const updateData = { categories: ['technology'] };
      preferencesRepository.updateByUserId.mockResolvedValue(null);

      // Act & Assert
      await expect(preferencesService.updatePreferences(userId, updateData)).rejects.toMatchObject({
        statusCode: 404
      });
    });
  });
});
