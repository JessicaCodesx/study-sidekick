// src/services/taskService.ts
import api from '../config/apiConfig';
import { Task } from '../lib/types';

export const taskService = {
  /**
   * Get all tasks
   */
  getAllTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
  },

  /**
   * Get tasks by course ID
   */
  getTasksByCourse: async (courseId: string): Promise<Task[]> => {
    const response = await api.get(`/tasks/course/${courseId}`);
    return response.data;
  },

  /**
   * Get tasks by due date range
   */
  getTasksByDateRange: async (startDate: number, endDate: number): Promise<Task[]> => {
    const response = await api.get(`/tasks/date-range?start=${startDate}&end=${endDate}`);
    return response.data;
  },

  /**
   * Get a single task by ID
   */
  getTaskById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Create a new task
   */
  createTask: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  /**
   * Update an existing task
   */
  updateTask: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  /**
   * Delete a task
   */
  deleteTask: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
};

export default taskService;