import express from 'express';
const router = express.Router();
import newsController from '../controllers/news.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import asyncHandler from '../utils/async-handler.js';
import { newsRequestSchema, searchNewsRequestSchema, articleTrackingRequestSchema } from '../validators/news.validator.js';

/**
 * @openapi
 * /news:
 *   get:
 *     tags: [News]
 *     summary: Get top headlines based on user preferences
 *     responses:
 *       200:
 *         description: List of articles
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, validate(newsRequestSchema), asyncHandler(newsController.getNews));

/**
 * @openapi
 * /news/read:
 *   get:
 *     tags: [News]
 *     summary: Get articles marked as read
 *     responses:
 *       200:
 *         description: Read articles
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *       401:
 *         description: Unauthorized
 */
router.get('/read', authMiddleware, validate(newsRequestSchema), asyncHandler(newsController.getReadArticles));

/**
 * @openapi
 * /news/favorites:
 *   get:
 *     tags: [News]
 *     summary: Get favorite articles
 *     responses:
 *       200:
 *         description: Favorite articles
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *       401:
 *         description: Unauthorized
 */
router.get('/favorites', authMiddleware, validate(newsRequestSchema), asyncHandler(newsController.getFavoriteArticles));

/**
 * @openapi
 * /news/search/{keyword}:
 *   get:
 *     tags: [News]
 *     summary: Search articles by keyword
 *     parameters:
 *       - in: path
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         example: space
 *     responses:
 *       200:
 *         description: Search results
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *       401:
 *         description: Unauthorized
 */
router.get('/search/:keyword', authMiddleware, validate(searchNewsRequestSchema), asyncHandler(newsController.searchNews));

/**
 * @openapi
 * /news/{id}/read:
 *   post:
 *     tags: [News]
 *     summary: Mark an article as read
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: URL-encoded article ID (the article URL)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, url]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Breaking News
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/article
 *     responses:
 *       201:
 *         description: Article marked as read (new entry)
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
 *                   example: Marked as read
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       200:
 *         description: Article already marked as read (idempotent)
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
 *                   example: Already marked as read
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/read', authMiddleware, validate(articleTrackingRequestSchema), asyncHandler(newsController.markAsRead));

/**
 * @openapi
 * /news/{id}/favorite:
 *   post:
 *     tags: [News]
 *     summary: Mark an article as favorite
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: URL-encoded article ID (the article URL)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, url]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Breaking News
 *               url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/article
 *     responses:
 *       201:
 *         description: Article marked as favorite (new entry)
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
 *                   example: Marked as favorite
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       200:
 *         description: Article already marked as favorite (idempotent)
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
 *                   example: Already marked as favorite
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/favorite', authMiddleware, validate(articleTrackingRequestSchema), asyncHandler(newsController.markAsFavorite));

export default router;
