import express from 'express';
import authRoutes from './auth.routes.js';
import preferencesRoutes from './preferences.routes.js';
import newsRoutes from './news.routes.js';
import healthRoutes from './health.routes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/', authRoutes);
router.use('/preferences', preferencesRoutes);
router.use('/news', newsRoutes);

export default router;
