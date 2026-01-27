import request from 'supertest';
import { app } from '../app.js';
import mongoose from 'mongoose';

describe('Health Check', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'Server is running');
  });
});
