import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';
import { setRequestContext } from '../utils/requestContext.js';
import { JWT_ERROR_NAMES, BEARER_PREFIX, ERROR_CODES } from '../constants/constants.js';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.get('Authorization') || '';
    const token = authHeader.startsWith(BEARER_PREFIX) ? authHeader.slice(BEARER_PREFIX.length).trim() : '';

    if (!token) {
      throw new ApiError(ERROR_CODES.AUTHENTICATION_ERROR, { message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    setRequestContext({ actorId: decoded.userId });
    next();
  } catch (err) {
    if (JWT_ERROR_NAMES.includes(err.name)) {
      next(new ApiError(ERROR_CODES.AUTHENTICATION_ERROR, { message: 'Invalid token' }));
    } else {
      next(err);
    }
  }
};

export default authMiddleware;
