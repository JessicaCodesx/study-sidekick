import { createContext, useReducer, useContext, ReactNode, useEffect, Dispatch } from 'react';
import { useAuth } from './AuthContext';
import { Course, Unit, Note, Flashcard, Task, AcademicRecord, User } from '../lib/types';
import { getAll, getUserSettings } from '../lib/db';

// App state
interface AppState {
  courses: Course[];
  units: Unit[];
  notes: Note[];
  flashcards: Flashcard[];
  tasks: Task[];
  academicRecords: AcademicRecord[];
  user: User | null;
  loading: boolean;
  error: string | null;
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
  | { type: 'SET_ERROR'; payload: string | null };

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
    default:
      return state;
  }
};

// Context type
interface AppContextType {
  state: AppState;
  dispatch: Dispatch<ActionType>;
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
        
        // Load user settings - handle possible undefined return
        const userSettings = await getUserSettings();
        dispatch({ type: 'SET_USER', payload: userSettings || null });
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Error loading user data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load user data' });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadUserData();
  }, [currentUser]);

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
    <AppContext.Provider value={{ state, dispatch: dispatchWithUser }}>
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