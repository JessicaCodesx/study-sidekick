// src/context/AppContext.tsx - Mobile version (local storage only)
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { 
  Course, 
  User, 
  Unit, 
  Note, 
  Flashcard, 
  Task, 
  AcademicRecord 
} from '../lib/types';
import {
  courseService,
  unitService,
  noteService,
  flashcardService,
  taskService,
  academicRecordService,
  syncService
} from '../services';

// Define the state shape
export interface AppState {
  courses: Course[];
  units: Unit[];
  notes: Note[];
  flashcards: Flashcard[];
  tasks: Task[];
  academicRecords: AcademicRecord[];
  user: User | null;
  isOnline: boolean;
  loading: boolean;
  error: string | null;
  lastSync: number;
}

// Initial state
const initialState: AppState = {
  courses: [],
  units: [],
  notes: [],
  flashcards: [],
  tasks: [],
  academicRecords: [],
  user: null,
  isOnline: navigator.onLine,
  loading: false,
  error: null,
  lastSync: 0
};

// Action types
type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'SET_UNITS'; payload: Unit[] }
  | { type: 'ADD_UNIT'; payload: Unit }
  | { type: 'UPDATE_UNIT'; payload: Unit }
  | { type: 'DELETE_UNIT'; payload: string }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_FLASHCARDS'; payload: Flashcard[] }
  | { type: 'ADD_FLASHCARD'; payload: Flashcard }
  | { type: 'UPDATE_FLASHCARD'; payload: Flashcard }
  | { type: 'DELETE_FLASHCARD'; payload: string }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_ACADEMIC_RECORDS'; payload: AcademicRecord[] }
  | { type: 'ADD_ACADEMIC_RECORD'; payload: AcademicRecord }
  | { type: 'UPDATE_ACADEMIC_RECORD'; payload: AcademicRecord }
  | { type: 'DELETE_ACADEMIC_RECORD'; payload: string }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: number }
  | { type: 'SYNC_DATA_SUCCESS'; payload: AppState };

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    case 'UPDATE_COURSE':
      return { 
        ...state, 
        courses: state.courses.map(course => 
          course.id === action.payload.id ? action.payload : course
        ) 
      };
    case 'DELETE_COURSE':
      return { 
        ...state, 
        courses: state.courses.filter(course => course.id !== action.payload) 
      };
    case 'SET_UNITS':
      return { ...state, units: action.payload };
    case 'ADD_UNIT':
      return { ...state, units: [...state.units, action.payload] };
    case 'UPDATE_UNIT':
      return { 
        ...state, 
        units: state.units.map(unit => 
          unit.id === action.payload.id ? action.payload : unit
        ) 
      };
    case 'DELETE_UNIT':
      return { 
        ...state, 
        units: state.units.filter(unit => unit.id !== action.payload) 
      };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'UPDATE_NOTE':
      return { 
        ...state, 
        notes: state.notes.map(note => 
          note.id === action.payload.id ? action.payload : note
        ) 
      };
    case 'DELETE_NOTE':
      return { 
        ...state, 
        notes: state.notes.filter(note => note.id !== action.payload) 
      };
    case 'SET_FLASHCARDS':
      return { ...state, flashcards: action.payload };
    case 'ADD_FLASHCARD':
      return { ...state, flashcards: [...state.flashcards, action.payload] };
    case 'UPDATE_FLASHCARD':
      return { 
        ...state, 
        flashcards: state.flashcards.map(flashcard => 
          flashcard.id === action.payload.id ? action.payload : flashcard
        ) 
      };
    case 'DELETE_FLASHCARD':
      return { 
        ...state, 
        flashcards: state.flashcards.filter(flashcard => flashcard.id !== action.payload) 
      };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return { 
        ...state, 
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ) 
      };
    case 'DELETE_TASK':
      return { 
        ...state, 
        tasks: state.tasks.filter(task => task.id !== action.payload) 
      };
    case 'SET_ACADEMIC_RECORDS':
      return { ...state, academicRecords: action.payload };
    case 'ADD_ACADEMIC_RECORD':
      return { ...state, academicRecords: [...state.academicRecords, action.payload] };
    case 'UPDATE_ACADEMIC_RECORD':
      return { 
        ...state, 
        academicRecords: state.academicRecords.map(record => 
          record.id === action.payload.id ? action.payload : record
        ) 
      };
    case 'DELETE_ACADEMIC_RECORD':
      return { 
        ...state, 
        academicRecords: state.academicRecords.filter(record => record.id !== action.payload) 
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
    case 'SYNC_DATA_SUCCESS':
      return { 
        ...state, 
        ...action.payload,
        lastSync: Date.now()
      };
    default:
      return state;
  }
};

