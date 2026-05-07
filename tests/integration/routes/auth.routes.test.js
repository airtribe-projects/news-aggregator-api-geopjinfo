import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;
let app;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/test-auth';
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
});

describe('Integration - Auth Routes', () => {
  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const payload = { name: 'Integration User', email: 'integration@example.com', password: 'password123' };

      // Act
      const response = await request(app).post('/register').send(payload);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.email).toBe('integration@example.com');
    });

    it('should fail with 409 if email already registered', async () => {
      // Arrange
      const payload = { name: 'Duplicate User', email: 'duplicate@example.com', password: 'password123' };
      await request(app).post('/register').send(payload);

      // Act
      const response = await request(app).post('/register').send(payload);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
    });

    it('should fail with 400 if password is missing', async () => {
      // Arrange
      const payload = { name: 'No Password', email: 'nopass@example.com' };

      // Act
      const response = await request(app).post('/register').send(payload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with 400 if email is invalid', async () => {
      // Arrange
      const payload = { name: 'Bad Email', email: 'not-an-email', password: 'password123' };

      // Act
      const response = await request(app).post('/register').send(payload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with 400 if name is missing', async () => {
      // Arrange
      const payload = { email: 'noname@example.com', password: 'password123' };

      // Act
      const response = await request(app).post('/register').send(payload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      await request(app).post('/register').send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'password123'
      });
    });

    it('should login successfully with valid credentials', async () => {
      // Arrange
      const payload = { email: 'login@example.com', password: 'password123' };

      // Act
      const response = await request(app).post('/login').send(payload);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('login@example.com');
    });

    it('should fail with 401 for wrong password', async () => {
      // Arrange
      const payload = { email: 'login@example.com', password: 'wrongpassword' };

      // Act
      const response = await request(app).post('/login').send(payload);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with 401 for non-existent email', async () => {
      // Arrange
      const payload = { email: 'nobody@example.com', password: 'password123' };

      // Act
      const response = await request(app).post('/login').send(payload);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with 400 if email is missing', async () => {
      // Arrange
      const payload = { password: 'password123' };

      // Act
      const response = await request(app).post('/login').send(payload);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
