import { openDB, IDBPDatabase } from 'idb';
import {
  Course,
  Unit,
  Note,
  Flashcard,
  Task,
  AcademicRecord,
  User,
  StudySession,
} from './types';

const DB_NAME = 'studySidekickDB';
const DB_VERSION = 2; // Increment version for schema update

type DBSchema = {
  courses: Course;
  units: Unit;
  notes: Note;
  flashcards: Flashcard;
  tasks: Task;
  academicRecords: AcademicRecord;
  user: User;
  studySessions: StudySession;
};

let db: IDBPDatabase<DBSchema> | null = null;

export async function initDB(userId?: string): Promise<IDBPDatabase<DBSchema>> {
  if (db) return db;

  db = await openDB<DBSchema>(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion, newVersion, transaction) {
      // Create all stores needed for the app
      if (!database.objectStoreNames.contains('courses')) {
        const courseStore = database.createObjectStore('courses', { keyPath: 'id' });
        // Add userId index for filtering by user
        courseStore.createIndex('byUserId', 'userId', { unique: false });
      } else if (oldVersion < 2) {
        // Add userId index to existing stores when upgrading
        const courseStore = transaction.objectStore('courses');
        if (!courseStore.indexNames.contains('byUserId')) {
          courseStore.createIndex('byUserId', 'userId', { unique: false });
        }
      }

      if (!database.objectStoreNames.contains('units')) {
        const unitStore = database.createObjectStore('units', { keyPath: 'id' });
        unitStore.createIndex('byCourse', 'courseId', { unique: false });
        unitStore.createIndex('byUserId', 'userId', { unique: false });
      } else if (oldVersion < 2) {
        const unitStore = transaction.objectStore('units');
        if (!unitStore.indexNames.contains('byUserId')) {
          unitStore.createIndex('byUserId', 'userId', { unique: false });
        }
      }

      if (!database.objectStoreNames.contains('notes')) {
        const noteStore = database.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('byCourse', 'courseId', { unique: false });
        noteStore.createIndex('byUnit', 'unitId', { unique: false });
        noteStore.createIndex('byCourseAndUnit', ['courseId', 'unitId'], { unique: false });
        noteStore.createIndex('byUserId', 'userId', { unique: false });
      } else if (oldVersion < 2) {
        const noteStore = transaction.objectStore('notes');
        if (!noteStore.indexNames.contains('byUserId')) {
          noteStore.createIndex('byUserId', 'userId', { unique: false });
        }
      }

      if (!database.objectStoreNames.contains('flashcards')) {
        const flashcardStore = database.createObjectStore('flashcards', { keyPath: 'id' });
        flashcardStore.createIndex('byCourse', 'courseId', { unique: false });
        flashcardStore.createIndex('byUnit', 'unitId', { unique: false });
        flashcardStore.createIndex('byCourseAndUnit', ['courseId', 'unitId'], { unique: false });
        flashcardStore.createIndex('byUserId', 'userId', { unique: false });
      } else if (oldVersion < 2) {
        const flashcardStore = transaction.objectStore('flashcards');
        if (!flashcardStore.indexNames.contains('byUserId')) {
          flashcardStore.createIndex('byUserId', 'userId', { unique: false });
        }
      }

      if (!database.objectStoreNames.contains('tasks')) {
        const taskStore = database.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('byCourse', 'courseId', { unique: false });
        taskStore.createIndex('byDueDate', 'dueDate', { unique: false });
        taskStore.createIndex('byStatus', 'status', { unique: false });
        taskStore.createIndex('byUserId', 'userId', { unique: false });
      } else if (oldVersion < 2) {
        const taskStore = transaction.objectStore('tasks');
        if (!taskStore.indexNames.contains('byUserId')) {
          taskStore.createIndex('byUserId', 'userId', { unique: false });
        }
      }

      if (!database.objectStoreNames.contains('academicRecords')) {
        const recordStore = database.createObjectStore('academicRecords', { keyPath: 'id' });
        recordStore.createIndex('byTerm', 'term', { unique: false });
        recordStore.createIndex('byUserId', 'userId', { unique: false });
      } else if (oldVersion < 2) {
        const recordStore = transaction.objectStore('academicRecords');
        if (!recordStore.indexNames.contains('byUserId')) {
          recordStore.createIndex('byUserId', 'userId', { unique: false });
        }
      }

      if (!database.objectStoreNames.contains('studySessions')) {
        const sessionStore = database.createObjectStore('studySessions', { keyPath: 'id' });
        sessionStore.createIndex('byCourse', 'courseId', { unique: false });
        sessionStore.createIndex('byDate', 'date', { unique: false });
        sessionStore.createIndex('byUserId', 'userId', { unique: false });
      } else if (oldVersion < 2) {
        const sessionStore = transaction.objectStore('studySessions');
        if (!sessionStore.indexNames.contains('byUserId')) {
          sessionStore.createIndex('byUserId', 'userId', { unique: false });
        }
      }

      if (!database.objectStoreNames.contains('user')) {
        database.createObjectStore('user', { keyPath: 'displayName' });
      }
    },
  });

  return db;
}

