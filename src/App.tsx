import { useEffect, useMemo, useState } from 'react';
import { PantryDB, PantryItem, nowIso, upsertItemsBulk } from './db';

type Filter = {
  query: string;
  statuses: string[];
};

const defaultFilter: Filter = { query: '', statuses: [] };

export function App() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [filter, setFilter] = useState<Filter>(defaultFilter);
  const [db] = useState(() => new PantryDB());
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('theme');
      const useLight = stored === 'light' || stored === 'fun';
      return useLight ? 'light' : 'dark';
    }
    return 'dark';
  });
  // Wrap setTheme to persist
  const setTheme = (t: string) => {
    // If user selects 'fun', treat as 'light'
    const mapped = t === 'fun' ? 'light' : t;
    setThemeState(mapped);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', mapped);
    }
  };

  useEffect(() => {
    db.getAll().then(setItems);
  }, [db]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Also update meta theme-color for mobile
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      if (theme === 'light') meta.setAttribute('content', '#2a183a');
      else meta.setAttribute('content', '#0f766e');
    }
  }, [theme]);

  const filtered = useMemo(() => {
    const q = filter.query.trim().toLowerCase();
    const today = new Date();
    return items
      .filter((i) => {
        const matchesQuery =
          !q ||
          `${i.name} ${i.notes ?? ''} ${Array.isArray(i.tags) ? i.tags.join(' ') : ''}`
            .toLowerCase()
            .includes(q);
        const expired = i.expiresAt ? new Date(i.expiresAt) < today : false;
        const low = i.quantity <= (i.minThreshold ?? 0);
        const matchesStatus =
          filter.statuses.length === 0 ||
          filter.statuses.some((s) => {
            if (s === 'expired') return expired;
            if (s === 'low') return low && !expired;
            return false;
          });
        return matchesQuery && matchesStatus;
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

  const [showAdd, setShowAdd] = useState(false);
  // Calculate summary info
  const totalCount = items.length;
  const lowCount = items.filter((i) => i.quantity <= (i.minThreshold ?? 0)).length;

  return (
    <>
      <div className="container">
        <header
          className="row"
          style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}
        >
          <div className="row" style={{ alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0 }}>Your Pantry</h1>
            <img
              src="/icons/icon128.png"
              alt="Pantry logo"
              width={32}
              height={32}
              style={{ display: 'block' }}
            />
          </div>
          <div className="row" style={{ gap: 8, alignItems: 'center' }}>
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
          </div>
        </header>

        <div className="card" style={{ marginBottom: 12 }}>
          <Filters value={filter} onChange={setFilter} />
        </div>

        <div
          className="row"
          style={{ marginBottom: 12, alignItems: 'center', justifyContent: 'space-between' }}
        >
          <button
            className="ghost"
            onClick={() => setShowAdd((v) => !v)}
            aria-expanded={showAdd}
            aria-controls="add-item-form"
          >
            {showAdd ? 'Hide Add Item' : 'Add Item'}
          </button>
          {/* @ts-ignore */}
          {import.meta.env.DEV && (
            <button className="ghost" onClick={seedDemo}>
              Demo
            </button>
          )}
          <span className="muted" style={{ fontSize: 15 }}>
            {totalCount} item{totalCount === 1 ? '' : 's'}
            {lowCount > 0 && (
              <>
                {' '}
                | <span className="danger">{lowCount} low</span>
              </>
            )}
          </span>
        </div>

        {showAdd && (
          <div className="card" style={{ marginBottom: 12 }} id="add-item-form">
            <ItemForm onSubmit={handleAdd} />
          </div>
        )}

        <div className="grid">
          {filtered.map((i) => (
            <ItemCard key={i.id} item={i} onUpdate={handleEdit} onDelete={handleRemove} />
          ))}
        </div>
      </div>
      <footer style={{ margin: '32px 0 16px 0', textAlign: 'center', fontSize: 13 }}>
        <a href="https://www.flaticon.com/free-icons/pantry" title="pantry icons">
          Pantry icons created by Freepik - Flaticon
        </a>
      </footer>
    </>
  );
}

function ThemeSwitcher({ theme, setTheme }: { theme: string; setTheme: (t: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{ fontSize: 18, cursor: 'pointer', opacity: theme === 'dark' ? 1 : 0.5 }}
        title="Switch to dark theme"
        onClick={() => theme !== 'dark' && setTheme('dark')}
        aria-label="Switch to dark theme"
      >
        🌙
      </span>
      <span
        style={{ fontSize: 18, cursor: 'pointer', opacity: theme === 'light' ? 1 : 0.5 }}
        title="Switch to light theme"
        onClick={() => theme !== 'light' && setTheme('light')}
        aria-label="Switch to light theme"
      >
        🔆
      </span>
    </div>
  );
}

function Filters({ value, onChange }: { value: Filter; onChange: (f: Filter) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <input
          placeholder="Start typing an item name or tag"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          style={{ flex: 1, minWidth: 220 }}
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ display: 'flex', gap: 4 }}>
          <button
            className={`filter-button ${value.statuses.includes('low') ? 'active' : ''}`}
            onClick={() => {
              const newStatuses = value.statuses.includes('low')
                ? value.statuses.filter((s) => s !== 'low')
                : [...value.statuses, 'low'];
              onChange({ ...value, statuses: newStatuses });
            }}
          >
            Low
          </button>
          <button
            className={`filter-button ${value.statuses.includes('expired') ? 'active' : ''}`}
            onClick={() => {
              const newStatuses = value.statuses.includes('expired')
                ? value.statuses.filter((s) => s !== 'expired')
                : [...value.statuses, 'expired'];
              onChange({ ...value, statuses: newStatuses });
            }}
          >
            Expired
          </button>
        </span>
      </label>
    </div>
  );
}

