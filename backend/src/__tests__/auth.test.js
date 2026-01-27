import request from 'supertest';
import { app } from '../app.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
  });

  it('should login the user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should not login with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
  });
});
