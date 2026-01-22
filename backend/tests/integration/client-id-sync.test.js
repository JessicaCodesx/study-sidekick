// tests/integration/client-id-sync.test.js
import request from 'supertest';
import app from '../../server.js';
import { setupDB, teardownDB, clearDatabase } from '../setup.js';
import Course from '../../models/Course.js';
import { jest } from '@jest/globals';

// Mock auth middleware
jest.mock('../../middleware/auth.js', () => {
  return {
    default: function(req, res, next) {
      req.user = { id: 'test-user-id', email: 'test@example.com' };
      next();
    }
  };
});

describe('Client ID Synchronization Tests', () => {
  // Setup and teardown
  beforeAll(async () => await setupDB());
  afterAll(async () => await teardownDB());
  afterEach(async () => await clearDatabase());
  
  test('Should handle client-generated IDs correctly', async () => {
    // Create client-generated ID
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // 1. Create a course with client ID
    const courseData = {
      id: clientId,
      name: 'Client ID Course',
      colorTheme: 'purple'
    };
    
    const createResponse = await request(app)
      .post('/api/courses')
      .send(courseData);
    
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.id).toBe(clientId);
    
    // 2. Check if it can be retrieved with the client ID
    const getResponse = await request(app)
      .get('/api/courses');
    
    expect(getResponse.status).toBe(200);
    const course = getResponse.body.find(c => c.id === clientId);
    expect(course).toBeTruthy();
    
    // 3. Update the course using client ID
    const updateResponse = await request(app)
      .put(`/api/courses/${clientId}`)
      .send({ name: 'Updated Course' });
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('Updated Course');
    
    // 4. Delete the course using client ID
    const deleteResponse = await request(app)
      .delete(`/api/courses/${clientId}`);
    
    expect(deleteResponse.status).toBe(200);
    
    // 5. Verify deletion
    const verifyResponse = await request(app)
      .get('/api/courses');
    
    expect(verifyResponse.body.find(c => c.id === clientId)).toBeUndefined();
  });
  
  test('Sync should handle updates to existing documents with client IDs', async () => {
    // Create a course directly in the database
    const clientId = 'sync-test-id';
    await Course.create({
      id: clientId,
      name: 'Original Name',
      colorTheme: 'blue',
      firebaseId: 'test-user-id'
    });
    
    // Sync an update to the course
    const syncData = {
      courses: [
        {
          id: clientId,
          name: 'Updated Via Sync',
          colorTheme: 'red',
          updatedAt: Date.now()
        }
      ]
    };
    
    const syncResponse = await request(app)
      .post('/api/sync')
      .send(syncData);
    
    expect(syncResponse.status).toBe(200);
    
    // Verify the update was applied
    const course = await Course.findOne({ id: clientId });
    expect(course).toBeTruthy();
    expect(course.name).toBe('Updated Via Sync');
    expect(course.colorTheme).toBe('red');
  });
});