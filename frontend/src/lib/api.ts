import axios from 'axios';
import { getAuth } from 'firebase/auth';

interface ImportMeta {
  env: {
    VITE_API_URL: string;
  };
}

// Create axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  

// Add auth token to every request
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Course API calls
export const coursesApi = {
  getCourses: () => api.get('/courses'),
  addCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
};

// Units API calls
export const unitsApi = {
  getUnitsByCourse: (courseId) => api.get(`/units/course/${courseId}`),
  addUnit: (unitData) => api.post('/units', unitData),
  updateUnit: (id, unitData) => api.put(`/units/${id}`, unitData),
  deleteUnit: (id) => api.delete(`/units/${id}`),
};

// Notes API calls
export const notesApi = {
  getNotesByCourse: (courseId) => api.get(`/notes/course/${courseId}`),
  getNotesByUnit: (unitId) => api.get(`/notes/unit/${unitId}`),
  addNote: (noteData) => api.post('/notes', noteData),
  updateNote: (id, noteData) => api.put(`/notes/${id}`, noteData),
  deleteNote: (id) => api.delete(`/notes/${id}`),
};

// Flashcards API calls
export const flashcardsApi = {
  getFlashcardsByCourse: (courseId) => api.get(`/flashcards/course/${courseId}`),
  getFlashcardsByUnit: (unitId) => api.get(`/flashcards/unit/${unitId}`),
  addFlashcard: (flashcardData) => api.post('/flashcards', flashcardData),
  updateFlashcard: (id, flashcardData) => api.put(`/flashcards/${id}`, flashcardData),
  deleteFlashcard: (id) => api.delete(`/flashcards/${id}`),
};

// Tasks API calls
export const tasksApi = {
  getTasks: () => api.get('/tasks'),
  getTasksByCourse: (courseId) => api.get(`/tasks/course/${courseId}`),
  addTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

// Academic Records API calls
export const academicRecordsApi = {
  getAcademicRecords: () => api.get('/academic-records'),
  getAcademicRecordsByTerm: (term) => api.get(`/academic-records/term/${term}`),
  addAcademicRecord: (recordData) => api.post('/academic-records', recordData),
  updateAcademicRecord: (id, recordData) => api.put(`/academic-records/${id}`, recordData),
  deleteAcademicRecord: (id) => api.delete(`/academic-records/${id}`),
};

// User API calls
export const userApi = {
  getUserProfile: () => api.get('/users/me'),
  updateUserProfile: (userData) => api.put('/users/me', userData),
};

export default api;
