import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/utils/requestContext.js', () => ({
  getRequestContext: jest.fn(() => ({ requestId: 'req_test_123' }))
}));

jest.unstable_mockModule('../../../src/config/env.js', () => ({
  default: { NODE_ENV: 'test' }
}));

const { sendSuccess, sendError } = await import('../../../src/utils/response.js');

describe('Utility - Response Helpers', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      locals: { requestId: 'res_local_id' }
    };
  });

  describe('sendSuccess', () => {
    it('should send a 200 response by default', () => {
      // Arrange
      const data = { user: { id: 'user_1', name: 'Alice' } };

      // Act
      sendSuccess(res, data);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data
      }));
    });

    it('should send a custom status code', () => {
      // Act
      sendSuccess(res, { user: {} }, 201);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should include requestId in meta', () => {
      // Act
      sendSuccess(res, {});

      // Assert
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        meta: expect.objectContaining({ requestId: 'req_test_123' })
      }));
    });

    it('should include extra meta fields when provided', () => {
      // Act
      sendSuccess(res, {}, 200, { pagination: { page: 1, total: 10 } });

      // Assert
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        meta: expect.objectContaining({ pagination: { page: 1, total: 10 } })
      }));
    });
  });

  describe('sendError', () => {
    it('should send a 500 response by default', () => {
      // Arrange
      const error = new Error('Something went wrong');

      // Act
      sendError(res, error);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Something went wrong'
        })
      }));
    });

    it('should use error statusCode and code if provided', () => {
      // Arrange
      const error = { statusCode: 404, code: 'NOT_FOUND', message: 'Resource not found' };

      // Act
      sendError(res, error);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({ code: 'NOT_FOUND', message: 'Resource not found' })
      }));
    });

    it('should include validation errors array if present', () => {
      // Arrange
      const error = {
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors: [{ field: 'email', message: 'Invalid email' }]
      };

      // Act
      sendError(res, error);

      // Assert
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({
          errors: [{ field: 'email', message: 'Invalid email' }]
        })
      }));
    });

    it('should include requestId in meta', () => {
      // Act
      sendError(res, new Error('Test'));

      // Assert
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        meta: expect.objectContaining({ requestId: 'req_test_123' })
      }));
    });
  });
});
