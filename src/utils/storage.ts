
import { DiaryEntry } from '@/types/diary';

const DB_NAME = 'SpeakDiaryDB';
const DB_VERSION = 1;
const STORE_NAME = 'diaryEntries';

let dbInstance: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open database'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

export const saveEntry = async (entry: DiaryEntry): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    // Convert dates to ISO strings for storage
    const entryToStore = {
      ...entry,
      timestamp: entry.timestamp.toISOString(),
      createdAt: entry.createdAt.toISOString()
    };
    
    const request = store.put(entryToStore);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to save entry'));
  });
};

export const getAllEntries = async (): Promise<DiaryEntry[]> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('createdAt');
    
    const request = index.openCursor(null, 'prev'); // Sort by newest first
    const entries: DiaryEntry[] = [];
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const entry = cursor.value;
        // Convert ISO strings back to Date objects
        entries.push({
          ...entry,
          timestamp: new Date(entry.timestamp),
          createdAt: new Date(entry.createdAt)
        });
        cursor.continue();
      } else {
        resolve(entries);
      }
    };
    
    request.onerror = () => reject(new Error('Failed to load entries'));
  });
};

export const deleteEntry = async (id: string): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to delete entry'));
  });
};

export const searchEntries = async (query: string): Promise<DiaryEntry[]> => {
  const allEntries = await getAllEntries();
  
  if (!query.trim()) {
    return allEntries;
  }
  
  const searchTerm = query.toLowerCase();
  return allEntries.filter(entry => 
    entry.text.toLowerCase().includes(searchTerm)
  );
};
