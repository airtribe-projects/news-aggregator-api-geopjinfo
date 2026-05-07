import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/datasources/db.datasource.js', () => ({
  pingDatabase: jest.fn(),
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

const { pingDatabase } = await import('../../../src/datasources/db.datasource.js');
const healthService = (await import('../../../src/services/health.service.js')).default;

describe('Service - Health Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return healthy status when DB is up', async () => {
      // Arrange
      pingDatabase.mockResolvedValue(true);

      // Act
      const result = await healthService.check();

      // Assert
      expect(pingDatabase).toHaveBeenCalled();
      expect(result.healthy).toBe(true);
      expect(result.app).toBe('up');
      expect(result.db).toBe('up');
      expect(result.timestamp).toBeDefined();
      expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
    });

    it('should throw SERVICE_UNAVAILABLE when pingDatabase returns false', async () => {
      // Arrange
      pingDatabase.mockResolvedValue(false);

      // Act & Assert
      await expect(healthService.check()).rejects.toMatchObject({
        statusCode: 503,
        code: 'SERVICE_UNAVAILABLE'
      });
    });

    it('should throw SERVICE_UNAVAILABLE when pingDatabase throws', async () => {
      // Arrange
      pingDatabase.mockRejectedValue(new Error('Connection refused'));

      // Act & Assert
      await expect(healthService.check()).rejects.toMatchObject({
        statusCode: 503
      });
    });
  });
});
