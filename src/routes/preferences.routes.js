import express from 'express';
const router = express.Router();
import preferencesController from '../controllers/preferences.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import asyncHandler from '../utils/async-handler.js';
import { getPreferencesRequestSchema, updatePreferencesRequestSchema } from '../validators/preferences.validator.js';

/**
 * @openapi
 * /preferences:
 *   get:
 *     tags: [Preferences]
 *     summary: Get current user preferences
 *     responses:
 *       200:
 *         description: User preferences retrieved
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
 *                   $ref: '#/components/schemas/Preferences'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, validate(getPreferencesRequestSchema), asyncHandler(preferencesController.getPreferences));

/**
 * @openapi
 * /preferences:
 *   put:
 *     tags: [Preferences]
 *     summary: Update user preferences
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Preferences'
 *     responses:
 *       200:
 *         description: Preferences updated
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
 *                 message:
 *                   type: string
 *                   example: Preferences updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Preferences'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/', authMiddleware, validate(updatePreferencesRequestSchema), asyncHandler(preferencesController.updatePreferences));

export default router;
