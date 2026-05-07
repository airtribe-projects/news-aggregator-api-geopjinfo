import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mockArticles = [
  { url: 'https://example.com/1', title: 'Test Article 1', description: 'Desc 1', source: { name: 'Source 1' }, urlToImage: null, publishedAt: new Date().toISOString(), author: 'Author 1', content: 'Content 1' },
  { url: 'https://example.com/2', title: 'Test Article 2', description: 'Desc 2', source: { name: 'Source 2' }, urlToImage: null, publishedAt: new Date().toISOString(), author: 'Author 2', content: 'Content 2' },
];

jest.unstable_mockModule('../../src/datasources/externalNews.datasource.js', () => ({
  default: {
    fetchTopHeadlines: jest.fn().mockResolvedValue(mockArticles),
    searchNews: jest.fn().mockResolvedValue(mockArticles),
  },
}));

let mongoServer;
let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'server-integration-test-secret';
  process.env.PORT = '3000';
  process.env.LOG_LEVEL = 'fatal';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const appModule = await import('../../src/app.js');
  app = appModule.default;
});

beforeEach(async () => {
  if (mongoose.connection.readyState) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
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

describe('News Aggregator Integration', () => {
  const mockUser = {
    name: 'Clark Kent',
    email: 'clark@superman.com',
    password: 'Krypt()n8',
  };

  let token = '';

  test('POST /register', async () => {
    const response = await request(app).post('/register').send(mockUser);
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  test('POST /login', async () => {
    await request(app).post('/register').send(mockUser);
    const response = await request(app).post('/login').send({
      email: mockUser.email,
      password: mockUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeDefined();
    token = response.body.data.token;
  });

  test('GET /preferences', async () => {
    await request(app).post('/register').send(mockUser);
    const login = await request(app).post('/login').send({
      email: mockUser.email,
      password: mockUser.password,
    });

    const response = await request(app)
      .get('/preferences')
      .set('Authorization', `Bearer ${login.body.data.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
  });

  test('PUT /preferences', async () => {
    await request(app).post('/register').send(mockUser);
    const login = await request(app).post('/login').send({
      email: mockUser.email,
      password: mockUser.password,
    });

    const response = await request(app)
      .put('/preferences')
      .set('Authorization', `Bearer ${login.body.data.token}`)
      .send({ categories: ['technology'] });

    expect(response.status).toBe(200);
    expect(response.body.data.categories).toContain('technology');
  });

  test('GET /news and interactions', async () => {
    await request(app).post('/register').send(mockUser);
    const login = await request(app).post('/login').send({
      email: mockUser.email,
      password: mockUser.password,
    });
    const authHeader = { Authorization: `Bearer ${login.body.data.token}` };

    const newsResponse = await request(app).get('/news').set(authHeader);
    expect(newsResponse.status).toBe(200);

    const readResponse = await request(app)
      .post('/news/article-123/read')
      .set(authHeader)
      .send({ title: 'Test Article', url: 'https://example.com/article' });
    expect([200, 201]).toContain(readResponse.status);

    const favoriteResponse = await request(app)
      .post('/news/article-456/favorite')
      .set(authHeader)
      .send({ title: 'Favorite Article', url: 'https://example.com/favorite' });
    expect([200, 201]).toContain(favoriteResponse.status);

    const readList = await request(app).get('/news/read').set(authHeader);
    expect(readList.status).toBe(200);

    const favoriteList = await request(app).get('/news/favorites').set(authHeader);
    expect(favoriteList.status).toBe(200);
  });

  test('GET /health', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('POST /register returns 409 for duplicate email', async () => {
    await request(app).post('/register').send(mockUser);
    const response = await request(app).post('/register').send(mockUser);
    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  test('POST /login returns 401 for wrong password', async () => {
    await request(app).post('/register').send(mockUser);
    const response = await request(app).post('/login').send({
      email: mockUser.email,
      password: 'WrongPassword1!',
    });
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('POST /login returns 401 for unknown email', async () => {
    const response = await request(app).post('/login').send({
      email: 'nobody@notexist.com',
      password: 'SomePass1!',
    });
    expect(response.status).toBe(401);
  });

  test('GET /preferences returns 401 without token', async () => {
    const response = await request(app).get('/preferences');
    expect(response.status).toBe(401);
  });

  test('PUT /preferences returns 400 for invalid category', async () => {
    await request(app).post('/register').send(mockUser);
    const login = await request(app).post('/login').send({
      email: mockUser.email,
      password: mockUser.password,
    });

    const response = await request(app)
      .put('/preferences')
      .set('Authorization', `Bearer ${login.body.data.token}`)
      .send({ categories: ['movies'] });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
