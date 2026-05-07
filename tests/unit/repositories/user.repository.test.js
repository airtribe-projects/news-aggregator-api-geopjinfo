import { jest } from '@jest/globals';

const mockFindOne = jest.fn();
const mockFindById = jest.fn();
const mockCreate = jest.fn();
const mockFindOneAndUpdate = jest.fn();
const mockExists = jest.fn();

jest.unstable_mockModule('../../../src/models/User.model.js', () => ({
  default: {
    findOne: mockFindOne,
    findById: mockFindById,
    create: mockCreate,
    findOneAndUpdate: mockFindOneAndUpdate,
    exists: mockExists,
  }
}));

jest.unstable_mockModule('../../../src/datasources/db.datasource.js', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findMany: jest.fn(),
  updateOne: jest.fn(),
  exists: jest.fn(),
}));

const dbDataSource = await import('../../../src/datasources/db.datasource.js');
const userRepository = (await import('../../../src/repositories/user.repository.js')).default;

describe('Repository - User Repository', () => {
  const mockDate = new Date();
  const mockDoc = {
    _id: 'user_123',
    name: 'John Doe',
    email: 'john@example.com',
    preferences: { categories: [], languages: ['en'], country: 'us', keywords: [], sources: [] },
    createdAt: mockDate,
    updatedAt: mockDate,
  };
  const expectedDTO = {
    id: 'user_123',
    name: 'John Doe',
    email: 'john@example.com',
    preferences: { categories: [], languages: ['en'], country: 'us', keywords: [], sources: [] },
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return mapped user DTO', async () => {
      // Arrange
      dbDataSource.create.mockResolvedValue(mockDoc);

      // Act
      const result = await userRepository.create({ name: 'John Doe', email: 'john@example.com', password: 'hashed' });

      // Assert
      expect(dbDataSource.create).toHaveBeenCalled();
      expect(result).toMatchObject({ id: 'user_123', email: 'john@example.com' });
    });

    it('should throw EMAIL_ALREADY_REGISTERED on duplicate key error', async () => {
      // Arrange
      const dupError = new Error('Duplicate');
      dupError.code = 11000;
      dbDataSource.create.mockRejectedValue(dupError);

      // Act & Assert
      await expect(
        userRepository.create({ name: 'John', email: 'john@example.com', password: 'hashed' })
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('findById', () => {
    it('should return mapped DTO when user is found', async () => {
      // Arrange
      dbDataSource.findById.mockResolvedValue(mockDoc);

      // Act
      const result = await userRepository.findById('user_123');

      // Assert
      expect(dbDataSource.findById).toHaveBeenCalled();
      expect(result).toMatchObject(expectedDTO);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      dbDataSource.findById.mockResolvedValue(null);

      // Act
      const result = await userRepository.findById('nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return mapped DTO when user is found', async () => {
      // Arrange
      dbDataSource.findOne.mockResolvedValue(mockDoc);

      // Act
      const result = await userRepository.findByEmail('john@example.com');

      // Assert
      expect(dbDataSource.findOne).toHaveBeenCalledWith(expect.anything(), { email: 'john@example.com' });
      expect(result).toMatchObject({ email: 'john@example.com' });
    });

    it('should return null when user is not found', async () => {
      // Arrange
      dbDataSource.findOne.mockResolvedValue(null);

      // Act
      const result = await userRepository.findByEmail('unknown@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('existsByEmail', () => {
    it('should return true if email exists', async () => {
      // Arrange
      dbDataSource.exists.mockResolvedValue({ _id: 'user_123' });

      // Act
      const result = await userRepository.existsByEmail('john@example.com');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      // Arrange
      dbDataSource.exists.mockResolvedValue(null);

      // Act
      const result = await userRepository.existsByEmail('unknown@example.com');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('mapToDTO', () => {
    it('should correctly map a user document to DTO', () => {
      // Act
      const result = userRepository.mapToDTO(mockDoc);

      // Assert
      expect(result).toMatchObject(expectedDTO);
      expect(result).not.toHaveProperty('password');
    });

    it('should return null for null input', () => {
      // Act
      const result = userRepository.mapToDTO(null);

      // Assert
      expect(result).toBeNull();
    });
  });
});
