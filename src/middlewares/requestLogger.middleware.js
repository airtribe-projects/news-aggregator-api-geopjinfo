import logger from '../utils/logger.js';

const requestLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const requestId = res.locals?.requestId;

  // Log incoming request
  logger.info({
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  }, `${req.method} ${req.path}`);

  // Hook into response to log completion
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    logger.info({
      requestId,
      method: req.method,
      path: req.path,
      statusCode,
      durationMs: duration,
    }, `${req.method} ${req.path} - ${statusCode}`);

    return originalJson.call(this, data);
  };

  next();
};

export default requestLoggerMiddleware;
