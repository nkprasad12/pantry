import { useState } from 'react';
import { PantryItem } from '../db';

export interface NewItemFormProps {
  onSubmit: (item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function NewItemForm({ onSubmit }: NewItemFormProps) {
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
