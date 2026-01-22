// src/services/syncService.ts
import api from '../config/apiConfig';
import { AppState } from '../context/AppContext';

// Define the shape of the data returned from sync operation
interface SyncResponse {
  courses?: any[];
  tasks?: any[];
  flashcards?: any[];
  notes?: any[];
  units?: any[];
  academicRecords?: any[];
  userSettings?: any;
  timestamp: number;
}

export const syncService = {
  /**
   * Sync all data to the server
   */
  syncDataToServer: async (data: AppState): Promise<{ message: string }> => {
    const response = await api.post('/sync', data);
    return response.data;
  },

  /**
   * Pull changes from server since last sync
   */
  pullChangesFromServer: async (lastSync: number): Promise<SyncResponse | null> => {
    try {
      const response = await api.get(`/sync?lastSync=${lastSync}`);
      return response.data;
    } catch (error) {
      console.error('Error pulling changes from server:', error);
      return null;
    }
  },

  /**
   * Get the current server timestamp
   */
  getServerTimestamp: async (): Promise<{ timestamp: number }> => {
    const response = await api.get('/sync/timestamp');
    return response.data;
  }
};

export default syncService;