import pino from 'pino';
import env from '../config/env.js';
import { getRequestContext } from './requestContext.js';

const transport =
  env.NODE_ENV === 'development'
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
        },
      })
    : process.stdout;

/**
 * Global logger configured with a mixin.
 * The mixin automatically pulls the requestId and userId from the AsyncLocalStorage
 * if they are available in the current execution path.
 */
const logger = pino(
  {
    level: env.LOG_LEVEL || 'info',
    mixin() {
      return getRequestContext();
    },
  },
  transport
);

export default logger;
