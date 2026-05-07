import { jest } from '@jest/globals';

// ── Mock dependencies before importing the service ──────────────────────────
jest.unstable_mockModule('../../../src/repositories/user.repository.js', () => ({
  default: {
    existsByEmail: jest.fn(),
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    create: jest.fn(),
    mapToDTO: jest.fn(),
  }
}));

jest.unstable_mockModule('../../../src/utils/jwt.js', () => ({
  generateToken: jest.fn(() => 'mock-token'),
}));

jest.unstable_mockModule('../../../src/utils/password.js', () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(() => Promise.resolve('hashed_password')),
}));

const authService = (await import('../../../src/services/auth.service.js')).default;
const userRepository = (await import('../../../src/repositories/user.repository.js')).default;
const { comparePassword, hashPassword } = await import('../../../src/utils/password.js');
const { generateToken } = await import('../../../src/utils/jwt.js');

describe('Service - Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a user and return the DTO', async () => {
      // Arrange
      const payload = { name: 'Alice', email: 'alice@example.com', password: 'Password1!' };
      const mockUser = { id: 'user_1', name: 'Alice', email: 'alice@example.com' };
      userRepository.existsByEmail.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await authService.register(payload);

      // Assert
      expect(userRepository.existsByEmail).toHaveBeenCalledWith('alice@example.com');
      expect(hashPassword).toHaveBeenCalledWith('Password1!');
      expect(userRepository.create).toHaveBeenCalledWith({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'hashed_password'
      });
      expect(result.email).toBe('alice@example.com');
    });

    it('should throw 409 when email already exists', async () => {
      // Arrange
      userRepository.existsByEmail.mockResolvedValue(true);

      // Act & Assert
      await expect(
        authService.register({ name: 'Alice', email: 'alice@example.com', password: 'Password1!' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('login', () => {
    it('should return user and token on valid credentials', async () => {
      // Arrange
      const payload = { email: 'alice@example.com', password: 'Password1!' };
      const fakeUser = { _id: 'user_1', password: 'hashed_password' };
      const mockDTO = { id: 'user_1', email: 'alice@example.com' };
      userRepository.findByEmailWithPassword.mockResolvedValue(fakeUser);
      userRepository.mapToDTO.mockReturnValue(mockDTO);
      comparePassword.mockResolvedValue(true);

      // Act
      const result = await authService.login(payload);

      // Assert
      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith('alice@example.com');
      expect(comparePassword).toHaveBeenCalledWith('Password1!', 'hashed_password');
      expect(generateToken).toHaveBeenCalledWith({ userId: fakeUser._id });
      expect(result.token).toBe('mock-token');
      expect(result.user).toEqual(mockDTO);
    });

    it('should throw 401 when user is not found', async () => {
      // Arrange
      userRepository.findByEmailWithPassword.mockResolvedValue(null);

      // Act & Assert
      await expect(
        authService.login({ email: 'nobody@example.com', password: 'Password1!' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 401 when password is incorrect', async () => {
      // Arrange
      const fakeUser = { _id: 'user_1', password: 'hashed_password' };
      userRepository.findByEmailWithPassword.mockResolvedValue(fakeUser);
      comparePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(
        authService.login({ email: 'alice@example.com', password: 'WrongPass!' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw 400 when email or password is missing', async () => {
      // Act & Assert
      await expect(
        authService.login({ email: '', password: '' })
      ).rejects.toMatchObject({ statusCode: 400 });
    });
  });
});
