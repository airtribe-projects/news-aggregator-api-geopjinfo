import { ERROR_CODES } from '../constants/constants.js';
import { pingDatabase } from '../datasources/db.datasource.js';
import ApiError from '../utils/ApiError.js';

const check = async () => {
  let db = 'down';

  try {
    const alive = await pingDatabase();
    db = alive ? 'up' : 'down';
  } catch {
    db = 'down';
  }

  if (db === 'down') {
    throw new ApiError(ERROR_CODES.SERVICE_UNAVAILABLE, { message: 'Service is unhealthy' });
  }

  return {
    healthy: true,
    app: 'up',
    db,
    uptimeSeconds: Number(process.uptime().toFixed(0)),
    timestamp: new Date().toISOString()
  };
};

export default {
  check,
};
