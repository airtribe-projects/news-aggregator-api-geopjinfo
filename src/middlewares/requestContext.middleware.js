import { randomUUID } from 'node:crypto';
import { runWithRequestContext } from '../utils/requestContext.js';

const requestContextMiddleware = (req, res, next) => {
  const requestId = req.get('x-request-id') || randomUUID();
  const context = {
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  };

  res.locals.requestId = requestId;
  res.set('x-request-id', requestId);

  return runWithRequestContext(context, next);
};

export default requestContextMiddleware;
