import { PantryItem } from '../db';

export function ItemCard({
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
