import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/constants.js';

const formatIssues = (issues) => issues.map(issue => ({
  field: issue.path.join('.'),
  message: issue.message,
}));

const validateMiddleware = (schema) => (req, res, next) => {
  const payload = {
    body: req.body || {},
    query: req.query || {},
    params: req.params || {},
  };

  const result = schema.safeParse(payload);

  if (!result.success) {
    return next(new ApiError(ERROR_CODES.VALIDATION_ERROR, { message: 'Invalid request payload', errors: formatIssues(result.error.issues) }));
  }

  req.body = result.data.body ?? req.body;
  req.query = result.data.query ?? req.query;
  req.params = result.data.params ?? req.params;

  return next();
};

export default validateMiddleware;