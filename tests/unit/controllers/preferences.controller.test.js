import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/services/preferences.service.js', () => ({
  default: {
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
  }
}));

jest.unstable_mockModule('../../../src/utils/response.js', () => ({
  sendSuccess: jest.fn()
}));

const preferencesController = (await import('../../../src/controllers/preferences.controller.js')).default;
const preferencesService = (await import('../../../src/services/preferences.service.js')).default;
const { sendSuccess } = await import('../../../src/utils/response.js');

describe('Controller - Preferences Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { userId: 'user_123' },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getPreferences', () => {
    it('should return user preferences successfully', async () => {
      // Arrange
      const mockPreferences = { categories: ['technology'], languages: ['en'], country: 'us' };
      preferencesService.getPreferences.mockResolvedValue(mockPreferences);

      // Act
      await preferencesController.getPreferences(req, res, next);

      // Assert
      expect(preferencesService.getPreferences).toHaveBeenCalledWith('user_123');
      expect(sendSuccess).toHaveBeenCalledWith(res, mockPreferences);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject with error if service fails', async () => {
      // Arrange
      const error = new Error('User not found');
      preferencesService.getPreferences.mockRejectedValue(error);

      // Act & Assert
      await expect(preferencesController.getPreferences(req, res, next)).rejects.toThrow('User not found');
      expect(sendSuccess).not.toHaveBeenCalled();
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences and return updated data', async () => {
      // Arrange
      req.body = { categories: ['sports'], country: 'gb' };
      const mockUpdated = { categories: ['sports'], languages: ['en'], country: 'gb', keywords: [], sources: [] };
      preferencesService.updatePreferences.mockResolvedValue(mockUpdated);

      // Act
      await preferencesController.updatePreferences(req, res, next);

      // Assert
      expect(preferencesService.updatePreferences).toHaveBeenCalledWith('user_123', req.body);
      expect(sendSuccess).toHaveBeenCalledWith(res, mockUpdated, 200, {}, 'Preferences updated successfully');
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject with error if update fails', async () => {
      // Arrange
      const error = new Error('Invalid preferences');
      preferencesService.updatePreferences.mockRejectedValue(error);

      // Act & Assert
      await expect(preferencesController.updatePreferences(req, res, next)).rejects.toThrow('Invalid preferences');
      expect(sendSuccess).not.toHaveBeenCalled();
    });
  });
});
