import swaggerJsdoc from 'swagger-jsdoc';
import env from './env.js';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'News Aggregator API',
      version: '1.0.0',
      description:
        'A personalized news aggregation API that fetches headlines and articles based on user preferences. Supports JWT authentication, preference management, and article interaction tracking.',
      contact: {
        name: 'Airtribe',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Health', description: 'Health checks and service status' },
      { name: 'Auth', description: 'User authentication and account access' },
      { name: 'Preferences', description: 'User news preference management' },
      { name: 'News', description: 'News retrieval, search, and article interaction tracking' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            message: { type: 'string', example: 'Validation failed' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '664f1a2b3c4d5e6f7a8b9c0d' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            preferences: { $ref: '#/components/schemas/Preferences' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Preferences: {
          type: 'object',
          properties: {
            categories: {
              type: 'array',
              items: { type: 'string' },
              example: ['technology', 'science'],
            },
            languages: {
              type: 'array',
              items: { type: 'string' },
              example: ['en'],
            },
            country: { type: 'string', example: 'us' },
            keywords: {
              type: 'array',
              items: { type: 'string' },
              example: ['AI', 'climate'],
            },
            sources: {
              type: 'array',
              items: { type: 'string' },
              example: ['bbc-news'],
            },
          },
        },
        Article: {
          type: 'object',
          properties: {
            articleId: { type: 'string', example: 'abc123' },
            title: { type: 'string', example: 'Breaking News' },
            description: { type: 'string', example: 'A short description of the article.' },
            url: { type: 'string', format: 'uri', example: 'https://example.com/article' },
            urlToImage: { type: 'string', format: 'uri', example: 'https://example.com/image.jpg' },
            publishedAt: { type: 'string', format: 'date-time' },
            source: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'bbc-news' },
                name: { type: 'string', example: 'BBC News' },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
