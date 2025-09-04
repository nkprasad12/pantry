import { useMemo, useState } from 'react';
import { useThemeSelector } from './components/use_theme_selector';
import { usePantryStore } from './components/use_pantry_db';
import { NewItemForm } from './components/new_item_form';
import { ItemCard } from './components/item_card';

type Filter = {
  query: string;
  statuses: string[];
};

const defaultFilter: Filter = { query: '', statuses: [] };

export function App() {
  const [filter, setFilter] = useState<Filter>(defaultFilter);

  const ThemeSwitcher = useThemeSelector();

  const pantry = usePantryStore();

  const filtered = useMemo(() => {
    const q = filter.query.trim().toLowerCase();
    const today = new Date();
    return pantry.items
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
  }, [pantry.items, filter]);

  const [showAdd, setShowAdd] = useState(false);
  // Calculate summary info
  const totalCount = pantry.items.length;
  const lowCount = pantry.items.filter((i) => i.quantity <= (i.minThreshold ?? 0)).length;

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
            {ThemeSwitcher}
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
            <button className="ghost" onClick={pantry.seedDemo}>
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
            <NewItemForm onSubmit={pantry.add} />
          </div>
        )}

        <div className="grid">
          {filtered.map((i) => (
            <ItemCard key={i.id} item={i} onUpdate={pantry.edit} onDelete={pantry.remove} />
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
