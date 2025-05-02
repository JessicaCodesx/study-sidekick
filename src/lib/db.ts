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
const DB_VERSION = 1;

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

export async function initDB(): Promise<IDBPDatabase<DBSchema>> {
  if (db) return db;

  db = await openDB<DBSchema>(DB_NAME, DB_VERSION, {
    upgrade(database, oldVersion, newVersion, transaction) {
      // Create all stores needed for the app
      if (!database.objectStoreNames.contains('courses')) {
        database.createObjectStore('courses', { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains('units')) {
        const unitStore = database.createObjectStore('units', { keyPath: 'id' });
        unitStore.createIndex('byCourse', 'courseId', { unique: false });
      }

      if (!database.objectStoreNames.contains('notes')) {
        const noteStore = database.createObjectStore('notes', { keyPath: 'id' });
        noteStore.createIndex('byCourse', 'courseId', { unique: false });
        noteStore.createIndex('byUnit', 'unitId', { unique: false });
        noteStore.createIndex('byCourseAndUnit', ['courseId', 'unitId'], { unique: false });
      }

      if (!database.objectStoreNames.contains('flashcards')) {
        const flashcardStore = database.createObjectStore('flashcards', { keyPath: 'id' });
        flashcardStore.createIndex('byCourse', 'courseId', { unique: false });
        flashcardStore.createIndex('byUnit', 'unitId', { unique: false });
        flashcardStore.createIndex('byCourseAndUnit', ['courseId', 'unitId'], { unique: false });
      }

      if (!database.objectStoreNames.contains('tasks')) {
        const taskStore = database.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('byCourse', 'courseId', { unique: false });
        taskStore.createIndex('byDueDate', 'dueDate', { unique: false });
        taskStore.createIndex('byStatus', 'status', { unique: false });
      }

      if (!database.objectStoreNames.contains('academicRecords')) {
        const recordStore = database.createObjectStore('academicRecords', { keyPath: 'id' });
        recordStore.createIndex('byTerm', 'term', { unique: false });
      }

      if (!database.objectStoreNames.contains('user')) {
        database.createObjectStore('user', { keyPath: 'displayName' });
      }

      if (!database.objectStoreNames.contains('studySessions')) {
        const sessionStore = database.createObjectStore('studySessions', { keyPath: 'id' });
        sessionStore.createIndex('byCourse', 'courseId', { unique: false });
        sessionStore.createIndex('byDate', 'date', { unique: false });
      }
    },
  });

  return db;
}

// Generic CRUD operations

// Create
export async function add<T extends keyof DBSchema>(
  storeName: T,
  item: DBSchema[T]
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

// Read all
export async function getAll<T extends keyof DBSchema>(
  storeName: T
): Promise<DBSchema[T][]> {
  const database = await initDB();
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
export async function getUnitsByCourse(courseId: string): Promise<Unit[]> {
  const database = await initDB();
  return database.getAllFromIndex('units', 'byCourse', courseId);
}

// Get notes by course
export async function getNotesByCourse(courseId: string): Promise<Note[]> {
  const database = await initDB();
  return database.getAllFromIndex('notes', 'byCourse', courseId);
}

// Get notes by unit
export async function getNotesByUnit(unitId: string): Promise<Note[]> {
  const database = await initDB();
  return database.getAllFromIndex('notes', 'byUnit', unitId);
}

// Get flashcards by course
export async function getFlashcardsByCourse(courseId: string): Promise<Flashcard[]> {
  const database = await initDB();
  return database.getAllFromIndex('flashcards', 'byCourse', courseId);
}

// Get flashcards by unit
export async function getFlashcardsByUnit(unitId: string): Promise<Flashcard[]> {
  const database = await initDB();
  return database.getAllFromIndex('flashcards', 'byUnit', unitId);
}

// Get tasks by course
export async function getTasksByCourse(courseId: string): Promise<Task[]> {
  const database = await initDB();
  return database.getAllFromIndex('tasks', 'byCourse', courseId);
}

// Get tasks by due date (range)
export async function getTasksByDueDateRange(
  startDate: number,
  endDate: number
): Promise<Task[]> {
  const database = await initDB();
  const index = database.transaction('tasks').store.index('byDueDate');
  return index.getAll(IDBKeyRange.bound(startDate, endDate));
}

// Get tasks by status
export async function getTasksByStatus(status: string): Promise<Task[]> {
  const database = await initDB();
  return database.getAllFromIndex('tasks', 'byStatus', status);
}

// Get academic records by term
export async function getAcademicRecordsByTerm(term: string): Promise<AcademicRecord[]> {
  const database = await initDB();
  return database.getAllFromIndex('academicRecords', 'byTerm', term);
}

// Get user settings
export async function getUserSettings(): Promise<User | undefined> {
  const database = await initDB();
  const allUsers = await database.getAll('user');
  return allUsers[0];
}

// Save user settings
export async function saveUserSettings(user: User): Promise<void> {
  const database = await initDB();
  await database.put('user', user);
}

// Get study sessions by course
export async function getStudySessionsByCourse(courseId: string): Promise<StudySession[]> {
  const database = await initDB();
  return database.getAllFromIndex('studySessions', 'byCourse', courseId);
}

// Get study sessions by date range
export async function getStudySessionsByDateRange(
  startDate: number,
  endDate: number
): Promise<StudySession[]> {
  const database = await initDB();
  const index = database.transaction('studySessions').store.index('byDate');
  return index.getAll(IDBKeyRange.bound(startDate, endDate));
}

// Clear all data (for testing or reset functionality)
export async function clearAllData(): Promise<void> {
  const database = await initDB();
  const stores = database.objectStoreNames;
  const tx = database.transaction(stores, 'readwrite');
  
  const promises = Array.from(stores).map((store) => tx.objectStore(store).clear());
  await Promise.all(promises);
  await tx.done;
}

// Export database (for backup)
export async function exportDatabase(): Promise<string> {
  const database = await initDB();
  const stores = database.objectStoreNames;
  const exportData: Record<string, any[]> = {};
  
  for (const store of stores) {
    exportData[store] = await database.getAll(store as keyof DBSchema);
  }
  
  return JSON.stringify(exportData);
}

// Import database (from backup)
export async function importDatabase(jsonData: string): Promise<void> {
  const database = await initDB();
  const importData = JSON.parse(jsonData);
  const stores = Object.keys(importData);
  
  await clearAllData();
  
  for (const store of stores) {
    const tx = database.transaction(store, 'readwrite');
    const objectStore = tx.objectStore(store);
    
    for (const item of importData[store]) {
      await objectStore.add(item);
    }
    
    await tx.done;
  }
}