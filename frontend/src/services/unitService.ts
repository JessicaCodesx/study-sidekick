// src/services/unitService.ts
import api from '../config/apiConfig';
import { Unit } from '../lib/types';

export const unitService = {
  /**
   * Get all units
   */
  getAllUnits: async (): Promise<Unit[]> => {
    const response = await api.get('/units');
    return response.data;
  },

  /**
   * Get units by course ID
   */
  getUnitsByCourse: async (courseId: string): Promise<Unit[]> => {
    const response = await api.get(`/units/course/${courseId}`);
    return response.data;
  },

  /**
   * Get a single unit by ID
   */
  getUnitById: async (id: string): Promise<Unit> => {
    const response = await api.get(`/units/${id}`);
    return response.data;
  },

  /**
   * Create a new unit
   */
  createUnit: async (unitData: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Unit> => {
    const response = await api.post('/units', unitData);
    return response.data;
  },

  /**
   * Update an existing unit
   */
  updateUnit: async (id: string, unitData: Partial<Unit>): Promise<Unit> => {
    const response = await api.put(`/units/${id}`, unitData);
    return response.data;
  },

  /**
   * Delete a unit
   */
  deleteUnit: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/units/${id}`);
    return response.data;
  }
};

export default unitService;