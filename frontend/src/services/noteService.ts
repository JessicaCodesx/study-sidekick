// src/services/noteService.ts
import api from '../config/apiConfig';
import { Note } from '../lib/types';

export const noteService = {
  /**
   * Get all notes
   */
  getAllNotes: async (): Promise<Note[]> => {
    const response = await api.get('/notes');
    return response.data;
  },

  /**
   * Get notes by course ID
   */
  getNotesByCourse: async (courseId: string): Promise<Note[]> => {
    const response = await api.get(`/notes/course/${courseId}`);
    return response.data;
  },

  /**
   * Get notes by unit ID
   */
  getNotesByUnit: async (unitId: string): Promise<Note[]> => {
    const response = await api.get(`/notes/unit/${unitId}`);
    return response.data;
  },

  /**
   * Get a single note by ID
   */
  getNoteById: async (id: string): Promise<Note> => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  /**
   * Create a new note
   */
  createNote: async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    const response = await api.post('/notes', noteData);
    return response.data;
  },

  /**
   * Update an existing note
   */
  updateNote: async (id: string, noteData: Partial<Note>): Promise<Note> => {
    const response = await api.put(`/notes/${id}`, noteData);
    return response.data;
  },

  /**
   * Delete a note
   */
  deleteNote: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  }
};

export default noteService;