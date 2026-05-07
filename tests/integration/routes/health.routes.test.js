import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;
let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test-health';
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

describe('Integration - Health Route', () => {
  describe('GET /health', () => {
    it('should return 200 with health data when DB is connected', async () => {
      // Act
      const response = await request(app).get('/health');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.healthy).toBe(true);
      expect(response.body.data.app).toBe('up');
      expect(response.body.data.db).toBe('up');
      expect(response.body.data.timestamp).toBeDefined();
    });

    it('should return a valid ISO timestamp', async () => {
      // Act
      const response = await request(app).get('/health');
      const timestamp = new Date(response.body.data.timestamp);

      // Assert
      expect(timestamp.toISOString()).toBe(response.body.data.timestamp);
    });

    it('should include uptimeSeconds as a non-negative number', async () => {
      // Act
      const response = await request(app).get('/health');

      // Assert
      expect(typeof response.body.data.uptimeSeconds).toBe('number');
      expect(response.body.data.uptimeSeconds).toBeGreaterThanOrEqual(0);
    });
  });
});
