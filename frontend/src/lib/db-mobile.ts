// src/lib/db-mobile.ts - SQLite implementation for iOS
import * as SQLite from 'expo-sqlite';
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

const DB_NAME = 'studySidekickDB.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDB(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync(DB_NAME);

  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      colorTheme TEXT,
      description TEXT,
      instructor TEXT,
      schedule TEXT,
      location TEXT,
      isArchived INTEGER DEFAULT 0,
      totalWeight REAL,
      currentGrade REAL,
      createdAt INTEGER,
      updatedAt INTEGER,
      userId TEXT
    );

    CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      name TEXT NOT NULL,
      orderIndex INTEGER DEFAULT 0,
      description TEXT,
      createdAt INTEGER,
      updatedAt INTEGER,
      userId TEXT,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      unitId TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      tags TEXT,
      createdAt INTEGER,
      updatedAt INTEGER,
      userId TEXT,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (unitId) REFERENCES units(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      unitId TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      tags TEXT,
      lastReviewed INTEGER,
      reviewCount INTEGER DEFAULT 0,
      confidenceLevel INTEGER DEFAULT 1,
      createdAt INTEGER,
      updatedAt INTEGER,
      userId TEXT,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (unitId) REFERENCES units(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      courseId TEXT,
      title TEXT NOT NULL,
      description TEXT,
      dueDate INTEGER NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      priority INTEGER DEFAULT 2,
      reminder INTEGER,
      weight REAL,
      grade REAL,
      createdAt INTEGER,
      updatedAt INTEGER,
      userId TEXT,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS academicRecords (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      term TEXT NOT NULL,
      credits REAL NOT NULL,
      grade TEXT,
      gradePercentage REAL,
      letterGrade TEXT,
      notes TEXT,
      createdAt INTEGER,
      updatedAt INTEGER,
      userId TEXT
    );

    CREATE TABLE IF NOT EXISTS studySessions (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      duration INTEGER NOT NULL,
      date INTEGER NOT NULL,
      notes TEXT,
      createdAt INTEGER,
      updatedAt INTEGER,
      userId TEXT,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user (
      displayName TEXT PRIMARY KEY,
      avatar TEXT,
      theme TEXT DEFAULT 'system',
      studyStreak INTEGER DEFAULT 0,
      lastStudyDate INTEGER,
      userId TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_courses_userId ON courses(userId);
    CREATE INDEX IF NOT EXISTS idx_units_courseId ON units(courseId);
    CREATE INDEX IF NOT EXISTS idx_units_userId ON units(userId);
    CREATE INDEX IF NOT EXISTS idx_notes_courseId ON notes(courseId);
    CREATE INDEX IF NOT EXISTS idx_notes_unitId ON notes(unitId);
    CREATE INDEX IF NOT EXISTS idx_notes_userId ON notes(userId);
    CREATE INDEX IF NOT EXISTS idx_flashcards_courseId ON flashcards(courseId);
    CREATE INDEX IF NOT EXISTS idx_flashcards_unitId ON flashcards(unitId);
    CREATE INDEX IF NOT EXISTS idx_flashcards_userId ON flashcards(userId);
    CREATE INDEX IF NOT EXISTS idx_tasks_courseId ON tasks(courseId);
    CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks(dueDate);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_userId ON tasks(userId);
    CREATE INDEX IF NOT EXISTS idx_academicRecords_term ON academicRecords(term);
    CREATE INDEX IF NOT EXISTS idx_academicRecords_userId ON academicRecords(userId);
    CREATE INDEX IF NOT EXISTS idx_studySessions_courseId ON studySessions(courseId);
    CREATE INDEX IF NOT EXISTS idx_studySessions_date ON studySessions(date);
    CREATE INDEX IF NOT EXISTS idx_studySessions_userId ON studySessions(userId);
  `);

  return db;
}

// Helper to convert arrays to/from JSON for SQLite
function arrayToJson(arr?: string[]): string {
  return arr ? JSON.stringify(arr) : '[]';
}

function jsonToArray(json: string): string[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

// Generic CRUD operations

export async function add<T extends Course | Unit | Note | Flashcard | Task | AcademicRecord | StudySession>(
  storeName: string,
  item: any
): Promise<string> {
  const database = await initDB();
  const now = Date.now();
  
  const itemWithTimestamps = {
    ...item,
    createdAt: item.createdAt || now,
    updatedAt: now,
    tags: typeof item.tags === 'string' ? item.tags : arrayToJson(item.tags),
  };

  await database.runAsync(
    `INSERT INTO ${storeName} (${Object.keys(itemWithTimestamps).join(', ')}) 
     VALUES (${Object.keys(itemWithTimestamps).map(() => '?').join(', ')})`,
    Object.values(itemWithTimestamps)
  );

  return item.id;
}

export async function get<T>(storeName: string, id: string): Promise<T | undefined> {
  const database = await initDB();
  const result = await database.getFirstAsync<T>(`SELECT * FROM ${storeName} WHERE id = ?`, [id]);
  
  if (result && (result as any).tags) {
    (result as any).tags = jsonToArray((result as any).tags);
  }
  
  return result;
}

export async function getAll<T>(storeName: string, userId?: string): Promise<T[]> {
  const database = await initDB();
  
  let query = `SELECT * FROM ${storeName}`;
  const params: any[] = [];
  
  if (userId && storeName !== 'user') {
    query += ` WHERE userId = ? OR userId IS NULL`;
    params.push(userId);
  }
  
  const results = await database.getAllAsync<T>(query, params);
  
  // Parse tags arrays
  return results.map(item => {
    const typedItem = item as any;
    if (typedItem.tags) {
      typedItem.tags = jsonToArray(typedItem.tags);
    }
    return typedItem;
  });
}

export async function update<T>(storeName: string, item: any): Promise<string> {
  const database = await initDB();
  const now = Date.now();
  
  const itemWithTimestamps = {
    ...item,
    updatedAt: now,
    tags: typeof item.tags === 'string' ? item.tags : arrayToJson(item.tags),
  };

  const keys = Object.keys(itemWithTimestamps);
  const setClause = keys.map(key => `${key} = ?`).join(', ');
  
  await database.runAsync(
    `UPDATE ${storeName} SET ${setClause} WHERE id = ?`,
    [...Object.values(itemWithTimestamps), item.id]
  );

  return item.id;
}

export async function remove(storeName: string, id: string): Promise<void> {
  const database = await initDB();
  await database.runAsync(`DELETE FROM ${storeName} WHERE id = ?`, [id]);
}

// Specialized queries

export async function getUnitsByCourse(courseId: string, userId?: string): Promise<Unit[]> {
  const database = await initDB();
  let query = `SELECT * FROM units WHERE courseId = ?`;
  const params: any[] = [courseId];
  
  if (userId) {
    query += ` AND (userId = ? OR userId IS NULL)`;
    params.push(userId);
  }
  
  return database.getAllAsync<Unit>(query, params);
}

export async function getNotesByCourse(courseId: string, userId?: string): Promise<Note[]> {
  const database = await initDB();
  let query = `SELECT * FROM notes WHERE courseId = ?`;
  const params: any[] = [courseId];
  
  if (userId) {
    query += ` AND (userId = ? OR userId IS NULL)`;
    params.push(userId);
  }
  
  const results = await database.getAllAsync<Note>(query, params);
  return results.map(note => ({
    ...note,
    tags: jsonToArray(note.tags as any)
  }));
}

export async function getNotesByUnit(unitId: string, userId?: string): Promise<Note[]> {
  const database = await initDB();
  let query = `SELECT * FROM notes WHERE unitId = ?`;
  const params: any[] = [unitId];
  
  if (userId) {
    query += ` AND (userId = ? OR userId IS NULL)`;
    params.push(userId);
  }
  
  const results = await database.getAllAsync<Note>(query, params);
  return results.map(note => ({
    ...note,
    tags: jsonToArray(note.tags as any)
  }));
}

export async function getFlashcardsByCourse(courseId: string, userId?: string): Promise<Flashcard[]> {
  const database = await initDB();
  let query = `SELECT * FROM flashcards WHERE courseId = ?`;
  const params: any[] = [courseId];
  
  if (userId) {
    query += ` AND (userId = ? OR userId IS NULL)`;
    params.push(userId);
  }
  
  const results = await database.getAllAsync<Flashcard>(query, params);
  return results.map(card => ({
    ...card,
    tags: jsonToArray(card.tags as any)
  }));
}

export async function getFlashcardsByUnit(unitId: string, userId?: string): Promise<Flashcard[]> {
  const database = await initDB();
  let query = `SELECT * FROM flashcards WHERE unitId = ?`;
  const params: any[] = [unitId];
  
  if (userId) {
    query += ` AND (userId = ? OR userId IS NULL)`;
    params.push(userId);
  }
  
  const results = await database.getAllAsync<Flashcard>(query, params);
  return results.map(card => ({
    ...card,
    tags: jsonToArray(card.tags as any)
  }));
}

export async function getTasksByCourse(courseId: string, userId?: string): Promise<Task[]> {
  const database = await initDB();
  let query = `SELECT * FROM tasks WHERE courseId = ?`;
  const params: any[] = [courseId];
  
  if (userId) {
    query += ` AND (userId = ? OR userId IS NULL)`;
    params.push(userId);
  }
  
  return database.getAllAsync<Task>(query, params);
}

export async function getTasksByDueDateRange(
  startDate: number,
  endDate: number,
  userId?: string
): Promise<Task[]> {
  const database = await initDB();
  let query = `SELECT * FROM tasks WHERE dueDate >= ? AND dueDate <= ?`;
  const params: any[] = [startDate, endDate];
  
  if (userId) {
    query += ` AND (userId = ? OR userId IS NULL)`;
    params.push(userId);
  }
  
  return database.getAllAsync<Task>(query, params);
}

export async function getTasksByStatus(status: string, userId?: string): Promise<Task[]> {
  const database = await initDB();
  let query = `SELECT * FROM tasks WHERE status = ?`;
  const params: any[] = [status];
  
  if (userId) {
    query += ` AND (userId = ? OR userId IS NULL)`;
    params.push(userId);
  }
  
  return database.getAllAsync<Task>(query, params);
}

export async function getAcademicRecordsByTerm(term: string, userId?: string): Promise<AcademicRecord[]> {
  const database = await initDB();
  let query = `SELECT * FROM academicRecords WHERE term = ?`;
  const params: any[] = [term];
  
  if (userId) {
    query += ` AND (userId = ? OR userId IS NULL)`;
    params.push(userId);
  }
  
  return database.getAllAsync<AcademicRecord>(query, params);
}

export async function getUserSettings(): Promise<User | undefined> {
  const database = await initDB();
  return database.getFirstAsync<User>('SELECT * FROM user LIMIT 1');
}

export async function saveUserSettings(user: User): Promise<void> {
  const database = await initDB();
  await database.runAsync(
    `INSERT OR REPLACE INTO user (displayName, avatar, theme, studyStreak, lastStudyDate, userId) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user.displayName, user.avatar, user.theme, user.studyStreak, user.lastStudyDate, user.userId]
  );
}

export async function getStudySessionsByCourse(courseId: string, userId?: string): Promise<StudySession[]> {
  const database = await initDB();
  let query = `SELECT * FROM studySessions WHERE courseId = ?`;
  const params: any[] = [courseId];
  
  if (userId) {
    query += ` AND (userId = ? OR userId IS NULL)`;
    params.push(userId);
  }
  
  return database.getAllAsync<StudySession>(query, params);
}

export async function getStudySessionsByDateRange(
  startDate: number,
  endDate: number,
  userId?: string
): Promise<StudySession[]> {
  const database = await initDB();
  let query = `SELECT * FROM studySessions WHERE date >= ? AND date <= ?`;
  const params: any[] = [startDate, endDate];
  
  if (userId) {
    query += ` AND (userId = ? OR userId IS NULL)`;
    params.push(userId);
  }
  
  return database.getAllAsync<StudySession>(query, params);
}

export async function clearAllData(userId?: string): Promise<void> {
  const database = await initDB();
  const tables = ['courses', 'units', 'notes', 'flashcards', 'tasks', 'academicRecords', 'studySessions'];
  
  for (const table of tables) {
    if (userId) {
      await database.runAsync(`DELETE FROM ${table} WHERE userId = ?`, [userId]);
    } else {
      await database.runAsync(`DELETE FROM ${table}`);
    }
  }
}

export async function exportDatabase(userId?: string): Promise<string> {
  const database = await initDB();
  const tables = ['courses', 'units', 'notes', 'flashcards', 'tasks', 'academicRecords', 'studySessions', 'user'];
  const exportData: any = {};
  
  for (const table of tables) {
    if (userId && table !== 'user') {
      exportData[table] = await database.getAllAsync(
        `SELECT * FROM ${table} WHERE userId = ?`,
        [userId]
      );
    } else {
      exportData[table] = await database.getAllAsync(`SELECT * FROM ${table}`);
    }
  }
  
  return JSON.stringify(exportData);
}

export async function importDatabase(jsonData: string, userId?: string): Promise<void> {
  const database = await initDB();
  const importData = JSON.parse(jsonData);
  
  // Clear existing data
  await clearAllData(userId);
  
  // Import data
  for (const [table, items] of Object.entries(importData)) {
    for (const item of items as any[]) {
      const itemWithUserId = userId && table !== 'user' ? { ...item, userId } : item;
      await add(table, itemWithUserId);
    }
  }
}

export async function userHasData(userId: string): Promise<boolean> {
  const database = await initDB();
  const tables = ['courses', 'tasks', 'flashcards', 'notes', 'academicRecords'];
  
  for (const table of tables) {
    const result = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${table} WHERE userId = ?`,
      [userId]
    );
    if (result && result.count > 0) {
      return true;
    }
  }
  
  return false;
}

export async function getRelatedCourseData(courseId: string): Promise<{
  units: Unit[];
  notes: Note[];
  flashcards: Flashcard[];
  tasks: Task[];
}> {
  const [units, notes, flashcards, tasks] = await Promise.all([
    getUnitsByCourse(courseId),
    getNotesByCourse(courseId),
    getFlashcardsByCourse(courseId),
    getTasksByCourse(courseId),
  ]);
  
  return { units, notes, flashcards, tasks };
}

export async function deleteCourseWithRelatedData(courseId: string): Promise<void> {
  const database = await initDB();
  
  // Delete related data first (foreign key constraints)
  await database.runAsync(`DELETE FROM units WHERE courseId = ?`, [courseId]);
  await database.runAsync(`DELETE FROM notes WHERE courseId = ?`, [courseId]);
  await database.runAsync(`DELETE FROM flashcards WHERE courseId = ?`, [courseId]);
  await database.runAsync(`DELETE FROM tasks WHERE courseId = ?`, [courseId]);
  await database.runAsync(`DELETE FROM studySessions WHERE courseId = ?`, [courseId]);
  
  // Delete the course
  await database.runAsync(`DELETE FROM courses WHERE id = ?`, [courseId]);
}

