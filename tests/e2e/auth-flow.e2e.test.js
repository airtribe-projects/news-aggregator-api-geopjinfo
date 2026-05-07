import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;
let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/e2e-auth-test';
  process.env.JWT_SECRET = 'e2e_super_secret_jwt';
  process.env.PORT = '3000';
  process.env.LOG_LEVEL = 'fatal';

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

describe('E2E - Auth Flow', () => {
  it('should complete full auth journey: register -> login -> preferences', async () => {
    const testUser = {
      name: 'E2E Test User',
      email: 'e2e.auth@example.com',
      password: 'securePassword123'
    };

    // Step 1: Register User
    const registerResponse = await request(app)
      .post('/register')
      .send(testUser);

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data.email).toBe(testUser.email);
    expect(registerResponse.body.data.name).toBe(testUser.name);
    // Sensitive data should not be exposed
    expect(registerResponse.body.data.password).toBeUndefined();

    // Step 2: Login User
    const loginResponse = await request(app)
      .post('/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data.token).toBeDefined();
    expect(loginResponse.body.data.user.email).toBe(testUser.email);

    const token = loginResponse.body.data.token;

    // Step 3: Get Default Preferences
    const prefsResponse = await request(app)
      .get('/preferences')
      .set('Authorization', `Bearer ${token}`);

    expect(prefsResponse.status).toBe(200);
    expect(prefsResponse.body.success).toBe(true);
    expect(prefsResponse.body.data).toBeDefined();
    expect(Array.isArray(prefsResponse.body.data.categories)).toBe(true);

    // Step 4: Update Preferences
    const updatePrefsResponse = await request(app)
      .put('/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ categories: ['technology', 'health'], country: 'us', languages: ['en'] });

    expect(updatePrefsResponse.status).toBe(200);
    expect(updatePrefsResponse.body.data.categories).toContain('technology');
    expect(updatePrefsResponse.body.data.country).toBe('us');

    // Step 5: Verify Updated Preferences Persist
    const verifyPrefsResponse = await request(app)
      .get('/preferences')
      .set('Authorization', `Bearer ${token}`);

    expect(verifyPrefsResponse.body.data.categories).toContain('technology');
  });

  it('should prevent duplicate registrations', async () => {
    const testUser = { name: 'Dup User', email: 'dup.e2e@example.com', password: 'password123' };

    await request(app).post('/register').send(testUser);
    const dupResponse = await request(app).post('/register').send(testUser);

    expect(dupResponse.status).toBe(409);
    expect(dupResponse.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it('should reject login with invalid credentials', async () => {
    const testUser = { name: 'Bad Login', email: 'badlogin.e2e@example.com', password: 'password123' };
    await request(app).post('/register').send(testUser);

    const loginResponse = await request(app)
      .post('/login')
      .send({ email: testUser.email, password: 'wrongpassword' });

    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body.success).toBe(false);
  });

  it('should reject protected routes without a token', async () => {
    const prefsResponse = await request(app).get('/preferences');
    expect(prefsResponse.status).toBe(401);

    const newsResponse = await request(app).get('/news');
    expect(newsResponse.status).toBe(401);
  });
});
