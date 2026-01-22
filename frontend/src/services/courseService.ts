// src/services/courseService.ts
import api from '../config/apiConfig';
import { Course } from '../lib/types';

export const courseService = {
  /**
   * Get all courses for current user
   */
  getCourses: async (): Promise<Course[]> => {
    const response = await api.get('/courses');
    return response.data;
  },

  /**
   * Get a single course by ID
   */
  getCourseById: async (id: string): Promise<Course> => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  /**
   * Create a new course
   */
  createCourse: async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  /**
   * Update an existing course
   */
  updateCourse: async (id: string, courseData: Partial<Course>): Promise<Course> => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  /**
   * Delete a course
   */
  deleteCourse: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  }
};

export default courseService;