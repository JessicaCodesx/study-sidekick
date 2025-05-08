// src/lib/sync.ts
import api from './api';
import { AppState } from '../context/AppContext';

/**
 * Syncs local data to the server
 * @param userId The user's Firebase UID
 * @param state The current app state
 */
export async function syncDataToServer(userId: string, state: AppState): Promise<void> {
  try {
    // Fetch all entities that need to be synced
    const dataToSync = {
      courses: state.courses,
      tasks: state.tasks,
      flashcards: state.flashcards,
      notes: state.notes,
      units: state.units,
      academicRecords: state.academicRecords,
      userSettings: state.user,
    };
    
    // Send to server
    await api.post('/api/sync', dataToSync);
    
    console.log('Successfully synced data to server');
  } catch (error) {
    console.error('Error syncing data to server:', error);
    throw error;
  }
}

/**
 * Pulls changes from the server since last sync
 * @param lastSync Timestamp of the last successful sync
 * @returns Object containing entity changes and new timestamp
 */
export async function pullChangesFromServer(lastSync: number): Promise<{
  courses?: any[],
  tasks?: any[],
  flashcards?: any[],
  notes?: any[],
  units?: any[],
  academicRecords?: any[],
  userSettings?: any,
  timestamp: number
} | null> {
  try {
    const response = await api.get(`/api/sync?lastSync=${lastSync}`);
    
    console.log('Successfully pulled changes from server');
    return response.data;
  } catch (error) {
    console.error('Error pulling changes from server:', error);
    return null;
  }
}