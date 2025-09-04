import { useState } from 'react';
import { PantryItem } from '../db';
import { NewItemForm } from './new_item_form';
import { PantryStore } from './use_pantry_db';

export interface ActionBarProps {
  items: PantryItem[];
  pantry: PantryStore;
}

export function ActionBar({ items, pantry }: ActionBarProps) {
  const [showAdd, setShowAdd] = useState(false);
  // Calculate summary info
  const totalCount = items.length;
  const lowCount = items.filter((i) => i.quantity <= (i.minThreshold ?? 0)).length;

  return (
    <>
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
    </>
  );
}
