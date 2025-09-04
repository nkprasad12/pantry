import { useState } from 'react';
import { PantryItem } from '../db';
import { isLow } from '../utils/misc';
import { ItemEditView } from './item_edit_view';
import { Modal } from './modal';
import { DeleteIcon, EditIcon } from './icons';

export function ItemCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: PantryItem;
  onUpdate: (id: string, patch: Partial<PantryItem>) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  const today = new Date();
  const expired = item.expiresAt ? new Date(item.expiresAt) < today : false;
  const low = isLow(item);

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
            {item.needed && <span style={{ marginLeft: 4, color: '#888' }}>/ {item.needed}</span>}
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
              {new Date(item.expiresAt).toISOString().slice(0, 10)}
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
        <div className="row" style={{ alignItems: 'center', gap: 8 }}>
          <button className="ghost iconButton" onClick={() => setEditing(true)} title="Edit">
            <EditIcon />
          </button>
          <button className="ghost iconButton" onClick={() => onDelete(item.id)} title="Remove">
            <DeleteIcon />
          </button>
        </div>
      </div>
      {editing && (
        <Modal onClose={() => setEditing(false)}>
          <ItemEditView
            item={item}
            onCancel={() => setEditing(false)}
            onSave={(patch) => {
              if (Object.keys(patch).length > 0) onUpdate(item.id, patch);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
