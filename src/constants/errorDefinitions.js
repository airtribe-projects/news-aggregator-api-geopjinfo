import { ERROR_CODES } from './constants.js';

export const ERROR_DEFINITIONS = {
  [ERROR_CODES.VALIDATION_ERROR]: { statusCode: 400, message: 'Validation failed' },
  [ERROR_CODES.INVALID_EMAIL_FORMAT]: { statusCode: 400, message: 'Invalid email format' },
  [ERROR_CODES.INVALID_PASSWORD]: { statusCode: 400, message: 'Invalid password' },
  [ERROR_CODES.INVALID_NAME]: { statusCode: 400, message: 'Invalid name' },
  [ERROR_CODES.AUTHENTICATION_ERROR]: { statusCode: 401, message: 'Authentication required' },
  [ERROR_CODES.INVALID_CREDENTIALS]: { statusCode: 401, message: 'Invalid credentials' },
  [ERROR_CODES.AUTHORIZATION_ERROR]: { statusCode: 403, message: 'Forbidden' },
  [ERROR_CODES.NOT_FOUND]: { statusCode: 404, message: 'Resource not found' },
  [ERROR_CODES.USER_NOT_FOUND]: { statusCode: 404, message: 'User not found' },
  [ERROR_CODES.CONFLICT]: { statusCode: 409, message: 'Conflict' },
  [ERROR_CODES.EMAIL_ALREADY_REGISTERED]: { statusCode: 409, message: 'Email already registered' },
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: { statusCode: 429, message: 'Too many requests, please try again later' },
  [ERROR_CODES.INTERNAL_ERROR]: { statusCode: 500, message: 'Internal Server Error' },
  [ERROR_CODES.EXTERNAL_API_ERROR]: { statusCode: 502, message: 'External API error' },
  [ERROR_CODES.SERVICE_UNAVAILABLE]: { statusCode: 503, message: 'Service unavailable' },
};
