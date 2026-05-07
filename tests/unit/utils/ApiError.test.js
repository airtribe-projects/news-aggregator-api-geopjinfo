import ApiError from '../../../src/utils/ApiError.js';
import { ERROR_CODES } from '../../../src/constants/constants.js';

describe('Utility - ApiError', () => {
  it('should create an error with default internal error code', () => {
    // Act
    const error = new ApiError();

    // Assert
    expect(error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Internal Server Error');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
  });

  it('should create an error with a specific valid code', () => {
    // Act
    const error = new ApiError(ERROR_CODES.NOT_FOUND);

    // Assert
    expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');
  });

  it('should create a 401 error for INVALID_CREDENTIALS', () => {
    // Act
    const error = new ApiError(ERROR_CODES.INVALID_CREDENTIALS);

    // Assert
    expect(error.code).toBe(ERROR_CODES.INVALID_CREDENTIALS);
    expect(error.statusCode).toBe(401);
  });

  it('should create a 409 error for EMAIL_ALREADY_REGISTERED', () => {
    // Act
    const error = new ApiError(ERROR_CODES.EMAIL_ALREADY_REGISTERED);

    // Assert
    expect(error.code).toBe(ERROR_CODES.EMAIL_ALREADY_REGISTERED);
    expect(error.statusCode).toBe(409);
  });

  it('should fallback to internal server error for unknown code', () => {
    // Act
    const error = new ApiError('UNKNOWN_CODE');

    // Assert
    expect(error.code).toBe('UNKNOWN_CODE');
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe('Internal Server Error');
  });

  it('should allow overriding the message', () => {
    // Act
    const error = new ApiError(ERROR_CODES.VALIDATION_ERROR, { message: 'Custom validation message' });

    // Assert
    expect(error.message).toBe('Custom validation message');
    expect(error.statusCode).toBe(400);
  });

  it('should allow overriding the statusCode', () => {
    // Act
    const error = new ApiError(ERROR_CODES.NOT_FOUND, { statusCode: 410 });

    // Assert
    expect(error.statusCode).toBe(410);
  });

  it('should include errors array if provided', () => {
    // Arrange
    const details = [{ field: 'email', message: 'Invalid email format' }];

    // Act
    const error = new ApiError(ERROR_CODES.VALIDATION_ERROR, { errors: details });

    // Assert
    expect(error.errors).toEqual(details);
  });

  it('should have null errors when not provided', () => {
    // Act
    const error = new ApiError(ERROR_CODES.NOT_FOUND);

    // Assert
    expect(error.errors).toBeNull();
  });
});
