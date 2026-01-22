// src/services/academicRecordService.ts
import api from '../config/apiConfig';
import { AcademicRecord } from '../lib/types';

export const academicRecordService = {
  /**
   * Get all academic records
   */
  getAllAcademicRecords: async (): Promise<AcademicRecord[]> => {
    const response = await api.get('/academic-records');
    return response.data;
  },

  /**
   * Get academic records by term
   */
  getAcademicRecordsByTerm: async (term: string): Promise<AcademicRecord[]> => {
    const response = await api.get(`/academic-records/term/${term}`);
    return response.data;
  },

  /**
   * Get a single academic record by ID
   */
  getAcademicRecordById: async (id: string): Promise<AcademicRecord> => {
    const response = await api.get(`/academic-records/${id}`);
    return response.data;
  },

  /**
   * Create a new academic record
   */
  createAcademicRecord: async (recordData: Omit<AcademicRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AcademicRecord> => {
    const response = await api.post('/academic-records', recordData);
    return response.data;
  },

  /**
   * Update an existing academic record
   */
  updateAcademicRecord: async (id: string, recordData: Partial<AcademicRecord>): Promise<AcademicRecord> => {
    const response = await api.put(`/academic-records/${id}`, recordData);
    return response.data;
  },

  /**
   * Delete an academic record
   */
  deleteAcademicRecord: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/academic-records/${id}`);
    return response.data;
  }
};

export default academicRecordService;