// Generic CRUD operations

// Create
export async function add<T extends keyof DBSchema>(
  storeName: T,
  item: DBSchema[T] & { userId?: string }
): Promise<string> {
  const database = await initDB();
  const id = await database.add(storeName, item);
  return String(id);
}

// Read one
export async function get<T extends keyof DBSchema>(
  storeName: T,
  id: string
): Promise<DBSchema[T] | undefined> {
  const database = await initDB();
  return database.get(storeName, id);
}

// Read with optional filtering function
export async function getAll<T extends keyof DBSchema>(
  storeName: T,
  userId?: string
): Promise<DBSchema[T][]> {
  const database = await initDB();
  
  // If userId is provided and the store has a byUserId index, use it to filter by user
  if (userId && storeName !== 'user') {
    try {
      const tx = database.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      
      // Check if the store has a byUserId index
      if (store.indexNames.contains('byUserId')) {
        return store.index('byUserId').getAll(userId);
      }
    } catch (error) {
      console.error(`Error accessing byUserId index for ${storeName}:`, error);
    }
  }
  
  // Fallback to getting all records
  return database.getAll(storeName);
}

// Update
export async function update<T extends keyof DBSchema>(
  storeName: T,
  item: DBSchema[T]
): Promise<string> {
  const database = await initDB();
  const id = await database.put(storeName, item);
  return String(id);
}

// Delete
export async function remove<T extends keyof DBSchema>(
  storeName: T,
  id: string
): Promise<void> {
  const database = await initDB();
  await database.delete(storeName, id);
}

// Specialized queries

// Get units by course
export async function getUnitsByCourse(courseId: string, userId?: string): Promise<Unit[]> {
  const database = await initDB();
  const units = await database.getAllFromIndex('units', 'byCourse', courseId);
  
  // If userId is provided, filter the results
  if (userId) {
    return units.filter(unit => unit.userId === userId || !unit.userId);
  }
  
  return units;
}

// Get notes by course
export async function getNotesByCourse(courseId: string, userId?: string): Promise<Note[]> {
  const database = await initDB();
  const notes = await database.getAllFromIndex('notes', 'byCourse', courseId);
  
  // If userId is provided, filter the results
  if (userId) {
    return notes.filter(note => note.userId === userId || !note.userId);
  }
  
  return notes;
}

// Get notes by unit
export async function getNotesByUnit(unitId: string, userId?: string): Promise<Note[]> {
  const database = await initDB();
  const notes = await database.getAllFromIndex('notes', 'byUnit', unitId);
  
  // If userId is provided, filter the results
  if (userId) {
    return notes.filter(note => note.userId === userId || !note.userId);
  }
  
  return notes;
}

// Get flashcards by course
export async function getFlashcardsByCourse(courseId: string, userId?: string): Promise<Flashcard[]> {
  const database = await initDB();
  const flashcards = await database.getAllFromIndex('flashcards', 'byCourse', courseId);
  
  // If userId is provided, filter the results
  if (userId) {
    return flashcards.filter(flashcard => flashcard.userId === userId || !flashcard.userId);
  }
  
  return flashcards;
}

// Get flashcards by unit
export async function getFlashcardsByUnit(unitId: string, userId?: string): Promise<Flashcard[]> {
  const database = await initDB();
  const flashcards = await database.getAllFromIndex('flashcards', 'byUnit', unitId);
  
  // If userId is provided, filter the results
  if (userId) {
    return flashcards.filter(flashcard => flashcard.userId === userId || !flashcard.userId);
  }
  
  return flashcards;
}

// Get tasks by course
export async function getTasksByCourse(courseId: string, userId?: string): Promise<Task[]> {
  const database = await initDB();
  const tasks = await database.getAllFromIndex('tasks', 'byCourse', courseId);
  
  // If userId is provided, filter the results
  if (userId) {
    return tasks.filter(task => task.userId === userId || !task.userId);
  }
  
  return tasks;
}

