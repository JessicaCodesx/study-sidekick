import request from 'supertest';
import app from '../../server'; // Import main app
import { setupDB, teardownDB, clearDatabase, generateMockToken } from '../setup';
import { create } from '../../models/Course';
import Task from '../../models/Task';

// Mock Firebase auth in the app
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { id: 'test-user-id', email: 'test@example.com' };
    next();
  };
});

describe('Sync Flow Integration Tests', () => {
  // Setup and teardown
  beforeAll(async () => await setupDB());
  afterAll(async () => await teardownDB());
  afterEach(async () => await clearDatabase());
  
  test('Full sync cycle: push data, update, pull changes', async () => {
    // 1. Push initial data
    const initialData = {
      courses: [
        {
          id: 'course-1',
          name: 'Math 101',
          colorTheme: 'blue',
          isArchived: false
        }
      ],
      tasks: [
        {
          id: 'task-1',
          courseId: 'course-1',
          title: 'Homework 1',
          dueDate: new Date(),
          type: 'assignment',
          status: 'pending'
        }
      ]
    };
    
    // Perform initial sync
    const syncResponse = await request(app)
      .post('/api/sync')
      .send(initialData);
    
    expect(syncResponse.status).toBe(200);
    expect(syncResponse.body.success).toBe(true);
    
    // 2. Update data through direct API
    const updateResponse = await request(app)
      .put('/api/courses/course-1')
      .send({
        name: 'Advanced Math',
        colorTheme: 'red'
      });
    
    expect(updateResponse.status).toBe(200);
    
    // 3. Pull changes
    const pullResponse = await request(app)
      .get('/api/sync?lastSync=0');
    
    expect(pullResponse.status).toBe(200);
    expect(pullResponse.body.courses).toBeDefined();
    
    // Verify correct data is returned
    const updatedCourse = pullResponse.body.courses.find(c => c.id === 'course-1');
    expect(updatedCourse).toBeTruthy();
    expect(updatedCourse.name).toBe('Advanced Math');
    expect(updatedCourse.colorTheme).toBe('red');
    
    // Original task should also be returned
    expect(pullResponse.body.tasks).toBeDefined();
    expect(pullResponse.body.tasks.length).toBe(1);
    expect(pullResponse.body.tasks[0].title).toBe('Homework 1');
  });
  
  test('Incremental sync should only return new changes', async () => {
    // 1. Create initial data
    const now = Date.now();
    const past = now - 60000; // 1 minute ago
    
    // Create a course in the past
    await create({
      id: 'old-course',
      name: 'Old Course',
      colorTheme: 'blue',
      firebaseId: 'test-user-id',
      createdAt: past,
      updatedAt: past
    });
    
    // 2. Pull with lastSync = now (should get nothing)
    const firstPull = await request(app)
      .get(`/api/sync?lastSync=${now}`);
    
    expect(firstPull.status).toBe(200);
    expect(firstPull.body.courses.length).toBe(0);
    
    // 3. Create a new course
    await create({
      id: 'new-course',
      name: 'New Course',
      colorTheme: 'green',
      firebaseId: 'test-user-id',
      createdAt: now + 1000,
      updatedAt: now + 1000
    });
    
    // 4. Pull again with same lastSync
    const secondPull = await request(app)
      .get(`/api/sync?lastSync=${now}`);
    
    expect(secondPull.status).toBe(200);
    expect(secondPull.body.courses.length).toBe(1);
    expect(secondPull.body.courses[0].id).toBe('new-course');
  });
});