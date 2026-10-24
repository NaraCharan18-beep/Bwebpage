// Ultra-lightweight, zero-dependency IndexedDB storage for unlimited browser photo and collection persistence
// Eliminates the 5MB browser localStorage QuotaExceededError when uploading high-res saree photos

const DB_NAME = 'pochampally_handloom_db';
const DB_VERSION = 1;
const STORE_NAME = 'catalog_store';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported or running on server'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

export async function getIdb<T>(key: string): Promise<T | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return null;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve((req.result as T) ?? null);
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch (err) {
    console.warn(`IndexedDB read error for ${key}:`, err);
    return null;
  }
}

export async function setIdb<T>(key: string, value: T): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) return;

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);

      req.onsuccess = () => {
        resolve();
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  } catch (err) {
    console.warn(`IndexedDB write error for ${key}:`, err);
  }
}

export async function delIdb(key: string): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) return;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (err) {
    console.warn(`IndexedDB delete error for ${key}:`, err);
  }
}