function ItemForm({
  onSubmit,
}: {
  onSubmit: (item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [name, setName] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('');
  const [minThreshold, setMinThreshold] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [notes, setNotes] = useState('');

  function reset() {
    setName('');
    setTagsInput('');
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
        const tags = tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
        onSubmit({
          name,
          tags,
          quantity,
          unit,
          minThreshold,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
          notes,
        });
        reset();
      }}
    >
      <label style={{ display: 'flex', flexDirection: 'column', flex: 2, minWidth: 160 }}>
        <span style={{ fontSize: 12 }}>Item name</span>
        <input
          required
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 120 }}>
        <span style={{ fontSize: 12 }}>Tags</span>
        <input
          placeholder="e.g. grains, staple"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', width: 100 }}>
        <span style={{ fontSize: 12 }}>Qty</span>
        <input
          type="number"
          min={0}
          step="any"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value))}
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', width: 90 }}>
        <span style={{ fontSize: 12 }}>Unit</span>
        <input placeholder="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', width: 90 }}>
        <span style={{ fontSize: 12 }}>Needed</span>
        <input
          type="number"
          min={0}
          step="any"
          placeholder="Needed"
          value={minThreshold}
          onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 12 }}>Expires</span>
        <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 160 }}>
        <span style={{ fontSize: 12 }}>Notes</span>
        <input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <button type="submit" style={{ alignSelf: 'end', marginTop: 18 }}>
        Add
      </button>
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
          <div style={{ fontWeight: 700, fontSize: 20 }}>{item.name}</div>
        </div>
        <div className="row" style={{ alignItems: 'center', gap: 6 }}>
          <button
            className="ghost"
            onClick={() => onUpdate(item.id, { quantity: Math.max(0, (item.quantity || 0) - 1) })}
          >
            -
          </button>
          <div style={{ minWidth: 36, textAlign: 'center' }}>
            {item.quantity}
            {item.unit && (
              <span style={{ marginLeft: 4, fontSize: 13, color: '#888' }}>{item.unit}</span>
            )}
          </div>
          <button
            className="ghost"
            onClick={() => onUpdate(item.id, { quantity: (item.quantity || 0) + 1 })}
          >
            +
          </button>
        </div>
      </div>
      {item.notes && <div className="muted">{item.notes}</div>}
      <div
        className="row"
        style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
      >
        <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {item.expiresAt && (
            <span className={expired ? 'danger' : 'success'}>
              {expired ? 'Expired ' : 'Expires '}
              {new Date(item.expiresAt).toLocaleDateString()}
            </span>
          )}
          {low && <span className="danger">Low</span>}
          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <span style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
              {item.tags.map((tag: string) => (
                <span className="pill" key={tag}>
                  {tag}
                </span>
              ))}
            </span>
          )}
        </div>
        <div className="row">
          <button
            className="ghost"
            onClick={() => onDelete(item.id)}
            title="Remove"
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: 'block' }}
              aria-hidden="true"
            >
              <rect x="6" y="7.5" width="8" height="8" rx="1.5" />
              <path d="M8.5 10.5v3m3-3v3M5 7.5h10M9 5.5h2a1 1 0 0 1 1 1v1H8v-1a1 1 0 0 1 1-1z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
