// backend/tests/performance/sync-performance.test.js
import request from 'supertest';
import app from '../../server';
import { setupDB, teardownDB, clearDatabase } from '../setup';
import { countDocuments, insertMany } from '../../models/Course';
import { countDocuments as _countDocuments } from '../../models/Task';

// Mock auth middleware
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = { id: 'test-user-id', email: 'test@example.com' };
    next();
  };
});

describe('Sync Performance Tests', () => {
  // Setup and teardown
  beforeAll(async () => await setupDB());
  afterAll(async () => await teardownDB());
  afterEach(async () => await clearDatabase());
  
  test('Should handle large batch sync efficiently', async () => {
    // Create a large dataset
    const coursesCount = 50;
    const tasksPerCourse = 10;
    
    const largeSyncData = {
      courses: [],
      tasks: []
    };
    
    // Generate courses and tasks
    for (let i = 0; i < coursesCount; i++) {
      const courseId = `course-${i}`;
      
      largeSyncData.courses.push({
        id: courseId,
        name: `Course ${i}`,
        colorTheme: ['blue', 'red', 'green', 'purple'][i % 4],
        isArchived: i % 5 === 0 // Archive every 5th course
      });
      
      // Create tasks for this course
      for (let j = 0; j < tasksPerCourse; j++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + j);
        
        largeSyncData.tasks.push({
          id: `task-${i}-${j}`,
          courseId: courseId,
          title: `Task ${j} for Course ${i}`,
          dueDate: dueDate,
          type: ['assignment', 'exam', 'quiz'][j % 3],
          status: ['pending', 'completed'][j % 2]
        });
      }
    }
    
    // Measure performance
    const startTime = Date.now();
    
    const syncResponse = await request(app)
      .post('/api/sync')
      .send(largeSyncData);
    
    const endTime = Date.now();
    const syncDuration = endTime - startTime;
    
    // Assertions
    expect(syncResponse.status).toBe(200);
    
    // Performance assertion - should sync in reasonable time
    // Adjust threshold based on your requirements
    expect(syncDuration).toBeLessThan(5000); // Should complete in under 5 seconds
    
    // Verify data was saved correctly
    const savedCoursesCount = await countDocuments({ firebaseId: 'test-user-id' });
    const savedTasksCount = await _countDocuments({ firebaseId: 'test-user-id' });
    
    expect(savedCoursesCount).toBe(coursesCount);
    expect(savedTasksCount).toBe(coursesCount * tasksPerCourse);
    
    console.log(`Large sync performance: ${syncDuration}ms for ${coursesCount} courses and ${coursesCount * tasksPerCourse} tasks`);
  });
  
  test('Pull sync should filter results efficiently by timestamp', async () => {
    // Create 100 documents with varying timestamps
    const totalDocuments = 100;
    const courseBatch = [];
    
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const twoHoursAgo = now - 7200000;
    
    // Create courses with different timestamps
    for (let i = 0; i < totalDocuments; i++) {
      let timestamp;
      
      if (i < 30) {
        timestamp = twoHoursAgo; // 30% old data
      } else if (i < 70) {
        timestamp = oneHourAgo; // 40% medium data
      } else {
        timestamp = now; // 30% new data
      }
      
      courseBatch.push({
        id: `perf-course-${i}`,
        name: `Performance Course ${i}`,
        colorTheme: 'blue',
        firebaseId: 'test-user-id',
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    await insertMany(courseBatch);
    
    // Test pulls with different timestamps
    const tests = [
      { name: 'Recent changes only', lastSync: oneHourAgo, expectedCount: 30 },
      { name: 'All recent and medium changes', lastSync: twoHoursAgo, expectedCount: 70 },
      { name: 'All changes', lastSync: 0, expectedCount: 100 }
    ];
    
    for (const test of tests) {
      const startTime = Date.now();
      
      const response = await request(app)
        .get(`/api/sync?lastSync=${test.lastSync}`);
      
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(response.body.courses.length).toBe(test.expectedCount);
      
      // Performance expectations
      expect(duration).toBeLessThan(1000); // Should be under 1 second
      
      console.log(`Pull sync (${test.name}): ${duration}ms for ${test.expectedCount} documents`);
    }
  });
});