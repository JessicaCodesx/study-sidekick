// src/services/userService.ts
import api from '../config/apiConfig';
import { User } from '../lib/types';

export const userService = {
  /**
   * Get the current user's profile
   */
  getUserProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * Update the current user's profile
   */
  updateUserProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },

  /**
   * Check if the backend is available
   */
  checkHealth: async (): Promise<{ status: string; timestamp: number }> => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default userService;