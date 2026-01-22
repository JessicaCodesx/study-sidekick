// Platform-specific database exports
import { isMobile } from './platform';

// Web implementation using IndexedDB
// For web builds, isMobile is always false, so we implement IndexedDB here
const DB_NAME = 'studySidekickDB';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export async function initDB(): Promise<void> {
  if (dbInstance) return;
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve();
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores
      const stores = ['courses', 'units', 'notes', 'flashcards', 'tasks', 'academicRecords', 'user'];
      stores.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };
  });
}

export async function add<T>(storeName: string, item: T & { id: string }): Promise<string> {
  if (!dbInstance) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance!.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);
    request.onsuccess = () => resolve(item.id);
    request.onerror = () => reject(request.error);
  });
}

export async function get<T>(storeName: string, id: string): Promise<T | undefined> {
  if (!dbInstance) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance!.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAll<T>(storeName: string): Promise<T[]> {
  if (!dbInstance) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance!.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function update<T>(storeName: string, item: T & { id: string }): Promise<string> {
  if (!dbInstance) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance!.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    request.onsuccess = () => resolve(item.id);
    request.onerror = () => reject(request.error);
  });
}

export async function remove(storeName: string, id: string): Promise<void> {
  if (!dbInstance) await initDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance!.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getUserSettings(): Promise<any> {
  const users = await getAll('user');
  return users.length > 0 ? users[0] : null;
}