// Get tasks by due date range
export async function getTasksByDueDateRange(
  startDate: number,
  endDate: number,
  userId?: string
): Promise<Task[]> {
  const database = await initDB();
  const index = database.transaction('tasks').store.index('byDueDate');
  const tasks = await index.getAll(IDBKeyRange.bound(startDate, endDate));
  
  // If userId is provided, filter the results
  if (userId) {
    return tasks.filter(task => task.userId === userId || !task.userId);
  }
  
  return tasks;
}

// Get tasks by status
export async function getTasksByStatus(status: string, userId?: string): Promise<Task[]> {
  const database = await initDB();
  const tasks = await database.getAllFromIndex('tasks', 'byStatus', status);
  
  // If userId is provided, filter the results
  if (userId) {
    return tasks.filter(task => task.userId === userId || !task.userId);
  }
  
  return tasks;
}

// Get academic records by term
export async function getAcademicRecordsByTerm(term: string, userId?: string): Promise<AcademicRecord[]> {
  const database = await initDB();
  const records = await database.getAllFromIndex('academicRecords', 'byTerm', term);
  
  // If userId is provided, filter the results
  if (userId) {
    return records.filter(record => record.userId === userId || !record.userId);
  }
  
  return records;
}

// Get user settings
export async function getUserSettings(): Promise<User | undefined> {
  const database = await initDB();
  const allUsers = await database.getAll('user');
  return allUsers[0]; // Return the first user found
}

// Save user settings
export async function saveUserSettings(user: User): Promise<void> {
  const database = await initDB();
  await database.put('user', user);
}

// Get study sessions by course
export async function getStudySessionsByCourse(courseId: string, userId?: string): Promise<StudySession[]> {
  const database = await initDB();
  const sessions = await database.getAllFromIndex('studySessions', 'byCourse', courseId);
  
  // If userId is provided, filter the results
  if (userId) {
    return sessions.filter(session => session.userId === userId || !session.userId);
  }
  
  return sessions;
}

// Get study sessions by date range
export async function getStudySessionsByDateRange(
  startDate: number,
  endDate: number,
  userId?: string
): Promise<StudySession[]> {
  const database = await initDB();
  const index = database.transaction('studySessions').store.index('byDate');
  const sessions = await index.getAll(IDBKeyRange.bound(startDate, endDate));
  
  // If userId is provided, filter the results
  if (userId) {
    return sessions.filter(session => session.userId === userId || !session.userId);
  }
  
  return sessions;
}

// Clear all data (for testing or reset functionality)
export async function clearAllData(userId?: string): Promise<void> {
  const database = await initDB();
  const stores = database.objectStoreNames;
  
  // If userId is provided, only clear data for that user
  if (userId) {
    const tx = database.transaction(Array.from(stores).filter(store => store !== 'user'), 'readwrite');
    
    for (const storeName of stores) {
      if (storeName === 'user') continue; // Skip user store
      
      const store = tx.objectStore(storeName);
      
      // If the store has a byUserId index, use it to delete only user data
      if (store.indexNames.contains('byUserId')) {
        const cursor = await store.index('byUserId').openCursor(userId);
        let promises: Promise<void>[] = [];
        
        while (cursor) {
          promises.push(cursor.delete());
          await cursor.continue();
        }
        
        await Promise.all(promises);
      }
    }
    
    await tx.done;
  } else {
    // Clear all data if no userId is provided
    const tx = database.transaction(Array.from(stores), 'readwrite');
    const promises = Array.from(stores).map((store) => tx.objectStore(store).clear());
    await Promise.all(promises);
    await tx.done;
  }
}

// Export database (for backup)
export async function exportDatabase(userId?: string): Promise<string> {
  const database = await initDB();
  const stores = database.objectStoreNames;
  const exportData: Record<string, any[]> = {};
  
  for (const store of stores) {
    // If it's the user store, just export everything
    if (store === 'user') {
      exportData[store] = await database.getAll(store as keyof DBSchema);
      continue;
    }
    
    // For other stores, filter by userId if provided
    if (userId) {
      try {
        const tx = database.transaction(store, 'readonly');
        const objectStore = tx.objectStore(store);
        
        if (objectStore.indexNames.contains('byUserId')) {
          exportData[store] = await objectStore.index('byUserId').getAll(userId);
        } else {
          // If no userId index, just export all data for this store
          exportData[store] = await database.getAll(store as keyof DBSchema);
        }
      } catch (error) {
        console.error(`Error exporting data for ${store}:`, error);
        exportData[store] = await database.getAll(store as keyof DBSchema);
      }
    } else {
      // If no userId provided, export all data
      exportData[store] = await database.getAll(store as keyof DBSchema);
    }
  }
  
  return JSON.stringify(exportData);
}