// Create Context
interface AppContextProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  syncData: () => Promise<void>;
}

const AppContext = createContext<AppContextProps>({
  state: initialState,
  dispatch: () => null,
  syncData: async () => {}
});

// Custom hook for using AppContext
export const useAppContext = () => useContext(AppContext);

// Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Monitor online/offline status for mobile
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch({ 
        type: 'SET_ONLINE_STATUS', 
        payload: state.isConnected ?? false 
      });
    });

    return unsubscribe;
  }, []);

  // Load initial data from local storage
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    if (!currentUser) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Try to get data from server
      if (state.isOnline) {
        const [
          courses,
          units,
          flashcards,
          notes,
          tasks,
          academicRecords
        ] = await Promise.all([
          courseService.getCourses(),
          unitService.getAllUnits(),
          flashcardService.getAllFlashcards(),
          noteService.getAllNotes(),
          taskService.getAllTasks(),
          academicRecordService.getAllAcademicRecords()
        ]);

        dispatch({ type: 'SET_COURSES', payload: courses });
        dispatch({ type: 'SET_UNITS', payload: units });
        dispatch({ type: 'SET_FLASHCARDS', payload: flashcards });
        dispatch({ type: 'SET_NOTES', payload: notes });
        dispatch({ type: 'SET_TASKS', payload: tasks });
        dispatch({ type: 'SET_ACADEMIC_RECORDS', payload: academicRecords });
        dispatch({ type: 'SET_LAST_SYNC', payload: Date.now() });
      } else {
        // If offline, rely on local data from IndexedDB
        // This part would depend on how your local data storage is implemented
        // For now, we'll assume local data is already loaded via the DB functions
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data. Please try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Sync data with server
  const syncData = async () => {
    if (!currentUser || !state.isOnline) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Try to pull changes since last sync
      if (state.lastSync > 0) {
        const changes = await syncService.pullChangesFromServer(state.lastSync);
        
        if (changes) {
          // Update state with changes from server
          if (changes.courses) dispatch({ type: 'SET_COURSES', payload: changes.courses });
          if (changes.units) dispatch({ type: 'SET_UNITS', payload: changes.units });
          if (changes.flashcards) dispatch({ type: 'SET_FLASHCARDS', payload: changes.flashcards });
          if (changes.notes) dispatch({ type: 'SET_NOTES', payload: changes.notes });
          if (changes.tasks) dispatch({ type: 'SET_TASKS', payload: changes.tasks });
          if (changes.academicRecords) dispatch({ type: 'SET_ACADEMIC_RECORDS', payload: changes.academicRecords });
          if (changes.userSettings) dispatch({ type: 'SET_USER', payload: changes.userSettings });
          
          dispatch({ type: 'SET_LAST_SYNC', payload: changes.timestamp });
        }
      }
      
      // Push local changes to server
      // This assumes we have some way to track local changes
      // For simplicity, we're just sending the whole state
      await syncService.syncDataToServer(state);
      
      dispatch({ type: 'SET_LAST_SYNC', payload: Date.now() });
    } catch (error) {
      console.error('Error syncing data:', error);
      // Don't show error to user for background sync
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, syncData }}>
      {children}
    </AppContext.Provider>
  );
};