import ApiError from '../utils/ApiError.js';
import { sendError } from '../utils/response.js';
import { ERROR_CODES } from '../constants/constants.js';

const notFoundMiddleware = (req, res) => {
  return sendError(res, new ApiError(ERROR_CODES.NOT_FOUND, { message: `Route not found: ${req.method} ${req.originalUrl}` }));
};

export default notFoundMiddleware;