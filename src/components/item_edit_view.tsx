import { useState, useEffect } from 'react';
import { PantryItem } from '../db';

export function ItemEditView({
  item,
  onCancel,
  onSave,
}: {
  item: PantryItem;
  onCancel: () => void;
  onSave: (patch: Partial<PantryItem>) => void;
}) {
  const [name, setName] = useState(item.name || '');
  const [unit, setUnit] = useState(item.unit || '');
  const [minThreshold, setMinThreshold] = useState<number | ''>(item.minThreshold ?? '');
  const [expiresAt, setExpiresAt] = useState(item.expiresAt ? item.expiresAt.slice(0, 10) : '');
  const [notes, setNotes] = useState(item.notes || '');
  const [tagsInput, setTagsInput] = useState(Array.isArray(item.tags) ? item.tags.join(', ') : '');

  useEffect(() => {
    // if item changes while editing, refresh fields
    setName(item.name || '');
    setUnit(item.unit || '');
    setMinThreshold(item.minThreshold ?? '');
    setExpiresAt(item.expiresAt ? item.expiresAt.slice(0, 10) : '');
    setNotes(item.notes || '');
    setTagsInput(Array.isArray(item.tags) ? item.tags.join(', ') : '');
  }, [item]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span style={{ fontSize: 12 }}>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', width: 120 }}>
          <span style={{ fontSize: 12 }}>Unit</span>
          <input value={unit} onChange={(e) => setUnit(e.target.value)} />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <label style={{ display: 'flex', flexDirection: 'column', width: 140 }}>
          <span style={{ fontSize: 12 }}>Needed</span>
          <input
            type="number"
            value={minThreshold as any}
            onChange={(e) =>
              setMinThreshold(e.target.value === '' ? '' : parseFloat(e.target.value))
            }
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 12 }}>Expires</span>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        </label>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 12 }}>Tags (comma separated)</span>
        <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 12 }}>Notes</span>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>

      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <button className="ghost" onClick={onCancel}>
          Cancel
        </button>
        <button
          onClick={() => {
            const patch: Partial<PantryItem> = {};
            if (name !== item.name) patch.name = name;
            if (unit !== item.unit) patch.unit = unit;
            if (minThreshold !== (item.minThreshold ?? ''))
              patch.minThreshold = minThreshold === '' ? undefined : (minThreshold as number);
            if (expiresAt !== (item.expiresAt ? item.expiresAt.slice(0, 10) : ''))
              patch.expiresAt = expiresAt ? new Date(expiresAt).toISOString() : undefined;
            if (notes !== item.notes) patch.notes = notes;
            const tags = tagsInput
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean);
            if (JSON.stringify(tags) !== JSON.stringify(item.tags || [])) patch.tags = tags;
            onSave(patch);
            onCancel();
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
