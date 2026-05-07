import { getRequestContext } from './requestContext.js';
import env from '../config/env.js';

const sendSuccess = (res, data, statusCode = 200, meta = {}, message = null) => {
  const requestId = getRequestContext().requestId || res.locals?.requestId;

  const body = {
    success: true,
    meta: {
      requestId,
      ...meta,
    },
    ...(message ? { message } : {}),
    data,
  };

  res.status(statusCode).json(body);
};

const sendError = (res, error, meta = {}) => {
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';
  const message = error.message || 'Internal Server Error';

  const errorResponse = {
    success: false,
    error: {
      code,
      message,
    },
    meta: {
      requestId: getRequestContext().requestId || res.locals?.requestId,
      ...meta,
    },
  };

  if (error.errors && Array.isArray(error.errors)) {
    errorResponse.error.errors = error.errors;
  }

  if (env.NODE_ENV === 'development' && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

export {
  sendSuccess,
  sendError,
};
