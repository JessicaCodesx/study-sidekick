import request from 'supertest';
import express from 'express';
import auth from '../../middleware/auth.js';
import { generateMockToken } from '../setup.js';
import admin from '../../config/firebase.js';

// For ESM, you need to use vi.mock or import the mocked module first
import { jest } from '@jest/globals';

// Mock Firebase admin SDK
jest.mock('../../config/firebase.js', () => {
  return {
    default: {
      auth: () => ({
        verifyIdToken: jest.fn().mockImplementation((token) => {
          if (token === 'valid-token') {
            return Promise.resolve({ uid: 'test-user-id', email: 'test@example.com' });
          } else {
            return Promise.reject(new Error('Invalid token'));
          }
        })
      })
    }
  };
});

// Mock Express app
const app = express();

// Add test endpoint with auth middleware
app.get('/protected', auth, (req, res) => {
  res.json({ user: req.user });
});

describe('Auth Middleware Tests', () => {
  test('should allow access with valid token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer valid-token');
    
    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.id).toBe('test-user-id');
  });
  
  test('should deny access with invalid token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token is invalid or expired');
  });
  
  test('should deny access with missing token', async () => {
    const response = await request(app).get('/protected');
    
    expect(response.status).toBe(401);
  });
});