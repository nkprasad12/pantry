import { useState, useMemo } from 'react';
import { PantryItem } from '../db';
import { isLow } from '../utils/misc';

type Filter = {
  query: string;
  statuses: string[];
};

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

const defaultFilter: Filter = { query: '', statuses: [] };

export interface UseItemFilterValue {
  items: PantryItem[];
  Widget: JSX.Element;
}

export function useItemFilter(items: PantryItem[]): UseItemFilterValue {
  const [filter, setFilter] = useState<Filter>(defaultFilter);

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
        const matchesStatus =
          filter.statuses.length === 0 ||
          filter.statuses.some((s) => {
            if (s === 'expired') return expired;
            if (s === 'low') return isLow(i) && !expired;
            return false;
          });
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, filter]);

  const Widget = <Filters value={filter} onChange={setFilter} />;

  return { items: filtered, Widget };
}
