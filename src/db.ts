import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type PantryItem = {
  id: string;
  name: string;
  tags?: string[];
  category?: string; // deprecated
  quantity: number;
  unit?: string;
  needed?: number;
  minThreshold?: number; // deprecated
  expiresAt?: string; // ISO
  notes?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

interface PantrySchema extends DBSchema {
  items: {
    key: string;
    value: PantryItem;
    indexes: { 'by-name': string; 'by-category': string };
  };
}

export function nowIso() {
  return new Date().toISOString();
}

export class PantryDB {
  private dbPromise: Promise<IDBPDatabase<PantrySchema>>;
  constructor(name = 'pantry-db', version = 1) {
    this.dbPromise = openDB<PantrySchema>(name, version, {
      upgrade(db) {
        const store = db.createObjectStore('items', { keyPath: 'id' });
        store.createIndex('by-name', 'name', { unique: false });
        store.createIndex('by-category', 'category', { unique: false });
      },
    });
  }

  async put(item: PantryItem) {
    const db = await this.dbPromise;
    await db.put('items', item);
  }

  async get(id: string) {
    const db = await this.dbPromise;
    return db.get('items', id);
  }

  async getAll() {
    const db = await this.dbPromise;
    return db.getAll('items');
  }

  async delete(id: string) {
    const db = await this.dbPromise;
    await db.delete('items', id);
  }
}

export async function upsertItemsBulk(db: PantryDB, items: PantryItem[]) {
  const database = (await (db as any).dbPromise) as IDBPDatabase<PantrySchema>;
  const tx = database.transaction('items', 'readwrite');
  for (const item of items) tx.store.put(item);
  await tx.done;
}
