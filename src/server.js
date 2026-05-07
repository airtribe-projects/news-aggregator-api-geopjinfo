import env from './config/env.js';
import { connectDatabase } from './datasources/db.datasource.js';
import app from './app.js';
import logger from './utils/logger.js';
import cacheRefreshService from './services/cacheRefresh.service.js';

connectDatabase()
  .then(() => {
    logger.info({ uri: env.MONGODB_URI }, 'Connected to MongoDB');
    app.listen(env.PORT, () => {
      logger.info({ port: env.PORT, env: env.NODE_ENV }, `Server running on port ${env.PORT}`);
      cacheRefreshService.start();
    });
  })
  .catch(err => {
    logger.fatal({ err }, 'MongoDB connection error');
    process.exit(1);
  });

