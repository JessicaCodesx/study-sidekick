import request from 'supertest';
import express, { json } from 'express';
import { setupDB, teardownDB, mockAuthMiddleware, clearDatabase } from '../setup';
import { syncData, getChanges } from '../../controllers/syncController';
import { findOne, create } from '../../models/Course';
import { findOne as _findOne } from '../../models/Unit';

// Mock Express app
const app = express();
app.use(json());
app.use(mockAuthMiddleware());

// Register routes
app.post('/api/sync', syncData);
app.get('/api/sync', getChanges);

describe('Sync Controller Tests', () => {
  // Setup and teardown
  beforeAll(async () => await setupDB());
  afterAll(async () => await teardownDB());
  afterEach(async () => await clearDatabase());
  
  test('POST /api/sync should save multiple entity types to the database', async () => {
    // Create test data
    const testData = {
      courses: [
        {
          id: 'course-1',
          name: 'Test Course',
          colorTheme: 'blue',
          isArchived: false,
          updatedAt: Date.now()
        }
      ],
      units: [
        {
          id: 'unit-1',
          courseId: 'course-1',
          name: 'Test Unit',
          orderIndex: 0,
          updatedAt: Date.now()
        }
      ],
      tasks: [
        {
          id: 'task-1',
          courseId: 'course-1',
          title: 'Test Task',
          dueDate: new Date(),
          type: 'assignment',
          status: 'pending',
          updatedAt: Date.now()
        }
      ]
    };
    
    // Send sync request
    const response = await request(app)
      .post('/api/sync')
      .send(testData);
    
    // Assert response
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.timestamp).toBeDefined();
    
    // Verify data was saved to database
    const savedCourse = await findOne({ id: 'course-1' });
    expect(savedCourse).toBeTruthy();
    expect(savedCourse.name).toBe('Test Course');
    
    const savedUnit = await _findOne({ id: 'unit-1' });
    expect(savedUnit).toBeTruthy();
    expect(savedUnit.name).toBe('Test Unit');
    expect(savedUnit.courseId).toBe('course-1');
  });
  
  test('GET /api/sync should return changes since lastSync', async () => {
    // Create test data
    const oldTime = Date.now() - 10000; // 10 seconds ago
    const newTime = Date.now();
    
    // Old record (before lastSync)
    await create({
      id: 'old-course',
      name: 'Old Course',
      colorTheme: 'red',
      firebaseId: 'test-user-id',
      createdAt: oldTime,
      updatedAt: oldTime
    });
    
    // New record (after lastSync)
    await create({
      id: 'new-course',
      name: 'New Course',
      colorTheme: 'blue',
      firebaseId: 'test-user-id',
      createdAt: newTime,
      updatedAt: newTime
    });
    
    // Request changes since oldTime
    const response = await request(app)
      .get(`/api/sync?lastSync=${oldTime}`);
    
    // Assert response
    expect(response.status).toBe(200);
    expect(response.body.courses).toBeDefined();
    expect(response.body.courses.length).toBe(1);
    expect(response.body.courses[0].id).toBe('new-course');
    expect(response.body.timestamp).toBeDefined();
  });
});