import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;
let app;

// Mock external news API to avoid real HTTP calls
jest.unstable_mockModule('../../src/datasources/externalNews.datasource.js', () => ({
  default: {
    fetchTopHeadlines: jest.fn(() => Promise.resolve([
      {
        url: 'https://e2e-test.com/tech-1',
        title: 'E2E Tech Article',
        description: 'A technology article for e2e testing',
        source: { name: 'E2E Tech News' },
        urlToImage: 'https://e2e-test.com/image.jpg',
        publishedAt: '2026-05-01T10:00:00Z',
        author: 'E2E Author',
        content: 'E2E article content',
      }
    ])),
    searchNews: jest.fn(() => Promise.resolve([
      {
        url: 'https://e2e-test.com/crypto-1',
        title: 'E2E Bitcoin Article',
        description: 'A bitcoin article for search testing',
        source: { name: 'E2E Crypto News' },
        urlToImage: null,
        publishedAt: '2026-05-01T11:00:00Z',
        author: 'Crypto E2E Writer',
        content: 'Crypto e2e content',
      }
    ])),
  }
}));

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/e2e-news-test';
  process.env.JWT_SECRET = 'e2e_super_secret_jwt';
  process.env.PORT = '3000';
  process.env.LOG_LEVEL = 'fatal';
  process.env.NEWS_API_KEY = 'e2e-test-key';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const appModule = await import('../../src/app.js');
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

describe('E2E - News Flow', () => {
  it('should complete full news journey: register -> get news -> mark read -> mark favorite -> retrieve lists', async () => {
    // Step 1: Register and Login
    const testUser = { name: 'News E2E User', email: 'news.e2e@example.com', password: 'password123' };

    await request(app).post('/register').send(testUser);
    const loginRes = await request(app).post('/login').send({
      email: testUser.email,
      password: testUser.password
    });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data.token;
    expect(token).toBeDefined();

    // Step 2: Get Top Headlines
    const newsRes = await request(app)
      .get('/news')
      .set('Authorization', `Bearer ${token}`);

    expect(newsRes.status).toBe(200);
    expect(newsRes.body.success).toBe(true);
    expect(Array.isArray(newsRes.body.data)).toBe(true);
    expect(newsRes.body.data.length).toBeGreaterThan(0);

    const firstArticle = newsRes.body.data[0];
    expect(firstArticle.articleId).toBeDefined();
    expect(firstArticle.title).toBeDefined();
    expect(firstArticle.url).toBeDefined();

    // Step 3: Mark Article as Read
    const markReadRes = await request(app)
      .post(`/news/${encodeURIComponent(firstArticle.articleId)}/read`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        articleId: firstArticle.articleId,
        title: firstArticle.title,
        url: firstArticle.url
      });

    expect(markReadRes.status).toBe(201);
    expect(markReadRes.body.data).toBeDefined();

    // Step 4: Marking Same Article as Read Again Returns Duplicate
    const markReadAgainRes = await request(app)
      .post(`/news/${encodeURIComponent(firstArticle.articleId)}/read`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        articleId: firstArticle.articleId,
        title: firstArticle.title,
        url: firstArticle.url
      });

    expect([200, 201]).toContain(markReadAgainRes.status);

    // Step 5: Mark Article as Favorite
    const markFavRes = await request(app)
      .post(`/news/${encodeURIComponent(firstArticle.articleId)}/favorite`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        articleId: firstArticle.articleId,
        title: firstArticle.title,
        url: firstArticle.url
      });

    expect(markFavRes.status).toBe(201);
    expect(markFavRes.body.data).toBeDefined();

    // Step 6: Get Read Articles List
    const readListRes = await request(app)
      .get('/news/read')
      .set('Authorization', `Bearer ${token}`);

    expect(readListRes.status).toBe(200);
    expect(Array.isArray(readListRes.body.data)).toBe(true);
    expect(readListRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(readListRes.body.data[0].articleId).toBe(firstArticle.articleId);

    // Step 7: Get Favorites List
    const favListRes = await request(app)
      .get('/news/favorites')
      .set('Authorization', `Bearer ${token}`);

    expect(favListRes.status).toBe(200);
    expect(Array.isArray(favListRes.body.data)).toBe(true);
    expect(favListRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(favListRes.body.data[0].articleId).toBe(firstArticle.articleId);

    // Step 8: Search for News
    const searchRes = await request(app)
      .get('/news/search/bitcoin')
      .set('Authorization', `Bearer ${token}`);

    expect(searchRes.status).toBe(200);
    expect(Array.isArray(searchRes.body.data)).toBe(true);
    expect(searchRes.body.data.length).toBeGreaterThan(0);
  });

  it('should apply preferences when fetching news', async () => {
    // Step 1: Register and Login
    const testUser = { name: 'Pref News E2E', email: 'pref.news.e2e@example.com', password: 'password123' };
    await request(app).post('/register').send(testUser);
    const loginRes = await request(app).post('/login').send({
      email: testUser.email, password: testUser.password
    });
    const token = loginRes.body.data.token;

    // Step 2: Set Preferences
    await request(app)
      .put('/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ categories: ['technology'], country: 'us', languages: ['en'] });

    // Step 3: Get News (should use preferences)
    const newsRes = await request(app)
      .get('/news')
      .set('Authorization', `Bearer ${token}`);

    expect(newsRes.status).toBe(200);
    expect(newsRes.body.data).toBeDefined();
  });
});
