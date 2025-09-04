import { useState } from 'react';
import { NewItemForm } from './new_item_form';
import { PantryStore } from './use_pantry_db';
import { isLow } from '../utils/misc';

export interface ActionBarProps {
  pantry: PantryStore;
}

export function ActionBar({ pantry }: ActionBarProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate summary info
  const totalCount = pantry.items.length;
  const lowCount = pantry.items.filter(isLow).length;
  const expiredCount = pantry.items.filter(
    (i) => i.expiresAt && new Date(i.expiresAt) < new Date(),
  ).length;

  return (
    <>
      <div
        className="row"
        style={{ marginBottom: 12, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div>
          <button
            className="ghost"
            onClick={() => setShowAdd((v) => !v)}
            disabled={isSubmitting}
            aria-expanded={showAdd}
            aria-controls="add-item-form"
          >
            + Item
          </button>
          {/* @ts-ignore */}
          {import.meta.env.DEV && (
            <button className="ghost" style={{ marginLeft: 4 }} onClick={pantry.seedDemo}>
              Demo
            </button>
          )}
        </div>
        <span className="muted" style={{ fontSize: 15 }}>
          {totalCount} item{totalCount === 1 ? '' : 's'}
          {lowCount > 0 && (
            <>
              {' '}
              | <span className="danger">{lowCount} low</span>
            </>
          )}
          {expiredCount > 0 && (
            <>
              {' '}
              | <span className="danger">{expiredCount} expired</span>
            </>
          )}
        </span>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 12 }} id="add-item-form">
          <NewItemForm
            onSubmit={pantry.add}
            onCancel={() => setShowAdd(false)}
            onSubmittingChange={setIsSubmitting}
          />
        </div>
      )}
    </>
  );
}
