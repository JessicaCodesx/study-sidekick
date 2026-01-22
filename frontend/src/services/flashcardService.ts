// src/services/flashcardService.ts
import api from '../config/apiConfig';
import { Flashcard } from '../lib/types';

export const flashcardService = {
  /**
   * Get all flashcards
   */
  getAllFlashcards: async (): Promise<Flashcard[]> => {
    const response = await api.get('/flashcards');
    return response.data;
  },

  /**
   * Get flashcards by course ID
   */
  getFlashcardsByCourse: async (courseId: string): Promise<Flashcard[]> => {
    const response = await api.get(`/flashcards/course/${courseId}`);
    return response.data;
  },

  /**
   * Get flashcards by unit ID
   */
  getFlashcardsByUnit: async (unitId: string): Promise<Flashcard[]> => {
    const response = await api.get(`/flashcards/unit/${unitId}`);
    return response.data;
  },

  /**
   * Get a single flashcard by ID
   */
  getFlashcardById: async (id: string): Promise<Flashcard> => {
    const response = await api.get(`/flashcards/${id}`);
    return response.data;
  },

  /**
   * Create a new flashcard
   */
  createFlashcard: async (flashcardData: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Flashcard> => {
    const response = await api.post('/flashcards', flashcardData);
    return response.data;
  },

  /**
   * Update an existing flashcard
   */
  updateFlashcard: async (id: string, flashcardData: Partial<Flashcard>): Promise<Flashcard> => {
    const response = await api.put(`/flashcards/${id}`, flashcardData);
    return response.data;
  },

  /**
   * Delete a flashcard
   */
  deleteFlashcard: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/flashcards/${id}`);
    return response.data;
  }
};

export default flashcardService;