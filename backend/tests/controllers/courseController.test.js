// tests/controllers/courseController.test.js
import request from 'supertest';
import express from 'express';
import { setupDB, teardownDB, mockAuthMiddleware, clearDatabase } from '../setup.js';
import * as courseController from '../../controllers/courseController.js';
import Course from '../../models/Course.js';
import { jest } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid')
}));

// Mock Express app
const app = express();
app.use(express.json());
app.use(mockAuthMiddleware());

// Register routes
app.get('/api/courses', courseController.getCourses);
app.post('/api/courses', courseController.addCourse);
app.put('/api/courses/:id', courseController.updateCourse);
app.delete('/api/courses/:id', courseController.deleteCourse);

describe('Course Controller Tests', () => {
  // Setup and teardown
  beforeAll(async () => await setupDB());
  afterAll(async () => await teardownDB());
  afterEach(async () => await clearDatabase());
  
  test('GET /api/courses should return all courses for a user', async () => {
    // Create test courses
    await Course.create({
      id: 'course-1',
      name: 'Test Course 1',
      colorTheme: 'blue',
      firebaseId: 'test-user-id'
    });
    
    await Course.create({
      id: 'course-2',
      name: 'Test Course 2',
      colorTheme: 'red',
      firebaseId: 'test-user-id'
    });
    
    await Course.create({
      id: 'course-3',
      name: 'Other User Course',
      colorTheme: 'green',
      firebaseId: 'other-user-id'
    });
    
    // Get courses
    const response = await request(app).get('/api/courses');
    
    // Assert response
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0].name).toBe('Test Course 1');
    expect(response.body[1].name).toBe('Test Course 2');
  });
  
  test('POST /api/courses should create a new course', async () => {
    const courseData = {
      name: 'New Course',
      colorTheme: 'purple',
      description: 'Test description'
    };
    
    // Create course
    const response = await request(app)
      .post('/api/courses')
      .send(courseData);
    
    // Assert response
    expect(response.status).toBe(201);
    expect(response.body.name).toBe('New Course');
    expect(response.body.id).toBe('mocked-uuid');
    
    // Verify in database
    const savedCourse = await Course.findOne({ name: 'New Course' });
    expect(savedCourse).toBeTruthy();
    expect(savedCourse.firebaseId).toBe('test-user-id');
  });
  
  test('PUT /api/courses/:id should update an existing course', async () => {
    // Create test course
    const course = await Course.create({
      id: 'update-course',
      name: 'Course to Update',
      colorTheme: 'blue',
      firebaseId: 'test-user-id'
    });
    
    // Update data
    const updateData = {
      name: 'Updated Course Name',
      colorTheme: 'green'
    };
    
    // Update course
    const response = await request(app)
      .put(`/api/courses/${course.id}`)
      .send(updateData);
    
    // Assert response
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Course Name');
    expect(response.body.colorTheme).toBe('green');
    
    // Verify in database
    const updatedCourse = await Course.findOne({ id: course.id });
    expect(updatedCourse.name).toBe('Updated Course Name');
  });
  
  test('DELETE /api/courses/:id should delete a course', async () => {
    // Create test course
    const course = await Course.create({
      id: 'delete-course',
      name: 'Course to Delete',
      colorTheme: 'red',
      firebaseId: 'test-user-id'
    });
    
    // Delete course
    const response = await request(app).delete(`/api/courses/${course.id}`);
    
    // Assert response
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Course removed');
    
    // Verify deletion
    const deletedCourse = await Course.findOne({ id: course.id });
    expect(deletedCourse).toBeNull();
  });
});