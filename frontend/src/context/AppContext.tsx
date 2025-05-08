// src/context/AppContext.tsx
import React, { createContext, useReducer, useContext, ReactNode, useEffect, Dispatch } from 'react';
import { useAuth } from './AuthContext';
import { Course, Unit, Note, Flashcard, Task, AcademicRecord, User } from '../lib/types';
import { getAll, getUserSettings, update } from '../lib/db';
import { syncDataToServer, pullChangesFromServer } from '../lib/sync';

// App state
export interface AppState {
  courses: Course[];
  units: Unit[];
  notes: Note[];
  flashcards: Flashcard[];
  tasks: Task[];
  academicRecords: AcademicRecord[];
  user: User | null;
  loading: boolean;
  error: string | null;
  lastSync: number | null;
  isSyncing: boolean;
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
  loading: false,
  error: null,
  lastSync: null,
  isSyncing: false,
};

// Action types
type ActionType =
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
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LAST_SYNC'; payload: number }
  | { type: 'SET_IS_SYNCING'; payload: boolean }
  | { type: 'MERGE_CHANGES'; payload: Partial<AppState> };

// Reducer function
const appReducer = (state: AppState, action: ActionType): AppState => {
  switch (action.type) {
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map((course) =>
          course.id === action.payload.id ? action.payload : course
        ),
      };
    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter((course) => course.id !== action.payload),
      };
    case 'SET_UNITS':
      return { ...state, units: action.payload };
    case 'ADD_UNIT':
      return { ...state, units: [...state.units, action.payload] };
    case 'UPDATE_UNIT':
      return {
        ...state,
        units: state.units.map((unit) =>
          unit.id === action.payload.id ? action.payload : unit
        ),
      };
    case 'DELETE_UNIT':
      return {
        ...state,
        units: state.units.filter((unit) => unit.id !== action.payload),
      };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id ? action.payload : note
        ),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== action.payload),
      };
    case 'SET_FLASHCARDS':
      return { ...state, flashcards: action.payload };
    case 'ADD_FLASHCARD':
      return { ...state, flashcards: [...state.flashcards, action.payload] };
    case 'UPDATE_FLASHCARD':
      return {
        ...state,
        flashcards: state.flashcards.map((flashcard) =>
          flashcard.id === action.payload.id ? action.payload : flashcard
        ),
      };
    case 'DELETE_FLASHCARD':
      return {
        ...state,
        flashcards: state.flashcards.filter((flashcard) => flashcard.id !== action.payload),
      };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case 'SET_ACADEMIC_RECORDS':
      return { ...state, academicRecords: action.payload };
    case 'ADD_ACADEMIC_RECORD':
      return { ...state, academicRecords: [...state.academicRecords, action.payload] };
    case 'UPDATE_ACADEMIC_RECORD':
      return {
        ...state,
        academicRecords: state.academicRecords.map((record) =>
          record.id === action.payload.id ? action.payload : record
        ),
      };
    case 'DELETE_ACADEMIC_RECORD':
      return {
        ...state,
        academicRecords: state.academicRecords.filter((record) => record.id !== action.payload),
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload };
    case 'SET_IS_SYNCING':
      return { ...state, isSyncing: action.payload };
    case 'MERGE_CHANGES':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

// Context type
interface AppContextType {
  state: AppState;
  dispatch: Dispatch<ActionType>;
  syncData: () => Promise<void>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { currentUser } = useAuth();
  
  // Load user-specific data when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;
      
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load all user data with userId filter
        const courses = await getAll('courses', currentUser.uid);
        dispatch({ type: 'SET_COURSES', payload: courses });
        
        const tasks = await getAll('tasks', currentUser.uid);
        dispatch({ type: 'SET_TASKS', payload: tasks });
        
        const flashcards = await getAll('flashcards', currentUser.uid);
        dispatch({ type: 'SET_FLASHCARDS', payload: flashcards });
        
        const academicRecords = await getAll('academicRecords', currentUser.uid);
        dispatch({ type: 'SET_ACADEMIC_RECORDS', payload: academicRecords });
        
        const notes = await getAll('notes', currentUser.uid);
        dispatch({ type: 'SET_NOTES', payload: notes });

        const units = await getAll('units', currentUser.uid);
        dispatch({ type: 'SET_UNITS', payload: units });
        
        // Load user settings - handle possible undefined return
        const userSettings = await getUserSettings();
        dispatch({ type: 'SET_USER', payload: userSettings || null });
        
