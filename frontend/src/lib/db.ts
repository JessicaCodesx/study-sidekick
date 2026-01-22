// Web database implementation using IndexedDB
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

export async function saveUserSettings(userSettings: any): Promise<void> {
  if (!dbInstance) await initDB();
  
  // Ensure userSettings has an id
  if (!userSettings.id) {
    userSettings.id = 'user';
  }
  
  // Use update (put) which will create if doesn't exist or update if it does
  await update('user', userSettings);
}

export async function exportDatabase(): Promise<any> {
  if (!dbInstance) await initDB();
  
  const stores = ['courses', 'units', 'notes', 'flashcards', 'tasks', 'academicRecords', 'user'];
  const data: any = {};
  
  for (const storeName of stores) {
    data[storeName] = await getAll(storeName);
  }
  
  return data;
}

export async function importDatabase(jsonData: string): Promise<void> {
  if (!dbInstance) await initDB();
  
  const data = JSON.parse(jsonData);
  const stores = ['courses', 'units', 'notes', 'flashcards', 'tasks', 'academicRecords', 'user'];
  
  // Clear all stores first
  for (const storeName of stores) {
    const items = await getAll(storeName);
    for (const item of items) {
      await remove(storeName, item.id);
    }
  }
  
  // Import new data
  for (const storeName of stores) {
    if (data[storeName] && Array.isArray(data[storeName])) {
      for (const item of data[storeName]) {
        if (item && item.id) {
          await update(storeName, item);
        }
      }
    }
  }
}
