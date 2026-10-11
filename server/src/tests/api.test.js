const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('SaveX API Integration Tests', () => {
  let user1Token;
  let user1Id;
  let user2Token;
  let user2Id;
  let user1AccountId;

  describe('Health Check', () => {
    test('GET /api/health returns healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('Authentication Flow', () => {
    test('POST /api/v1/auth/register registers User 1 successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@savex.dev',
          password: 'Password123!',
          preferredCurrency: 'USD'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('jane@savex.dev');
      user1Token = res.body.token;
      user1Id = res.body.user._id;
    });

    test('POST /api/v1/auth/register rejects duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Clone',
          email: 'jane@savex.dev',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(400);
    });

    test('POST /api/v1/auth/register registers User 2 (for isolation checks)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Smith',
          email: 'john@savex.dev',
          password: 'Password123!',
          preferredCurrency: 'EUR'
        });

      expect(res.statusCode).toBe(201);
      user2Token = res.body.token;
      user2Id = res.body.user._id;
    });

    test('POST /api/v1/auth/login succeeds with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'jane@savex.dev',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    test('POST /api/v1/auth/login rejects incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'jane@savex.dev',
          password: 'WrongPassword'
        });

      expect(res.statusCode).toBe(401);
    });

    test('GET /api/v1/auth/me returns current user with Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('jane@savex.dev');
    });

    test('GET /api/v1/auth/me denies unauthorized request', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Account Management & Multi-User Data Isolation', () => {
    test('POST /api/v1/accounts creates an account for User 1', async () => {
      const res = await request(app)
        .post('/api/v1/accounts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Main Checking',
          type: 'checking',
          currency: 'USD',
          openingBalance: 1000
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.account.name).toBe('Main Checking');
      expect(res.body.account.currentBalance).toBe(1000);
      user1AccountId = res.body.account._id;
    });

    test('User 2 cannot access or view User 1 account', async () => {
      const res = await request(app)
        .get(`/api/v1/accounts/${user1AccountId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Transaction Accounting & Balance Updates', () => {
    test('POST /api/v1/transactions creates an expense and debits the account', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'expense',
          amount: 250.50,
          description: 'Grocery shopping',
          account: user1AccountId,
          date: new Date()
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.transaction.amount).toBe(250.5);

      // Verify account balance was deducted: 1000 - 250.50 = 749.50
      const accRes = await request(app)
        .get(`/api/v1/accounts/${user1AccountId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(accRes.body.account.currentBalance).toBe(749.50);
    });

    test('POST /api/v1/transactions creates an income and credits the account', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          type: 'income',
          amount: 500,
          description: 'Freelance payment',
          account: user1AccountId
        });

      expect(res.statusCode).toBe(201);

      // Verify balance: 749.50 + 500 = 1249.50
      const accRes = await request(app)
        .get(`/api/v1/accounts/${user1AccountId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(accRes.body.account.currentBalance).toBe(1249.50);
    });
  });
});
