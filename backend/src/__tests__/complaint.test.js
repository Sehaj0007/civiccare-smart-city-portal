import request from 'supertest';
import { app } from '../app.js';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import mongoose from 'mongoose';

describe('Complaint Endpoints', () => {
  let token;
  let user;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    // Clean up
    await User.deleteMany({});
    await Complaint.deleteMany({});

    // Create a user and get token
    await request(app).post('/api/auth/register').send({
      name: 'Complaint Tester',
      email: 'complaint@test.com',
      password: 'password123',
      phone: '9876543210'
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'complaint@test.com',
      password: 'password123'
    });

    token = loginRes.body.token;
    user = await User.findOne({ email: 'complaint@test.com' });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create a new complaint', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'WASTE_MANAGEMENT',
        complaintType: 'Garbage Dump',
        description: 'Huge pile of garbage near the park.',
        locality: 'Central Park',
        address: '123 Park Avenue',
        imageUrl: 'http://example.com/image.jpg'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.complaint.category).toBe('WASTE_MANAGEMENT');
    expect(res.body.complaint.status).toBe('PENDING');
  });

  it('should not create a complaint with invalid data', async () => {
    const res = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: '', // Invalid
        complaintType: '',
        description: ''
      });

    expect(res.statusCode).toEqual(400); // Validation error
    expect(res.body.success).toBe(false);
  });

  it('should get user complaints', async () => {
    // Create one more complaint
    await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'ELECTRICITY',
        complaintType: 'Street Light',
        description: 'Street light not working.',
        locality: 'Main Street',
        address: '456 Main Street'
      });

    const res = await request(app)
      .get(`/api/complaints/user/${user._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(2);
    expect(res.body.complaints).toBeInstanceOf(Array);
  });
});
