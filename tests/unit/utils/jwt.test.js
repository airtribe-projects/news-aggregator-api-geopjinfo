import { jest } from '@jest/globals';

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(() => 'mock-jwt-token'),
    verify: jest.fn(() => ({ userId: 'user_123' }))
  }
}));

jest.unstable_mockModule('../../../src/config/env.js', () => ({
  default: {
    JWT_SECRET: 'test-secret',
    JWT_EXPIRES_IN: '1h'
  }
}));

const jwt = (await import('jsonwebtoken')).default;
const { generateToken, verifyToken } = await import('../../../src/utils/jwt.js');

describe('Utility - JWT', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwt.sign.mockReturnValue('mock-jwt-token');
    jwt.verify.mockReturnValue({ userId: 'user_123' });
  });

  describe('generateToken', () => {
    it('should generate a JWT token for a given payload', () => {
      // Arrange
      const payload = { userId: 'user_123' };

      // Act
      const token = generateToken(payload);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(payload, 'test-secret', { expiresIn: '1h' });
      expect(token).toBe('mock-jwt-token');
    });
  });

  describe('verifyToken', () => {
    it('should return decoded payload for a valid token', () => {
      // Arrange
      const mockToken = 'valid.jwt.token';

      // Act
      const decoded = verifyToken(mockToken);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret');
      expect(decoded).toEqual({ userId: 'user_123' });
    });

    it('should throw for an invalid token', () => {
      // Arrange
      jwt.verify.mockImplementation(() => { throw new Error('invalid signature'); });

      // Act & Assert
      expect(() => verifyToken('invalid.token')).toThrow('invalid signature');
    });

    it('should throw for an expired token', () => {
      // Arrange
      jwt.verify.mockImplementation(() => { throw new Error('jwt expired'); });

      // Act & Assert
      expect(() => verifyToken('expired.token')).toThrow('jwt expired');
    });
  });
});
