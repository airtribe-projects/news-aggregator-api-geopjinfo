import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/services/health.service.js', () => ({
  default: {
    check: jest.fn()
  }
}));

jest.unstable_mockModule('../../../src/utils/response.js', () => ({
  sendSuccess: jest.fn()
}));

const healthController = (await import('../../../src/controllers/health.controller.js')).default;
const healthService = (await import('../../../src/services/health.service.js')).default;
const { sendSuccess } = await import('../../../src/utils/response.js');

describe('Controller - Health Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getHealth', () => {
    it('should return health data when service is healthy', async () => {
      // Arrange
      const healthData = {
        healthy: true,
        app: 'up',
        db: 'up',
        uptimeSeconds: 120,
        timestamp: new Date().toISOString()
      };
      healthService.check.mockResolvedValue(healthData);

      // Act
      await healthController.getHealth(req, res, next);

      // Assert
      expect(healthService.check).toHaveBeenCalled();
      expect(sendSuccess).toHaveBeenCalledWith(res, healthData);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject with error when service throws', async () => {
      // Arrange
      const error = new Error('Service unavailable');
      healthService.check.mockRejectedValue(error);

      // Act & Assert
      await expect(healthController.getHealth(req, res, next)).rejects.toThrow('Service unavailable');
      expect(sendSuccess).not.toHaveBeenCalled();
    });
  });
});