// Import database (from backup)
export async function importDatabase(jsonData: string, userId?: string): Promise<void> {
  const database = await initDB();
  const importData = JSON.parse(jsonData);
  const stores = Object.keys(importData);
  
  // Clear existing data (optionally only for this user)
  if (userId) {
    await clearAllData(userId);
  } else {
    await clearAllData();
  }
  
  // Import data, associating with userId if provided
  for (const store of stores) {
    const tx = database.transaction(store, 'readwrite');
    const objectStore = tx.objectStore(store);
    
    for (const item of importData[store]) {
      // Add userId to item if provided and it's not the user store
      if (userId && store !== 'user') {
        item.userId = userId;
      }
      
      try {
        await objectStore.add(item);
      } catch (error) {
        console.error(`Error importing item into ${store}:`, error);
        // Try updating instead if adding fails
        try {
          await objectStore.put(item);
        } catch (putError) {
          console.error(`Error updating item in ${store}:`, putError);
        }
      }
    }
    
    await tx.done;
  }
}

// Check if data exists for a user
export async function userHasData(userId: string): Promise<boolean> {
  const database = await initDB();
  const stores = ['courses', 'tasks', 'flashcards', 'notes', 'academicRecords'];
  
  for (const store of stores) {
    try {
      const tx = database.transaction(store, 'readonly');
      const objectStore = tx.objectStore(store);
      
      if (objectStore.indexNames.contains('byUserId')) {
        const count = await objectStore.index('byUserId').count(userId);
        if (count > 0) {
          return true; // Found data for this user
        }
      }
    } catch (error) {
      console.error(`Error checking for user data in ${store}:`, error);
    }
  }
  
  return false; // No data found for this user
}

// Find all related data to a course
export async function getRelatedCourseData(courseId: string): Promise<{
  units: Unit[];
  notes: Note[];
  flashcards: Flashcard[];
  tasks: Task[];
}> {
  const units = await getUnitsByCourse(courseId);
  const notes = await getNotesByCourse(courseId);
  const flashcards = await getFlashcardsByCourse(courseId);
  const tasks = await getTasksByCourse(courseId);
  
  return { units, notes, flashcards, tasks };
}

// Delete a course and all related data
export async function deleteCourseWithRelatedData(courseId: string): Promise<void> {
  const database = await initDB();
  const { units, notes, flashcards, tasks } = await getRelatedCourseData(courseId);
  
  const tx = database.transaction(
    ['courses', 'units', 'notes', 'flashcards', 'tasks'], 
    'readwrite'
  );
  
  // Delete the course
  await tx.objectStore('courses').delete(courseId);
  
  // Delete all related units
  for (const unit of units) {
    await tx.objectStore('units').delete(unit.id);
  }
  
  // Delete all related notes
  for (const note of notes) {
    await tx.objectStore('notes').delete(note.id);
  }
  
  // Delete all related flashcards
  for (const flashcard of flashcards) {
    await tx.objectStore('flashcards').delete(flashcard.id);
  }
  
  // Delete all related tasks
  for (const task of tasks) {
    await tx.objectStore('tasks').delete(task.id);
  }
  
  await tx.done;
}

// Copy settings between users (useful for migration)
export async function copyUserSettings(fromUserId: string, toUserId: string): Promise<void> {
  const database = await initDB();
  
  // Get all stores that might contain user data
  const stores = ['courses', 'units', 'notes', 'flashcards', 'tasks', 'academicRecords', 'studySessions'];
  
  for (const storeName of stores) {
    try {
      const tx = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      
      if (store.indexNames.contains('byUserId')) {
        // Get all items for the source user
        const items = await store.index('byUserId').getAll(fromUserId);
        
        // Copy each item to the destination user
        for (const item of items) {
          const newItem = { ...item, userId: toUserId, id: `${item.id}_copy` };
          await store.add(newItem);
        }
      }
      
      await tx.done;
    } catch (error) {
      console.error(`Error copying data for ${storeName}:`, error);
    }
  }
}