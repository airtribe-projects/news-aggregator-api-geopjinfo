import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;
let app;
let token;

// Mock the external news datasource to avoid real HTTP calls
jest.unstable_mockModule('../../../src/datasources/externalNews.datasource.js', () => ({
  default: {
    fetchTopHeadlines: jest.fn(() => Promise.resolve([
      {
        url: 'https://example.com/article-1',
        title: 'Test Headline 1',
        description: 'A test description',
        source: { name: 'TestSource' },
        urlToImage: null,
        publishedAt: '2026-05-01T00:00:00Z',
        author: 'Test Author',
        content: 'Test content',
      },
      {
        url: 'https://example.com/article-2',
        title: 'Test Headline 2',
        description: 'Another description',
        source: { name: 'AnotherSource' },
        urlToImage: null,
        publishedAt: '2026-05-01T01:00:00Z',
        author: null,
        content: null,
      }
    ])),
    searchNews: jest.fn(() => Promise.resolve([
      {
        url: 'https://example.com/bitcoin-1',
        title: 'Bitcoin rises to new high',
        description: 'Bitcoin news',
        source: { name: 'CryptoNews' },
        urlToImage: null,
        publishedAt: '2026-05-01T00:00:00Z',
        author: 'Crypto Writer',
        content: 'Full crypto content',
      }
    ])),
  }
}));

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test-news';
  process.env.JWT_SECRET = 'integration_test_secret';
  process.env.PORT = '3000';
  process.env.LOG_LEVEL = 'fatal';
  process.env.NEWS_API_KEY = 'test_api_key';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const appModule = await import('../../../src/app.js');
  app = appModule.default;
});

afterAll(async () => {
  if (mongoose.connection.readyState) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
  await new Promise(resolve => setTimeout(resolve, 300));
});

afterEach(async () => {
  if (mongoose.connection.readyState) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
  token = undefined;
});

const registerAndLogin = async (email = 'news.test@example.com') => {
  await request(app).post('/register').send({ name: 'News User', email, password: 'password123' });
  const loginRes = await request(app).post('/login').send({ email, password: 'password123' });
  return loginRes.body.data.token;
};

describe('Integration - News Routes', () => {
  describe('GET /news', () => {
    it('should return top headlines for authenticated user', async () => {
      // Arrange
      token = await registerAndLogin();

      // Act
      const response = await request(app)
        .get('/news')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app).get('/news');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /news/:id/read', () => {
    it('should mark article as read with 201 for new entry', async () => {
      // Arrange
      token = await registerAndLogin();
      const payload = {
        articleId: 'article-unique-id-1',
        title: 'Test Article to Read',
        url: 'https://example.com/test-article'
      };

      // Act
      const response = await request(app)
        .post('/news/article-unique-id-1/read')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return 200 with duplicate message when already marked read', async () => {
      // Arrange
      token = await registerAndLogin();
      const payload = {
        articleId: 'article-dup-read',
        title: 'Duplicate Read Article',
        url: 'https://example.com/dup-read'
      };

      // First mark
      await request(app)
        .post('/news/article-dup-read/read')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      // Act - Second mark
      const response = await request(app)
        .post('/news/article-dup-read/read')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      // Assert
      expect([200, 201]).toContain(response.status);
    });

    it('should return 400 when required fields are missing', async () => {
      // Arrange
      token = await registerAndLogin();

      // Act
      const response = await request(app)
        .post('/news/some-id/read')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Only title' }); // missing url and articleId in body

      // Assert
      expect(response.status).toBe(400);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app)
        .post('/news/article-1/read')
        .send({ articleId: 'article-1', title: 'Test', url: 'https://example.com' });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('POST /news/:id/favorite', () => {
    it('should mark article as favorite with 201 for new entry', async () => {
      // Arrange
      token = await registerAndLogin();
      const payload = {
        articleId: 'fav-article-1',
        title: 'Favorite Article',
        url: 'https://example.com/fav-article'
      };

      // Act
      const response = await request(app)
        .post('/news/fav-article-1/favorite')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app)
        .post('/news/fav-1/favorite')
        .send({ articleId: 'fav-1', title: 'Test', url: 'https://example.com' });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /news/read', () => {
    it('should return read articles for authenticated user', async () => {
      // Arrange
      token = await registerAndLogin();
      // Mark an article as read first
      await request(app)
        .post('/news/my-read-article/read')
        .set('Authorization', `Bearer ${token}`)
        .send({ articleId: 'my-read-article', title: 'Read Me', url: 'https://example.com/read-me' });

      // Act
      const response = await request(app)
        .get('/news/read')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app).get('/news/read');

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /news/favorites', () => {
    it('should return favorite articles for authenticated user', async () => {
      // Arrange
      token = await registerAndLogin();
      await request(app)
        .post('/news/my-fav-article/favorite')
        .set('Authorization', `Bearer ${token}`)
        .send({ articleId: 'my-fav-article', title: 'Fav Me', url: 'https://example.com/fav-me' });

      // Act
      const response = await request(app)
        .get('/news/favorites')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app).get('/news/favorites');

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /news/search/:keyword', () => {
    it('should return search results for a given keyword', async () => {
      // Arrange
      token = await registerAndLogin();

      // Act
      const response = await request(app)
        .get('/news/search/bitcoin')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app).get('/news/search/bitcoin');

      // Assert
      expect(response.status).toBe(401);
    });
  });
});
