import { useEffect, useMemo, useState } from 'react';
import { PantryDB, PantryItem, nowIso, upsertItemsBulk } from './db';

type Filter = {
  query: string;
  category: string | 'all';
  status: 'all' | 'ok' | 'low' | 'expired';
};

const defaultFilter: Filter = { query: '', category: 'all', status: 'all' };

export function App() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const [db] = useState(() => new PantryDB());

  useEffect(() => {
    db.getAll().then(setItems);
  }, [db]);

  const categories = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => i.category && s.add(i.category));
    return ['all', ...Array.from(s).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = filter.query.trim().toLowerCase();
    const today = new Date();
    return items
      .filter((i) => {
        const matchesQuery = !q || `${i.name} ${i.notes ?? ''}`.toLowerCase().includes(q);
        const matchesCat = filter.category === 'all' || i.category === filter.category;
        const expired = i.expiresAt ? new Date(i.expiresAt) < today : false;
        const low = i.quantity <= (i.minThreshold ?? 0);
        const matchesStatus =
          filter.status === 'all'
            ? true
            : filter.status === 'expired'
              ? expired
              : filter.status === 'low'
                ? low && !expired
                : !expired && !low;
        return matchesQuery && matchesCat && matchesStatus;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, filter]);

  async function handleAdd(newItem: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>) {
    const item: PantryItem = {
      id: crypto.randomUUID(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      ...newItem,
    };
    await db.put(item);
    setItems(await db.getAll());
  }

  async function handleEdit(id: string, patch: Partial<PantryItem>) {
    const existing = await db.get(id);
    if (!existing) return;
    const updated: PantryItem = { ...existing, ...patch, id, updatedAt: nowIso() };
    await db.put(updated);
    setItems(await db.getAll());
  }

  async function handleRemove(id: string) {
    await db.delete(id);
    setItems(await db.getAll());
  }

  async function seedDemo() {
    const demo: PantryItem[] = [
      {
        id: crypto.randomUUID(),
        name: 'Rice',
        category: 'Grains',
        quantity: 2,
        unit: 'kg',
        minThreshold: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Pasta',
        category: 'Grains',
        quantity: 1,
        unit: 'box',
        minThreshold: 2,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Tomato Sauce',
        category: 'Canned',
        quantity: 4,
        unit: 'can',
        minThreshold: 2,
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
        minThreshold: 1,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      },
    ];
    await upsertItemsBulk(db, demo);
    setItems(await db.getAll());
  }

  return (
    <div className="container">
      <header
        className="row"
        style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}
      >
        <h1 style={{ margin: 0 }}>Pantry</h1>
        <div className="row">
          <button className="ghost" onClick={seedDemo}>
            Seed demo
          </button>
        </div>
      </header>

      <div className="card" style={{ marginBottom: 12 }}>
        <Filters categories={categories} value={filter} onChange={setFilter} />
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <ItemForm onSubmit={handleAdd} />
      </div>

      <div className="grid">
        {filtered.map((i) => (
          <ItemCard key={i.id} item={i} onUpdate={handleEdit} onDelete={handleRemove} />
        ))}
      </div>
    </div>
  );
}

function Filters({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: Filter;
  onChange: (f: Filter) => void;
}) {
  return (
    <div className="row">
      <input
        placeholder="Search…"
        value={value.query}
        onChange={(e) => onChange({ ...value, query: e.target.value })}
        style={{ flex: 1, minWidth: 220 }}
      />
      <select
        value={value.category}
        onChange={(e) => onChange({ ...value, category: e.target.value as any })}
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value as any })}
      >
        <option value="all">All</option>
        <option value="ok">OK</option>
        <option value="low">Low</option>
        <option value="expired">Expired</option>
      </select>
    </div>
  );
}

function ItemForm({
  onSubmit,
}: {
  onSubmit: (item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('');
  const [minThreshold, setMinThreshold] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [notes, setNotes] = useState('');

  function reset() {
    setName('');
    setCategory('');
    setQuantity(1);
    setUnit('');
    setMinThreshold(0);
    setExpiresAt('');
    setNotes('');
  }

  return (
    <form
      className="row"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          name,
          category,
          quantity,
          unit,
          minThreshold,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
          notes,
        });
        reset();
      }}
    >
      <input
        required
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ flex: 2, minWidth: 160 }}
      />
      <input
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ flex: 1, minWidth: 120 }}
      />
      <input
        type="number"
        min={0}
        step="any"
        placeholder="Qty"
        value={quantity}
        onChange={(e) => setQuantity(parseFloat(e.target.value))}
        style={{ width: 100 }}
      />
      <input
        placeholder="Unit"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        style={{ width: 90 }}
      />
      <input
        type="number"
        min={0}
        step="any"
        placeholder="Min"
        value={minThreshold}
        onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
        style={{ width: 90 }}
      />
      <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
      <input
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ flex: 1, minWidth: 160 }}
      />
      <button type="submit">Add</button>
    </form>
  );
}

function ItemCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: PantryItem;
  onUpdate: (id: string, patch: Partial<PantryItem>) => void;
  onDelete: (id: string) => void;
}) {
  const today = new Date();
  const expired = item.expiresAt ? new Date(item.expiresAt) < today : false;
  const low = item.quantity <= (item.minThreshold ?? 0);
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{item.name}</div>
          <div className="row" style={{ gap: 6 }}>
            {item.category && <span className="pill">{item.category}</span>}
            {item.unit && <span className="pill">{item.unit}</span>}
          </div>
        </div>
        <div className="row" style={{ alignItems: 'center', gap: 6 }}>
          <button
            className="ghost"
            onClick={() => onUpdate(item.id, { quantity: Math.max(0, (item.quantity || 0) - 1) })}
          >
            -
          </button>
          <div style={{ minWidth: 36, textAlign: 'center' }}>{item.quantity}</div>
          <button
            className="ghost"
            onClick={() => onUpdate(item.id, { quantity: (item.quantity || 0) + 1 })}
          >
            +
          </button>
        </div>
      </div>
      {item.notes && <div className="muted">{item.notes}</div>}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="muted">
          {item.expiresAt && (
            <span className={expired ? 'danger' : 'success'}>
              {expired ? 'Expired ' : 'Expires '}
              {new Date(item.expiresAt).toLocaleDateString()}
            </span>
          )}
          {low && (
            <span style={{ marginLeft: 8 }} className="danger">
              Low
            </span>
          )}
        </div>
        <div className="row">
          <button className="ghost" onClick={() => onDelete(item.id)}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