        // Try to retrieve last sync time from localStorage
        const lastSync = localStorage.getItem('lastSync');
        if (lastSync) {
          dispatch({ type: 'SET_LAST_SYNC', payload: parseInt(lastSync) });
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Error loading user data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load user data' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadUserData();
  }, [currentUser]);

  // Handle online/offline sync
  useEffect(() => {
    if (!currentUser) return;

    const handleOnline = () => {
      syncData();
    };

    const handleOffline = () => {
      // Optionally notify user of offline status
      console.log('App is now offline. Changes will be synced when online.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set up periodic sync while online (every 5 minutes)
    const syncInterval = setInterval(() => {
      if (navigator.onLine && currentUser) {
        syncData();
      }
    }, 5 * 60 * 1000);
    
    // Initial sync if online when component mounts
    if (navigator.onLine) {
      syncData();
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, [currentUser]);

  // Sync data function that can be called manually
  const syncData = async () => {
    if (!currentUser || !navigator.onLine || state.isSyncing) return;
    
    try {
      dispatch({ type: 'SET_IS_SYNCING', payload: true });
      
      // Push local changes to server
      await syncDataToServer(currentUser.uid, state);
      
      // Pull changes from server
      const serverChanges = await pullChangesFromServer(state.lastSync || 0);
      
      // Merge changes with local data
      if (serverChanges) {
        // For each entity type, update local state with server changes
        if (serverChanges.courses && serverChanges.courses.length > 0) {
          const updatedCourses = [...state.courses];
          for (const serverCourse of serverChanges.courses) {
            const localIndex = updatedCourses.findIndex(c => c.id === serverCourse.id);
            if (localIndex >= 0) {
              // Update existing
              updatedCourses[localIndex] = serverCourse;
              await update('courses', serverCourse);
            } else {
              // Add new
              updatedCourses.push(serverCourse);
              await update('courses', serverCourse);
            }
          }
          dispatch({ type: 'SET_COURSES', payload: updatedCourses });
        }
        
        // Repeat for other entity types (tasks, flashcards, etc.)
        
        // Update last sync timestamp
        if (serverChanges.timestamp) {
          dispatch({ type: 'SET_LAST_SYNC', payload: serverChanges.timestamp });
          localStorage.setItem('lastSync', serverChanges.timestamp.toString());
        }
      }
      
      dispatch({ type: 'SET_IS_SYNCING', payload: false });
    } catch (error) {
      console.error('Error syncing data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sync data' });
      dispatch({ type: 'SET_IS_SYNCING', payload: false });
    }
  };

  // Function to add userId to appropriate entity types
  const dispatchWithUser = (action: ActionType) => {
    if (currentUser && 
        (action.type.startsWith('ADD_') || action.type.startsWith('UPDATE_'))) {
      
      // We need to handle each entity type specifically to make TypeScript happy
      if (action.type === 'ADD_COURSE' || action.type === 'UPDATE_COURSE') {
        dispatch({
          ...action,
          payload: { ...action.payload, userId: currentUser.uid }
        });
      } 
      else if (action.type === 'ADD_UNIT' || action.type === 'UPDATE_UNIT') {
        dispatch({
          ...action,
          payload: { ...action.payload, userId: currentUser.uid }
        });
      }
      else if (action.type === 'ADD_NOTE' || action.type === 'UPDATE_NOTE') {
        dispatch({
          ...action,
          payload: { ...action.payload, userId: currentUser.uid }
        });
      }
      else if (action.type === 'ADD_FLASHCARD' || action.type === 'UPDATE_FLASHCARD') {
        dispatch({
          ...action,
          payload: { ...action.payload, userId: currentUser.uid }
        });
      }
      else if (action.type === 'ADD_TASK' || action.type === 'UPDATE_TASK') {
        dispatch({
          ...action,
          payload: { ...action.payload, userId: currentUser.uid }
        });
      }
      else if (action.type === 'ADD_ACADEMIC_RECORD' || action.type === 'UPDATE_ACADEMIC_RECORD') {
        dispatch({
          ...action,
          payload: { ...action.payload, userId: currentUser.uid }
        });
      }
      else {
        // For any other action, just pass it through
        dispatch(action);
      }
    } else {
      // For any other action, just pass it through
      dispatch(action);
    }
  };
  
  return (
    <AppContext.Provider value={{ state, dispatch: dispatchWithUser, syncData }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;