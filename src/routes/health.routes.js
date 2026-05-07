import express from 'express';
import healthController from '../controllers/health.controller.js';
import asyncHandler from '../utils/async-handler.js';

const router = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Service health check
 *     description: Returns application and database liveness details.
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 meta:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     healthy:
 *                       type: boolean
 *                       example: true
 *                     app:
 *                       type: string
 *                       example: up
 *                     db:
 *                       type: string
 *                       example: up
 *                     uptimeSeconds:
 *                       type: number
 *                       example: 123
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       503:
 *         description: Service unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', asyncHandler(healthController.getHealth));

export default router;
