import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;
let app;
let token;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test-preferences';
  process.env.JWT_SECRET = 'integration_test_secret';
  process.env.PORT = '3000';
  process.env.LOG_LEVEL = 'fatal';

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

const registerAndLogin = async (email = 'pref.test@example.com') => {
  await request(app).post('/register').send({ name: 'Pref User', email, password: 'password123' });
  const loginRes = await request(app).post('/login').send({ email, password: 'password123' });
  return loginRes.body.data.token;
};

describe('Integration - Preferences Routes', () => {
  describe('GET /preferences', () => {
    it('should return default preferences for authenticated user', async () => {
      // Arrange
      token = await registerAndLogin();

      // Act
      const response = await request(app)
        .get('/preferences')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.categories).toBeDefined();
      expect(response.body.data.languages).toBeDefined();
      expect(response.body.data.country).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app).get('/preferences');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /preferences', () => {
    it('should update preferences successfully', async () => {
      // Arrange
      token = await registerAndLogin();
      const updatePayload = { categories: ['technology', 'sports'], country: 'gb', languages: ['en'] };

      // Act
      const response = await request(app)
        .put('/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toContain('technology');
      expect(response.body.data.country).toBe('gb');
    });

    it('should return 400 for invalid category', async () => {
      // Arrange
      token = await registerAndLogin();
      const updatePayload = { categories: ['invalid_category'] };

      // Act
      const response = await request(app)
        .put('/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid country code', async () => {
      // Arrange
      token = await registerAndLogin();
      const updatePayload = { country: 'zz' };

      // Act
      const response = await request(app)
        .put('/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app)
        .put('/preferences')
        .send({ categories: ['technology'] });

      // Assert
      expect(response.status).toBe(401);
    });

    it('should persist preferences and be retrievable via GET', async () => {
      // Arrange
      token = await registerAndLogin();
      const updatePayload = { categories: ['health'], keywords: ['wellness', 'fitness'] };

      // Act
      await request(app)
        .put('/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload);

      const getResponse = await request(app)
        .get('/preferences')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(getResponse.body.data.categories).toContain('health');
    });
  });
});
