import { useState, useEffect, useCallback } from 'react';
import { PantryItem, PantryDB, nowIso, upsertItemsBulk } from '../db';

function createDemoItems(): PantryItem[] {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Rice',
      category: 'Grains',
      quantity: 2,
      unit: 'kg',
      needed: 2,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Pasta',
      category: 'Grains',
      quantity: 1,
      unit: 'box',
      needed: 3,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Tomato Sauce',
      category: 'Canned',
      quantity: 4,
      unit: 'can',
      needed: 2,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Milk',
      category: 'Dairy',
      quantity: 1,
      unit: 'L',
      needed: 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    },
  ];
}

export interface PantryStore {
  add: (item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  edit: (id: string, patch: Partial<PantryItem>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  seedDemo: () => Promise<void>;
  items: PantryItem[];
}

export function usePantryStore(): PantryStore {
  const [items, setItems] = useState<PantryItem[]>([]);

  const [db] = useState(() => new PantryDB());

  useEffect(() => {
    db.getAll().then(setItems);
  }, [db]);

  const handleAdd = useCallback(
    async (newItem: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const item: PantryItem = {
        id: crypto.randomUUID(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        ...newItem,
      };
      await db.put(item);
      setItems(await db.getAll());
    },
    [db],
  );

  const handleEdit = useCallback(
    async (id: string, patch: Partial<PantryItem>) => {
      const existing = await db.get(id);
      if (!existing) return;
      const updated: PantryItem = { ...existing, ...patch, id, updatedAt: nowIso() };
      await db.put(updated);
      setItems(await db.getAll());
    },
    [db],
  );

  const handleRemove = useCallback(
    async (id: string) => {
      await db.delete(id);
      setItems(await db.getAll());
    },
    [db],
  );

  const seedDemo = useCallback(async () => {
    await upsertItemsBulk(db, createDemoItems());
    setItems(await db.getAll());
  }, [db]);

  return {
    items,
    add: handleAdd,
    edit: handleEdit,
    remove: handleRemove,
    seedDemo,
  };
}
