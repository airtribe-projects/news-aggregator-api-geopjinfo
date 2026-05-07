import { ZodError } from 'zod';
import logger from '../utils/logger.js';
import { sendError } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/constants.js';

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  const errorLogger = req.logger || logger;

  errorLogger.error({
    err,
    code: err.code,
    ...(err.errors ? { details: err.errors } : {}),
  }, 'Request error');

  if (res.headersSent) return next(err);

  // Zod validation errors
  if (err instanceof ZodError) {
    return sendError(res, new ApiError(ERROR_CODES.VALIDATION_ERROR, {
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    }));
  }

  // Custom API errors
  if (err instanceof ApiError) {
    return sendError(res, err);
  }

  // Standard Express errors (e.g., body-parser)
  if (err.status || err.statusCode) {
    const statusCode = err.status || err.statusCode;
    return sendError(res, new ApiError(
      statusCode === 400 ? ERROR_CODES.VALIDATION_ERROR : ERROR_CODES.INTERNAL_ERROR,
      { message: err.message || 'Request failed', statusCode },
    ));
  }

  // Generic fallback
  return sendError(res, new ApiError(ERROR_CODES.INTERNAL_ERROR));
};

export default errorMiddleware;
