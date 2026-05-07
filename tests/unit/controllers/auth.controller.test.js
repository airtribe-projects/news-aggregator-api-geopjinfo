import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../src/services/auth.service.js', () => ({
  default: {
    register: jest.fn(),
    login: jest.fn(),
  }
}));

jest.unstable_mockModule('../../../src/utils/response.js', () => ({
  sendSuccess: jest.fn()
}));

const authController = (await import('../../../src/controllers/auth.controller.js')).default;
const authService = (await import('../../../src/services/auth.service.js')).default;
const { sendSuccess } = await import('../../../src/utils/response.js');

describe('Controller - Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      req.body = { name: 'Alice', email: 'alice@example.com', password: 'Password1!' };
      const mockUser = { id: 'user_1', name: 'Alice', email: 'alice@example.com' };
      authService.register.mockResolvedValue(mockUser);

      // Act
      await authController.register(req, res, next);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(req.body);
      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        mockUser,
        201,
        {},
        'User registered successfully'
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject with error if registration fails', async () => {
      // Arrange
      const error = new Error('Registration failed');
      authService.register.mockRejectedValue(error);

      // Act & Assert
      await expect(authController.register(req, res, next)).rejects.toThrow('Registration failed');
      expect(sendSuccess).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should log in user successfully', async () => {
      // Arrange
      req.body = { email: 'alice@example.com', password: 'Password1!' };
      const mockResult = {
        user: { id: 'user_1', name: 'Alice', email: 'alice@example.com' },
        token: 'fake-jwt-token'
      };
      authService.login.mockResolvedValue(mockResult);

      // Act
      await authController.login(req, res, next);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(req.body);
      expect(sendSuccess).toHaveBeenCalledWith(
        res,
        { user: mockResult.user, token: mockResult.token }
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject with error if login fails', async () => {
      // Arrange
      const error = new Error('Invalid credentials');
      authService.login.mockRejectedValue(error);

      // Act & Assert
      await expect(authController.login(req, res, next)).rejects.toThrow('Invalid credentials');
      expect(sendSuccess).not.toHaveBeenCalled();
    });
  });
});
